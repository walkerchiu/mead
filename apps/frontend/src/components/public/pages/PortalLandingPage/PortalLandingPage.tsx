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
  // 三張卡下方的觀察點 — 使用者捲動到此（看完三卡）且尚未點擊 → 預設展開第一個計畫
  const expandSentinelRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (expandedIndex !== null) return;
    const el = expandSentinelRef.current;
    if (!el || typeof IntersectionObserver === 'undefined') return;
    const obs = new IntersectionObserver(
      (entries) => {
        if (entries.some((e) => e.isIntersecting)) {
          setExpandedIndex(0);
        }
      },
      // rootMargin 下緣縮 50% → sentinel 進入視窗上半部才觸發；
      // 給使用者足夠時間看完三張卡，再「往下滑」時才自動展開第一個計畫。
      { threshold: 0, rootMargin: '0px 0px -50% 0px' },
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
  let heading: ReactNode = t('heading');
  let headingKey = 'default';
  if (hoveredPlan) {
    headingKey = 'hover';
    const kw = language === 'zh' ? HOVER_KEYWORD[hoveredPlan.id] : undefined;
    heading = kw ? (
      <>
        讓&nbsp;&nbsp;
        {/* keyword：TYPE.keyword 46px / 700 / 橘色，無 rise 動畫（spec 明定不做）。
            data-slogan-keyword：供 PortalIntroSection 在 exiting 時對 keyword 套用獨立動畫。
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
        &nbsp;&nbsp;被看見
      </>
    ) : (
      sloganOf(hoveredPlan)
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

        {/* 第二屏 — default 用 100vh + 卡貼底；expanded 用固定間距讓 slogan 與詳細卡有空間 */}
        <Box
          sx={{
            // default 狀態：100vh 容器、卡片貼底；expanded 狀態：自然流，slogan→卡 280px 間距
            ...(expandedIndex === null
              ? {
                  minHeight: '100vh',
                  display: 'flex',
                  flexDirection: 'column',
                  paddingTop: '33vh',
                }
              : {
                  // expanded：依 Figma 31:215 eyebrow 距 section 頂 ~75px、slogan 距 eyebrow 77、卡距 slogan 280
                  paddingTop: '75px',
                }),
          }}
        >
          <PortalIntroSection
            eyebrow={t('eyebrow')}
            heading={heading}
            headingKey={headingKey}
          />
          <Box
            sx={{
              ...(expandedIndex === null
                ? { marginTop: 'auto' }
                : { marginTop: '280px' }),
            }}
          >
            <PlanCarousel
              plans={orderedPlans}
              expandedIndex={expandedIndex}
              onExpandedIndexChange={setExpandedIndex}
              onHoverPlanChange={setHoverIndex}
            />
            <Box
              ref={expandSentinelRef}
              aria-hidden
              sx={{ height: 1, width: '100%' }}
            />
          </Box>
        </Box>

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
