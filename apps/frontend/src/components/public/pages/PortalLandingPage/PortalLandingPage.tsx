'use client';

import {
  useCallback,
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
} from 'react';

import Box from '@mui/material/Box';
import { styled } from '@mui/material/styles';
import { useLocale, useTranslations } from 'next-intl';

import { getLocalPhotos } from '@/lib/portal/plans';
import type { Plan } from '@/types/plan';

import { CarouselDots } from '../../atoms/CarouselDots';
import { DecorativeTextCloud } from '../../organisms/DecorativeTextCloud';
import { PlanCarousel } from '../../organisms/PlanCarousel';
import { PortalFooter } from '../../organisms/PortalFooter';
import { PortalNarrativeSection } from '../../organisms/PortalNarrativeSection';
import { PLAN_SHAPE_CLIPS } from '../../planShapes';
import { portalTokens } from '../../tokens';

/** SSR 安全的 layout effect：伺服器端退回 useEffect，避免 React 警告。 */
const useIsoLayoutEffect =
  typeof window !== 'undefined' ? useLayoutEffect : useEffect;

export interface PortalLandingPageProps {
  /** 三大計畫資料 */
  plans: Plan[];
}

/** 計畫卡顯示順序（依設計稿：菁培 → 設計戰國策 → 創意設計大賽） */
const PLAN_ORDER: string[] = ['sposad', 'idc', 'tisdc'];

/**
 * hero 各計畫色塊 hover 時輪換的照片（依設計稿選用，非全部）。
 * 值為該計畫 local 照片陣列（getLocalPhotos 順序 = photo_01.. 檔名序）的索引：
 *  - sposad（菁培）：photo_02 / 03 / 04 / 05
 *  - idc（設計戰國策）：photo_01 / 02 / 03 / 05
 *  - tisdc（創意設計大賽）：photo_01 / 02 / 03（共三張，全用）
 */
const HERO_PHOTO_INDICES: Record<string, number[]> = {
  sposad: [1, 2, 3, 4],
  idc: [0, 1, 2, 4],
  tisdc: [0, 1, 2],
};

/** 釘住區大卡上方留給裝飾星形照片的內距（DECOR_STARS 最高 y≈-112，需略大於此以免被切） */
const PIN_TOP_PAD = 120;
/**
 * 卡片完整露出後、切換前還要再往下捲過的「一小段距離」（px）。
 * 即每張卡的捲動量 = 卡片可捲距離 + 此距離；捲超過後才切下一張並回到頂端。
 */
const DWELL_PX = 100;
/**
 * 自適應第二屏的對稱留白基準（px，未縮放）。縮放倍率以
 * scale = 視窗高 /（卡片自然高 + 2×此值）計算 → 卡片依高度比例放大／縮小填滿，
 * 上下留白 = 此值×scale（對稱），且足以容納卡片上緣溢出的裝飾星形（最高約 112px）。
 */
const FIT_MARGIN_BASE = 130;
/** 自適應縮放下限／上限：下限避免極矮視窗縮到難讀；上限避免大螢幕字體過大。 */
const MIN_CARD_SCALE = 0.55;
const MAX_CARD_SCALE = 2;
/** 展開卡設計寬度（px，與 PlanCarousel 的 maxWidth 一致）；供寬度上限計算。 */
const CARD_BASE_W = 960;
/** 自適應寬度上限的左右側淨空（px）：卡片放大後與視窗邊緣的最小間距（含 peek 淨空）。 */
const FIT_SIDE_MARGIN = 72;
/** 輪播指示點本身的渲染高度（px，固定尺寸不隨 cardScale 縮放）；供上方平衡 spacer 用。 */
const DOTS_BLOCK_H = 16;

/** 第一屏 hero 設計畫布尺寸（px，桌機）；contain-fit 縮放的基準。
 *  高度含左下直書識別「三大計畫入口網／教育部 藝術與設計」往標語列下方的延伸，
 *  讓 contain-fit 一併把識別與下方留白算進去（否則寬螢幕時識別會貼底、無下方間距）。 */
const HERO_DESIGN_W = 1440;
const HERO_DESIGN_H = 732;
/** hero 縮放與視窗邊緣的左右／上下淨空（px）。 */
const HERO_SIDE_MARGIN = 48;
const HERO_V_MARGIN = 40;
/** hero 縮放上下限：下限避免極小視窗縮到難讀，上限避免大螢幕過度放大。 */
const HERO_MIN_SCALE = 0.6;
const HERO_MAX_SCALE = 1.7;
/**
 * 切換後鎖住滾輪的時間（ms）：吸收觸控板 / 滑鼠的慣性殘餘 wheel 事件，確保「一次
 * 手勢只切一張」。沒有這道鎖，一次快速滑動的動量會連續累加、一口氣衝過好幾張卡，
 * 看起來就是「意外的快速左右切換」。
 */
const GESTURE_LOCK_MS = 700;

