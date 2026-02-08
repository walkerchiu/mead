/**
 * Cron Jobs Hook
 * 管理 Cron Jobs 列表、執行歷史和配置更新
 */

import { useQuery, useMutation } from '@apollo/client/react';
import {
  GET_CRON_JOB_CONFIGS,
  GET_CRON_JOB_EXECUTIONS,
  UPDATE_CRON_JOB_CONFIG,
  TRIGGER_CRON_JOB,
} from '@/graphql/cron-jobs';
import { useState, useEffect, useRef } from 'react';
import { TOKEN_UPDATED_EVENT } from '@/lib/auth';

/**
 * Cron Job 狀態 Enum
 */
export type CronJobStatus =
  | 'RUNNING'
  | 'SUCCESS'
  | 'FAILED'
  | 'TIMEOUT'
  | 'SKIPPED';

/**
 * 執行記錄類型
 */
export interface CronJobExecution {
  id: string;
  jobName: string;
  jobType: string;
  startedAt: string;
  completedAt?: string;
  duration?: number;
  status: CronJobStatus;
  processedCount?: number;
  successCount?: number;
  errorCount?: number;
  details?: any;
  errorMessage?: string;
  errorStack?: string;
  instanceId: string;
  lockId?: string;
  nextRunAt?: string;
}

/**
 * Job 配置類型
 */
export interface CronJobConfig {
  jobName: string;
  displayName: string;
  description?: string;
  jobType: string;
  category: string;
  cronExpression: string;
  timeZone: string;
  isEnabled: boolean;
  alertOnFailure: boolean;
  alertOnTimeout: boolean;
  failureThreshold: number;
  timeoutThresholdMs?: number;
  lastExecutedAt?: string;
  lastStatus?: CronJobStatus;
  lastDuration?: number;
  lastErrorMessage?: string;
  nextRunAt?: string;
  consecutiveFailures: number;
  totalExecutions: number;
  totalFailures: number;
  createdAt: string;
  updatedAt: string;
}

/**
 * 執行歷史篩選器
 */
export interface ExecutionFilters {
  jobName?: string;
  jobType?: string;
  status?: CronJobStatus;
  startDate?: Date;
  endDate?: Date;
}

/**
 * 執行歷史查詢結果
 */
