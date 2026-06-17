'use client';

import { useCallback, useEffect, useRef, useState } from 'react';

import Box from '@mui/material/Box';

import type { Plan } from '@/types/plan';

import { PlanPeekNavButton } from '../../molecules/PlanPeekNavButton';
import { portalTokens } from '../../tokens';
import { PlanCard } from '../PlanCard';
import { SLOGAN_EXIT_MS } from '../PortalIntroSection/PortalIntroSection';

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
/** 手機版裝飾星形縮放 */
const MOBILE_STAR_SCALE = 0.55;
/** 桌機裝飾星形靜止時的微傾角（度，依序對應上／左／右三張），營造半掩散落感。 */
const REST_TILT = [-4, 3, -2.5];
/** 展開卡水平中心（960 寬卡片的一半）；決定星形 hover 往左或往右外傾。 */
const CARD_CENTER_X = 480;

/** 24 角星 clip-path（外 50% / 內 45%、起點 -90°）。桌機浮出照片與手機靜態霧化
 *  星形共用此輪廓裁形。 */
const STAR_CLIP = (() => {
  const n = 24;
  const pts = Array.from({ length: n }, (_, i) => {
    const r = i % 2 === 0 ? 50 : 45;
    const a = ((-90 + (i * 360) / n) * Math.PI) / 180;
    return `${(50 + r * Math.cos(a)).toFixed(2)}% ${(50 + r * Math.sin(a)).toFixed(2)}%`;
  });
  return `polygon(${pts.join(', ')})`;
})();

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
 * PlanCardWithStars — 展開大卡 + 周圍裝飾星形照片的組合單元。
 *
 * 抽出此 helper 是為了讓「退場舊卡」和「入場新卡」共用同一份星形渲染邏輯，
 * 在左右滑動轉場期間兩張卡（含其周邊星形）能一起滑動，避免星形與卡片脫節。
 */
