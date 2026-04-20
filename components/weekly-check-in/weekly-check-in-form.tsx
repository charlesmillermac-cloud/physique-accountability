"use client";

import type { ReactNode } from "react";
import { useActionState, useMemo, useState } from "react";

import { CheckCircle2, ImagePlus, Save, X } from "lucide-react";

import { submitWeeklyCheckInAction } from "@/app/(workspace)/weekly-check-in/actions";
import { WeeklyCheckInStatusBadge } from "@/components/weekly-check-in/weekly-check-in-status-badge";
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
  addDaysToDateValue,
  createWeeklyCheckInValues,
  formatDisplayDate,
  getPhotoEvidenceSummary,
  getWeeklyCheckInFormCompletionAssessment,
  isPlaceholderPhotoValue,
  subjectiveLookOptions,
  weeklyCheckInInitialState,
  weeklyFieldLabels,
  weeklyPhotoPlaceholderValues,
  weeklyRequiredFields,
  type WeeklyCheckInDisplayStatus,
  type WeeklyCheckInField,
  type WeeklyCheckInFormValues,
} from "@/lib/weekly-check-in";
import { cn } from "@/lib/utils";

type WeeklyCheckInFormProps = {
  initialValues: WeeklyCheckInFormValues;
  initialStatus: WeeklyCheckInDisplayStatus;
};

type FieldShellProps = {
  field: WeeklyCheckInField;
  label: string;
  children: ReactNode;
  error?: string;
  hint?: string;
  requiredForCompletion?: boolean;
};

type SegmentedFieldProps<T extends string> = {
  field: WeeklyCheckInField;
  value: T | "";
  options: readonly { value: T; label: string }[];
  onChange: (value: T) => void;
  gridClassName?: string;
};

type SummaryLineProps = {
  label: string;
  value: string;
};

type PhotoEvidenceFieldProps = {
  field: keyof typeof weeklyPhotoPlaceholderValues;
  label: string;
  value: string;
  error?: string;
  onChange: (value: string) => void;
};

