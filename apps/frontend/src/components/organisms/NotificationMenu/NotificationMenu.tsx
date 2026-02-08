'use client';

import { useState, forwardRef } from 'react';
import {
  Menu,
  Divider,
  Box,
  Typography,
  Button,
  IconButton,
  Tooltip,
  CircularProgress,
  Alert,
} from '@mui/material';
import { SxProps, Theme } from '@mui/material/styles';
import { Settings as SettingsIcon } from '@mui/icons-material';
import { useTranslations } from 'next-intl';
import { NotificationBadge } from '@/components/atoms';
import { NotificationMenuList } from '@/components/molecules';
import { Modal } from '@/components/organisms/Modal/Modal';
import { useParams } from 'next/navigation';
import { type Locale } from '@/i18n/routing';
import { UnifiedNotification } from '@/types/notification';

/**
 * NotificationMenu Component - Atomic Design: Organism
 *
 * Complete notification menu component including trigger button and dropdown menu.
 * Uses NotificationBadge atom as the trigger.
 *
 * **Use Cases**:
 * - ✅ Notification dropdown menu in AppBar
 * - ✅ Quick view of recent notifications
 * - ❌ Full-page notification management (use /notifications page instead)
 *
 * @example
 * ```tsx
 * <NotificationMenu
 *   unreadCount={5}
 *   notifications={notifications}
 *   onViewAll={() => router.push('/notifications')}
 *   onSettingsClick={() => router.push('/settings/notifications')}
 *   onNotificationClick={(notification) => console.log(notification)}
 * />
 * ```
 */

export interface NotificationMenuProps {
  /**
   * Button color
   */
  color?: 'inherit' | 'primary' | 'secondary' | 'default';
  /**
   * Icon button size
   */
  size?: 'small' | 'medium' | 'large';
  /**
   * MUI sx prop for styling
   */
  sx?: SxProps<Theme>;
  /**
   * Number of unread notifications
   */
  unreadCount?: number;
  /**
   * Array of notifications (using unified interface)
   */
  notifications?: UnifiedNotification[];
  /**
   * Maximum number of notifications to display in menu
   */
  maxDisplay?: number;
  /**
   * Whether data is loading
   */
  loading?: boolean;
  /**
   * Error object if loading failed
   */
  error?: Error | null;
  /**
   * Callback when retry button is clicked (in error state)
   */
  onRetry?: () => void;
  /**
   * Callback when a notification is clicked
   */
  onNotificationClick?: (notification: UnifiedNotification) => void;
  /**
   * Callback when mark as read is clicked
   */
  onMarkAsRead?: (id: string) => void;
  /**
   * Callback when mark all as read is clicked
   */
  onMarkAllAsRead?: () => void;
  /**
   * Callback when "Notifications" title is clicked (navigate to notification center)
   */
  onViewAll?: () => void;
  /**
   * Callback when clear all is clicked
   */
  onClearAll?: () => void;
  /**
   * Custom text for "Mark All as Read" button
   * @default Uses translation key 'components.notificationMenu.markAllAsRead'
   */
  markAllAsReadButtonText?: string;
  /**
   * Custom text for "Clear All" button
   * @default Uses translation key 'components.notificationMenu.clearAll'
   */
  clearAllButtonText?: string;
  /**
   * Show settings icon button in header
   * @default false
   */
  showSettings?: boolean;
  /**
   * Callback when settings icon is clicked
   */
  onSettingsClick?: () => void;
}

export const NotificationMenu = forwardRef<
  HTMLButtonElement,
  NotificationMenuProps
