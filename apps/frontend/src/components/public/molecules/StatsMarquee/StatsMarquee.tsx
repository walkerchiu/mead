'use client';

import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';

import type { PlanStat } from '@/types/plan';

export interface StatsMarqueeProps {
  /** 計畫數據成果 */
  stats: PlanStat[];
}

/**
 * StatsMarquee — 卡片二左側窄欄的數據成果，垂直連續上滾跑馬燈（依設計師新版稿）。
 *
 * 因新版卡片高度縮減、數據改置於窄欄（依 Figma node 1:120「Stats Grid」，欄寬 185、
 * 項目間距 31、數字 Inter ExtraBold 24px、單位 8.345px、說明 7.153px #666 置中），
 * 內容高於可視高度，故以無縫循環方式向上滾動。將整份清單複製一份相接，位移 0 →
 * -50%（一份高度）即可無縫循環；hover 暫停；prefers-reduced-motion 時不滾動、改可捲動。
 */
export function StatsMarquee({ stats }: StatsMarqueeProps) {
  if (stats.length === 0) return null;

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
        // 用每項 margin-bottom（而非 track 的 gap/py）讓兩份相接的間距完全一致，
        // translateY -50% 恰等於一份高度 → 無縫循環、迴圈時不跳動。
        mb: '31px',
      }}
    >
      <Typography
        component="p"
        sx={{
          fontSize: 26,
          fontWeight: 800,
          lineHeight: 1.1,
          color: '#000000',
        }}
      >
        {stat.value}
      </Typography>
      <Typography
        component="p"
        sx={{ fontSize: 14, lineHeight: 1.3, color: '#000000' }}
      >
        {stat.unit}
      </Typography>
      <Typography
        component="p"
        sx={{ fontSize: 11, lineHeight: 1.4, color: '#666666' }}
      >
        {stat.description}
      </Typography>
    </Box>
  );

  return (
    <Box
      aria-label="計畫數據成果"
      sx={{
        position: 'relative',
        height: '100%',
        overflow: 'hidden',
        // 上下淡出遮罩，讓進出視窗的數據柔和淡入淡出（非硬切）。
        maskImage:
          'linear-gradient(to bottom, transparent 0, #000 14%, #000 86%, transparent 100%)',
        WebkitMaskImage:
          'linear-gradient(to bottom, transparent 0, #000 14%, #000 86%, transparent 100%)',
        '&:hover .stats-marquee-track': { animationPlayState: 'paused' },
        '@keyframes statsMarqueeUp': {
          from: { transform: 'translateY(0)' },
          to: { transform: 'translateY(-50%)' },
        },
        '@media (prefers-reduced-motion: reduce)': {
          overflowY: 'auto',
          maskImage: 'none',
          WebkitMaskImage: 'none',
        },
      }}
    >
      <Box
        className="stats-marquee-track"
        sx={{
          // 絕對定位：track 不貢獻外層高度，外層改由 flex 拉伸對齊 banner 高度後裁切，
          // 避免內容（5 數據）把整列撐高、壓垮 banner 比例。
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          display: 'flex',
          flexDirection: 'column',
          willChange: 'transform',
          animation: `statsMarqueeUp ${durationSec}s linear infinite`,
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
