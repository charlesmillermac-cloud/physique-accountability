export const sexOptions = [
  { value: "MALE", label: "Male" },
  { value: "FEMALE", label: "Female" },
  { value: "OTHER", label: "Other" },
] as const;

export const goalTypeOptions = [
  { value: "CUT", label: "Cut" },
  { value: "GAIN", label: "Gain" },
  { value: "RECOMP", label: "Recomp" },
  { value: "CONTEST_PREP", label: "Contest prep" },
] as const;

export const muscleGroupOptions = [
  { value: "CHEST", label: "Chest" },
  { value: "BACK", label: "Back" },
  { value: "DELTS", label: "Delts" },
  { value: "ARMS", label: "Arms" },
  { value: "QUADS", label: "Quads" },
  { value: "HAMSTRINGS", label: "Hamstrings" },
  { value: "GLUTES", label: "Glutes" },
  { value: "CALVES", label: "Calves" },
  { value: "ABS", label: "Abs" },
] as const;

export const equipmentAccessOptions = [
  { value: "FULL_GYM", label: "Full gym" },
  { value: "BARBELL_RACK", label: "Barbell rack" },
  { value: "DUMBBELLS", label: "Dumbbells" },
  { value: "MACHINES", label: "Machines" },
  { value: "CABLES", label: "Cables" },
  { value: "RESISTANCE_BANDS", label: "Bands" },
  { value: "CARDIO_MACHINES", label: "Cardio machines" },
  { value: "BODYWEIGHT_ONLY", label: "Bodyweight only" },
] as const;

export type SexValue = (typeof sexOptions)[number]["value"];
export type GoalTypeValue = (typeof goalTypeOptions)[number]["value"];
export type MuscleGroupValue = (typeof muscleGroupOptions)[number]["value"];
export type EquipmentAccessValue =
  (typeof equipmentAccessOptions)[number]["value"];

export type OnboardingFormValues = {
  name: string;
  sex: SexValue | "";
  age: string;
  heightCm: string;
  currentBodyweight: string;
  estimatedBodyFatPercent: string;
  trainingAgeYears: string;
  goalType: GoalTypeValue | "";
  priorityMuscleGroups: MuscleGroupValue[];
  scheduleConstraints: string;
  equipmentAccess: EquipmentAccessValue[];
  calorieTarget: string;
  proteinTargetGrams: string;
  carbsTargetGrams: string;
  fatsTargetGrams: string;
  stepTarget: string;
  cardioTargetMinutes: string;
};

export type OnboardingField = keyof OnboardingFormValues;
export type OnboardingFieldErrors = Partial<Record<OnboardingField, string>>;

export type OnboardingActionState = {
  status: "idle" | "error";
  message?: string;
  fieldErrors: OnboardingFieldErrors;
};

export type ParsedOnboardingValues = {
  name: string;
  firstName: string;
  lastName: string;
  sex: SexValue;
  age: number;
  heightCm: string;
  currentBodyweight: string;
  estimatedBodyFatPercent: string;
  trainingAgeYears: string;
  goalType: GoalTypeValue;
  priorityMuscleGroups: MuscleGroupValue[];
  scheduleConstraints: string;
  equipmentAccess: EquipmentAccessValue[];
  calorieTarget: number;
  proteinTargetGrams: number;
  carbsTargetGrams: number;
  fatsTargetGrams: number;
  stepTarget: number;
  cardioTargetMinutes: number;
};

type ValidationResult =
  | { success: true; data: ParsedOnboardingValues }
  | { success: false; errors: OnboardingFieldErrors };

export const onboardingInitialState: OnboardingActionState = {
  status: "idle",
  fieldErrors: {},
};

export const onboardingSteps = [
  {
    key: "profile",
    number: "01",
    label: "Profile",
    title: "Athlete profile",
    description: "Baseline identity and body composition context.",
  },
  {
    key: "goal",
    number: "02",
    label: "Goal",
    title: "Phase setup",
    description: "Training focus, schedule reality, and equipment context.",
  },
  {
    key: "targets",
    number: "03",
    label: "Targets",
    title: "Execution targets",
    description: "Nutrition, activity, and cardio targets for accountability.",
  },
  {
    key: "review",
    number: "04",
    label: "Review",
    title: "Review and confirm",
    description: "Sanity-check the setup before the workspace goes live.",
  },
] as const;

