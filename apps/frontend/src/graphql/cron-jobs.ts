/**
 * Cron Jobs 監控 GraphQL Queries & Mutations
 */

import { gql } from '@apollo/client';

/**
 * Cron Job 執行記錄 Fragment
 */
export const CRON_JOB_EXECUTION_FRAGMENT = gql`
  fragment CronJobExecutionFields on CronJobExecutionType {
    id
    jobName
    jobType
    startedAt
    completedAt
    duration
    status
    processedCount
    successCount
    errorCount
    details
    errorMessage
    instanceId
  }
`;

/**
 * Cron Job 配置 Fragment
 */
export const CRON_JOB_CONFIG_FRAGMENT = gql`
  fragment CronJobConfigFields on CronJobConfigType {
    jobName
    displayName
    description
    jobType
    category
    cronExpression
    timeZone
    isEnabled
    alertOnFailure
    alertOnTimeout
    failureThreshold
    timeoutThresholdMs
    lastExecutedAt
    lastStatus
    lastDuration
    lastErrorMessage
    nextRunAt
    consecutiveFailures
    totalExecutions
    totalFailures
    createdAt
    updatedAt
  }
`;

/**
 * 查詢執行歷史
 */
export const GET_CRON_JOB_EXECUTIONS = gql`
  ${CRON_JOB_EXECUTION_FRAGMENT}
  query GetCronJobExecutions(
    $jobName: String
    $jobType: String
    $status: String
    $startDate: String
    $endDate: String
    $page: Int
    $limit: Int
  ) {
    cronJobExecutions(
      jobName: $jobName
      jobType: $jobType
      status: $status
      startDate: $startDate
      endDate: $endDate
      page: $page
      limit: $limit
    ) {
      executions {
        ...CronJobExecutionFields
      }
      total
      page
      limit
      totalPages
    }
  }
`;

/**
 * 查詢所有 Cron Job 配置
 */
export const GET_CRON_JOB_CONFIGS = gql`
  ${CRON_JOB_CONFIG_FRAGMENT}
  query GetCronJobConfigs {
    cronJobConfigs {
      ...CronJobConfigFields
    }
  }
`;

/**
 * 查詢統計資料
 */
export const GET_CRON_JOB_STATISTICS = gql`
  ${CRON_JOB_EXECUTION_FRAGMENT}
  query GetCronJobStatistics(
    $jobName: String
    $jobType: String
    $startDate: String
    $endDate: String
  ) {
    cronJobStatistics(
      jobName: $jobName
      jobType: $jobType
      startDate: $startDate
      endDate: $endDate
    ) {
      totalExecutions
      successfulExecutions
      failedExecutions
      timeoutExecutions
      skippedExecutions
      successRate
      averageDuration
      totalProcessed
      totalErrors
      byJobName {
        jobName
        totalExecutions
        successfulExecutions
        failedExecutions
        averageDuration
        lastExecutedAt
        lastStatus
      }
      byJobType {
        jobType
        totalExecutions
        successfulExecutions
        failedExecutions
        averageDuration
      }
      recentExecutions {
        ...CronJobExecutionFields
      }
    }
  }
`;

/**
 * 更新 Cron Job 配置
 */
export const UPDATE_CRON_JOB_CONFIG = gql`
  ${CRON_JOB_CONFIG_FRAGMENT}
  mutation UpdateCronJobConfig(
    $jobName: String!
    $displayName: String
    $description: String
    $isEnabled: Boolean
    $alertOnFailure: Boolean
    $alertOnTimeout: Boolean
    $failureThreshold: Int
    $timeoutThresholdMs: Int
  ) {
    updateCronJobConfig(
      jobName: $jobName
      displayName: $displayName
      description: $description
      isEnabled: $isEnabled
      alertOnFailure: $alertOnFailure
      alertOnTimeout: $alertOnTimeout
      failureThreshold: $failureThreshold
      timeoutThresholdMs: $timeoutThresholdMs
    ) {
      ...CronJobConfigFields
    }
  }
`;

/**
 * Mutation: 手動觸發 Cron Job
 */
export const TRIGGER_CRON_JOB = gql`
  mutation TriggerCronJob($input: TriggerCronJobInput!) {
    triggerCronJob(input: $input) {
      success
      message
      executionId
    }
  }
`;

/**
 * Subscription: Cron Job 執行記錄更新
 */
export const CRON_JOB_EXECUTION_CREATED_SUBSCRIPTION = gql`
  ${CRON_JOB_EXECUTION_FRAGMENT}
  subscription OnCronJobExecutionCreated {
    cronJobExecutionCreated {
      ...CronJobExecutionFields
    }
  }
`;

/**
 * Subscription: Cron Job 配置更新
 */
export const CRON_JOB_CONFIG_UPDATED_SUBSCRIPTION = gql`
  ${CRON_JOB_CONFIG_FRAGMENT}
  subscription OnCronJobConfigUpdated {
    cronJobConfigUpdated {
      ...CronJobConfigFields
    }
  }
`;
