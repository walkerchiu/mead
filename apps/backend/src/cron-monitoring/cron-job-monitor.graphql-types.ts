/**
 * Cron Job 監控 GraphQL Types
 */

import {
  ObjectType,
  Field,
  Int,
  Float,
  InputType,
  registerEnumType,
} from '@nestjs/graphql';
import { CronJobStatus } from '@prisma/client';
import GraphQLJSON from 'graphql-type-json';
import { IsString, IsBoolean, IsOptional } from 'class-validator';
import { PageInfo } from '../common/types/pagination.types';

// 註冊 CronJobStatus Enum
registerEnumType(CronJobStatus, {
  name: 'CronJobStatus',
  description: 'Cron Job 執行狀態',
});

/**
 * Cron Job 執行記錄
 */
@ObjectType({ description: 'Cron Job 執行記錄' })
export class CronJobExecutionType {
  @Field(() => String, { description: '執行記錄 ID' })
  id: string;

  @Field(() => String, { description: 'Job 名稱' })
  jobName: string;

  @Field(() => String, { description: 'Job 類型' })
  jobType: string;

  @Field(() => Date, { description: '開始時間' })
  startedAt: Date;

  @Field(() => Date, { nullable: true, description: '完成時間' })
  completedAt?: Date;

  @Field(() => Int, { nullable: true, description: '執行時長（毫秒）' })
  duration?: number;

  @Field(() => CronJobStatus, { description: '執行狀態' })
  status: CronJobStatus;

  @Field(() => Int, { nullable: true, description: '處理數量' })
  processedCount?: number;

  @Field(() => Int, { nullable: true, description: '成功數量' })
  successCount?: number;

  @Field(() => Int, { nullable: true, description: '錯誤數量' })
  errorCount?: number;

  @Field(() => GraphQLJSON, { nullable: true, description: '詳細資訊' })
  details?: any;

  @Field(() => String, { nullable: true, description: '錯誤訊息' })
  errorMessage?: string;

  @Field(() => String, { nullable: true, description: '錯誤堆疊' })
  errorStack?: string;

  @Field(() => String, { description: '實例 ID' })
  instanceId: string;

  @Field(() => String, { nullable: true, description: '分散式鎖 ID' })
  lockId?: string;

  @Field(() => Date, { nullable: true, description: '下次執行時間' })
  nextRunAt?: Date;
}

/**
 * 執行歷史查詢結果（分頁）
 */
@ObjectType({ description: '執行歷史查詢結果' })
export class CronJobExecutionHistoryType {
  // CONVENTIONS §3.1：統一使用 `{ data, pageInfo: PageInfo }` 分頁格式
  @Field(() => [CronJobExecutionType], {
    description: '執行記錄列表',
  })
  data: CronJobExecutionType[];

  @Field(() => PageInfo, { description: '分頁資訊' })
  pageInfo: PageInfo;
}

/**
 * Job 配置
 */
@ObjectType({ description: 'Cron Job 配置' })
export class CronJobConfigType {
  @Field(() => String, { description: 'ID' })
  id: string;

  @Field(() => String, { description: 'Job 名稱（唯一）' })
  jobName: string;

  @Field(() => String, { description: '顯示名稱' })
  displayName: string;

  @Field(() => String, { nullable: true, description: '描述' })
  description?: string;

  @Field(() => String, { description: 'Job 類型' })
  jobType: string;

  @Field(() => String, { description: '分類' })
  category: string;

  @Field(() => String, { description: 'Cron 表達式' })
  cronExpression: string;

  @Field(() => String, { description: '時區' })
  timeZone: string;

  @Field(() => Boolean, { description: '是否啟用' })
  isEnabled: boolean;

  @Field(() => Boolean, { description: '失敗時告警' })
  alertOnFailure: boolean;

  @Field(() => Boolean, { description: '超時時告警' })
  alertOnTimeout: boolean;

  @Field(() => Int, { description: '連續失敗幾次後告警' })
  failureThreshold: number;

  @Field(() => Int, { nullable: true, description: '超時閾值（毫秒）' })
  timeoutThresholdMs?: number;

