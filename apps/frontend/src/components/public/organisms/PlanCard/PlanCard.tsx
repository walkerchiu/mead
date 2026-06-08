'use client';

import { useState } from 'react';

import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';

import type { Plan } from '@/types/plan';

import { AnimatedSlogan } from '../../atoms/AnimatedSlogan';
import { LearnMoreButton } from '../../atoms/LearnMoreButton';
import { PlanLogo } from '../../molecules/PlanLogo';
import { PlanStatsBar } from '../../molecules/PlanStatsBar';
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

/**
 * 各計畫主標的文字框寬度（手機版用，依 Figma 各卡標題節點）：控制主標斷行。
 */
const HEADLINE_WIDTH: Record<string, number> = {
  sposad: 195,
  idc: 195,
  tisdc: 249,
};

/** 計畫主標／標語：優先 slogan，其次以裝飾性文字首句替代 */
function getHeadline(plan: Plan): string {
  return (
    plan.slogan.zh ??
    plan.slogan.en ??
    plan.decorativeText[0]?.zh ??
    plan.decorativeText[0]?.en ??
    plan.name.zh
  );
}

/**
 * 各計畫 slogan 的指定斷行（依業主要求，'\n' 為明確換行點）：
 *  - 菁培：值得你期待的／設計公費留學品牌
 *  - 設計戰國策：來自亞洲設計的力量（單行）
 *  - 創意設計大賽：全球最大規模／學生創意設計競賽
 */
const SLOGAN_LINES: Record<string, string> = {
  sposad: '值得你期待的\n設計公費留學品牌',
  idc: '來自亞洲設計的力量',
  tisdc: '全球最大規模\n學生創意設計競賽',
};

/** slogan 文字（含指定斷行）；未指定者回退 getHeadline */
function getSloganText(plan: Plan): string {
  return SLOGAN_LINES[plan.id] ?? getHeadline(plan);
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
 * 手機版（<834px）卡片 — 維持改版前的原始版面：單欄堆疊、主標 h2、橫列數據成果
 * （PlanStatsBar）、內縮 banner、社群連結列。設計師新版僅更新桌機版面，手機版沿用原樣。
 */
function PlanCardMobile({ plan }: PlanCardProps) {
  const headline = getSloganText(plan);
  const cardImage = getCardImage(plan);
  const [sloganNonce, setSloganNonce] = useState(0);

  return (
    <Box
      onMouseEnter={() => setSloganNonce((n) => n + 1)}
      sx={{ position: 'relative', width: '100%' }}
    >
      {/* 卡片一 — 識別 / 簡介 / 執行單位 / 時程 */}
      <Box
        sx={{
          ...FROSTED,
          position: 'relative',
          pt: '28px',
          pb: '42px',
          px: '24px',
        }}
      >
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: '47px' }}>
          {/* 識別 + 主標 */}
          <Box sx={{ minWidth: 0 }}>
            <PlanLogo
              name={plan.name}
              planId={plan.id}
              logoSrc={plan.logoUrl}
            />
            <Typography
              component="h2"
              sx={{
                mt: '47px',
                // 依 Figma node 1:117 — Inter Medium 20px / line-height 1.8
                fontSize: 20,
                fontWeight: 500,
                lineHeight: 1.8,
                color: '#000000',
                ...(HEADLINE_WIDTH[plan.id]
                  ? { width: `${HEADLINE_WIDTH[plan.id]}px` }
                  : {}),
              }}
            >
              <AnimatedSlogan key={sloganNonce} text={headline} />
            </Typography>
          </Box>

          {/* 簡介 + 執行單位 */}
          <Box sx={{ minWidth: 0 }}>
            <Typography
              component="p"
              sx={{
                fontSize: 14,
                lineHeight: 1.8,
                color: '#000000',
                textSpacingTrim: 'space-all',
              }}
            >
              {plan.intro}
            </Typography>
            {plan.organizers.length > 0 && (
              <Box sx={{ mt: '47px' }}>
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
                    sx={{ fontSize: 12, lineHeight: 1.8, color: '#000000' }}
                  >
                    {org}
                  </Typography>
                ))}
              </Box>
            )}
          </Box>
        </Box>

        {/* 時程 */}
        <Box sx={{ mt: 3 }}>
          <PlanTimeline />
        </Box>

        {/* 了解更多 — 時程下方靠右 */}
        <Box sx={{ mt: 2, display: 'flex', justifyContent: 'flex-end' }}>
          <LearnMoreButton tilt={-4.86} href={plan.officialUrl} />
        </Box>
      </Box>

      {/* 卡片二 — 數據成果（橫列）/ 代表圖 / 社群連結 */}
      <Box
        sx={{
          ...FROSTED,
          position: 'relative',
          mt: '10px',
          pt: '36px',
          pb: '12px',
        }}
      >
        <Box sx={{ px: '16px' }}>
          <PlanStatsBar stats={plan.stats} />
        </Box>

        {cardImage ? (
          <Box
            component="img"
            src={cardImage}
            alt={`${plan.name.zh} 代表圖`}
            loading="lazy"
            sx={{
              display: 'block',
              mt: '26px',
              mx: '12px',
              width: 'calc(100% - 24px)',
              aspectRatio: '752 / 287',
              objectFit: 'cover',
              borderRadius: '10px',
            }}
          />
        ) : (
          <Box
            sx={{
              mt: '26px',
              mx: '12px',
              width: 'calc(100% - 24px)',
              aspectRatio: '752 / 287',
              borderRadius: '10px',
              background: `linear-gradient(120deg, ${portalTokens.color.blobOrangeFrom}, ${portalTokens.color.blobOrangeTo})`,
            }}
          />
        )}

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

