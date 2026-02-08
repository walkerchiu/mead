'use client';

import { useState, useEffect } from 'react';
import { useSubscription } from '@apollo/client/react';
import {
  CRON_JOB_EXECUTION_CREATED_SUBSCRIPTION,
  CRON_JOB_CONFIG_UPDATED_SUBSCRIPTION,
  GET_CRON_JOB_EXECUTIONS,
} from '@/graphql/cron-jobs';
import { isAuthenticated } from '@/lib/auth';

// Debug helper - only logs in development
const isDevelopment = process.env.NODE_ENV === 'development';
const debugLog = (...args: unknown[]) => {
  if (isDevelopment) {
    console.log(...args);
  }
};

interface UseCronJobSubscriptionOptions {
  onNewExecution?: () => void;
  onConfigUpdated?: () => void;
  currentPage?: number;
  filters?: {
    jobName?: string;
    status?: string;
  };
}

export const useCronJobSubscription = (
  options?: UseCronJobSubscriptionOptions | (() => void),
) => {
  // 向後兼容：如果傳入的是函數，視為 onNewExecution
  const {
    onNewExecution,
    onConfigUpdated,
    currentPage = 1,
    filters = {},
  } = typeof options === 'function'
    ? { onNewExecution: options }
    : options || {};

  const [newExecutionsCount, setNewExecutionsCount] = useState(0);
  const [shouldSubscribe, setShouldSubscribe] = useState(false);
  const [isMounted, setIsMounted] = useState(false);

  // 確保只在客戶端執行
  useEffect(() => {
    setIsMounted(true);
  }, []);

  // 確保已認證後才訂閱
  useEffect(() => {
    if (!isMounted) return;

    if (isAuthenticated()) {
      setShouldSubscribe(true);
      debugLog('[Cron Job Subscription] Enabled');
    }
  }, [isMounted]);

  // 訂閱 Cron Job 執行記錄創建事件
  useSubscription(CRON_JOB_EXECUTION_CREATED_SUBSCRIPTION, {
    skip: !shouldSubscribe || !isMounted,
    onData: ({ data, client: subscriptionClient }) => {
      console.log('[Cron Job] Execution subscription data received:', data);
      const typedData = data as {
        data?: { cronJobExecutionCreated?: unknown };
      };
      if (typedData?.data?.cronJobExecutionCreated) {
        const newExecution = typedData.data.cronJobExecutionCreated;

        // 累計新執行記錄數量
        setNewExecutionsCount((prev) => prev + 1);

        console.log('[Cron Job] New execution received:', newExecution);

        // ✅ 如果在第 1 頁，直接將新記錄插入到列表最上方
        if (currentPage === 1 && subscriptionClient) {
          try {
            const variables = {
              jobName: filters?.jobName,
              jobType: undefined,
              status: filters?.status,
              startDate: undefined,
              endDate: undefined,
              page: 1,
              limit: 20,
            };

            // 直接更新 cache
            subscriptionClient.cache.updateQuery(
              {
                query: GET_CRON_JOB_EXECUTIONS,
                variables,
              },
              (
                existingData:
                  | {
                      cronJobExecutions?: {
                        executions: unknown[];
                        total: number;
                        limit: number;
                      };
                    }
                  | undefined
                  | null,
              ) => {
                if (!existingData?.cronJobExecutions) {
                  return existingData;
                }

                console.log(
                  '[Cron Job] Inserting new execution at the top of the list',
                );

                const currentExecutions =
                  existingData.cronJobExecutions.executions;
                const limit = existingData.cronJobExecutions.limit || 20;

                // 將新記錄插入到列表最上方
                let newExecutions = [newExecution, ...currentExecutions];

                // 如果超過一頁的限制，移除最後一筆
                if (newExecutions.length > limit) {
                  newExecutions = newExecutions.slice(0, limit);
                  console.log('[Cron Job] Trimmed list to maintain page size');
                }

                return {
                  cronJobExecutions: {
                    ...existingData.cronJobExecutions,
                    executions: newExecutions,
                    total: existingData.cronJobExecutions.total + 1,
                  },
                };
              },
            );

            console.log('[Cron Job] New execution inserted into cache');
          } catch (error) {
            console.error('[Cron Job] Failed to update cache:', error);
            // 如果更新失敗且 client 存在，清除 cache
            if (subscriptionClient) {
              subscriptionClient.cache.evict({
                id: 'ROOT_QUERY',
                fieldName: 'cronJobExecutions',
              });
            }
          }
        } else {
          console.log(
            '[Cron Job] New execution detected on page',
            currentPage,
            '- showing notification',
          );
        }

        // 觸發回調
        if (onNewExecution) {
          onNewExecution();
        }
      }
    },
    onError: (error) => {
      console.error('[Cron Job Execution Subscription] Error:', error);
    },
    onComplete: () => {
      console.log('[Cron Job Execution Subscription] Completed');
    },
  });

  // 訂閱 Cron Job 配置更新事件
  useSubscription(CRON_JOB_CONFIG_UPDATED_SUBSCRIPTION, {
    skip: !shouldSubscribe || !isMounted,
    onData: ({ data, client: subscriptionClient }) => {
      console.log('[Cron Job] Config subscription data received:', data);
      const typedData = data as { data?: { cronJobConfigUpdated?: unknown } };
      if (typedData?.data?.cronJobConfigUpdated && subscriptionClient) {
        console.log(
          '[Cron Job] Config updated:',
          typedData.data.cronJobConfigUpdated,
        );

        // 清除配置和統計的 cache 以觸發重新查詢
        subscriptionClient.cache.evict({
          id: 'ROOT_QUERY',
          fieldName: 'cronJobConfigs',
        });
        subscriptionClient.cache.evict({
          id: 'ROOT_QUERY',
          fieldName: 'cronJobStatistics',
        });

        // 觸發回調
        if (onConfigUpdated) {
          onConfigUpdated();
        }
      }
    },
    onError: (error) => {
      console.error('[Cron Job Config Subscription] Error:', error);
    },
    onComplete: () => {
      console.log('[Cron Job Config Subscription] Completed');
    },
  });

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      console.log('[Cron Job Subscription] Cleaning up subscription...');
    };
  }, []);

  const clearNewExecutionsCount = () => setNewExecutionsCount(0);

  // 服務端渲染時返回安全的初始值
  if (!isMounted) {
    return {
      newExecutionsCount: 0,
      clearNewExecutionsCount: () => {},
      isSubscribed: false,
    };
  }

  return {
    newExecutionsCount,
    clearNewExecutionsCount,
    isSubscribed: shouldSubscribe,
  };
};
