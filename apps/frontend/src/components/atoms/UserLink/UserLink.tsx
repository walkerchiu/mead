'use client';

import { Avatar, Typography, Box } from '@mui/material';

export interface UserLinkProps {
  /** 使用者 ID（保留以便日後加入 profile 頁時使用）*/
  userId?: string;
  /** 顯示名稱（通常是 user.name）*/
  name?: string | null;
  /** 使用者 Email（fallback 顯示）*/
  email?: string | null;
  /** Avatar URL */
  avatar?: string | null;
  /** 是否顯示 Avatar（預設 true，小型場景可關閉）*/
  showAvatar?: boolean;
  /** Avatar 尺寸（px），預設 24 */
  avatarSize?: number;
  /** 文字大小，預設 body2 */
  variant?: 'body1' | 'body2' | 'caption';
  /** 額外的 sx */
  sx?: object;
}

/**
 * UserLink — 使用者名稱 + 頭像的內聯顯示元件
 *
 * 模板未提供公開個人檔案頁，因此本元件僅做純粹顯示，不再導向。
 * 若您的專案要恢復公開個人檔案頁，可改回 NextLink 包裝。
 */
export function UserLink({
  name,
  email,
  avatar,
  showAvatar = true,
  avatarSize = 24,
  variant = 'body2',
  sx,
}: UserLinkProps) {
  const displayName = name || email || '未命名使用者';
  const initials = (name || email || '?').charAt(0).toUpperCase();

  return (
    <Box
      sx={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: 0.75,
        color: 'text.primary',
        maxWidth: '100%',
        ...sx,
      }}
    >
      {showAvatar && (
        <Avatar
          src={avatar || undefined}
          alt={displayName}
          sx={{
            width: avatarSize,
            height: avatarSize,
            fontSize: avatarSize * 0.5,
            bgcolor: 'primary.main',
            color: 'primary.contrastText',
            flexShrink: 0,
          }}
        >
          {!avatar && initials}
        </Avatar>
      )}
      <Typography
        variant={variant}
        component="span"
        className="user-link-name"
        sx={{
          overflow: 'hidden',
          textOverflow: 'ellipsis',
          whiteSpace: 'nowrap',
          lineHeight: 1.4,
        }}
      >
        {displayName}
      </Typography>
    </Box>
  );
}
