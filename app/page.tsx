import Link from "next/link";

import { ArrowRight, BarChart3, BellRing, ClipboardCheck, Database, Sparkles } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button, buttonVariants } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { workspaceNavigation } from "@/lib/navigation";
import { cn } from "@/lib/utils";

const foundationAreas = [
  {
    title: "Structured intake",
    description:
      "Daily and weekly check-ins are modeled around compliance, data quality, and consistency rather than generic journaling.",
    icon: ClipboardCheck,
  },
  {
    title: "Reminder escalation",
    description:
      "The database layer is shaped to support missing-data tracking and progressive follow-up without coupling it to the UI.",
    icon: BellRing,
  },
  {
    title: "Coach-style outputs",
    description:
      "Weekly summaries are treated as first-class records so AI generation can remain structured and auditable later on.",
    icon: Sparkles,
  },
] as const;

const platformPrinciples = [
  {
    title: "Modular by default",
    body: "Routing, shared UI, placeholder data, and Prisma live in separate layers so business logic can expand without page files becoming the backend.",
  },
  {
    title: "Scope-first schema",
    body: "The initial database models only cover athletes, check-ins, reminders, and weekly summaries. No premature coaching CRM, chat, or meal-planning complexity.",
  },
  {
    title: "Serious interface language",
    body: "The visual system stays restrained, data-forward, and performance-oriented to fit a coaching product rather than a social wellness app.",
  },
] as const;

export default function HomePage() {
  return (
    <main className="min-h-screen">
      <section className="mx-auto max-w-7xl px-5 py-6 sm:px-8 lg:px-12 lg:py-10">
        <div className="rounded-[2rem] border border-slate-200/80 bg-white/85 p-6 shadow-[0_24px_60px_-32px_rgba(15,23,42,0.2)] backdrop-blur">
          <div className="flex flex-col gap-6 lg:flex-row lg:items-start lg:justify-between">
            <div className="space-y-4">
              <Badge variant="outline" className="bg-white/60">
                Portfolio-grade foundation
              </Badge>
              <div className="space-y-4">
                <h1 className="max-w-4xl text-4xl font-semibold tracking-tight text-slate-950 sm:text-5xl lg:text-6xl">
                  Accountability infrastructure for physique coaching that feels
                  operational, not generic.
                </h1>
                <p className="max-w-3xl text-base leading-8 text-slate-600 sm:text-lg">
                  This first version is deliberately narrow: collect structured
                  check-ins, measure compliance and reporting quality, flag
                  missing required data, escalate reminders, and prepare
                  coach-style weekly summaries.
                </p>
              </div>
            </div>

            <div className="grid gap-3 sm:grid-cols-2 lg:w-[24rem]">
              <Link href="/dashboard" className={buttonVariants({ className: "justify-between" })}>
                Open dashboard
                <ArrowRight className="h-4 w-4" />
              </Link>
              <Link
                href="/onboarding"
                className={buttonVariants({ variant: "secondary", className: "justify-between" })}
              >
                View onboarding
                <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
          </div>

          <div className="mt-10 grid gap-4 lg:grid-cols-[1.25fr_0.75fr]">
            <Card className="bg-slate-950 text-white">
              <CardHeader>
                <CardDescription className="text-slate-400">
                  Initial platform map
                </CardDescription>
                <CardTitle className="text-white">
                  Clear product boundaries for v1
                </CardTitle>
              </CardHeader>
              <CardContent className="grid gap-4 md:grid-cols-3">
                {foundationAreas.map((area) => {
                  const Icon = area.icon;

                  return (
                    <div
                      key={area.title}
                      className="rounded-[1.5rem] border border-white/10 bg-white/5 p-5"
                    >
                      <div className="mb-4 flex h-11 w-11 items-center justify-center rounded-2xl bg-white/10">
                        <Icon className="h-5 w-5 text-slate-100" />
                      </div>
                      <h2 className="text-base font-semibold text-white">{area.title}</h2>
                      <p className="mt-3 text-sm leading-6 text-slate-300">
                        {area.description}
                      </p>
                    </div>
                  );
                })}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardDescription>Available routes</CardDescription>
                <CardTitle>Starter workspace map</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {workspaceNavigation.map((item) => (
                  <Link
                    key={item.href}
                    href={item.href}
                    className="flex items-center justify-between rounded-2xl border border-slate-200 px-4 py-3 text-sm transition-colors hover:border-slate-300 hover:bg-slate-50"
                  >
                    <div>
                      <p className="font-semibold text-slate-950">{item.label}</p>
                      <p className="mt-1 text-slate-500">{item.description}</p>
                    </div>
                    <ArrowRight className="h-4 w-4 text-slate-400" />
                  </Link>
                ))}
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      <section className="mx-auto grid max-w-7xl gap-6 px-5 pb-10 sm:px-8 lg:grid-cols-[0.95fr_1.05fr] lg:px-12 lg:pb-16">
        <Card>
          <CardHeader>
            <CardDescription>Architectural stance</CardDescription>
            <CardTitle>Built for growth without early sprawl</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {platformPrinciples.map((principle) => (
              <div
                key={principle.title}
                className="rounded-[1.5rem] border border-slate-200 bg-slate-50/80 p-5"
              >
                <h2 className="text-base font-semibold text-slate-950">
                  {principle.title}
                </h2>
                <p className="mt-2 text-sm leading-6 text-slate-600">{principle.body}</p>
              </div>
            ))}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardDescription>Foundation checklist</CardDescription>
            <CardTitle>What this scaffold already covers</CardTitle>
          </CardHeader>
          <CardContent className="grid gap-4 sm:grid-cols-2">
            <div className="rounded-[1.5rem] border border-slate-200 p-5">
              <Database className="h-5 w-5 text-slate-950" />
              <h2 className="mt-4 text-base font-semibold text-slate-950">
                Prisma + PostgreSQL schema
              </h2>
              <p className="mt-2 text-sm leading-6 text-slate-600">
                Minimal models for athletes, check-ins, reminders, and weekly
                summaries.
              </p>
            </div>
            <div className="rounded-[1.5rem] border border-slate-200 p-5">
              <BarChart3 className="h-5 w-5 text-slate-950" />
              <h2 className="mt-4 text-base font-semibold text-slate-950">
                Dashboard shell
              </h2>
              <p className="mt-2 text-sm leading-6 text-slate-600">
                A serious, data-forward workspace shell ready for real metrics
                and authenticated navigation.
              </p>
            </div>
            <div className="rounded-[1.5rem] border border-slate-200 p-5 sm:col-span-2">
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">
                Next recommended step
              </p>
              <p className="mt-3 text-sm leading-6 text-slate-600">
                Wire authentication and form submissions, then connect the
                dashboard to live Prisma queries instead of placeholder data.
              </p>
              <div className="mt-5">
                <Button asChild variant="secondary">
                  <Link href="/dashboard" className={cn("inline-flex items-center gap-2")}>
                    Inspect the workspace shell
                    <ArrowRight className="h-4 w-4" />
                  </Link>
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </section>
    </main>
  );
}
