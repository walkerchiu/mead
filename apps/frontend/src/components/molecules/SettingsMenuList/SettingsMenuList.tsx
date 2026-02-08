import { forwardRef, ReactNode } from 'react';
import { Box, Divider } from '@mui/material';
import { SxProps, Theme } from '@mui/material/styles';
import { SettingsMenuItem } from '@/components/atoms/SettingsMenuItem';

/**
 * SettingsMenuList Component - Atomic Design: Molecule
 *
 * Settings menu item list that displays multiple menu items (similar to UserMenuList).
 *
 * @example
 * ```tsx
 * <SettingsMenuList
 *   items={[
 *     {
 *       id: 'help',
 *       label: 'Help',
 *       icon: <HelpIcon />,
 *       onClick: () => console.log('help'),
 *     },
 *     {
 *       id: 'about',
 *       label: 'About',
 *       icon: <InfoIcon />,
 *       href: '/about',
 *     },
 *   ]}
 * />
 * ```
 */

export interface SettingsMenuListItem {
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
}

export interface SettingsMenuListProps {
  /**
   * Menu item list
   */
  items: SettingsMenuListItem[];

  /**
   * Custom styles
   */
  sx?: SxProps<Theme>;
}

export const SettingsMenuList = forwardRef<
  HTMLDivElement,
  SettingsMenuListProps
>(({ items, sx }, ref) => {
  return (
    <Box ref={ref} sx={sx}>
      {items.map((item, index) => (
        <Box key={item.id}>
          <SettingsMenuItem
            icon={item.icon}
            label={item.label}
            onClick={item.onClick}
            href={item.href}
            disabled={item.disabled}
          />
          {item.dividerAfter && index < items.length - 1 && <Divider />}
        </Box>
      ))}
    </Box>
  );
});

SettingsMenuList.displayName = 'SettingsMenuList';

export default SettingsMenuList;
