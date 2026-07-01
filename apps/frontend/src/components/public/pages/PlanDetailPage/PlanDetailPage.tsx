'use client';

import type { ReactNode } from 'react';

import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import Box from '@mui/material/Box';
import ButtonBase from '@mui/material/ButtonBase';
import Typography from '@mui/material/Typography';
import { useTranslations } from 'next-intl';

import { getLocalPhotos } from '@/lib/portal/plans';
import type { Plan } from '@/types/plan';

import { PlanLogo } from '../../molecules/PlanLogo';
import { PlanStatsBar } from '../../molecules/PlanStatsBar';
import { PlanTimeline } from '../../molecules/PlanTimeline';
import { SocialLinkBar } from '../../molecules/SocialLinkBar';
import { PortalFooter } from '../../organisms/PortalFooter';
import { portalTokens } from '../../tokens';

export interface PlanDetailPageProps {
  /** 計畫資料 */
  plan: Plan;
  /** 返回首頁的回呼 */
  onBack?: () => void;
}

/** 計畫主標：優先 slogan，其次以裝飾性文字首句替代 */
function getHeadline(plan: Plan): string {
  return (
    plan.slogan.zh ??
    plan.slogan.en ??
    plan.decorativeText[0]?.zh ??
    plan.decorativeText[0]?.en ??
    plan.name.zh
  );
}

/** 詳細頁 hero 圖：優先本機 banner，其次首張本機照片 */
function getHeroImage(plan: Plan): string | null {
  return (
    plan.banners.find((b) => b.type === 'local' && b.src)?.src ??
    plan.photos.find((p) => p.type === 'local' && p.src)?.src ??
    null
  );
}

/** 區塊：標題 + 內容 */
function Section({ title, children }: { title: string; children: ReactNode }) {
  return (
    <Box component="section" sx={{ mt: { xs: 5, md: 7 } }}>
      <Typography
        component="h2"
        sx={{
          display: 'flex',
          alignItems: 'center',
          gap: 1.5,
          fontSize: 16,
          fontWeight: 700,
          color: portalTokens.color.ink,
          mb: 2.5,
          '&::after': {
            content: '""',
            flex: 1,
            height: 1,
            bgcolor: portalTokens.color.blobGrey,
          },
        }}
      >
        {title}
      </Typography>
      {children}
    </Box>
  );
}

/**
 * PlanDetailPage — 單一計畫詳細頁。
 *
 * 設計稿未涵蓋此頁，故依入口網視覺語言設計：hero 圖 → 計畫識別 / 主標 →
 * 計畫介紹 → 數據成果 → 執行單位 → 時程 → 精彩照片 → 社群連結 → 頁尾。
 */
