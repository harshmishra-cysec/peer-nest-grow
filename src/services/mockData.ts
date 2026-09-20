/**
 * Mock data for development. Every service in /src/services reads from here
 * today and will read from the Spring Boot API later — no component should
 * import this file directly.
 */
import type {
  ActivityItem,
  Badge,
  Circle,
  CircleMember,
  Message,
  SubGroup,
  Task,
  User,
} from "@/types";

export const CURRENT_USER: User = {
  id: "u-1",
  name: "Harsh Mishra",
  email: "harsh@example.com",
  bio: "CS undergrad who learns best by explaining things to other people.",
  skillBaseline: "Intermediate",
  currentStreakDays: 6,
  isRestrictedFromJoining: false,
};

const member = (
  userId: string,
  name: string,
  skillLevel: CircleMember["skillLevel"],
  joinedAt = "2026-09-01",
): CircleMember => ({ userId, name, skillLevel, joinedAt });

/** A full, already-grouped DSA circle that the current user belongs to. */
const DSA_MEMBERS: CircleMember[] = [
  member("u-1", "Harsh Mishra", "Intermediate", "2026-09-02"),
  member("u-2", "Priya Nair", "Advanced"),
  member("u-3", "Rohan Das", "Beginner"),
  member("u-4", "Ananya Iyer", "Advanced"),
  member("u-5", "Kabir Shah", "Intermediate"),
  member("u-6", "Meera Pillai", "Beginner"),
  member("u-7", "Dev Patel", "Advanced"),
  member("u-8", "Sana Khan", "Intermediate"),
  member("u-9", "Arjun Verma", "Beginner"),
];

export const CIRCLES: Circle[] = [
  {
    id: "c-1",
    name: "Graphs Before Midterms",
    topic: "Data Structures & Algorithms",
    goalType: "Compete",
    commitment: "Serious",
    deadline: "2026-10-30",
    description: "Daily graph problems, weekly mock contests, and honest code reviews.",
    members: DSA_MEMBERS,
    status: "Grouped",
  },
  {
    id: "c-2",
    name: "Portfolio Sprint",
    topic: "Web Development",
    goalType: "Build",
    commitment: "Serious",
    deadline: "2026-11-15",
    description: "Ship a polished personal site with React and deploy it together.",
    members: [
      member("u-1", "Harsh Mishra", "Intermediate", "2026-09-10"),
      member("u-10", "Ishaan Roy", "Beginner"),
      member("u-11", "Tara Menon", "Advanced"),
      member("u-12", "Vikram Joshi", "Beginner"),
      member("u-13", "Nisha Rao", "Intermediate"),
      member("u-14", "Aditya Kulkarni", "Advanced"),
    ],
    status: "Open",
  },
  {
    id: "c-3",
    name: "Design Systems from Scratch",
    topic: "UI Design",
    goalType: "Learn",
    commitment: "Casual",
    deadline: "2026-12-01",
    description: "Tokens, type scales and components — one Figma file per week.",
    members: [
      member("u-15", "Zoya Ahmed", "Advanced"),
      member("u-16", "Rahul Sen", "Beginner"),
      member("u-17", "Lakshmi B.", "Intermediate"),
      member("u-18", "Omar Farooq", "Beginner"),
    ],
    status: "Open",
  },
  {
    id: "c-4",
    name: "Kaggle Starter Pack",
    topic: "Machine Learning",
    goalType: "Compete",
    commitment: "Casual",
    deadline: "2026-11-20",
    description: "Work through two beginner competitions and compare notebooks.",
    members: [
      member("u-19", "Neha Gupta", "Intermediate"),
      member("u-20", "Sam Thomas", "Advanced"),
      member("u-21", "Ritika Jain", "Beginner"),
      member("u-22", "Farhan Ali", "Intermediate"),
      member("u-23", "Pooja Reddy", "Beginner"),
      member("u-24", "Yash Agarwal", "Advanced"),
      member("u-25", "Divya S.", "Beginner"),
      member("u-26", "Manav Chopra", "Intermediate"),
      member("u-27", "Kritika Bose", "Advanced"),
    ],
    status: "Full",
  },
  {
    id: "c-5",
    name: "Scale It Up",
    topic: "System Design",
    goalType: "Learn",
    commitment: "Serious",
    deadline: "2026-12-15",
    description: "One case study a week — URL shortener to a news feed.",
    members: [
      member("u-28", "Aarav Singh", "Advanced"),
      member("u-29", "Simran Kaur", "Intermediate"),
      member("u-30", "Nikhil Rao", "Beginner"),
    ],
    status: "Open",
  },
  {
    id: "c-6",
    name: "Flutter Weekend Club",
    topic: "Mobile Development",
    goalType: "Build",
    commitment: "Casual",
    deadline: "2026-11-01",
    description: "Build a habit tracker app together over four weekends.",
    members: [
      member("u-31", "Ayesha Khan", "Intermediate"),
      member("u-32", "Kunal Mehta", "Beginner"),
      member("u-33", "Sneha Iyer", "Advanced"),
      member("u-34", "Raj Malhotra", "Intermediate"),
      member("u-35", "Alisha D.", "Beginner"),
      member("u-36", "Tanmay Ghosh", "Beginner"),
      member("u-37", "Ira Kapoor", "Advanced"),
    ],
    status: "Open",
  },
];

/** Picks members by user id; throws early if mock data drifts out of sync. */
const pick = (...userIds: string[]): CircleMember[] =>
  userIds.map((id) => {
    const found = DSA_MEMBERS.find((m) => m.userId === id);
    if (!found) throw new Error(`Mock member ${id} missing`);
    return found;
  });

