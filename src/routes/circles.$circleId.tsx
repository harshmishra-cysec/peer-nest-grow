import { createFileRoute, Link, Outlet, useChildMatches } from "@tanstack/react-router";
import { useState } from "react";
import {
  ArrowRight,
  Calendar,
  CheckCircle2,
  Crown,
  Info,
  Scale,
  Sparkles,
  Target,
  Users,
} from "lucide-react";
import { AppShell } from "@/components/layout/AppShell";
import { MemberAvatar } from "@/components/shared/MemberAvatar";
import { SkillBadge } from "@/components/shared/SkillBadge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { JoinCircleQuizModal } from "@/components/forms/JoinCircleQuizModal";
import { FormationModal } from "@/components/workspace/FormationModal";
import { CIRCLE_CAPACITY, GOAL_TYPE_HINTS, ROUTES, SUB_GROUP_SIZE } from "@/constants";
import { useAsyncData } from "@/hooks/useAsyncData";
import { formatDate } from "@/lib/format";
import { cn } from "@/lib/utils";
import { getCircleById, isCircleFull, joinCircle } from "@/services/circleService";
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

function CircleDashboardPage() {
  const childMatches = useChildMatches();
  const isChildRoute = childMatches.length > 0;
  const { circleId } = Route.useParams();
  const [joining, setJoining] = useState(false);
  const [showFormationModal, setShowFormationModal] = useState(false);
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
  const remainingSpots = Math.max(0, CIRCLE_CAPACITY - currentCount);
  const fillPercent = Math.min(100, Math.round((currentCount / CIRCLE_CAPACITY) * 100));

  // Compute real balanced grouping data directly from actual members
  const groupingResult = full ? computeBalancedSubGroups(circle.id, circle.members) : null;

  /** Handles joining an open circle with assessed skill level and refreshing sub-groups if capacity is reached */
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
      if (updatedCircle.members.length >= CIRCLE_CAPACITY) {
        setShowFormationModal(true);
      }
    } finally {
      setJoining(false);
    }
  };

  const topicTags = getTopicTags(circle.topic, circle.goalType);
  const goalDescription =
    GOAL_TYPE_HINTS[circle.goalType] || `${circle.goalType} together as a focused peer team`;

  return (
    <AppShell>
      {/* 1. TOP SECTION */}
      <section className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="space-y-2">
          {/* Small uppercase topic label */}
          <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            {circle.topic}
          </p>

          {/* Circle name as a large bold heading */}
          <h1 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
            {circle.name}
          </h1>

          {/* Short description line below it */}
          {circle.description && (
            <p className="max-w-2xl text-sm leading-relaxed text-muted-foreground sm:text-base">
              {circle.description}
            </p>
          )}

          {/* Small topic/category tag pills below description */}
          <div className="flex flex-wrap items-center gap-2 pt-1">
            {topicTags.map((tag) => (
              <span
                key={tag}
                className="inline-flex items-center rounded-md border border-border bg-surface-muted/60 px-2.5 py-0.5 text-xs font-medium text-muted-foreground"
              >
                {tag}
              </span>
            ))}
          </div>
        </div>

        {/* Status pill in the top-right corner + Join Action */}
        <div className="flex shrink-0 flex-wrap items-center gap-2 sm:self-start">
          {full ? (
            <span className="inline-flex items-center gap-1.5 rounded-full bg-success-soft px-3 py-1 text-xs font-semibold text-success">
              <CheckCircle2 className="size-3.5" />
              <span>Full · Sub-Groups Formed</span>
            </span>
          ) : isMember ? (
            <span className="inline-flex items-center gap-1.5 rounded-full bg-primary-soft px-3 py-1 text-xs font-semibold text-primary">
              <Users className="size-3.5" />
              <span>Joined · Awaiting Capacity</span>
            </span>
          ) : (
            <span className="inline-flex items-center gap-1.5 rounded-full bg-muted px-3 py-1 text-xs font-semibold text-muted-foreground">
              <span>Open for Enrollment</span>
            </span>
          )}

          {!full && !isMember && (
            <Button
              onClick={() => setShowQuizModal(true)}
              disabled={joining}
              size="sm"
              className="gap-1.5"
            >
              {joining ? "Joining…" : "Join this circle"}
            </Button>
          )}
        </div>
      </section>

      {/* 2. STATS ROW (three cards side by side) */}
      <section className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {/* "Goal" card: icon + the circle's stated goal text */}
        <div className="surface flex flex-col justify-between p-5">
          <div className="flex items-center gap-2.5 text-muted-foreground">
            <div className="flex size-8 items-center justify-center rounded-lg bg-primary/10 text-primary">
              <Target className="size-4" />
            </div>
            <span className="text-xs font-semibold uppercase tracking-wider">Goal</span>
          </div>
          <div className="mt-3">
            <p className="font-display text-lg font-bold text-foreground">{circle.goalType}</p>
            <p className="mt-0.5 text-xs text-muted-foreground">{goalDescription}</p>
          </div>
        </div>

        {/* "Deadline" card: icon + deadline date + skill level range text */}
        <div className="surface flex flex-col justify-between p-5">
          <div className="flex items-center gap-2.5 text-muted-foreground">
            <div className="flex size-8 items-center justify-center rounded-lg bg-primary/10 text-primary">
              <Calendar className="size-4" />
            </div>
            <span className="text-xs font-semibold uppercase tracking-wider">Deadline</span>
          </div>
          <div className="mt-3">
            <p className="font-display text-lg font-bold text-foreground">
              {formatDate(circle.deadline)}
            </p>
            <p className="mt-0.5 text-xs text-muted-foreground">
              Skill range: All levels welcome (1:1:1 peer balance)
            </p>
          </div>
        </div>

        {/* "Current Members" card: icon + "X / 9" count with a horizontal progress bar underneath */}
        <div className="surface flex flex-col justify-between p-5 sm:col-span-2 lg:col-span-1">
          <div className="flex items-center justify-between text-muted-foreground">
            <div className="flex items-center gap-2.5">
              <div className="flex size-8 items-center justify-center rounded-lg bg-primary/10 text-primary">
                <Users className="size-4" />
              </div>
              <span className="text-xs font-semibold uppercase tracking-wider">
                Current Members
              </span>
            </div>
            <span className="text-xs font-medium text-muted-foreground">{fillPercent}%</span>
          </div>
          <div className="mt-3">
            <div className="flex items-baseline justify-between">
              <p className="font-display text-lg font-bold text-foreground">
                {currentCount} / {CIRCLE_CAPACITY}
              </p>
              <span className="text-xs text-muted-foreground">
                {full ? "Capacity reached" : `${remainingSpots} spots remaining`}
              </span>
            </div>
            <Progress value={fillPercent} className="mt-2.5 h-2" />
          </div>
        </div>
      </section>

      {/* 3. INFO BANNER (A soft-colored info box below the stats row) */}
      {!full ? (
        <div className="mt-6 flex items-start gap-3 rounded-xl border border-primary/20 bg-primary-soft/50 p-4 text-foreground sm:items-center">
          <div className="flex size-7 shrink-0 items-center justify-center rounded-full bg-primary/15 text-primary">
            <Info className="size-4" />
          </div>
          <div className="min-w-0 flex-1 text-xs sm:text-sm leading-relaxed text-foreground">
            <span>
              Waiting for{" "}
              <span className="font-semibold text-primary">
                {remainingSpots} more {remainingSpots === 1 ? "member" : "members"}
              </span>
              . Once the circle reaches {CIRCLE_CAPACITY} members, the platform automatically
              evaluates member skills and splits them into balanced learning sub-groups.
            </span>
          </div>
        </div>
      ) : (
        <div className="mt-6 flex flex-col gap-4 rounded-xl border border-success/30 bg-success-soft/40 p-4 text-foreground sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-start gap-3 sm:items-center">
            <div className="flex size-7 shrink-0 items-center justify-center rounded-full bg-success/20 text-success">
              <CheckCircle2 className="size-4" />
            </div>
            <div>
              <p className="text-xs sm:text-sm font-semibold text-foreground">
                Balanced sub-groups formed!
              </p>
              <p className="text-xs text-muted-foreground">
                {circle.members.length}/{CIRCLE_CAPACITY} members —{" "}
                {groupingResult?.balanceSummary ??
                  "Distributed into balanced sub-groups with auto-elected leaders."}
              </p>
            </div>
          </div>
          <div className="flex shrink-0 items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowFormationModal(true)}
              className="gap-1.5"
            >
              <Scale className="size-4 text-primary" /> Grouping Engine
            </Button>
            {isMember && (
              <Button asChild size="sm" className="gap-1.5">
                <Link to={ROUTES.subGroup} params={{ circleId: circle.id }}>
                  <span>Enter My Sub-Group</span>
                  <ArrowRight className="size-4" />
                </Link>
              </Button>
            )}
          </div>
        </div>
      )}

      {/* 4. MEMBERS SECTION (or Sub-groups if full) */}
      {!full ? (
        <section className="mt-8">
          <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-2">
              <h2 className="text-lg font-semibold text-foreground">Members</h2>
              <span className="rounded-full bg-muted px-2 py-0.5 text-xs font-medium text-muted-foreground">
                {currentCount}
              </span>
            </div>
            {/* Small note on the right: Skill levels stay private until groups are formed */}
            <p className="text-xs text-muted-foreground">
              Skill levels stay private until groups are formed
            </p>
          </div>

          {/* Responsive multi-column grid (3 columns on desktop) */}
          <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {circle.members.map((member) => (
              <div
                key={member.userId}
                className="surface flex items-center gap-3.5 p-4 transition-all hover:border-border/80"
              >
                {/* Small circular avatar with initials */}
                <MemberAvatar name={member.name} size="md" />

                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-1.5">
                    <p className="truncate text-sm font-semibold text-foreground">{member.name}</p>
                    {member.userId === currentUser.id && (
                      <span className="text-xs text-muted-foreground">(you)</span>
                    )}
                  </div>

                  {/* Short interest/topic tag pill */}
                  <div className="mt-1 flex items-center gap-2">
                    <span className="inline-block max-w-[140px] truncate rounded bg-muted/80 px-1.5 py-0.5 text-[11px] font-medium text-muted-foreground">
                      {circle.topic}
                    </span>
                  </div>

                  {/* Joined date */}
                  <p className="mt-1 text-[11px] text-muted-foreground">
                    Joined {formatDate(member.joinedAt)}
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
          <section>
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold">Member roster</h2>
              <span className="text-xs text-muted-foreground">
                {circle.members.length} {circle.members.length === 1 ? "member" : "members"}
              </span>
            </div>
            <ul className="surface mt-4 divide-y">
              {circle.members.map((member) => (
                <li key={member.userId} className="flex items-center gap-3 px-4 py-3">
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
          <section>
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold">Sub-groups</h2>
              {subGroups.length > 0 && (
                <span className="text-xs text-muted-foreground">
                  {subGroups.length} groups of {SUB_GROUP_SIZE}
                </span>
              )}
            </div>
            <ul className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-1 xl:grid-cols-3">
              {subGroups.map((group) => {
                const isMine = group.id === mySubGroup?.id;
                const leader = group.members.find((m) => m.userId === group.leaderUserId);
                return (
                  <li
                    key={group.id}
                    className={cn(
                      "surface p-4 transition-all",
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

      {/* Formation Engine Animated Modal */}
      {groupingResult && (
        <FormationModal
          open={showFormationModal}
          onOpenChange={setShowFormationModal}
          circleName={circle.name}
          members={circle.members}
          groupingResult={groupingResult}
        />
      )}
    </AppShell>
  );
}
