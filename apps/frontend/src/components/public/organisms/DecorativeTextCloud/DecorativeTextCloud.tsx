'use client';

import { useEffect, useId, useMemo, useRef, useState } from 'react';

import Box from '@mui/material/Box';

import type { LocalizedText } from '@/types/plan';

import { portalTokens } from '../../tokens';

/** hero 底部的固定標語（各計畫共用，非取自 decorativeText） */
const BASE_LABELS = [
  'ART x DESIGN Gateway',
  'Taiwan',
  '台灣的創造力，',
  '走向世界',
];

/** hover 時照片隨機變換的間隔（ms） */
const PHOTO_INTERVAL = 420;
/** hover 旋轉一圈的時間（ms）— 順時針 */
const SPIN_PERIOD = 2000;
/** 游標移開後的逆時針減速時間（ms） */
const RELEASE_DURATION = 1600;
/** 游標移開後逆時針再轉的角度（度，約 1.7 圈） */
const RELEASE_DEG = 620;

/** 圖形半徑（三圖等大） */
const SHAPE_R = 178;

/**
 * hero 三圖形（依設計稿 Slide 02 與 node 1:2）— 三者形狀各異但等大：
 * 第一＝微鋸齒星形、第二＝平滑多邊形、第三＝六邊形。
 */
const SHAPE_META = [
  { rotation: 8, sides: 16, innerRatio: 0.93 },
  { rotation: 14, sides: 13, innerRatio: 1 },
  { rotation: 0, sides: 6, innerRatio: 1 },
] as const;

/**
 * 兩種佈局：
 * - 橫向（≥834px）：三圖左中右並排（依桌機稿 node 1:2）。
 * - 直向（<834px）：三圖上中下堆疊（依手機／平板稿 node 43:396 / 43:1142）。
 */
