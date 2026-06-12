'use client';

import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';

import type { PlanStat } from '@/types/plan';

export interface StatsMarqueeProps {
  /** 計畫數據成果 */
  stats: PlanStat[];
  /**
   * 滾動方向：
   *  - `vertical`（預設）：窄欄內垂直上滾 — 桌機卡片二左側窄欄。
   *  - `horizontal`：寬橫條內向左滾 — 手機卡片二下方數據列。
   */
  direction?: 'vertical' | 'horizontal';
}

/**
 * StatsMarquee — 計畫數據成果連續滾動跑馬燈（依設計師新版稿）。
 *
 * 內容多於可視範圍時以無縫循環滾動呈現，畫面更輕、不壓縮版面。
 * 將整份清單複製一份相接，位移 0 → -50%（一份長度）即可無縫循環；
 * hover 暫停；prefers-reduced-motion 時不滾動、改為可捲動。
 *
 * 兩種方向（依 Figma node 1:120「Stats Grid」：數字 Inter ExtraBold、單位、
 * 說明 #666 置中）：垂直用於桌機窄欄（translateY、項目下間距）；
 * 水平用於手機寬橫條（translateX、項目右間距、左右淡出遮罩）。
 */
export function StatsMarquee({
  stats,
  direction = 'vertical',
}: StatsMarqueeProps) {
  if (stats.length === 0) return null;

  const horizontal = direction === 'horizontal';

  // 滾動速度：每筆約 2.6s，整體隨筆數成長，維持穩定觀感。
  const durationSec = Math.max(12, stats.length * 2.6);

  const renderItem = (stat: PlanStat, key: string) => (
    <Box
      key={key}
      sx={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: '7.15px',
        textAlign: 'center',
        flexShrink: 0,
        // 用每項固定 margin（而非 track 的 gap/padding）讓兩份相接的間距完全一致，
        // 位移 -50% 恰等於一份長度 → 無縫循環、迴圈時不跳動。
        ...(horizontal ? { mr: '40px', minWidth: 92 } : { mb: '31px' }),
      }}
    >
      <Typography
        component="p"
        sx={{
          fontSize: horizontal ? 24 : 26,
          fontWeight: 800,
          lineHeight: horizontal ? 1.2 : 1.1,
          color: '#000000',
        }}
      >
        {stat.value}
      </Typography>
      <Typography
        component="p"
        sx={{
          fontSize: horizontal ? 12 : 14,
          lineHeight: 1.3,
          color: '#000000',
        }}
      >
        {stat.unit}
      </Typography>
      <Typography
        component="p"
        sx={{
          fontSize: horizontal ? 12 : 11,
          lineHeight: 1.4,
          color: '#666666',
        }}
      >
        {stat.description}
      </Typography>
    </Box>
  );

  const maskGradient = horizontal
    ? 'linear-gradient(to right, transparent 0, #000 8%, #000 92%, transparent 100%)'
    : 'linear-gradient(to bottom, transparent 0, #000 14%, #000 86%, transparent 100%)';

  return (
    <Box
      aria-label="計畫數據成果"
      sx={{
        position: 'relative',
        overflow: 'hidden',
        // 垂直需撐滿父容器高度後裁切；水平則由內容決定高度、滿寬即可。
        ...(horizontal ? { width: '100%' } : { height: '100%' }),
        // 進出視窗的數據柔和淡入淡出（非硬切）。
        maskImage: maskGradient,
        WebkitMaskImage: maskGradient,
        '&:hover .stats-marquee-track': { animationPlayState: 'paused' },
        '@keyframes statsMarqueeUp': {
          from: { transform: 'translateY(0)' },
          to: { transform: 'translateY(-50%)' },
        },
        '@keyframes statsMarqueeLeft': {
          from: { transform: 'translateX(0)' },
          to: { transform: 'translateX(-50%)' },
        },
        '@media (prefers-reduced-motion: reduce)': {
          [horizontal ? 'overflowX' : 'overflowY']: 'auto',
          maskImage: 'none',
          WebkitMaskImage: 'none',
        },
      }}
    >
      <Box
        className="stats-marquee-track"
        sx={{
          display: 'flex',
          willChange: 'transform',
          animation: `${
            horizontal ? 'statsMarqueeLeft' : 'statsMarqueeUp'
          } ${durationSec}s linear infinite`,
          ...(horizontal
            ? {
                flexDirection: 'row',
                width: 'max-content',
              }
            : {
                // 絕對定位：track 不貢獻外層高度，外層改由 flex 拉伸對齊 banner 高度後裁切，
                // 避免內容把整列撐高、壓垮 banner 比例。
                position: 'absolute',
                top: 0,
                left: 0,
                right: 0,
                flexDirection: 'column',
              }),
          '@media (prefers-reduced-motion: reduce)': {
            position: 'static',
            animation: 'none',
          },
        }}
      >
        {/* 兩份相接以無縫循環；第二份對讀屏隱藏避免重複朗讀 */}
        {stats.map((s, i) => renderItem(s, `a-${i}`))}
        <Box aria-hidden sx={{ display: 'contents' }}>
          {stats.map((s, i) => renderItem(s, `b-${i}`))}
        </Box>
      </Box>
    </Box>
  );
}
