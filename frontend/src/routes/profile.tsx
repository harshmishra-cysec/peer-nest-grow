import { createFileRoute } from "@tanstack/react-router";
import { Flame } from "lucide-react";
import { AppShell } from "@/components/layout/AppShell";
import { SkillBadge } from "@/components/shared/SkillBadge";
import { ProfileOverview } from "@/components/profile/ProfileOverview";
import { useAsyncData } from "@/hooks/useAsyncData";
import { getMyCircles } from "@/services/circleService";
import { getMySubGroupForCircle } from "@/services/subGroupService";
import {
  getCurrentUser,
  getMyActivity,
  getMyBadges,
  getMyCompletedTaskCount,
} from "@/services/userService";

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
  const workspaceCircleIds = new Set(
    circles.filter((_, index) => !!subGroups[index]).map((circle) => circle.id),
  );

  return (
    <AppShell>
      <header className="relative overflow-hidden rounded-3xl border border-sky-100 bg-gradient-to-br from-sky-100 via-white to-blue-50 p-6 shadow-card sm:p-8">
        <div
          aria-hidden="true"
          className="pointer-events-none absolute -right-10 -top-16 size-64 rounded-full bg-primary/10 blur-3xl"
        />
        <div className="relative flex flex-col gap-5 sm:flex-row sm:items-center">
          <span className="grid size-20 shrink-0 place-items-center rounded-full bg-gradient-to-br from-primary to-blue-500 text-2xl font-bold text-white shadow-lg ring-4 ring-white">
            {user.name
              .split(" ")
              .map((part) => part.charAt(0))
              .join("")
              .slice(0, 2)
              .toUpperCase()}
          </span>
          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-center gap-3">
              <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">{user.name}</h1>
              <SkillBadge level={user.skillBaseline} />
            </div>
            <p className="mt-1.5 max-w-xl text-muted-foreground">{user.bio}</p>
          </div>
          <div className="flex items-center gap-2 self-start rounded-full border border-amber-200 bg-amber-50 px-4 py-2 text-sm font-semibold text-amber-700 sm:self-center">
            <Flame className="size-5 fill-amber-400 text-amber-600" />
            {user.currentStreakDays}-day streak
          </div>
        </div>
      </header>

      <div className="mt-8">
        <ProfileOverview
          user={user}
          circles={circles}
          badges={badges}
          activity={activity}
          completedTasks={completedTasks}
          workspaceCircleIds={workspaceCircleIds}
        />
      </div>
    </AppShell>
  );
}
