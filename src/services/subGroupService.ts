import { simulateRequest } from "./apiClient";
import { computeBalancedSubGroups, type GroupingResult } from "./groupingService";
import { CIRCLES, CURRENT_USER, SUB_GROUPS, TASKS } from "./mockData";
import { CIRCLE_CAPACITY } from "@/constants";
import type { SubGroup, Task } from "@/types";

/**
 * Ensures balanced sub-groups exist for a full circle by evaluating actual member
 * assessed skill levels and computing 1:1:1 balanced distribution or fallback.
 */
function ensureSubGroupsForCircle(circleId: string): SubGroup[] {
  const existing = SUB_GROUPS.filter((group) => group.circleId === circleId);
  if (existing.length > 0) return existing;

  const circle = CIRCLES.find((c) => c.id === circleId);
  if (!circle || circle.members.length < CIRCLE_CAPACITY) {
    return [];
  }

  const result = computeBalancedSubGroups(circle.id, circle.members);
  SUB_GROUPS.push(...result.subGroups);
  return result.subGroups;
}

/** Returns the real computed grouping result with tier statistics and balance verification */
export function getGroupingAnalysisForCircle(circleId: string): Promise<GroupingResult | null> {
  const circle = CIRCLES.find((c) => c.id === circleId);
  if (!circle || circle.members.length < CIRCLE_CAPACITY) {
    return simulateRequest(null);
  }
  const result = computeBalancedSubGroups(circle.id, circle.members);
  return simulateRequest(result);
}

export function getSubGroupsForCircle(circleId: string): Promise<SubGroup[]> {
  const groups = ensureSubGroupsForCircle(circleId);
  return simulateRequest(groups);
}

export function getSubGroupById(subGroupId: string): Promise<SubGroup | undefined> {
  return simulateRequest(SUB_GROUPS.find((group) => group.id === subGroupId));
}

/** The sub-group the current user was placed in for a circle, if grouping ran. */
export function getMySubGroupForCircle(circleId: string): Promise<SubGroup | undefined> {
  const groups = ensureSubGroupsForCircle(circleId);
  const match = groups.find((group) => group.members.some((m) => m.userId === CURRENT_USER.id));
  console.log(
    `[subGroupService] getMySubGroupForCircle(${circleId}) found:`,
    match ? `${match.name} (${match.id})` : "none",
    `among ${groups.length} sub-groups for user ${CURRENT_USER.id}`,
  );
  return simulateRequest(match);
}

export function getTasks(subGroupId: string): Promise<Task[]> {
  return simulateRequest(TASKS.filter((task) => task.subGroupId === subGroupId));
}

export type NewTaskInput = Pick<Task, "title" | "description" | "assigneeUserId" | "dueDate">;

export function createTask(subGroupId: string, input: NewTaskInput): Promise<Task> {
  const newTask: Task = {
    id: `t-${Date.now()}`,
    subGroupId,
    ...input,
    status: "In Progress",
    verifiedByUserIds: [],
  };
  TASKS.push(newTask);
  return simulateRequest(newTask);
}

/**
 * Self-report step: the assignee marks the task as completed, optionally providing a
 * proof URL (e.g. GitHub repo, document, Loom) and uploaded files/photos.
 */
export function markTaskDone(
  task: Task,
  proofUrl?: string,
  proofAttachments?: Task["proofAttachments"],
): Promise<Task> {
  const updated: Task = {
    ...task,
    status: "Pending Peer Confirmation",
    ...(proofUrl !== undefined ? { proofUrl: proofUrl.trim() || undefined } : {}),
    ...(proofAttachments !== undefined ? { proofAttachments } : {}),
  };
  const idx = TASKS.findIndex((t) => t.id === task.id);
  if (idx !== -1) {
    TASKS[idx] = updated;
  } else {
    TASKS.push(updated);
  }
  return simulateRequest(updated);
}

/**
 * Peer confirmation step: a member other than the assignee verifies the task,
 * with an optional supportive comment or note.
 */
export function confirmTask(task: Task, comment?: string): Promise<Task> {
  const updated: Task = {
    ...task,
    status: "Verified",
    comment: comment !== undefined && comment.trim() ? comment.trim() : task.comment,
    verifiedByUserIds: task.verifiedByUserIds.includes(CURRENT_USER.id)
      ? task.verifiedByUserIds
      : [...task.verifiedByUserIds, CURRENT_USER.id],
  };
  const idx = TASKS.findIndex((t) => t.id === task.id);
  if (idx !== -1) {
    TASKS[idx] = updated;
  } else {
    TASKS.push(updated);
  }
  return simulateRequest(updated);
}

/**
 * Peer feedback without confirming (e.g., "Proof unclear, please re-check").
 * Keeps the task in its current status (or returns it to In Progress if needed)
 * while attaching the reviewer's feedback note for the assignee.
 */
export function commentOnTask(task: Task, comment: string): Promise<Task> {
  const updated: Task = {
    ...task,
    comment: comment.trim() || undefined,
  };
  const idx = TASKS.findIndex((t) => t.id === task.id);
  if (idx !== -1) {
    TASKS[idx] = updated;
  } else {
    TASKS.push(updated);
  }
  return simulateRequest(updated);
}