>(
  (
    {
      color = 'inherit',
      size = 'medium',
      sx,
      unreadCount = 0,
      notifications = [],
      maxDisplay = 5,
      loading = false,
      error = null,
      onRetry,
      onNotificationClick,
      onMarkAsRead,
      onMarkAllAsRead,
      onViewAll,
      onClearAll,
      markAllAsReadButtonText,
      clearAllButtonText,
      showSettings = false,
      onSettingsClick,
    },
    ref,
  ) => {
    const t = useTranslations('components.notificationMenu');
    const tNotification = useTranslations('pages.settings.notificationCenter');
    const tCommon = useTranslations('common');
    const tNotif = useTranslations('components.notification');
    const params = useParams();
    const locale = (params.locale as Locale) || 'en';

    const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
    const [markAllModalOpen, setMarkAllModalOpen] = useState(false);
    const [clearAllModalOpen, setClearAllModalOpen] = useState(false);

    const handleMenuOpen = (event: React.MouseEvent<HTMLElement>) => {
      setAnchorEl(event.currentTarget);
    };

    const handleMenuClose = () => {
      setAnchorEl(null);
    };

    const handleNotificationClick = (notification: UnifiedNotification) => {
      handleMenuClose(); // 關閉選單
      onNotificationClick?.(notification);
      if (!notification.isRead && onMarkAsRead) {
        onMarkAsRead(notification.id);
        // useNotifications hook 會自動廣播事件
      }
      // 有 actionUrl 時由 onNotificationClick 處理導航，沒有時跳轉到通知中心
      if (!notification.actionUrl && onViewAll) {
        onViewAll();
      }
    };

    const handleMarkAllAsRead = () => {
      setMarkAllModalOpen(true);
    };

    const confirmMarkAllAsRead = () => {
      setMarkAllModalOpen(false);
      onMarkAllAsRead?.();
      // useNotifications hook 會自動廣播事件
    };

    const cancelMarkAll = () => {
      setMarkAllModalOpen(false);
    };

    const handleViewAll = () => {
      handleMenuClose();
      onViewAll?.();
    };

    const handleClearAll = () => {
      setClearAllModalOpen(true);
    };

    const confirmClearAll = () => {
      setClearAllModalOpen(false);
      onClearAll?.();
      // useNotifications hook 會自動廣播事件
    };

    const cancelClearAll = () => {
      setClearAllModalOpen(false);
    };

    const hasNotifications = notifications.length > 0;

    return (
      <>
        {/* Notification Badge Button */}
        <NotificationBadge
          ref={ref}
          unreadCount={unreadCount}
          color={color}
          size={size}
          onClick={handleMenuOpen}
          tooltipTitle={t('title')}
          ariaLabel="notifications"
          ariaControls="notification-menu"
          ariaHaspopup={true}
          sx={sx}
        />

        {/* Dropdown Menu */}
        <Menu
          id="notification-menu"
          anchorEl={anchorEl}
          open={Boolean(anchorEl)}
          onClose={handleMenuClose}
          anchorOrigin={{
            vertical: 'bottom',
            horizontal: 'right',
          }}
          transformOrigin={{
            vertical: 'top',
            horizontal: 'right',
          }}
          MenuListProps={{
            'aria-labelledby': 'notification-menu-title',
            role: 'region',
            sx: { pb: 0 },
          }}
          PaperProps={{
            sx: {
              // Responsive width
              width: {
                xs: '100vw', // Mobile: full width
                sm: 360, // Small tablet: 360px
                md: 400, // Tablet+: 400px
              },
              // Responsive height
              maxHeight: {
                xs: '100vh', // Mobile: full height
                sm: 600, // Small tablet: 600px
                md: 640, // Tablet+: 640px
              },
              // Mobile fullscreen mode
              ...(typeof window !== 'undefined' &&
                window.innerWidth < 600 && {
                  position: 'fixed',
                  top: 0,
                  left: 0,
                  right: 0,
                  bottom: 0,
                  m: 0,
                  borderRadius: 0,
                }),
            },
            role: 'dialog',
            'aria-label': t('title'),
          }}
        >
          {/* Header */}
          <Box
            role="banner"
            sx={{
              px: { xs: 2, sm: 2, md: 2.5 },
              py: { xs: 1.5, sm: 1.5, md: 2 },
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              borderBottom: 1,
              borderColor: 'divider',
            }}
          >
            <Typography
              id="notification-menu-title"
              variant="h6"
              component="h2"
              onClick={onViewAll ? handleViewAll : undefined}
              sx={{
                cursor: onViewAll ? 'pointer' : 'default',
                '&:hover': onViewAll
                  ? {
                      color: 'primary.main',
                    }
                  : {},
              }}
            >
              {t('title')}
            </Typography>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              {hasNotifications && onClearAll && (
                <Button
                  size="small"
                  color="primary"
                  onClick={handleClearAll}
                  aria-label={clearAllButtonText || t('clearAll')}
                  sx={{ textTransform: 'none' }}
                >
                  {clearAllButtonText || t('clearAll')}
                </Button>
              )}
              {showSettings && onSettingsClick && (
                <Tooltip title={t('settings')}>
                  <IconButton
                    size="small"
                    onClick={() => {
                      handleMenuClose();
                      onSettingsClick();
                    }}
                    aria-label={t('settings')}
                  >
                    <SettingsIcon fontSize="small" />
                  </IconButton>
                </Tooltip>
              )}
            </Box>
          </Box>

          {/* Content: Loading / Error / Notification List */}
          <Box
            sx={{
              maxHeight: {
                xs: 'calc(100vh - 140px)', // Mobile: subtract header + footer
                sm: 480, // Small tablet: 480px
                md: 520, // Tablet+: 520px
              },
              overflowY: 'auto',
            }}
          >
            {loading ? (
              <Box
                sx={{
                  py: 6,
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  gap: 2,
                }}
              >
                <CircularProgress size={40} />
                <Typography variant="body2" color="text.secondary">
                  {tNotification('loading')}
                </Typography>
              </Box>
            ) : error ? (
              <Box sx={{ p: { xs: 2, sm: 3 } }}>
                <Alert
                  severity="error"
                  action={
                    onRetry && (
                      <Button color="inherit" size="small" onClick={onRetry}>
                        {tNotification('retry')}
                      </Button>
                    )
                  }
                >
                  {tNotification('error')}
                </Alert>
              </Box>
            ) : (
              <NotificationMenuList
                notifications={notifications}
                maxDisplay={maxDisplay}
                locale={locale}
                onNotificationClick={handleNotificationClick}
                emptyText={t('noNotifications')}
              />
            )}
          </Box>

          {/* Footer */}
          {onMarkAllAsRead && unreadCount > 0 && (
            <>
              <Divider />
              <Box
                role="contentinfo"
                sx={{
                  px: { xs: 2, sm: 2 },
                  py: { xs: 1.5, sm: 1.5 },
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <Button
                  size="small"
                  onClick={handleMarkAllAsRead}
                  aria-label={markAllAsReadButtonText || t('markAllAsRead')}
                  sx={{ textTransform: 'none' }}
                >
                  {markAllAsReadButtonText || t('markAllAsRead')}
                </Button>
              </Box>
            </>
          )}
        </Menu>

        {/* 標記全部已讀確認 Modal */}
        <Modal
          open={markAllModalOpen}
          onClose={cancelMarkAll}
          title={tNotif('confirmMarkAllReadTitle')}
          description={tNotif('confirmMarkAllRead')}
          variant="info"
          maxWidth="xs"
          actions={[
            {
              label: tCommon('cancel'),
              onClick: cancelMarkAll,
              variant: 'outlined',
            },
            {
              label: t('markAllAsRead'),
              onClick: confirmMarkAllAsRead,
              variant: 'contained',
              color: 'primary',
              autoFocus: true,
            },
          ]}
        />

        {/* 清除全部確認 Modal */}
        <Modal
          open={clearAllModalOpen}
          onClose={cancelClearAll}
          title={tNotif('confirmClearReadTitle')}
          description={tNotif('confirmClearRead')}
          variant="warning"
          maxWidth="xs"
          actions={[
            {
              label: tCommon('cancel'),
              onClick: cancelClearAll,
              variant: 'outlined',
            },
            {
              label: t('clearAll'),
              onClick: confirmClearAll,
              variant: 'contained',
              color: 'error',
              autoFocus: true,
            },
          ]}
        />
      </>
    );
  },
);

NotificationMenu.displayName = 'NotificationMenu';

export default NotificationMenu;
