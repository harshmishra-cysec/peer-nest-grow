import { createFileRoute, Link, Outlet, useChildMatches } from "@tanstack/react-router";
import { useState } from "react";
import { ArrowRight, CalendarDays, CheckCircle2, Crown, Users } from "lucide-react";
import { AppShell } from "@/components/layout/AppShell";
import { PageHeader } from "@/components/layout/PageHeader";
import { MemberAvatar } from "@/components/shared/MemberAvatar";
import { SkillBadge } from "@/components/shared/SkillBadge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { CIRCLE_CAPACITY, ROUTES, SUB_GROUP_SIZE } from "@/constants";
import { useAsyncData } from "@/hooks/useAsyncData";
import { formatDate } from "@/lib/format";
import { cn } from "@/lib/utils";
import { getCircleById, isCircleFull, joinCircle } from "@/services/circleService";
import { getSubGroupsForCircle } from "@/services/subGroupService";
import { getCurrentUser } from "@/services/userService";

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

function CircleDashboardPage() {
  const childMatches = useChildMatches();
  const isChildRoute = childMatches.length > 0;
  const { circleId } = Route.useParams();
  const [joining, setJoining] = useState(false);
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
  const fillPercent = Math.min(100, Math.round((circle.members.length / CIRCLE_CAPACITY) * 100));

  /** Handles joining an open circle and refreshing sub-groups if capacity is reached */
  const handleJoinCircle = async () => {
    setJoining(true);
    try {
      const updatedCircle = await joinCircle(circle.id, currentUser.skillBaseline);
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

  return (
    <AppShell>
      <PageHeader
        eyebrow={circle.topic}
        title={circle.name}
        description={circle.description}
        actions={
          <div className="flex flex-wrap items-center gap-3">
            <span className="inline-flex items-center gap-1.5 text-sm text-muted-foreground">
              <CalendarDays className="size-4" /> Deadline {formatDate(circle.deadline)}
            </span>
            {isMember && (
              <span className="inline-flex items-center gap-1 rounded-full bg-primary/10 px-2.5 py-0.5 text-xs font-semibold text-primary">
                <Users className="size-3" /> Member
              </span>
            )}
          </div>
        }
      />

      {/* Stage 2 status: waiting to fill vs. balanced sub-groups formed */}
      <section className="surface p-6">
        {full ? (
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-start gap-3">
              <CheckCircle2 className="mt-0.5 size-5 shrink-0 text-success" />
              <div>
                <h2 className="text-lg font-semibold">Balanced sub-groups formed!</h2>
                <p className="text-sm text-muted-foreground">
                  {circle.members.length}/{CIRCLE_CAPACITY} members — each group has one Beginner,
                  one Intermediate and one Advanced learner.
                </p>
              </div>
            </div>
            {isMember && (
              <Button asChild size="lg" className="shrink-0">
                <Link to={ROUTES.subGroup} params={{ circleId: circle.id }}>
                  Enter My Sub-Group <ArrowRight className="ml-1.5 size-4" />
                </Link>
              </Button>
            )}
          </div>
        ) : (
          <div>
            <div className="flex flex-col gap-1 sm:flex-row sm:items-baseline sm:justify-between">
              <h2 className="text-lg font-semibold">
                {circle.members.length}/{CIRCLE_CAPACITY} members — waiting for more to join
              </h2>
              <span className="text-sm text-muted-foreground">
                {CIRCLE_CAPACITY - circle.members.length} spots remaining
              </span>
            </div>
            <Progress value={fillPercent} className="mt-3 h-2" />
            <div className="mt-3 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <p className="text-sm text-muted-foreground">
                Sub-groups form automatically once {CIRCLE_CAPACITY} learners have joined.
              </p>
              {!isMember && (
                <Button onClick={handleJoinCircle} disabled={joining} size="sm">
                  {joining ? "Joining…" : "Join this circle"}
                </Button>
              )}
            </div>
          </div>
        )}
      </section>

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
          {subGroups.length === 0 ? (
            <p className="surface mt-4 p-6 text-sm text-muted-foreground">
              Sub-groups appear here once the circle is full ({circle.members.length}/
              {CIRCLE_CAPACITY} members).
            </p>
          ) : (
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
          )}
        </section>
      </div>
    </AppShell>
  );
}
