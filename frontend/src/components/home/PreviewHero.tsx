import { Link } from "@tanstack/react-router";
import { ArrowRight, type LucideIcon } from "lucide-react";
import { Button } from "@/components/ui/button";

interface PreviewHeroProps {
  label: string;
  title: string;
  description: string;
  ctaText?: string;
  ctaLink?: string;
  ctaParams?: Record<string, string>;
  Icon?: LucideIcon;
  badge?: string;
}

/**
 * Gradient hero banner for previews:
 * - Bumped sizing (text-base, larger headings, spacious padding)
 * - Click feedback (active:scale-[0.98], focus ring, hover elevation)
 * - Responsive layout filling screen viewport gracefully
 */
export function PreviewHero({
  label,
  title,
  description,
  ctaText,
  ctaLink,
  ctaParams,
  Icon,
  badge,
}: PreviewHeroProps) {
  return (
    <div className="hero-gradient group relative overflow-hidden rounded-2xl border border-sky-200/60 bg-gradient-to-br from-white via-sky-50/50 to-blue-50/40 p-6 sm:p-8 shadow-xs transition-shadow hover:shadow-sm">
      {/* Subtle shine sweep on hero banner hover */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/20 to-transparent skew-x-12 transition-transform duration-1000 ease-out group-hover:translate-x-full"
      />

      <div className="relative flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between">
        <div className="space-y-2 max-w-3xl">
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-xs font-bold tracking-wider text-primary uppercase">
              {label}
            </span>
            {badge && (
              <span className="rounded-full border border-sky-200 bg-sky-100/70 px-2.5 py-0.5 text-xs font-semibold text-primary">
                {badge}
              </span>
            )}
          </div>

          <h2 className="font-display text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">
            {title}
          </h2>

          <p className="text-sm text-slate-600 sm:text-base leading-relaxed line-clamp-2">
            {description}
          </p>
        </div>

        {ctaText && ctaLink && (
          <div className="shrink-0">
            <Button
              asChild
              className="gap-2 rounded-xl px-5 py-2.5 text-sm font-semibold shadow-sm transition-all duration-200 hover:shadow-md active:scale-[0.98] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2"
            >
              <Link to={ctaLink} params={ctaParams}>
                {Icon && <Icon className="size-4" />}
                <span>{ctaText}</span>
                <ArrowRight className="size-4" />
              </Link>
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
