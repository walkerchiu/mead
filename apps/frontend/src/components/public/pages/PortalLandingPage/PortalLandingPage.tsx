'use client';

import {
  useCallback,
  useEffect,
  useRef,
  useState,
  type ReactNode,
} from 'react';

import Box from '@mui/material/Box';
import { useLocale, useTranslations } from 'next-intl';

import { getLocalPhotos } from '@/lib/portal/plans';
import type { Plan } from '@/types/plan';

import { CarouselDots } from '../../atoms/CarouselDots';
import { DecorativeTextCloud } from '../../organisms/DecorativeTextCloud';
import { PlanCarousel } from '../../organisms/PlanCarousel';
import { PlanCardWithStars } from '../../organisms/PlanCarousel/PlanCarousel';
import { PortalFooter } from '../../organisms/PortalFooter';
import { PortalIntroSection } from '../../organisms/PortalIntroSection';
import { PortalNarrativeSection } from '../../organisms/PortalNarrativeSection';
import { portalTokens } from '../../tokens';

export interface PortalLandingPageProps {
  /** 三大計畫資料 */
  plans: Plan[];
}

/** 過場區卡片顯示順序（依設計稿：菁培 → 設計戰國策 → 創意設計大賽） */
const PLAN_ORDER: string[] = ['sposad', 'idc', 'tisdc'];

/**
 * hero 各計畫色塊 hover 時輪換的照片（依設計稿選用，非全部）。
 * 值為該計畫 local 照片陣列（getLocalPhotos 順序 = photo_01.. 檔名序）的索引：
 *  - sposad（菁培）：photo_01 / 02 / 04 / 05
 *  - idc（設計戰國策）：photo_01 / 02 / 03 / 05
 *  - tisdc（創意設計大賽）：photo_01 / 02 / 03（共三張，全用）
 */
const HERO_PHOTO_INDICES: Record<string, number[]> = {
  sposad: [0, 1, 3, 4],
  idc: [0, 1, 2, 4],
  tisdc: [0, 1, 2],
};

/** hover 計畫卡時主標「讓 ___ 被看見」的橘色關鍵字（依設計稿過場效果） */
const HOVER_KEYWORD: Record<string, string> = {
  sposad: '人',
  idc: '創意',
  tisdc: '競賽',
};

/**
 * 往下捲展開的 scrub 轉場滾動距離（以屏數計）。越大，主標與三張卡片淡出 / 上移的
 * 鋪陳越長、捲到底 commit 展開大卡時越不突然。
 */
const SCRUB_SCREENS = 1;
/**
 * sticky 軌道總高（屏數）= scrub 區 + 1 屏停留；內層 minHeight 100vh，故 sticky 的
 * pin 範圍 = 軌道高 − 1 屏 = SCRUB_SCREENS 屏，剛好涵蓋整段 scrub。
 */
const TRACK_SCREENS = SCRUB_SCREENS + 1;

/**
 * PortalLandingPage — 教育部藝術設計三大計畫入口網首頁。
 *
 * 由上而下：hero 文字雲 → 主標題 → 三大計畫展開／收合互動區 → 敘事 → 頁尾。
 * 互動區靜止時為三張收合卡並列，點擊展開該計畫；展開計畫與文字雲、指示點
 * 共用 expandedIndex 狀態，hover 卡片則以 hoverIndex 切換主標 slogan。
 */
