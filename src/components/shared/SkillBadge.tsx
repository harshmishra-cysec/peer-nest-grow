import type { SkillLevel } from "@/types";
import { cn } from "@/lib/utils";

/** Skill pills are one of only two places pills are allowed (see design notes). */
const SKILL_STYLES: Record<SkillLevel, string> = {
  Beginner: "bg-skill-beginner-soft text-skill-beginner",
  Intermediate: "bg-skill-intermediate-soft text-skill-intermediate",
  Advanced: "bg-skill-advanced-soft text-skill-advanced",
};

export function SkillBadge({ level, className }: { level: SkillLevel; className?: string }) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold",
        SKILL_STYLES[level],
        className,
      )}
    >
      {level}
    </span>
  );
}
