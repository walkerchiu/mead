'use client';

import { useEffect, useMemo, useRef, useState } from 'react';

import Box from '@mui/material/Box';

import type { Plan } from '@/types/plan';

import { portalTokens } from '../../tokens';
import { PlanCard } from '../PlanCard';
import { SLOGAN_EXIT_MS } from '../PortalIntroSection/PortalIntroSection';
import { PaperFlipStar } from './PaperFlipStar';

/**
 * 卡片周圍裝飾星形照片的位置（相對卡片左上角的 px，依各計畫 Figma 桌機稿
 * node 1:2 / 23:21 / 31:215 的 Star 95 / 94 / 93）。
 */
// 裝飾星形位置（相對展開卡左上角 px）。各計畫排列不同，依設計稿三個 >834px 版面
// （菁培 node 1:2、設計戰國策 23:21、創意設計大賽 31:215）的 Star 95/94/93 換算：
// 取「相對各稿卡片邊緣的偏移」再套到統一的 960 寬卡片（左側星形維持左溢、右側星形
// 錨定右溢，保留各稿溢出意圖）。順序固定為 [上, 左, 右]，對應 photos[0..2]。
const DECOR_STARS: Record<string, { x: number; y: number }[]> = {
  sposad: [
    { x: 620, y: -92 }, // 上方偏右
    { x: -73, y: 213 }, // 左側溢出
    { x: 734, y: 245 }, // 右側
  ],
  idc: [
    { x: -57, y: -92 }, // 上方偏左
    { x: -167, y: 269 }, // 左側溢出
    { x: 800, y: 162 }, // 右側溢出
  ],
  tisdc: [
    { x: 88, y: -113 }, // 上方偏中
    { x: -164, y: 162 }, // 左側溢出
    { x: 805, y: 248 }, // 右側溢出
  ],
};
/** 裝飾星形尺寸（Figma 為 297px） */
const STAR_SIZE = 292;

// 手機版（<834px）星形排列：依設計稿（node 43:1142）於窄卡片邊緣露出。卡片在手機為
// 滿版寬度，故以邊緣錨定的 CSS 值定位（right 用 calc），縮小至約 0.55；順序對應 3 顆星。
const MOBILE_STAR_LAYOUT: { left: string; top: string }[] = [
  { left: 'calc(100% - 150px)', top: '-44px' }, // 右上露出
  { left: '-72px', top: '42%' }, // 左側露出
  { left: 'calc(100% - 120px)', top: '74%' }, // 右下露出
];

export interface PlanCarouselProps {
  /** 三大計畫（已依設計稿順序排好） */
  plans: Plan[];
  /** 目前展開的計畫索引；null = 靜止（三張收合卡並列）。受控。 */
  expandedIndex: number | null;
  /** 點擊卡片展開某計畫 */
  onExpandedIndexChange: (index: number) => void;
  /**
   * hover 某計畫卡片時回報其索引、離開回報 null。
   * 供主標切換為「讓 ___ 被看見」（依設計稿過場效果說明）。
   */
  onHoverPlanChange?: (index: number | null) => void;
  /** 點擊發生時觸發；參數為被點擊的計畫索引，供上層在 EXIT 期間同步渲染
   *  「計畫大卡從左下方滑入」的覆蓋層（與點擊卡的升起同拍）。 */
  onSelectStart?: (index: number) => void;
  /**
   * 兩側 peek 點擊時，改由上層接管導覽（捲動驅動模式用）。提供時 peek 不走內部
   * startSlide，而是回報目標索引與方向，讓上層捲到對應段落、由捲動進度觸發切換，
   * 避免內部直接改 index 與捲動位置脫鉤。未提供時 peek 走內部左右滑動。
   */
  onPeekNavigate?: (targetIndex: number, dir: 'prev' | 'next') => void;
  /**
   * 卡片自適應第二屏的縮放倍率（≤1）。由上層依視窗高與卡片內容高量算，超過一屏時
   * 等比縮小整張卡填入一屏。只套在卡片容器（不含兩側 peek，peek 以視窗高定位）。
   */
  cardScale?: number;
}

/**
 * 三張收合卡上的計畫顯示名稱（依 spec v4 IMPLEMENTATION.md「PROGRAMS.cardTitle」）。
 * 每個元素一行、固定斷行（不靠 CSS auto-wrap）。
 */
const CARD_TITLE_LINES: Record<string, string[]> = {
  sposad: ['教育部藝術與設計菁英海外', '培訓計畫'],
  idc: ['設計戰國策—鼓勵學生參加', '藝術與設計類國際競賽計畫'],
  tisdc: ['臺灣國際學生創意設計大賽'],
};

/** 計畫卡片的固定斷行陣列 */
function cardTitleLines(plan: Plan): string[] {
  return CARD_TITLE_LINES[plan.id] ?? [plan.name.zh];
}

/** 卡片顯示名（合併行，用於 aria-label） */
function planName(plan: Plan): string {
  return cardTitleLines(plan).join('');
}

/** 取得計畫的本機照片路徑 */
function localPhotos(plan: Plan): string[] {
  return plan.photos
    .filter((p) => p.type === 'local' && p.src)
    .map((p) => p.src as string);
}

/**
 * 兩側豎立的相鄰計畫預覽矩形 — 半透明毛玻璃。
 * 760 寬、left/right: -720px 讓多數寬度溢出畫面，露出約 40px 在視窗左右側緣。
 * 點擊以橫向滑動切換上/下計畫。
 *
 * peekSx() 回傳完整 sx — direction 控制：
 *  - 自訂方向游標（左 / 右箭頭，與 portal-cursor.svg 同風格）
 *  - hover 時整塊向視窗中央輕推、背景加深、邊框變實，露出更多寬度
 *  - 內部箭頭 icon 預設淡出、hover 時淡入並向中央微滑（強化方向感）
 *  - 用 `&&` 雙重 class 提高特異性，覆蓋 PortalLandingPage 對 `button` 的 cursor 規則
 */
