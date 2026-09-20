import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState, type FormEvent } from "react";
import { AppShell } from "@/components/layout/AppShell";
import { PageHeader } from "@/components/layout/PageHeader";
import { CirclePreferenceFields } from "@/components/forms/CirclePreferenceFields";
import { OptionCards } from "@/components/forms/OptionCards";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { ROUTES, SKILL_LEVELS, TOPICS } from "@/constants";
import type { CirclePreferences, JoinPreferences, SkillLevel } from "@/types";

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
          description="We'll use this to match you with circles. Your skill level is used later to balance your sub-group."
        />

        <form onSubmit={handleSubmit} className="surface space-y-6 p-6 sm:p-8">
          <CirclePreferenceFields value={preferences} onChange={handleCircleFieldsChange} />

          <div className="space-y-2">
            <Label>Your skill level in this topic</Label>
            <OptionCards<SkillLevel>
              name="skillLevel"
              options={SKILL_LEVELS}
              value={preferences.skillLevel}
              onChange={(skillLevel) => setPreferences((prev) => ({ ...prev, skillLevel }))}
            />
            <p className="text-xs text-muted-foreground">
              Be honest — it's how we keep groups balanced.
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
