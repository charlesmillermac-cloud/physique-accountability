import { PageHeader } from "@/components/layout/page-header";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

const onboardingBlocks = [
  {
    title: "Athlete profile setup",
    description:
      "Capture identity, timezone, and coaching context so submissions and reminder windows can be interpreted correctly.",
  },
  {
    title: "Required daily inputs",
    description:
      "Define the non-negotiable daily fields that determine whether a check-in counts as complete or incomplete.",
  },
  {
    title: "Weekly review standard",
    description:
      "Specify the weekly reflection fields needed to create a reliable coach-style summary without ambiguous missing data.",
  },
  {
    title: "Reminder escalation policy",
    description:
      "Choose how the system progresses from initial reminder to escalation when check-ins remain incomplete or missing.",
  },
] as const;

export default function OnboardingPage() {
  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Setup"
        title="Onboarding"
        badge="Foundational route"
        description="This page is positioned for the initial athlete and program setup flow. It is intentionally a shell for now, but the structure already reflects the accountability engine’s core concerns."
      />

      <section className="grid gap-4 md:grid-cols-2">
        {onboardingBlocks.map((block) => (
          <Card key={block.title}>
            <CardHeader>
              <CardDescription>Planned onboarding module</CardDescription>
              <CardTitle>{block.title}</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm leading-7 text-slate-600">{block.description}</p>
            </CardContent>
          </Card>
        ))}
      </section>
    </div>
  );
}
