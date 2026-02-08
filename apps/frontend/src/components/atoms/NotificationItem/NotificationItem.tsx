'use client';

import { forwardRef, useCallback, memo } from 'react';
import {
  ListItem,
  ListItemButton,
  ListItemText,
  ListItemIcon,
  ListItemAvatar,
  Avatar,
  IconButton,
  Typography,
  Box,
} from '@mui/material';
import {
  Info as InfoIcon,
  Warning as WarningIcon,
  CheckCircle as SuccessIcon,
  Error as ErrorIcon,
  Close as CloseIcon,
  Circle as UnreadIcon,
} from '@mui/icons-material';
import { formatDistanceToNow } from 'date-fns';
import { enUS, zhTW } from 'date-fns/locale';
import { useLocale, useTranslations } from 'next-intl';

/**
 * NotificationItem Component - Atomic Design: Atom
 *
 * Single notification item that displays the title, content, time, and status.
 *
 * @example
 * ```tsx
 * <NotificationItem
 *   type="SUCCESS"
 *   title="Operation Successful"
 *   message="Your data has been updated"
 *   isRead={false}
 *   createdAt={new Date().toISOString()}
 *   onClick={() => console.log('clicked')}
 *   onDelete={() => console.log('deleted')}
 * />
 * ```
 */

export type NotificationItemType = 'INFO' | 'WARNING' | 'SUCCESS' | 'ERROR';

export interface NotificationItemProps {
  /**
   * Notification type
   */
  type: NotificationItemType;

  /**
   * Notification title
   */
  title: string;

  /**
   * Notification message
   */
  message: string;

  /**
   * Whether the notification has been read
   */
  isRead: boolean;

  /**
   * Creation time (ISO string)
   */
  createdAt: string;

  /**
   * Click event handler
   */
  onClick?: () => void;

  /**
   * Delete event handler
   */
  onDelete?: () => void;

  /**
   * Whether to show delete button
   * @default true
   */
  showDelete?: boolean;

  /**
   * Avatar URL for the notification
   * If provided, displays an avatar instead of the type icon
   */
  avatar?: string;
}

/**
 * Get the icon for the notification type
 */
const getTypeIcon = (type: NotificationItemType) => {
  switch (type) {
    case 'INFO':
      return <InfoIcon color="info" />;
    case 'WARNING':
      return <WarningIcon color="warning" />;
    case 'SUCCESS':
      return <SuccessIcon color="success" />;
    case 'ERROR':
      return <ErrorIcon color="error" />;
    default:
      return <InfoIcon />;
  }
};

/**
 * Get the color for the notification type
 */
const getTypeColor = (type: NotificationItemType): string => {
  switch (type) {
    case 'INFO':
      return 'info.main';
    case 'WARNING':
      return 'warning.main';
    case 'SUCCESS':
      return 'success.main';
    case 'ERROR':
      return 'error.main';
    default:
      return 'text.secondary';
  }
};

const NotificationItemComponent = forwardRef<
  HTMLLIElement,
  NotificationItemProps
