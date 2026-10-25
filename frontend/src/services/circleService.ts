import { ApiError, apiGet, apiPost } from "./apiClient";
import {
  getCircleCapacity,
  isValidCircleCapacity,
  MAX_CIRCLE_CAPACITY,
  MIN_CIRCLE_CAPACITY,
} from "./groupingService";
import { SUB_GROUP_SIZE } from "@/constants";
import type {
  Circle,
  CircleMember,
  CirclePreferences,
  CircleStatus,
  CommitmentLevel,
  GoalType,
  JoinPreferences,
  SkillLevel,
} from "@/types";

export { getCircleCapacity };

const BACKEND_GOALS: Record<GoalType, string> = {
  Learn: "LEARN",
  Build: "BUILD",
  Compete: "COMPETE",
};

const BACKEND_COMMITMENTS: Record<CommitmentLevel, string> = {
  Casual: "CASUAL",
  Serious: "SERIOUS",
};

const FRONTEND_GOALS: Record<string, GoalType> = {
  LEARN: "Learn",
  BUILD: "Build",
  COMPETE: "Compete",
};

const FRONTEND_COMMITMENTS: Record<string, CommitmentLevel> = {
  CASUAL: "Casual",
  SERIOUS: "Serious",
};

interface ApiCircleSummary {
  id: number | string;
  name: string;
  topic: string;
  goalType: string;
  commitment: string;
  deadline: string;
  status: string;
  memberCount: number;
  capacity: number;
}

interface ApiCircleMember {
  userId: number | string;
  name: string;
  joinedAt: string;
  skillLevel: string | null;
  assessmentScore: number | null;
}

interface ApiCircleDetail extends ApiCircleSummary {
  description: string | null;
  members: ApiCircleMember[];
}

interface StoredAssessment {
  skillLevel: SkillLevel;
  answers: number[];
  score: number;
  percentage: number;
}

function mapStatus(status: string): CircleStatus {
  if (status === "GROUPED") return "Grouped";
  if (status === "CLOSED") return "Closed";
  return "Open";
}

function mapMember(member: ApiCircleMember): CircleMember {
  const scorePercent =
    member.assessmentScore == null
      ? undefined
      : (member.assessmentScore / 15) * 100;

  return {
    userId: String(member.userId),
    name: member.name,
    skillLevel: member.skillLevel
      ? ((member.skillLevel[0] +
          member.skillLevel.slice(1).toLowerCase()) as SkillLevel)
      : undefined,
    joinedAt: member.joinedAt,
    ...(scorePercent === undefined ? {} : { scorePercent }),
  };
}

function mapCircle(circle: ApiCircleDetail): Circle {
  return {
    id: String(circle.id),
    name: circle.name,
    topic: circle.topic,
    goalType: FRONTEND_GOALS[circle.goalType] ?? "Learn",
    commitment: FRONTEND_COMMITMENTS[circle.commitment] ?? "Casual",
    deadline: circle.deadline,
    description: circle.description ?? "",
    capacity: circle.capacity,
    members: circle.members.map(mapMember),
    status: mapStatus(circle.status),
  };
}

async function detailsForSummaries(
  summaries: ApiCircleSummary[],
): Promise<Circle[]> {
  return Promise.all(
    summaries.map(async (circle) =>
      mapCircle(
        await apiGet<ApiCircleDetail>(`/api/circles/${circle.id}`),
      ),
    ),
  );
}

export const CIRCLE_SIZE_OPTIONS = Array.from(
  {
    length:
      (MAX_CIRCLE_CAPACITY - MIN_CIRCLE_CAPACITY) / SUB_GROUP_SIZE + 1,
  },
  (_, i) => MIN_CIRCLE_CAPACITY + i * SUB_GROUP_SIZE,
);

export function normalizeQuizAnswers(
  answers: readonly number[],
): number[] {
  if (
    answers.length !== 5 ||
    answers.some(
      (answer) =>
        !Number.isInteger(answer) || answer < 0 || answer > 3,
    )
  ) {
    throw new Error(
      "Quiz must have exactly 5 integer answers, each from 0 to 3.",
    );
  }

  return [...answers];
}

function getAssessmentStorageKey(circleId: string): string {
  return `skillnest_assessment_${circleId}`;
}

function saveAssessment(
  circleId: string,
  answers: readonly number[],
): void {
  if (typeof localStorage === "undefined") return;

  const normalizedAnswers = normalizeQuizAnswers(answers);
  const score = normalizedAnswers.reduce(
    (total, answer) => total + answer,
    0,
  );
  const percentage = Math.round((score / 15) * 100);

  const skillLevel: SkillLevel =
    score >= 11
      ? "Advanced"
      : score >= 6
        ? "Intermediate"
        : "Beginner";

  const assessment: StoredAssessment = {
    skillLevel,
    answers: normalizedAnswers,
    score,
    percentage,
  };

  localStorage.setItem(
    getAssessmentStorageKey(circleId),
    JSON.stringify(assessment),
  );
}

export function getMyAssessmentForCircle(
  circleId: string,
): StoredAssessment | null {
  if (typeof localStorage === "undefined") return null;

  const raw = localStorage.getItem(getAssessmentStorageKey(circleId));

  if (!raw) return null;

  try {
    const parsed = JSON.parse(raw) as StoredAssessment;

    if (
      !parsed ||
      !Array.isArray(parsed.answers) ||
      parsed.answers.length !== 5 ||
      typeof parsed.skillLevel !== "string"
    ) {
      return null;
    }

    normalizeQuizAnswers(parsed.answers);

    return parsed;
  } catch {
    return null;
  }
}

