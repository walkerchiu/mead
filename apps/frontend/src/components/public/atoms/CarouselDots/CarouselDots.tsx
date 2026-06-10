'use client';

import Box from '@mui/material/Box';

import { portalTokens } from '../../tokens';

/**
 * 三個指示點的形狀 — 與 hero 文字雲三圖形（DecorativeTextCloud 的 SHAPE_META）
 * 完全一致，即設計稿三計畫的標記：① 微鋸齒星形（菁培）② 近圓多邊形（設計戰國策）
 * ③ 六邊形（創意設計大賽）。數值需與 hero 同步以維持視覺一致。
 */
const DOT_SHAPES = [
  { rotation: 8, sides: 11, innerRatio: 0.89 },
  { rotation: 14, sides: 13, innerRatio: 1 },
  { rotation: 0, sides: 6, innerRatio: 1 },
] as const;

/** 產生單一指示點形狀的 clip-path（百分比座標；正多邊形或鋸齒星形） */
function dotClip(shape: (typeof DOT_SHAPES)[number]): string {
  const base = (shape.rotation * Math.PI) / 180 - Math.PI / 2;
  if (shape.innerRatio >= 1) {
    const pts = Array.from({ length: shape.sides }, (_, i) => {
      const a = base + (i / shape.sides) * Math.PI * 2;
      return `${(50 + 50 * Math.cos(a)).toFixed(1)}% ${(50 + 50 * Math.sin(a)).toFixed(1)}%`;
    });
    return `polygon(${pts.join(', ')})`;
  }
  const n = shape.sides * 2;
  const pts = Array.from({ length: n }, (_, i) => {
    const r = i % 2 === 0 ? 50 : 50 * shape.innerRatio;
    const a = base + (i / n) * Math.PI * 2;
    return `${(50 + r * Math.cos(a)).toFixed(1)}% ${(50 + r * Math.sin(a)).toFixed(1)}%`;
  });
  return `polygon(${pts.join(', ')})`;
}

/** 預先算好三種形狀的 clip-path */
const DOT_CLIPS = DOT_SHAPES.map(dotClip);

export interface CarouselDotsProps {
  /** 指示點總數 */
  count: number;
  /** 目前作用中的索引 */
  activeIndex: number;
  /** 點擊指示點的回呼 */
  onSelect?: (index: number) => void;
  /** 指示點尺寸（px），預設 16（依 Figma node 1:44 Star 90/91/92） */
  size?: number;
  /** 每個指示點對應的可讀名稱（如「臺灣國際學生創意設計大賽」），
   *  作為 aria-label 提供給讀屏使用者；未提供時退回「第 N 個計畫」。 */
  labels?: readonly string[];
  /** 整組指示點的可讀區塊標籤，作為 nav landmark 的 aria-label。 */
  ariaLabel?: string;
}

/**
 * CarouselDots — 入口網輪播指示點，置於計畫卡片下方顯示目前位置。
 *
 * 依設計稿（node 1:2 的 Star 90/91/92），三個指示點為三種不同形狀（與各計畫標記
 * 呼應）：微鋸齒星形、近圓多邊形、六邊形。作用中為品牌橘實心、其餘為淺灰實心。
 *
 * 語意：用 `<nav>` + `<button aria-current>`（WAI 推薦的非 tablist 切換器寫法）—
 * 讀屏會唸出「目前項目」狀態，鍵盤走原生 button 行為。
 */
export function CarouselDots({
  count,
  activeIndex,
  onSelect,
  size = 16,
  labels,
  ariaLabel = '計畫輪播',
}: CarouselDotsProps) {
  return (
    <Box
      component="nav"
      aria-label={ariaLabel}
      sx={{ display: 'inline-flex', alignItems: 'center', gap: '12px' }}
    >
      {Array.from({ length: count }, (_, i) => {
        const active = i === activeIndex;
        const label = labels?.[i] ?? `第 ${i + 1} 個計畫`;
        return (
          <Box
            key={i}
            component="button"
            type="button"
            aria-current={active ? 'true' : undefined}
            aria-label={label}
            onClick={() => onSelect?.(i)}
            sx={{
              p: 0,
              border: 'none',
              cursor: onSelect ? 'pointer' : 'default',
              width: size,
              height: size,
              // 每個指示點對應一種形狀（依序循環）
              clipPath: DOT_CLIPS[i % DOT_CLIPS.length],
              // 作用中：品牌橘；其餘：淺灰（依設計稿 #B2B2B2）
              bgcolor: active ? portalTokens.color.brandOrange : '#B2B2B2',
              transition: 'background-color 0.3s ease, opacity 0.2s ease',
              '&:hover': { opacity: active ? 1 : 0.7 },
              '&:focus-visible': portalTokens.focusRing,
            }}
          />
        );
      })}
    </Box>
  );
}
