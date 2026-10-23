import { CIRCLE_CAPACITY, SUB_GROUP_SIZE } from "@/constants";
import type { Circle, CircleMember, SkillLevel, SubGroup } from "@/types";

/* -------------------------------------------------------------------------- */
/*  Circle capacity rules                                                      */
/* -------------------------------------------------------------------------- */

export const MIN_CIRCLE_CAPACITY = 9;
export const MAX_CIRCLE_CAPACITY = 30;

/** 9 <= N <= 30 and N % 3 === 0  ->  N/3 groups of exactly 3, nobody left over. */
export function isValidCircleCapacity(capacity: number): boolean {
  return (
    Number.isInteger(capacity) &&
    capacity >= MIN_CIRCLE_CAPACITY &&
    capacity <= MAX_CIRCLE_CAPACITY &&
    capacity % SUB_GROUP_SIZE === 0
  );
}

/** Max members for a circle (creator's choice, or the default). */
export function getCircleCapacity(circle: Pick<Circle, "capacity">): number {
  return circle.capacity ?? CIRCLE_CAPACITY;
}

/* -------------------------------------------------------------------------- */
/*  Skill helpers                                                              */
/* -------------------------------------------------------------------------- */

/** Numeric skill tier used for algorithmic ranking and leadership assignment. */
export const SKILL_TIER_RANK: Record<SkillLevel, number> = {
  Advanced: 3,
  Intermediate: 2,
  Beginner: 1,
};

/** Used only for members that have a level but no stored assessment percentage (mock data). */
const DEFAULT_PERCENT: Record<SkillLevel, number> = {
  Advanced: 85,
  Intermediate: 55,
  Beginner: 25,
};

export interface GroupingTierCounts {
  strong: number; // Advanced
  average: number; // Intermediate
  weak: number; // Beginner
}

export interface GroupingResult {
  circleId: string;
  subGroups: SubGroup[];
  /** True only when EVERY group has one Advanced + one Intermediate + one Beginner. */
  isPerfectBalance: boolean;
  balanceLabel: "Perfect Balance" | "Best Possible Balance";
  tierCounts: GroupingTierCounts;
  /** Sum of member assessment percentages per group (same order as subGroups). */
  groupScores: number[];
  /** max(groupScores) - min(groupScores): the measurable "balance" number. */
  scoreSpread: number;
  balanceSummary: string;
}

export class GroupingError extends Error {}

export function getSkillRank(level: SkillLevel): number {
  return SKILL_TIER_RANK[level] ?? 1;
}

export function getMemberPercent(member: CircleMember): number {
  return member.scorePercent ?? DEFAULT_PERCENT[member.skillLevel];
}

const timeOf = (member: CircleMember) =>
  new Date(member.assessedAt ?? member.joinedAt).getTime() || 0;

/**
 * Deterministic ordering, best first:
 * skill tier DESC -> assessment % DESC -> earlier assessment -> lower user id.
 * (No randomness anywhere, so the same input always gives the same groups.)
 */
export function compareMembersBySkill(a: CircleMember, b: CircleMember): number {
  return (
    getSkillRank(b.skillLevel) - getSkillRank(a.skillLevel) ||
    getMemberPercent(b) - getMemberPercent(a) ||
    timeOf(a) - timeOf(b) ||
    a.userId.localeCompare(b.userId, undefined, { numeric: true })
  );
}

/** Leader of a group (also used for succession when the leader leaves). */
export function electLeader(members: CircleMember[]): CircleMember | undefined {
  return [...members].sort(compareMembersBySkill)[0];
}

/* -------------------------------------------------------------------------- */
/*  The balancing objective                                                    */
/* -------------------------------------------------------------------------- */

/**
 * Weight of one "same-tier pair inside a group" expressed in score points.
 * Tier diversity is preferred, but never forced when the member mix makes it impossible.
 */
const DIVERSITY_WEIGHT = 10;

const sumPercent = (group: CircleMember[]) =>
  group.reduce((total, member) => total + getMemberPercent(member), 0);

function sameTierPairs(group: CircleMember[]): number {
  let pairs = 0;
  for (let i = 0; i < group.length; i++) {
    for (let j = i + 1; j < group.length; j++) {
      if (group[i]!.skillLevel === group[j]!.skillLevel) pairs++;
    }
  }
  return pairs;
}

