"use client";

import type { ReactNode } from "react";
import { useActionState, useMemo, useState } from "react";

import { CheckCircle2, Save } from "lucide-react";

import { submitDailyCheckInAction } from "@/app/(workspace)/daily-check-in/actions";
import { DailyCheckInStatusBadge } from "@/components/daily-check-in/daily-check-in-status-badge";
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
import {
  biofeedbackScaleOptions,
  createDailyCheckInValues,
  dailyCheckInInitialState,
  formatBooleanAnswer,
  getDailyCheckInFormScoringAssessment,
  mealsOnPlanOptions,
  scorableDailyCheckInFields,
  yesNoOptions,
  type DailyCheckInDisplayStatus,
  type DailyCheckInField,
  type DailyCheckInFormValues,
  type ScorableDailyCheckInField,
} from "@/lib/daily-check-in";
import { cn } from "@/lib/utils";

type DailyCheckInFormProps = {
  initialValues: DailyCheckInFormValues;
  initialStatus: DailyCheckInDisplayStatus;
};

type FieldShellProps = {
  field: DailyCheckInField;
  label: string;
  children: ReactNode;
  error?: string;
  hint?: string;
  requiredForScoring?: boolean;
};

const scoringFieldLabels: Record<ScorableDailyCheckInField, string> = {
  date: "Date",
  morningWeight: "Morning weight",
  sleepHours: "Sleep hours",
  trainingCompleted: "Training completed",
  cardioCompleted: "Cardio completed",
  mealsOnPlan: "Meals on plan",
  energy: "Energy",
  stress: "Stress",
  digestion: "Digestion",
  libido: "Libido",
};

function FieldShell({
  field,
  label,
  children,
  error,
  hint,
  requiredForScoring = false,
}: FieldShellProps) {
  return (
    <div className="space-y-3">
      <div className="space-y-1">
        <Label htmlFor={field}>
          {label}
          {requiredForScoring ? (
            <span className="ml-1 text-rose-600" aria-hidden="true">
              *
            </span>
          ) : null}
        </Label>
        {hint ? <p className="text-xs leading-5 text-slate-500">{hint}</p> : null}
      </div>
      {children}
      {error ? <p className="text-sm text-rose-600">{error}</p> : null}
    </div>
  );
}

type SegmentedFieldProps<T extends string> = {
  field: DailyCheckInField;
  value: T | "";
  options: readonly { value: T; label: string }[];
  onChange: (value: T) => void;
};

function SegmentedField<T extends string>({
  field,
  value,
  options,
  onChange,
}: SegmentedFieldProps<T>) {
  return (
    <>
      <input type="hidden" name={field} value={value} />
      <div className="grid grid-cols-2 gap-3">
        {options.map((option) => {
          const isActive = option.value === value;

          return (
            <button
              key={option.value}
              type="button"
              onClick={() => onChange(option.value)}
              className={cn(
                "rounded-[1.25rem] border px-4 py-3 text-sm font-medium transition-colors",
                isActive
                  ? "border-slate-950 bg-slate-950 text-white"
                  : "border-slate-200 bg-white text-slate-700 hover:border-slate-300 hover:bg-slate-50",
              )}
            >
              {option.label}
            </button>
          );
        })}
      </div>
    </>
  );
}

type ScaleFieldProps = {
  field: DailyCheckInField;
  value: string;
  onChange: (value: string) => void;
};

function ScaleField({ field, value, onChange }: ScaleFieldProps) {
  return (
    <>
      <input type="hidden" name={field} value={value} />
      <div className="grid grid-cols-5 gap-2">
        {biofeedbackScaleOptions.map((option) => {
          const isActive = option.value === value;

          return (
            <button
              key={option.value}
              type="button"
              onClick={() => onChange(option.value)}
              className={cn(
                "rounded-2xl border px-3 py-3 text-sm font-semibold transition-colors",
                isActive
                  ? "border-slate-950 bg-slate-950 text-white"
                  : "border-slate-200 bg-white text-slate-700 hover:border-slate-300 hover:bg-slate-50",
              )}
            >
              {option.label}
            </button>
          );
        })}
      </div>
    </>
  );
}

type SummaryLineProps = {
  label: string;
  value: string;
};

function SummaryLine({ label, value }: SummaryLineProps) {
  return (
    <div className="rounded-[1.5rem] border border-slate-200 bg-slate-50/80 p-4">
      <p className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">
        {label}
      </p>
      <p className="mt-2 text-sm leading-6 text-slate-700">{value}</p>
    </div>
  );
}

