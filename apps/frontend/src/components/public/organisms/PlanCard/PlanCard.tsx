'use client';

import { useState } from 'react';

import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';

import type { Plan } from '@/types/plan';

import { AnimatedSlogan } from '../../atoms/AnimatedSlogan';
import { LearnMoreButton } from '../../atoms/LearnMoreButton';
import { PlanLogo } from '../../molecules/PlanLogo';
import { PlanTimeline } from '../../molecules/PlanTimeline';
import { SocialLinkBar } from '../../molecules/SocialLinkBar';
import { StatsMarquee } from '../../molecules/StatsMarquee';
import { portalTokens } from '../../tokens';

export interface PlanCardProps {
  /** 計畫資料 */
  plan: Plan;
}

/**
 * 卡片的毛玻璃樣式 — 依 Figma node 1:82 / 1:119：
 * 半透明白底 + backdrop-blur + 淺灰描邊、圓角 17.35px。
 */
const FROSTED = {
  bgcolor: 'rgba(255, 255, 255, 0.54)',
  backdropFilter: 'blur(28.34px)',
  WebkitBackdropFilter: 'blur(28.34px)',
  border: '1px solid rgba(138, 138, 138, 0.49)',
  borderRadius: '17.35px',
} as const;

/** 計畫標語：優先 slogan，其次以裝飾性文字首句替代 */
function getHeadline(plan: Plan): string {
  return (
    plan.slogan.zh ??
    plan.slogan.en ??
    plan.decorativeText[0]?.zh ??
    plan.decorativeText[0]?.en ??
    plan.name.zh
  );
}

/** 卡片用代表圖：優先本機 banner，其次首張本機照片 */
function getCardImage(plan: Plan): string | null {
  return (
    plan.banners.find((b) => b.type === 'local' && b.src)?.src ??
    plan.photos.find((p) => p.type === 'local' && p.src)?.src ??
    null
  );
}

/**
 * PlanCard — 三大計畫介紹卡片（依設計師新版稿 Figma node 1:2 — 卡片左右拉伸）。
 *
 * - 卡片一（960×441）：三欄 — 左 logo＋標語｜中 描述｜右 執行單位；右上角「了解更多」；
 *   下方時程軸。
 * - 卡片二（960×314）：左窄欄數據成果（垂直跑馬燈）＋右側大代表圖 banner；社群連結列
 *   疊於底緣。
 * <834px 退為單欄堆疊。三個計畫共用此版面（依設計師：其他計畫同菁培）。
 */