const LAYOUT = {
  h: {
    viewW: 1000,
    viewH: 460,
    centers: [
      { cx: 285, cy: 230 },
      { cx: 512, cy: 230 },
      { cx: 739, cy: 230 },
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
 * 將裝飾文字散佈於色塊周圍。
 * - 橫向：上下兩排、貼著色塊上下緣（直書 −90°）。
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
  const topCount = Math.ceil(words.length / 2);
  return words.map((text, i) => {
    const onTop = i < topCount;
    const idx = onTop ? i : i - topCount;
    const len = onTop ? topCount : Math.max(1, words.length - topCount);
    const t = len <= 1 ? 0.5 : idx / (len - 1);
    return {
      text,
      leftPct: 7 + t * 86,
      topPct: onTop ? 17 + (idx % 2) * 5 : 79 - (idx % 2) * 5,
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

export interface DecorativeTextCloudProps {
  /** 裝飾性文字（取自 plans.json 的 decorativeText） */
  words: LocalizedText[];
  /** 計畫的本機照片路徑 — hover 圖形時於該圖形內隨機循環顯示 */
  photos?: string[];
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
  words,
  photos = [],
  language = 'en',
}: DecorativeTextCloudProps) {
  const uid = useId().replace(/[:]/g, '');
  const [hovered, setHovered] = useState<number | null>(null);
  const [photoIdx, setPhotoIdx] = useState(0);

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

  const { positions, pool } = useMemo(() => {
    const texts = words
      .map((w) => (language === 'en' ? (w.en ?? w.zh) : (w.zh ?? w.en)))
      .filter((t): t is string => Boolean(t));
    return { positions: placeWords(texts, vertical), pool: texts };
  }, [words, language, vertical]);

  // 各文字槽目前顯示的詞 — 隨閃爍動畫每輪結束時隨機變換
  const [slotWords, setSlotWords] = useState<string[]>(() =>
    positions.map((p) => p.text),
  );
  useEffect(() => {
    setSlotWords(positions.map((p) => p.text));
  }, [positions]);

  // hover 期間，照片快速、隨機變換
  useEffect(() => {
    if (hovered === null || photos.length < 2) return;
    const id = window.setInterval(() => {
      setPhotoIdx((prev) => {
        let next = prev;
        while (next === prev) {
          next = Math.floor(Math.random() * photos.length);
        }
        return next;
      });
    }, PHOTO_INTERVAL);
    return () => window.clearInterval(id);
  }, [hovered, photos.length]);

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

  /** 移開後：逆時針減速再轉幾圈後停住 */
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
        easing: 'cubic-bezier(0.17, 0.84, 0.44, 1)',
        fill: 'forwards',
      },
    );
  };

  const handleEnter = (i: number) => {
    setHovered(i);
    if (photos.length) {
      setPhotoIdx(Math.floor(Math.random() * photos.length));
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
        maxWidth: 1320,
        mx: 'auto',
        // 直向佈局較高；橫向 ≥834px 為 620
        height: vertical ? 660 : 440,
        [portalTokens.mq.tabletUp]: { height: 620 },
        // 裝飾文字閃爍動畫 — 淡入、停留、淡出後變換詞彙
        '@keyframes portalTwinkle': {
          '0%, 100%': { opacity: 0 },
          '16%, 62%': { opacity: 1 },
          '86%': { opacity: 0 },
        },
        '& .portal-twinkle': {
          opacity: 0,
          animation: 'portalTwinkle 5s ease-in-out infinite',
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
                width: '96%',
                height: 'auto',
                [portalTokens.mq.tabletUp]: { width: '82%' },
              }),
          // 漂移動畫 — 三圖形以不同週期緩慢位移，goo 濾鏡使其靠近時相連
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
          '@media (prefers-reduced-motion: reduce)': {
            '& [class*="drift-"]': { animation: 'none' },
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
          {/* goo 濾鏡 — 模糊後銳化 alpha，使靠近的圖形產生液體般橋接 */}
          <filter
            id={`goo-${uid}`}
            x="-20%"
            y="-30%"
            width="140%"
            height="160%"
          >
            <feGaussianBlur
              in="SourceGraphic"
              stdDeviation="20"
              result="blur"
            />
            <feColorMatrix
              in="blur"
              type="matrix"
              values="1 0 0 0 0  0 1 0 0 0  0 0 1 0 0  0 0 0 20 -8"
              result="goo"
            />
            <feComposite in="SourceGraphic" in2="goo" operator="atop" />
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

        {/* metaball 漸層層 — 套用 goo 濾鏡；hover 的圖形隱藏漸層底（無框線） */}
        <g filter={`url(#goo-${uid})`}>
          {shapes.map((s, i) => (
            <g key={i} className={`drift-${i}`}>
              <polygon
                points={s.points}
                fill={`url(#blob-${uid})`}
                style={{
                  opacity: hovered === i ? 0 : 1,
                  transition: 'opacity 0.35s ease',
                }}
              />
            </g>
          ))}
        </g>

        {/* 照片 + hover 感測層 — 跟隨漂移；hover 時遮罩（clipPath）旋轉、照片本身維持正立不轉 */}
        {shapes.map((s, i) => {
          const photo = photos.length
            ? photos[photoIdx % photos.length]
            : undefined;
          const isHovered = hovered === i;
          return (
            <g key={i} className={`drift-${i}`}>
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
          );
        })}
      </Box>

      {/* 色塊周圍的裝飾文字 — 白字 + difference，閃爍淡入淡出並隨機變換詞彙。
          橫向：上下兩排（中文直書、英文 −90°）；直向：左右兩欄、正立橫書。 */}
      {positions.map((pos, i) => {
        const dur = 4.6 + ((i * 1.73) % 3.6);
        const delay = -((i * 2.27) % 6);
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
              setSlotWords((prev) => {
                if (pool.length === 0) return prev;
                const next = [...prev];
                next[i] = pool[Math.floor(Math.random() * pool.length)];
                return next;
              });
            }}
            style={{
              animationDuration: `${dur.toFixed(2)}s`,
              animationDelay: `${delay.toFixed(2)}s`,
            }}
            sx={{
              position: 'absolute',
              top: `${pos.topPct}%`,
              ...(vertical
                ? {
                    // 直向：靠左／右欄，正立橫書
                    ...(pos.side === 'left'
                      ? { left: `${pos.leftPct}%` }
                      : {
                          right: `${100 - pos.leftPct}%`,
                          textAlign: 'right',
                        }),
                    transform: 'translateY(-50%)',
                  }
                : {
                    left: `${pos.leftPct}%`,
                    ...(isCJK
                      ? {
                          writingMode: 'vertical-rl',
                          transform: 'translate(-50%, -50%)',
                        }
                      : {
                          transform: 'translate(-50%, -50%) rotate(-90deg)',
                        }),
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

      {/* 底部固定標語 — 橫向為一排；直向為左右兩組堆疊 */}
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
            {BASE_LABELS.slice(0, 2).map((label) => (
              <Box
                key={label}
                component="span"
                sx={{
                  fontSize: 15,
                  fontWeight: 600,
                  whiteSpace: 'nowrap',
                  color: '#ffffff',
                  mixBlendMode: 'difference',
                }}
              >
                {label}
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
            {BASE_LABELS.slice(2).map((label) => (
              <Box
                key={label}
                component="span"
                sx={{
                  fontSize: 15,
                  fontWeight: 600,
                  whiteSpace: 'nowrap',
                  color: '#ffffff',
                  mixBlendMode: 'difference',
                }}
              >
                {label}
              </Box>
            ))}
          </Box>
        </>
      ) : (
        <Box
          aria-hidden
          sx={{
            position: 'absolute',
            left: '4%',
            right: '4%',
            bottom: 0,
            display: 'flex',
            justifyContent: 'space-between',
            gap: 1,
            pointerEvents: 'none',
          }}
        >
          {BASE_LABELS.map((label) => (
            <Box
              key={label}
              component="span"
              sx={{
                fontSize: 15,
                fontWeight: 600,
                whiteSpace: 'nowrap',
                color: '#ffffff',
                mixBlendMode: 'difference',
              }}
            >
              {label}
            </Box>
          ))}
        </Box>
      )}
    </Box>
  );
}
