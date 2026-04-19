import { PageHeader } from "@/components/layout/page-header";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { historySnapshots } from "@/lib/placeholders";

export default function ReviewHistoryPage() {
  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Archive"
        title="Review History"
        badge="Placeholder route"
        description="This route gives the app a home for historical accountability windows, summary records, and longitudinal consistency trends."
      />

      <section className="grid gap-4 xl:grid-cols-[1.1fr_0.9fr]">
        <Card>
          <CardHeader>
            <CardDescription>Historical weekly windows</CardDescription>
            <CardTitle>Recent accountability snapshots</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {historySnapshots.map((snapshot) => (
              <div
                key={snapshot.window}
                className="rounded-[1.5rem] border border-slate-200 bg-slate-50/80 p-5"
              >
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <h2 className="text-base font-semibold text-slate-950">
                    {snapshot.window}
                  </h2>
                  <div className="flex gap-2 text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">
                    <span>{snapshot.compliance} compliance</span>
                    <span>{snapshot.reporting} reporting</span>
                  </div>
                </div>
                <p className="mt-3 text-sm leading-7 text-slate-600">
                  {snapshot.summary}
                </p>
              </div>
            ))}
          </CardContent>
        </Card>

        <Card className="bg-slate-950 text-white">
          <CardHeader>
            <CardDescription className="text-slate-400">
              Intended future use
            </CardDescription>
            <CardTitle className="text-white">
              History should stay queryable
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 text-sm leading-7 text-slate-300">
            <p>
              Historical summaries should eventually be backed by Prisma queries
              and filterable by athlete, date range, and consistency state.
            </p>
            <p>
              Keeping this route separate from the dashboard prevents the
              day-to-day view from becoming overloaded with archive concerns.
            </p>
          </CardContent>
        </Card>
      </section>
    </div>
  );
}
