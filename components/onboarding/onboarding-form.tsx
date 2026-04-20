"use client";

import type { FormEvent, ReactNode } from "react";
import { useActionState, useState } from "react";

import { ArrowLeft, ArrowRight, Check, ChevronRight } from "lucide-react";

import { submitOnboardingAction } from "@/app/(workspace)/onboarding/actions";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";
import {
  createOnboardingValues,
  equipmentAccessOptions,
  getOptionLabel,
  goalTypeOptions,
  muscleGroupOptions,
  onboardingInitialState,
  onboardingSteps,
  sexOptions,
  validateOnboardingStep,
  validateOnboardingValues,
  type EquipmentAccessValue,
  type GoalTypeValue,
  type MuscleGroupValue,
  type OnboardingField,
  type OnboardingFieldErrors,
  type OnboardingFormValues,
  type SexValue,
} from "@/lib/onboarding";

type OnboardingFormProps = {
  initialValues: OnboardingFormValues;
};

type FieldShellProps = {
  field: OnboardingField;
  label: string;
  hint?: string;
  error?: string;
  children: ReactNode;
};

function FieldShell({ field, label, hint, error, children }: FieldShellProps) {
  return (
    <div className="space-y-3">
      <div className="space-y-1">
        <Label htmlFor={field}>{label}</Label>
        {hint ? <p className="text-xs leading-5 text-slate-500">{hint}</p> : null}
      </div>
      {children}
      {error ? <p className="text-sm text-rose-600">{error}</p> : null}
    </div>
  );
}

type SingleSelectProps<T extends string> = {
  field: OnboardingField;
  value: T | "";
  options: readonly { value: T; label: string }[];
  onChange: (value: T) => void;
  error?: string;
};

function SingleSelectField<T extends string>({
  field,
  value,
  options,
  onChange,
  error,
}: SingleSelectProps<T>) {
  return (
    <>
      <input type="hidden" name={field} value={value} />
      <div className="grid gap-3 sm:grid-cols-2">
        {options.map((option) => {
          const isActive = option.value === value;

          return (
            <button
              key={option.value}
              type="button"
              onClick={() => onChange(option.value)}
              className={cn(
                "rounded-[1.5rem] border px-4 py-4 text-left text-sm transition-colors",
                isActive
                  ? "border-slate-950 bg-slate-950 text-white"
                  : "border-slate-200 bg-white text-slate-700 hover:border-slate-300 hover:bg-slate-50",
              )}
            >
              <span className="block font-semibold">{option.label}</span>
            </button>
          );
        })}
      </div>
      {error ? <p className="text-sm text-rose-600">{error}</p> : null}
    </>
  );
}

type MultiSelectProps<T extends string> = {
  field: OnboardingField;
  values: T[];
  options: readonly { value: T; label: string }[];
  onToggle: (value: T) => void;
  error?: string;
};

function MultiSelectField<T extends string>({
  field,
  values,
  options,
  onToggle,
  error,
}: MultiSelectProps<T>) {
  return (
    <>
      {values.map((value) => (
        <input key={`${field}-${value}`} type="hidden" name={field} value={value} />
      ))}
      <div className="flex flex-wrap gap-3">
        {options.map((option) => {
          const isSelected = values.includes(option.value);

          return (
            <button
              key={option.value}
              type="button"
              onClick={() => onToggle(option.value)}
              className={cn(
                "rounded-full border px-4 py-2 text-sm font-medium transition-colors",
                isSelected
                  ? "border-slate-950 bg-slate-950 text-white"
                  : "border-slate-200 bg-white text-slate-700 hover:border-slate-300 hover:bg-slate-50",
              )}
            >
              {option.label}
            </button>
          );
        })}
      </div>
      {error ? <p className="text-sm text-rose-600">{error}</p> : null}
    </>
  );
}

type ReviewItemProps = {
  label: string;
  value: string;
};

function ReviewItem({ label, value }: ReviewItemProps) {
  return (
    <div className="rounded-[1.5rem] border border-slate-200 bg-slate-50/80 p-4">
      <p className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">
        {label}
      </p>
      <p className="mt-2 text-sm leading-6 text-slate-700">{value}</p>
    </div>
  );
}

