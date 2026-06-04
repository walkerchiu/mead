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

/** 釘住區大卡上方留給裝飾星形照片的內距（DECOR_STARS y≈-112） */
const PIN_TOP_PAD = 140;
/**
 * 卡片完整捲完後、切換前露出的「少量空白」距離（以視窗高為單位）。
 * 每個計畫的捲動段長 = 卡片實測可捲距離 + 此空白，故不論視窗高矮、卡片高低，
 * 空白都維持這一小段（不會在高螢幕上爆量）。想加大／縮小兩計畫間距就調此值。
 */
const DWELL_VH = 0.12;

/**
 * PortalLandingPage — 教育部藝術設計三大計畫入口網首頁。
 *
 * 由上而下：hero 文字雲（佔滿首屏）→ 計畫介紹大卡（桌機：sticky 釘住、滾動驅動）
 * → 敘事 → 指示點 → 頁尾。
 *
 * 計畫介紹區（≥834px）：捲到該段時 sticky 釘在畫面中；段內滾動先把當前計畫大卡
 * 往上捲、看完整張（KPI、banner），捲到卡底再 snap 左右切換到下一個計畫（沿用
 * PlanCarousel 的左右滑動轉場）。三個計畫依序看完後，繼續往下滑進入 Footer。
 * <834px 或 prefers-reduced-motion：不劫持捲動，改為原生捲動 + 指示點手動切換。
 */
