/**
 * Core data shapes for SkillNest.
 *
 * These mirror the entities the Spring Boot backend will expose. Keep them
 * in sync with the API contract when the real backend is connected.
 */

export type SkillLevel = "Beginner" | "Intermediate" | "Advanced";
export type GoalType = "Learn" | "Build" | "Compete";
export type CommitmentLevel = "Casual" | "Serious";

/** Stage 1 (matching) circle state, then Stage 2 (grouping) once full. */
export type CircleStatus = "Open" | "Full" | "Grouped";

export type TaskStatus = "In Progress" | "Pending Peer Confirmation" | "Verified";

export interface User {
  id: string;
  name: string;
  email: string;
  bio: string;
  /** Skill level the user self-assessed for their primary topic. */
  skillBaseline: SkillLevel;
  currentStreakDays: number;
  /** True when the user joined circles without completing anything. */
  isRestrictedFromJoining: boolean;
}

/** A user as seen inside a circle, carrying the skill they declared for that topic. */
export interface CircleMember {
  userId: string;
  name: string;
  skillLevel: SkillLevel;
  joinedAt: string; // ISO date
}

export interface Circle {
  id: string;
  name: string;
  topic: string;
  goalType: GoalType;
  commitment: CommitmentLevel;
  deadline: string; // ISO date
  description: string;
  members: CircleMember[];
  status: CircleStatus;
}

export interface SubGroup {
  id: string;
  circleId: string;
  name: string;
  /** The Advanced member, auto-assigned by the grouping system. */
  leaderUserId: string;
  members: CircleMember[];
}

export interface ProofAttachment {
  id: string;
  name: string;
  url: string; // Data URL for uploaded files/photos or external link
  type: "image" | "file";
  size?: number; // bytes
}

export type ChatAttachment = ProofAttachment;

export interface Task {
  id: string;
  subGroupId: string;
  title: string;
  description: string;
  assigneeUserId: string;
  dueDate: string; // ISO date
  status: TaskStatus;
  /** Optional proof link (e.g., GitHub repo URL, doc link, or screenshot URL). */
  proofUrl?: string;
  /** Optional uploaded photos and files providing proof of work. */
  proofAttachments?: ProofAttachment[];
  /** Optional short note/comment from peer verification or review. */
  comment?: string;
  /** User ids of peers who confirmed completion. */
  verifiedByUserIds: string[];
}

export interface Message {
  id: string;
  subGroupId: string;
  senderUserId: string;
  senderName: string;
  body: string;
  sentAt: string; // ISO datetime
  /** Optional uploaded photos and files attached to the message. */
  attachments?: ChatAttachment[];
}

export interface Badge {
  id: string;
  name: string;
  description: string;
  /** Lucide icon name rendered by the badge showcase. */
  icon: "trophy" | "flame" | "users" | "check-circle" | "sparkles";
  earnedAt: string; // ISO date
}

export type ActivityKind = "task_verified" | "circle_joined" | "badge_earned" | "task_completed";

export interface ActivityItem {
  id: string;
  kind: ActivityKind;
  text: string;
  occurredAt: string; // ISO datetime
}

/** Input for both the "Make a Circle" and "Join preferences" forms. */
export interface CirclePreferences {
  topic: string;
  goalType: GoalType;
  commitment: CommitmentLevel;
  deadline: string;
}

export interface JoinPreferences extends CirclePreferences {
  skillLevel: SkillLevel;
}
