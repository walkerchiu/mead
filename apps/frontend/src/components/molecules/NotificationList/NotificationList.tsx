'use client';

import { forwardRef, useState } from 'react';
import {
  Box,
  List,
  Typography,
  Tabs,
  Tab,
  IconButton,
  Tooltip,
  Paper,
} from '@mui/material';
import {
  DoneAll as MarkAllReadIcon,
  DeleteSweep as ClearAllIcon,
} from '@mui/icons-material';
import { SxProps, Theme } from '@mui/material/styles';
import { useTranslations } from 'next-intl';
import {
  NotificationItem,
  NotificationItemType,
} from '@/components/atoms/NotificationItem';
import { Progress } from '@/components/atoms';
import { UnifiedNotification } from '@/types/notification';

/**
 * NotificationList Component - Atomic Design: Molecule
 *
 * Notification list component that displays multiple notification items with filtering,
 * mark as read, and clear operations. Suitable for full-page notification center display.
 *
 * **Use Cases**:
 * - ✅ Full-page notification center (/notifications)
 * - ✅ Notification management section in settings page
 * - ❌ Dropdown menu (use NotificationMenuList instead)
 *
 * @example
 * ```tsx
 * // Basic usage (with container)
 * <NotificationList
 *   notifications={notifications}
 *   onNotificationClick={(id) => handleClick(id)}
 *   onMarkAllRead={handleMarkAllRead}
 * />
 *
 * // Usage in Card (without container)
 * <Card>
 *   <NotificationList
 *     notifications={notifications}
 *     showContainer={false}
 *     showHeader={false}
 *   />
 * </Card>
 * ```
 */

export interface NotificationListProps {
  /**
   * Notification list (using unified interface)
   */
  notifications: UnifiedNotification[];

  /**
   * Unread count (for tab display)
   */
  unreadCount?: number;

  /**
   * Whether data is loading
   */
  loading?: boolean;

  /**
   * Empty state message
   */
  emptyText?: string;

  /**
   * Notification click callback
   */
  onNotificationClick?: (id: string) => void;

  /**
   * Notification delete callback
   */
  onNotificationDelete?: (id: string) => void;

  /**
   * Mark all as read callback
   */
  onMarkAllRead?: () => void;

  /**
   * Clear read notifications callback
   */
  onClearRead?: () => void;

  /**
   * Whether to show Paper container
   * @default true
   */
  showContainer?: boolean;

  /**
   * Whether to show header (title + action buttons)
   * @default true
   */
  showHeader?: boolean;

  /**
   * Custom header title text
   * @default "Notifications"
   */
  headerTitle?: string;

  /**
   * Whether to show filter tabs (All/Unread)
   * @default true
   */
  showFilterTabs?: boolean;

  /**
   * Whether to show action buttons (Mark all read, Clear read)
   * @default true
   */
  showActions?: boolean;

  /**
   * Whether to show delete button on each notification item
   * @default true
   */
  showDeleteButton?: boolean;

  /**
   * Maximum height (scrollbar appears when exceeded)
   */
  maxHeight?: number | string;

  /**
   * Custom styles
   */
  sx?: SxProps<Theme>;
}

export const NotificationList = forwardRef<
  HTMLDivElement,
  NotificationListProps
