import Link from "next/link";

import { ActiveGoalSummary } from "@/components/dashboard/active-goal-summary";
import { LatestDailyCheckInCard } from "@/components/dashboard/latest-daily-check-in-card";
import { MetricCard } from "@/components/dashboard/metric-card";
import { ScoreTrendCard } from "@/components/dashboard/score-trend-card";
import { WeeklyReviewGateCard } from "@/components/dashboard/weekly-review-gate-card";
import { PageHeader } from "@/components/layout/page-header";
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
  summaryHighlights,
} from "@/lib/placeholders";
import {
  canScoreDailyCheckIn,
  getDailyCheckInDisplayStatus,
  type ScorableDailyCheckInField,
} from "@/lib/daily-check-in";
import { getCurrentUserSnapshot } from "@/lib/current-user";
import { prisma } from "@/lib/db/prisma";
import { syncScoreSnapshotsForUser } from "@/lib/scoring/service";
import {
  getCurrentWeeklyReviewWeekStart,
  getWeeklyReviewGateAssessment,
  weeklyFieldLabels,
} from "@/lib/weekly-check-in";

export const dynamic = "force-dynamic";

export default async function DashboardPage() {
  const currentUser = await getCurrentUserSnapshot();
  const now = new Date();
  const timeZone = currentUser?.timezone ?? "America/Denver";
  const latestDailyCheckIn = currentUser
    ? await prisma.dailyCheckIn.findFirst({
        where: {
          userId: currentUser.id,
        },
        orderBy: [{ date: "desc" }, { updatedAt: "desc" }],
      })
    : null;
  const currentWeeklyReviewWeekStart = getCurrentWeeklyReviewWeekStart(
    now,
    timeZone,
  );
  const currentWeeklyReview = currentUser
    ? await prisma.weeklyCheckIn.findUnique({
        where: {
          userId_weekStartDate: {
            userId: currentUser.id,
            weekStartDate: new Date(
              `${currentWeeklyReviewWeekStart}T00:00:00.000Z`,
            ),
          },
        },
      })
    : null;
  const weeklyReviewGate = getWeeklyReviewGateAssessment(currentWeeklyReview, {
    now,
    timeZone,
  });
  const scoreSeries =
    currentUser?.activeGoal
      ? await syncScoreSnapshotsForUser({
          userId: currentUser.id,
          goal: {
            id: currentUser.activeGoal.id,
            startDate: currentUser.activeGoal.startDate,
            stepTarget: currentUser.activeGoal.stepTarget,
            cardioTargetMinutes: currentUser.activeGoal.cardioTargetMinutes,
          },
          timeZone,
          now,
        })
      : {
          complianceSnapshots: [],
          reportingSnapshots: [],
        };
  const latestComplianceScore = scoreSeries.complianceSnapshots[0] ?? null;
  const latestReportingScore = scoreSeries.reportingSnapshots[0] ?? null;
  const openDataItems = Array.from(
    new Set([
      ...weeklyReviewGate.missingFields.map((field) => weeklyFieldLabels[field]),
      ...(latestComplianceScore?.missingData ?? []),
      ...(latestReportingScore?.missingData ?? []),
    ]),
  );
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

      <WeeklyReviewGateCard gate={weeklyReviewGate} />

      <section className="grid gap-6 xl:grid-cols-[1fr_1fr_0.8fr]">
        <ScoreTrendCard
          title="Compliance score"
          description="Weighted from training execution, nutrition adherence, cardio proxy adherence, sleep, and daily consistency for the latest completed scoring windows."
          series={scoreSeries.complianceSnapshots}
        />
        <ScoreTrendCard
          title="Reporting score"
          description="Weighted from daily submission coverage, completed closeouts, weekly review completion, and submission timeliness."
          series={scoreSeries.reportingSnapshots}
        />
        <MetricCard
          label="Open scoring gaps"
          value={String(openDataItems.length)}
          suffix=" items"
          detail={
            openDataItems.length > 0
              ? openDataItems.slice(0, 2).join(" ")
              : "Latest score windows have enough evidence to calculate without active data-gap warnings."
          }
        />
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
                {(openDataItems.length > 0
                  ? openDataItems
                  : ["No active missing-data warnings in the latest scoring window."]).map((item) => (
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
