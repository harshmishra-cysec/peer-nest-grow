import { Link } from "@tanstack/react-router";
import { ArrowRight, CheckCheck, ExternalLink, ShieldAlert, Sparkles } from "lucide-react";
import { PreviewHero } from "../PreviewHero";
import { MemberAvatar } from "@/components/shared/MemberAvatar";
import { Button } from "@/components/ui/button";
import { ROUTES } from "@/constants";
import type { Circle, SubGroup, Task, User } from "@/types";

interface VerificationPreviewProps {
  circle?: Circle;
  subGroup?: SubGroup;
  tasks: Task[];
  currentUser: User;
}

/**
 * 6. Peer Verification Preview:
 * - The first task in the user's sub-group with status "Pending Peer Confirmation"
 *   and assigneeUserId different from the current user:
 *   title, assignee name, proof link (external link with rel="noopener noreferrer"), comment.
 * - Button "Review in workspace" -> ROUTES.subGroup.
 * - Do NOT call confirmTask from home.
 * - One line explaining that verified tasks count toward streaks and badges.
 * - Empty state: "Nothing is waiting for your review."
 */
export function VerificationPreview({
  circle,
  subGroup,
  tasks,
  currentUser,
}: VerificationPreviewProps) {
  // Find first task waiting for confirmation from a teammate
  const pendingTask = tasks.find(
    (t) => t.status === "Pending Peer Confirmation" && t.assigneeUserId !== currentUser.id,
  );

  const assignee =
    pendingTask && subGroup
      ? subGroup.members.find((m) => m.userId === pendingTask.assigneeUserId)
      : null;

  return (
    <div className="space-y-6">
      <PreviewHero
        label="ACCOUNTABILITY ENGINE"
        title="Peer Verification"
        description="Verify deliverables submitted by your sub-group teammates to uphold accountability."
        ctaText={circle ? "Review in workspace" : undefined}
        ctaLink={circle ? ROUTES.subGroup : undefined}
        ctaParams={circle ? { circleId: circle.id } : undefined}
      />

      {/* Explainer line */}
      <p className="text-sm text-muted-foreground flex items-center gap-1.5 bg-card border border-border/70 p-3 rounded-xl shadow-2xs">
        <Sparkles className="size-4.5 text-warning shrink-0" />
        <span>
          Verified tasks count toward team streaks, completion badges, and overall milestone
          progress.
        </span>
      </p>

      {/* Review Card or Empty State */}
      {pendingTask ? (
        <div className="surface p-6 space-y-4 border-l-4 border-l-warning">
          <div className="flex items-start justify-between gap-4">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <span className="rounded-full bg-warning-soft px-2 py-0.5 text-[10px] font-bold text-warning-foreground uppercase tracking-wider">
                  Needs Peer Review
                </span>
              </div>
              <h3 className="font-display text-lg font-bold text-foreground">
                {pendingTask.title}
              </h3>
              {pendingTask.description && (
                <p className="text-sm text-muted-foreground line-clamp-2">
                  {pendingTask.description}
                </p>
              )}
            </div>

            {circle && (
              <Button asChild size="sm" className="shrink-0 gap-1 text-sm">
                <Link to={ROUTES.subGroup} params={{ circleId: circle.id }}>
                  <span>Review in workspace</span>
                  <ArrowRight className="size-4.5" />
                </Link>
              </Button>
            )}
          </div>

          {/* Submitter & Proof Details */}
          <div className="rounded-xl border border-border/80 bg-muted/40 p-3 space-y-2.5 text-sm">
            <div className="flex items-center gap-2">
              <MemberAvatar name={assignee?.name ?? "Teammate"} size="sm" />
              <div>
                <p className="font-semibold text-foreground">{assignee?.name ?? "Teammate"}</p>
                <p className="text-[10px] text-muted-foreground">Submitted for verification</p>
              </div>
            </div>

            {/* Proof Link */}
            {pendingTask.proofUrl && (
              <div className="flex items-center gap-2 pt-1 border-t border-border/60">
                <span className="text-[11px] font-medium text-muted-foreground">
                  Proof artifact:
                </span>
                <a
                  href={pendingTask.proofUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 font-semibold text-primary hover:underline truncate max-w-sm"
                >
                  <span className="truncate">{pendingTask.proofUrl}</span>
                  <ExternalLink className="size-4 shrink-0" />
                </a>
              </div>
            )}

            {/* Submitter comment/notes */}
            {pendingTask.comment && (
              <div className="pt-1 border-t border-border/60">
                <span className="text-[11px] font-medium text-muted-foreground">
                  Note from assignee:
                </span>
                <p className="mt-0.5 text-sm italic text-foreground bg-card/60 p-2 rounded border border-border/50">
                  "{pendingTask.comment}"
                </p>
              </div>
            )}
          </div>
        </div>
      ) : (
        <div className="surface p-8 text-center space-y-2">
          <div className="mx-auto flex size-10 items-center justify-center rounded-full bg-success-soft text-success">
            <CheckCheck className="size-6" />
          </div>
          <p className="text-base font-semibold text-foreground">
            Nothing is waiting for your review.
          </p>
          <p className="text-sm text-muted-foreground max-w-sm mx-auto">
            Your sub-group has no pending peer confirmations right now. When teammates complete
            tasks with proof, they will show up here for you to verify.
          </p>
        </div>
      )}
    </div>
  );
}
