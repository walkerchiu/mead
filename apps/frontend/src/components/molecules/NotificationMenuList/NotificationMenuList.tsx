'use client';

import { forwardRef } from 'react';
import {
  MenuItem,
  ListItemIcon,
  Box,
  Typography,
  SxProps,
  Theme,
} from '@mui/material';
import {
  Info as InfoIcon,
  CheckCircle as CheckCircleIcon,
  Warning as WarningIcon,
  Error as ErrorIcon,
  Settings as SettingsIcon,
  Notifications as NotificationsIcon,
} from '@mui/icons-material';
import { formatDistanceToNow } from 'date-fns';
import { zhTW, enUS } from 'date-fns/locale';
import { UnifiedNotification } from '@/types/notification';

/**
 * NotificationMenuList Component - Atomic Design: Molecule
 *
 * Notification list component designed for dropdown menus, using MenuItem to display notifications.
 * This component composes multiple MenuItems (similar to Atoms) to build a notification list.
 *
 * **Use Cases**:
 * - ✅ NotificationMenu dropdown
 * - ✅ Notification list in other Menu/Popover components
 * - ❌ Full-page notification center (use NotificationList instead)
 *
 * @example
 * ```tsx
 * <NotificationMenuList
 *   notifications={notifications}
 *   maxDisplay={5}
 *   locale="en"
 *   onNotificationClick={(notification) => console.log(notification)}
 * />
 * ```
 */

export interface NotificationMenuListProps {
  /**
   * Notification list (using unified interface)
   */
  notifications: UnifiedNotification[];

  /**
   * Maximum number to display
   * @default 5
   */
  maxDisplay?: number;

  /**
   * Locale code (for date formatting)
   * @default 'en'
   */
  locale?: 'en' | 'zh-TW';

  /**
   * Notification click callback
   */
  onNotificationClick?: (notification: UnifiedNotification) => void;

  /**
   * Empty state text
   * @default 'No notifications'
   */
  emptyText?: string;

  /**
   * Empty state icon size
   * @default 48
   */
  emptyIconSize?: number;

  /**
   * Custom styles
   */
  sx?: SxProps<Theme>;
}

const notificationIcons: Record<string, typeof InfoIcon> = {
  INFO: InfoIcon,
  SUCCESS: CheckCircleIcon,
  WARNING: WarningIcon,
  ERROR: ErrorIcon,
  SYSTEM: SettingsIcon,
};

const notificationColors: Record<string, string> = {
  INFO: 'info.main',
  SUCCESS: 'success.main',
  WARNING: 'warning.main',
  ERROR: 'error.main',
  SYSTEM: 'grey.600',
};

export const NotificationMenuList = forwardRef<
  HTMLDivElement,
  NotificationMenuListProps
>(
  (
    {
      notifications,
      maxDisplay = 5,
      locale = 'en',
      onNotificationClick,
      emptyText = 'No notifications',
      emptyIconSize = 48,
      sx,
    },
    ref,
  ) => {
    const dateLocale = locale === 'zh-TW' ? zhTW : enUS;

    const handleNotificationClick = (notification: UnifiedNotification) => {
      onNotificationClick?.(notification);
    };

    const formatTimeAgo = (dateString: string) => {
      try {
        const date = new Date(dateString);
        return formatDistanceToNow(date, {
          addSuffix: true,
          locale: dateLocale,
        });
      } catch {
        return '';
      }
    };

    const displayedNotifications = notifications.slice(0, maxDisplay);
    const hasNotifications = notifications.length > 0;

    // Empty state
    if (!hasNotifications) {
      return (
        <Box
          ref={ref}
          sx={{
            py: 6,
            px: 3,
            textAlign: 'center',
            ...sx,
          }}
        >
          <NotificationsIcon
            sx={{ fontSize: emptyIconSize, color: 'text.disabled', mb: 2 }}
          />
          <Typography variant="body2" color="text.secondary">
            {emptyText}
          </Typography>
        </Box>
      );
    }

    // Notification list
    return (
      <Box ref={ref} sx={sx}>
        {displayedNotifications.map((notification) => {
          const notificationType = String(notification.type);
          const IconComponent = notificationIcons[notificationType] || InfoIcon;
          const iconColor = notificationColors[notificationType] || 'grey.600';

          return (
            <MenuItem
              key={notification.id}
              onClick={() => handleNotificationClick(notification)}
              sx={{
                py: 1.5,
                px: 2,
                alignItems: 'flex-start',
                backgroundColor: notification.isRead
                  ? 'transparent'
                  : 'action.hover',
                '&:hover': {
                  backgroundColor: notification.isRead
                    ? 'action.hover'
                    : 'action.selected',
                },
              }}
            >
              <ListItemIcon sx={{ mt: 0.5, minWidth: 40 }}>
                <IconComponent sx={{ color: iconColor }} fontSize="small" />
              </ListItemIcon>
              <Box sx={{ flex: 1, minWidth: 0 }}>
                <Typography
                  variant="body2"
                  sx={{
                    fontWeight: notification.isRead ? 400 : 600,
                    mb: 0.5,
                  }}
                >
                  {notification.title}
                </Typography>
                <Typography
                  variant="body2"
                  color="text.secondary"
                  sx={{
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    display: '-webkit-box',
                    WebkitLineClamp: 2,
                    WebkitBoxOrient: 'vertical',
                    mb: 0.5,
                  }}
                >
                  {notification.message}
                </Typography>
                <Typography variant="caption" color="text.disabled">
                  {formatTimeAgo(notification.createdAt)}
                </Typography>
              </Box>
              {!notification.isRead && (
                <Box
                  sx={{
                    width: 8,
                    height: 8,
                    borderRadius: '50%',
                    backgroundColor: 'primary.main',
                    ml: 1,
                    mt: 1,
                    flexShrink: 0,
                  }}
                />
              )}
            </MenuItem>
          );
        })}
      </Box>
    );
  },
);

NotificationMenuList.displayName = 'NotificationMenuList';

export default NotificationMenuList;
