import { createFileRoute, Link } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { Search } from "lucide-react";
import { AppShell } from "@/components/layout/AppShell";
import { PageHeader } from "@/components/layout/PageHeader";
import { NativeSelect } from "@/components/forms/NativeSelect";
import { CircleMeta } from "@/components/shared/CircleMeta";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { GOAL_TYPES, ROUTES, TOPICS } from "@/constants";
import { useAsyncData } from "@/hooks/useAsyncData";
import { getCircleCapacity, getRecommendedCircles, isCircleFull } from "@/services/circleService";
import type { JoinPreferences } from "@/types";

/** Defaults let the page work when opened from the nav without a preference form. */
const DEFAULT_SEARCH: JoinPreferences = {
  topic: TOPICS[0],
  goalType: "Learn",
  commitment: "Casual",
  deadline: "",
  skillLevel: "Beginner",
};

export const Route = createFileRoute("/circles/recommended")({
  // All fields optional so the page can be linked to without preferences.
  validateSearch: (raw: Record<string, unknown>): Partial<JoinPreferences> =>
    raw as Partial<JoinPreferences>,
  head: () => ({
    meta: [
      { title: "Recommended circles — SkillNest" },
      { name: "description", content: "Circles that match your topic, goal and commitment." },
      { property: "og:title", content: "Recommended circles — SkillNest" },
      {
        property: "og:description",
        content: "Circles that match your topic, goal and commitment.",
      },
    ],
  }),
  component: RecommendedCirclesPage,
});

const ANY = "Any";

function RecommendedCirclesPage() {
  const searchParams = Route.useSearch();
  const preferences: JoinPreferences = { ...DEFAULT_SEARCH, ...searchParams };
  const { data: circles, loading } = useAsyncData(
    () => getRecommendedCircles(preferences),
    [preferences.topic, preferences.goalType, preferences.commitment],
  );

  const [query, setQuery] = useState("");
  const [topicFilter, setTopicFilter] = useState<string>(ANY);
  const [goalFilter, setGoalFilter] = useState<string>(ANY);

  const visibleCircles = useMemo(() => {
    const needle = query.trim().toLowerCase();
    return (circles ?? []).filter(
      (circle) =>
        (topicFilter === ANY || circle.topic === topicFilter) &&
        (goalFilter === ANY || circle.goalType === goalFilter) &&
        (needle === "" ||
          circle.name.toLowerCase().includes(needle) ||
          circle.topic.toLowerCase().includes(needle) ||
          circle.description.toLowerCase().includes(needle)),
    );
  }, [circles, query, topicFilter, goalFilter]);

  return (
    <AppShell>
      <PageHeader
        eyebrow="Recommended"
        title="Circles that fit you"
        description="Ranked by how closely they match your preferences. Full circles are shown for reference."
      />

      <div className="mb-6 grid gap-2 sm:grid-cols-[1fr_auto_auto]">
        <div className="relative">
          <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search circles"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="h-10 bg-card pl-9"
          />
        </div>
        <NativeSelect
          value={topicFilter}
          onChange={(e) => setTopicFilter(e.target.value)}
          className="sm:w-56"
          aria-label="Filter by topic"
        >
          <option value={ANY}>All topics</option>
          {TOPICS.map((topic) => (
            <option key={topic}>{topic}</option>
          ))}
        </NativeSelect>
        <NativeSelect
          value={goalFilter}
          onChange={(e) => setGoalFilter(e.target.value)}
          className="sm:w-40"
          aria-label="Filter by goal"
        >
          <option value={ANY}>All goals</option>
          {GOAL_TYPES.map((goal) => (
            <option key={goal}>{goal}</option>
          ))}
        </NativeSelect>
      </div>

      {loading ? (
        <p className="text-sm text-muted-foreground">Finding circles…</p>
      ) : visibleCircles.length === 0 ? (
        <p className="text-sm text-muted-foreground">No circles match those filters.</p>
      ) : (
        <ul className="grid gap-4 md:grid-cols-2">
          {visibleCircles.map((circle) => {
            const full = isCircleFull(circle);
            const capacity = getCircleCapacity(circle);
            const count = circle.members.length;
            const percent = Math.min(100, Math.round((count / capacity) * 100));
            return (
              <li
                key={circle.id}
                className="surface group flex flex-col overflow-hidden p-0 transition-all duration-200 hover:-translate-y-0.5"
              >
                <div className="h-1.5 bg-gradient-to-r from-primary via-blue-500 to-sky-400" />
                <div className="flex flex-1 flex-col p-6">
                  <div className="flex items-center justify-between gap-2">
                    <span className="rounded-full bg-primary-soft px-3 py-1 text-xs font-semibold text-primary">
                      {circle.topic}
                    </span>
                    <span
                      className={
                        full
                          ? "rounded-full bg-muted px-2.5 py-1 text-xs font-semibold text-muted-foreground"
                          : "rounded-full bg-emerald-50 px-2.5 py-1 text-xs font-semibold text-emerald-700"
                      }
                    >
                      {full ? "Full" : `${capacity - count} spots left`}
                    </span>
                  </div>

                  <h2 className="mt-3 text-xl font-semibold tracking-tight">{circle.name}</h2>

                  {circle.description && (
                    <div className="mt-3 flex-1 rounded-xl border border-sky-100 bg-sky-50/50 p-3.5">
                      <p className="text-[11px] font-bold uppercase tracking-wider text-primary">
                        Aim of this circle
                      </p>
                      <p className="mt-1 line-clamp-3 text-sm leading-relaxed text-slate-600">
                        {circle.description}
                      </p>
                    </div>
                  )}

                  <CircleMeta
                    circle={circle}
                    className="mt-4 flex flex-wrap gap-x-4 gap-y-2 text-sm text-muted-foreground"
                  />

                  <div className="mt-4 h-1.5 overflow-hidden rounded-full bg-muted">
                    <div
                      className="h-full rounded-full bg-primary transition-all"
                      style={{ width: `${percent}%` }}
                    />
                  </div>

                  <div className="mt-5 flex items-center justify-between">
                    <Link
                      to={ROUTES.circle}
                      params={{ circleId: circle.id }}
                      className="text-sm font-semibold text-primary hover:underline"
                    >
                      View circle
                    </Link>
                    {full ? (
                      <span className="text-sm font-semibold text-muted-foreground">Full</span>
                    ) : (
                      <Button asChild>
                        <Link to={ROUTES.circle} params={{ circleId: circle.id }}>
                          Join
                        </Link>
                      </Button>
                    )}
                  </div>
                </div>
              </li>
            );
          })}
        </ul>
      )}
    </AppShell>
  );
}
