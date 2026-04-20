"use server";

import { GoalStatus } from "@/generated/prisma/enums";
import { ensureCurrentUserShell } from "@/lib/current-user";
import { prisma } from "@/lib/db/prisma";
import {
  buildGoalTitle,
  parseOnboardingFormData,
  type OnboardingActionState,
} from "@/lib/onboarding";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

export async function submitOnboardingAction(
  _previousState: OnboardingActionState,
  formData: FormData,
): Promise<OnboardingActionState> {
  const parsed = parseOnboardingFormData(formData);

  if (!parsed.success) {
    return {
      status: "error",
      message: "Review the highlighted fields and try again.",
      fieldErrors: parsed.errors,
    };
  }

  const currentUser = await ensureCurrentUserShell();
  const now = new Date();

  await prisma.$transaction(async (tx) => {
    if (currentUser.activeGoalId) {
      await tx.goal.update({
        where: { id: currentUser.activeGoalId },
        data: {
          status: GoalStatus.ARCHIVED,
          archivedAt: now,
        },
      });
    }

    const goal = await tx.goal.create({
      data: {
        userId: currentUser.id,
        title: buildGoalTitle(parsed.data.goalType),
        goalType: parsed.data.goalType,
        description: null,
        status: GoalStatus.ACTIVE,
        priorityMuscleGroups: parsed.data.priorityMuscleGroups,
        scheduleConstraints: parsed.data.scheduleConstraints,
        equipmentAccess: parsed.data.equipmentAccess,
        calorieTarget: parsed.data.calorieTarget,
        proteinTargetGrams: parsed.data.proteinTargetGrams,
        carbsTargetGrams: parsed.data.carbsTargetGrams,
        fatsTargetGrams: parsed.data.fatsTargetGrams,
        stepTarget: parsed.data.stepTarget,
        cardioTargetMinutes: parsed.data.cardioTargetMinutes,
        startDate: now,
      },
    });

    await tx.user.update({
      where: { id: currentUser.id },
      data: {
        firstName: parsed.data.firstName,
        lastName: parsed.data.lastName,
        sex: parsed.data.sex,
        age: parsed.data.age,
        heightCm: parsed.data.heightCm,
        currentBodyweight: parsed.data.currentBodyweight,
        estimatedBodyFatPercent: parsed.data.estimatedBodyFatPercent,
        trainingAgeYears: parsed.data.trainingAgeYears,
        onboardingCompletedAt: now,
        activeGoalId: goal.id,
      },
    });
  });

  revalidatePath("/onboarding");
  revalidatePath("/dashboard");
  redirect("/dashboard");
}
