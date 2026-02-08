import { forwardRef, ReactNode } from 'react';
import { MenuItem, ListItemIcon, ListItemText } from '@mui/material';
import { SxProps, Theme } from '@mui/material/styles';
import { Link } from '@/i18n/routing';

/**
 * UserMenuItem Component - Atomic Design: Atom
 *
 * Single user menu item that displays an icon and label.
 * (Similar role to NotificationItem)
 *
 * @example
 * ```tsx
 * <UserMenuItem
 *   icon={<PersonIcon />}
 *   label="Profile"
 *   onClick={() => console.log('clicked')}
 * />
 *
 * <UserMenuItem
 *   icon={<LogoutIcon />}
 *   label="Logout"
 *   variant="danger"
 *   onClick={handleLogout}
 * />
 *
 * <UserMenuItem
 *   icon={<SettingsIcon />}
 *   label="Settings"
 *   href="/settings"
 * />
 * ```
 */

export interface UserMenuItemProps {
  /**
   * Icon element
   */
  icon?: ReactNode;

  /**
   * Display label
   */
  label: string;

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
   * @default false
   */
  disabled?: boolean;

  /**
   * Visual variant
   * @default 'default'
   */
  variant?: 'default' | 'danger';

  /**
   * Custom styles
   */
  sx?: SxProps<Theme>;
}

export const UserMenuItem = forwardRef<HTMLLIElement, UserMenuItemProps>(
  (
    { icon, label, onClick, href, disabled = false, variant = 'default', sx },
    ref,
  ) => {
    return (
      <MenuItem
        ref={ref}
        component={href ? Link : 'li'}
        href={href}
        onClick={onClick}
        disabled={disabled}
        sx={{
          ...(variant === 'danger' && {
            color: 'error.main',
            '& .MuiListItemIcon-root': {
              color: 'error.main',
            },
          }),
          ...sx,
        }}
      >
        {icon && <ListItemIcon>{icon}</ListItemIcon>}
        <ListItemText>{label}</ListItemText>
      </MenuItem>
    );
  },
);

UserMenuItem.displayName = 'UserMenuItem';

export default UserMenuItem;
