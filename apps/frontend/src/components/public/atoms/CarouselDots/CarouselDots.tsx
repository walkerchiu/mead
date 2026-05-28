'use client';

import Box from '@mui/material/Box';

import { portalTokens } from '../../tokens';

/**
 * 三個指示點的形狀 — 依 Figma node 1:2 的 Star 90/91/92，與 hero 文字雲三圖形
 * 一致：① 微鋸齒星形 ② 近圓多邊形 ③ 六邊形。
 */
const DOT_SHAPES = [
  { rotation: 8, sides: 16, innerRatio: 0.93 },
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
  /** 指示點尺寸（px），預設 28（依 Figma node 1:44 Star 90/91/92） */
  size?: number;
  /** 每個指示點對應的可讀名稱（如「教育部藝術與設計菁英海外培訓計畫」），
   *  作為 aria-label 提供給讀屏使用者；未提供時退回「第 N 個計畫」。 */
  labels?: readonly string[];
  /** 整組指示點的可讀區塊標籤，作為 nav landmark 的 aria-label。 */
  ariaLabel?: string;
}

/**
 * CarouselDots — 入口網輪播指示點。
 *
 * 依設計稿（node 1:2 的 Star 90/91/92），三個指示點為三種不同形狀
 * （與 hero 文字雲一致）：微鋸齒星形、近圓多邊形、六邊形。
 * 作用中為品牌橘實心、其餘為深色實心。
 *
 * 語意：原本套 `role="tablist"` 但沒有對應的 tabpanel 與鍵盤模式，反而不合
 * ARIA Authoring Practices。改用 `<nav>` + `<button aria-current>`（WAI 推薦
 * 用於非 tablist 切換器）— 讀屏會唸出「目前頁面/項目」狀態，鍵盤也走原生
 * button 行為，毋需自訂 ←→ 處理。
 */
export function CarouselDots({
  count,
  activeIndex,
  onSelect,
  size = 28,
  labels,
  ariaLabel = '計畫輪播',
}: CarouselDotsProps) {
  return (
    <Box
      component="nav"
      aria-label={ariaLabel}
      sx={{ display: 'inline-flex', alignItems: 'center', gap: 2 }}
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
              bgcolor: active
                ? portalTokens.color.brandOrange
                : portalTokens.color.ink,
              transition: 'opacity 0.2s ease, transform 0.2s ease',
              '&:hover': { opacity: active ? 1 : 0.7 },
              '&:focus-visible': portalTokens.focusRing,
            }}
          />
        );
      })}
    </Box>
  );
}
