/*
  Warnings:

  - You are about to drop the column `refresh_token` on the `users` table. All the data in the column will be lost.

*/
-- CreateEnum
CREATE TYPE "CronJobStatus" AS ENUM ('RUNNING', 'SUCCESS', 'FAILED', 'TIMEOUT', 'SKIPPED');

-- DropIndex
DROP INDEX "sessions_expires_at_idx";

-- DropIndex
DROP INDEX "sessions_last_used_at_idx";

-- AlterTable
ALTER TABLE "users" DROP COLUMN "refresh_token";

-- CreateTable
CREATE TABLE "cron_job_configs" (
    "id" TEXT NOT NULL,
    "jobName" VARCHAR(100) NOT NULL,
    "displayName" VARCHAR(200) NOT NULL,
    "description" TEXT,
    "jobType" VARCHAR(50) NOT NULL,
    "category" VARCHAR(50) NOT NULL,
    "cronExpression" VARCHAR(100) NOT NULL,
    "timeZone" VARCHAR(50) NOT NULL DEFAULT 'Asia/Taipei',
    "isEnabled" BOOLEAN NOT NULL DEFAULT true,
    "alertOnFailure" BOOLEAN NOT NULL DEFAULT true,
    "alertOnTimeout" BOOLEAN NOT NULL DEFAULT true,
    "failureThreshold" INTEGER NOT NULL DEFAULT 1,
    "timeoutThresholdMs" INTEGER,
    "alertRecipients" JSONB,
    "alertMethods" JSONB,
    "maxExecutionTimeMs" INTEGER,
    "retryOnFailure" BOOLEAN NOT NULL DEFAULT false,
    "maxRetries" INTEGER NOT NULL DEFAULT 0,
    "retryDelayMs" INTEGER NOT NULL DEFAULT 60000,
    "concurrencyControl" BOOLEAN NOT NULL DEFAULT true,
    "lastExecutedAt" TIMESTAMP(3),
    "lastStatus" "CronJobStatus",
    "lastDuration" INTEGER,
    "lastErrorMessage" TEXT,
    "nextRunAt" TIMESTAMP(3),
    "consecutiveFailures" INTEGER NOT NULL DEFAULT 0,
    "totalExecutions" INTEGER NOT NULL DEFAULT 0,
    "totalFailures" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "createdBy" VARCHAR(100),
    "updatedBy" VARCHAR(100),

    CONSTRAINT "cron_job_configs_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "cron_job_executions" (
    "id" TEXT NOT NULL,
    "jobName" VARCHAR(100) NOT NULL,
    "jobType" VARCHAR(50) NOT NULL,
    "startedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "completedAt" TIMESTAMP(3),
    "duration" INTEGER,
    "status" "CronJobStatus" NOT NULL,
    "processedCount" INTEGER,
    "successCount" INTEGER,
    "errorCount" INTEGER,
    "details" JSONB,
    "errorMessage" TEXT,
    "errorStack" TEXT,
    "instanceId" VARCHAR(100) NOT NULL,
    "lockId" VARCHAR(100),
    "nextRunAt" TIMESTAMP(3),

    CONSTRAINT "cron_job_executions_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "cron_job_configs_jobName_key" ON "cron_job_configs"("jobName");

-- CreateIndex
CREATE INDEX "cron_job_configs_isEnabled_idx" ON "cron_job_configs"("isEnabled");

-- CreateIndex
CREATE INDEX "cron_job_configs_category_idx" ON "cron_job_configs"("category");

-- CreateIndex
CREATE INDEX "cron_job_configs_nextRunAt_idx" ON "cron_job_configs"("nextRunAt");

-- CreateIndex
CREATE INDEX "cron_job_executions_jobName_startedAt_idx" ON "cron_job_executions"("jobName", "startedAt");

-- CreateIndex
CREATE INDEX "cron_job_executions_status_idx" ON "cron_job_executions"("status");

-- CreateIndex
CREATE INDEX "cron_job_executions_startedAt_idx" ON "cron_job_executions"("startedAt");

-- CreateIndex
CREATE INDEX "notifications_user_id_type_created_at_idx" ON "notifications"("user_id", "type", "created_at" DESC);

-- CreateIndex
CREATE INDEX "sessions_revoked_at_expires_at_idx" ON "sessions"("revoked_at", "expires_at");

-- CreateIndex
CREATE INDEX "sessions_created_at_idx" ON "sessions"("created_at" DESC);

-- CreateIndex
CREATE INDEX "sessions_revoked_at_idx" ON "sessions"("revoked_at" DESC);

-- CreateIndex
CREATE INDEX "sessions_last_used_at_idx" ON "sessions"("last_used_at" DESC);

-- AddForeignKey
ALTER TABLE "audit_logs" ADD CONSTRAINT "audit_logs_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;
