/**
 * Cron Job 監控系統 - 類型定義
 */

import { CronJobStatus } from '@prisma/client';

/**
 * 開始執行的參數
 */
export interface StartExecutionParams {
  jobName: string;
  jobType: string;
  instanceId: string;
  lockId?: string;
}

/**
 * 完成執行的參數
 */
export interface CompleteExecutionParams {
  executionId: string;
  status: CronJobStatus;
  processedCount?: number;
  successCount?: number;
  errorCount?: number;
  details?: Record<string, any>;
  errorMessage?: string;
  errorStack?: string;
  nextRunAt?: Date;
}

/**
 * 記錄跳過執行的參數
 */
export interface RecordSkippedParams {
  jobName: string;
  jobType: string;
  instanceId: string;
  reason: string;
  nextRunAt?: Date;
}

/**
 * 查詢執行歷史的參數
 */
export interface GetExecutionHistoryParams {
  jobName?: string;
  jobType?: string;
  status?: CronJobStatus;
  startDate?: Date;
  endDate?: Date;
  page?: number;
  limit?: number;
}

/**
 * 執行歷史查詢結果
 */
export interface ExecutionHistoryResult {
  executions: ExecutionRecord[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

/**
 * 執行記錄（簡化版）
 */
export interface ExecutionRecord {
  id: string;
  jobName: string;
  jobType: string;
  startedAt: Date;
  completedAt: Date | null;
  duration: number | null;
  status: CronJobStatus;
  processedCount: number | null;
  successCount: number | null;
  errorCount: number | null;
  errorMessage: string | null;
  instanceId: string;
}

/**
 * 執行統計參數
 */
export interface GetExecutionStatisticsParams {
  jobName?: string;
  jobType?: string;
  startDate?: Date;
  endDate?: Date;
}

/**
 * 執行統計結果
 */
export interface ExecutionStatistics {
  totalExecutions: number;
  successfulExecutions: number;
  failedExecutions: number;
  timeoutExecutions: number;
  skippedExecutions: number;
  successRate: number;
  averageDuration: number;
  totalProcessed: number;
  totalErrors: number;
  byJobName: JobNameStatistics[];
  byJobType: JobTypeStatistics[];
  recentExecutions: ExecutionRecord[];
}

/**
 * 按 Job 名稱統計
 */
export interface JobNameStatistics {
  jobName: string;
  totalExecutions: number;
  successfulExecutions: number;
  failedExecutions: number;
  averageDuration: number;
  lastExecutedAt: Date | null;
  lastStatus: CronJobStatus | null;
}

/**
 * 按 Job 類型統計
 */
export interface JobTypeStatistics {
  jobType: string;
  totalExecutions: number;
  successfulExecutions: number;
  failedExecutions: number;
  averageDuration: number;
}

/**
 * 更新 Job 配置參數
 */
export interface UpdateJobConfigParams {
  jobName: string;
  lastExecutedAt?: Date;
  lastStatus?: CronJobStatus;
  lastDuration?: number;
  lastErrorMessage?: string;
  nextRunAt?: Date;
  consecutiveFailures?: number;
  totalExecutions?: number;
  totalFailures?: number;
}

/**
 * Job 配置結果
 */
export interface JobConfig {
  id: string;
  jobName: string;
  displayName: string;
  description: string | null;
  jobType: string;
  category: string;
  cronExpression: string;
  timeZone: string;
  isEnabled: boolean;
  alertOnFailure: boolean;
  alertOnTimeout: boolean;
  failureThreshold: number;
  timeoutThresholdMs: number | null;
  lastExecutedAt: Date | null;
  lastStatus: CronJobStatus | null;
  lastDuration: number | null;
  nextRunAt: Date | null;
  consecutiveFailures: number;
  totalExecutions: number;
  totalFailures: number;
}

/**
 * 告警參數
 */
export interface AlertParams {
  jobName: string;
  jobType: string;
  status: CronJobStatus;
  executionId: string;
  errorMessage?: string;
  duration?: number;
  consecutiveFailures?: number;
}

/**
 * 告警方法類型
 */
export enum AlertMethod {
  EMAIL = 'email',
  WEBHOOK = 'webhook',
  SYSTEM = 'system',
}

/**
 * 告警收件人配置
 */
export interface AlertRecipient {
  type: AlertMethod;
  value: string; // email 地址、webhook URL 或系統通知用戶 ID
}
