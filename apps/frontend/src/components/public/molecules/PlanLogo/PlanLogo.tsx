'use client';

import type { ComponentType } from 'react';
import { useEffect, useState } from 'react';

import DOMPurify from 'dompurify';

import EmojiEventsOutlinedIcon from '@mui/icons-material/EmojiEventsOutlined';
import FlightTakeoffOutlinedIcon from '@mui/icons-material/FlightTakeoffOutlined';
import PaletteOutlinedIcon from '@mui/icons-material/PaletteOutlined';
import PublicOutlinedIcon from '@mui/icons-material/PublicOutlined';
import Box from '@mui/material/Box';
import type { SvgIconProps } from '@mui/material/SvgIcon';
import Typography from '@mui/material/Typography';

import { portalTokens } from '../../tokens';

interface PlanEmblem {
  Icon: ComponentType<SvgIconProps>;
  bg: string;
}

/**
 * 各計畫的替代徽記 — 參考資料尚無官方 logo 圖檔，故以不同圖示與橘色調區分：
 * sposad 海外培訓（起飛）、tisdc 創意設計大賽（獎盃）、idc 國際競賽（地球）。
 */
const PLAN_EMBLEMS: Record<string, PlanEmblem> = {
  sposad: { Icon: FlightTakeoffOutlinedIcon, bg: '#EC6A1E' },
  tisdc: { Icon: EmojiEventsOutlinedIcon, bg: '#E2542A' },
  idc: { Icon: PublicOutlinedIcon, bg: '#F2913F' },
};

export interface PlanLogoProps {
  /** 計畫名稱（中／英） */
  name: { zh: string; en: string | null };
  /** 計畫 id（sposad / tisdc / idc）— 決定替代徽記的圖示與色彩 */
  planId?: string;
  /** 計畫官方 logo（完整組合圖）路徑；提供時直接顯示，不再另列名稱文字 */
  logoSrc?: string;
  /**
   * 識別牌：純標誌圖＋另排名稱文字（依設計稿）。提供時優先於 `logoSrc`，以
   * 「標誌圖＋中文逐行＋英文」呈現（文字為向量、銳利且可雙語）。
   */
  nameplate?: { mark: string; nameZh: string[]; nameEn: string };
  /** 徽記尺寸（px），預設 56；亦作為 logo 組合圖的高度上限基準 */
  size?: number;
}

/**
 * 官方 logo 圖。SVG 來源改以「內聯（inline）」渲染：直接成為 DOM 向量節點，瀏覽器
 * 會以裝置實際解析度重繪，故在卡片 zoom 自適應或高 DPI（Retina）下都維持銳利；
 * 若用 `<img src=.svg>`，SVG 會先被點陣化成 bitmap，縮放時會發糊。
 * 載入前（SSR / 抓取中）與非 SVG 來源則以 `<img>` 後備，避免版位跳動。
 */
function PlanLogoImage({
  src,
  label,
  size,
}: {
  src: string;
  label: string;
  size: number;
}) {
  // 僅內聯「同源站內」的 SVG 資產（單一前導斜線的相對路徑、副檔名 .svg）；排除外部
  // 或 protocol-relative（//）URL，避免抓取／內聯非受控來源。
  const isInternalSvg = /^\/(?!\/)/.test(src) && /\.svg(\?|$)/i.test(src);
  const [svgMarkup, setSvgMarkup] = useState<string | null>(null);

  useEffect(() => {
    if (!isInternalSvg) return;
    let cancelled = false;
    fetch(src)
      .then((r) => (r.ok ? r.text() : null))
      .then((text) => {
        if (cancelled || !text || !text.includes('<svg')) return;
        // 縱深防禦：即便來源為自家資產，仍以 DOMPurify（SVG 設定）淨化，移除
        // <script>、事件處理屬性、javascript: 連結等可能的注入向量後才內聯。
        const clean = DOMPurify.sanitize(text, {
          USE_PROFILES: { svg: true, svgFilters: true },
        });
        if (clean.includes('<svg')) setSvgMarkup(clean);
      })
      .catch(() => {
        /* 後備保留 <img> */
      });
    return () => {
      cancelled = true;
    };
  }, [src, isInternalSvg]);

  // 同寬欄對齊，並限制高度避免多行 lockup（idc/tisdc）過高
  const sizing = {
    display: 'block',
    width: 'auto',
    height: 'auto',
    maxWidth: size * 3.9,
    maxHeight: size * 2.1,
  } as const;

  if (isInternalSvg && svgMarkup) {
    return (
      <Box
        role="img"
        aria-label={label}
        dangerouslySetInnerHTML={{ __html: svgMarkup }}
        sx={{ ...sizing, '& svg': { ...sizing } }}
      />
    );
  }

  return <Box component="img" src={src} alt={label} sx={sizing} />;
}

