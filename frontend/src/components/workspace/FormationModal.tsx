import { useEffect, useState } from "react";
import { CheckCircle2, Crown, Loader2, Scale, Sparkles, Users, X } from "lucide-react";
import { MemberAvatar } from "@/components/shared/MemberAvatar";
import { SkillBadge } from "@/components/shared/SkillBadge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Progress } from "@/components/ui/progress";
import type { GroupingResult } from "@/services/groupingService";
import type { CircleMember } from "@/types";

interface FormationModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  circleName: string;
  members: CircleMember[];
  groupingResult: GroupingResult | null;
  onComplete?: () => void;
}

const STAGES = [
  {
    step: 1,
    title: "Analyzing Member Profiles",
    desc: "Reading active member enrollments and join timestamps...",
  },
  {
    step: 2,
    title: "Evaluating Skill Levels",
    desc: "Aggregating assessed skill tiers across all enrolled members...",
  },
  {
    step: 3,
    title: "Balancing Members",
    desc: "Distributing Strong, Average, and Developing tiers into 3-person groups...",
  },
  {
    step: 4,
    title: "Creating Sub-Groups",
    desc: "Designating top-tier group leaders and finalizing teams...",
  },
  {
    step: 5,
    title: "Groups Formed!",
    desc: "Balanced peer groups are ready for collaboration.",
  },
] as const;

const STAGE_DURATION_MS = 750;

