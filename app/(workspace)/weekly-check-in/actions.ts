"use server";

import { revalidatePath } from "next/cache";

import { ensureCurrentUserShell } from "@/lib/current-user";
import { prisma } from "@/lib/db/prisma";
import {
  getWeeklyCheckInCompletionAssessment,
  getWeeklyCheckInDisplayStatus,
  parseWeeklyCheckInFormData,
  type WeeklyCheckInActionState,
} from "@/lib/weekly-check-in";

type SubmissionIntent = "partial" | "complete";

function parseIntent(formData: FormData): SubmissionIntent {
  const intent = formData.get("intent");

  return intent === "complete" ? "complete" : "partial";
}

export async function submitWeeklyCheckInAction(
  _previousState: WeeklyCheckInActionState,
  formData: FormData,
): Promise<WeeklyCheckInActionState> {
  const intent = parseIntent(formData);
  const parsed = parseWeeklyCheckInFormData(formData);

  if (!parsed.success) {
    return {
      status: "error",
      message: "Review the highlighted fields and try again.",
      fieldErrors: parsed.errors,
    };
  }

  const currentUser = await ensureCurrentUserShell();
  const weekStartDate = new Date(`${parsed.data.weekStartDate}T00:00:00.000Z`);
  const completionAssessment = getWeeklyCheckInCompletionAssessment(parsed.data);

  if (intent === "complete" && !completionAssessment.requiredEvidenceComplete) {
    const fieldErrors = Object.fromEntries(
      completionAssessment.missingFields.map((field) => [
        field,
        "Required to finalize the weekly review.",
      ]),
    );

    return {
      status: "error",
      message:
        "Required weekly evidence is still missing. Complete the remaining items or save this review as partial.",
      fieldErrors,
      canComplete: false,
      missingFields: completionAssessment.missingFields,
    };
  }

  const existingCheckIn = await prisma.weeklyCheckIn.findUnique({
    where: {
      userId_weekStartDate: {
        userId: currentUser.id,
        weekStartDate,
      },
    },
  });

  const completionStatus =
    intent === "complete"
      ? "COMPLETED"
      : completionAssessment.requiredEvidenceComplete &&
          existingCheckIn?.completionStatus === "COMPLETED"
        ? "COMPLETED"
        : "PARTIAL";

  const submittedAt =
    completionStatus === "COMPLETED"
      ? existingCheckIn?.submittedAt ?? new Date()
      : null;

  const savedCheckIn = existingCheckIn
    ? await prisma.weeklyCheckIn.update({
        where: { id: existingCheckIn.id },
        data: {
          goalId: currentUser.activeGoalId ?? null,
          averageBodyweight: parsed.data.averageBodyweight,
          waistMeasurement: parsed.data.waistMeasurement,
          frontPhotoUrl: parsed.data.frontPhotoUrl,
          sidePhotoUrl: parsed.data.sidePhotoUrl,
          backPhotoUrl: parsed.data.backPhotoUrl,
          trainingCompliancePercentage:
            parsed.data.trainingCompliancePercentage,
          nutritionCompliancePercentage:
            parsed.data.nutritionCompliancePercentage,
          subjectiveLook: parsed.data.subjectiveLook,
          recoveryState: parsed.data.recoveryState,
          notes: parsed.data.notes,
          missingFields: completionAssessment.missingFields,
          completionStatus,
          submittedAt,
        },
      })
    : await prisma.weeklyCheckIn.create({
        data: {
          userId: currentUser.id,
          goalId: currentUser.activeGoalId ?? null,
          weekStartDate,
          averageBodyweight: parsed.data.averageBodyweight,
          waistMeasurement: parsed.data.waistMeasurement,
          frontPhotoUrl: parsed.data.frontPhotoUrl,
          sidePhotoUrl: parsed.data.sidePhotoUrl,
          backPhotoUrl: parsed.data.backPhotoUrl,
          trainingCompliancePercentage:
            parsed.data.trainingCompliancePercentage,
          nutritionCompliancePercentage:
            parsed.data.nutritionCompliancePercentage,
          subjectiveLook: parsed.data.subjectiveLook,
          recoveryState: parsed.data.recoveryState,
          notes: parsed.data.notes,
          missingFields: completionAssessment.missingFields,
          completionStatus,
          submittedAt,
        },
      });

  // Future notification and media-processing hooks can branch here using
  // `savedCheckIn.completionStatus`, `savedCheckIn.missingFields`, and the
  // photo URL fields once real storage is connected.
  revalidatePath("/weekly-check-in");
  revalidatePath("/dashboard");

  return {
    status: "success",
    message:
      completionStatus === "COMPLETED"
        ? "Weekly review submitted and marked completed."
        : "Weekly review saved as partial.",
    fieldErrors: {},
    savedStatus: getWeeklyCheckInDisplayStatus(savedCheckIn),
    canComplete:
      completionStatus === "COMPLETED" &&
      completionAssessment.requiredEvidenceComplete,
    missingFields: completionAssessment.missingFields,
  };
}