  @Field(() => GraphQLJSON, { nullable: true, description: '告警收件人列表' })
  alertRecipients?: any;

  @Field(() => GraphQLJSON, { nullable: true, description: '告警方式' })
  alertMethods?: any;

  @Field(() => Int, { nullable: true, description: '最大執行時間（毫秒）' })
  maxExecutionTimeMs?: number;

  @Field(() => Boolean, { description: '失敗時是否重試' })
  retryOnFailure: boolean;

  @Field(() => Int, { description: '最大重試次數' })
  maxRetries: number;

  @Field(() => Int, { description: '重試延遲（毫秒）' })
  retryDelayMs: number;

  @Field(() => Boolean, { description: '是否使用分散式鎖' })
  concurrencyControl: boolean;

  @Field(() => Date, { nullable: true, description: '最後執行時間' })
  lastExecutedAt?: Date;

  @Field(() => CronJobStatus, { nullable: true, description: '最後執行狀態' })
  lastStatus?: CronJobStatus;

  @Field(() => Int, { nullable: true, description: '最後執行時長（毫秒）' })
  lastDuration?: number;

  @Field(() => String, { nullable: true, description: '最後錯誤訊息' })
  lastErrorMessage?: string;

  @Field(() => Date, { nullable: true, description: '下次執行時間' })
  nextRunAt?: Date;

  @Field(() => Int, { description: '連續失敗次數' })
  consecutiveFailures: number;

  @Field(() => Int, { description: '總執行次數' })
  totalExecutions: number;

  @Field(() => Int, { description: '總失敗次數' })
  totalFailures: number;

  @Field(() => Date, { description: '創建時間' })
  createdAt: Date;

  @Field(() => Date, { description: '更新時間' })
  updatedAt: Date;

  @Field(() => String, { nullable: true, description: '創建者 ID' })
  createdBy?: string;

  @Field(() => String, { nullable: true, description: '更新者 ID' })
  updatedBy?: string;
}

/**
 * 按 Job 名稱統計
 */
@ObjectType({ description: '按 Job 名稱統計' })
export class JobNameStatisticsType {
  @Field(() => String, { description: 'Job 名稱' })
  jobName: string;

  @Field(() => Int, { description: '總執行次數' })
  totalExecutions: number;

  @Field(() => Int, { description: '成功執行次數' })
  successfulExecutions: number;

  @Field(() => Int, { description: '失敗執行次數' })
  failedExecutions: number;

  @Field(() => Float, { description: '平均執行時長（毫秒）' })
  averageDuration: number;

  @Field(() => Date, { nullable: true, description: '最後執行時間' })
  lastExecutedAt?: Date;

  @Field(() => CronJobStatus, { nullable: true, description: '最後執行狀態' })
  lastStatus?: CronJobStatus;
}

/**
 * 按 Job 類型統計
 */
@ObjectType({ description: '按 Job 類型統計' })
export class JobTypeStatisticsType {
  @Field(() => String, { description: 'Job 類型' })
  jobType: string;

  @Field(() => Int, { description: '總執行次數' })
  totalExecutions: number;

  @Field(() => Int, { description: '成功執行次數' })
  successfulExecutions: number;

  @Field(() => Int, { description: '失敗執行次數' })
  failedExecutions: number;

  @Field(() => Float, { description: '平均執行時長（毫秒）' })
  averageDuration: number;
}

/**
 * 執行統計
 */
@ObjectType({ description: 'Cron Job 執行統計' })
export class CronJobStatisticsType {
  @Field(() => Int, { description: '總執行次數' })
  totalExecutions: number;

  @Field(() => Int, { description: '成功執行次數' })
  successfulExecutions: number;

  @Field(() => Int, { description: '失敗執行次數' })
  failedExecutions: number;

  @Field(() => Int, { description: '超時執行次數' })
  timeoutExecutions: number;

  @Field(() => Int, { description: '跳過執行次數' })
  skippedExecutions: number;

  @Field(() => Float, { description: '成功率（%）' })
  successRate: number;

