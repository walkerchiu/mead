'use client';

import { useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react';

import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown';
import Box from '@mui/material/Box';
import Menu from '@mui/material/Menu';
import MenuItem from '@mui/material/MenuItem';
import Typography from '@mui/material/Typography';

import type {
  PlanTimelineYear,
  TimelineDate,
  TimelineEvent,
} from '@/types/plan';

/** SSR 安全的 layout effect（伺服器端退回 useEffect，避免警告）。 */
const useIsoLayoutEffect =
  typeof window !== 'undefined' ? useLayoutEffect : useEffect;

const MONTHS = Array.from({ length: 12 }, (_, i) => i + 1);

/** scroll 版型每月固定寬：12 個月總寬超出窄容器，使月份列可橫向滑動。 */
const MONTH_W = 52;

/** 各月 1 日前的累計天數（平年，依 spec 以 365 天換算日期比例）。 */
const DAYS_BEFORE_MONTH = [
  0, 31, 59, 90, 120, 151, 181, 212, 243, 273, 304, 334,
];
const YEAR_DAYS = 365;

/** 日期級期間的最小可視寬度（比例）——避免短天數期間細到看不見。 */
const MIN_RANGE_PCT = 0.02;

/**
 * 軌道內視覺尺寸（px）。單行呈現：所有長條與圓點都置於中央那條時間線上，
 * 重疊者直接同線排放（依設計稿，不分列）。
 */
const DOT = 8;
const BAR_H = 11;
const RAIL_H = 22;
/** 長條左右內縮（px）——相鄰事件之間留出間隙，讀作分段而非連續一條。 */
const BAR_GAP = 3;
/** 軌道內容（事件與對應月份）左右內縮（px）——讓事件不貼膠囊圓端，依設計稿留白。 */
const TRACK_PAD = 12;

/** tooltip 與軌道底的間距、以及軌道下方為 tooltip 預留的高度（px）。 */
const TIP_GAP = 8;
const TIP_RESERVE = 54;
const TIP_PAD = 8;

/** Figma 色票（沿用 node 1:86 Timeline）：月份字、下拉／tooltip 邊框、年度分隔線、
    閒置段（淡灰）、作用段（橘）。 */
const C = {
  text: '#9A9A9A',
  border: '#D3D3D3',
  line: '#A8A8A8',
  segIdle: '#E2E2E2',
  segActive: '#E3AE5D',
  ink: '#4A4A4A',
  white: '#ffffff',
};

/** 依 spec 換算某日期在年度軸（0–1）的位置。 */
function dayOfYear(d: TimelineDate): number {
  return DAYS_BEFORE_MONTH[d.month - 1] + (d.day ?? 1);
}

/** 期間事件的 left／width（比例 0–1）。 */
function rangeMetrics(e: TimelineEvent): { left: number; width: number } {
  if (e.precision === 'month') {
    const end = e.end ?? e.start;
    return {
      left: (e.start.month - 1) / 12,
      width: (end.month - e.start.month + 1) / 12,
    };
  }
  const left = dayOfYear(e.start) / YEAR_DAYS;
  const right = dayOfYear(e.end ?? e.start) / YEAR_DAYS;
  return { left, width: Math.max(right - left, MIN_RANGE_PCT) };
}

/** 時間點事件的中心位置（比例 0–1）。 */
function pointLeft(e: TimelineEvent): number {
  if (e.precision === 'month') return (e.start.month - 0.5) / 12;
  return dayOfYear(e.start) / YEAR_DAYS;
}

/** 事件中心位置（比例 0–1，tooltip 水平定位用）。 */
function centerPct(e: TimelineEvent): number {
  if (e.kind === 'range') {
    const { left, width } = rangeMetrics(e);
    return left + width / 2;
  }
  return pointLeft(e);
}

/** 起點比例（排序用）。 */
function startPct(e: TimelineEvent): number {
  return e.kind === 'range' ? rangeMetrics(e).left : pointLeft(e);
}

/** 事件是否涵蓋某月（以月份判斷「當下期程」）。 */
function coversMonth(e: TimelineEvent, month: number): boolean {
  if (e.kind === 'range') {
    const end = e.end ?? e.start;
    return e.start.month <= month && month <= end.month;
  }
  return e.start.month === month;
}

export interface PlanTimelineProps {
  /** 計畫時程（依年度分組）。未提供或為空時不渲染。 */
  timelines?: PlanTimelineYear[];
  /**
   * 版型：
   *  - `fit`（預設）：月份等寬填滿容器，適合寬版（桌機卡片、詳細頁）。
   *  - `scroll`：月份固定寬、整排超出容器寬，於窄版（手機卡片）橫向滑動閱讀。
   */
  variant?: 'fit' | 'scroll';
}

/**
 * PlanTimeline — 計畫時程軸（資料驅動，依 `docs/frontend/PLAN_TIMELINE_SPEC.md`）。
 *
 * 年度固定 1–12 月軸：`kind: 'range'` 以長條、`kind: 'point'` 以圓點僅標示「位置」，
 * 不常駐顯示所有文字。軌道下方預設顯示「當下期程」（涵蓋今日月份的事件）的 tooltip；
 * 使用者 hover／focus／點按某事件時改顯示該事件（dateLabel／title／note），離開後回到
 * 當下期程。當前月份於月份軸以底色標示。年度以左上角下拉選單切換。
 *
 * 寬版（`fit`）月份等寬填滿；窄版（`scroll`）月份固定寬、整排可橫向滑動；tooltip 以
 * 事件在軸上的比例位置定位（不量測 DOM，故不受卡片 zoom 影響），夾在軌道寬內不出界。
 */
export function PlanTimeline({
  timelines,
  variant = 'fit',
}: PlanTimelineProps) {
  const years = timelines ?? [];
  const [yearIndex, setYearIndex] = useState(0);
  // 使用者 hover／focus／點按中的事件（null 表示未選，退回預設「當下期程」）。
  const [hoverId, setHoverId] = useState<string | null>(null);
  const [yearAnchor, setYearAnchor] = useState<HTMLElement | null>(null);
  // 今日（僅在客戶端取得，避免 SSR／hydration 落差）；用於判斷「當下期程」與當前月份。
  const [now, setNow] = useState<Date | null>(null);
  // 軌道容器寬與 tooltip 寬（皆取 offsetWidth，為未縮放的本地 px，供夾邊與箭頭對位）。
  const [dims, setDims] = useState({ container: 0, tip: 0 });
  const yearMenuScrollRef = useRef<{ x: number; y: number } | null>(null);
  const trackRef = useRef<HTMLDivElement>(null);
  const tooltipRef = useRef<HTMLDivElement>(null);

  // 掛載後才取今日：伺服器端無日期、客戶端首次渲染亦為 null（與 SSR 一致），之後才補上
  // ——避免直接於 render 取 new Date() 造成 hydration mismatch。
  useEffect(() => setNow(new Date()), []);

  const current = years[Math.min(yearIndex, Math.max(0, years.length - 1))];
  const events = useMemo(() => current?.events ?? [], [current]);

  const openYearMenu = (anchor: HTMLElement) => {
    if (typeof window !== 'undefined') {
      yearMenuScrollRef.current = { x: window.scrollX, y: window.scrollY };
    }
    anchor.focus({ preventScroll: true });
    setYearAnchor(anchor);
  };

  useIsoLayoutEffect(() => {
    if (!yearAnchor || typeof window === 'undefined') return undefined;
    const pos = yearMenuScrollRef.current;
    if (!pos) return undefined;

    const restore = () => window.scrollTo(pos.x, pos.y);
    restore();
    const raf = window.requestAnimationFrame(restore);
    return () => window.cancelAnimationFrame(raf);
  }, [yearAnchor]);

  const points = useMemo(
    () => events.filter((e) => e.kind === 'point'),
    [events],
  );
  const ranges = useMemo(
    () => events.filter((e) => e.kind === 'range'),
    [events],
  );
  const sorted = useMemo(
    () => [...events].sort((a, b) => startPct(a) - startPct(b)),
    [events],
  );

  // 當前月份（僅當檢視的年度即今年時才有值）→ 月份軸標示與「當下期程」判斷。
  const curMonth =
    now && current && now.getFullYear() === current.year
      ? now.getMonth() + 1
      : null;
  // 當下期程：涵蓋今日月份的第一筆事件（依起始排序）；無則不預設顯示。
  const defaultId = useMemo(() => {
    if (curMonth == null) return null;
    return sorted.find((e) => coversMonth(e, curMonth))?.id ?? null;
  }, [curMonth, sorted]);

  // 顯示中的事件：使用者選取者優先，否則退回預設「當下期程」。
  const shownId = hoverId ?? defaultId;
  const activeEvent = events.find((e) => e.id === shownId) ?? null;

  // tooltip 內容或容器尺寸變動後量測寬度（offsetWidth 為未縮放本地 px）。
  useIsoLayoutEffect(() => {
    const container = trackRef.current?.offsetWidth ?? 0;
    const tip = tooltipRef.current?.offsetWidth ?? 0;
    setDims((d) =>
      d.container === container && d.tip === tip ? d : { container, tip },
    );
  }, [shownId, yearIndex, variant, events]);
  useEffect(() => {
    const onResize = () =>
      setDims((d) => ({
        ...d,
        container: trackRef.current?.offsetWidth ?? d.container,
      }));
    window.addEventListener('resize', onResize);
    return () => window.removeEventListener('resize', onResize);
  }, []);

  if (years.length === 0 || !current) return null;

  const scroll = variant === 'scroll';
  // 單行軌道：所有長條與圓點都置於中央時間線上（不分列）。
  const railHeight = RAIL_H;
  const axisY = RAIL_H / 2;

  /**
   * 事件 mark（長條／圓點）的互動：hover 用 pointer 事件且僅回應滑鼠——觸控不走 hover
   * 路徑，避免 iOS 把有 hover 行為的元素視為「首次點只觸發 hover」而要點兩次；觸控由
   * onClick 於首次點擊即顯示。離開後回到「當下期程」。
   */
  const markHandlers = (id: string) => ({
    tabIndex: 0,
    role: 'button' as const,
    'data-event-id': id,
    onPointerEnter: (e: React.PointerEvent<HTMLElement>) => {
      if (e.pointerType !== 'mouse') return;
      setHoverId(id);
    },
    onPointerLeave: (e: React.PointerEvent<HTMLElement>) => {
      if (e.pointerType !== 'mouse') return;
      setHoverId(null);
    },
    onFocus: () => setHoverId(id),
    onBlur: () => setHoverId(null),
    onClick: () => setHoverId(id),
  });

  // tooltip 水平定位：事件位於軌道內縮區（左右各 TRACK_PAD），故 mark 中心 =
  // TRACK_PAD + 比例×內縮區寬；框體夾在容器寬內不出界，箭頭再依 mark 位置相對框中心位移。
  const innerW = Math.max(0, dims.container - 2 * TRACK_PAD);
  const markPx = activeEvent ? TRACK_PAD + centerPct(activeEvent) * innerW : 0;
  const tipHalf = dims.tip / 2;
  const tipLeft = Math.min(
    Math.max(markPx, tipHalf + TIP_PAD),
    Math.max(tipHalf + TIP_PAD, dims.container - tipHalf - TIP_PAD),
  );
  const arrowMax = Math.max(0, tipHalf - 8);
  const arrowDx = Math.max(-arrowMax, Math.min(arrowMax, markPx - tipLeft));

  const tooltipNode = activeEvent ? (
    <Box
      ref={tooltipRef}
      role="tooltip"
      sx={{
        position: 'absolute',
        top: `${railHeight + TIP_GAP}px`,
        left: `${tipLeft}px`,
        // max-content：避免絕對定位框靠邊時被可用寬壓窄而折行。
        width: 'max-content',
        maxWidth: scroll ? 200 : 260,
        transform: 'translateX(-50%)',
        px: 1.5,
        py: 0.75,
        bgcolor: C.white,
        border: `1px solid ${C.border}`,
        borderRadius: '10px',
        boxShadow: '0 8px 20px -10px rgba(0,0,0,0.35)',
        pointerEvents: 'none',
        zIndex: 4,
        // 箭頭朝上、指向軌道上的 mark。
        '&::before': {
          content: '""',
          position: 'absolute',
          left: `calc(50% + ${arrowDx}px)`,
          top: -5,
          transform: 'translateX(-50%) rotate(45deg)',
          width: 8,
          height: 8,
          bgcolor: C.white,
          borderTop: `1px solid ${C.border}`,
          borderLeft: `1px solid ${C.border}`,
        },
      }}
    >
      <Typography
        sx={{
          fontSize: 11,
          fontWeight: 500,
          lineHeight: 1.4,
          letterSpacing: '0.04em',
          color: C.text,
          whiteSpace: 'nowrap',
        }}
      >
        {activeEvent.dateLabel}
      </Typography>
      <Typography
        sx={{ fontSize: 12.5, fontWeight: 500, lineHeight: 1.4, color: C.ink }}
      >
        {activeEvent.title}
      </Typography>
      {activeEvent.note && (
        <Typography
          sx={{ mt: 0.25, fontSize: 11.5, lineHeight: 1.5, color: C.text }}
        >
          {activeEvent.note}
        </Typography>
      )}
    </Box>
  ) : null;

  // 月份列 + 軌道 + tooltip：兩種版型共用，僅月份寬度與外層容器不同。
  const monthsAndTrack = (
    <Box
      ref={trackRef}
      sx={{ position: 'relative', ...(scroll ? { width: MONTH_W * 12 } : {}) }}
    >
      {/* 月份列（當前月份以底色標示）；左右內縮與軌道事件對齊。 */}
      <Box sx={{ display: 'flex', mt: 1, px: `${TRACK_PAD}px` }}>
        {MONTHS.map((m) => {
          const isCur = m === curMonth;
          return (
            <Box
              key={m}
              sx={{
                ...(scroll
                  ? { width: MONTH_W, flexShrink: 0 }
                  : { flex: 1, minWidth: 0 }),
                textAlign: 'center',
                py: '2px',
              }}
            >
              <Box
                component="span"
                sx={{
                  display: 'inline-block',
                  px: isCur ? '8px' : 0,
                  py: isCur ? '1px' : 0,
                  borderRadius: '999px',
                  // 1.4.4 Resize Text：中文月份不小於 12px。
                  fontSize: 12,
                  fontWeight: isCur ? 600 : 500,
                  letterSpacing: '0.1em',
                  whiteSpace: 'nowrap',
                  color: isCur ? C.white : C.text,
                  bgcolor: isCur ? C.segActive : 'transparent',
                }}
              >
                {m}月
              </Box>
            </Box>
          );
        })}
      </Box>

      {/* 白色膠囊軌道 + 事件；tooltip 浮於軌道下方（含預留空間）。依設計稿：白色膠囊、
          無描邊、以淡陰影浮於卡片上，內無格線／軸線，事件（灰／橘長條與圓點）置中排放。 */}
      <Box sx={{ position: 'relative', mt: 1 }}>
        <Box
          sx={{
            position: 'relative',
            height: railHeight,
            borderRadius: `${RAIL_H / 2}px`,
            bgcolor: C.white,
            boxShadow: '0 2px 10px -4px rgba(0,0,0,0.14)',
            overflow: 'hidden',
          }}
        >
          {/* 事件內容左右內縮，不貼膠囊圓端（與月份列同步內縮，位置仍對齊）。 */}
          <Box
            sx={{
              position: 'absolute',
              top: 0,
              bottom: 0,
              left: `${TRACK_PAD}px`,
              right: `${TRACK_PAD}px`,
            }}
          >
            {/* 期間長條（單行，置於中央時間線上） */}
            {ranges.map((e) => {
              const { left, width } = rangeMetrics(e);
              const on = shownId === e.id;
              return (
                <Box
                  key={e.id}
                  {...markHandlers(e.id)}
                  aria-label={`${e.dateLabel} ${e.title}`}
                  sx={{
                    position: 'absolute',
                    top: axisY - BAR_H / 2,
                    left: `calc(${left * 100}% + ${BAR_GAP}px)`,
                    width: `calc(${width * 100}% - ${BAR_GAP * 2}px)`,
                    minWidth: BAR_H,
                    height: BAR_H,
                    borderRadius: '999px',
                    // 當下／hover 者橘色，其餘灰色（依設計稿，無白色描邊）。
                    bgcolor: on ? C.segActive : C.segIdle,
                    // 作用中者置頂：與相鄰事件重疊時不被灰段覆蓋而看似變短。
                    zIndex: on ? 2 : 1,
                    cursor: 'pointer',
                    outline: 'none',
                    transition: 'background-color 0.15s ease',
                  }}
                />
              );
            })}

            {/* 時間點圓點 */}
            {points.map((e) => {
              const left = pointLeft(e);
              const on = shownId === e.id;
              return (
                <Box
                  key={e.id}
                  {...markHandlers(e.id)}
                  aria-label={`${e.dateLabel} ${e.title}`}
                  sx={{
                    position: 'absolute',
                    top: axisY - DOT / 2,
                    left: `${left * 100}%`,
                    width: DOT,
                    height: DOT,
                    transform: 'translateX(-50%)',
                    borderRadius: '50%',
                    // 當下／hover 者橘色，其餘灰色（依設計稿，無白框）。
                    bgcolor: on ? C.segActive : C.segIdle,
                    zIndex: on ? 2 : 1,
                    cursor: 'pointer',
                    outline: 'none',
                    transition: 'background-color 0.15s ease',
                  }}
                />
              );
            })}
          </Box>
        </Box>

        {tooltipNode}
        {/* 為軌道下方的 tooltip 預留空間，使卡片高度涵蓋之。 */}
        <Box aria-hidden sx={{ height: TIP_RESERVE }} />
      </Box>
    </Box>
  );

  return (
    <Box sx={{ position: 'relative', width: '100%' }}>
      {/* 年度下拉選單 */}
      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          pb: 0.5,
          borderBottom: `1px solid ${C.line}`,
        }}
      >
        <Box
          component="button"
          type="button"
          onMouseDown={(e) => e.preventDefault()}
          onClick={(e) => openYearMenu(e.currentTarget)}
          aria-haspopup="listbox"
          aria-expanded={Boolean(yearAnchor)}
          sx={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: 0.5,
            border: 'none',
            background: 'none',
            p: 0,
            cursor: 'pointer',
            fontSize: 11.7,
            fontWeight: 600,
            letterSpacing: '0.1em',
            color: C.ink,
            whiteSpace: 'nowrap',
          }}
        >
          {current.label ?? `${current.year}年`}
          <KeyboardArrowDownIcon sx={{ fontSize: 16, color: C.text }} />
        </Box>
        <Menu
          anchorEl={yearAnchor}
          open={Boolean(yearAnchor)}
          onClose={() => setYearAnchor(null)}
          autoFocus={false}
          disableAutoFocus
          disableAutoFocusItem
          disableRestoreFocus
          disableScrollLock
          anchorOrigin={{ vertical: 'bottom', horizontal: 'left' }}
          transformOrigin={{ vertical: 'top', horizontal: 'left' }}
        >
          {years.map((y, i) => (
            <MenuItem
              key={y.year}
              selected={i === yearIndex}
              onClick={() => {
                setYearIndex(i);
                setHoverId(null);
                setYearAnchor(null);
              }}
              sx={{ fontSize: 13, letterSpacing: '0.06em' }}
            >
              {y.label ?? `${y.year}年`}
            </MenuItem>
          ))}
        </Menu>
      </Box>

      {scroll ? (
        <Box
          sx={{
            overflowX: 'auto',
            // 行動裝置以滑動操作，隱藏捲軸避免細軸破壞版面。
            scrollbarWidth: 'none',
            msOverflowStyle: 'none',
            '&::-webkit-scrollbar': { display: 'none' },
            WebkitOverflowScrolling: 'touch',
          }}
        >
          {monthsAndTrack}
        </Box>
      ) : (
        monthsAndTrack
      )}
    </Box>
  );
}