export const onboardingStepFields: OnboardingField[][] = [
  [
    "name",
    "sex",
    "age",
    "heightCm",
    "currentBodyweight",
    "estimatedBodyFatPercent",
    "trainingAgeYears",
  ],
  [
    "goalType",
    "priorityMuscleGroups",
    "scheduleConstraints",
    "equipmentAccess",
  ],
  [
    "calorieTarget",
    "proteinTargetGrams",
    "carbsTargetGrams",
    "fatsTargetGrams",
    "stepTarget",
    "cardioTargetMinutes",
  ],
  [],
] as const;

const sexValues = new Set(sexOptions.map((option) => option.value));
const goalTypeValues = new Set(goalTypeOptions.map((option) => option.value));
const muscleGroupValues = new Set(
  muscleGroupOptions.map((option) => option.value),
);
const equipmentAccessValues = new Set(
  equipmentAccessOptions.map((option) => option.value),
);

function normalizeText(value: string) {
  return value.trim().replace(/\s+/g, " ");
}

function parseString(formData: FormData, key: OnboardingField) {
  const value = formData.get(key);
  return typeof value === "string" ? normalizeText(value) : "";
}

function parseStringArray(formData: FormData, key: OnboardingField) {
  return formData
    .getAll(key)
    .flatMap((value) => (typeof value === "string" ? [normalizeText(value)] : []))
    .filter(Boolean);
}

