'use client';

import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';

const MONTHS = Array.from({ length: 12 }, (_, i) => i + 1);

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

/** Figma 色票 */
const C = {
  text: '#9a9a9a',
  border: '#d3d3d3',
  segIdle: '#ececec',
  segActive: '#e3ae5d',
  white: '#ffffff',
};

export interface PlanTimelineProps {
  /** 顯示年份，預設 2026 */
  year?: number;
  /** 作用中的月份（1–12），預設 3 */
  activeMonth?: number;
  /** 作用區段下方的說明氣泡文字 */
  calloutText?: string;
}

/**
 * PlanTimeline — 計畫時程軸（依 Figma node 1:86「Group 11」）。
 *
 * 由上而下：年份選擇器 +底線、月份列（作用月份為琥珀底白字）、
 * 白色描邊軌道（內含灰／琥珀色塊區段）、決選進行中說明氣泡。
 * 時程為設計呈現用途（plans.json 未含時程資料）。
 */
export function PlanTimeline({
  year = 2026,
  activeMonth = 3,
  calloutText = '115年度 決選進行中',
}: PlanTimelineProps) {
  const calloutLeft = TRACK_SEGMENTS.find((s) => s.active) ?? TRACK_SEGMENTS[0];
  const calloutCenterPct = calloutLeft.leftPct + calloutLeft.widthPct / 2;

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

      {/* 月份列 */}
      <Box sx={{ display: 'flex', mt: 1 }}>
        {MONTHS.map((m) => {
          const active = m === activeMonth;
          return (
            <Box
              key={m}
              sx={{
                flex: 1,
                minWidth: 0,
                textAlign: 'center',
                py: '2px',
                borderRadius: '999px',
                fontSize: 9.8,
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
      <Box sx={{ position: 'relative', mt: 1, pb: 4 }}>
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

        {/* 說明氣泡 */}
        {calloutText && (
          <Box
            sx={{
              position: 'absolute',
              top: 44,
              left: `${calloutCenterPct}%`,
              transform: 'translateX(-50%)',
              px: 1.25,
              py: 0.5,
              bgcolor: C.white,
              border: `1px solid ${C.border}`,
              borderRadius: '8px',
              boxShadow: '0 6px 16px -10px rgba(0,0,0,0.3)',
              whiteSpace: 'nowrap',
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
                fontSize: 8.2,
                fontWeight: 500,
                letterSpacing: '0.1em',
                color: C.text,
              }}
            >
              {calloutText}
            </Typography>
          </Box>
        )}
      </Box>
    </Box>
  );
}
