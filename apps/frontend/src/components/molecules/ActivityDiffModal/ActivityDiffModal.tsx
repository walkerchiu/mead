'use client';

import { Box, Typography, Paper, Chip, Stack } from '@mui/material';
import { useTranslations } from 'next-intl';
import { Modal } from '@/components/organisms/Modal';

export interface ActivityDiffModalProps {
  open: boolean;
  onClose: () => void;
  /** 要顯示的欄位名稱（i18n 已翻譯好的 label，例如「內容」） */
  fieldLabel: string;
  /** 變更前的值（已序列化字串；null/undefined 視為空） */
  oldValue?: string | null;
  /** 變更後的值 */
  newValue?: string | null;
  /** 操作時間 */
  timestamp?: string | Date;
  /** 操作人名稱 */
  actorName?: string | null;
  /** 顯示模式：text = 純文字；markdown = 保留格式（等寬字體） */
  mode?: 'text' | 'markdown';
}

/**
 * ActivityDiffModal — 活動紀錄點擊後呈現的欄位變更 Diff 對照 Modal
 *
 * 以左右兩欄呈現「變更前」「變更後」，並顯示操作人、時間、欄位標籤。
 * 基於共用的 `<Modal>` organism 建構，維持全系統 Modal 視覺一致性。
 *
 * 共用於各種 *EditHistory-driven 活動紀錄。
 */
export function ActivityDiffModal({
  open,
  onClose,
  fieldLabel,
  oldValue,
  newValue,
  timestamp,
  actorName,
  mode = 'text',
}: ActivityDiffModalProps) {
  const t = useTranslations('components.activityDiffModal');
  const tc = useTranslations('common');

  const renderValue = (value: string | null | undefined) => {
    if (value == null || value === '') {
      return (
        <Typography
          variant="body2"
          color="text.disabled"
          sx={{ fontStyle: 'italic' }}
        >
          {t('empty')}
        </Typography>
      );
    }
    return (
      <Typography
        variant="body2"
        component="pre"
        sx={{
          whiteSpace: 'pre-wrap',
          wordBreak: 'break-word',
          fontFamily:
            mode === 'text'
              ? 'inherit'
              : '"SF Mono", Menlo, Monaco, Consolas, monospace',
          fontSize: '0.875rem',
          lineHeight: 1.6,
          m: 0,
        }}
      >
        {value}
      </Typography>
    );
  };

  const formattedTimestamp = timestamp
    ? new Date(timestamp).toLocaleString()
    : undefined;

  const titleNode = (
    <Box>
      <Typography variant="h6" component="div">
        {t('title', { field: fieldLabel })}
      </Typography>
      {(actorName || formattedTimestamp) && (
        <Stack
          direction="row"
          spacing={1}
          alignItems="center"
          sx={{ mt: 0.5, color: 'text.secondary' }}
        >
          {actorName && <Typography variant="caption">{actorName}</Typography>}
          {actorName && formattedTimestamp && (
            <Typography variant="caption">·</Typography>
          )}
          {formattedTimestamp && (
            <Typography variant="caption">{formattedTimestamp}</Typography>
          )}
        </Stack>
      )}
    </Box>
  );

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={titleNode}
      maxWidth="md"
      showCloseButton
      actions={[
        {
          label: tc('close'),
          onClick: onClose,
          variant: 'text',
        },
      ]}
    >
      <Box
        sx={{
          display: 'grid',
          gridTemplateColumns: { xs: '1fr', md: '1fr 1fr' },
          gap: 2,
        }}
      >
        {/* 舊值 */}
        <Paper
          variant="outlined"
          sx={{
            p: 2,
            bgcolor: (theme) =>
              theme.palette.mode === 'light' ? '#fff5f5' : '#3a1a1a',
            borderColor: 'error.light',
          }}
        >
          <Chip
            label={t('before')}
            size="small"
            color="error"
            variant="outlined"
            sx={{ mb: 1.5 }}
          />
          {renderValue(oldValue)}
        </Paper>

        {/* 新值 */}
        <Paper
          variant="outlined"
          sx={{
            p: 2,
            bgcolor: (theme) =>
              theme.palette.mode === 'light' ? '#f1faf1' : '#1a2e1a',
            borderColor: 'success.light',
          }}
        >
          <Chip
            label={t('after')}
            size="small"
            color="success"
            variant="outlined"
            sx={{ mb: 1.5 }}
          />
          {renderValue(newValue)}
        </Paper>
      </Box>
    </Modal>
  );
}
