import { createFileRoute, Link, Outlet, useChildMatches } from "@tanstack/react-router";
import { useState } from "react";
import { ArrowRight, Calendar, CheckCircle2, Crown, Info, Target, Users } from "lucide-react";
import { AppShell } from "@/components/layout/AppShell";
import { MemberAvatar } from "@/components/shared/MemberAvatar";
import { SkillBadge } from "@/components/shared/SkillBadge";
import { Button } from "@/components/ui/button";
import { JoinCircleQuizModal } from "@/components/forms/JoinCircleQuizModal";
import { GOAL_TYPE_HINTS, ROUTES, SUB_GROUP_SIZE } from "@/constants";
import { useAsyncData } from "@/hooks/useAsyncData";
import { formatDate, formatLongDate, initials } from "@/lib/format";
import { cn } from "@/lib/utils";
import { getCircleById, getCircleCapacity, isCircleFull, joinCircle } from "@/services/circleService";
import { computeBalancedSubGroups } from "@/services/groupingService";
import { getSubGroupsForCircle } from "@/services/subGroupService";
import { getCurrentUser } from "@/services/userService";
import type { SkillLevel } from "@/types";

export const Route = createFileRoute("/circles/$circleId")({
  head: () => ({
    meta: [
      { title: "Circle dashboard — SkillNest" },
      { name: "description", content: "Members, progress toward grouping, and your sub-group." },
      { property: "og:title", content: "Circle dashboard — SkillNest" },
      {
        property: "og:description",
        content: "Members, progress toward grouping, and your sub-group.",
      },
    ],
  }),
  component: CircleDashboardPage,
});

/**
 * Returns contextual tags derived from circle topic and goal for display pills.
 */
function getTopicTags(topic: string, goalType: string): string[] {
  const tags: string[] = [];
  if (topic.includes("&")) {
    topic.split("&").forEach((part) => {
      const trimmed = part.trim();
      if (trimmed) tags.push(trimmed);
    });
  } else if (topic.includes(" ")) {
    tags.push(topic);
    const words = topic.split(" ");
    if (words.length > 1) {
      const acronym = words
        .map((w) => w[0])
        .join("")
        .toUpperCase();
      if (acronym.length >= 2 && !tags.includes(acronym)) {
        tags.unshift(acronym);
      }
    }
  } else {
    tags.push(topic);
  }
  if (!tags.includes(goalType)) {
    tags.push(goalType);
  }
  return tags;
}

/**
 * Derives a clean interest/focus subtitle for the member based on circle or user.
 */
function getMemberInterest(index: number): string {
  const defaultInterests = [
    "Competitive coding",
    "Backend systems",
    "Interview prep",
    "Open source",
    "Product building",
    "Teaching peers",
  ];
  return defaultInterests[index % defaultInterests.length];
}

