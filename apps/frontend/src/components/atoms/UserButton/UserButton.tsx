'use client';

import { forwardRef } from 'react';
import { IconButton, Button, Tooltip } from '@mui/material';
import {
  AccountCircle as AccountCircleIcon,
  ExpandMore as ExpandMoreIcon,
} from '@mui/icons-material';
import { SxProps, Theme } from '@mui/material/styles';
import { Avatar, Badge } from '@/components/atoms';

/**
 * UserButton Component - Atomic Design: Atom
 *
 * User button that displays avatar or icon, with optional user name display.
 * Used as a button to trigger user menu (similar to NotificationBadge).
 *
 * @example
 * ```tsx
 * // Icon only mode
 * <UserButton
 *   user={{ name: 'John Doe', avatar: '/avatar.jpg' }}
 *   onClick={handleClick}
 * />
 *
 * // With name mode
 * <UserButton
 *   user={{ name: 'John Doe' }}
 *   showName
 *   onClick={handleClick}
 * />
 *
 * // Simple icon mode
 * <UserButton
 *   user={{ name: 'John Doe' }}
 *   iconMode
 *   onClick={handleClick}
 * />
 * ```
 */

const statusColors = {
  online: 'success',
  away: 'warning',
  busy: 'error',
  offline: 'default',
} as const;

const getInitials = (name: string): string => {
  if (!name) return 'U';
  const parts = name.trim().split(/\s+/);
  if (parts.length === 1) {
    return parts[0].charAt(0).toUpperCase();
  }
  return (parts[0].charAt(0) + parts[parts.length - 1].charAt(0)).toUpperCase();
};

export interface UserButtonProps {
  /**
   * User information
   */
  user: {
    name: string;
    avatar?: string;
    status?: 'online' | 'away' | 'busy' | 'offline';
  };

  /**
   * Button color
   * @default 'inherit'
   */
  color?:
    | 'inherit'
    | 'primary'
    | 'secondary'
    | 'success'
    | 'error'
    | 'info'
    | 'warning';

  /**
   * Icon button size
   * @default 'medium'
   */
  size?: 'small' | 'medium' | 'large';

  /**
   * Whether to display user name
   * @default false
   */
  showName?: boolean;

  /**
   * Whether to display online status indicator
   * @default false
   */
  showStatus?: boolean;

  /**
   * Use simple icon instead of avatar (unified icon layout)
   * @default false
   */
  iconMode?: boolean;

  /**
   * Click callback
   */
  onClick?: (event: React.MouseEvent<HTMLElement>) => void;

  /**
   * Tooltip text
   * @default 'User menu'
   */
  tooltipTitle?: string;

  /**
   * aria-label
   * @default 'user menu'
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

export const UserButton = forwardRef<HTMLButtonElement, UserButtonProps>(
  (
    {
      user,
      color = 'inherit',
      size = 'medium',
      showName = false,
      showStatus = false,
      iconMode = false,
      onClick,
      tooltipTitle = 'User menu',
      ariaLabel = 'user menu',
      ariaControls,
      ariaHaspopup = true,
      sx,
    },
    ref,
  ) => {
    // Simple icon element
    const iconElement = <AccountCircleIcon />;

    // Avatar element (with badge)
    const avatarElement = (
      <Badge
        overlap="circular"
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
        variant="dot"
        color={showStatus ? statusColors[user.status || 'offline'] : undefined}
        invisible={!showStatus}
      >
        <Avatar
          src={user.avatar}
          size={size === 'large' ? 40 : size === 'medium' ? 32 : 24}
        >
          {getInitials(user.name)}
        </Avatar>
      </Badge>
    );

    // Select display element
    const displayElement = iconMode ? iconElement : avatarElement;

    // If showing name, use Button
    if (showName && !iconMode) {
      return (
        <Tooltip title={tooltipTitle}>
          <Button
            ref={ref}
            onClick={onClick}
            color={color}
            size={size}
            startIcon={displayElement}
            endIcon={<ExpandMoreIcon />}
            aria-label={ariaLabel}
            aria-controls={ariaControls}
            aria-haspopup={ariaHaspopup}
            sx={{
              textTransform: 'none',
              gap: 1,
              ...sx,
            }}
          >
            {user.name}
          </Button>
        </Tooltip>
      );
    }

    // Otherwise use IconButton
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
          {displayElement}
        </IconButton>
      </Tooltip>
    );
  },
);

UserButton.displayName = 'UserButton';

export default UserButton;
