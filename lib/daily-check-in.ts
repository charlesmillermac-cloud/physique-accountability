export const dailyCheckInStatusValues = [
  "missing",
  "partial",
  "completed",
] as const;

export type DailyCheckInDisplayStatus =
  (typeof dailyCheckInStatusValues)[number];

export const mealsOnPlanOptions = [
  { value: "0", label: "0%" },
  { value: "25", label: "25%" },
  { value: "50", label: "50%" },
  { value: "75", label: "75%" },
  { value: "100", label: "100%" },
] as const;

export const yesNoOptions = [
  { value: "yes", label: "Yes" },
  { value: "no", label: "No" },
] as const;

export const biofeedbackScaleOptions = Array.from({ length: 10 }, (_, index) => ({
  value: String(index + 1),
  label: String(index + 1),
})) as readonly { value: string; label: string }[];

export const scorableDailyCheckInFields = [
  "date",
  "morningWeight",
  "sleepHours",
  "trainingCompleted",
  "cardioCompleted",
  "mealsOnPlan",
  "energy",
  "stress",
  "digestion",
  "libido",
] as const;

export type ScorableDailyCheckInField =
  (typeof scorableDailyCheckInFields)[number];

export type DailyCheckInFormValues = {
  date: string;
  morningWeight: string;
  sleepHours: string;
  trainingCompleted: "yes" | "no" | "";
  cardioCompleted: "yes" | "no" | "";
  mealsOnPlan: string;
  energy: string;
  stress: string;
  digestion: string;
  libido: string;
  notes: string;
};

export type DailyCheckInField = keyof DailyCheckInFormValues;
export type DailyCheckInFieldErrors = Partial<Record<DailyCheckInField, string>>;

export type DailyCheckInActionState = {
  status: "idle" | "success" | "error";
  message?: string;
  fieldErrors: DailyCheckInFieldErrors;
  savedStatus?: DailyCheckInDisplayStatus;
  canScore?: boolean;
  missingFields?: ScorableDailyCheckInField[];
};

type NumericLike = string | number | { toString(): string };

export type DailyCheckInScoringInput = {
  date?: string | Date | null;
  morningWeight?: NumericLike | null;
  sleepHours?: NumericLike | null;
  trainingCompleted?: boolean | null;
  cardioCompleted?: boolean | null;
  mealsOnPlan?: NumericLike | null;
  energy?: NumericLike | null;
  stress?: NumericLike | null;
  digestion?: NumericLike | null;
  libido?: NumericLike | null;
  completionStatus?: "PENDING" | "PARTIAL" | "COMPLETED" | "MISSED" | null;
};

type ParsedDailyCheckInValues = {
  date: string;
  morningWeight: string | null;
  sleepHours: string | null;
  trainingCompleted: boolean | null;
  cardioCompleted: boolean | null;
  mealsOnPlan: number | null;
  energy: number | null;
  stress: number | null;
  digestion: number | null;
  libido: number | null;
  notes: string | null;
};

type ValidationResult =
  | { success: true; data: ParsedDailyCheckInValues }
  | { success: false; errors: DailyCheckInFieldErrors };

export const dailyCheckInInitialState: DailyCheckInActionState = {
  status: "idle",
  fieldErrors: {},
};

export function createEmptyDailyCheckInValues(date: string): DailyCheckInFormValues {
  return {
    date,
    morningWeight: "",
    sleepHours: "",
    trainingCompleted: "",
    cardioCompleted: "",
    mealsOnPlan: "",
    energy: "",
    stress: "",
    digestion: "",
    libido: "",
    notes: "",
  };
}

export function createDailyCheckInValues(
  date: string,
  values?: Partial<DailyCheckInFormValues>,
): DailyCheckInFormValues {
  return {
    ...createEmptyDailyCheckInValues(date),
    ...values,
  };
}

function formChoiceToBoolean(value: DailyCheckInFormValues["trainingCompleted"]) {
  if (value === "yes") {
    return true;
  }

  if (value === "no") {
    return false;
  }

  return null;
}

function normalizeText(value: string) {
  return value.trim().replace(/\s+/g, " ");
}

