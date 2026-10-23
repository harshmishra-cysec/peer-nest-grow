import { simulateRequest } from "./apiClient";
import {
  computeBalancedSubGroups,
  getCircleCapacity,
  type GroupingResult,
} from "./groupingService";
import { CIRCLES, CURRENT_USER, SUB_GROUPS, TASKS } from "./mockData";
import type { SubGroup, Task } from "@/types";

/**
 * Forms the sub-groups for a FULL circle — exactly once.
 * Called inside the same step that accepts the last member (see joinCircle), so two
 * simultaneous "last" joins can never form groups twice. The backend must do the same
 * inside one DB transaction (unique constraint on circle_id + group formation).
 * If validation fails, computeBalancedSubGroups throws and NOTHING is saved.
 */
export function formCircleOnce(circleId: string): SubGroup[] {
  const existing = SUB_GROUPS.filter((group) => group.circleId === circleId);
  if (existing.length > 0) return existing;

  const circle = CIRCLES.find((c) => c.id === circleId);
  if (!circle || circle.members.length < getCircleCapacity(circle)) return [];

  const result = computeBalancedSubGroups(circle.id, circle.members);
  SUB_GROUPS.push(...result.subGroups);
  circle.status = "Grouped";
  return result.subGroups;
}

/** Returns the grouping result with tier statistics, score spread and balance label. */
export function getGroupingAnalysisForCircle(circleId: string): Promise<GroupingResult | null> {
  const circle = CIRCLES.find((c) => c.id === circleId);
  if (!circle || circle.members.length < getCircleCapacity(circle)) {
    return simulateRequest(null);
  }
  return simulateRequest(computeBalancedSubGroups(circle.id, circle.members));
}

export function getSubGroupsForCircle(circleId: string): Promise<SubGroup[]> {
  return simulateRequest(formCircleOnce(circleId));
}

export function getSubGroupById(subGroupId: string): Promise<SubGroup | undefined> {
  return simulateRequest(SUB_GROUPS.find((group) => group.id === subGroupId));
}

/** The sub-group the current user was placed in for a circle, if grouping ran. */
export function getMySubGroupForCircle(circleId: string): Promise<SubGroup | undefined> {
  const groups = formCircleOnce(circleId);
  return simulateRequest(
    groups.find((group) => group.members.some((m) => m.userId === CURRENT_USER.id)),
  );
}

export function getTasks(subGroupId: string): Promise<Task[]> {
  return simulateRequest(TASKS.filter((task) => task.subGroupId === subGroupId));
}

/* -------------------------------------------------------------------------- */
/*  Authorization — enforced here in the service layer, not only by hiding     */
/*  buttons in the UI. The Spring Boot API must repeat these checks.           */
/* -------------------------------------------------------------------------- */

function requireGroupMember(subGroupId: string): SubGroup {
  const group = SUB_GROUPS.find((g) => g.id === subGroupId);
  if (!group) throw new Error("Sub-group not found.");
  if (!group.members.some((m) => m.userId === CURRENT_USER.id)) {
    throw new Error("Only members of this sub-group can do this.");
  }
  return group;
}

/** The stored task is the source of truth, never the copy the UI holds. */
const storedTask = (task: Task): Task => TASKS.find((t) => t.id === task.id) ?? task;

function saveTask(updated: Task): Task {
  const idx = TASKS.findIndex((t) => t.id === updated.id);
  if (idx !== -1) TASKS[idx] = updated;
  else TASKS.push(updated);
  return updated;
}

export type NewTaskInput = Pick<Task, "title" | "description" | "assigneeUserId" | "dueDate">;

/**
 * Any member can add a task, but only the group LEADER can assign it to someone else;
 * everyone else can only assign tasks to themselves.
 */
export async function createTask(subGroupId: string, input: NewTaskInput): Promise<Task> {
  const group = requireGroupMember(subGroupId);
  if (!group.members.some((m) => m.userId === input.assigneeUserId)) {
    throw new Error("The assignee must be a member of this sub-group.");
  }
  const isLeader = group.leaderUserId === CURRENT_USER.id;
  if (!isLeader && input.assigneeUserId !== CURRENT_USER.id) {
    throw new Error("Only the group leader can assign tasks to other members.");
  }
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

/** Self-report step: ONLY the assignee can mark their own task as done. */
export async function markTaskDone(
  task: Task,
  proofUrl?: string,
  proofAttachments?: Task["proofAttachments"],
): Promise<Task> {
  const current = storedTask(task);
  requireGroupMember(current.subGroupId);
  if (current.assigneeUserId !== CURRENT_USER.id) {
    throw new Error("Only the assignee can mark this task as done.");
  }
  if (current.status === "Verified") throw new Error("This task is already verified.");

  const updated: Task = {
    ...current,
    status: "Pending Peer Confirmation",
    ...(proofUrl !== undefined ? { proofUrl: proofUrl.trim() || undefined } : {}),
    ...(proofAttachments !== undefined ? { proofAttachments } : {}),
  };
  return simulateRequest(saveTask(updated));
}

/**
 * Peer confirmation: a member of the group, who is NOT the assignee, can verify a task
 * that is waiting for confirmation.
 */
export async function confirmTask(task: Task, comment?: string): Promise<Task> {
  const current = storedTask(task);
  requireGroupMember(current.subGroupId);
  if (current.assigneeUserId === CURRENT_USER.id) {
    throw new Error("You can't confirm your own task.");
  }
  if (current.status !== "Pending Peer Confirmation") {
    throw new Error("This task is not waiting for peer confirmation.");
  }
  const updated: Task = {
    ...current,
    status: "Verified",
    comment: comment !== undefined && comment.trim() ? comment.trim() : current.comment,
    verifiedByUserIds: current.verifiedByUserIds.includes(CURRENT_USER.id)
      ? current.verifiedByUserIds
      : [...current.verifiedByUserIds, CURRENT_USER.id],
  };
  return simulateRequest(saveTask(updated));
}

/** Peer feedback without confirming. Any member of the group can leave a note. */
export async function commentOnTask(task: Task, comment: string): Promise<Task> {
  const current = storedTask(task);
  requireGroupMember(current.subGroupId);
  return simulateRequest(saveTask({ ...current, comment: comment.trim() || undefined }));
}