/**
 * PlanLogo — 計畫識別。
 *
 * 帶 `logoSrc` 時顯示該計畫的官方 logo 組合圖（標誌＋品牌字標已含於圖中，
 * 故不再另列計畫名稱文字）；未帶時依 `planId` 顯示替代徽記＋中英文名稱。
 */
export function PlanLogo({
  name,
  planId,
  logoSrc,
  nameplate,
  size = 56,
}: PlanLogoProps) {
  // 識別牌：純標誌圖（∞）＋另排名稱文字（依設計稿 node 374:64 / 375:76-77）。
  // 中文逐行手動斷行、英文於固定寬內自然換行；標誌與文字垂直置中。
  if (nameplate) {
    return (
      <Box sx={{ display: 'flex', alignItems: 'center', gap: '18px' }}>
        <Box
          component="img"
          src={nameplate.mark}
          alt=""
          sx={{ height: 44, width: 'auto', flexShrink: 0, display: 'block' }}
        />
        <Box sx={{ minWidth: 0, maxWidth: 172 }}>
          {nameplate.nameZh.map((line, i) => (
            <Typography
              key={i}
              component="p"
              sx={{
                fontSize: 15.35,
                fontWeight: 500,
                lineHeight: 1.2,
                color: '#000000',
              }}
            >
              {line}
            </Typography>
          ))}
          <Typography
            component="p"
            sx={{
              mt: '6px',
              fontSize: 10,
              fontWeight: 500,
              lineHeight: 1.3,
              color: '#666666',
            }}
          >
            {nameplate.nameEn}
          </Typography>
        </Box>
      </Box>
    );
  }

  // 官方 logo 組合圖：依各計畫設計稿的橫向／直向比例自然呈現，高度依 size 等比縮放
  if (logoSrc) {
    return <PlanLogoImage src={logoSrc} label={name.zh} size={size} />;
  }

  const emblem = planId ? PLAN_EMBLEMS[planId] : undefined;
  const EmblemIcon = emblem?.Icon ?? PaletteOutlinedIcon;
  const emblemBg = emblem?.bg ?? portalTokens.color.brandOrange;

  return (
    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
      <Box
        sx={{
          flexShrink: 0,
          width: size,
          height: size,
          borderRadius: `${portalTokens.radius.control}px`,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          overflow: 'hidden',
          bgcolor: emblemBg,
          color: portalTokens.color.surface,
        }}
      >
        <EmblemIcon sx={{ fontSize: size * 0.5 }} />
      </Box>

      <Box sx={{ minWidth: 0 }}>
        <Typography
          component="p"
          sx={{
            fontSize: 14,
            fontWeight: 600,
            lineHeight: 1.35,
            color: portalTokens.color.ink,
          }}
        >
          {name.zh}
        </Typography>
        {name.en && (
          <Typography
            component="p"
            sx={{
              mt: 0.25,
              fontSize: 10,
              lineHeight: 1.4,
              color: portalTokens.color.inkMuted,
            }}
          >
            {name.en}
          </Typography>
        )}
      </Box>
    </Box>
  );
}
