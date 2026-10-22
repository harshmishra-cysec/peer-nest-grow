import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { HomePreviewPanel } from "@/components/home/HomePreviewPanel";
import { HomeSidebar } from "@/components/home/HomeSidebar";
import { HomeTopBar } from "@/components/home/HomeTopBar";
import { type HomeNavId } from "@/components/home/homeNavItems";
import type { GroupingResult } from "@/services/groupingService";
import { useAsyncData } from "@/hooks/useAsyncData";
import { getCircles, getMyCircles } from "@/services/circleService";
import {
  getGroupingAnalysisForCircle,
  getMySubGroupForCircle,
  getTasks,
} from "@/services/subGroupService";
import {
  getCurrentUser,
  getMyActivity,
  getMyBadges,
  getMyCompletedTaskCount,
} from "@/services/userService";

export const Route = createFileRoute("/home")({
  head: () => ({
    meta: [
      { title: "Dashboard — SkillNest" },
      {
        name: "description",
        content: "Your learning hub: active circles, triads, verification queue, and milestones.",
      },
      { property: "og:title", content: "Dashboard — SkillNest" },
      {
        property: "og:description",
        content: "Your learning hub: active circles, triads, verification queue, and milestones.",
      },
    ],
  }),
  component: HomePage,
});

/**
 * Loads all primary dashboard data in one pass client-side via useAsyncData.
 * Hierarchy:
 * - getCurrentUser, getMyCircles, getMyBadges, getMyActivity, getMyCompletedTaskCount, getCircles
 * - primaryCircle = first with status "Grouped", otherwise first circle, otherwise none.
 * - For primaryCircle: load getMySubGroupForCircle, then getTasks(subGroupId), getGroupingAnalysisForCircle.
 */
async function loadHomeData() {
  const [currentUser, myCircles, badges, activity, completedTasks, allCircles] = await Promise.all([
    getCurrentUser(),
    getMyCircles(),
    getMyBadges(),
    getMyActivity(),
    getMyCompletedTaskCount(),
    getCircles(),
  ]);

  // Pick user's primary circle: first with status "Grouped", otherwise first circle, otherwise none
  const primaryCircle = myCircles.find((c) => c.status === "Grouped") || myCircles[0] || undefined;

  let mySubGroup: Awaited<ReturnType<typeof getMySubGroupForCircle>> | undefined = undefined;
  let tasks: Awaited<ReturnType<typeof getTasks>> = [];

  let groupingAnalysis:
    | (GroupingResult & {
        isBalanced?: boolean;
        stats?: { tierCounts: { Advanced: number; Intermediate: number; Beginner: number } };
      })
    | null = null;

  if (primaryCircle) {
    const [subGroup, analysis] = await Promise.all([
      getMySubGroupForCircle(primaryCircle.id),
      getGroupingAnalysisForCircle(primaryCircle.id),
    ]);
    mySubGroup = subGroup;

    // Normalize grouping analysis to provide tier counts and isBalanced flag required by CircleDashboard
    groupingAnalysis = analysis
      ? {
          ...analysis,
          isBalanced: analysis.isPerfectBalance,
          stats: {
            tierCounts: {
              Advanced: analysis.tierCounts?.strong ?? 3,
              Intermediate: analysis.tierCounts?.average ?? 3,
              Beginner: analysis.tierCounts?.weak ?? 3,
            },
          },
        }
      : null;

    if (subGroup) {
      tasks = await getTasks(subGroup.id);
    }
  }

  return {
    currentUser,
    myCircles,
    badges,
    activity,
    completedTasks,
    allCircles,
    primaryCircle,
    mySubGroup,
    tasks,
    groupingAnalysis,
  };
}

function HomePage() {
  const [selectedId, setSelectedId] = useState<HomeNavId>(() => {
    // Links from other pages (e.g. /home#about) open the matching view
    if (typeof window === "undefined") return "home";
    const h = window.location.hash.replace("#", "");
    return h === "about" ? "balanced-grouping" : "home";
  });

  // Home page renders at 80% scale (rest of the app is 90%)
  useEffect(() => {
    document.documentElement.style.fontSize = "80%";
    return () => {
      document.documentElement.style.fontSize = "";
    };
  }, []);
  const { data, loading } = useAsyncData(loadHomeData, []);

  if (loading || !data) {
    return (
      <div className="flex h-dvh w-screen items-center justify-center bg-gradient-to-b from-[#EBF3FF] via-[#EEF7F8] to-[#F9FBFC]">
        <div className="flex items-center gap-3 rounded-2xl border border-border bg-card p-6 shadow-card">
          <div className="size-5 animate-spin rounded-full border-2 border-primary border-t-transparent" />
          <p className="text-sm font-semibold text-muted-foreground">Loading your dashboard…</p>
        </div>
      </div>
    );
  }

  const {
    currentUser,
    myCircles,
    badges,
    activity,
    completedTasks,
    allCircles,
    primaryCircle,
    mySubGroup,
    tasks,
    groupingAnalysis,
  } = data;

  return (
    <div className="flex h-dvh w-screen flex-col overflow-hidden bg-gradient-to-b from-[#EBF3FF] via-[#EEF7F8] to-[#F9FBFC] text-foreground">
      {/* Top bar with pill nav and user dropdown */}
      <HomeTopBar user={currentUser} selectedId={selectedId} onSelect={setSelectedId} />

      {/* Tablet/Mobile Horizontal Tab Bar under top bar (< 1024px) */}
      <div className="block lg:hidden">
        <HomeSidebar selectedId={selectedId} onSelect={setSelectedId} isMobileLayout={true} />
      </div>

      {/* Main Layout Body: Left Sidebar + Central Hero Preview Panel */}
      <div className="flex flex-1 overflow-hidden">
        {/* Desktop Left Sidebar (collapsible w-64 <-> w-16) */}
        <HomeSidebar selectedId={selectedId} onSelect={setSelectedId} isMobileLayout={false} />

        {/* Main Area: Hero Preview Panel */}
        <HomePreviewPanel
          selectedId={selectedId}
          currentUser={currentUser}
          allCircles={allCircles}
          myCircles={myCircles}
          primaryCircle={primaryCircle}
          mySubGroup={mySubGroup}
          tasks={tasks}
          groupingAnalysis={groupingAnalysis}
          badges={badges}
          activity={activity}
          completedTasks={completedTasks}
        />
      </div>
    </div>
  );
}
