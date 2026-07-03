'use client';

import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';

import type { Plan } from '@/types/plan';

import { LearnMoreButton } from '../../atoms/LearnMoreButton';
import { PlanLogo } from '../../molecules/PlanLogo';
import { PlanTimeline } from '../../molecules/PlanTimeline';
import { SocialLinkBar } from '../../molecules/SocialLinkBar';
import { StatsMarquee } from '../../molecules/StatsMarquee';
import { portalTokens } from '../../tokens';

export interface PlanCardProps {
  /** 計畫資料 */
  plan: Plan;
  /**
   * 桌機卡片是否在「每張卡各自後方」墊一塊與頁面同色的半透明底（僅桌機版生效）。
   * 用於 SPOSAD 入口網環狀輪播：卡片後方有裝飾照片時，毛玻璃 backdrop-filter 會把照片
   * 罩濃、且露出 vs 卡片後方濃淡不一；墊底後毛玻璃大半罩在均勻色上、照片只淡淡透出，
   * 切換時各處霧化趨於一致。墊在每張卡後方（非整體外層）才不會填到卡間間隙、連成一塊。
   */
  frostBacking?: boolean;
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
 * frostBacking 用：墊在每張卡「正後方」、與頁面同色（pageBg #E3E3E3）的半透明底。毛玻璃
 * backdrop-filter 因此罩在均勻色上，只讓底下裝飾照片依 alpha 透出。墊在每張卡後方（非整張
 * PlanCard 外層）才不會填到卡間間隙、把上下卡連成一塊。圓角與 FROSTED 一致。上下兩張卡
 * 皆套用，保留透出質感。alpha 越低、透出越明顯。
 */
const FROST_BACKING = {
  position: 'absolute',
  inset: 0,
  borderRadius: '17.35px',
  // pageBg (#E3E3E3) @ 60% → 照片透出 ~40%（比先前更明顯）。
  bgcolor: 'rgba(227, 227, 227, 0.6)',
  pointerEvents: 'none',
} as const;

/** 卡片用代表圖：優先本機 banner，其次首張本機照片 */
function getCardImage(plan: Plan): string | null {
  return (
    plan.banners.find((b) => b.type === 'local' && b.src)?.src ??
    plan.photos.find((p) => p.type === 'local' && p.src)?.src ??
    null
  );
}

/**
 * 手機版（<834px）卡片 — 單欄堆疊：主標 h2、簡介、執行單位、橫向可滑動時程；
 * 卡片二為橫向滾動數據跑馬燈、內縮 banner、社群連結列。時程與數據改為橫向呈現，
 * 讓窄版閱讀更從容、版面更輕（與桌機卡片的跑馬燈處理一致）。
 */
function PlanCardMobile({ plan }: PlanCardProps) {
  const cardImage = getCardImage(plan);

  return (
    <Box sx={{ position: 'relative', width: '100%' }}>
      {/* 卡片一 — 識別 / 簡介 / 執行單位 / 時程 */}
      <Box
        sx={{
          ...FROSTED,
          position: 'relative',
          pt: '28px',
          pb: '20px',
          px: '24px',
        }}
      >
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: '47px' }}>
          {/* 識別 */}
          <Box sx={{ minWidth: 0 }}>
            <PlanLogo
              name={plan.name}
              planId={plan.id}
              logoSrc={plan.logoUrl}
              nameplate={plan.logoNameplate}
            />
          </Box>

          {/* 簡介 + 執行單位 + 了解更多（與執行單位同列、靠右、底部對齊） */}
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
            <Box
              sx={{
                mt: '47px',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'flex-end',
                gap: 2,
              }}
            >
              <Box sx={{ minWidth: 0 }}>
                {plan.organizers.length > 0 && (
                  <>
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
                  </>
                )}
              </Box>
              <Box sx={{ flexShrink: 0 }}>
                <LearnMoreButton tilt={-4.86} href={plan.officialUrl} />
              </Box>
            </Box>
          </Box>
        </Box>

        {/* 時程 — 窄版橫向可滑動；預設顯示當下期程，點按時間點顯示該事件 */}
        <Box sx={{ mt: 3 }}>
          <PlanTimeline timelines={plan.timelines} variant="scroll" />
        </Box>
      </Box>

      {/* 卡片二 — 數據成果（橫向跑馬燈）/ 代表圖 / 社群連結 */}
      {/* banner 下方預留空間（依 Figma 約 28px），讓導覽列落在 banner 下方、不覆蓋圖片。 */}
      <Box
        sx={{
          ...FROSTED,
          position: 'relative',
          mt: '10px',
          pt: '36px',
          pb: '28px',
        }}
      >
        <Box sx={{ px: '12px' }}>
          <StatsMarquee stats={plan.stats} direction="horizontal" />
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
            // 導覽列頂部落在 banner 下方、整列向下懸出卡片（依 Figma 約 41px）。
            bottom: '-40px',
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
function PlanCardDesktop({ plan, frostBacking = false }: PlanCardProps) {
  const cardImage = getCardImage(plan);

  return (
    <Box sx={{ position: 'relative', width: '100%' }}>
      {/* 卡片一 — 三欄識別／簡介／執行單位 + 時程 */}
      <Box sx={{ position: 'relative' }}>
        {frostBacking && <Box aria-hidden sx={FROST_BACKING} />}
        <Box
          sx={{
            ...FROSTED,
            position: 'relative',
            pt: '40px',
            pr: '40px',
            pb: '18px',
            pl: '36px',
          }}
        >
          <Box
            sx={{
              display: 'flex',
              flexDirection: 'row',
              alignItems: 'flex-start',
              gap: '48px',
            }}
          >
            {/* 欄一：識別（垂直置中於三欄列，佔用原標語騰出的空間） */}
            <Box sx={{ minWidth: 0, flex: '0 0 268px', alignSelf: 'center' }}>
              <PlanLogo
                name={plan.name}
                planId={plan.id}
                logoSrc={plan.logoUrl}
                nameplate={plan.logoNameplate}
              />
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

          {/* 時程 — 軌道只標位置，預設顯示當下期程；hover／focus／點按顯示個別事件 */}
          <Box sx={{ mt: '22px' }}>
            <PlanTimeline timelines={plan.timelines} />
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
      </Box>

      {/* 卡片二 — 數據跑馬燈 + 大代表圖 + 社群連結 */}
      <Box sx={{ position: 'relative', mt: '10px' }}>
        {frostBacking && <Box aria-hidden sx={FROST_BACKING} />}
        <Box sx={{ ...FROSTED, position: 'relative', p: '12px' }}>
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
    </Box>
  );
}

/**
 * PlanCard — 依視窗寬度切換版面：<1200px 手機／平板版（單欄堆疊、窄卡，依設計稿
 * 43:1142）、≥1200px 桌機版（左右拉伸三欄）。以 CSS display 斷點切換（非
 * useMediaQuery）以避免 SSR / hydration 不一致。
 */
export function PlanCard({ plan, frostBacking = false }: PlanCardProps) {
  return (
    <>
      <Box
        sx={{
          width: '100%',
          [portalTokens.mq.desktopUp]: { display: 'none' },
        }}
      >
        <PlanCardMobile plan={plan} />
      </Box>
      <Box
        sx={{
          width: '100%',
          display: 'none',
          [portalTokens.mq.desktopUp]: { display: 'block' },
        }}
      >
        <PlanCardDesktop plan={plan} frostBacking={frostBacking} />
      </Box>
    </>
  );
}