export function OnboardingForm({ initialValues }: OnboardingFormProps) {
  const [state, formAction, isPending] = useActionState(
    submitOnboardingAction,
    onboardingInitialState,
  );
  const [stepIndex, setStepIndex] = useState(0);
  const [values, setValues] = useState(() => createOnboardingValues(initialValues));
  const [clientErrors, setClientErrors] = useState<OnboardingFieldErrors>({});

  const fieldErrors = {
    ...state.fieldErrors,
    ...clientErrors,
  };

  function clearFieldError(field: OnboardingField) {
    setClientErrors((current) => {
      if (!current[field]) {
        return current;
      }

      const next = { ...current };
      delete next[field];
      return next;
    });
  }

  function setField<K extends OnboardingField>(
    field: K,
    value: OnboardingFormValues[K],
  ) {
    setValues((current) => ({
      ...current,
      [field]: value,
    }));
    clearFieldError(field);
  }

  function toggleMuscleGroup(value: MuscleGroupValue) {
    setValues((current) => {
      const next = current.priorityMuscleGroups.includes(value)
        ? current.priorityMuscleGroups.filter((item) => item !== value)
        : current.priorityMuscleGroups.length < 3
          ? [...current.priorityMuscleGroups, value]
          : current.priorityMuscleGroups;

      return {
        ...current,
        priorityMuscleGroups: next,
      };
    });

    setClientErrors((current) => ({
      ...current,
      priorityMuscleGroups: undefined,
    }));
  }

  function toggleEquipment(value: EquipmentAccessValue) {
    setValues((current) => ({
      ...current,
      equipmentAccess: current.equipmentAccess.includes(value)
        ? current.equipmentAccess.filter((item) => item !== value)
        : [...current.equipmentAccess, value],
    }));
    clearFieldError("equipmentAccess");
  }

  function goToNextStep() {
    const validation = validateOnboardingStep(values, stepIndex);

    if (!validation.success) {
      setClientErrors(validation.errors);
      return;
    }

    setClientErrors({});
    setStepIndex((current) => Math.min(current + 1, onboardingSteps.length - 1));
  }

  function goToPreviousStep() {
    setStepIndex((current) => Math.max(current - 1, 0));
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    const validation = validateOnboardingValues(values);

    if (validation.success) {
      setClientErrors({});
      return;
    }

    event.preventDefault();
    setClientErrors(validation.errors);

    const firstErrorStep = onboardingSteps.findIndex((_, index) => {
      const stepValidation = validateOnboardingStep(values, index);
      return !stepValidation.success;
    });

    if (firstErrorStep >= 0) {
      setStepIndex(firstErrorStep);
    }
  }

  return (
    <form action={formAction} onSubmit={handleSubmit} className="space-y-6">
      <Card className="overflow-hidden border-slate-200/80 bg-white/90">
        <CardHeader className="gap-5 border-b border-slate-200/80 bg-slate-50/80">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <div className="space-y-2">
              <CardDescription>Multi-step onboarding</CardDescription>
              <CardTitle className="text-2xl text-slate-950">
                Build the active accountability phase
              </CardTitle>
              <p className="max-w-2xl text-sm leading-7 text-slate-600">
                This flow captures the athlete profile, current phase context,
                and execution targets we need before the accountability engine
                can score compliance intelligently.
              </p>
            </div>
            <Badge variant="outline" className="bg-white">
              Step {stepIndex + 1} of {onboardingSteps.length}
            </Badge>
          </div>

          <div className="grid gap-3 lg:grid-cols-4">
            {onboardingSteps.map((step, index) => {
              const isCurrent = index === stepIndex;
              const isComplete = index < stepIndex;

              return (
                <div
                  key={step.key}
                  className={cn(
                    "rounded-[1.5rem] border px-4 py-4 transition-colors",
                    isCurrent
                      ? "border-slate-950 bg-slate-950 text-white"
                      : isComplete
                        ? "border-emerald-200 bg-emerald-50 text-emerald-900"
                        : "border-slate-200 bg-white text-slate-600",
                  )}
                >
                  <div className="flex items-center justify-between">
                    <p className="text-xs font-semibold uppercase tracking-[0.16em]">
                      {step.number}
                    </p>
                    {isComplete ? <Check className="h-4 w-4" /> : null}
                  </div>
                  <p className="mt-4 text-sm font-semibold">{step.title}</p>
                  <p
                    className={cn(
                      "mt-2 text-xs leading-5",
                      isCurrent ? "text-slate-300" : "",
                    )}
                  >
                    {step.description}
                  </p>
                </div>
              );
            })}
          </div>
        </CardHeader>

        <CardContent className="space-y-8 pt-8">
          {state.message ? (
            <div className="rounded-[1.5rem] border border-rose-200 bg-rose-50 px-5 py-4 text-sm text-rose-700">
              {state.message}
            </div>
          ) : null}

          <section className={cn(stepIndex === 0 ? "block" : "hidden", "space-y-6")}>
            <div className="grid gap-6 lg:grid-cols-2">
              <FieldShell
                field="name"
                label="Name"
                hint="Use the athlete's working name for coaching communication."
                error={fieldErrors.name}
              >
                <Input
                  id="name"
                  name="name"
                  value={values.name}
                  onChange={(event) => setField("name", event.target.value)}
                  placeholder="Jordan Carter"
                  autoComplete="name"
                />
              </FieldShell>

              <FieldShell
                field="sex"
                label="Sex"
                hint="Stored as a physiology-oriented profile field for planning context."
                error={fieldErrors.sex}
              >
                <SingleSelectField<SexValue>
                  field="sex"
                  value={values.sex}
                  options={sexOptions}
                  onChange={(value) => setField("sex", value)}
                  error={undefined}
                />
              </FieldShell>

              <FieldShell
                field="age"
                label="Age"
                hint="Whole years."
                error={fieldErrors.age}
              >
                <Input
                  id="age"
                  name="age"
                  inputMode="numeric"
                  value={values.age}
                  onChange={(event) => setField("age", event.target.value)}
                  placeholder="29"
                />
              </FieldShell>

              <FieldShell
                field="heightCm"
                label="Height"
                hint="Centimeters."
                error={fieldErrors.heightCm}
              >
                <Input
                  id="heightCm"
                  name="heightCm"
                  inputMode="decimal"
                  value={values.heightCm}
                  onChange={(event) => setField("heightCm", event.target.value)}
                  placeholder="178"
                />
              </FieldShell>

              <FieldShell
                field="currentBodyweight"
                label="Current bodyweight"
                hint="Kilograms."
                error={fieldErrors.currentBodyweight}
              >
                <Input
                  id="currentBodyweight"
                  name="currentBodyweight"
                  inputMode="decimal"
                  value={values.currentBodyweight}
                  onChange={(event) =>
                    setField("currentBodyweight", event.target.value)
                  }
                  placeholder="86.4"
                />
              </FieldShell>

              <FieldShell
                field="estimatedBodyFatPercent"
                label="Estimated body fat"
                hint="Percentage."
                error={fieldErrors.estimatedBodyFatPercent}
              >
                <Input
                  id="estimatedBodyFatPercent"
                  name="estimatedBodyFatPercent"
                  inputMode="decimal"
                  value={values.estimatedBodyFatPercent}
                  onChange={(event) =>
                    setField("estimatedBodyFatPercent", event.target.value)
                  }
                  placeholder="14.5"
                />
              </FieldShell>

              <FieldShell
                field="trainingAgeYears"
                label="Training age"
                hint="Years of meaningful resistance training."
                error={fieldErrors.trainingAgeYears}
              >
                <Input
                  id="trainingAgeYears"
                  name="trainingAgeYears"
                  inputMode="decimal"
                  value={values.trainingAgeYears}
                  onChange={(event) =>
                    setField("trainingAgeYears", event.target.value)
                  }
                  placeholder="4"
                />
              </FieldShell>
            </div>
          </section>

          <section className={cn(stepIndex === 1 ? "block" : "hidden", "space-y-6")}>
            <div className="grid gap-6">
              <FieldShell
                field="goalType"
                label="Goal type"
                hint="Sets the current phase lens for accountability and review."
                error={fieldErrors.goalType}
              >
                <SingleSelectField<GoalTypeValue>
                  field="goalType"
                  value={values.goalType}
                  options={goalTypeOptions}
                  onChange={(value) => setField("goalType", value)}
                  error={undefined}
                />
              </FieldShell>

              <FieldShell
                field="priorityMuscleGroups"
                label="Priority muscle groups"
                hint="Select up to 3 groups so the phase has a real emphasis."
                error={fieldErrors.priorityMuscleGroups}
              >
                <MultiSelectField<MuscleGroupValue>
                  field="priorityMuscleGroups"
                  values={values.priorityMuscleGroups}
                  options={muscleGroupOptions}
                  onToggle={toggleMuscleGroup}
                  error={undefined}
                />
              </FieldShell>

              <FieldShell
                field="scheduleConstraints"
                label="Schedule constraints"
                hint="Capture the execution limits that matter: travel, shift work, session windows, or lifestyle friction."
                error={fieldErrors.scheduleConstraints}
              >
                <Textarea
                  id="scheduleConstraints"
                  name="scheduleConstraints"
                  value={values.scheduleConstraints}
                  onChange={(event) =>
                    setField("scheduleConstraints", event.target.value)
                  }
                  placeholder="Early meetings limit weekday morning training. Friday travel compresses the weekend schedule."
                />
              </FieldShell>

              <FieldShell
                field="equipmentAccess"
                label="Equipment access"
                hint="Select the actual tools available in the athlete's environment."
                error={fieldErrors.equipmentAccess}
              >
                <MultiSelectField<EquipmentAccessValue>
                  field="equipmentAccess"
                  values={values.equipmentAccess}
                  options={equipmentAccessOptions}
                  onToggle={toggleEquipment}
                  error={undefined}
                />
              </FieldShell>
            </div>
          </section>

          <section className={cn(stepIndex === 2 ? "block" : "hidden", "space-y-6")}>
            <div className="grid gap-6 lg:grid-cols-2">
              <FieldShell
                field="calorieTarget"
                label="Calorie target"
                hint="Daily calories."
                error={fieldErrors.calorieTarget}
              >
                <Input
                  id="calorieTarget"
                  name="calorieTarget"
                  inputMode="numeric"
                  value={values.calorieTarget}
                  onChange={(event) =>
                    setField("calorieTarget", event.target.value)
                  }
                  placeholder="2500"
                />
              </FieldShell>

              <FieldShell
                field="proteinTargetGrams"
                label="Protein target"
                hint="Grams per day."
                error={fieldErrors.proteinTargetGrams}
              >
                <Input
                  id="proteinTargetGrams"
                  name="proteinTargetGrams"
                  inputMode="numeric"
                  value={values.proteinTargetGrams}
                  onChange={(event) =>
                    setField("proteinTargetGrams", event.target.value)
                  }
                  placeholder="210"
                />
              </FieldShell>

              <FieldShell
                field="carbsTargetGrams"
                label="Carbohydrate target"
                hint="Grams per day."
                error={fieldErrors.carbsTargetGrams}
              >
                <Input
                  id="carbsTargetGrams"
                  name="carbsTargetGrams"
                  inputMode="numeric"
                  value={values.carbsTargetGrams}
                  onChange={(event) =>
                    setField("carbsTargetGrams", event.target.value)
                  }
                  placeholder="250"
                />
              </FieldShell>

              <FieldShell
                field="fatsTargetGrams"
                label="Fat target"
                hint="Grams per day."
                error={fieldErrors.fatsTargetGrams}
              >
                <Input
                  id="fatsTargetGrams"
                  name="fatsTargetGrams"
                  inputMode="numeric"
                  value={values.fatsTargetGrams}
                  onChange={(event) =>
                    setField("fatsTargetGrams", event.target.value)
                  }
                  placeholder="70"
                />
              </FieldShell>

              <FieldShell
                field="stepTarget"
                label="Step target"
                hint="Daily steps."
                error={fieldErrors.stepTarget}
              >
                <Input
                  id="stepTarget"
                  name="stepTarget"
                  inputMode="numeric"
                  value={values.stepTarget}
                  onChange={(event) => setField("stepTarget", event.target.value)}
                  placeholder="10000"
                />
              </FieldShell>

              <FieldShell
                field="cardioTargetMinutes"
                label="Cardio target"
                hint="Minutes per week. Use 0 if cardio is not currently prescribed."
                error={fieldErrors.cardioTargetMinutes}
              >
                <Input
                  id="cardioTargetMinutes"
                  name="cardioTargetMinutes"
                  inputMode="numeric"
                  value={values.cardioTargetMinutes}
                  onChange={(event) =>
                    setField("cardioTargetMinutes", event.target.value)
                  }
                  placeholder="120"
                />
              </FieldShell>
            </div>
          </section>

          <section className={cn(stepIndex === 3 ? "block" : "hidden", "space-y-6")}>
            <div className="grid gap-6 xl:grid-cols-[0.95fr_1.05fr]">
              <Card className="border-slate-200 bg-slate-50/80 shadow-none">
                <CardHeader>
                  <CardDescription>Profile review</CardDescription>
                  <CardTitle className="text-slate-950">
                    Athlete baseline
                  </CardTitle>
                </CardHeader>
                <CardContent className="grid gap-4 sm:grid-cols-2">
                  <ReviewItem label="Name" value={values.name || "Not set"} />
                  <ReviewItem
                    label="Sex"
                    value={
                      values.sex ? getOptionLabel(values.sex, sexOptions) : "Not set"
                    }
                  />
                  <ReviewItem label="Age" value={`${values.age} years`} />
                  <ReviewItem label="Height" value={`${values.heightCm} cm`} />
                  <ReviewItem
                    label="Bodyweight"
                    value={`${values.currentBodyweight} kg`}
                  />
                  <ReviewItem
                    label="Estimated body fat"
                    value={`${values.estimatedBodyFatPercent}%`}
                  />
                  <ReviewItem
                    label="Training age"
                    value={`${values.trainingAgeYears} years`}
                  />
                </CardContent>
              </Card>

              <Card className="border-slate-200 bg-slate-950 text-white shadow-none">
                <CardHeader>
                  <CardDescription className="text-slate-400">
                    Phase review
                  </CardDescription>
                  <CardTitle className="text-white">
                    Active goal summary
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-5">
                  <div className="rounded-[1.5rem] border border-white/10 bg-white/5 p-5">
                    <p className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-400">
                      Goal type
                    </p>
                    <p className="mt-3 text-lg font-semibold text-white">
                      {values.goalType
                        ? getOptionLabel(values.goalType, goalTypeOptions)
                        : "Not set"}
                    </p>
                  </div>

                  <div className="grid gap-4 sm:grid-cols-2">
                    <ReviewItem
                      label="Priority muscle groups"
                      value={
                        values.priorityMuscleGroups.length > 0
                          ? values.priorityMuscleGroups
                              .map((value) =>
                                getOptionLabel(value, muscleGroupOptions),
                              )
                              .join(", ")
                          : "Not set"
                      }
                    />
                    <ReviewItem
                      label="Equipment access"
                      value={
                        values.equipmentAccess.length > 0
                          ? values.equipmentAccess
                              .map((value) =>
                                getOptionLabel(value, equipmentAccessOptions),
                              )
                              .join(", ")
                          : "Not set"
                      }
                    />
                    <ReviewItem
                      label="Nutrition targets"
                      value={`${values.calorieTarget} kcal | P ${values.proteinTargetGrams}g | C ${values.carbsTargetGrams}g | F ${values.fatsTargetGrams}g`}
                    />
                    <ReviewItem
                      label="Activity targets"
                      value={`${values.stepTarget} steps/day | ${values.cardioTargetMinutes} min cardio/week`}
                    />
                  </div>

                  <div className="rounded-[1.5rem] border border-white/10 bg-white/5 p-5">
                    <p className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-400">
                      Schedule constraints
                    </p>
                    <p className="mt-3 text-sm leading-7 text-slate-200">
                      {values.scheduleConstraints}
                    </p>
                  </div>
                </CardContent>
              </Card>
            </div>
          </section>
        </CardContent>
      </Card>

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="text-sm leading-6 text-slate-500">
          The current onboarding submission will archive any existing active goal
          and replace it with this updated phase.
        </div>
        <div className="flex gap-3">
          {stepIndex > 0 ? (
            <Button type="button" variant="secondary" onClick={goToPreviousStep}>
              <ArrowLeft className="h-4 w-4" />
              Back
            </Button>
          ) : null}

          {stepIndex < onboardingSteps.length - 1 ? (
            <Button type="button" onClick={goToNextStep}>
              Continue
              <ChevronRight className="h-4 w-4" />
            </Button>
          ) : (
            <Button type="submit" disabled={isPending}>
              {isPending ? "Saving setup..." : "Complete onboarding"}
              <ArrowRight className="h-4 w-4" />
            </Button>
          )}
        </div>
      </div>
    </form>
  );
}
