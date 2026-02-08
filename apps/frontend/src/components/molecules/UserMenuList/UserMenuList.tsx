import { forwardRef, ReactNode } from 'react';
import { Box, Divider } from '@mui/material';
import { SxProps, Theme } from '@mui/material/styles';
import { UserMenuItem } from '@/components/atoms/UserMenuItem';

/**
 * UserMenuList Component - Atomic Design: Molecule
 *
 * User menu item list that displays multiple menu items (similar to NotificationList).
 *
 * @example
 * ```tsx
 * <UserMenuList
 *   items={[
 *     {
 *       id: 'account',
 *       label: 'Account Settings',
 *       icon: <AccountCircleIcon />,
 *       onClick: () => console.log('account'),
 *     },
 *     {
 *       id: 'profile',
 *       label: 'Profile',
 *       icon: <PersonIcon />,
 *       href: '/profile',
 *     },
 *     {
 *       id: 'logout',
 *       label: 'Logout',
 *       icon: <LogoutIcon />,
 *       variant: 'danger',
 *       onClick: handleLogout,
 *       dividerAfter: true,
 *     },
 *   ]}
 * />
 * ```
 */

export interface UserMenuListItem {
  /**
   * Unique identifier
   */
  id: string;

  /**
   * Display label
   */
  label: string;

  /**
   * Icon element
   */
  icon?: ReactNode;

  /**
   * Click handler function (use onClick or href)
   */
  onClick?: () => void;

  /**
   * Navigation URL (use onClick or href)
   */
  href?: string;

  /**
   * Whether the item is disabled
   */
  disabled?: boolean;

  /**
   * Show divider after this item
   */
  dividerAfter?: boolean;

  /**
   * Visual variant
   */
  variant?: 'default' | 'danger';
}

export interface UserMenuListProps {
  /**
   * Menu item list
   */
  items: UserMenuListItem[];

  /**
   * Custom styles
   */
  sx?: SxProps<Theme>;
}

export const UserMenuList = forwardRef<HTMLDivElement, UserMenuListProps>(
  ({ items, sx }, ref) => {
    return (
      <Box ref={ref} sx={sx}>
        {items.map((item, index) => (
          <Box key={item.id}>
            <UserMenuItem
              icon={item.icon}
              label={item.label}
              onClick={item.onClick}
              href={item.href}
              disabled={item.disabled}
              variant={item.variant}
            />
            {item.dividerAfter && index < items.length - 1 && <Divider />}
          </Box>
        ))}
      </Box>
    );
  },
);

UserMenuList.displayName = 'UserMenuList';

export default UserMenuList;
