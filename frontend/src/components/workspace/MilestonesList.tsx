import { useState } from "react";
import { Calendar, CheckCircle2, Clock, CircleDashed, Flag, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { formatDate } from "@/lib/format";
import type { Milestone, MilestoneStatus } from "@/types";

interface MilestonesListProps {
  milestones: Milestone[];
  onUpdateStatus?: (milestoneId: string, status: MilestoneStatus) => Promise<void>;
  onAddMilestone?: (input: {
    title: string;
    dueDate: string;
    description?: string;
  }) => Promise<void>;
}

/**
 * Status badge styling conforming to SkillNest design system tokens.
 */
function StatusBadge({ status }: { status: MilestoneStatus }) {
  switch (status) {
    case "Completed":
      return (
        <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 px-2.5 py-0.5 text-xs font-semibold text-emerald-700 border border-emerald-200">
          <CheckCircle2 className="size-3.5 text-emerald-600" />
          Completed
        </span>
      );
    case "In Progress":
      return (
        <span className="inline-flex items-center gap-1.5 rounded-full bg-blue-50 px-2.5 py-0.5 text-xs font-semibold text-blue-700 border border-blue-200">
          <Clock className="size-3.5 text-blue-600" />
          In Progress
        </span>
      );
    case "Not Started":
    default:
      return (
        <span className="inline-flex items-center gap-1.5 rounded-full bg-slate-100 px-2.5 py-0.5 text-xs font-semibold text-slate-600 border border-slate-200">
          <CircleDashed className="size-3.5 text-slate-500" />
          Not Started
        </span>
      );
  }
}

export function MilestonesList({
  milestones,
  onUpdateStatus,
  onAddMilestone,
}: MilestonesListProps) {
  const [openAddDialog, setOpenAddDialog] = useState(false);
  const [title, setTitle] = useState("");
  const [dueDate, setDueDate] = useState("");
  const [description, setDescription] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const completedCount = milestones.filter((m) => m.status === "Completed").length;
  const progressPercent =
    milestones.length > 0 ? Math.round((completedCount / milestones.length) * 100) : 0;

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !dueDate || !onAddMilestone) return;

    setSubmitting(true);
    try {
      await onAddMilestone({
        title: title.trim(),
        dueDate,
        description: description.trim() || undefined,
      });
      setTitle("");
      setDueDate("");
      setDescription("");
      setOpenAddDialog(false);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Top summary card */}
      <div className="surface flex flex-col gap-4 p-5 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="flex items-center gap-2">
            <div className="flex size-8 items-center justify-center rounded-lg bg-primary/10 text-primary">
              <Flag className="size-4" />
            </div>
            <h3 className="font-semibold text-foreground">Cohort Journey Roadmap</h3>
          </div>
          <p className="mt-1 text-xs text-muted-foreground">
            Broader checkpoints for your sub-group's overall progress toward circle completion.
          </p>
        </div>

        <div className="flex items-center gap-4">
          <div className="text-right">
            <span className="text-xs font-medium text-muted-foreground">Progress</span>
            <p className="font-display text-lg font-bold text-foreground">
              {completedCount} / {milestones.length}{" "}
              <span className="text-xs font-normal text-muted-foreground">
                ({progressPercent}%)
              </span>
            </p>
          </div>

          {onAddMilestone && (
            <Dialog open={openAddDialog} onOpenChange={setOpenAddDialog}>
              <DialogTrigger asChild>
                <Button size="sm" className="gap-1.5">
                  <Plus className="size-3.5" />
                  <span>Add Milestone</span>
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-md">
                <form onSubmit={handleCreate}>
                  <DialogHeader>
                    <DialogTitle>Add Journey Milestone</DialogTitle>
                    <DialogDescription>
                      Create a key checkpoint for all members of this sub-group.
                    </DialogDescription>
                  </DialogHeader>

                  <div className="mt-4 space-y-4">
                    <div className="space-y-1.5">
                      <Label htmlFor="milestone-title" className="text-xs font-semibold">
                        Milestone Title
                      </Label>
                      <Input
                        id="milestone-title"
                        placeholder="e.g. Complete System Design Mock Interview"
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                        required
                      />
                    </div>

                    <div className="space-y-1.5">
                      <Label htmlFor="milestone-date" className="text-xs font-semibold">
                        Target Due Date
                      </Label>
                      <Input
                        id="milestone-date"
                        type="date"
                        value={dueDate}
                        onChange={(e) => setDueDate(e.target.value)}
                        required
                      />
                    </div>

                    <div className="space-y-1.5">
                      <Label htmlFor="milestone-desc" className="text-xs font-semibold">
                        Description (optional)
                      </Label>
                      <Input
                        id="milestone-desc"
                        placeholder="Brief summary of expectations"
                        value={description}
                        onChange={(e) => setDescription(e.target.value)}
                      />
                    </div>
                  </div>

                  <DialogFooter className="mt-6">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => setOpenAddDialog(false)}
                      disabled={submitting}
                    >
                      Cancel
                    </Button>
                    <Button type="submit" disabled={submitting || !title.trim() || !dueDate}>
                      {submitting ? "Saving..." : "Create Milestone"}
                    </Button>
                  </DialogFooter>
                </form>
              </DialogContent>
            </Dialog>
          )}
        </div>
      </div>

      {/* Milestones Vertical Timeline / List */}
      {milestones.length === 0 ? (
        <div className="surface p-8 text-center">
          <Flag className="mx-auto size-8 text-muted-foreground/50" />
          <p className="mt-2 text-sm text-muted-foreground">No milestones set yet.</p>
          <p className="text-xs text-muted-foreground">
            Set major checkpoints to keep everyone aligned on the finish line.
          </p>
        </div>
      ) : (
        <div className="relative pl-6 before:absolute before:left-2.5 before:top-3 before:bottom-3 before:w-0.5 before:bg-border">
          <div className="space-y-4">
            {milestones.map((ms, index) => {
              const isCompleted = ms.status === "Completed";
              const isInProgress = ms.status === "In Progress";

              return (
                <div key={ms.id} className="relative">
                  {/* Timeline dot */}
                  <div
                    className={`absolute -left-6 top-4 flex size-5 -translate-x-1/2 items-center justify-center rounded-full border-2 bg-background ${
                      isCompleted
                        ? "border-emerald-500 text-emerald-600"
                        : isInProgress
                          ? "border-blue-600 text-blue-600 animate-pulse"
                          : "border-slate-300 text-slate-400"
                    }`}
                  >
                    <div
                      className={`size-2 rounded-full ${
                        isCompleted
                          ? "bg-emerald-500"
                          : isInProgress
                            ? "bg-blue-600"
                            : "bg-transparent"
                      }`}
                    />
                  </div>

                  {/* Milestone Card */}
                  <div className="surface p-4 sm:p-5 transition-all hover:border-primary/40">
                    <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                      <div className="min-w-0 flex-1 space-y-1">
                        <div className="flex flex-wrap items-center gap-2">
                          <span className="text-xs font-bold text-muted-foreground">
                            Phase {index + 1}
                          </span>
                          <StatusBadge status={ms.status} />
                        </div>
                        <h4 className="font-semibold text-foreground sm:text-base">{ms.title}</h4>
                        {ms.description && (
                          <p className="text-xs text-muted-foreground leading-relaxed">
                            {ms.description}
                          </p>
                        )}
                        <div className="flex items-center gap-1.5 pt-1 text-xs text-muted-foreground">
                          <Calendar className="size-3.5 text-muted-foreground" />
                          <span>Target: {formatDate(ms.dueDate)}</span>
                        </div>
                      </div>

                      {/* Status toggle action */}
                      {onUpdateStatus && (
                        <div className="flex shrink-0 items-center gap-1.5 pt-1 sm:pt-0">
                          <select
                            value={ms.status}
                            onChange={(e) =>
                              onUpdateStatus(ms.id, e.target.value as MilestoneStatus)
                            }
                            className="h-8 rounded-lg border border-border bg-background px-2.5 text-xs font-medium text-foreground shadow-2xs focus:outline-none focus:ring-1 focus:ring-primary cursor-pointer"
                          >
                            <option value="Not Started">Not Started</option>
                            <option value="In Progress">In Progress</option>
                            <option value="Completed">Completed</option>
                          </select>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
