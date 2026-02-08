'use client';

import { useCallback, useState, useEffect } from 'react';
import dynamic from 'next/dynamic';
import { Container, Box, IconButton, Tooltip, Alert } from '@mui/material';
import { Button } from '@/components/atoms';
import {
  Notifications as NotificationsIcon,
  Settings as SettingsIcon,
  Refresh as RefreshIcon,
} from '@mui/icons-material';
import { useNavRouter as useRouter } from '@/i18n/use-nav-router';
import { useTranslations } from 'next-intl';
import { useSnackbar } from 'notistack';
import ProtectedRoute from '@/components/auth/ProtectedRoute';
import { AppShell } from '@/components/layout';
import { PageHeader } from '@/components/molecules';
import { NotificationListSkeleton } from '@/components/atoms';
import { Modal } from '@/components/organisms/Modal/Modal';
import { useNotifications } from '@/hooks/useNotifications';
import {
  useInfiniteNotifications,
  type NotificationFilterOptions,
} from '@/hooks/useInfiniteNotifications';
import type { NotificationTypeFilter } from '@/components/molecules/NotificationFilters';
import { fromGraphQLNotification } from '@/types/notification';
import { NotificationType } from '@/graphql/notification';
import { notificationSync } from '@/utils/notificationSync';

// Lazy load notification components
const InfiniteNotificationList = dynamic(() =>
  import('@/components/molecules/InfiniteNotificationList').then(
    (mod) => mod.InfiniteNotificationList,
  ),
);

const NotificationFilters = dynamic(() =>
  import('@/components/molecules/NotificationFilters').then(
    (mod) => mod.NotificationFilters,
  ),
);

/**
 * Notifications Page - 完整的通知管理頁面
 *
 * 功能：
 * - 顯示所有通知（分頁載入）
 * - 篩選：全部/未讀
 * - 操作：標記已讀、刪除、清除已讀
 * - 即時更新（GraphQL Subscriptions）
 */
