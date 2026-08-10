'use client';

import {
  useCallback,
  useEffect,
  useId,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
} from 'react';

import Box from '@mui/material/Box';

import type { LocalizedText } from '@/types/plan';

import { portalTokens } from '../../tokens';

/** SSR 安全的 layout effect（伺服器端退回 useEffect，避免 useLayoutEffect 警告） */
const useIsoLayoutEffect =
  typeof window !== 'undefined' ? useLayoutEffect : useEffect;

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
    lines: [{ text: 'ART x DESIGN' }, { text: 'GATEWAY' }],
  },
  {
    position: 'center',
    lines: [{ text: 'Taiwan' }],
  },
  {
    position: 'end',
    lines: [{ text: '臺灣的創造力' }, { text: '走向世界', align: 'end' }],
  },
];

/** hover 時照片隨機變換的間隔（ms） */
const PHOTO_INTERVAL = 1700;
/** hover 旋轉一圈的時間（ms）— 順時針 */
const SPIN_PERIOD = 3500;
/** 游標移開後的逆時針減速時間（ms） */
const RELEASE_DURATION = 1300;
/** 游標移開後逆時針再轉的角度（度）— 夠明顯但不過度甩轉 */
const RELEASE_DEG = 330;

/**
 * 計畫切換的「緩衝過場」：新計畫的字逐字淡入（數量漸增）、舊計畫的字留在原位逐字
 * 淡出（數量漸減），兩者各自依序錯開，形成有緩衝感的接力切換。
 */
/** 一組字依序淡入／淡出的錯開跨度（s） */
const WORD_STAGGER_S = 0.55;
/** 舊計畫單字淡出時長（s） */
const WORD_FADE_OUT_S = 0.5;
/** 新計畫單字淡入時長（s） */
const WORD_FADE_IN_S = 0.72;
/** 切換時降到低透明度後接續換字，避免畫面完全空掉造成閃爍感。 */
const WORD_SWAP_OPACITY = 0.18;
/** 過場總長（ms）：錯開跨度 + 單字淡出後，移除淡出層 */
const WORD_TRANSITION_MS =
  (WORD_STAGGER_S + Math.max(WORD_FADE_OUT_S, WORD_FADE_IN_S)) * 1000 + 50;

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
 * 三種佈局（對應三斷點）：
 * - h 橫向（≥1200px 桌機）：三圖左中右並排（依 Figma 1:2 原座標）。
 *   viewBox 1440x620 對齊 Figma frame 寬 1440 + hero section 約 620 高（y=130~750）。
 *   centers cy=275 對齊 Figma blob 中心 y=405、相對 hero 頂部 130 偏移 275。
 *   三 blob 中心間距 216（重疊 152px），形成設計稿的緊密 metaball 連體。
 * - t 直向（834–1199px 平板）：三圖上中下堆疊（依平板稿 node 43:1142）。
 *   viewBox 834×1278 對齊 frame 寬 834；Union x=167 寬 493（置中、約 59% 寬），
 *   三星中心 cy≈277 / 642 / 1031、半徑 246.7。色塊比手機版更窄、更拉長、頂端留白。
 * - v 直向（<834px 手機）：三圖上中下堆疊（依手機稿 node 43:396）。
 *   frame 寬 402、Union x=19 寬 365.5（幾乎填滿寬），三星中心 cy≈185 / 456 / 744
 *   讓第一個色塊完整露出，第二個色塊開始承接裝飾字，半徑 ~183（沿用 SHAPE_R）。
 */
const LAYOUT = {
  h: {
    viewW: 1440,
    viewH: 620,
    r: SHAPE_R,
    centers: [
      { cx: 513, cy: 275 },
      { cx: 729, cy: 275 },
      { cx: 947, cy: 275 },
    ],
  },
  t: {
    viewW: 834,
    viewH: 1278,
    r: 246.7,
    centers: [
      { cx: 414, cy: 277 },
      { cx: 414, cy: 642 },
      { cx: 414, cy: 1031 },
    ],
  },
  v: {
    viewW: 402,
    viewH: 929,
    r: SHAPE_R,
    centers: [
      { cx: 201, cy: 185 },
      { cx: 201, cy: 456 },
      { cx: 201, cy: 744 },
    ],
  },
} as const;

const SHAPE_LABEL_COLOR = '#E3E3E3';
const DECORATIVE_WORD_COLOR = '#A6A6A6';

const DESKTOP_SHAPE_LABELS = [
  [
    { x: 492, y: 228 },
    { x: 460, y: 246 },
  ],
  [
    { x: 764, y: 261 },
    { x: 728.33, y: 248 },
  ],
  [
    { x: 954, y: 218 },
    { x: 926, y: 240 },
  ],
] as const;

