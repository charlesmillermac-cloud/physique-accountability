import Link from "next/link";

import { PageHeader } from "@/components/layout/page-header";
import { MetricCard } from "@/components/dashboard/metric-card";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  dashboardCadence,
  dashboardMetrics,
  missingDataItems,
  summaryHighlights,
} from "@/lib/placeholders";

export default function DashboardPage() {
  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Workspace"
        title="Dashboard"
        badge="Placeholder data"
        description="This starter dashboard shows the core accountability surfaces: compliance, reporting quality, missing required data, reminder cadence, and a weekly summary preview."
        actions={
          <Button asChild>
            <Link href="/daily-check-in">Open check-in flow</Link>
          </Button>
        }
      />

      <section className="grid gap-4 xl:grid-cols-3">
        {dashboardMetrics.map((metric) => (
          <MetricCard
            key={metric.label}
            label={metric.label}
            value={metric.value}
            suffix={metric.suffix}
            detail={metric.detail}
          />
        ))}
      </section>

      <section className="grid gap-6 xl:grid-cols-[0.95fr_1.05fr]">
        <Card>
          <CardHeader>
            <CardDescription>Submission cadence</CardDescription>
            <CardTitle>Current accountability cycle</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {dashboardCadence.map((item) => (
              <div
                key={item.title}
                className="rounded-[1.5rem] border border-slate-200 bg-slate-50/80 p-5"
              >
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <h2 className="text-base font-semibold text-slate-950">
                      {item.title}
                    </h2>
                    <p className="mt-2 text-sm leading-6 text-slate-600">{item.note}</p>
                  </div>
                  <span className="rounded-full bg-slate-950 px-3 py-1 text-xs font-medium uppercase tracking-[0.16em] text-white">
                    {item.status}
                  </span>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardDescription>Summary preview</CardDescription>
            <CardTitle>Weekly coach-style output</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="rounded-[1.5rem] border border-slate-200 bg-slate-50/80 p-5">
              <h2 className="text-base font-semibold text-slate-950">
                Missing required data
              </h2>
              <ul className="mt-4 space-y-3 text-sm leading-6 text-slate-600">
                {missingDataItems.map((item) => (
                  <li key={item} className="rounded-2xl border border-slate-200 bg-white px-4 py-3">
                    {item}
                  </li>
                ))}
              </ul>
            </div>

            <div className="rounded-[1.5rem] bg-slate-950 p-6 text-slate-200">
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">
                Draft summary
              </p>
              <div className="mt-4 space-y-4 text-sm leading-7">
                {summaryHighlights.map((highlight) => (
                  <p key={highlight}>{highlight}</p>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>
      </section>
    </div>
  );
}