function peekSx(direction: 'prev' | 'next') {
  const isPrev = direction === 'prev';
  const cursorUrl = isPrev
    ? 'url("/cursors/portal-cursor-left.svg") 4 17, pointer'
    : 'url("/cursors/portal-cursor-right.svg") 30 17, pointer';
  return {
    display: 'none',
    position: 'absolute',
    top: 0,
    bottom: 0,
    // peek 與卡片同高：top/bottom:0 撐滿 carousel 根（其高度 = 卡片 zoom 後的高度），
    // 故 peek 隨卡片縮放與置中一起對齊，上下圓角框線自然落在可見視窗內。
    width: 760,
    p: 0,
    border: 'none',
    borderRadius: '17.35px',
    bgcolor: 'rgba(255, 255, 255, 0.54)',
    // 原本 rgba(138,138,138,0.49) 實效 ≈ #B4B4B4 on #E4E4E4 ≈ 1.6:1，
    // UI 元件須 ≥3:1（WCAG 1.4.11）。加深至 rgba(92,92,92,0.85) 約 4.4:1。
    outline: '1px solid rgba(92, 92, 92, 0.85)',
    outlineOffset: '-1px',
    backdropFilter: 'blur(28.34px)',
    WebkitBackdropFilter: 'blur(28.34px)',
    zIndex: 5,
    // 對齊 portal cursor 風格的方向箭頭 cursor（雙重 class 覆蓋父層 button 規則）
    '&&': { cursor: cursorUrl },
    // 平滑過渡：背景、邊框、位移、陰影
    transition:
      'background-color 0.28s ease, outline-color 0.28s ease, transform 0.32s cubic-bezier(0.22, 1, 0.36, 1), box-shadow 0.28s ease',
    // 露出約 40px 在視窗左右側緣（細長預覽條）。
    [isPrev ? 'left' : 'right']: -720,
    '&:hover': {
      bgcolor: 'rgba(255, 255, 255, 0.85)',
      outlineColor: 'rgba(138, 138, 138, 0.85)',
      // 往視窗中央輕推 12px，露出更多寬度暗示「可拉出」
      transform: isPrev ? 'translateX(12px)' : 'translateX(-12px)',
      boxShadow: '0 18px 40px -22px rgba(0, 0, 0, 0.28)',
    },
    '&:active': {
      transform: isPrev ? 'translateX(6px)' : 'translateX(-6px)',
      bgcolor: 'rgba(255, 255, 255, 0.92)',
    },
    '&:focus-visible': portalTokens.focusRing,
    [portalTokens.mq.tabletUp]: { display: 'flex' },
    // 內部箭頭 icon — 預設淡出、hover 時淡入並朝中央滑入
    alignItems: 'center',
    justifyContent: isPrev ? 'flex-end' : 'flex-start',
    // 箭頭預留邊距：靠近視窗中央那一側
    px: '10px',
    '& .peek-arrow': {
      width: 22,
      height: 22,
      color: '#1A1A1A',
      opacity: 0,
      transform: isPrev ? 'translateX(8px)' : 'translateX(-8px)',
      transition:
        'opacity 0.28s ease, transform 0.32s cubic-bezier(0.22, 1, 0.36, 1)',
    },
    '&:hover .peek-arrow': {
      opacity: 0.7,
      transform: 'translateX(0)',
    },
    '@media (prefers-reduced-motion: reduce)': {
      transition: 'none',
      '&:hover': { transform: 'none' },
      '& .peek-arrow': { transition: 'none' },
    },
  } as const;
}

/**
 * PlanCardWithStars — 展開大卡 + 周圍裝飾星形照片的組合單元。
 *
 * 抽出此 helper 是為了讓「退場舊卡」和「入場新卡」共用同一份星形渲染邏輯，
 * 在左右滑動轉場期間兩張卡（含其周邊星形）能一起滑動，避免星形與卡片脫節。
 */
export function PlanCardWithStars({
  plan,
  showStars = true,
  cardScale = 1,
}: {
  plan: Plan;
  /** 卡片自適應放大倍率（≥1）；轉傳給星形以同步提高其 WebGL 解析度。 */
  cardScale?: number;
  /**
   * 是否渲染周圍裝飾星形照片。點擊展開的左下滑入過場 overlay 設為 false：
   * 星形（PaperFlipStar）是 WebGL，掛載要建 context + 載貼圖才會顯示，過場
   * overlay 與 commit 後的正式卡片是兩棵不同子樹，若兩邊都渲染星形，handoff
   * 時 overlay 星形卸載、正式卡星形重新掛載重載，中間一段空白會造成「照片
   * 消失再冒出」的閃跳。過場不畫星形，讓星形只在正式卡片掛載一次（與捲動
   * 展開路徑一致），即可消除閃跳。
   */
  showStars?: boolean;
}) {
  const photos = localPhotos(plan);
  const stars = showStars ? (DECOR_STARS[plan.id] ?? []) : [];
  return (
    <>
      {/* 裝飾星形照片 — 各計畫位置不同，僅 ≥834px 顯示（PaperFlipStar 內部以
          mq.tabletUp 控制）。平常以星形小尺寸藏在卡片後方；hover 時以紙張翻折
          物理向觀者翻出、放大、上抬到卡片前方（依設計師 WebGL prototype）。 */}
      {stars.map((s, i) =>
        photos[i] ? (
          <PaperFlipStar
            key={i}
            src={photos[i]}
            size={STAR_SIZE}
            leftPx={s.x}
            topPx={s.y}
            // 星形中心在 960 寬卡片的左半 → 往左甩；右半 → 往右甩（皆背向卡片）
            flipDir={s.x + STAR_SIZE / 2 < 480 ? -1 : 1}
            scale={cardScale}
            mobileLeft={MOBILE_STAR_LAYOUT[i]?.left}
            mobileTop={MOBILE_STAR_LAYOUT[i]?.top}
          />
        ) : null,
      )}
      {/* 作用中的計畫卡片 */}
      <Box sx={{ position: 'relative', zIndex: 1 }}>
        <PlanCard plan={plan} />
      </Box>
    </>
  );
}

interface PlanMiniCardProps {
  plan: Plan;
  onSelect: () => void;
  onHover: () => void;
  onLeave: () => void;
  /** 由父層注入的 callback ref，用以記錄卡片根節點供「橘字飛行」測量座標。 */
  cardRootRef?: (el: HTMLDivElement | null) => void;
  /**
   * 是否抑制 hover 時的橘字色。
   * 橘字接力動畫進行中、目標卡尚未「接到」橘字之前設為 true，
   * 讓本體標題暫時保持灰色，待 overlay 抵達後再以 0.30s 漸入橘色。
   */
  suppressOrange?: boolean;
  /**
   * 是否為「被點擊那張」— 退場時的動畫類型由此決定。
   *  - true：跟主標整句一起升起 → 停 → 往畫面中央放大 ≥2x 後淡出。
   *  - false（其餘兩張）：早早輕量淡出，讓場上只剩主角卡與主標。
   */
  isExitTarget?: boolean;
  /**
   * 「往畫面中央放大」時要平移的 X 量（僅 row 版型 ≥834px 適用）。
   * 由父層 PlanCarousel 依 i 與卡寬 + gap 推算：左卡 +offset 往右、
   * 右卡 -offset 往左；中央卡為 0。column 版型一律不平移。
   * 以 inline style 設成 CSS 變數 --exit-tx-row，sx 在 tabletUp 媒體
   * 查詢下把 --exit-tx 接上此值，keyframes 內的 translate 才會生效。
   */
  exitTranslateXRow?: number;
}

/**
 * PlanMiniCard — 收合的計畫卡（依設計師 DESIGN_SPEC v2）。
 *
 * - 預設：淺灰底 #EEEEEE + 中灰字 #666；
 * - hover：白底 + 橘字 #E84C1F、整張卡向上位移 -22px、加深陰影、
 *   底部長出「圓形氣泡 + 向下箭頭」尾巴，並在卡片內呈現「字往上飄逸、
 *   原位留下橘色餘像（殘影）」的招牌動態。其他卡片不淡化（spec v2）。
 */
