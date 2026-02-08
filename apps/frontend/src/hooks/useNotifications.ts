import { useQuery, useMutation, useSubscription } from '@apollo/client/react';
import { useSnackbar } from 'notistack';
import { useEffect } from 'react';
import { useTranslations } from 'next-intl';
import {
  GET_NOTIFICATIONS,
  GET_UNREAD_COUNT,
  MARK_NOTIFICATION_AS_READ,
  MARK_ALL_NOTIFICATIONS_AS_READ,
  DELETE_NOTIFICATION,
  DELETE_READ_NOTIFICATIONS,
  ON_NOTIFICATION_CREATED,
  Notification,
  NotificationType,
  NotificationListResponse,
} from '@/graphql/notification';
import { useNotificationPreferences } from './useNotificationPreferences';
import {
  playNotificationSound,
  NotificationSoundType,
} from '@/lib/notification-sound';
import { showDesktopNotification } from '@/lib/desktop-notification';
import { useAuthReady } from '@/components/auth/ProtectedRoute';
import {
  broadcastNotificationMarkedRead,
  broadcastAllNotificationsMarkedRead,
  broadcastNotificationDeleted,
  broadcastReadNotificationsCleared,
} from '@/utils/notificationSync';

/**
 * useNotifications Hook
 *
 * 提供通知相關的所有功能：
 * - 查詢通知列表
 * - 查詢未讀數量
 * - 標記已讀
 * - 刪除通知
 * - 即時訂閱新通知
 */
