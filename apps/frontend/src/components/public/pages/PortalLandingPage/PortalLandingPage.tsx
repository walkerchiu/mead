'use client';

import { useCallback, useEffect, useRef, useState } from 'react';

import Box from '@mui/material/Box';
import { useLocale, useTranslations } from 'next-intl';

import { getLocalPhotos } from '@/lib/portal/plans';
import type { Plan } from '@/types/plan';

import { CarouselDots } from '../../atoms/CarouselDots';
import { DecorativeTextCloud } from '../../organisms/DecorativeTextCloud';
import { PlanCarousel } from '../../organisms/PlanCarousel';
import { PortalFooter } from '../../organisms/PortalFooter';
import { PortalNarrativeSection } from '../../organisms/PortalNarrativeSection';
import { portalTokens } from '../../tokens';

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
 * 往上倒退的觸發距離（px）：捲到卡頂後，還要再往上捲過此距離（卡片往下滑、上方露出
 * 空隙）才倒退上一張。上一張從「卡頂」進場（上半不被截、留 PIN_TOP_PAD 上方間距）。
 */
const UP_THRESHOLD = 200;
/**
 * 切換後鎖住滾輪的時間（ms）：吸收觸控板 / 滑鼠的慣性殘餘 wheel 事件，確保「一次
 * 手勢只切一張」。沒有這道鎖，一次快速滑動的動量會連續累加、一口氣衝過好幾張卡，
 * 看起來就是「意外的快速左右切換」。
 */
const GESTURE_LOCK_MS = 700;
/** 自動輪播間隔（手機 / 非捲動驅動時） */
const AUTO_ADVANCE_MS = 6000;

/**
 * PortalLandingPage — 教育部藝術設計三大計畫入口網首頁。
 *
 * 由上而下：hero 文字雲（佔滿首屏）→ 計畫介紹大卡 → 敘事 → 指示點 → 頁尾。
 *
 * 計畫介紹區（≥834px、非減少動態）採「釘住 + 滾輪驅動」的離散切換：
 *  - 捲到該區即釘住、鎖住頁面捲動，改由滾輪累積驅動目前卡片往上露出。
 *  - 捲超過「卡片 + 一小段空白」後 → 切換到下一張，並把卡片重置回頂端（重新往下捲）。
 *  - 往回捲到卡頂後 → 倒退回上一張（切換觸發區在上方），可反向看完三張。
 *  - 三張都看過後，往下捲才放行到敘事 / 頁尾；往上捲到第一張頂端則回到 hero。
 *  - 兩側 peek 隨時可切換（會記入「已看過」）。因為要捲超過一整張卡才切換，慣性
 *    微抖動遠不及一張卡的量，故不會誤觸左右切換。
 * <834px 或 prefers-reduced-motion：不劫持捲動，原生捲動 + 自動輪播 + 指示點切換。
 */
