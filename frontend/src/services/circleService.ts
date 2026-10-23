import { simulateRequest } from "./apiClient";
import type { AssessmentResult } from "./assessmentService";
import {
  electLeader,
  getCircleCapacity,
  isValidCircleCapacity,
  MAX_CIRCLE_CAPACITY,
  MIN_CIRCLE_CAPACITY,
} from "./groupingService";
import { CIRCLES, CURRENT_USER, SUB_GROUPS } from "./mockData";
import { formCircleOnce } from "./subGroupService";
import { SUB_GROUP_SIZE } from "@/constants";
import type {
  Circle,
  CircleMember,
  CirclePreferences,
  JoinPreferences,
  SkillLevel,
} from "@/types";

export { getCircleCapacity };

/** Allowed circle sizes: 9, 12, 15 ... 30 (multiples of 3 -> nobody is ever left over). */
export const CIRCLE_SIZE_OPTIONS = Array.from(
  { length: (MAX_CIRCLE_CAPACITY - MIN_CIRCLE_CAPACITY) / SUB_GROUP_SIZE + 1 },
  (_, i) => MIN_CIRCLE_CAPACITY + i * SUB_GROUP_SIZE,
);

export function getCircles(): Promise<Circle[]> {
  return simulateRequest(CIRCLES);
}

export function getCircleById(circleId: string): Promise<Circle | undefined> {
  return simulateRequest(CIRCLES.find((circle) => circle.id === circleId));
}

/** Circles the current user is a member of (for the profile dashboard). */
export function getMyCircles(): Promise<Circle[]> {
  return simulateRequest(
    CIRCLES.filter((circle) => circle.members.some((m) => m.userId === CURRENT_USER.id)),
  );
}

/* -------------------------------------------------------------------------- */
/*  Circle state helpers                                                       */
/* -------------------------------------------------------------------------- */

export function isCircleFull(circle: Circle): boolean {
  return circle.members.length >= getCircleCapacity(circle);
}

/** An OPEN circle whose deadline passed without reaching capacity expires (no partial groups). */
export function isCircleExpired(circle: Circle): boolean {
  return circle.status === "Open" && circle.deadline.slice(0, 10) < new Date().toISOString().slice(0, 10);
}

/** A formed group that lost a member and is waiting for a replacement. */
function groupNeedingMember(circleId: string) {
  return SUB_GROUPS.find((g) => g.circleId === circleId && g.status === "Needs Rebalancing");
}

/** Can a new member join right now? (open + not full + not expired, or a replacement slot.) */
export function isCircleJoinable(circle: Circle): boolean {
  if (isCircleFull(circle) || isCircleExpired(circle)) return false;
  return circle.status === "Open" || !!groupNeedingMember(circle.id);
}

/* -------------------------------------------------------------------------- */
/*  One assessment attempt per user per circle                                 */
/* -------------------------------------------------------------------------- */

export interface StoredAssessment {
  skillLevel: SkillLevel;
  score: number;
  maxScore: number;
  percentage: number;
  assessedAt: string;
}

const ASSESSMENT_ATTEMPTS = new Map<string, StoredAssessment>();
const attemptKey = (circleId: string) => `${CURRENT_USER.id}:${circleId}`;

/** The user's stored result for this circle (skill is per circle, not global). */
export function getMyAssessmentForCircle(circleId: string): Promise<StoredAssessment | undefined> {
  return simulateRequest(ASSESSMENT_ATTEMPTS.get(attemptKey(circleId)));
}

/* -------------------------------------------------------------------------- */
/*  Stage 1 matching                                                           */
/* -------------------------------------------------------------------------- */

export const RECOMMENDATION_SHORTLIST_SIZE = 5;

/** topic x3 + goal x2 + commitment x1 + deadline within 2 weeks of the preferred one x1. */
export function getMatchScore(circle: Circle, preferences: JoinPreferences): number {
  const dayGap = preferences.deadline
    ? Math.abs(new Date(circle.deadline).getTime() - new Date(preferences.deadline).getTime()) /
      86_400_000
    : Number.POSITIVE_INFINITY;
  return (
    Number(circle.topic === preferences.topic) * 3 +
    Number(circle.goalType === preferences.goalType) * 2 +
    Number(circle.commitment === preferences.commitment) +
    Number(dayGap <= 14)
  );
}

/**
 * Ranks circles: joinable ones first (best match first, fuller circles win ties),
 * then Full / Grouped / Expired circles last for reference. The UI shows the top
 * RECOMMENDATION_SHORTLIST_SIZE joinable matches with a score above zero as the shortlist.
 */
export function getRecommendedCircles(preferences: JoinPreferences): Promise<Circle[]> {
  const fill = (c: Circle) => c.members.length / getCircleCapacity(c);
  const ranked = [...CIRCLES].sort(
    (a, b) =>
      Number(isCircleJoinable(b)) - Number(isCircleJoinable(a)) ||
      getMatchScore(b, preferences) - getMatchScore(a, preferences) ||
      fill(b) - fill(a) ||
      a.id.localeCompare(b.id),
  );
  return simulateRequest(ranked);
}

