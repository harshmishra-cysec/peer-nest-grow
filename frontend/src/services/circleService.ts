import { simulateRequest } from "./apiClient";
import { CIRCLES, CURRENT_USER } from "./mockData";
import { CIRCLE_CAPACITY } from "@/constants";
import type { Circle, CirclePreferences, JoinPreferences } from "@/types";

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

/**
 * Stage 1 matching: rank circles by how many preference tags they share.
 * The backend will own this; the client only displays the ordered result.
 */
export function getRecommendedCircles(preferences: JoinPreferences): Promise<Circle[]> {
  const score = (circle: Circle) =>
    Number(circle.topic === preferences.topic) * 3 +
    Number(circle.goalType === preferences.goalType) * 2 +
    Number(circle.commitment === preferences.commitment);

  const ranked = [...CIRCLES].sort((a, b) => score(b) - score(a));
  return simulateRequest(ranked);
}

/** Allowed circle sizes chosen at creation: 9 to 30, in steps of 3 (sub-groups of 3). */
export const CIRCLE_SIZE_OPTIONS = Array.from({ length: 8 }, (_, i) => 9 + i * 3);

/** Max members for a circle (creator's choice, or the default). */
export function getCircleCapacity(circle: Circle): number {
  return circle.capacity ?? CIRCLE_CAPACITY;
}

export interface NewCircleInput extends CirclePreferences {
  description: string;
  capacity: number;
}

export function createCircle(input: NewCircleInput): Promise<Circle> {
  const { description, capacity, ...preferences } = input;
  const created: Circle = {
    id: `c-${Date.now()}`,
    name: `${preferences.topic} Circle`,
    ...preferences,
    description: description.trim(),
    capacity,
    // The creator is simply the first member — never a leader.
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
  // Keep it in the in-memory store so it shows up in Explore Circles and its own page.
  CIRCLES.unshift(created);
  return simulateRequest(created);
}

export function isCircleFull(circle: Circle): boolean {
  return circle.members.length >= getCircleCapacity(circle);
}

/**
 * Joins the current user to an open circle if capacity allows.
 * If the circle's capacity is reached, the circle becomes Grouped.
 */
export function joinCircle(
  circleId: string,
  skillLevel = CURRENT_USER.skillBaseline,
): Promise<Circle> {
  const circle = CIRCLES.find((c) => c.id === circleId);
  if (!circle) {
    throw new Error(`Circle ${circleId} not found`);
  }
  if (!circle.members.some((m) => m.userId === CURRENT_USER.id)) {
    if (circle.members.length >= getCircleCapacity(circle)) {
      throw new Error("Circle is already full");
    }
    circle.members.push({
      userId: CURRENT_USER.id,
      name: CURRENT_USER.name,
      skillLevel,
      joinedAt: new Date().toISOString(),
    });
    if (circle.members.length >= getCircleCapacity(circle)) {
      circle.status = "Grouped";
    }
  }
  return simulateRequest({ ...circle, members: [...circle.members] });
}
