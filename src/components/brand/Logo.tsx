import { Link } from "@tanstack/react-router";
import { ROUTES } from "@/constants";
import { cn } from "@/lib/utils";

/** Wordmark with a small nest glyph. Links home. */
export function Logo({ className }: { className?: string }) {
  return (
    <Link to={ROUTES.landing} className={cn("inline-flex items-center gap-2", className)}>
      <span
        aria-hidden
        className="grid size-7 place-items-center rounded-lg bg-primary text-primary-foreground"
      >
        <svg
          viewBox="0 0 24 24"
          className="size-4"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M4 14c0 4 3.6 6 8 6s8-2 8-6" />
          <path d="M3 11c2-1 5-1 9-1s7 0 9 1" />
          <circle cx="12" cy="7" r="2.5" />
        </svg>
      </span>
      <span className="font-display text-lg font-bold tracking-tight">SkillNest</span>
    </Link>
  );
}
