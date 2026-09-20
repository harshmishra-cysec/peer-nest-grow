import { createFileRoute, Link } from "@tanstack/react-router";
import { Award, CheckCircle2, Flame, Sparkles, Trophy, Users, type LucideIcon } from "lucide-react";
import { AppShell } from "@/components/layout/AppShell";
import { MemberAvatar } from "@/components/shared/MemberAvatar";
import { SkillBadge } from "@/components/shared/SkillBadge";
import { StatCard } from "@/components/shared/StatCard";
import { CIRCLE_CAPACITY, ROUTES } from "@/constants";
import { useAsyncData } from "@/hooks/useAsyncData";
import { formatDate, formatRelative } from "@/lib/format";
import { getMyCircles } from "@/services/circleService";
import { getMySubGroupForCircle } from "@/services/subGroupService";
import {
  getCurrentUser,
  getMyActivity,
  getMyBadges,
  getMyCompletedTaskCount,
} from "@/services/userService";
import type { Badge } from "@/types";

export const Route = createFileRoute("/profile")({
  head: () => ({
    meta: [
      { title: "Your progress — SkillNest" },
      { name: "description", content: "Your circles, badges, streak and recent activity." },
      { property: "og:title", content: "Your progress — SkillNest" },
      { property: "og:description", content: "Your circles, badges, streak and recent activity." },
    ],
  }),
  component: ProfilePage,
});

const BADGE_ICONS: Record<Badge["icon"], LucideIcon> = {
  trophy: Trophy,
  flame: Flame,
  users: Users,
  "check-circle": CheckCircle2,
  sparkles: Sparkles,
};

async function loadProfile() {
  const [user, circles, badges, activity, completedTasks] = await Promise.all([
    getCurrentUser(),
    getMyCircles(),
    getMyBadges(),
    getMyActivity(),
    getMyCompletedTaskCount(),
  ]);
  // Resolve the user's sub-group per circle so each row can deep-link to the workspace.
  const subGroups = await Promise.all(circles.map((c) => getMySubGroupForCircle(c.id)));
  return { user, circles, badges, activity, completedTasks, subGroups };
}

function ProfilePage() {
  const { data, loading } = useAsyncData(loadProfile, []);

  if (loading || !data) {
    return (
      <AppShell>
        <p className="text-sm text-muted-foreground">Loading profile…</p>
      </AppShell>
    );
  }

  const { user, circles, badges, activity, completedTasks, subGroups } = data;

  return (
    <AppShell>
      <header className="flex flex-col gap-4 sm:flex-row sm:items-center">
        <MemberAvatar name={user.name} size="lg" />
        <div>
          <div className="flex flex-wrap items-center gap-3">
            <h1 className="text-3xl font-bold">{user.name}</h1>
            <SkillBadge level={user.skillBaseline} />
          </div>
          <p className="mt-1 max-w-xl text-muted-foreground">{user.bio}</p>
        </div>
      </header>

      <section className="mt-8 grid grid-cols-2 gap-4 lg:grid-cols-4">
        <StatCard Icon={Users} label="Joined circles" value={circles.length} />
        <StatCard Icon={CheckCircle2} label="Completed tasks" value={completedTasks} />
        <StatCard Icon={Award} label="Badges earned" value={badges.length} />
        <StatCard
          Icon={Flame}
          label="Current streak"
          value={`${user.currentStreakDays}d`}
          tone="warning"
        />
      </section>

      <div className="mt-8 grid gap-8 lg:grid-cols-[minmax(0,3fr)_minmax(0,2fr)]">
        <div className="space-y-8">
          <section>
            <h2 className="text-lg font-semibold">Active circles</h2>
            <ul className="surface mt-4 divide-y">
              {circles.map((circle, index) => {
                const subGroup = subGroups[index];
                return (
                  <li
                    key={circle.id}
                    className="flex flex-col gap-3 p-4 sm:flex-row sm:items-center sm:justify-between"
                  >
                    <div>
                      <p className="font-semibold">{circle.name}</p>
                      <p className="text-sm text-muted-foreground">
                        {circle.topic} · {circle.members.length}/{CIRCLE_CAPACITY} members · due{" "}
                        {formatDate(circle.deadline)}
                      </p>
                    </div>
                    <div className="flex gap-4 text-sm font-semibold text-primary">
                      <Link
                        to={ROUTES.circle}
                        params={{ circleId: circle.id }}
                        className="hover:underline"
                      >
                        Circle
                      </Link>
                      {subGroup && (
                        <Link
                          to={ROUTES.subGroup}
                          params={{ circleId: circle.id }}
                          className="hover:underline"
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

          <section>
            <h2 className="text-lg font-semibold">Badges</h2>
            <ul className="mt-4 grid gap-4 sm:grid-cols-3">
              {badges.map((badge) => {
                const Icon = BADGE_ICONS[badge.icon];
                return (
                  <li key={badge.id} className="surface p-4">
                    <Icon className="size-5 text-primary" />
                    <p className="mt-3 font-semibold">{badge.name}</p>
                    <p className="mt-1 text-sm text-muted-foreground">{badge.description}</p>
                    <p className="mt-3 text-xs text-muted-foreground">
                      Earned {formatDate(badge.earnedAt)}
                    </p>
                  </li>
                );
              })}
            </ul>
          </section>
        </div>

        <section>
          <h2 className="text-lg font-semibold">Recent activity</h2>
          <ol className="surface mt-4 divide-y">
            {activity.map((item) => (
              <li key={item.id} className="p-4">
                <p className="text-sm">{item.text}</p>
                <p className="mt-1 text-xs text-muted-foreground">
                  {formatRelative(item.occurredAt)}
                </p>
              </li>
            ))}
          </ol>
        </section>
      </div>
    </AppShell>
  );
}
