'use client';

import { useEffect, useId, useMemo, useRef, useState } from 'react';

import Box from '@mui/material/Box';

import type { LocalizedText } from '@/types/plan';

import { portalTokens } from '../../tokens';

/**
 * hero 底部的固定標語 — 對齊 Figma 1:38 / 1:39 / 1:40（各計畫共用）。
 *
 * 三個塊水平 space-between、top-aligned；左右塊各有兩行而中塊只有一行，
 * 自然形成「高低落差」（第二行下沉、中塊在上方獨立浮著）。右塊的第二行
 * 「走向世界」於 Figma 是右縮進排列，故以 alignSelf: flex-end 對齊。
 *
 * 直向（<834px）使用較簡化的兩欄堆疊版本（左二行 + 右二行），與設計稿
 * 手機版邏輯一致。
 */
interface BaseLabelLine {
  text: string;
  align?: 'start' | 'end';
}
interface BaseLabelGroup {
  /** flex 排列順序中的位置：左 / 中 / 右 */
  position: 'start' | 'center' | 'end';
  lines: BaseLabelLine[];
}
const BASE_LABEL_GROUPS: BaseLabelGroup[] = [
  {
    position: 'start',
    lines: [{ text: 'ART x DESIGN' }, { text: 'Gateway' }],
  },
  {
    position: 'center',
    lines: [{ text: 'Taiwan' }],
  },
  {
    position: 'end',
    lines: [{ text: '台灣的創造力，' }, { text: '走向世界', align: 'end' }],
  },
];

/** hover 時照片隨機變換的間隔（ms） */
const PHOTO_INTERVAL = 420;
/** hover 旋轉一圈的時間（ms）— 順時針 */
const SPIN_PERIOD = 2000;
/** 游標移開後的逆時針減速時間（ms） */
const RELEASE_DURATION = 1300;
/** 游標移開後逆時針再轉的角度（度）— 夠明顯但不過度甩轉 */
const RELEASE_DEG = 330;

/**
 * 圖形半徑 — 依 Figma 1:2 / 23:21 / 31:215 量測：每個 blob 369.44×369.44px、半徑 184.72。
 * 改用 Figma 原座標後，viewBox 直接以 1440-wide canvas 為單位。
 */
const SHAPE_R = 184.72;

/**
 * hero 三圖形（依設計稿 node 1:2）— 三者形狀各異但等大：
 * 第一＝深鋸齒星形（齒輪狀，依設計稿明顯尖齒）、第二＝平滑多邊形、第三＝六邊形。
 */
const SHAPE_META = [
  { rotation: 8, sides: 11, innerRatio: 0.89 },
  { rotation: 14, sides: 13, innerRatio: 1 },
  { rotation: 0, sides: 6, innerRatio: 1 },
] as const;

/**
 * 兩種佈局：
 * - 橫向（≥834px）：三圖左中右並排（依 Figma 1:2 原座標）。
 *   viewBox 1440x620 對齊 Figma frame 寬 1440 + hero section 約 620 高（y=130~750）。
 *   centers cy=275 對齊 Figma blob 中心 y=405、相對 hero 頂部 130 偏移 275。
 *   三 blob 中心間距 216（重疊 152px），形成設計稿的緊密 metaball 連體。
 * - 直向（<834px）：三圖上中下堆疊（依手機／平板稿 node 43:396 / 43:1142）。
 */
const LAYOUT = {
  h: {
    viewW: 1440,
    viewH: 620,
    centers: [
      { cx: 513, cy: 275 },
      { cx: 729, cy: 275 },
      { cx: 947, cy: 275 },
    ],
  },
  v: {
    viewW: 460,
    viewH: 1020,
    centers: [
      { cx: 230, cy: 262 },
      { cx: 230, cy: 510 },
      { cx: 230, cy: 758 },
    ],
  },
} as const;

interface ShapeDef {
  cx: number;
  cy: number;
  r: number;
  rotation: number;
  sides: number;
  innerRatio: number;
}

/** 產生圖形的 polygon points（正多邊形或外／內半徑交替的鋸齒星形） */
function shapePoints(s: ShapeDef): string {
  const base = (s.rotation * Math.PI) / 180 - Math.PI / 2;
  if (s.innerRatio >= 1) {
    return Array.from({ length: s.sides }, (_, i) => {
      const a = base + (i / s.sides) * Math.PI * 2;
      return `${(s.cx + s.r * Math.cos(a)).toFixed(1)},${(s.cy + s.r * Math.sin(a)).toFixed(1)}`;
    }).join(' ');
  }
  const n = s.sides * 2;
  return Array.from({ length: n }, (_, i) => {
    const r = i % 2 === 0 ? s.r : s.r * s.innerRatio;
    const a = base + (i / n) * Math.PI * 2;
    return `${(s.cx + r * Math.cos(a)).toFixed(1)},${(s.cy + r * Math.sin(a)).toFixed(1)}`;
  }).join(' ');
}

