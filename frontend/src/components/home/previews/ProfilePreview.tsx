import { Award, CheckCircle2, Flame, Sparkles, Trophy, Users, type LucideIcon } from "lucide-react";
import { PreviewHero } from "../PreviewHero";
import { StatCard } from "@/components/shared/StatCard";
import { ROUTES } from "@/constants";
import { formatDate, formatRelative } from "@/lib/format";
import type { ActivityItem, Badge, Circle, User } from "@/types";

interface ProfilePreviewProps {
  user: User;
  myCircles: Circle[];
  completedTasks: number;
  badges: Badge[];
  activity: ActivityItem[];
}

const BADGE_ICONS: Record<Badge["icon"], LucideIcon> = {
  trophy: Trophy,
  flame: Flame,
  users: Users,
  "check-circle": CheckCircle2,
  sparkles: Sparkles,
};

/**
 * 7. Profile & Progress Preview:
 * - 4 reused StatCards:
 *   1. Joined circles
 *   2. Completed tasks
 *   3. Badges earned
 *   4. Current streak with tone "warning"
 * - Badges row (max 4)
 * - 3 latest activity lines (formatRelative)
 * - CTA "View profile" -> ROUTES.profile.
 */
export function ProfilePreview({
  user,
  myCircles,
  completedTasks,
  badges,
  activity,
}: ProfilePreviewProps) {
  return (
    <div className="space-y-6">
      <PreviewHero
        label="REPUTATION & PROGRESS"
        title="Your Learning Journey"
        description="Streaks, verified milestones, badges earned, and historical activity across cohorts."
        ctaText="View profile"
        ctaLink={ROUTES.profile}
      />

      {/* 4 Reused StatCards */}
      <section className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        <StatCard Icon={Users} label="Joined circles" value={myCircles.length} />
        <StatCard Icon={CheckCircle2} label="Completed tasks" value={completedTasks} />
        <StatCard Icon={Award} label="Badges earned" value={badges.length} />
        <StatCard
          Icon={Flame}
          label="Current streak"
          value={`${user.currentStreakDays}d`}
          tone="warning"
        />
      </section>

      {/* Badges and Activity side-by-side */}
      <div className="grid gap-6 md:grid-cols-2">
        {/* Badges showcase (max 4) */}
        <div className="surface p-5 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-2 border-b border-border/60">
              <h3 className="text-sm font-bold text-foreground uppercase tracking-wider">
                Earned Badges
              </h3>
              <span className="text-[10px] text-muted-foreground">{badges.length} unlocked</span>
            </div>

            <div className="grid grid-cols-2 gap-2 pt-3">
              {badges.slice(0, 4).map((badge) => {
                const Icon = BADGE_ICONS[badge.icon] ?? Trophy;
                return (
                  <div
                    key={badge.id}
                    className="flex items-center gap-2 rounded-lg border border-border/70 bg-card p-2.5 shadow-2xs"
                  >
                    <div className="flex size-7 shrink-0 items-center justify-center rounded-md bg-primary-soft text-primary">
                      <Icon className="size-4.5" />
                    </div>
                    <div className="min-w-0">
                      <p className="text-sm font-semibold text-foreground truncate">{badge.name}</p>
                      <p className="text-[10px] text-muted-foreground">
                        {formatDate(badge.earnedAt)}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
          <p className="text-[11px] text-muted-foreground pt-3 border-t border-border/60 mt-3">
            Earn badges through weekly streaks, peer verifications, and leadership.
          </p>
        </div>

        {/* 3 Latest Activity Lines */}
        <div className="surface p-5 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-2 border-b border-border/60">
              <h3 className="text-sm font-bold text-foreground uppercase tracking-wider">
                Recent Activity
              </h3>
              <span className="text-[10px] text-muted-foreground">Live stream</span>
            </div>

            <ol className="divide-y divide-border/60">
              {activity.slice(0, 3).map((item) => (
                <li key={item.id} className="py-2.5 space-y-0.5">
                  <p className="text-sm text-foreground font-medium line-clamp-1">{item.text}</p>
                  <p className="text-[10px] text-muted-foreground">
                    {formatRelative(item.occurredAt)}
                  </p>
                </li>
              ))}
            </ol>
          </div>
          <p className="text-[11px] text-muted-foreground pt-3 border-t border-border/60">
            All team interactions are logged for accountability transparency.
          </p>
        </div>
      </div>
    </div>
  );
}