/**
 * 敘事內文計畫名稱的行內樣式 — 以 styled('span') 實作為真正的行內元素，純品牌橘標示
 * （非連結、無互動）。
 *
 * 不可用 <button>：button 為 inline-block 原子盒，會讓前面的開引號「被孤立斷在行尾；
 * 行內 span 讓文字連續流動，中文禁則（line-break: strict）才能把「留在下一行開頭。
 */
const NarrativePlanName = styled('span')({
  color: portalTokens.color.brandOrange,
});

/**
 * PortalLandingPage — 教育部藝術設計三大計畫入口網首頁。
 *
 * 由上而下：hero 文字雲（佔滿首屏）→ 計畫介紹大卡 → 敘事 → 指示點 → 頁尾。
 *
 * 計畫介紹區（≥834px、非減少動態）以「滾輪 / 鍵盤」驅動時採「釘住 + 離散切換」：
 *  - 以滾輪或鍵盤捲到該區即釘住、鎖住頁面捲動，改由滾輪累積驅動目前卡片往上露出。
 *  - 捲超過「卡片 + 一小段空白」後 → 切換到下一張，並把卡片重置回頂端（重新往下捲）。
 *  - 往回捲到卡頂後 → 倒退回上一張（切換觸發區在上方），可反向瀏覽三張。
 *  - 在最後一張往下捲即放行到敘事 / 頁尾；往上捲到第一張頂端則回到 hero。
 *  - 兩側 peek 隨時可切換。因為要捲超過一整張卡才切換，慣性微抖動遠不及一張卡的量，
 *    故不會誤觸左右切換。
 * 改用捲軸拖動時不釘住（或釘住中拖動即釋放），讓使用者自由捲過整頁；滾輪體驗不變。
 * <834px 或 prefers-reduced-motion：不劫持捲動，原生捲動；計畫切換由 hero 色塊與
 *   敘事區標記觸發（不自動輪播）。
 */