>(
  (
    {
      type,
      title,
      message,
      isRead,
      createdAt,
      onClick,
      onDelete,
      showDelete = true,
      avatar,
    },
    ref,
  ) => {
    const currentLocale = useLocale();
    const t = useTranslations('components.notification');

    // Use dynamic locale based on current language
    const dateFnsLocale = currentLocale === 'zh-TW' ? zhTW : enUS;

    // Format relative time with dynamic locale
    const relativeTime = formatDistanceToNow(new Date(createdAt), {
      addSuffix: true,
      locale: dateFnsLocale,
    });

    // Keyboard event handlers
    const handleKeyDown = useCallback(
      (e: React.KeyboardEvent) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          onClick?.();
        }
      },
      [onClick],
    );

    const handleDeleteKeyDown = useCallback(
      (e: React.KeyboardEvent) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          e.stopPropagation();
          onDelete?.();
        }
      },
      [onDelete],
    );

    // Generate unique IDs for ARIA
    const notificationId = `notification-${createdAt}`;
    const messageId = `${notificationId}-message`;

    return (
      <ListItem
        ref={ref}
        disablePadding
        role="article"
        aria-labelledby={`${notificationId}-title`}
        aria-describedby={messageId}
        sx={{
          bgcolor: isRead ? 'transparent' : 'action.hover',
          borderLeft: 3,
          borderColor: getTypeColor(type),
          transition: 'opacity 0.3s ease',
          opacity: isRead ? 0.7 : 1,
        }}
        secondaryAction={
          showDelete && onDelete ? (
            <IconButton
              edge="end"
              aria-label={t('delete')}
              onClick={(e) => {
                e.stopPropagation();
                onDelete();
              }}
              onKeyDown={handleDeleteKeyDown}
              size="small"
              tabIndex={0}
            >
              <CloseIcon fontSize="small" />
            </IconButton>
          ) : null
        }
      >
        <ListItemButton
          onClick={onClick}
          onKeyDown={handleKeyDown}
          tabIndex={0}
          aria-pressed={isRead}
          sx={{
            pr: showDelete ? 6 : 2,
            '&:focus': {
              outline: '2px solid',
              outlineColor: 'primary.main',
              outlineOffset: '-2px',
            },
            '&:focus-visible': {
              outline: '2px solid',
              outlineColor: 'primary.main',
              outlineOffset: '-2px',
            },
          }}
        >
          {avatar ? (
            <ListItemAvatar>
              <Avatar src={avatar} alt={title} sx={{ width: 40, height: 40 }} />
            </ListItemAvatar>
          ) : (
            <ListItemIcon sx={{ minWidth: 40 }} aria-hidden="true">
              {getTypeIcon(type)}
            </ListItemIcon>
          )}
          <ListItemText
            primary={
              <Box display="flex" alignItems="center" gap={1}>
                {!isRead && (
                  <Box
                    component="span"
                    role="status"
                    aria-label={t('new')}
                    sx={{ display: 'flex', alignItems: 'center' }}
                  >
                    <UnreadIcon sx={{ fontSize: 8, color: 'primary.main' }} />
                  </Box>
                )}
                <Typography
                  id={`${notificationId}-title`}
                  variant="subtitle2"
                  fontWeight={isRead ? 'normal' : 'bold'}
                  component="h3"
                >
                  {title}
                </Typography>
              </Box>
            }
            secondary={
              <>
                <Typography
                  id={messageId}
                  component="span"
                  variant="body2"
                  color="text.primary"
                  sx={{
                    display: 'block',
                    mb: 0.5,
                  }}
                >
                  {message}
                </Typography>
                <Typography
                  component="time"
                  variant="caption"
                  color="text.secondary"
                  dateTime={createdAt}
                >
                  {relativeTime}
                </Typography>
              </>
            }
          />
        </ListItemButton>
      </ListItem>
    );
  },
);

NotificationItemComponent.displayName = 'NotificationItemComponent';

/**
 * Memoized NotificationItem for performance optimization
 * Only re-renders when key props change
 */
export const NotificationItem = memo(
  NotificationItemComponent,
  (prevProps, nextProps) => {
    // Custom comparison function for optimization
    // Return true if props are equal (skip re-render)
    // Return false if props are different (do re-render)
    return (
      prevProps.type === nextProps.type &&
      prevProps.title === nextProps.title &&
      prevProps.message === nextProps.message &&
      prevProps.isRead === nextProps.isRead &&
      prevProps.createdAt === nextProps.createdAt &&
      prevProps.showDelete === nextProps.showDelete &&
      prevProps.avatar === nextProps.avatar
      // Note: We don't compare onClick and onDelete as they're callbacks
      // and should be memoized by the parent component
    );
  },
);

NotificationItem.displayName = 'NotificationItem';

export default NotificationItem;
