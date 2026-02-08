import { forwardRef } from 'react';
import MuiDivider from '@mui/material/Divider';
import { SxProps, Theme } from '@mui/material/styles';

/**
 * Divider Component - Atomic Design: Atom
 *
 * Divider component for separating content blocks.
 *
 * @example
 * ```tsx
 * // Basic usage
 * <Divider />
 *
 * // With textDivider
 * <Divider>or</Divider>
 *
 * // Vertical divider
 * <Divider orientation="vertical" />
 *
 * // Different variants
 * <Divider variant="middle" />
 * <Divider variant="inset" />
 * ```
 */

export interface DividerProps {
  /**
   * Children（Text content）
   */
  children?: React.ReactNode;

  /**
   * direction
   */
  orientation?: 'horizontal' | 'vertical';

  /**
   * Variant
   */
  variant?: 'fullWidth' | 'inset' | 'middle';

  /**
   * text alignment (only valid when there are children)
   */
  textAlign?: 'left' | 'center' | 'right';

  /**
   * whetherFlexibleItem
   */
  flexItem?: boolean;

  /**
   * whether absolute positioning
   */
  absolute?: boolean;

  /**
   * whether light theme
   */
  light?: boolean;

  /**
   * custom style
   */
  sx?: SxProps<Theme>;
}

/**
 * Divider component
 */
export const Divider = forwardRef<HTMLHRElement, DividerProps>(function Divider(
  {
    children,
    orientation = 'horizontal',
    variant = 'fullWidth',
    textAlign = 'center',
    flexItem = false,
    absolute = false,
    light = false,
    sx,
    ...props
  },
  ref,
) {
  return (
    <MuiDivider
      ref={ref}
      orientation={orientation}
      variant={variant}
      textAlign={textAlign}
      flexItem={flexItem}
      absolute={absolute}
      light={light}
      sx={sx}
      {...props}
    >
      {children}
    </MuiDivider>
  );
});

export default Divider;
