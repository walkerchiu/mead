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
 * 各計畫主標的文字框寬度（≥834px，依 Figma 各卡標題節點：
 * sposad 1:117 / idc 23:134 = 194.82、tisdc 31:329 = 249）。
 * 控制主標斷行與設計稿一致：sposad「值得你期待的設計公／費留學品牌」兩行、
 * tisdc「全球最大規模學生設計競賽」一行。tisdc 249 比左欄寬，會溢入 logo 與
 * 描述欄之間的 gap（該處無其他內容、不衝突）。
 */
const HEADLINE_WIDTH: Record<string, number> = {
  sposad: 195,
  idc: 195,
  tisdc: 249,
};

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

/** 卡片用代表圖：優先本機 banner，其次首張本機照片 */
function getCardImage(plan: Plan): string | null {
  return (
    plan.banners.find((b) => b.type === 'local' && b.src)?.src ??
    plan.photos.find((p) => p.type === 'local' && p.src)?.src ??
    null
  );
}

/**
 * PlanCard — 三大計畫介紹卡片（依 Figma node 1:2 — 由兩張卡片組成）。
 *
 * - 卡片一：計畫識別 + 主標 / 簡介 + 執行單位、時程軸。
 * - 卡片二：數據成果、代表圖 banner（內縮、非滿版）、社群連結列。
 * 兩張卡片皆為半透明毛玻璃，之間留約 10px 間距。
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
      {/* 卡片一 — 識別 / 簡介 / 執行單位 / 時程 */}
      <Box
        sx={{
          ...FROSTED,
          position: 'relative',
          // <834px 依 Figma node 43:400：左右 24、上 28、下 42
          pt: '28px',
          pb: '42px',
          px: '24px',
          // ≥834px 依 Figma node 1:2：上 44、左 27、右 24、下 48
          [portalTokens.mq.tabletUp]: {
            pt: '44px',
            pr: '24px',
            pb: '48px',
            pl: '27px',
          },
        }}
      >
        <Box
          sx={{
            display: 'flex',
            flexDirection: 'column',
            // <834px 單欄堆疊，各區塊間距約 47px（依 Figma node 43:1142）
            gap: '47px',
            // ≥834px 左欄 logo 218、右欄描述 411，欄距 92px（依 Figma node 1:2）
            [portalTokens.mq.tabletUp]: { flexDirection: 'row', gap: '92px' },
          }}
        >
          {/* 左欄：識別 + 主標（窄欄） */}
          <Box
            sx={{
              minWidth: 0,
              // 左欄固定 logo 寬 218px（依 Figma node 1:2）；窄於卡片時才收縮。
              // relative 作為主標絕對定位的錨點（主標 y 需與 logo 高度脫鉤）。
              [portalTokens.mq.tabletUp]: {
                flex: '0 1 218px',
                position: 'relative',
              },
            }}
          >
            <PlanLogo
              name={plan.name}
              planId={plan.id}
              logoSrc={plan.logoUrl}
            />
            <Typography
              // h2 — 首頁標題層級（h1 為頁面主標）；維持原視覺樣式
              component="h2"
              sx={{
                // <834px：logo 與主標間距約 47px（≥834px 改絕對定位，見下方 tabletUp）
                mt: '47px',
                // 依 Figma node 1:117 — Inter Medium 20px / line-height 1.8
                fontSize: 20,
                fontWeight: 500,
                lineHeight: 1.8,
                color: '#000000',
                [portalTokens.mq.tabletUp]: {
                  // 依 Figma node 1:2 / 23:21 / 31:215：三卡主標的「垂直中心」皆
                  // 對齊到描述頂端下方約 202px 處（sposad 兩行 top≈166；單行的
                  // idc/tisdc 置中後 top≈184）。各卡 logo 高度不同，故主標改用相對
                  // 左欄頂端的絕對定位（top 166 = 槽頂、+72px 槽垂直置中 → 中心 202），
                  // 與 logo 高度脫鉤；left 0 對齊 logo 左緣。
                  mt: 0,
                  position: 'absolute',
                  top: '166px',
                  left: 0,
                  minHeight: '72px',
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'center',
                  // 依設計稿給定的主標框寬，決定斷行點（見 HEADLINE_WIDTH）
                  ...(HEADLINE_WIDTH[plan.id]
                    ? { width: `${HEADLINE_WIDTH[plan.id]}px` }
                    : {}),
                },
              }}
            >
              <AnimatedSlogan key={sloganNonce} text={headline} />
            </Typography>
          </Box>

          {/* 右欄：簡介 + 執行單位（寬欄） */}
          <Box
            sx={{
              minWidth: 0,
              // 右欄固定描述寬 411px（依 Figma node 1:2 heroSubtitle）；窄於卡片時才收縮
              [portalTokens.mq.tabletUp]: { flex: '0 1 411px' },
            }}
          >
            <Typography
              component="p"
              sx={{
                // <834px 依 Figma node 43:406 為 12px；≥834px 依 node 1:115 為 14px
                // （皆 Inter Regular / line-height 1.8）
                fontSize: 12,
                lineHeight: 1.8,
                color: '#000000',
                // 全形標點不擠壓（與 Figma 同），斷行點才會與設計稿一致
                textSpacingTrim: 'space-all',
                [portalTokens.mq.tabletUp]: { fontSize: 14 },
              }}
            >
              {plan.intro}
            </Typography>
            {plan.organizers.length > 0 && (
              <Box
                sx={{
                  // 依 Figma：簡介與執行單位間距 <834px 約 47px、≥834px 約 34px
                  mt: '47px',
                  [portalTokens.mq.tabletUp]: { mt: '34px' },
                }}
              >
                {/* 依設計師最新稿（heroSubtitle）— Inter Regular 12px / line-height 1.8 */}
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

        {/* 了解更多 — 依 Figma node 1:141：≥834px 絕對定位、略突出卡片右緣；
            <834px 隨內容置於時程下方靠右 */}
        <Box
          sx={{
            mt: 2,
            display: 'flex',
            justifyContent: 'flex-end',
            [portalTokens.mq.tabletUp]: {
              mt: 0,
              position: 'absolute',
              top: 258,
              right: -16,
              display: 'block',
            },
          }}
        >
          {/* 依 Figma node 1:141 — 按鈕些微傾斜 -4.86°；連向計畫官網 */}
          <LearnMoreButton tilt={-4.86} href={plan.officialUrl} />
        </Box>
      </Box>

      {/* 卡片二 — 數據成果 / 代表圖 / 社群連結 */}
      <Box
        sx={{
          ...FROSTED,
          position: 'relative',
          // 與卡片一之間約 10px 間距（依 Figma node 1:82 / 1:119）
          mt: '10px',
          pt: '36px',
          pb: '12px',
        }}
      >
        {/* 數據成果 */}
        <Box sx={{ px: '16px' }}>
          <PlanStatsBar stats={plan.stats} />
        </Box>

        {/* 代表圖 banner — 內縮約 12px、圓角，非滿版（依 Figma node 1:140） */}
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

        {/* 社群連結 — 疊在 banner 下緣、跨越卡片二底邊（依 Figma node 1:145） */}
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
