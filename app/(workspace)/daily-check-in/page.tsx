import { PageHeader } from "@/components/layout/page-header";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

const requiredDailyFields = [
  "Training completion",
  "Nutrition compliance",
  "Sleep hours",
  "Morning bodyweight",
  "Energy score",
] as const;

const dailyValidationRules = [
  "Each daily record should resolve to submitted, incomplete, or missed.",
  "Missing required fields should be stored explicitly so reminder logic can reference them later.",
  "Scoring should remain separate from form rendering so compliance logic can evolve safely.",
] as const;

export default function DailyCheckInPage() {
  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Check-In"
        title="Daily Check-In"
        badge="Placeholder route"
        description="The daily submission flow will live here. For now the page documents the expected payload shape and validation responsibilities without implementing full form behavior."
      />

      <section className="grid gap-6 xl:grid-cols-[1.05fr_0.95fr]">
        <Card>
          <CardHeader>
            <CardDescription>Expected submission shape</CardDescription>
            <CardTitle>Required daily inputs</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {requiredDailyFields.map((field) => (
              <div
                key={field}
                className="rounded-[1.5rem] border border-slate-200 bg-slate-50/80 px-4 py-4 text-sm font-medium text-slate-700"
              >
                {field}
              </div>
            ))}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardDescription>Implementation guardrails</CardDescription>
            <CardTitle>Validation and scoring separation</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {dailyValidationRules.map((rule) => (
              <div
                key={rule}
                className="rounded-[1.5rem] border border-slate-200 p-5 text-sm leading-7 text-slate-600"
              >
                {rule}
              </div>
            ))}
          </CardContent>
        </Card>
      </section>
    </div>
  );
}
