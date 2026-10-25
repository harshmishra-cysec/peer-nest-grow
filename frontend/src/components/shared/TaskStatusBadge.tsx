import { CheckCircle2, Circle, Clock } from "lucide-react";
import type { TaskStatus } from "@/types";
import { cn } from "@/lib/utils";

/** Green = verified, amber = waiting on a peer, neutral = still working. */
const STATUS_STYLES: Record<TaskStatus, { className: string; Icon: typeof Circle }> = {
  Verified: { className: "bg-success-soft text-success", Icon: CheckCircle2 },
  "Pending Peer Confirmation": {
    className: "bg-warning-soft text-warning-foreground",
    Icon: Clock,
  },
  "In Progress": { className: "bg-muted text-muted-foreground", Icon: Circle },
  "Changes Requested": { className: "bg-warning-soft text-warning-foreground", Icon: Clock },
};

export function TaskStatusBadge({ status }: { status: TaskStatus }) {
  const { className, Icon } = STATUS_STYLES[status];
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-semibold",
        className,
      )}
    >
      <Icon className="size-3.5" />
      {status}
    </span>
  );
}
