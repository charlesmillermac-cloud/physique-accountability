import { DailyCheckInForm } from "@/components/daily-check-in/daily-check-in-form";
import { PageHeader } from "@/components/layout/page-header";
import { prisma } from "@/lib/db/prisma";
import {
  createDailyCheckInValues,
  formatDateInputValue,
  getDailyCheckInDisplayStatus,
} from "@/lib/daily-check-in";
import { ensureCurrentUserShell } from "@/lib/current-user";

export const dynamic = "force-dynamic";

export default async function DailyCheckInPage() {
  const currentUser = await ensureCurrentUserShell();
  const todayValue = formatDateInputValue(new Date(), currentUser.timezone);
  const todayDate = new Date(`${todayValue}T00:00:00.000Z`);

  const todayCheckIn = await prisma.dailyCheckIn.findUnique({
    where: {
      userId_date: {
        userId: currentUser.id,
        date: todayDate,
      },
    },
  });

  const initialValues = createDailyCheckInValues(todayValue, {
    date: todayValue,
    morningWeight: todayCheckIn?.morningWeight?.toString() ?? "",
    sleepHours: todayCheckIn?.sleepHours?.toString() ?? "",
    trainingCompleted:
      todayCheckIn?.trainingCompleted === true
        ? "yes"
        : todayCheckIn?.trainingCompleted === false
          ? "no"
          : "",
    cardioCompleted:
      todayCheckIn?.cardioCompleted === true
        ? "yes"
        : todayCheckIn?.cardioCompleted === false
          ? "no"
          : "",
    mealsOnPlan: todayCheckIn?.mealsOnPlan?.toString() ?? "",
    energy: todayCheckIn?.energy?.toString() ?? "",
    stress: todayCheckIn?.stress?.toString() ?? "",
    digestion: todayCheckIn?.digestion?.toString() ?? "",
    libido: todayCheckIn?.libido?.toString() ?? "",
    notes: todayCheckIn?.notes ?? "",
  });

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Check-In"
        title="Daily Check-In"
        badge={todayCheckIn ? "Today loaded" : "No entry yet"}
        description="Capture the daily execution inputs and biofeedback markers that determine whether the day is score-ready. Incomplete drafts can be saved as partial without being treated as complete reporting."
      />

      <DailyCheckInForm
        initialValues={initialValues}
        initialStatus={getDailyCheckInDisplayStatus(todayCheckIn)}
      />
    </div>
  );
}