export function formatDateInputValue(date: Date, timeZone = "UTC") {
  return new Intl.DateTimeFormat("en-CA", {
    timeZone,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(date);
}

export function formatDisplayDate(date: Date | string, timeZone = "UTC") {
  const parsed = typeof date === "string" ? new Date(date) : date;

  return new Intl.DateTimeFormat("en-US", {
    timeZone,
    dateStyle: "medium",
  }).format(parsed);
}

function parseString(formData: FormData, key: DailyCheckInField) {
  const value = formData.get(key);
  return typeof value === "string" ? normalizeText(value) : "";
}

function parseDate(value: string, errors: DailyCheckInFieldErrors) {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) {
    errors.date = "Use a valid date.";
    return null;
  }

  const date = new Date(`${value}T00:00:00.000Z`);

  if (Number.isNaN(date.getTime())) {
    errors.date = "Use a valid date.";
    return null;
  }

  const today = new Date();
  const todayUtc = new Date(
    Date.UTC(today.getUTCFullYear(), today.getUTCMonth(), today.getUTCDate()),
  );

  if (date > todayUtc) {
    errors.date = "Future dates are not allowed.";
    return null;
  }

  return value;
}

function parseOptionalDecimal(
  value: string,
  field: DailyCheckInField,
  min: number,
  max: number,
  errors: DailyCheckInFieldErrors,
) {
  if (!value) {
    return null;
  }

  if (!/^\d+(\.\d{1,2})?$/.test(value)) {
    errors[field] = "Use a valid number with up to 2 decimals.";
    return null;
  }

  const parsed = Number(value);

  if (parsed < min || parsed > max) {
    errors[field] = `Enter a value between ${min} and ${max}.`;
    return null;
  }

  return value;
}

function parseChoiceBoolean(
  value: string,
  field: DailyCheckInField,
  errors: DailyCheckInFieldErrors,
) {
  if (!value) {
    return null;
  }

  if (value !== "yes" && value !== "no") {
    errors[field] = "Choose yes or no.";
    return null;
  }

  return value === "yes";
}

function parseOptionalInteger(
  value: string,
  field: DailyCheckInField,
  min: number,
  max: number,
  errors: DailyCheckInFieldErrors,
) {
  if (!value) {
    return null;
  }

  if (!/^-?\d+$/.test(value)) {
    errors[field] = "Enter a whole number.";
    return null;
  }

  const parsed = Number(value);

  if (parsed < min || parsed > max) {
    errors[field] = `Enter a value between ${min} and ${max}.`;
    return null;
  }

  return parsed;
}

export function parseDailyCheckInFormData(formData: FormData): ValidationResult {
  const errors: DailyCheckInFieldErrors = {};

  const parsed: ParsedDailyCheckInValues = {
    date: parseDate(parseString(formData, "date"), errors) ?? "",
    morningWeight:
      parseOptionalDecimal(
        parseString(formData, "morningWeight"),
        "morningWeight",
        35,
        300,
        errors,
      ) ?? null,
    sleepHours:
      parseOptionalDecimal(
        parseString(formData, "sleepHours"),
        "sleepHours",
        0,
        18,
        errors,
      ) ?? null,
    trainingCompleted:
      parseChoiceBoolean(
        parseString(formData, "trainingCompleted"),
        "trainingCompleted",
        errors,
      ) ?? null,
    cardioCompleted:
      parseChoiceBoolean(
        parseString(formData, "cardioCompleted"),
        "cardioCompleted",
        errors,
      ) ?? null,
    mealsOnPlan:
      parseOptionalInteger(
        parseString(formData, "mealsOnPlan"),
        "mealsOnPlan",
        0,
        100,
        errors,
      ) ?? null,
    energy:
      parseOptionalInteger(
        parseString(formData, "energy"),
        "energy",
        1,
        10,
        errors,
      ) ?? null,
    stress:
      parseOptionalInteger(
        parseString(formData, "stress"),
        "stress",
        1,
        10,
        errors,
      ) ?? null,
    digestion:
      parseOptionalInteger(
        parseString(formData, "digestion"),
        "digestion",
        1,
        10,
        errors,
      ) ?? null,
    libido:
      parseOptionalInteger(
        parseString(formData, "libido"),
        "libido",
        1,
        10,
        errors,
      ) ?? null,
    notes: parseString(formData, "notes") || null,
  };

  if (Object.keys(errors).length > 0) {
    return { success: false, errors };
  }

  return { success: true, data: parsed };
}

function hasValue(value: DailyCheckInScoringInput[ScorableDailyCheckInField]) {
  return value !== null && value !== undefined && value !== "";
}

export function getMissingRequiredDailyCheckInFields(
  input: DailyCheckInScoringInput,
) {
  return scorableDailyCheckInFields.filter((field) => !hasValue(input[field]));
}

export function getDailyCheckInScoringAssessment(
  input: DailyCheckInScoringInput,
) {
  const missingFields = getMissingRequiredDailyCheckInFields(input);
  const requiredFieldsComplete = missingFields.length === 0;
  const canScore =
    requiredFieldsComplete && input.completionStatus === "COMPLETED";

  return {
    missingFields,
    requiredFieldsComplete,
    canScore,
  };
}

export function getDailyCheckInFormScoringAssessment(
  values: DailyCheckInFormValues,
) {
  return getDailyCheckInScoringAssessment({
    date: values.date,
    morningWeight: values.morningWeight || null,
    sleepHours: values.sleepHours || null,
    trainingCompleted: formChoiceToBoolean(values.trainingCompleted),
    cardioCompleted: formChoiceToBoolean(values.cardioCompleted),
    mealsOnPlan: values.mealsOnPlan || null,
    energy: values.energy || null,
    stress: values.stress || null,
    digestion: values.digestion || null,
    libido: values.libido || null,
  });
}

export function canScoreDailyCheckIn(input: DailyCheckInScoringInput) {
  return getDailyCheckInScoringAssessment(input).canScore;
}

export function getDailyCheckInDisplayStatus(
  input?: Pick<DailyCheckInScoringInput, "completionStatus"> | null,
): DailyCheckInDisplayStatus {
  if (!input || !input.completionStatus || input.completionStatus === "MISSED") {
    return "missing";
  }

  if (input.completionStatus === "COMPLETED") {
    return "completed";
  }

  return "partial";
}

export function getDailyCheckInStatusLabel(status: DailyCheckInDisplayStatus) {
  switch (status) {
    case "completed":
      return "Completed";
    case "partial":
      return "Partial";
    case "missing":
      return "Missing";
  }
}

export function formatBooleanAnswer(value: boolean | null | undefined) {
  if (value === true) {
    return "Yes";
  }

  if (value === false) {
    return "No";
  }

  return "Not set";
}
