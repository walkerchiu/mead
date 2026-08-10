'use client';

import { useCallback, useEffect, useRef, useState } from 'react';

import ArrowOutwardIcon from '@mui/icons-material/ArrowOutward';
import Box from '@mui/material/Box';

import type { Plan } from '@/types/plan';

import { PlanLogo } from '../../molecules/PlanLogo';
import { PlanPeekNavButton } from '../../molecules/PlanPeekNavButton';
import { PlanTimeline } from '../../molecules/PlanTimeline';
import { SocialLinkBar } from '../../molecules/SocialLinkBar';
import { StatsMarquee } from '../../molecules/StatsMarquee';
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
// 個別裝飾照片在星形框內的取像微調。未列出者置中滿框（cover）。鍵為 photos 索引。
// 橫向照片在正方星框是「高度填滿、左右裁切」、垂直無餘量，故以底部為錨垂直放大
// （zoomUp）裁掉上緣 → 畫面在框內視覺上移、上緣暗部（如舞台黑底）露出更少。
const STAR_FOCAL: Record<string, Record<number, { zoomUp: number }>> = {};

const DECOR_STAR_PHOTOS: Record<string, string[]> = {
  sposad: [
    '/images/portal/second-layer/sposad_01.jpg',
    '/images/portal/second-layer/sposad_02.jpg',
    '/images/portal/second-layer/sposad_03.jpg',
  ],
  idc: [
    '/images/portal/second-layer/idc_01.jpg',
    '/images/portal/second-layer/idc_02.jpg',
    '/images/portal/second-layer/idc_03.jpg',
  ],
  tisdc: [
    '/images/portal/second-layer/tisdc_01.jpg',
    '/images/portal/second-layer/tisdc_02.jpg',
    '/images/portal/second-layer/tisdc_03.jpg',
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

const DESKTOP_STAGE_W = 856;
const DESKTOP_MAIN_W = 537;
const DESKTOP_SIDE_W = 290;
const DESKTOP_STAGE_GAP_X = 29;
const DESKTOP_STAGE_GAP_Y = 16;
const DESKTOP_MAIN_TOP_H = 384;
const DESKTOP_MAIN_STATS_H = 167;
const DESKTOP_ROTATE_MS = 6000;

const DESKTOP_BACK_PHOTOS = [
  {
    left: -104,
    top: 74,
    size: 223,
    clipId: 'flowerA',
    opacity: 0.6,
    hoverX: -18,
    hoverY: -12,
    hoverRotate: -3,
  },
  {
    left: 64,
    top: -79,
    size: 180,
    clipId: 'flowerB',
    opacity: 0.58,
    hoverX: 10,
    hoverY: -18,
    hoverRotate: 3,
  },
] as const;

const FLOWER_A_PATH =
  'M .88 .5 A .13 .13 0 0 1 .807 .723 A .13 .13 0 0 1 .617 .861 A .13 .13 0 0 1 .383 .861 A .13 .13 0 0 1 .193 .723 A .13 .13 0 0 1 .12 .5 A .13 .13 0 0 1 .193 .277 A .13 .13 0 0 1 .383 .139 A .13 .13 0 0 1 .617 .139 A .13 .13 0 0 1 .807 .277 A .13 .13 0 0 1 .88 .5 Z';
const FLOWER_B_PATH =
  'M .87 .5 A .18 .18 0 0 1 .731 .789 A .18 .18 0 0 1 .418 .861 A .18 .18 0 0 1 .167 .66 A .18 .18 0 0 1 .167 .34 A .18 .18 0 0 1 .418 .139 A .18 .18 0 0 1 .731 .211 A .18 .18 0 0 1 .87 .5 Z';

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
  idc: ['教育部鼓勵學生參加', '藝術與設計類國際競賽計畫'],
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

export function getDecorStarPhotos(plan: Plan): string[] {
  return DECOR_STAR_PHOTOS[plan.id] ?? localPhotos(plan);
}

export function getDecorStarFocal(
  planId: string,
  photoIndex: number,
): { zoomUp: number } | undefined {
  return STAR_FOCAL[planId]?.[photoIndex];
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
  staticStars = false,
  dimmed = false,
}: {
  plan: Plan;
  /**
   * 手機版用：以「靜態霧化星形照片」呈現裝飾。沿用相同的邊緣位置與
   * 星形輪廓，但不可互動、加上模糊霧化。
   */
  staticStars?: boolean;
  /**
   * 是否渲染（掛載）周圍裝飾星形照片。環狀軌道只在「中份」卡片掛載星形，兩側
   * 複本不掛載（peek 細條不需星形）。
   */
  showStars?: boolean;
  /**
   * 鄰卡：僅「卡片本體」淡化＋去飽和（裝飾照片不受影響，恆維持固定霧化、只在
   * hover 時才有樣式變化）。dim 套在卡片層而非外層，避免波及底下照片。
   */
  dimmed?: boolean;
}) {
  const photos = getDecorStarPhotos(plan);
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
          // 該照片在星形框內的取像微調（未指定者置中滿框）。以底部為錨垂直放大裁上緣。
          const focal = STAR_FOCAL[plan.id]?.[i];
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
                  // 同桌機：以底部為錨垂直放大裁上緣（auto 高度 zoom），其餘維持 cover。
                  backgroundSize: focal
                    ? `auto ${focal.zoomUp * 100}%`
                    : 'cover',
                  backgroundPosition: focal ? 'center bottom' : 'center',
                  clipPath: STAR_CLIP,
                  // 霧化透出：模糊 + 降彩度提亮 + 半透明，輕透融入卡片底下（與桌機
                  // 預模糊圖的淡彩外觀一致，不濃深）。
                  filter: 'blur(5px) saturate(0.6) brightness(1.15)',
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
              {/* 底層：清晰原圖（原始 2000px 檔，未壓縮、未縮放），供 hover 浮出時以
                  原檔畫質顯示。eager + 低 fetchPriority 預先載入：上層模糊圖以高優先
                  先就緒、維持靜止霧化外觀，原圖隨後低優先載入，確保 hover 時已備妥、
                  立即呈現原檔清晰度，不必等 lazy 才下載。靜止時以 visibility 隱藏，
                  不會在模糊圖之前搶先露出（杜絕「先清晰、再變霧」）。 */}
              <Box
                component="img"
                className="plan-star-sharp"
                src={photos[i]}
                alt=""
                loading="eager"
                fetchPriority="low"
                sx={{
                  position: 'absolute',
                  inset: 0,
                  width: '100%',
                  height: '100%',
                  objectFit: 'cover',
                  // 以底部為錨垂直放大，裁掉上緣暗部（畫面在框內視覺上移）。
                  ...(focal && {
                    transform: `scale(${focal.zoomUp})`,
                    transformOrigin: 'center bottom',
                  }),
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
                  // 以底部為錨垂直放大，裁掉上緣暗部（畫面在框內視覺上移）。
                  ...(focal && {
                    transform: `scale(${focal.zoomUp})`,
                    transformOrigin: 'center bottom',
                  }),
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
        <PlanCard plan={plan} frostBacking={showStars} />
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

interface DesktopPlanSideCardProps {
  plan: Plan;
  onSelect: () => void;
}

function DesktopRotateRing({ paused }: { paused: boolean }) {
  return (
    <Box
      data-testid="desktop-rotate-ring"
      aria-hidden
      sx={{
        position: 'absolute',
        top: 12,
        right: 12,
        width: 16,
        height: 16,
        opacity: 0.85,
        pointerEvents: 'none',
        zIndex: 2,
        '@keyframes desktopRotateRingFill': {
          from: { strokeDashoffset: 100 },
          to: { strokeDashoffset: 0 },
        },
      }}
    >
      <Box
        component="svg"
        viewBox="0 0 36 36"
        sx={{
          width: '100%',
          height: '100%',
          display: 'block',
          transform: 'rotate(-90deg)',
        }}
      >
        <Box
          component="circle"
          cx="18"
          cy="18"
          r="15.5"
          pathLength="100"
          sx={{
            fill: 'none',
            stroke: '#F1E5D5',
            strokeWidth: 3.4,
            strokeLinecap: 'round',
          }}
        />
        <Box
          component="circle"
          cx="18"
          cy="18"
          r="15.5"
          pathLength="100"
          sx={{
            fill: 'none',
            stroke: '#E3AE5D',
            strokeWidth: 3.4,
            strokeLinecap: 'round',
            strokeDasharray: 100,
            strokeDashoffset: 100,
            animation: `desktopRotateRingFill ${DESKTOP_ROTATE_MS}ms linear forwards`,
            animationPlayState: paused ? 'paused' : 'running',
            '@media (prefers-reduced-motion: reduce)': {
              animation: 'none',
            },
          }}
        />
      </Box>
    </Box>
  );
}

function DesktopPlanSideCard({ plan, onSelect }: DesktopPlanSideCardProps) {
  const name = planName(plan);

  return (
    <Box
      data-testid="desktop-plan-side"
      data-plan-id={plan.id}
      role="button"
      tabIndex={0}
      aria-label={`切換至${name}`}
      onClick={onSelect}
      onKeyDown={(event) => {
        if (event.key === 'Enter' || event.key === ' ') {
          event.preventDefault();
          onSelect();
        }
      }}
      sx={{
        position: 'relative',
        minHeight: 0,
        height: '100%',
        borderRadius: '18px',
        bgcolor: '#FFFFFF',
        boxShadow: '0 12px 36px rgba(40, 36, 28, 0.07)',
        p: '32px 30px 39px',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        gap: '28px',
        textAlign: 'left',
        outline: 'none',
        transition:
          'transform 0.35s ease, box-shadow 0.35s ease, background-color 0.35s ease',
        cursor: 'inherit',
        '&:hover, &:focus-visible': {
          transform: 'translateY(-4px)',
          boxShadow:
            '0 16px 40px rgba(40, 36, 28, 0.10), 0 0 0 1px rgba(227, 174, 93, 0.32), 0 0 28px rgba(227, 174, 93, 0.20)',
        },
        '&:focus-visible': portalTokens.focusRing,
      }}
    >
      <CompactPlanNameplate plan={plan} side />
      <Box
        component="span"
        sx={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: '14px',
          bgcolor: '#FFFFFF',
          borderRadius: '9px',
          px: '19px',
          py: '7px',
          boxShadow: '0 4px 14px rgba(40, 36, 28, 0.10)',
          fontSize: 14.5,
          fontWeight: 500,
          lineHeight: 1.8,
          color: '#000000',
          whiteSpace: 'nowrap',
          transition: 'transform 0.25s ease, box-shadow 0.25s ease',
          '.MuiBox-root:hover &, .MuiBox-root:focus-visible &': {
            transform: 'translateY(-2px)',
            boxShadow: '0 8px 20px rgba(40, 36, 28, 0.16)',
          },
        }}
      >
        了解更多
        <ArrowOutwardIcon sx={{ fontSize: 15 }} />
      </Box>
    </Box>
  );
}

function getDesktopCardImage(plan: Plan): string | null {
  return (
    plan.banners.find((b) => b.type === 'local' && b.src)?.src ??
    plan.photos.find((p) => p.type === 'local' && p.src)?.src ??
    null
  );
}

function CompactPlanNameplate({
  plan,
  side = false,
}: {
  plan: Plan;
  side?: boolean;
}) {
  const nameplate = plan.logoNameplate;

  if (!nameplate) {
    return (
      <PlanLogo
        name={plan.name}
        planId={plan.id}
        logoSrc={plan.logoUrl}
        nameplate={plan.logoNameplate}
      />
    );
  }

  return (
    <Box
      sx={{
        display: 'flex',
        alignItems: 'center',
        gap: side ? '18px' : '18px',
      }}
    >
      <Box
        component="img"
        src={nameplate.mark}
        alt=""
        sx={{
          width: side ? 58 : 45,
          height: side ? 58 : 45,
          objectFit: 'contain',
          flexShrink: 0,
          display: 'block',
        }}
      />
      <Box sx={{ minWidth: 0, maxWidth: side ? 132 : 145 }}>
        {nameplate.nameZh.map((line, i) => (
          <Box
            key={i}
            component="p"
            sx={{
              m: 0,
              fontSize: side ? 12 : 11.5,
              fontWeight: 700,
              lineHeight: 1.22,
              color: '#000000',
            }}
          >
            {line}
          </Box>
        ))}
        <Box
          component="p"
          sx={{
            m: 0,
            mt: side ? '7px' : '8px',
            fontSize: side ? 9 : 8.8,
            fontWeight: 400,
            lineHeight: 1.25,
            color: '#000000',
            maxWidth: side ? 130 : 142,
          }}
        >
          {nameplate.nameEn}
        </Box>
      </Box>
    </Box>
  );
}

function DesktopPlanBackPhotos({ plan }: { plan: Plan }) {
  const photos = localPhotos(plan);
  const flowerAId = `desktop-${plan.id}-flower-a`;
  const flowerBId = `desktop-${plan.id}-flower-b`;

  return (
    <Box
      aria-hidden
      sx={{
        position: 'absolute',
        inset: 0,
        pointerEvents: 'none',
      }}
    >
      <Box
        component="svg"
        sx={{ position: 'absolute', width: 0, height: 0, overflow: 'hidden' }}
      >
        <defs>
          <clipPath id={flowerAId} clipPathUnits="objectBoundingBox">
            <path d={FLOWER_A_PATH} />
          </clipPath>
          <clipPath id={flowerBId} clipPathUnits="objectBoundingBox">
            <path d={FLOWER_B_PATH} />
          </clipPath>
        </defs>
      </Box>
      {DESKTOP_BACK_PHOTOS.map((photoLayout, index) => {
        const src = photos[index];
        if (!src) return null;
        const hazeSrc = src.replace(/\.jpg$/i, '.blur.jpg');
        const clipPath =
          photoLayout.clipId === 'flowerA'
            ? `url(#${flowerAId})`
            : `url(#${flowerBId})`;

        return (
          <Box
            key={`${plan.id}-${index}`}
            data-testid="desktop-plan-back-photo-layer"
            data-hover-layer="self"
            sx={{
              position: 'absolute',
              left: photoLayout.left,
              top: photoLayout.top,
              width: photoLayout.size,
              height: photoLayout.size,
              zIndex: 0,
              pointerEvents: 'auto',
              transformOrigin: 'center',
              willChange: 'transform',
              '--desktop-back-photo-hover-transform': `translate(${photoLayout.hoverX}px, ${photoLayout.hoverY}px) rotate(${photoLayout.hoverRotate}deg) scale(1.1)`,
              transition: 'transform 0.65s cubic-bezier(0.22, 1, 0.36, 1)',
              '&:hover': {
                zIndex: 3,
                transform: 'var(--desktop-back-photo-hover-transform)',
                '& [data-testid="desktop-plan-back-photo"]': {
                  visibility: 'visible',
                  opacity: Math.min(0.86, photoLayout.opacity + 0.24),
                  filter: 'saturate(1.08) brightness(1.08)',
                },
                '& [data-testid="desktop-plan-back-photo-haze"]': {
                  opacity: 0,
                },
              },
              '@media (prefers-reduced-motion: reduce)': {
                transition: 'none',
                '&:hover': { zIndex: 3, transform: 'none' },
              },
            }}
          >
            <Box
              data-testid="desktop-plan-back-photo"
              data-hover-effect="true"
              data-hover-trigger="self"
              component="img"
              src={src}
              alt=""
              sx={{
                position: 'absolute',
                inset: 0,
                display: 'block',
                width: '100%',
                height: '100%',
                objectFit: 'cover',
                clipPath,
                visibility: 'hidden',
                opacity: 0,
                cursor: 'inherit',
                filter: 'saturate(0.82) brightness(1.02)',
                willChange: 'opacity, filter',
                transition: 'opacity 0.45s ease, filter 0.45s ease',
                '@media (prefers-reduced-motion: reduce)': {
                  transition: 'opacity 0.2s ease, filter 0.2s ease',
                },
              }}
            />
            <Box
              data-testid="desktop-plan-back-photo-haze"
              component="img"
              src={hazeSrc}
              alt=""
              loading="eager"
              fetchPriority="high"
              sx={{
                position: 'absolute',
                inset: 0,
                display: 'block',
                width: '100%',
                height: '100%',
                objectFit: 'cover',
                clipPath,
                opacity: 1,
                cursor: 'inherit',
                willChange: 'opacity',
                transition: 'opacity 0.45s ease',
                animation:
                  'desktopBackPhotoIn 0.7s cubic-bezier(0.22, 1, 0.36, 1) backwards',
                animationDelay: `${index * 0.08}s`,
                '@media (prefers-reduced-motion: reduce)': {
                  transition: 'none',
                  animation: 'none',
                },
              }}
            />
          </Box>
        );
      })}
    </Box>
  );
}

function DesktopPlanMainCard({
  plan,
  ringPaused,
}: {
  plan: Plan;
  ringPaused: boolean;
}) {
  const cardImage = getDesktopCardImage(plan);
  const organizers = plan.organizers;

  return (
    <Box sx={{ position: 'relative', width: '100%' }}>
      <Box
        sx={{
          height: DESKTOP_MAIN_TOP_H,
          borderRadius: '18px',
          bgcolor: '#FFFFFF',
          boxShadow: '0 12px 36px rgba(40, 36, 28, 0.07)',
          p: '32px 28px 24px',
          position: 'relative',
        }}
      >
        <DesktopRotateRing paused={ringPaused} />
        <Box
          sx={{
            display: 'grid',
            gridTemplateColumns: '186px 1fr',
            columnGap: '50px',
            height: '100%',
          }}
        >
          <Box sx={{ pt: '4px', pr: '8px' }}>
            <CompactPlanNameplate plan={plan} />
            {organizers.length > 0 && (
              <Box data-testid="desktop-plan-organizers" sx={{ mt: '22px' }}>
                <Box
                  component="p"
                  sx={{
                    m: 0,
                    fontSize: 9,
                    lineHeight: 1.65,
                    color: '#666666',
                  }}
                >
                  執行單位：
                </Box>
                {organizers.map((org) => (
                  <Box
                    key={org}
                    component="p"
                    sx={{
                      m: 0,
                      fontSize: 8.5,
                      lineHeight: 1.65,
                      color: '#666666',
                    }}
                  >
                    {org}
                  </Box>
                ))}
              </Box>
            )}
          </Box>
          <Box sx={{ minWidth: 0, pr: '8px' }}>
            <Box
              component="p"
              sx={{
                m: 0,
                fontSize: 10.8,
                lineHeight: 1.75,
                color: '#000000',
                textAlign: 'justify',
              }}
            >
              {plan.intro}
            </Box>
          </Box>
        </Box>
        <Box
          data-testid="desktop-plan-timeline"
          sx={{ position: 'absolute', left: 28, right: 28, bottom: 27 }}
        >
          <PlanTimeline timelines={plan.timelines} />
        </Box>
      </Box>

      <Box
        sx={{
          mt: '10px',
          height: DESKTOP_MAIN_STATS_H,
          borderRadius: '18px',
          bgcolor: 'rgba(255, 255, 255, 0.54)',
          border: '1px solid rgba(138, 138, 138, 0.30)',
          backdropFilter: 'blur(28px)',
          WebkitBackdropFilter: 'blur(28px)',
          boxShadow: '0 10px 28px rgba(40, 36, 28, 0.05)',
          p: '10px',
          position: 'relative',
          display: 'grid',
          gridTemplateColumns: '116px 1fr',
          gap: '12px',
        }}
      >
        <Box sx={{ position: 'relative', overflow: 'hidden' }}>
          <StatsMarquee stats={plan.stats} />
        </Box>
        {cardImage ? (
          <Box
            component="img"
            src={cardImage}
            alt={`${plan.name.zh} 代表圖`}
            loading="lazy"
            sx={{
              display: 'block',
              width: '100%',
              height: '100%',
              objectFit: 'cover',
              borderRadius: '12px',
            }}
          />
        ) : (
          <Box
            sx={{
              width: '100%',
              height: '100%',
              borderRadius: '12px',
              background: `linear-gradient(120deg, ${portalTokens.color.blobOrangeFrom}, ${portalTokens.color.blobOrangeTo})`,
            }}
          />
        )}
        <Box
          sx={{
            position: 'absolute',
            left: '50%',
            bottom: '-21px',
            transform: 'translateX(-50%) scale(0.78)',
            transformOrigin: 'center',
            zIndex: 2,
          }}
        >
          <SocialLinkBar
            socialLinks={plan.socialLinks}
            learnMoreLabel="前往官網"
            learnMoreHref={plan.officialUrl}
          />
        </Box>
      </Box>
    </Box>
  );
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
  const [desktopRingHeld, setDesktopRingHeld] = useState(false);
  const desktopRingTimerRef = useRef<number | null>(null);
  const desktopRingStartedAtRef = useRef<number | null>(null);
  const desktopRingRemainingRef = useRef(DESKTOP_ROTATE_MS);
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

  useEffect(() => {
    desktopRingRemainingRef.current = DESKTOP_ROTATE_MS;
    desktopRingStartedAtRef.current = null;
  }, [expandedIndex]);

  // 手機展開卡比視窗高、需頁面捲動瀏覽。偵測「作用中卡片底部已進入視窗下緣」時
  // （peekAtBottom），下一頁 peek 鈕由卡片頂部下移到社群列下方就位，使用者在卡片尾端原處
  // 即可切到下一個計畫，且不覆蓋代表圖與連結。peek 以「作用中卡片的實際高度」定位（而非
  // 整條軌道高 = 最高卡），讓各計畫卡（含較矮者）與 peek 的距離一致。
  const mobileCardWrapRef = useRef<HTMLDivElement | null>(null);
  const activeCardRef = useRef<HTMLDivElement | null>(null);
  const [peekAtBottom, setPeekAtBottom] = useState(false);
  const [activeCardH, setActiveCardH] = useState(0);
  useEffect(() => {
    if (typeof window === 'undefined' || isDesktop || expandedIndex === null) {
      return;
    }
    const card = activeCardRef.current;
    if (!card) return;
    let raf = 0;
    const measure = () => {
      raf = 0;
      const vh = window.visualViewport?.height ?? window.innerHeight;
      setActiveCardH(card.offsetHeight);
      // 作用中卡片底部捲到視窗下緣附近即視為「到底」，peek 鈕下移就位。
      setPeekAtBottom(card.getBoundingClientRect().bottom <= vh + 24);
    };
    const onScroll = () => {
      if (!raf) raf = requestAnimationFrame(measure);
    };
    measure();
    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onScroll, { passive: true });
    const ro = new ResizeObserver(() => measure());
    ro.observe(card);
    return () => {
      window.removeEventListener('scroll', onScroll);
      window.removeEventListener('resize', onScroll);
      ro.disconnect();
      if (raf) cancelAnimationFrame(raf);
    };
  }, [isDesktop, expandedIndex, viewportW]);

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
  useEffect(() => {
    if (desktopRingTimerRef.current) {
      window.clearTimeout(desktopRingTimerRef.current);
      desktopRingTimerRef.current = null;
    }
    if (
      typeof window === 'undefined' ||
      !isDesktop ||
      expandedIndex === null ||
      count <= 1 ||
      window.matchMedia('(prefers-reduced-motion: reduce)').matches
    ) {
      return;
    }

    if (desktopRingHeld) {
      if (desktopRingStartedAtRef.current !== null) {
        desktopRingRemainingRef.current = Math.max(
          0,
          desktopRingRemainingRef.current -
            (Date.now() - desktopRingStartedAtRef.current),
        );
        desktopRingStartedAtRef.current = null;
      }
      return;
    }

    desktopRingStartedAtRef.current = Date.now();
    desktopRingTimerRef.current = window.setTimeout(() => {
      desktopRingRemainingRef.current = DESKTOP_ROTATE_MS;
      desktopRingStartedAtRef.current = null;
      const next = (expandedIndex + 1) % count;
      if (onPeekNavigate) onPeekNavigate(next, 'next');
      else onExpandedIndexChange(next);
    }, desktopRingRemainingRef.current);

    return () => {
      if (desktopRingTimerRef.current) {
        window.clearTimeout(desktopRingTimerRef.current);
        desktopRingTimerRef.current = null;
      }
    };
  }, [
    count,
    desktopRingHeld,
    expandedIndex,
    isDesktop,
    onExpandedIndexChange,
    onPeekNavigate,
  ]);
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
              // 等候黑字繼續上升 + 橘字單獨存在（40-81%，停留在 -120）→
              // 81-89%（3000-3300ms，0.3s）一氣完成：顏色變淺、放大到
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
              // 由 keyframes 在上升停留段套用）。
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
      // 使用者常捲到卡片尾端才切換：切到下一張時把頁面捲回卡片頂端，讓新計畫從頭閱讀。
      const wrap = mobileCardWrapRef.current;
      if (wrap && typeof window !== 'undefined') {
        const reduce = window.matchMedia(
          '(prefers-reduced-motion: reduce)',
        ).matches;
        const y = wrap.getBoundingClientRect().top + window.scrollY - 24;
        window.scrollTo({
          top: Math.max(0, y),
          behavior: reduce ? 'auto' : 'smooth',
        });
      }
    };
    return (
      <Box sx={{ width: '100%', overflowX: 'clip' }}>
        <Box
          ref={mobileCardWrapRef}
          sx={{
            position: 'relative',
            display: 'flex',
            justifyContent: 'center',
            // 容器高度跟隨作用中卡片實高（而非最高卡），讓下方資訊區與各計畫卡的距離一致；
            // 較高的鄰卡多出的部分向下溢出，落在卡片與資訊區間的留白帶、不影響版面高度。
            ...(activeCardH ? { height: `${activeCardH}px` } : {}),
          }}
        >
          <Box
            sx={{
              display: 'flex',
              // 不撐高鄰卡：各卡維持自然高度（量到的中央卡高度才是該卡實高，供 peek 定位）。
              alignItems: 'flex-start',
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
                    ref={isCenter ? activeCardRef : undefined}
                    aria-hidden={!isCenter}
                    sx={{
                      flex: '0 0 auto',
                      width: MCARD_W,
                      opacity: isCenter ? 1 : 0.5,
                      // 較高的鄰卡裁切到作用卡高度，避免其底部從邊緣溢出到卡片與資訊區的留白帶；
                      // 中央卡不裁切，其社群列與 peek 仍正常向下探出。
                      ...(!isCenter && activeCardH
                        ? { maxHeight: `${activeCardH}px`, overflow: 'hidden' }
                        : {}),
                      transition: wrapSnap
                        ? 'none'
                        : 'opacity 0.8s cubic-bezier(0.16, 1, 0.3, 1)',
                      '@media (prefers-reduced-motion: reduce)': {
                        transition: 'none',
                      },
                    }}
                  >
                    <PlanCard plan={plan} />
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
              // 捲到卡片底部時由頂部（40px）下移到作用中卡片底部下 48px（社群列正下方）就位，
              // 緊貼社群列、不覆蓋代表圖與「前往官網」等連結；下方資訊區的留白即其落點。
              // 以作用中卡片實高定位，各計畫卡（含較矮者）與 peek 距離一致。
              top={
                peekAtBottom
                  ? activeCardH
                    ? `${Math.round(activeCardH) + 48}px`
                    : 'calc(100% + 48px)'
                  : '40px'
              }
              planName={plans[mNext]?.name.zh ?? ''}
              markSrc={`/images/plans/${plans[mNext]?.folderName}/logo/mark.png`}
              onClick={mobileNext}
            />
          )}
        </Box>
      </Box>
    );
  }

  // ── 桌機展開：左側詳細主卡 + 右側兩張收合卡 ──
  // 第二屏一次呈現三個計畫；active 計畫顯示完整資訊，
  // 其餘兩個計畫以右側收合卡呈現。點擊收合卡只切換版面與互動狀態，文案來源維持 Plan。
  const activePlan = plans[expandedIndex];
  const sidePlans = plans
    .map((plan, index) => ({ plan, index }))
    .filter(({ index }) => index !== expandedIndex);

  const navigateTo = (target: number) => {
    if (target === expandedIndex) return;
    let dir: 'prev' | 'next' = target > expandedIndex ? 'next' : 'prev';
    if (expandedIndex === count - 1 && target === 0) {
      dir = 'next';
    } else if (expandedIndex === 0 && target === count - 1) {
      dir = 'prev';
    }
    if (onPeekNavigate) onPeekNavigate(target, dir);
    else onExpandedIndexChange(target);
  };

  return (
    <Box
      data-testid="desktop-plan-stage"
      sx={{
        position: 'relative',
        width: DESKTOP_STAGE_W,
        height: 561,
        maxWidth: '100%',
        overflow: 'visible',
        zoom: cardScale !== 1 ? cardScale : undefined,
        mx: 'auto',
      }}
    >
      <Box
        sx={{
          display: 'grid',
          gridTemplateColumns: `${DESKTOP_MAIN_W}px ${DESKTOP_SIDE_W}px`,
          gridTemplateRows: '1fr 1fr',
          gap: `${DESKTOP_STAGE_GAP_Y}px ${DESKTOP_STAGE_GAP_X}px`,
          minHeight: 561,
          alignItems: 'stretch',
          '@keyframes desktopPlanMainIn': {
            from: { opacity: 0, transform: 'translateY(26px)' },
            to: { opacity: 1, transform: 'translateY(0)' },
          },
          '@keyframes desktopBackPhotoIn': {
            from: { opacity: 0, transform: 'scale(0.92) rotate(-6deg)' },
            to: { opacity: 1, transform: 'scale(1) rotate(0deg)' },
          },
          '@keyframes desktopPlanSideIn': {
            from: { opacity: 0, transform: 'translateY(20px)' },
            to: { opacity: 1, transform: 'translateY(0)' },
          },
          '@media (prefers-reduced-motion: reduce)': {
            '& [data-plan-motion]': { animation: 'none' },
          },
        }}
      >
        {activePlan && <DesktopPlanBackPhotos plan={activePlan} />}
        {plans.map((plan, index) => {
          const isActive = index === expandedIndex;
          const sideRank = sidePlans.findIndex((item) => item.index === index);
          const roleLayout = isActive
            ? {
                left: 0,
                top: 0,
                width: DESKTOP_MAIN_W,
                height: 561,
                zIndex: 2,
              }
            : {
                left: DESKTOP_MAIN_W + DESKTOP_STAGE_GAP_X,
                top: sideRank === 0 ? 0 : 272 + DESKTOP_STAGE_GAP_Y,
                width: DESKTOP_SIDE_W,
                height: 272,
                zIndex: 1,
              };

          return (
            <Box
              key={plan.id}
              data-plan-motion=""
              {...(isActive
                ? {
                    'data-testid': 'desktop-plan-main',
                    'data-plan-id': plan.id,
                    onMouseEnter: () => {
                      setDesktopRingHeld(true);
                      onHoverPlanChange?.(expandedIndex);
                    },
                    onMouseLeave: () => {
                      setDesktopRingHeld(false);
                      onHoverPlanChange?.(null);
                    },
                    onFocus: () => setDesktopRingHeld(true),
                    onBlur: (event: React.FocusEvent<HTMLDivElement>) => {
                      if (!event.currentTarget.contains(event.relatedTarget)) {
                        setDesktopRingHeld(false);
                      }
                    },
                  }
                : {})}
              sx={{
                position: 'absolute',
                ...roleLayout,
                transition:
                  'left 0.85s cubic-bezier(0.16, 1, 0.3, 1), top 0.85s cubic-bezier(0.16, 1, 0.3, 1), width 0.85s cubic-bezier(0.16, 1, 0.3, 1), height 0.85s cubic-bezier(0.16, 1, 0.3, 1), opacity 0.45s ease, transform 0.85s cubic-bezier(0.16, 1, 0.3, 1)',
                transform: isActive
                  ? 'translateY(calc(var(--reveal-y, 0px) * -1))'
                  : 'translateY(0)',
                '@media (prefers-reduced-motion: reduce)': {
                  transition: 'none',
                },
              }}
            >
              {isActive ? (
                <DesktopPlanMainCard plan={plan} ringPaused={desktopRingHeld} />
              ) : (
                <DesktopPlanSideCard
                  plan={plan}
                  onSelect={() => navigateTo(index)}
                />
              )}
            </Box>
          );
        })}
      </Box>
    </Box>
  );
}