export function FormationModal({
  open,
  onOpenChange,
  circleName,
  members,
  groupingResult,
  onComplete,
}: FormationModalProps) {
  const [stageIndex, setStageIndex] = useState(0);

  // Clean lifecycle: run through the stages sequentially with proper timer cleanup
  useEffect(() => {
    if (!open) {
      setStageIndex(0);
      return;
    }

    let current = 0;
    const timer = setInterval(() => {
      current += 1;
      if (current >= STAGES.length - 1) {
        setStageIndex(STAGES.length - 1);
        clearInterval(timer);
      } else {
        setStageIndex(current);
      }
    }, STAGE_DURATION_MS);

    return () => {
      clearInterval(timer);
    };
  }, [open]);

  const isFinished = stageIndex === STAGES.length - 1;
  const progressPercent = Math.round(((stageIndex + 1) / STAGES.length) * 100);

  const handleSkip = () => {
    setStageIndex(STAGES.length - 1);
  };

  const handleFinish = () => {
    onOpenChange(false);
    onComplete?.();
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-xl">
        <DialogHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="flex size-8 items-center justify-center rounded-lg bg-primary/10 text-primary">
                <Scale className="size-4" />
              </div>
              <DialogTitle className="text-lg font-semibold">Balanced Grouping Engine</DialogTitle>
            </div>
            {!isFinished && (
              <Button
                variant="ghost"
                size="sm"
                onClick={handleSkip}
                className="h-7 px-2 text-xs text-muted-foreground hover:text-foreground"
              >
                Skip animation
              </Button>
            )}
          </div>
          <DialogDescription className="text-xs">
            Forming balanced sub-groups for{" "}
            <span className="font-semibold text-foreground">{circleName}</span>
          </DialogDescription>
        </DialogHeader>

        {/* Progress bar and active stage banner */}
        <div className="mt-2 space-y-3">
          <div className="flex items-center justify-between text-xs font-medium">
            <span className="flex items-center gap-1.5 text-primary">
              {!isFinished ? (
                <Loader2 className="size-3.5 animate-spin" />
              ) : (
                <CheckCircle2 className="size-3.5 text-success" />
              )}
              Stage {stageIndex + 1} of {STAGES.length}: {STAGES[stageIndex].title}
            </span>
            <span className="text-muted-foreground">{progressPercent}%</span>
          </div>
          <Progress value={progressPercent} className="h-1.5" />
          <p className="text-xs text-muted-foreground">{STAGES[stageIndex].desc}</p>
        </div>

        {/* Real Data Feedback during computation stages */}
        <div className="mt-4 rounded-xl border border-border/70 bg-surface p-4 text-xs space-y-3">
          {/* Stage 1+: Real member roster detected */}
          {stageIndex >= 0 && (
            <div className="flex items-center justify-between border-b border-border/60 pb-2">
              <span className="flex items-center gap-1.5 text-muted-foreground">
                <Users className="size-3.5 text-primary" /> Real members analyzed:
              </span>
              <span className="font-semibold text-foreground">
                {members.length} verified learners
              </span>
            </div>
          )}

          {/* Stage 2+: Real skill tier distribution computed */}
          {stageIndex >= 1 && groupingResult && (
            <div className="space-y-1.5 border-b border-border/60 pb-2">
              <span className="font-medium text-muted-foreground">
                Assessed Skill Distribution:
              </span>
              <div className="flex flex-wrap gap-2 pt-1">
                <span className="inline-flex items-center gap-1 rounded-md bg-accent/30 px-2 py-0.5 font-medium text-accent-foreground">
                  Strong (Advanced): {groupingResult.tierCounts.strong}
                </span>
                <span className="inline-flex items-center gap-1 rounded-md bg-secondary/50 px-2 py-0.5 font-medium text-secondary-foreground">
                  Average (Intermediate): {groupingResult.tierCounts.average}
                </span>
                <span className="inline-flex items-center gap-1 rounded-md bg-muted px-2 py-0.5 font-medium text-muted-foreground">
                  Developing (Beginner): {groupingResult.tierCounts.weak}
                </span>
              </div>
            </div>
          )}

          {/* Stage 3+: Real balance rule evaluation */}
          {stageIndex >= 2 && groupingResult && (
            <div className="space-y-1 border-b border-border/60 pb-2">
              <span className="font-medium text-muted-foreground">Algorithm Partition:</span>
              <div className="flex items-center gap-2 pt-0.5">
                {groupingResult.isPerfectBalance ? (
                  <span className="inline-flex items-center gap-1 rounded-full bg-success/15 px-2 py-0.5 font-semibold text-success">
                    <CheckCircle2 className="size-3" /> Perfect 1:1:1 Balance Achieved
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1 rounded-full bg-warning/15 px-2 py-0.5 font-semibold text-warning">
                    Variance-Minimizing Fallback
                  </span>
                )}
              </div>
              <p className="pt-1 text-[11px] text-muted-foreground">
                {groupingResult.balanceSummary}
              </p>
            </div>
          )}

          {/* Stage 4 & 5: Formed Sub-groups with dynamic leaders */}
          {stageIndex >= 3 && groupingResult && (
            <div className="space-y-2 pt-1">
              <div className="flex items-center justify-between">
                <span className="font-semibold text-foreground">Generated Sub-Groups:</span>
                <span className="text-[11px] text-muted-foreground">
                  {groupingResult.subGroups.length} teams of 3
                </span>
              </div>

              <div className="grid gap-2 sm:grid-cols-3">
                {groupingResult.subGroups.map((group) => {
                  const leader = group.members.find((m) => m.userId === group.leaderUserId);
                  return (
                    <div
                      key={group.id}
                      className="rounded-lg border border-border bg-card p-2.5 shadow-2xs space-y-1.5"
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-semibold text-foreground">{group.name}</span>
                      </div>
                      <p className="flex items-center gap-1 text-[10px] text-muted-foreground">
                        <Crown className="size-3 text-warning shrink-0" />
                        <span className="truncate font-medium text-foreground">
                          {leader?.name ?? "Assigned"}
                        </span>
                      </p>
                      <ul className="space-y-1 pt-1 border-t border-border/50">
                        {group.members.map((m) => (
                          <li
                            key={m.userId}
                            className="flex items-center justify-between gap-1 text-[11px]"
                          >
                            <span className="truncate">{m.name}</span>
                            <span className="text-[10px] text-muted-foreground">
                              {m.skillLevel[0]}
                            </span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>

        {/* Action footer */}
        <div className="mt-4 flex justify-end gap-2">
          {isFinished ? (
            <Button onClick={handleFinish} className="gap-1.5">
              <Sparkles className="size-4" /> View Sub-Groups & Workspace
            </Button>
          ) : (
            <Button variant="outline" size="sm" onClick={() => onOpenChange(false)}>
              Close
            </Button>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
