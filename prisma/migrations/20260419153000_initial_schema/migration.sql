-- CreateSchema
CREATE SCHEMA IF NOT EXISTS "public";

-- CreateEnum
CREATE TYPE "UserStatus" AS ENUM ('ACTIVE', 'PAUSED', 'ARCHIVED');

-- CreateEnum
CREATE TYPE "GoalStatus" AS ENUM ('ACTIVE', 'PAUSED', 'COMPLETED', 'ARCHIVED');

-- CreateEnum
CREATE TYPE "Sex" AS ENUM ('MALE', 'FEMALE', 'OTHER');

-- CreateEnum
CREATE TYPE "GoalType" AS ENUM ('CUT', 'GAIN', 'RECOMP', 'CONTEST_PREP');

-- CreateEnum
CREATE TYPE "MuscleGroup" AS ENUM ('CHEST', 'BACK', 'DELTS', 'ARMS', 'QUADS', 'HAMSTRINGS', 'GLUTES', 'CALVES', 'ABS');

-- CreateEnum
CREATE TYPE "EquipmentAccess" AS ENUM ('FULL_GYM', 'BARBELL_RACK', 'DUMBBELLS', 'MACHINES', 'CABLES', 'RESISTANCE_BANDS', 'CARDIO_MACHINES', 'BODYWEIGHT_ONLY');

-- CreateEnum
CREATE TYPE "CheckInCompletionStatus" AS ENUM ('PENDING', 'PARTIAL', 'COMPLETED', 'MISSED');

-- CreateEnum
CREATE TYPE "ScheduledPromptType" AS ENUM ('DAILY_CHECK_IN', 'WEEKLY_CHECK_IN', 'GENERAL_ACCOUNTABILITY');

-- CreateEnum
CREATE TYPE "ScheduledPromptStatus" AS ENUM ('SCHEDULED', 'SENT', 'PARTIAL', 'COMPLETED', 'OVERDUE', 'ESCALATED', 'CLOSED');

-- CreateEnum
CREATE TYPE "PromptAttemptType" AS ENUM ('INITIAL_SEND', 'REMINDER', 'ESCALATION', 'MANUAL_FOLLOW_UP');

-- CreateEnum
CREATE TYPE "PromptAttemptStatus" AS ENUM ('QUEUED', 'SENT', 'FAILED', 'ACKNOWLEDGED', 'NO_RESPONSE');

-- CreateEnum
CREATE TYPE "MessageChannel" AS ENUM ('IN_APP', 'EMAIL', 'SMS', 'SYSTEM');

-- CreateEnum
CREATE TYPE "AccountabilityFlagType" AS ENUM ('REPEATED_MISSED_WEIGH_INS', 'MISSED_EVENING_CLOSEOUTS', 'LOW_REPORTING_CONSISTENCY', 'WEEKEND_ADHERENCE_ISSUES', 'INCOMPLETE_CHECK_IN_PATTERN', 'OTHER');

-- CreateEnum
CREATE TYPE "FlagSeverity" AS ENUM ('LOW', 'MEDIUM', 'HIGH', 'CRITICAL');

-- CreateEnum
CREATE TYPE "AccountabilityFlagStatus" AS ENUM ('OPEN', 'ACKNOWLEDGED', 'RESOLVED', 'DISMISSED');

-- CreateEnum
CREATE TYPE "InterventionCategory" AS ENUM ('REMINDER_ADJUSTMENT', 'REPORTING_RESET', 'COMPLIANCE_CORRECTION', 'COACH_REVIEW', 'PLAN_ADJUSTMENT', 'OTHER');

-- CreateEnum
CREATE TYPE "InterventionSource" AS ENUM ('SYSTEM', 'AI', 'COACH');

-- CreateEnum
CREATE TYPE "InterventionStatus" AS ENUM ('RECOMMENDED', 'ACCEPTED', 'ACTIVE', 'RESOLVED', 'DISMISSED');

-- CreateEnum
CREATE TYPE "MessageHistoryType" AS ENUM ('ACCOUNTABILITY_PROMPT', 'PROMPT_REMINDER', 'PROMPT_ESCALATION', 'AI_REVIEW_SUMMARY', 'INTERVENTION_RECOMMENDATION');

