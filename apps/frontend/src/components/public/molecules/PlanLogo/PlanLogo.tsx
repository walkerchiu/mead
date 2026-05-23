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
  /** 計畫 logo 圖片路徑；提供時優先使用 */
  logoSrc?: string;
  /** 徽記尺寸（px），預設 56 */
  size?: number;
}

/**
 * PlanLogo — 計畫識別：徽記 + 中英文名稱。
 *
 * 參考資料尚未提供各計畫 logo 圖檔，未帶 `logoSrc` 時依 `planId`
 * 顯示該計畫專屬的替代徽記（不同圖示與色調）。
 */
export function PlanLogo({ name, planId, logoSrc, size = 56 }: PlanLogoProps) {
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
          bgcolor: logoSrc ? 'transparent' : emblemBg,
          color: portalTokens.color.surface,
        }}
      >
        {logoSrc ? (
          <Box
            component="img"
            src={logoSrc}
            alt={name.zh}
            sx={{ width: '100%', height: '100%', objectFit: 'contain' }}
          />
        ) : (
          <EmblemIcon sx={{ fontSize: size * 0.5 }} />
        )}
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