/**
 * Cost of a formation (lower is better):
 *   (max group score - min group score)  +  DIVERSITY_WEIGHT x (same-tier pairs)
 */
function formationCost(groups: CircleMember[][]): number {
  const sums = groups.map(sumPercent);
  const spread = Math.max(...sums) - Math.min(...sums);
  const pairs = groups.reduce((total, group) => total + sameTierPairs(group), 0);
  return spread + DIVERSITY_WEIGHT * pairs;
}

/* -------------------------------------------------------------------------- */
/*  Three deterministic starting formations                                     */
/* -------------------------------------------------------------------------- */

/** Greedy: strongest K members seed the K groups, everyone else goes to the lowest-score open group. */
function greedyStart(sorted: CircleMember[], k: number): CircleMember[][] {
  const groups: CircleMember[][] = Array.from({ length: k }, () => []);
  sorted.forEach((member, index) => {
    if (index < k) {
      groups[index]!.push(member);
      return;
    }
    const open = groups
      .map((group, i) => ({ group, i }))
      .filter(({ group }) => group.length < SUB_GROUP_SIZE);
    open.sort(
      (x, y) =>
        sumPercent(x.group) - sumPercent(y.group) ||
        sameTierPairsWith(x.group, member) - sameTierPairsWith(y.group, member) ||
        x.i - y.i,
    );
    open[0]!.group.push(member);
  });
  return groups;
}

const sameTierPairsWith = (group: CircleMember[], member: CircleMember) =>
  group.filter((other) => other.skillLevel === member.skillLevel).length;

/** Snake: 0..K-1, then K-1..0, ... keeps group totals close. */
function snakeStart(sorted: CircleMember[], k: number): CircleMember[][] {
  const groups: CircleMember[][] = Array.from({ length: k }, () => []);
  sorted.forEach((member, index) => {
    const round = Math.floor(index / k);
    const pos = index % k;
    groups[round % 2 === 0 ? pos : k - 1 - pos]!.push(member);
  });
  return groups;
}

/** Deal: 0..K-1, 0..K-1, ... (gives one-of-each-tier when the tier counts are equal). */
function dealStart(sorted: CircleMember[], k: number): CircleMember[][] {
  const groups: CircleMember[][] = Array.from({ length: k }, () => []);
  sorted.forEach((member, index) => groups[index % k]!.push(member));
  return groups;
}

/** Hill-climb: keep swapping two members between groups while it lowers the cost. Always terminates. */
function improveBySwaps(groups: CircleMember[][]): CircleMember[][] {
  let best = formationCost(groups);
  let improved = true;
  let guard = 0;
  while (improved && guard++ < 500) {
    improved = false;
    for (let a = 0; a < groups.length; a++) {
      for (let b = a + 1; b < groups.length; b++) {
        for (let i = 0; i < SUB_GROUP_SIZE; i++) {
          for (let j = 0; j < SUB_GROUP_SIZE; j++) {
            const first = groups[a]![i]!;
            const second = groups[b]![j]!;
            groups[a]![i] = second;
            groups[b]![j] = first;
            const cost = formationCost(groups);
            if (cost < best - 1e-9) {
              best = cost;
              improved = true;
            } else {
              groups[a]![i] = first; // undo
              groups[b]![j] = second;
            }
          }
        }
      }
    }
  }
  return groups;
}

/* -------------------------------------------------------------------------- */
/*  Validation (nothing is saved unless this passes)                           */
/* -------------------------------------------------------------------------- */

export function validateFormation(members: CircleMember[], groups: CircleMember[][]): void {
  if (members.length < SUB_GROUP_SIZE || members.length % SUB_GROUP_SIZE !== 0) {
    throw new GroupingError(
      `Cannot form groups: ${members.length} members is not a multiple of ${SUB_GROUP_SIZE}.`,
    );
  }
  const inputIds = new Set(members.map((m) => m.userId));
  if (inputIds.size !== members.length) {
    throw new GroupingError("Cannot form groups: duplicate member in circle.");
  }
  if (groups.length !== members.length / SUB_GROUP_SIZE) {
    throw new GroupingError("Cannot form groups: wrong number of groups.");
  }
  const assigned: string[] = [];
  for (const group of groups) {
    if (group.length !== SUB_GROUP_SIZE) {
      throw new GroupingError(`Cannot form groups: every group must have exactly ${SUB_GROUP_SIZE} members.`);
    }
    group.forEach((m) => assigned.push(m.userId));
  }
  if (assigned.length !== members.length || new Set(assigned).size !== members.length) {
    throw new GroupingError("Cannot form groups: a member is missing or assigned twice.");
  }
  if (!assigned.every((id) => inputIds.has(id))) {
    throw new GroupingError("Cannot form groups: unknown member assigned.");
  }
}

