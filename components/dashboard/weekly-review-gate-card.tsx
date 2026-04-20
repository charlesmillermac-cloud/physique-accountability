import Link from "next/link";

import { ArrowRight, LockKeyhole } from "lucide-react";

import { WeeklyCheckInStatusBadge } from "@/components/weekly-check-in/weekly-check-in-status-badge";
import { WeeklyReviewGateBadge } from "@/components/weekly-check-in/weekly-review-gate-badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  formatDisplayDate,
  getWeeklyReviewGateStatusLabel,
  weeklyFieldLabels,
  type RequiredWeeklyCheckInField,
  type WeeklyCheckInDisplayStatus,
  type WeeklyReviewGateStatus,
} from "@/lib/weekly-check-in";

type WeeklyReviewGateCardProps = {
  gate: {
    status: WeeklyReviewGateStatus;
    displayStatus: WeeklyCheckInDisplayStatus;
    weekStartDate: string;
    weekEndDate: string;
    dueDate: string;
    missingFields: RequiredWeeklyCheckInField[];
    canComplete: boolean;
  };
};

type SnapshotMetricProps = {
  label: string;
  value: string;
};

function SnapshotMetric({ label, value }: SnapshotMetricProps) {
  return (
    <div className="rounded-[1.5rem] border border-slate-200 bg-slate-50/80 p-4">
      <p className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">
        {label}
      </p>
      <p className="mt-2 text-sm leading-6 text-slate-700">{value}</p>
    </div>
  );
}

export function WeeklyReviewGateCard({ gate }: WeeklyReviewGateCardProps) {
  const reviewWindow = `${formatDisplayDate(gate.weekStartDate)} - ${formatDisplayDate(gate.weekEndDate)}`;
  const missingRequiredItems =
    gate.missingFields.length > 0
      ? gate.missingFields.map((field) => weeklyFieldLabels[field]).join(", ")
      : "None. Every required evidence item is present.";

  return (
    <Card className="overflow-hidden border-slate-200/80 bg-white/90">
      <CardHeader className="border-b border-slate-200/80 bg-slate-50/80">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
          <div className="space-y-3">
            <CardDescription>Current weekly review gate</CardDescription>
            <div className="flex flex-wrap items-center gap-3">
              <CardTitle className="text-slate-950">{reviewWindow}</CardTitle>
              <WeeklyReviewGateBadge status={gate.status} />
              <WeeklyCheckInStatusBadge status={gate.displayStatus} />
            </div>
            <p className="max-w-3xl text-sm leading-7 text-slate-600">
              {gate.status === "completed"
                ? "The required weekly evidence is in and the review has been finalized."
                : gate.status === "overdue"
                  ? "This weekly review has not been finalized and is now past the expected completion window."
                  : "This weekly review is still open. Required evidence is listed below before finalization can proceed."}
            </p>
          </div>

          <Button asChild variant="secondary">
            <Link href="/weekly-check-in">
              Open weekly review
              <ArrowRight className="h-4 w-4" />
            </Link>
          </Button>
        </div>
      </CardHeader>

      <CardContent className="grid gap-6 pt-8 xl:grid-cols-[0.95fr_1.05fr]">
        <div className="rounded-[1.75rem] bg-slate-950 p-6 text-slate-200">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-white/10">
              <LockKeyhole className="h-5 w-5 text-white" />
            </div>
            <div>
              <p className="text-sm font-semibold text-white">Weekly review gate</p>
              <p className="text-sm text-slate-300">
                Finalization depends on complete compliance, photo, and recovery evidence.
              </p>
            </div>
          </div>

          <div className="mt-6 rounded-[1.5rem] border border-white/10 bg-white/5 p-5">
            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-400">
              Missing required items
            </p>
            <p className="mt-3 text-sm leading-7">{missingRequiredItems}</p>
          </div>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <SnapshotMetric
            label="Review window"
            value={reviewWindow}
          />
          <SnapshotMetric
            label="Expected by"
            value={formatDisplayDate(gate.dueDate)}
          />
          <SnapshotMetric
            label="Gate state"
            value={getWeeklyReviewGateStatusLabel(gate.status)}
          />
          <SnapshotMetric
            label="Evidence ready"
            value={gate.canComplete ? "Yes" : "No"}
          />
        </div>
      </CardContent>
    </Card>
  );
}
