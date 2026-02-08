/**
 * Cron Jobs 統計 Hook
 */

import { useQuery } from '@apollo/client/react';
import { GET_CRON_JOB_STATISTICS } from '@/graphql/cron-jobs';
import type { CronJobExecution, CronJobStatus } from './useCronJobs';
import { useEffect, useRef } from 'react';
import { TOKEN_UPDATED_EVENT } from '@/lib/auth';

/**
 * 按 Job 名稱統計
 */
export interface JobNameStatistics {
  jobName: string;
  totalExecutions: number;
  successfulExecutions: number;
  failedExecutions: number;
  averageDuration: number;
  lastExecutedAt?: string;
  lastStatus?: CronJobStatus;
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
 * 統計結果
 */
export interface CronJobStatistics {
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
  recentExecutions: CronJobExecution[];
}

/**
 * 統計篩選器
 */
export interface StatisticsFilters {
  jobName?: string;
  jobType?: string;
  startDate?: Date;
  endDate?: Date;
}

/**
 * useCronStatistics Hook Options
 */
export interface UseCronStatisticsOptions {
  filters?: StatisticsFilters;
  authReady?: boolean;
}

/**
 * useCronStatistics Hook
 */
export function useCronStatistics({
  filters = {},
  authReady = true,
}: UseCronStatisticsOptions) {
  const hasFetchedRef = useRef(false);

  const { data, loading, error, refetch } = useQuery(GET_CRON_JOB_STATISTICS, {
    variables: {
      jobName: filters?.jobName,
      jobType: filters?.jobType,
      startDate: filters?.startDate?.toISOString(),
      endDate: filters?.endDate?.toISOString(),
    },
    fetchPolicy: 'network-only',
    skip: !authReady, // ✅ 等待認證就緒後再執行查詢
    notifyOnNetworkStatusChange: true,
  });

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

  const statistics: CronJobStatistics | null =
    (data as any)?.cronJobStatistics || null;

  return {
    statistics,
    loading,
    error,
    refetch,
  };
}
