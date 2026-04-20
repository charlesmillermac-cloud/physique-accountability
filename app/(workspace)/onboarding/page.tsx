import { OnboardingForm } from "@/components/onboarding/onboarding-form";
import { PageHeader } from "@/components/layout/page-header";
import { getCurrentUserSnapshot } from "@/lib/current-user";
import { createOnboardingValues } from "@/lib/onboarding";

export const dynamic = "force-dynamic";

export default async function OnboardingPage() {
  const currentUser = await getCurrentUserSnapshot();
  const initialValues = createOnboardingValues({
    name:
      currentUser?.firstName && currentUser?.lastName
        ? `${currentUser.firstName} ${currentUser.lastName}`.trim()
        : "",
    sex: currentUser?.sex ?? "",
    age: currentUser?.age?.toString() ?? "",
    heightCm: currentUser?.heightCm?.toString() ?? "",
    currentBodyweight: currentUser?.currentBodyweight?.toString() ?? "",
    estimatedBodyFatPercent:
      currentUser?.estimatedBodyFatPercent?.toString() ?? "",
    trainingAgeYears: currentUser?.trainingAgeYears?.toString() ?? "",
    goalType: currentUser?.activeGoal?.goalType ?? "",
    priorityMuscleGroups: currentUser?.activeGoal?.priorityMuscleGroups ?? [],
    scheduleConstraints: currentUser?.activeGoal?.scheduleConstraints ?? "",
    equipmentAccess: currentUser?.activeGoal?.equipmentAccess ?? [],
    calorieTarget: currentUser?.activeGoal?.calorieTarget?.toString() ?? "",
    proteinTargetGrams:
      currentUser?.activeGoal?.proteinTargetGrams?.toString() ?? "",
    carbsTargetGrams: currentUser?.activeGoal?.carbsTargetGrams?.toString() ?? "",
    fatsTargetGrams: currentUser?.activeGoal?.fatsTargetGrams?.toString() ?? "",
    stepTarget: currentUser?.activeGoal?.stepTarget?.toString() ?? "",
    cardioTargetMinutes:
      currentUser?.activeGoal?.cardioTargetMinutes?.toString() ?? "",
  });

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Setup"
        title="Onboarding"
        badge={
          currentUser?.onboardingCompletedAt ? "Update active setup" : "Initial setup"
        }
        description="Capture the athlete profile, define the current phase, and lock in the execution targets that the accountability engine should score against."
      />

      <OnboardingForm initialValues={initialValues} />
    </div>
  );
}