export function useNotifications(options?: {
  isRead?: boolean;
  limit?: number;
  autoSubscribe?: boolean;
}) {
  const { enqueueSnackbar } = useSnackbar();
  const t = useTranslations('pages.notificationCenter.messages');
  const autoSubscribe = options?.autoSubscribe ?? true;
  const authReady = useAuthReady();

  // 輔助函數：生成過濾後的 filter variables（移除 undefined）
  const getFilterVariables = () => ({
    filter: Object.fromEntries(
      Object.entries({
        isRead: options?.isRead,
        limit: options?.limit || 20,
        offset: 0,
      }).filter(([_, v]) => v !== undefined),
    ),
  });

  // 取得通知偏好設定
  const {
    isNotificationTypeEnabled,
    isBrowserNotificationEnabled,
    isSoundEnabled,
    isDesktopNotificationEnabled,
  } = useNotificationPreferences({ skip: !autoSubscribe || !authReady });

  // 查詢通知列表
  const {
    data: notificationsData,
    loading,
    error,
    refetch: refetchNotifications,
  } = useQuery<{ notifications: NotificationListResponse }>(GET_NOTIFICATIONS, {
    variables: getFilterVariables(),
    fetchPolicy: 'cache-and-network',
    skip: !authReady, // 只在認證完成後執行查詢
  });

  // 查詢未讀數量
  const { data: unreadData, refetch: refetchUnreadCount } = useQuery<{
    unreadNotificationCount: number;
  }>(GET_UNREAD_COUNT, {
    skip: !authReady, // 只在認證完成後執行查詢
  });

  // 標記單一通知為已讀（使用樂觀更新）
  const [markAsReadMutation] = useMutation<
    { markNotificationAsRead: Notification },
    { id: string }
  >(MARK_NOTIFICATION_AS_READ, {
    // 移除 optimistic response 以避免 "Missing field" 錯誤
    // GraphQL 響應很快，不需要樂觀更新
    update: (cache, { data }, { variables }) => {
      if (!data?.markNotificationAsRead || !variables) return;

      // 更新通知列表 cache
      try {
        const cachedData = cache.readQuery<{
          notifications: NotificationListResponse;
        }>({
          query: GET_NOTIFICATIONS,
          variables: getFilterVariables(),
        });

        if (cachedData?.notifications?.notifications) {
          cache.writeQuery({
            query: GET_NOTIFICATIONS,
            variables: getFilterVariables(),
            data: {
              notifications: {
                ...cachedData.notifications,
                notifications: cachedData.notifications.notifications.map(
                  (n) => (n.id === variables.id ? { ...n, isRead: true } : n),
                ),
              },
            },
          });
        }
      } catch (error) {
        // Query might not be in cache, that's ok
        console.debug('Could not update notifications cache:', error);
      }

      // 更新未讀數量
      refetchUnreadCount();
    },
    onCompleted: (data) => {
      // 廣播標記已讀事件
      if (data?.markNotificationAsRead?.id) {
        broadcastNotificationMarkedRead(data.markNotificationAsRead.id);
      }
    },
    onError: (error) => {
      console.error('Failed to mark notification as read:', error);
      enqueueSnackbar(t('markAsReadError'), { variant: 'error' });
    },
  });

  // 標記所有通知為已讀（使用樂觀更新）
  const [markAllAsReadMutation] = useMutation<{
    markAllNotificationsAsRead: number;
  }>(MARK_ALL_NOTIFICATIONS_AS_READ, {
    optimisticResponse: {
      markAllNotificationsAsRead: 0,
    },
    update: (cache) => {
      // 更新通知列表 cache - 將所有通知標記為已讀
      try {
        const cachedData = cache.readQuery<{
          notifications: NotificationListResponse;
        }>({
          query: GET_NOTIFICATIONS,
          variables: getFilterVariables(),
        });

        if (cachedData?.notifications?.notifications) {
          cache.writeQuery({
            query: GET_NOTIFICATIONS,
            variables: getFilterVariables(),
            data: {
              notifications: {
                ...cachedData.notifications,
                notifications: cachedData.notifications.notifications.map(
                  (n) => ({ ...n, isRead: true }),
                ),
              },
            },
          });
        }
      } catch (error) {
        console.debug('Could not update notifications cache:', error);
      }

      // 更新未讀數量為 0
      try {
        cache.writeQuery({
          query: GET_UNREAD_COUNT,
          data: {
            unreadNotificationCount: 0,
          },
        });
      } catch (error) {
        console.debug('Could not update unread count cache:', error);
      }
    },
    onCompleted: () => {
      refetchNotifications();
      refetchUnreadCount();
      enqueueSnackbar(t('markAllAsReadSuccess'), { variant: 'success' });
      // 廣播標記全部已讀事件
      broadcastAllNotificationsMarkedRead();
    },
    onError: (error) => {
      console.error('Failed to mark all notifications as read:', error);
      enqueueSnackbar(t('markAllAsReadError'), { variant: 'error' });
      // 錯誤時重新載入以恢復正確狀態
      refetchNotifications();
      refetchUnreadCount();
    },
  });

  // 刪除單一通知（使用樂觀更新）
  const [deleteNotificationMutation] = useMutation<
    { deleteNotification: boolean },
    { id: string }
  >(DELETE_NOTIFICATION, {
    optimisticResponse: {
      deleteNotification: true,
    },
    update: (cache, { data }, { variables }) => {
      if (!data?.deleteNotification || !variables) return;

      // 從通知列表 cache 中移除該通知
      try {
        const cachedData = cache.readQuery<{
          notifications: NotificationListResponse;
        }>({
          query: GET_NOTIFICATIONS,
          variables: getFilterVariables(),
        });

        if (cachedData?.notifications?.notifications) {
          const filteredNotifications =
            cachedData.notifications.notifications.filter(
              (n) => n.id !== variables.id,
            );

          cache.writeQuery({
            query: GET_NOTIFICATIONS,
            variables: getFilterVariables(),
            data: {
              notifications: {
                ...cachedData.notifications,
                notifications: filteredNotifications,
                total: Math.max(0, cachedData.notifications.total - 1),
              },
            },
          });

          // 如果刪除的是未讀通知，更新未讀數量
          const deletedNotification =
            cachedData.notifications.notifications.find(
              (n) => n.id === variables.id,
            );
          if (deletedNotification && !deletedNotification.isRead) {
            refetchUnreadCount();
          }
        }
      } catch (error) {
        console.debug('Could not update notifications cache:', error);
      }
    },
    onCompleted: (_data) => {
      refetchNotifications();
      refetchUnreadCount();
      // Note: deleteNotification mutation 返回 boolean，無法從 data 獲取 id
      // 廣播事件將在調用層處理
    },
    onError: (error) => {
      console.error('Failed to delete notification:', error);
      enqueueSnackbar(t('deleteError'), { variant: 'error' });
      // 錯誤時重新載入以恢復正確狀態
      refetchNotifications();
      refetchUnreadCount();
    },
  });

  // 刪除所有已讀通知（使用樂觀更新）
  const [deleteReadNotificationsMutation] = useMutation<{
    deleteReadNotifications: number;
  }>(DELETE_READ_NOTIFICATIONS, {
    optimisticResponse: {
      deleteReadNotifications: 0,
    },
    update: (cache) => {
      // 從通知列表 cache 中移除所有已讀通知
      try {
        const cachedData = cache.readQuery<{
          notifications: NotificationListResponse;
        }>({
          query: GET_NOTIFICATIONS,
          variables: getFilterVariables(),
        });

        if (cachedData?.notifications?.notifications) {
          const unreadNotifications =
            cachedData.notifications.notifications.filter((n) => !n.isRead);
          const deletedCount =
            cachedData.notifications.notifications.length -
            unreadNotifications.length;

          cache.writeQuery({
            query: GET_NOTIFICATIONS,
            variables: getFilterVariables(),
            data: {
              notifications: {
                ...cachedData.notifications,
                notifications: unreadNotifications,
                total: Math.max(
                  0,
                  cachedData.notifications.total - deletedCount,
                ),
              },
            },
          });
        }
      } catch (error) {
        console.debug('Could not update notifications cache:', error);
      }
    },
    onCompleted: () => {
      refetchNotifications();
      enqueueSnackbar(t('deleteReadSuccess'), { variant: 'success' });
      // 廣播清除已讀通知事件
      broadcastReadNotificationsCleared();
    },
    onError: (error) => {
      console.error('Failed to delete read notifications:', error);
      enqueueSnackbar(t('deleteReadError'), { variant: 'error' });
      // 錯誤時重新載入以恢復正確狀態
      refetchNotifications();
    },
  });

  // 訂閱新通知
  const { data: subscriptionData } = useSubscription<{
    notificationCreated: Notification;
  }>(ON_NOTIFICATION_CREATED, {
    skip: !autoSubscribe || !authReady,
  });

  // 處理新通知
  useEffect(() => {
    if (subscriptionData?.notificationCreated) {
      const notification = subscriptionData.notificationCreated;

      // 檢查通知類型是否啟用
      if (!isNotificationTypeEnabled(notification.type)) {
        console.log(
          '[useNotifications] Notification type disabled:',
          notification.type,
        );
        // 仍然更新列表和未讀數量，只是不顯示
        refetchNotifications();
        refetchUnreadCount();
        return;
      }

      // 播放音效（如果啟用）
      if (isSoundEnabled()) {
        const soundTypeMap: Record<NotificationType, NotificationSoundType> = {
          [NotificationType.INFO]: 'info',
          [NotificationType.WARNING]: 'warning',
          [NotificationType.SUCCESS]: 'success',
          [NotificationType.ERROR]: 'error',
        };
        playNotificationSound(soundTypeMap[notification.type] || 'info');
      }

      // 顯示桌面通知（如果啟用）
      if (isDesktopNotificationEnabled()) {
        showDesktopNotification({
          title: notification.title,
          body: notification.message,
          tag: notification.id,
          onClick: () => {
            // 點擊桌面通知時可以導航到通知頁面
            console.log('Desktop notification clicked:', notification.id);
          },
        });
      }

      // 顯示瀏覽器內通知（如果啟用）
      if (isBrowserNotificationEnabled()) {
        const variantMap: Record<
          NotificationType,
          'info' | 'warning' | 'success' | 'error'
        > = {
          [NotificationType.INFO]: 'info',
          [NotificationType.WARNING]: 'warning',
          [NotificationType.SUCCESS]: 'success',
          [NotificationType.ERROR]: 'error',
        };

        enqueueSnackbar(notification.message, {
          variant: variantMap[notification.type] || 'info',
          autoHideDuration: 5000,
        });
      }

      // 更新列表和未讀數量
      refetchNotifications();
      refetchUnreadCount();
    }
  }, [
    subscriptionData,
    enqueueSnackbar,
    refetchNotifications,
    refetchUnreadCount,
    isNotificationTypeEnabled,
    isBrowserNotificationEnabled,
    isSoundEnabled,
    isDesktopNotificationEnabled,
  ]);

  return {
    // 資料
    notifications:
      notificationsData?.notifications?.notifications || ([] as Notification[]),
    total: notificationsData?.notifications?.total || 0,
    unreadCount: unreadData?.unreadNotificationCount || 0,
    loading,
    error: error || null,

    // 操作方法
    markAsRead: (id: string) => markAsReadMutation({ variables: { id } }),
    markAllAsRead: () => markAllAsReadMutation(),
    deleteNotification: async (id: string) => {
      const result = await deleteNotificationMutation({ variables: { id } });
      // mutation 成功後廣播刪除事件
      if (result.data?.deleteNotification) {
        broadcastNotificationDeleted(id);
      }
      return result;
    },
    deleteReadNotifications: () => deleteReadNotificationsMutation(),
    refetch: refetchNotifications,
  };
}
