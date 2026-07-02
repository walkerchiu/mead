'use client';

import { useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react';

import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown';
import Box from '@mui/material/Box';
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

/** 軌道內視覺尺寸（px）。 */
const DOT = 10;
const BAR_H = 8;
const LANE_H = 16;
const POINT_ROW_H = 16;
const RAIL_PAD_Y = 8;

/**
 * 事件列表日期欄固定寬（px）——三計畫共用，讓各列 title 對齊、且與最長日期標籤
 * （如「12/1(二)-12/7(一)」約 96px）保持間距。
 */
const LIST_DATE_W = 108;

/** Figma 色票（沿用 node 1:86 Timeline）：月份字、軌道底邊框、閒置段、作用段、白。 */
const C = {
  text: '#9A9A9A',
  border: '#D3D3D3',
  segIdle: '#ECECEC',
  segActive: '#E3AE5D',
  ink: '#4A4A4A',
  grid: '#EFEFEF',
  axis: '#E7E7E7',
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

/** 起點比例（排序、tooltip 定位用）。 */
function startPct(e: TimelineEvent): number {
  return e.kind === 'range' ? rangeMetrics(e).left : pointLeft(e);
}

/**
 * 期間事件的 lane 分配（貪婪區間排程）：重疊的期間分到不同列，避免互相覆蓋。
 * 回傳每筆事件 id 對應的 lane 索引與總列數。
 */
function assignLanes(ranges: TimelineEvent[]): {
  laneOf: Record<string, number>;
  laneCount: number;
} {
  const metrics = ranges
    .map((e) => ({ e, ...rangeMetrics(e) }))
    .sort((a, b) => a.left - b.left);
  const laneEnds: number[] = [];
  const laneOf: Record<string, number> = {};
  for (const m of metrics) {
    let lane = laneEnds.findIndex((end) => m.left >= end);
    if (lane === -1) {
      lane = laneEnds.length;
      laneEnds.push(0);
    }
    laneEnds[lane] = m.left + m.width;
    laneOf[m.e.id] = lane;
  }
  // 無期間事件時回 0（不預留空白列）；有幾個重疊層就佔幾列。
  return { laneOf, laneCount: laneEnds.length };
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
  /** 是否於軌道下方顯示事件列表（詳細頁用；卡片版預設關閉以維持精簡高度）。 */
  showList?: boolean;
  /** 事件列表欄數（預設 1）；桌機卡片用 2 欄壓低高度、讓整卡自適應屏高時字級更大。 */
  listCols?: number;
}

/**
 * PlanTimeline — 計畫時程軸（資料驅動，依 `docs/frontend/PLAN_TIMELINE_SPEC.md`）。
 *
 * 年度固定 1–12 月軸：`kind: 'range'` 以長條、`kind: 'point'` 以圓點呈現，位置依
 * `precision`（month／day）換算。重疊的期間自動分列（lane）避免互相覆蓋；hover／
 * focus／點擊事件顯示 tooltip（dateLabel／title／note）。多年度以年度切換鈕呈現。
 *
 * 寬版（`fit`）月份等寬填滿；窄版（`scroll`）月份固定寬、整排可橫向滑動，軌道內
 * 事件的百分比定位隨之對齊。
 */
export function PlanTimeline({
  timelines,
  variant = 'fit',
  showList = false,
  listCols = 1,
}: PlanTimelineProps) {
  const years = timelines ?? [];
  const [yearIndex, setYearIndex] = useState(0);
  const [activeId, setActiveId] = useState<string | null>(null);
  // 作用中 mark 相對於元件根的位置與根寬（tooltip 定位用）。
  const [tip, setTip] = useState<{ x: number; y: number; w: number } | null>(
    null,
  );
  // tooltip 實際寬度（量測後才知），用來把箭頭對準 mark、框體夾在根寬內。
  const [tipW, setTipW] = useState(0);
  const rootRef = useRef<HTMLDivElement>(null);
  const tooltipRef = useRef<HTMLDivElement>(null);

  const current = years[Math.min(yearIndex, Math.max(0, years.length - 1))];
  const events = useMemo(() => current?.events ?? [], [current]);

  const points = useMemo(
    () => events.filter((e) => e.kind === 'point'),
    [events],
  );
  const ranges = useMemo(
    () => events.filter((e) => e.kind === 'range'),
    [events],
  );
  const { laneOf, laneCount } = useMemo(() => assignLanes(ranges), [ranges]);
  const listEvents = useMemo(
    () => [...events].sort((a, b) => startPct(a) - startPct(b)),
    [events],
  );
  // tooltip 顯示後量測其實際寬度（供夾邊與箭頭對位）。
  useIsoLayoutEffect(() => {
    if (tooltipRef.current) setTipW(tooltipRef.current.offsetWidth);
  }, [activeId, tip]);

  if (years.length === 0 || !current) return null;

  const scroll = variant === 'scroll';
  const hasPoints = points.length > 0;
  const railHeight = Math.max(
    34,
    RAIL_PAD_Y * 2 + (hasPoints ? POINT_ROW_H : 0) + laneCount * LANE_H,
  );
  // 圓點所在列的垂直中心：軌道加上月份刻度、時間點連成一條時間線。
  const axisY =
    RAIL_PAD_Y + (hasPoints ? POINT_ROW_H : railHeight - RAIL_PAD_Y * 2) / 2;
  const activeEvent = events.find((e) => e.id === activeId) ?? null;

  const clearIfActive = (id: string) =>
    setActiveId((prev) => (prev === id ? null : prev));

  /**
   * tooltip 定位：量測作用中 mark 相對於元件根的位置存入 tip，tooltip 於根層（不被
   * 手機橫向捲動容器裁切）浮出。桌機 hover／focus、手機點擊皆會量測並顯示。
   */
  const showTipFor = (el: HTMLElement) => {
    const root = rootRef.current;
    if (!root) return;
    const r = el.getBoundingClientRect();
    const rr = root.getBoundingClientRect();
    // 卡片可能套 CSS zoom（ring 輪播的 cardScale）：getBoundingClientRect 為縮放後的
    // 螢幕座標，而 tooltip 的 left 為本地 CSS px（會再被 zoom 縮放），需除以縮放比還原。
    const scale = root.offsetWidth > 0 ? rr.width / root.offsetWidth : 1;
    setTip({
      x: (r.left + r.width / 2 - rr.left) / scale,
      y: (r.top - rr.top) / scale,
      w: root.offsetWidth,
    });
  };

  /**
   * 軌道上事件 mark（長條／圓點）的互動：設為作用事件並定位 tooltip。
   * hover 用 pointer 事件且僅回應滑鼠——觸控不走 hover 路徑，避免 iOS 把有 hover 行為
   * 的元素視為「首次點只觸發 hover、需再點一次才 click」而要點兩次；觸控由 onClick 於
   * 首次點擊即觸發。
   */
  const markHandlers = (id: string) => ({
    tabIndex: 0,
    role: 'button' as const,
    onPointerEnter: (e: React.PointerEvent<HTMLElement>) => {
      if (e.pointerType !== 'mouse') return;
      setActiveId(id);
      showTipFor(e.currentTarget);
    },
    onPointerLeave: (e: React.PointerEvent<HTMLElement>) => {
      if (e.pointerType !== 'mouse') return;
      clearIfActive(id);
      setTip(null);
    },
    onFocus: (e: React.FocusEvent<HTMLElement>) => {
      setActiveId(id);
      showTipFor(e.currentTarget);
    },
    onBlur: () => {
      clearIfActive(id);
      setTip(null);
    },
    // 點擊／點按一律「顯示」（不切換關閉），與 onFocus 一致、避免同一次點按先開後關；
    // 關閉交由點到別處（blur／離開）或點另一個 mark 處理。
    onClick: (e: React.MouseEvent<HTMLElement>) => {
      setActiveId(id);
      showTipFor(e.currentTarget);
    },
  });

  /** 事件列表列的互動：與軌道連動 highlight（不出 tooltip，資訊已在該列）。
      hover 同樣僅回應滑鼠，觸控由 onClick 於首次點擊即觸發。 */
  const rowHandlers = (id: string) => ({
    tabIndex: 0,
    role: 'button' as const,
    onPointerEnter: (e: React.PointerEvent<HTMLElement>) => {
      if (e.pointerType !== 'mouse') return;
      setActiveId(id);
      setTip(null);
    },
    onPointerLeave: (e: React.PointerEvent<HTMLElement>) => {
      if (e.pointerType !== 'mouse') return;
      clearIfActive(id);
    },
    onFocus: () => {
      setActiveId(id);
      setTip(null);
    },
    onBlur: () => clearIfActive(id),
    onClick: () => setActiveId(id),
  });

  // 月份列 + 軌道 + tooltip：兩種版型共用，僅月份寬度與外層容器不同。
  const monthsAndTrack = (
    <>
      {/* 月份列 */}
      <Box sx={{ display: 'flex', mt: 1 }}>
        {MONTHS.map((m) => (
          <Box
            key={m}
            sx={{
              ...(scroll
                ? { width: MONTH_W, flexShrink: 0 }
                : { flex: 1, minWidth: 0 }),
              textAlign: 'center',
              py: '2px',
              // 1.4.4 Resize Text：中文月份不小於 12px。
              fontSize: 12,
              fontWeight: 500,
              letterSpacing: '0.1em',
              whiteSpace: 'nowrap',
              color: C.text,
            }}
          >
            {m}月
          </Box>
        ))}
      </Box>

      {/* 白色描邊軌道 + 事件（期間長條／時間點圓點）。tooltip 浮於 mark 上方，
          軌道下方不需為其預留空間。 */}
      <Box
        sx={{
          position: 'relative',
          mt: 1,
          pb: '12px',
        }}
      >
        <Box
          sx={{
            position: 'relative',
            height: railHeight,
            borderRadius: '11px',
            border: `1px solid ${C.border}`,
            bgcolor: C.white,
            overflow: 'hidden',
          }}
        >
          {/* 月份刻度：11 條淡分隔線，讓事件讀作落在月曆刻度上而非漂浮。 */}
          {MONTHS.slice(1).map((m) => (
            <Box
              key={`grid-${m}`}
              aria-hidden
              sx={{
                position: 'absolute',
                top: 0,
                bottom: 0,
                left: `${((m - 1) / 12) * 100}%`,
                width: '1px',
                bgcolor: C.grid,
              }}
            />
          ))}

          {/* 時間線：貫穿圓點列的水平軸線，讓時間點串成一線。 */}
          <Box
            aria-hidden
            sx={{
              position: 'absolute',
              left: 0,
              right: 0,
              top: axisY,
              height: '1px',
              bgcolor: C.axis,
            }}
          />

          {/* 期間長條（依 lane 分列） */}
          {ranges.map((e) => {
            const { left, width } = rangeMetrics(e);
            const lane = laneOf[e.id] ?? 0;
            const on = activeId === e.id;
            return (
              <Box
                key={e.id}
                {...markHandlers(e.id)}
                aria-label={`${e.dateLabel} ${e.title}`}
                sx={{
                  position: 'absolute',
                  top:
                    RAIL_PAD_Y +
                    (hasPoints ? POINT_ROW_H : 0) +
                    lane * LANE_H +
                    (LANE_H - BAR_H) / 2,
                  left: `${left * 100}%`,
                  width: `${width * 100}%`,
                  minWidth: 6,
                  height: BAR_H,
                  borderRadius: '999px',
                  bgcolor: C.segActive,
                  opacity: on ? 1 : 0.92,
                  boxShadow: on
                    ? `0 0 0 2px ${C.white}, 0 0 0 3px ${C.segActive}`
                    : 'none',
                  cursor: 'pointer',
                  outline: 'none',
                  transition: 'opacity 0.15s ease, box-shadow 0.15s ease',
                }}
              />
            );
          })}

          {/* 時間點圓點 */}
          {points.map((e) => {
            const left = pointLeft(e);
            const on = activeId === e.id;
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
                  bgcolor: C.segActive,
                  border: `2px solid ${C.white}`,
                  boxShadow: on
                    ? `0 0 0 2px ${C.segActive}`
                    : `0 0 0 3px ${C.white}`,
                  cursor: 'pointer',
                  outline: 'none',
                  transition: 'box-shadow 0.15s ease',
                }}
              />
            );
          })}
        </Box>
      </Box>
    </>
  );

  /**
   * tooltip 定位（桌機／手機共用）：以量測到的 mark 位置浮於元件根層——不被手機橫向
   * 捲動容器裁切。框體以 mark 為中心、夾在根寬內不出界；箭頭再依 mark 實際位置相對
   * 框中心位移，使箭頭「始終對準」該事件 mark（即使框體因靠邊而位移）。
   */
  const TIP_PAD = 8;
  const tipHalf = tipW / 2;
  const tipLeft = tip
    ? Math.min(
        Math.max(tip.x, tipHalf + TIP_PAD),
        Math.max(tipHalf + TIP_PAD, tip.w - tipHalf - TIP_PAD),
      )
    : 0;
  const arrowMax = Math.max(0, tipHalf - 8);
  const arrowDx = tip
    ? Math.max(-arrowMax, Math.min(arrowMax, tip.x - tipLeft))
    : 0;

  const tooltipNode =
    activeEvent && tip ? (
      <Box
        ref={tooltipRef}
        role="tooltip"
        sx={{
          position: 'absolute',
          left: `${tipLeft}px`,
          top: tip.y,
          // max-content：避免絕對定位框靠邊時被「left 到容器右緣的可用寬」壓窄而折行。
          width: 'max-content',
          maxWidth: 260,
          transform: 'translate(-50%, calc(-100% - 8px))',
          px: 1.5,
          py: 0.75,
          bgcolor: C.white,
          border: `1px solid ${C.border}`,
          borderRadius: '10px',
          boxShadow: '0 8px 20px -10px rgba(0,0,0,0.35)',
          pointerEvents: 'none',
          zIndex: 4,
          '&::before': {
            content: '""',
            position: 'absolute',
            left: `calc(50% + ${arrowDx}px)`,
            bottom: -5,
            transform: 'translateX(-50%) rotate(45deg)',
            width: 8,
            height: 8,
            bgcolor: C.white,
            borderBottom: `1px solid ${C.border}`,
            borderRight: `1px solid ${C.border}`,
          },
        }}
      >
        <Typography
          sx={{
            fontSize: 11,
            fontWeight: 600,
            lineHeight: 1.4,
            letterSpacing: '0.04em',
            color: C.segActive,
            whiteSpace: 'nowrap',
          }}
        >
          {activeEvent.dateLabel}
        </Typography>
        <Typography
          sx={{
            fontSize: 12.5,
            fontWeight: 500,
            lineHeight: 1.4,
            color: C.ink,
          }}
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

  return (
    <Box ref={rootRef} sx={{ position: 'relative', width: '100%' }}>
      {tooltipNode}
      {/* 年度選擇：多年度以切換鈕呈現，單一年度顯示標籤。 */}
      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          gap: 1,
          pb: 0.5,
          borderBottom: `1px solid ${C.border}`,
        }}
      >
        {years.length > 1 ? (
          years.map((y, i) => {
            const on = i === yearIndex;
            return (
              <Box
                key={y.year}
                component="button"
                type="button"
                onClick={() => {
                  setYearIndex(i);
                  setActiveId(null);
                }}
                aria-pressed={on}
                sx={{
                  border: 'none',
                  background: 'none',
                  p: 0,
                  cursor: 'pointer',
                  fontSize: 11.7,
                  fontWeight: on ? 600 : 500,
                  letterSpacing: '0.1em',
                  color: on ? C.segActive : C.text,
                  whiteSpace: 'nowrap',
                }}
              >
                {y.label ?? `${y.year}年`}
              </Box>
            );
          })
        ) : (
          <>
            <Typography
              component="span"
              sx={{
                fontSize: 11.7,
                fontWeight: 500,
                letterSpacing: '0.1em',
                color: C.text,
              }}
            >
              {current.label ?? `${current.year}年`}
            </Typography>
            <KeyboardArrowDownIcon sx={{ fontSize: 14, color: C.text }} />
          </>
        )}
      </Box>

      {scroll ? (
        <Box
          // 橫向捲動會使已量測的 tooltip 位置失準，捲動時關閉 tooltip。
          onScroll={() => {
            if (tip) {
              setTip(null);
              setActiveId(null);
            }
          }}
          sx={{
            overflowX: 'auto',
            // 行動裝置以滑動操作，隱藏捲軸避免細軸破壞版面。
            scrollbarWidth: 'none',
            msOverflowStyle: 'none',
            '&::-webkit-scrollbar': { display: 'none' },
            WebkitOverflowScrolling: 'touch',
          }}
        >
          <Box sx={{ width: MONTH_W * MONTHS.length }}>{monthsAndTrack}</Box>
        </Box>
      ) : (
        monthsAndTrack
      )}

      {/* 事件列表：常駐呈現（行動裝置無 hover 亦可取得完整資訊，依 spec）。
          與軌道連動：hover／focus 某列會 highlight 對應的軌道 mark，反之亦然。 */}
      {showList && listEvents.length > 0 && (
        <Box
          component="ul"
          sx={{
            listStyle: 'none',
            m: 0,
            mt: '12px',
            p: 0,
            // 桌機卡片以多欄壓低列表高度（scroll／窄容器仍單欄）。
            display: 'grid',
            gridTemplateColumns: `repeat(${scroll ? 1 : listCols}, minmax(0, 1fr))`,
            columnGap: '28px',
          }}
        >
          {listEvents.map((e) => {
            const on = activeId === e.id;
            return (
              <Box
                key={e.id}
                component="li"
                {...rowHandlers(e.id)}
                sx={{
                  display: 'flex',
                  gap: '16px',
                  py: '5px',
                  px: '8px',
                  borderRadius: '8px',
                  alignItems: 'baseline',
                  cursor: 'default',
                  outline: 'none',
                  bgcolor: on ? 'rgba(227, 174, 93, 0.12)' : 'transparent',
                  boxShadow: on ? `inset 3px 0 0 ${C.segActive}` : 'none',
                  transition:
                    'background-color 0.15s ease, box-shadow 0.15s ease',
                }}
              >
                <Typography
                  sx={{
                    flex: `0 0 ${LIST_DATE_W}px`,
                    fontSize: 12,
                    fontWeight: 600,
                    lineHeight: 1.5,
                    color: C.segActive,
                    fontVariantNumeric: 'tabular-nums',
                    whiteSpace: 'nowrap',
                  }}
                >
                  {e.dateLabel}
                </Typography>
                <Box sx={{ minWidth: 0 }}>
                  <Typography
                    sx={{ fontSize: 13, lineHeight: 1.5, color: C.ink }}
                  >
                    {e.title}
                  </Typography>
                  {e.note && (
                    <Typography
                      sx={{
                        mt: 0.25,
                        fontSize: 12,
                        lineHeight: 1.5,
                        color: C.text,
                      }}
                    >
                      {e.note}
                    </Typography>
                  )}
                </Box>
              </Box>
            );
          })}
        </Box>
      )}
    </Box>
  );
}
