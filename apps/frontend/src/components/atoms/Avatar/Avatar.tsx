import { forwardRef } from 'react';
import MuiAvatar from '@mui/material/Avatar';
import MuiAvatarGroup from '@mui/material/AvatarGroup';
import { SxProps, Theme } from '@mui/material/styles';

/**
 * Avatar Component - Atomic Design: Atom
 *
 * Avatar component for displaying user images or text initials.
 *
 * @example
 * ```tsx
 * // Image avatar
 * <Avatar src="/avatar.jpg" alt="Username" />
 *
 * // textavatar
 * <Avatar>John Wang</Avatar>
 *
 * // initial avatar
 * <Avatar>WX</Avatar>
 *
 * // Different sizes
 * <Avatar size="small">S</Avatar>
 * <Avatar size="medium">M</Avatar>
 * <Avatar size="large">L</Avatar>
 *
 * // Avatar group
 * <AvatarGroup max={4}>
 *   <Avatar src="/user1.jpg" />
 *   <Avatar src="/user2.jpg" />
 *   <Avatar src="/user3.jpg" />
 * </AvatarGroup>
 * ```
 */

export interface AvatarProps {
  /**
   * imageSource
   */
  src?: string;

  /**
   * alternative text
   */
  alt?: string;

  /**
   * Children（textorInitial）
   */
  children?: React.ReactNode;

  /**
   * componentsize
   */
  size?: 'small' | 'medium' | 'large' | number;

  /**
   * component variant
   */
  variant?: 'circular' | 'rounded' | 'square';

  /**
   * custom style
   */
  sx?: SxProps<Theme>;
}

export interface AvatarGroupProps {
  /**
   * Children（Avatar component）
   */
  children: React.ReactNode;

  /**
   * maximum display count
   */
  max?: number;

  /**
   * Spacing
   */
  spacing?: 'small' | 'medium' | number;

  /**
   * custom style
   */
  sx?: SxProps<Theme>;
}

const sizeMap = {
  small: { width: 32, height: 32 },
  medium: { width: 40, height: 40 },
  large: { width: 56, height: 56 },
};

/**
 * Avatar component
 */
export const Avatar = forwardRef<HTMLDivElement, AvatarProps>(function Avatar(
  { src, alt, children, size = 'medium', variant = 'circular', sx, ...props },
  ref,
) {
  // handleSize
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
 * AvatarGroup component
 * group for displaying multiple avatars
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
