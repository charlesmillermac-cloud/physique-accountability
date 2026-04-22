import { complianceScoreConfig } from "@/lib/scoring/config";
import type {
  ComputedScoreResult,
  ScoreComponentResult,
} from "@/lib/scoring/types";
import {
  average,
  clamp,
  roundToTwoDecimals,
  safeRatio,
  sumAvailableWeight,
  toPercentage,
  weightedAverage,
  weightedCoverage,
} from "@/lib/scoring/utils";

type DailyComplianceInput = {
  trainingCompleted: boolean | null;
  cardioCompleted: boolean | null;
  mealsOnPlan: number | null;
  sleepHours: number | null;
};

type WeeklyComplianceInput = {
  completionStatus: "PENDING" | "PARTIAL" | "COMPLETED" | "MISSED";
  trainingCompliancePercentage: number | null;
  nutritionCompliancePercentage: number | null;
} | null;

export type ComplianceScoringInput = {
  expectedDailyCheckIns: number;
  completedDailyCheckIns: DailyComplianceInput[];
  weeklyCheckIn: WeeklyComplianceInput;
  goalTargets: {
    stepTarget: number | null;
    cardioTargetMinutes: number | null;
  };
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

function scoreSleepHours(averageSleepHours: number) {
  const { minimumHours, targetHours } = complianceScoreConfig.sleep;
  const ratio =
    (averageSleepHours - minimumHours) / (targetHours - minimumHours);

  return toPercentage(ratio);
}

export function calculateComplianceScore(
  input: ComplianceScoringInput,
): ComputedScoreResult {
  const { weights, thresholds, penalties } = complianceScoreConfig;
  const completedCount = input.completedDailyCheckIns.length;
  const dailyCoverageRatio = safeRatio(
    completedCount,
    input.expectedDailyCheckIns,
  );
  const weeklyCheckIn = input.weeklyCheckIn;
  const weeklyReviewCompleted =
    weeklyCheckIn?.completionStatus === "COMPLETED";
  const components: ScoreComponentResult[] = [];
  const missingData: string[] = [];
  const notes: string[] = [];

  // Weekly review percentages take precedence because they summarize the full
  // window directly. When the review is missing, we fall back to completed
  // daily check-ins instead of forcing the whole score to disappear.
  if (
    weeklyReviewCompleted &&
    weeklyCheckIn?.trainingCompliancePercentage !== null
  ) {
    components.push(
      createComponent(
        "trainingCompletion",
        "Training completion",
        weights.trainingCompletion,
        weeklyCheckIn.trainingCompliancePercentage,
        100,
        "Using completed weekly review training compliance.",
      ),
    );
  } else if (completedCount > 0) {
    const trainingRate =
      average(
        input.completedDailyCheckIns.map((checkIn) =>
          checkIn.trainingCompleted ? 100 : 0,
        ),
      ) ?? null;

    components.push(
      createComponent(
        "trainingCompletion",
        "Training completion",
        weights.trainingCompletion,
        trainingRate,
        toPercentage(dailyCoverageRatio),
        "Using completed daily check-ins as the current fallback.",
      ),
    );
  } else {
    components.push(
      createComponent(
        "trainingCompletion",
        "Training completion",
        weights.trainingCompletion,
        null,
        0,
        "Missing training adherence evidence for the scoring window.",
      ),
    );
    missingData.push("Training adherence evidence is missing for this window.");
  }

  if (
    weeklyReviewCompleted &&
    weeklyCheckIn?.nutritionCompliancePercentage !== null
  ) {
    components.push(
      createComponent(
        "nutritionAdherence",
        "Nutrition adherence",
        weights.nutritionAdherence,
        weeklyCheckIn.nutritionCompliancePercentage,
        100,
        "Using completed weekly review nutrition compliance.",
      ),
    );
  } else if (completedCount > 0) {
    const nutritionRate =
      average(
        input.completedDailyCheckIns
          .map((checkIn) => checkIn.mealsOnPlan)
          .filter((value): value is number => value !== null),
      ) ?? null;

    components.push(
      createComponent(
        "nutritionAdherence",
        "Nutrition adherence",
        weights.nutritionAdherence,
        nutritionRate,
        toPercentage(dailyCoverageRatio),
        "Using meals-on-plan from completed daily check-ins.",
      ),
    );
  } else {
    components.push(
      createComponent(
        "nutritionAdherence",
        "Nutrition adherence",
        weights.nutritionAdherence,
        null,
        0,
        "Missing nutrition adherence evidence for the scoring window.",
      ),
    );
    missingData.push("Nutrition adherence evidence is missing for this window.");
  }

  const cardioCompletionRate =
    average(
      input.completedDailyCheckIns.map((checkIn) =>
        checkIn.cardioCompleted ? 100 : 0,
      ),
    ) ?? null;
  const cardioCoverage = toPercentage(
    dailyCoverageRatio *
      (input.goalTargets.stepTarget !== null ? 0.75 : 1),
  );

  components.push(
    createComponent(
      "cardioStepsAdherence",
      "Cardio / steps adherence",
      weights.cardioStepsAdherence,
      cardioCompletionRate,
      cardioCompletionRate === null ? 0 : cardioCoverage,
      input.goalTargets.stepTarget !== null
        ? "Using cardio completion as a proxy because step actuals are not captured yet."
        : "Using cardio completion from completed daily check-ins.",
    ),
  );

  if (cardioCompletionRate === null) {
    missingData.push("Cardio adherence evidence is missing for this window.");
  }

  const averageSleepHours =
    average(
      input.completedDailyCheckIns
        .map((checkIn) => checkIn.sleepHours)
        .filter((value): value is number => value !== null),
    ) ?? null;
  const sleepScore =
    averageSleepHours === null ? null : scoreSleepHours(averageSleepHours);

  components.push(
    createComponent(
      "sleep",
      "Sleep",
      weights.sleep,
      sleepScore,
      averageSleepHours === null ? 0 : toPercentage(dailyCoverageRatio),
      averageSleepHours === null
        ? "Missing sleep evidence for the scoring window."
        : `Average sleep was ${roundToTwoDecimals(averageSleepHours)} hours.`,
    ),
  );

  if (averageSleepHours === null) {
    missingData.push("Sleep evidence is missing for this window.");
  }

  const consistencyScore = toPercentage(dailyCoverageRatio);

  components.push(
    createComponent(
      "checkInConsistency",
      "Check-in consistency",
      weights.checkInConsistency,
      consistencyScore,
      input.expectedDailyCheckIns > 0 ? 100 : 0,
      `${completedCount} completed daily check-in${completedCount === 1 ? "" : "s"} across ${input.expectedDailyCheckIns} expected day${input.expectedDailyCheckIns === 1 ? "" : "s"}.`,
    ),
  );

  if (!weeklyReviewCompleted) {
    notes.push(
      "Weekly review was not completed for this window, so training and nutrition may be using daily fallbacks.",
    );
  }

  if (input.goalTargets.stepTarget !== null) {
    notes.push(
      "Step adherence is not yet tracked directly, so the cardio / steps component is using cardio completion as a proxy.",
    );
  }

  const availableWeight = sumAvailableWeight(components);
  const coverageRatio = weightedCoverage(components);
  const insufficientDailyEvidence =
    completedCount < thresholds.minimumCompletedDailyCheckInsForScore &&
    !weeklyReviewCompleted;
  const insufficientCoverage =
    coverageRatio < thresholds.minimumWeightedCoverageForScore ||
    availableWeight < thresholds.minimumAvailableWeightForScore;

  if (input.expectedDailyCheckIns <= 0) {
    return {
      formulaVersion: complianceScoreConfig.formulaVersion,
      status: "INCOMPLETE",
      score: null,
      confidence: null,
      notes: ["No active days were expected in this scoring window."],
      missingData: ["This scoring window does not overlap with an active goal."],
      components,
    };
  }

  if (insufficientDailyEvidence || insufficientCoverage) {
    return {
      formulaVersion: complianceScoreConfig.formulaVersion,
      status: "INCOMPLETE",
      score: null,
      confidence: null,
      notes: [
        insufficientDailyEvidence
          ? "Too few completed daily check-ins are available to produce a reliable compliance score."
          : "Too much weighted evidence is missing to produce a reliable compliance score.",
        ...notes,
      ],
      missingData,
      components,
    };
  }

  const score = weightedAverage(components);
  let confidence = coverageRatio * 100;

  if (!weeklyReviewCompleted) {
    confidence -= penalties.missingWeeklyReview;
  }

  if (input.goalTargets.stepTarget !== null) {
    confidence -= penalties.stepDataProxy;
  }

  if (
    completedCount < thresholds.minimumCompletedDailyCheckInsForScore + 1
  ) {
    confidence -= penalties.lowSample;
  }

  confidence = roundToTwoDecimals(clamp(confidence, 0, 100));

  return {
    formulaVersion: complianceScoreConfig.formulaVersion,
    status:
      confidence >= thresholds.completeConfidenceThreshold &&
      missingData.length === 0
        ? "COMPLETE"
        : "DEGRADED",
    score,
    confidence,
    notes,
    missingData,
    components,
  };
}
