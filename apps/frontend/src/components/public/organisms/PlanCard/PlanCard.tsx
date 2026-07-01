'use client';

import { useEffect, useRef, useState } from 'react';

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
  /**
   * 是否為目前顯示（active）的卡片。切換到此卡時（active 轉為 true，或顯示的計畫改變）
   * slogan 進場動畫播放一次；非 active 不播。預設 true。
   */
  active?: boolean;
  /**
   * 桌機卡片是否在「每張卡各自後方」墊一塊與頁面同色的半透明底（僅桌機版生效）。
   * 用於 SPOSAD 入口網環狀輪播：卡片後方有裝飾照片時，毛玻璃 backdrop-filter 會把照片
   * 罩濃、且露出 vs 卡片後方濃淡不一；墊底後毛玻璃大半罩在均勻色上、照片只淡淡透出，
   * 切換時各處霧化趨於一致。墊在每張卡後方（非整體外層）才不會填到卡間間隙、連成一塊。
   */
  frostBacking?: boolean;
  /**
   * 抑制本次 active 轉換所觸發的 slogan 重播。環狀輪播以三份卡片複本實作無限循環，
   * wrap（首↔末）後會「無動畫 snap 回中份」把 active 卡換到另一份複本的 instance 上；
   * 該重定位本應無感，故此時設為 true，避免新 instance 因 active 轉真而再播一次 slogan。
   */
  suppressSloganReplay?: boolean;
}

/**
 * slogan 重播控制：掛載時播一次（由 AnimatedSlogan 的初始 key 觸發），之後每次
 * 「切換到此卡」（active 轉 true 或計畫改變）再播一次；不隨滑鼠互動、不輪播。
 *
 * suppress 為 true 時跳過該次 active 轉換的重播：用於環狀輪播 wrap 後「snap 回中份」
 * 把 active 換到另一份複本 instance 的無感重定位，避免同一計畫切換時 slogan 播兩次。
 * 以 ref 讀取，使「抑制與否」取當下這一拍的值，又不把它列入 effect deps。
 */
function useSloganReplay(
  active: boolean,
  planId: string,
  suppress = false,
): number {
  const [nonce, setNonce] = useState(0);
  const first = useRef(true);
  const suppressRef = useRef(suppress);
  // 先把當下的 suppress 同步進 ref（無 deps、每次 commit 都跑），且宣告在下方 active
  // effect 之前 → 同一拍 active 轉換時，下方 effect 讀到的已是這一拍的 suppress 值。
  useEffect(() => {
    suppressRef.current = suppress;
  });
  useEffect(() => {
    if (first.current) {
      first.current = false;
      return;
    }
    if (active && !suppressRef.current) setNonce((n) => n + 1);
  }, [active, planId]);
  return nonce;
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
 * 各計畫 slogan 的指定斷行（'\n' 為明確換行點）：
 *  - 菁培：值得你期待的／設計公費留學品牌
 *  - 設計戰國策：躍上國際舞臺／培育具全球視野的藝術設計人才
 *  - 創意設計大賽：臺灣國際學生／創意設計大賽／（TISDC）
 */
const SLOGAN_LINES: Record<string, string> = {
  sposad: '值得你期待的\n設計公費留學品牌',
  idc: '躍上國際舞臺\n培育具全球視野的藝術設計人才',
  tisdc: '臺灣國際學生\n創意設計大賽\n（TISDC）',
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
 * 手機版（<834px）卡片 — 單欄堆疊：主標 h2、簡介、執行單位、橫向可滑動時程；
 * 卡片二為橫向滾動數據跑馬燈、內縮 banner、社群連結列。時程與數據改為橫向呈現，
 * 讓窄版閱讀更從容、版面更輕（與桌機卡片的跑馬燈處理一致）。
 */
function PlanCardMobile({
  plan,
  active = true,
  suppressSloganReplay = false,
}: PlanCardProps) {
  const headline = getSloganText(plan);
  const cardImage = getCardImage(plan);
  const sloganNonce = useSloganReplay(active, plan.id, suppressSloganReplay);

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
          {/* 識別 + 主標 */}
          <Box sx={{ minWidth: 0 }}>
            <PlanLogo
              name={plan.name}
              planId={plan.id}
              logoSrc={plan.logoUrl}
              nameplate={plan.logoNameplate}
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

        {/* 時程 — 窄版橫向可滑動 */}
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
function PlanCardDesktop({
  plan,
  active = true,
  frostBacking = false,
  suppressSloganReplay = false,
}: PlanCardProps) {
  const headline = getSloganText(plan);
  const cardImage = getCardImage(plan);
  const sloganNonce = useSloganReplay(active, plan.id, suppressSloganReplay);

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
            <Box sx={{ minWidth: 0, flex: '0 0 268px' }}>
              <PlanLogo
                name={plan.name}
                planId={plan.id}
                logoSrc={plan.logoUrl}
                nameplate={plan.logoNameplate}
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
export function PlanCard({
  plan,
  active = true,
  frostBacking = false,
  suppressSloganReplay = false,
}: PlanCardProps) {
  return (
    <>
      <Box
        sx={{
          width: '100%',
          [portalTokens.mq.desktopUp]: { display: 'none' },
        }}
      >
        <PlanCardMobile
          plan={plan}
          active={active}
          suppressSloganReplay={suppressSloganReplay}
        />
      </Box>
      <Box
        sx={{
          width: '100%',
          display: 'none',
          [portalTokens.mq.desktopUp]: { display: 'block' },
        }}
      >
        <PlanCardDesktop
          plan={plan}
          active={active}
          frostBacking={frostBacking}
          suppressSloganReplay={suppressSloganReplay}
        />
      </Box>
    </>
  );
}
