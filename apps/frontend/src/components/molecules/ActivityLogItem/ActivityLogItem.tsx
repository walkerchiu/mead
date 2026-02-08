'use client';

import { ReactNode } from 'react';
import { Box, Typography, Stack, Paper, Avatar, Chip } from '@mui/material';
import { useTranslations, useLocale } from 'next-intl';
import { format, formatDistanceToNow } from 'date-fns';
import { zhTW, enUS } from 'date-fns/locale';

/**
 * FieldEditDiff — 活動紀錄中 FIELD_EDIT 事件的統一內容呈現
 *
 * 顯示為「修改了『欄位』：Chip(舊值) → Chip(新值)」，可在所有模組共用，
 * 確保各種 ActivityLog 的 FIELD_EDIT 行內容視覺一致。
 */
export interface FieldEditDiffProps {
  /** 已翻譯的欄位標籤 */
  fieldLabel: string;
  oldValue?: string | null;
  newValue?: string | null;
  /** 每個 chip 顯示的最大字元數，超過會以 `...` 截斷 */
  maxChars?: number;
}

export function FieldEditDiff({
  fieldLabel,
  oldValue,
  newValue,
  maxChars = 40,
}: FieldEditDiffProps) {
  const t = useTranslations('components.activityDiffModal');
  const truncate = (v: string | null | undefined) => {
    if (v == null || v === '') return t('empty');
    return v.length > maxChars ? v.slice(0, maxChars) + '…' : v;
  };

  return (
    <Box>
      <Typography variant="body2" color="text.secondary" component="span">
        修改了
      </Typography>{' '}
      <Typography
        variant="body2"
        color="text.primary"
        component="span"
        sx={{ fontWeight: 500 }}
      >
        「{fieldLabel}」
      </Typography>
      <Stack
        direction="row"
        spacing={0.5}
        alignItems="center"
        sx={{ mt: 0.5, flexWrap: 'wrap', rowGap: 0.5 }}
      >
        <Chip
          label={truncate(oldValue)}
          size="small"
          variant="outlined"
          sx={{
            textDecoration: oldValue ? 'line-through' : 'none',
            color: 'text.secondary',
            borderColor: 'divider',
            maxWidth: '100%',
            '& .MuiChip-label': {
              whiteSpace: 'normal',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
            },
          }}
        />
        <Typography variant="caption" color="text.secondary">
          →
        </Typography>
        <Chip
          label={truncate(newValue)}
          size="small"
          variant="outlined"
          color="primary"
          sx={{
            maxWidth: '100%',
            '& .MuiChip-label': {
              whiteSpace: 'normal',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
            },
          }}
        />
      </Stack>
    </Box>
  );
}

export interface ActivityLogItemProps {
  /** 操作人名稱（通常是 user.name，fallback email） */
  actorName?: string | null;
  /** 操作時間 */
  timestamp: string | Date;
  /** 事件類型 icon（顯示在左側 timeline dot 內） */
  icon?: ReactNode;
  /** 事件類型配色 — 影響 dot 顏色（primary / success / error / warning / info / grey）*/
  color?: 'primary' | 'success' | 'error' | 'warning' | 'info' | 'grey';
  /** 事件描述內容 */
  children: ReactNode;
  /** 若提供會讓整列可點擊（適用 FIELD_EDIT 打開 Diff Modal） */
  onClick?: () => void;
  /** 時區格式化時間字串，覆寫預設 toLocaleString */
  formattedTimestamp?: string;
  /** 是否為清單首項（隱藏上方連接線） */
  isFirst?: boolean;
  /** 是否為清單末項（隱藏下方連接線） */
  isLast?: boolean;
}

const DOT_SIZE = 24;
const RAIL_WIDTH = 2;

/**
 * ActivityLogItem — 全系統活動紀錄時間軸的統一單行元件
 *
 * 垂直時間軸樣式：左側為 icon dot + 上下連接線，右側為 actor/timestamp/事件描述。
 * 用於各種 *ActivityFeed 列表項目，以維持全系統視覺一致。
 */
export function ActivityLogItem({
  actorName,
  timestamp,
  icon,
  color = 'grey',
  children,
  onClick,
  formattedTimestamp,
  isFirst = false,
  isLast = false,
}: ActivityLogItemProps) {
  const displayName = actorName || 'System';
  const locale = useLocale();
  const dateLocale = locale === 'zh-TW' ? zhTW : enUS;
  const dateObj = new Date(timestamp);
  const absolute =
    formattedTimestamp ??
    format(dateObj, 'yyyy/MM/dd HH:mm', { locale: dateLocale });
  const relative = formatDistanceToNow(dateObj, {
    addSuffix: true,
    locale: dateLocale,
  });

  const clickable = typeof onClick === 'function';

  return (
    <Box
      sx={{
        display: 'flex',
        alignItems: 'stretch',
        gap: 1.5,
        position: 'relative',
      }}
    >
      {/* 左側：時間軸（連接線 + dot） */}
      <Box
        sx={{
          position: 'relative',
          width: DOT_SIZE,
          flexShrink: 0,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
        }}
      >
        {/* 上方連接線 */}
        <Box
          sx={{
            width: RAIL_WIDTH,
            flex: '0 0 10px',
            bgcolor: isFirst ? 'transparent' : 'divider',
          }}
        />
        {/* Dot */}
        <Box
          sx={{
            width: DOT_SIZE,
            height: DOT_SIZE,
            borderRadius: '50%',
            bgcolor: (theme) =>
              color === 'grey'
                ? theme.palette.grey[400]
                : theme.palette[color].main,
            color: (theme) =>
              color === 'grey'
                ? theme.palette.getContrastText(theme.palette.grey[400])
                : theme.palette[color].contrastText,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            flexShrink: 0,
            boxShadow: 1,
            '& svg': { fontSize: 14 },
          }}
        >
          {icon}
        </Box>
        {/* 下方連接線 */}
        <Box
          sx={{
            width: RAIL_WIDTH,
            flex: 1,
            bgcolor: isLast ? 'transparent' : 'divider',
          }}
        />
      </Box>

      {/* 右側：卡片 */}
      <Box sx={{ flex: 1, minWidth: 0, pb: 1.5 }}>
        <Paper
          elevation={0}
          onClick={onClick}
          sx={{
            p: 1.5,
            border: '1px solid',
            borderColor: 'divider',
            borderRadius: 1.5,
            cursor: clickable ? 'pointer' : 'default',
            transition: 'all 0.15s',
            '&:hover': clickable
              ? {
                  borderColor: 'primary.light',
                  boxShadow: 1,
                }
              : undefined,
          }}
        >
          <Stack
            direction="row"
            spacing={1}
            alignItems="center"
            justifyContent="space-between"
            sx={{ mb: 0.75, flexWrap: 'wrap', gap: 0.5 }}
          >
            <Stack direction="row" spacing={0.75} alignItems="center">
              <Avatar
                sx={{
                  width: 20,
                  height: 20,
                  fontSize: 11,
                  bgcolor: 'primary.main',
                }}
              >
                {displayName.charAt(0).toUpperCase()}
              </Avatar>
              <Typography variant="body2" fontWeight={600} noWrap>
                {displayName}
              </Typography>
            </Stack>
            <Typography variant="caption" color="text.secondary">
              {absolute}
              {relative ? `（${relative}）` : ''}
            </Typography>
          </Stack>
          <Box
            sx={{
              color: 'text.secondary',
              fontSize: '0.875rem',
              lineHeight: 1.55,
              wordBreak: 'break-word',
            }}
          >
            {children}
          </Box>
        </Paper>
      </Box>
    </Box>
  );
}
