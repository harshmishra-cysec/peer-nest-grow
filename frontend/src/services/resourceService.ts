import { MAX_RESOURCES_SHOWN } from "@/constants";
import { apiGet, apiPost } from "./apiClient";
import type { Resource } from "@/types";

interface ApiResource {
  id: number | string;
  subGroupId: number | string;
  title: string;
  url: string;
  addedByUserId: number | string;
  addedByName: string;
  addedAt: string;
}

const mapResource = (value: ApiResource): Resource => ({
  id: String(value.id),
  subGroupId: String(value.subGroupId),
  title: value.title,
  url: value.url,
  addedBy: value.addedByName,
  addedDate: value.addedAt.slice(0, 10),
});

export async function getResources(subGroupId: string): Promise<Resource[]> {
  const values = await apiGet<ApiResource[]>(
    `/api/subgroups/${encodeURIComponent(subGroupId)}/resources`,
  );
  return values.slice(0, MAX_RESOURCES_SHOWN).map(mapResource);
}

export async function addResource(
  subGroupId: string,
  input: { title: string; url: string; addedBy: string },
): Promise<Resource> {
  const created = await apiPost<ApiResource>(
    `/api/subgroups/${encodeURIComponent(subGroupId)}/resources`,
    {
      title: input.title,
      url: input.url.trim(),
    },
  );
  return mapResource(created);
}