/** 依佈局組出三圖形（含 polygon points） */
function buildShapes(vertical: boolean) {
  const L = vertical ? LAYOUT.v : LAYOUT.h;
  return SHAPE_META.map((m, i) => {
    const s: ShapeDef = { ...m, ...L.centers[i], r: SHAPE_R };
    return { ...s, points: shapePoints(s) };
  });
}

interface PlacedWord {
  text: string;
  /** 橫向：百分比錨點；直向：所屬欄（左／右） */
  leftPct: number;
  topPct: number;
  side: 'left' | 'right';
}

/**
 * 橫向（≥834px）28 個 hero 文字 strip 的座標 — 直接取自 Figma 1:2 / 23:21 / 31:215
 * 三張設計稿（三計畫位置完全相同，只差顯示內容）。
 *
 * leftPct 為 Figma canvas (1440 寬) 的 x 百分比；topPct 為以 hero 區 620 高
 * （Figma canvas y=130～750）的 y 百分比。Box maxWidth 已對齊 Figma frame 1440，
 * 故 leftPct/topPct 對應到設計稿原座標、不再需要補償偏移。
 *
 * 排列規則來自 Figma：
 *   - 上排 15 個：左 1 (~30%) + 中段三小群 (~43% / ~50% / ~55%) + 右 2 (~66, ~70)
 *   - 下排 13 個：左 1 (~30%) + 中段大密集 (~43〜54%) y 有高低錯落 + 右 2 (~70, ~71)
 * 對齊設計師「自然散落、環繞色塊」的意圖，避免平均間距。
 */
const HORIZONTAL_TEXT_SLOTS: { leftPct: number; topPct: number }[] = [
  // 上排（Figma y=161，hero-relative y=31）→ 31/620 = 5%
  { leftPct: 30.6, topPct: 5 },
  { leftPct: 42.5, topPct: 5 },
  { leftPct: 43.4, topPct: 5 },
  { leftPct: 44.4, topPct: 5 },
  { leftPct: 49.2, topPct: 5 },
  { leftPct: 50.1, topPct: 5 },
  { leftPct: 51.0, topPct: 5 },
  { leftPct: 52.0, topPct: 5 },
  { leftPct: 52.9, topPct: 5 },
  { leftPct: 53.9, topPct: 5 },
  { leftPct: 55.6, topPct: 5 },
  { leftPct: 56.5, topPct: 5 },
  { leftPct: 57.4, topPct: 5 },
  { leftPct: 65.8, topPct: 5 },
  { leftPct: 70.7, topPct: 5 },
  // 下排（Figma y=550–618，hero-relative y=420–488）→ 67.7%–78.7%
  { leftPct: 29.8, topPct: 67.7 },
  { leftPct: 42.6, topPct: 76.3 },
  { leftPct: 44.5, topPct: 69.5 },
  { leftPct: 46.6, topPct: 74.0 },
  { leftPct: 48.5, topPct: 72.1 },
  { leftPct: 49.4, topPct: 76.6 },
  { leftPct: 50.4, topPct: 76.1 },
  { leftPct: 51.3, topPct: 68.4 },
  { leftPct: 52.3, topPct: 69.4 },
  { leftPct: 53.2, topPct: 73.1 },
  { leftPct: 54.4, topPct: 75.7 },
  { leftPct: 70.3, topPct: 74.0 },
  { leftPct: 71.2, topPct: 78.7 },
];

/**
 * 兩個 slot 是否「視覺相鄰」— 同排（上排 / 下排）且 leftPct 差距 < 7pp。
 * 用於避免 twinkle 隨機切換時鄰近 slot 出現相同詞造成肉眼可見的重複叢集。
 */
function areSlotsAdjacent(a: number, b: number): boolean {
  if (a === b) return false;
  const sa = HORIZONTAL_TEXT_SLOTS[a];
  const sb = HORIZONTAL_TEXT_SLOTS[b];
  if (!sa || !sb) return false;
  const sameRow = sa.topPct < 50 === sb.topPct < 50;
  if (!sameRow) return false;
  return Math.abs(sa.leftPct - sb.leftPct) < 7;
}

/**
 * 將「目前作用中計畫」的裝飾文字散佈於色塊周圍（整片雲為同一計畫）。
 * - 橫向：固定 28 個 slot（依 Figma 不規則散落），文字不足時 cycle 重覆使用，
 *   並避開「相鄰 slot 已有同詞」以免出現肉眼可見的重複叢集。
 * - 直向：左右兩欄、沿色塊兩側由上而下（正立橫書）。
 */
