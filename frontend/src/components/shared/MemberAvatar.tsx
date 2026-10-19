import { initials } from "@/lib/format";
import { cn } from "@/lib/utils";

/** Initials avatar; no photos in mock data yet. */
export function MemberAvatar({ name, size = "md" }: { name: string; size?: "sm" | "md" | "lg" }) {
  return (
    <span
      aria-hidden
      className={cn(
        "grid shrink-0 place-items-center rounded-full bg-primary-soft font-semibold text-primary",
        size === "sm" && "size-7 text-[11px]",
        size === "md" && "size-9 text-xs",
        size === "lg" && "size-14 text-base",
      )}
    >
      {initials(name)}
    </span>
  );
}
