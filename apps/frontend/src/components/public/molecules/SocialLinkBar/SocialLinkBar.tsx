'use client';

import Box from '@mui/material/Box';

import type { PlanSocialLink } from '@/types/plan';

import { LearnMoreButton } from '../../atoms/LearnMoreButton';
import {
  SocialIconButton,
  resolveSocialPlatform,
} from '../../atoms/SocialIconButton';

export interface SocialLinkBarProps {
  /** 社群連結 */
  socialLinks: PlanSocialLink[];
  /** 是否顯示「了解更多」按鈕，預設 true */
  showLearnMore?: boolean;
  /** 「了解更多」文字 */
  learnMoreLabel?: string;
  /** 「了解更多」連結網址（與 onLearnMore 擇一） */
  learnMoreHref?: string;
  /** 「了解更多」點擊回呼 */
  onLearnMore?: () => void;
}

/**
 * SocialLinkBar — 社群圖示列 + 「了解更多」按鈕。
 *
 * 依 Figma node 1:145：社群圖示置於半透明白色膠囊（毛玻璃）內；
 * 「了解更多」白色圓角按鈕傾斜 -4.86°、疊在膠囊右側並略為突出。
 */
export function SocialLinkBar({
  socialLinks,
  showLearnMore = true,
  learnMoreLabel,
  learnMoreHref,
  onLearnMore,
}: SocialLinkBarProps) {
  return (
    <Box
      sx={{
        position: 'relative',
        display: 'inline-flex',
        alignItems: 'center',
      }}
    >
      {/* 半透明白色膠囊 — 依 Figma node 1:146 */}
      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          gap: 1,
          height: 57,
          pl: 2.75,
          // 顯示按鈕時，右側預留空間供按鈕疊放
          pr: showLearnMore ? '108px' : 2.75,
          borderRadius: '28.5px',
          bgcolor: 'rgba(255, 255, 255, 0.54)',
          border: '1px solid rgba(255, 255, 255, 0.49)',
          backdropFilter: 'blur(28px)',
          WebkitBackdropFilter: 'blur(28px)',
        }}
      >
        {socialLinks.map((link) => (
          <SocialIconButton
            key={`${link.platform}-${link.url}`}
            platform={resolveSocialPlatform(link.platform)}
            url={link.url}
          />
        ))}
      </Box>

      {/* 了解更多 — 疊在膠囊右側、傾斜 -4.86°（依 Figma node 1:153） */}
      {showLearnMore && (
        <Box
          sx={{
            position: 'absolute',
            right: -24,
            top: '50%',
            transform: 'translateY(-50%)',
            zIndex: 1,
          }}
        >
          <LearnMoreButton
            label={learnMoreLabel}
            href={learnMoreHref}
            onClick={onLearnMore}
            tilt={-4.86}
          />
        </Box>
      )}
    </Box>
  );
}
