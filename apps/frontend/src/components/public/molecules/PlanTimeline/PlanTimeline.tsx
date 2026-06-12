'use client';

import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';

const MONTHS = Array.from({ length: 12 }, (_, i) => i + 1);

/** scroll 版型每月固定寬：12 個月總寬超出窄容器，使月份列可橫向滑動。 */
const MONTH_W = 52;

/** 軌道內的色塊區段（依 Figma node 1:86 的 Rectangle 4445-4454 比例近似） */
interface TrackSegment {
  leftPct: number;
  widthPct: number;
  active: boolean;
}
const TRACK_SEGMENTS: TrackSegment[] = [
  { leftPct: 1.5, widthPct: 5.8, active: false },
  { leftPct: 8, widthPct: 2.1, active: false },
  { leftPct: 10.5, widthPct: 17.2, active: true },
  { leftPct: 28.4, widthPct: 2.2, active: false },
  { leftPct: 31, widthPct: 5.8, active: false },
  { leftPct: 72.8, widthPct: 5.8, active: false },
  { leftPct: 80, widthPct: 1.9, active: false },
];

/** Figma 色票（依設計稿嚴格對齊：node 1:86 Timeline）：
 *  月份字 #9A9A9A、軌道底邊框 #D3D3D3、未達月刻度 #ECECEC、
 *  當前月 highlight 與進度條 #E3AE5D、當前月字 #FFFFFF。 */
const C = {
  text: '#9A9A9A',
  border: '#D3D3D3',
  segIdle: '#ECECEC',
  segActive: '#E3AE5D',
  white: '#ffffff',
};

export interface PlanTimelineProps {
  /** 顯示年份，預設 2026 */
  year?: number;
  /** 作用中的月份（1–12），預設 3 */
  activeMonth?: number;
  /** 作用區段下方的說明氣泡文字 */
  calloutText?: string;
  /**
   * 版型：
   *  - `fit`（預設）：月份等寬填滿容器，適合寬版（桌機卡片、詳細頁）。
   *  - `scroll`：月份固定寬、整排超出容器寬，於窄版（手機卡片）橫向滑動閱讀。
   */
  variant?: 'fit' | 'scroll';
}

/**
 * PlanTimeline — 計畫時程軸（依 Figma node 1:86「Group 11」）。
 *
 * 由上而下：年份選擇器 +底線、月份列（作用月份為琥珀底白字）、
 * 白色描邊軌道（內含灰／琥珀色塊區段）、決選進行中說明氣泡。
 * 時程為設計呈現用途（plans.json 未含時程資料）。
 *
 * 寬版（`fit`）月份等寬填滿；窄版（`scroll`）月份固定寬、整排可橫向滑動，
 * 月份列與軌道共用同一可捲動內層，色塊與氣泡的百分比定位隨之對齊。
 */
export function PlanTimeline({
  year = 2026,
  activeMonth = 3,
  calloutText = '115年度 決選進行中',
  variant = 'fit',
}: PlanTimelineProps) {
  const calloutLeft = TRACK_SEGMENTS.find((s) => s.active) ?? TRACK_SEGMENTS[0];
  const calloutCenterPct = calloutLeft.leftPct + calloutLeft.widthPct / 2;
  const scroll = variant === 'scroll';
  // 氣泡文字為「<年度> <狀態>」格式：以空白斷成兩行（年度在上、狀態在下）。
  const calloutLines = calloutText.split(/\s+/).filter(Boolean);
  const renderCalloutLines = (align: 'left' | 'center' | 'right') =>
    calloutLines.map((line, i) => (
      <Typography
        key={i}
        sx={{
          // 1.4.4 Resize Text：8.2px 太小，提升至 12px。
          fontSize: 12,
          fontWeight: 500,
          lineHeight: 1.5,
          letterSpacing: '0.1em',
          whiteSpace: 'nowrap',
          textAlign: align,
          color: C.text,
        }}
      >
        {line}
      </Typography>
    ));

  // 月份列 + 軌道 + 氣泡：兩種版型共用，僅月份寬度與外層容器不同。
  const monthsAndTrack = (
    <>
      {/* 月份列 */}
      <Box sx={{ display: 'flex', mt: 1 }}>
        {MONTHS.map((m) => {
          const active = m === activeMonth;
          return (
            <Box
              key={m}
              sx={{
                ...(scroll
                  ? { width: MONTH_W, flexShrink: 0 }
                  : { flex: 1, minWidth: 0 }),
                textAlign: 'center',
                py: '2px',
                borderRadius: '999px',
                // 1.4.4 Resize Text：9.8px 對中文太小，提升至 12px。
                fontSize: 12,
                fontWeight: 500,
                letterSpacing: '0.1em',
                whiteSpace: 'nowrap',
                color: active ? C.white : C.text,
                bgcolor: active ? C.segActive : 'transparent',
              }}
            >
              {m}月
            </Box>
          );
        })}
      </Box>

      {/* 白色描邊軌道 + 色塊區段 */}
      {/* scroll 版型下方預留高度：氣泡為絕對定位，橫向捲動容器的 overflow-x:auto
          會連帶裁切 overflow-y，預留空間讓兩行氣泡完整顯示且不被裁。 */}
      <Box sx={{ position: 'relative', mt: 1, pb: scroll ? '56px' : 4 }}>
        <Box
          sx={{
            position: 'relative',
            height: 38,
            borderRadius: '11px',
            border: `1px solid ${C.border}`,
            bgcolor: C.white,
          }}
        >
          {TRACK_SEGMENTS.map((seg, i) => (
            <Box
              key={i}
              sx={{
                position: 'absolute',
                top: '50%',
                transform: 'translateY(-50%)',
                left: `${seg.leftPct}%`,
                width: `${seg.widthPct}%`,
                height: 16,
                borderRadius: '999px',
                bgcolor: seg.active ? C.segActive : C.segIdle,
              }}
            />
          ))}
        </Box>

        {/* 氣泡：置於作用區段下方、頂端箭頭指向軌道。
            fit 文字置中；scroll（手機）文字靠左。 */}
        {calloutLines.length > 0 && (
          <Box
            sx={{
              position: 'absolute',
              top: 44,
              left: `${calloutCenterPct}%`,
              transform: 'translateX(-50%)',
              px: 1.5,
              py: 0.75,
              bgcolor: C.white,
              border: `1px solid ${C.border}`,
              borderRadius: '10px',
              boxShadow: '0 6px 16px -10px rgba(0,0,0,0.3)',
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
            {renderCalloutLines(scroll ? 'left' : 'center')}
          </Box>
        )}
      </Box>
    </>
  );

  return (
    <Box sx={{ width: '100%' }}>
      {/* 年份 + 底線 */}
      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          gap: 0.25,
          pb: 0.5,
          borderBottom: `1px solid ${C.border}`,
        }}
      >
        <Typography
          component="span"
          sx={{
            fontSize: 11.7,
            fontWeight: 500,
            letterSpacing: '0.1em',
            color: C.text,
          }}
        >
          {year}年
        </Typography>
        <KeyboardArrowDownIcon sx={{ fontSize: 14, color: C.text }} />
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
    </Box>
  );
}
