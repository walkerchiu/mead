'use client';

import { useState } from 'react';
import {
  IconButton,
  Menu,
  MenuItem,
  ListItemIcon,
  Divider,
  Box,
  Typography,
  Button,
  Tooltip,
} from '@mui/material';
import { SxProps, Theme } from '@mui/material/styles';
import {
  Notifications as NotificationsIcon,
  Info as InfoIcon,
  CheckCircle as CheckCircleIcon,
  Warning as WarningIcon,
  Error as ErrorIcon,
  Settings as SettingsIcon,
} from '@mui/icons-material';
import { useTranslations } from 'next-intl';
import { Badge } from '@/components/atoms';
import { formatDistanceToNow } from 'date-fns';
import { zhTW, enUS } from 'date-fns/locale';
import { useParams } from 'next/navigation';
import { type Locale } from '@/i18n/routing';

export interface Notification {
  id: string;
  type: 'info' | 'success' | 'warning' | 'error' | 'system';
  title: string;
  message: string;
  timestamp: Date;
  read: boolean;
  actionUrl?: string;
  avatar?: string;
}

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
   * Array of notifications
   */
  notifications?: Notification[];
  /**
   * Maximum number of notifications to display in menu
   */
  maxDisplay?: number;
  /**
   * Callback when a notification is clicked
   */
  onNotificationClick?: (notification: Notification) => void;
  /**
   * Callback when mark as read is clicked
   */
  onMarkAsRead?: (id: string) => void;
  /**
   * Callback when mark all as read is clicked
   */
  onMarkAllAsRead?: () => void;
  /**
   * Callback when view all is clicked
   */
  onViewAll?: () => void;
  /**
   * Callback when clear all is clicked
   */
  onClearAll?: () => void;
}

const notificationIcons = {
  info: InfoIcon,
  success: CheckCircleIcon,
  warning: WarningIcon,
  error: ErrorIcon,
  system: SettingsIcon,
};

const notificationColors = {
  info: 'info.main',
  success: 'success.main',
  warning: 'warning.main',
  error: 'error.main',
  system: 'grey.600',
};

/**
 * Notification menu component that displays a bell icon with badge
 * and shows a dropdown menu with notifications.
 */
export function NotificationMenu({
  color = 'inherit',
  size = 'medium',
  sx,
  unreadCount = 0,
  notifications = [],
  maxDisplay = 5,
  onNotificationClick,
  onMarkAsRead,
  onMarkAllAsRead,
  onViewAll,
  onClearAll,
}: NotificationMenuProps) {
  const t = useTranslations('components.notificationMenu');
  const params = useParams();
  const locale = (params.locale as Locale) || 'en';
  const dateLocale = locale === 'zh-TW' ? zhTW : enUS;

  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);

  const handleMenuOpen = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  const handleNotificationClick = (notification: Notification) => {
    onNotificationClick?.(notification);
    if (!notification.read && onMarkAsRead) {
      onMarkAsRead(notification.id);
    }
  };

  const handleMarkAllAsRead = () => {
    onMarkAllAsRead?.();
  };

  const handleViewAll = () => {
    handleMenuClose();
    onViewAll?.();
  };

  const handleClearAll = () => {
    onClearAll?.();
  };

  const displayedNotifications = notifications.slice(0, maxDisplay);
  const hasNotifications = notifications.length > 0;

  const formatTimeAgo = (date: Date) => {
    try {
      return formatDistanceToNow(date, {
        addSuffix: true,
        locale: dateLocale,
      });
    } catch {
      return '';
    }
  };

  return (
    <>
      <Tooltip title={t('title')}>
        <IconButton
          onClick={handleMenuOpen}
          color={color}
          size={size}
          aria-label="notifications"
          aria-controls="notification-menu"
          aria-haspopup="true"
          sx={sx}
        >
          <Badge badgeContent={unreadCount} color="error" max={99}>
            <NotificationsIcon />
          </Badge>
        </IconButton>
      </Tooltip>

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
        PaperProps={{
          sx: {
            minWidth: 360,
            maxWidth: 400,
            maxHeight: 500,
          },
        }}
      >
        {/* Header */}
        <Box
          sx={{
            px: 2,
            py: 1.5,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            borderBottom: 1,
            borderColor: 'divider',
          }}
        >
          <Typography variant="h6" component="div">
            {t('title')}
          </Typography>
          {hasNotifications && onClearAll && (
            <Button
              size="small"
              color="primary"
              onClick={handleClearAll}
              sx={{ textTransform: 'none' }}
            >
              {t('clearAll')}
            </Button>
          )}
        </Box>

        {/* Notification List */}
        {hasNotifications ? (
          <>
            {displayedNotifications.map((notification) => {
              const IconComponent = notificationIcons[notification.type];
              const iconColor = notificationColors[notification.type];

              return (
                <MenuItem
                  key={notification.id}
                  onClick={() => handleNotificationClick(notification)}
                  sx={{
                    py: 1.5,
                    px: 2,
                    alignItems: 'flex-start',
                    backgroundColor: notification.read
                      ? 'transparent'
                      : 'action.hover',
                    '&:hover': {
                      backgroundColor: notification.read
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
                        fontWeight: notification.read ? 400 : 600,
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
                      {formatTimeAgo(notification.timestamp)}
                    </Typography>
                  </Box>
                  {!notification.read && (
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
          </>
        ) : (
          <Box
            sx={{
              py: 6,
              px: 3,
              textAlign: 'center',
            }}
          >
            <NotificationsIcon
              sx={{ fontSize: 48, color: 'text.disabled', mb: 2 }}
            />
            <Typography variant="body2" color="text.secondary">
              {t('noNotifications')}
            </Typography>
          </Box>
        )}

        {/* Footer */}
        {hasNotifications && (
          <>
            <Divider />
            <Box
              sx={{
                px: 2,
                py: 1,
                display: 'flex',
                gap: 1,
                justifyContent: 'space-between',
              }}
            >
              {onMarkAllAsRead && unreadCount > 0 && (
                <Button
                  size="small"
                  onClick={handleMarkAllAsRead}
                  sx={{ textTransform: 'none', flex: 1 }}
                >
                  {t('markAllAsRead')}
                </Button>
              )}
              {onViewAll && (
                <Button
                  size="small"
                  variant="contained"
                  onClick={handleViewAll}
                  sx={{ textTransform: 'none', flex: 1 }}
                >
                  {t('viewAll')}
                </Button>
              )}
            </Box>
          </>
        )}
      </Menu>
    </>
  );
}
