import { forwardRef } from 'react';
import MuiBadge from '@mui/material/Badge';
import { SxProps, Theme } from '@mui/material/styles';

/**
 * Badge 組件 - Atomic Design: Atom
 *
 * 徽章組件，用於顯示通知計數或狀態指示器。
 *
 * @example
 * ```tsx
 * // 基本用法
 * <Badge badgeContent={4} color="primary">
 *   <MailIcon />
 * </Badge>
 *
 * // 最大數字
 * <Badge badgeContent={100} max={99} color="error">
 *   <NotificationIcon />
 * </Badge>
 *
 * // 圓點徽章
 * <Badge variant="dot" color="success">
 *   <Avatar />
 * </Badge>
 *
 * // 自訂內容
 * <Badge badgeContent="new" color="secondary">
 *   <ProductIcon />
 * </Badge>
 * ```
 */

export interface BadgeProps {
  /**
   * 子元素（被徽章包裹的內容）
   */
  children: React.ReactNode;

  /**
   * 徽章內容
   */
  badgeContent?: React.ReactNode;

  /**
   * 顏色
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
   * 變體
   */
  variant?: 'standard' | 'dot';

  /**
   * 最大數字（超過會顯示為 max+）
   */
  max?: number;

  /**
   * 是否顯示為零
   */
  showZero?: boolean;

  /**
   * 徽章位置
   */
  anchorOrigin?: {
    vertical: 'top' | 'bottom';
    horizontal: 'left' | 'right';
  };

  /**
   * 是否隱藏
   */
  invisible?: boolean;

  /**
   * 重疊方式
   */
  overlap?: 'rectangular' | 'circular';

  /**
   * 自訂樣式
   */
  sx?: SxProps<Theme>;
}

/**
 * Badge 組件
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