-- CreateEnum
CREATE TYPE "MessageHistoryStatus" AS ENUM ('GENERATED', 'SENT', 'FAILED', 'LOGGED');

-- CreateEnum
CREATE TYPE "MessageAuthor" AS ENUM ('SYSTEM', 'AI', 'COACH');

-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "firstName" TEXT NOT NULL,
    "lastName" TEXT NOT NULL,
    "timezone" TEXT NOT NULL DEFAULT 'America/Denver',
    "sex" "Sex",
    "age" INTEGER,
    "heightCm" DECIMAL(5,2),
    "currentBodyweight" DECIMAL(5,2),
    "estimatedBodyFatPercent" DECIMAL(5,2),
    "trainingAgeYears" DECIMAL(4,2),
    "status" "UserStatus" NOT NULL DEFAULT 'ACTIVE',
    "onboardingCompletedAt" TIMESTAMP(3),
    "activeGoalId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Goal" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "status" "GoalStatus" NOT NULL DEFAULT 'ACTIVE',
    "goalType" "GoalType" NOT NULL,
    "priorityMuscleGroups" "MuscleGroup"[] DEFAULT ARRAY[]::"MuscleGroup"[],
    "scheduleConstraints" TEXT,
    "equipmentAccess" "EquipmentAccess"[] DEFAULT ARRAY[]::"EquipmentAccess"[],
    "calorieTarget" INTEGER,
    "proteinTargetGrams" INTEGER,
    "carbsTargetGrams" INTEGER,
    "fatsTargetGrams" INTEGER,
    "stepTarget" INTEGER,
    "cardioTargetMinutes" INTEGER,
    "startDate" DATE NOT NULL,
    "targetEndDate" DATE,
    "completedAt" TIMESTAMP(3),
    "archivedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Goal_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "DailyCheckIn" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "goalId" TEXT,
    "date" DATE NOT NULL,
    "morningWeight" DECIMAL(5,2),
    "sleepHours" DECIMAL(4,2),
    "trainingCompleted" BOOLEAN,
    "cardioCompleted" BOOLEAN,
    "mealsOnPlan" SMALLINT,
    "energy" SMALLINT,
    "stress" SMALLINT,
    "digestion" SMALLINT,
    "libido" SMALLINT,
    "notes" TEXT,
    "missingFields" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "completionStatus" "CheckInCompletionStatus" NOT NULL DEFAULT 'PENDING',
    "submittedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "DailyCheckIn_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "WeeklyCheckIn" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "goalId" TEXT,
    "weekStartDate" DATE NOT NULL,
    "averageBodyweight" DECIMAL(5,2),
    "waistMeasurement" DECIMAL(5,2),
    "frontPhotoUrl" TEXT,
    "sidePhotoUrl" TEXT,
    "backPhotoUrl" TEXT,
    "trainingCompliancePercentage" DECIMAL(5,2),
    "nutritionCompliancePercentage" DECIMAL(5,2),
    "subjectiveLook" TEXT,
    "recoveryState" TEXT,
    "notes" TEXT,
    "completionStatus" "CheckInCompletionStatus" NOT NULL DEFAULT 'PENDING',
    "submittedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "WeeklyCheckIn_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ComplianceScore" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "goalId" TEXT,
    "windowStartDate" DATE NOT NULL,
    "windowEndDate" DATE NOT NULL,
    "score" DECIMAL(5,2) NOT NULL,
    "notes" TEXT,
    "calculatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ComplianceScore_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ReportingScore" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "goalId" TEXT,
    "windowStartDate" DATE NOT NULL,
    "windowEndDate" DATE NOT NULL,
    "score" DECIMAL(5,2) NOT NULL,
    "notes" TEXT,
    "calculatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ReportingScore_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ScheduledPrompt" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "goalId" TEXT,
    "dailyCheckInId" TEXT,
    "weeklyCheckInId" TEXT,
    "promptType" "ScheduledPromptType" NOT NULL,
    "status" "ScheduledPromptStatus" NOT NULL DEFAULT 'SCHEDULED',
    "channel" "MessageChannel" NOT NULL DEFAULT 'IN_APP',
    "scheduledFor" TIMESTAMP(3) NOT NULL,
    "dueAt" TIMESTAMP(3),
    "sentAt" TIMESTAMP(3),
    "lastAttemptAt" TIMESTAMP(3),
    "completedAt" TIMESTAMP(3),
    "escalatedAt" TIMESTAMP(3),
    "closedAt" TIMESTAMP(3),
    "currentEscalationLevel" INTEGER NOT NULL DEFAULT 0,
    "context" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ScheduledPrompt_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PromptAttempt" (
    "id" TEXT NOT NULL,
    "scheduledPromptId" TEXT NOT NULL,
    "attemptNumber" INTEGER NOT NULL,
    "attemptType" "PromptAttemptType" NOT NULL,
    "status" "PromptAttemptStatus" NOT NULL DEFAULT 'QUEUED',
    "channel" "MessageChannel" NOT NULL DEFAULT 'IN_APP',
    "escalationLevel" INTEGER NOT NULL DEFAULT 0,
    "attemptedAt" TIMESTAMP(3),
    "respondedAt" TIMESTAMP(3),
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "PromptAttempt_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AccountabilityFlag" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "goalId" TEXT,
    "flagType" "AccountabilityFlagType" NOT NULL,
    "severity" "FlagSeverity" NOT NULL DEFAULT 'MEDIUM',
    "status" "AccountabilityFlagStatus" NOT NULL DEFAULT 'OPEN',
    "title" TEXT NOT NULL,
    "description" TEXT,
    "firstObservedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "lastObservedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "detectedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "occurrenceCount" INTEGER NOT NULL DEFAULT 1,
    "evidence" JSONB,
    "resolvedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "AccountabilityFlag_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Intervention" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "goalId" TEXT,
    "accountabilityFlagId" TEXT,
    "category" "InterventionCategory" NOT NULL,
    "source" "InterventionSource" NOT NULL,
    "status" "InterventionStatus" NOT NULL DEFAULT 'RECOMMENDED',
    "title" TEXT NOT NULL,
    "recommendedAction" TEXT NOT NULL,
    "rationale" TEXT,
    "recommendedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "acknowledgedAt" TIMESTAMP(3),
    "resolvedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Intervention_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "MessageHistory" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "goalId" TEXT,
    "scheduledPromptId" TEXT,
    "promptAttemptId" TEXT,
    "weeklyCheckInId" TEXT,
    "interventionId" TEXT,
    "messageType" "MessageHistoryType" NOT NULL,
    "status" "MessageHistoryStatus" NOT NULL DEFAULT 'LOGGED',
    "channel" "MessageChannel" NOT NULL DEFAULT 'SYSTEM',
    "author" "MessageAuthor" NOT NULL,
    "subject" TEXT,
    "content" TEXT NOT NULL,
    "metadata" JSONB,
    "sentAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "MessageHistory_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE UNIQUE INDEX "User_activeGoalId_key" ON "User"("activeGoalId");

