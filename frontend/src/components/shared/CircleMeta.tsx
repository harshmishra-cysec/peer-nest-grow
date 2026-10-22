import { CalendarDays, Flag, Gauge, Users } from "lucide-react";
import type { Circle } from "@/types";
import { getCircleCapacity } from "@/services/circleService";
import { formatDate } from "@/lib/format";

/**
 * Goal, commitment, deadline and member count as plain icon + text rows.
 * Deliberately not pills — those are reserved for skill and task status.
 */
export function CircleMeta({ circle, className }: { circle: Circle; className?: string }) {
  const items = [
    { Icon: Flag, label: circle.goalType },
    { Icon: Gauge, label: circle.commitment },
    { Icon: CalendarDays, label: formatDate(circle.deadline) },
    { Icon: Users, label: `${circle.members.length}/${getCircleCapacity(circle)}` },
  ];
  return (
    <dl className={className ?? "flex flex-wrap gap-x-4 gap-y-2 text-sm text-muted-foreground"}>
      {items.map(({ Icon, label }) => (
        <div key={label} className="inline-flex items-center gap-1.5">
          <Icon className="size-4" />
          <dd>{label}</dd>
        </div>
      ))}
    </dl>
  );
}
