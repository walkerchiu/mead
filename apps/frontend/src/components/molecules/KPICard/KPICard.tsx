'use client';

import { ReactNode } from 'react';
import {
  Box,
  Card,
  CardActionArea,
  Typography,
  Skeleton,
  useTheme,
} from '@mui/material';

export interface KPICardProps {
  /** 標題（如「我的提案」）*/
  title: string;
  /** 主要數值（可為數字、字串或自訂 ReactNode）*/
  value?: number | string | ReactNode;
  /** 說明文字（如「進行中」、「本月」）*/
  subtitle?: string;
  /** Icon 元素 */
  icon?: ReactNode;
  /** Icon / 重點色（color token，如 'primary.main'、'secondary.main'、'error.main'）*/
  accentColor?: string;
  /** 點擊導航路徑 */
  href?: string;
  /** 點擊處理（若未指定 href）*/
  onClick?: () => void;
  /** 載入中狀態 */
  loading?: boolean;
  /** 額外的右下角標示（例如「3 件需修改」的小提示）*/
  hint?: string;
  /** 提示文字色調 */
  hintColor?: 'default' | 'warning' | 'error' | 'success';
}

/**
 * KPICard — Dashboard 首頁的指標卡片
 *
 * 用於展示單一關鍵數據，支援點擊導航、載入骨架、提示訊息。
 *
 * @example
 * <KPICard
 *   title="活躍會話"
 *   value={12}
 *   subtitle="目前線上"
 *   icon={<DevicesIcon />}
 *   href="/hq/sessions"
 *   hint="2 件需處理"
 *   hintColor="warning"
 * />
 */
export function KPICard({
  title,
  value,
  subtitle,
  icon,
  accentColor = 'primary.main',
  href,
  onClick,
  loading = false,
  hint,
  hintColor = 'default',
}: KPICardProps) {
  const theme = useTheme();

  const hintColorMap: Record<string, string> = {
    default: 'text.secondary',
    warning: 'warning.main',
    error: 'error.main',
    success: 'success.main',
  };

  const content = (
    <Box
      sx={{
        p: 2.5,
        display: 'flex',
        flexDirection: 'column',
        gap: 1,
        flex: 1,
        minHeight: 132,
      }}
    >
      {/* Icon + Title */}
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.25 }}>
        {icon && (
          <Box
            sx={{
              width: 40,
              height: 40,
              borderRadius: 1.5,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              bgcolor: (t) =>
                t.palette.mode === 'dark'
                  ? 'rgba(255,255,255,0.06)'
                  : 'primary.50',
              color: accentColor,
              flexShrink: 0,
            }}
          >
            {icon}
          </Box>
        )}
        <Typography
          variant="body2"
          sx={{ color: 'text.secondary', fontWeight: 500 }}
        >
          {title}
        </Typography>
      </Box>

      {/* Value */}
      <Box sx={{ display: 'flex', alignItems: 'baseline', gap: 1, mt: 0.5 }}>
        {loading ? (
          <Skeleton variant="text" width={60} height={40} />
        ) : (
          <Typography
            variant="h4"
            component="div"
            sx={{ fontWeight: 700, color: 'text.primary', lineHeight: 1.1 }}
          >
            {value ?? '—'}
          </Typography>
        )}
        {subtitle && !loading && (
          <Typography variant="caption" sx={{ color: 'text.secondary' }}>
            {subtitle}
          </Typography>
        )}
      </Box>

      {/* Hint */}
      {hint && !loading && (
        <Typography
          variant="caption"
          sx={{ color: hintColorMap[hintColor], mt: 'auto', fontWeight: 500 }}
        >
          {hint}
        </Typography>
      )}
    </Box>
  );

  const interactive = Boolean(href || onClick);

  return (
    <Card
      elevation={0}
      sx={{
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        border: '1px solid',
        borderColor: 'divider',
        borderRadius: 2,
        transition: theme.transitions.create(['box-shadow', 'border-color'], {
          duration: theme.transitions.duration.short,
        }),
        ...(interactive && {
          '&:hover': {
            borderColor: accentColor,
            boxShadow: theme.shadows[2],
          },
        }),
      }}
    >
      {interactive ? (
        <CardActionArea
          {...(href ? { component: 'a', href } : { onClick })}
          sx={{ flex: 1, display: 'flex', alignItems: 'stretch' }}
        >
          <Box sx={{ width: '100%', display: 'flex', flexDirection: 'column' }}>
            {content}
          </Box>
        </CardActionArea>
      ) : (
        content
      )}
    </Card>
  );
}
