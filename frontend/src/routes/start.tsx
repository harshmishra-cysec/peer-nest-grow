import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowRight, PlusCircle, Search } from "lucide-react";
import { AppShell } from "@/components/layout/AppShell";
import { ROUTES } from "@/constants";

export const Route = createFileRoute("/start")({
  head: () => ({
    meta: [
      { title: "Join or make a circle — SkillNest" },
      {
        name: "description",
        content: "Choose whether to join an existing learning circle or start a new one.",
      },
      { property: "og:title", content: "Join or make a circle — SkillNest" },
      {
        property: "og:description",
        content: "Choose whether to join an existing learning circle or start a new one.",
      },
    ],
  }),
  component: StartPage,
});

const CHOICES = [
  {
    to: ROUTES.joinPreferences,
    Icon: Search,
    title: "Join a Circle",
    body: "Tell us what you're looking for and we'll match you with circles that fit.",
  },
  {
    to: ROUTES.makeCircle,
    Icon: PlusCircle,
    title: "Make a Circle",
    body: "Start a new circle around a topic and goal. Others will find and join it.",
  },
] as const;

function StartPage() {
  return (
    <AppShell>
      <div className="mx-auto max-w-2xl py-8 text-center">
        <h1 className="text-3xl font-bold sm:text-4xl">How do you want to start?</h1>
        <p className="mt-3 text-muted-foreground">You can always do the other one later.</p>

        <div className="mt-10 grid gap-4 sm:grid-cols-2">
          {CHOICES.map(({ to, Icon, title, body }) => (
            <Link
              key={to}
              to={to}
              className="surface group flex flex-col p-6 text-left transition-colors hover:border-primary"
            >
              <Icon className="size-6 text-primary" />
              <h2 className="mt-4 text-xl font-semibold">{title}</h2>
              <p className="mt-2 flex-1 text-sm leading-relaxed text-muted-foreground">{body}</p>
              <span className="mt-6 inline-flex items-center gap-1 text-sm font-semibold text-primary">
                Continue{" "}
                <ArrowRight className="size-4 transition-transform group-hover:translate-x-0.5" />
              </span>
            </Link>
          ))}
        </div>
      </div>
    </AppShell>
  );
}