-- CreateIndex
CREATE INDEX "User_status_idx" ON "User"("status");

-- CreateIndex
CREATE INDEX "User_onboardingCompletedAt_idx" ON "User"("onboardingCompletedAt");

-- CreateIndex
CREATE UNIQUE INDEX "User_activeGoalId_id_key" ON "User"("activeGoalId", "id");

-- CreateIndex
CREATE INDEX "Goal_userId_status_idx" ON "Goal"("userId", "status");

-- CreateIndex
CREATE INDEX "Goal_userId_startDate_idx" ON "Goal"("userId", "startDate");

-- CreateIndex
CREATE INDEX "Goal_goalType_status_idx" ON "Goal"("goalType", "status");

-- CreateIndex
CREATE UNIQUE INDEX "Goal_id_userId_key" ON "Goal"("id", "userId");

-- CreateIndex
CREATE INDEX "DailyCheckIn_userId_date_idx" ON "DailyCheckIn"("userId", "date");

-- CreateIndex
CREATE INDEX "DailyCheckIn_goalId_date_idx" ON "DailyCheckIn"("goalId", "date");

-- CreateIndex
CREATE INDEX "DailyCheckIn_completionStatus_date_idx" ON "DailyCheckIn"("completionStatus", "date");

-- CreateIndex
CREATE UNIQUE INDEX "DailyCheckIn_userId_date_key" ON "DailyCheckIn"("userId", "date");

