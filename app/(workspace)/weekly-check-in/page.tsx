import { PageHeader } from "@/components/layout/page-header";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

const weeklyInputs = [
  "Adherence score and overall self-assessment",
  "Biofeedback reflection and fatigue notes",
  "Progress photos or visual review status",
  "Wins, challenges, and next-week focus",
] as const;

const weeklyOutputs = [
  "Compliance score snapshot for the review window",
  "Reporting consistency score based on completed submissions",
  "Missing data summary that explains confidence limits",
  "Structured coach-style narrative for weekly review",
] as const;

export default function WeeklyCheckInPage() {
  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Check-In"
        title="Weekly Check-In"
        badge="Placeholder route"
        description="This page is reserved for the higher-context weekly review. It should become the bridge between structured reporting and the generated weekly coach summary."
      />

      <section className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardDescription>Expected form content</CardDescription>
            <CardTitle>Weekly review inputs</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {weeklyInputs.map((item) => (
              <div
                key={item}
                className="rounded-[1.5rem] border border-slate-200 bg-slate-50/80 p-5 text-sm leading-7 text-slate-600"
              >
                {item}
              </div>
            ))}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardDescription>Downstream system responsibilities</CardDescription>
            <CardTitle>Weekly review outputs</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {weeklyOutputs.map((item) => (
              <div
                key={item}
                className="rounded-[1.5rem] border border-slate-200 bg-white p-5 text-sm leading-7 text-slate-600"
              >
                {item}
              </div>
            ))}
          </CardContent>
        </Card>
      </section>
    </div>
  );
}
