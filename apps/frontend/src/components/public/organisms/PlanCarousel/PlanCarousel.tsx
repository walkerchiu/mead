'use client';

import { useEffect, useRef, useState } from 'react';

import Box from '@mui/material/Box';

import type { Plan } from '@/types/plan';

import { portalTokens } from '../../tokens';
import { PlanCard } from '../PlanCard';

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
 */
const PEEK_BASE = {
  display: 'none',
  position: 'absolute',
  top: 0,
  bottom: 0,
  width: 760,
  p: 0,
  borderRadius: '17.35px',
  bgcolor: 'rgba(255, 255, 255, 0.54)',
  border: '1px solid rgba(138, 138, 138, 0.49)',
  backdropFilter: 'blur(28.34px)',
  WebkitBackdropFilter: 'blur(28.34px)',
  cursor: 'pointer',
  zIndex: 5,
  transition: 'background-color 0.25s ease',
  '&:hover': {
    bgcolor: 'rgba(255, 255, 255, 0.72)',
  },
  '&:focus-visible': {
    outline: `2px solid ${portalTokens.color.brandOrange}`,
    outlineOffset: 2,
  },
  [portalTokens.mq.tabletUp]: { display: 'block' },
} as const;

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
}

/**
 * PlanMiniCard — 收合的計畫卡（依設計師 DESIGN_SPEC v2）。
 *
 * - 預設：淺灰底 #EEEEEE + 中灰字 #666；
 * - hover：白底 + 橘字 #E84C1F、整張卡向上位移 -22px、加深陰影、
 *   底部長出「圓形氣泡 + 向下箭頭」尾巴，並在卡片內呈現「字往上飄逸、
 *   原位留下橘色餘像（殘影）」的招牌動態。其他卡片不淡化（spec v2）。
 */
