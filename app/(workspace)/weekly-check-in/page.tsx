import { WeeklyCheckInForm } from "@/components/weekly-check-in/weekly-check-in-form";
import { PageHeader } from "@/components/layout/page-header";
import { ensureCurrentUserShell } from "@/lib/current-user";
import { prisma } from "@/lib/db/prisma";
import {
  createWeeklyCheckInValues,
  formatDisplayDate,
  getCurrentWeeklyReviewWeekStart,
  getWeeklyCheckInDisplayStatus,
  type SubjectiveLookValue,
} from "@/lib/weekly-check-in";

export const dynamic = "force-dynamic";

export default async function WeeklyCheckInPage() {
  const currentUser = await ensureCurrentUserShell();
  const targetWeekStartValue = getCurrentWeeklyReviewWeekStart(
    new Date(),
    currentUser.timezone,
  );
  const targetWeekStartDate = new Date(`${targetWeekStartValue}T00:00:00.000Z`);

  const weeklyCheckIn = await prisma.weeklyCheckIn.findUnique({
    where: {
      userId_weekStartDate: {
        userId: currentUser.id,
        weekStartDate: targetWeekStartDate,
      },
    },
  });

  const initialValues = createWeeklyCheckInValues(targetWeekStartValue, {
    weekStartDate: targetWeekStartValue,
    averageBodyweight: weeklyCheckIn?.averageBodyweight?.toString() ?? "",
    waistMeasurement: weeklyCheckIn?.waistMeasurement?.toString() ?? "",
    frontPhotoUrl: weeklyCheckIn?.frontPhotoUrl ?? "",
    sidePhotoUrl: weeklyCheckIn?.sidePhotoUrl ?? "",
    backPhotoUrl: weeklyCheckIn?.backPhotoUrl ?? "",
    trainingCompliancePercentage:
      weeklyCheckIn?.trainingCompliancePercentage?.toString() ?? "",
    nutritionCompliancePercentage:
      weeklyCheckIn?.nutritionCompliancePercentage?.toString() ?? "",
    subjectiveLook:
      (weeklyCheckIn?.subjectiveLook as SubjectiveLookValue | null) ?? "",
    recoveryState: weeklyCheckIn?.recoveryState ?? "",
    notes: weeklyCheckIn?.notes ?? "",
  });

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Check-In"
        title="Weekly Check-In"
        badge={weeklyCheckIn ? "Review loaded" : "No review yet"}
        description={`This weekly review is focused on the completed week that began ${formatDisplayDate(targetWeekStartValue)}. Save partial while evidence is still coming in, then finalize once the gate is fully satisfied.`}
      />

      <WeeklyCheckInForm
        initialValues={initialValues}
        initialStatus={getWeeklyCheckInDisplayStatus(weeklyCheckIn)}
      />
    </div>
  );
}