function PlanMiniCard({
  plan,
  onSelect,
  onHover,
  onLeave,
  cardRootRef,
  suppressOrange = false,
  isExitTarget = false,
  exitTranslateXRow = 0,
}: PlanMiniCardProps) {
  const name = planName(plan);
  const lines = cardTitleLines(plan);
  const [internalHovered, setHovered] = useState(false);
  // 點擊後該卡進入 EXIT（被往上抽走）；此時 pointer-events 已被父層關掉，
  // 但若卡片移動超出原 hit area，仍會 fire mouseleave 把 internalHovered 設回 false
  // → 尾巴（chin notch + ↓ 箭頭）會瞬間消失。
  // 用 isExitTarget 強制鎖定為 hovered 視覺：升起過程中尾巴會一路跟著卡片移動，
  // 直到整張卡淡出視野。
  const hovered = isExitTarget || internalHovered;
  // 依 Figma vector 161:568 真實尺寸與 SVG path 原座標
  const CARD_W = 227.492;
  const CARD_BODY_H = 90.997;
  const TOTAL_H = 113.114;
  // Default: 圓角矩形（無 chin notch）— 直接從 Figma path 取下半部，省略 chin 區段
  const defaultPath = `M 0 9.07945 C 0 4.065 4.06501 0 9.07946 0 H 218.412 C 223.427 0 227.492 4.06501 227.492 9.07946 V 81.9173 C 227.492 86.9317 223.427 90.9967 218.412 90.9967 H 9.07945 C 4.065 90.9967 0 86.9317 0 81.9173 V 9.07945 Z`;
  // Hover: 完整 Figma 161:568 path 含 chin notch
  const hoverPath = `M 0 9.07945 C 0 4.065 4.06501 0 9.07946 0 H 218.412 C 223.427 0 227.492 4.06501 227.492 9.07946 V 81.9173 C 227.492 86.9317 223.427 90.9967 218.412 90.9967 H 132.361 C 128.013 90.9967 124.489 94.5212 124.489 98.8689 V 99.8437 C 124.489 107.173 118.547 113.114 111.218 113.114 C 103.889 113.114 97.9479 107.173 97.9479 99.8437 V 98.8689 C 97.9479 94.5212 94.4234 90.9967 90.0758 90.9967 H 9.07945 C 4.065 90.9967 0 86.9317 0 81.9173 V 9.07945 Z`;
  return (
    <Box
      ref={cardRootRef}
      data-mini-card=""
      data-exit-target={isExitTarget ? 'true' : undefined}
      // --exit-tx-row：父層傳進的「往畫面中央」位移；只在 tabletUp row 版型
      // 透過 sx 接到 --exit-tx，column 版型保持 0。
      style={
        {
          '--exit-tx-row': `${exitTranslateXRow}px`,
        } as React.CSSProperties
      }
      sx={{
        position: 'relative',
        display: 'inline-block',
        width: `${CARD_W}px`,
        height: `${TOTAL_H}px`,
        '--exit-tx': '0px',
        [portalTokens.mq.tabletUp]: {
          '--exit-tx': 'var(--exit-tx-row, 0px)',
        },
      }}
      onMouseEnter={() => {
        setHovered(true);
        onHover();
      }}
      onMouseLeave={() => {
        setHovered(false);
        onLeave();
      }}
    >
      {/* ★ 統一 SVG 渲染 — 仿 Figma 161:568 SVG 結構：
            <defs><clipPath /></defs>
            <foreignObject> 含 backdrop-filter div </foreignObject>
            <path fill /> <path stroke />
          三層共用同一 clipPath，杜絕對位錯誤。 */}
      <Box
        aria-hidden
        component="svg"
        viewBox={`0 0 ${CARD_W} ${TOTAL_H}`}
        sx={{
          position: 'absolute',
          inset: 0,
          width: '100%',
          height: '100%',
          overflow: 'visible',
          pointerEvents: 'none',
          transform: hovered ? 'translateY(-46px)' : 'translateY(0)',
          transition: 'transform 0.40s cubic-bezier(0.22, 1, 0.36, 1)',
        }}
      >
        <defs>
          <clipPath id={`bgblur-${plan.id}`}>
            <path d={hovered ? hoverPath : defaultPath} />
          </clipPath>
        </defs>
        {/* backdrop blur via foreignObject — 用 HTML div + clip-path */}
        <foreignObject x="0" y="0" width={CARD_W} height={TOTAL_H}>
          <div
            style={{
              width: '100%',
              height: '100%',
              backdropFilter: 'blur(21.14px)',
              WebkitBackdropFilter: 'blur(21.14px)',
              clipPath: `url(#bgblur-${plan.id})`,
              WebkitClipPath: `url(#bgblur-${plan.id})`,
            }}
          />
        </foreignObject>
        {/* fill */}
        <path
          d={hovered ? hoverPath : defaultPath}
          fill="rgba(255, 255, 255, 0.54)"
        />
        {/* stroke */}
        <path
          d={hovered ? hoverPath : defaultPath}
          fill="none"
          stroke="rgba(92, 92, 92, 0.85)"
          strokeWidth="0.649"
        />
      </Box>
      {/* 點擊區 + 文字內容 — 卡身覆蓋 button、chin 區由 backdrop/svg 顯示 */}
      <Box
        component="button"
        type="button"
        aria-label={`查看 ${name}`}
        onClick={onSelect}
        sx={{
          position: 'absolute',
          inset: 0,
          background: 'transparent',
          border: 'none',
          cursor: 'pointer',
          color:
            hovered && !suppressOrange
              ? portalTokens.color.brandOrange
              : // 原 #9A9A9A on #EEEEEE ≈ 2.5:1 → 違反 1.4.3；加深至 #5C5C5C ≈ 6.7:1。
                '#5C5C5C',
          padding: 0,
          transform: hovered ? 'translateY(-46px)' : 'translateY(0)',
          transition:
            'transform 0.40s cubic-bezier(0.22, 1, 0.36, 1), color 0.40s cubic-bezier(0.22, 1, 0.36, 1)',
          '&:focus-visible': portalTokens.focusRing,
        }}
      >
        {/* 文字 — 依 Figma 161:374 截圖：font-size 13.902, weight 400, color #000 opacity 0.32 */}
        <Box
          sx={{
            position: 'absolute',
            top: '23px',
            left: '29px',
            right: '30px',
            // Figma 量測：width 166.827（card 227 - pl 30 - pr 30 ≈ 167）
            fontSize: '13.902px',
            fontFamily: 'Inter, "Noto Sans TC", sans-serif',
            fontWeight: 400,
            lineHeight: 'normal',
            // 預設：黑色透明 32%；hover：橘色實心
            // suppressOrange = true 時（橘字接力動畫中、overlay 尚未抵達），
            // 即便已 hovered 也維持灰色；待 overlay 抵達後釋放，
            // 0.30s color transition 讓本體標題自然「染上」橘色（接住飛來的橘字）
            color:
              hovered && !suppressOrange
                ? portalTokens.color.brandOrange
                : // 原 rgba(0,0,0,0.32) 實效 ≈ #A8A8A8 on 毛玻璃/#EEEEEE ≈ 2.5:1
                  // → 違反 1.4.3。加深至 #5C5C5C ≈ 6.7:1。
                  '#5C5C5C',
            opacity: 1,
            textAlign: 'left',
            transform: hovered ? 'translateY(0)' : 'translateY(5px)',
            transition:
              'transform 0.30s cubic-bezier(0.22, 1, 0.36, 1), color 0.30s ease-out',
          }}
        >
          {lines.map((l, i) => (
            <Box key={i} component="div">
              {l}
            </Box>
          ))}
        </Box>
      </Box>
      {/* ↓ — Figma 量測（chin 範圍 y=91..113.114）：
          - 13×15 寬框
          - chin 在 path 中以 x=111.218 為中心（card 中心 113.746），故 arrow 對齊 chin center
            = 卡左 + 104.9 = 卡寬 × (104.9/227.49) ≈ 卡寬 × 46.1% （左邊距）
          - 與 chin 底 7.12 距離
          - 原色 #BABABA on #E4E4E4 ≈ 1.7:1（違反 1.4.11 UI 元件對比），
            加深至 #5C5C5C 約 6.7:1。 */}
      <Box
        aria-hidden
        sx={{
          position: 'absolute',
          // arrow 框 left = 104.9 / 227.492 = 46.11% (對齊 chin 中心、非 card 中心)
          left: 'calc(104.9 / 227.492 * 100%)',
          top: `${CARD_BODY_H + 0.003}px`, // = 91 (chin 內 7.12 距底)
          width: '13px',
          height: '15px',
          transform: `translateY(${hovered ? '-46px' : '0'})`,
          transition:
            'transform 0.40s cubic-bezier(0.22, 1, 0.36, 1), opacity 0.28s ease-out',
          opacity: hovered ? 1 : 0,
          color: '#5C5C5C',
          fontSize: '12.638px',
          fontFamily: '"SF Pro", -apple-system, BlinkMacSystemFont, sans-serif',
          fontWeight: 400,
          lineHeight: '15px',
          textAlign: 'center',
          pointerEvents: 'none',
        }}
      >
        ↓
      </Box>
    </Box>
  );
}

