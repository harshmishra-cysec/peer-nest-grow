import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import {
  ArrowRight,
  CheckCircle2,
  FolderSync,
  GraduationCap,
  Layers,
  Rocket,
  Scale,
  Sparkles,
  Trophy,
  Users,
} from "lucide-react";
import { Logo } from "@/components/brand/Logo";
import { Button } from "@/components/ui/button";
import { FormationModal } from "@/components/workspace/FormationModal";
import { CIRCLE_CAPACITY, ROUTES, SUB_GROUP_SIZE } from "@/constants";
import { computeBalancedSubGroups } from "@/services/groupingService";
import type { CircleMember } from "@/types";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "SkillNest — Turn Individual Learning into Collaborative Growth" },
      {
        name: "description",
        content:
          "Discover learning circles, connect with learners who share your interests, and get automatically matched into balanced learning groups.",
      },
      {
        property: "og:title",
        content: "SkillNest — Turn Individual Learning into Collaborative Growth",
      },
      {
        property: "og:description",
        content:
          "Discover learning circles, connect with learners who share your interests, and get automatically matched into balanced learning groups.",
      },
    ],
  }),
  component: LandingPage,
});

/**
 * 4 Steps from image reference:
 * Step 1: Create / Join Circle
 * Step 2: Self Assessment
 * Step 3: Balanced Group Formation
 * Step 4: Learn & Grow Together
 */
const HOW_IT_WORKS_STEPS = [
  {
    step: "STEP 1",
    title: "Create / Join Circle",
    description: "Pick a topic you want to master.",
    Icon: Users,
  },
  {
    step: "STEP 2",
    title: "Self Assessment",
    description: "A quick honest skill check-in.",
    Icon: GraduationCap,
  },
  {
    step: "STEP 3",
    title: "Balanced Group Formation",
    description: "Strong + Average + Weak, every time.",
    Icon: Scale,
  },
  {
    step: "STEP 4",
    title: "Learn & Grow Together",
    description: "Tasks, chat, milestones, badges.",
    Icon: Rocket,
  },
];

/**
 * Bottom 3 feature cards from image reference:
 * 1. Smart Group Formation
 * 2. Learning Communities
 * 3. Progress & Achievements
 */
const BOTTOM_FEATURES = [
  {
    title: "Smart Group Formation",
    description:
      "When a circle fills up, members are analysed by assessed level and split into balanced sub-groups. The strongest member of each sub-group becomes its leader.",
    Icon: Layers,
  },
  {
    title: "Learning Communities",
    description:
      "Every sub-group gets its own chat, shared resources, task board and milestone plan — no permanent circle owner, just peers.",
    Icon: FolderSync,
  },
  {
    title: "Progress & Achievements",
    description:
      "Peer-verified task completion, milestone tracking, activity streaks and badges keep momentum visible.",
    Icon: Trophy,
  },
];

/**
 * Demo cohort of 9 members to render the realistic grouping preview in the image
 */
const DEMO_COHORT_MEMBERS: CircleMember[] = [
  { userId: "demo-1", name: "Priya Nair", skillLevel: "Advanced", joinedAt: "2026-09-01" },
  { userId: "demo-2", name: "Harsh Mishra", skillLevel: "Intermediate", joinedAt: "2026-09-02" },
  { userId: "demo-3", name: "Rohan Das", skillLevel: "Beginner", joinedAt: "2026-09-03" },
  { userId: "demo-4", name: "Ananya Iyer", skillLevel: "Advanced", joinedAt: "2026-09-04" },
  { userId: "demo-5", name: "Kabir Shah", skillLevel: "Intermediate", joinedAt: "2026-09-05" },
  { userId: "demo-6", name: "Meera Pillai", skillLevel: "Beginner", joinedAt: "2026-09-06" },
  { userId: "demo-7", name: "Dev Patel", skillLevel: "Advanced", joinedAt: "2026-09-07" },
  { userId: "demo-8", name: "Sana Khan", skillLevel: "Intermediate", joinedAt: "2026-09-08" },
  { userId: "demo-9", name: "Arjun Verma", skillLevel: "Beginner", joinedAt: "2026-09-09" },
];

