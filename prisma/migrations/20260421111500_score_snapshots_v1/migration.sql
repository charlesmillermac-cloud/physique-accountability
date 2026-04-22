CREATE TYPE "ScoreStatus" AS ENUM ('COMPLETE', 'DEGRADED', 'INCOMPLETE');

ALTER TABLE "ComplianceScore"
ALTER COLUMN "score" DROP NOT NULL,
ADD COLUMN "confidence" DECIMAL(5,2),
ADD COLUMN "status" "ScoreStatus" NOT NULL DEFAULT 'INCOMPLETE',
ADD COLUMN "formulaVersion" TEXT NOT NULL DEFAULT 'compliance.v1',
ADD COLUMN "componentBreakdown" JSONB;

ALTER TABLE "ReportingScore"
ALTER COLUMN "score" DROP NOT NULL,
ADD COLUMN "confidence" DECIMAL(5,2),
ADD COLUMN "status" "ScoreStatus" NOT NULL DEFAULT 'INCOMPLETE',
ADD COLUMN "formulaVersion" TEXT NOT NULL DEFAULT 'reporting.v1',
ADD COLUMN "componentBreakdown" JSONB;

ALTER TABLE "ComplianceScore"
ALTER COLUMN "formulaVersion" DROP DEFAULT;

ALTER TABLE "ReportingScore"
ALTER COLUMN "formulaVersion" DROP DEFAULT;

CREATE UNIQUE INDEX "ComplianceScore_userId_goalId_windowStartDate_windowEndDate_formulaVersion_key"
ON "ComplianceScore"("userId", "goalId", "windowStartDate", "windowEndDate", "formulaVersion");

CREATE UNIQUE INDEX "ReportingScore_userId_goalId_windowStartDate_windowEndDate_formulaVersion_key"
ON "ReportingScore"("userId", "goalId", "windowStartDate", "windowEndDate", "formulaVersion");

CREATE INDEX "ComplianceScore_status_calculatedAt_idx"
ON "ComplianceScore"("status", "calculatedAt");

CREATE INDEX "ReportingScore_status_calculatedAt_idx"
ON "ReportingScore"("status", "calculatedAt");
