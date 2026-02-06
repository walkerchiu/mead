import { forwardRef } from 'react';
import MuiDivider from '@mui/material/Divider';
import { SxProps, Theme } from '@mui/material/styles';

/**
 * Divider 組件 - Atomic Design: Atom
 *
 * 分隔線組件，用於分隔內容區塊。
 *
 * @example
 * ```tsx
 * // 基本用法
 * <Divider />
 *
 * // 帶文字的分隔線
 * <Divider>或</Divider>
 *
 * // 垂直分隔線
 * <Divider orientation="vertical" />
 *
 * // 不同變體
 * <Divider variant="middle" />
 * <Divider variant="inset" />
 * ```
 */

export interface DividerProps {
  /**
   * 子元素（文字內容）
   */
  children?: React.ReactNode;

  /**
   * 方向
   */
  orientation?: 'horizontal' | 'vertical';

  /**
   * 變體
   */
  variant?: 'fullWidth' | 'inset' | 'middle';

  /**
   * 文字對齊方式（僅當有 children 時有效）
   */
  textAlign?: 'left' | 'center' | 'right';

  /**
   * 是否為彈性項目
   */
  flexItem?: boolean;

  /**
   * 是否絕對定位
   */
  absolute?: boolean;

  /**
   * 是否為淺色
   */
  light?: boolean;

  /**
   * 自訂樣式
   */
  sx?: SxProps<Theme>;
}

/**
 * Divider 組件
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
