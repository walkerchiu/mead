'use client';

import { Typography, Box, Alert, Stack, Divider, Paper } from '@mui/material';
import {
  PlayArrow as PlayArrowIcon,
  FlashOn as FlashOnIcon,
  Info as InfoIcon,
  Warning as WarningIcon,
  CheckCircle as CheckIcon,
  Cancel as CancelIcon,
} from '@mui/icons-material';
import { useTranslations } from 'next-intl';
import { Modal, type ModalAction } from '@/components/organisms';

interface CronJobTriggerDialogProps {
  open: boolean;
  jobName: string;
  displayName: string;
  isEnabled: boolean;
  onClose: () => void;
  onConfirm: (force: boolean) => void;
  triggering?: boolean;
}

export const CronJobTriggerDialog = ({
  open,
  jobName,
  displayName,
  isEnabled,
  onClose,
  onConfirm,
  triggering = false,
}: CronJobTriggerDialogProps) => {
  const t = useTranslations('pages.hq.cronJobs.table.triggerDialog');

  const actions: ModalAction[] = [
    {
      label: t('forceExecute'),
      onClick: () => onConfirm(true),
      variant: 'contained',
      color: 'error',
      disabled: triggering,
      loading: triggering,
    },
    {
      label: t('normalExecute'),
      onClick: () => onConfirm(false),
      variant: 'contained',
      color: 'primary',
      disabled: !isEnabled || triggering,
      loading: triggering,
    },
  ];

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={t('title')}
      maxWidth="md"
      fullWidth
      actions={actions}
      showCloseButton
      dividers
    >
      <Stack spacing={2.5}>
        {/* Job 資訊 */}
        <Paper
          elevation={0}
          sx={{
            p: 2,
            bgcolor: 'grey.50',
            borderRadius: 2,
          }}
        >
          <Typography variant="body2" color="text.secondary" gutterBottom>
            {t('jobName')}
          </Typography>
          <Typography variant="h6" fontWeight="600" gutterBottom>
            {displayName}
          </Typography>
          <Typography
            variant="caption"
            color="text.secondary"
            fontFamily="monospace"
          >
            {jobName}
          </Typography>
        </Paper>

        {/* 狀態警告 */}
        {!isEnabled && (
          <Alert severity="warning" icon={<WarningIcon />}>
            <Typography variant="body2">{t('jobDisabledWarning')}</Typography>
          </Alert>
        )}

        {/* 說明文字 */}
        <Typography variant="body2" color="text.secondary">
          {t('description')}
        </Typography>

        {/* 執行模式選項 */}
        <Stack spacing={2}>
          {/* 正常執行選項 */}
          <Paper
            elevation={0}
            sx={{
              p: 2.5,
              border: 2,
              borderColor: 'primary.main',
              borderRadius: 2,
              bgcolor: 'primary.50',
            }}
          >
            <Stack
              direction="row"
              spacing={1.5}
              alignItems="flex-start"
              mb={1.5}
            >
              <PlayArrowIcon color="primary" sx={{ mt: 0.5 }} />
              <Box flex={1}>
                <Typography
                  variant="subtitle1"
                  color="primary.main"
                  fontWeight="600"
                  gutterBottom
                >
                  {t('normalMode.title')}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  {t('normalMode.description')}
                </Typography>
              </Box>
            </Stack>

            <Divider sx={{ my: 1.5, borderColor: 'primary.200' }} />

            <Stack spacing={0.75}>
              <Stack direction="row" spacing={1} alignItems="center">
                <CheckIcon fontSize="small" color="success" />
                <Typography variant="body2">
                  {t('normalMode.check1')}
                </Typography>
              </Stack>
              <Stack direction="row" spacing={1} alignItems="center">
                <CheckIcon fontSize="small" color="success" />
                <Typography variant="body2">
                  {t('normalMode.check2')}
                </Typography>
              </Stack>
            </Stack>
          </Paper>

          {/* 強制執行選項 */}
          <Paper
            elevation={0}
            sx={{
              p: 2.5,
              border: 2,
              borderColor: 'error.main',
              borderRadius: 2,
              bgcolor: 'error.50',
            }}
          >
            <Stack
              direction="row"
              spacing={1.5}
              alignItems="flex-start"
              mb={1.5}
            >
              <FlashOnIcon color="error" sx={{ mt: 0.5 }} />
              <Box flex={1}>
                <Typography
                  variant="subtitle1"
                  color="error.main"
                  fontWeight="600"
                  gutterBottom
                >
                  {t('forceMode.title')}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  {t('forceMode.description')}
                </Typography>
              </Box>
            </Stack>

            <Divider sx={{ my: 1.5, borderColor: 'error.200' }} />

            <Stack spacing={0.75} mb={2}>
              <Stack direction="row" spacing={1} alignItems="center">
                <CancelIcon fontSize="small" color="error" />
                <Typography variant="body2">{t('forceMode.skip1')}</Typography>
              </Stack>
              <Stack direction="row" spacing={1} alignItems="center">
                <CancelIcon fontSize="small" color="error" />
                <Typography variant="body2">{t('forceMode.skip2')}</Typography>
              </Stack>
            </Stack>

            <Alert severity="error" icon={<WarningIcon />} sx={{ mb: 0 }}>
              <Typography variant="body2">{t('forceMode.warning')}</Typography>
            </Alert>
          </Paper>
        </Stack>

        {/* 提示資訊 */}
        <Alert severity="info" icon={<InfoIcon />}>
          <Typography variant="body2">{t('auditLogNote')}</Typography>
        </Alert>
      </Stack>
    </Modal>
  );
};
