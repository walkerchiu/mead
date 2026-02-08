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
  ToggleButtonGroup,
  ToggleButton,
} from '@mui/material';
import { SxProps, Theme } from '@mui/material/styles';
import {
  Settings as SettingsIcon,
  Palette as PaletteIcon,
  LightMode as LightModeIcon,
  DarkMode as DarkModeIcon,
  SettingsBrightness as SettingsBrightnessIcon,
  Help as HelpIcon,
  Info as InfoIcon,
} from '@mui/icons-material';
import { useTranslations } from 'next-intl';
import Link from 'next/link';
import { ReactNode } from 'react';

export interface SettingsMenuItem {
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
}

export interface SettingsMenuProps {
  /**
   * Show as button with text instead of icon (default: false)
   */
  showLabel?: boolean;
  /**
   * Icon button size
   */
  size?: 'small' | 'medium' | 'large';
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
   * MUI sx prop for styling
   */
  sx?: SxProps<Theme>;
  /**
   * Show theme toggle section
   */
  showThemeToggle?: boolean;
  /**
   * Current theme setting (required if showThemeToggle is true)
   */
  currentTheme?: 'light' | 'dark' | 'system';
  /**
   * Callback when theme is changed (required if showThemeToggle is true)
   */
  onThemeChange?: (theme: 'light' | 'dark' | 'system') => void;
  /**
   * Menu items to display
   */
  menuItems?: SettingsMenuItem[];
}

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

/**
 * Settings menu component that provides quick access to theme settings,
 * help documentation, and about information.
 */
export function SettingsMenu({
  showLabel = false,
  size = 'medium',
  color = 'inherit',
  sx,
  showThemeToggle = false,
  currentTheme = 'system',
  onThemeChange,
  menuItems = [],
}: SettingsMenuProps) {
  const t = useTranslations('components.settingsMenu');
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);

  const handleMenuOpen = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  const handleThemeChange = (
    event: React.MouseEvent<HTMLElement>,
    newTheme: 'light' | 'dark' | 'system' | null,
  ) => {
    if (newTheme !== null) {
      onThemeChange?.(newTheme);
    }
  };

  return (
    <>
      {showLabel ? (
        <Button
          onClick={handleMenuOpen}
          color={color}
          size={size}
          startIcon={<SettingsIcon />}
          aria-label="settings menu"
          aria-controls="settings-menu"
          aria-haspopup="true"
          sx={sx}
        >
          {t('title')}
        </Button>
      ) : (
        <IconButton
          onClick={handleMenuOpen}
          color={color}
          size={size}
          aria-label="settings menu"
          aria-controls="settings-menu"
          aria-haspopup="true"
          sx={sx}
        >
          <SettingsIcon />
        </IconButton>
      )}

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
        {/* Theme Selector */}
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
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
              <PaletteIcon sx={{ mr: 1, fontSize: 'small' }} />
              <Typography variant="body2">{t('appearance')}</Typography>
            </Box>
            <ToggleButtonGroup
              value={currentTheme}
              exclusive
              onChange={handleThemeChange}
              size="small"
              fullWidth
              aria-label="theme selection"
            >
              <ToggleButton value="light" aria-label="light theme">
                <LightModeIcon fontSize="small" sx={{ mr: 0.5 }} />
                <Typography variant="caption">{t('theme.light')}</Typography>
              </ToggleButton>
              <ToggleButton value="dark" aria-label="dark theme">
                <DarkModeIcon fontSize="small" sx={{ mr: 0.5 }} />
                <Typography variant="caption">{t('theme.dark')}</Typography>
              </ToggleButton>
              <ToggleButton value="system" aria-label="system theme">
                <SettingsBrightnessIcon fontSize="small" sx={{ mr: 0.5 }} />
                <Typography variant="caption">{t('theme.system')}</Typography>
              </ToggleButton>
            </ToggleButtonGroup>
          </MenuItem>
        )}

        {showThemeToggle && menuItems.length > 0 && <Divider sx={{ my: 1 }} />}

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
