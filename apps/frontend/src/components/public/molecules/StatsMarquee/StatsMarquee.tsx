'use client';

import {
  type PointerEvent as ReactPointerEvent,
  useEffect,
  useRef,
} from 'react';

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
 * 內容多於可視範圍時連續滾動呈現。以「捲動位置」驅動（而非 CSS transform）：
 * 未 hover 時由 requestAnimationFrame 持續自動捲動（內容複製兩份相接，捲過一份
 * 長度即回捲一份，無縫循環）；hover 時暫停自動捲動，使用者可自行捲動（滾輪／觸控）
 * 或以滑鼠拖曳瀏覽想看的數據，移開後從目前位置接續。prefers-reduced-motion 時不
 * 自動捲、僅可捲動／拖曳。
 *
 * 版面與舊版（transform 版）完全一致：垂直時外層撐滿父高、捲動視窗以絕對定位填滿，
 * 故欄位高度仍由 banner 決定、不被資料內容撐高；水平時高度由資料列決定。
 * 兩份內容以每項固定 margin（mb/mr）相接，一份長度 = copyRef 的尺寸（含尾端 margin）。
 */
export function StatsMarquee({
  stats,
  direction = 'vertical',
}: StatsMarqueeProps) {
  const horizontal = direction === 'horizontal';
  const scrollerRef = useRef<HTMLDivElement>(null);
  const copyRef = useRef<HTMLDivElement>(null);
  const pausedRef = useRef(false);
  // 滑鼠拖曳捲動狀態：拖曳起點座標與起始捲動位置。
  const draggingRef = useRef(false);
  const dragStartRef = useRef({ pos: 0, scroll: 0 });

  // 滾動速度：每筆約 2.6s 捲過一份，整體隨筆數成長，維持穩定觀感。
  const durationSec = Math.max(12, stats.length * 2.6);

  useEffect(() => {
    const el = scrollerRef.current;
    const copy = copyRef.current;
    if (!el || !copy || stats.length === 0) return;
    if (
      typeof window !== 'undefined' &&
      window.matchMedia?.('(prefers-reduced-motion: reduce)').matches
    ) {
      return; // 減少動態：不自動捲，使用者仍可自行捲動
    }
    const axis = horizontal ? 'scrollLeft' : 'scrollTop';
    let raf = 0;
    let last = 0;
    const tick = (now: number) => {
      raf = requestAnimationFrame(tick);
      if (!last) last = now;
      const dt = (now - last) / 1000;
      last = now;
      if (pausedRef.current || draggingRef.current) return;
      // 一份內容長度（含尾端 margin）= 兩份相接時的一輪位移。
      const loop = horizontal ? copy.offsetWidth : copy.offsetHeight;
      if (loop <= 0) return;
      let next = el[axis] + (loop / durationSec) * dt;
      if (next >= loop) next -= loop;
      el[axis] = next;
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [stats.length, horizontal, durationSec]);

  if (stats.length === 0) return null;

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
        // 每項固定 margin（沿用舊版間距）：兩份相接的間距與份內一致，無縫循環。
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

  const copySx = {
    display: 'flex',
    flexDirection: horizontal ? 'row' : 'column',
    flexShrink: 0,
  } as const;

  // 拖曳瀏覽：按下記錄起點，移動時依位移更新捲動位置（沿軸、無縫環繞），期間暫停自動捲。
  // 拖曳僅供滑鼠；觸控一律交還瀏覽器原生捲動 —— 對觸控做 setPointerCapture 會攔截
  // pointer、卡住 iOS 原生捲動（連帶垂直頁面捲動也滑不過去），故觸控只暫停自動捲、不接管。
  const axisProp = horizontal ? 'scrollLeft' : 'scrollTop';
  const onPointerDown = (e: ReactPointerEvent<HTMLDivElement>) => {
    // 任何指標按下都先暫停自動捲，避免與使用者捲動相互較勁。
    pausedRef.current = true;
    if (e.pointerType !== 'mouse') return; // 觸控／觸控筆：交給原生捲動
    const el = scrollerRef.current;
    if (!el) return;
    draggingRef.current = true;
    dragStartRef.current = {
      pos: horizontal ? e.clientX : e.clientY,
      scroll: el[axisProp],
    };
    el.setPointerCapture?.(e.pointerId);
  };
  const onPointerMove = (e: ReactPointerEvent<HTMLDivElement>) => {
    if (!draggingRef.current) return;
    const el = scrollerRef.current;
    const copy = copyRef.current;
    if (!el) return;
    const cur = horizontal ? e.clientX : e.clientY;
    const loop = horizontal ? copy?.offsetWidth : copy?.offsetHeight;
    let next = dragStartRef.current.scroll - (cur - dragStartRef.current.pos);
    if (loop && loop > 0) next = ((next % loop) + loop) % loop; // 無縫環繞
    el[axisProp] = next;
  };
  const endDrag = (e: ReactPointerEvent<HTMLDivElement>) => {
    if (e.pointerType !== 'mouse') {
      pausedRef.current = false; // 觸控結束：恢復自動捲（觸控無 mouseleave）
      return;
    }
    // 滑鼠：維持暫停直到游標離開（onMouseLeave 恢復），此處僅結束拖曳。
    if (!draggingRef.current) return;
    draggingRef.current = false;
    scrollerRef.current?.releasePointerCapture?.(e.pointerId);
  };

  // 捲動視窗：沿軸開放捲動、隱藏捲軸、淡出遮罩；hover 暫停自動捲、改由使用者捲動／拖曳。
  const scroller = (
    <Box
      ref={scrollerRef}
      aria-label="計畫數據成果"
      data-stats-marquee={direction}
      onMouseEnter={() => {
        pausedRef.current = true;
      }}
      onMouseLeave={() => {
        if (!draggingRef.current) pausedRef.current = false;
      }}
      onPointerDown={onPointerDown}
      onPointerMove={onPointerMove}
      onPointerUp={endDrag}
      onPointerCancel={endDrag}
      sx={{
        ...(horizontal
          ? { width: '100%', overflowX: 'auto', overflowY: 'hidden' }
          : // 垂直：絕對填滿外層 → 捲動視窗高度 = 外層（banner）高，內容於其中捲動，
            // 不貢獻外層高度（維持舊版欄高行為）。
            {
              position: 'absolute',
              inset: 0,
              overflowY: 'auto',
              overflowX: 'hidden',
            }),
        scrollbarWidth: 'none',
        msOverflowStyle: 'none',
        '&::-webkit-scrollbar': { display: 'none' },
        maskImage: maskGradient,
        WebkitMaskImage: maskGradient,
        // 可拖曳瀏覽：grab 游標、拖曳中 grabbing；拖曳期間不選取文字。
        cursor: 'grab',
        userSelect: 'none',
        // 水平跑馬燈：允許原生雙軸捲動 —— 橫向滑動捲跑馬燈、縱向滑動讓頁面捲過去
        // （瀏覽器依手勢方向與可捲動軸自動路由）。垂直跑馬燈：原生縱向捲動。
        touchAction: horizontal ? 'pan-x pan-y' : 'pan-y',
        '&:active': { cursor: 'grabbing' },
      }}
    >
      <Box
        sx={{
          display: 'flex',
          flexDirection: horizontal ? 'row' : 'column',
          width: horizontal ? 'max-content' : undefined,
        }}
      >
        {/* 兩份相接以無縫循環；第二份對讀屏隱藏避免重複朗讀 */}
        <Box ref={copyRef} sx={copySx}>
          {stats.map((s, i) => renderItem(s, `a-${i}`))}
        </Box>
        <Box aria-hidden sx={copySx}>
          {stats.map((s, i) => renderItem(s, `b-${i}`))}
        </Box>
      </Box>
    </Box>
  );

  // 水平：scroller 即根（高度由資料列決定）；垂直：外層 relative 撐滿父高，scroller 絕對填滿。
  return horizontal ? (
    scroller
  ) : (
    <Box sx={{ position: 'relative', height: '100%' }}>{scroller}</Box>
  );
}
