'use client';

import { useEffect, useRef, useState, type ReactNode } from 'react';

import Box from '@mui/material/Box';
import { useLocale, useTranslations } from 'next-intl';

import { getLocalPhotos } from '@/lib/portal/plans';
import type { Plan } from '@/types/plan';

import { CarouselDots } from '../../atoms/CarouselDots';
import { DecorativeTextCloud } from '../../organisms/DecorativeTextCloud';
import { PlanCarousel } from '../../organisms/PlanCarousel';
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

/** hover 計畫卡時主標「讓 ___ 被看見」的橘色關鍵字（依設計稿過場效果） */
const HOVER_KEYWORD: Record<string, string> = {
  sposad: '人',
  idc: '創意',
  tisdc: '競賽',
};

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
  const handleSelectStart = () => setIsExiting(true);
  const handleExpandedIndexChange = (i: number) => {
    setExpandedIndex(i);
  };
  // 第三屏（敘事段落）的觀察點 — 使用者未點選任何卡、直接往下滑到第三屏時
  // 預設展開第一個計畫（依設計師需求）。改成觀察敘事段落本身（threshold 0、
  // 不縮 rootMargin），確保「視窗看到第三屏」這個事件本身就是觸發條件，不會
  // 受不同 viewport 高度影響觸發時機。
  const narrativeSectionRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (expandedIndex !== null) return;
    const el = narrativeSectionRef.current;
    if (!el || typeof IntersectionObserver === 'undefined') return;
    const obs = new IntersectionObserver(
      (entries) => {
        if (entries.some((e) => e.isIntersecting)) {
          setExpandedIndex(0);
        }
      },
      { threshold: 0 },
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, [expandedIndex]);

  // 卡片顯示順序：依設計稿固定為 sposad → idc → tisdc；任何未列入者補在後面
  const orderedPlans: Plan[] = [
    ...PLAN_ORDER.map((id) => plans.find((p) => p.id === id)).filter(
      (p): p is Plan => Boolean(p),
    ),
    ...plans.filter((p) => !PLAN_ORDER.includes(p.id)),
  ];

  // hero 文字雲與指示點對應的計畫：靜止時為第一個，展開後為該計畫
  const activePlan = orderedPlans[expandedIndex ?? 0] ?? orderedPlans[0];

  if (!activePlan) return null;

  const heroPhotos = getLocalPhotos(activePlan)
    .map((p) => p.src)
    .filter((s): s is string => Boolean(s));

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
            fontSize: 30,
            [portalTokens.mq.tabletUp]: { fontSize: 46 },
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
        // hover 浮出時側邊圖片會略微溢出，裁掉水平方向避免出現捲軸
        overflowX: 'clip',
        // ★ 自訂游標（依使用者圖示） — 32x38 SVG 黑底白邊指標、hotspot 在 (5,5)
        cursor: 'url("/cursors/portal-cursor.svg") 5 5, auto',
        '& button, & a, & [role="button"]': {
          cursor: 'url("/cursors/portal-cursor.svg") 5 5, pointer',
        },
      }}
    >
      {/* <main> landmark — 無障礙必要結構（政府網站規範）；對應 skip-link 目標 */}
      <Box
        component="main"
        id="main-content"
        sx={{ display: 'flex', flexDirection: 'column' }}
      >
        {/* 第一屏 — 文字雲佔滿整個視窗高度 */}
        <Box
          sx={{
            minHeight: '100vh',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <DecorativeTextCloud
            words={activePlan.decorativeText}
            photos={heroPhotos}
            language={language}
          />
        </Box>

        {/* 第二屏 —
            - static / EXIT 中（expandedIndex === null）：100vh 容器、頂部 33vh 留白，
              下方 PortalIntroSection（eyebrow + slogan），最底放 mini cards。
            - expanded（expandedIndex !== null）：100vh 容器，計畫大卡置中佔滿
              整屏；刻意不再渲染 PortalIntroSection，避免主標 + 副標仍佔位、把
              大卡擠到下方（依使用者「計劃卡片應該要佔據第二屏」要求）。 */}
        <Box
          sx={{
            minHeight: '100vh',
            display: 'flex',
            flexDirection: 'column',
            ...(expandedIndex === null
              ? {
                  paddingTop: '33vh',
                }
              : {
                  // expanded：留 140px 給大卡上方的裝飾星形照片（DECOR_STARS y≈-112）
                  // 不被視窗上緣切掉，照片離 viewport 頂緣約 28px 透氣間距。
                  paddingTop: '140px',
                }),
          }}
        >
          {/* 主標 / 副標只在 static / EXIT 期間渲染；expanded 後直接 unmount，
              讓位給計畫大卡佔滿整屏。EXIT 動畫已在 unmount 前完整跑完
              （PlanCarousel.EXIT_MS 結束才 setExpandedIndex），所以不會看到
              「動畫沒跑完就被 unmount」造成的跳動。 */}
          {expandedIndex === null && (
            <PortalIntroSection
              eyebrow={t('eyebrow')}
              heading={heading}
              headingKey={headingKey}
              exiting={isExiting}
            />
          )}
          <Box
            sx={{
              ...(expandedIndex === null
                ? { marginTop: 'auto' }
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
        </Box>

        {/* 敘事段落（第三屏） — ref 由 IntersectionObserver 監聽：使用者
            未點任何卡、第一次滑到此段落時自動展開第一個計畫。*/}
        <Box
          ref={narrativeSectionRef}
          sx={{ mt: 8, [portalTokens.mq.tabletUp]: { mt: 12 } }}
        >
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