function CircleDashboardPage() {
  const childMatches = useChildMatches();
  const isChildRoute = childMatches.length > 0;
  const { circleId } = Route.useParams();
  const [joining, setJoining] = useState(false);
  const [showQuizModal, setShowQuizModal] = useState(false);
  const { data, loading, setData } = useAsyncData(
    () =>
      isChildRoute
        ? Promise.resolve(undefined)
        : Promise.all([
            getCircleById(circleId),
            getSubGroupsForCircle(circleId),
            getCurrentUser(),
          ]).then(([circle, subGroups, currentUser]) => ({ circle, subGroups, currentUser })),
    [circleId, isChildRoute],
  );

  // If a child route like /subgroup is matched, render its outlet instead of the parent dashboard
  if (isChildRoute) {
    return <Outlet />;
  }

  if (loading || !data) {
    return (
      <AppShell>
        <p className="text-sm text-muted-foreground">Loading circle…</p>
      </AppShell>
    );
  }

  const { circle, subGroups, currentUser } = data;
  if (!circle) {
    return (
      <AppShell>
        <p className="text-sm text-muted-foreground">This circle doesn't exist.</p>
      </AppShell>
    );
  }

  const full = isCircleFull(circle);
  const isMember = circle.members.some((m) => m.userId === currentUser.id);
  const mySubGroup = subGroups.find((group) =>
    group.members.some((m) => m.userId === currentUser.id),
  );
  const currentCount = circle.members.length;
  const capacity = getCircleCapacity(circle);
  const remainingSpots = Math.max(0, capacity - currentCount);
  const fillPercent = Math.min(100, Math.round((currentCount / capacity) * 100));

  // Compute real balanced grouping data directly from actual members
  const groupingResult = full ? computeBalancedSubGroups(circle.id, circle.members) : null;

  /** Handles joining an open circle with assessed skill level */
  const handleConfirmJoinWithQuiz = async (assessedLevel: SkillLevel) => {
    setJoining(true);
    try {
      const updatedCircle = await joinCircle(circle.id, assessedLevel);
      const updatedSubGroups = await getSubGroupsForCircle(circle.id);
      setData((prev) =>
        prev
          ? {
              ...prev,
              circle: updatedCircle,
              subGroups: updatedSubGroups,
            }
          : prev,
      );
    } finally {
      setJoining(false);
    }
  };

  const topicTags = getTopicTags(circle.topic, circle.goalType);

  return (
    <AppShell>
      {/* 1. TOP HERO CARD CONTAINER: Exact screenshot layout with soft border & subtle tint */}
      <div className="rounded-2xl border border-sky-100 bg-gradient-to-b from-sky-50/40 via-white to-white p-6 shadow-sm sm:p-8">
        {/* Top Header */}
        <section className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div className="space-y-1.5">
            {/* Small uppercase topic label */}
            <p className="text-[11px] font-bold tracking-wider text-primary uppercase">
              {circle.topic}
            </p>

            {/* Circle name as a large bold heading */}
            <h1 className="text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">
              {circle.name}
            </h1>

            {/* Short description line below it */}
            {circle.description && (
              <p className="max-w-3xl text-sm leading-relaxed text-slate-600 sm:text-base">{circle.description}</p>
            )}

            {/* Small topic/category tag pills below description */}
            <div className="flex flex-wrap items-center gap-1.5 pt-2">
              {topicTags.map((tag) => (
                <span
                  key={tag}
                  className="inline-flex items-center rounded-md border border-slate-200/80 bg-white px-2.5 py-0.5 text-[11px] font-medium text-slate-600 shadow-2xs"
                >
                  {tag}
                </span>
              ))}
            </div>
          </div>

          {/* Status pill in the top-right corner + Join Action */}
          <div className="flex shrink-0 flex-wrap items-center gap-2 sm:self-start">
            {full ? (
              <span className="inline-flex items-center gap-1.5 rounded-full border border-emerald-200 bg-emerald-50 px-3.5 py-1 text-xs font-medium text-emerald-700">
                <CheckCircle2 className="size-3.5" />
                <span>Full · Sub-Groups Formed</span>
              </span>
            ) : isMember ? (
              <span className="inline-flex items-center gap-1.5 rounded-full border border-slate-200/90 bg-white/90 px-3.5 py-1 text-xs font-medium text-slate-500 shadow-2xs">
                <span>Joined · Awaiting Capacity</span>
              </span>
            ) : (
              <span className="inline-flex items-center gap-1.5 rounded-full border border-slate-200 bg-white px-3.5 py-1 text-xs font-medium text-slate-500 shadow-2xs">
                <span>Open for Enrollment</span>
              </span>
            )}

            {!full && !isMember && (
              <Button
                onClick={() => setShowQuizModal(true)}
                disabled={joining}
                size="sm"
                className="gap-1.5 text-xs shadow-sm"
              >
                {joining ? "Joining…" : "Join this circle"}
              </Button>
            )}
          </div>
        </section>

        {/* 2. STATS ROW (three cards side by side matching reference) */}
        <section className="mt-7 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {/* "Goal" card: icon + stated goal text */}
          <div className="rounded-xl border border-slate-200/80 bg-white p-5 shadow-2xs">
            <div className="flex items-center gap-2 text-slate-500">
              <Target className="size-4 text-slate-400" />
              <span className="text-xs font-medium">Goal</span>
            </div>
            <div className="mt-3">
              <p className="text-xs sm:text-sm font-semibold text-slate-800 leading-snug">
                Improve problem-solving and {circle.topic.toLowerCase()} skills through peer
                learning.
              </p>
            </div>
          </div>

          {/* "Deadline" card: icon + deadline date + skill level range text */}
          <div className="rounded-xl border border-slate-200/80 bg-white p-5 shadow-2xs">
            <div className="flex items-center gap-2 text-slate-500">
              <Calendar className="size-4 text-slate-400" />
              <span className="text-xs font-medium">Deadline</span>
            </div>
            <div className="mt-3">
              <p className="text-xs sm:text-sm font-semibold text-slate-800">
                {formatLongDate(circle.deadline)}
              </p>
              <p className="mt-1 text-[11px] text-slate-400">Level: Beginner – Intermediate</p>
            </div>
          </div>

          {/* "Current Members" card: icon + "X / 9" count with blue horizontal progress bar underneath */}
          <div className="rounded-xl border border-slate-200/80 bg-white p-5 shadow-2xs sm:col-span-2 lg:col-span-1">
            <div className="flex items-center gap-2 text-slate-500">
              <Users className="size-4 text-slate-400" />
              <span className="text-xs font-medium">Current Members</span>
            </div>
            <div className="mt-3">
              <p className="font-display text-xl font-bold text-slate-900 tracking-tight">
                {currentCount} / {capacity}
              </p>
              {/* Sleek blue progress line like screenshot */}
              <div className="mt-2.5 h-1.5 w-full overflow-hidden rounded-full bg-slate-100">
                <div
                  className="h-full rounded-full bg-primary transition-all duration-300"
                  style={{ width: `${fillPercent}%` }}
                />
              </div>
            </div>
          </div>
        </section>

        {/* 3. INFO BANNER: soft blue box below stats */}
        {!full ? (
          <div className="mt-5 rounded-xl border border-sky-100 bg-sky-50/70 p-4">
            <div className="flex items-center gap-2 text-primary font-medium text-xs sm:text-sm">
              <Info className="size-4 shrink-0" />
              <span>
                Waiting for {remainingSpots} more {remainingSpots === 1 ? "member" : "members"}.
              </span>
            </div>
            <p className="mt-1 text-xs text-slate-600 sm:text-[13px] leading-relaxed pl-6">
              Once the circle reaches {capacity} members, the platform automatically
              evaluates member skills and splits them into balanced learning sub-groups.
            </p>
          </div>
        ) : (
          <div className="mt-5 flex flex-col gap-3 rounded-xl border border-emerald-200 bg-emerald-50/70 p-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-start gap-3 sm:items-center">
              <CheckCircle2 className="size-4 shrink-0 text-emerald-600" />
              <div>
                <p className="text-xs sm:text-sm font-semibold text-emerald-900">
                  Balanced sub-groups formed!
                </p>
                <p className="text-xs text-emerald-700">
                  {circle.members.length}/{capacity} members —{" "}
                  {groupingResult?.balanceSummary ??
                    "Distributed into balanced sub-groups with auto-elected leaders."}
                </p>
              </div>
            </div>
            {isMember && (
              <Button asChild size="sm" className="gap-1.5 shrink-0 text-xs">
                <Link to={ROUTES.subGroup} params={{ circleId: circle.id }}>
                  <span>Enter My Sub-Group</span>
                  <ArrowRight className="size-3.5" />
                </Link>
              </Button>
            )}
          </div>
        )}
      </div>

      {/* 4. MEMBERS SECTION (Exact screenshot layout with 3-column pill cards) */}
      {!full ? (
        <section className="mt-8 rounded-2xl border border-slate-200/80 bg-white p-6 shadow-2xs sm:p-8">
          <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
            <h2 className="text-lg font-bold text-slate-900">Members</h2>
            {/* Small note on the right: Skill levels stay private until groups are formed */}
            <p className="text-xs text-slate-400">
              Skill levels stay private until groups are formed
            </p>
          </div>

          {/* 3-column responsive grid matching the screenshot */}
          <div className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {circle.members.map((member, idx) => (
              <div
                key={member.userId}
                className="flex items-center gap-3 rounded-xl border border-slate-200/80 bg-white px-3.5 py-3 shadow-2xs transition-colors hover:border-slate-300"
              >
                {/* Circular avatar with light blue background and blue text */}
                <span className="grid size-9 shrink-0 place-items-center rounded-full bg-sky-50 text-xs font-semibold text-primary">
                  {initials(member.name)}
                </span>

                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-1.5">
                    <p className="truncate text-xs font-semibold text-slate-800">{member.name}</p>
                    {member.userId === currentUser.id && (
                      <span className="text-[11px] text-slate-400">(you)</span>
                    )}
                  </div>
                  {/* Tag and joined date line */}
                  <p className="truncate text-[11px] text-slate-400">
                    {getMemberInterest(idx)} · joined {formatDate(member.joinedAt)}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </section>
      ) : (
        /* Full Circle: Display Sub-groups alongside Roster */
        <div className="mt-8 grid gap-8 lg:grid-cols-[minmax(0,2fr)_minmax(0,3fr)]">
          {/* Member roster */}
          <section className="surface p-6">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold">Member roster</h2>
              <span className="text-xs text-muted-foreground">
                {circle.members.length} {circle.members.length === 1 ? "member" : "members"}
              </span>
            </div>
            <ul className="mt-4 divide-y divide-border">
              {circle.members.map((member) => (
                <li key={member.userId} className="flex items-center gap-3 py-3">
                  <MemberAvatar name={member.name} size="sm" />
                  <span className="flex-1 truncate text-sm font-medium">
                    {member.name}
                    {member.userId === currentUser.id && (
                      <span className="ml-1 text-muted-foreground">(you)</span>
                    )}
                  </span>
                  <SkillBadge level={member.skillLevel} />
                </li>
              ))}
            </ul>
          </section>

          {/* Sub-groups list */}
          <section className="surface p-6">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold">Sub-groups</h2>
              {subGroups.length > 0 && (
                <span className="text-xs text-muted-foreground">
                  {subGroups.length} groups of {SUB_GROUP_SIZE}
                </span>
              )}
            </div>
            <ul className="mt-4 grid gap-4 sm:grid-cols-1">
              {subGroups.map((group) => {
                const isMine = group.id === mySubGroup?.id;
                const leader = group.members.find((m) => m.userId === group.leaderUserId);
                return (
                  <li
                    key={group.id}
                    className={cn(
                      "rounded-xl border border-border p-4 transition-all",
                      isMine && "border-2 border-primary bg-primary-soft/40 shadow-sm",
                    )}
                  >
                    <div className="flex items-center justify-between">
                      <h3 className="font-semibold">{group.name}</h3>
                      {isMine && (
                        <span className="rounded-full bg-primary/10 px-2 py-0.5 text-xs font-semibold text-primary">
                          Your group
                        </span>
                      )}
                    </div>
                    <p className="mt-1 inline-flex items-center gap-1 text-xs font-medium text-muted-foreground">
                      <Crown className="size-3.5 text-warning" /> Leader:{" "}
                      {leader?.name ?? "Assigned"}
                    </p>
                    <ul className="mt-3 space-y-2">
                      {group.members.map((member) => (
                        <li
                          key={member.userId}
                          className="flex items-center justify-between gap-2 text-sm"
                        >
                          <span className="truncate font-medium">
                            {member.name}
                            {member.userId === currentUser.id && (
                              <span className="ml-1 text-xs text-muted-foreground">(you)</span>
                            )}
                          </span>
                          <SkillBadge level={member.skillLevel} />
                        </li>
                      ))}
                    </ul>
                    {isMine && (
                      <Button asChild size="sm" className="mt-4 w-full">
                        <Link to={ROUTES.subGroup} params={{ circleId: circle.id }}>
                          Open workspace <ArrowRight className="ml-1.5 size-3.5" />
                        </Link>
                      </Button>
                    )}
                  </li>
                );
              })}
            </ul>
          </section>
        </div>
      )}

      {/* Quiz Modal before joining */}
      <JoinCircleQuizModal
        open={showQuizModal}
        onOpenChange={setShowQuizModal}
        circleName={circle.name}
        topic={circle.topic}
        onConfirmJoin={handleConfirmJoinWithQuiz}
      />
    </AppShell>
  );
}