const STACKED_SHAPE_LABELS = {
  t: [
    [
      { x: 364, y: 260 },
      { x: 392, y: 296 },
    ],
    [
      { x: 364, y: 624 },
      { x: 392, y: 660 },
    ],
    [
      { x: 324, y: 1013 },
      { x: 354, y: 1049 },
    ],
  ],
  v: [
    [
      { x: 150, y: 171 },
      { x: 176, y: 199 },
    ],
    [
      { x: 151, y: 442 },
      { x: 177, y: 470 },
    ],
    [
      { x: 127, y: 730 },
      { x: 155, y: 758 },
    ],
  ],
} as const;

/** 佈局模式：h=桌機橫向、t=平板直向、v=手機直向 */
type LayoutMode = keyof typeof LAYOUT;

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
function buildShapes(mode: LayoutMode) {
  const L = LAYOUT[mode];
  return SHAPE_META.map((m, i) => {
    const s: ShapeDef = { ...m, ...L.centers[i], r: L.r };
    return { ...s, points: shapePoints(s) };
  });
}

interface PlacedWord {
  text: string;
  /** 橫向：百分比錨點；直向：所屬欄（左／右） */
  leftPct: number;
  topPct: number;
  side: 'left' | 'right';
  /** 補齊用的隱藏佔位（詞數少於最大值時常駐但不顯示） */
  hidden?: boolean;
}

/**
 * 橫向（≥834px）hero 文字 strip 的座標 —「自然散落、環繞色塊」。文字為垂直字條
 * （中文 vertical-rl、英文 rotate -90°），沿色塊群外圍繞一圈散布：上緣、右側、
 * 下緣、左側。leftPct 與 topPct 都帶不規則變化（非整齊兩排），但相鄰仍保持足夠
 * 間距避免字條相疊。陣列順序沿外圈順時針排列，故文字數較少時取均勻子集仍能環繞。
 * leftPct 為 1440 寬 canvas 的 x 百分比；topPct 為 hero 區 620 高的 y 百分比。
 */
const HORIZONTAL_TEXT_SLOTS: { leftPct: number; topPct: number }[] = [
  // 上緣（由左而右）— topPct 不規則起伏
  { leftPct: 25, topPct: 7 },
  { leftPct: 31, topPct: 3 },
  { leftPct: 38, topPct: 11 },
  { leftPct: 45, topPct: 5 },
  { leftPct: 51, topPct: 9 },
  { leftPct: 58, topPct: 2 },
  { leftPct: 64, topPct: 8 },
  { leftPct: 70, topPct: 4 },
  { leftPct: 76, topPct: 10 },
  // 右側（由上而下）
  { leftPct: 83, topPct: 18 },
  { leftPct: 89, topPct: 31 },
  { leftPct: 95, topPct: 47 },
  { leftPct: 86, topPct: 60 },
  // 下緣（由右而左）— topPct 不規則起伏
  { leftPct: 78, topPct: 76 },
  { leftPct: 72, topPct: 82 },
  { leftPct: 66, topPct: 74 },
  { leftPct: 59, topPct: 81 },
  { leftPct: 53, topPct: 83 },
  { leftPct: 47, topPct: 75 },
  { leftPct: 40, topPct: 82 },
  { leftPct: 34, topPct: 77 },
  { leftPct: 28, topPct: 83 },
  // 左側（由下而上）
  { leftPct: 14, topPct: 64 },
  { leftPct: 6, topPct: 50 },
  { leftPct: 13, topPct: 36 },
  { leftPct: 4, topPct: 24 },
  { leftPct: 18, topPct: 46 },
  { leftPct: 9, topPct: 18 },
];

/**
 * 將「目前作用中計畫」的裝飾文字散佈於色塊周圍（整片雲為同一計畫）。
 * - 橫向：每個字「只出現一組」（不重複、不 cycle 補滿）。文字數少於 slot 數時，
 *   取均勻分布的 slot 子集，讓較少的字仍分散整個畫面、不擠在一側。
 * - 直向：左右兩欄、沿色塊兩側由上而下（正立橫書）。
 */
