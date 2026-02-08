import { forwardRef, ReactNode } from 'react';
import { MenuItem, ListItemIcon, ListItemText } from '@mui/material';
import { SxProps, Theme } from '@mui/material/styles';
import Link from 'next/link';

/**
 * SettingsMenuItem Component - Atomic Design: Atom
 *
 * Single settings menu item that displays icon and label.
 * (Similar role to UserMenuItem)
 *
 * @example
 * ```tsx
 * <SettingsMenuItem
 *   icon={<HelpIcon />}
 *   label="Help"
 *   onClick={() => console.log('clicked')}
 * />
 *
 * <SettingsMenuItem
 *   icon={<InfoIcon />}
 *   label="About"
 *   href="/about"
 * />
 * ```
 */

export interface SettingsMenuItemProps {
  /**
   * Icon element
   */
  icon?: ReactNode;

  /**
   * Display label
   */
  label: string;

  /**
   * Click handler (use onClick or href)
   */
  onClick?: () => void;

  /**
   * Navigation URL (use onClick or href)
   */
  href?: string;

  /**
   * Whether disabled
   * @default false
   */
  disabled?: boolean;

  /**
   * Custom styles
   */
  sx?: SxProps<Theme>;
}

export const SettingsMenuItem = forwardRef<
  HTMLLIElement,
  SettingsMenuItemProps
>(({ icon, label, onClick, href, disabled = false, sx }, ref) => {
  return (
    <MenuItem
      ref={ref}
      component={href ? Link : 'li'}
      href={href}
      onClick={onClick}
      disabled={disabled}
      sx={sx}
    >
      {icon && <ListItemIcon>{icon}</ListItemIcon>}
      <ListItemText>{label}</ListItemText>
    </MenuItem>
  );
});

SettingsMenuItem.displayName = 'SettingsMenuItem';

export default SettingsMenuItem;
