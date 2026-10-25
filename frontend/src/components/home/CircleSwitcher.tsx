import { cn } from "@/lib/utils";
import { CIRCLE_CAPACITY } from "@/constants";
import type { Circle } from "@/types";

interface CircleSwitcherProps {
  circles: Circle[];
  activeId: string | undefined;
  onSelect: (circleId: string) => void;
  /** "circle" shows member progress, "subgroup" shows whether the sub-group is formed. */
  mode: "circle" | "subgroup";
}

/**
 * Row of small boxes, one per joined circle. Clicking a box makes it the active circle,
 * and the panel below shows that circle's dashboard / sub-group.
 */
export function CircleSwitcher({ circles, activeId, onSelect, mode }: CircleSwitcherProps) {
  if (circles.length < 2) return null;

  return (
    <section aria-label={mode === "circle" ? "Your circles" : "Your sub-groups"}>
      <div className="mb-3 flex items-center justify-between">
        <h2 className="text-sm font-bold uppercase tracking-wider text-slate-500">
          {mode === "circle" ? "Your circles" : "Your sub-groups"}
          <span className="ml-2 rounded-full bg-sky-100 px-2 py-0.5 text-xs font-semibold text-primary">
            {circles.length}
          </span>
        </h2>
        <p className="hidden text-xs text-slate-400 sm:block">Select one to view its details</p>
      </div>

      <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-none">
        {circles.map((circle) => {
          const active = circle.id === activeId;
          const capacity = circle.capacity ?? CIRCLE_CAPACITY;
          const count = circle.members.length;
          const percent = Math.min(100, Math.round((count / capacity) * 100));
          const grouped = circle.status === "Grouped";
          const status =
            mode === "subgroup"
              ? grouped
                ? "Sub-group formed"
                : "Awaiting members"
              : `${count}/${capacity} members`;

          return (
            <button
              key={circle.id}
              type="button"
              aria-pressed={active}
              onClick={() => onSelect(circle.id)}
              className={cn(
                "group relative w-56 shrink-0 overflow-hidden rounded-2xl border p-4 text-left transition-all duration-200",
                "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary active:scale-[0.98]",
                active
                  ? "border-transparent bg-gradient-to-br from-primary to-blue-600 text-white shadow-lg shadow-primary/25"
                  : "border-sky-100 bg-white/80 text-slate-700 hover:-translate-y-0.5 hover:border-primary/40 hover:shadow-md",
              )}
            >
              <span
                aria-hidden="true"
                className="pointer-events-none absolute inset-0 -translate-x-full skew-x-12 bg-gradient-to-r from-transparent via-white/30 to-transparent transition-transform duration-700 group-hover:translate-x-full"
              />
              <div className="relative flex items-center gap-3">
                <span
                  className={cn(
                    "grid size-10 shrink-0 place-items-center rounded-xl text-base font-bold",
                    active ? "bg-white/20 text-white" : "bg-sky-100 text-primary",
                  )}
                >
                  {circle.topic.charAt(0)}
                </span>
                <div className="min-w-0">
                  <p className="truncate text-sm font-semibold">{circle.name}</p>
                  <p className={cn("truncate text-xs", active ? "text-white/80" : "text-slate-500")}>
                    {circle.topic}
                  </p>
                </div>
              </div>
              <div className="relative mt-3">
                <div className="flex items-center justify-between text-xs">
                  <span className={active ? "text-white/90" : "text-slate-500"}>{status}</span>
                  <span
                    className={cn(
                      "rounded-full px-2 py-0.5 font-semibold",
                      active
                        ? "bg-white/20 text-white"
                        : grouped
                          ? "bg-emerald-50 text-emerald-700"
                          : "bg-sky-100 text-primary",
                    )}
                  >
                    {grouped ? "Grouped" : circle.status}
                  </span>
                </div>
                <div className={cn("mt-2 h-1.5 overflow-hidden rounded-full", active ? "bg-white/25" : "bg-sky-100")}>
                  <div
                    className={cn("h-full rounded-full", active ? "bg-white" : "bg-primary")}
                    style={{ width: `${percent}%` }}
                  />
                </div>
              </div>
            </button>
          );
        })}
      </div>
    </section>
  );
}
