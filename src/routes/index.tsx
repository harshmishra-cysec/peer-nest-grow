import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowRight, Scale, TrendingUp, Users } from "lucide-react";
import { AppShell } from "@/components/layout/AppShell";
import { Button } from "@/components/ui/button";
import { ROUTES, SUB_GROUP_SIZE } from "@/constants";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "SkillNest — Learn together. Grow with the right people." },
      {
        name: "description",
        content:
          "Join topic-based learning circles and get matched into balanced peer groups of three.",
      },
      { property: "og:title", content: "SkillNest — Learn together. Grow with the right people." },
      {
        property: "og:description",
        content:
          "Join topic-based learning circles and get matched into balanced peer groups of three.",
      },
    ],
  }),
  component: LandingPage,
});

const HOW_IT_WORKS = [
  {
    Icon: Users,
    title: "Join or make a Circle",
    body: "Pick a topic, a goal and how serious you are. Circles fill up to nine learners.",
  },
  {
    Icon: Scale,
    title: "Get balanced-grouped",
    body: `Once full, you're placed in a group of ${SUB_GROUP_SIZE} — one beginner, one intermediate, one advanced.`,
  },
  {
    Icon: TrendingUp,
    title: "Learn & track progress",
    body: "Chat, share tasks, confirm each other's work, keep a streak and earn badges.",
  },
];

function LandingPage() {
  return (
    <AppShell variant="public">
      <section className="py-12 text-center sm:py-20">
        <h1 className="mx-auto max-w-3xl text-4xl font-bold leading-tight sm:text-6xl">
          Learn together. <span className="text-primary">Grow with the right people.</span>
        </h1>
        <p className="mx-auto mt-6 max-w-xl text-lg text-muted-foreground">
          SkillNest puts you in a small, skill-balanced group of learners who share your goal — so
          nobody is left behind and nobody is bored.
        </p>
        <Button asChild size="lg" className="mt-8">
          <Link to={ROUTES.auth}>
            Get started <ArrowRight />
          </Link>
        </Button>
      </section>

      <section className="py-12 sm:py-16">
        <h2 className="text-center text-2xl font-bold">How it works</h2>
        <ol className="mt-8 grid gap-6 sm:grid-cols-3">
          {HOW_IT_WORKS.map(({ Icon, title, body }, index) => (
            <li key={title} className="surface p-6">
              <div className="flex items-center gap-3">
                <Icon className="size-5 text-primary" />
                <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  Step {index + 1}
                </span>
              </div>
              <h3 className="mt-4 text-lg font-semibold">{title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{body}</p>
            </li>
          ))}
        </ol>
      </section>
    </AppShell>
  );
}