/**
 * PlanCarousel — 三大計畫展開／收合互動區（依設計師 DESIGN_SPEC.md 與過場效果影片）。
 *
 * - 靜止狀態：三張等大的收合計畫卡並排，灰底灰字（未啟用感）。
 * - hover 任一卡 → 卡片變白底＋橘字＋下方氣泡尾巴，其餘卡片淡化；
 *   主標切換為「讓 ___ 被看見」（關鍵字橘色，由 PortalLandingPage 控制）。
 * - 點擊卡 → 其他收合卡退場，該計畫的完整詳細卡（PlanCard）由下方滑入＋淡入。
 * 展開後可由底部 CarouselDots 切換到其他計畫詳細卡。
 */
/**
 * 點擊小卡到詳細卡之間的「過場」動畫長度（ms）。
 * 與 PortalIntroSection.SLOGAN_EXIT_MS 共用同一個常數 → 主標與 mini cards
 * 的升起 → 停 → 飛出三段節奏完全對齊。
 */
const EXIT_MS = SLOGAN_EXIT_MS;
/** 計畫之間左右滑動切換的轉場長度（ms）— 放慢、從容，退出端點 opacity 0 不留殘影。 */
const SLIDE_MS = 1000;

/**
 * 「橘字接力」飛行動畫時序（依使用者要求：游標在卡片間移動時，橘字會跟著
 * 飄過去；途中文字內容會從來源卡漸變成目標卡的文字；抵達後落入目標卡）。
 *
 * - TRAVEL：overlay 從來源卡標題位置移動到目標卡標題位置（橘字「飛過去」）。
 * - HANDOFF：overlay 在目標卡上方淡出；同時釋放目標卡的橘字抑制，
 *   讓目標卡本體標題以 0.30s color transition 由灰漸變為橘（接住飛來的橘字）。
 *   此段刻意比 mini card 的 0.30s color 略短，讓接力交棒落在「同一拍」上。
 */
const FLIGHT_TRAVEL_MS = 460;
const FLIGHT_HANDOFF_MS = 280;
const FLIGHT_TOTAL_MS = FLIGHT_TRAVEL_MS + FLIGHT_HANDOFF_MS;
/** 標題文字相對卡片根節點的水平 / 垂直 offset（hovered 狀態） */
const FLIGHT_TEXT_LEFT = 29;
/** 23（top）+ -46（button hovered transform）+ 0（text Box hovered transform） */
const FLIGHT_TEXT_TOP = -23;
/** CARD_W(227.492) - left(29) - right(30) ≈ 168.5，與 mini card 內標題 Box 同寬 */
const FLIGHT_TEXT_WIDTH = 168.5;

interface FlightState {
  /** 每次飛行唯一 id — 用作 React key，遇到中斷重啟時強制 remount FlyingTitle */
  id: number;
  fromIdx: number;
  toIdx: number;
  /** 起點 / 終點（相對於 mini cards 容器左上的座標） */
  fromX: number;
  fromY: number;
  toX: number;
  toY: number;
  fromLines: string[];
  toLines: string[];
}

/**
 * FlyingTitle — 在卡片之間飛行的「橘字接力棒」。
 *
 * Mount 時位於來源卡標題位置；下一個 frame 切換 transform 到目標位置，
 * 觸發 CSS transition 平順飛過去。途中以 2 層 opacity 交叉淡化，
 * 讓文字內容從來源計畫漸變成目標計畫。抵達後（FLIGHT_TRAVEL_MS）opacity
 * 由 1 淡出至 0，與目標卡本體標題的灰→橘 color transition 交接。
 */
function FlyingTitle({ flight }: { flight: FlightState }) {
  // 兩段 transition 的目的端：mount 時為 false（停在 from 位置、opacity 1），
  // 下個 frame 切 true 觸發 transition 到 to 位置 + 在 HANDOFF 階段 opacity 0。
  const [travelStarted, setTravelStarted] = useState(false);
  useEffect(() => {
    const id = requestAnimationFrame(() => setTravelStarted(true));
    return () => cancelAnimationFrame(id);
  }, [flight.id]);
  const tx = travelStarted ? flight.toX : flight.fromX;
  const ty = travelStarted ? flight.toY : flight.fromY;
  return (
    <Box
      aria-hidden
      sx={{
        position: 'absolute',
        top: 0,
        left: 0,
        width: FLIGHT_TEXT_WIDTH,
        pointerEvents: 'none',
        zIndex: 20,
        willChange: 'transform, opacity',
        transform: `translate(${tx}px, ${ty}px)`,
        // transform：第一拍（mount 時 travelStarted=false）尚無 transition，
        //            第二拍開啟 transition → 從 from 平順飄到 to。
        // opacity：travel 結束後再淡出，與目標卡本體標題色彩交接。
        transition: travelStarted
          ? `transform ${FLIGHT_TRAVEL_MS}ms cubic-bezier(0.22, 1, 0.36, 1), opacity ${FLIGHT_HANDOFF_MS}ms ease ${FLIGHT_TRAVEL_MS}ms`
          : 'none',
        opacity: travelStarted ? 0 : 1,
        color: portalTokens.color.brandOrange,
        fontSize: '13.902px',
        fontFamily: 'Inter, "Noto Sans TC", sans-serif',
        fontWeight: 400,
        lineHeight: 'normal',
        textAlign: 'left',
        '@media (prefers-reduced-motion: reduce)': {
          transition: 'none',
          opacity: 0,
        },
      }}
    >
      {/* 兩層字疊在同位置，opacity 互換達成「文字內容漸變」 */}
      <Box sx={{ position: 'relative' }}>
        <Box
          sx={{
            transition: `opacity ${Math.round(FLIGHT_TRAVEL_MS * 0.55)}ms ease`,
            opacity: travelStarted ? 0 : 1,
          }}
        >
          {flight.fromLines.map((l, i) => (
            <Box key={i}>{l}</Box>
          ))}
        </Box>
        <Box
          sx={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            transition: `opacity ${Math.round(FLIGHT_TRAVEL_MS * 0.55)}ms ease ${Math.round(FLIGHT_TRAVEL_MS * 0.35)}ms`,
            opacity: travelStarted ? 1 : 0,
          }}
        >
          {flight.toLines.map((l, i) => (
            <Box key={i}>{l}</Box>
          ))}
        </Box>
      </Box>
    </Box>
  );
}

