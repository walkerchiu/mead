'use client';

import { useState } from 'react';

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

/**
 * PortalLandingPage — 教育部藝術設計三大計畫入口網首頁。
 *
 * 由上而下：hero 文字雲 → 主標題 → 三大計畫輪播 → 頁尾。
 * 切換計畫時，文字雲與輪播卡片同步更新（共用 activeIndex 狀態）。
 */
export function PortalLandingPage({ plans }: PortalLandingPageProps) {
  const t = useTranslations('portal');
  const locale = useLocale();
  const language = locale.startsWith('zh') ? 'zh' : 'en';

  const [activeIndex, setActiveIndex] = useState(0);
  // hover 計畫卡片時，主標切換為該計畫 slogan（依設計稿過場效果說明）
  const [cardHovered, setCardHovered] = useState(false);
  const activePlan = plans[activeIndex] ?? plans[0];

  if (!activePlan) return null;

  const heroPhotos = getLocalPhotos(activePlan)
    .map((p) => p.src)
    .filter((s): s is string => Boolean(s));

  // 計畫對應 slogan：未 hover 時顯示三大計畫整體主標，hover 時切換為該計畫
  const planSlogan =
    activePlan.slogan.zh ??
    activePlan.slogan.en ??
    activePlan.decorativeText[0]?.zh ??
    activePlan.decorativeText[0]?.en ??
    activePlan.name.zh;
  const heading = cardHovered ? planSlogan : t('heading');

  return (
    <Box
      sx={{
        minHeight: '100vh',
        bgcolor: portalTokens.color.pageBg,
        display: 'flex',
        flexDirection: 'column',
        // hover 浮出時側邊圖片會略微溢出，裁掉水平方向避免出現捲軸
        overflowX: 'clip',
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

        {/* 間隔一段距離後 — 主要內容區塊（主標題） */}
        <Box sx={{ mt: 12, [portalTokens.mq.tabletUp]: { mt: 20 } }}>
          <PortalIntroSection eyebrow={t('eyebrow')} heading={heading} />
        </Box>

        {/* 三大計畫輪播 — 主標到卡片留白依 Figma：<420px 235px、
          420–834px 275px、≥834px 280px */}
        <Box
          sx={{
            mt: '235px',
            [portalTokens.mq.mobileUp]: { mt: '275px' },
            [portalTokens.mq.tabletUp]: { mt: '280px' },
          }}
        >
          <PlanCarousel
            plans={plans}
            activeIndex={activeIndex}
            onActiveIndexChange={setActiveIndex}
            onHoverChange={setCardHovered}
          />
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
                count={plans.length}
                activeIndex={activeIndex}
                onSelect={setActiveIndex}
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
