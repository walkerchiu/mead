'use client';

import Box from '@mui/material/Box';

import { portalTokens } from '../../tokens';

export interface PlanPeekNavButtonProps {
  /**
   * 探出方向與作用：
   *  - `prev`：由左緣探出、切到上一個計畫（`‹` ＋形狀標記）。
   *  - `next`：由右緣探出、切到下一個計畫（形狀標記＋ `›`）。
   */
  direction: 'prev' | 'next';
  /** 目標計畫名稱（無障礙標籤）。 */
  planName: string;
  /** 目標計畫的 logo 標誌圖路徑（純標誌、透明底）。 */
  markSrc: string;
  /** 垂直位置（CSS top 值），預設 `'6%'`；手機卡片較高時可指定對齊卡片一 logo 列。 */
  top?: string;
  onClick: () => void;
}

const PILL_H = 64;
const MARKER = 35;
// chevron 與 logo 標誌的間距（依設計稿 node 1:2：chevron 右緣 x=34、logo 左緣 x=55 → 21px）。
const GAP = 20;
// 外側（探出端）伸出計畫區邊界、被第二屏 overflow 裁切的量，形成「自邊緣探出」的探頭感。
const EDGE_OUT = 26;

/**
 * PlanPeekNavButton — 計畫輪播的左右探頭導覽鈕（依設計師新版稿）。
 *
 * 貼著第二屏左右緣、於兩側 peek 細條上半部探出的白色膠囊鈕：左鈕含 `‹` 與上一個計畫的
 * logo 標誌、右鈕含下一個計畫的 logo 標誌與 `›`，點擊即切換到對應計畫。膠囊外側端伸出
 * 邊界被裁切，hover 時略往內滑增添可按性。
 */
export function PlanPeekNavButton({
  direction,
  planName,
  markSrc,
  top = '6%',
  onClick,
}: PlanPeekNavButtonProps) {
  const isPrev = direction === 'prev';

  const marker = (
    <Box
      // key 綁 markSrc：切換計畫換成目標計畫的標誌時，img 重掛、由透明漸入（無到有）。
      key={markSrc}
      component="img"
      src={markSrc}
      alt=""
      aria-hidden
      sx={{
        width: MARKER,
        height: MARKER,
        flexShrink: 0,
        objectFit: 'contain',
        '@keyframes planPeekMarkFadeIn': {
          from: { opacity: 0 },
          to: { opacity: 1 },
        },
        // 標誌由透明度 0 漸入到 100，約 1.2s 柔和淡入。
        animation: 'planPeekMarkFadeIn 1.2s ease-out both',
        '@media (prefers-reduced-motion: reduce)': { animation: 'none' },
      }}
    />
  );
  // 細長 chevron（依設計稿 node 364:23：viewBox 19×35、stroke-width 3、黑 15% 透明、尖角）。
  const chevron = (
    <Box
      component="svg"
      aria-hidden
      viewBox="0 0 19.17 35.09"
      sx={{ width: 16, height: 29, flexShrink: 0, display: 'block' }}
    >
      <path
        d={
          isPrev
            ? 'M18.09 1.04 L2.09 17.54 L18.09 34.04'
            : 'M1.08 1.04 L17.08 17.54 L1.08 34.04'
        }
        fill="none"
        stroke="#000000"
        strokeOpacity={0.15}
        strokeWidth={3}
      />
    </Box>
  );

  return (
    <Box
      component="button"
      type="button"
      onClick={onClick}
      aria-label={
        isPrev ? `上一個計畫：${planName}` : `下一個計畫：${planName}`
      }
      sx={{
        position: 'absolute',
        top,
        [isPrev ? 'left' : 'right']: 0,
        transform: `translateX(${isPrev ? -EDGE_OUT : EDGE_OUT}px)`,
        zIndex: 6,
        display: 'flex',
        alignItems: 'center',
        gap: `${GAP}px`,
        height: PILL_H,
        // 探出端內距較大（含被裁切量）、內側內距適中，讓內容靠向可見的內側。
        pl: isPrev ? `${EDGE_OUT + 14}px` : '18px',
        pr: isPrev ? '18px' : `${EDGE_OUT + 14}px`,
        border: 0,
        bgcolor: '#ffffff',
        borderRadius: `${PILL_H / 2}px`,
        boxShadow:
          '0 8px 24px rgba(0, 0, 0, 0.1), 0 2px 6px rgba(0, 0, 0, 0.06)',
        cursor: 'pointer',
        // top 納入過場：手機版 peek 鈕會在使用者捲到卡片底部時由上方「跳下來」就位。
        transition:
          'box-shadow 0.2s ease, transform 0.2s ease, top 0.4s cubic-bezier(0.22, 1, 0.36, 1)',
        '&:hover': {
          transform: `translateX(${isPrev ? -EDGE_OUT + 4 : EDGE_OUT - 4}px)`,
          boxShadow:
            '0 10px 28px rgba(0, 0, 0, 0.14), 0 3px 8px rgba(0, 0, 0, 0.08)',
        },
        '&:focus-visible': portalTokens.focusRing,
        '@media (prefers-reduced-motion: reduce)': { transition: 'none' },
      }}
    >
      {isPrev ? (
        <>
          {chevron}
          {marker}
        </>
      ) : (
        <>
          {marker}
          {chevron}
        </>
      )}
    </Box>
  );
}