function placeWords(words: string[], vertical: boolean): PlacedWord[] {
  if (vertical) {
    const leftCount = Math.ceil(words.length / 2);
    return words.map((text, i) => {
      const onLeft = i < leftCount;
      const idx = onLeft ? i : i - leftCount;
      const len = onLeft ? leftCount : Math.max(1, words.length - leftCount);
      const t = len <= 1 ? 0.5 : idx / (len - 1);
      return {
        text,
        leftPct: onLeft ? 5 : 95,
        topPct: 7 + t * 66,
        side: onLeft ? 'left' : 'right',
      };
    });
  }
  if (words.length === 0) return [];
  const placed: PlacedWord[] = [];
  for (let i = 0; i < HORIZONTAL_TEXT_SLOTS.length; i++) {
    const slot = HORIZONTAL_TEXT_SLOTS[i];
    const usedByNeighbors = new Set<string>();
    for (let j = 0; j < i; j++) {
      if (areSlotsAdjacent(i, j) && placed[j]) {
        usedByNeighbors.add(placed[j].text);
      }
    }
    let chosen: string | null = null;
    for (let k = 0; k < words.length; k++) {
      const candidate = words[(i + k) % words.length];
      if (candidate && !usedByNeighbors.has(candidate)) {
        chosen = candidate;
        break;
      }
    }
    placed.push({
      text: chosen ?? words[i % words.length] ?? '',
      leftPct: slot.leftPct,
      topPct: slot.topPct,
      side: 'left',
    });
  }
  return placed;
}

/** 由元素目前的 transform matrix 反推旋轉角度（度） */
function currentRotationDeg(el: SVGPolygonElement): number {
  const t = window.getComputedStyle(el).transform;
  const m = t && t !== 'none' ? t.match(/matrix\(([^)]+)\)/) : null;
  if (!m) return 0;
  const [a, b] = m[1].split(',').map(Number);
  return (Math.atan2(b, a) * 180) / Math.PI;
}

function prefersReducedMotion(): boolean {
  return (
    typeof window !== 'undefined' &&
    window.matchMedia('(prefers-reduced-motion: reduce)').matches
  );
}

/** 單一色塊（= 單一計畫）的內容：裝飾文字 + 本機照片。 */
export interface ShapeContent {
  /** 該計畫的裝飾文字（取自 plans.json 的 decorativeText） */
  words: LocalizedText[];
  /** 該計畫的本機照片路徑 — hover 此色塊時於塊內隨機循環顯示 */
  photos: string[];
}

export interface DecorativeTextCloudProps {
  /**
   * 三個計畫各自的內容（順序由上層 PortalLandingPage 依 PLAN_ORDER
   * sposad→idc→tisdc 傳入，對應左/中/右色塊）。整片文字雲一次只顯示「目前
   * 作用中計畫」的裝飾文字；hover 某色塊即切換成該計畫的文字並於塊內顯示其照片。
   */
  shapeContents: ShapeContent[];
  /** 未 hover 時整片雲顯示的計畫索引（作用中計畫），預設 0（菁培） */
  defaultIndex?: number;
  /** 文字語言偏好，預設優先英文 */
  language?: 'en' | 'zh';
}

/**
 * DecorativeTextCloud — 入口網 hero 文字雲（完全參照 Hover 互動效果模擬影片）。
 *
 * 色塊由三個圖形組合，橘色漸層至灰：
 * - ≥834px 為左中右橫向並排；<834px 為上中下直向堆疊（依手機／平板設計稿）。
 *
 * **動畫與互動**：
 * - 漂移接合：三圖形緩慢漂移，靠近時透過 goo 濾鏡如液體般相連（metaball）。
 * - hover：滑到圖形時，圖形內貼齊外框顯示計畫照片（無框線），照片快速、
 *   隨機變換；該圖形以順時針快速旋轉，並暫停漂移。
 * - 移開：旋轉以逆時針減速再轉幾圈後停住（Web Animations API 無縫銜接）。
 *
 * 動畫均尊重 `prefers-reduced-motion`。
 */
