import { forwardRef } from 'react';
import Box from '@mui/material/Box';
import { SxProps, Theme } from '@mui/material/styles';

/**
 * Icon 組件 - Atomic Design: Atom
 *
 * 圖示組件，用於顯示各種圖示。
 *
 * @example
 * ```tsx
 * // Emoji 圖示
 * <Icon>🏠</Icon>
 * <Icon size="large">⭐</Icon>
 *
 * // 帶顏色
 * <Icon color="primary">❤️</Icon>
 *
 * // 自訂大小
 * <Icon fontSize={32}>🎨</Icon>
 * ```
 */

export interface IconProps {
  /**
   * 圖示內容（emoji、SVG 或自訂內容）
   */
  children: React.ReactNode;

  /**
   * 預設大小
   */
  size?: 'small' | 'medium' | 'large';

  /**
   * 自訂字體大小（像素）
   */
  fontSize?: number;

  /**
   * 顏色
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
   * 自訂樣式
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
 * Icon 組件
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