/**
 * 桌機版（≥834px）卡片 — 設計師新版稿（Figma node 1:2）：卡片左右拉伸。
 *
 * - 卡片一（960×441）：三欄 — 左 logo＋標語｜中 描述｜右 執行單位；右欄下方「了解更多」；
 *   下方時程軸。
 * - 卡片二（960×314）：左窄欄數據成果（垂直跑馬燈）＋右側大代表圖 banner；社群連結列
 *   疊於底緣。
 */
function PlanCardDesktop({ plan }: PlanCardProps) {
  const headline = getSloganText(plan);
  const cardImage = getCardImage(plan);
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
          pt: '40px',
          pr: '40px',
          pb: '36px',
          pl: '36px',
        }}
      >
        <Box
          sx={{
            display: 'flex',
            flexDirection: 'row',
            justifyContent: 'space-between',
            alignItems: 'flex-start',
            gap: '48px',
          }}
        >
          {/* 欄一：識別 + 標語 */}
          <Box sx={{ minWidth: 0, flex: '0 0 218px' }}>
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
                width: '195px',
              }}
            >
              <AnimatedSlogan key={sloganNonce} text={headline} />
            </Typography>
          </Box>

          {/* 欄二：簡介描述 */}
          <Box sx={{ minWidth: 0, flex: '0 1 329px' }}>
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
            <Box sx={{ minWidth: 0, flex: '0 0 auto' }}>
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
                    whiteSpace: 'nowrap',
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

        {/* 了解更多 — 依 Figma node 1:141：卡片一右欄、執行單位下方 */}
        <Box
          sx={{
            position: 'absolute',
            top: '198px',
            right: '57px',
          }}
        >
          <LearnMoreButton tilt={-4.86} href={plan.officialUrl} />
        </Box>
      </Box>

      {/* 卡片二 — 數據跑馬燈 + 大代表圖 + 社群連結 */}
      <Box sx={{ ...FROSTED, position: 'relative', mt: '10px', p: '12px' }}>
        <Box
          sx={{
            display: 'flex',
            flexDirection: 'row',
            alignItems: 'stretch',
            gap: '16px',
          }}
        >
          {/* 數據跑馬燈（窄欄） */}
          <Box sx={{ flex: '0 0 185px', alignSelf: 'stretch' }}>
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
                flex: '1 1 auto',
                minWidth: 0,
                width: '100%',
                aspectRatio: '752 / 287',
                objectFit: 'cover',
                borderRadius: '10px',
              }}
            />
          ) : (
            <Box
              sx={{
                flex: '1 1 auto',
                minWidth: 0,
                width: '100%',
                aspectRatio: '752 / 287',
                borderRadius: '10px',
                background: `linear-gradient(120deg, ${portalTokens.color.blobOrangeFrom}, ${portalTokens.color.blobOrangeTo})`,
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

/**
 * PlanCard — 依視窗寬度切換版面：<834px 手機版（原始版面）、≥834px 桌機版（新版）。
 * 以 CSS display 斷點切換（非 useMediaQuery）以避免 SSR / hydration 不一致。
 */
export function PlanCard({ plan }: PlanCardProps) {
  return (
    <>
      <Box
        sx={{
          width: '100%',
          [portalTokens.mq.tabletUp]: { display: 'none' },
        }}
      >
        <PlanCardMobile plan={plan} />
      </Box>
      <Box
        sx={{
          width: '100%',
          display: 'none',
          [portalTokens.mq.tabletUp]: { display: 'block' },
        }}
      >
        <PlanCardDesktop plan={plan} />
      </Box>
    </>
  );
}
