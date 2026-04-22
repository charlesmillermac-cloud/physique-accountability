export const complianceScoreConfig = {
  formulaVersion: "compliance.v1",
  weights: {
    trainingCompletion: 0.3,
    nutritionAdherence: 0.25,
    cardioStepsAdherence: 0.2,
    sleep: 0.15,
    checkInConsistency: 0.1,
  },
  thresholds: {
    minimumCompletedDailyCheckInsForScore: 3,
    minimumWeightedCoverageForScore: 0.55,
    minimumAvailableWeightForScore: 0.6,
    completeConfidenceThreshold: 85,
  },
  penalties: {
    missingWeeklyReview: 7,
    stepDataProxy: 10,
    lowSample: 8,
  },
  sleep: {
    minimumHours: 5,
    targetHours: 8,
  },
} as const;

export const reportingScoreConfig = {
  formulaVersion: "reporting.v1",
  weights: {
    morningCheckInCompletion: 0.35,
    dailyCloseoutCompletion: 0.25,
    weeklyReviewCompletion: 0.2,
    timeliness: 0.2,
  },
  thresholds: {
    completeConfidenceThreshold: 85,
    minimumExpectedDailyCheckInsForScore: 1,
  },
  penalties: {
    sharedDailyRecordProxy: 10,
    lowSample: 10,
  },
  partialWeeklyReviewCredit: 50,
} as const;

export const scoreTrendWindowCount = 4;
