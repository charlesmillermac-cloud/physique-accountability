import Link from "next/link";

import { ActiveGoalSummary } from "@/components/dashboard/active-goal-summary";
import { LatestDailyCheckInCard } from "@/components/dashboard/latest-daily-check-in-card";
import { PageHeader } from "@/components/layout/page-header";
import { MetricCard } from "@/components/dashboard/metric-card";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  dashboardCadence,
  dashboardMetrics,
  missingDataItems,
  summaryHighlights,
} from "@/lib/placeholders";
import {
  canScoreDailyCheckIn,
  getDailyCheckInDisplayStatus,
  type ScorableDailyCheckInField,
} from "@/lib/daily-check-in";
import { getCurrentUserSnapshot } from "@/lib/current-user";
import { prisma } from "@/lib/db/prisma";

export const dynamic = "force-dynamic";

export default async function DashboardPage() {
  const currentUser = await getCurrentUserSnapshot();
  const latestDailyCheckIn = currentUser
    ? await prisma.dailyCheckIn.findFirst({
        where: {
          userId: currentUser.id,
        },
        orderBy: [{ date: "desc" }, { updatedAt: "desc" }],
      })
    : null;
  const athleteName = currentUser
    ? `${currentUser.firstName} ${currentUser.lastName}`.trim()
    : "Athlete";

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Workspace"
        title="Dashboard"
        badge={currentUser?.activeGoal ? "Active goal loaded" : "Needs onboarding"}
        description="This starter dashboard combines live onboarding context with placeholder accountability metrics so the workspace already reflects the athlete's current phase."
        actions={
          <Button asChild>
            <Link href={currentUser?.activeGoal ? "/daily-check-in" : "/onboarding"}>
              {currentUser?.activeGoal ? "Open check-in flow" : "Start onboarding"}
            </Link>
          </Button>
        }
      />

      <ActiveGoalSummary
        athleteName={athleteName}
        profile={{
          currentBodyweight: currentUser?.currentBodyweight?.toString() ?? null,
          estimatedBodyFatPercent:
            currentUser?.estimatedBodyFatPercent?.toString() ?? null,
          trainingAgeYears: currentUser?.trainingAgeYears?.toString() ?? null,
        }}
        activeGoal={
          currentUser?.activeGoal
            ? {
                title: currentUser.activeGoal.title,
                goalType: currentUser.activeGoal.goalType,
                priorityMuscleGroups:
                  currentUser.activeGoal.priorityMuscleGroups,
                scheduleConstraints: currentUser.activeGoal.scheduleConstraints,
                equipmentAccess: currentUser.activeGoal.equipmentAccess,
                calorieTarget: currentUser.activeGoal.calorieTarget,
                proteinTargetGrams: currentUser.activeGoal.proteinTargetGrams,
                carbsTargetGrams: currentUser.activeGoal.carbsTargetGrams,
                fatsTargetGrams: currentUser.activeGoal.fatsTargetGrams,
                stepTarget: currentUser.activeGoal.stepTarget,
                cardioTargetMinutes:
                  currentUser.activeGoal.cardioTargetMinutes,
              }
            : null
        }
      />

      <LatestDailyCheckInCard
        latestCheckIn={
          latestDailyCheckIn
            ? {
                date: latestDailyCheckIn.date,
                morningWeight: latestDailyCheckIn.morningWeight?.toString() ?? null,
                sleepHours: latestDailyCheckIn.sleepHours?.toString() ?? null,
                trainingCompleted: latestDailyCheckIn.trainingCompleted,
                cardioCompleted: latestDailyCheckIn.cardioCompleted,
                mealsOnPlan: latestDailyCheckIn.mealsOnPlan,
                energy: latestDailyCheckIn.energy,
                stress: latestDailyCheckIn.stress,
                digestion: latestDailyCheckIn.digestion,
                libido: latestDailyCheckIn.libido,
                notes: latestDailyCheckIn.notes,
                status: getDailyCheckInDisplayStatus(latestDailyCheckIn),
                canScore: canScoreDailyCheckIn(latestDailyCheckIn),
                missingFields:
                  latestDailyCheckIn.missingFields as ScorableDailyCheckInField[],
              }
            : null
        }
      />

      <section className="grid gap-4 xl:grid-cols-3">
        {dashboardMetrics.map((metric) => (
          <MetricCard
            key={metric.label}
            label={metric.label}
            value={metric.value}
            suffix={metric.suffix}
            detail={metric.detail}
          />
        ))}
      </section>

      <section className="grid gap-6 xl:grid-cols-[0.95fr_1.05fr]">
        <Card>
          <CardHeader>
            <CardDescription>Submission cadence</CardDescription>
            <CardTitle>Current accountability cycle</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {dashboardCadence.map((item) => (
              <div
                key={item.title}
                className="rounded-[1.5rem] border border-slate-200 bg-slate-50/80 p-5"
              >
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <h2 className="text-base font-semibold text-slate-950">
                      {item.title}
                    </h2>
                    <p className="mt-2 text-sm leading-6 text-slate-600">{item.note}</p>
                  </div>
                  <span className="rounded-full bg-slate-950 px-3 py-1 text-xs font-medium uppercase tracking-[0.16em] text-white">
                    {item.status}
                  </span>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardDescription>Summary preview</CardDescription>
            <CardTitle>Weekly coach-style output</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="rounded-[1.5rem] border border-slate-200 bg-slate-50/80 p-5">
              <h2 className="text-base font-semibold text-slate-950">
                Missing required data
              </h2>
              <ul className="mt-4 space-y-3 text-sm leading-6 text-slate-600">
                {missingDataItems.map((item) => (
                  <li key={item} className="rounded-2xl border border-slate-200 bg-white px-4 py-3">
                    {item}
                  </li>
                ))}
              </ul>
            </div>

            <div className="rounded-[1.5rem] bg-slate-950 p-6 text-slate-200">
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">
                Draft summary
              </p>
              <div className="mt-4 space-y-4 text-sm leading-7">
                {summaryHighlights.map((highlight) => (
                  <p key={highlight}>{highlight}</p>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>
      </section>
    </div>
  );
}
