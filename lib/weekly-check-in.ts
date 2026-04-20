export const weeklyCheckInStatusValues = [
  "missing",
  "partial",
  "completed",
] as const;

export type WeeklyCheckInDisplayStatus =
  (typeof weeklyCheckInStatusValues)[number];

export const weeklyReviewGateStatusValues = [
  "incomplete",
  "overdue",
  "completed",
] as const;

export type WeeklyReviewGateStatus =
  (typeof weeklyReviewGateStatusValues)[number];

export const subjectiveLookOptions = [
  { value: "fuller", label: "Fuller" },
  { value: "flatter", label: "Flatter" },
  { value: "tighter", label: "Tighter" },
  { value: "softer", label: "Softer" },
  { value: "mixed", label: "Mixed" },
] as const;

export type SubjectiveLookValue =
  (typeof subjectiveLookOptions)[number]["value"];

export const weeklyRequiredFields = [
  "weekStartDate",
  "averageBodyweight",
  "waistMeasurement",
  "frontPhotoUrl",
  "sidePhotoUrl",
  "backPhotoUrl",
  "trainingCompliancePercentage",
  "nutritionCompliancePercentage",
  "subjectiveLook",
  "recoveryState",
] as const;

export type RequiredWeeklyCheckInField =
  (typeof weeklyRequiredFields)[number];

export const weeklyFieldLabels: Record<RequiredWeeklyCheckInField, string> = {
  weekStartDate: "Week start date",
  averageBodyweight: "7-day average bodyweight",
  waistMeasurement: "Waist measurement",
  frontPhotoUrl: "Front photo",
  sidePhotoUrl: "Side photo",
  backPhotoUrl: "Back photo",
  trainingCompliancePercentage: "Training compliance",
  nutritionCompliancePercentage: "Nutrition compliance",
  subjectiveLook: "Subjective look",
  recoveryState: "Recovery state",
};

export const weeklyPhotoPlaceholderValues = {
  frontPhotoUrl: "placeholder://weekly/front-photo",
  sidePhotoUrl: "placeholder://weekly/side-photo",
  backPhotoUrl: "placeholder://weekly/back-photo",
} as const;

type WeeklyPhotoField = keyof typeof weeklyPhotoPlaceholderValues;
type NumericLike = string | number | { toString(): string };

export type WeeklyCheckInFormValues = {
  weekStartDate: string;
  averageBodyweight: string;
  waistMeasurement: string;
  frontPhotoUrl: string;
  sidePhotoUrl: string;
  backPhotoUrl: string;
  trainingCompliancePercentage: string;
  nutritionCompliancePercentage: string;
  subjectiveLook: SubjectiveLookValue | "";
  recoveryState: string;
  notes: string;
};

export type WeeklyCheckInField = keyof WeeklyCheckInFormValues;
export type WeeklyCheckInFieldErrors = Partial<
  Record<WeeklyCheckInField, string>
>;

export type WeeklyCheckInActionState = {
  status: "idle" | "success" | "error";
  message?: string;
  fieldErrors: WeeklyCheckInFieldErrors;
  savedStatus?: WeeklyCheckInDisplayStatus;
  canComplete?: boolean;
  missingFields?: RequiredWeeklyCheckInField[];
};

export type WeeklyCheckInCompletionInput = {
  weekStartDate?: string | Date | null;
  averageBodyweight?: NumericLike | null;
  waistMeasurement?: NumericLike | null;
  frontPhotoUrl?: string | null;
  sidePhotoUrl?: string | null;
  backPhotoUrl?: string | null;
  trainingCompliancePercentage?: NumericLike | null;
  nutritionCompliancePercentage?: NumericLike | null;
  subjectiveLook?: string | null;
  recoveryState?: string | null;
  completionStatus?: "PENDING" | "PARTIAL" | "COMPLETED" | "MISSED" | null;
};