function parseInteger(
  value: string,
  field: OnboardingField,
  min: number,
  max: number,
  errors: OnboardingFieldErrors,
) {
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

function parseDecimal(
  value: string,
  field: OnboardingField,
  min: number,
  max: number,
  errors: OnboardingFieldErrors,
) {
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

export function createEmptyOnboardingValues(): OnboardingFormValues {
  return {
    name: "",
    sex: "",
    age: "",
    heightCm: "",
    currentBodyweight: "",
    estimatedBodyFatPercent: "",
    trainingAgeYears: "",
    goalType: "",
    priorityMuscleGroups: [],
    scheduleConstraints: "",
    equipmentAccess: [],
    calorieTarget: "",
    proteinTargetGrams: "",
    carbsTargetGrams: "",
    fatsTargetGrams: "",
    stepTarget: "",
    cardioTargetMinutes: "",
  };
}

export function createOnboardingValues(
  values?: Partial<OnboardingFormValues>,
): OnboardingFormValues {
  return {
    ...createEmptyOnboardingValues(),
    ...values,
    priorityMuscleGroups: values?.priorityMuscleGroups ?? [],
    equipmentAccess: values?.equipmentAccess ?? [],
  };
}

export function splitName(name: string) {
  const normalized = normalizeText(name);
  const [firstName, ...rest] = normalized.split(" ");

  return {
    firstName,
    lastName: rest.join(" ") || "User",
  };
}

export function formatEnumLabel(value: string) {
  return value
    .toLowerCase()
    .split("_")
    .map((segment) => segment.charAt(0).toUpperCase() + segment.slice(1))
    .join(" ");
}

export function getOptionLabel<T extends string>(
  value: T,
  options: readonly { value: T; label: string }[],
) {
  return options.find((option) => option.value === value)?.label ?? formatEnumLabel(value);
}

export function validateOnboardingStep(
  values: OnboardingFormValues,
  stepIndex: number,
) {
  const result = validateOnboardingValues(values);
  const fields = onboardingStepFields[stepIndex] ?? [];

  const filteredErrors = Object.fromEntries(
    Object.entries(result.success ? {} : result.errors).filter(([field]) =>
      fields.includes(field as OnboardingField),
    ),
  ) as OnboardingFieldErrors;

  return {
    success: Object.keys(filteredErrors).length === 0,
    errors: filteredErrors,
  };
}

export function parseOnboardingFormData(formData: FormData): ValidationResult {
  const values = createOnboardingValues({
    name: parseString(formData, "name"),
    sex: parseString(formData, "sex") as SexValue | "",
    age: parseString(formData, "age"),
    heightCm: parseString(formData, "heightCm"),
    currentBodyweight: parseString(formData, "currentBodyweight"),
    estimatedBodyFatPercent: parseString(formData, "estimatedBodyFatPercent"),
    trainingAgeYears: parseString(formData, "trainingAgeYears"),
    goalType: parseString(formData, "goalType") as GoalTypeValue | "",
    priorityMuscleGroups: parseStringArray(
      formData,
      "priorityMuscleGroups",
    ) as MuscleGroupValue[],
    scheduleConstraints: parseString(formData, "scheduleConstraints"),
    equipmentAccess: parseStringArray(
      formData,
      "equipmentAccess",
    ) as EquipmentAccessValue[],
    calorieTarget: parseString(formData, "calorieTarget"),
    proteinTargetGrams: parseString(formData, "proteinTargetGrams"),
    carbsTargetGrams: parseString(formData, "carbsTargetGrams"),
    fatsTargetGrams: parseString(formData, "fatsTargetGrams"),
    stepTarget: parseString(formData, "stepTarget"),
    cardioTargetMinutes: parseString(formData, "cardioTargetMinutes"),
  });

  return validateOnboardingValues(values);
}

export function validateOnboardingValues(
  values: OnboardingFormValues,
): ValidationResult {
  const errors: OnboardingFieldErrors = {};

  if (values.name.length < 2) {
    errors.name = "Enter the athlete's full name.";
  }

  if (!sexValues.has(values.sex as SexValue)) {
    errors.sex = "Select a sex.";
  }

  const age = parseInteger(values.age, "age", 16, 80, errors);
  const heightCm = parseDecimal(values.heightCm, "heightCm", 120, 230, errors);
  const currentBodyweight = parseDecimal(
    values.currentBodyweight,
    "currentBodyweight",
    35,
    300,
    errors,
  );
  const estimatedBodyFatPercent = parseDecimal(
    values.estimatedBodyFatPercent,
    "estimatedBodyFatPercent",
    3,
    60,
    errors,
  );
  const trainingAgeYears = parseDecimal(
    values.trainingAgeYears,
    "trainingAgeYears",
    0,
    40,
    errors,
  );

  if (!goalTypeValues.has(values.goalType as GoalTypeValue)) {
    errors.goalType = "Select a goal type.";
  }

  const invalidMuscleGroups = values.priorityMuscleGroups.some(
    (value) => !muscleGroupValues.has(value),
  );

  if (values.priorityMuscleGroups.length === 0 || invalidMuscleGroups) {
    errors.priorityMuscleGroups = "Choose at least one priority muscle group.";
  } else if (values.priorityMuscleGroups.length > 3) {
    errors.priorityMuscleGroups = "Limit priority muscle groups to 3.";
  }

  if (values.scheduleConstraints.length < 8) {
    errors.scheduleConstraints =
      "Enter the main schedule constraints that affect execution.";
  }

  const invalidEquipmentAccess = values.equipmentAccess.some(
    (value) => !equipmentAccessValues.has(value),
  );

  if (values.equipmentAccess.length === 0 || invalidEquipmentAccess) {
    errors.equipmentAccess = "Select at least one equipment access option.";
  }

  const calorieTarget = parseInteger(
    values.calorieTarget,
    "calorieTarget",
    1000,
    6000,
    errors,
  );
  const proteinTargetGrams = parseInteger(
    values.proteinTargetGrams,
    "proteinTargetGrams",
    40,
    400,
    errors,
  );
  const carbsTargetGrams = parseInteger(
    values.carbsTargetGrams,
    "carbsTargetGrams",
    0,
    700,
    errors,
  );
  const fatsTargetGrams = parseInteger(
    values.fatsTargetGrams,
    "fatsTargetGrams",
    10,
    250,
    errors,
  );
  const stepTarget = parseInteger(
    values.stepTarget,
    "stepTarget",
    2000,
    30000,
    errors,
  );
  const cardioTargetMinutes = parseInteger(
    values.cardioTargetMinutes,
    "cardioTargetMinutes",
    0,
    1200,
    errors,
  );

  if (Object.keys(errors).length > 0) {
    return { success: false, errors };
  }

  const { firstName, lastName } = splitName(values.name);

  return {
    success: true,
    data: {
      name: values.name,
      firstName,
      lastName,
      sex: values.sex as SexValue,
      age: age as number,
      heightCm: heightCm as string,
      currentBodyweight: currentBodyweight as string,
      estimatedBodyFatPercent: estimatedBodyFatPercent as string,
      trainingAgeYears: trainingAgeYears as string,
      goalType: values.goalType as GoalTypeValue,
      priorityMuscleGroups: values.priorityMuscleGroups,
      scheduleConstraints: values.scheduleConstraints,
      equipmentAccess: values.equipmentAccess,
      calorieTarget: calorieTarget as number,
      proteinTargetGrams: proteinTargetGrams as number,
      carbsTargetGrams: carbsTargetGrams as number,
      fatsTargetGrams: fatsTargetGrams as number,
      stepTarget: stepTarget as number,
      cardioTargetMinutes: cardioTargetMinutes as number,
    },
  };
}

export function buildGoalTitle(goalType: GoalTypeValue) {
  switch (goalType) {
    case "CUT":
      return "Cut phase";
    case "GAIN":
      return "Gain phase";
    case "RECOMP":
      return "Recomp phase";
    case "CONTEST_PREP":
      return "Contest prep phase";
  }
}
