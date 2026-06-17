'use client';

import type { ReactNode } from 'react';

import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';

import { portalTokens } from '../../tokens';

export interface PortalNarrativeSectionProps {
  /** 區塊標題 — ≥834px 以直書置於右側 */
  heading: string;
  /** 前導段落 */
  intro?: ReactNode;
  /** 主文段落（依序排列，每段一個元素；可含行內連結等節點） */
  paragraphs?: readonly ReactNode[];
  /**
   * 收束標記的互動設定。提供時，標記呈現「目前 active 計畫」的標記多邊形
   * （與卡片下方 active 導覽點同形狀）；hover 變形為「下一個計畫」的多邊形並放大
   * （純視覺、不可點）。
   */
  planMarker?: {
    /** 目前 active 計畫的形狀 clip-path（標記預設形狀）。 */
    currentShapeClip: string;
    /** 下一個計畫的形狀 clip-path（hover 預覽）。 */
    nextShapeClip: string;
  };
}

/** 內文段落共用樣式（Inter / Noto Sans TC Regular 14px、行高 1.8） */
// 手機窄欄靠左：justify 在窄欄（且含行內計畫名連結）會把字距拉得不均；
// ≥834px 內文較寬，維持兩端對齊。
// lineBreak: strict — 套用中文禁則：開引號「（不留行尾、收尾標點」）、，。不落行首，
// 避免標點被孤立換行。
const bodySx = {
  // 流體字級：隨視窗寬在可讀範圍內微縮放（比照第二屏的可視大小調整，但設上下限
  // 避免過大／過小傷可讀性）。基準 14px（≈1440 寬），下限 14、上限 16.5。
  fontSize: 'clamp(14px, 1.02vw, 16.5px)',
  lineHeight: 1.8,
  color: '#000000',
  textAlign: 'left',
  lineBreak: 'strict',
  wordBreak: 'normal',
  [portalTokens.mq.tabletUp]: { textAlign: 'justify' },
} as const;

/**
 * PortalNarrativeSection — 三大計畫敘事區塊。
 *
 * ≥834px：右側以直書呈現區塊標題（CJK 字元正立），左側為單欄內文（前導段落
 * 接續主文各段）；右下角一枚品牌橘圓點作為收束標記。
 * <834px：標題改為橫書置頂，內文於其下單欄排列。
 */
export function PortalNarrativeSection({
  heading,
  intro,
  paragraphs = [],
  planMarker,
}: PortalNarrativeSectionProps) {
  return (
    <Box
      component="section"
      aria-labelledby="portal-narrative-heading"
      sx={{
        maxWidth: portalTokens.layout.maxWidth,
        mx: 'auto',
        // 手機版左右邊界對齊 footer（48px，依設計稿）；≥834px 回到頁面 gutter。
        px: '48px',
        [portalTokens.mq.tabletUp]: { px: `${portalTokens.layout.gutter}px` },
      }}
    >
      {/* 內容帶寬對齊計畫卡片（展開卡寬 960） */}
      {/* ≥834px：依設計稿 node 1:2 — 內文（寬 493）與直書標題分置兩端，左右各內縮
          約 77px（960 的 8%），中間留白由 space-between 形成。 */}
      <Box
        sx={{
          maxWidth: 960,
          mx: 'auto',
          display: 'flex',
          flexDirection: 'column',
          gap: 4,
          [portalTokens.mq.tabletUp]: {
            flexDirection: 'row',
            alignItems: 'stretch',
            justifyContent: 'space-between',
            gap: 0,
            // 左右各內縮 77px（依設計稿 node 1:2：內文距卡片左緣、標題距右緣皆 77px）。
            px: '77px',
          },
        }}
      >
        {/* 內文欄 — 前導段落 + 主文各段 */}
        <Box
          sx={{
            flex: 1,
            maxWidth: 560,
            [portalTokens.mq.tabletUp]: { flex: '0 1 493px', maxWidth: 493 },
          }}
        >
          {intro && (
            <Typography component="p" sx={bodySx}>
              {intro}
            </Typography>
          )}
          {paragraphs.map((para, i) => (
            <Typography
              key={i}
              component="p"
              sx={{ ...bodySx, mt: intro || i > 0 ? '1.8em' : 0 }}
            >
              {para}
            </Typography>
          ))}
        </Box>

        {/* 標題欄 — ≥834px 直書置右、橘圓點收於底；<834px 橫書置頂 */}
        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            order: -1,
            [portalTokens.mq.tabletUp]: {
              order: 0,
              flexDirection: 'column',
              // 標題與標記形狀共用中心軸對齊（形狀較寬時不致偏向一側）。
              alignItems: 'center',
              flexShrink: 0,
            },
          }}
        >
          <Typography
            id="portal-narrative-heading"
            component="h2"
            sx={{
              fontSize: 18,
              fontWeight: 500,
              letterSpacing: '0.18em',
              color: '#000000',
              [portalTokens.mq.tabletUp]: {
                writingMode: 'vertical-rl',
                textOrientation: 'upright',
                // 流體字級：隨視窗在可讀範圍內微縮放（基準 21px、下限 20、上限 26）。
                fontSize: 'clamp(20px, 1.5vw, 26px)',
                lineHeight: 1,
              },
            }}
          >
            {heading}
          </Typography>
          {/* 收束標記 — 預設呈現目前 active 計畫的標記多邊形（與卡片下方 active
              導覽點同形狀）；hover 變形為下一個計畫的多邊形並放大（純視覺、不可點）。 */}
          {planMarker ? (
            <Box
              aria-hidden
              sx={{
                // 收束橘點僅桌機顯示（手機版不呈現此色塊）。
                display: 'none',
                flexShrink: 0,
                lineHeight: 0,
                [portalTokens.mq.tabletUp]: { display: 'block', mt: 'auto' },
                '&:hover .portal-narrative-dot': {
                  clipPath: planMarker.nextShapeClip,
                  transform: 'scale(1.2)',
                },
              }}
            >
              <Box
                className="portal-narrative-dot"
                aria-hidden
                sx={{
                  width: 16,
                  height: 16,
                  bgcolor: portalTokens.color.brandOrange,
                  // 預設形狀 = 目前 active 計畫的標記多邊形
                  clipPath: planMarker.currentShapeClip,
                  transition:
                    'transform 0.28s cubic-bezier(0.22, 1, 0.36, 1), clip-path 0.28s ease',
                  [portalTokens.mq.tabletUp]: { width: 28, height: 28 },
                  '@media (prefers-reduced-motion: reduce)': {
                    transition: 'none',
                  },
                }}
              />
            </Box>
          ) : (
            <Box
              aria-hidden
              sx={{
                // 收束橘點僅桌機顯示（手機版不呈現此色塊）。
                display: 'none',
                flexShrink: 0,
                width: 16,
                height: 16,
                borderRadius: '50%',
                bgcolor: portalTokens.color.brandOrange,
                [portalTokens.mq.tabletUp]: {
                  display: 'block',
                  width: 28,
                  height: 28,
                  mt: 'auto',
                },
              }}
            />
          )}
        </Box>
      </Box>
    </Box>
  );
}
