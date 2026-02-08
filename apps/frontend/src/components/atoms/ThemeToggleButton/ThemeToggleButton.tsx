import { forwardRef } from 'react';
import { ToggleButton, Typography } from '@mui/material';
import {
  LightMode as LightModeIcon,
  DarkMode as DarkModeIcon,
  SettingsBrightness as SettingsBrightnessIcon,
} from '@mui/icons-material';
import { SxProps, Theme } from '@mui/material/styles';

/**
 * ThemeToggleButton Component - Atomic Design: Atom
 *
 * Single theme toggle button (light/dark/system).
 *
 * @example
 * ```tsx
 * <ThemeToggleButton value="light" label="Light" />
 * <ThemeToggleButton value="dark" label="Dark" />
 * <ThemeToggleButton value="system" label="System" />
 * ```
 */

export type ThemeMode = 'light' | 'dark' | 'system';

const themeIcons = {
  light: LightModeIcon,
  dark: DarkModeIcon,
  system: SettingsBrightnessIcon,
};

export interface ThemeToggleButtonProps {
  /**
   * Theme value
   */
  value: ThemeMode;

  /**
   * Display label
   */
  label: string;

  /**
   * aria-label
   */
  ariaLabel?: string;

  /**
   * Custom styles
   */
  sx?: SxProps<Theme>;
}

export const ThemeToggleButton = forwardRef<
  HTMLButtonElement,
  ThemeToggleButtonProps
>(({ value, label, ariaLabel, sx }, ref) => {
  const IconComponent = themeIcons[value];

  return (
    <ToggleButton
      ref={ref}
      value={value}
      aria-label={ariaLabel || `${value} theme`}
      sx={sx}
    >
      <IconComponent fontSize="small" sx={{ mr: 0.5 }} />
      <Typography variant="caption">{label}</Typography>
    </ToggleButton>
  );
});

ThemeToggleButton.displayName = 'ThemeToggleButton';

export default ThemeToggleButton;