function FieldShell({
  field,
  label,
  children,
  error,
  hint,
  requiredForCompletion = false,
}: FieldShellProps) {
  return (
    <div className="space-y-3">
      <div className="space-y-1">
        <Label htmlFor={field}>
          {label}
          {requiredForCompletion ? (
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

function SegmentedField<T extends string>({
  field,
  value,
  options,
  onChange,
  gridClassName,
}: SegmentedFieldProps<T>) {
  return (
    <>
      <input type="hidden" name={field} value={value} />
      <div className={cn("grid grid-cols-2 gap-3", gridClassName)}>
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

function PhotoEvidenceField({
  field,
  label,
  value,
  error,
  onChange,
}: PhotoEvidenceFieldProps) {
  const usesPlaceholder = isPlaceholderPhotoValue(value);

  return (
    <div className="rounded-[1.75rem] border border-slate-200 bg-slate-50/70 p-5">
      <div className="space-y-3">
        <div className="flex items-start justify-between gap-3">
          <div>
            <Label htmlFor={field}>
              {label}
              <span className="ml-1 text-rose-600" aria-hidden="true">
                *
              </span>
            </Label>
            <p className="mt-1 text-xs leading-5 text-slate-500">
              Use an image URL now, or apply the structured placeholder until
              storage is wired in.
            </p>
          </div>
          <Badge variant={usesPlaceholder ? "outline" : value ? "success" : "default"}>
            {getPhotoEvidenceSummary(value || null)}
          </Badge>
        </div>

        <Input
          id={field}
          name={field}
          value={value}
          onChange={(event) => onChange(event.target.value)}
          placeholder="https://..."
        />

        <div className="flex flex-col gap-3 sm:flex-row">
          <Button
            type="button"
            variant="secondary"
            size="sm"
            onClick={() => onChange(weeklyPhotoPlaceholderValues[field])}
          >
            <ImagePlus className="h-4 w-4" />
            Use placeholder
          </Button>

          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={() => onChange("")}
          >
            <X className="h-4 w-4" />
            Clear
          </Button>
        </div>

        {error ? <p className="text-sm text-rose-600">{error}</p> : null}
      </div>
    </div>
  );
}

function getSubjectiveLookLabel(value: WeeklyCheckInFormValues["subjectiveLook"]) {
  return (
    subjectiveLookOptions.find((option) => option.value === value)?.label ??
    "Not set"
  );
}

export function WeeklyCheckInForm({
  initialValues,
  initialStatus,
}: WeeklyCheckInFormProps) {
  const [state, formAction, isPending] = useActionState(
    submitWeeklyCheckInAction,
    weeklyCheckInInitialState,
  );
  const [values, setValues] = useState(() =>
    createWeeklyCheckInValues(initialValues.weekStartDate, initialValues),
  );

  const completionAssessment = useMemo(
    () => getWeeklyCheckInFormCompletionAssessment(values),
    [values],
  );
  const fieldErrors = state.fieldErrors;
  const currentStatus = state.savedStatus ?? initialStatus;
  const missingFieldLabels = completionAssessment.missingFields.map(
    (field) => weeklyFieldLabels[field],
  );
  const reviewWeekEnd = values.weekStartDate
    ? addDaysToDateValue(values.weekStartDate, 6)
    : "";
  const reviewWindowLabel =
    values.weekStartDate && reviewWeekEnd
      ? `${formatDisplayDate(values.weekStartDate)} - ${formatDisplayDate(reviewWeekEnd)}`
      : "Review week not set";

  function setField<K extends WeeklyCheckInField>(
    field: K,
    value: WeeklyCheckInFormValues[K],
  ) {
    setValues((current) => ({
      ...current,
      [field]: value,
    }));
  }

  return (
    <form action={formAction} className="space-y-6">
      <Card className="overflow-hidden border-slate-200/80 bg-white/90">
        <CardHeader className="gap-5 border-b border-slate-200/80 bg-slate-50/80">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
            <div className="space-y-3">
              <CardDescription>Weekly accountability review</CardDescription>
              <CardTitle className="text-2xl text-slate-950">
                Structured weekly evidence
              </CardTitle>
              <p className="max-w-3xl text-sm leading-7 text-slate-600">
                This review should feel heavier than the daily input. The
                completion gate keeps the submission honest by blocking final
                approval until body-composition evidence, compliance data, and
                recovery context are all present.
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-3">
              <WeeklyCheckInStatusBadge status={currentStatus} />
              <Badge variant="outline" className="bg-white">
                {weeklyRequiredFields.length} required completion items
              </Badge>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-3 rounded-[1.5rem] border border-slate-200 bg-white px-5 py-4">
            <Badge variant="outline" className="bg-slate-50">
              Review window
            </Badge>
            <p className="text-sm font-medium text-slate-800">{reviewWindowLabel}</p>
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

        <CardContent className="grid gap-6 pt-8 xl:grid-cols-[1.15fr_0.85fr]">
          <div className="space-y-6">
            <div className="grid gap-6 sm:grid-cols-2">
              <FieldShell
                field="weekStartDate"
                label="Week start date"
                requiredForCompletion
                hint="Use the Monday that starts the review week."
                error={fieldErrors.weekStartDate}
              >
                <Input
                  id="weekStartDate"
                  name="weekStartDate"
                  type="date"
                  value={values.weekStartDate}
                  onChange={(event) => setField("weekStartDate", event.target.value)}
                />
              </FieldShell>

              <FieldShell
                field="averageBodyweight"
                label="7-day average bodyweight"
                requiredForCompletion
                hint="Kilograms across the review window."
                error={fieldErrors.averageBodyweight}
              >
                <Input
                  id="averageBodyweight"
                  name="averageBodyweight"
                  inputMode="decimal"
                  value={values.averageBodyweight}
                  onChange={(event) =>
                    setField("averageBodyweight", event.target.value)
                  }
                  placeholder="86.4"
                />
              </FieldShell>

              <FieldShell
                field="waistMeasurement"
                label="Waist measurement"
                requiredForCompletion
                hint="Use the same measurement condition each week."
                error={fieldErrors.waistMeasurement}
              >
                <Input
                  id="waistMeasurement"
                  name="waistMeasurement"
                  inputMode="decimal"
                  value={values.waistMeasurement}
                  onChange={(event) =>
                    setField("waistMeasurement", event.target.value)
                  }
                  placeholder="78.2"
                />
              </FieldShell>

              <FieldShell
                field="recoveryState"
                label="Recovery state"
                requiredForCompletion
                hint="Required. Keep it short and concrete."
                error={fieldErrors.recoveryState}
              >
                <Textarea
                  id="recoveryState"
                  name="recoveryState"
                  value={values.recoveryState}
                  onChange={(event) =>
                    setField("recoveryState", event.target.value)
                  }
                  placeholder="Recovered well overall, slight lower-body fatigue carrying into the weekend."
                />
              </FieldShell>
            </div>

            <div className="grid gap-6 sm:grid-cols-2">
              <FieldShell
                field="trainingCompliancePercentage"
                label="Training compliance"
                requiredForCompletion
                hint="Enter the completed percentage for the week."
                error={fieldErrors.trainingCompliancePercentage}
              >
                <Input
                  id="trainingCompliancePercentage"
                  name="trainingCompliancePercentage"
                  inputMode="decimal"
                  value={values.trainingCompliancePercentage}
                  onChange={(event) =>
                    setField(
                      "trainingCompliancePercentage",
                      event.target.value,
                    )
                  }
                  placeholder="92"
                />
              </FieldShell>

              <FieldShell
                field="nutritionCompliancePercentage"
                label="Nutrition compliance"
                requiredForCompletion
                hint="Enter the completed percentage for the week."
                error={fieldErrors.nutritionCompliancePercentage}
              >
                <Input
                  id="nutritionCompliancePercentage"
                  name="nutritionCompliancePercentage"
                  inputMode="decimal"
                  value={values.nutritionCompliancePercentage}
                  onChange={(event) =>
                    setField(
                      "nutritionCompliancePercentage",
                      event.target.value,
                    )
                  }
                  placeholder="88"
                />
              </FieldShell>
            </div>

            <FieldShell
              field="subjectiveLook"
              label="Subjective look"
              requiredForCompletion
              hint="Pick the best summary of the visual trend."
              error={fieldErrors.subjectiveLook}
            >
              <SegmentedField
                field="subjectiveLook"
                value={values.subjectiveLook}
                options={subjectiveLookOptions}
                onChange={(value) => setField("subjectiveLook", value)}
                gridClassName="grid-cols-2 md:grid-cols-5"
              />
            </FieldShell>

            <div className="space-y-4">
              <div className="space-y-1">
                <Label>
                  Photo evidence
                  <span className="ml-1 text-rose-600" aria-hidden="true">
                    *
                  </span>
                </Label>
                <p className="text-xs leading-5 text-slate-500">
                  Front, side, and back evidence are all required before the
                  weekly review can be finalized.
                </p>
              </div>

              <div className="grid gap-4 lg:grid-cols-3">
                <PhotoEvidenceField
                  field="frontPhotoUrl"
                  label="Front photo"
                  value={values.frontPhotoUrl}
                  error={fieldErrors.frontPhotoUrl}
                  onChange={(value) => setField("frontPhotoUrl", value)}
                />
                <PhotoEvidenceField
                  field="sidePhotoUrl"
                  label="Side photo"
                  value={values.sidePhotoUrl}
                  error={fieldErrors.sidePhotoUrl}
                  onChange={(value) => setField("sidePhotoUrl", value)}
                />
                <PhotoEvidenceField
                  field="backPhotoUrl"
                  label="Back photo"
                  value={values.backPhotoUrl}
                  error={fieldErrors.backPhotoUrl}
                  onChange={(value) => setField("backPhotoUrl", value)}
                />
              </div>
            </div>

            <FieldShell
              field="notes"
              label="Notes"
              hint="Optional coaching context, execution issues, or visual observations."
              error={fieldErrors.notes}
            >
              <Textarea
                id="notes"
                name="notes"
                value={values.notes}
                onChange={(event) => setField("notes", event.target.value)}
                placeholder="Optional context for interpretation."
              />
            </FieldShell>
          </div>

          <div className="space-y-6">
            <Card className="border-slate-200 bg-slate-950 text-white shadow-none">
              <CardHeader>
                <CardDescription className="text-slate-400">
                  Weekly review gate
                </CardDescription>
                <CardTitle className="text-white">
                  {completionAssessment.requiredEvidenceComplete
                    ? "Required weekly evidence is complete"
                    : `${missingFieldLabels.length} required item${missingFieldLabels.length === 1 ? "" : "s"} still missing`}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4 text-sm leading-7 text-slate-300">
                <p>
                  Finalization stays locked until every required evidence item is
                  present. Partial saves keep the work intact without marking the
                  review complete.
                </p>

                {missingFieldLabels.length > 0 ? (
                  <div className="rounded-[1.5rem] border border-white/10 bg-white/5 p-5">
                    <p className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-400">
                      Missing required items
                    </p>
                    <p className="mt-3">{missingFieldLabels.join(", ")}</p>
                  </div>
                ) : (
                  <div className="rounded-[1.5rem] border border-emerald-400/20 bg-emerald-400/10 p-5 text-emerald-100">
                    The draft currently has every evidence item required to
                    finalize the weekly review.
                  </div>
                )}
              </CardContent>
            </Card>

            <Card className="shadow-none">
              <CardHeader>
                <CardDescription>Review snapshot</CardDescription>
                <CardTitle>Current weekly summary</CardTitle>
              </CardHeader>
              <CardContent className="grid gap-4 sm:grid-cols-2">
                <SummaryLine label="Review window" value={reviewWindowLabel} />
                <SummaryLine
                  label="Subjective look"
                  value={getSubjectiveLookLabel(values.subjectiveLook)}
                />
                <SummaryLine
                  label="Average BW / Waist"
                  value={`${values.averageBodyweight || "—"} kg | ${values.waistMeasurement || "—"} cm`}
                />
                <SummaryLine
                  label="Training / Nutrition"
                  value={`${values.trainingCompliancePercentage || "—"}% | ${values.nutritionCompliancePercentage || "—"}%`}
                />
                <SummaryLine
                  label="Photo evidence"
                  value={[
                    getPhotoEvidenceSummary(values.frontPhotoUrl || null),
                    getPhotoEvidenceSummary(values.sidePhotoUrl || null),
                    getPhotoEvidenceSummary(values.backPhotoUrl || null),
                  ].join(" | ")}
                />
                <SummaryLine
                  label="Recovery state"
                  value={values.recoveryState || "Not set"}
                />
              </CardContent>
            </Card>
          </div>
        </CardContent>
      </Card>

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <p className="text-sm leading-6 text-slate-500">
          Use <span className="font-medium text-slate-700">Save as partial</span>{" "}
          while you are still collecting evidence or waiting on final review
          photos.
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
            Finalize weekly review
          </Button>
        </div>
      </div>
    </form>
  );
}
