import { PageHeader } from "@/components/layout/page-header";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

const settingsAreas = [
  {
    title: "Notification cadence",
    description:
      "Default reminder timing, escalation threshold, and delivery channels for missed submissions.",
  },
  {
    title: "Scoring configuration",
    description:
      "Future location for compliance and reporting score weights once the underlying logic is implemented.",
  },
  {
    title: "Athlete defaults",
    description:
      "Timezone, expected check-in windows, and the minimum required data needed for a valid review.",
  },
] as const;

export default function SettingsPage() {
  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Configuration"
        title="Settings"
        badge="Placeholder route"
        description="Settings is intentionally scoped around accountability rules, reminder behavior, and operational defaults rather than broad app preferences."
      />

      <section className="grid gap-4 md:grid-cols-3">
        {settingsAreas.map((area) => (
          <Card key={area.title}>
            <CardHeader>
              <CardDescription>Planned configuration area</CardDescription>
              <CardTitle>{area.title}</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm leading-7 text-slate-600">{area.description}</p>
            </CardContent>
          </Card>
        ))}
      </section>
    </div>
  );
}
