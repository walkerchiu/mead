'use client';

import { useState, forwardRef } from 'react';
import { Menu, MenuItem, Divider } from '@mui/material';
import { SxProps, Theme } from '@mui/material/styles';
import { useTranslations } from 'next-intl';
import { Help as HelpIcon, Info as InfoIcon } from '@mui/icons-material';
import { SettingsButton } from '@/components/atoms/SettingsButton';
import { ThemeSelector } from '@/components/molecules/ThemeSelector';
import {
  SettingsMenuList,
  SettingsMenuListItem,
} from '@/components/molecules/SettingsMenuList';
import { ThemeMode } from '@/components/atoms/ThemeToggleButton';

// Re-export types for backward compatibility
export type SettingsMenuItem = SettingsMenuListItem;

/**
 * SettingsMenu Component - Atomic Design: Organism
 *
 * Complete settings menu component that combines:
 * - SettingsButton (Atom) - Trigger button
 * - ThemeSelector (Molecule) - Theme selector
 * - SettingsMenuList (Molecule) - Menu item list
 *
 * Fully follows the Atomic Design architecture like the Notification system.
 *
 * @example
 * ```tsx
 * <SettingsMenu
 *   showThemeToggle
 *   currentTheme="light"
 *   onThemeChange={(theme) => setTheme(theme)}
 *   menuItems={[
 *     {
 *       id: 'help',
 *       label: 'Help',
 *       icon: <HelpIcon />,
 *       onClick: () => router.push('/help'),
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

export interface SettingsMenuProps {
  /**
   * Menu item list
   */
  menuItems?: SettingsMenuListItem[];

  /**
   * Display as button with text label
   * @default false
   */
  showLabel?: boolean;

  /**
   * Icon button size
   * @default 'medium'
   */
  size?: 'small' | 'medium' | 'large';

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
   * Show theme toggle section
   * @default false
   */
  showThemeToggle?: boolean;

  /**
   * Current theme setting (required when showThemeToggle is true)
   */
  currentTheme?: ThemeMode;

  /**
   * Theme change callback (required when showThemeToggle is true)
   */
  onThemeChange?: (theme: ThemeMode) => void;

  /**
   * Custom styles
   */
  sx?: SxProps<Theme>;
}

export const SettingsMenu = forwardRef<HTMLButtonElement, SettingsMenuProps>(
  (
    {
      menuItems = [],
      showLabel = false,
      size = 'medium',
      color = 'inherit',
      showThemeToggle = false,
      currentTheme = 'system',
      onThemeChange,
      sx,
    },
    ref,
  ) => {
    const t = useTranslations('components.settingsMenu');
    const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);

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
        <SettingsButton
          ref={ref}
          showLabel={showLabel}
          label={t('title')}
          color={color}
          size={size}
          onClick={handleMenuOpen}
          tooltipTitle={t('title')}
          ariaControls="settings-menu"
          sx={sx}
        />

        {/* Dropdown menu */}
        <Menu
          id="settings-menu"
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
              minWidth: 280,
            },
          }}
        >
          {/* Theme selector (Molecule) */}
          {showThemeToggle && onThemeChange && (
            <MenuItem
              disableRipple
              sx={{
                flexDirection: 'column',
                alignItems: 'stretch',
                '&:hover': {
                  backgroundColor: 'transparent',
                },
              }}
            >
              <ThemeSelector
                currentTheme={currentTheme}
                onThemeChange={onThemeChange}
                title={t('appearance')}
                themes={[
                  { value: 'light', label: t('theme.light') },
                  { value: 'dark', label: t('theme.dark') },
                  { value: 'system', label: t('theme.system') },
                ]}
              />
            </MenuItem>
          )}

          {/* Divider between theme toggle and menu items */}
          {showThemeToggle && wrappedMenuItems.length > 0 && (
            <Divider sx={{ my: 1 }} />
          )}

          {/* Menu item list (Molecule) */}
          {wrappedMenuItems.length > 0 && (
            <SettingsMenuList items={wrappedMenuItems} />
          )}
        </Menu>
      </>
    );
  },
);

SettingsMenu.displayName = 'SettingsMenu';

/**
 * Helper function to create standard settings menu items
 *
 * @example
 * ```tsx
 * const menuItems = createSettingsMenuItems({
 *   onHelpClick: () => router.push('/help'),
 *   onAboutClick: () => router.push('/about'),
 *   helpUrl: '/help',
 *   aboutUrl: '/about',
 * });
 * ```
 */
export function createSettingsMenuItems(options: {
  onHelpClick?: () => void;
  onAboutClick?: () => void;
  helpUrl?: string;
  aboutUrl?: string;
  helpLabel?: string;
  aboutLabel?: string;
}): SettingsMenuItem[] {
  const items: SettingsMenuItem[] = [];

  if (options.onHelpClick) {
    items.push({
      id: 'help',
      label: options.helpLabel || 'Help',
      icon: <HelpIcon fontSize="small" />,
      onClick: options.onHelpClick,
      href: options.helpUrl,
    });
  }

  if (options.onAboutClick) {
    items.push({
      id: 'about',
      label: options.aboutLabel || 'About',
      icon: <InfoIcon fontSize="small" />,
      onClick: options.onAboutClick,
      href: options.aboutUrl,
    });
  }

  return items;
}

export default SettingsMenu;
