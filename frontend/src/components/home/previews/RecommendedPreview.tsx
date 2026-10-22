import { Link } from "@tanstack/react-router";
import { ArrowRight, Calendar, Users } from "lucide-react";
import { PreviewHero } from "../PreviewHero";
import { Button } from "@/components/ui/button";
import { CIRCLE_CAPACITY, ROUTES } from "@/constants";
import { formatDate } from "@/lib/format";
import { isCircleFull } from "@/services/circleService";
import type { Circle, User } from "@/types";

interface RecommendedPreviewProps {
  circles: Circle[];
  currentUser: User;
}

/**
 * 3. Recommended Circles Preview:
 * - Up to 4 circles from getCircles() that the user has not joined,
 *   status Open and not isCircleFull, in a 2x2 grid.
 * - Each card: topic, name, goal, commitment, deadline (formatDate),
 *   members x/CIRCLE_CAPACITY, "Join" or "Full" badge.
 * - No search bar here.
 * - CTA "Browse all" -> ROUTES.recommended.
 */
export function RecommendedPreview({ circles, currentUser }: RecommendedPreviewProps) {
  // Filter circles that the user has not joined, status Open and not full
  const openCircles = circles
    .filter(
      (c) =>
        !c.members.some((m) => m.userId === currentUser.id) &&
        c.status === "Open" &&
        !isCircleFull(c),
    )
    .slice(0, 4);

  return (
    <div className="space-y-6">
      <PreviewHero
        label="CURATED RECOMMENDATIONS"
        title="Open cohorts looking for peers"
        description="Jump into an open circle matching your pace. Grouping begins automatically when full."
        ctaText="Browse all"
        ctaLink={ROUTES.recommended}
      />

      {openCircles.length === 0 ? (
        <div className="surface p-8 text-center space-y-3">
          <p className="text-base font-semibold text-foreground">No open circles right now</p>
          <p className="text-sm text-muted-foreground max-w-sm mx-auto">
            You've joined all matching circles, or all cohorts are currently full and undergoing
            grouping.
          </p>
          <Button asChild size="sm">
            <Link to={ROUTES.makeCircle}>Start your own circle</Link>
          </Button>
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2">
          {openCircles.map((circle) => {
            const full = isCircleFull(circle);
            return (
              <div
                key={circle.id}
                className="surface flex flex-col justify-between p-6 transition-all hover:border-primary/40 hover:shadow-md"
              >
                <div>
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-[11px] font-bold tracking-wider text-primary uppercase truncate">
                      {circle.topic}
                    </span>
                    <span
                      className={`rounded-full px-2 py-0.5 text-[10px] font-semibold ${
                        full ? "bg-muted text-muted-foreground" : "bg-success-soft text-success"
                      }`}
                    >
                      {full ? "Full" : "Open"}
                    </span>
                  </div>

                  <h3 className="mt-2 font-display text-lg font-bold text-foreground line-clamp-1">
                    {circle.name}
                  </h3>

                  <div className="mt-2 flex flex-wrap gap-1.5 text-sm text-muted-foreground">
                    <span className="rounded bg-muted px-1.5 py-0.5 text-[11px] font-medium text-foreground">
                      {circle.goalType}
                    </span>
                    <span className="rounded bg-muted px-1.5 py-0.5 text-[11px] font-medium text-foreground">
                      {circle.commitment}
                    </span>
                  </div>

                  <div className="mt-4 flex items-center justify-between text-sm text-muted-foreground pt-3 border-t border-border/60">
                    <span className="flex items-center gap-1.5">
                      <Calendar className="size-4.5" /> Due {formatDate(circle.deadline)}
                    </span>
                    <span className="flex items-center gap-1 font-medium text-foreground">
                      <Users className="size-4.5 text-muted-foreground" />
                      {circle.members.length}/{CIRCLE_CAPACITY}
                    </span>
                  </div>
                </div>

                <div className="mt-4 pt-2">
                  <Button asChild size="sm" variant="outline" className="w-full text-sm">
                    <Link to={ROUTES.circle} params={{ circleId: circle.id }}>
                      <span>View circle</span>
                      <ArrowRight className="size-4.5 ml-1" />
                    </Link>
                  </Button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