/** Sub-groups produced by the Stage 2 balancing pass for circle c-1. */
export const SUB_GROUPS: SubGroup[] = [
  {
    id: "sg-alpha",
    circleId: "c-1",
    name: "Sub-Group Alpha",
    leaderUserId: "u-2",
    members: pick("u-2", "u-1", "u-3"),
  },
  {
    id: "sg-beta",
    circleId: "c-1",
    name: "Sub-Group Beta",
    leaderUserId: "u-4",
    members: pick("u-4", "u-5", "u-6"),
  },
  {
    id: "sg-gamma",
    circleId: "c-1",
    name: "Sub-Group Gamma",
    leaderUserId: "u-7",
    members: pick("u-7", "u-8", "u-9"),
  },
];

export const TASKS: Task[] = [
  {
    id: "t-1",
    subGroupId: "sg-alpha",
    title: "BFS & DFS refresher",
    description: "Solve 5 traversal problems and share one written explanation each.",
    assigneeUserId: "u-3",
    dueDate: "2026-09-12",
    status: "Verified",
    proofUrl: "https://github.com/rohan-das/dsa-traversals",
    proofAttachments: [
      {
        id: "att-1",
        name: "traversal_benchmark_results.png",
        url: "https://images.unsplash.com/photo-1555066931-4365d14bab8c?auto=format&fit=crop&w=800&q=80",
        type: "image",
        size: 245000,
      },
    ],
    comment: "Clean explanations on tree edge cases — verified!",
    verifiedByUserIds: ["u-1", "u-2"],
  },
  {
    id: "t-2",
    subGroupId: "sg-alpha",
    title: "Dijkstra walkthrough",
    description: "Record a 10-minute walkthrough of Dijkstra with a priority queue.",
    assigneeUserId: "u-2",
    dueDate: "2026-09-19",
    status: "Pending Peer Confirmation",
    proofUrl: "https://loom.com/share/dijkstra-demo-walkthrough",
    verifiedByUserIds: ["u-3"],
  },
  {
    id: "t-3",
    subGroupId: "sg-alpha",
    title: "Mock contest #1",
    description: "Attempt the 3-problem set together on Sunday and review solutions.",
    assigneeUserId: "u-1",
    dueDate: "2026-09-20",
    status: "In Progress",
    verifiedByUserIds: [],
  },
  {
    id: "t-4",
    subGroupId: "sg-alpha",
    title: "Topological sort notes",
    description: "Write shared notes covering Kahn's algorithm and cycle detection.",
    assigneeUserId: "u-1",
    dueDate: "2026-09-26",
    status: "Pending Peer Confirmation",
    verifiedByUserIds: [],
  },
];

export const MESSAGES: Message[] = [
  {
    id: "m-1",
    subGroupId: "sg-alpha",
    senderUserId: "u-2",
    senderName: "Priya Nair",
    body: "Hey both — I put the contest set in the shared doc. Let's aim for Sunday 4pm?",
    sentAt: "2026-09-17T09:12:00Z",
  },
  {
    id: "m-2",
    subGroupId: "sg-alpha",
    senderUserId: "u-3",
    senderName: "Rohan Das",
    body: "Works for me. Still stuck on the visited-set part of BFS on grids though. Here is my grid traversal sketch:",
    sentAt: "2026-09-17T09:20:00Z",
    attachments: [
      {
        id: "chat-att-1",
        name: "grid_traversal_sketch.png",
        url: "https://images.unsplash.com/photo-1516259762381-22954d7d3ad2?auto=format&fit=crop&w=800&q=80",
        type: "image",
        size: 312000,
      },
    ],
  },
  {
    id: "m-3",
    subGroupId: "sg-alpha",
    senderUserId: "u-1",
    senderName: "Harsh Mishra",
    body: "I can walk you through it tonight — the trick is treating (row, col) as the node.",
    sentAt: "2026-09-17T09:24:00Z",
  },
  {
    id: "m-4",
    subGroupId: "sg-alpha",
    senderUserId: "u-2",
    senderName: "Priya Nair",
    body: "Also, can one of you verify my Dijkstra task when you get a sec?",
    sentAt: "2026-09-17T10:02:00Z",
  },
];

export const BADGES: Badge[] = [
  {
    id: "b-1",
    name: "First Circle",
    description: "Joined your first learning circle.",
    icon: "users",
    earnedAt: "2026-09-02",
  },
  {
    id: "b-2",
    name: "Peer Verifier",
    description: "Confirmed five tasks for teammates.",
    icon: "check-circle",
    earnedAt: "2026-09-14",
  },
  {
    id: "b-3",
    name: "Week Streak",
    description: "Stayed active seven days in a row.",
    icon: "flame",
    earnedAt: "2026-09-15",
  },
];

export const ACTIVITY: ActivityItem[] = [
  {
    id: "a-1",
    kind: "task_verified",
    text: "Verified “BFS & DFS refresher” for Rohan Das",
    occurredAt: "2026-09-16T18:30:00Z",
  },
  {
    id: "a-2",
    kind: "badge_earned",
    text: "Earned the Week Streak badge",
    occurredAt: "2026-09-15T08:00:00Z",
  },
  {
    id: "a-3",
    kind: "circle_joined",
    text: "Joined Portfolio Sprint",
    occurredAt: "2026-09-10T12:15:00Z",
  },
  {
    id: "a-4",
    kind: "task_completed",
    text: "Marked “Topological sort notes” as done — waiting for a peer",
    occurredAt: "2026-09-09T20:40:00Z",
  },
];
