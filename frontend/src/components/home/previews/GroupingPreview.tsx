import { Crown, Sparkles } from "lucide-react";
import { PreviewHero } from "../PreviewHero";
import { MemberAvatar } from "@/components/shared/MemberAvatar";
import { SkillBadge } from "@/components/shared/SkillBadge";
import { ROUTES, SUB_GROUP_SIZE } from "@/constants";

/**
 * 8. Balanced Grouping Preview:
 * - CSS-only animated "Example" diagram:
 *   Advanced, Intermediate and Beginner member avatars merging into groups of SUB_GROUP_SIZE (3),
 *   with a Crown on the Advanced member of each group.
 * - Use Advanced / Intermediate / Beginner labels (via SkillBadge), not Strong/Weak.
 * - Must be clearly labeled "Example".
 * - Respects prefers-reduced-motion via motion-safe classes.
 */
export function GroupingPreview() {
  // Illustrative members labeled "Example" as strictly mandated
  const examplePool = [
    { name: "Priya N.", level: "Advanced" as const },
    { name: "Dev P.", level: "Advanced" as const },
    { name: "Harsh M.", level: "Intermediate" as const },
    { name: "Sana K.", level: "Intermediate" as const },
    { name: "Rohan D.", level: "Beginner" as const },
    { name: "Arjun V.", level: "Beginner" as const },
  ];

  const exampleGroups = [
    {
      id: "group-1",
      name: "Sub-Group Alpha",
      members: [
        { name: "Priya N.", level: "Advanced" as const, isLeader: true },
        { name: "Harsh M.", level: "Intermediate" as const, isLeader: false },
        { name: "Rohan D.", level: "Beginner" as const, isLeader: false },
      ],
    },
    {
      id: "group-2",
      name: "Sub-Group Beta",
      members: [
        { name: "Dev P.", level: "Advanced" as const, isLeader: true },
        { name: "Sana K.", level: "Intermediate" as const, isLeader: false },
        { name: "Arjun V.", level: "Beginner" as const, isLeader: false },
      ],
    },
  ];

  return (
    <div className="space-y-6">
      <PreviewHero
        label="STAGE 2 · FORMATION ENGINE"
        title="Balanced Grouping Algorithm"
        description="Every sub-group holds one Beginner, one Intermediate, and one Advanced learner."
        ctaText="Find my circle"
        ctaLink={ROUTES.recommended}
      />

      {/* Mandatory "Example" callout card */}
      <div className="flex items-center justify-between rounded-xl border border-primary/20 bg-primary-soft/50 p-5">
        <div className="flex items-center gap-2">
          <span className="rounded-full bg-primary px-2 py-0.5 text-[10px] font-bold text-primary-foreground uppercase tracking-wider">
            Example
          </span>
          <p className="text-sm text-foreground font-semibold">
            Illustrative 1:1:1 Triad Synthesis Model
          </p>
        </div>
        <span className="text-[11px] text-muted-foreground hidden sm:inline">
          Sub-group capacity: {SUB_GROUP_SIZE} members
        </span>
      </div>

      {/* Visual Formation Diagram */}
      <div className="surface p-6 space-y-6">
        {/* Tier 1: Evaluated Cohort Pool */}
        <div>
          <div className="flex items-center justify-between pb-2 border-b border-border/60">
            <span className="text-sm font-bold text-muted-foreground uppercase tracking-wider">
              1. Assessed Member Pool (Example)
            </span>
            <span className="text-[10px] text-muted-foreground">Sorted by skill quiz score</span>
          </div>

          <div className="mt-3 grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2.5">
            {examplePool.map((m) => (
              <div
                key={m.name}
                className="flex flex-col items-center justify-center p-2.5 rounded-xl border border-border/70 bg-card text-center space-y-1.5 shadow-2xs transition-all hover:scale-105 motion-safe:duration-200"
              >
                <MemberAvatar name={m.name} size="sm" />
                <span className="text-sm font-semibold text-foreground truncate max-w-[80px]">
                  {m.name}
                </span>
                <SkillBadge level={m.level} className="text-[9px] py-0 px-1.5" />
              </div>
            ))}
          </div>
        </div>

        {/* Transition indicator */}
        <div className="flex items-center justify-center gap-4 text-sm text-primary font-semibold">
          <div className="h-px bg-border flex-1" />
          <span className="flex items-center gap-1.5 bg-primary-soft px-3 py-1 rounded-full border border-primary/20">
            <Sparkles className="size-4.5 text-primary motion-safe:animate-pulse" />
            <span>Algorithm distributes into balanced triads of {SUB_GROUP_SIZE}</span>
          </span>
          <div className="h-px bg-border flex-1" />
        </div>

        {/* Tier 2: Resulting Balanced Triads */}
        <div>
          <div className="flex items-center justify-between pb-2 border-b border-border/60">
            <span className="text-sm font-bold text-muted-foreground uppercase tracking-wider">
              2. Formed Triads with Auto-Elected Leaders (Example)
            </span>
            <span className="text-[10px] text-success font-semibold">
              Balanced 1:1:1 Distribution
            </span>
          </div>

          <div className="mt-3 grid gap-4 sm:grid-cols-2">
            {exampleGroups.map((group) => (
              <div
                key={group.id}
                className="rounded-xl border-2 border-primary/20 bg-card p-5 space-y-3 shadow-sm"
              >
                <div className="flex items-center justify-between">
                  <h4 className="font-display text-base font-bold text-foreground">{group.name}</h4>
                  <span className="rounded-full bg-success-soft px-2 py-0.5 text-[10px] font-semibold text-success">
                    100% Balanced
                  </span>
                </div>

                <div className="grid grid-cols-3 gap-2">
                  {group.members.map((member) => (
                    <div
                      key={member.name}
                      className="flex flex-col items-center p-2 rounded-lg border border-border/70 bg-muted/30 text-center space-y-1 relative"
                    >
                      {member.isLeader && (
                        <div
                          className="absolute -top-2 right-1 flex items-center gap-0.5 rounded-full bg-warning-soft px-1.5 py-0.5 text-[9px] font-bold text-warning-foreground border border-warning/30 shadow-2xs"
                          title="Auto-elected Sub-group Leader"
                        >
                          <Crown className="size-2.5 text-warning" />
                          <span>Leader</span>
                        </div>
                      )}
                      <MemberAvatar name={member.name} size="sm" />
                      <span className="text-sm font-semibold text-foreground truncate max-w-[80px]">
                        {member.name}
                      </span>
                      <SkillBadge level={member.level} className="text-[9px] py-0 px-1.5" />
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
