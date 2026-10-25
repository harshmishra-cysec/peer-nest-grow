import { CheckCircle2, Flame, Plus, Sparkles, Trophy, Users, type LucideIcon } from "lucide-react";
import { formatDate } from "@/lib/format";
import type { Badge } from "@/types";

const BADGE_ICONS: Record<Badge["icon"], LucideIcon> = {
  trophy: Trophy,
  flame: Flame,
  users: Users,
  "check-circle": CheckCircle2,
  sparkles: Sparkles,
};

/** Badge cards with a medal-style icon, plus a dashed slot for the next badge to unlock. */
export function BadgeShelf({ badges }: { badges: Badge[] }) {
  return (
    <section>
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-bold">Badges</h2>
        <span className="rounded-full bg-sky-100 px-3 py-1 text-xs font-semibold text-primary">
          {badges.length} earned
        </span>
      </div>
      <ul className="mt-4 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {badges.map((badge) => {
          const Icon = BADGE_ICONS[badge.icon];
          return (
            <li
              key={badge.id}
              className="surface group flex flex-col items-center p-5 text-center transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md"
            >
              <span className="grid size-16 place-items-center rounded-full bg-gradient-to-br from-primary to-blue-500 text-white shadow-md ring-4 ring-sky-100 transition-transform group-hover:scale-105">
                <Icon className="size-7" />
              </span>
              <p className="mt-4 font-semibold">{badge.name}</p>
              <p className="mt-1 text-sm text-muted-foreground">{badge.description}</p>
              <p className="mt-3 text-xs font-medium text-primary/80">
                Earned {formatDate(badge.earnedAt)}
              </p>
            </li>
          );
        })}
        <li className="grid min-h-44 place-items-center rounded-2xl border-2 border-dashed border-sky-200 bg-sky-50/40 p-5 text-center">
          <div>
            <span className="mx-auto grid size-12 place-items-center rounded-full bg-white text-sky-400 shadow-xs">
              <Plus className="size-6" />
            </span>
            <p className="mt-3 text-sm font-medium text-slate-500">Next badge to unlock</p>
          </div>
        </li>
      </ul>
    </section>
  );
}
