'use client';

import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';

import { portalTokens } from '../../tokens';

export interface PortalNarrativeSectionProps {
  /** 前導段落 — 小字、靠左 */
  leadParagraph?: string;
  /** 重點標語 — 大字、靠右偏移 */
  statement?: string;
  /** 收尾段落（第一段）— 小字、靠左 */
  trailParagraph?: string;
  /** 收尾段落（第二段）— 小字、靠左，接續第一段 */
  trailParagraph2?: string;
}

/** 前導 / 收尾段落共用樣式 — 依 Figma node 1:41 / 1:42（Inter Regular 14px / 1.8） */
const bodySx = {
  fontSize: 14,
  lineHeight: 1.8,
  color: '#000000',
} as const;

/**
 * PortalNarrativeSection — 計畫敘事區塊（依 Figma node 1:2 敘事段）。
 *
 * 「前導段落 → 重點標語 → 收尾段落」的編輯式錯落排版：前導與收尾為靠左
 * 窄欄小字，重點標語為靠右偏移的中字。各段間距依設計稿留白。
 */
export function PortalNarrativeSection({
  leadParagraph,
  statement,
  trailParagraph,
  trailParagraph2,
}: PortalNarrativeSectionProps) {
  return (
    <Box
      sx={{
        maxWidth: portalTokens.layout.maxWidth,
        mx: 'auto',
        px: `${portalTokens.layout.gutter}px`,
      }}
    >
      {/* 內容帶寬對齊計畫卡片（Figma 卡片寬 772） */}
      <Box sx={{ maxWidth: 772, mx: 'auto' }}>
        {/* 前導段落 — 靠左窄欄（Figma node 1:41） */}
        {leadParagraph && (
          <Typography
            component="p"
            sx={{
              ...bodySx,
              maxWidth: 411,
              [portalTokens.mq.tabletUp]: { ml: '10.1%' },
            }}
          >
            {leadParagraph}
          </Typography>
        )}

        {/* 重點標語 — 靠右偏移、中字（Figma node 1:43） */}
        {statement && (
          <Typography
            component="p"
            sx={{
              mt: 6,
              maxWidth: 362,
              fontSize: 18,
              fontWeight: 500,
              lineHeight: 1.8,
              color: '#000000',
              [portalTokens.mq.tabletUp]: {
                mt: '177px',
                ml: 'auto',
                mr: '7.8%',
                fontSize: 21,
              },
            }}
          >
            {statement}
          </Typography>
        )}

        {/* 收尾段落 — 靠左窄欄，兩段接續（Figma node 1:42） */}
        {(trailParagraph || trailParagraph2) && (
          <Box
            sx={{
              mt: 6,
              maxWidth: 411,
              [portalTokens.mq.tabletUp]: { mt: '151px', ml: '10.1%' },
            }}
          >
            {trailParagraph && (
              <Typography component="p" sx={bodySx}>
                {trailParagraph}
              </Typography>
            )}
            {trailParagraph2 && (
              <Typography component="p" sx={bodySx}>
                {trailParagraph2}
              </Typography>
            )}
          </Box>
        )}
      </Box>
    </Box>
  );
}
