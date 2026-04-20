"use server";

import { revalidatePath } from "next/cache";

import { ensureCurrentUserShell } from "@/lib/current-user";
import { prisma } from "@/lib/db/prisma";
import {
  getDailyCheckInDisplayStatus,
  getDailyCheckInScoringAssessment,
  parseDailyCheckInFormData,
  type DailyCheckInActionState,
} from "@/lib/daily-check-in";

type SubmissionIntent = "partial" | "complete";

function parseIntent(formData: FormData): SubmissionIntent {
  const intent = formData.get("intent");

  return intent === "complete" ? "complete" : "partial";
}

export async function submitDailyCheckInAction(
  _previousState: DailyCheckInActionState,
  formData: FormData,
): Promise<DailyCheckInActionState> {
  const intent = parseIntent(formData);
  const parsed = parseDailyCheckInFormData(formData);

  if (!parsed.success) {
    return {
      status: "error",
      message: "Review the highlighted fields and try again.",
      fieldErrors: parsed.errors,
    };
  }

  const currentUser = await ensureCurrentUserShell();
  const date = new Date(`${parsed.data.date}T00:00:00.000Z`);
  const scoringAssessment = getDailyCheckInScoringAssessment(parsed.data);

  if (intent === "complete" && !scoringAssessment.requiredFieldsComplete) {
    const fieldErrors = Object.fromEntries(
      scoringAssessment.missingFields.map((field) => [
        field,
        "Required for a scorable completed submission.",
      ]),
    );

    return {
      status: "error",
      message:
        "Required scoring fields are missing. Complete them now or save the check-in as partial.",
      fieldErrors,
      canScore: false,
      missingFields: scoringAssessment.missingFields,
    };
  }

  const existingCheckIn = await prisma.dailyCheckIn.findUnique({
    where: {
      userId_date: {
        userId: currentUser.id,
        date,
      },
    },
  });

  const completionStatus =
    intent === "complete"
      ? "COMPLETED"
      : scoringAssessment.requiredFieldsComplete &&
          existingCheckIn?.completionStatus === "COMPLETED"
        ? "COMPLETED"
        : "PARTIAL";

  const submittedAt =
    completionStatus === "COMPLETED" ? existingCheckIn?.submittedAt ?? new Date() : null;

  const savedCheckIn = existingCheckIn
    ? await prisma.dailyCheckIn.update({
        where: { id: existingCheckIn.id },
        data: {
          goalId: currentUser.activeGoalId ?? null,
          morningWeight: parsed.data.morningWeight,
          sleepHours: parsed.data.sleepHours,
          trainingCompleted: parsed.data.trainingCompleted,
          cardioCompleted: parsed.data.cardioCompleted,
          mealsOnPlan: parsed.data.mealsOnPlan,
          energy: parsed.data.energy,
          stress: parsed.data.stress,
          digestion: parsed.data.digestion,
          libido: parsed.data.libido,
          notes: parsed.data.notes,
          completionStatus,
          missingFields: scoringAssessment.missingFields,
          submittedAt,
        },
      })
    : await prisma.dailyCheckIn.create({
        data: {
          userId: currentUser.id,
          goalId: currentUser.activeGoalId ?? null,
          date,
          morningWeight: parsed.data.morningWeight,
          sleepHours: parsed.data.sleepHours,
          trainingCompleted: parsed.data.trainingCompleted,
          cardioCompleted: parsed.data.cardioCompleted,
          mealsOnPlan: parsed.data.mealsOnPlan,
          energy: parsed.data.energy,
          stress: parsed.data.stress,
          digestion: parsed.data.digestion,
          libido: parsed.data.libido,
          notes: parsed.data.notes,
          completionStatus,
          missingFields: scoringAssessment.missingFields,
          submittedAt,
        },
      });

  // Future notification/reminder orchestration can branch here using
  // `savedCheckIn.completionStatus` and `savedCheckIn.missingFields`.
  revalidatePath("/daily-check-in");
  revalidatePath("/dashboard");

  return {
    status: "success",
    message:
      completionStatus === "COMPLETED"
        ? "Daily check-in submitted and marked completed."
        : "Daily check-in saved as partial.",
    fieldErrors: {},
    savedStatus: getDailyCheckInDisplayStatus(savedCheckIn),
    canScore: completionStatus === "COMPLETED" && scoringAssessment.requiredFieldsComplete,
    missingFields: scoringAssessment.missingFields,
  };
}
