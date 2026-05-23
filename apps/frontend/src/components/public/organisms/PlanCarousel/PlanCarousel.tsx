'use client';

import { useCallback, useEffect, useState } from 'react';

import Box from '@mui/material/Box';

import type { Plan } from '@/types/plan';

import { portalTokens } from '../../tokens';
import { PlanCard } from '../PlanCard';

/**
 * 卡片周圍裝飾星形照片的位置（相對卡片左上角的 px，依各計畫 Figma 桌機稿
 * node 1:2 / 23:21 / 31:215 的 Star 95 / 94 / 93）。
 */
const DECOR_STARS: Record<string, { x: number; y: number }[]> = {
  sposad: [
    { x: 527, y: -91 },
    { x: -166, y: 214 },
    { x: 619, y: 274 },
  ],
  idc: [
    { x: -56, y: -91 },
    { x: -166, y: 270 },
    { x: 613, y: 163 },
  ],
  tisdc: [
    { x: 89, y: -112 },
    { x: -163, y: 163 },
    { x: 618, y: 249 },
  ],
};
/** 裝飾星形尺寸（Figma 為 297px） */
const STAR_SIZE = 292;

/** 鋸齒星形 clip-path（12 角，淺鋸齒 — 依設計稿卡片周圍照片） */
const STAR_CLIP = (() => {
  const n = 24;
  const pts = Array.from({ length: n }, (_, i) => {
    const r = i % 2 === 0 ? 50 : 45;
    const a = ((-90 + (i * 360) / n) * Math.PI) / 180;
    return `${(50 + r * Math.cos(a)).toFixed(1)}% ${(50 + r * Math.sin(a)).toFixed(1)}%`;
  });
  return `polygon(${pts.join(', ')})`;
})();

export interface PlanCarouselProps {
  /** 三大計畫 */
  plans: Plan[];
  /** 目前作用中的計畫索引（受控） */
  activeIndex: number;
  /** 作用索引變更回呼 */
  onActiveIndexChange: (index: number) => void;
  /** 自動輪播間隔（ms），0 表示停用，預設 7000 */
  autoRotateMs?: number;
  /** 滑入 / 滑出卡片的回呼 — 供主標切換為該計畫 slogan 使用 */
  onHoverChange?: (hovered: boolean) => void;
}

/**
 * 兩側相鄰計畫卡片預覽的共用樣式 — 半透明毛玻璃矩形，僅露出約 40px
 * （依 Figma node 1:2 頁面兩側可見的豎立白色矩形）。
 */
const PEEK_BASE = {
  display: 'none',
  position: 'absolute',
  top: 0,
  bottom: 0,
  width: 760,
  p: 0,
  borderRadius: '17.35px',
  bgcolor: 'rgba(255, 255, 255, 0.54)',
  border: '1px solid rgba(138, 138, 138, 0.49)',
  backdropFilter: 'blur(28.34px)',
  WebkitBackdropFilter: 'blur(28.34px)',
  cursor: 'pointer',
  zIndex: 0,
  [portalTokens.mq.tabletUp]: { display: 'block' },
};

/** 取得計畫的本機照片路徑 */
function localPhotos(plan: Plan): string[] {
  return plan.photos
    .filter((p) => p.type === 'local' && p.src)
    .map((p) => p.src as string);
}

/**
 * PlanCarousel — 三大計畫輪播。
 *
 * 中央為作用計畫的 PlanCard，卡片周圍依各計畫的 Figma 桌機稿擺放
 * 三張星形裁切的計畫照片；下方為指示點。支援自動輪播（hover 時暫停）。
 */
export function PlanCarousel({
  plans,
  activeIndex,
  onActiveIndexChange,
  autoRotateMs = 7000,
  onHoverChange,
}: PlanCarouselProps) {
  const [hovered, setHovered] = useState(false);
  const count = plans.length;

  const goNext = useCallback(() => {
    onActiveIndexChange((activeIndex + 1) % count);
  }, [activeIndex, count, onActiveIndexChange]);

  useEffect(() => {
    if (autoRotateMs <= 0 || hovered || count < 2) return;
    const timer = window.setTimeout(goNext, autoRotateMs);
    return () => window.clearTimeout(timer);
  }, [autoRotateMs, hovered, count, goNext]);

  if (count === 0) return null;

  const activePlan = plans[activeIndex];
  const photos = localPhotos(activePlan);
  const stars = DECOR_STARS[activePlan.id] ?? [];

  return (
    <Box
      onMouseEnter={() => {
        setHovered(true);
        onHoverChange?.(true);
      }}
      onMouseLeave={() => {
        setHovered(false);
        onHoverChange?.(false);
      }}
      sx={{ position: 'relative', width: '100%' }}
    >
      {/* 左右兩側相鄰計畫的卡片預覽 — 點擊切換上 / 下一個計畫 */}
      {count > 1 && (
        <>
          <Box
            component="button"
            type="button"
            aria-label="上一個計畫"
            onClick={() =>
              onActiveIndexChange((activeIndex - 1 + count) % count)
            }
            sx={[PEEK_BASE, { left: -720 }]}
          />
          <Box
            component="button"
            type="button"
            aria-label="下一個計畫"
            onClick={() => onActiveIndexChange((activeIndex + 1) % count)}
            sx={[PEEK_BASE, { right: -720 }]}
          />
        </>
      )}

      <Box
        sx={{
          maxWidth: portalTokens.layout.maxWidth,
          mx: 'auto',
          px: `${portalTokens.layout.gutter}px`,
        }}
      >
        <Box sx={{ display: 'flex', justifyContent: 'center' }}>
          {/* 卡片 + 周圍裝飾星形照片 */}
          <Box
            key={activePlan.id}
            sx={{
              position: 'relative',
              width: '100%',
              maxWidth: 760,
              animation: 'planCardFade 0.5s ease',
              '@keyframes planCardFade': {
                from: { opacity: 0, transform: 'translateY(12px)' },
                to: { opacity: 1, transform: 'translateY(0)' },
              },
            }}
          >
            {/* 裝飾星形照片 — 各計畫位置不同，僅 ≥834px 顯示。
                hover 時照片自卡片後方「浮出」：放大、上移、加陰影並提至卡片之上，
                形成層次與探索感（依設計稿 HOVER 說明）。 */}
            {stars.map((s, i) =>
              photos[i] ? (
                <Box
                  key={i}
                  aria-hidden
                  component="img"
                  src={photos[i]}
                  alt=""
                  sx={{
                    display: 'none',
                    [portalTokens.mq.tabletUp]: { display: 'block' },
                    position: 'absolute',
                    left: `${s.x}px`,
                    top: `${s.y}px`,
                    width: STAR_SIZE,
                    height: STAR_SIZE,
                    objectFit: 'cover',
                    clipPath: STAR_CLIP,
                    zIndex: 0,
                    transition:
                      'transform 0.45s cubic-bezier(0.22, 1, 0.36, 1), filter 0.45s ease',
                    '&:hover': {
                      transform: 'scale(1.12) translateY(-14px)',
                      zIndex: 3,
                      filter: 'drop-shadow(0 26px 40px rgba(0, 0, 0, 0.3))',
                    },
                    '@media (prefers-reduced-motion: reduce)': {
                      transition: 'none',
                      '&:hover': { transform: 'none' },
                    },
                  }}
                />
              ) : null,
            )}

            {/* 作用中的計畫卡片 */}
            <Box sx={{ position: 'relative', zIndex: 1 }}>
              <PlanCard plan={activePlan} />
            </Box>
          </Box>
        </Box>
      </Box>
    </Box>
  );
}
