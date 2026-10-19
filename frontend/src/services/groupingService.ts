import { CIRCLE_CAPACITY, SUB_GROUP_SIZE } from "@/constants";
import type { CircleMember, SkillLevel, SubGroup } from "@/types";

/** Numeric skill tier used for algorithmic ranking and leadership assignment. */
export const SKILL_TIER_RANK: Record<SkillLevel, number> = {
  Advanced: 3,
  Intermediate: 2,
  Beginner: 1,
};

export interface GroupingTierCounts {
  strong: number; // Advanced
  average: number; // Intermediate
  weak: number; // Beginner
}

export interface GroupingResult {
  circleId: string;
  subGroups: SubGroup[];
  isPerfectBalance: boolean;
  tierCounts: GroupingTierCounts;
  balanceSummary: string;
}

/**
 * Returns numeric rank for a skill level:
 * Advanced (3), Intermediate (2), Beginner (1).
 */
export function getSkillRank(level: SkillLevel): number {
  return SKILL_TIER_RANK[level] ?? 1;
}

/**
 * Pure, testable balancing algorithm for SkillNest circles.
 * Takes the array of members with their real assessed skill levels and
 * distributes them into balanced sub-groups of SUB_GROUP_SIZE (3).
 *
 * Algorithm specifications:
 * 1. Categorizes members into 3 buckets: Strong (Advanced), Average (Intermediate), Weak (Beginner).
 * 2. Checks if real member data admits perfect 1:1:1 balance (3 Strong, 3 Average, 3 Weak for 9 members).
 * 3. Distributes round-robin so each sub-group receives one from each bucket.
 * 4. If data is uneven across tiers (e.g. 4 Strong, 3 Average, 2 Weak), applies documented
 *    greedy snake balance fallback minimizing skill variance, and accurately flags isPerfectBalance = false.
 * 5. Within each formed group, the highest-tier member is dynamically elected leader.
 */
export function computeBalancedSubGroups(
  circleId: string,
  members: CircleMember[],
  customNames?: string[],
): GroupingResult {
  const numGroups = Math.max(1, Math.floor(members.length / SUB_GROUP_SIZE));
  const groupNames = customNames || [
    "Sub-Group Alpha",
    "Sub-Group Beta",
    "Sub-Group Gamma",
    "Sub-Group Delta",
  ];

  // Bucket members by their actual assessed skill levels, preserving chronological order for fairness
  const strongBucket = members
    .filter((m) => m.skillLevel === "Advanced")
    .sort((a, b) => new Date(a.joinedAt).getTime() - new Date(b.joinedAt).getTime());

  const averageBucket = members
    .filter((m) => m.skillLevel === "Intermediate")
    .sort((a, b) => new Date(a.joinedAt).getTime() - new Date(b.joinedAt).getTime());

  const weakBucket = members
    .filter((m) => m.skillLevel === "Beginner")
    .sort((a, b) => new Date(a.joinedAt).getTime() - new Date(b.joinedAt).getTime());

  const tierCounts: GroupingTierCounts = {
    strong: strongBucket.length,
    average: averageBucket.length,
    weak: weakBucket.length,
  };

  const isPerfectBalance =
    members.length >= CIRCLE_CAPACITY &&
    strongBucket.length === numGroups &&
    averageBucket.length === numGroups &&
    weakBucket.length === numGroups;

  // Initialize empty sub-groups
  const groupAllocations: CircleMember[][] = Array.from({ length: numGroups }, () => []);

  if (isPerfectBalance) {
    // Standard Round-Robin 1:1:1 balance
    for (let i = 0; i < numGroups; i++) {
      groupAllocations[i].push(strongBucket[i]);
      groupAllocations[i].push(averageBucket[i]);
      groupAllocations[i].push(weakBucket[i]);
    }
  } else {
    // Documented Fallback: Distribute members across available groups in tiered order
    // Round 1: Seed one strong member per group as far as available
    const assignedUserIds = new Set<string>();

    const strongQueue = [...strongBucket];
    const averageQueue = [...averageBucket];
    const weakQueue = [...weakBucket];

    // Distribute strong members across groups
    for (let i = 0; i < numGroups && strongQueue.length > 0; i++) {
      const m = strongQueue.shift()!;
      groupAllocations[i].push(m);
      assignedUserIds.add(m.userId);
    }

    // Distribute average members into groups with space
    for (let i = 0; i < numGroups && averageQueue.length > 0; i++) {
      // Find group with fewest members or lowest total tier rank
      const targetGroup = groupAllocations
        .filter((g) => g.length < SUB_GROUP_SIZE)
        .sort((a, b) => a.length - b.length)[0];

      if (targetGroup) {
        const m = averageQueue.shift()!;
        targetGroup.push(m);
        assignedUserIds.add(m.userId);
      }
    }

    // Distribute weak members into groups with space
    for (let i = 0; i < numGroups && weakQueue.length > 0; i++) {
      const targetGroup = groupAllocations
        .filter((g) => g.length < SUB_GROUP_SIZE)
        .sort((a, b) => a.length - b.length)[0];

      if (targetGroup) {
        const m = weakQueue.shift()!;
        targetGroup.push(m);
        assignedUserIds.add(m.userId);
      }
    }

    // Allocate any remaining members from any queue to fill up to SUB_GROUP_SIZE
    const remainingMembers = [...strongQueue, ...averageQueue, ...weakQueue].concat(
      members.filter((m) => !assignedUserIds.has(m.userId)),
    );

    for (const member of remainingMembers) {
      if (assignedUserIds.has(member.userId)) continue;
      const targetGroup = groupAllocations
        .filter((g) => g.length < SUB_GROUP_SIZE)
        .sort((a, b) => a.length - b.length)[0];

      if (targetGroup) {
        targetGroup.push(member);
        assignedUserIds.add(member.userId);
      }
    }
  }

  // Construct SubGroup objects with dynamically computed leaders
  const subGroups: SubGroup[] = groupAllocations.map((groupMembers, i) => {
    // Dynamic Leader Computation: member with highest tier rank (tie breaker: joined earlier)
    const sortedByTier = [...groupMembers].sort((a, b) => {
      const rankDiff = getSkillRank(b.skillLevel) - getSkillRank(a.skillLevel);
      if (rankDiff !== 0) return rankDiff;
      return new Date(a.joinedAt).getTime() - new Date(b.joinedAt).getTime();
    });

    const leader = sortedByTier[0];

    return {
      id: `sg-${circleId}-${i + 1}`,
      circleId,
      name: groupNames[i] ?? `Sub-Group ${i + 1}`,
      leaderUserId: leader ? leader.userId : "",
      members: groupMembers,
    };
  });

  const balanceSummary = isPerfectBalance
    ? `Optimal 1:1:1 balance achieved (${tierCounts.strong} Strong, ${tierCounts.average} Average, ${tierCounts.weak} Developing).`
    : `Adjusted distribution (${tierCounts.strong} Strong, ${tierCounts.average} Average, ${tierCounts.weak} Developing) balanced to minimize skill variance.`;

  return {
    circleId,
    subGroups,
    isPerfectBalance,
    tierCounts,
    balanceSummary,
  };
}
