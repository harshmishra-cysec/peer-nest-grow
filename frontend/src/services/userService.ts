import { simulateRequest } from "./apiClient";
import { ACTIVITY, BADGES, CURRENT_USER, TASKS } from "./mockData";
import type { ActivityItem, Badge, User } from "@/types";

export function getCurrentUser(): Promise<User> {
  return simulateRequest(CURRENT_USER);
}

export function getMyBadges(): Promise<Badge[]> {
  return simulateRequest(BADGES);
}

export function getMyActivity(): Promise<ActivityItem[]> {
  return simulateRequest(ACTIVITY);
}

/** Count of tasks assigned to the current user that reached "Verified". */
export function getMyCompletedTaskCount(): Promise<number> {
  return simulateRequest(
    TASKS.filter((t) => t.assigneeUserId === CURRENT_USER.id && t.status === "Verified").length,
  );
}