-- CreateIndex
CREATE INDEX "WeeklyCheckIn_userId_weekStartDate_idx" ON "WeeklyCheckIn"("userId", "weekStartDate");

-- CreateIndex
CREATE INDEX "WeeklyCheckIn_goalId_weekStartDate_idx" ON "WeeklyCheckIn"("goalId", "weekStartDate");

-- CreateIndex
CREATE INDEX "WeeklyCheckIn_completionStatus_weekStartDate_idx" ON "WeeklyCheckIn"("completionStatus", "weekStartDate");

-- CreateIndex
CREATE UNIQUE INDEX "WeeklyCheckIn_userId_weekStartDate_key" ON "WeeklyCheckIn"("userId", "weekStartDate");

-- CreateIndex
CREATE INDEX "ComplianceScore_userId_windowStartDate_idx" ON "ComplianceScore"("userId", "windowStartDate");

-- CreateIndex
CREATE INDEX "ComplianceScore_goalId_windowStartDate_idx" ON "ComplianceScore"("goalId", "windowStartDate");

-- CreateIndex
CREATE INDEX "ComplianceScore_calculatedAt_idx" ON "ComplianceScore"("calculatedAt");

-- CreateIndex
CREATE INDEX "ReportingScore_userId_windowStartDate_idx" ON "ReportingScore"("userId", "windowStartDate");

-- CreateIndex
CREATE INDEX "ReportingScore_goalId_windowStartDate_idx" ON "ReportingScore"("goalId", "windowStartDate");

-- CreateIndex
CREATE INDEX "ReportingScore_calculatedAt_idx" ON "ReportingScore"("calculatedAt");

-- CreateIndex
CREATE INDEX "ScheduledPrompt_userId_status_scheduledFor_idx" ON "ScheduledPrompt"("userId", "status", "scheduledFor");

-- CreateIndex
CREATE INDEX "ScheduledPrompt_userId_dueAt_idx" ON "ScheduledPrompt"("userId", "dueAt");

-- CreateIndex
CREATE INDEX "ScheduledPrompt_goalId_status_idx" ON "ScheduledPrompt"("goalId", "status");

-- CreateIndex
CREATE INDEX "ScheduledPrompt_dailyCheckInId_idx" ON "ScheduledPrompt"("dailyCheckInId");

-- CreateIndex
CREATE INDEX "ScheduledPrompt_weeklyCheckInId_idx" ON "ScheduledPrompt"("weeklyCheckInId");

-- CreateIndex
CREATE INDEX "PromptAttempt_scheduledPromptId_attemptType_idx" ON "PromptAttempt"("scheduledPromptId", "attemptType");

-- CreateIndex
CREATE INDEX "PromptAttempt_status_attemptedAt_idx" ON "PromptAttempt"("status", "attemptedAt");

-- CreateIndex
CREATE UNIQUE INDEX "PromptAttempt_scheduledPromptId_attemptNumber_key" ON "PromptAttempt"("scheduledPromptId", "attemptNumber");

-- CreateIndex
CREATE INDEX "AccountabilityFlag_userId_status_detectedAt_idx" ON "AccountabilityFlag"("userId", "status", "detectedAt");

-- CreateIndex
CREATE INDEX "AccountabilityFlag_userId_flagType_status_idx" ON "AccountabilityFlag"("userId", "flagType", "status");

-- CreateIndex
CREATE INDEX "AccountabilityFlag_goalId_status_idx" ON "AccountabilityFlag"("goalId", "status");

-- CreateIndex
CREATE INDEX "Intervention_userId_status_recommendedAt_idx" ON "Intervention"("userId", "status", "recommendedAt");

-- CreateIndex
CREATE INDEX "Intervention_goalId_status_idx" ON "Intervention"("goalId", "status");

-- CreateIndex
CREATE INDEX "Intervention_accountabilityFlagId_idx" ON "Intervention"("accountabilityFlagId");

-- CreateIndex
CREATE INDEX "MessageHistory_userId_createdAt_idx" ON "MessageHistory"("userId", "createdAt");

-- CreateIndex
CREATE INDEX "MessageHistory_messageType_createdAt_idx" ON "MessageHistory"("messageType", "createdAt");

