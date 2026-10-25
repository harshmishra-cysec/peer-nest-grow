import { getCurrentUser as getAuthenticatedUser } from "./authService";
import { ACTIVITY, BADGES, CURRENT_USER, TASKS } from "./mockData";
import type { ActivityItem, Badge, User } from "@/types";

export function getCurrentUser(): Promise<User> {
  return getAuthenticatedUser();
}

export function getMyBadges(): Promise<Badge[]> {
  return Promise.resolve(BADGES);
}

export function getMyActivity(): Promise<ActivityItem[]> {
  return Promise.resolve(ACTIVITY);
}

/** Count of tasks assigned to the current user that reached "Verified". */
export function getMyCompletedTaskCount(): Promise<number> {
  return Promise.resolve(
    TASKS.filter(
      (task) =>
        task.assigneeUserId === CURRENT_USER.id && task.status === "Verified",
    ).length,
  );
}