function LandingPage() {
  const [showFormationModal, setShowFormationModal] = useState(false);
  const groupingResult = computeBalancedSubGroups("demo-circle", DEMO_COHORT_MEMBERS);

  return (
    <div className="flex min-h-screen flex-col bg-[#F9FBFC] text-foreground">
      {/* 
        NAVBAR:
        Matches image header with Logo, links ("How it works", "Group formation", "Communities"), and Login button
      */}
      <header className="sticky top-0 z-40 border-b border-slate-100 bg-white/90 backdrop-blur-md">
        <div className="mx-auto flex h-16 w-full max-w-6xl items-center justify-between px-4 sm:px-6">
          <Logo />

          <nav className="hidden items-center gap-8 text-sm font-medium text-slate-600 sm:flex">
            <a href="#how-it-works" className="transition-colors hover:text-slate-900">
              How it works
            </a>
            <a href="#group-formation" className="transition-colors hover:text-slate-900">
              Group formation
            </a>
            <a href="#communities" className="transition-colors hover:text-slate-900">
              Communities
            </a>
          </nav>

          <Button
            asChild
            variant="outline"
            size="sm"
            className="rounded-lg border-slate-200 px-4 text-xs font-semibold text-slate-700 hover:bg-slate-50"
          >
            <Link to={ROUTES.auth}>Login</Link>
          </Button>
        </div>
      </header>

      <main className="flex-1">
        {/* 
          HERO SECTION:
          - Bluish and greenish pastel gradient background (sky blue to mint/teal)
          - Pill badge with sparkle icon
          - Big display heading: "Turn Individual Learning into Collaborative Growth" with purple/indigo gradient highlight
          - Subtext requested specifically: "SkillNest puts you in a small, skill-balanced group of learners who share your goal — so nobody is left behind and nobody is bored."
          - Single primary CTA button "Get started ->"
        */}
        <section className="relative overflow-hidden bg-gradient-to-b from-[#EBF3FF] via-[#EEF7F8] to-[#F9FBFC] px-4 pb-20 pt-16 sm:px-6 sm:pb-28 sm:pt-20">
          <div className="mx-auto max-w-4xl text-center">
            {/* Pill-shaped badge */}
            <div className="inline-flex items-center gap-2 rounded-full border border-blue-200/80 bg-white/90 px-4 py-1.5 text-xs font-semibold text-blue-600 shadow-sm backdrop-blur">
              <Sparkles className="size-3.5 text-blue-500" />
              <span>Find Your People. Learn Together. Grow Together.</span>
            </div>

            {/* Main Heading matching the image */}
            <h1 className="mx-auto mt-8 max-w-4xl font-display text-4xl font-extrabold tracking-tight text-slate-900 sm:text-6xl sm:leading-[1.12]">
              Turn Individual Learning <br className="hidden sm:inline" />
              into{" "}
              <span className="bg-gradient-to-r from-[#4353FF] via-[#5C67F2] to-[#7B52F4] bg-clip-text text-transparent">
                Collaborative Growth
              </span>
            </h1>

            {/* Requested exact sentence preserved */}
            <p className="mx-auto mt-6 max-w-2xl text-base leading-relaxed text-slate-600 sm:text-lg">
              SkillNest puts you in a small, skill-balanced group of learners who share your goal —
              so nobody is left behind and nobody is bored.
            </p>

            {/* CTA Button */}
            <div className="mt-8 flex justify-center">
              <Button
                asChild
                size="lg"
                className="h-12 rounded-xl bg-[#3B49DF] px-8 text-base font-semibold text-white shadow-md shadow-blue-500/20 hover:bg-[#323ec5]"
              >
                <Link to={ROUTES.auth} className="gap-2">
                  Get started <ArrowRight className="size-4" />
                </Link>
              </Button>
            </div>
          </div>
        </section>

        <div className="mx-auto w-full max-w-6xl px-4 py-12 sm:px-6 sm:py-16 space-y-24">
          {/* 
            HOW SKILLNEST WORKS SECTION:
            4 cards in a row connected by arrows, matching the uploaded image exactly
          */}
          <section id="how-it-works" className="scroll-mt-24">
            <div className="text-center space-y-2">
              <h2 className="font-display text-3xl font-extrabold tracking-tight text-slate-900 sm:text-4xl">
                How SkillNest Works
              </h2>
              <p className="text-sm text-slate-500">
                Four steps from a solo learner to an accountable, balanced learning team.
              </p>
            </div>

            <div className="mt-12 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {HOW_IT_WORKS_STEPS.map(({ step, title, description, Icon }, index) => (
                <div
                  key={step}
                  className="group relative flex flex-col justify-between rounded-2xl border border-slate-200/80 bg-white p-6 shadow-sm transition-all hover:border-blue-300 hover:shadow-md"
                >
                  <div>
                    {/* Icon container */}
                    <div className="flex size-11 items-center justify-center rounded-xl bg-[#4451ED] text-white shadow-sm shadow-blue-500/25">
                      <Icon className="size-5" />
                    </div>

                    <p className="mt-5 text-[11px] font-bold tracking-wider text-blue-600 uppercase">
                      {step}
                    </p>
                    <h3 className="mt-1 font-display text-base font-bold text-slate-900">
                      {title}
                    </h3>
                    <p className="mt-2 text-xs leading-relaxed text-slate-500">{description}</p>
                  </div>

                  {/* Arrow indicator between cards on desktop */}
                  {index < HOW_IT_WORKS_STEPS.length - 1 && (
                    <div className="pointer-events-none absolute -right-3 top-1/2 hidden -translate-y-1/2 z-10 lg:block text-slate-300">
                      <ArrowRight className="size-4 text-slate-300" />
                    </div>
                  )}
                </div>
              ))}
            </div>
          </section>

          {/* 
            BALANCED GROUPING ENGINE EXPLAINER:
            Left side: Title, description, 4 check items, and blue button
            Right side: Interactive preview card showing "DSA PROBLEM SOLVING" with 10 Strong, 10 Average, 10 Weak and Group cards
          */}
          <section
            id="group-formation"
            className="scroll-mt-24 grid grid-cols-1 items-center gap-12 lg:grid-cols-12"
          >
            <div className="space-y-6 lg:col-span-6">
              <h2 className="font-display text-3xl font-extrabold tracking-tight text-slate-900 sm:text-4xl">
                The balanced grouping engine
              </h2>
              <p className="text-sm leading-relaxed text-slate-600">
                A circle has no permanent leader. Once it reaches capacity, SkillNest evaluates
                every member's assessed level and mixes them so each sub-group carries one strong,
                one average and one developing learner.
              </p>

              <ul className="space-y-3.5 pt-2">
                {[
                  "30 members → 10 Strong · 10 Average · 10 Weak",
                  "Sub-group size 3 → 10 balanced groups",
                  "Strong member of each group becomes group leader",
                  "Levels stay private — peers only see names & interests",
                ].map((item) => (
                  <li
                    key={item}
                    className="flex items-start gap-3 text-xs text-slate-700 font-medium"
                  >
                    <span className="flex size-4 shrink-0 items-center justify-center rounded-full bg-emerald-100 text-emerald-600 mt-0.5">
                      <CheckCircle2 className="size-3" />
                    </span>
                    <span>{item}</span>
                  </li>
                ))}
              </ul>

              <div className="pt-2">
                <Button
                  onClick={() => setShowFormationModal(true)}
                  className="rounded-xl bg-[#3B49DF] px-6 text-sm font-semibold text-white shadow-md shadow-blue-500/20 hover:bg-[#323ec5]"
                >
                  See group formation <ArrowRight className="ml-1.5 size-4" />
                </Button>
              </div>
            </div>

            {/* Right side mockup card */}
            <div className="lg:col-span-6">
              <div className="rounded-3xl border border-slate-200/90 bg-white p-6 shadow-xl shadow-blue-900/5 sm:p-7">
                <div className="mb-4">
                  <p className="text-[11px] font-bold tracking-wider text-slate-500 uppercase">
                    DSA PROBLEM SOLVING
                  </p>
                </div>

                {/* 3 top category pills */}
                <div className="grid grid-cols-3 gap-2 text-center text-xs font-semibold">
                  <div className="rounded-xl border border-emerald-200 bg-emerald-50/80 py-2 text-emerald-700">
                    10 Strong
                  </div>
                  <div className="rounded-xl border border-amber-200 bg-amber-50/80 py-2 text-amber-700">
                    10 Average
                  </div>
                  <div className="rounded-xl border border-blue-200 bg-blue-50/80 py-2 text-blue-700">
                    10 Weak
                  </div>
                </div>

                {/* Downward divider indicator */}
                <div className="my-4 flex justify-center text-slate-300">
                  <span className="text-sm font-bold">↓</span>
                </div>

                {/* Groups list matching the visual layout */}
                <div className="space-y-2.5">
                  {[1, 2, 3, 4].map((num) => (
                    <div
                      key={num}
                      className="flex items-center justify-between rounded-xl border border-slate-100 bg-[#FBFDFF] px-4 py-2.5 shadow-2xs"
                    >
                      <span className="text-xs font-bold text-slate-800">Group {num}</span>
                      <div className="flex items-center gap-1.5 text-[10px] font-semibold">
                        <span className="rounded-full border border-emerald-200 bg-emerald-50 px-2 py-0.5 text-emerald-700">
                          Strong
                        </span>
                        <span className="rounded-full border border-amber-200 bg-amber-50 px-2 py-0.5 text-amber-700">
                          Average
                        </span>
                        <span className="rounded-full border border-blue-200 bg-blue-50 px-2 py-0.5 text-blue-700">
                          Weak
                        </span>
                      </div>
                    </div>
                  ))}
                </div>

                <p className="mt-4 text-center text-[11px] text-slate-400 font-medium">
                  + 6 more balanced groups
                </p>
              </div>
            </div>
          </section>

          {/* 
            COMMUNITIES / 3 BOTTOM FEATURE CARDS:
            - Smart Group Formation
            - Learning Communities
            - Progress & Achievements
          */}
          <section id="communities" className="scroll-mt-24">
            <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
              {BOTTOM_FEATURES.map(({ title, description, Icon }) => (
                <div
                  key={title}
                  className="flex flex-col justify-between rounded-2xl border border-slate-200/80 bg-white p-6 shadow-sm transition-all hover:border-blue-300 hover:shadow-md"
                >
                  <div>
                    <div className="flex size-10 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
                      <Icon className="size-5" />
                    </div>
                    <h3 className="mt-4 font-display text-base font-bold text-slate-900">
                      {title}
                    </h3>
                    <p className="mt-2 text-xs leading-relaxed text-slate-500">{description}</p>
                  </div>
                </div>
              ))}
            </div>
          </section>

          {/* 
            BANNER CTA:
            Large royal blue/indigo rounded container with white heading, subtitle and white button
          */}
          <section className="rounded-3xl bg-gradient-to-r from-[#4A54F1] via-[#525EF3] to-[#5C66F5] px-6 py-14 text-center text-white shadow-xl shadow-blue-600/15 sm:px-12 sm:py-16">
            <h2 className="font-display text-3xl font-extrabold tracking-tight sm:text-4xl">
              Ready to learn with your people?
            </h2>
            <p className="mx-auto mt-3 max-w-xl text-xs leading-relaxed text-blue-100 sm:text-sm">
              Create your account, join a circle, assess yourself and get matched into a balanced
              learning group.
            </p>
            <div className="mt-8 flex justify-center">
              <Button
                asChild
                size="lg"
                className="h-11 rounded-xl bg-white px-8 text-sm font-bold text-[#3B49DF] shadow-md hover:bg-slate-100"
              >
                <Link to={ROUTES.auth}>Get started</Link>
              </Button>
            </div>
          </section>
        </div>
      </main>

      {/* Interactive Group Formation Simulator Modal */}
      <FormationModal
        open={showFormationModal}
        onOpenChange={setShowFormationModal}
        circleName="DSA Problem Solving"
        members={DEMO_COHORT_MEMBERS}
        groupingResult={groupingResult}
      />

      {/* Footer matching image: centered SkillNest logo */}
      <footer className="border-t border-slate-100 bg-white py-8">
        <div className="mx-auto flex justify-center">
          <Logo />
        </div>
      </footer>
    </div>
  );
}
