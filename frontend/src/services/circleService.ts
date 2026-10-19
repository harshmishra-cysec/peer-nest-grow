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

export function createCircle(preferences: CirclePreferences): Promise<Circle> {
  const created: Circle = {
    id: `c-${Date.now()}`,
    name: `${preferences.topic} Circle`,
    ...preferences,
    description: "",
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
  return simulateRequest(created);
}

export function isCircleFull(circle: Circle): boolean {
  return circle.members.length >= CIRCLE_CAPACITY;
}

/**
 * Joins the current user to an open circle if capacity allows.
 * If capacity reaches CIRCLE_CAPACITY, the circle becomes Grouped.
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
    if (circle.members.length >= CIRCLE_CAPACITY) {
      throw new Error("Circle is already full");
    }
    circle.members.push({
      userId: CURRENT_USER.id,
      name: CURRENT_USER.name,
      skillLevel,
      joinedAt: new Date().toISOString(),
    });
    if (circle.members.length >= CIRCLE_CAPACITY) {
      circle.status = "Grouped";
    }
  }
  return simulateRequest({ ...circle, members: [...circle.members] });
}