export function PortalLandingPage({ plans }: PortalLandingPageProps) {
  const t = useTranslations('portal');
  const locale = useLocale();
  const language = locale.startsWith('zh') ? 'zh' : 'en';

  // 目前顯示的計畫索引（供渲染）。互動狀態另以 ref 同步追蹤，供事件處理即時讀取。
  const [activeIndex, setActiveIndex] = useState(0);
  // 桌機 + 非減少動態 → 啟用「釘住 + 滾輪驅動」。
  const [scrollDriven, setScrollDriven] = useState(false);
  // 延後掛載下方計畫區（含裝飾星形照片與 banner 圖）：首屏 hero 入場那幾秒不掛載，
  // 避免圖片在主執行緒初始化卡住入場動畫（壓縮會頓成「跳一段」）。
  // 使用者一開始捲動或入場結束後才掛載。
  const [mountPlans, setMountPlans] = useState(false);
  // 自適應第二屏：卡片內容高於一屏時的等比縮放倍率（≤1）；量測後設定。
  const [cardScale, setCardScale] = useState(1);
  // 自適應第一屏（hero）：依視窗等比縮放整個 hero 畫布（色塊＋文字一起），比照第二屏
  // 填滿一屏；桌機才縮放，手機維持原生（vertical 佈局自行撐滿寬）。
  const [heroScale, setHeroScale] = useState(1);
  // 目前已套用的縮放倍率（用 zoom 實作，zoom 會影響 scrollHeight）；量測時用它把
  // 讀到的（已縮放）高度還原成自然高度，避免「量到縮放後高度 → 再算縮放」的回饋。
  const appliedScaleRef = useRef(1);

  // 卡片顯示順序：依設計稿固定為 sposad → idc → tisdc；任何未列入者補在後面
  const orderedPlans: Plan[] = [
    ...PLAN_ORDER.map((id) => plans.find((p) => p.id === id)).filter(
      (p): p is Plan => Boolean(p),
    ),
    ...plans.filter((p) => !PLAN_ORDER.includes(p.id)),
  ];
  const planCount = orderedPlans.length;

  // 釘住區塊與承載 reveal CSS 變數的卡片包裝層。
  const planSectionRef = useRef<HTMLDivElement>(null);
  const cardWrapRef = useRef<HTMLDivElement>(null);
  // 第三屏（資訊區）的容器：供「最後一張卡往下 → 整頁切到資訊區」的離散 snap。
  const infoSectionRef = useRef<HTMLDivElement>(null);

  // ── 滾輪狀態機的即時狀態（用 ref 以免事件處理讀到舊值）──
  const engagedRef = useRef(false); // 是否釘住、攔截滾輪中
  const idxRef = useRef(0); // 目前卡片索引
  const offsetRef = useRef(0); // 目前卡片的捲動位移（0 = 卡頂；= 卡片露出量）
  const segLenRef = useRef(0); // 每張卡往下的捲動量 = 卡片可捲距離 + DWELL_PX
  const prevYRef = useRef(0); // 上一次捲動位置（判斷進入方向）
  const lockedDirRef = useRef(0); // 切換後鎖住的方向（1=往下、-1=往上、0=未鎖）；
  // 只擋同方向的慣性殘餘，反方向（刻意反轉）立即放行。
  const lockTimerRef = useRef<number | null>(null);
  // hero → 計畫區「滾一下即一次性平滑跳轉」進行中旗標：吸收動畫期間的後續 wheel，
  // 確保一次手勢只觸發一次跳轉（依業主需求：第一屏滾一下直接到計畫卡片區）。
  const heroSnappingRef = useRef(false);

  // 桌機（≥1200）+ 非減少動態 → 啟用捲動驅動釘住輪播；平板（834–1199）與手機走原生捲動。
  // 視窗變動時即時校正。
  useEffect(() => {
    if (typeof window === 'undefined') return;
    const mqDesktop = window.matchMedia('(min-width:1200px)');
    const mqMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
    const update = () =>
      setScrollDriven(mqDesktop.matches && !mqMotion.matches);
    update();
    mqDesktop.addEventListener('change', update);
    mqMotion.addEventListener('change', update);
    return () => {
      mqDesktop.removeEventListener('change', update);
      mqMotion.removeEventListener('change', update);
    };
  }, []);

  // 自適應第一屏：以 hero 設計畫布（1440×732）對視窗做 contain-fit 縮放（取寬高較小者），
  // 比照第二屏卡片「填滿一屏」；僅桌機（≥1200px）橫向 hero 才縮放，平板／手機回 1
  // （直向佈局自撐寬、原生捲動）。
  useEffect(() => {
    if (typeof window === 'undefined') return;
    const mqDesktop = window.matchMedia('(min-width:1200px)');
    const compute = () => {
      if (!mqDesktop.matches) {
        setHeroScale(1);
        return;
      }
      const widthScale =
        (window.innerWidth - 2 * HERO_SIDE_MARGIN) / HERO_DESIGN_W;
      const heightScale =
        (window.innerHeight - 2 * HERO_V_MARGIN) / HERO_DESIGN_H;
      const fit = Math.min(widthScale, heightScale);
      const clamped = Math.max(HERO_MIN_SCALE, Math.min(HERO_MAX_SCALE, fit));
      // 夾下限（HERO_MIN_SCALE）後仍不得超過「寬度可容納」的比例，否則窄桌機
      // （1200px 附近、widthScale < 下限）會被夾大而水平裁切 hero。
      setHeroScale(Math.min(clamped, widthScale));
    };
    compute();
    window.addEventListener('resize', compute);
    mqDesktop.addEventListener('change', compute);
    return () => {
      window.removeEventListener('resize', compute);
      mqDesktop.removeEventListener('change', compute);
    };
  }, []);

  // 切換 / 進入後上鎖一段固定時間，吸收觸控板 / 滑鼠的慣性殘餘 wheel，確保
  // 「一次手勢只切一張」；連續按住拖曳則每 GESTURE_LOCK_MS 推進一張。
  const lockGesture = useCallback((dir: number) => {
    lockedDirRef.current = dir;
    if (lockTimerRef.current) window.clearTimeout(lockTimerRef.current);
    lockTimerRef.current = window.setTimeout(() => {
      lockedDirRef.current = 0;
      lockTimerRef.current = null;
    }, GESTURE_LOCK_MS);
  }, []);

  // 把目前 offset 寫進 CSS 變數，驅動卡片露出（reveal 只套在卡片、不動 peek）。
  // 夾在 ≥0：往上越過卡頂時 offset 會記為負（供觸發門檻計算），但卡片停在頂端、
  // 不往下滑，避免在上方露出空白凹槽。
  const applyReveal = useCallback(() => {
    const wrap = cardWrapRef.current;
    if (wrap) {
      const r = Math.max(0, offsetRef.current);
      wrap.style.setProperty('--reveal-y', `${r.toFixed(2)}px`);
    }
  }, []);

  // 切換到另一張卡：退場舊卡「停在原位不動」（--exit-reveal-y 凍結在離開那一刻的
  // 捲動位移，不滑出、不跳動），新卡從側邊滑入並疊在上層覆蓋它（見 PlanCarousel）。
  const commitSwitch = useCallback((target: number, enterOffset: number) => {
    const wrap = cardWrapRef.current;
    if (wrap) {
      wrap.style.setProperty(
        '--exit-reveal-y',
        `${offsetRef.current.toFixed(2)}px`,
      );
      wrap.style.setProperty('--reveal-y', `${enterOffset.toFixed(2)}px`);
    }
    offsetRef.current = enterOffset;
    idxRef.current = target;
    setActiveIndex(target);
  }, []);

  // 釘住並切到指定卡片（dots / 由上下進入時用）：鎖住捲動於本區。進入時「不」上鎖
  // ——上鎖會讓剛進來就想繼續捲被卡住「頓一下」。入場慣性的吸收交給「切換後的鎖」。
  // atTop：true → 卡片重置到卡頂（往下 / dots 進入）；false → 保留目前露出位置
  // （往上由下方進入時用，讓卡片從 native 捲入的位置順順往上收回卡頂、不瞬間跳動）。
  const engageAt = useCallback((index: number, atTop = true) => {
    engagedRef.current = true;
    heroSnappingRef.current = false;
    lockedDirRef.current = 0;
    if (lockTimerRef.current) {
      window.clearTimeout(lockTimerRef.current);
      lockTimerRef.current = null;
    }
    idxRef.current = index;
    if (atTop) {
      offsetRef.current = 0;
      const wrap = cardWrapRef.current;
      if (wrap) wrap.style.setProperty('--reveal-y', '0px');
    }
    setActiveIndex(index);
    const top = planSectionRef.current?.offsetTop ?? 0;
    window.scrollTo(0, top);
  }, []);

  // 量測 cardMax / segLen（計畫區掛載後、視窗縮放、與圖片載入後各量一次；三張卡高度相近）。
  // 用 layout effect 在 paint 前算好縮放並套用，避免卡片先以原尺寸畫一幀、再縮小的「先大後小」。
  useIsoLayoutEffect(() => {
    if (!scrollDriven || !mountPlans) return;
    const measure = () => {
      const wrap = cardWrapRef.current;
      if (!wrap) return;
      const vh = window.innerHeight;
      // 還原自然高度：zoom 會讓 scrollHeight 變成縮放後高度，除以目前已套用倍率還原。
      const natural = wrap.scrollHeight / (appliedScaleRef.current || 1);
      // 依高度比例放大／縮小填滿第二屏：scale = 視窗高 /（卡片自然高 + 2×留白基準），
      // 卡片視覺高 = natural×scale，上下各留 FIT_MARGIN_BASE×scale 的對稱留白
      // （含裝飾星形上緣淨空）；夾在縮放上下限內。
      const raw = vh / (natural + 2 * FIT_MARGIN_BASE);
      // 寬度上限：卡片放大後不得超出視窗（並讓兩側保留淨空、不壓到 peek）。
      // CARD_BASE_W 為展開卡設計寬（960）；視窗較窄時以寬度為準收斂縮放。
      const widthCap = (window.innerWidth - 2 * FIT_SIDE_MARGIN) / CARD_BASE_W;
      const scale = Math.min(
        MAX_CARD_SCALE,
        Math.max(MIN_CARD_SCALE, Math.min(raw, widthCap)),
      );
      appliedScaleRef.current = scale;
      setCardScale(scale);
      // 卡片填入一屏後段內無需 reveal，捲動僅作離散切換。
      const cardMax = Math.max(0, natural * scale - vh);
      segLenRef.current = cardMax + DWELL_PX;
    };
    measure();
    const tid = window.setTimeout(measure, 400);
    window.addEventListener('resize', measure);
    // 字體載入會改變卡片高度 → 載入完成後再量一次，讓最終縮放在使用者捲到第二屏前就定案。
    let cancelled = false;
    if (typeof document !== 'undefined' && document.fonts?.ready) {
      document.fonts.ready.then(() => {
        if (!cancelled) measure();
      });
    }
    return () => {
      cancelled = true;
      window.clearTimeout(tid);
      window.removeEventListener('resize', measure);
    };
  }, [scrollDriven, mountPlans]);

  // 滾輪驅動的離散狀態機 + 釘住期間鎖住頁面捲動。
  useEffect(() => {
    if (!scrollDriven) return;
    prevYRef.current = window.scrollY;
    const blockTop = () => planSectionRef.current?.offsetTop ?? 0;
    // 最近一次「滾輪／鍵盤」離散導覽意圖的時間戳。用來區分捲動來源：
    // 跨越計畫區頂端時，僅在剛有此意圖時才自動釘住；純捲軸拖動（無意圖）不釘住，
    // 讓習慣拖捲軸的使用者自由捲過整頁。
    let lastNavIntent = 0;

    const release = () => {
      engagedRef.current = false;
      lockedDirRef.current = 0;
      if (lockTimerRef.current) {
        window.clearTimeout(lockTimerRef.current);
        lockTimerRef.current = null;
      }
    };

    // 整頁切到第三屏（資訊區）：解除釘住、平滑捲到資訊區頂端。
    const goToInfo = () => {
      release();
      const info = infoSectionRef.current;
      if (info) window.scrollTo({ top: info.offsetTop, behavior: 'smooth' });
    };

    // 整頁切回第一屏（hero）：卡片收回卡頂、解除釘住、平滑捲到頁頂。
    const goToHero = () => {
      offsetRef.current = 0;
      applyReveal();
      release();
      window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    const onWheel = (e: WheelEvent) => {
      // 滾輪發生在數據跑馬燈上、且該方向仍可捲動時，放行給瀏覽器原生捲動跑馬燈，
      // 不劫持驅動卡片輪播（讓使用者能 hover 後自行捲動查看數據）。
      const overMarquee = (e.target as Element | null)?.closest?.(
        '[data-stats-marquee]',
      );
      if (overMarquee) {
        const dy = e.deltaY;
        const canScroll =
          (dy < 0 && overMarquee.scrollTop > 0) ||
          (dy > 0 &&
            overMarquee.scrollTop + overMarquee.clientHeight <
              overMarquee.scrollHeight - 1);
        if (canScroll) return;
      }
      lastNavIntent = Date.now();
      if (!engagedRef.current) {
        const bt = blockTop();
        const dySnap = e.deltaY * (e.deltaMode === 1 ? 16 : 1);
        if (window.scrollY < bt - 4) {
          // 在 hero（計畫區之上）往下滾一下 → 一次性平滑跳到計畫區並釘住第一張。
          // 抵達由 onScroll 跨越偵測釘住，700ms timeout 為後備。
          if (dySnap > 0) {
            e.preventDefault();
            if (heroSnappingRef.current) return;
            heroSnappingRef.current = true;
            window.scrollTo({ top: bt, behavior: 'smooth' });
            window.setTimeout(() => {
              if (!engagedRef.current) engageAt(0);
              heroSnappingRef.current = false;
            }, 700);
          }
        } else {
          // 在資訊區（第三屏，計畫區正下方）往上滾一下 → 一滾回計畫區最後一張（與往下對稱）。
          const infoTop = infoSectionRef.current?.offsetTop ?? Infinity;
          if (
            dySnap < 0 &&
            window.scrollY > bt + 4 &&
            window.scrollY <= infoTop + 8
          ) {
            e.preventDefault();
            engageAt(planCount - 1, true);
          }
        }
        return;
      }
      const seg = segLenRef.current;
      if (seg <= 0) return;
      // 行模式（部分瀏覽器）換算成像素，避免一次只動幾 px。
      const dy = e.deltaY * (e.deltaMode === 1 ? 16 : 1);
      if (!dy) return;
      const dir = dy > 0 ? 1 : -1;
      // 方向性鎖（剛切換）：只吃掉「同方向」的慣性殘餘；反方向是刻意反轉 → 解鎖放行，
      // 不再「頓一下」。
      if (lockedDirRef.current !== 0) {
        if (lockedDirRef.current === dir) {
          e.preventDefault();
          return;
        }
        lockedDirRef.current = 0;
        if (lockTimerRef.current) {
          window.clearTimeout(lockTimerRef.current);
          lockTimerRef.current = null;
        }
      }
      const i = idxRef.current;
      if (dy > 0) {
        const next = offsetRef.current + dy;
        if (next < seg) {
          e.preventDefault();
          offsetRef.current = next;
          applyReveal();
          return;
        }
        // 捲超過整張卡 → 切下一張（回頂端），並上鎖吸收慣性殘餘
        if (i < planCount - 1) {
          e.preventDefault();
          commitSwitch(i + 1, 0);
          lockGesture(1);
          return;
        }
        // 已在最後一張 → 整頁切到第三屏（資訊區）。
        e.preventDefault();
        goToInfo();
        return;
      }
      // dy < 0：往上（與往下對稱：一個手勢即換頁）
      const next = offsetRef.current + dy;
      if (i === 0) {
        // 第一張：卡片若仍有露出（短視窗）先往上收回卡頂；到頂後一滾即整頁回 hero。
        if (next > 0) {
          e.preventDefault();
          offsetRef.current = next;
          applyReveal();
          return;
        }
        e.preventDefault();
        goToHero();
        lockGesture(-1);
        return;
      }
      // 非第一張：與往下相同門檻（seg）—— 累積到 -seg 即倒退上一張（一個手勢即換）。
      if (next > -seg) {
        e.preventDefault();
        offsetRef.current = next;
        applyReveal();
        return;
      }
      e.preventDefault();
      commitSwitch(i - 1, 0);
      lockGesture(-1);
    };

    const onScroll = () => {
      const y = window.scrollY;
      const bt = blockTop();
      if (engagedRef.current) {
        if (Math.abs(y - bt) > 4) {
          if (Date.now() - lastNavIntent < 700) {
            // 滾輪／鍵盤驅動的捲動殘餘（含 hero 平滑吸附動畫）→ 維持釘住、拉回卡頂，
            // 滾輪離散切換體驗不變。
            window.scrollTo(0, bt);
            prevYRef.current = bt;
          } else {
            // 無滾輪／鍵盤意圖卻有捲動＝使用者改用捲軸／觸控拖動 → 釋放釘住，
            // 讓頁面自由捲過計畫區（不再強制拉回），兼顧習慣拖捲軸的使用者。
            release();
            prevYRef.current = y;
          }
          return;
        }
        prevYRef.current = bt;
        return;
      }
      // 未釘住：偵測捲動跨越本區頂端 → 釘住並依方向進場（皆從卡頂進場、上半不被截）。
      // 僅在剛有滾輪／鍵盤意圖時才自動釘住；純捲軸拖動（無意圖）放行自由捲動。
      if (segLenRef.current > 0 && Date.now() - lastNavIntent < 250) {
        if (prevYRef.current < bt && y >= bt) {
          engageAt(0); // 由上往下進入 → 第一張（不上鎖，入場即可順順往下露出）
        } else if (prevYRef.current > bt && y <= bt) {
          // 由下往上進入 → 最後一張；保留 native 捲入時的露出位置，讓它順順往上
          // 收回卡頂、不瞬間跳動。
          engageAt(planCount - 1, false);
        }
      }
      prevYRef.current = y;
    };

    // 鍵盤整頁導覽：PageDown / PageUp（含 Space、上下方向鍵）以「一鍵一步」推進，
    // 與滾輪共用同一套離散步進（hero → 三張卡 → 資訊區，反向亦然）。
    const onKeyDown = (e: KeyboardEvent) => {
      let dir = 0;
      if (e.key === 'PageDown' || e.key === 'ArrowDown') dir = 1;
      else if (e.key === 'PageUp' || e.key === 'ArrowUp') dir = -1;
      else if (e.key === ' ' || e.key === 'Spacebar') dir = e.shiftKey ? -1 : 1;
      else return;

      // 表單 / 可編輯元素聚焦時不攔截，維持原生行為。
      const el = e.target as HTMLElement | null;
      if (
        el &&
        (el.tagName === 'INPUT' ||
          el.tagName === 'TEXTAREA' ||
          el.tagName === 'SELECT' ||
          el.isContentEditable)
      ) {
        return;
      }

      lastNavIntent = Date.now();
      const bt = blockTop();
      const y = window.scrollY;

      if (!engagedRef.current) {
        if (dir > 0 && y < bt - 4) {
          // 第一屏（hero）往下 → 平滑跳到計畫區並釘住第一張。
          e.preventDefault();
          if (heroSnappingRef.current) return;
          heroSnappingRef.current = true;
          window.scrollTo({ top: bt, behavior: 'smooth' });
          window.setTimeout(() => {
            if (!engagedRef.current) engageAt(0);
            heroSnappingRef.current = false;
          }, 700);
        } else if (dir < 0 && y > bt + 4) {
          // 第三屏（資訊區）往上 → 回計畫區最後一張（從卡頂釘住）。
          e.preventDefault();
          engageAt(planCount - 1, true);
        }
        return;
      }

      // 釘住於計畫區：離散切換目前卡片，邊界則整頁切到 hero / 資訊區。
      const i = idxRef.current;
      e.preventDefault();
      if (dir > 0) {
        if (i < planCount - 1) {
          commitSwitch(i + 1, 0);
          lockGesture(1);
        } else {
          goToInfo();
        }
      } else if (i === 0) {
        goToHero();
      } else {
        commitSwitch(i - 1, 0);
        lockGesture(-1);
      }
    };

    window.addEventListener('wheel', onWheel, { passive: false });
    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('keydown', onKeyDown);
    return () => {
      window.removeEventListener('wheel', onWheel);
      window.removeEventListener('scroll', onScroll);
      window.removeEventListener('keydown', onKeyDown);
      if (lockTimerRef.current) window.clearTimeout(lockTimerRef.current);
    };
  }, [
    scrollDriven,
    planCount,
    applyReveal,
    commitSwitch,
    engageAt,
    lockGesture,
  ]);

  // 延後掛載觸發：使用者一開始捲動 / 滾輪，或入場結束（fallback timeout）後，才掛載
  // 下方計畫區。如此 hero 入場那幾秒主執行緒淨空、壓縮動畫順暢。
  useEffect(() => {
    if (mountPlans) return;
    const trigger = () => setMountPlans(true);
    // 用 wheel / touchstart（真正的使用者捲動意圖）而非通用 scroll —— scroll 會在
    // 載入時因捲動還原 / 版面而誤觸，讓延後失效。fallback timeout 在入場後掛載。
    const t = window.setTimeout(trigger, 2600); // 入場約 2.4s 後再掛載
    window.addEventListener('wheel', trigger, { once: true, passive: true });
    window.addEventListener('touchstart', trigger, {
      once: true,
      passive: true,
    });
    return () => {
      window.clearTimeout(t);
      window.removeEventListener('wheel', trigger);
      window.removeEventListener('touchstart', trigger);
    };
  }, [mountPlans]);

  // 預載各計畫的裝飾星形照片：以 new Image() 先載入，避免 hover 浮出時才載造成閃跳。
  // 延到計畫區掛載後才預載，避免和 hero 入場搶主執行緒。
  useEffect(() => {
    if (typeof window === 'undefined' || !mountPlans) return;
    plans.forEach((plan) => {
      getLocalPhotos(plan).forEach((photo) => {
        if (photo.src) {
          const img = new Image();
          img.src = photo.src;
        }
      });
    });
  }, [plans, mountPlans]);

  // 指示點點選：捲動驅動時釘住並切到該卡；否則直接切 activeIndex。
  const handleDotSelect = useCallback(
    (i: number) => {
      if (scrollDriven) engageAt(i);
      else setActiveIndex(i);
    },
    [scrollDriven, engageAt],
  );

  // 兩側 peek 點擊（捲動驅動）：明確導覽 — 直接切到目標卡（回頂端），
  // 隨時可用、可循環。因為是明確操作，不受滾輪離散門檻限制。
  const handlePeekNavigate = useCallback(
    (targetIndex: number) => {
      commitSwitch(targetIndex, 0);
    },
    [commitSwitch],
  );

  // 指示點 / aria-live 對應目前查看的計畫
  const activePlan = orderedPlans[activeIndex] ?? orderedPlans[0];

  if (!activePlan) return null;

  // hero 文字雲：整片雲一次顯示「目前作用中計畫」的裝飾文字（defaultIndex =
  // activeIndex）；hover 某色塊即切換成該計畫的文字並於塊內顯示其照片。
  // 順序依 orderedPlans（sposad → idc → tisdc）對應左/中/右（直向為上/中/下）。
  const heroShapeContents = orderedPlans.slice(0, 3).map((plan) => {
    const allPhotos = getLocalPhotos(plan)
      .map((p) => p.src)
      .filter((s): s is string => Boolean(s));
    const indices = HERO_PHOTO_INDICES[plan.id] ?? allPhotos.map((_, i) => i);
    return {
      words: plan.decorativeText,
      photos: indices
        .map((i) => allPhotos[i])
        .filter((s): s is string => Boolean(s)),
    };
  });

  const planCarousel = (
    <PlanCarousel
      plans={orderedPlans}
      expandedIndex={activeIndex}
      onExpandedIndexChange={setActiveIndex}
      onPeekNavigate={scrollDriven ? handlePeekNavigate : undefined}
      cardScale={scrollDriven ? cardScale : 1}
    />
  );

  return (
    <Box
      sx={{
        minHeight: '100vh',
        bgcolor: portalTokens.color.pageBg,
        display: 'flex',
        flexDirection: 'column',
        // WebGL 星形陸續掛載會造成版面位移；停用本頁子樹的 scroll anchoring，避免
        // 瀏覽器自動回補捲動與釘住鎖捲互相拉扯。
        overflowAnchor: 'none',
        // ★ 自訂游標（依使用者圖示） — 32x38 SVG 黑底白邊指標、hotspot 在 (5,5)
        cursor: 'url("/cursors/portal-cursor.svg") 5 5, auto',
        '& button, & a, & [role="button"]': {
          cursor: 'url("/cursors/portal-cursor.svg") 5 5, pointer',
        },
      }}
    >
      {/* <main> landmark — 無障礙必要結構（政府網站規範）；對應 skip-link 目標。
          tabIndex=-1 + outline:none：讓 Safari/Firefox 在 skip-link click 後
          focus 真的進入 <main>（部分瀏覽器不會自動把 focus 移到 hash target）。*/}
      <Box
        component="main"
        id="main-content"
        tabIndex={-1}
        sx={{ display: 'flex', flexDirection: 'column', outline: 'none' }}
      >
        {/* 視覺隱藏的常駐 h1（WCAG 1.3.1 / 2.4.6）：給讀屏使用者穩定的頁面語意主標；
            視覺層級由各計畫大卡的 h2 接力呈現。*/}
        <Box component="h1" className="visually-hidden">
          {t('eyebrow')} | {t('footer.siteName')}
        </Box>
        {/* aria-live status — 計畫切換時告知讀屏使用者目前查看哪個計畫
            （WCAG 4.1.3 Status Messages）。*/}
        <Box
          role="status"
          aria-live="polite"
          aria-atomic="true"
          className="visually-hidden"
        >
          {t('viewingPlan', { name: activePlan.name.zh })}
        </Box>
        {/* 第一屏 — 文字雲佔滿整個視窗高度；底部置一列站名識別。 */}
        <Box
          sx={{
            minHeight: '100vh',
            display: 'flex',
            flexDirection: 'column',
            // 文字雲側邊圖片略微溢出時裁掉水平方向，避免出現橫向捲軸
            overflowX: 'clip',
          }}
        >
          {/* 文字雲區：佔滿剩餘高度並置中（手機／平板靠頂、桌機垂直置中）。
              平板直向 hero 較高，靠頂對齊才不會把色塊往下推、貼到下一段。 */}
          <Box
            sx={{
              flex: 1,
              minHeight: 0,
              display: 'flex',
              alignItems: 'flex-start',
              justifyContent: 'center',
              [portalTokens.mq.desktopUp]: { alignItems: 'center' },
            }}
          >
            {/* 桌機：固定設計寬 + zoom 等比縮放（色塊與文字一起）填滿一屏；
                平板／手機回原生寬（DecorativeTextCloud 內部自行依模式鎖寬置中）。 */}
            <Box
              sx={{
                width: '100%',
                zoom: heroScale !== 1 ? heroScale : undefined,
                [portalTokens.mq.desktopUp]: { width: HERO_DESIGN_W },
              }}
            >
              <DecorativeTextCloud
                shapeContents={heroShapeContents}
                defaultIndex={activeIndex}
                language={language}
              />
            </Box>
          </Box>
        </Box>

        {/* 計畫介紹大卡 */}
        {scrollDriven ? (
          // 桌機：釘住一屏（鎖住捲動），滾輪驅動卡片露出與離散切換；reveal 位移由
          // PlanCarousel 內部只套在卡片上（不影響兩側固定的 peek）。
          <Box
            ref={planSectionRef}
            id="portal-plans"
            sx={{
              height: '100vh',
              overflow: 'hidden',
              boxSizing: 'border-box',
              // 卡片在第二屏內垂直置中：各視窗高度都不靠頂留大片空白。卡片依高度比例
              // 由 cardScale（zoom）放大／縮小填滿，置中後上下自然形成對稱留白
              // （= FIT_MARGIN_BASE×scale，含裝飾星形上緣淨空）。
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'center',
            }}
          >
            {/* 上方平衡 spacer — 與下方「指示點區」（gap 72×scale + 指示點高 ~16px）等高，
                使「卡片本身」垂直置中（而非卡片＋指示點整組）；否則指示點會把卡片往上推、
                吃掉預留給上方裝飾星形的淨空，導致最上方裝飾照片被第二屏頂端裁切。 */}
            <Box
              aria-hidden
              sx={{
                flexShrink: 0,
                height: `${72 * cardScale + DOTS_BLOCK_H}px`,
              }}
            />
            <Box ref={cardWrapRef} sx={{ width: '100%' }}>
              {mountPlans && planCarousel}
            </Box>
            {/* 輪播指示點 — 卡片正下方（第二屏）。與卡片的間距依設計稿 72px（社群列底→
                指示點），並隨 cardScale 等比縮放，維持與卡片相同的視覺比例。 */}
            <Box
              sx={{
                mt: `${72 * cardScale}px`,
                display: 'flex',
                justifyContent: 'center',
              }}
            >
              <CarouselDots
                count={planCount}
                activeIndex={activeIndex}
                onSelect={handleDotSelect}
                labels={orderedPlans.map((p) => p.name.zh)}
                ariaLabel="計畫切換"
              />
            </Box>
          </Box>
        ) : (
          // 手機 / 減少動態：不劫持捲動，原生流；計畫切換由 hero 色塊與敘事區標記觸發
          // （不自動輪播、依設計稿不顯示指示點）。
          // pb 預留卡片二導覽列向下懸出的空間，避免覆蓋下一段。
          <Box
            id="portal-plans"
            sx={{
              width: '100%',
              pt: `${PIN_TOP_PAD}px`,
              pb: '48px',
              overflowX: 'clip',
            }}
          >
            {mountPlans && planCarousel}
          </Box>
        )}

        {/* 敘事段落（第三屏 / 資訊區）— 上下留適當留白，使捲動／PageDown 切到此屏時
            敘事內容不貼齊視窗上緣、下方亦留呼吸空間（隨視窗高度等比、夾在上下限）。*/}
        <Box
          ref={infoSectionRef}
          sx={{
            pt: 'clamp(56px, 12vh, 180px)',
            pb: 'clamp(48px, 9vh, 140px)',
          }}
        >
          <PortalNarrativeSection
            heading={t('narrative.heading')}
            intro={t('narrative.intro')}
            paragraphs={[
              t.rich('narrative.body1', {
                link: (chunks) => (
                  <NarrativePlanName>{chunks}</NarrativePlanName>
                ),
              }),
              t.rich('narrative.body2', {
                link: (chunks) => (
                  <NarrativePlanName>{chunks}</NarrativePlanName>
                ),
              }),
              t.rich('narrative.body3', {
                link: (chunks) => (
                  <NarrativePlanName>{chunks}</NarrativePlanName>
                ),
              }),
              t('narrative.body4'),
            ]}
            planMarker={{
              currentShapeClip:
                PLAN_SHAPE_CLIPS[activeIndex % PLAN_SHAPE_CLIPS.length],
              nextShapeClip:
                PLAN_SHAPE_CLIPS[
                  ((activeIndex + 1) % planCount) % PLAN_SHAPE_CLIPS.length
                ],
            }}
          />
        </Box>
      </Box>
      {/* 頁尾（PortalFooter 內部已使用 component="footer" landmark） */}
      <Box sx={{ mt: 10, [portalTokens.mq.tabletUp]: { mt: 22 } }}>
        <PortalFooter
          siteName={t('footer.siteName')}
          tagline={t('footer.tagline')}
          copyright={t('footer.copyright', { year: new Date().getFullYear() })}
        />
      </Box>
    </Box>
  );
}
