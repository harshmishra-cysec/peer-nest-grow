import type { CommitmentLevel, GoalType, SkillLevel } from "@/types";

/** A circle is considered full — and grouping runs — at this member count. */
export const CIRCLE_CAPACITY = 9;

/** Each balanced sub-group holds one Beginner, one Intermediate, one Advanced. */
export const SUB_GROUP_SIZE = 3;

export const TOPICS = [
  "Data Structures & Algorithms",
  "Web Development",
  "UI Design",
  "Machine Learning",
  "System Design",
  "Mobile Development",
] as const;

export const GOAL_TYPES: readonly GoalType[] = ["Learn", "Build", "Compete"];
export const COMMITMENT_LEVELS: readonly CommitmentLevel[] = ["Casual", "Serious"];
export const SKILL_LEVELS: readonly SkillLevel[] = ["Beginner", "Intermediate", "Advanced"];

/** Short helper copy shown next to each option in the forms. */
export const GOAL_TYPE_HINTS: Record<GoalType, string> = {
  Learn: "Understand the fundamentals together",
  Build: "Ship a project as a team",
  Compete: "Prepare for contests or interviews",
};

export const COMMITMENT_HINTS: Record<CommitmentLevel, string> = {
  Casual: "A few hours a week",
  Serious: "Daily check-ins and deadlines",
};

/** Simulated network delay for mock services (ms). Remove when real API lands. */
export const MOCK_LATENCY_MS = 250;

/** Central route table so links never hardcode paths. */
export const ROUTES = {
  landing: "/",
  auth: "/auth",
  start: "/start",
  makeCircle: "/circles/new",
  joinPreferences: "/circles/join",
  recommended: "/circles/recommended",
  circle: "/circles/$circleId",
  subGroup: "/circles/$circleId/subgroup",
  profile: "/profile",
} as const;