export function PortalLandingPage({ plans }: PortalLandingPageProps) {
  const t = useTranslations('portal');
  const locale = useLocale();
  const language = locale.startsWith('zh') ? 'zh' : 'en';

  // null = 靜止（三張收合卡並列）；數字 = 已展開該計畫（依過場效果影片與說明）
  const [expandedIndex, setExpandedIndex] = useState<number | null>(null);
  // hover 計畫卡片時，主標切換為該計畫對應的關鍵字 slogan（依設計稿過場效果說明）
  const [hoverIndex, setHoverIndex] = useState<number | null>(null);
  // 點擊卡片到計畫詳細卡完整入場的過渡期：
  //  - 其他 mini cards 淡出，被點的卡與主標「整句一起往上抽離 → 停 0.5s →
  //    黑字繼續上升淡出 → 橘字守住短暫停留後淡出」
  //  - 主標退場結束後，大卡才從左下方滑入（onExpandedIndexChange 由
  //    PlanCarousel.EXIT_MS timer 觸發）。
  //
  // 故意「不」在 onExpandedIndexChange 清掉 isExiting：CSS animation 的
  // forwards 終態（橘字 opacity=0）只在 animation declaration 還在時才會
  // 維持。一旦清掉，元素會「彈回」base style → 主標瞬間又出現在原位閃一下。
  // 保持 isExiting=true 讓退場動畫終態鎖在那裡，expanded 模式下主標保持
  // 不可見，視覺上和「整句被抽走」的故事一致。
  const [isExiting, setIsExiting] = useState(false);
  // 點擊到展開過渡期內、要從左下方滑入第二屏中央的計畫索引。
  // PlanCarousel.onSelectStart(i) 觸發；handleExpandedIndexChange 在 EXIT_MS
  // 結束時清掉（這時 PlanCarousel 展開分支接手以原位渲染同張大卡）。
  const [pendingPlanIndex, setPendingPlanIndex] = useState<number | null>(null);
  const handleSelectStart = (i: number) => {
    setIsExiting(true);
    setPendingPlanIndex(i);
  };
  // sticky 軌道容器與其釘住的第二屏內層 — 供 scrub 計算捲動進度、寫入 --scrub。
  const secondScreenRef = useRef<HTMLDivElement>(null);
  const stickyInnerRef = useRef<HTMLDivElement>(null);
  // 展開那一刻把第二屏軌道頂端對齊視窗頂，讓計畫大卡頂端（含上緣裝飾星形）貼齊
  // 視窗、上半完整可見，其餘隨頁面自然往下捲。
  //  - 雙 rAF：先讓 React 完成 commit、再等瀏覽器重新 layout（軌道由 150vh 收成
  //    auto、expanded 版型的 paddingTop 已套用）後才對齊。
  //  - 用即時對齊（非 smooth）：軌道收縮會觸發瀏覽器 scroll anchoring，與 smooth
  //    捲動相互拉扯會讓卡片中途亂跳；即時對齊一步到位，落點穩定。
  const reframeToCard = useCallback(() => {
    // commit 後軌道由 150vh 收成 auto、WebGL 星形畫布陸續掛載，layout 會分多幀
    // 才穩定；單次對齊容易被後續位移蓋掉，故在數幀間重試把軌道頂對齊視窗頂。
    let tries = 0;
    const align = () => {
      const track = secondScreenRef.current;
      if (track) window.scrollTo({ top: track.offsetTop, behavior: 'auto' });
      if (tries++ < 6) setTimeout(align, 50);
    };
    setTimeout(align, 0);
  }, []);
  const handleExpandedIndexChange = (i: number) => {
    const wasCollapsed = expandedIndex === null;
    setExpandedIndex(i);
    setPendingPlanIndex(null);
    // 僅「收合 → 首次展開」需要對齊；展開後切換計畫（dots / peek）不重新捲動。
    if (wasCollapsed) reframeToCard();
  };

  // 漸進 scrub：使用者未點任何卡、往下捲過 sticky 軌道前段 SCRUB_SCREENS 屏的 scrub
  // 區時，把進度 p(0→1) 寫進內層的 --scrub CSS 變數，驅動主標與三張卡片跟著捲動逐步
  // 淡出 / 上移 / 微放大（以 CSS 變數而非 React state 驅動，避免每幀 re-render）。
  // p 抵達 ~0.9 時 commit 展開第一個計畫，讓互動式大卡接手。scrub 區越長（SCRUB_SCREENS
  // 越大）轉場越從容、切換越不突然。
  useEffect(() => {
    if (expandedIndex !== null) return;
    const track = secondScreenRef.current;
    if (!track) return;
    const inner = stickyInnerRef.current;
    let raf = 0;
    const update = () => {
      raf = 0;
      // scrub 區 = 軌道前 SCRUB_SCREENS 屏；track 頂上移多少（相對此距離）即進度。
      const denom = Math.max(1, SCRUB_SCREENS * window.innerHeight);
      const p = Math.min(
        1,
        Math.max(0, -track.getBoundingClientRect().top / denom),
      );
      inner?.style.setProperty('--scrub', p.toFixed(4));
      if (p >= 0.9) {
        setExpandedIndex(0);
        reframeToCard();
      }
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
  }, [expandedIndex, reframeToCard]);

  // 展開模式自動輪播：展開計畫大卡後，若使用者沒有 hover 在卡片上，每隔
  // AUTO_ADVANCE_MS 自動切到下一個計畫（環狀）；hover 任一卡時暫停，讓使用者
  // 安心閱讀內容與操作按鈕。
  //  - 外部改變 expandedIndex 會被 PlanCarousel 偵測並播放左右滑動轉場（與 dots
  //    點擊同一條路徑），所以這裡只需推進索引。
  //  - 暫停條件：hoverIndex !== null（hover 大卡時 onHoverPlanChange 會回報索引）。
  //  - prefers-reduced-motion 時完全停用：尊重減少動態偏好，並符合 WCAG 2.2.2
  //    「自動更新內容需可暫停」的精神（peek 與 dots 仍提供手動切換）。
  useEffect(() => {
    if (expandedIndex === null) return; // 僅展開模式才輪播
    if (hoverIndex !== null) return; // hover 卡片 → 暫停自動輪播
    if (plans.length <= 1) return;
    if (
      typeof window !== 'undefined' &&
      window.matchMedia?.('(prefers-reduced-motion: reduce)').matches
    ) {
      return;
    }
    const AUTO_ADVANCE_MS = 6000; // 6s／張 — 足夠閱讀，不致「太快切換」
    const id = window.setInterval(() => {
      setExpandedIndex((cur) =>
        cur === null ? cur : (cur + 1) % plans.length,
      );
    }, AUTO_ADVANCE_MS);
    return () => window.clearInterval(id);
  }, [expandedIndex, hoverIndex, plans.length]);

  // 預載各計畫的裝飾星形照片：星形（PaperFlipStar）在掛載後才以 new Image() 載貼圖、
  // 載完才顯示。先在首頁掛載時把這些照片放進瀏覽器快取，展開卡片時星形貼圖即可即時
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

  // 卡片顯示順序：依設計稿固定為 sposad → idc → tisdc；任何未列入者補在後面
  const orderedPlans: Plan[] = [
    ...PLAN_ORDER.map((id) => plans.find((p) => p.id === id)).filter(
      (p): p is Plan => Boolean(p),
    ),
    ...plans.filter((p) => !PLAN_ORDER.includes(p.id)),
  ];

  // 指示點 / aria-live 對應的計畫：靜止時為第一個，展開後為該計畫
  const activePlan = orderedPlans[expandedIndex ?? 0] ?? orderedPlans[0];

  if (!activePlan) return null;

  // hero 文字雲：整片雲一次顯示「目前作用中計畫」的裝飾文字（defaultIndex =
  // expandedIndex ?? 0）；hover 某色塊即切換成該計畫的文字並於塊內顯示其照片。
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

  // 計畫 fallback slogan（非 zh 語系或無關鍵字對應時使用）
  const sloganOf = (plan: Plan) =>
    plan.slogan.zh ??
    plan.slogan.en ??
    plan.decorativeText[0]?.zh ??
    plan.decorativeText[0]?.en ??
    plan.name.zh;

  // 主標：未 hover → 整體主標；hover 任何計畫 → 「讓 [關鍵字 橘] 被看見」（zh）
  //
  // 依 IMPLEMENTATION.md §4.1：
  //   - 預設↔hover：整句交叉淡化（0.30s）
  //   - 「關鍵字不做下方升起進場」→ keyword 僅換字、不獨立動畫
  //   - 同 hover 跨卡：headingKey 統一 → 不重新 cross-fade、只換 keyword 文字
  const hoveredPlan = hoverIndex != null ? orderedPlans[hoverIndex] : undefined;
  // 主標黑字節點都包成 data-slogan-black span，讓 PortalIntroSection 在 exiting
  // 時能對黑字（讓 / 被看見）與橘字（keyword）套用不同 keyframes：黑字升高
  // 後繼續飄出視窗、橘字升高後守住原處短暫停留再淡出（依使用者「橘色關鍵字
  // 抓住一下才放手」的描述）。
  let heading: ReactNode = (
    <Box component="span" data-slogan-black="">
      {t('heading')}
    </Box>
  );
  let headingKey = 'default';
  if (hoveredPlan) {
    headingKey = 'hover';
    const kw = language === 'zh' ? HOVER_KEYWORD[hoveredPlan.id] : undefined;
    heading = kw ? (
      <>
        <Box component="span" data-slogan-black="">
          讓&nbsp;&nbsp;
        </Box>
        {/* keyword：TYPE.keyword 46px / 700 / 橘色。
            data-slogan-keyword：PortalIntroSection 在 exiting 時對 keyword 套
            sloganExitKeywordGrip（升高後守住原處、最後才淡出）。
            key={hoveredPlan.id}：跨卡 hover 時 React 重新 mount 此節點，
            觸發下方 keyword swap fade — 與 PlanCarousel 的「橘字接力」動畫同拍交換。 */}
        <Box
          key={`kw-${hoveredPlan.id}`}
          component="span"
          data-slogan-keyword=""
          sx={{
            display: 'inline-block',
            color: portalTokens.color.brandOrange,
            fontSize: 24,
            fontWeight: 700,
            // 跨卡 hover 時：前 ~45% 維持隱藏（與卡片橘字「飛行中」時間對齊），
            // 後段淡入，與目標卡橘字「落地」同步出現。純 opacity 不縮放、不位移，
            // 避免主標基線在切換時抖動。
            animation: 'kwSwap 460ms cubic-bezier(0.22, 1, 0.36, 1)',
            '@keyframes kwSwap': {
              '0%': { opacity: 0 },
              '45%': { opacity: 0 },
              '100%': { opacity: 1 },
            },
            '@media (prefers-reduced-motion: reduce)': {
              animation: 'none',
            },
          }}
        >
          {kw}
        </Box>
        <Box component="span" data-slogan-black="">
          &nbsp;&nbsp;被看見
        </Box>
      </>
    ) : (
      <Box component="span" data-slogan-black="">
        {sloganOf(hoveredPlan)}
      </Box>
    );
  }

  return (
    <Box
      sx={{
        minHeight: '100vh',
        bgcolor: portalTokens.color.pageBg,
        display: 'flex',
        flexDirection: 'column',
        // 展開計畫時第二屏軌道由 150vh 收成 auto、WebGL 星形畫布陸續掛載，會造成
        // 版面位移；瀏覽器的 scroll anchoring 會為此自動回補捲動位置，與 reframeToCard
        // 的對齊互相拉扯。停用本頁子樹的 anchoring，讓對齊一步到位、落點穩定。
        overflowAnchor: 'none',
        // 注意：水平裁切不放在這層 —— overflow-x:clip 會讓此元素成為下方第二屏
        //   sticky 的 containing block，使 position:sticky 失效（內層會跟著捲走、
        //   釘不住）。水平裁切放在「第一屏」與「sticky 內層」各自身上：元素自身
        //   的 overflow 不會破壞它自己的 sticky；overflow-x:clip 也保留
        //   overflow-y:visible，主標往上飛出視窗的退場動畫不受影響。
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
        {/* 視覺隱藏的常駐 h1（WCAG 1.3.1 / 2.4.6）：expanded 模式下
            PortalIntroSection unmount，整頁就沒 h1；給讀屏使用者一個
            穩定的頁面語意主標。視覺 hierarchy 仍由 PortalIntroSection
            的 visible slogan（已改 h2）/ PlanCard 的 h2 接力呈現。*/}
        <Box component="h1" className="visually-hidden">
          {t('eyebrow')} | {t('footer.siteName')}
        </Box>
        {/* aria-live status — 計畫展開／切換時告知讀屏使用者目前查看哪個計畫
            （WCAG 4.1.3 Status Messages）。刻意只在 expandedIndex 變動時更新，
            不掛 hover；hover 是即時視覺回饋，無需逐次播報以免干擾。*/}
        <Box
          role="status"
          aria-live="polite"
          aria-atomic="true"
          className="visually-hidden"
        >
          {expandedIndex !== null
            ? t('viewingPlan', { name: activePlan.name.zh })
            : ''}
        </Box>
        {/* 第一屏 — 文字雲佔滿整個視窗高度 */}
        <Box
          sx={{
            minHeight: '100vh',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            // 文字雲側邊圖片略微溢出時裁掉水平方向，避免出現橫向捲軸
            overflowX: 'clip',
          }}
        >
          <DecorativeTextCloud
            shapeContents={heroShapeContents}
            defaultIndex={expandedIndex ?? 0}
            language={language}
          />
        </Box>

        {/* 第二屏軌道 —
            - static（expandedIndex === null）：軌道 TRACK_SCREENS 屏，內層 position:sticky
              釘在畫面頂端、釘住 SCRUB_SCREENS 屏的 scrub 區；主標與 mini cards 跟著捲動
              進度逐步展開，捲到底（p≈0.9）commit 展開第一個計畫。
            - expanded（expandedIndex !== null）：軌道高度 auto，內層改為一般流；展開
              那刻 reframeToCard 把軌道頂端對齊視窗頂，大卡頂端（含上緣裝飾星形）貼齊
              視窗、上半完整可見，其餘隨頁面自然往下捲動看完整張大卡。 */}
        <Box
          ref={secondScreenRef}
          sx={{
            position: 'relative',
            height:
              expandedIndex === null ? `${TRACK_SCREENS * 100}vh` : 'auto',
          }}
        >
          <Box
            ref={stickyInnerRef}
            sx={{
              display: 'flex',
              flexDirection: 'column',
              // scrub 進度（0→1）由捲動監聽寫入；主標與卡片以 calc(var(--scrub)) 取用
              '--scrub': '0',
              // hover 浮出時側邊圖片會略微溢出，裁掉水平方向避免出現捲軸。
              // overflow-x:clip 保留 overflow-y:visible，主標往上飛出視窗的退場動畫照常顯示。
              overflowX: 'clip',
              ...(expandedIndex === null
                ? {
                    // scrub 期間釘住內層；overflow 放自身不影響 sticky
                    position: 'sticky',
                    top: 0,
                    minHeight: '100vh',
                    paddingTop: '33vh',
                  }
                : {
                    // expanded：一般流。展開那刻 reframeToCard 會把軌道頂端對齊
                    // 視窗頂，故大卡頂端貼齊視窗、上半完整可見；paddingTop 留
                    // 140px 給大卡上方的裝飾星形照片（DECOR_STARS y≈-112，距視窗
                    // 頂約 28px 透氣間距），其餘隨頁面自然往下捲。
                    position: 'static',
                    paddingTop: '140px',
                  }),
            }}
          >
            {/* 主標 / 副標只在 static / EXIT 期間渲染；expanded 後直接 unmount，
              讓位給計畫大卡佔滿整屏。EXIT 動畫已在 unmount 前完整跑完
              （PlanCarousel.EXIT_MS 結束才 setExpandedIndex），所以不會看到
              「動畫沒跑完就被 unmount」造成的跳動。 */}
            {expandedIndex === null && (
              <Box
                sx={{
                  // 漸進 scrub：主標跟著捲動進度淡出（p 0→0.5）+ 上移。
                  opacity: 'calc(1 - var(--scrub, 0) * 2)',
                  transform: 'translateY(calc(var(--scrub, 0) * -40px))',
                  '@media (prefers-reduced-motion: reduce)': {
                    opacity: 1,
                    transform: 'none',
                  },
                }}
              >
                <PortalIntroSection
                  eyebrow={t('eyebrow')}
                  heading={heading}
                  headingKey={headingKey}
                  exiting={isExiting}
                />
              </Box>
            )}
            <Box
              sx={{
                ...(expandedIndex === null
                  ? {
                      marginTop: 'auto',
                      // 漸進 scrub：三張卡片跟著捲動進度上移 + 微放大（往大卡尺度
                      // 趨近），接近 pin 範圍底（p 0.7→0.9）時淡出，交棒給展開大卡。
                      transformOrigin: 'center bottom',
                      transform:
                        'translateY(calc(var(--scrub, 0) * -24px)) scale(calc(1 + var(--scrub, 0) * 0.06))',
                      opacity: 'calc(1 - (var(--scrub, 0) - 0.7) * 5)',
                      '@media (prefers-reduced-motion: reduce)': {
                        transform: 'none',
                        opacity: 1,
                      },
                    }
                  : {
                      width: '100%',
                    }),
              }}
            >
              <PlanCarousel
                plans={orderedPlans}
                expandedIndex={expandedIndex}
                onExpandedIndexChange={handleExpandedIndexChange}
                onHoverPlanChange={setHoverIndex}
                onSelectStart={handleSelectStart}
              />
            </Box>
            {/* 計畫大卡「從左下方滑入」overlay — 與 PlanCarousel 點擊卡的升起
              同拍進行（Phase A+B 期間滑入到位）。top:140 對齊 expanded 模式
              下大卡的最終位置，EXIT 結束時 PlanCarousel 展開分支以同樣位置
              無動畫接手渲染，視覺上沒有跳動。 */}
            {pendingPlanIndex !== null && orderedPlans[pendingPlanIndex] && (
              <Box
                aria-hidden
                sx={{
                  position: 'absolute',
                  top: '140px',
                  left: 0,
                  right: 0,
                  mx: 'auto',
                  width: '100%',
                  maxWidth: 760,
                  pointerEvents: 'none',
                  zIndex: 5,
                  // 點擊卡 opacity ≈ 0.5（視覺淡出一半、計畫卡開始接力）時才滑出
                  // → delay 3150ms。實測 cubic-bezier(0.22,1,0.36,1) 套在 Phase E
                  // fade（82.6→89%）下，opacity 0.5 的時刻落在 ~3150ms。
                  // `both` 讓 delay 期間鎖在 0% 出發位置（opacity 0、translate(-300,600)）。
                  animation:
                    'planEnterFromBL 500ms cubic-bezier(0.22, 1, 0.36, 1) 3150ms both',
                  '@keyframes planEnterFromBL': {
                    '0%': {
                      transform: 'translate(-300px, 600px)',
                      opacity: 0,
                    },
                    '100%': { transform: 'translate(0, 0)', opacity: 1 },
                  },
                  '@media (prefers-reduced-motion: reduce)': {
                    animation: 'none',
                    opacity: 1,
                  },
                }}
              >
                {/* 過場只滑入卡片本體、不畫裝飾星形：星形是 WebGL，與 commit
                    後正式卡片是兩棵子樹，兩邊都畫會在 handoff 時卸載重載造成
                    照片閃跳。星形交由正式卡片掛載一次（同捲動展開路徑）。 */}
                <PlanCardWithStars
                  plan={orderedPlans[pendingPlanIndex]}
                  showStars={false}
                />
              </Box>
            )}
          </Box>
        </Box>

        {/* 敘事段落（第三屏）。展開第一個計畫由上方 sticky scrub 在捲到 pin
            範圍底時完成，使用者抵達此段時計畫已展開。*/}
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
                activeIndex={expandedIndex ?? 0}
                onSelect={setExpandedIndex}
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
