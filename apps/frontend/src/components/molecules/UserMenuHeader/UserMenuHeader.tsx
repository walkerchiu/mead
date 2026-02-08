import { forwardRef } from 'react';
import { Box, Typography } from '@mui/material';
import { SxProps, Theme } from '@mui/material/styles';
import { Avatar, Badge } from '@/components/atoms';

/**
 * UserMenuHeader Component - Atomic Design: Molecule
 *
 * User menu header that displays avatar, name, email, and role label.
 *
 * @example
 * ```tsx
 * <UserMenuHeader
 *   user={{
 *     name: 'John Doe',
 *     email: 'john@example.com',
 *     avatar: '/avatar.jpg',
 *     role: 'HQ',
 *     status: 'online'
 *   }}
 *   showEmail
 *   showRole
 *   showStatus
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

export interface UserMenuHeaderProps {
  /**
   * User information
   */
  user: {
    name: string;
    email?: string;
    avatar?: string;
    role?: string;
    status?: 'online' | 'away' | 'busy' | 'offline';
  };

  /**
   * Show email
   * @default true
   */
  showEmail?: boolean;

  /**
   * Show role label
   * @default false
   */
  showRole?: boolean;

  /**
   * Show online status indicator
   * @default false
   */
  showStatus?: boolean;

  /**
   * Custom styles
   */
  sx?: SxProps<Theme>;
}

export const UserMenuHeader = forwardRef<HTMLDivElement, UserMenuHeaderProps>(
  (
    { user, showEmail = true, showRole = false, showStatus = false, sx },
    ref,
  ) => {
    return (
      <Box
        ref={ref}
        sx={{
          px: 2,
          py: 1.5,
          borderBottom: 1,
          borderColor: 'divider',
          ...sx,
        }}
      >
        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            gap: 1.5,
            mb: showEmail || showRole ? 1 : 0,
          }}
        >
          <Badge
            overlap="circular"
            anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
            variant="dot"
            color={
              showStatus ? statusColors[user.status || 'offline'] : undefined
            }
            invisible={!showStatus}
          >
            <Avatar src={user.avatar} size="medium">
              {getInitials(user.name)}
            </Avatar>
          </Badge>
          <Box sx={{ flex: 1, minWidth: 0 }}>
            <Typography variant="subtitle2" noWrap>
              {user.name}
            </Typography>
            {showEmail && user.email && (
              <Typography variant="caption" color="text.secondary" noWrap>
                {user.email}
              </Typography>
            )}
          </Box>
        </Box>
        {showRole && user.role && (
          <Box
            sx={{
              display: 'inline-flex',
              px: 1,
              py: 0.25,
              borderRadius: 0.5,
              bgcolor: 'primary.main',
              color: 'primary.contrastText',
            }}
          >
            <Typography variant="caption">{user.role}</Typography>
          </Box>
        )}
      </Box>
    );
  },
);

UserMenuHeader.displayName = 'UserMenuHeader';

export default UserMenuHeader;
