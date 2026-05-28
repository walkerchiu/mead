'use client';

import type { ComponentType } from 'react';

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
  /** 徽記尺寸（px），預設 56；亦作為 logo 組合圖的高度上限基準 */
  size?: number;
}

/**
 * PlanLogo — 計畫識別。
 *
 * 帶 `logoSrc` 時顯示該計畫的官方 logo 組合圖（標誌＋品牌字標已含於圖中，
 * 故不再另列計畫名稱文字）；未帶時依 `planId` 顯示替代徽記＋中英文名稱。
 */
export function PlanLogo({ name, planId, logoSrc, size = 56 }: PlanLogoProps) {
  // 官方 logo 組合圖：依各計畫設計稿的橫向／直向比例自然呈現，高度依 size 等比縮放
  if (logoSrc) {
    return (
      <Box
        component="img"
        src={logoSrc}
        alt={name.zh}
        sx={{
          display: 'block',
          width: 'auto',
          height: 'auto',
          // 同寬欄對齊，並限制高度避免多行 lockup（idc/tisdc）過高
          maxWidth: size * 3.9,
          maxHeight: size * 2.1,
        }}
      />
    );
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
