'use client';

import { useState, forwardRef } from 'react';
import { Menu, useMediaQuery, useTheme } from '@mui/material';
import { SxProps, Theme } from '@mui/material/styles';
import {
  AccountCircle as AccountCircleIcon,
  Person as PersonIcon,
  Security as SecurityIcon,
  Key as KeyIcon,
  Logout as LogoutIcon,
} from '@mui/icons-material';
import { useTranslations } from 'next-intl';
import { UserButton } from '@/components/atoms/UserButton';
import { UserMenuHeader } from '@/components/molecules/UserMenuHeader';
import {
  UserMenuList,
  UserMenuListItem,
} from '@/components/molecules/UserMenuList';

// Re-export types for backward compatibility
export type UserMenuItem = UserMenuListItem;

/**
 * UserMenu Component - Atomic Design: Organism
 *
 * Complete user menu component that combines:
 * - UserButton (Atom) - Trigger button
 * - UserMenuHeader (Molecule) - Menu header
 * - UserMenuList (Molecule) - Menu item list
 *
 * Fully follows the Atomic Design architecture like the Notification system.
 *
 * @example
 * ```tsx
 * <UserMenu
 *   user={{
 *     name: 'John Doe',
 *     email: 'john@example.com',
 *     avatar: '/avatar.jpg',
 *     role: 'HQ',
 *     status: 'online'
 *   }}
 *   menuItems={[
 *     {
 *       id: 'account',
 *       label: 'Account Settings',
 *       icon: <AccountCircleIcon />,
 *       onClick: () => router.push('/settings/account'),
 *     },
 *     {
 *       id: 'logout',
 *       label: 'Logout',
 *       icon: <LogoutIcon />,
 *       variant: 'danger',
 *       onClick: handleLogout,
 *     },
 *   ]}
 *   showEmail
 *   showRole
 *   showStatus
 * />
 * ```
 */

export interface UserMenuProps {
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
   * Menu item list
   */
  menuItems?: UserMenuListItem[];

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
   * Show user name on button
   * @default false
   */
  showName?: boolean;

  /**
   * Show email in menu header
   * @default true
   */
  showEmail?: boolean;

  /**
   * Show role in menu header
   * @default false
   */
  showRole?: boolean;

  /**
   * Show online status indicator
   * @default false
   */
  showStatus?: boolean;

  /**
   * Use simple icon instead of avatar (unified icon layout)
   * @default false
   */
  iconMode?: boolean;

  /**
   * Custom styles
   */
  sx?: SxProps<Theme>;
}

export const UserMenu = forwardRef<HTMLButtonElement, UserMenuProps>(
  (
    {
      user,
      menuItems = [],
      color = 'inherit',
      size = 'medium',
      showName = false,
      showEmail = true,
      showRole = false,
      showStatus = false,
      iconMode = false,
      sx,
    },
    ref,
  ) => {
    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
    const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
    const t = useTranslations('components.userMenu');

    // Don't show name on mobile
    const shouldShowName = isMobile ? false : showName;

    const handleMenuOpen = (event: React.MouseEvent<HTMLElement>) => {
      setAnchorEl(event.currentTarget);
    };

    const handleMenuClose = () => {
      setAnchorEl(null);
    };

    // Wrap menu item click handlers to automatically close menu
    const wrappedMenuItems = menuItems.map((item) => ({
      ...item,
      onClick: item.onClick
        ? () => {
            handleMenuClose();
            item.onClick?.();
          }
        : undefined,
    }));

    return (
      <>
        {/* Trigger button (Atom) */}
        <UserButton
          ref={ref}
          user={user}
          color={color}
          size={size}
          showName={shouldShowName}
          showStatus={showStatus}
          iconMode={iconMode}
          onClick={handleMenuOpen}
          tooltipTitle={t('tooltip')}
          ariaControls="user-menu"
          sx={sx}
        />

        {/* Dropdown menu */}
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
          {/* Menu header (Molecule) */}
          <UserMenuHeader
            user={user}
            showEmail={showEmail}
            showRole={showRole}
            showStatus={showStatus}
          />

          {/* Menu item list (Molecule) */}
          {wrappedMenuItems.length > 0 && (
            <UserMenuList items={wrappedMenuItems} />
          )}
        </Menu>
      </>
    );
  },
);

UserMenu.displayName = 'UserMenu';

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
  onTokensClick?: () => void;
  onLogout?: () => void;
  accountUrl?: string;
  profileUrl?: string;
  securityUrl?: string;
  tokensUrl?: string;
  accountLabel?: string;
  profileLabel?: string;
  securityLabel?: string;
  tokensLabel?: string;
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
    });
  }

  if (options.onTokensClick) {
    items.push({
      id: 'tokens',
      label: options.tokensLabel || 'Access Tokens',
      icon: <KeyIcon fontSize="small" />,
      onClick: options.onTokensClick,
      href: options.tokensUrl,
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

export default UserMenu;
