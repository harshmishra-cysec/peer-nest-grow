/**
 * Resource service for shared links and study materials within a sub-group.
 */
import { MAX_RESOURCES_SHOWN, MOCK_LATENCY_MS } from "@/constants";
import type { Resource } from "@/types";

/** Initial mock resources for sub-groups */
const INITIAL_RESOURCES: Resource[] = [
  {
    id: "res-1",
    subGroupId: "sg-alpha",
    title: "NeetCode 150 Interactive Roadmap & Solution Videos",
    url: "https://neetcode.io/roadmap",
    addedBy: "Priya Nair",
    addedDate: "2026-09-08",
  },
  {
    id: "res-2",
    subGroupId: "sg-alpha",
    title: "Visualgo — Interactive Graph & Tree Algorithm Visualizer",
    url: "https://visualgo.net/en",
    addedBy: "Harsh Mishra",
    addedDate: "2026-09-11",
  },
  {
    id: "res-3",
    subGroupId: "sg-alpha",
    title: "Tech Interview Handbook: Curated Study Sheet & System Design Basics",
    url: "https://www.techinterviewhandbook.org",
    addedBy: "Rohan Das",
    addedDate: "2026-09-14",
  },
  {
    id: "res-4",
    subGroupId: "sg-alpha",
    title: "MIT OpenCourseWare: Introduction to Algorithms (6.006) Notes",
    url: "https://ocw.mit.edu/courses/6-006-introduction-to-algorithms-spring-2020/",
    addedBy: "Priya Nair",
    addedDate: "2026-09-17",
  },
];

// In-memory store for session additions
const resourcesStore: Resource[] = [...INITIAL_RESOURCES];

/**
 * Fetches all shared resources for a given sub-group.
 */
export async function getResources(subGroupId: string): Promise<Resource[]> {
  await new Promise((resolve) => setTimeout(resolve, MOCK_LATENCY_MS));
  return resourcesStore
    .filter((res) => res.subGroupId === subGroupId)
    .slice(0, MAX_RESOURCES_SHOWN);
}

/**
 * Adds a new shared resource to a sub-group.
 */
export async function addResource(
  subGroupId: string,
  input: { title: string; url: string; addedBy: string },
): Promise<Resource> {
  await new Promise((resolve) => setTimeout(resolve, MOCK_LATENCY_MS));

  // Format URL safely with http/https prefix if omitted
  let formattedUrl = input.url.trim();
  if (!/^https?:\/\//i.test(formattedUrl)) {
    formattedUrl = `https://${formattedUrl}`;
  }

  const newResource: Resource = {
    id: `res-${Date.now()}`,
    subGroupId,
    title: input.title.trim(),
    url: formattedUrl,
    addedBy: input.addedBy.trim() || "Teammate",
    addedDate: new Date().toISOString().split("T")[0],
  };

  resourcesStore.unshift(newResource); // Add to top so new items show first
  return newResource;
}
