'use client';

import { useState } from 'react';
import {
  IconButton,
  Menu,
  MenuItem,
  ListItemIcon,
  ListItemText,
  Divider,
  Button,
  Box,
  Typography,
  useMediaQuery,
  useTheme,
} from '@mui/material';
import { SxProps, Theme } from '@mui/material/styles';
import {
  AccountCircle as AccountCircleIcon,
  Person as PersonIcon,
  Security as SecurityIcon,
  Logout as LogoutIcon,
  ExpandMore as ExpandMoreIcon,
} from '@mui/icons-material';
import { Avatar, Badge } from '@/components/atoms';
import Link from 'next/link';
import { ReactNode } from 'react';

export interface UserMenuItem {
  /**
   * Unique identifier for the menu item
   */
  id: string;
  /**
   * Display label for the menu item
   */
  label: string;
  /**
   * Icon element to display before the label
   */
  icon?: ReactNode;
  /**
   * Click handler (use either onClick or href)
   */
  onClick?: () => void;
  /**
   * Navigation URL (use either onClick or href)
   */
  href?: string;
  /**
   * Whether the menu item is disabled
   */
  disabled?: boolean;
  /**
   * Show divider after this menu item
   */
  dividerAfter?: boolean;
  /**
   * Visual variant for the menu item
   */
  variant?: 'default' | 'danger';
}

export interface UserMenuProps {
  /**
   * Button color
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
   */
  size?: 'small' | 'medium' | 'large';
  /**
   * MUI sx prop for styling
   */
  sx?: SxProps<Theme>;
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
   * Show user name next to avatar
   */
  showName?: boolean;
  /**
   * Show email in menu
   */
  showEmail?: boolean;
  /**
   * Show role in menu
   */
  showRole?: boolean;
  /**
   * Show online status indicator
   */
  showStatus?: boolean;
  /**
   * Menu items to display
   */
  menuItems?: UserMenuItem[];
  /**
   * Use simple icon instead of avatar (for consistent icon-only layout)
   */
  iconMode?: boolean;
}

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

/**
 * Helper function to create standard user menu items
 *
 * @example
 * ```tsx
 * const menuItems = createUserMenuItems({
 *   onAccountClick: () => router.push('/settings/account'),
 *   onProfileClick: () => router.push('/settings/profile'),
 *   onSecurityClick: () => router.push('/settings/security'),
 *   onLogout: () => handleLogout(),
 *   accountUrl: '/settings/account',
 *   profileUrl: '/settings/profile',
 *   securityUrl: '/settings/security',
 * });
 * ```
 */
export function createUserMenuItems(options: {
  onAccountClick?: () => void;
  onProfileClick?: () => void;
  onSecurityClick?: () => void;
  onLogout?: () => void;
  accountUrl?: string;
  profileUrl?: string;
  securityUrl?: string;
  accountLabel?: string;
  profileLabel?: string;
  securityLabel?: string;
  logoutLabel?: string;
}): UserMenuItem[] {
  const items: UserMenuItem[] = [];

  if (options.onAccountClick) {
    items.push({
      id: 'account',
      label: options.accountLabel || 'Account Settings',
      icon: <AccountCircleIcon fontSize="small" />,
      onClick: options.onAccountClick,
      href: options.accountUrl,
    });
  }

  if (options.onProfileClick) {
    items.push({
      id: 'profile',
      label: options.profileLabel || 'Profile',
      icon: <PersonIcon fontSize="small" />,
      onClick: options.onProfileClick,
      href: options.profileUrl,
    });
  }

  if (options.onSecurityClick) {
    items.push({
      id: 'security',
      label: options.securityLabel || 'Security',
      icon: <SecurityIcon fontSize="small" />,
      onClick: options.onSecurityClick,
      href: options.securityUrl,
      dividerAfter: options.onLogout ? true : false,
    });
  }

  if (options.onLogout) {
    items.push({
      id: 'logout',
      label: options.logoutLabel || 'Logout',
      icon: <LogoutIcon fontSize="small" />,
      onClick: options.onLogout,
      variant: 'danger',
    });
  }

  return items;
}

/**
 * User menu component that displays user information and provides
 * quick access to profile, account settings, activity, and logout.
 */
export function UserMenu({
  color = 'inherit',
  size = 'medium',
  sx,
  user,
  showName = false,
  showEmail = true,
  showRole = false,
  showStatus = false,
  menuItems = [],
  iconMode = false,
}: UserMenuProps) {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);

  // Override showName based on screen size if not explicitly set
  const shouldShowName = isMobile ? false : showName;

  const handleMenuOpen = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  // Simple icon element (for consistent icon-only layout)
  const iconElement = <AccountCircleIcon />;

  // Avatar element with badge (for traditional layout)
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

  // Choose which element to display
  const displayElement = iconMode ? iconElement : avatarElement;

  return (
    <>
      {shouldShowName && !iconMode ? (
        <Button
          onClick={handleMenuOpen}
          color={color}
          size={size}
          startIcon={displayElement}
          endIcon={<ExpandMoreIcon />}
          aria-label="user menu"
          aria-controls="user-menu"
          aria-haspopup="true"
          sx={{
            textTransform: 'none',
            gap: 1,
            ...sx,
          }}
        >
          {user.name}
        </Button>
      ) : (
        <IconButton
          onClick={handleMenuOpen}
          color={color}
          size={size}
          aria-label="user menu"
          aria-controls="user-menu"
          aria-haspopup="true"
          sx={sx}
        >
          {displayElement}
        </IconButton>
      )}

      <Menu
        id="user-menu"
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
            minWidth: 240,
          },
        }}
      >
        {/* User Info Header */}
        <Box
          sx={{
            px: 2,
            py: 1.5,
            borderBottom: 1,
            borderColor: 'divider',
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

        {/* Menu Items */}
        {menuItems.map((item, index) => {
          const handleItemClick = () => {
            handleMenuClose();
            if (item.onClick) {
              item.onClick();
            }
          };

          return (
            <Box key={item.id}>
              <MenuItem
                component={item.href ? Link : 'li'}
                href={item.href}
                onClick={handleItemClick}
                disabled={item.disabled}
                sx={{
                  ...(item.variant === 'danger' && {
                    color: 'error.main',
                    '& .MuiListItemIcon-root': {
                      color: 'error.main',
                    },
                  }),
                }}
              >
                {item.icon && <ListItemIcon>{item.icon}</ListItemIcon>}
                <ListItemText>{item.label}</ListItemText>
              </MenuItem>
              {item.dividerAfter && index < menuItems.length - 1 && <Divider />}
            </Box>
          );
        })}
      </Menu>
    </>
  );
}