export function PlanCarousel({
  plans,
  expandedIndex,
  onExpandedIndexChange,
  onHoverPlanChange,
  onSelectStart,
  onPeekNavigate,
  cardScale = 1,
}: PlanCarouselProps) {
  // 內部「退場中」狀態：使用者點擊收合卡後、實際切到展開狀態之前的過渡期。
  // 期間三張收合卡先以淡出/壓縮動畫退場，再交由父層更新 expandedIndex、展開大卡。
  const [exitingTo, setExitingTo] = useState<number | null>(null);
  const exitTimerRef = useRef<number | null>(null);

  // 展開後左右切換計畫的方向（peek 點擊 / dots 變更皆會觸發）
  const [slideDir, setSlideDir] = useState<'prev' | 'next' | null>(null);
  // 滑動中暫存的「退場舊計畫」— 與新計畫同時渲染，反方向滑出
  const [exitingPlan, setExitingPlan] = useState<Plan | null>(null);
  const slideTimerRef = useRef<number | null>(null);
  const prevExpandedIdxRef = useRef<number | null>(expandedIndex);

  /**
   * 「點擊→展開」對應的 plan id — 用以決定展開分支的入場動畫類型：
   *  - 該 id 就是當前展開的 activePlan → 點擊來源 → 大卡走 planSlideUpFromBL（左下滑入）
   *  - 否則 → sentinel auto-expand → 走 planExpand 膨脹
   * 用 state（非 ref）才能進入 useMemo 依賴；setState 與 onExpandedIndexChange
   * 同個 React 18 batch 提交，第一次 render 即拿到正確值。
   * 切到下一張計畫（peek / dots）時 activePlan.id 改變、走 slideDir 分支，
   * 此 state 即便保留舊值也無妨。
   */
  const [clickedExpandId, setClickedExpandId] = useState<string | null>(null);

  // ── 橘字接力（mini cards hover 之間的橘字飛行覆蓋層）──
  const miniContainerRef = useRef<HTMLDivElement | null>(null);
  const cardRootRefs = useRef<(HTMLDivElement | null)[]>([]);
  /** 同步追蹤目前被 hover 的卡片索引 — 用 ref 而非 state 是因為 mouseenter
   * handler 內需即時讀「上一張被 hover 的卡」來判定要不要起飛，state 在
   * batch 後才更新會錯失機會。
   *
   * 重要：此 ref **只**在游標離開整個 mini cards 容器時才清成 null
   * （見 onMouseLeave on miniContainerRef）。卡片之間 43px 的 gap 期間
   * 舊卡的 mouseleave 雖然會 fire，但這裡刻意不清 ref，
   * 才能在下一張卡 mouseenter 時偵測出「從某張飛到另一張」。 */
  const hoveredIndexRef = useRef<number | null>(null);
  /** 飛行階段切換 timer — 在 TRAVEL 結束時釋放目標卡 suppress，
   * 在 TOTAL 結束時清掉 overlay。 */
  const flightTravelTimerRef = useRef<number | null>(null);
  const flightCleanupTimerRef = useRef<number | null>(null);
  const flightIdRef = useRef(0);
  const [flight, setFlight] = useState<FlightState | null>(null);
  /** 飛行中的目標卡索引 — 用以對該卡 PlanMiniCard 套 suppressOrange，
   * 在 overlay 抵達前壓住目標卡的橘字色，避免「橘字直接出現」。 */
  const [flightTargetIdx, setFlightTargetIdx] = useState<number | null>(null);

  useEffect(() => {
    return () => {
      if (exitTimerRef.current) window.clearTimeout(exitTimerRef.current);
      if (slideTimerRef.current) window.clearTimeout(slideTimerRef.current);
      if (flightTravelTimerRef.current)
        window.clearTimeout(flightTravelTimerRef.current);
      if (flightCleanupTimerRef.current)
        window.clearTimeout(flightCleanupTimerRef.current);
    };
  }, []);

  /** 啟動一次「橘字接力」飛行：fromIdx 卡的橘字飄到 toIdx 卡。
   *  讀取兩張卡片根節點當下的座標，換算成 mini cards 容器內的相對位置。
   *  prefers-reduced-motion 直接跳過、不渲染 overlay。 */
  const startFlight = (fromIdx: number, toIdx: number) => {
    if (
      typeof window !== 'undefined' &&
      window.matchMedia('(prefers-reduced-motion: reduce)').matches
    ) {
      return;
    }
    const container = miniContainerRef.current;
    const fromCard = cardRootRefs.current[fromIdx];
    const toCard = cardRootRefs.current[toIdx];
    const fromPlan = plans[fromIdx];
    const toPlan = plans[toIdx];
    if (!container || !fromCard || !toCard || !fromPlan || !toPlan) return;
    const cr = container.getBoundingClientRect();
    const fr = fromCard.getBoundingClientRect();
    const tr = toCard.getBoundingClientRect();
    flightIdRef.current += 1;
    setFlight({
      id: flightIdRef.current,
      fromIdx,
      toIdx,
      fromX: fr.left - cr.left + FLIGHT_TEXT_LEFT,
      fromY: fr.top - cr.top + FLIGHT_TEXT_TOP,
      toX: tr.left - cr.left + FLIGHT_TEXT_LEFT,
      toY: tr.top - cr.top + FLIGHT_TEXT_TOP,
      fromLines: cardTitleLines(fromPlan),
      toLines: cardTitleLines(toPlan),
    });
    setFlightTargetIdx(toIdx);
    if (flightTravelTimerRef.current)
      window.clearTimeout(flightTravelTimerRef.current);
    if (flightCleanupTimerRef.current)
      window.clearTimeout(flightCleanupTimerRef.current);
    // TRAVEL 結束：釋放目標卡 suppress → 本體標題以 color 0.30s 由灰漸染為橘，
    // 與 overlay 的 HANDOFF 淡出同時進行，達成「橘字落入卡片」的接棒交接。
    flightTravelTimerRef.current = window.setTimeout(() => {
      setFlightTargetIdx(null);
      flightTravelTimerRef.current = null;
    }, FLIGHT_TRAVEL_MS);
    flightCleanupTimerRef.current = window.setTimeout(() => {
      setFlight(null);
      flightCleanupTimerRef.current = null;
    }, FLIGHT_TOTAL_MS);
  };

  /** mini card mouseenter — 串接 onHoverPlanChange + 偵測跨卡起飛 */
  const handleMiniHover = (i: number) => {
    const prev = hoveredIndexRef.current;
    hoveredIndexRef.current = i;
    onHoverPlanChange?.(i);
    if (prev !== null && prev !== i) {
      startFlight(prev, i);
    }
  };

  /** mini cards 容器層 mouseleave — 游標真正離開整個三卡區域才清 hover。
   *  per-card mouseleave 刻意不清 ref（見 hoveredIndexRef 註解），
   *  以維持 gap 跨卡期間的連續性、讓飛行能正確偵測「從某張飛到另一張」。 */
  const handleContainerLeave = () => {
    hoveredIndexRef.current = null;
    onHoverPlanChange?.(null);
  };

  // ── 展開分支入場動畫選擇（鎖在 activePlan + slideDir + clickedExpandId 上，
  //     避免 hover/其他 state 變動觸發 className 改變而重播動畫） ──
  // 三種來源：
  //  - slideDir 存在 → peek / dots 左右切換 → planSlideIn{Left,Right}
  //  - clickedExpandId 等於目前展開的 plan id → 點擊→展開 → planSlideUpFromBL
  //  - 其餘（IntersectionObserver auto-expand）→ planExpand 膨脹進場
  const activePlanForExpand =
    expandedIndex !== null ? (plans[expandedIndex] ?? null) : null;
  const enterAnimation = useMemo<string | null>(() => {
    if (!activePlanForExpand) return null;
    // slideDir 由下方 useEffect 設定，會晚一個 render。外部（捲動 / peek）改變
    // expandedIndex 時，第一影格一律「以索引差直接推算方向」——不可沿用殘留的
    // slideDir（那是上一次切換的方向；若上次往下這次往上，會先朝錯邊滑一下再更正，
    // 看起來「先往右再往左」）。索引已同步（prev===curr）時才用 slideDir。
    const prevIdx = prevExpandedIdxRef.current;
    let dir: 'prev' | 'next' | null;
    if (
      prevIdx !== null &&
      expandedIndex !== null &&
      prevIdx !== expandedIndex
    ) {
      const total = plans.length;
      dir = expandedIndex > prevIdx ? 'next' : 'prev';
      if (prevIdx === total - 1 && expandedIndex === 0) dir = 'next';
      if (prevIdx === 0 && expandedIndex === total - 1) dir = 'prev';
    } else {
      dir = slideDir;
    }
    if (dir) {
      // 方向（依使用者偏好）：next（往下 / 右 peek）新卡從左滑入；prev（往上 /
      // 左 peek）新卡從右滑入。
      return dir === 'next'
        ? `planSlideInLeft ${SLIDE_MS}ms cubic-bezier(0.22, 1, 0.36, 1) both`
        : `planSlideInRight ${SLIDE_MS}ms cubic-bezier(0.22, 1, 0.36, 1) both`;
    }
    // click 來源：滑入動畫已在 PortalLandingPage 的 overlay 於 EXIT 期間
    // 完整跑完，這裡接手時大卡已到定位，用 'none' 避免再播一次造成閃動。
    return clickedExpandId === activePlanForExpand.id
      ? 'none'
      : 'planExpand 0.55s cubic-bezier(0.22, 1, 0.36, 1) both';
  }, [
    activePlanForExpand,
    slideDir,
    clickedExpandId,
    expandedIndex,
    plans.length,
  ]);

  // 監聽 expandedIndex 變化 → 偵測切換方向、啟動左右滑動轉場。
  // prev=null（從 mini cards 首次展開）跳過 slide，沿用既有 planExpand 膨脹動畫。
  useEffect(() => {
    const prev = prevExpandedIdxRef.current;
    const curr = expandedIndex;
    prevExpandedIdxRef.current = curr;
    if (prev === null || curr === null || prev === curr) return;
    const total = plans.length;
    let dir: 'prev' | 'next' = curr > prev ? 'next' : 'prev';
    // wrap-around：(last → 0) 視為 next；(0 → last) 視為 prev
    if (prev === total - 1 && curr === 0) dir = 'next';
    if (prev === 0 && curr === total - 1) dir = 'prev';
    setSlideDir(dir);
    setExitingPlan(plans[prev] ?? null);
    if (slideTimerRef.current) window.clearTimeout(slideTimerRef.current);
    // 只清退場舊卡；slideDir 刻意保留：清掉會讓新卡的 animation 從
    // `planSlideIn*` 切回 `planExpand`，瀏覽器會把它視為新動畫重新從
    // scale(0.55) 播放、造成切換完成後「跳一下」。下次 expandedIndex
    // 變動時 useEffect 會把 slideDir 改成新方向，key 變動再觸發動畫。
    slideTimerRef.current = window.setTimeout(() => {
      setExitingPlan(null);
      slideTimerRef.current = null;
    }, SLIDE_MS);
  }, [expandedIndex, plans]);

  const count = plans.length;
  if (count === 0) return null;

  const handleSelect = (i: number) => {
    if (exitingTo !== null) return;
    onSelectStart?.(i); // 通知上層觸發 slogan exit + 計畫大卡滑入
    setExitingTo(i);
    if (exitTimerRef.current) window.clearTimeout(exitTimerRef.current);
    exitTimerRef.current = window.setTimeout(() => {
      // React 會把三個 setState 一起 batch，下次 render 同時擁有
      // exitingTo=null、expandedIndex=i、clickedExpandId=被點的 plan.id
      // → 直接走展開分支、enterAnimation 走 planSlideUpFromBL 而非 planExpand。
      const targetPlan = plans[i];
      if (targetPlan) setClickedExpandId(targetPlan.id);
      setExitingTo(null);
      onExpandedIndexChange(i);
      exitTimerRef.current = null;
    }, EXIT_MS);
  };

  /**
   * peek 點擊 — 切到上 / 下一個計畫（環狀 wrap-around）。
   *
   * 同步先 setSlideDir + setExitingPlan 再呼叫 onExpandedIndexChange，三個
   * setState 由 React 18 自動 batch 為單次 render，讓新卡一掛上就走滑動動畫，
   * 避免使用 useEffect 偵測時介於兩次 render 之間先以 planExpand 短暫渲染、
   * useEffect commit 後再切到 planSlideIn 的「先膨脹再滑入」閃動。
   * 也提前更新 prevExpandedIdxRef 讓 useEffect fallback 偵測為 no-op。
   */
  const startSlide = (newIdx: number, dir: 'prev' | 'next') => {
    if (expandedIndex === null) return;
    setSlideDir(dir);
    setExitingPlan(plans[expandedIndex] ?? null);
    if (slideTimerRef.current) window.clearTimeout(slideTimerRef.current);
    slideTimerRef.current = window.setTimeout(() => {
      setExitingPlan(null);
      slideTimerRef.current = null;
    }, SLIDE_MS);
    prevExpandedIdxRef.current = newIdx;
    onExpandedIndexChange(newIdx);
  };
  const goPrev = () => {
    if (expandedIndex === null) return;
    const target = (expandedIndex - 1 + count) % count;
    if (onPeekNavigate) {
      onPeekNavigate(target, 'prev');
      return;
    }
    startSlide(target, 'prev');
  };
  const goNext = () => {
    if (expandedIndex === null) return;
    const target = (expandedIndex + 1) % count;
    if (onPeekNavigate) {
      onPeekNavigate(target, 'next');
      return;
    }
    startSlide(target, 'next');
  };

  const outerSx = {
    maxWidth: portalTokens.layout.maxWidth,
    mx: 'auto',
    px: `${portalTokens.layout.gutter}px`,
  } as const;

  // ── 靜止：三張等大收合卡並列（含退場中過渡） ──
  if (expandedIndex === null) {
    return (
      <Box sx={{ position: 'relative', width: '100%' }}>
        <Box sx={outerSx}>
          <Box
            ref={miniContainerRef}
            data-exiting={exitingTo !== null ? 'true' : 'false'}
            onMouseLeave={handleContainerLeave}
            sx={{
              position: 'relative', // 「橘字接力」overlay 以此為定位錨點
              display: 'flex',
              flexDirection: 'column',
              gap: 2.5,
              justifyContent: 'center',
              alignItems: 'center',
              // pt 預留 hover 卡上位移；pb 設 -11 讓 default 卡片下緣超出 viewport 11px（匹配 Figma 161:374 cards y=781..894）
              pt: '40px',
              pb: '-11px',
              [portalTokens.mq.tabletUp]: {
                flexDirection: 'row',
                gap: '43px', // Figma 161:374 量測：cards 間距 43px
              },
              // 註：依 spec v4「其他兩張卡片維持原樣不變淡」，且卡片固定寬 367、不 flex。
              // data-mini-card：選擇器精準鎖定 PlanMiniCard 的根 div，
              // 不會誤中同層的 FlyingTitle overlay（後者是 aria-hidden div）。
              '& > [data-mini-card]': {
                // 載入入場：由下方淡入上升，三張錯開時間呈現；用 backwards 而非 both，
                // 避免動畫結束後 transform 仍被釘住、擋掉 hover 的 translateY/scale。
                animation:
                  'planMiniIn 0.55s cubic-bezier(0.22, 1, 0.36, 1) backwards',
                flexShrink: 0,
              },
              '& > [data-mini-card]:nth-of-type(2)': {
                animationDelay: '0.08s',
              },
              '& > [data-mini-card]:nth-of-type(3)': {
                animationDelay: '0.16s',
              },
              '@keyframes planMiniIn': {
                from: { opacity: 0, transform: 'translateY(20px)' },
                to: { opacity: 1, transform: 'translateY(0)' },
              },
              // 點擊後的退場分兩種：
              //  1) 被點擊的卡（data-exit-target="true"）跟主標整句同節奏：
              //     升起 → 停 1s → 繼續升出視野淡出。百分比節點與
              //     PortalIntroSection.sloganExitRiseFly 完全對齊（47/78/91）。
              //  2) 其餘兩張卡：早早輕量淡出（0–20%），把舞台讓給主角卡 + 主標 +
              //     從左下滑入的大卡。
              '&[data-exiting="true"] > [data-mini-card]': {
                pointerEvents: 'none',
              },
              // 被點擊的卡與主標一起升起 → 停 → 然後不再繼續上升，而是
              // 「在原位放大 + 淡出」（依使用者要求：強調這張卡是主角，
              // 像主鏡頭被推進、最後溶出畫面）。
              '&[data-exiting="true"] > [data-mini-card][data-exit-target="true"]':
                {
                  animation: `planMiniExitRiseScale ${EXIT_MS}ms cubic-bezier(0.22, 1, 0.36, 1) forwards`,
                  // scale 以卡片中心為原點（預設）— 視覺上是「朝鏡頭推進」的感覺。
                  transformOrigin: 'center center',
                },
              '&[data-exiting="true"] > [data-mini-card]:not([data-exit-target])':
                {
                  animation: `planMiniExitFade ${EXIT_MS}ms ease-out forwards`,
                },
              // 被點擊的卡：升起（A 0-27%）→ 停（B 27-40%）→
              // 等候黑字繼續上升 + 橘字單獨存在（C+D 40-81%，停留在 -120）→
              // Phase E 81-89%（3000-3300ms，0.3s）一氣完成：顏色變淺、放大到
              // ≥3x、淡出；同期橘字也淡出。89-100% 為計畫大卡 slide 緩衝。
              //  - 81-82.6%（~60ms）：scale 1→3，translateX 推向中央，filter 變淺。
              //  - 82.6-89%（~237ms）：scale 3→3.2，opacity 1→0，filter 更淺。
              '@keyframes planMiniExitRiseScale': {
                '0%': {
                  transform: 'translate(0, 0) scale(1)',
                  opacity: 1,
                  filter: 'brightness(1) saturate(1)',
                },
                '27%': {
                  transform: 'translate(0, -120px) scale(1)',
                  opacity: 1,
                  filter: 'brightness(1) saturate(1)',
                },
                '40%': {
                  transform: 'translate(0, -120px) scale(1)',
                  opacity: 1,
                  filter: 'brightness(1) saturate(1)',
                },
                '81%': {
                  transform: 'translate(0, -120px) scale(1)',
                  opacity: 1,
                  filter: 'brightness(1) saturate(1)',
                },
                '82.6%': {
                  transform: 'translate(var(--exit-tx, 0px), -120px) scale(3)',
                  opacity: 1,
                  filter: 'brightness(1.3) saturate(0.5)',
                },
                '89%': {
                  transform:
                    'translate(var(--exit-tx, 0px), -120px) scale(3.2)',
                  opacity: 0,
                  filter: 'brightness(1.5) saturate(0.3)',
                },
                '100%': {
                  transform:
                    'translate(var(--exit-tx, 0px), -120px) scale(3.2)',
                  opacity: 0,
                  filter: 'brightness(1.5) saturate(0.3)',
                },
              },
              '@keyframes planMiniExitFade': {
                '0%': { opacity: 1, transform: 'translateY(0)' },
                '20%': { opacity: 0, transform: 'translateY(8px)' },
                '100%': { opacity: 0, transform: 'translateY(8px)' },
              },
              '@media (prefers-reduced-motion: reduce)': {
                '& > [data-mini-card]': { animation: 'none' },
                '&[data-exiting="true"] > [data-mini-card]': {
                  animation: 'none',
                  opacity: 0,
                },
              },
            }}
          >
            {plans.map((plan, i) => {
              // 「往畫面中央」位移：以 cards row 中央索引為基準，
              // 左卡 +(cardW + gap)、右卡 -(cardW + gap)、中央卡 0。
              // 只在被點擊那張上生效（exitTranslateXRow 透過 inline CSS var
              // 由 keyframes 在 Phase C 段套用）。
              const mid = (plans.length - 1) / 2;
              const exitTx = -(i - mid) * (227.492 + 43);
              return (
                <PlanMiniCard
                  key={plan.id}
                  plan={plan}
                  onSelect={() => handleSelect(i)}
                  onHover={() => handleMiniHover(i)}
                  // per-card mouseleave 不參與 carousel 的 hover index 追蹤
                  // （見 handleContainerLeave 與 hoveredIndexRef 註解）。
                  // 卡片內部 visual hovered 仍由 PlanMiniCard 自己的
                  // onMouseLeave 重置。
                  onLeave={() => {}}
                  cardRootRef={(el) => {
                    cardRootRefs.current[i] = el;
                  }}
                  suppressOrange={flightTargetIdx === i}
                  isExitTarget={exitingTo === i}
                  exitTranslateXRow={exitTx}
                />
              );
            })}
            {/* 橘字接力：游標在卡片間移動時，橘字「飄過去」的飛行覆蓋層。
                key 用 flight.id 確保中斷重啟時 React 重新 mount，
                FlyingTitle 的 useEffect 才會跑 requestAnimationFrame 觸發 transition。 */}
            {flight && <FlyingTitle key={flight.id} flight={flight} />}
          </Box>
        </Box>
      </Box>
    );
  }

  // ── 展開：詳細大卡 + 周圍裝飾星形照片 + 兩側豎立 peek 預覽矩形 ──
  const activePlan = plans[expandedIndex];

  // 滑動轉場用的共用 keyframes — 同時掛在退場舊卡與入場新卡的 sx，
  // emotion 會以名稱 dedupe，不會重複注入 CSS。
  const slideKeyframes = {
    '@keyframes planSlideInRight': {
      from: { transform: 'translateX(120%)', opacity: 0 },
      to: { transform: 'translateX(0)', opacity: 1 },
    },
    '@keyframes planSlideInLeft': {
      from: { transform: 'translateX(-120%)', opacity: 0 },
      to: { transform: 'translateX(0)', opacity: 1 },
    },
    // 退出端點 opacity 直接收到 0（原本是 0.25 → 半透明殘影看起來拖很久）。
    '@keyframes planSlideOutLeft': {
      from: { transform: 'translateX(0)', opacity: 1 },
      to: { transform: 'translateX(-120%)', opacity: 0 },
    },
    '@keyframes planSlideOutRight': {
      from: { transform: 'translateX(0)', opacity: 1 },
      to: { transform: 'translateX(120%)', opacity: 0 },
    },
    // 退場舊卡「停在原位」只淡出（不位移）：新卡滑入疊在上層覆蓋它，舊卡同時淡出
    // 避免半透明毛玻璃疊影。
    '@keyframes planFadeOut': {
      from: { opacity: 1 },
      to: { opacity: 0 },
    },
  } as const;

  return (
    <Box sx={{ position: 'relative', width: '100%' }}>
      {/* 左右兩側豎立的相鄰計畫預覽矩形 — 點擊以橫向滑動切換上 / 下計畫。
          760 寬 + left/right: -720px 讓多數寬度溢出畫面、露約 40px 在視窗邊緣。
          頁面外層已 overflow-x: clip，溢出部分自然裁切。
          hover：自訂方向 cursor、整塊向中央輕推、背景加深、露出方向箭頭。*/}
      {count > 1 && (
        <>
          <Box
            component="button"
            type="button"
            aria-label="上一個計畫"
            onClick={goPrev}
            sx={peekSx('prev')}
          >
            {/* 箭頭 icon — 靠 peek 右側（即視窗左側可見區），hover 才淡入 */}
            <Box
              aria-hidden
              className="peek-arrow"
              component="svg"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.4"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M15 6 L9 12 L15 18" />
            </Box>
          </Box>
          <Box
            component="button"
            type="button"
            aria-label="下一個計畫"
            onClick={goNext}
            sx={peekSx('next')}
          >
            {/* 箭頭 icon — 靠 peek 左側（即視窗右側可見區），hover 才淡入 */}
            <Box
              aria-hidden
              className="peek-arrow"
              component="svg"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.4"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M9 6 L15 12 L9 18" />
            </Box>
          </Box>
        </>
      )}

      <Box
        sx={{
          ...outerSx,
          // 自適應第二屏：卡片內容高於一屏時等比縮小填入（只縮卡片，不含兩側 peek）。
          // 用 zoom 而非 transform:scale —— zoom 會以最終尺寸重新排版／重繪，SVG logo
          // 與文字維持銳利；transform:scale 會把已點陣化的 SVG 再縮放而變糊。
          // 放大與縮小都套用（依高度比例填滿第二屏）；星形 canvas 另以 pixelRatio 補償。
          zoom: cardScale !== 1 ? cardScale : undefined,
        }}
      >
        <Box
          sx={{
            position: 'relative',
            display: 'flex',
            justifyContent: 'center',
            // 滑動時舊卡會 translateX 到 ±120%，須允許其視覺溢出（不裁切）
            overflow: 'visible',
          }}
        >
          {/* 退場舊卡 — 絕對定位疊在新卡同一位置、反方向滑出。
              key 用 plan.id 確保 React 重新掛載播放動畫；slideDir 控制方向。*/}
          {exitingPlan && slideDir && (
            <Box
              aria-hidden
              sx={{
                position: 'absolute',
                top: 0,
                left: 0,
                right: 0,
                mx: 'auto',
                width: '100%',
                maxWidth: 960,
                pointerEvents: 'none',
                zIndex: 0,
                // 凍結在切換當下的 reveal 位移，與入場新卡各自垂直定位，避免兩卡
                // 共用單一位移導致退場卡瞬間跳回頂端（先前的「頓一下」）。
                transform: 'translateY(calc(var(--exit-reveal-y, 0px) * -1))',
              }}
            >
              <Box
                key={`exit-${exitingPlan.id}`}
                sx={{
                  // 退場舊卡停在原位、只淡出（不位移）；新卡滑入疊在上層覆蓋。
                  // 淡出比滑入快，舊卡早早消失、不殘留。
                  animation: `planFadeOut ${Math.round(SLIDE_MS * 0.55)}ms ease forwards`,
                  ...slideKeyframes,
                  '@media (prefers-reduced-motion: reduce)': {
                    animation: 'none',
                    opacity: 0,
                  },
                }}
              >
                <PlanCardWithStars plan={exitingPlan} cardScale={cardScale} />
              </Box>
            </Box>
          )}

          {/* 入場新卡 — key 變動觸發 React remount、播放 enterAnimation（由上方
              useMemo 依 source 決定）。三種來源：
                - slideDir → planSlideInLeft / planSlideInRight（peek / dots 切換）
                - click → planSlideUpFromBL（主標退場後，大卡從左下方滑入）
                - 其餘 → planExpand 膨脹（IntersectionObserver auto-expand） */}
          <Box
            sx={{
              position: 'relative',
              width: '100%',
              maxWidth: 960,
              zIndex: 1,
              // 段內捲動露出整張卡的 reveal 位移 — 只套在卡片上，兩側 peek 不受影響。
              transform: 'translateY(calc(var(--reveal-y, 0px) * -1))',
            }}
          >
            <Box
              key={activePlan.id}
              onMouseEnter={() => onHoverPlanChange?.(expandedIndex)}
              onMouseLeave={() => onHoverPlanChange?.(null)}
              sx={{
                transformOrigin: 'top center',
                animation: enterAnimation ?? undefined,
                ...slideKeyframes,
                '@keyframes planExpand': {
                  '0%': { opacity: 0, transform: 'scale(0.55)' },
                  '40%': { opacity: 0.7 },
                  '100%': { opacity: 1, transform: 'scale(1)' },
                },
                // 大卡從左下方滑入 — 從視窗左下方往中央上推、不旋轉，
                // 與主標 Phase D 結束銜接（主標已淡出、舞台清空後大卡才上場）。
                '@keyframes planSlideUpFromBL': {
                  '0%': { transform: 'translate(-220px, 280px)', opacity: 0 },
                  '100%': { transform: 'translate(0, 0)', opacity: 1 },
                },
                '@media (prefers-reduced-motion: reduce)': {
                  animation: 'none',
                },
              }}
            >
              <PlanCardWithStars plan={activePlan} cardScale={cardScale} />
            </Box>
          </Box>
        </Box>
      </Box>
    </Box>
  );
}
