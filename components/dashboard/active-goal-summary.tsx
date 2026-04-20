import Link from "next/link";

import { ArrowRight, Target } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  equipmentAccessOptions,
  getOptionLabel,
  goalTypeOptions,
  muscleGroupOptions,
  type EquipmentAccessValue,
  type GoalTypeValue,
  type MuscleGroupValue,
} from "@/lib/onboarding";

type ActiveGoalSummaryProps = {
  athleteName: string;
  profile: {
    currentBodyweight: string | null;
    estimatedBodyFatPercent: string | null;
    trainingAgeYears: string | null;
  };
  activeGoal:
    | {
        title: string;
        goalType: GoalTypeValue;
        priorityMuscleGroups: MuscleGroupValue[];
        scheduleConstraints: string | null;
        equipmentAccess: EquipmentAccessValue[];
        calorieTarget: number | null;
        proteinTargetGrams: number | null;
        carbsTargetGrams: number | null;
        fatsTargetGrams: number | null;
        stepTarget: number | null;
        cardioTargetMinutes: number | null;
      }
    | null;
};

type SummaryMetricProps = {
  label: string;
  value: string;
};

function SummaryMetric({ label, value }: SummaryMetricProps) {
  return (
    <div className="rounded-[1.5rem] border border-slate-200 bg-slate-50/80 p-4">
      <p className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">
        {label}
      </p>
      <p className="mt-2 text-sm leading-6 text-slate-700">{value}</p>
    </div>
  );
}

export function ActiveGoalSummary({
  athleteName,
  profile,
  activeGoal,
}: ActiveGoalSummaryProps) {
  if (!activeGoal) {
    return (
      <Card>
        <CardHeader>
          <CardDescription>Active goal summary</CardDescription>
          <CardTitle>No active goal configured yet</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
          <p className="max-w-2xl text-sm leading-7 text-slate-600">
            Run onboarding to set the athlete profile, define the current phase,
            and establish the targets this accountability engine should enforce.
          </p>
          <Button asChild>
            <Link href="/onboarding">
              Start onboarding
              <ArrowRight className="h-4 w-4" />
            </Link>
          </Button>
        </CardContent>
      </Card>
    );
  }

  const macroSummary = [
    `${activeGoal.calorieTarget ?? "—"} kcal`,
    `P ${activeGoal.proteinTargetGrams ?? "—"}g`,
    `C ${activeGoal.carbsTargetGrams ?? "—"}g`,
    `F ${activeGoal.fatsTargetGrams ?? "—"}g`,
  ].join(" | ");

  const activitySummary = [
    `${activeGoal.stepTarget ?? "—"} steps/day`,
    `${activeGoal.cardioTargetMinutes ?? "—"} min cardio/week`,
  ].join(" | ");

  return (
    <Card className="overflow-hidden border-slate-200/80 bg-white/90">
      <CardHeader className="border-b border-slate-200/80 bg-slate-50/80">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
          <div className="space-y-3">
            <CardDescription>Active goal summary</CardDescription>
            <div className="flex flex-wrap items-center gap-3">
              <CardTitle className="text-slate-950">{athleteName}</CardTitle>
              <Badge variant="outline" className="bg-white">
                {getOptionLabel(activeGoal.goalType, goalTypeOptions)}
              </Badge>
            </div>
            <p className="max-w-3xl text-sm leading-7 text-slate-600">
              The dashboard now reads the athlete&apos;s live active goal instead of
              only placeholder copy, which gives the accountability workspace a
              real planning context from day one.
            </p>
          </div>

          <Button asChild variant="secondary">
            <Link href="/onboarding">
              Update onboarding
              <ArrowRight className="h-4 w-4" />
            </Link>
          </Button>
        </div>
      </CardHeader>

      <CardContent className="grid gap-6 pt-8 xl:grid-cols-[1.05fr_0.95fr]">
        <div className="space-y-6">
          <div className="rounded-[1.75rem] bg-slate-950 p-6 text-white">
            <div className="flex items-center gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-white/10">
                <Target className="h-5 w-5 text-white" />
              </div>
              <div>
                <p className="text-sm font-semibold">{activeGoal.title}</p>
                <p className="text-sm text-slate-300">
                  Current execution phase and accountability baseline.
                </p>
              </div>
            </div>

            <div className="mt-6 grid gap-4 md:grid-cols-2">
              <SummaryMetric
                label="Priority muscle groups"
                value={
                  activeGoal.priorityMuscleGroups.length > 0
                    ? activeGoal.priorityMuscleGroups
                        .map((value) => getOptionLabel(value, muscleGroupOptions))
                        .join(", ")
                    : "Not set"
                }
              />
              <SummaryMetric
                label="Equipment access"
                value={
                  activeGoal.equipmentAccess.length > 0
                    ? activeGoal.equipmentAccess
                        .map((value) =>
                          getOptionLabel(value, equipmentAccessOptions),
                        )
                        .join(", ")
                    : "Not set"
                }
              />
            </div>

            <div className="mt-4 rounded-[1.5rem] border border-white/10 bg-white/5 p-5">
              <p className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-400">
                Schedule constraints
              </p>
              <p className="mt-3 text-sm leading-7 text-slate-200">
                {activeGoal.scheduleConstraints ?? "No schedule constraints recorded."}
              </p>
            </div>
          </div>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <SummaryMetric label="Nutrition targets" value={macroSummary} />
          <SummaryMetric label="Activity targets" value={activitySummary} />
          <SummaryMetric
            label="Current bodyweight"
            value={
              profile.currentBodyweight
                ? `${profile.currentBodyweight} kg`
                : "Not set"
            }
          />
          <SummaryMetric
            label="Estimated body fat"
            value={
              profile.estimatedBodyFatPercent
                ? `${profile.estimatedBodyFatPercent}%`
                : "Not set"
            }
          />
          <SummaryMetric
            label="Training age"
            value={
              profile.trainingAgeYears
                ? `${profile.trainingAgeYears} years`
                : "Not set"
            }
          />
        </div>
      </CardContent>
    </Card>
  );
}
