import { useState } from "react";
import { Link } from "@tanstack/react-router";
import {
  ArrowRight,
  Calendar,
  CheckCircle2,
  Crown,
  Info,
  Layers,
  Sparkles,
  Target,
  Users,
} from "lucide-react";
import { PreviewHero } from "../PreviewHero";
import { MemberAvatar } from "@/components/shared/MemberAvatar";
import { SkillBadge } from "@/components/shared/SkillBadge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { CIRCLE_CAPACITY, ROUTES } from "@/constants";
import { formatDate, initials } from "@/lib/format";
import { cn } from "@/lib/utils";
import type { GroupingResult } from "@/services/groupingService";
import type { Circle, User } from "@/types";

interface CircleDashboardPreviewProps {
  circle?: Circle;
  groupingAnalysis?: GroupingResult | null;
  currentUser?: User;
  myCircles?: Circle[];
}

/**
 * Circle Dashboard Section Preview:
 * - Active circle overview: name, goal, deadline, progress bar toward capacity.
 * - Robust grouping analysis metrics (safe extraction of tierCounts without .stats crash).
 * - Live visualization of the circle's members and formed triads with dynamic leader crowns.
 * - Direct navigation links to the full circle page and the triad workspace.
 */
export function CircleDashboardPreview({
  circle: initialCircle,
  groupingAnalysis,
  currentUser,
  myCircles = [],
}: CircleDashboardPreviewProps) {
  const [selectedCircleId, setSelectedCircleId] = useState<string | null>(null);

  // If user has multiple circles, allow switching between them
  const activeCircle =
    (selectedCircleId ? myCircles.find((c) => c.id === selectedCircleId) : null) ??
    initialCircle ??
    myCircles[0];

  if (!activeCircle) {
    return (
      <div className="space-y-6">
        <PreviewHero
          label="ACTIVE COHORT"
          title="Circle Dashboard"
          description="Track member enrollment, capacity checkpoints, and balanced group formations."
        />
        <div className="surface p-8 text-center space-y-3">
          <p className="text-base font-semibold text-foreground">You haven't joined a circle yet</p>
          <p className="text-sm text-muted-foreground max-w-sm mx-auto">
            Join an existing circle or share your preferences to start collaborating with peers.
          </p>
          <Button asChild size="sm">
            <Link to={ROUTES.joinPreferences}>Find circles</Link>
          </Button>
        </div>
      </div>
    );
  }

  const isGrouped = activeCircle.status === "Grouped";
  const membersCount = activeCircle.members.length;
  const remainingSpots = Math.max(0, CIRCLE_CAPACITY - membersCount);
  const fillPercent = Math.min(100, Math.round((membersCount / CIRCLE_CAPACITY) * 100));

  // Safe extraction of tier counts from groupingAnalysis or member skill levels
  const advancedCount =
    groupingAnalysis?.tierCounts?.strong ??
    activeCircle.members.filter((m) => m.skillLevel === "Advanced").length;
  const intermediateCount =
    groupingAnalysis?.tierCounts?.average ??
    activeCircle.members.filter((m) => m.skillLevel === "Intermediate").length;
  const beginnerCount =
    groupingAnalysis?.tierCounts?.weak ??
    activeCircle.members.filter((m) => m.skillLevel === "Beginner").length;

  const isPerfect = groupingAnalysis?.isPerfectBalance ?? isGrouped;
  const subGroupsList = groupingAnalysis?.subGroups ?? [];

  return (
    <div className="space-y-6">
      {/* Circle selector if user belongs to more than 1 circle */}
      {myCircles.length > 1 && (
        <div className="flex items-center gap-2 overflow-x-auto pb-1 text-sm">
          <span className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider shrink-0">
            Your Circles:
          </span>
          <div className="flex items-center gap-1.5 min-w-max">
            {myCircles.map((c) => {
              const isSelected = c.id === activeCircle.id;
              return (
                <button
                  key={c.id}
                  type="button"
                  onClick={() => setSelectedCircleId(c.id)}
                  className={cn(
                    "rounded-full px-3 py-1 font-medium transition-colors cursor-pointer",
                    isSelected
                      ? "bg-primary text-primary-foreground shadow-2xs"
                      : "bg-card border border-border text-muted-foreground hover:bg-muted hover:text-foreground",
                  )}
                >
                  {c.name}
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* Hero Banner */}
      <PreviewHero
        label="MY LEARNING CIRCLE"
        title={activeCircle.name}
        description={`Focusing on ${activeCircle.topic} · Goal: ${activeCircle.goalType} · Due ${formatDate(activeCircle.deadline)}`}
        ctaText="Open circle"
        ctaLink={ROUTES.circle}
        ctaParams={{ circleId: activeCircle.id }}
        badge={activeCircle.topic}
      />

      {/* Grouping Status Alert Banner */}
      {isGrouped ? (
        <div className="flex items-start gap-4 rounded-xl border border-success/30 bg-success-soft p-5 text-success-foreground">
          <CheckCircle2 className="size-6 shrink-0 text-success mt-0.5" />
          <div className="space-y-1 text-sm">
            <p className="font-bold text-base text-foreground">
              {isPerfect ? "Balanced grouping achieved!" : "Sub-groups formed"}
            </p>
            <p className="text-muted-foreground leading-relaxed">
              {groupingAnalysis?.balanceSummary ? (
                groupingAnalysis.balanceSummary
              ) : (
                <>
                  Verified with {advancedCount} Advanced, {intermediateCount} Intermediate, and{" "}
                  {beginnerCount} Beginner members distributed across balanced learning triads.
                </>
              )}
            </p>
          </div>
        </div>
      ) : (
        <div className="flex items-start gap-4 rounded-xl border border-primary/20 bg-primary-soft p-5">
          <Info className="size-6 shrink-0 text-primary mt-0.5" />
          <div className="space-y-0.5 text-sm">
            <p className="font-semibold text-foreground">
              Waiting for {remainingSpots} more {remainingSpots === 1 ? "member" : "members"}
            </p>
            <p className="text-muted-foreground leading-relaxed">
              Once {CIRCLE_CAPACITY} members join, the grouping algorithm automatically evaluates
              assessed skills and forms balanced 3-person triads with auto-elected leaders.
            </p>
          </div>
        </div>
      )}

      {/* Stats Cards Row */}
      <div className="grid gap-4 sm:grid-cols-3">
        {/* Goal Card */}
        <div className="surface p-5 flex flex-col justify-between">
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Target className="size-5 text-primary" />
            <span>Goal type</span>
          </div>
          <p className="mt-2 font-display text-xl font-bold text-foreground">
            {activeCircle.goalType}
          </p>
          <p className="text-[11px] text-muted-foreground mt-1">
            {activeCircle.commitment} cadence · Team deliverables
          </p>
        </div>

        {/* Deadline Card */}
        <div className="surface p-5 flex flex-col justify-between">
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Calendar className="size-5 text-primary" />
            <span>Circle deadline</span>
          </div>
          <p className="mt-2 font-display text-xl font-bold text-foreground">
            {formatDate(activeCircle.deadline)}
          </p>
          <p className="text-[11px] text-muted-foreground mt-1">Shared target across all groups</p>
        </div>

        {/* Members Progress Card */}
        <div className="surface p-5 flex flex-col justify-between">
          <div className="flex items-center justify-between text-sm text-muted-foreground">
            <span className="flex items-center gap-1.5">
              <Users className="size-5 text-primary" /> Members
            </span>
            <span className="font-semibold text-foreground">{fillPercent}%</span>
          </div>
          <div className="mt-2">
            <p className="font-display text-xl font-bold text-foreground">
              {activeCircle.members.length} / {CIRCLE_CAPACITY}
            </p>
            <Progress value={fillPercent} className="mt-2 h-1.5" />
          </div>
        </div>
      </div>

      {/* Formed Triads (if circle is grouped) */}
      {isGrouped && subGroupsList.length > 0 && (
        <div className="surface p-6 space-y-4">
          <div className="flex items-center justify-between border-b border-border/60 pb-3">
            <div className="flex items-center gap-2">
              <Layers className="size-5 text-primary" />
              <h3 className="text-sm font-bold uppercase tracking-wider text-foreground">
                Active Learning Triads
              </h3>
            </div>
            <span className="text-[11px] text-muted-foreground">
              {subGroupsList.length} balanced sub-groups
            </span>
          </div>

          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {subGroupsList.map((sg) => {
              const isMyGroup = currentUser && sg.members.some((m) => m.userId === currentUser.id);

              return (
                <div
                  key={sg.id}
                  className={cn(
                    "flex flex-col justify-between rounded-xl border p-5 transition-all space-y-3",
                    isMyGroup
                      ? "border-primary bg-primary-soft/30 shadow-xs"
                      : "border-border/70 bg-card",
                  )}
                >
                  <div className="flex items-center justify-between">
                    <h4 className="text-sm font-bold text-foreground">{sg.name}</h4>
                    {isMyGroup && (
                      <span className="rounded-full bg-primary/15 px-2 py-0.5 text-[10px] font-bold text-primary">
                        Your Triad
                      </span>
                    )}
                  </div>

                  <ul className="space-y-2">
                    {sg.members.map((m) => {
                      const isLeader = m.userId === sg.leaderUserId;
                      const isMe = currentUser && m.userId === currentUser.id;

                      return (
                        <li key={m.userId} className="flex items-center justify-between gap-2">
                          <div className="flex items-center gap-1.5 min-w-0">
                            <MemberAvatar name={m.name} size="sm" />
                            <span className="truncate text-sm font-medium text-foreground">
                              {m.name} {isMe && "(you)"}
                            </span>
                            {isLeader && (
                              <Crown
                                className="size-4 text-warning shrink-0"
                                title="Auto-elected Triad Leader"
                              />
                            )}
                          </div>
                          <SkillBadge level={m.skillLevel} className="text-[9px] py-0 px-1.5" />
                        </li>
                      );
                    })}
                  </ul>

                  {isMyGroup && (
                    <Button asChild size="sm" className="w-full text-sm gap-1 mt-1">
                      <Link to={ROUTES.subGroup} params={{ circleId: activeCircle.id }}>
                        <span>Open Workspace</span>
                        <ArrowRight className="size-4" />
                      </Link>
                    </Button>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Member Roster List */}
      <div className="surface p-6 space-y-4">
        <div className="flex items-center justify-between border-b border-border/60 pb-3">
          <div className="flex items-center gap-2">
            <Users className="size-5 text-primary" />
            <h3 className="text-sm font-bold uppercase tracking-wider text-foreground">
              Circle Members ({activeCircle.members.length})
            </h3>
          </div>
          <span className="text-[11px] text-muted-foreground">
            {isGrouped ? "Assessed skill tiers" : "Skill levels stay private until grouping"}
          </span>
        </div>

        <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
          {activeCircle.members.map((m) => {
            const isMe = currentUser && m.userId === currentUser.id;

            return (
              <div
                key={m.userId}
                className="flex items-center justify-between gap-4 rounded-lg border border-border/60 bg-card p-2.5 shadow-2xs"
              >
                <div className="flex items-center gap-2.5 min-w-0">
                  <span className="grid size-8 shrink-0 place-items-center rounded-full bg-primary-soft text-sm font-semibold text-primary">
                    {initials(m.name)}
                  </span>
                  <div className="min-w-0">
                    <p className="truncate text-sm font-semibold text-foreground">
                      {m.name} {isMe && "(you)"}
                    </p>
                    <p className="text-[10px] text-muted-foreground truncate">
                      Joined {formatDate(m.joinedAt)}
                    </p>
                  </div>
                </div>

                <div className="shrink-0">
                  {isGrouped ? (
                    <SkillBadge level={m.skillLevel} className="text-[9px] py-0 px-1.5" />
                  ) : (
                    <span className="text-[10px] text-muted-foreground font-medium bg-muted/60 px-2 py-0.5 rounded">
                      Enrolled
                    </span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Footer navigation actions */}
      <div className="flex flex-wrap items-center justify-between gap-4 pt-2">
        <Button asChild variant="outline" size="sm" className="gap-1.5 text-sm">
          <Link to={ROUTES.circle} params={{ circleId: activeCircle.id }}>
            <span>View Full Circle Page</span>
            <ArrowRight className="size-4.5" />
          </Link>
        </Button>

        <div className="flex items-center gap-2">
          <Button asChild variant="ghost" size="sm" className="text-sm text-muted-foreground">
            <Link to={ROUTES.recommended}>Browse more circles</Link>
          </Button>
        </div>
      </div>
    </div>
  );
}