export interface ExecutionHistoryResult {
  executions: CronJobExecution[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

/**
 * useCronJobs Hook Options
 */
export interface UseCronJobsOptions {
  authReady?: boolean;
}

/**
 * useCronJobs Hook
 */
export function useCronJobs(options: UseCronJobsOptions = {}) {
  const { authReady = true } = options;

  // 查詢所有 Job 配置
  const {
    data: configsData,
    loading: configsLoading,
    error: configsError,
    refetch: refetchConfigs,
  } = useQuery(GET_CRON_JOB_CONFIGS, {
    fetchPolicy: 'network-only',
    skip: !authReady, // ✅ 等待認證就緒後再執行查詢
    notifyOnNetworkStatusChange: true,
  });

  const configs: CronJobConfig[] = (configsData as any)?.cronJobConfigs || [];

  // 更新 Job 配置 Mutation
  const [updateConfigMutation, { loading: updating }] = useMutation(
    UPDATE_CRON_JOB_CONFIG,
    {
      refetchQueries: [{ query: GET_CRON_JOB_CONFIGS }],
    },
  );

  // 觸發 Job 執行 Mutation
  const [triggerJobMutation, { loading: triggering }] = useMutation(
    TRIGGER_CRON_JOB,
    {
      refetchQueries: [{ query: GET_CRON_JOB_CONFIGS }],
    },
  );

  /**
   * 更新 Job 配置
   */
  const updateConfig = async (
    jobName: string,
    input: {
      displayName?: string;
      description?: string;
      isEnabled?: boolean;
      alertOnFailure?: boolean;
      alertOnTimeout?: boolean;
      failureThreshold?: number;
      timeoutThresholdMs?: number;
    },
  ) => {
    try {
      const result = await updateConfigMutation({
        variables: {
          jobName,
          ...input, // 解構 input 對象為獨立參數
        },
      });
      return (result.data as any)?.updateCronJobConfig;
    } catch (error) {
      console.error('Failed to update cron job config:', error);
      throw error;
    }
  };

  /**
   * 快速切換 Job 啟用/停用
   */
  const toggleJobEnabled = async (jobName: string, isEnabled: boolean) => {
    return updateConfig(jobName, { isEnabled });
  };

  /**
   * 手動觸發 Job 執行
   */
  const triggerJob = async (jobName: string, force: boolean = false) => {
    try {
      console.log('[useCronJobs] Triggering job:', { jobName, force });

      const result = await triggerJobMutation({
        variables: {
          input: { jobName, force },
        },
      });

      console.log('[useCronJobs] Mutation result:', result);

      const triggerResult = (result.data as any)?.triggerCronJob;

      if (!triggerResult) {
        throw new Error('無法獲取執行結果');
      }

      if (!triggerResult.success) {
        throw new Error(triggerResult.message || '觸發 Job 失敗');
      }

      return triggerResult;
    } catch (error) {
      console.error('[useCronJobs] Failed to trigger cron job:', error);

      // 如果是 GraphQL 錯誤，提取錯誤信息
      if ((error as any)?.graphQLErrors?.length > 0) {
        const gqlError = (error as any).graphQLErrors[0];
        throw new Error(gqlError.message || '觸發 Job 失敗');
      }

      throw error;
    }
  };

  return {
    configs,
    loading: configsLoading,
    error: configsError,
    updating,
    triggering,
    refetch: refetchConfigs,
    updateConfig,
    toggleJobEnabled,
    triggerJob,
  };
}

/**
 * useCronJobExecutions Hook Options
 */
export interface UseCronJobExecutionsOptions {
  filters?: ExecutionFilters;
  page?: number;
  limit?: number;
  authReady?: boolean;
}

/**
 * useCronJobExecutions Hook
 * 查詢執行歷史
 */
export interface UseCronJobExecutionsOptions {
  filters?: ExecutionFilters;
  authReady?: boolean;
}

export function useCronJobExecutions({
  filters = {},
  authReady = true,
}: UseCronJobExecutionsOptions) {
  const [page, setPage] = useState(1);
  const [pageSize] = useState(20);
  const hasFetchedRef = useRef(false);

  const { data, loading, error, refetch, fetchMore } = useQuery(
    GET_CRON_JOB_EXECUTIONS,
    {
      variables: {
        jobName: filters?.jobName,
        jobType: filters?.jobType,
        status: filters?.status,
        startDate: filters?.startDate?.toISOString(),
        endDate: filters?.endDate?.toISOString(),
        page,
        limit: pageSize,
      },
      fetchPolicy: 'network-only',
      skip: !authReady,
      notifyOnNetworkStatusChange: true,
    },
  );

  // 監聽 token 更新事件，確保 token 真正準備好時才執行查詢
  useEffect(() => {
    if (!authReady || hasFetchedRef.current) return;

    const handleTokenUpdate = () => {
      if (!hasFetchedRef.current) {
        hasFetchedRef.current = true;
        // 延遲一點確保 Apollo Client 的 authLink 也更新了
        setTimeout(() => {
          refetch();
        }, 100);
      }
    };

    // 立即檢查：如果 authReady 為 true，可能 token 已經設置好了
    if (authReady) {
      handleTokenUpdate();
    }

    // 監聽 token 更新事件
    if (typeof window !== 'undefined') {
      window.addEventListener(TOKEN_UPDATED_EVENT, handleTokenUpdate);
      return () => {
        window.removeEventListener(TOKEN_UPDATED_EVENT, handleTokenUpdate);
      };
    }
  }, [authReady, refetch]);

  const result: ExecutionHistoryResult | null =
    (data as any)?.cronJobExecutions || null;

  /**
   * 載入下一頁
   */
  const loadMore = async () => {
    if (!result || result.page >= result.totalPages) return;

    return fetchMore({
      variables: {
        page: result.page + 1,
      },
      updateQuery: (prev: any, { fetchMoreResult }: any) => {
        if (!fetchMoreResult) return prev;
        return {
          cronJobExecutions: {
            ...fetchMoreResult.cronJobExecutions,
            executions: [
              ...prev.cronJobExecutions.executions,
              ...fetchMoreResult.cronJobExecutions.executions,
            ],
          },
        };
      },
    });
  };

  const pageInfo = {
    currentPage: result?.page || page,
    totalPages: result?.totalPages || 1,
    totalCount: result?.total || 0,
    hasNextPage: (result?.page || page) < (result?.totalPages || 1),
    hasPreviousPage: (result?.page || page) > 1,
  };

  return {
    executions: result?.executions || [],
    loading,
    error,
    pageInfo,
    page,
    setPage,
    refetch,
    loadMore,
  };
}
