'use client';

import Box from '@mui/material/Box';

import { PLAN_SHAPE_CLIPS } from '../../planShapes';
import { portalTokens } from '../../tokens';

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
              // 每個指示點對應一種計畫形狀（依序循環）
              clipPath: PLAN_SHAPE_CLIPS[i % PLAN_SHAPE_CLIPS.length],
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
