import type { Prisma } from "@/generated/prisma/client";

import { prisma } from "@/lib/db/prisma";
import { calculateComplianceScore } from "@/lib/scoring/compliance-score";
import { scoreTrendWindowCount } from "@/lib/scoring/config";
import { calculateReportingScore } from "@/lib/scoring/reporting-score";
import type { ScoreSnapshot, ScoreWindow } from "@/lib/scoring/types";
import {
  dateValueFromUtcDate,
  differenceInDaysInclusive,
  parseUtcDateValue,
} from "@/lib/scoring/utils";
import {
  addDaysToDateValue,
  getCurrentWeeklyReviewWeekStart,
} from "@/lib/weekly-check-in";

type GoalScoringContext = {
  id: string;
  startDate: Date;
  stepTarget: number | null;
  cardioTargetMinutes: number | null;
};

type SyncScoreSnapshotsInput = {
  userId: string;
  goal: GoalScoringContext;
  timeZone: string;
  now?: Date;
  windowCount?: number;
};

type ScoreSeries = {
  complianceSnapshots: ScoreSnapshot[];
  reportingSnapshots: ScoreSnapshot[];
};

function buildScoreWindows(options: {
  now: Date;
  timeZone: string;
  goalStartDate: Date;
  windowCount: number;
}) {
  const currentWindowStart = getCurrentWeeklyReviewWeekStart(
    options.now,
    options.timeZone,
  );
  const goalStartDateValue = dateValueFromUtcDate(options.goalStartDate);

  return Array.from({ length: options.windowCount }, (_, index) => {
    const startDateValue = addDaysToDateValue(currentWindowStart, index * -7);
    const endDateValue = addDaysToDateValue(startDateValue, 6);

    return {
      startDateValue,
      endDateValue,
    };
  }).filter((window) => window.endDateValue >= goalStartDateValue);
}

function getExpectedDailyCheckIns(window: ScoreWindow, goalStartDate: Date) {
  const goalStartDateValue = dateValueFromUtcDate(goalStartDate);
  const effectiveStartDateValue =
    goalStartDateValue > window.startDateValue
      ? goalStartDateValue
      : window.startDateValue;

  if (effectiveStartDateValue > window.endDateValue) {
    return 0;
  }

  return differenceInDaysInclusive(
    effectiveStartDateValue,
    window.endDateValue,
  );
}

function serializeComponentBreakdown(snapshot: ScoreSnapshot): Prisma.InputJsonValue {
  return {
    notes: snapshot.notes,
    missingData: snapshot.missingData,
    components: snapshot.components,
  } as Prisma.InputJsonValue;
}

function serializeNotes(snapshot: ScoreSnapshot) {
  if (snapshot.notes.length === 0) {
    return null;
  }

  return snapshot.notes.join(" ");
}

