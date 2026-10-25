import { ApiError, apiGet, apiPost } from "./apiClient";
import { getCircles, getCircleById, getCircleCapacity } from "./circleService";
import type { CircleMember, SkillLevel, SubGroup, Task, TaskStatus } from "@/types";

interface ApiGroupMember {
  userId: number | string;
  name: string;
  skillLevel: string;
  assessmentScore: number;
  joinedAt: string;
}

interface ApiSubGroup {
  id: number | string;
  circleId: number | string;
  name: string;
  balanceLabel: string;
  leaderUserId: number | string;
  createdAt: string;
  members: ApiGroupMember[];
}

interface ApiTask {
  id: number | string;
  subGroupId: number | string;
  title: string;
  description: string | null;
  assigneeUserId: number | string;
  assigneeName: string;
  dueDate: string | null;
  status: string;
  proofUrl: string | null;
  reviewNote: string | null;
  createdAt: string;
}

const statusToUi: Record<string, TaskStatus> = {
  IN_PROGRESS: "In Progress",
  PENDING_PEER_CONFIRMATION: "Pending Peer Confirmation",
  VERIFIED: "Verified",
  CHANGES_REQUESTED: "Changes Requested",
};

function mapGroupMember(member: ApiGroupMember): CircleMember {
  return {
    userId: String(member.userId),
    name: member.name,
    skillLevel: (
      member.skillLevel[0] +
      member.skillLevel.slice(1).toLowerCase()
    ) as SkillLevel,
    scorePercent: (member.assessmentScore / 15) * 100,
    joinedAt: member.joinedAt,
  };
}

function mapSubGroup(group: ApiSubGroup): SubGroup {
  return {
    id: String(group.id),
    circleId: String(group.circleId),
    name: group.name,
    leaderUserId: String(group.leaderUserId),
    members: group.members.map(mapGroupMember),
    status: "Active",
  };
}

function mapTask(task: ApiTask, previous?: Task): Task {
  return {
    id: String(task.id),
    subGroupId: String(task.subGroupId),
    title: task.title,
    description: task.description ?? "",
    assigneeUserId: String(task.assigneeUserId),
    dueDate: task.dueDate ?? "",
    status: statusToUi[task.status] ?? "In Progress",
    ...(task.proofUrl ? { proofUrl: task.proofUrl } : {}),
    ...(task.reviewNote ? { comment: task.reviewNote } : {}),
    verifiedByUserIds: previous?.verifiedByUserIds ?? [],
  };
}

/**
 * Group formation is performed by the backend when the final circle member joins.
 * Kept for compatibility with existing frontend imports.
 */
export function formCircleOnce(_circleId: string): SubGroup[] {
  throw new ApiError(
    501,
    "Not Implemented",
    "Group formation is performed by the backend when the last circle member joins.",
  );
}

/**
 * Returns null until the circle reaches its selected capacity.
 *
 * Once full, the persisted backend subgroups are the source of truth.
 * The frontend does not recompute or replace the backend grouping.
 */
export async function getGroupingAnalysisForCircle(
  circleId: string,
): Promise<SubGroup[] | null> {
  const circle = await getCircleById(circleId);

  if (!circle || circle.members.length < getCircleCapacity(circle)) {
    return null;
  }

  return getSubGroupsForCircle(circleId);
}

export async function getSubGroupsForCircle(
  circleId: string,
): Promise<SubGroup[]> {
  try {
    const groups = await apiGet<ApiSubGroup[]>(
      `/api/circles/${encodeURIComponent(circleId)}/subgroups`,
    );

    return groups.map(mapSubGroup);
  } catch (error) {
    if (error instanceof ApiError && error.status === 404) {
      return [];
    }

    throw error;
  }
}

export async function getSubGroupById(
  subGroupId: string,
): Promise<SubGroup | undefined> {
  for (const circle of await getCircles()) {
    try {
      const match = (await getSubGroupsForCircle(circle.id)).find(
        (group) => group.id === subGroupId,
      );

      if (match) {
        return match;
      }
    } catch (error) {
      if (!(error instanceof ApiError) || error.status !== 404) {
        throw error;
      }
    }
  }

  return undefined;
}

export async function getMySubGroup(circleId: string): Promise<SubGroup> {
  return mapSubGroup(
    await apiGet<ApiSubGroup>(
      `/api/circles/${encodeURIComponent(circleId)}/my-subgroup`,
    ),
  );
}

export async function getMySubGroupForCircle(
  circleId: string,
): Promise<SubGroup | undefined> {
  try {
    return await getMySubGroup(circleId);
  } catch (error) {
    if (error instanceof ApiError && error.status === 404) {
      return undefined;
    }

    throw error;
  }
}

export async function getTasks(subGroupId: string): Promise<Task[]> {
  const tasks = await apiGet<ApiTask[]>(
    `/api/subgroups/${encodeURIComponent(subGroupId)}/tasks`,
  );

  return tasks.map((task) => mapTask(task));
}

export type NewTaskInput = Pick<
  Task,
  "title" | "description" | "assigneeUserId" | "dueDate"
>;

export async function createTask(
  subGroupId: string,
  input: NewTaskInput,
): Promise<Task> {
  const created = await apiPost<ApiTask>(
    `/api/subgroups/${encodeURIComponent(subGroupId)}/tasks`,
    {
      title: input.title,
      description: input.description,
      assigneeUserId: Number(input.assigneeUserId),
      dueDate: input.dueDate || null,
    },
  );

  return mapTask(created);
}

export async function markTaskDone(
  task: Task,
  proofUrl?: string,
  proofAttachments?: Task["proofAttachments"],
): Promise<Task> {
  if (proofAttachments?.length) {
    throw new ApiError(
      501,
      "Not Implemented",
      "The current backend accepts a proof URL but does not support file attachments.",
    );
  }

  const body = proofUrl?.trim()
    ? { proofUrl: proofUrl.trim() }
    : {};

  return mapTask(
    await apiPost<ApiTask>(
      `/api/tasks/${encodeURIComponent(task.id)}/mark-done`,
      body,
    ),
    task,
  );
}

export async function confirmTask(
  task: Task,
  _comment?: string,
): Promise<Task> {
  return mapTask(
    await apiPost<ApiTask>(
      `/api/tasks/${encodeURIComponent(task.id)}/confirm`,
    ),
    task,
  );
}

export async function requestTaskChanges(
  taskId: string,
  note: string,
): Promise<Task> {
  return mapTask(
    await apiPost<ApiTask>(
      `/api/tasks/${encodeURIComponent(taskId)}/request-changes`,
      {
        reviewNote: note,
      },
    ),
  );
}

/**
 * The existing workspace's peer-note action maps to the backend
 * request-changes transition.
 */
export async function commentOnTask(
  task: Task,
  comment: string,
): Promise<Task> {
  return requestTaskChanges(task.id, comment);
}