/* -------------------------------------------------------------------------- */
/*  Public API                                                                 */
/* -------------------------------------------------------------------------- */

const DEFAULT_GROUP_NAMES = [
  "Sub-Group Alpha",
  "Sub-Group Beta",
  "Sub-Group Gamma",
  "Sub-Group Delta",
  "Sub-Group Epsilon",
  "Sub-Group Zeta",
  "Sub-Group Eta",
  "Sub-Group Theta",
  "Sub-Group Iota",
  "Sub-Group Kappa",
];

/**
 * SkillNest group formation: N members -> exactly N/3 groups of exactly 3.
 *
 * 1. Sort members: tier DESC, assessment % DESC, earlier assessment, lower id (deterministic).
 * 2. Build three starting formations (greedy lowest-score, snake, deal).
 * 3. Improve each by pairwise swaps that reduce
 *        cost = (max group score - min group score) + 10 x (same-tier pairs).
 * 4. Keep the lowest-cost formation. It is labelled "Perfect Balance" only if every
 *    group really has Advanced + Intermediate + Beginner, otherwise "Best Possible Balance".
 * 5. Validate (everyone exactly once, all groups of 3) - throws GroupingError otherwise,
 *    so nothing half-formed is ever saved.
 * 6. Elect each group's leader: tier -> assessment % -> earlier assessment -> lower id.
 *
 * Pure and deterministic. The Spring Boot GroupingService should implement the same steps.
 */
export function computeBalancedSubGroups(
  circleId: string,
  members: CircleMember[],
  customNames?: string[],
): GroupingResult {
  if (members.length < SUB_GROUP_SIZE || members.length % SUB_GROUP_SIZE !== 0) {
    throw new GroupingError(
      `Cannot form groups: ${members.length} members is not a multiple of ${SUB_GROUP_SIZE}.`,
    );
  }
  const k = members.length / SUB_GROUP_SIZE;
  const sorted = [...members].sort(compareMembersBySkill);

  const candidates = [greedyStart, snakeStart, dealStart].map((start) =>
    improveBySwaps(start(sorted, k)),
  );
  const best = candidates.reduce((winner, current) =>
    formationCost(current) < formationCost(winner) - 1e-9 ? current : winner,
  );

  validateFormation(members, best);

  const names = customNames ?? DEFAULT_GROUP_NAMES;
  const groupScores = best.map(sumPercent);
  const scoreSpread = Math.round((Math.max(...groupScores) - Math.min(...groupScores)) * 100) / 100;

  const subGroups: SubGroup[] = best.map((group, i) => ({
    id: `sg-${circleId}-${i + 1}`,
    circleId,
    name: names[i] ?? `Sub-Group ${i + 1}`,
    leaderUserId: electLeader(group)?.userId ?? "",
    members: [...group].sort(compareMembersBySkill),
    status: "Active",
  }));

  const tierCounts: GroupingTierCounts = {
    strong: members.filter((m) => m.skillLevel === "Advanced").length,
    average: members.filter((m) => m.skillLevel === "Intermediate").length,
    weak: members.filter((m) => m.skillLevel === "Beginner").length,
  };

  const isPerfectBalance = best.every(
    (group) => new Set(group.map((m) => m.skillLevel)).size === SUB_GROUP_SIZE,
  );

  const mix = `${tierCounts.strong} Strong, ${tierCounts.average} Average, ${tierCounts.weak} Developing`;
  const balanceSummary = isPerfectBalance
    ? `Perfect balance: every group has one Strong, one Average and one Developing learner (${mix}). Score spread between groups: ${scoreSpread} pts.`
    : `Best possible balance for this mix (${mix}). Groups are balanced on assessment scores and skill diversity (score spread ${scoreSpread} pts); one of each level per group isn't possible with these numbers.`;

  return {
    circleId,
    subGroups,
    isPerfectBalance,
    balanceLabel: isPerfectBalance ? "Perfect Balance" : "Best Possible Balance",
    tierCounts,
    groupScores,
    scoreSpread,
    balanceSummary,
  };
}