export function PortalLandingPage({ plans }: PortalLandingPageProps) {
  const t = useTranslations('portal');
  const locale = useLocale();
  const language = locale.startsWith('zh') ? 'zh' : 'en';

  // 目前顯示的計畫索引（供渲染）。互動狀態另以 ref 同步追蹤，供事件處理即時讀取。
  const [activeIndex, setActiveIndex] = useState(0);
  // 桌機 + 非減少動態 → 啟用「釘住 + 滾輪驅動」。
  const [scrollDriven, setScrollDriven] = useState(false);
  // 延後掛載下方計畫區（含 WebGL 星形與 banner 圖）：首屏 hero 入場那幾秒不掛載，
  // 避免 Three.js / 圖片在主執行緒初始化卡住入場動畫（壓縮會頓成「跳一段」）。
  // 使用者一開始捲動或入場結束後才掛載。
  const [mountPlans, setMountPlans] = useState(false);

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

  // ── 滾輪狀態機的即時狀態（用 ref 以免事件處理讀到舊值）──
  const engagedRef = useRef(false); // 是否釘住、攔截滾輪中
  const idxRef = useRef(0); // 目前卡片索引
  const offsetRef = useRef(0); // 目前卡片的捲動位移（0 = 卡頂；= 卡片露出量）
  const seenRef = useRef<Set<number>>(new Set([0])); // 已看過的卡片
  const segLenRef = useRef(0); // 每張卡往下的捲動量 = 卡片可捲距離 + DWELL_PX
  const prevYRef = useRef(0); // 上一次捲動位置（判斷進入方向）
  const lockedDirRef = useRef(0); // 切換後鎖住的方向（1=往下、-1=往上、0=未鎖）；
  // 只擋同方向的慣性殘餘，反方向（刻意反轉）立即放行。
  const lockTimerRef = useRef<number | null>(null);

  // 桌機 + 非減少動態 → 啟用捲動驅動；視窗變動時即時校正。
  useEffect(() => {
    if (typeof window === 'undefined') return;
    const mqDesktop = window.matchMedia('(min-width:834px)');
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
    seenRef.current.add(target);
    setActiveIndex(target);
  }, []);

  // 釘住並切到指定卡片（dots / 由上下進入時用）：鎖住捲動於本區。進入時「不」上鎖
  // ——上鎖會讓剛進來就想繼續捲被卡住「頓一下」。入場慣性的吸收交給「切換後的鎖」。
  // atTop：true → 卡片重置到卡頂（往下 / dots 進入）；false → 保留目前露出位置
  // （往上由下方進入時用，讓卡片從 native 捲入的位置順順往上收回卡頂、不瞬間跳動）。
  const engageAt = useCallback((index: number, atTop = true) => {
    engagedRef.current = true;
    lockedDirRef.current = 0;
    if (lockTimerRef.current) {
      window.clearTimeout(lockTimerRef.current);
      lockTimerRef.current = null;
    }
    idxRef.current = index;
    seenRef.current.add(index);
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
  useEffect(() => {
    if (!scrollDriven || !mountPlans) return;
    const measure = () => {
      const wrap = cardWrapRef.current;
      if (!wrap) return;
      const vh = window.innerHeight;
      const cardMax = Math.max(0, wrap.scrollHeight - (vh - PIN_TOP_PAD));
      segLenRef.current = cardMax + DWELL_PX;
    };
    measure();
    const tid = window.setTimeout(measure, 400);
    window.addEventListener('resize', measure);
    return () => {
      window.clearTimeout(tid);
      window.removeEventListener('resize', measure);
    };
  }, [scrollDriven, mountPlans]);

  // 滾輪驅動的離散狀態機 + 釘住期間鎖住頁面捲動。
  useEffect(() => {
    if (!scrollDriven) return;
    prevYRef.current = window.scrollY;
    const blockTop = () => planSectionRef.current?.offsetTop ?? 0;

    const release = () => {
      engagedRef.current = false;
      lockedDirRef.current = 0;
      if (lockTimerRef.current) {
        window.clearTimeout(lockTimerRef.current);
        lockTimerRef.current = null;
      }
    };

    const onWheel = (e: WheelEvent) => {
      if (!engagedRef.current) return;
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
        // 已在最後一張：三張都看過 → 放行往下（不攔截，原生捲動進入敘事 / 頁尾）
        if (seenRef.current.size >= planCount) {
          release();
          return;
        }
        // 尚未看完（例如用 peek 跳著看）→ 切到第一張還沒看過的，強制看完才放行
        let unseen = -1;
        for (let k = 0; k < planCount; k += 1) {
          if (!seenRef.current.has(k)) {
            unseen = k;
            break;
          }
        }
        if (unseen >= 0) {
          e.preventDefault();
          commitSwitch(unseen, 0);
          lockGesture(1);
        } else {
          release();
        }
        return;
      }
      // dy < 0：往上
      const next = offsetRef.current + dy;
      if (i === 0) {
        // 第一張：往上把卡片收回卡頂後即釋放回 hero（offset 不往負、上方無凹槽、不需門檻）。
        if (next > 0) {
          e.preventDefault();
          offsetRef.current = next;
          applyReveal();
          return;
        }
        offsetRef.current = 0;
        applyReveal();
        release();
        return;
      }
      // 非第一張：捲到卡頂後再往上累積（offset 記為負、但卡片停在頂端不露凹槽），
      // 過 UP_THRESHOLD 才倒退上一張（從卡頂進場），並上鎖。
      if (next > -UP_THRESHOLD) {
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
        // 釘住期間鎖住捲動（攔截滾輪外的捲動來源：鍵盤 / 捲軸）。
        if (Math.abs(y - bt) > 1) window.scrollTo(0, bt);
        prevYRef.current = bt;
        return;
      }
      // 未釘住：偵測捲動跨越本區頂端 → 釘住並依方向進場（皆從卡頂進場、上半不被截）。
      if (segLenRef.current > 0) {
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

    window.addEventListener('wheel', onWheel, { passive: false });
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => {
      window.removeEventListener('wheel', onWheel);
      window.removeEventListener('scroll', onScroll);
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

  // 自動輪播：僅在「非捲動驅動」（手機 / 減少動態）時啟用。
  useEffect(() => {
    if (scrollDriven) return;
    if (planCount <= 1) return;
    if (
      typeof window !== 'undefined' &&
      window.matchMedia?.('(prefers-reduced-motion: reduce)').matches
    ) {
      return;
    }
    const id = window.setInterval(() => {
      setActiveIndex((cur) => (cur + 1) % planCount);
    }, AUTO_ADVANCE_MS);
    return () => window.clearInterval(id);
  }, [scrollDriven, planCount]);

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

  // 預載各計畫的裝飾星形照片：星形（PaperFlipStar）在掛載後才以 new Image() 載貼圖、
  // 載完才顯示。延到計畫區掛載後才預載，避免和 hero 入場搶主執行緒。
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

  // 兩側 peek 點擊（捲動驅動）：明確導覽 — 直接切到目標卡（回頂端、記入已看過），
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
        {/* 第一屏 — 文字雲佔滿整個視窗高度 */}
        <Box
          sx={{
            minHeight: '100vh',
            display: 'flex',
            // <834px（手機）：靠頂對齊，讓 hero 色塊頂塊上緣切齊視窗頂（依手機稿）；
            // ≥834px（桌機）：維持垂直置中。
            alignItems: 'flex-start',
            justifyContent: 'center',
            [portalTokens.mq.tabletUp]: { alignItems: 'center' },
            // 文字雲側邊圖片略微溢出時裁掉水平方向，避免出現橫向捲軸
            overflowX: 'clip',
          }}
        >
          <DecorativeTextCloud
            shapeContents={heroShapeContents}
            defaultIndex={activeIndex}
            language={language}
          />
        </Box>

        {/* 計畫介紹大卡 */}
        {scrollDriven ? (
          // 桌機：釘住一屏（鎖住捲動），滾輪驅動卡片露出與離散切換；reveal 位移由
          // PlanCarousel 內部只套在卡片上（不影響兩側固定的 peek）。
          <Box
            ref={planSectionRef}
            sx={{
              height: '100vh',
              overflow: 'hidden',
              pt: `${PIN_TOP_PAD}px`,
              boxSizing: 'border-box',
            }}
          >
            <Box ref={cardWrapRef} sx={{ width: '100%' }}>
              {mountPlans && planCarousel}
            </Box>
          </Box>
        ) : (
          // 手機 / 減少動態：不劫持捲動，原生流；自動輪播 + 指示點切換。
          <Box
            sx={{ width: '100%', pt: `${PIN_TOP_PAD}px`, overflowX: 'clip' }}
          >
            {mountPlans && planCarousel}
          </Box>
        )}

        {/* 敘事段落 */}
        <Box sx={{ mt: 8, [portalTokens.mq.tabletUp]: { mt: 12 } }}>
          <PortalNarrativeSection
            leadParagraph={t('narrative.lead')}
            statement={t('narrative.statement')}
            trailParagraph={t('narrative.trail')}
            trailParagraph2={t('narrative.trail2')}
          />
        </Box>

        {/* 輪播指示點 — 依 Figma node 1:2：置於敘事段落之後、頁尾之前；
          ≥834px 靠右並帶間距，<834px 置中 */}
        <Box sx={{ mt: 8, [portalTokens.mq.tabletUp]: { mt: 19 } }}>
          <Box
            sx={{
              maxWidth: portalTokens.layout.maxWidth,
              mx: 'auto',
              px: `${portalTokens.layout.gutter}px`,
            }}
          >
            <Box
              sx={{
                maxWidth: 760,
                mx: 'auto',
                display: 'flex',
                justifyContent: 'center',
                [portalTokens.mq.tabletUp]: {
                  justifyContent: 'flex-end',
                  pr: '84px',
                },
              }}
            >
              <CarouselDots
                count={orderedPlans.length}
                activeIndex={activeIndex}
                onSelect={handleDotSelect}
                labels={orderedPlans.map((p) => p.name.zh)}
                ariaLabel="計畫切換"
              />
            </Box>
          </Box>
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
