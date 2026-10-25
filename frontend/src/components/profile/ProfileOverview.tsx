import { Link } from "@tanstack/react-router";
import { Award, CheckCircle2, Flame, Users, type LucideIcon } from "lucide-react";
import { BadgeShelf } from "./BadgeShelf";
import { StreakCalendar } from "./StreakCalendar";
import { CIRCLE_CAPACITY, ROUTES } from "@/constants";
import { formatDate, formatRelative } from "@/lib/format";
import { cn } from "@/lib/utils";
import type { ActivityItem, Badge, Circle, User } from "@/types";

interface ProfileOverviewProps {
  user: User;
  circles: Circle[];
  badges: Badge[];
  activity: ActivityItem[];
  completedTasks: number;
  /** Circle ids that have a formed sub-group (so a Workspace link makes sense). */
  workspaceCircleIds: Set<string>;
}

function StatTile({
  Icon,
  label,
  value,
  tint,
}: {
  Icon: LucideIcon;
  label: string;
  value: string | number;
  tint: string;
}) {
  return (
    <div className="surface p-5 transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md">
      <div className="flex items-center justify-between">
        <p className="text-sm font-medium text-muted-foreground">{label}</p>
        <span className={cn("grid size-10 place-items-center rounded-xl", tint)}>
          <Icon className="size-5" />
        </span>
      </div>
      <p className="mt-3 font-display text-4xl font-bold tracking-tight">{value}</p>
    </div>
  );
}

/**
 * Shared "progress" content used by the /profile page and the Stats & Progress panel:
 * stat tiles, active circles, badges, streak calendar and an activity timeline.
 */
export function ProfileOverview({
  user,
  circles,
  badges,
  activity,
  completedTasks,
  workspaceCircleIds,
}: ProfileOverviewProps) {
  return (
    <div className="space-y-8">
      <section className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <StatTile Icon={Users} label="Joined circles" value={circles.length} tint="bg-sky-100 text-primary" />
        <StatTile Icon={CheckCircle2} label="Completed tasks" value={completedTasks} tint="bg-emerald-100 text-emerald-600" />
        <StatTile Icon={Award} label="Badges earned" value={badges.length} tint="bg-indigo-100 text-indigo-600" />
        <StatTile Icon={Flame} label="Current streak" value={`${user.currentStreakDays}d`} tint="bg-amber-100 text-amber-600" />
      </section>

      <div className="grid gap-8 xl:grid-cols-[minmax(0,3fr)_minmax(0,2fr)]">
        <div className="space-y-8">
          <section>
            <h2 className="text-lg font-bold">Active circles</h2>
            <ul className="mt-4 space-y-3">
              {circles.map((circle) => {
                const capacity = circle.capacity ?? CIRCLE_CAPACITY;
                const percent = Math.min(100, Math.round((circle.members.length / capacity) * 100));
                const grouped = circle.status === "Grouped";
                return (
                  <li
                    key={circle.id}
                    className="surface flex flex-col gap-4 p-5 transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md sm:flex-row sm:items-center"
                  >
                    <span className="grid size-12 shrink-0 place-items-center rounded-xl bg-gradient-to-br from-primary to-blue-500 text-lg font-bold text-white shadow-sm">
                      {circle.topic.charAt(0)}
                    </span>
                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <p className="truncate font-semibold">{circle.name}</p>
                        <span
                          className={cn(
                            "rounded-full px-2.5 py-0.5 text-xs font-semibold",
                            grouped ? "bg-emerald-50 text-emerald-700" : "bg-sky-100 text-primary",
                          )}
                        >
                          {grouped ? "Grouped" : circle.status}
                        </span>
                      </div>
                      <p className="mt-0.5 text-sm text-muted-foreground">
                        {circle.topic} · {circle.members.length}/{capacity} members · due{" "}
                        {formatDate(circle.deadline)}
                      </p>
                      <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-sky-100">
                        <div className="h-full rounded-full bg-primary" style={{ width: `${percent}%` }} />
                      </div>
                    </div>
                    <div className="flex gap-2 text-sm font-semibold">
                      <Link
                        to={ROUTES.circle}
                        params={{ circleId: circle.id }}
                        className="rounded-full border border-sky-200 px-4 py-1.5 text-primary transition-colors hover:bg-sky-50 active:scale-95"
                      >
                        Circle
                      </Link>
                      {workspaceCircleIds.has(circle.id) && (
                        <Link
                          to={ROUTES.subGroup}
                          params={{ circleId: circle.id }}
                          className="rounded-full bg-primary px-4 py-1.5 text-white shadow-xs transition-colors hover:bg-primary/90 active:scale-95"
                        >
                          Workspace
                        </Link>
                      )}
                    </div>
                  </li>
                );
              })}
            </ul>
          </section>

          <BadgeShelf badges={badges} />
        </div>

        <div className="space-y-8">
          <StreakCalendar streakDays={user.currentStreakDays} />

          <section>
            <h2 className="text-lg font-bold">Recent activity</h2>
            <ol className="surface mt-4 p-5">
              {activity.map((item, index) => (
                <li key={item.id} className="relative pb-5 pl-7 last:pb-0">
                  {index < activity.length - 1 && (
                    <span aria-hidden="true" className="absolute left-[7px] top-4 h-full w-px bg-sky-200" />
                  )}
                  <span
                    aria-hidden="true"
                    className="absolute left-0 top-1.5 size-4 rounded-full border-4 border-sky-100 bg-primary"
                  />
                  <p className="text-sm font-medium">{item.text}</p>
                  <p className="mt-0.5 text-xs text-muted-foreground">{formatRelative(item.occurredAt)}</p>
                </li>
              ))}
            </ol>
          </section>
        </div>
      </div>
    </div>
  );
}