-- CreateIndex
CREATE INDEX "MessageHistory_scheduledPromptId_createdAt_idx" ON "MessageHistory"("scheduledPromptId", "createdAt");

-- CreateIndex
CREATE INDEX "MessageHistory_weeklyCheckInId_createdAt_idx" ON "MessageHistory"("weeklyCheckInId", "createdAt");

-- CreateIndex
CREATE INDEX "MessageHistory_interventionId_createdAt_idx" ON "MessageHistory"("interventionId", "createdAt");

-- AddForeignKey
ALTER TABLE "User" ADD CONSTRAINT "User_activeGoalId_id_fkey" FOREIGN KEY ("activeGoalId", "id") REFERENCES "Goal"("id", "userId") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Goal" ADD CONSTRAINT "Goal_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DailyCheckIn" ADD CONSTRAINT "DailyCheckIn_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DailyCheckIn" ADD CONSTRAINT "DailyCheckIn_goalId_fkey" FOREIGN KEY ("goalId") REFERENCES "Goal"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "WeeklyCheckIn" ADD CONSTRAINT "WeeklyCheckIn_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "WeeklyCheckIn" ADD CONSTRAINT "WeeklyCheckIn_goalId_fkey" FOREIGN KEY ("goalId") REFERENCES "Goal"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ComplianceScore" ADD CONSTRAINT "ComplianceScore_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ComplianceScore" ADD CONSTRAINT "ComplianceScore_goalId_fkey" FOREIGN KEY ("goalId") REFERENCES "Goal"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ReportingScore" ADD CONSTRAINT "ReportingScore_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ReportingScore" ADD CONSTRAINT "ReportingScore_goalId_fkey" FOREIGN KEY ("goalId") REFERENCES "Goal"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ScheduledPrompt" ADD CONSTRAINT "ScheduledPrompt_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ScheduledPrompt" ADD CONSTRAINT "ScheduledPrompt_goalId_fkey" FOREIGN KEY ("goalId") REFERENCES "Goal"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ScheduledPrompt" ADD CONSTRAINT "ScheduledPrompt_dailyCheckInId_fkey" FOREIGN KEY ("dailyCheckInId") REFERENCES "DailyCheckIn"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ScheduledPrompt" ADD CONSTRAINT "ScheduledPrompt_weeklyCheckInId_fkey" FOREIGN KEY ("weeklyCheckInId") REFERENCES "WeeklyCheckIn"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PromptAttempt" ADD CONSTRAINT "PromptAttempt_scheduledPromptId_fkey" FOREIGN KEY ("scheduledPromptId") REFERENCES "ScheduledPrompt"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AccountabilityFlag" ADD CONSTRAINT "AccountabilityFlag_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AccountabilityFlag" ADD CONSTRAINT "AccountabilityFlag_goalId_fkey" FOREIGN KEY ("goalId") REFERENCES "Goal"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Intervention" ADD CONSTRAINT "Intervention_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Intervention" ADD CONSTRAINT "Intervention_goalId_fkey" FOREIGN KEY ("goalId") REFERENCES "Goal"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Intervention" ADD CONSTRAINT "Intervention_accountabilityFlagId_fkey" FOREIGN KEY ("accountabilityFlagId") REFERENCES "AccountabilityFlag"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MessageHistory" ADD CONSTRAINT "MessageHistory_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MessageHistory" ADD CONSTRAINT "MessageHistory_goalId_fkey" FOREIGN KEY ("goalId") REFERENCES "Goal"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MessageHistory" ADD CONSTRAINT "MessageHistory_scheduledPromptId_fkey" FOREIGN KEY ("scheduledPromptId") REFERENCES "ScheduledPrompt"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MessageHistory" ADD CONSTRAINT "MessageHistory_promptAttemptId_fkey" FOREIGN KEY ("promptAttemptId") REFERENCES "PromptAttempt"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MessageHistory" ADD CONSTRAINT "MessageHistory_weeklyCheckInId_fkey" FOREIGN KEY ("weeklyCheckInId") REFERENCES "WeeklyCheckIn"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MessageHistory" ADD CONSTRAINT "MessageHistory_interventionId_fkey" FOREIGN KEY ("interventionId") REFERENCES "Intervention"("id") ON DELETE SET NULL ON UPDATE CASCADE;
