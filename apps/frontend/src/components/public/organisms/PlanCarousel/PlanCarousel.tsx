'use client';

import { useEffect, useMemo, useRef, useState } from 'react';

import Box from '@mui/material/Box';

import type { Plan } from '@/types/plan';

import { portalTokens } from '../../tokens';
import { PlanCard } from '../PlanCard';
import { SLOGAN_EXIT_MS } from '../PortalIntroSection/PortalIntroSection';

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

/** 卡片中心 x（相對 760px 寬卡片框）— 用以判斷照片落在左 / 右側 */
const CARD_CENTER_X = 380;

/** 靜止時各裝飾照片的微傾角度（deg，依 index 循環）— 形成散落層疊的紙堆感 */
const REST_TILT = [-6, 5, -4];

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
  /** 點擊發生時觸發（傳遞給上層以做主標 slogan exit 動畫） */
  onSelectStart?: () => void;
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
 * 依舊版（commit 110588f）設計：760 寬、left/right: -720px 讓多數寬度溢出
 * 畫面，僅露出 ~40px 在視窗左右側緣。點擊以橫向滑動切換上/下計畫。
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
function PlanCardWithStars({ plan }: { plan: Plan }) {
  const photos = localPhotos(plan);
  const stars = DECOR_STARS[plan.id] ?? [];
  return (
    <>
      {/* 裝飾星形照片 — 各計畫位置不同，僅 ≥834px 顯示。
          靜止時微傾、略縮並淡化，像散落半掩在卡片後方的紙堆；hover 時以底邊
          為軸向觀者翻起、沿 Z 軸前移上抬放大，配合尾段輕微過衝，營造照片
          「從後方翻出／被抽出」的立體手感（依設計稿 HOVER 說明）。 */}
      {stars.map((s, i) => {
        if (!photos[i]) return null;
        const restTilt = REST_TILT[i % REST_TILT.length];
        // hover 時依照片落在卡片左 / 右側朝外側微傾，強化「往外抽出」的方向感
        const leanOut = s.x + STAR_SIZE / 2 < CARD_CENTER_X ? -3 : 3;
        return (
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
              transformOrigin: 'center bottom',
              willChange: 'transform, filter',
              transform: `perspective(900px) rotateZ(${restTilt}deg) scale(0.96)`,
              filter:
                'brightness(0.94) saturate(0.95) drop-shadow(0 6px 12px rgba(0, 0, 0, 0.14))',
              transition:
                'transform 0.55s cubic-bezier(0.34, 1.56, 0.64, 1), filter 0.4s ease',
              '&:hover': {
                transform: `perspective(900px) rotateX(-12deg) rotateZ(${leanOut}deg) translateY(-24px) translateZ(52px) scale(1.16)`,
                zIndex: 3,
                filter:
                  'brightness(1.03) saturate(1.05) drop-shadow(0 30px 46px rgba(0, 0, 0, 0.34))',
              },
              '@media (prefers-reduced-motion: reduce)': {
                transform: 'none',
                transition: 'none',
                filter: 'none',
                '&:hover': {
                  transform: 'none',
                  zIndex: 3,
                  filter: 'drop-shadow(0 16px 28px rgba(0, 0, 0, 0.28))',
                },
              },
            }}
          />
        );
      })}
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
   *  - true：跟主標整句一起升起 → 停 → 繼續升出視野淡出。
   *  - false（其餘兩張）：早早輕量淡出，讓場上只剩主角卡與主標。
   */
  isExitTarget?: boolean;
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
      sx={{
        position: 'relative',
        display: 'inline-block',
        width: `${CARD_W}px`,
        height: `${TOTAL_H}px`,
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
/** 計畫之間左右滑動切換的轉場長度（ms）。
 *  原先 550ms 退出端點還留 opacity 0.25 殘影 → 整體拖太久；
 *  改成 360ms + 退出端點 opacity 0，切換明顯俐落。 */
const SLIDE_MS = 360;

/** 點擊→展開：主標 / mini cards 退場完畢後，大卡從左下方滑入的時長（ms）。 */
const SLIDE_UP_MS = 720;

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
    if (slideDir) {
      return slideDir === 'next'
        ? `planSlideInRight ${SLIDE_MS}ms cubic-bezier(0.22, 1, 0.36, 1) both`
        : `planSlideInLeft ${SLIDE_MS}ms cubic-bezier(0.22, 1, 0.36, 1) both`;
    }
    return clickedExpandId === activePlanForExpand.id
      ? `planSlideUpFromBL ${SLIDE_UP_MS}ms cubic-bezier(0.22, 1, 0.36, 1) both`
      : 'planExpand 0.55s cubic-bezier(0.22, 1, 0.36, 1) both';
  }, [activePlanForExpand, slideDir, clickedExpandId]);

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
    onSelectStart?.(); // 通知上層觸發 slogan exit
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
    startSlide((expandedIndex - 1 + count) % count, 'prev');
  };
  const goNext = () => {
    if (expandedIndex === null) return;
    startSlide((expandedIndex + 1) % count, 'next');
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
              '&[data-exiting="true"] > [data-mini-card][data-exit-target="true"]':
                {
                  animation: `planMiniExitRiseFly ${EXIT_MS}ms cubic-bezier(0.22, 1, 0.36, 1) forwards`,
                },
              '&[data-exiting="true"] > [data-mini-card]:not([data-exit-target])':
                {
                  animation: `planMiniExitFade ${EXIT_MS}ms ease-out forwards`,
                },
              '@keyframes planMiniExitRiseFly': {
                '0%': { transform: 'translateY(0)', opacity: 1 },
                '36%': { transform: 'translateY(-120px)', opacity: 1 },
                '54%': { transform: 'translateY(-120px)', opacity: 1 },
                '89%': { transform: 'translateY(-380px)', opacity: 0 },
                '100%': { transform: 'translateY(-380px)', opacity: 0 },
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
            {plans.map((plan, i) => (
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
              />
            ))}
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
  } as const;

  return (
    <Box sx={{ position: 'relative', width: '100%' }}>
      {/* 左右兩側豎立的相鄰計畫預覽矩形 — 點擊以橫向滑動切換上 / 下計畫。
          760 寬 + left/right: -720px 讓多數寬度溢出畫面、僅露 40px 在視窗邊緣。
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

      <Box sx={outerSx}>
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
              key={`exit-${exitingPlan.id}`}
              aria-hidden
              sx={{
                position: 'absolute',
                top: 0,
                left: 0,
                right: 0,
                mx: 'auto',
                width: '100%',
                maxWidth: 760,
                pointerEvents: 'none',
                zIndex: 0,
                animation:
                  slideDir === 'next'
                    ? `planSlideOutLeft ${SLIDE_MS}ms cubic-bezier(0.22, 1, 0.36, 1) forwards`
                    : `planSlideOutRight ${SLIDE_MS}ms cubic-bezier(0.22, 1, 0.36, 1) forwards`,
                ...slideKeyframes,
                '@media (prefers-reduced-motion: reduce)': {
                  animation: 'none',
                  opacity: 0,
                },
              }}
            >
              <PlanCardWithStars plan={exitingPlan} />
            </Box>
          )}

          {/* 入場新卡 — key 變動觸發 React remount、播放 enterAnimation（由上方
              useMemo 依 source 決定）。三種來源：
                - slideDir → planSlideInLeft / planSlideInRight（peek / dots 切換）
                - click → planSlideUpFromBL（主標退場後，大卡從左下方滑入）
                - 其餘 → planExpand 膨脹（IntersectionObserver auto-expand） */}
          <Box
            key={activePlan.id}
            onMouseEnter={() => onHoverPlanChange?.(expandedIndex)}
            onMouseLeave={() => onHoverPlanChange?.(null)}
            sx={{
              position: 'relative',
              width: '100%',
              maxWidth: 760,
              zIndex: 1,
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
              '@media (prefers-reduced-motion: reduce)': { animation: 'none' },
            }}
          >
            <PlanCardWithStars plan={activePlan} />
          </Box>
        </Box>
      </Box>
    </Box>
  );
}
