import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState, type FormEvent } from "react";
import { Award } from "lucide-react";
import { AppShell } from "@/components/layout/AppShell";
import { PageHeader } from "@/components/layout/PageHeader";
import { CirclePreferenceFields } from "@/components/forms/CirclePreferenceFields";
import { SkillQuizWizard } from "@/components/forms/SkillQuizWizard";
import { SkillBadge } from "@/components/shared/SkillBadge";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { ROUTES, TOPICS } from "@/constants";
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
  const [isTakingQuiz, setIsTakingQuiz] = useState(false);
  const [hasCompletedQuiz, setHasCompletedQuiz] = useState(false);

  const handleCircleFieldsChange = (circleFields: CirclePreferences) =>
    setPreferences((prev) => ({ ...prev, ...circleFields }));

  const handleQuizComplete = (skillLevel: SkillLevel) => {
    setPreferences((prev) => ({ ...prev, skillLevel }));
    setHasCompletedQuiz(true);
    setIsTakingQuiz(false);
  };

  // Preferences travel as search params so the recommendations page can rank against them.
  const handleSubmit = (event: FormEvent) => {
    event.preventDefault();
    if (!hasCompletedQuiz) {
      setIsTakingQuiz(true);
      return;
    }
    navigate({ to: ROUTES.recommended, search: preferences });
  };

  return (
    <AppShell>
      <div className="mx-auto max-w-2xl">
        <PageHeader
          eyebrow="Join a circle"
          title="What are you looking for?"
          description="We'll use this to match you with circles. Your assessed skill level is used later to balance your sub-group."
        />

        {isTakingQuiz ? (
          <SkillQuizWizard
            topic={preferences.topic}
            confirmButtonLabel="Save Level & Continue"
            onComplete={handleQuizComplete}
            onCancel={() => setIsTakingQuiz(false)}
          />
        ) : (
          <form onSubmit={handleSubmit} className="surface space-y-6 p-6 sm:p-8">
            <CirclePreferenceFields value={preferences} onChange={handleCircleFieldsChange} />

            <div className="space-y-3 rounded-xl border border-border bg-card p-5">
              <div className="flex items-center justify-between">
                <div>
                  <Label className="text-sm font-semibold">Skill Level Assessment</Label>
                  <p className="text-xs text-muted-foreground">
                    Based on our 5-question peer readiness evaluation.
                  </p>
                </div>
                {hasCompletedQuiz ? (
                  <SkillBadge level={preferences.skillLevel} className="text-xs font-semibold" />
                ) : (
                  <span className="rounded-md bg-muted px-2 py-0.5 text-xs text-muted-foreground">
                    Not assessed yet
                  </span>
                )}
              </div>

              <div className="flex items-center justify-between pt-1">
                <p className="text-xs text-muted-foreground">
                  {hasCompletedQuiz
                    ? `Assessed as ${preferences.skillLevel} in ${preferences.topic}.`
                    : "Complete a quick 1-minute quiz to evaluate your level."}
                </p>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setIsTakingQuiz(true)}
                  className="gap-1.5"
                >
                  <Award className="size-3.5 text-primary" />
                  {hasCompletedQuiz ? "Retake Quiz" : "Take Skill Quiz"}
                </Button>
              </div>
            </div>

            <Button type="submit" size="lg" className="w-full sm:w-auto">
              {hasCompletedQuiz ? "Find circles" : "Take Skill Quiz to Continue"}
            </Button>
          </form>
        )}
      </div>
    </AppShell>
  );
}
