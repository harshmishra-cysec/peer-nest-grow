/**
 * Milestone service for sub-group broader checkpoints.
 * Manages journey-level goals (e.g. Arrays Module, Mock Interviews).
 */
import { MAX_MILESTONES_SHOWN, MOCK_LATENCY_MS } from "@/constants";
import type { Milestone, MilestoneStatus } from "@/types";

/** Initial mock milestones for sub-groups */
const INITIAL_MILESTONES: Milestone[] = [
  {
    id: "ms-1",
    subGroupId: "sg-alpha",
    title: "Complete Arrays & Strings Deep Dive",
    description: "Master two-pointer techniques, sliding windows, and prefix sums.",
    dueDate: "2026-09-22",
    status: "Completed",
  },
  {
    id: "ms-2",
    subGroupId: "sg-alpha",
    title: "Graph Algorithms & BFS/DFS Traversal",
    description: "Understand cycle detection, topological sort, and Dijkstra's algorithm.",
    dueDate: "2026-10-05",
    status: "In Progress",
  },
  {
    id: "ms-3",
    subGroupId: "sg-alpha",
    title: "Mock Interview Round 1 (Peer-Assessed)",
    description:
      "Hold 45-minute 1-on-1 mock interviews within the sub-group with live code walkthroughs.",
    dueDate: "2026-10-18",
    status: "Not Started",
  },
  {
    id: "ms-4",
    subGroupId: "sg-alpha",
    title: "Dynamic Programming & Final Contest Sprint",
    description: "Solve 15 classic DP problems and review sub-group solutions before midterms.",
    dueDate: "2026-10-28",
    status: "Not Started",
  },
];

// In-memory store for session persistence
const milestonesStore: Milestone[] = [...INITIAL_MILESTONES];

/**
 * Fetches all milestones belonging to a given sub-group.
 */
export async function getMilestones(subGroupId: string): Promise<Milestone[]> {
  await new Promise((resolve) => setTimeout(resolve, MOCK_LATENCY_MS));
  return milestonesStore
    .filter((ms) => ms.subGroupId === subGroupId)
    .slice(0, MAX_MILESTONES_SHOWN);
}

/**
 * Updates the completion status of an existing milestone.
 */
export async function updateMilestoneStatus(
  milestoneId: string,
  status: MilestoneStatus,
): Promise<Milestone> {
  await new Promise((resolve) => setTimeout(resolve, MOCK_LATENCY_MS));
  const found = milestonesStore.find((ms) => ms.id === milestoneId);
  if (!found) {
    throw new Error(`Milestone ${milestoneId} not found`);
  }
  found.status = status;
  return { ...found };
}

/**
 * Adds a new milestone to a sub-group.
 */
export async function addMilestone(
  subGroupId: string,
  input: { title: string; dueDate: string; description?: string },
): Promise<Milestone> {
  await new Promise((resolve) => setTimeout(resolve, MOCK_LATENCY_MS));
  const newMilestone: Milestone = {
    id: `ms-${Date.now()}`,
    subGroupId,
    title: input.title.trim(),
    dueDate: input.dueDate,
    description: input.description?.trim(),
    status: "Not Started",
  };
  milestonesStore.push(newMilestone);
  return newMilestone;
}
