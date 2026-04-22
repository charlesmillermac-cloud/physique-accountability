import { reportingScoreConfig } from "@/lib/scoring/config";
import type {
  ComputedScoreResult,
  ScoreComponentResult,
} from "@/lib/scoring/types";
import {
  clamp,
  formatDateValueInTimeZone,
  roundToTwoDecimals,
  safeRatio,
  toPercentage,
  weightedAverage,
} from "@/lib/scoring/utils";

type DailyReportingInput = {
  dateValue: string;
  completionStatus: "PENDING" | "PARTIAL" | "COMPLETED" | "MISSED";
  createdAt: Date;
};

type WeeklyReportingInput = {
  completionStatus: "PENDING" | "PARTIAL" | "COMPLETED" | "MISSED";
  createdAt: Date;
  submittedAt: Date | null;
} | null;

export type ReportingScoringInput = {
  expectedDailyCheckIns: number;
  dailyCheckIns: DailyReportingInput[];
  weeklyCheckIn: WeeklyReportingInput;
  weeklyDueDateValue: string;
  timeZone: string;
};

function createComponent(
  key: ScoreComponentResult["key"],
  label: string,
  weight: number,
  score: number | null,
  coverage: number,
  note: string,
): ScoreComponentResult {
  return {
    key,
    label,
    weight,
    score: score === null ? null : roundToTwoDecimals(clamp(score, 0, 100)),
    coverage: roundToTwoDecimals(clamp(coverage, 0, 100)),
    note,
  };
}

export function calculateReportingScore(
  input: ReportingScoringInput,
): ComputedScoreResult {
  const { weights, thresholds, penalties } = reportingScoreConfig;
  const notes: string[] = [];
  const missingData: string[] = [];

  if (
    input.expectedDailyCheckIns <
    thresholds.minimumExpectedDailyCheckInsForScore
  ) {
    return {
      formulaVersion: reportingScoreConfig.formulaVersion,
      status: "INCOMPLETE",
      score: null,
      confidence: null,
      notes: ["No reporting obligations were expected in this scoring window."],
      missingData: ["This scoring window does not overlap with an active goal."],
      components: [],
    };
  }

  const totalDailySubmissions = input.dailyCheckIns.length;
  const completedDailySubmissions = input.dailyCheckIns.filter(
    (checkIn) => checkIn.completionStatus === "COMPLETED",
  ).length;

  // The current data model has one daily entity, so v1 treats any saved daily
  // entry as the "morning check-in" and only completed entries as the "closeout".
  // Once separate morning and evening submissions exist, these two components
  // can point at distinct records without changing the dashboard contract.
  const morningCheckInScore = toPercentage(
    safeRatio(totalDailySubmissions, input.expectedDailyCheckIns),
  );
  const dailyCloseoutScore = toPercentage(
    safeRatio(completedDailySubmissions, input.expectedDailyCheckIns),
  );

  const weeklyReviewScore =
    input.weeklyCheckIn?.completionStatus === "COMPLETED"
      ? 100
      : input.weeklyCheckIn?.completionStatus === "PARTIAL"
        ? reportingScoreConfig.partialWeeklyReviewCredit
        : 0;

  const onTimeDailySubmissions = input.dailyCheckIns.filter((checkIn) => {
    return (
      formatDateValueInTimeZone(checkIn.createdAt, input.timeZone) <=
      checkIn.dateValue
    );
  }).length;
  const onTimeWeeklySubmissions =
    input.weeklyCheckIn &&
    formatDateValueInTimeZone(
      input.weeklyCheckIn.submittedAt ?? input.weeklyCheckIn.createdAt,
      input.timeZone,
    ) <= input.weeklyDueDateValue
      ? 1
      : 0;
  const timelinessScore = toPercentage(
    safeRatio(
      onTimeDailySubmissions + onTimeWeeklySubmissions,
      input.expectedDailyCheckIns + 1,
    ),
  );

  const components: ScoreComponentResult[] = [
    createComponent(
      "morningCheckInCompletion",
      "Morning check-in completion",
      weights.morningCheckInCompletion,
      morningCheckInScore,
      100,
      `${totalDailySubmissions} saved daily submission${totalDailySubmissions === 1 ? "" : "s"} across ${input.expectedDailyCheckIns} expected day${input.expectedDailyCheckIns === 1 ? "" : "s"}.`,
    ),
    createComponent(
      "dailyCloseoutCompletion",
      "Daily closeout completion",
      weights.dailyCloseoutCompletion,
      dailyCloseoutScore,
      100,
      `${completedDailySubmissions} completed daily closeout${completedDailySubmissions === 1 ? "" : "s"} across ${input.expectedDailyCheckIns} expected day${input.expectedDailyCheckIns === 1 ? "" : "s"}.`,
    ),
    createComponent(
      "weeklyReviewCompletion",
      "Weekly review completion",
      weights.weeklyReviewCompletion,
      weeklyReviewScore,
      100,
      input.weeklyCheckIn?.completionStatus === "COMPLETED"
        ? "Weekly review completed for the window."
        : input.weeklyCheckIn?.completionStatus === "PARTIAL"
          ? "Weekly review is still partial, so it receives partial credit in v1."
          : "Weekly review has not been submitted for the window.",
    ),
    createComponent(
      "timeliness",
      "Timeliness",
      weights.timeliness,
      timelinessScore,
      100,
      `${onTimeDailySubmissions} on-time daily submission${onTimeDailySubmissions === 1 ? "" : "s"} and ${onTimeWeeklySubmissions} on-time weekly submission${onTimeWeeklySubmissions === 1 ? "" : "s"}.`,
    ),
  ];

  if (!input.weeklyCheckIn) {
    missingData.push("Weekly review has not been started for this scoring window.");
  } else if (input.weeklyCheckIn.completionStatus !== "COMPLETED") {
    missingData.push("Weekly review is not completed for this scoring window.");
  }

  notes.push(
    "Morning and closeout reporting are proxy measures in v1 because the app does not yet store separate morning and evening submission objects.",
  );

  if (input.expectedDailyCheckIns < 4) {
    notes.push(
      "This reporting window covers fewer than four expected days, so the sample size is lighter than a full scoring week.",
    );
  }

  const score = weightedAverage(components);
  let confidence = 100 - penalties.sharedDailyRecordProxy;

  if (input.expectedDailyCheckIns < 4) {
    confidence -= penalties.lowSample;
  }

  confidence = roundToTwoDecimals(clamp(confidence, 0, 100));

  return {
    formulaVersion: reportingScoreConfig.formulaVersion,
    status:
      confidence >= thresholds.completeConfidenceThreshold
        ? "COMPLETE"
        : "DEGRADED",
    score,
    confidence,
    notes,
    missingData,
    components,
  };
}
