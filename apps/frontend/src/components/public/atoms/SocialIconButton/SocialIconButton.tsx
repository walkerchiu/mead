'use client';

import type { ComponentType } from 'react';

import FacebookIcon from '@mui/icons-material/Facebook';
import InstagramIcon from '@mui/icons-material/Instagram';
import LanguageIcon from '@mui/icons-material/Language';
import LinkIcon from '@mui/icons-material/Link';
import YouTubeIcon from '@mui/icons-material/YouTube';
import type { SvgIconProps } from '@mui/material/SvgIcon';
import ButtonBase from '@mui/material/ButtonBase';

import { portalTokens } from '../../tokens';

/** 正規化後的社群平台種類 */
export type SocialPlatform =
  | 'facebook'
  | 'instagram'
  | 'youtube'
  | 'website'
  | 'linktree';

const ICONS: Record<SocialPlatform, ComponentType<SvgIconProps>> = {
  facebook: FacebookIcon,
  instagram: InstagramIcon,
  youtube: YouTubeIcon,
  website: LanguageIcon,
  linktree: LinkIcon,
};

const LABELS: Record<SocialPlatform, string> = {
  facebook: 'Facebook',
  instagram: 'Instagram',
  youtube: 'YouTube',
  website: '官方網站',
  linktree: 'Linktree',
};

/**
 * 將 plans.json 內的平台字串（官網 / Facebook / Instagram / YouTube / Linktree）
 * 對應為 SocialPlatform。無法對應時回傳 'website'。
 */
export function resolveSocialPlatform(raw: string): SocialPlatform {
  const key = raw.trim().toLowerCase();
  if (key.includes('face')) return 'facebook';
  if (key.includes('insta')) return 'instagram';
  if (key.includes('you')) return 'youtube';
  if (key.includes('linktree') || key.includes('linktr')) return 'linktree';
  return 'website';
}

export interface SocialIconButtonProps {
  /** 社群平台 */
  platform: SocialPlatform;
  /** 連結網址 */
  url: string;
  /** 尺寸（直徑 px），預設 36 */
  size?: number;
}

/**
 * SocialIconButton — 入口網社群圓形圖示按鈕（深色底、白色圖示）。
 */
export function SocialIconButton({
  platform,
  url,
  size = 36,
}: SocialIconButtonProps) {
  const Icon = ICONS[platform];
  return (
    <ButtonBase
      component="a"
      href={url}
      target="_blank"
      rel="noopener noreferrer"
      aria-label={LABELS[platform]}
      sx={{
        width: size,
        height: size,
        borderRadius: '50%',
        bgcolor: portalTokens.color.ink,
        color: portalTokens.color.surface,
        transition: 'transform 0.18s ease, background-color 0.18s ease',
        '&:hover': {
          transform: 'translateY(-1px)',
          bgcolor: portalTokens.color.brandOrange,
        },
        '&:focus-visible': {
          outline: `2px solid ${portalTokens.color.brandOrange}`,
          outlineOffset: 2,
        },
      }}
    >
      <Icon sx={{ fontSize: size * 0.52 }} />
    </ButtonBase>
  );
}
