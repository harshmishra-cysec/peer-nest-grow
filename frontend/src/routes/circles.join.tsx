import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState, type FormEvent } from "react";
import { Award } from "lucide-react";
import { AppShell } from "@/components/layout/AppShell";
import { PageHeader } from "@/components/layout/PageHeader";
import { CirclePreferenceFields } from "@/components/forms/CirclePreferenceFields";
import { Button } from "@/components/ui/button";
import { ROUTES, TOPICS } from "@/constants";
import type { CirclePreferences, JoinPreferences } from "@/types";

export const Route = createFileRoute("/circles/join")({
  head: () => ({
    meta: [
      { title: "What are you looking for? — SkillNest" },
      {
        name: "description",
        content:
          "Tell SkillNest your topic, goal, commitment and skill level to find matching circles.",
      },
      { property: "og:title", content: "What are you looking for? — SkillNest" },
      {
        property: "og:description",
        content:
          "Tell SkillNest your topic, goal, commitment and skill level to find matching circles.",
      },
    ],
  }),
  component: JoinPreferencesPage,
});

const DEFAULT_PREFERENCES: JoinPreferences = {
  topic: TOPICS[0],
  goalType: "Learn",
  commitment: "Casual",
  deadline: "",
  skillLevel: "Beginner",
};

function JoinPreferencesPage() {
  const navigate = useNavigate();
  const [preferences, setPreferences] = useState<JoinPreferences>(DEFAULT_PREFERENCES);

  const handleCircleFieldsChange = (circleFields: CirclePreferences) =>
    setPreferences((prev) => ({ ...prev, ...circleFields }));

  // Preferences travel as search params so the recommendations page can rank against them.
  // The skill quiz is NOT asked here — it is asked once, when you join a specific circle.
  const handleSubmit = (event: FormEvent) => {
    event.preventDefault();
    navigate({ to: ROUTES.recommended, search: preferences });
  };

  return (
    <AppShell>
      <div className="mx-auto max-w-2xl">
        <PageHeader
          eyebrow="Join a circle"
          title="What are you looking for?"
          description="We'll use this to match you with circles. Your skill level is assessed with a short quiz when you join a circle."
        />

        <form onSubmit={handleSubmit} className="surface space-y-6 p-6 sm:p-8">
          <CirclePreferenceFields value={preferences} onChange={handleCircleFieldsChange} />

          <div className="flex items-start gap-3 rounded-xl border border-primary/20 bg-primary-soft/60 p-4">
            <Award className="mt-0.5 size-5 shrink-0 text-primary" />
            <p className="text-sm text-muted-foreground">
              A quick 5-question quiz on the circle's topic is taken when you join a circle, so
              your sub-group is balanced for that subject.
            </p>
          </div>

          <Button type="submit" size="lg" className="w-full sm:w-auto">
            Find circles
          </Button>
        </form>
      </div>
    </AppShell>
  );
}
