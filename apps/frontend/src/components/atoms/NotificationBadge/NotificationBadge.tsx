'use client';

import { forwardRef } from 'react';
import { IconButton, Tooltip } from '@mui/material';
import { Notifications as NotificationsIcon } from '@mui/icons-material';
import { SxProps, Theme } from '@mui/material/styles';
import { Badge } from '@/components/atoms';

/**
 * NotificationBadge Component - Atomic Design: Atom
 *
 * Notification badge button that displays a bell icon with unread count badge.
 *
 * @example
 * ```tsx
 * <NotificationBadge
 *   unreadCount={5}
 *   onClick={() => console.log('clicked')}
 *   color="inherit"
 *   size="medium"
 * />
 * ```
 */

export interface NotificationBadgeProps {
  /**
   * Unread notification count
   * @default 0
   */
  unreadCount?: number;

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
   * Click callback
   */
  onClick?: (event: React.MouseEvent<HTMLElement>) => void;

  /**
   * Tooltip text
   * @default 'Notifications'
   */
  tooltipTitle?: string;

  /**
   * aria-label
   * @default 'notifications'
   */
  ariaLabel?: string;

  /**
   * aria-controls
   */
  ariaControls?: string;

  /**
   * aria-haspopup
   * @default true
   */
  ariaHaspopup?: boolean;

  /**
   * Custom styles
   */
  sx?: SxProps<Theme>;
}

export const NotificationBadge = forwardRef<
  HTMLButtonElement,
  NotificationBadgeProps
>(
  (
    {
      unreadCount = 0,
      color = 'inherit',
      size = 'medium',
      onClick,
      tooltipTitle = 'Notifications',
      ariaLabel = 'notifications',
      ariaControls,
      ariaHaspopup = true,
      sx,
    },
    ref,
  ) => {
    return (
      <Tooltip title={tooltipTitle}>
        <IconButton
          ref={ref}
          onClick={onClick}
          color={color}
          size={size}
          aria-label={ariaLabel}
          aria-controls={ariaControls}
          aria-haspopup={ariaHaspopup}
          sx={sx}
        >
          <Badge badgeContent={unreadCount} color="error" max={99}>
            <NotificationsIcon />
          </Badge>
        </IconButton>
      </Tooltip>
    );
  },
);

NotificationBadge.displayName = 'NotificationBadge';

export default NotificationBadge;