export function DailyCheckInForm({
  initialValues,
  initialStatus,
}: DailyCheckInFormProps) {
  const [state, formAction, isPending] = useActionState(
    submitDailyCheckInAction,
    dailyCheckInInitialState,
  );
  const [values, setValues] = useState(() =>
    createDailyCheckInValues(initialValues.date, initialValues),
  );

  const scoringAssessment = useMemo(
    () => getDailyCheckInFormScoringAssessment(values),
    [values],
  );
  const currentStatus = state.savedStatus ?? initialStatus;
  const fieldErrors = state.fieldErrors;

  function setField<K extends DailyCheckInField>(
    field: K,
    value: DailyCheckInFormValues[K],
  ) {
    setValues((current) => ({
      ...current,
      [field]: value,
    }));
  }

  const missingFieldLabels = scoringAssessment.missingFields.map(
    (field) => scoringFieldLabels[field],
  );

  return (
    <form action={formAction} className="space-y-6">
      <Card className="overflow-hidden border-slate-200/80 bg-white/90">
        <CardHeader className="gap-5 border-b border-slate-200/80 bg-slate-50/80">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
            <div className="space-y-3">
              <CardDescription>Execution report</CardDescription>
              <CardTitle className="text-2xl text-slate-950">
                Daily accountability input
              </CardTitle>
              <p className="max-w-3xl text-sm leading-7 text-slate-600">
                Record the inputs that drive daily compliance scoring and
                biofeedback review. Required scoring fields are marked clearly so
                incomplete entries can still be saved without pretending the day
                is score-ready.
              </p>
            </div>
            <div className="flex flex-wrap items-center gap-3">
              <DailyCheckInStatusBadge status={currentStatus} />
              <Badge variant="outline" className="bg-white">
                {scorableDailyCheckInFields.length} scoring inputs
              </Badge>
            </div>
          </div>

          {state.message ? (
            <div
              className={cn(
                "rounded-[1.5rem] px-5 py-4 text-sm",
                state.status === "error"
                  ? "border border-rose-200 bg-rose-50 text-rose-700"
                  : "border border-emerald-200 bg-emerald-50 text-emerald-700",
              )}
            >
              {state.message}
            </div>
          ) : null}
        </CardHeader>

        <CardContent className="grid gap-6 pt-8 xl:grid-cols-[1.1fr_0.9fr]">
          <div className="space-y-6">
            <div className="grid gap-6 sm:grid-cols-2">
              <FieldShell
                field="date"
                label="Date"
                requiredForScoring
                hint="Required for scoring and record identity."
                error={fieldErrors.date}
              >
                <Input
                  id="date"
                  name="date"
                  type="date"
                  value={values.date}
                  onChange={(event) => setField("date", event.target.value)}
                />
              </FieldShell>

              <FieldShell
                field="morningWeight"
                label="Morning weight"
                requiredForScoring
                hint="Kilograms."
                error={fieldErrors.morningWeight}
              >
                <Input
                  id="morningWeight"
                  name="morningWeight"
                  inputMode="decimal"
                  value={values.morningWeight}
                  onChange={(event) =>
                    setField("morningWeight", event.target.value)
                  }
                  placeholder="86.1"
                />
              </FieldShell>

              <FieldShell
                field="sleepHours"
                label="Sleep hours"
                requiredForScoring
                hint="Use hours slept from the previous night."
                error={fieldErrors.sleepHours}
              >
                <Input
                  id="sleepHours"
                  name="sleepHours"
                  inputMode="decimal"
                  value={values.sleepHours}
                  onChange={(event) => setField("sleepHours", event.target.value)}
                  placeholder="7.5"
                />
              </FieldShell>
            </div>

            <div className="grid gap-6 lg:grid-cols-2">
              <FieldShell
                field="trainingCompleted"
                label="Training completed"
                requiredForScoring
                hint="Required for scoring."
                error={fieldErrors.trainingCompleted}
              >
                <SegmentedField
                  field="trainingCompleted"
                  value={values.trainingCompleted}
                  options={yesNoOptions}
                  onChange={(value) => setField("trainingCompleted", value)}
                />
              </FieldShell>

              <FieldShell
                field="cardioCompleted"
                label="Cardio completed"
                requiredForScoring
                hint="Required for scoring."
                error={fieldErrors.cardioCompleted}
              >
                <SegmentedField
                  field="cardioCompleted"
                  value={values.cardioCompleted}
                  options={yesNoOptions}
                  onChange={(value) => setField("cardioCompleted", value)}
                />
              </FieldShell>
            </div>

            <FieldShell
              field="mealsOnPlan"
              label="Meals on plan"
              requiredForScoring
              hint="Stored as a percentage so yes/no can still be expressed as 100% or 0%."
              error={fieldErrors.mealsOnPlan}
            >
              <SegmentedField
                field="mealsOnPlan"
                value={values.mealsOnPlan}
                options={mealsOnPlanOptions}
                onChange={(value) => setField("mealsOnPlan", value)}
              />
            </FieldShell>

            <div className="grid gap-6 lg:grid-cols-2">
              <FieldShell
                field="energy"
                label="Energy"
                requiredForScoring
                hint="1 is very low, 10 is very high."
                error={fieldErrors.energy}
              >
                <ScaleField
                  field="energy"
                  value={values.energy}
                  onChange={(value) => setField("energy", value)}
                />
              </FieldShell>

              <FieldShell
                field="stress"
                label="Stress"
                requiredForScoring
                hint="1 is very low, 10 is very high."
                error={fieldErrors.stress}
              >
                <ScaleField
                  field="stress"
                  value={values.stress}
                  onChange={(value) => setField("stress", value)}
                />
              </FieldShell>

              <FieldShell
                field="digestion"
                label="Digestion"
                requiredForScoring
                hint="1 is poor, 10 is excellent."
                error={fieldErrors.digestion}
              >
                <ScaleField
                  field="digestion"
                  value={values.digestion}
                  onChange={(value) => setField("digestion", value)}
                />
              </FieldShell>

              <FieldShell
                field="libido"
                label="Libido"
                requiredForScoring
                hint="1 is very low, 10 is very high."
                error={fieldErrors.libido}
              >
                <ScaleField
                  field="libido"
                  value={values.libido}
                  onChange={(value) => setField("libido", value)}
                />
              </FieldShell>
            </div>

            <FieldShell
              field="notes"
              label="Notes"
              hint="Optional context for unusual circumstances, recovery issues, or adherence deviations."
              error={fieldErrors.notes}
            >
              <Textarea
                id="notes"
                name="notes"
                value={values.notes}
                onChange={(event) => setField("notes", event.target.value)}
                placeholder="Optional context for the day."
              />
            </FieldShell>
          </div>

          <div className="space-y-6">
            <Card className="border-slate-200 bg-slate-950 text-white shadow-none">
              <CardHeader>
                <CardDescription className="text-slate-400">
                  Scoring readiness
                </CardDescription>
                <CardTitle className="text-white">
                  {scoringAssessment.requiredFieldsComplete
                    ? "All required fields are present"
                    : `${missingFieldLabels.length} required field${missingFieldLabels.length === 1 ? "" : "s"} still missing`}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4 text-sm leading-7 text-slate-300">
                <p>
                  Scoring can proceed only after all required inputs are present
                  and the check-in is submitted as completed.
                </p>

                {missingFieldLabels.length > 0 ? (
                  <div className="rounded-[1.5rem] border border-white/10 bg-white/5 p-5">
                    <p className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-400">
                      Missing for scoring
                    </p>
                    <p className="mt-3">{missingFieldLabels.join(", ")}</p>
                  </div>
                ) : (
                  <div className="rounded-[1.5rem] border border-emerald-400/20 bg-emerald-400/10 p-5 text-emerald-100">
                    The draft currently contains every field needed for a
                    scorable completed submission.
                  </div>
                )}
              </CardContent>
            </Card>

            <Card className="shadow-none">
              <CardHeader>
                <CardDescription>Current draft snapshot</CardDescription>
                <CardTitle>Daily summary</CardTitle>
              </CardHeader>
              <CardContent className="grid gap-4 sm:grid-cols-2">
                <SummaryLine label="Training" value={formatBooleanAnswer(
                  values.trainingCompleted === "yes"
                    ? true
                    : values.trainingCompleted === "no"
                      ? false
                      : null,
                )} />
                <SummaryLine label="Cardio" value={formatBooleanAnswer(
                  values.cardioCompleted === "yes"
                    ? true
                    : values.cardioCompleted === "no"
                      ? false
                      : null,
                )} />
                <SummaryLine
                  label="Meals on plan"
                  value={values.mealsOnPlan ? `${values.mealsOnPlan}%` : "Not set"}
                />
                <SummaryLine
                  label="Weight / Sleep"
                  value={`${values.morningWeight || "—"} kg | ${values.sleepHours || "—"} h`}
                />
                <SummaryLine
                  label="Energy / Stress"
                  value={`${values.energy || "—"} / ${values.stress || "—"}`}
                />
                <SummaryLine
                  label="Digestion / Libido"
                  value={`${values.digestion || "—"} / ${values.libido || "—"}`}
                />
              </CardContent>
            </Card>
          </div>
        </CardContent>
      </Card>

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <p className="text-sm leading-6 text-slate-500">
          Use <span className="font-medium text-slate-700">Save as partial</span>{" "}
          when you want to preserve the draft without marking the day complete.
        </p>
        <div className="flex flex-col gap-3 sm:flex-row">
          <Button
            type="submit"
            name="intent"
            value="partial"
            variant="secondary"
            disabled={isPending}
          >
            <Save className="h-4 w-4" />
            Save as partial
          </Button>
          <Button type="submit" name="intent" value="complete" disabled={isPending}>
            <CheckCircle2 className="h-4 w-4" />
            Submit completed check-in
          </Button>
        </div>
      </div>
    </form>
  );
}
