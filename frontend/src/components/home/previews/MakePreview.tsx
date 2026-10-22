import { Calendar, CheckCircle2, ShieldCheck, Sparkles, Target, Users } from "lucide-react";
import { PreviewHero } from "../PreviewHero";
import { ROUTES } from "@/constants";

/**
 * 2. Make a Circle Preview:
 * - 3-step explainer (pick topic, set goal and deadline, peers join you)
 * - Note that the creator is a regular member, not a leader.
 * - CTA "Create circle" -> ROUTES.makeCircle.
 */
export function MakePreview() {
  const steps = [
    {
      num: "01",
      title: "Pick your topic & goal",
      desc: "Choose the subject you want to master and whether you want to Learn, Build, or Compete.",
      Icon: Target,
    },
    {
      num: "02",
      title: "Set cadence & deadline",
      desc: "Choose Casual or Serious pace, plus a realistic completion date for the whole circle.",
      Icon: Calendar,
    },
    {
      num: "03",
      title: "Peers join you to capacity",
      desc: "SkillNest matches other motivated learners into your circle until 9 spots fill up.",
      Icon: Users,
    },
  ];

  return (
    <div className="space-y-6">
      <PreviewHero
        label="CREATOR WORKFLOW"
        title="Start a new circle with peers"
        description="Launch a cohort around any topic and gather motivated learners to share your journey."
        ctaText="Create circle"
        ctaLink={ROUTES.makeCircle}
      />

      {/* 3-Step Explainer Grid */}
      <div className="grid gap-4 md:grid-cols-3">
        {steps.map(({ num, title, desc, Icon }) => (
          <div key={num} className="surface p-6 flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between">
                <span className="font-display text-base font-extrabold text-primary">{num}</span>
                <div className="flex size-8 items-center justify-center rounded-lg bg-primary-soft text-primary">
                  <Icon className="size-5" />
                </div>
              </div>
              <h3 className="mt-3 font-display text-base font-bold text-foreground">{title}</h3>
              <p className="mt-1 text-sm text-muted-foreground leading-relaxed">{desc}</p>
            </div>
            <div className="mt-4 pt-3 border-t border-border/60">
              <span className="inline-flex items-center gap-1 text-[11px] font-medium text-primary">
                <CheckCircle2 className="size-4" /> Step verified
              </span>
            </div>
          </div>
        ))}
      </div>

      {/* Note that creator is a regular member, not a leader */}
      <div className="flex items-start gap-4 rounded-xl border border-border bg-card p-5 shadow-2xs">
        <div className="flex size-7 shrink-0 items-center justify-center rounded-lg bg-muted text-muted-foreground">
          <ShieldCheck className="size-5 text-foreground" />
        </div>
        <div className="space-y-0.5">
          <p className="text-sm font-semibold text-foreground">Decentralized peer ownership</p>
          <p className="text-sm text-muted-foreground leading-relaxed">
            The creator is simply the first regular member of the circle — never a permanent leader.
            When capacity is reached, sub-group leaders are auto-elected strictly based on assessed
            skill levels to mentor their triad.
          </p>
        </div>
      </div>
    </div>
  );
}