function PlanMiniCard({ plan, onSelect, onHover, onLeave }: PlanMiniCardProps) {
  const name = planName(plan);
  const lines = cardTitleLines(plan);
  const [hovered, setHovered] = useState(false);
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
            xmlns="http://www.w3.org/1999/xhtml"
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
          stroke="rgba(138, 138, 138, 0.49)"
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
          color: hovered ? portalTokens.color.brandOrange : '#9A9A9A',
          padding: 0,
          transform: hovered ? 'translateY(-46px)' : 'translateY(0)',
          transition:
            'transform 0.40s cubic-bezier(0.22, 1, 0.36, 1), color 0.40s cubic-bezier(0.22, 1, 0.36, 1)',
          '&:focus-visible': {
            outline: `2px solid ${portalTokens.color.brandOrange}`,
            outlineOffset: 2,
          },
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
            color: hovered
              ? portalTokens.color.brandOrange
              : 'rgba(0, 0, 0, 0.32)',
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
          - color #BABABA、font-size 12.638、weight 400、SF Pro */}
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
          color: '#BABABA',
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
/** 點擊小卡到詳細卡之間的「過場」動畫長度（ms）— 殘影 title 升起需 ~550ms */
const EXIT_MS = 540;
/** 計畫之間左右滑動切換的轉場長度（ms） */
const SLIDE_MS = 550;

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

  useEffect(() => {
    return () => {
      if (exitTimerRef.current) window.clearTimeout(exitTimerRef.current);
      if (slideTimerRef.current) window.clearTimeout(slideTimerRef.current);
    };
  }, []);

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
    slideTimerRef.current = window.setTimeout(() => {
      setSlideDir(null);
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
      // React 會把這兩個 setState 一起 batch，下次 render 同時擁有
      // exitingTo=null 與 expandedIndex=i → 直接走展開分支、不會閃回靜止態。
      setExitingTo(null);
      onExpandedIndexChange(i);
      exitTimerRef.current = null;
    }, EXIT_MS);
  };

  // peek 點擊 — 切到上 / 下一個計畫（環狀 wrap-around）
  const goPrev = () => {
    if (expandedIndex === null) return;
    onExpandedIndexChange((expandedIndex - 1 + count) % count);
  };
  const goNext = () => {
    if (expandedIndex === null) return;
    onExpandedIndexChange((expandedIndex + 1) % count);
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
            data-exiting={exitingTo !== null ? 'true' : 'false'}
            sx={{
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
              '& > button': {
                // 載入入場：由下方淡入上升，三張錯開時間呈現；用 backwards 而非 both，
                // 避免動畫結束後 transform 仍被釘住、擋掉 hover 的 translateY/scale。
                animation:
                  'planMiniIn 0.55s cubic-bezier(0.22, 1, 0.36, 1) backwards',
                flexShrink: 0,
              },
              '& > button:nth-of-type(2)': { animationDelay: '0.08s' },
              '& > button:nth-of-type(3)': { animationDelay: '0.16s' },
              '@keyframes planMiniIn': {
                from: { opacity: 0, transform: 'translateY(20px)' },
                to: { opacity: 1, transform: 'translateY(0)' },
              },
              // 點擊後的退場：三張卡同步淡出 + 微微下沉
              '&[data-exiting="true"] > button': {
                animation: `planMiniExit ${EXIT_MS}ms ease-in forwards`,
                pointerEvents: 'none',
              },
              '@keyframes planMiniExit': {
                from: { opacity: 1, transform: 'translateY(0)' },
                to: { opacity: 0, transform: 'translateY(12px)' },
              },
              '@media (prefers-reduced-motion: reduce)': {
                '& > button': { animation: 'none' },
                '&[data-exiting="true"] > button': {
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
                onHover={() => onHoverPlanChange?.(i)}
                onLeave={() => onHoverPlanChange?.(null)}
              />
            ))}
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
      from: { transform: 'translateX(120%)', opacity: 0.25 },
      to: { transform: 'translateX(0)', opacity: 1 },
    },
    '@keyframes planSlideInLeft': {
      from: { transform: 'translateX(-120%)', opacity: 0.25 },
      to: { transform: 'translateX(0)', opacity: 1 },
    },
    '@keyframes planSlideOutLeft': {
      from: { transform: 'translateX(0)', opacity: 1 },
      to: { transform: 'translateX(-120%)', opacity: 0.25 },
    },
    '@keyframes planSlideOutRight': {
      from: { transform: 'translateX(0)', opacity: 1 },
      to: { transform: 'translateX(120%)', opacity: 0.25 },
    },
  } as const;

  return (
    <Box sx={{ position: 'relative', width: '100%' }}>
      {/* 左右兩側豎立的相鄰計畫預覽矩形 — 點擊以橫向滑動切換上 / 下計畫。
          760 寬 + left/right: -720px 讓多數寬度溢出畫面、僅露 40px 在視窗邊緣。
          頁面外層已 overflow-x: clip，溢出部分自然裁切。*/}
      {count > 1 && (
        <>
          <Box
            component="button"
            type="button"
            aria-label="上一個計畫"
            onClick={goPrev}
            sx={[PEEK_BASE, { left: -720 }]}
          />
          <Box
            component="button"
            type="button"
            aria-label="下一個計畫"
            onClick={goNext}
            sx={[PEEK_BASE, { right: -720 }]}
          />
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

          {/* 入場新卡 — key 變動觸發 React remount、播放對應 in 動畫。
              slideDir 存在時走左/右滑入；否則（從 mini cards 首次展開）走 planExpand 膨脹。*/}
          <Box
            key={activePlan.id}
            onMouseEnter={() => onHoverPlanChange?.(expandedIndex)}
            onMouseLeave={() => onHoverPlanChange?.(null)}
            sx={{
              position: 'relative',
              width: '100%',
              maxWidth: 760,
              zIndex: 1,
              ...(slideDir
                ? {
                    animation:
                      slideDir === 'next'
                        ? `planSlideInRight ${SLIDE_MS}ms cubic-bezier(0.22, 1, 0.36, 1) both`
                        : `planSlideInLeft ${SLIDE_MS}ms cubic-bezier(0.22, 1, 0.36, 1) both`,
                  }
                : {
                    // 首次從 mini cards 展開：膨脹進場（依故事第 7 幕 morph）
                    animation:
                      'planExpand 0.55s cubic-bezier(0.22, 1, 0.36, 1) both',
                    transformOrigin: 'top center',
                  }),
              ...slideKeyframes,
              '@keyframes planExpand': {
                '0%': { opacity: 0, transform: 'scale(0.55)' },
                '40%': { opacity: 0.7 },
                '100%': { opacity: 1, transform: 'scale(1)' },
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