export type WeeklyReviewGateAssessment = {
  status: WeeklyReviewGateStatus;
  weekStartDate: string;
  weekEndDate: string;
  dueDate: string;
  missingFields: RequiredWeeklyCheckInField[];
  canComplete: boolean;
  displayStatus: WeeklyCheckInDisplayStatus;
};

type ParsedWeeklyCheckInValues = {
  weekStartDate: string;
  averageBodyweight: string | null;
  waistMeasurement: string | null;
  frontPhotoUrl: string | null;
  sidePhotoUrl: string | null;
  backPhotoUrl: string | null;
  trainingCompliancePercentage: string | null;
  nutritionCompliancePercentage: string | null;
  subjectiveLook: SubjectiveLookValue | null;
  recoveryState: string | null;
  notes: string | null;
};

type ValidationResult =
  | { success: true; data: ParsedWeeklyCheckInValues }
  | { success: false; errors: WeeklyCheckInFieldErrors };

export const weeklyCheckInInitialState: WeeklyCheckInActionState = {
  status: "idle",
  fieldErrors: {},
};

export function createEmptyWeeklyCheckInValues(
  weekStartDate: string,
): WeeklyCheckInFormValues {
  return {
    weekStartDate,
    averageBodyweight: "",
    waistMeasurement: "",
    frontPhotoUrl: "",
    sidePhotoUrl: "",
    backPhotoUrl: "",
    trainingCompliancePercentage: "",
    nutritionCompliancePercentage: "",
    subjectiveLook: "",
    recoveryState: "",
    notes: "",
  };
}

export function createWeeklyCheckInValues(
  weekStartDate: string,
  values?: Partial<WeeklyCheckInFormValues>,
): WeeklyCheckInFormValues {
  return {
    ...createEmptyWeeklyCheckInValues(weekStartDate),
    ...values,
  };
}

function normalizeText(value: string) {
  return value.trim().replace(/\s+/g, " ");
}

function formatUtcDateValue(date: Date) {
  return date.toISOString().slice(0, 10);
}

function parseDateValueAsUtc(value: string) {
  return new Date(`${value}T00:00:00.000Z`);
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
  const parsed = typeof date === "string" ? parseDateValueAsUtc(date) : date;

  return new Intl.DateTimeFormat("en-US", {
    timeZone,
    dateStyle: "medium",
  }).format(parsed);
}

export function addDaysToDateValue(value: string, days: number) {
  const date = parseDateValueAsUtc(value);
  date.setUTCDate(date.getUTCDate() + days);
  return formatUtcDateValue(date);
}

export function getWeekStartDateValue(date: Date, timeZone = "UTC") {
  const localDateValue = formatDateInputValue(date, timeZone);
  const localDate = parseDateValueAsUtc(localDateValue);
  const day = localDate.getUTCDay();
  const offset = day === 0 ? -6 : 1 - day;

  localDate.setUTCDate(localDate.getUTCDate() + offset);

  return formatUtcDateValue(localDate);
}

export function getCurrentWeeklyReviewWeekStart(
  date: Date,
  timeZone = "UTC",
) {
  return addDaysToDateValue(getWeekStartDateValue(date, timeZone), -7);
}

function parseString(formData: FormData, key: WeeklyCheckInField) {
  const value = formData.get(key);
  return typeof value === "string" ? normalizeText(value) : "";
}

function parseWeekStartDate(
  value: string,
  errors: WeeklyCheckInFieldErrors,
) {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) {
    errors.weekStartDate = "Use a valid week start date.";
    return null;
  }

  const date = parseDateValueAsUtc(value);

  if (Number.isNaN(date.getTime())) {
    errors.weekStartDate = "Use a valid week start date.";
    return null;
  }

  const today = new Date();
  const todayUtc = new Date(
    Date.UTC(today.getUTCFullYear(), today.getUTCMonth(), today.getUTCDate()),
  );

  if (date > todayUtc) {
    errors.weekStartDate = "Future weeks are not allowed.";
    return null;
  }

  if (date.getUTCDay() !== 1) {
    errors.weekStartDate = "Use the Monday that starts the review week.";
    return null;
  }

  return value;
}

