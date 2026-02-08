import { forwardRef } from 'react';
import MuiBadge from '@mui/material/Badge';
import { SxProps, Theme } from '@mui/material/styles';

/**
 * Badge Component - Atomic Design: Atom
 *
 * Badge component for displaying notification counts or status indicators.
 *
 * @example
 * ```tsx
 * // Basic usage
 * <Badge badgeContent={4} color="primary">
 *   <Mailicon />
 * </Badge>
 *
 * // Maximum number
 * <Badge badgeContent={100} max={99} color="error">
 *   <Notificationicon />
 * </Badge>
 *
 * // dot badge
 * <Badge variant="dot" color="success">
 *   <Avatar />
 * </Badge>
 *
 * // customContent
 * <Badge badgeContent="new" color="secondary">
 *   <Producticon />
 * </Badge>
 * ```
 */

export interface BadgeProps {
  /**
   * Children（Wrapped by badge content）
   */
  children: React.ReactNode;

  /**
   * badgeContent
   */
  badgeContent?: React.ReactNode;

  /**
   * Color
   */
  color?:
    | 'default'
    | 'primary'
    | 'secondary'
    | 'error'
    | 'info'
    | 'success'
    | 'warning';

  /**
   * Variant
   */
  variant?: 'standard' | 'dot';

  /**
   * maximum number (exceeds will display as max+)
   */
  max?: number;

  /**
   * whether to showIs zero
   */
  showZero?: boolean;

  /**
   * badgePosition
   */
  anchorOrigin?: {
    vertical: 'top' | 'bottom';
    horizontal: 'left' | 'right';
  };

  /**
   * whether hidden
   */
  invisible?: boolean;

  /**
   * overlap mode
   */
  overlap?: 'rectangular' | 'circular';

  /**
   * custom style
   */
  sx?: SxProps<Theme>;
}

/**
 * Badge component
 */
export const Badge = forwardRef<HTMLSpanElement, BadgeProps>(function Badge(
  {
    children,
    badgeContent,
    color = 'default',
    variant = 'standard',
    max = 99,
    showZero = false,
    anchorOrigin = {
      vertical: 'top',
      horizontal: 'right',
    },
    invisible = false,
    overlap = 'rectangular',
    sx,
    ...props
  },
  ref,
) {
  return (
    <MuiBadge
      ref={ref}
      badgeContent={badgeContent}
      color={color}
      variant={variant}
      max={max}
      showZero={showZero}
      anchorOrigin={anchorOrigin}
      invisible={invisible}
      overlap={overlap}
      sx={sx}
      {...props}
    >
      {children}
    </MuiBadge>
  );
});

export default Badge;
