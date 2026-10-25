import { MAX_MILESTONES_SHOWN } from "@/constants";
import { apiGet, apiPatch, apiPost } from "./apiClient";
import type { Milestone, MilestoneStatus } from "@/types";

interface ApiMilestone {
  id: number | string;
  subGroupId: number | string;
  title: string;
  description: string | null;
  dueDate: string | null;
  status: string;
}

const toBackendStatus: Record<MilestoneStatus, string> = {
  "Not Started": "NOT_STARTED",
  "In Progress": "IN_PROGRESS",
  Completed: "COMPLETED",
};
const toFrontendStatus: Record<string, MilestoneStatus> = {
  NOT_STARTED: "Not Started",
  IN_PROGRESS: "In Progress",
  COMPLETED: "Completed",
};
const mapMilestone = (value: ApiMilestone): Milestone => ({
  id: String(value.id),
  subGroupId: String(value.subGroupId),
  title: value.title,
  ...(value.description == null ? {} : { description: value.description }),
  dueDate: value.dueDate ?? "",
  status: toFrontendStatus[value.status] ?? "Not Started",
});

export async function getMilestones(subGroupId: string): Promise<Milestone[]> {
  const values = await apiGet<ApiMilestone[]>(
    `/api/subgroups/${encodeURIComponent(subGroupId)}/milestones`,
  );
  return values.slice(0, MAX_MILESTONES_SHOWN).map(mapMilestone);
}

export async function updateMilestoneStatus(
  milestoneId: string,
  status: MilestoneStatus,
): Promise<Milestone> {
  return mapMilestone(
    await apiPatch<ApiMilestone>(`/api/milestones/${encodeURIComponent(milestoneId)}/status`, {
      status: toBackendStatus[status],
    }),
  );
}

export async function addMilestone(
  subGroupId: string,
  input: { title: string; dueDate: string; description?: string },
): Promise<Milestone> {
  const created = await apiPost<ApiMilestone>(
    `/api/subgroups/${encodeURIComponent(subGroupId)}/milestones`,
    {
      title: input.title,
      dueDate: input.dueDate || null,
      description: input.description,
    },
  );
  return mapMilestone(created);
}