export function PortalLandingPage({ plans }: PortalLandingPageProps) {
  const t = useTranslations('portal');
  const locale = useLocale();
  const language = locale.startsWith('zh') ? 'zh' : 'en';

  // 目前顯示的計畫索引（首屏之後即直接展示完整計畫大卡，預設第一個計畫）。
  const [activeIndex, setActiveIndex] = useState(0);
  // 是否啟用「sticky 釘住 + 滾動驅動切換」：桌機且未開啟減少動態偏好。
  const [scrollDriven, setScrollDriven] = useState(false);
  // 每個計畫段的捲動距離（px）= 卡片實測可捲距離 + 少量空白（DWELL_VH）。
  // 用實測值而非固定屏數，確保高螢幕（卡片幾乎塞得下）也只留少量空白。
  const [segPx, setSegPx] = useState(0);

  // 卡片顯示順序：依設計稿固定為 sposad → idc → tisdc；任何未列入者補在後面
  const orderedPlans: Plan[] = [
    ...PLAN_ORDER.map((id) => plans.find((p) => p.id === id)).filter(
      (p): p is Plan => Boolean(p),
    ),
    ...plans.filter((p) => !PLAN_ORDER.includes(p.id)),
  ];
  const planCount = orderedPlans.length;

  // 釘住軌道（撐出捲動距離）與承載 reveal CSS 變數的包裝層。
  const planTrackRef = useRef<HTMLDivElement>(null);
  const cardWrapRef = useRef<HTMLDivElement>(null);
  // 追蹤上一影格的計畫段與 reveal 位移：切換瞬間用「離開那一刻的 reveal」凍結退場卡
  // （--exit-reveal-y），讓退場卡與入場卡各自垂直定位、不會瞬間跳回頂端。
  const lastIdxRef = useRef(0);
  const lastRevealRef = useRef(0);

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

  // 量測每段捲動距離 segPx = 卡片可捲距離（總高 − 釘住可視高）+ 少量空白。
  // mount、視窗縮放、與圖片載入後（延遲再量一次）各量一次；不隨切換卡片重量，
  // 維持軌道高度穩定（三張卡高度相近，差異可忽略）。
  useEffect(() => {
    if (!scrollDriven) {
      setSegPx(0);
      return;
    }
    const measure = () => {
      const wrap = cardWrapRef.current;
      if (!wrap) return;
      const vh = window.innerHeight;
      const maxY = Math.max(0, wrap.scrollHeight - (vh - PIN_TOP_PAD));
      setSegPx(maxY + DWELL_VH * vh);
    };
    measure();
    const t = window.setTimeout(measure, 400); // 待 banner 圖等載入後再量
    window.addEventListener('resize', measure);
    return () => {
      window.clearTimeout(t);
      window.removeEventListener('resize', measure);
    };
  }, [scrollDriven]);

  // 捲動驅動：把釘住軌道的捲動進度 p(0→1) 拆成「目前計畫段 + 段內進度」。
  // 卡片整段都 1:1 隨捲動往上移（reveal = 段內捲動量），捲過卡底後下方露出 DWELL_VH
  // 的少量空白，再跨入下一段時 snap 切換 activeIndex（PlanCarousel 接手左右滑動）。
  // reveal 直接寫進 DOM CSS 變數（不經 React state）以免每幀 re-render；只有
  // activeIndex 改變（跨段）時才 setState 觸發滑動。
  useEffect(() => {
    if (!scrollDriven || segPx <= 0) return;
    const track = planTrackRef.current;
    const wrap = cardWrapRef.current;
    if (!track || !wrap) return;
    let raf = 0;
    const update = () => {
      raf = 0;
      const pinDistance = Math.max(1, planCount * segPx);
      const p = Math.min(
        1,
        Math.max(0, -track.getBoundingClientRect().top / pinDistance),
      );
      const planFloat = Math.min(planCount - 1e-6, p * planCount);
      const idx = Math.min(planCount - 1, Math.floor(planFloat));
      const intra = planFloat - idx;
      const reveal = intra * segPx;
      // 切換到新計畫段：把「離開那一刻的 reveal」凍進 --exit-reveal-y 給退場卡，
      // 入場卡則用即時的 --reveal-y（新段約為 0、卡頂對齊）。
      if (idx !== lastIdxRef.current) {
        wrap.style.setProperty('--exit-reveal-y', `${lastRevealRef.current}px`);
        lastIdxRef.current = idx;
      }
      wrap.style.setProperty('--reveal-y', `${reveal.toFixed(2)}px`);
      lastRevealRef.current = reveal;
      setActiveIndex((cur) => (cur === idx ? cur : idx));
    };
    const onScroll = () => {
      if (!raf) raf = window.requestAnimationFrame(update);
    };
    update();
    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onScroll, { passive: true });
    return () => {
      window.removeEventListener('scroll', onScroll);
      window.removeEventListener('resize', onScroll);
      if (raf) window.cancelAnimationFrame(raf);
    };
  }, [scrollDriven, planCount, segPx]);

  // 預載各計畫的裝飾星形照片：星形（PaperFlipStar）在掛載後才以 new Image() 載貼圖、
  // 載完才顯示。先在首頁掛載時把這些照片放進瀏覽器快取，切換計畫時星形貼圖即可即時
  // 取用、與卡片同時出現，不會「卡片先到、照片晚一拍才冒出」。
  useEffect(() => {
    if (typeof window === 'undefined') return;
    plans.forEach((plan) => {
      getLocalPhotos(plan).forEach((photo) => {
        if (photo.src) {
          const img = new Image();
          img.src = photo.src;
        }
      });
    });
  }, [plans]);

  // 捲動驅動時，某計畫段落起點的捲動 y（reveal 歸零、卡頂對齊）。
  const planScrollTop = useCallback(
    (i: number) => {
      const track = planTrackRef.current;
      if (!track || segPx <= 0) return null;
      return track.offsetTop + i * segPx;
    },
    [segPx],
  );

  // 指示點點選：捲動驅動時平順捲到該計畫段落；否則直接切 activeIndex。
  const handleDotSelect = useCallback(
    (i: number) => {
      const top = scrollDriven ? planScrollTop(i) : null;
      if (top !== null) {
        window.scrollTo({ top, behavior: 'smooth' });
        return;
      }
      setActiveIndex(i);
    },
    [scrollDriven, planScrollTop],
  );

  // 兩側 peek 點擊（捲動驅動）：即時捲到目標計畫段落起點，由捲動進度觸發左右滑動，
  // 卡片即在頂端切換、無停頓（不直接改 index 以免與捲動位置脫鉤）。
  const handlePeekNavigate = useCallback(
    (targetIndex: number) => {
      const top = planScrollTop(targetIndex);
      if (top !== null) window.scrollTo({ top, behavior: 'auto' });
    },
    [planScrollTop],
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
        // 釘住軌道收放與 WebGL 星形陸續掛載會造成版面位移；停用本頁子樹的 scroll
        // anchoring，避免瀏覽器自動回補捲動與釘住對齊互相拉扯。
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
          // 桌機：sticky 釘住 + 滾動驅動。軌道高 = 釘住捲動距離(planCount × segPx) + 1 屏，
          // 內層 sticky 釘在畫面頂；段內捲動把大卡往上捲看完整張 + 少量空白，
          // 跨段 snap 切換到下一計畫，捲完最後一計畫即釋放、繼續往下到 Footer。
          <Box
            ref={planTrackRef}
            sx={{
              position: 'relative',
              height: `calc(${planCount * segPx}px + 100vh)`,
            }}
          >
            <Box
              sx={{
                position: 'sticky',
                top: 0,
                height: '100vh',
                overflow: 'hidden',
                pt: `${PIN_TOP_PAD}px`,
                boxSizing: 'border-box',
              }}
            >
              {/* 承載 --reveal-y / --exit-reveal-y：reveal 位移由 PlanCarousel 內部
                  只套在卡片上（不影響兩側 peek，peek 因此固定不隨卡片上移）。 */}
              <Box ref={cardWrapRef} sx={{ width: '100%' }}>
                {planCarousel}
              </Box>
            </Box>
          </Box>
        ) : (
          // 手機 / 減少動態：不劫持捲動，原生流；自動輪播 + 指示點切換。
          <Box
            sx={{ width: '100%', pt: `${PIN_TOP_PAD}px`, overflowX: 'clip' }}
          >
            {planCarousel}
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