function parseOptionalDecimal(
  value: string,
  field: WeeklyCheckInField,
  min: number,
  max: number,
  errors: WeeklyCheckInFieldErrors,
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

export function isPlaceholderPhotoValue(value: string) {
  return value.startsWith("placeholder://");
}

function parsePhotoEvidence(
  value: string,
  field: WeeklyPhotoField,
  errors: WeeklyCheckInFieldErrors,
) {
  if (!value) {
    return null;
  }

  if (isPlaceholderPhotoValue(value)) {
    return value;
  }

  try {
    const parsed = new URL(value);

    if (parsed.protocol !== "http:" && parsed.protocol !== "https:") {
      errors[field] = "Use an absolute http or https URL.";
      return null;
    }

    return value;
  } catch {
    errors[field] = "Use a valid image URL or apply the placeholder.";
    return null;
  }
}

function parseSubjectiveLook(
  value: string,
  errors: WeeklyCheckInFieldErrors,
) {
  if (!value) {
    return null;
  }

  const match = subjectiveLookOptions.find((option) => option.value === value);

  if (!match) {
    errors.subjectiveLook = "Choose one of the listed review outcomes.";
    return null;
  }

  return match.value;
}

function parseRecoveryState(
  value: string,
  errors: WeeklyCheckInFieldErrors,
) {
  if (!value) {
    return null;
  }

  if (value.length > 240) {
    errors.recoveryState = "Keep the recovery state under 240 characters.";
    return null;
  }

  return value;
}

export function parseWeeklyCheckInFormData(
  formData: FormData,
): ValidationResult {
  const errors: WeeklyCheckInFieldErrors = {};

  const parsed: ParsedWeeklyCheckInValues = {
    weekStartDate:
      parseWeekStartDate(parseString(formData, "weekStartDate"), errors) ?? "",
    averageBodyweight:
      parseOptionalDecimal(
        parseString(formData, "averageBodyweight"),
        "averageBodyweight",
        35,
        300,
        errors,
      ) ?? null,
    waistMeasurement:
      parseOptionalDecimal(
        parseString(formData, "waistMeasurement"),
        "waistMeasurement",
        30,
        250,
        errors,
      ) ?? null,
    frontPhotoUrl:
      parsePhotoEvidence(
        parseString(formData, "frontPhotoUrl"),
        "frontPhotoUrl",
        errors,
      ) ?? null,
    sidePhotoUrl:
      parsePhotoEvidence(
        parseString(formData, "sidePhotoUrl"),
        "sidePhotoUrl",
        errors,
      ) ?? null,
    backPhotoUrl:
      parsePhotoEvidence(
        parseString(formData, "backPhotoUrl"),
        "backPhotoUrl",
        errors,
      ) ?? null,
    trainingCompliancePercentage:
      parseOptionalDecimal(
        parseString(formData, "trainingCompliancePercentage"),
        "trainingCompliancePercentage",
        0,
        100,
        errors,
      ) ?? null,
    nutritionCompliancePercentage:
      parseOptionalDecimal(
        parseString(formData, "nutritionCompliancePercentage"),
        "nutritionCompliancePercentage",
        0,
        100,
        errors,
      ) ?? null,
    subjectiveLook:
      parseSubjectiveLook(parseString(formData, "subjectiveLook"), errors) ??
      null,
    recoveryState:
      parseRecoveryState(parseString(formData, "recoveryState"), errors) ?? null,
    notes: parseString(formData, "notes") || null,
  };

  if (Object.keys(errors).length > 0) {
    return { success: false, errors };
  }

  return { success: true, data: parsed };
}

function hasValue(value: WeeklyCheckInCompletionInput[RequiredWeeklyCheckInField]) {
  if (typeof value === "string") {
    return value.trim().length > 0;
  }

  return value !== null && value !== undefined;
}

export function getMissingRequiredWeeklyCheckInFields(
  input: WeeklyCheckInCompletionInput,
) {
  return weeklyRequiredFields.filter((field) => !hasValue(input[field]));
}

export function getWeeklyCheckInCompletionAssessment(
  input: WeeklyCheckInCompletionInput,
) {
  const missingFields = getMissingRequiredWeeklyCheckInFields(input);
  const requiredEvidenceComplete = missingFields.length === 0;
  const canComplete =
    requiredEvidenceComplete && input.completionStatus === "COMPLETED";

  return {
    missingFields,
    requiredEvidenceComplete,
    canComplete,
  };
}

export function getWeeklyCheckInFormCompletionAssessment(
  values: WeeklyCheckInFormValues,
) {
  return getWeeklyCheckInCompletionAssessment({
    weekStartDate: values.weekStartDate,
    averageBodyweight: values.averageBodyweight || null,
    waistMeasurement: values.waistMeasurement || null,
    frontPhotoUrl: values.frontPhotoUrl || null,
    sidePhotoUrl: values.sidePhotoUrl || null,
    backPhotoUrl: values.backPhotoUrl || null,
    trainingCompliancePercentage:
      values.trainingCompliancePercentage || null,
    nutritionCompliancePercentage:
      values.nutritionCompliancePercentage || null,
    subjectiveLook: values.subjectiveLook || null,
    recoveryState: values.recoveryState || null,
  });
}

export function canCompleteWeeklyCheckIn(
  input: WeeklyCheckInCompletionInput,
) {
  return getWeeklyCheckInCompletionAssessment(input).canComplete;
}

export function getWeeklyCheckInDisplayStatus(
  input?: Pick<WeeklyCheckInCompletionInput, "completionStatus"> | null,
): WeeklyCheckInDisplayStatus {
  if (!input || !input.completionStatus || input.completionStatus === "MISSED") {
    return "missing";
  }

  if (input.completionStatus === "COMPLETED") {
    return "completed";
  }

  return "partial";
}

export function getWeeklyCheckInStatusLabel(status: WeeklyCheckInDisplayStatus) {
  switch (status) {
    case "completed":
      return "Completed";
    case "partial":
      return "Partial";
    case "missing":
      return "Missing";
  }
}

export function getWeeklyReviewGateStatusLabel(status: WeeklyReviewGateStatus) {
  switch (status) {
    case "completed":
      return "Completed";
    case "incomplete":
      return "Incomplete";
    case "overdue":
      return "Overdue";
  }
}

export function getPhotoEvidenceSummary(value: string | null | undefined) {
  if (!value) {
    return "Missing";
  }

  if (isPlaceholderPhotoValue(value)) {
    return "Placeholder attached";
  }

  return "URL attached";
}

export function getWeeklyReviewGateAssessment(
  input: WeeklyCheckInCompletionInput | null | undefined,
  options: {
    now?: Date;
    timeZone?: string;
  } = {},
): WeeklyReviewGateAssessment {
  const now = options.now ?? new Date();
  const timeZone = options.timeZone ?? "UTC";
  const weekStartDate = getCurrentWeeklyReviewWeekStart(now, timeZone);
  const weekEndDate = addDaysToDateValue(weekStartDate, 6);
  const dueDate = addDaysToDateValue(weekStartDate, 7);
  const todayValue = formatDateInputValue(now, timeZone);
  const assessment = getWeeklyCheckInCompletionAssessment({
    weekStartDate,
    ...input,
  });
  const displayStatus = getWeeklyCheckInDisplayStatus(input);
  const isCompleted =
    displayStatus === "completed" && assessment.requiredEvidenceComplete;

  return {
    status: isCompleted ? "completed" : todayValue > dueDate ? "overdue" : "incomplete",
    weekStartDate,
    weekEndDate,
    dueDate,
    missingFields: assessment.missingFields,
    canComplete: assessment.requiredEvidenceComplete,
    displayStatus,
  };
}