export function PlanDetailPage({ plan, onBack }: PlanDetailPageProps) {
  const t = useTranslations('portal');
  const heroImage = getHeroImage(plan);
  const photos = getLocalPhotos(plan);

  return (
    <Box
      sx={{
        minHeight: '100vh',
        '@supports (min-height: 100dvh)': { minHeight: '100dvh' },
        bgcolor: portalTokens.color.pageBg,
        display: 'flex',
        flexDirection: 'column',
        overflowX: 'clip',
      }}
    >
      <Box
        component="main"
        id="main-content"
        sx={{
          flex: 1,
          width: '100%',
          maxWidth: 960,
          mx: 'auto',
          px: `${portalTokens.layout.gutter}px`,
          pt: { xs: 3, md: 5 },
          pb: { xs: 6, md: 10 },
        }}
      >
        {/* 返回 */}
        <ButtonBase
          onClick={onBack}
          sx={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: 0.5,
            fontSize: 13,
            color: portalTokens.color.inkSecondary,
            '&:hover': { color: portalTokens.color.brandOrange },
          }}
        >
          <ArrowBackIcon sx={{ fontSize: 16 }} />
          {t('detail.back')}
        </ButtonBase>

        {/* hero 圖 */}
        {heroImage && (
          <Box
            component="img"
            src={heroImage}
            alt={`${plan.name.zh} 代表圖`}
            sx={{
              display: 'block',
              width: '100%',
              maxHeight: 360,
              objectFit: 'cover',
              borderRadius: `${portalTokens.radius.card}px`,
              mt: 2.5,
              boxShadow: portalTokens.shadow.soft,
            }}
          />
        )}

        {/* 計畫識別 */}
        <Box sx={{ mt: 4 }}>
          <PlanLogo
            name={plan.name}
            planId={plan.id}
            logoSrc={plan.logoUrl}
            nameplate={plan.logoNameplate}
            size={64}
          />
        </Box>

        {/* 主標 */}
        <Typography
          component="h1"
          sx={{
            mt: 3,
            fontSize: { xs: 26, md: 36 },
            fontWeight: 700,
            lineHeight: 1.4,
            color: portalTokens.color.ink,
          }}
        >
          {getHeadline(plan)}
        </Typography>

        {/* 計畫介紹 */}
        <Section title={t('detail.intro')}>
          <Typography
            sx={{
              fontSize: 14,
              lineHeight: 2,
              color: portalTokens.color.inkSecondary,
            }}
          >
            {plan.intro}
          </Typography>
        </Section>

        {/* 計畫目的 — 部分計畫提供（例如 idc） */}
        {plan.objective && (
          <Section title={t('detail.objective')}>
            <Typography
              sx={{
                fontSize: 14,
                lineHeight: 2,
                color: portalTokens.color.inkSecondary,
              }}
            >
              {plan.objective}
            </Typography>
          </Section>
        )}

        {/* 具體執行項目 — 部分計畫提供（例如 idc） */}
        {plan.executionItems && plan.executionItems.length > 0 && (
          <Section title={t('detail.execution')}>
            <Box
              component="ol"
              sx={{
                m: 0,
                pl: 3,
                listStyleType: 'cjk-ideographic',
                display: 'flex',
                flexDirection: 'column',
                gap: 1,
              }}
            >
              {plan.executionItems.map((item, i) => (
                <Typography
                  key={i}
                  component="li"
                  sx={{
                    fontSize: 14,
                    lineHeight: 1.9,
                    color: portalTokens.color.inkSecondary,
                    '&::marker': {
                      color: portalTokens.color.brandOrange,
                      fontWeight: 700,
                    },
                  }}
                >
                  {item}
                </Typography>
              ))}
            </Box>
            {plan.executionNote && (
              <Typography
                sx={{
                  mt: 2,
                  fontSize: 13,
                  lineHeight: 1.9,
                  color: portalTokens.color.inkMuted,
                }}
              >
                ＊{plan.executionNote}
              </Typography>
            )}
          </Section>
        )}

        {/* 數據成果 */}
        {plan.stats.length > 0 && (
          <Section title={t('detail.stats')}>
            <PlanStatsBar stats={plan.stats} />
          </Section>
        )}

        {/* 執行單位 */}
        {plan.organizers.length > 0 && (
          <Section title={t('detail.organizers')}>
            <Box component="ul" sx={{ m: 0, pl: 2.5 }}>
              {plan.organizers.map((org) => (
                <Typography
                  key={org}
                  component="li"
                  sx={{
                    fontSize: 13,
                    lineHeight: 1.9,
                    color: portalTokens.color.inkSecondary,
                  }}
                >
                  {org}
                </Typography>
              ))}
            </Box>
          </Section>
        )}

        {/* 計畫時程 */}
        <Section title={t('detail.timeline')}>
          <PlanTimeline timelines={plan.timelines} showList />
        </Section>

        {/* 精彩照片 */}
        {photos.length > 0 && (
          <Section title={t('detail.gallery')}>
            <Box
              sx={{
                display: 'grid',
                gap: 2,
                gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))',
              }}
            >
              {photos.map(
                (photo) =>
                  photo.src && (
                    <Box
                      key={photo.src}
                      component="img"
                      src={photo.src}
                      alt={`${plan.name.zh} 精彩照片`}
                      loading="lazy"
                      sx={{
                        width: '100%',
                        aspectRatio: '4 / 3',
                        objectFit: 'cover',
                        borderRadius: `${portalTokens.radius.control}px`,
                      }}
                    />
                  ),
              )}
            </Box>
          </Section>
        )}

        {/* 社群連結 */}
        {plan.socialLinks.length > 0 && (
          <Section title={t('detail.social')}>
            <SocialLinkBar
              socialLinks={plan.socialLinks}
              showLearnMore={false}
            />
          </Section>
        )}
      </Box>

      <PortalFooter
        siteName={t('footer.siteName')}
        tagline={t('footer.tagline')}
        copyright={t('footer.copyright', { year: new Date().getFullYear() })}
      />
    </Box>
  );
}
