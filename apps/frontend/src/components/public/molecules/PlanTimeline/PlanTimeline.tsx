'use client';

import { useMemo, useState } from 'react';

import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';

import type {
  PlanTimelineYear,
  TimelineDate,
  TimelineEvent,
} from '@/types/plan';

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
const DOT = 11;
const BAR_H = 12;
const LANE_H = 20;
const POINT_ROW_H = 18;
const RAIL_PAD_Y = 7;

/** Figma 色票（沿用 node 1:86 Timeline）：月份字、軌道底邊框、閒置段、作用段、白。 */
const C = {
  text: '#9A9A9A',
  border: '#D3D3D3',
  segIdle: '#ECECEC',
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
  return { laneOf, laneCount: Math.max(1, laneEnds.length) };
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
}: PlanTimelineProps) {
  const years = timelines ?? [];
  const [yearIndex, setYearIndex] = useState(0);
  const [activeId, setActiveId] = useState<string | null>(null);

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

  if (years.length === 0 || !current) return null;

  const scroll = variant === 'scroll';
  const hasPoints = points.length > 0;
  const railHeight =
    RAIL_PAD_Y * 2 + (hasPoints ? POINT_ROW_H : 0) + laneCount * LANE_H;
  const activeEvent = events.find((e) => e.id === activeId) ?? null;

  const clearIfActive = (id: string) =>
    setActiveId((prev) => (prev === id ? null : prev));

  /** 事件互動處理（hover／focus／點擊皆設為作用事件；點擊可切換關閉）。 */
  const eventHandlers = (id: string) => ({
    tabIndex: 0,
    role: 'button' as const,
    onMouseEnter: () => setActiveId(id),
    onMouseLeave: () => clearIfActive(id),
    onFocus: () => setActiveId(id),
    onBlur: () => clearIfActive(id),
    onClick: () => setActiveId((prev) => (prev === id ? null : id)),
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

      {/* 白色描邊軌道 + 事件（期間長條／時間點圓點） */}
      <Box sx={{ position: 'relative', mt: 1, pb: scroll ? '64px' : '56px' }}>
        <Box
          sx={{
            position: 'relative',
            height: railHeight,
            borderRadius: '11px',
            border: `1px solid ${C.border}`,
            bgcolor: C.white,
          }}
        >
          {/* 期間長條（依 lane 分列） */}
          {ranges.map((e) => {
            const { left, width } = rangeMetrics(e);
            const lane = laneOf[e.id] ?? 0;
            const on = activeId === e.id;
            return (
              <Box
                key={e.id}
                {...eventHandlers(e.id)}
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
                {...eventHandlers(e.id)}
                aria-label={`${e.dateLabel} ${e.title}`}
                sx={{
                  position: 'absolute',
                  top: RAIL_PAD_Y + (POINT_ROW_H - DOT) / 2,
                  left: `${left * 100}%`,
                  width: DOT,
                  height: DOT,
                  transform: 'translateX(-50%)',
                  borderRadius: '50%',
                  bgcolor: C.segActive,
                  border: `2px solid ${C.white}`,
                  boxShadow: on ? `0 0 0 2px ${C.segActive}` : 'none',
                  cursor: 'pointer',
                  outline: 'none',
                  transition: 'box-shadow 0.15s ease',
                }}
              />
            );
          })}
        </Box>

        {/* tooltip：作用事件顯示於軌道下方，箭頭指向軌道。 */}
        {activeEvent && (
          <Box
            role="tooltip"
            sx={{
              position: 'absolute',
              top: railHeight + 10,
              left: `${startPct(activeEvent) * 100}%`,
              transform: 'translateX(-50%)',
              maxWidth: scroll ? 220 : 280,
              px: 1.5,
              py: 0.75,
              bgcolor: C.white,
              border: `1px solid ${C.border}`,
              borderRadius: '10px',
              boxShadow: '0 6px 16px -10px rgba(0,0,0,0.3)',
              pointerEvents: 'none',
              zIndex: 2,
              '&::before': {
                content: '""',
                position: 'absolute',
                top: -5,
                left: '50%',
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
                sx={{
                  mt: 0.25,
                  fontSize: 11.5,
                  lineHeight: 1.5,
                  color: C.text,
                }}
              >
                {activeEvent.note}
              </Typography>
            )}
          </Box>
        )}
      </Box>
    </>
  );

  return (
    <Box sx={{ width: '100%' }}>
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

      {/* 事件列表：詳細頁呈現，行動裝置無 hover 亦可取得完整資訊（依 spec）。 */}
      {showList && listEvents.length > 0 && (
        <Box component="ul" sx={{ listStyle: 'none', m: 0, mt: 1, p: 0 }}>
          {listEvents.map((e) => (
            <Box
              key={e.id}
              component="li"
              sx={{
                display: 'flex',
                gap: 1.5,
                py: 0.75,
                borderTop: `1px solid ${C.segIdle}`,
                alignItems: 'baseline',
              }}
            >
              <Typography
                sx={{
                  flex: '0 0 auto',
                  minWidth: 96,
                  fontSize: 12,
                  fontWeight: 600,
                  lineHeight: 1.5,
                  color: C.segActive,
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
          ))}
        </Box>
      )}
    </Box>
  );
}
