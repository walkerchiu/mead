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
} from '@mui/material';
import { SxProps, Theme } from '@mui/material/styles';
import {
  Settings as SettingsIcon,
  Person as PersonIcon,
  Security as SecurityIcon,
  Logout as LogoutIcon,
} from '@mui/icons-material';
import { useTranslations } from 'next-intl';
import { logout } from '@/lib/auth';
import Link from 'next/link';

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
   * Callback when logout is clicked (optional, for custom logout behavior)
   */
  onLogout?: () => void;
}

/**
 * Settings menu component that provides quick access to profile, security, and logout.
 * Uses a dropdown menu pattern similar to LanguageSwitcher.
 */
export function SettingsMenu({
  showLabel = false,
  size = 'medium',
  color = 'inherit',
  sx,
  onLogout,
}: SettingsMenuProps) {
  const tn = useTranslations('pages.settings.navigation');
  const tc = useTranslations('common');
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);

  const handleMenuOpen = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  const handleItemClick = () => {
    handleMenuClose();
  };

  const handleLogout = async () => {
    handleMenuClose();
    if (onLogout) {
      onLogout();
    } else {
      await logout();
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
          {tc('settings')}
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
      >
        <MenuItem
          component={Link}
          href="/settings/profile"
          onClick={handleItemClick}
        >
          <ListItemIcon>
            <PersonIcon fontSize="small" />
          </ListItemIcon>
          <ListItemText>{tn('profile')}</ListItemText>
        </MenuItem>

        <MenuItem
          component={Link}
          href="/settings/security"
          onClick={handleItemClick}
        >
          <ListItemIcon>
            <SecurityIcon fontSize="small" />
          </ListItemIcon>
          <ListItemText>{tn('security')}</ListItemText>
        </MenuItem>

        <Divider />

        <MenuItem onClick={handleLogout}>
          <ListItemIcon>
            <LogoutIcon fontSize="small" />
          </ListItemIcon>
          <ListItemText>{tc('logout')}</ListItemText>
        </MenuItem>
      </Menu>
    </>
  );
}
