import { forwardRef } from 'react';
import MuiAvatar from '@mui/material/Avatar';
import MuiAvatarGroup from '@mui/material/AvatarGroup';
import { SxProps, Theme } from '@mui/material/styles';

/**
 * Avatar 組件 - Atomic Design: Atom
 *
 * 頭像組件，用於顯示使用者圖片或文字縮寫。
 *
 * @example
 * ```tsx
 * // 圖片頭像
 * <Avatar src="/avatar.jpg" alt="使用者名稱" />
 *
 * // 文字頭像
 * <Avatar>王小明</Avatar>
 *
 * // 縮寫頭像
 * <Avatar>WX</Avatar>
 *
 * // 不同尺寸
 * <Avatar size="small">S</Avatar>
 * <Avatar size="medium">M</Avatar>
 * <Avatar size="large">L</Avatar>
 *
 * // 頭像組
 * <AvatarGroup max={4}>
 *   <Avatar src="/user1.jpg" />
 *   <Avatar src="/user2.jpg" />
 *   <Avatar src="/user3.jpg" />
 * </AvatarGroup>
 * ```
 */

export interface AvatarProps {
  /**
   * 圖片來源
   */
  src?: string;

  /**
   * 替代文字
   */
  alt?: string;

  /**
   * 子元素（文字或縮寫）
   */
  children?: React.ReactNode;

  /**
   * 組件大小
   */
  size?: 'small' | 'medium' | 'large' | number;

  /**
   * 組件變體
   */
  variant?: 'circular' | 'rounded' | 'square';

  /**
   * 自訂樣式
   */
  sx?: SxProps<Theme>;
}

export interface AvatarGroupProps {
  /**
   * 子元素（Avatar 組件）
   */
  children: React.ReactNode;

  /**
   * 最大顯示數量
   */
  max?: number;

  /**
   * 間距
   */
  spacing?: 'small' | 'medium' | number;

  /**
   * 自訂樣式
   */
  sx?: SxProps<Theme>;
}

const sizeMap = {
  small: { width: 32, height: 32 },
  medium: { width: 40, height: 40 },
  large: { width: 56, height: 56 },
};

/**
 * Avatar 組件
 */
export const Avatar = forwardRef<HTMLDivElement, AvatarProps>(function Avatar(
  { src, alt, children, size = 'medium', variant = 'circular', sx, ...props },
  ref,
) {
  // 處理尺寸
  let sizeSx = {};
  if (typeof size === 'number') {
    sizeSx = { width: size, height: size };
  } else if (size in sizeMap) {
    sizeSx = sizeMap[size as keyof typeof sizeMap];
  }

  return (
    <MuiAvatar
      ref={ref}
      src={src}
      alt={alt}
      variant={variant}
      sx={{ ...sizeSx, ...sx }}
      {...props}
    >
      {children}
    </MuiAvatar>
  );
});

/**
 * AvatarGroup 組件
 * 用於顯示多個頭像的群組
 */
export const AvatarGroup = forwardRef<HTMLDivElement, AvatarGroupProps>(
  function AvatarGroupComponent(
    { children, max = 5, spacing = 'medium', sx, ...props },
    ref,
  ) {
    return (
      <MuiAvatarGroup ref={ref} max={max} spacing={spacing} sx={sx} {...props}>
        {children}
      </MuiAvatarGroup>
    );
  },
);

export default Avatar;
