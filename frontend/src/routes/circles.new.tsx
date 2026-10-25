import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState, type FormEvent } from "react";
import { Info } from "lucide-react";
import { AppShell } from "@/components/layout/AppShell";
import { PageHeader } from "@/components/layout/PageHeader";
import { CirclePreferenceFields } from "@/components/forms/CirclePreferenceFields";
import { SkillQuizWizard } from "@/components/forms/SkillQuizWizard";
import { NativeSelect } from "@/components/forms/NativeSelect";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { ROUTES, TOPICS } from "@/constants";
import { CIRCLE_SIZE_OPTIONS, createCircle } from "@/services/circleService";
import type { AssessmentResult } from "@/services/assessmentService";
import type { CirclePreferences, SkillLevel } from "@/types";

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

const MAX_DESCRIPTION = 300;

function MakeCirclePage() {
  const navigate = useNavigate();
  const [preferences, setPreferences] = useState<CirclePreferences>(DEFAULT_PREFERENCES);
  const [capacity, setCapacity] = useState<number>(CIRCLE_SIZE_OPTIONS[0] ?? 9);
  const [description, setDescription] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [showQuiz, setShowQuiz] = useState(false);

  const canSubmit = !submitting && !!preferences.deadline && description.trim().length >= 10;

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    if (!canSubmit) return;
    setShowQuiz(true);
  };

  const handleQuizComplete = async (_level: SkillLevel, result: AssessmentResult) => {
    setSubmitting(true);
    try {
      const created = await createCircle({ ...preferences, description, capacity }, result.answers);
      // Show the new circle on its own page (members, progress, details).
      navigate({ to: ROUTES.circle, params: { circleId: created.id } });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <AppShell>
      <div className="mx-auto max-w-2xl">
        <PageHeader
          eyebrow="Make a circle"
          title="Set up your circle"
          description={`Others with matching preferences will find it. Grouping runs automatically once your circle reaches the size you choose.`}
        />

        {showQuiz ? (
          <SkillQuizWizard
            topic={preferences.topic}
            onComplete={handleQuizComplete}
            onCancel={() => setShowQuiz(false)}
            confirmButtonLabel="Create Circle"
          />
        ) : (
          <form onSubmit={handleSubmit} className="surface space-y-6 p-6 sm:p-8">
            <CirclePreferenceFields value={preferences} onChange={setPreferences} />

            <div className="space-y-2">
              <Label htmlFor="capacity">Circle size</Label>
              <NativeSelect
                id="capacity"
                value={capacity}
                onChange={(e) => setCapacity(Number(e.target.value))}
              >
                {CIRCLE_SIZE_OPTIONS.map((size) => (
                  <option key={size} value={size}>
                    {size} members
                  </option>
                ))}
              </NativeSelect>
              <p className="text-xs text-muted-foreground">
                Between 9 and 30 members, in steps of 3 so everyone lands in a balanced sub-group.
              </p>
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="description">Aim of this circle</Label>
                <span className="text-xs text-muted-foreground">
                  {description.length}/{MAX_DESCRIPTION}
                </span>
              </div>
              <Textarea
                id="description"
                value={description}
                maxLength={MAX_DESCRIPTION}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="What will this circle work on? e.g. Daily graph problems, weekly mock contests and honest code reviews."
                className="min-h-28 bg-card"
              />
              <p className="text-xs text-muted-foreground">
                Shown on your circle's card in Explore Circles so others know what to expect (min.
                10 characters).
              </p>
            </div>

            <div className="flex items-start gap-2 rounded-lg bg-muted p-4 text-sm text-muted-foreground">
              <Info className="mt-0.5 size-4 shrink-0" />
              <p>
                Creating a circle doesn't make you its leader. You're its first member and will be
                grouped with everyone else once it fills up.
              </p>
            </div>

            <Button type="submit" size="lg" className="w-full sm:w-auto" disabled={!canSubmit}>
              {submitting ? "Creating…" : "Create circle"}
            </Button>
          </form>
        )}
      </div>
    </AppShell>
  );
}