function NotificationsPageContent() {
  const router = useRouter();
  const { enqueueSnackbar } = useSnackbar();
  const t = useTranslations('pages.settings.notificationCenter');
  const tCommon = useTranslations('common');
  const tNotification = useTranslations('components.notification');

  // 篩選狀態
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedType, setSelectedType] =
    useState<NotificationTypeFilter>('all');

  // Modal 狀態
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [clearReadModalOpen, setClearReadModalOpen] = useState(false);
  const [notificationToDelete, setNotificationToDelete] = useState<
    string | null
  >(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // 構建篩選選項
  const filters: NotificationFilterOptions = {
    searchQuery,
    type:
      selectedType !== 'all' ? (selectedType as NotificationType) : undefined,
  };

  // 無限滾動通知管理
  const {
    notifications: gqlNotifications,
    loading,
    error,
    hasMore,
    loadMore,
    refetch,
    total,
  } = useInfiniteNotifications({
    pageSize: 20,
    autoSubscribe: true,
    filters,
  });

  // 當篩選條件變更時，重新載入
  useEffect(() => {
    refetch();
  }, [selectedType, refetch]);

  // 監聽來自鈴鐺選單的同步事件
  useEffect(() => {
    const unsubscribe = notificationSync.subscribe((event) => {
      console.log('[NotificationsPage] Received sync event:', event);

      // 任何操作都觸發重新載入
      switch (event.type) {
        case 'NOTIFICATION_MARKED_READ':
        case 'ALL_NOTIFICATIONS_MARKED_READ':
        case 'NOTIFICATION_DELETED':
        case 'READ_NOTIFICATIONS_CLEARED':
          console.log('[NotificationsPage] Refetching due to sync event');
          refetch();
          break;
      }
    });

    // 清理
    return () => {
      unsubscribe();
    };
  }, [refetch]);

  // 使用原有的 useNotifications 獲取操作方法（不包含查詢）
  const {
    markAsRead,
    markAllAsRead,
    deleteNotification,
    deleteReadNotifications,
  } = useNotifications({
    limit: 1, // 最小化查詢，只用來獲取操作方法
    autoSubscribe: false, // 不重複訂閱
  });

  // 轉換為統一格式
  const notifications = gqlNotifications.map(fromGraphQLNotification);

  // 處理設定
  const handleSettings = useCallback(() => {
    router.push('/settings/notifications');
  }, [router]);

  // 處理通知點擊
  const handleNotificationClick = useCallback(
    async (id: string) => {
      const notification = notifications.find((n) => n.id === id);

      // 標記為已讀
      if (notification && !notification.isRead) {
        try {
          await markAsRead(id);
          // useNotifications hook 會自動廣播事件
          enqueueSnackbar(tNotification('markedAsRead'), {
            variant: 'success',
            autoHideDuration: 1500,
          });
        } catch (error) {
          console.error('Failed to mark as read:', error);
        } finally {
          // 重新載入無限滾動列表以更新狀態
          await refetch();
        }
      }

      // 導航到 actionUrl
      if (notification?.actionUrl) {
        const url = notification.actionUrl;

        // 判斷是內部還是外部連結
        if (url.startsWith('http://') || url.startsWith('https://')) {
          // 外部連結：新視窗開啟
          window.open(url, '_blank', 'noopener,noreferrer');
        } else {
          // 內部連結：使用 Next.js router
          router.push(url);
        }
      }
    },
    [
      notifications,
      markAsRead,
      router,
      enqueueSnackbar,
      tNotification,
      refetch,
    ],
  );

  // 處理通知刪除（開啟確認 modal）
  const handleNotificationDelete = useCallback((id: string) => {
    setNotificationToDelete(id);
    setDeleteModalOpen(true);
  }, []);

  // 確認刪除通知
  const confirmDeleteNotification = useCallback(async () => {
    if (!notificationToDelete) return;

    setIsDeleting(true);
    try {
      await deleteNotification(notificationToDelete);
      // useNotifications hook 會自動廣播事件
      enqueueSnackbar(tNotification('deleteSuccess'), {
        variant: 'success',
        autoHideDuration: 2000,
      });
      setDeleteModalOpen(false);
      setNotificationToDelete(null);
    } catch (error) {
      console.error('Failed to delete notification:', error);
      enqueueSnackbar(tNotification('deleteFailed'), {
        variant: 'error',
        autoHideDuration: 3000,
      });
    } finally {
      setIsDeleting(false);
      // 無論成功或失敗都重新載入，確保 UI 與後端同步
      await refetch();
    }
  }, [
    notificationToDelete,
    deleteNotification,
    refetch,
    tNotification,
    enqueueSnackbar,
  ]);

  // 取消刪除
  const cancelDelete = useCallback(() => {
    setDeleteModalOpen(false);
    setNotificationToDelete(null);
  }, []);

  // 處理標記全部已讀
  const handleMarkAllAsRead = useCallback(async () => {
    try {
      await markAllAsRead();
    } catch (error) {
      console.error('Failed to mark all as read:', error);
    } finally {
      // 無論成功或失敗都重新載入，確保 UI 與後端同步
      await refetch();
    }
  }, [markAllAsRead, refetch]);

  // 處理清除已讀通知（開啟確認 modal）
  const handleClearRead = useCallback(() => {
    setClearReadModalOpen(true);
  }, []);

  // 確認清除已讀通知
  const confirmClearRead = useCallback(async () => {
    setIsDeleting(true);
    try {
      await deleteReadNotifications();
      // useNotifications hook 會自動廣播事件
      enqueueSnackbar(tNotification('clearReadSuccess'), {
        variant: 'success',
        autoHideDuration: 2000,
      });
      setClearReadModalOpen(false);
    } catch (error) {
      console.error('Failed to delete read notifications:', error);
      enqueueSnackbar(tNotification('clearReadFailed'), {
        variant: 'error',
        autoHideDuration: 3000,
      });
    } finally {
      setIsDeleting(false);
      // 無論成功或失敗都重新載入，確保 UI 與後端同步
      await refetch();
    }
  }, [deleteReadNotifications, refetch, tNotification, enqueueSnackbar]);

  // 取消清除
  const cancelClearRead = useCallback(() => {
    setClearReadModalOpen(false);
  }, []);

  // 處理重新整理
  const handleRefresh = useCallback(async () => {
    await refetch();
    enqueueSnackbar(tCommon('refreshed'), {
      variant: 'success',
      autoHideDuration: 2000,
    });
  }, [refetch, enqueueSnackbar, tCommon]);

  return (
    <AppShell>
      <Container
        maxWidth="lg"
        sx={{
          mt: { xs: 2, sm: 3, md: 4 },
          mb: { xs: 2, sm: 3, md: 4 },
          px: { xs: 2, sm: 3 },
        }}
      >
        {/* 頁面標題 */}
        <PageHeader
          breadcrumbs={[
            { label: tCommon('breadcrumb.dashboard'), href: '/dashboard' },
            { label: tCommon('breadcrumb.notifications') },
          ]}
          title={t('title')}
          description={t('description')}
          icon={
            <NotificationsIcon
              sx={{ fontSize: '2rem', color: 'primary.main' }}
            />
          }
          actions={
            <Box sx={{ display: 'flex', gap: 2 }}>
              <Button
                variant="contained"
                color="primary"
                startIcon={<RefreshIcon />}
                onClick={handleRefresh}
                disabled={loading}
              >
                {tCommon('refresh')}
              </Button>
              <Tooltip title={tCommon('settings')}>
                <IconButton onClick={handleSettings}>
                  <SettingsIcon />
                </IconButton>
              </Tooltip>
            </Box>
          }
        />

        {/* 篩選器 - 永遠顯示，不需要 Skeleton */}
        <NotificationFilters
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
          selectedType={selectedType}
          onTypeChange={setSelectedType}
          defaultExpanded={true}
          resultCount={total}
        />

        {/* Loading State */}
        {loading && notifications.length === 0 ? (
          <NotificationListSkeleton
            count={5}
            showContainer={true}
            showActions={true}
          />
        ) : error ? (
          /* Error State */
          <Box sx={{ mb: { xs: 2, sm: 3 } }}>
            <Alert
              severity="error"
              action={
                <Button color="inherit" size="small" onClick={() => refetch()}>
                  {t('retry')}
                </Button>
              }
            >
              {t('error')}
            </Alert>
          </Box>
        ) : (
          /* Infinite Notification List */
          <InfiniteNotificationList
            notifications={notifications}
            loading={loading}
            hasMore={hasMore}
            totalCount={total}
            onLoadMore={loadMore}
            onMarkAsRead={markAsRead}
            onNotificationClick={handleNotificationClick}
            onNotificationDelete={handleNotificationDelete}
            onMarkAllAsRead={handleMarkAllAsRead}
            onClearRead={handleClearRead}
          />
        )}
      </Container>

      {/* 刪除通知確認 Modal */}
      <Modal
        open={deleteModalOpen}
        onClose={cancelDelete}
        title={tNotification('confirmDeleteTitle')}
        description={tNotification('confirmDelete')}
        variant="warning"
        maxWidth="xs"
        loading={isDeleting}
        actions={[
          {
            label: tCommon('cancel'),
            onClick: cancelDelete,
            variant: 'outlined',
            disabled: isDeleting,
          },
          {
            label: tNotification('delete'),
            onClick: confirmDeleteNotification,
            variant: 'contained',
            color: 'error',
            disabled: isDeleting,
            loading: isDeleting,
            autoFocus: true,
          },
        ]}
      />

      {/* 清除已讀通知確認 Modal */}
      <Modal
        open={clearReadModalOpen}
        onClose={cancelClearRead}
        title={tNotification('confirmClearReadTitle')}
        description={tNotification('confirmClearRead')}
        variant="warning"
        maxWidth="xs"
        loading={isDeleting}
        actions={[
          {
            label: tCommon('cancel'),
            onClick: cancelClearRead,
            variant: 'outlined',
            disabled: isDeleting,
          },
          {
            label: tNotification('clearAll'),
            onClick: confirmClearRead,
            variant: 'contained',
            color: 'error',
            disabled: isDeleting,
            loading: isDeleting,
            autoFocus: true,
          },
        ]}
      />
    </AppShell>
  );
}

export default function NotificationsPage() {
  return (
    <ProtectedRoute>
      <NotificationsPageContent />
    </ProtectedRoute>
  );
}
