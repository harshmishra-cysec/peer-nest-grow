import { createFileRoute, Link } from "@tanstack/react-router";
import { useState, type FormEvent } from "react";
import { Info, Users } from "lucide-react";
import { AppShell } from "@/components/layout/AppShell";
import { PageHeader } from "@/components/layout/PageHeader";
import { CirclePreferenceFields } from "@/components/forms/CirclePreferenceFields";
import { Button } from "@/components/ui/button";
import { CIRCLE_CAPACITY, ROUTES, TOPICS } from "@/constants";
import { createCircle } from "@/services/circleService";
import type { Circle, CirclePreferences } from "@/types";

export const Route = createFileRoute("/circles/new")({
  head: () => ({
    meta: [
      { title: "Make a circle — SkillNest" },
      {
        name: "description",
        content: "Start a new learning circle around a topic, goal and deadline.",
      },
      { property: "og:title", content: "Make a circle — SkillNest" },
      {
        property: "og:description",
        content: "Start a new learning circle around a topic, goal and deadline.",
      },
    ],
  }),
  component: MakeCirclePage,
});

const DEFAULT_PREFERENCES: CirclePreferences = {
  topic: TOPICS[0],
  goalType: "Learn",
  commitment: "Casual",
  deadline: "",
};

function MakeCirclePage() {
  const [preferences, setPreferences] = useState<CirclePreferences>(DEFAULT_PREFERENCES);
  const [submitting, setSubmitting] = useState(false);
  const [createdCircle, setCreatedCircle] = useState<Circle | null>(null);

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    setSubmitting(true);
    try {
      setCreatedCircle(await createCircle(preferences));
    } finally {
      setSubmitting(false);
    }
  };

  if (createdCircle) {
    return (
      <AppShell>
        <div className="mx-auto max-w-lg py-12 text-center">
          <Users className="mx-auto size-8 text-primary" />
          <h1 className="mt-4 text-3xl font-bold">Circle created.</h1>
          <p className="mt-2 text-lg text-muted-foreground">
            Waiting for members ({createdCircle.members.length}/{CIRCLE_CAPACITY}).
          </p>
          <p className="mt-6 rounded-lg bg-muted p-4 text-sm text-muted-foreground">
            You'll be grouped with your circle once it fills up — just like everyone else.
          </p>
          <div className="mt-8 flex justify-center gap-2">
            <Button asChild variant="outline">
              <Link to={ROUTES.recommended}>Browse other circles</Link>
            </Button>
            <Button asChild>
              <Link to={ROUTES.profile}>Go to my profile</Link>
            </Button>
          </div>
        </div>
      </AppShell>
    );
  }

  return (
    <AppShell>
      <div className="mx-auto max-w-2xl">
        <PageHeader
          eyebrow="Make a circle"
          title="Set up your circle"
          description={`Others with matching preferences will find it. Grouping runs automatically at ${CIRCLE_CAPACITY} members.`}
        />

        <form onSubmit={handleSubmit} className="surface space-y-6 p-6 sm:p-8">
          <CirclePreferenceFields value={preferences} onChange={setPreferences} />

          <div className="flex items-start gap-2 rounded-lg bg-muted p-4 text-sm text-muted-foreground">
            <Info className="mt-0.5 size-4 shrink-0" />
            <p>
              Creating a circle doesn't make you its leader. You're its first member and will be
              grouped with everyone else once it fills up.
            </p>
          </div>

          <Button
            type="submit"
            size="lg"
            className="w-full sm:w-auto"
            disabled={submitting || !preferences.deadline}
          >
            Create circle
          </Button>
        </form>
      </div>
    </AppShell>
  );
}
