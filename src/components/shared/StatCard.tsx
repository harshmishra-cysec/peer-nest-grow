import type { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

interface StatCardProps {
  Icon: LucideIcon;
  label: string;
  value: string | number;
  /** Streak uses the amber accent; everything else stays neutral. */
  tone?: "neutral" | "warning";
}

export function StatCard({ Icon, label, value, tone = "neutral" }: StatCardProps) {
  return (
    <div className="surface p-4">
      <div className="flex items-center gap-2 text-sm text-muted-foreground">
        <Icon className={cn("size-4", tone === "warning" && "text-warning")} />
        {label}
      </div>
      <p className="mt-2 font-display text-3xl font-bold">{value}</p>
    </div>
  );
}
