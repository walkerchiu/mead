'use client';

import { forwardRef, useCallback } from 'react';
import { SxProps, Theme } from '@mui/material/styles';
import { NotificationMenu } from '@/components/organisms/NotificationMenu';
import { useNotifications } from '@/hooks/useNotifications';
import {
  fromGraphQLNotification,
  UnifiedNotification,
} from '@/types/notification';

/**
 * NotificationCenter Component - Atomic Design: Organism
 *
 * Complete notification center component that integrates GraphQL real-time notification subscriptions.
 * Uses NotificationMenu organism component to provide UI, and integrates backend data and state management.
 *
 * **Responsibilities**:
 * - Integrate GraphQL data source (useNotifications hook)
 * - Convert data format to unified interface
 * - Provide real-time subscription functionality
 * - Delegate UI rendering to NotificationMenu
 *
 * @example
 * ```tsx
 * <NotificationCenter
 *   color="inherit"
 *   onViewAll={() => router.push('/notifications')}
 *   onSettingsClick={() => router.push('/settings/notifications')}
 * />
 * ```
 */

export interface NotificationCenterProps {
  /**
   * Button color
   * @default 'inherit'
   */
  color?: 'inherit' | 'primary' | 'secondary' | 'default';

  /**
   * Icon button size
   * @default 'medium'
   */
  size?: 'small' | 'medium' | 'large';

  /**
   * Auto subscribe to real-time notifications
   * @default true
   */
  autoSubscribe?: boolean;

  /**
   * Click title "Notifications" or view all notifications callback
   */
  onViewAll?: () => void;

  /**
   * Settings button click callback
   */
  onSettingsClick?: () => void;

  /**
   * Notification click callback (returns notification ID)
   */
  onNotificationClick?: (id: string) => void;

  /**
   * Show settings button
   * @default true
   */
  showSettings?: boolean;

  /**
   * Maximum number of notifications to display
   * @default 5
   */
  maxDisplay?: number;

  /**
   * Custom styles
   */
  sx?: SxProps<Theme>;
}

export const NotificationCenter = forwardRef<
  HTMLButtonElement,
  NotificationCenterProps
>(
  (
    {
      color = 'inherit',
      size = 'medium',
      autoSubscribe = true,
      onViewAll,
      onSettingsClick,
      onNotificationClick,
      showSettings = true,
      maxDisplay = 5,
      sx,
    },
    ref,
  ) => {
    // Use useNotifications hook to integrate GraphQL
    const {
      notifications: gqlNotifications,
      unreadCount,
      loading,
      error,
      markAsRead,
      markAllAsRead,
      deleteReadNotifications,
      refetch,
    } = useNotifications({
      autoSubscribe,
      limit: 20,
    });

    // Convert notification format to unified interface
    const notifications = gqlNotifications.map(fromGraphQLNotification);

    // Handle notification click
    const handleNotificationClick = useCallback(
      (notification: UnifiedNotification) => {
        // If unread, mark as read
        if (!notification.isRead) {
          markAsRead(notification.id);
        }

        // Trigger external callback
        onNotificationClick?.(notification.id);
      },
      [markAsRead, onNotificationClick],
    );

    // Handle mark as read
    const handleMarkAsRead = useCallback(
      (id: string) => {
        markAsRead(id);
      },
      [markAsRead],
    );

    // Handle mark all as read
    const handleMarkAllAsRead = useCallback(() => {
      markAllAsRead();
    }, [markAllAsRead]);

    // Handle clear all notifications
    const handleClearAll = useCallback(() => {
      deleteReadNotifications();
    }, [deleteReadNotifications]);

    return (
      <NotificationMenu
        ref={ref}
        color={color}
        size={size}
        sx={sx}
        unreadCount={unreadCount}
        notifications={notifications}
        maxDisplay={maxDisplay}
        loading={loading}
        error={error}
        onRetry={refetch}
        onNotificationClick={handleNotificationClick}
        onMarkAsRead={handleMarkAsRead}
        onMarkAllAsRead={handleMarkAllAsRead}
        onViewAll={onViewAll}
        onClearAll={handleClearAll}
        showSettings={showSettings}
        onSettingsClick={onSettingsClick}
      />
    );
  },
);

NotificationCenter.displayName = 'NotificationCenter';

export default NotificationCenter;
