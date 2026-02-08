import { useState, useCallback, useEffect, useRef } from 'react';
import { useQuery } from '@apollo/client/react';
import { useSnackbar } from 'notistack';
import { useTranslations } from 'next-intl';
import {
  GET_NOTIFICATIONS,
  GET_UNREAD_COUNT,
  Notification,
  NotificationListResponse,
  NotificationType,
} from '@/graphql/notification';
import { useAuthReady } from '@/components/auth/ProtectedRoute';

/**
 * 篩選選項
 */
export interface NotificationFilterOptions {
  /**
   * 已讀狀態篩選
   */
  isRead?: boolean;

  /**
   * 通知類型篩選
   */
  type?: NotificationType;

  /**
   * 搜尋關鍵字（前端過濾）
   */
  searchQuery?: string;
}

/**
 * useInfiniteNotifications Hook
 *
 * 提供無限滾動的通知列表功能
 * - 支援 loadMore 載入更多通知
 * - 自動追蹤 hasMore 狀態
 * - 使用 offset-based pagination
 * - 支援篩選（類型、已讀狀態、搜尋）
 */
export function useInfiniteNotifications(options?: {
  pageSize?: number;
  autoSubscribe?: boolean;
  filters?: NotificationFilterOptions;
}) {
  const { enqueueSnackbar } = useSnackbar();
  const t = useTranslations('pages.notificationCenter.messages');
  const authReady = useAuthReady();

  const pageSize = options?.pageSize || 20;
  const filters = options?.filters || {};

  const [allNotifications, setAllNotifications] = useState<Notification[]>([]);
  const [hasMore, setHasMore] = useState(true);

  // 使用 ref 來追蹤當前的 offset，避免在 effect 依賴中造成循環
  const offsetRef = useRef(0);

  // 使用 ref 來追蹤上一次的篩選條件
  const prevFiltersRef = useRef(filters);

  // 構建查詢變數
  const queryVariables = {
    filter: Object.fromEntries(
      Object.entries({
        isRead: filters.isRead,
        type: filters.type,
        limit: pageSize,
        offset: 0,
      }).filter(([_, v]) => v !== undefined),
    ),
  };

  // 查詢通知列表
  const {
    data: notificationsData,
    loading,
    error,
    fetchMore,
    refetch: refetchQuery,
  } = useQuery<{ notifications: NotificationListResponse }>(GET_NOTIFICATIONS, {
    variables: queryVariables,
    fetchPolicy: 'network-only', // 改為 network-only 確保每次都從服務器獲取最新數據
    skip: !authReady,
    notifyOnNetworkStatusChange: true,
  });

  // 查詢未讀數量
  const { data: unreadData, refetch: refetchUnreadCount } = useQuery<{
    unreadNotificationCount: number;
  }>(GET_UNREAD_COUNT, {
    skip: !authReady,
    fetchPolicy: 'network-only',
  });

  // 檢測篩選條件是否改變
  useEffect(() => {
    const filtersChanged =
      prevFiltersRef.current.isRead !== filters.isRead ||
      prevFiltersRef.current.type !== filters.type;

    if (filtersChanged) {
      // 篩選條件改變，重置狀態
      console.log(
        '[useInfiniteNotifications] Filters changed, resetting state',
      );
      prevFiltersRef.current = filters;
      offsetRef.current = 0;
      setAllNotifications([]);
      setHasMore(true);
    }
  }, [filters.isRead, filters.type]);

  // 處理查詢結果
  useEffect(() => {
    if (!notificationsData || loading) {
      return;
    }

    const newNotifications =
      notificationsData?.notifications?.notifications || [];

    console.log('[useInfiniteNotifications] Query result:', {
      total: notificationsData?.notifications?.total,
      unreadCount: notificationsData?.notifications?.unreadCount,
      newNotificationsLength: newNotifications.length,
      currentOffset: offsetRef.current,
    });

    // 如果 offset 是 0，表示這是初始查詢或重新查詢
    if (offsetRef.current === 0) {
      setAllNotifications(newNotifications);
      offsetRef.current = newNotifications.length;
      setHasMore(newNotifications.length >= pageSize);
    }
  }, [notificationsData, loading, pageSize]);

  // 客戶端搜尋過濾
  const filteredNotifications = allNotifications.filter((notification) => {
    if (filters.searchQuery) {
      const query = filters.searchQuery.toLowerCase();
      const matchTitle = notification.title.toLowerCase().includes(query);
      const matchMessage = notification.message.toLowerCase().includes(query);
      return matchTitle || matchMessage;
    }
    return true;
  });

  // 載入更多通知
  const loadMore = useCallback(async () => {
    if (!hasMore || loading) {
      return;
    }

    console.log(
      '[useInfiniteNotifications] Loading more from offset:',
      offsetRef.current,
    );

    try {
      const result = await fetchMore({
        variables: {
          filter: Object.fromEntries(
            Object.entries({
              isRead: filters.isRead,
              type: filters.type,
              limit: pageSize,
              offset: offsetRef.current,
            }).filter(([_, v]) => v !== undefined),
          ),
        },
      });

      const newNotifications = result.data?.notifications?.notifications || [];

      console.log('[useInfiniteNotifications] Loaded more:', {
        count: newNotifications.length,
        newOffset: offsetRef.current + newNotifications.length,
      });

      if (newNotifications.length > 0) {
        setAllNotifications((prev) => [...prev, ...newNotifications]);
        offsetRef.current += newNotifications.length;
        setHasMore(newNotifications.length >= pageSize);
      } else {
        setHasMore(false);
      }
    } catch (err) {
      console.error('[useInfiniteNotifications] Failed to load more:', err);
      enqueueSnackbar(t('deleteError'), { variant: 'error' });
    }
  }, [
    hasMore,
    loading,
    fetchMore,
    pageSize,
    filters.isRead,
    filters.type,
    enqueueSnackbar,
    t,
  ]);

  // 重新整理（重置所有狀態）
  const refetch = useCallback(async () => {
    console.log('[useInfiniteNotifications] Refetching notifications');
    offsetRef.current = 0;
    setHasMore(true);
    setAllNotifications([]);
    await refetchQuery();
    await refetchUnreadCount();
  }, [refetchQuery, refetchUnreadCount]);

  return {
    // 資料
    notifications: filteredNotifications,
    allNotifications, // 未過濾的完整列表
    total: notificationsData?.notifications?.total || 0,
    unreadCount: unreadData?.unreadNotificationCount || 0,
    loading,
    error: error || null,
    hasMore,

    // 操作方法
    loadMore,
    refetch,
  };
}