export function getCircles(): Promise<Circle[]> {
  return apiGet<ApiCircleSummary[]>("/api/circles").then(
    detailsForSummaries,
  );
}

export async function getCircleById(
  circleId: string,
): Promise<Circle | undefined> {
  try {
    return mapCircle(
      await apiGet<ApiCircleDetail>(
        `/api/circles/${encodeURIComponent(circleId)}`,
      ),
    );
  } catch (error) {
    if (error instanceof ApiError && error.status === 404) {
      return undefined;
    }

    throw error;
  }
}

export function getMyCircles(): Promise<Circle[]> {
  return apiGet<ApiCircleSummary[]>("/api/circles/mine").then(
    detailsForSummaries,
  );
}

export function isCircleFull(circle: Circle): boolean {
  return circle.members.length >= getCircleCapacity(circle);
}

export function isCircleExpired(circle: Circle): boolean {
  return (
    circle.status === "Open" &&
    circle.deadline.slice(0, 10) <
      new Date().toISOString().slice(0, 10)
  );
}

export function isCircleJoinable(circle: Circle): boolean {
  return (
    !isCircleFull(circle) &&
    !isCircleExpired(circle) &&
    circle.status === "Open"
  );
}

export const RECOMMENDATION_SHORTLIST_SIZE = 5;

export function getMatchScore(
  circle: Circle,
  preferences: JoinPreferences,
): number {
  const dayGap = preferences.deadline
    ? Math.abs(
        new Date(circle.deadline).getTime() -
          new Date(preferences.deadline).getTime(),
      ) / 86_400_000
    : Number.POSITIVE_INFINITY;

  return (
    Number(circle.topic === preferences.topic) * 3 +
    Number(circle.goalType === preferences.goalType) * 2 +
    Number(circle.commitment === preferences.commitment) +
    Number(dayGap <= 14)
  );
}

export async function getRecommendedCircles(
  filters: Partial<JoinPreferences>,
): Promise<Circle[]> {
  const query = new URLSearchParams();

  if (filters.topic) {
    query.set("topic", filters.topic);
  }

  if (filters.goalType) {
    query.set("goalType", BACKEND_GOALS[filters.goalType]);
  }

  if (filters.commitment) {
    query.set(
      "commitment",
      BACKEND_COMMITMENTS[filters.commitment],
    );
  }

  const serialized = query.toString();
  const suffix = serialized ? `?${serialized}` : "";

  return detailsForSummaries(
    await apiGet<ApiCircleSummary[]>(
      `/api/circles/recommended${suffix}`,
    ),
  );
}

export interface NewCircleInput extends CirclePreferences {
  description: string;
  capacity: number;
}

export async function createCircle(
  input: NewCircleInput,
  quizAnswers: readonly number[],
): Promise<Circle> {
  if (!isValidCircleCapacity(input.capacity)) {
    throw new Error(
      `Circle size must be ${MIN_CIRCLE_CAPACITY}-${MAX_CIRCLE_CAPACITY} and a multiple of ${SUB_GROUP_SIZE}.`,
    );
  }

  const normalizedAnswers = normalizeQuizAnswers(quizAnswers);

  const body = {
    name: `${input.topic} Circle`,
    description: input.description.trim(),
    topic: input.topic,
    goalType: BACKEND_GOALS[input.goalType],
    commitment: BACKEND_COMMITMENTS[input.commitment],
    deadline: input.deadline,
    capacity: input.capacity,
    answers: normalizedAnswers,
  };

  const circle = mapCircle(
    await apiPost<ApiCircleDetail>("/api/circles", body),
  );

  saveAssessment(circle.id, normalizedAnswers);

  return circle;
}

export async function joinCircle(
  circleId: string,
  quizAnswers: readonly number[],
): Promise<Circle>;

export async function joinCircle(
  circleId: string,
  skillLevel: SkillLevel,
  assessment?: {
    answers?: readonly number[];
  },
): Promise<Circle>;

export async function joinCircle(
  circleId: string,
  quizAnswersOrSkillLevel: readonly number[] | SkillLevel,
  assessment?: {
    answers?: readonly number[];
  },
): Promise<Circle> {
  let answers: number[];

  if (Array.isArray(quizAnswersOrSkillLevel)) {
    answers = normalizeQuizAnswers(quizAnswersOrSkillLevel);
  } else {
    const previous = getMyAssessmentForCircle(circleId);

    if (assessment?.answers) {
      answers = normalizeQuizAnswers(assessment.answers);
    } else if (previous) {
      answers = normalizeQuizAnswers(previous.answers);
    } else {
      throw new Error(
        "Assessment answers are required to rejoin this circle.",
      );
    }
  }

  const circle = mapCircle(
    await apiPost<ApiCircleDetail>(
      `/api/circles/${encodeURIComponent(circleId)}/join`,
      {
        answers,
      },
    ),
  );

  saveAssessment(circle.id, answers);

  return circle;
}

export async function leaveCircle(
  _circleId: string,
): Promise<Circle> {
  throw new ApiError(
    501,
    "Not Implemented",
    "Leaving a circle is not available in the current backend API.",
  );
}