/* -------------------------------------------------------------------------- */
/*  Create / join / leave                                                      */
/* -------------------------------------------------------------------------- */

export interface NewCircleInput extends CirclePreferences {
  description: string;
  capacity: number;
}

export async function createCircle(input: NewCircleInput): Promise<Circle> {
  const { description, capacity, ...preferences } = input;
  if (!isValidCircleCapacity(capacity)) {
    throw new Error(
      `Circle size must be ${MIN_CIRCLE_CAPACITY}-${MAX_CIRCLE_CAPACITY} and a multiple of ${SUB_GROUP_SIZE}.`,
    );
  }
  const created: Circle = {
    id: `c-${Date.now()}`,
    name: `${preferences.topic} Circle`,
    ...preferences,
    description: description.trim(),
    capacity,
    // The creator is simply the first member — never automatically a leader.
    members: [
      {
        userId: CURRENT_USER.id,
        name: CURRENT_USER.name,
        skillLevel: CURRENT_USER.skillBaseline,
        joinedAt: new Date().toISOString(),
      },
    ],
    status: "Open",
  };
  CIRCLES.unshift(created);
  return simulateRequest(created);
}

/**
 * Joins the current user to a circle. Rules (the backend must enforce the same in one transaction):
 *  - restricted users can't join; expired or full circles reject;
 *  - joining twice is idempotent (never adds a duplicate member);
 *  - the FIRST assessment attempt for a circle is the one that counts (no retakes);
 *  - the member who fills the last slot triggers group formation, exactly once;
 *  - a replacement joining a formed circle goes into the group that lost a member.
 */
export async function joinCircle(
  circleId: string,
  skillLevel: SkillLevel = CURRENT_USER.skillBaseline,
  assessment?: AssessmentResult,
): Promise<Circle> {
  const circle = CIRCLES.find((c) => c.id === circleId);
  if (!circle) throw new Error(`Circle ${circleId} not found`);

  const snapshot = () => ({ ...circle, members: [...circle.members] });
  if (circle.members.some((m) => m.userId === CURRENT_USER.id)) return simulateRequest(snapshot());

  if (CURRENT_USER.isRestrictedFromJoining) {
    throw new Error("You're restricted from joining new circles until you complete your tasks.");
  }
  if (isCircleExpired(circle)) throw new Error("This circle has expired (deadline passed).");
  if (isCircleFull(circle)) throw new Error("Circle is already full");

  const key = attemptKey(circle.id);
  const stored = ASSESSMENT_ATTEMPTS.get(key);
  if (!stored && assessment) {
    ASSESSMENT_ATTEMPTS.set(key, {
      skillLevel: assessment.skillLevel,
      score: assessment.score,
      maxScore: assessment.maxScore,
      percentage: assessment.percentage,
      assessedAt: new Date().toISOString(),
    });
  }
  const attempt = ASSESSMENT_ATTEMPTS.get(key);

  const member: CircleMember = {
    userId: CURRENT_USER.id,
    name: CURRENT_USER.name,
    skillLevel: attempt?.skillLevel ?? skillLevel,
    joinedAt: new Date().toISOString(),
    ...(attempt ? { scorePercent: attempt.percentage, assessedAt: attempt.assessedAt } : {}),
  };

  const shortGroup = groupNeedingMember(circle.id);
  circle.members.push(member);

  if (shortGroup) {
    shortGroup.members.push(member);
    shortGroup.status = "Active";
    shortGroup.leaderUserId = electLeader(shortGroup.members)?.userId ?? shortGroup.leaderUserId;
  } else if (circle.members.length >= getCircleCapacity(circle)) {
    circle.status = "Full";
    formCircleOnce(circle.id); // sets status to "Grouped"; throws (saving nothing) if validation fails
  }
  return simulateRequest(snapshot());
}

/**
 * Leaving rules:
 *  - before formation: the member is removed and the circle simply waits for a replacement;
 *  - after formation: groups are NOT reshuffled. The group is flagged "Needs Rebalancing",
 *    and if the leaver was the leader, the next best member becomes leader.
 */
export async function leaveCircle(circleId: string): Promise<Circle> {
  const circle = CIRCLES.find((c) => c.id === circleId);
  if (!circle) throw new Error(`Circle ${circleId} not found`);
  if (!circle.members.some((m) => m.userId === CURRENT_USER.id)) {
    throw new Error("You're not a member of this circle.");
  }

  circle.members = circle.members.filter((m) => m.userId !== CURRENT_USER.id);

  const group = SUB_GROUPS.find(
    (g) => g.circleId === circle.id && g.members.some((m) => m.userId === CURRENT_USER.id),
  );
  if (group) {
    group.members = group.members.filter((m) => m.userId !== CURRENT_USER.id);
    group.status = "Needs Rebalancing";
    if (group.leaderUserId === CURRENT_USER.id) {
      group.leaderUserId = electLeader(group.members)?.userId ?? "";
    }
  } else if (circle.status !== "Grouped") {
    circle.status = "Open";
  }
  return simulateRequest({ ...circle, members: [...circle.members] });
}
