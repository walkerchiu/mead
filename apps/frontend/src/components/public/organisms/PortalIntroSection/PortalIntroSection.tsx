'use client';

import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';

import { portalTokens } from '../../tokens';

export interface PortalIntroSectionProps {
  /** 上方小標，預設「教育部藝術設計三大計畫」 */
  eyebrow?: string;
  /** 主標題，預設「為台灣藝術設計開啟更多可能」 */
  heading?: string;
}

/**
 * PortalIntroSection — 入口網主標題區塊。
 *
 * 置中的小標 + 大標題，承接 hero 文字雲、引出下方計畫輪播。
 */
export function PortalIntroSection({
  eyebrow = '教育部藝術設計三大計畫',
  heading = '為台灣藝術設計開啟更多可能',
}: PortalIntroSectionProps) {
  return (
    <Box sx={{ textAlign: 'center', px: 3 }}>
      {/* 小標 — 依 Figma node 1:234（Inter Medium 14px / 1.8 / 黑） */}
      <Typography
        component="p"
        sx={{
          fontSize: 12,
          fontWeight: 500,
          lineHeight: 1.8,
          color: '#000000',
          [portalTokens.mq.tabletUp]: { fontSize: 14 },
        }}
      >
        {eyebrow}
      </Typography>
      {/* 主標 — 依 Figma node 1:233（Inter Medium 24px / 1.8 / 字距 3.36px）；
          與小標間距依設計稿約 77px（<834px 約 53px） */}
      <Typography
        // key 隨 heading 變動 → 切換計畫 slogan 時以淡入過場呈現
        key={heading}
        // 首頁主標題（無障礙：每頁需有單一 h1）
        component="h1"
        sx={{
          mt: '53px',
          fontSize: 20,
          fontWeight: 500,
          lineHeight: 1.8,
          letterSpacing: '0.14em',
          color: '#000000',
          [portalTokens.mq.tabletUp]: { mt: '77px', fontSize: 24 },
          animation: 'portalHeadingFade 0.45s ease',
          '@keyframes portalHeadingFade': {
            from: { opacity: 0 },
            to: { opacity: 1 },
          },
          '@media (prefers-reduced-motion: reduce)': { animation: 'none' },
        }}
      >
        {heading}
      </Typography>
    </Box>
  );
}
