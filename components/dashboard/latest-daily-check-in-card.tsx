import Link from "next/link";

import { ArrowRight } from "lucide-react";

import { DailyCheckInStatusBadge } from "@/components/daily-check-in/daily-check-in-status-badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  formatBooleanAnswer,
  formatDisplayDate,
  type DailyCheckInDisplayStatus,
  type ScorableDailyCheckInField,
} from "@/lib/daily-check-in";

type LatestDailyCheckInCardProps = {
  latestCheckIn:
    | {
        date: Date;
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
        status: DailyCheckInDisplayStatus;
        canScore: boolean;
        missingFields: ScorableDailyCheckInField[];
      }
    | null;
};

type MetricProps = {
  label: string;
  value: string;
};

const fieldLabels: Record<ScorableDailyCheckInField, string> = {
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

function Metric({ label, value }: MetricProps) {
  return (
    <div className="rounded-[1.5rem] border border-slate-200 bg-slate-50/80 p-4">
      <p className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">
        {label}
      </p>
      <p className="mt-2 text-sm leading-6 text-slate-700">{value}</p>
    </div>
  );
}

export function LatestDailyCheckInCard({
  latestCheckIn,
}: LatestDailyCheckInCardProps) {
  if (!latestCheckIn) {
    return (
      <Card>
        <CardHeader>
          <CardDescription>Latest daily check-in</CardDescription>
          <CardTitle>No daily entry recorded yet</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
          <p className="max-w-2xl text-sm leading-7 text-slate-600">
            The daily form is ready. Once the first check-in is saved, the
            dashboard will surface its status, missing scoring fields, and core
            biofeedback signals here.
          </p>
          <Button asChild>
            <Link href="/daily-check-in">
              Open daily check-in
              <ArrowRight className="h-4 w-4" />
            </Link>
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="overflow-hidden border-slate-200/80 bg-white/90">
      <CardHeader className="border-b border-slate-200/80 bg-slate-50/80">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
          <div className="space-y-3">
            <CardDescription>Latest daily check-in</CardDescription>
            <div className="flex flex-wrap items-center gap-3">
              <CardTitle className="text-slate-950">
                {formatDisplayDate(latestCheckIn.date)}
              </CardTitle>
              <DailyCheckInStatusBadge status={latestCheckIn.status} />
            </div>
            <p className="max-w-3xl text-sm leading-7 text-slate-600">
              {latestCheckIn.canScore
                ? "This submission is completed and has everything required for scoring."
                : "This entry is not yet score-ready. The missing required fields are shown below."}
            </p>
          </div>

          <Button asChild variant="secondary">
            <Link href="/daily-check-in">
              Update daily check-in
              <ArrowRight className="h-4 w-4" />
            </Link>
          </Button>
        </div>
      </CardHeader>

      <CardContent className="grid gap-6 pt-8 xl:grid-cols-[1fr_1fr]">
        <div className="grid gap-4 sm:grid-cols-2">
          <Metric
            label="Weight / Sleep"
            value={`${latestCheckIn.morningWeight ?? "—"} kg | ${latestCheckIn.sleepHours ?? "—"} h`}
          />
          <Metric
            label="Meals on plan"
            value={
              latestCheckIn.mealsOnPlan !== null
                ? `${latestCheckIn.mealsOnPlan}%`
                : "Not set"
            }
          />
          <Metric
            label="Training / Cardio"
            value={`${formatBooleanAnswer(latestCheckIn.trainingCompleted)} / ${formatBooleanAnswer(latestCheckIn.cardioCompleted)}`}
          />
          <Metric
            label="Energy / Stress"
            value={`${latestCheckIn.energy ?? "—"} / ${latestCheckIn.stress ?? "—"}`}
          />
          <Metric
            label="Digestion / Libido"
            value={`${latestCheckIn.digestion ?? "—"} / ${latestCheckIn.libido ?? "—"}`}
          />
          <Metric
            label="Notes"
            value={latestCheckIn.notes?.trim() || "No notes submitted."}
          />
        </div>

        <div className="space-y-4">
          <div className="rounded-[1.75rem] bg-slate-950 p-6 text-slate-200">
            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-400">
              Scoring readiness
            </p>
            <p className="mt-3 text-sm leading-7">
              {latestCheckIn.canScore
                ? "Scoring can proceed for this daily entry."
                : "Scoring is blocked until all required inputs are present and the check-in is completed."}
            </p>
          </div>

          <div className="rounded-[1.5rem] border border-slate-200 bg-slate-50/80 p-5">
            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">
              Missing required fields
            </p>
            <p className="mt-3 text-sm leading-7 text-slate-700">
              {latestCheckIn.missingFields.length > 0
                ? latestCheckIn.missingFields.map((field) => fieldLabels[field]).join(", ")
                : "None. All required scoring fields are present."}
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
