import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import type { ScoreSnapshot, ScoreStatusValue } from "@/lib/scoring/types";
import { cn } from "@/lib/utils";

type ScoreTrendCardProps = {
  title: string;
  description: string;
  series: ScoreSnapshot[];
};

function getStatusLabel(status: ScoreStatusValue) {
  switch (status) {
    case "COMPLETE":
      return "Complete";
    case "DEGRADED":
      return "Degraded";
    case "INCOMPLETE":
      return "Incomplete";
  }
}

function getStatusVariant(status: ScoreStatusValue) {
  switch (status) {
    case "COMPLETE":
      return "success" as const;
    case "DEGRADED":
      return "warning" as const;
    case "INCOMPLETE":
      return "outline" as const;
  }
}

function formatWindowLabel(startDate: string, endDate: string) {
  return `${startDate.slice(5)} to ${endDate.slice(5)}`;
}

function formatDisplayScore(value: number | null) {
  return value === null ? "Incomplete" : `${Math.round(value)}`;
}

export function ScoreTrendCard({
  title,
  description,
  series,
}: ScoreTrendCardProps) {
  const latest = series[0] ?? null;
  const previousComparable =
    series.slice(1).find((snapshot) => snapshot.score !== null) ?? null;
  const latestNumericScore = latest?.score ?? null;
  const previousNumericScore = previousComparable?.score ?? null;
  const delta =
    latestNumericScore !== null && previousNumericScore !== null
      ? Math.round((latestNumericScore - previousNumericScore) * 10) / 10
      : null;
  const bars = [...series].reverse();

  return (
    <Card className="overflow-hidden border-slate-200/80 bg-white/90">
      <CardHeader className="border-b border-slate-200/80 bg-slate-50/80">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
          <div className="space-y-3">
            <CardDescription>{title}</CardDescription>
            <CardTitle className="text-slate-950">
              {latest ? formatDisplayScore(latest.score) : "No score yet"}
              {latest?.score !== null ? (
                <span className="ml-2 text-base font-medium text-slate-500">
                  /100
                </span>
              ) : null}
            </CardTitle>
            <p className="max-w-3xl text-sm leading-7 text-slate-600">
              {description}
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            {latest ? (
              <>
                <Badge variant={getStatusVariant(latest.status)}>
                  {getStatusLabel(latest.status)}
                </Badge>
                <Badge variant="outline" className="bg-white">
                  Confidence {latest.confidence !== null ? `${Math.round(latest.confidence)}%` : "n/a"}
                </Badge>
              </>
            ) : (
              <Badge variant="outline" className="bg-white">
                No history yet
              </Badge>
            )}
          </div>
        </div>
      </CardHeader>

      <CardContent className="grid gap-6 pt-8 xl:grid-cols-[0.9fr_1.1fr]">
        <div className="space-y-5">
          <div className="rounded-[1.75rem] bg-slate-950 p-6 text-slate-200">
            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-400">
              Latest window
            </p>
            <p className="mt-3 text-sm leading-7">
              {latest
                ? formatWindowLabel(latest.windowStartDate, latest.windowEndDate)
                : "No scored window yet."}
            </p>

            <div className="mt-5 flex flex-wrap items-center gap-3">
              <div className="rounded-full border border-white/10 bg-white/5 px-4 py-2 text-sm">
                {delta === null
                  ? "No prior comparison"
                  : delta >= 0
                    ? `Up ${delta.toFixed(1)} vs prior`
                    : `Down ${Math.abs(delta).toFixed(1)} vs prior`}
              </div>
              {latest ? (
                <div className="rounded-full border border-white/10 bg-white/5 px-4 py-2 text-sm">
                  Formula {latest.formulaVersion}
                </div>
              ) : null}
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            {(latest?.components ?? []).slice(0, 4).map((component) => (
              <div
                key={component.key}
                className="rounded-[1.5rem] border border-slate-200 bg-slate-50/80 p-4"
              >
                <p className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">
                  {component.label}
                </p>
                <p className="mt-2 text-sm leading-6 text-slate-700">
                  {component.score === null
                    ? "Incomplete"
                    : `${Math.round(component.score)}/100`}
                </p>
              </div>
            ))}
          </div>
        </div>

        <div className="space-y-5">
          <div className="rounded-[1.5rem] border border-slate-200 bg-slate-50/80 p-5">
            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">
              Trend
            </p>
            <div className="mt-5 flex items-end gap-3">
              {bars.map((snapshot) => {
                const barHeight =
                  snapshot.score === null
                    ? 24
                    : Math.max(24, Math.round(snapshot.score));

                return (
                  <div key={snapshot.windowStartDate} className="flex-1">
                    <div className="flex h-40 items-end">
                      <div
                        className={cn(
                          "w-full rounded-t-2xl transition-colors",
                          snapshot.status === "COMPLETE"
                            ? "bg-slate-950"
                            : snapshot.status === "DEGRADED"
                              ? "bg-amber-400"
                              : "border border-dashed border-slate-300 bg-white",
                        )}
                        style={{ height: `${barHeight}px` }}
                      />
                    </div>
                    <p className="mt-3 text-center text-xs font-medium uppercase tracking-[0.14em] text-slate-500">
                      {snapshot.windowStartDate.slice(5)}
                    </p>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="rounded-[1.5rem] border border-slate-200 bg-white p-5">
            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">
              Confidence notes
            </p>
            <p className="mt-3 text-sm leading-7 text-slate-700">
              {latest?.missingData.length
                ? latest.missingData.join(" ")
                : latest?.notes[0] ?? "No active scoring warnings for the latest window."}
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
