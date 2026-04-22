export type ScoreStatusValue = "COMPLETE" | "DEGRADED" | "INCOMPLETE";

export type ScoreComponentKey =
  | "trainingCompletion"
  | "nutritionAdherence"
  | "cardioStepsAdherence"
  | "sleep"
  | "checkInConsistency"
  | "morningCheckInCompletion"
  | "dailyCloseoutCompletion"
  | "weeklyReviewCompletion"
  | "timeliness";

export type ScoreComponentResult = {
  key: ScoreComponentKey;
  label: string;
  weight: number;
  score: number | null;
  coverage: number;
  note: string;
};

export type ComputedScoreResult = {
  formulaVersion: string;
  status: ScoreStatusValue;
  score: number | null;
  confidence: number | null;
  notes: string[];
  missingData: string[];
  components: ScoreComponentResult[];
};

export type ScoreWindow = {
  startDateValue: string;
  endDateValue: string;
};

export type ScoreSnapshot = {
  windowStartDate: string;
  windowEndDate: string;
  formulaVersion: string;
  status: ScoreStatusValue;
  score: number | null;
  confidence: number | null;
  notes: string[];
  missingData: string[];
  components: ScoreComponentResult[];
};