export function PlanCard({ plan }: PlanCardProps) {
  const headline = getHeadline(plan);
  const cardImage = getCardImage(plan);

  // slogan 動畫重播計數 — 初次掛載播放一次，hover 卡片時再次重播
  const [sloganNonce, setSloganNonce] = useState(0);

  return (
    <Box
      onMouseEnter={() => setSloganNonce((n) => n + 1)}
      sx={{ position: 'relative', width: '100%' }}
    >
      {/* 卡片一 — 三欄識別／簡介／執行單位 + 時程 */}
      <Box
        sx={{
          ...FROSTED,
          position: 'relative',
          pt: '28px',
          pb: '36px',
          px: '24px',
          [portalTokens.mq.tabletUp]: {
            pt: '40px',
            pr: '40px',
            pb: '36px',
            pl: '36px',
          },
        }}
      >
        <Box
          sx={{
            display: 'flex',
            flexDirection: 'column',
            gap: '40px',
            // ≥834px：三欄並列（logo＋標語｜描述｜執行單位），欄距自動分配
            [portalTokens.mq.tabletUp]: {
              flexDirection: 'row',
              justifyContent: 'space-between',
              alignItems: 'flex-start',
              gap: '48px',
            },
          }}
        >
          {/* 欄一：識別 + 標語 */}
          <Box
            sx={{
              minWidth: 0,
              [portalTokens.mq.tabletUp]: { flex: '0 0 218px' },
            }}
          >
            <PlanLogo
              name={plan.name}
              planId={plan.id}
              logoSrc={plan.logoUrl}
            />
            <Typography
              component="h2"
              sx={{
                mt: '36px',
                // 依 Figma node 1:117 — Inter Medium 20px / line-height 1.8
                fontSize: 20,
                fontWeight: 500,
                lineHeight: 1.8,
                color: '#000000',
                [portalTokens.mq.tabletUp]: { width: '195px' },
              }}
            >
              <AnimatedSlogan key={sloganNonce} text={headline} />
            </Typography>
          </Box>

          {/* 欄二：簡介描述 */}
          <Box
            sx={{
              minWidth: 0,
              [portalTokens.mq.tabletUp]: { flex: '0 1 329px' },
            }}
          >
            <Typography
              component="p"
              sx={{
                // 描述 Inter Regular 14px / line-height 1.8（依設計稿 node 1:115）
                fontSize: 14,
                lineHeight: 1.8,
                color: '#000000',
                textSpacingTrim: 'space-all',
              }}
            >
              {plan.intro}
            </Typography>
          </Box>

          {/* 欄三：執行單位 */}
          {plan.organizers.length > 0 && (
            <Box
              sx={{
                minWidth: 0,
                [portalTokens.mq.tabletUp]: { flex: '0 0 auto' },
              }}
            >
              {/* 執行單位 Inter Regular 12px / line-height 1.8（依設計稿 node 1:116）*/}
              <Typography
                component="p"
                sx={{ fontSize: 12, lineHeight: 1.8, color: '#000000' }}
              >
                執行單位：
              </Typography>
              {plan.organizers.map((org) => (
                <Typography
                  key={org}
                  component="p"
                  sx={{
                    fontSize: 12,
                    lineHeight: 1.8,
                    color: '#000000',
                    whiteSpace: { md: 'nowrap' },
                  }}
                >
                  {org}
                </Typography>
              ))}
            </Box>
          )}
        </Box>

        {/* 時程 */}
        <Box sx={{ mt: '28px' }}>
          <PlanTimeline />
        </Box>

        {/* 了解更多 — ≥834px 依 Figma node 1:141：卡片一右欄、執行單位下方（距卡頂約
            198px、距右緣約 57px）；<834px 置於內容下方靠右 */}
        <Box
          sx={{
            mt: 2,
            display: 'flex',
            justifyContent: 'flex-end',
            [portalTokens.mq.tabletUp]: {
              mt: 0,
              position: 'absolute',
              top: '198px',
              right: '57px',
              display: 'block',
            },
          }}
        >
          <LearnMoreButton tilt={-4.86} href={plan.officialUrl} />
        </Box>
      </Box>

      {/* 卡片二 — 數據跑馬燈 + 大代表圖 + 社群連結 */}
      <Box
        sx={{
          ...FROSTED,
          position: 'relative',
          mt: '10px',
          p: '12px',
        }}
      >
        <Box
          sx={{
            display: 'flex',
            flexDirection: 'column',
            gap: '16px',
            [portalTokens.mq.tabletUp]: {
              flexDirection: 'row',
              alignItems: 'stretch',
              gap: '16px',
            },
          }}
        >
          {/* 數據跑馬燈（窄欄） */}
          <Box
            sx={{
              flexShrink: 0,
              height: '200px',
              [portalTokens.mq.tabletUp]: {
                flex: '0 0 185px',
                alignSelf: 'stretch',
                height: 'auto',
              },
            }}
          >
            <StatsMarquee stats={plan.stats} />
          </Box>

          {/* 代表圖 banner（大、佔右側） */}
          {cardImage ? (
            <Box
              component="img"
              src={cardImage}
              alt={`${plan.name.zh} 代表圖`}
              loading="lazy"
              sx={{
                display: 'block',
                width: '100%',
                aspectRatio: '752 / 287',
                objectFit: 'cover',
                borderRadius: '10px',
                [portalTokens.mq.tabletUp]: { flex: '1 1 auto', minWidth: 0 },
              }}
            />
          ) : (
            <Box
              sx={{
                width: '100%',
                aspectRatio: '752 / 287',
                borderRadius: '10px',
                background: `linear-gradient(120deg, ${portalTokens.color.blobOrangeFrom}, ${portalTokens.color.blobOrangeTo})`,
                [portalTokens.mq.tabletUp]: { flex: '1 1 auto', minWidth: 0 },
              }}
            />
          )}
        </Box>

        {/* 社群連結 — 疊在卡片二底緣（依 Figma node 1:145） */}
        <Box
          sx={{
            position: 'absolute',
            left: '50%',
            bottom: '-22px',
            transform: 'translateX(-50%)',
            zIndex: 2,
          }}
        >
          <SocialLinkBar
            socialLinks={plan.socialLinks}
            learnMoreHref={plan.officialUrl}
          />
        </Box>
      </Box>
    </Box>
  );
}
