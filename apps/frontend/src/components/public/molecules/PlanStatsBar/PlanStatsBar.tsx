'use client';

import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';

import type { PlanStat } from '@/types/plan';

import { portalTokens } from '../../tokens';

export interface PlanStatsBarProps {
  /** 計畫數據成果 */
  stats: PlanStat[];
}

/**
 * PlanStatsBar — 計畫數據成果橫列。
 *
 * 規格依 Figma node 1:120「Stats Grid」：
 * 數值 Inter ExtraBold 24px、單位 Regular 8.3px、說明 Regular 7.1px #666，
 * 欄內元素間距 7.15px、置中，欄間以細分隔線區隔。
 * 響應式（依設計稿）：<420px 兩欄、420–834px 三欄、≥834px 單列等寬；
 * 末項自動橫跨該列剩餘欄數（依手機／平板設計稿 — 最後一筆填滿整列）。
 */
export function PlanStatsBar({ stats }: PlanStatsBarProps) {
  if (stats.length === 0) return null;

  // 末項在各斷點要橫跨的欄數 — 填滿其所在列的剩餘空間
  const lastIdx = stats.length - 1;
  const lastSpan2 = 2 - (lastIdx % 2);
  const lastSpan3 = 3 - (lastIdx % 3);

  return (
    <Box
      sx={{
        display: 'grid',
        gridTemplateColumns: 'repeat(2, 1fr)',
        rowGap: 2.5,
        [portalTokens.mq.mobileUp]: {
          gridTemplateColumns: 'repeat(3, 1fr)',
        },
        [portalTokens.mq.tabletUp]: {
          gridTemplateColumns: `repeat(${stats.length}, 1fr)`,
          rowGap: 0,
        },
      }}
    >
      {stats.map((stat, i) => {
        const isLast = i === lastIdx;
        return (
          <Box
            key={`${stat.value}-${i}`}
            sx={{
              px: 1.5,
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: '7.15px',
              textAlign: 'center',
              // 分隔線：每列首欄不帶、其餘帶（依當前斷點欄數）
              borderLeft: i % 2 === 1 ? '1px solid #ececec' : 'none',
              // 末項橫跨該列剩餘欄數
              ...(isLast && { gridColumn: `span ${lastSpan2}` }),
              [portalTokens.mq.mobileUp]: {
                borderLeft: i % 3 !== 0 ? '1px solid #ececec' : 'none',
                ...(isLast && { gridColumn: `span ${lastSpan3}` }),
              },
              [portalTokens.mq.tabletUp]: {
                borderLeft: i === 0 ? 'none' : '1px solid #ececec',
                ...(isLast && { gridColumn: 'span 1' }),
              },
            }}
          >
            <Typography
              component="p"
              sx={{
                fontSize: 24,
                fontWeight: 800,
                lineHeight: 'normal',
                color: '#000000',
              }}
            >
              {stat.value}
            </Typography>
            <Typography
              component="p"
              sx={{
                // WCAG 1.4.4 Resize Text：原 8.3px 太小、12px 為最低門檻。
                fontSize: 12,
                fontWeight: 400,
                lineHeight: 1.3,
                color: '#000000',
              }}
            >
              {stat.unit}
            </Typography>
            <Typography
              component="p"
              sx={{
                // 原 7.15px 太小；#666 on #FFF ≈ 5.74:1 OK 但字級放大至 12。
                fontSize: 12,
                fontWeight: 400,
                lineHeight: 1.4,
                color: '#5C5C5C',
              }}
            >
              {stat.description}
            </Typography>
          </Box>
        );
      })}
    </Box>
  );
}