export async function syncScoreSnapshotsForUser(
  input: SyncScoreSnapshotsInput,
): Promise<ScoreSeries> {
  const now = input.now ?? new Date();
  const windowCount = input.windowCount ?? scoreTrendWindowCount;
  const windows = buildScoreWindows({
    now,
    timeZone: input.timeZone,
    goalStartDate: input.goal.startDate,
    windowCount,
  });

  if (windows.length === 0) {
    return {
      complianceSnapshots: [],
      reportingSnapshots: [],
    };
  }

  const earliestWindowStart = windows[windows.length - 1]?.startDateValue;
  const latestWindowEnd = windows[0]?.endDateValue;

  if (!earliestWindowStart || !latestWindowEnd) {
    return {
      complianceSnapshots: [],
      reportingSnapshots: [],
    };
  }

  const [dailyCheckIns, weeklyCheckIns] = await Promise.all([
    prisma.dailyCheckIn.findMany({
      where: {
        userId: input.userId,
        goalId: input.goal.id,
        date: {
          gte: parseUtcDateValue(earliestWindowStart),
          lte: parseUtcDateValue(latestWindowEnd),
        },
      },
      orderBy: {
        date: "desc",
      },
    }),
    prisma.weeklyCheckIn.findMany({
      where: {
        userId: input.userId,
        goalId: input.goal.id,
        weekStartDate: {
          gte: parseUtcDateValue(earliestWindowStart),
          lte: parseUtcDateValue(windows[0].startDateValue),
        },
      },
      orderBy: {
        weekStartDate: "desc",
      },
    }),
  ]);

  const complianceSnapshots: ScoreSnapshot[] = [];
  const reportingSnapshots: ScoreSnapshot[] = [];

  for (const window of windows) {
    const expectedDailyCheckIns = getExpectedDailyCheckIns(
      window,
      input.goal.startDate,
    );
    const dailyCheckInsForWindow = dailyCheckIns.filter((checkIn) => {
      const dateValue = dateValueFromUtcDate(checkIn.date);

      return (
        dateValue >= window.startDateValue &&
        dateValue <= window.endDateValue
      );
    });
    const completedDailyCheckIns = dailyCheckInsForWindow.filter(
      (checkIn) => checkIn.completionStatus === "COMPLETED",
    );
    const weeklyCheckIn =
      weeklyCheckIns.find(
        (checkIn) =>
          dateValueFromUtcDate(checkIn.weekStartDate) === window.startDateValue,
      ) ?? null;
    const weeklyDueDateValue = addDaysToDateValue(window.startDateValue, 7);

    const complianceResult = calculateComplianceScore({
      expectedDailyCheckIns,
      completedDailyCheckIns: completedDailyCheckIns.map((checkIn) => ({
        trainingCompleted: checkIn.trainingCompleted,
        cardioCompleted: checkIn.cardioCompleted,
        mealsOnPlan: checkIn.mealsOnPlan,
        sleepHours:
          checkIn.sleepHours === null ? null : Number(checkIn.sleepHours),
      })),
      weeklyCheckIn: weeklyCheckIn
        ? {
            completionStatus: weeklyCheckIn.completionStatus,
            trainingCompliancePercentage:
              weeklyCheckIn.trainingCompliancePercentage === null
                ? null
                : Number(weeklyCheckIn.trainingCompliancePercentage),
            nutritionCompliancePercentage:
              weeklyCheckIn.nutritionCompliancePercentage === null
                ? null
                : Number(weeklyCheckIn.nutritionCompliancePercentage),
          }
        : null,
      goalTargets: {
        stepTarget: input.goal.stepTarget,
        cardioTargetMinutes: input.goal.cardioTargetMinutes,
      },
    });
    const reportingResult = calculateReportingScore({
      expectedDailyCheckIns,
      dailyCheckIns: dailyCheckInsForWindow.map((checkIn) => ({
        dateValue: dateValueFromUtcDate(checkIn.date),
        completionStatus: checkIn.completionStatus,
        createdAt: checkIn.createdAt,
      })),
      weeklyCheckIn: weeklyCheckIn
        ? {
            completionStatus: weeklyCheckIn.completionStatus,
            createdAt: weeklyCheckIn.createdAt,
            submittedAt: weeklyCheckIn.submittedAt,
          }
        : null,
      weeklyDueDateValue,
      timeZone: input.timeZone,
    });

    const complianceSnapshot: ScoreSnapshot = {
      windowStartDate: window.startDateValue,
      windowEndDate: window.endDateValue,
      formulaVersion: complianceResult.formulaVersion,
      status: complianceResult.status,
      score: complianceResult.score,
      confidence: complianceResult.confidence,
      notes: complianceResult.notes,
      missingData: complianceResult.missingData,
      components: complianceResult.components,
    };
    const reportingSnapshot: ScoreSnapshot = {
      windowStartDate: window.startDateValue,
      windowEndDate: window.endDateValue,
      formulaVersion: reportingResult.formulaVersion,
      status: reportingResult.status,
      score: reportingResult.score,
      confidence: reportingResult.confidence,
      notes: reportingResult.notes,
      missingData: reportingResult.missingData,
      components: reportingResult.components,
    };

    await prisma.complianceScore.upsert({
      where: {
        userId_goalId_windowStartDate_windowEndDate_formulaVersion: {
          userId: input.userId,
          goalId: input.goal.id,
          windowStartDate: parseUtcDateValue(window.startDateValue),
          windowEndDate: parseUtcDateValue(window.endDateValue),
          formulaVersion: complianceSnapshot.formulaVersion,
        },
      },
      update: {
        score: complianceSnapshot.score,
        confidence: complianceSnapshot.confidence,
        status: complianceSnapshot.status,
        componentBreakdown: serializeComponentBreakdown(complianceSnapshot),
        notes: serializeNotes(complianceSnapshot),
        calculatedAt: now,
      },
      create: {
        userId: input.userId,
        goalId: input.goal.id,
        windowStartDate: parseUtcDateValue(window.startDateValue),
        windowEndDate: parseUtcDateValue(window.endDateValue),
        score: complianceSnapshot.score,
        confidence: complianceSnapshot.confidence,
        status: complianceSnapshot.status,
        formulaVersion: complianceSnapshot.formulaVersion,
        componentBreakdown: serializeComponentBreakdown(complianceSnapshot),
        notes: serializeNotes(complianceSnapshot),
        calculatedAt: now,
      },
    });

    await prisma.reportingScore.upsert({
      where: {
        userId_goalId_windowStartDate_windowEndDate_formulaVersion: {
          userId: input.userId,
          goalId: input.goal.id,
          windowStartDate: parseUtcDateValue(window.startDateValue),
          windowEndDate: parseUtcDateValue(window.endDateValue),
          formulaVersion: reportingSnapshot.formulaVersion,
        },
      },
      update: {
        score: reportingSnapshot.score,
        confidence: reportingSnapshot.confidence,
        status: reportingSnapshot.status,
        componentBreakdown: serializeComponentBreakdown(reportingSnapshot),
        notes: serializeNotes(reportingSnapshot),
        calculatedAt: now,
      },
      create: {
        userId: input.userId,
        goalId: input.goal.id,
        windowStartDate: parseUtcDateValue(window.startDateValue),
        windowEndDate: parseUtcDateValue(window.endDateValue),
        score: reportingSnapshot.score,
        confidence: reportingSnapshot.confidence,
        status: reportingSnapshot.status,
        formulaVersion: reportingSnapshot.formulaVersion,
        componentBreakdown: serializeComponentBreakdown(reportingSnapshot),
        notes: serializeNotes(reportingSnapshot),
        calculatedAt: now,
      },
    });

    complianceSnapshots.push(complianceSnapshot);
    reportingSnapshots.push(reportingSnapshot);
  }

  return {
    complianceSnapshots,
    reportingSnapshots,
  };
}