>(
  (
    {
      notifications,
      unreadCount,
      loading = false,
      emptyText,
      onNotificationClick,
      onNotificationDelete,
      onMarkAllRead,
      onClearRead,
      showContainer = true,
      showHeader = true,
      headerTitle,
      showFilterTabs = true,
      showActions = true,
      showDeleteButton = true,
      maxHeight = 500,
      sx,
    },
    ref,
  ) => {
    const t = useTranslations('pages.settings.notificationCenter');
    const [filterTab, setFilterTab] = useState<'all' | 'unread' | 'read'>(
      'all',
    );

    // Use translations as default values
    const displayEmptyText = emptyText ?? t('empty.title');
    const displayHeaderTitle = headerTitle ?? t('title');

    // Filter notifications based on the filter tab
    const filteredNotifications = notifications.filter((notification) => {
      if (filterTab === 'unread') {
        return !notification.isRead;
      }
      if (filterTab === 'read') {
        return notification.isRead;
      }
      return true;
    });

    // Calculate display counts based on actual notifications array
    const actualUnreadCount = notifications.filter((n) => !n.isRead).length;
    const actualReadCount = notifications.filter((n) => n.isRead).length;

    // Use provided unreadCount if available, otherwise calculate from array
    const displayUnreadCount = unreadCount ?? actualUnreadCount;
    const displayReadCount = actualReadCount;
    const hasUnread = actualUnreadCount > 0;
    const hasRead = actualReadCount > 0;

    // Handle tab change
    const handleTabChange = (
      _event: React.SyntheticEvent,
      newValue: 'all' | 'unread' | 'read',
    ) => {
      setFilterTab(newValue);
    };

    // Handle notification click
    const handleNotificationClick = (id: string) => {
      onNotificationClick?.(id);
    };

    // Handle notification delete
    const handleNotificationDelete = (id: string) => {
      onNotificationDelete?.(id);
    };

    // Render content
    const renderContent = () => {
      // Loading state
      if (loading) {
        return (
          <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
            <Progress type="circular" />
          </Box>
        );
      }

      // Normal state - always show header and tabs
      return (
        <>
          {/* Title and Actions */}
          {showHeader && (
            <Box
              sx={{
                px: 2,
                pt: 2,
                pb: 1,
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
              }}
            >
              <Typography variant="h6" component="h2">
                {displayHeaderTitle}
              </Typography>

              {showActions && (
                <Box sx={{ display: 'flex', gap: 0.5 }}>
                  {hasUnread && onMarkAllRead && (
                    <Tooltip title={t('actions.markAllAsRead')}>
                      <IconButton size="small" onClick={onMarkAllRead}>
                        <MarkAllReadIcon fontSize="small" />
                      </IconButton>
                    </Tooltip>
                  )}
                  {hasRead && onClearRead && (
                    <Tooltip title={t('actions.clearAll')}>
                      <IconButton size="small" onClick={onClearRead}>
                        <ClearAllIcon fontSize="small" />
                      </IconButton>
                    </Tooltip>
                  )}
                </Box>
              )}
            </Box>
          )}

          {/* Filter Tabs - Always show */}
          {showFilterTabs && (
            <Box sx={{ px: 2, borderBottom: 1, borderColor: 'divider' }}>
              <Tabs
                value={filterTab}
                onChange={handleTabChange}
                aria-label="Notification filter"
              >
                <Tab
                  value="all"
                  label={`${t('filters.all')} (${notifications.length})`}
                  sx={{ textTransform: 'none' }}
                />
                <Tab
                  value="unread"
                  label={`${t('filters.unread')} (${displayUnreadCount})`}
                  sx={{ textTransform: 'none' }}
                />
                <Tab
                  value="read"
                  label={`${t('filters.read')} (${displayReadCount})`}
                  sx={{ textTransform: 'none' }}
                />
              </Tabs>
            </Box>
          )}

          {/* Empty state - show in content area */}
          {notifications.length === 0 ? (
            <Box sx={{ p: 4, textAlign: 'center' }}>
              <Typography variant="body1" color="text.secondary">
                {displayEmptyText}
              </Typography>
              <Typography variant="body2" color="text.disabled" sx={{ mt: 1 }}>
                {t('empty.description')}
              </Typography>
            </Box>
          ) : (
            /* Notification List */
            <List
              role="feed"
              aria-label={displayHeaderTitle}
              aria-busy={loading}
              sx={{
                p: 0,
                maxHeight,
                overflowY: 'auto',
                '&::-webkit-scrollbar': {
                  width: '8px',
                },
                '&::-webkit-scrollbar-track': {
                  backgroundColor: 'transparent',
                },
                '&::-webkit-scrollbar-thumb': {
                  backgroundColor: 'rgba(0, 0, 0, 0.2)',
                  borderRadius: '4px',
                  '&:hover': {
                    backgroundColor: 'rgba(0, 0, 0, 0.3)',
                  },
                },
              }}
            >
              {filteredNotifications.length === 0 ? (
                <Box sx={{ p: 4, textAlign: 'center' }}>
                  <Typography color="text.secondary">
                    {filterTab === 'unread'
                      ? t('empty.title')
                      : displayEmptyText}
                  </Typography>
                </Box>
              ) : (
                filteredNotifications.map((notification) => (
                  <NotificationItem
                    key={notification.id}
                    type={notification.type as NotificationItemType}
                    title={notification.title}
                    message={notification.message}
                    isRead={notification.isRead}
                    createdAt={notification.createdAt}
                    onClick={() => handleNotificationClick(notification.id)}
                    onDelete={
                      showDeleteButton
                        ? () => handleNotificationDelete(notification.id)
                        : undefined
                    }
                    showDelete={showDeleteButton}
                  />
                ))
              )}
            </List>
          )}
        </>
      );
    };

    // Return different container based on showContainer
    if (showContainer) {
      return (
        <Paper elevation={2} ref={ref} sx={{ width: '100%', ...sx }}>
          {renderContent()}
        </Paper>
      );
    }

    return (
      <Box ref={ref} sx={{ width: '100%', ...sx }}>
        {renderContent()}
      </Box>
    );
  },
);

NotificationList.displayName = 'NotificationList';

export default NotificationList;
