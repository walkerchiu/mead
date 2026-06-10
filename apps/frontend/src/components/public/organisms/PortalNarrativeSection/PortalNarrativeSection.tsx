'use client';

import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';

import { portalTokens } from '../../tokens';

export interface PortalNarrativeSectionProps {
  /** 區塊標題 — ≥834px 以直書置於右側 */
  heading: string;
  /** 前導段落 */
  intro?: string;
  /** 主文段落（依序排列，每段一個元素） */
  paragraphs?: readonly string[];
}

/** 內文段落共用樣式（Inter / Noto Sans TC Regular 14px、行高 1.8、兩端對齊） */
const bodySx = {
  fontSize: 14,
  lineHeight: 1.8,
  color: '#000000',
  textAlign: 'justify',
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
}: PortalNarrativeSectionProps) {
  return (
    <Box
      component="section"
      aria-labelledby="portal-narrative-heading"
      sx={{
        maxWidth: portalTokens.layout.maxWidth,
        mx: 'auto',
        px: `${portalTokens.layout.gutter}px`,
      }}
    >
      {/* 內容帶寬對齊計畫卡片（展開卡寬 960） */}
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
            gap: '72px',
          },
        }}
      >
        {/* 內文欄 — 前導段落 + 主文各段 */}
        <Box
          sx={{
            flex: 1,
            maxWidth: 560,
            [portalTokens.mq.tabletUp]: { ml: '6.5%' },
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
              alignItems: 'flex-end',
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
                fontSize: 21,
                lineHeight: 1,
              },
            }}
          >
            {heading}
          </Typography>
          {/* 收束標記 — 品牌橘圓點（裝飾性） */}
          <Box
            aria-hidden
            sx={{
              flexShrink: 0,
              width: 16,
              height: 16,
              borderRadius: '50%',
              bgcolor: portalTokens.color.brandOrange,
              [portalTokens.mq.tabletUp]: { width: 28, height: 28, mt: 'auto' },
            }}
          />
        </Box>
      </Box>
    </Box>
  );
}
