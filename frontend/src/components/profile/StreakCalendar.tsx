import { useState } from "react";
import { ChevronLeft, ChevronRight, Flame } from "lucide-react";
import { cn } from "@/lib/utils";

const WEEKDAYS = ["SUN", "MON", "TUE", "WED", "THU", "FRI", "SAT"];

const keyOf = (d: Date) => `${d.getFullYear()}-${d.getMonth()}-${d.getDate()}`;

/**
 * Month calendar that highlights the current streak (the last N days ending today)
 * as a connected blue band, with a flame on today's date.
 */
export function StreakCalendar({ streakDays }: { streakDays: number }) {
  const today = new Date();
  const [view, setView] = useState(() => new Date(today.getFullYear(), today.getMonth(), 1));

  // Every day that belongs to the streak
  const streakKeys = new Set<string>();
  for (let i = 0; i < streakDays; i++) {
    const d = new Date(today.getFullYear(), today.getMonth(), today.getDate() - i);
    streakKeys.add(keyOf(d));
  }

  const year = view.getFullYear();
  const month = view.getMonth();
  const leading = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const cells: (number | null)[] = [
    ...Array.from({ length: leading }, () => null),
    ...Array.from({ length: daysInMonth }, (_, i) => i + 1),
  ];

  const inStreak = (day: number) => streakKeys.has(keyOf(new Date(year, month, day)));
  const isToday = (day: number) => keyOf(new Date(year, month, day)) === keyOf(today);

  return (
    <section className="surface p-6">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-bold">Streak Calendar</h2>
        <div className="flex items-center gap-1">
          <button
            type="button"
            aria-label="Previous month"
            onClick={() => setView(new Date(year, month - 1, 1))}
            className="grid size-8 place-items-center rounded-full text-slate-500 transition-colors hover:bg-sky-100 hover:text-primary active:scale-95"
          >
            <ChevronLeft className="size-4" />
          </button>
          <span className="min-w-32 text-center text-sm font-semibold text-slate-700">
            {view.toLocaleDateString("en-US", { month: "long", year: "numeric" })}
          </span>
          <button
            type="button"
            aria-label="Next month"
            onClick={() => setView(new Date(year, month + 1, 1))}
            className="grid size-8 place-items-center rounded-full text-slate-500 transition-colors hover:bg-sky-100 hover:text-primary active:scale-95"
          >
            <ChevronRight className="size-4" />
          </button>
        </div>
      </div>

      <div className="mt-5 grid grid-cols-7 text-center text-[11px] font-bold tracking-wider text-slate-400">
        {WEEKDAYS.map((w) => (
          <span key={w}>{w}</span>
        ))}
      </div>

      <div className="mt-2 grid grid-cols-7 gap-y-1.5">
        {cells.map((day, index) => {
          if (day === null) return <span key={`blank-${index}`} />;
          const col = index % 7;
          const active = inStreak(day);
          const prevIn = active && col > 0 && day > 1 && inStreak(day - 1);
          const nextIn = active && col < 6 && day < daysInMonth && inStreak(day + 1);
          const current = isToday(day);

          return (
            <div key={day} className="relative flex h-10 items-center justify-center">
              {active && (
                <span
                  aria-hidden="true"
                  className={cn(
                    "absolute inset-y-0.5 bg-sky-100",
                    prevIn ? "left-0" : "left-0.5 rounded-l-full",
                    nextIn ? "right-0" : "right-0.5 rounded-r-full",
                  )}
                />
              )}
              <span
                className={cn(
                  "relative z-10 grid size-9 place-items-center rounded-full text-sm font-semibold transition-colors",
                  current
                    ? "bg-primary text-white shadow-md"
                    : active
                      ? "text-primary"
                      : "text-slate-600 hover:bg-sky-50",
                )}
              >
                {day}
                {current && streakDays > 0 && (
                  <Flame className="absolute -right-1.5 -top-2 size-5 fill-amber-400 text-amber-500 drop-shadow" />
                )}
              </span>
            </div>
          );
        })}
      </div>

      <p className="mt-4 flex items-center gap-2 text-sm text-slate-500">
        <Flame className="size-4 fill-amber-400 text-amber-500" />
        {streakDays > 0
          ? `${streakDays}-day streak. Keep it going!`
          : "Complete a task today to start a streak."}
      </p>
    </section>
  );
}