export function PlanCardWithStars({
  plan,
  showStars = true,
  starsVisible = true,
  staticStars = false,
  dimmed = false,
}: {
  plan: Plan;
  /**
   * 手機版用：以「靜態霧化星形照片」取代桌機的浮出互動。沿用相同的邊緣位置與
   * 星形輪廓，但不可互動、加上模糊霧化。
   */
  staticStars?: boolean;
  /**
   * 是否渲染（掛載）周圍裝飾星形照片。環狀軌道只在「中份」卡片掛載星形，兩側
   * 複本不掛載（peek 細條不需星形）。
   */
  showStars?: boolean;
  /**
   * 是否為作用中卡片：傳給 PlanCard 控制 slogan 重播。
   */
  starsVisible?: boolean;
  /**
   * 鄰卡：僅「卡片本體」淡化＋去飽和（裝飾照片不受影響，恆維持固定霧化、只在
   * hover 時才有樣式變化）。dim 套在卡片層而非外層，避免波及底下照片。
   */
  dimmed?: boolean;
}) {
  const photos = localPhotos(plan);
  const stars = showStars ? (DECOR_STARS[plan.id] ?? []) : [];
  return (
    <>
      {/* 裝飾星形照片 — 各計畫位置不同，僅 ≥834px 顯示。平常以星形小尺寸、微傾、
          略縮藏在卡片後方；hover 時從後方「浮出」——上抬、前移、放大並輕回彈到卡片
          前方（不帶陰影）。一就位即全不透明＋固定霧化（不淡入、切換途中不變樣），
          只有 hover 才有樣式變化。 */}
      <Box aria-hidden>
        {stars.map((s, i) => {
          if (!photos[i]) return null;
          // 手機版：靜態霧化星形照片（沿用邊緣位置與星形輪廓，不互動、不載 WebGL）。
          if (staticStars) {
            const m = MOBILE_STAR_LAYOUT[i];
            if (!m) return null;
            return (
              <Box
                key={i}
                aria-hidden
                sx={{
                  position: 'absolute',
                  left: m.left,
                  top: m.top,
                  width: STAR_SIZE,
                  height: STAR_SIZE,
                  transform: `scale(${MOBILE_STAR_SCALE})`,
                  transformOrigin: 'center',
                  backgroundImage: `url("${photos[i]}")`,
                  backgroundSize: 'cover',
                  backgroundPosition: 'center',
                  clipPath: STAR_CLIP,
                  // 霧化透出：模糊 + 半透明，融入卡片底下。
                  filter: 'blur(8px)',
                  opacity: 0.55,
                  pointerEvents: 'none',
                  zIndex: 0,
                }}
              />
            );
          }
          // 桌機：靜止時微傾、略縮、藏在卡片後方；hover 時從後方「浮出」——
          // 上抬、沿 Z 軸前移、放大並輕微回彈，浮到卡片前方（依設計師回饋，不帶陰影）。
          const restTilt = REST_TILT[i % REST_TILT.length];
          // 星形落在卡片左半 → 往左外傾；右半 → 往右外傾（強化「往外抽出」方向感）。
          const leanOut = s.x + STAR_SIZE / 2 < CARD_CENTER_X ? -3 : 3;
          // 上層用「預先模糊好」的圖檔（blur／brightness／saturate 已烘進檔案）。
          const hazeSrc = photos[i].replace(/\.jpg$/i, '.blur.jpg');
          return (
            <Box
              key={i}
              aria-hidden
              sx={{
                display: 'none',
                [portalTokens.mq.tabletUp]: { display: 'block' },
                position: 'absolute',
                left: `${s.x}px`,
                top: `${s.y}px`,
                width: STAR_SIZE,
                height: STAR_SIZE,
                clipPath: STAR_CLIP,
                zIndex: 0,
                transformOrigin: 'center bottom',
                willChange: 'transform',
                // 靜止時微傾、略縮、藏在卡片後方；hover 從後方浮出——上抬、前移、放大
                // 並輕回彈到卡片前方（不帶陰影）。
                transform: `perspective(900px) rotateZ(${restTilt}deg) scale(0.96)`,
                transition: 'transform 0.55s cubic-bezier(0.34, 1.56, 0.64, 1)',
                '&:hover': {
                  transform: `perspective(900px) rotateX(-12deg) rotateZ(${leanOut}deg) translateY(-24px) translateZ(52px) scale(1.16)`,
                  zIndex: 3,
                },
                // hover 時上層預模糊圖淡出、底層清晰圖顯示並微微提亮。
                '&:hover .plan-star-haze': { opacity: 0 },
                '&:hover .plan-star-sharp': {
                  visibility: 'visible',
                  filter: 'brightness(1.03) saturate(1.05)',
                },
                '@media (prefers-reduced-motion: reduce)': {
                  transform: 'none',
                  transition: 'none',
                  '&:hover': { transform: 'none', zIndex: 3 },
                  '& .plan-star-haze': { transition: 'none' },
                },
              }}
            >
              {/* 底層：清晰原圖，供 hover 浮出時顯示。靜止時隱藏，避免它在「上層模糊圖
                  尚未載入」的競態中搶先露出清晰畫面（那正是「先清晰、再變更霧」的來源）。
                  低載入優先序，讓上層模糊圖先就緒。 */}
              <Box
                component="img"
                className="plan-star-sharp"
                src={photos[i]}
                alt=""
                loading="lazy"
                sx={{
                  position: 'absolute',
                  inset: 0,
                  width: '100%',
                  height: '100%',
                  objectFit: 'cover',
                  display: 'block',
                  visibility: 'hidden',
                }}
              />
              {/* 上層：預先模糊好的圖（霧化已烘進檔案）。圖檔本身即模糊，繪製第一幀就是
                  最終霧化樣貌，不會有 CSS filter 首幀光柵化造成的「先清晰、再變更霧」。
                  eager／高優先載入確保它最先就緒；hover 時淡出露出底層清晰圖。 */}
              <Box
                component="img"
                className="plan-star-haze"
                src={hazeSrc}
                alt=""
                loading="eager"
                fetchPriority="high"
                sx={{
                  position: 'absolute',
                  inset: 0,
                  width: '100%',
                  height: '100%',
                  objectFit: 'cover',
                  display: 'block',
                  opacity: 1,
                  transition: 'opacity 0.4s ease',
                }}
              />
            </Box>
          );
        })}
      </Box>
      {/* 作用中的計畫卡片 — 鄰卡的淡化／去飽和只套在這層卡片本體，不波及上方裝飾照片。
          「讓卡片毛玻璃罩在均勻底色上、只讓照片淡淡透出」的半透明底改墊在 PlanCard 內
          「每張卡各自後方」（見 PlanCard 的 frostBacking），這層外層不再上底色——否則會
          連中間的卡間間隙也填滿、把上下兩張卡連成一塊（出現多餘連接線）。 */}
      <Box
        sx={{
          position: 'relative',
          zIndex: 1,
          // 淡化／去飽和「瞬間定樣」、不進 transition：切到中央的卡若以 0.8s 漸變
          // 由 saturate(0.55) 回到 none，會讓「透出的照片」緩慢變色＝使用者看到的樣式變化。
          // 瞬間定樣後，置中卡一就位即為最終樣貌，切換不再有漸變。
          opacity: dimmed ? 0.42 : 1,
          filter: dimmed ? 'saturate(0.55)' : 'none',
          transition: 'none',
        }}
      >
        {/* 有裝飾照片在卡片後方時，墊半透明底讓毛玻璃罩在均勻色上（照片淡淡透出、
            濃淡一致）。墊在每張卡各自後方，不填卡間間隙。 */}
        <PlanCard plan={plan} active={starsVisible} frostBacking={showStars} />
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

  // 環狀軌道 wrap 的順向滑動：最後一張按「下一個」回到第一張（或反向）時，預設
  // 由 expandedIndex 直推 trackX 會「往回跳」（反方向）。改以方向性 wrapOffset 先把
  // 軌道順向滑到相鄰份複本的同卡片，落定後再「無動畫 snap」回中份複本，使 wrap 也順向。
  // wrapOffset 單位為「份」×count 步（+count=往後滑一份、-count=往前滑一份）。
  const [wrapOffset, setWrapOffset] = useState(0);
  // snap 回中份時暫時關閉 transition（避免回跳被看見）。
  const [wrapSnap, setWrapSnap] = useState(false);
  const wrapTimerRef = useRef<number | null>(null);
  useEffect(
    () => () => {
      if (wrapTimerRef.current) window.clearTimeout(wrapTimerRef.current);
    },
    [],
  );
  // 觸發一次方向性 wrap 滑動：先以 wrapOffset 順向滑到相鄰份，820ms（略長於 0.8s
  // transition）後無動畫 snap 回中份。桌機 navigateTo 與手機 next 鈕共用。
  const triggerWrap = useCallback((off: number) => {
    if (off === 0) return;
    if (wrapTimerRef.current) window.clearTimeout(wrapTimerRef.current);
    setWrapSnap(false);
    setWrapOffset(off);
    wrapTimerRef.current = window.setTimeout(() => {
      setWrapSnap(true);
      setWrapOffset(0);
      requestAnimationFrame(() =>
        requestAnimationFrame(() => setWrapSnap(false)),
      );
    }, 820);
  }, []);

  // 視窗寬與是否桌機（≥1200px）：桌機才啟用 960 寬環狀軌道（用視窗寬自適應卡距、
  // peek 露出量恆定）；平板（834–1199）與手機共用單張滿版 peek 輪播（窄卡置中、
  // 鄰卡薄邊探出），避免 960 寬卡在平板被左右裁切。
  const [viewportW, setViewportW] = useState(() =>
    typeof window !== 'undefined' ? window.innerWidth : 0,
  );
  const [isDesktop, setIsDesktop] = useState(() =>
    typeof window !== 'undefined'
      ? window.matchMedia('(min-width:1200px)').matches
      : false,
  );
  useEffect(() => {
    if (typeof window === 'undefined') return;
    const mq = window.matchMedia('(min-width:1200px)');
    const onResize = () => setViewportW(window.innerWidth);
    const onMq = () => setIsDesktop(mq.matches);
    onResize();
    onMq();
    window.addEventListener('resize', onResize);
    mq.addEventListener('change', onMq);
    return () => {
      window.removeEventListener('resize', onResize);
      mq.removeEventListener('change', onMq);
    };
  }, []);

  // 桌機環狀軌道「合成完才揭示」：環狀卡片（含毛玻璃 backdrop-filter）一掛載即渲染，其
  // 首次合成會讓毛玻璃由淺變濃、底下裝飾照片（尤其冷快取時才載入）淡入——使用者會看到
  // 「輕微變化」。為此掛載後先以同色遮罩蓋住整個輪播區，等到①卡片後方的霧化照片全部載入
  // 解碼、②再過兩個 rAF 讓毛玻璃確實合成完，才移除遮罩一次揭示。用「等照片就緒」而非固定
  // 時間，冷快取也不會在揭示後才淡入。1.5s fallback 兜底。一次性，之後切換不重掛、不再 gate。
  const [ringRevealed, setRingRevealed] = useState(false);
  useEffect(() => {
    if (expandedIndex === null || ringRevealed) return;
    let cancelled = false;
    let raf = 0;
    const reveal = () => {
      if (!cancelled) setRingRevealed(true);
    };
    const tick = () => {
      if (cancelled) return;
      const hazes = Array.from(
        document.querySelectorAll<HTMLImageElement>('.plan-star-haze'),
      );
      const ready =
        hazes.length > 0 &&
        hazes.every((h) => h.complete && h.naturalWidth > 0);
      if (ready) {
        // 照片已就緒；再等兩個 rAF 讓毛玻璃合成完，才揭示。
        raf = requestAnimationFrame(() => {
          raf = requestAnimationFrame(reveal);
        });
      } else {
        raf = requestAnimationFrame(tick);
      }
    };
    const fallback = window.setTimeout(reveal, 1500);
    raf = requestAnimationFrame(tick);
    return () => {
      cancelled = true;
      cancelAnimationFrame(raf);
      window.clearTimeout(fallback);
    };
  }, [expandedIndex, ringRevealed]);

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

  const count = plans.length;
  if (count === 0) return null;

  const handleSelect = (i: number) => {
    if (exitingTo !== null) return;
    onSelectStart?.(i); // 通知上層觸發 slogan exit + 計畫大卡滑入
    setExitingTo(i);
    if (exitTimerRef.current) window.clearTimeout(exitTimerRef.current);
    exitTimerRef.current = window.setTimeout(() => {
      // exitingTo=null 與 expandedIndex=i 由 React 18 一起 batch，下次 render
      // 即進入展開分支顯示該計畫大卡。
      setExitingTo(null);
      onExpandedIndexChange(i);
      exitTimerRef.current = null;
    }, EXIT_MS);
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

  // ── 手機 / 平板（<1200px）：橫向 peek 輪播 —— 當前卡置中、左右各露出鄰卡薄邊，
  //     右側一顆 next 探頭鈕循環切換（依設計稿 node 388:247 / 43:1142，窄卡單欄堆疊）。
  //     卡寬上限 720：平板（834–1199）不致拉得過寬，保留設計稿的窄卡比例與兩側留白。 ──
  if (!isDesktop) {
    const W = viewportW || 390;
    const MCARD_W = Math.min(720, Math.max(280, W - 48)); // 左右各 ~24px 留白、上限 720
    const MGAP = 12; // 卡距：鄰卡露出 ~12px 薄邊
    const MSTEP = MCARD_W + MGAP;
    const mid = Math.floor(count / 2);
    const trackX = -(expandedIndex - mid + wrapOffset) * MSTEP;
    const centerCopy = wrapOffset / count;
    const mNext = (expandedIndex + 1) % count;
    const mTransition = wrapSnap
      ? 'none'
      : 'transform 0.8s cubic-bezier(0.16, 1, 0.3, 1)';
    const mobileNext = () => {
      // 最後一張往後 → 順向 wrap；其餘直接前進。
      triggerWrap(expandedIndex === count - 1 ? count : 0);
      onExpandedIndexChange(mNext);
    };
    return (
      <Box sx={{ width: '100%', overflowX: 'clip' }}>
        <Box
          sx={{
            position: 'relative',
            display: 'flex',
            justifyContent: 'center',
          }}
        >
          <Box
            sx={{
              display: 'flex',
              gap: `${MGAP}px`,
              transform: `translateX(${trackX}px)`,
              transition: mTransition,
              willChange: 'transform',
              '@media (prefers-reduced-motion: reduce)': { transition: 'none' },
            }}
          >
            {[-1, 0, 1].map((copy) =>
              plans.map((plan, i) => {
                const isCenter = copy === centerCopy && i === expandedIndex;
                return (
                  <Box
                    key={`${copy}-${plan.id}`}
                    aria-hidden={!isCenter}
                    sx={{
                      flex: '0 0 auto',
                      width: MCARD_W,
                      opacity: isCenter ? 1 : 0.5,
                      transition: wrapSnap
                        ? 'none'
                        : 'opacity 0.8s cubic-bezier(0.16, 1, 0.3, 1)',
                      '@media (prefers-reduced-motion: reduce)': {
                        transition: 'none',
                      },
                    }}
                  >
                    <PlanCard plan={plan} active={isCenter} />
                  </Box>
                );
              }),
            )}
          </Box>
          {/* 右側探頭導覽鈕 — 貼卡片右緣、對齊卡片一 logo 列、循環切到下一個計畫
              （依設計稿 node 388:247：手機版僅右側一顆 next 鈕）。 */}
          {count > 1 && (
            <PlanPeekNavButton
              direction="next"
              top="40px"
              planName={plans[mNext]?.name.zh ?? ''}
              markSrc={`/images/plans/${plans[mNext]?.folderName}/logo/mark.png`}
              onClick={mobileNext}
            />
          )}
        </Box>
      </Box>
    );
  }

  // ── 桌機展開：持久環狀軌道 ──
  // 三份卡片並列（左／中／右複本），讓左右兩側永遠是真實卡片內容；active 永遠落在
  // 中份範圍內、被置中，兩側恆有完整鄰卡。切換時整條軌道以 translateX 平滑滑動 ——
  // 卡片全程掛載、不 remount，故無 pop-in、無閃跳。星形只掛在 active 卡（與設計稿
  // 一致，peek 無星形），且照片皆已預載，切換時僅以 opacity 淡入淡出、不重載。
  const RING_CARD_W = 960;
  // peek 露出量（螢幕 px）：兩側鄰卡露出的寬度。卡距以視窗寬反推，讓各螢幕寬下
  // peek 露出量大致一致（zoom 內 px = 螢幕 px / cardScale）。
  const PEEK_PX = 72;
  const cwScreen = RING_CARD_W * cardScale;
  const gapScreen = viewportW
    ? Math.max(16, (viewportW - cwScreen) / 2 - PEEK_PX)
    : 64 * cardScale;
  const RING_GAP = gapScreen / (cardScale || 1);
  const RING_STEP = RING_CARD_W + RING_GAP;
  const mid = Math.floor(count / 2);
  // 置中 active：以「中份的中央計畫」為 translateX=0 基準，平移 (active - mid + wrapOffset) 步。
  const trackX = -(expandedIndex - mid + wrapOffset) * RING_STEP;
  // 目前視覺上置中的「份」（0=中份、+1=右份、-1=左份）；wrap 滑動期間用來標記 active 卡。
  const centerCopy = wrapOffset / count;
  const prevIndex = (expandedIndex - 1 + count) % count;
  const nextIndex = (expandedIndex + 1) % count;

  // 點某張鄰卡 → 切換到該計畫（捲動驅動交由上層 onPeekNavigate，否則直接改索引）。
  const navigateTo = (target: number) => {
    if (target === expandedIndex) return;
    let dir: 'prev' | 'next' = target > expandedIndex ? 'next' : 'prev';
    // wrap：最後一張→第一張（往後）或第一張→最後一張（往前）。以 wrapOffset 讓軌道
    // 順向滑到相鄰份的同卡片，820ms（略長於 0.8s transition）後無動畫 snap 回中份。
    let off = 0;
    if (expandedIndex === count - 1 && target === 0) {
      dir = 'next';
      off = count;
    } else if (expandedIndex === 0 && target === count - 1) {
      dir = 'prev';
      off = -count;
    }
    triggerWrap(off);
    if (onPeekNavigate) onPeekNavigate(target, dir);
    else onExpandedIndexChange(target);
  };

  return (
    <Box
      sx={{
        position: 'relative',
        width: '100%',
        overflow: 'visible',
      }}
    >
      {/* 合成完才揭示：卡片含毛玻璃 backdrop-filter，首次合成會讓毛玻璃由淺變濃
          「後疊上來」。warmup 期間卡片以正常 opacity 實際繪製（毛玻璃才會真的完成
          合成），用一層與背景同色的不透明遮罩蓋住整個輪播區；毛玻璃熱好後移除遮罩，
          一次顯示已合成好的整張卡。透明度 gate 無法觸發 backdrop 合成，故改用遮罩。 */}
      {!ringRevealed && (
        <Box
          aria-hidden
          sx={{
            position: 'absolute',
            top: -360,
            bottom: -80,
            left: '-5%',
            right: '-5%',
            bgcolor: portalTokens.color.pageBg,
            zIndex: 20,
            pointerEvents: 'none',
          }}
        />
      )}
      <Box
        sx={{
          // 自適應第二屏縮放：用 zoom（非 transform:scale）讓 SVG／文字重排後維持銳利。
          zoom: cardScale !== 1 ? cardScale : undefined,
          position: 'relative',
          width: '100%',
          display: 'flex',
          justifyContent: 'center',
          overflow: 'visible',
        }}
      >
        <Box
          sx={{
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'flex-start',
            gap: `${RING_GAP}px`,
            transform: `translateX(${trackX}px)`,
            // 切換以「快速起步、長距柔和減速滑停」的 expo ease-out 收束，營造有質感的
            // 緩衝 settle 感（切換到停下保有緩衝）。wrap snap 回中份時關閉動畫。
            transition: wrapSnap
              ? 'none'
              : 'transform 0.8s cubic-bezier(0.16, 1, 0.3, 1)',
            willChange: 'transform',
            '@media (prefers-reduced-motion: reduce)': { transition: 'none' },
          }}
        >
          {[-1, 0, 1].map((copy) =>
            plans.map((plan, i) => {
              // wrap 滑動期間視覺置中的份為 centerCopy（±1）；其餘時間為中份（0）。
              const isCenter = copy === centerCopy && i === expandedIndex;
              return (
                <Box
                  key={`${copy}-${plan.id}`}
                  onClick={isCenter ? undefined : () => navigateTo(i)}
                  onMouseEnter={
                    isCenter
                      ? () => onHoverPlanChange?.(expandedIndex)
                      : undefined
                  }
                  onMouseLeave={
                    isCenter ? () => onHoverPlanChange?.(null) : undefined
                  }
                  aria-hidden={!isCenter}
                  sx={{
                    flex: '0 0 auto',
                    width: RING_CARD_W,
                    transformOrigin: 'top center',
                    // 此外層只負責隨軌道滑動的位移（active 保留段內捲動 reveal 位移、
                    // 鄰卡略縮）。淡化／去飽和移到 PlanCardWithStars 內的卡片層，只套在
                    // 卡片本體、不波及底下裝飾照片——照片維持固定霧化，僅 hover 時才變樣。
                    transform: isCenter
                      ? 'translateY(calc(var(--reveal-y, 0px) * -1))'
                      : 'scale(0.965)',
                    cursor: isCenter ? 'default' : 'pointer',
                    // wrap snap 回中份那一幀關閉動畫，避免卡片從鄰卡狀態閃動。
                    transition: wrapSnap
                      ? 'none'
                      : 'transform 0.8s cubic-bezier(0.16, 1, 0.3, 1)',
                    '@media (prefers-reduced-motion: reduce)': {
                      transition: 'none',
                    },
                  }}
                >
                  <PlanCardWithStars
                    plan={plan}
                    showStars={isCenter}
                    starsVisible={isCenter}
                    dimmed={!isCenter}
                  />
                </Box>
              );
            }),
          )}
        </Box>
      </Box>
      {/* 左右探頭導覽鈕 — 貼第二屏左右緣、於兩側 peek 細條上半部探出，明確指向
          上一個 / 下一個計畫並可點擊切換（與卡片下方指示點、敘事區標記同一形狀語彙）。 */}
      {count > 1 && (
        <>
          <PlanPeekNavButton
            direction="prev"
            planName={plans[prevIndex]?.name.zh ?? ''}
            markSrc={`/images/plans/${plans[prevIndex]?.folderName}/logo/mark.png`}
            onClick={() => navigateTo(prevIndex)}
          />
          <PlanPeekNavButton
            direction="next"
            planName={plans[nextIndex]?.name.zh ?? ''}
            markSrc={`/images/plans/${plans[nextIndex]?.folderName}/logo/mark.png`}
            onClick={() => navigateTo(nextIndex)}
          />
        </>
      )}
    </Box>
  );
}
