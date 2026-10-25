import { useState } from "react";
import {
  AlertCircle,
  CalendarDays,
  Check,
  CheckCircle2,
  Download,
  ExternalLink,
  FileText,
  ImageIcon,
  Link2,
  MessageSquare,
  MessageSquarePlus,
  Paperclip,
  UserRound,
} from "lucide-react";
import { TaskStatusBadge } from "@/components/shared/TaskStatusBadge";
import { Button } from "@/components/ui/button";
import { MarkDoneDialog } from "@/components/workspace/MarkDoneDialog";
import { ReviewTaskDialog } from "@/components/workspace/ReviewTaskDialog";
import { formatDate } from "@/lib/format";
import type { CircleMember, ProofAttachment, Task } from "@/types";

interface TaskListProps {
  tasks: Task[];
  members: CircleMember[];
  currentUserId: string;
  onMarkDone: (
    task: Task,
    proofUrl?: string,
    proofAttachments?: ProofAttachment[],
  ) => Promise<void>;
  onConfirm: (task: Task, comment?: string) => Promise<void>;
  onCommentOnly: (task: Task, comment: string) => Promise<void>;
}

function formatBytes(bytes?: number): string {
  if (!bytes) return "";
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

/**
 * Checks if a task due date is today or already passed.
 * Used for deadline urgency styling when a task is not yet "Verified".
 */
function isUrgentOrOverdue(dueDateIso: string): { isUrgent: boolean; isPast: boolean } {
  const due = new Date(dueDateIso);
  const now = new Date();

  // Reset to midnight for local day comparison
  const dueMidnight = new Date(due.getFullYear(), due.getMonth(), due.getDate()).getTime();
  const nowMidnight = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime();

  if (dueMidnight < nowMidnight) {
    return { isUrgent: true, isPast: true };
  }
  if (dueMidnight === nowMidnight) {
    return { isUrgent: true, isPast: false };
  }
  return { isUrgent: false, isPast: false };
}

export function TaskList({
  tasks,
  members,
  currentUserId,
  onMarkDone,
  onConfirm,
  onCommentOnly,
}: TaskListProps) {
  const [markDoneTask, setMarkDoneTask] = useState<Task | null>(null);
  const [reviewTask, setReviewTask] = useState<Task | null>(null);
  const [reviewMode, setReviewMode] = useState<"confirm" | "comment">("confirm");
  const [previewImage, setPreviewImage] = useState<string | null>(null);

  const nameFor = (userId: string) => members.find((m) => m.userId === userId)?.name ?? "Unknown";

  if (tasks.length === 0) {
    return (
      <div className="surface p-8 text-center">
        <p className="text-sm text-muted-foreground">No tasks yet for this sub-group.</p>
        <p className="mt-1 text-xs text-muted-foreground">
          Use the "Add task" button above to create and assign the first milestone.
        </p>
      </div>
    );
  }

  return (
    <>
      <ul className="surface divide-y">
        {tasks.map((task) => {
          const isOwner = task.assigneeUserId === currentUserId;
          // Self-report: only the assignee can mark "I'm done".
          const canMarkDone =
            (task.status === "In Progress" || task.status === "Changes Requested") && isOwner;
          // Peer confirmation: a peer other than the assignee must verify the work.
          const canConfirm = task.status === "Pending Peer Confirmation" && !isOwner;
          const isPendingOwner = task.status === "Pending Peer Confirmation" && isOwner;

          // Deadline urgency: amber/red highlighting if today or past due and not verified
          const { isUrgent, isPast } = isUrgentOrOverdue(task.dueDate);
          const showUrgency = isUrgent && task.status !== "Verified";

          const hasProofUrl = Boolean(task.proofUrl);
          const hasAttachments = Boolean(task.proofAttachments && task.proofAttachments.length > 0);
          const hasAnyProof = hasProofUrl || hasAttachments;

          return (
            <li
              key={task.id}
              className="flex flex-col gap-3 p-4 sm:flex-row sm:items-start sm:justify-between"
            >
              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-2">
                  <h3 className="font-semibold text-foreground">{task.title}</h3>
                  <TaskStatusBadge status={task.status} />
                </div>
                {task.description && (
                  <p className="mt-1 text-sm text-muted-foreground">{task.description}</p>
                )}

                {/* Proof of Work Attachment section (Photos, Files, and Link) */}
                {task.status !== "In Progress" && (
                  <div className="mt-3 space-y-2">
                    {hasAnyProof ? (
                      <div className="flex flex-col gap-1.5 rounded-lg border border-border/60 bg-surface-muted/30 p-2.5">
                        <span className="flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
                          <Paperclip className="size-3 text-primary" /> Submitted proof
                        </span>

                        <div className="flex flex-wrap items-center gap-2 pt-0.5">
                          {/* Proof URL Link */}
                          {hasProofUrl && (
                            <a
                              href={task.proofUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="inline-flex items-center gap-1.5 rounded-md border border-primary/20 bg-primary/5 px-2.5 py-1 text-xs font-medium text-primary transition-colors hover:bg-primary/10"
                            >
                              <Link2 className="size-3" />
                              <span>View project link</span>
                              <ExternalLink className="size-3 opacity-70" />
                            </a>
                          )}

                          {/* Uploaded Photos & Files Pills */}
                          {hasAttachments &&
                            task.proofAttachments!.map((att) => (
                              <div
                                key={att.id}
                                className="inline-flex items-center gap-1.5 rounded-md border border-border bg-surface px-2 py-1 text-xs text-foreground shadow-2xs"
                              >
                                {att.type === "image" ? (
                                  <button
                                    type="button"
                                    onClick={() => setPreviewImage(att.url)}
                                    className="flex items-center gap-1.5 text-primary hover:underline cursor-pointer"
                                    title="Click to zoom photo"
                                  >
                                    <ImageIcon className="size-3.5 shrink-0 text-primary" />
                                    <span className="max-w-[130px] truncate">{att.name}</span>
                                  </button>
                                ) : (
                                  <a
                                    href={att.url}
                                    download={att.name}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="flex items-center gap-1.5 text-primary hover:underline cursor-pointer"
                                    title="Download file"
                                  >
                                    <FileText className="size-3.5 shrink-0 text-primary" />
                                    <span className="max-w-[130px] truncate">{att.name}</span>
                                    <Download className="size-3 opacity-70" />
                                  </a>
                                )}
                                {att.size && (
                                  <span className="text-[10px] text-muted-foreground">
                                    ({formatBytes(att.size)})
                                  </span>
                                )}
                              </div>
                            ))}
                        </div>
                      </div>
                    ) : (
                      <span className="inline-flex items-center gap-1 text-xs text-muted-foreground italic">
                        <Link2 className="size-3 opacity-60" />
                        No proof attached
                      </span>
                    )}
                  </div>
                )}

                {/* Peer Review Comment / Feedback */}
                {task.comment && (
                  <div className="mt-2.5 flex items-start gap-2 rounded-md bg-surface-muted/60 p-2.5 text-xs text-foreground">
                    <MessageSquare className="mt-0.5 size-3.5 shrink-0 text-primary" />
                    <div>
                      <span className="font-semibold text-muted-foreground">Peer note: </span>
                      <span>{task.comment}</span>
                    </div>
                  </div>
                )}

                <p className="mt-2.5 flex flex-wrap gap-x-4 gap-y-1 text-xs text-muted-foreground">
                  <span className="inline-flex items-center gap-1 font-medium">
                    <UserRound className="size-3.5" />
                    Assignee: {nameFor(task.assigneeUserId)}
                    {isOwner && " (you)"}
                  </span>

                  <span
                    className={`inline-flex items-center gap-1 font-medium ${
                      showUrgency
                        ? isPast
                          ? "text-destructive font-semibold"
                          : "text-warning font-semibold"
                        : "text-muted-foreground"
                    }`}
                  >
                    {showUrgency ? (
                      <AlertCircle className="size-3.5" />
                    ) : (
                      <CalendarDays className="size-3.5" />
                    )}
                    Due {formatDate(task.dueDate)}
                    {showUrgency && (
                      <span className="ml-0.5 rounded px-1 text-[10px] uppercase tracking-wide bg-current/10">
                        {isPast ? "Overdue" : "Due today"}
                      </span>
                    )}
                  </span>
                </p>
              </div>

              <div className="flex shrink-0 items-center gap-2">
                {canMarkDone && (
                  <Button
                    variant="outline"
                    size="sm"
                    className="shrink-0"
                    onClick={() => setMarkDoneTask(task)}
                  >
                    <Check className="mr-1.5 size-3.5" /> Mark as Done
                  </Button>
                )}

                {canConfirm && (
                  <div className="flex items-center gap-1.5">
                    <Button
                      size="sm"
                      className="shrink-0"
                      onClick={() => {
                        setReviewMode("confirm");
                        setReviewTask(task);
                      }}
                    >
                      <Check className="mr-1.5 size-3.5" /> Confirm
                    </Button>
                    <Button
                      size="sm"
                      variant="ghost"
                      className="h-8 px-2 text-xs text-muted-foreground hover:text-foreground"
                      title="Add a review note without confirming yet"
                      onClick={() => {
                        setReviewMode("comment");
                        setReviewTask(task);
                      }}
                    >
                      <MessageSquarePlus className="size-3.5" />
                    </Button>
                  </div>
                )}

                {isPendingOwner && (
                  <Button
                    size="sm"
                    variant="outline"
                    disabled
                    className="shrink-0 cursor-not-allowed opacity-60 text-xs"
                    title="Assignee cannot confirm their own task. A peer must verify it."
                  >
                    Waiting for Peer
                  </Button>
                )}

                {task.status === "Verified" && (
                  <span className="inline-flex items-center gap-1 text-xs font-semibold text-success">
                    <CheckCircle2 className="size-3.5" /> Verified
                  </span>
                )}
              </div>
            </li>
          );
        })}
      </ul>

      {/* Mark Done Dialog (with optional Proof Link and File/Photo Uploads) */}
      <MarkDoneDialog
        task={markDoneTask}
        open={Boolean(markDoneTask)}
        onOpenChange={(open) => !open && setMarkDoneTask(null)}
        onSubmit={async (task, proofUrl, proofAttachments) => {
          await onMarkDone(task, proofUrl, proofAttachments);
        }}
      />

      {/* Peer Review Dialog (inspecting proof, files, photos + optional comment) */}
      <ReviewTaskDialog
        task={reviewTask}
        mode={reviewMode}
        open={Boolean(reviewTask)}
        onOpenChange={(open) => !open && setReviewTask(null)}
        onConfirm={async (task, comment) => {
          await onConfirm(task, comment);
        }}
        onCommentOnly={async (task, comment) => {
          await onCommentOnly(task, comment);
        }}
      />

      {/* Full Photo Viewer Modal */}
      {previewImage && (
        <div
          className="fixed inset-0 z-60 flex items-center justify-center bg-black/80 p-4"
          onClick={() => setPreviewImage(null)}
        >
          <div className="relative max-h-[85vh] max-w-[90vw] overflow-hidden rounded-lg bg-background p-2">
            <img
              src={previewImage}
              alt="Proof photo full preview"
              className="max-h-[80vh] w-auto rounded object-contain"
              referrerPolicy="no-referrer"
            />
            <p className="mt-2 text-center text-xs text-muted-foreground">
              Click anywhere to close preview
            </p>
          </div>
        </div>
      )}
    </>
  );
}