function placeWords(words: string[], mode: LayoutMode): PlacedWord[] {
  if (mode !== 'h') {
    const startPct = mode === 'v' ? 66 : 48;
    const spreadPct = mode === 'v' ? 30 : 42;
    const leftCount = Math.ceil(words.length / 2);
    return words.map((text, i) => {
      const onLeft = i < leftCount;
      const idx = onLeft ? i : i - leftCount;
      const len = onLeft ? leftCount : Math.max(1, words.length - leftCount);
      const t = len <= 1 ? 0.5 : idx / (len - 1);
      return {
        text,
        leftPct: onLeft ? 5 : 95,
        topPct: startPct + t * spreadPct,
        side: onLeft ? 'left' : 'right',
      };
    });
  }
  if (words.length === 0) return [];
  const slotCount = HORIZONTAL_TEXT_SLOTS.length;
  const count = Math.min(words.length, slotCount);
  return Array.from({ length: count }, (_, i) => {
    // 取均勻分布的 slot 索引，讓不足 slot 數的字仍散落整個寬度
    const slot = HORIZONTAL_TEXT_SLOTS[Math.floor((i * slotCount) / count)];
    return {
      text: words[i] ?? '',
      leftPct: slot.leftPct,
      topPct: slot.topPct,
      side: 'left',
    };
  });
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
  /** 色塊未 hover 時顯示的計畫名稱（桌機直式雙欄，小畫面橫式雙行） */
  label?: string[];
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

  // hover 某色塊時，該色塊翻出「該色塊計畫」的照片（照片仍隨 hover 顯示）。
  const displayedIndex = hovered ?? defaultIndex;

  // 整片雲的裝飾文字：hover 某色塊時切換為該色塊計畫的詞；非 hover 時跟隨
  // 上層目前計畫 defaultIndex，讓自動／捲動切換能完整輪到每一組裝飾文字。
  const textIndex = hovered ?? defaultIndex;

  // 各色塊對應計畫的照片陣列（index 對應色塊 = 計畫）。
  const photosByShape = useMemo(
    () => [0, 1, 2].map((i) => shapeContents[i]?.photos ?? []),
    [shapeContents],
  );

  // 佈局模式判斷 — SSR 與首次 client render 皆為桌機橫向（h），掛載後再依視窗校正，
  // 避免 hydration 不一致。<834=手機(v)、834–1199=平板(t)、≥1200=桌機(h)。
  const [mode, setMode] = useState<LayoutMode>('h');
  useEffect(() => {
    const mqMobile = window.matchMedia('(max-width:833.95px)');
    const mqDesktop = window.matchMedia('(min-width:1200px)');
    const update = () =>
      setMode(mqMobile.matches ? 'v' : mqDesktop.matches ? 'h' : 't');
    update();
    mqMobile.addEventListener('change', update);
    mqDesktop.addEventListener('change', update);
    return () => {
      mqMobile.removeEventListener('change', update);
      mqDesktop.removeEventListener('change', update);
    };
  }, []);
  // 平板與手機共用直向版型（標語兩欄堆疊、文字左右兩側）；桌機才橫向。
  const vertical = mode !== 'h';

  const shapes = useMemo(() => buildShapes(mode), [mode]);
  const view = LAYOUT[mode];

  /** 各圖形外框遮罩多邊形的 DOM 參照與目前旋轉動畫 */
  const spinRefs = useRef<(SVGPolygonElement | null)[]>([null, null, null]);
  const animRefs = useRef<(Animation | null)[]>([null, null, null]);

  // 各計畫詞數最大值 — 用來固定渲染的 span 數量。三計畫詞數不同，若依當前詞數
  // 增減 span，切換計畫時新掛載的 span 會重跑入場動畫（left 由外往內位移），
  // 造成只有某些色塊出現「左到右」位移、行為不一致。固定為最大詞數常駐後，
  // hover 只更新文字／位置／顯隱，入場動畫只在首次載入跑一次。
  const maxWords = useMemo(
    () => Math.max(1, ...shapeContents.map((c) => c?.words?.length ?? 0)),
    [shapeContents],
  );

  // 某計畫的裝飾文字散布位置。每個字只出現一組、不重複；詞數少於 maxWords 時以隱藏
  // 佔位補齊到固定長度（沿用最後一個位置、visibility 控制顯隱）。供「進場層」與
  // 「淡出層」共用（各帶不同的計畫 index）。
  const buildPositions = useCallback(
    (idx: number): PlacedWord[] => {
      const texts = (shapeContents[idx]?.words ?? [])
        .map((w) => (language === 'en' ? (w.en ?? w.zh) : (w.zh ?? w.en)))
        .filter((t): t is string => Boolean(t));
      const placed = placeWords(texts, mode);
      if (placed.length >= maxWords) return placed;
      const anchor = placed[placed.length - 1] ?? {
        leftPct: 50,
        topPct: 50,
        side: 'left' as const,
      };
      const padded = Array.from({ length: maxWords - placed.length }, () => ({
        text: '',
        leftPct: anchor.leftPct,
        topPct: anchor.topPct,
        side: anchor.side,
        hidden: true,
      }));
      return [...placed, ...padded];
    },
    [shapeContents, language, mode, maxWords],
  );

  // 計畫切換的緩衝過場：transFrom = 正在淡出的（前一個）計畫；transId 每次切換遞增，
  // 用於 key 讓新計畫的字 span 重新掛載、重跑「逐字淡入」。初次載入不觸發；
  // 後續不論 hover、輪播 defaultIndex 或 randomGroup 落定造成 textIndex 改變，都走過場。
  const [transFrom, setTransFrom] = useState<number | null>(null);
  const [transId, setTransId] = useState(0);
  const prevTextRef = useRef(textIndex);
  const transTimerRef = useRef<number | null>(null);
  useIsoLayoutEffect(() => {
    const fromText = prevTextRef.current;
    prevTextRef.current = textIndex;
    if (fromText === textIndex || prefersReducedMotion()) {
      return;
    }
    setTransFrom(fromText);
    setTransId((n) => n + 1);
    if (transTimerRef.current) window.clearTimeout(transTimerRef.current);
    transTimerRef.current = window.setTimeout(
      () => setTransFrom(null),
      WORD_TRANSITION_MS,
    );
  }, [hovered, textIndex]);
  useEffect(
    () => () => {
      if (transTimerRef.current) window.clearTimeout(transTimerRef.current);
    },
    [],
  );

  // 進場層（目前計畫）與淡出層（前一個計畫，過場期間才有）的字位置與可見字數。
  const positions = useMemo(
    () => buildPositions(textIndex),
    [buildPositions, textIndex],
  );
  const outgoingPositions = useMemo(
    () => (transFrom === null ? null : buildPositions(transFrom)),
    [buildPositions, transFrom],
  );
  const visibleCount = useMemo(
    () => positions.filter((p) => !p.hidden).length,
    [positions],
  );
  const outgoingVisibleCount = useMemo(
    () => outgoingPositions?.filter((p) => !p.hidden).length ?? 0,
    [outgoingPositions],
  );

  // hover 期間，照片依序輪換（取 hover 色塊對應計畫 displayedIndex 的照片）。
  // 進入 hover 時從第一張起、之後每隔 PHOTO_INTERVAL 循序播下一張、循環回第一張。
  const currentPhotoCount = photosByShape[displayedIndex]?.length ?? 0;
  useEffect(() => {
    if (hovered === null || currentPhotoCount < 2) return;
    setPhotoIdx(0);
    const id = window.setInterval(() => {
      setPhotoIdx((prev) => (prev + 1) % currentPhotoCount);
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

  /**
   * 渲染單一裝飾字。phase：
   *  - 'steady'：首載狀態 — twinkle 閃爍（一開始即可見）+ 橫向的入場 left 壓縮。
   *  - 'in'    ：切換後新計畫的字 — 依序錯開、由 opacity 0 淡入後續轉入 twinkle。
   *  - 'out'   ：切換後舊計畫的字 — 留在原位、依序錯開淡出後移除。
   * visibleCount = 該層可見字數，用來把錯開延遲平均分配（造成數量漸增／漸減）。
   * 動畫名／節奏放在 sx（讓 prefers-reduced-motion 能覆寫 animationName:none），
   * duration／delay／CSS 變數放 inline style。
   */
  const renderWord = (
    pos: PlacedWord,
    i: number,
    phase: 'steady' | 'in' | 'out',
    keyStr: string,
    visibleCount: number,
  ) => {
    const dur = 4.6 + ((i * 1.73) % 3.6);
    // steady：負延遲把 twinkle 相位固定在 opacity=1 區間，第一影格即可見。
    const steadyDelay = -(0.2 + ((i * 0.151) % 0.4)) * dur;
    // in／out：依序錯開（前面的先、後面的後），形成數量漸增／漸減。
    const frac =
      visibleCount > 1 ? Math.min(i, visibleCount - 1) / (visibleCount - 1) : 0;
    const stagger = frac * WORD_STAGGER_S;
    const initLeftPct = vertical ? pos.leftPct : 50 + (pos.leftPct - 50) * 1.5;
    const word = pos.text;
    // 含中日韓字元 → 直書；否則為英文 → 旋轉 −90°（僅橫向佈局）
    const isCJK = /[\u3000-\u9fff\uff00-\uffef]/.test(word);

    let animSx: Record<string, string | number>;
    let animStyle: React.CSSProperties;
    if (phase === 'out') {
      animSx = {
        animationName: 'portalWordFadeOut',
        animationTimingFunction: 'ease-in-out',
        animationIterationCount: 1,
        // fillMode both：延遲前維持可見（opacity 1）、結束後停在低透明度。
        animationFillMode: 'both',
      };
      animStyle = {
        animationDuration: `${WORD_FADE_OUT_S}s`,
        animationDelay: `${stagger.toFixed(2)}s`,
      };
    } else if (phase === 'in') {
      animSx = {
        animationName: 'portalWordFadeIn',
        animationTimingFunction: 'ease-in-out',
        animationIterationCount: 1,
        animationFillMode: 'both',
      };
      animStyle = {
        animationDuration: `${WORD_FADE_IN_S}s`,
        animationDelay: `${stagger.toFixed(2)}s`,
      };
    } else if (vertical) {
      animSx = {
        animationName: 'portalTwinkle',
        animationTimingFunction: 'ease-in-out',
        animationIterationCount: 'infinite',
      };
      animStyle = {
        animationDuration: `${dur.toFixed(2)}s`,
        animationDelay: `${steadyDelay.toFixed(2)}s`,
      };
    } else {
      animSx = {
        animationName: 'portalTwinkle, portalLabelEntrance',
        animationTimingFunction: 'ease-in-out, cubic-bezier(0.22, 1, 0.36, 1)',
        animationIterationCount: 'infinite, 1',
        animationFillMode: 'none, both',
      };
      animStyle = {
        animationDuration: `${dur.toFixed(2)}s, 2.4s`,
        animationDelay: `${steadyDelay.toFixed(2)}s, 0s`,
        ['--init-left' as string]: `${initLeftPct.toFixed(2)}%`,
        ['--final-left' as string]: `${pos.leftPct.toFixed(2)}%`,
      } as React.CSSProperties;
    }

    return (
      <Box
        key={keyStr}
        component="span"
        className="portal-twinkle"
        aria-hidden
        style={animStyle}
        sx={{
          position: 'absolute',
          top: `${pos.topPct}%`,
          ...(vertical
            ? {
                ...(pos.side === 'left'
                  ? { left: `${pos.leftPct}%` }
                  : { right: `${100 - pos.leftPct}%`, textAlign: 'right' }),
                transform: 'translateY(-50%)',
              }
            : {
                left: `${pos.leftPct}%`,
                ...(isCJK
                  ? {
                      writingMode: 'vertical-rl',
                      // 直書時讓夾在中文裡的拉丁字（如「X」連接號）維持正立，
                      // 而非預設 mixed 的側躺。
                      textOrientation: 'upright',
                      transform: 'translateX(-50%)',
                    }
                  : {
                      transform: 'translateX(-50%) rotate(-90deg)',
                      transformOrigin: 'center top',
                    }),
              }),
          ...animSx,
          '@media (prefers-reduced-motion: reduce)': { animationName: 'none' },
          visibility: pos.hidden ? 'hidden' : 'visible',
          fontSize: 12.5,
          // 裝飾性文字採 300（Light）— 較內文細一級，視覺更輕。
          fontWeight: 300,
          // 中文詞句夾雜的拉丁字（如「X」連接號）與中文同用 Noto Sans TC，
          // 避免依字族順序落到 Inter 而顯得比周圍中文更粗、更大。
          ...(isCJK
            ? {
                fontFamily:
                  'var(--font-noto-sans-tc, "Noto Sans TC"), sans-serif',
              }
            : {}),
          letterSpacing: '0.02em',
          whiteSpace: 'nowrap',
          pointerEvents: 'none',
          color: DECORATIVE_WORD_COLOR,
        }}
      >
        {word}
      </Box>
    );
  };

  return (
    <Box
      sx={{
        position: 'relative',
        width: '100%',
        // 桌機與 Figma frame 寬度一致（1440）；平板鎖 834（依設計稿 43:1142 的 frame 寬，
        // 置中後兩側留白），所有 leftPct/topPct 才對齊各自設計稿原座標。
        maxWidth: mode === 't' ? 834 : 1440,
        mx: 'auto',
        // 直向佈局高度對齊各自設計稿 hero 區：手機跟隨 viewBox 高度（色塊填滿寬、
        // 第一塊完整露出）、平板 1278（viewBox 834×1278，色塊置中約 59% 寬、頂端留白）；
        // 桌機橫向 620（對齊 Figma hero 區段 y=130~750 約 620 高）。
        height: mode === 'v' ? LAYOUT.v.viewH : mode === 't' ? 1278 : 440,
        [portalTokens.mq.desktopUp]: { height: 620, mt: '84px' },
        // 裝飾文字閃爍動畫 — 淡入、停留、淡出後變換詞彙
        '@keyframes portalTwinkle': {
          '0%, 100%': { opacity: 0 },
          '16%, 62%': { opacity: 1 },
          '86%': { opacity: 0 },
        },
        // 計畫切換時，舊句淡到低透明度；新句從同一低透明度淡回來。
        '@keyframes portalWordFadeOut': {
          from: { opacity: 1 },
          to: { opacity: WORD_SWAP_OPACITY },
        },
        '@keyframes portalWordFadeIn': {
          from: { opacity: WORD_SWAP_OPACITY },
          to: { opacity: 1 },
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
          ...(vertical
            ? {
                // 直向：SVG 填滿容器寬、靠頂對齊。手機版 viewBox 讓第一個色塊完整露出，
                // 裝飾文字從第二個色塊開始進場。
                top: 0,
                left: '50%',
                transform: 'translateX(-50%)',
                width: '100%',
                height: 'auto',
              }
            : {
                // 橫向：SVG 100% 撐滿 Box 並置中，viewBox 對齊 Figma 1440-wide canvas。
                top: '50%',
                left: '50%',
                transform: 'translate(-50%, -50%)',
                width: '100%',
                height: 'auto',
              }),
          // ── 漂移動畫 — 三圖形以不同週期緩慢位移、靠近時相連 ──
          // 延後 2.4s（= 入場時長）才開始：入場期間每個色塊只跑「入場位移」一個
          // transform，不和漂移疊加，減少重繪、讓壓縮更順。
          '& .drift-0': {
            animation: 'portalDriftA 12s ease-in-out 2.4s infinite',
          },
          '& .drift-1': {
            animation: 'portalDriftB 9.5s ease-in-out 2.4s infinite',
          },
          '& .drift-2': {
            animation: 'portalDriftC 13.5s ease-in-out 2.4s infinite',
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
          // 色塊「一開始就可見」（不從 opacity 0 淡入，避免重整時先消失一陣子），
          // 僅以位移 / 縮放從外側往中央壓縮（散→聚）。
          '@keyframes portalHeroEntranceLeft': {
            '0%': { transform: 'translateX(-300px)' },
            '100%': { transform: 'translateX(0)' },
          },
          '@keyframes portalHeroEntranceMid': {
            '0%': { transform: 'scale(0.92)' },
            '100%': { transform: 'scale(1)' },
          },
          '@keyframes portalHeroEntranceRight': {
            '0%': { transform: 'translateX(300px)' },
            '100%': { transform: 'translateX(0)' },
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
            <stop offset="76%" stopColor={portalTokens.color.blobPeach} />
            <stop offset="100%" stopColor={portalTokens.color.blobWarmGrey} />
          </linearGradient>
          {/* goo（metaball）濾鏡：先模糊再以 feColorMatrix 重新銳化 alpha，使三色塊
              重疊處自然相連成連體，消弭鄰塊邊界的明顯摺痕（依業主回饋：中／右色塊
              邊界感太明顯）；外緣輪廓大致維持。 */}
          <filter
            id={`goo-${uid}`}
            filterUnits="userSpaceOnUse"
            x="0"
            y="0"
            width={view.viewW}
            height={view.viewH}
            colorInterpolationFilters="sRGB"
          >
            <feGaussianBlur in="SourceGraphic" stdDeviation="9" result="blur" />
            <feColorMatrix
              in="blur"
              type="matrix"
              values="1 0 0 0 0  0 1 0 0 0  0 0 1 0 0  0 0 0 24 -10"
            />
          </filter>
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

        {/* 漸層色塊層 — 三圖以同一漸層重疊相連，並套 goo 濾鏡讓鄰塊重疊處自然融合
            （依業主回饋：中／右色塊邊界感太明顯）。hover 的圖形隱藏漸層底以露出照片。
            外層 .entrance-{i} 負責入場動畫，內層 .drift-{i} 負責環境漂移。 */}
        <g filter={`url(#goo-${uid})`}>
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
            每塊取「自身對應計畫」（photosByShape[i]）的照片，hover 時於該塊翻出（並隨
            photoIdx 在該計畫的照片組內輪換）；只有游標 hover 的那一塊才顯示照片。 */}
        {shapes.map((s, i) => {
          const currentPhotos = photosByShape[i];
          const photo = currentPhotos.length
            ? currentPhotos[photoIdx % currentPhotos.length]
            : undefined;
          const isHovered = hovered === i;
          const label = shapeContents[i]?.label?.slice(0, 2) ?? [];
          const desktopLabelPoints =
            DESKTOP_SHAPE_LABELS[i] ?? DESKTOP_SHAPE_LABELS[0];
          const stackedLabelPoints =
            mode === 'h'
              ? null
              : ((STACKED_SHAPE_LABELS[mode][i] ??
                  STACKED_SHAPE_LABELS[mode][0]) as readonly {
                  x: number;
                  y: number;
                }[]);
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
                {label.length > 0 && (
                  <g
                    aria-hidden="true"
                    style={{
                      opacity: isHovered ? 0 : 1,
                      transition: 'opacity 0.32s ease',
                      pointerEvents: 'none',
                    }}
                  >
                    {label.map((line, labelIndex) => {
                      const point = vertical
                        ? (stackedLabelPoints?.[labelIndex] ??
                          stackedLabelPoints?.[0])
                        : (desktopLabelPoints[labelIndex] ??
                          desktopLabelPoints[0]);
                      if (!point) return null;
                      return (
                        <text
                          key={line}
                          x={point.x}
                          y={point.y}
                          fill={SHAPE_LABEL_COLOR}
                          fontFamily='Inter, var(--font-noto-sans-tc, "Noto Sans TC"), sans-serif'
                          fontSize={vertical ? (mode === 't' ? 18 : 12) : 12.58}
                          fontWeight={400}
                          letterSpacing="0"
                          textAnchor={vertical ? 'start' : undefined}
                          dominantBaseline={vertical ? 'middle' : undefined}
                          style={{
                            writingMode:
                              mode === 'v' ? 'horizontal-tb' : 'vertical-rl',
                            textOrientation:
                              mode === 'v' ? undefined : 'upright',
                            textShadow: '0 1px 12px rgba(0, 0, 0, 0.16)',
                          }}
                        >
                          {line}
                        </text>
                      );
                    })}
                  </g>
                )}
                <polygon
                  points={s.points}
                  fill="transparent"
                  onMouseEnter={() => handleEnter(i)}
                  onMouseLeave={() => handleLeave(i)}
                  // 沿用頁面自訂 portal 游標，hover 色塊不改成 pointer 或系統預設。
                  style={{ cursor: 'inherit' }}
                />
              </g>
            </g>
          );
        })}
      </Box>

      {/* 色塊周圍的裝飾文字 — 切換計畫帶緩衝感：舊計畫淡出層逐字淡出、新計畫進場層逐字淡入。
          橫向：散布於色塊上、下、左右周圍（中文直書、英文 −90°）；直向：左右兩欄、正立橫書。
          首載（transId 0）走 steady：一開始即全部可見（twinkle 負延遲鎖在 opacity=1 相位）、
          入場 left 從外側收回；hover 切換時，前一計畫的字淡出、新計畫的字錯開淡入。 */}
      {outgoingPositions?.map((pos, i) =>
        renderWord(pos, i, 'out', `out-${transId}-${i}`, outgoingVisibleCount),
      )}
      {positions.map((pos, i) =>
        renderWord(
          pos,
          i,
          transId === 0 ? 'steady' : 'in',
          `in-${transId}-${i}`,
          visibleCount,
        ),
      )}

      {/* 底部固定標語 — 對齊 Figma 1:38 / 1:39 / 1:40：
          - 左塊（regular）：ART x DESIGN / Gateway（兩行）
          - 中塊（bold）：Taiwan（一行，粗體強調）
          - 右塊（regular）：臺灣的創造力（左）/ 走向世界（右靠縮進）
          三塊以絕對定位精準錨點，而非 space-between，避免被視口寬度均勻拉開；
          top-aligned 讓第二行自然下沉，產生高低錯落。
          Vertical 直向佈局仍是兩欄堆疊（左頂 + 右底），手機版邏輯不變。 */}
      {vertical ? (
        <>
          {mode === 'v' ? (
            <>
              {/* 手機版站名識別置於第一個色塊左右，採直排。 */}
              <Box
                data-testid="mobile-hero-brand-left"
                aria-hidden
                sx={{
                  position: 'absolute',
                  left: '26px',
                  top: '36px',
                  writingMode: 'vertical-rl',
                  pointerEvents: 'none',
                  color: '#000000',
                }}
              >
                <Box
                  data-testid="mobile-hero-title-lockup"
                  sx={{
                    position: 'absolute',
                    left: 0,
                    top: 0,
                    display: 'flex',
                    flexDirection: 'row-reverse',
                    gap: '8px',
                    writingMode: 'horizontal-tb',
                  }}
                >
                  {BASE_LABEL_GROUPS[0].lines.map((line) => (
                    <Box
                      key={line.text}
                      component="span"
                      sx={{
                        fontSize: 16,
                        fontWeight: 700,
                        lineHeight: 1,
                        writingMode: 'vertical-rl',
                        whiteSpace: 'nowrap',
                      }}
                    >
                      {line.text}
                    </Box>
                  ))}
                </Box>
                <Box
                  data-testid="mobile-hero-taiwan"
                  component="span"
                  sx={{
                    position: 'absolute',
                    left: 0,
                    top: '170px',
                    fontSize: 16,
                    fontWeight: 700,
                    lineHeight: 1,
                    writingMode: 'vertical-rl',
                    whiteSpace: 'nowrap',
                  }}
                >
                  Taiwan
                </Box>
                <Box
                  sx={{
                    position: 'absolute',
                    left: 0,
                    top: '282px',
                    display: 'flex',
                    flexDirection: 'row',
                    gap: '10px',
                  }}
                >
                  {['教育部 藝術與設計', '三大計畫入口網'].map((line) => (
                    <Box
                      key={line}
                      component="span"
                      sx={{
                        fontSize: 16,
                        fontWeight: 700,
                        lineHeight: 1.1,
                        writingMode: 'vertical-rl',
                        whiteSpace: 'nowrap',
                      }}
                    >
                      {line}
                    </Box>
                  ))}
                </Box>
              </Box>
              <Box
                data-testid="mobile-hero-brand-right"
                aria-hidden
                sx={{
                  position: 'absolute',
                  right: '24px',
                  top: '42px',
                  writingMode: 'vertical-rl',
                  pointerEvents: 'none',
                  color: '#000000',
                }}
              >
                {BASE_LABEL_GROUPS[2].lines.map((line, index) => (
                  <Box
                    key={line.text}
                    component="span"
                    sx={{
                      position: 'absolute',
                      top: index === 0 ? 0 : '160px',
                      right: 0,
                      fontSize: 16,
                      fontWeight: 700,
                      lineHeight: 1.1,
                      writingMode: 'vertical-rl',
                      whiteSpace: 'nowrap',
                    }}
                  >
                    {line.text}
                  </Box>
                ))}
              </Box>
            </>
          ) : (
            <>
              {/* 平板稿：站名識別先在第一色塊左右完整出現，裝飾文字從後段色塊開始。 */}
              <Box
                data-testid="tablet-hero-brand-left"
                aria-hidden
                sx={{
                  position: 'absolute',
                  left: '5.5%',
                  top: '170px',
                  display: 'flex',
                  flexDirection: 'column',
                  pointerEvents: 'none',
                  color: '#000000',
                }}
              >
                {[
                  ...BASE_LABEL_GROUPS[0].lines,
                  ...BASE_LABEL_GROUPS[1].lines,
                ].map((line) => (
                  <Box
                    key={line.text}
                    component="span"
                    sx={{
                      fontSize: 17.89,
                      // 已載入字重 400/500/700：用 500（ART x DESIGN／GATEWAY，較細）對比
                      // 700（Taiwan，較粗），確保兩組文字有穩定粗細差異。
                      fontWeight: line.text === 'Taiwan' ? 700 : 500,
                      lineHeight: 1.25,
                      // Taiwan 與上方 ART x DESIGN／GATEWAY 之間留間隙（依手機稿 388:247）。
                      mt: line.text === 'Taiwan' ? '12px' : 0,
                      whiteSpace: 'nowrap',
                    }}
                  >
                    {line.text}
                  </Box>
                ))}
                <Box
                  sx={{
                    display: 'flex',
                    flexDirection: 'row',
                    gap: '23px',
                    mt: '20px',
                  }}
                >
                  {['教育部 藝術與設計', '三大計畫入口網'].map((line) => (
                    <Box
                      key={line}
                      component="span"
                      sx={{
                        fontSize: 12.23,
                        fontWeight: 500,
                        lineHeight: 1.2,
                        whiteSpace: 'nowrap',
                        color: '#000000',
                      }}
                    >
                      {line}
                    </Box>
                  ))}
                </Box>
              </Box>
              <Box
                data-testid="tablet-hero-brand-right"
                aria-hidden
                sx={{
                  position: 'absolute',
                  right: '6%',
                  top: '178px',
                  width: '160px',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '52px',
                  pointerEvents: 'none',
                }}
              >
                {BASE_LABEL_GROUPS[2].lines.map((line) => (
                  <Box
                    key={line.text}
                    component="span"
                    sx={{
                      fontSize: 12.89,
                      fontWeight: 600,
                      lineHeight: 1.25,
                      whiteSpace: 'nowrap',
                      color: '#000000',
                      alignSelf:
                        line.align === 'end' || line.text === '臺灣的創造力'
                          ? 'flex-end'
                          : 'flex-start',
                    }}
                  >
                    {line.text}
                  </Box>
                ))}
              </Box>
            </>
          )}
        </>
      ) : (
        <Box
          aria-hidden
          sx={{
            position: 'absolute',
            left: 0,
            right: 0,
            top: -82,
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
            {['ART x DESIGN', 'GATEWAY'].map((line) => (
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

          {/* 右塊：臺灣的創造力 / 走向世界 — 對齊 Figma 1:38
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
                alignSelf: 'flex-end',
                fontSize: 15,
                fontWeight: 400,
                whiteSpace: 'nowrap',
                color: '#ffffff',
                mixBlendMode: 'difference',
              }}
            >
              臺灣的創造力
            </Box>
            <Box
              component="span"
              sx={{
                alignSelf: 'flex-end',
                mt: '12px',
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

          {/* 識別橫書（依設計稿 node 388:81：教育部 藝術與設計 x=414/1440=28.75%、
              三大計畫入口網 x=539/1440=37.43%，皆置於 ART x DESIGN／GATEWAY 下方
              y=770，較標語列頂端低約 47px）。橫書黑字、不混色。 */}
          <Box
            component="span"
            sx={{
              position: 'absolute',
              left: '28.75%',
              top: '47px',
              fontSize: 12.23,
              fontWeight: 500,
              color: '#000000',
              whiteSpace: 'nowrap',
              lineHeight: 1.2,
            }}
          >
            教育部 藝術與設計
          </Box>
          <Box
            component="span"
            sx={{
              position: 'absolute',
              left: '37.43%',
              top: '47px',
              fontSize: 12.23,
              fontWeight: 500,
              color: '#000000',
              whiteSpace: 'nowrap',
              lineHeight: 1.2,
            }}
          >
            三大計畫入口網
          </Box>
        </Box>
      )}
    </Box>
  );
}
