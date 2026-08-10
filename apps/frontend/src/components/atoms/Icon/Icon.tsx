import { forwardRef } from 'react';
import Box from '@mui/material/Box';
import { SxProps, Theme } from '@mui/material/styles';

/**
 * Icon Component - Atomic Design: Atom
 *
 * Icon component for displaying various icons.
 *
 * @example
 * ```tsx
 * // Emoji icon
 * <Icon>🏠</Icon>
 * <Icon size="large">⭐</Icon>
 *
 * // With color
 * <Icon color="primary">❤️</Icon>
 *
 * // Custom size
 * <Icon fontSize={32}>🎨</Icon>
 * ```
 */

export interface IconProps {
  /**
   * Icon content (emoji, SVG or custom content)
   */
  children: React.ReactNode;

  /**
   * Default size
   */
  size?: 'small' | 'medium' | 'large';

  /**
   * Custom font size (pixels)
   */
  fontSize?: number;

  /**
   * Color
   */
  color?:
    | 'inherit'
    | 'primary'
    | 'secondary'
    | 'error'
    | 'warning'
    | 'info'
    | 'success'
    | 'disabled'
    | string;

  /**
   * Custom style
   */
  sx?: SxProps<Theme>;
}

const sizeMap = {
  small: 20,
  medium: 24,
  large: 32,
};

const colorMap = {
  inherit: 'inherit',
  primary: 'primary.main',
  secondary: 'secondary.main',
  error: 'error.main',
  warning: 'warning.main',
  info: 'info.main',
  success: 'success.main',
  disabled: 'text.disabled',
};

/**
 * Icon component
 */
export const Icon = forwardRef<HTMLDivElement, IconProps>(function Icon(
  { children, size = 'medium', fontSize, color = 'inherit', sx, ...props },
  ref,
) {
  const finalFontSize = fontSize || sizeMap[size];
  const finalColor =
    color in colorMap ? colorMap[color as keyof typeof colorMap] : color;

  return (
    <Box
      ref={ref}
      component="span"
      sx={{
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontSize: finalFontSize,
        color: finalColor,
        lineHeight: 1,
        userSelect: 'none',
        ...sx,
      }}
      {...props}
    >
      {children}
    </Box>
  );
});

export default Icon;
