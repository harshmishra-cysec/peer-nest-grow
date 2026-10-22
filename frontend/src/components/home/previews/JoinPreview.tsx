import { GraduationCap, Info, Sparkles } from "lucide-react";
import { PreviewHero } from "../PreviewHero";
import {
  COMMITMENT_HINTS,
  COMMITMENT_LEVELS,
  GOAL_TYPE_HINTS,
  GOAL_TYPES,
  ROUTES,
  TOPICS,
} from "@/constants";

/**
 * 1. Join a Circle Preview:
 * - Read-only display (NOT form controls) of the options from TOPICS,
 *   GOAL_TYPES with GOAL_TYPE_HINTS, COMMITMENT_LEVELS with COMMITMENT_HINTS.
 * - Info card: "You'll take a 5-question skill quiz when you join a circle." No standalone quiz button.
 * - CTA "Find my circles" -> ROUTES.joinPreferences.
 */
export function JoinPreview() {
  return (
    <div className="space-y-6">
      <PreviewHero
        label="STAGE 1 · MATCHING"
        title="Find your ideal learning circle"
        description="Connect with peers aligned on topic, shared mission, and weekly schedule."
        ctaText="Find my circles"
        ctaLink={ROUTES.joinPreferences}
      />

      {/* Info card: skill assessment banner */}
      <div className="flex items-start gap-4 rounded-xl border border-primary/20 bg-primary-soft/60 p-5">
        <div className="flex size-7 shrink-0 items-center justify-center rounded-lg bg-primary text-primary-foreground">
          <GraduationCap className="size-5" />
        </div>
        <div className="space-y-0.5">
          <p className="text-sm font-semibold text-foreground">Honest baseline evaluation</p>
          <p className="text-sm text-muted-foreground leading-relaxed">
            You'll take a 5-question skill quiz when you join a circle. Your score ensures every
            sub-group contains a 1:1:1 balance of Beginner, Intermediate, and Advanced peers.
          </p>
        </div>
      </div>

      {/* Read-only reference layout */}
      <div className="grid gap-4 md:grid-cols-3">
        {/* Available Topics */}
        <div className="surface p-5 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-2">
              <h3 className="text-sm font-bold text-foreground uppercase tracking-wider">Topics</h3>
              <span className="text-[10px] text-muted-foreground">{TOPICS.length} fields</span>
            </div>
            <div className="flex flex-wrap gap-1.5 pt-1">
              {TOPICS.slice(0, 4).map((topic) => (
                <span
                  key={topic}
                  className="rounded-md border border-border bg-card px-2.5 py-1 text-sm font-medium text-foreground shadow-2xs"
                >
                  {topic}
                </span>
              ))}
              {TOPICS.length > 4 && (
                <span className="rounded-md border border-dashed border-border px-2 py-1 text-[11px] text-muted-foreground">
                  +{TOPICS.length - 4} more
                </span>
              )}
            </div>
          </div>
          <p className="pt-3 text-[11px] text-muted-foreground">
            Circles focus deeply on one specific subject until completion.
          </p>
        </div>

        {/* Goal Types */}
        <div className="surface p-5 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-2">
              <h3 className="text-sm font-bold text-foreground uppercase tracking-wider">Goals</h3>
              <span className="text-[10px] text-muted-foreground">{GOAL_TYPES.length} paths</span>
            </div>
            <ul className="space-y-2 pt-1">
              {GOAL_TYPES.map((goal) => (
                <li key={goal} className="text-sm">
                  <span className="font-semibold text-foreground">{goal}</span>:{" "}
                  <span className="text-muted-foreground">{GOAL_TYPE_HINTS[goal]}</span>
                </li>
              ))}
            </ul>
          </div>
          <p className="pt-3 text-[11px] text-muted-foreground">
            Teams align on either theory, building artifacts, or competition prep.
          </p>
        </div>

        {/* Commitment Levels */}
        <div className="surface p-5 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-2">
              <h3 className="text-sm font-bold text-foreground uppercase tracking-wider">
                Commitment
              </h3>
              <span className="text-[10px] text-muted-foreground">
                {COMMITMENT_LEVELS.length} tempos
              </span>
            </div>
            <ul className="space-y-2 pt-1">
              {COMMITMENT_LEVELS.map((level) => (
                <li key={level} className="text-sm">
                  <span className="font-semibold text-foreground">{level}</span>:{" "}
                  <span className="text-muted-foreground">{COMMITMENT_HINTS[level]}</span>
                </li>
              ))}
            </ul>
          </div>
          <p className="pt-3 text-[11px] text-muted-foreground">
            Matching commitment ensures no teammate is left waiting on unreturned reviews.
          </p>
        </div>
      </div>
    </div>
  );
}
