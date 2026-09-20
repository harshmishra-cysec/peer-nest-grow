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
import { getRecommendedCircles, isCircleFull } from "@/services/circleService";
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
            return (
              <li key={circle.id} className="surface flex flex-col p-6">
                <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  {circle.topic}
                </p>
                <h2 className="mt-1 text-xl font-semibold">{circle.name}</h2>
                <p className="mt-2 flex-1 text-sm leading-relaxed text-muted-foreground">
                  {circle.description}
                </p>
                <CircleMeta
                  circle={circle}
                  className="mt-4 flex flex-wrap gap-x-4 gap-y-2 text-sm text-muted-foreground"
                />
                <div className="mt-6 flex items-center justify-between">
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
              </li>
            );
          })}
        </ul>
      )}
    </AppShell>
  );
}