export function DecorativeTextCloud({
  shapeContents,
  defaultIndex = 0,
  language = 'en',
}: DecorativeTextCloudProps) {
  const uid = useId().replace(/[:]/g, '');
  const [hovered, setHovered] = useState<number | null>(null);
  const [photoIdx, setPhotoIdx] = useState(0);

  // 整片雲一律反映「目前作用中計畫」（由下方計畫卡決定）；hover 不切換計畫，
  // 只是把該色塊的照片顯示出來。切換計畫卡 → defaultIndex 變 → 文字與照片跟著換。
  const displayedIndex = defaultIndex;

  // 各計畫的照片陣列（index 對應計畫）；hero 三塊都取「當前計畫」displayedIndex 的照片。
  const photosByShape = useMemo(
    () => [0, 1, 2].map((i) => shapeContents[i]?.photos ?? []),
    [shapeContents],
  );

  // 直向佈局判斷 — SSR 與首次 client render 皆為橫向，掛載後再依視窗校正，
  // 避免 hydration 不一致。
  const [vertical, setVertical] = useState(false);
  useEffect(() => {
    const mq = window.matchMedia('(max-width:833.95px)');
    const update = () => setVertical(mq.matches);
    update();
    mq.addEventListener('change', update);
    return () => mq.removeEventListener('change', update);
  }, []);

  const shapes = useMemo(() => buildShapes(vertical), [vertical]);
  const view = vertical ? LAYOUT.v : LAYOUT.h;

  /** 各圖形外框遮罩多邊形的 DOM 參照與目前旋轉動畫 */
  const spinRefs = useRef<(SVGPolygonElement | null)[]>([null, null, null]);
  const animRefs = useRef<(Animation | null)[]>([null, null, null]);

  // 整片雲顯示「目前作用中計畫」的詞池（hover 切換 → displayedIndex 改變 → 重算）
  const { positions, pool } = useMemo(() => {
    const texts = (shapeContents[displayedIndex]?.words ?? [])
      .map((w) => (language === 'en' ? (w.en ?? w.zh) : (w.zh ?? w.en)))
      .filter((t): t is string => Boolean(t));
    return { positions: placeWords(texts, vertical), pool: texts };
  }, [shapeContents, displayedIndex, language, vertical]);

  // 各文字槽目前顯示的詞 — 隨閃爍動畫每輪結束時隨機變換
  const [slotWords, setSlotWords] = useState<string[]>(() =>
    positions.map((p) => p.text),
  );
  useEffect(() => {
    setSlotWords(positions.map((p) => p.text));
  }, [positions]);

  // hover 期間，照片快速、隨機變換（取「當前作用中計畫」displayedIndex 的照片）
  const currentPhotoCount = photosByShape[displayedIndex]?.length ?? 0;
  useEffect(() => {
    if (hovered === null || currentPhotoCount < 2) return;
    const id = window.setInterval(() => {
      setPhotoIdx((prev) => {
        let next = prev;
        while (next === prev) {
          next = Math.floor(Math.random() * currentPhotoCount);
        }
        return next;
      });
    }, PHOTO_INTERVAL);
    return () => window.clearInterval(id);
  }, [hovered, currentPhotoCount]);

  // 卸載時清除旋轉動畫
  useEffect(() => {
    const anims = animRefs.current;
    return () => anims.forEach((a) => a?.cancel());
  }, []);

  /** 開始順時針快速旋轉（自目前角度無縫接續） */
  const startSpin = (i: number) => {
    const el = spinRefs.current[i];
    if (!el || prefersReducedMotion()) return;
    const from = currentRotationDeg(el);
    animRefs.current[i]?.cancel();
    animRefs.current[i] = el.animate(
      [
        { transform: `rotate(${from}deg)` },
        { transform: `rotate(${from + 360}deg)` },
      ],
      { duration: SPIN_PERIOD, iterations: Infinity, easing: 'linear' },
    );
  };

  /** 移開後：逆時針反轉，初速約為順轉的 2 倍（明顯但不暴衝），再減速停住 */
  const releaseSpin = (i: number) => {
    const el = spinRefs.current[i];
    if (!el || prefersReducedMotion()) return;
    const from = currentRotationDeg(el);
    animRefs.current[i]?.cancel();
    animRefs.current[i] = el.animate(
      [
        { transform: `rotate(${from}deg)` },
        { transform: `rotate(${from - RELEASE_DEG}deg)` },
      ],
      {
        duration: RELEASE_DURATION,
        // 初速適中（約順轉 2 倍、明顯反轉但不暴衝）、末段減速到停，無硬反轉急甩。
        easing: 'cubic-bezier(0.4, 0.6, 0.5, 1)',
        fill: 'forwards',
      },
    );
  };

  const handleEnter = (i: number) => {
    setHovered(i);
    const count = photosByShape[displayedIndex]?.length ?? 0;
    if (count) {
      setPhotoIdx(Math.floor(Math.random() * count));
    }
    startSpin(i);
  };

  const handleLeave = (i: number) => {
    setHovered((h) => (h === i ? null : h));
    releaseSpin(i);
  };

  const driftState = hovered !== null ? 'paused' : 'running';

  return (
    <Box
      sx={{
        position: 'relative',
        width: '100%',
        // 與 Figma frame 寬度一致（1440），所有 leftPct/topPct 對齊設計稿原座標
        maxWidth: 1440,
        mx: 'auto',
        // 直向佈局較高；橫向 ≥834px 為 620（對齊 Figma hero 區段 y=130~750 約 620 高）
        height: vertical ? 660 : 440,
        [portalTokens.mq.tabletUp]: { height: 620 },
        // 裝飾文字閃爍動畫 — 淡入、停留、淡出後變換詞彙
        '@keyframes portalTwinkle': {
          '0%, 100%': { opacity: 0 },
          '16%, 62%': { opacity: 1 },
          '86%': { opacity: 0 },
        },
        // 只在父層提供 base opacity；animation shorthand 留給 span 自己設，
        // 否則此 selector specificity (0,2,0) 會壓過 span sx 的 (0,1,0)，把
        // animation-name 鎖死成單一 'portalTwinkle'，導致 portalLabelEntrance
        // 永遠不會跑（橫向「散→聚」入場失效）。
        '& .portal-twinkle': {
          opacity: 0,
        },
        // ── 裝飾文字入場 — left 百分比從外側收回到最終位置 ──
        // 用 left（layout 屬性）而非 transform，避免建立 stacking context
        // 而破壞 mix-blend-mode（base labels 已踩過這個坑）。
        // 每個文字透過 --init-left / --final-left CSS var 給自己的起點與終點。
        // opacity 不在這支動畫處理，避免與 twinkle 撞 property 而互蓋；
        // 第一影格全部可見的需求由 twinkle 的 delay 範圍保證（見下）。
        '@keyframes portalLabelEntrance': {
          from: { left: 'var(--init-left)' },
          to: { left: 'var(--final-left)' },
        },
        '@media (prefers-reduced-motion: reduce)': {
          '& .portal-twinkle': { animation: 'none', opacity: 0.9 },
        },
      }}
    >
      {/* 三圖形組合的橘色色塊（純裝飾，對螢幕報讀器隱藏） */}
      <Box
        component="svg"
        aria-hidden="true"
        focusable="false"
        viewBox={`0 0 ${view.viewW} ${view.viewH}`}
        preserveAspectRatio="xMidYMid meet"
        sx={{
          position: 'absolute',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          ...(vertical
            ? { height: '94%', width: 'auto' }
            : {
                // SVG 100% 撐滿 Box，viewBox 直接對齊 Figma 1440-wide canvas，blob 落點精準
                width: '100%',
                height: 'auto',
              }),
          // ── 漂移動畫 — 三圖形以不同週期緩慢位移，goo 濾鏡使其靠近時相連 ──
          '& .drift-0': { animation: 'portalDriftA 12s ease-in-out infinite' },
          '& .drift-1': { animation: 'portalDriftB 9.5s ease-in-out infinite' },
          '& .drift-2': {
            animation: 'portalDriftC 13.5s ease-in-out infinite',
          },
          '& .drift-0, & .drift-1, & .drift-2': {
            animationPlayState: driftState,
          },
          '@keyframes portalDriftA': {
            '0%, 100%': { transform: 'translate(0px, 0px)' },
            '50%': { transform: 'translate(-54px, -12px)' },
          },
          '@keyframes portalDriftB': {
            '0%, 100%': { transform: 'translate(0px, 0px)' },
            '50%': { transform: 'translate(8px, 18px)' },
          },
          '@keyframes portalDriftC': {
            '0%, 100%': { transform: 'translate(0px, 0px)' },
            '50%': { transform: 'translate(56px, -8px)' },
          },
          // ── 主視覺入場動畫 ──
          // 左 blob 從 -300 滑入、右 blob 從 +300 滑入、中 blob 微縮放定位，
          // 三圖形同時往中央壓縮形成 metaball 連體，模擬「散→聚」的入場。
          // duration 從 1.46s → 2.4s（中 blob 比例調至 1.95s）放慢收縮節奏，
          // 與文字 entrance（見 portalLabelEntrance 套用處）同步。
          '& .entrance-0': {
            animation:
              'portalHeroEntranceLeft 2.4s cubic-bezier(0.22, 1, 0.36, 1) both',
          },
          '& .entrance-1': {
            animation:
              'portalHeroEntranceMid 1.95s cubic-bezier(0.22, 1, 0.36, 1) 0.1s both',
          },
          '& .entrance-2': {
            animation:
              'portalHeroEntranceRight 2.4s cubic-bezier(0.22, 1, 0.36, 1) both',
          },
          '@keyframes portalHeroEntranceLeft': {
            '0%': { transform: 'translateX(-300px)', opacity: 0 },
            '40%': { opacity: 1 },
            '100%': { transform: 'translateX(0)', opacity: 1 },
          },
          '@keyframes portalHeroEntranceMid': {
            '0%': { transform: 'scale(0.92)', opacity: 0 },
            '40%': { opacity: 1 },
            '100%': { transform: 'scale(1)', opacity: 1 },
          },
          '@keyframes portalHeroEntranceRight': {
            '0%': { transform: 'translateX(300px)', opacity: 0 },
            '40%': { opacity: 1 },
            '100%': { transform: 'translateX(0)', opacity: 1 },
          },
          '@media (prefers-reduced-motion: reduce)': {
            '& [class*="drift-"]': { animation: 'none' },
            '& [class*="entrance-"]': { animation: 'none' },
          },
        }}
      >
        <defs>
          <linearGradient
            id={`blob-${uid}`}
            gradientUnits="userSpaceOnUse"
            x1="0"
            y1="0"
            x2={vertical ? 0 : view.viewW}
            y2={vertical ? view.viewH : 0}
          >
            <stop offset="0%" stopColor={portalTokens.color.blobOrangeFrom} />
            <stop offset="44%" stopColor={portalTokens.color.blobOrangeTo} />
            <stop offset="74%" stopColor={portalTokens.color.blobGrey} />
            <stop offset="100%" stopColor="#E6E6E6" />
          </linearGradient>
          {shapes.map((s, i) => (
            <clipPath key={i} id={`clip-${uid}-${i}`}>
              {/* 此多邊形為「外框遮罩」，hover 時旋轉的就是它（照片本身不轉） */}
              <polygon
                points={s.points}
                ref={(el) => {
                  spinRefs.current[i] = el;
                }}
                style={{
                  transformBox: 'view-box',
                  transformOrigin: `${s.cx}px ${s.cy}px`,
                }}
              />
            </clipPath>
          ))}
        </defs>

        {/* 漸層色塊層 — 三圖以同一漸層重疊相連（依設計稿：邊緣清晰鋸齒、色塊間
            自然凹陷，非液態橋接，故不套 goo 濾鏡，讓圖塊與 hover 露出的照片
            邊緣形狀完全一致）。hover 的圖形隱藏漸層底以露出照片。
            外層 .entrance-{i} 負責入場動畫，內層 .drift-{i} 負責環境漂移。 */}
        <g>
          {shapes.map((s, i) => (
            <g
              key={i}
              className={`entrance-${i}`}
              style={{ transformOrigin: `${s.cx}px ${s.cy}px` }}
            >
              <g className={`drift-${i}`}>
                <polygon
                  points={s.points}
                  fill={`url(#blob-${uid})`}
                  style={{
                    opacity: hovered === i ? 0 : 1,
                    transition: 'opacity 0.35s ease',
                  }}
                />
              </g>
            </g>
          ))}
        </g>

        {/* 照片 + hover 感測層 — 跟隨漂移與入場；hover 時遮罩（clipPath）旋轉、照片本身維持正立不轉。
            三塊都取「當前作用中計畫」（displayedIndex）的照片、各塊以 +i 取不同張；
            只有游標 hover 的那一塊才把照片顯示出來。 */}
        {shapes.map((s, i) => {
          const currentPhotos = photosByShape[displayedIndex];
          const photo = currentPhotos.length
            ? currentPhotos[(photoIdx + i) % currentPhotos.length]
            : undefined;
          const isHovered = hovered === i;
          return (
            <g
              key={i}
              className={`entrance-${i}`}
              style={{ transformOrigin: `${s.cx}px ${s.cy}px` }}
            >
              <g className={`drift-${i}`}>
                {photo && (
                  <image
                    href={photo}
                    x={s.cx - s.r}
                    y={s.cy - s.r}
                    width={s.r * 2}
                    height={s.r * 2}
                    preserveAspectRatio="xMidYMid slice"
                    clipPath={`url(#clip-${uid}-${i})`}
                    style={{
                      opacity: isHovered ? 1 : 0,
                      transition: 'opacity 0.4s ease',
                      pointerEvents: 'none',
                    }}
                  />
                )}
                <polygon
                  points={s.points}
                  fill="transparent"
                  onMouseEnter={() => handleEnter(i)}
                  onMouseLeave={() => handleLeave(i)}
                  style={{ cursor: photo ? 'pointer' : 'default' }}
                />
              </g>
            </g>
          );
        })}
      </Box>

      {/* 色塊周圍的裝飾文字 — 白字 + difference，閃爍淡入淡出並隨機變換詞彙。
          橫向：上下兩排（中文直書、英文 −90°）；直向：左右兩欄、正立橫書。
          入場：left 從外側 (50 + (leftPct-50)*1.5) 收回到 leftPct，與 blob 同步壓縮；
          twinkle 同時跑 infinite，opacity 隨閃爍變化、入場過程文字依然可見且在移動。 */}
      {positions.map((pos, i) => {
        const dur = 4.6 + ((i * 1.73) % 3.6);
        // twinkle keyframes 在 cycle 的 16%~62% 區間 opacity=1。將 delay 設成
        // 「該 label 自身 dur 的 0.20~0.60 倍」的負值，等於把 t=0 的播放相位
        // 固定在 [20%, 60%] → 所有 label 第一影格全部可見（對齊設計稿
        // 「裝飾文字平均散落」）。各 label 相位仍因 i 而錯開，後續閃爍節奏不變。
        const delay = -(0.2 + ((i * 0.151) % 0.4)) * dur;
        // 入場 left 起點：依設計稿第一影格「平均散落」— 上排 15 個從 5% 到 95%
        // 均分、下排 13 個同 5% 到 95% 均分。動畫終點為 Figma 不規則 cluster 位置，
        // 使得入場過程呈現「平均散布 → 壓縮環繞 blob」的視覺。
        const isTopRow = i < 15;
        const rowIdx = isTopRow ? i : i - 15;
        const rowCount = isTopRow ? 15 : 13;
        const initLeftPct = vertical
          ? pos.leftPct
          : 5 + (rowIdx / Math.max(1, rowCount - 1)) * 90;
        const word = slotWords[i] ?? pos.text;
        // 含中日韓字元 → 直書；否則為英文 → 旋轉 −90°（僅橫向佈局）
        const isCJK = /[\u3000-\u9fff\uff00-\uffef]/.test(word);
        return (
          <Box
            key={i}
            component="span"
            className="portal-twinkle"
            aria-hidden
            onAnimationIteration={() => {
              // 直向（手機 / 平板）：詞數與槽數一對一，換任一詞都會與其他槽
              // 重複，故只保留 opacity 閃爍、不換詞，讓兩側國名維持各自唯一、
              // 依序排列（對齊設計稿乾淨的清單）。
              if (vertical) return;
              setSlotWords((prev) => {
                // 換詞時從「目前作用中計畫」的詞池取（整片雲同一計畫）
                if (pool.length === 0) return prev;
                // 避開相鄰 slot 已有的詞 + 自己當前的詞，避免肉眼可見的重複叢集
                const blocked = new Set<string>();
                blocked.add(prev[i] ?? '');
                if (!vertical) {
                  for (let j = 0; j < prev.length; j++) {
                    if (areSlotsAdjacent(i, j) && prev[j]) blocked.add(prev[j]);
                  }
                }
                const candidates = pool.filter((w) => !blocked.has(w));
                const wordPool = candidates.length > 0 ? candidates : pool;
                const next = [...prev];
                next[i] =
                  wordPool[Math.floor(Math.random() * wordPool.length)] ?? '';
                return next;
              });
            }}
            style={
              vertical
                ? {
                    animationDuration: `${dur.toFixed(2)}s`,
                    animationDelay: `${delay.toFixed(2)}s`,
                  }
                : ({
                    // 兩支動畫：portalTwinkle (opacity) + portalLabelEntrance (left)
                    // entrance 2.4s 與三個 blob entrance 同步
                    animationDuration: `${dur.toFixed(2)}s, 2.4s`,
                    animationDelay: `${delay.toFixed(2)}s, 0s`,
                    ['--init-left' as string]: `${initLeftPct.toFixed(2)}%`,
                    ['--final-left' as string]: `${pos.leftPct.toFixed(2)}%`,
                  } as React.CSSProperties)
            }
            sx={{
              position: 'absolute',
              top: `${pos.topPct}%`,
              ...(vertical
                ? {
                    // 直向：靠左／右欄，正立橫書（保留垂直置中對齊）
                    ...(pos.side === 'left'
                      ? { left: `${pos.leftPct}%` }
                      : {
                          right: `${100 - pos.leftPct}%`,
                          textAlign: 'right',
                        }),
                    transform: 'translateY(-50%)',
                    // 直向只跑 twinkle（無 entrance 入場動畫）。父層已移除
                    // animation shorthand，這裡必須補齊 name/timing/iteration。
                    animationName: 'portalTwinkle',
                    animationTimingFunction: 'ease-in-out',
                    animationIterationCount: 'infinite',
                    '@media (prefers-reduced-motion: reduce)': {
                      animationName: 'none',
                    },
                  }
                : {
                    // 橫向：對齊 Figma — topPct 為 text bbox 的「上緣」，
                    // 故只水平置中、垂直頂端錨定，讓 strip 由錨點向下生長。
                    left: `${pos.leftPct}%`,
                    ...(isCJK
                      ? {
                          writingMode: 'vertical-rl',
                          transform: 'translateX(-50%)',
                        }
                      : {
                          transform: 'translateX(-50%) rotate(-90deg)',
                          transformOrigin: 'center top',
                        }),
                    // 兩支動畫同時跑：twinkle 控 opacity，entrance 控 left
                    animationName: 'portalTwinkle, portalLabelEntrance',
                    animationTimingFunction:
                      'ease-in-out, cubic-bezier(0.22, 1, 0.36, 1)',
                    animationIterationCount: 'infinite, 1',
                    animationFillMode: 'none, both',
                    '@media (prefers-reduced-motion: reduce)': {
                      animationName: 'none',
                    },
                  }),
              fontSize: 12.5,
              fontWeight: 500,
              letterSpacing: '0.02em',
              whiteSpace: 'nowrap',
              pointerEvents: 'none',
              color: '#ffffff',
              mixBlendMode: 'difference',
            }}
          >
            {word}
          </Box>
        );
      })}

      {/* 底部固定標語 — 對齊 Figma 1:38 / 1:39 / 1:40：
          - 左塊（regular）：ART x DESIGN / Gateway（兩行）
          - 中塊（bold）：Taiwan（一行，粗體強調）
          - 右塊（regular）：台灣的創造力，（左）/ 走向世界（右靠縮進）
          三塊以絕對定位精準錨點，而非 space-between，避免被視口寬度均勻拉開；
          top-aligned 讓第二行自然下沉，產生高低錯落。
          Vertical 直向佈局仍是兩欄堆疊（左頂 + 右底），手機版邏輯不變。 */}
      {vertical ? (
        <>
          <Box
            aria-hidden
            sx={{
              position: 'absolute',
              left: '5%',
              bottom: 16,
              display: 'flex',
              flexDirection: 'column',
              gap: 0.5,
              pointerEvents: 'none',
            }}
          >
            {BASE_LABEL_GROUPS[0].lines.map((line) => (
              <Box
                key={line.text}
                component="span"
                sx={{
                  fontSize: 15,
                  fontWeight: 600,
                  whiteSpace: 'nowrap',
                  color: '#ffffff',
                  mixBlendMode: 'difference',
                }}
              >
                {line.text}
              </Box>
            ))}
          </Box>
          <Box
            aria-hidden
            sx={{
              position: 'absolute',
              right: '5%',
              bottom: 16,
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'flex-end',
              gap: 0.5,
              pointerEvents: 'none',
            }}
          >
            {BASE_LABEL_GROUPS[2].lines.map((line) => (
              <Box
                key={line.text}
                component="span"
                sx={{
                  fontSize: 15,
                  fontWeight: 600,
                  whiteSpace: 'nowrap',
                  color: '#ffffff',
                  mixBlendMode: 'difference',
                  alignSelf: line.align === 'end' ? 'flex-end' : 'flex-start',
                }}
              >
                {line.text}
              </Box>
            ))}
          </Box>
        </>
      ) : (
        <Box
          aria-hidden
          sx={{
            position: 'absolute',
            left: 0,
            right: 0,
            bottom: 8,
            // 容器自身只承載絕對定位的三塊；高度由內容決定。
            // 不掛入場動畫：opacity / transform / filter / will-change 等任何能
            // 觸發 stacking context 的屬性都會讓子節點的 mix-blend-mode
            // 失效（label 文字會直接顯示為 #fff 白色而非與背景做 difference 混色）。
            // 故 base labels 直接隨頁面出現，由 blob 入場帶動視覺重心。
            pointerEvents: 'none',
          }}
        >
          {/* 左塊：ART x DESIGN / Gateway — regular weight (400)
              Figma 1:39 x=412/1440 = 28.6% */}
          <Box
            sx={{
              position: 'absolute',
              left: '28.6%',
              top: 0,
              display: 'flex',
              flexDirection: 'column',
              lineHeight: 1.2,
            }}
          >
            {['ART x DESIGN', 'Gateway'].map((line) => (
              <Box
                key={line}
                component="span"
                sx={{
                  fontSize: 15,
                  fontWeight: 400,
                  whiteSpace: 'nowrap',
                  color: '#ffffff',
                  mixBlendMode: 'difference',
                }}
              >
                {line}
              </Box>
            ))}
          </Box>

          {/* 中塊：Taiwan — bold (700)，獨立浮於上層產生高低落差
              Figma 1:40 x=567/1440 = 39.4% */}
          <Box
            component="span"
            sx={{
              position: 'absolute',
              left: '39.4%',
              top: 0,
              fontSize: 15,
              fontWeight: 700,
              whiteSpace: 'nowrap',
              color: '#ffffff',
              mixBlendMode: 'difference',
              lineHeight: 1.2,
            }}
          >
            Taiwan
          </Box>

          {/* 右塊：台灣的創造力，/ 走向世界 — 對齊 Figma 1:38
              x=805/1440 = 55.9% 至 x=1028/1440 = 71.4%（right edge）
              即 left=55.9%, right=28.6% from container right */}
          <Box
            sx={{
              position: 'absolute',
              left: '55.9%',
              right: '28.6%',
              top: 0,
              display: 'flex',
              flexDirection: 'column',
              lineHeight: 1.2,
            }}
          >
            <Box
              component="span"
              sx={{
                alignSelf: 'flex-start',
                fontSize: 15,
                fontWeight: 400,
                whiteSpace: 'nowrap',
                color: '#ffffff',
                mixBlendMode: 'difference',
              }}
            >
              台灣的創造力，
            </Box>
            <Box
              component="span"
              sx={{
                alignSelf: 'flex-end',
                fontSize: 15,
                fontWeight: 400,
                whiteSpace: 'nowrap',
                color: '#ffffff',
                mixBlendMode: 'difference',
              }}
            >
              走向世界
            </Box>
          </Box>
        </Box>
      )}
    </Box>
  );
}
