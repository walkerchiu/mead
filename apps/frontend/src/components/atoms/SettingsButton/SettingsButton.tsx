'use client';

import { forwardRef } from 'react';
import { IconButton, Button, Tooltip } from '@mui/material';
import { Settings as SettingsIcon } from '@mui/icons-material';
import { SxProps, Theme } from '@mui/material/styles';

/**
 * SettingsButton Component - Atomic Design: Atom
 *
 * Settings button that displays a settings icon.
 * Used as a button to trigger settings menu (similar to NotificationBadge).
 *
 * @example
 * ```tsx
 * // Icon only mode
 * <SettingsButton onClick={handleClick} />
 *
 * // With label mode
 * <SettingsButton showLabel onClick={handleClick} />
 * ```
 */

export interface SettingsButtonProps {
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
   * Display as button with text
   * @default false
   */
  showLabel?: boolean;

  /**
   * Button label text (used when showLabel is true)
   * @default 'Settings'
   */
  label?: string;

  /**
   * Click callback
   */
  onClick?: (event: React.MouseEvent<HTMLElement>) => void;

  /**
   * Tooltip text
   * @default 'Settings'
   */
  tooltipTitle?: string;

  /**
   * aria-label
   * @default 'settings menu'
   */
  ariaLabel?: string;

  /**
   * aria-controls
   */
  ariaControls?: string;

  /**
   * aria-haspopup
   * @default true
   */
  ariaHaspopup?: boolean;

  /**
   * Custom styles
   */
  sx?: SxProps<Theme>;
}

export const SettingsButton = forwardRef<
  HTMLButtonElement,
  SettingsButtonProps
>(
  (
    {
      color = 'inherit',
      size = 'medium',
      showLabel = false,
      label = 'Settings',
      onClick,
      tooltipTitle = 'Settings',
      ariaLabel = 'settings menu',
      ariaControls,
      ariaHaspopup = true,
      sx,
    },
    ref,
  ) => {
    // If showing label, use Button
    if (showLabel) {
      return (
        <Tooltip title={tooltipTitle}>
          <Button
            ref={ref}
            onClick={onClick}
            color={color}
            size={size}
            startIcon={<SettingsIcon />}
            aria-label={ariaLabel}
            aria-controls={ariaControls}
            aria-haspopup={ariaHaspopup}
            sx={sx}
          >
            {label}
          </Button>
        </Tooltip>
      );
    }

    // Otherwise use IconButton
    return (
      <Tooltip title={tooltipTitle}>
        <IconButton
          ref={ref}
          onClick={onClick}
          color={color}
          size={size}
          aria-label={ariaLabel}
          aria-controls={ariaControls}
          aria-haspopup={ariaHaspopup}
          sx={sx}
        >
          <SettingsIcon />
        </IconButton>
      </Tooltip>
    );
  },
);

SettingsButton.displayName = 'SettingsButton';

export default SettingsButton;