  @Field(() => Float, { description: '平均執行時長（毫秒）' })
  averageDuration: number;

  @Field(() => Int, { description: '總處理數量' })
  totalProcessed: number;

  @Field(() => Int, { description: '總錯誤數量' })
  totalErrors: number;

  @Field(() => [JobNameStatisticsType], { description: '按 Job 名稱統計' })
  byJobName: JobNameStatisticsType[];

  @Field(() => [JobTypeStatisticsType], { description: '按 Job 類型統計' })
  byJobType: JobTypeStatisticsType[];

  @Field(() => [CronJobExecutionType], { description: '最近執行記錄' })
  recentExecutions: CronJobExecutionType[];
}

// ============================================
// Input Types
// ============================================

/**
 * 執行歷史篩選器
 */
@InputType({ description: '執行歷史篩選器' })
export class CronJobExecutionFiltersInput {
  @Field(() => String, { nullable: true, description: 'Job 名稱' })
  jobName?: string;

  @Field(() => String, { nullable: true, description: 'Job 類型' })
  jobType?: string;

  @Field(() => CronJobStatus, { nullable: true, description: '執行狀態' })
  status?: CronJobStatus;

  @Field(() => String, {
    nullable: true,
    description: '開始日期（ISO 8601 格式）',
  })
  startDate?: string;

  @Field(() => String, {
    nullable: true,
    description: '結束日期（ISO 8601 格式）',
  })
  endDate?: string;
}

/**
 * 統計篩選器
 */
@InputType({ description: '統計篩選器' })
export class CronJobStatisticsFiltersInput {
  @Field(() => String, { nullable: true, description: 'Job 名稱' })
  jobName?: string;

  @Field(() => String, { nullable: true, description: 'Job 類型' })
  jobType?: string;

  @Field(() => String, {
    nullable: true,
    description: '開始日期（ISO 8601 格式）',
  })
  startDate?: string;

  @Field(() => String, {
    nullable: true,
    description: '結束日期（ISO 8601 格式）',
  })
  endDate?: string;
}

/**
 * 更新 Job 配置輸入
 */
@InputType({ description: '更新 Job 配置' })
export class UpdateCronJobConfigInput {
  @Field(() => String, { nullable: true, description: '顯示名稱' })
  displayName?: string;

  @Field(() => String, { nullable: true, description: '描述' })
  description?: string;

  @Field(() => Boolean, { nullable: true, description: '是否啟用' })
  isEnabled?: boolean;

  @Field(() => Boolean, { nullable: true, description: '失敗時告警' })
  alertOnFailure?: boolean;

  @Field(() => Boolean, { nullable: true, description: '超時時告警' })
  alertOnTimeout?: boolean;

  @Field(() => Int, { nullable: true, description: '連續失敗幾次後告警' })
  failureThreshold?: number;

  @Field(() => Int, { nullable: true, description: '超時閾值（毫秒）' })
  timeoutThresholdMs?: number;

  @Field(() => GraphQLJSON, { nullable: true, description: '告警收件人列表' })
  alertRecipients?: any;

  @Field(() => GraphQLJSON, { nullable: true, description: '告警方式' })
  alertMethods?: any;
}

/**
 * 手動觸發 Job Input
 */
@InputType({ description: '手動觸發 Cron Job 的輸入' })
export class TriggerCronJobInput {
  @Field(() => String, { description: 'Job 名稱' })
  @IsString()
  jobName: string;

  @Field(() => Boolean, {
    nullable: true,
    description: '是否強制執行（跳過鎖檢查和 isEnabled 檢查）',
    defaultValue: false,
  })
  @IsOptional()
  @IsBoolean()
  force?: boolean;
}

/**
 * 手動觸發 Job Result
 */
@ObjectType({ description: '手動觸發 Cron Job 的結果' })
export class TriggerCronJobResult {
  @Field(() => Boolean, { description: '是否成功觸發' })
  success: boolean;

  @Field(() => String, { nullable: true, description: '訊息' })
  message?: string;

  @Field(() => String, { nullable: true, description: '執行記錄 ID' })
  executionId?: string;
}
