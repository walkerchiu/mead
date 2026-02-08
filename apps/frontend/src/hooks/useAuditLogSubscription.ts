'use client';

import { useState, useEffect } from 'react';
import { useSubscription } from '@apollo/client/react';
import { AUDIT_LOG_CREATED_SUBSCRIPTION } from '@/lib/audit-logs-queries';
import { AUDIT_LOGS_PAGINATED_QUERY } from '@/lib/audit-logs-queries';
import { isAuthenticated } from '@/lib/auth';

// Debug helper - only logs in development
const isDevelopment = process.env.NODE_ENV === 'development';
const debugLog = (...args: unknown[]) => {
  if (isDevelopment) {
    console.log(...args);
  }
};

interface UseAuditLogSubscriptionOptions {
  onNewLog?: () => void;
  currentPage?: number;
  filters?: {
    userId?: string;
    action?: string;
    entity?: string;
    status?: string;
  };
}

export const useAuditLogSubscription = (
  options?: UseAuditLogSubscriptionOptions | (() => void),
) => {
  // 向後兼容：如果傳入的是函數，視為 onNewLog
  const {
    onNewLog,
    currentPage = 1,
    filters = {},
  } = typeof options === 'function' ? { onNewLog: options } : options || {};

  const [newLogsCount, setNewLogsCount] = useState(0);
  const [shouldSubscribe, setShouldSubscribe] = useState(false);
  const [isMounted, setIsMounted] = useState(false);

  // 確保只在客戶端執行
  useEffect(() => {
    setIsMounted(true);
  }, []);

  // 確保已認證後才訂閱（移除不必要的延遲）
  useEffect(() => {
    if (!isMounted) return;

    if (isAuthenticated()) {
      setShouldSubscribe(true);
      debugLog('[Audit Log Subscription] Enabled');
    }
  }, [isMounted]);

  useSubscription(AUDIT_LOG_CREATED_SUBSCRIPTION, {
    skip: !shouldSubscribe || !isMounted, // 未認證或服務端時跳過訂閱
    onData: ({ data, client: subscriptionClient }) => {
      console.log('[Audit Log] Subscription data received:', data);
      const typedData = data as { data?: { auditLogCreated?: unknown } };
      if (typedData?.data?.auditLogCreated) {
        const newLog = typedData.data.auditLogCreated;

        // 累計新日誌數量
        setNewLogsCount((prev) => prev + 1);

        // 可選：顯示通知
        console.log('[Audit Log] New log received:', newLog);

        // ✅ 如果在第 1 頁，直接將新日誌插入到列表最上方（無感更新）
        if (currentPage === 1) {
          try {
            // 構建查詢變數
            const variables = {
              pagination: { page: 1, limit: 50 },
              ...filters,
            };

            // 直接更新 cache，將新日誌插入到列表最上方
            subscriptionClient.cache.updateQuery(
              {
                query: AUDIT_LOGS_PAGINATED_QUERY,
                variables,
              },
              (
                existingData:
                  | {
                      auditLogsPaginated?: {
                        data: unknown[];
                        pageInfo: { limit: number; totalCount: number };
                      };
                    }
                  | undefined
                  | null,
              ) => {
                if (!existingData?.auditLogsPaginated) {
                  return existingData;
                }

                console.log(
                  '[Audit Log] Inserting new log at the top of the list',
                );

                const currentData = existingData.auditLogsPaginated.data;
                const limit =
                  existingData.auditLogsPaginated.pageInfo.limit || 50;

                // 將新日誌插入到列表最上方
                let newData = [newLog, ...currentData];

                // ✅ 如果超過一頁的限制，移除最後一筆（保持列表長度）
                if (newData.length > limit) {
                  newData = newData.slice(0, limit);
                  console.log('[Audit Log] Trimmed list to maintain page size');
                }

                return {
                  auditLogsPaginated: {
                    ...existingData.auditLogsPaginated,
                    data: newData,
                    pageInfo: {
                      ...existingData.auditLogsPaginated.pageInfo,
                      totalCount:
                        existingData.auditLogsPaginated.pageInfo.totalCount + 1,
                    },
                  },
                };
              },
            );

            // ✅ 不清除統計數據的 cache，避免觸發額外的查詢
            // 統計數據會在用戶手動重新整理或重新進入頁面時自動更新

            console.log('[Audit Log] New log inserted into cache');
          } catch (error) {
            console.error('[Audit Log] Failed to update cache:', error);
            // 如果更新失敗，降級為清除 cache
            subscriptionClient.cache.evict({
              id: 'ROOT_QUERY',
              fieldName: 'auditLogsPaginated',
            });
          }
        } else {
          // ℹ️ 不在第 1 頁，只累計新日誌數量（不清除 cache，避免觸發重新查詢）
          // 用戶點擊通知跳到第 1 頁時，會自動載入最新資料
          console.log(
            '[Audit Log] New log detected on page',
            currentPage,
            '- showing notification',
          );
        }

        // ✅ 不執行垃圾回收，避免觸發重新渲染
        // Apollo Client 會自動管理記憶體

        // 觸發回調
        if (onNewLog) {
          onNewLog();
        }
      }
    },
    onError: (error) => {
      console.error('[Audit Log Subscription] Error:', error);
      console.error(
        '[Audit Log Subscription] Error details:',
        JSON.stringify(error, null, 2),
      );
    },
    onComplete: () => {
      console.log('[Audit Log Subscription] Completed');
    },
  });

  // ✅ Cleanup on unmount
  useEffect(() => {
    return () => {
      console.log('[Audit Log Subscription] Cleaning up subscription...');
      // Apollo Client will automatically unsubscribe when component unmounts
    };
  }, []);

  const clearNewLogsCount = () => setNewLogsCount(0);

  // 服務端渲染時返回安全的初始值
  if (!isMounted) {
    return {
      newLogsCount: 0,
      clearNewLogsCount: () => {},
      isSubscribed: false,
    };
  }

  return {
    newLogsCount,
    clearNewLogsCount,
    isSubscribed: shouldSubscribe,
  };
};
