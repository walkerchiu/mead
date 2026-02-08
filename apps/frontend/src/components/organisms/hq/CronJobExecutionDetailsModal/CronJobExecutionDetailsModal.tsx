/**
 * Cron Job Execution Details Modal
 * 顯示 Cron Job 執行的完整詳情
 */

import { useState } from 'react';
import {
  Box,
  Typography,
  Chip,
  Alert,
  Tabs,
  Tab,
  IconButton,
  Tooltip,
  Paper,
} from '@mui/material';
import {
  CheckCircle as SuccessIcon,
  Error as ErrorIcon,
  HourglassEmpty as TimeoutIcon,
  PlayArrow as RunningIcon,
  RemoveCircle as SkippedIcon,
  Info as InfoIcon,
  BugReport as ErrorDetailsIcon,
  DataObject as DataObjectIcon,
  TableChart as TableChartIcon,
} from '@mui/icons-material';
import { useTranslations } from 'next-intl';
import { Modal } from '@/components/organisms';
import { DetailRow } from '@/components/molecules';
import { useMediaQuery } from '@/hooks/useMediaQuery';
import { downloadJSON, downloadCSV } from '@/utils/download';
import type { CronJobExecution, CronJobStatus } from '@/hooks/useCronJobs';

interface CronJobExecutionDetailsModalProps {
  open: boolean;
  execution: CronJobExecution | null;
  onClose: () => void;
}

const STATUS_CONFIG: Record<
  CronJobStatus,
  {
    icon: React.ReactElement;
    label: string;
    color: 'success' | 'error' | 'warning' | 'info' | 'default';
  }
> = {
  SUCCESS: { icon: <SuccessIcon />, label: '成功', color: 'success' },
  FAILED: { icon: <ErrorIcon />, label: '失敗', color: 'error' },
  TIMEOUT: { icon: <TimeoutIcon />, label: '超時', color: 'warning' },
  RUNNING: { icon: <RunningIcon />, label: '執行中', color: 'info' },
  SKIPPED: { icon: <SkippedIcon />, label: '跳過', color: 'default' },
};

/**
 * 格式化時長
 */
function formatDuration(ms: number | null | undefined): string {
  if (ms === null || ms === undefined) return '-';

  if (ms < 1000) return `${ms} ms`;
  if (ms < 60000) return `${(ms / 1000).toFixed(2)} 秒`;
  return `${(ms / 60000).toFixed(2)} 分鐘`;
}

/**
 * 格式化日期時間
 */
function formatDateTime(date: string | null | undefined): string {
  if (!date) return '-';
  return new Date(date).toLocaleString('zh-TW', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
  });
}

/**
 * 格式化 JSON
 */
function formatJSON(obj: any): string {
  if (!obj) return '無';
  try {
    return JSON.stringify(obj, null, 2);
  } catch {
    return String(obj);
  }
}

export function CronJobExecutionDetailsModal({
  open,
  execution,
  onClose,
}: CronJobExecutionDetailsModalProps) {
  const t = useTranslations('pages.hq.cronJobs.executionDetails');
  const { isMobile } = useMediaQuery();
  const [currentTab, setCurrentTab] = useState(0);

  if (!execution) return null;

  const statusConfig = STATUS_CONFIG[execution.status];

  // 匯出功能
  const handleExport = (format: 'json' | 'csv') => {
    const exportData = {
      id: execution.id,
      jobName: execution.jobName,
      jobType: execution.jobType,
      status: execution.status,
      startedAt: execution.startedAt || '',
      completedAt: execution.completedAt || '',
      duration: execution.duration || 0,
      processedCount: execution.processedCount || 0,
      successCount: execution.successCount || 0,
      errorCount: execution.errorCount || 0,
      instanceId: execution.instanceId || '',
      lockId: execution.lockId || '',
      errorMessage: execution.errorMessage || '',
      nextRunAt: execution.nextRunAt || '',
    };

    const filename = `cron-job-execution-${execution.id}-${Date.now()}`;
    if (format === 'json') {
      downloadJSON(exportData, `${filename}.json`);
    } else {
      downloadCSV(exportData, `${filename}.csv`);
    }
  };

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={
        <Box
          sx={{ display: 'flex', alignItems: 'center', gap: 1, width: '100%' }}
        >
          <Typography variant="h6">{t('title')}</Typography>
          <Chip
            icon={statusConfig.icon}
            label={statusConfig.label}
            color={statusConfig.color}
            size="small"
          />
          <Box sx={{ display: 'flex', gap: 1, ml: 'auto' }}>
            <Tooltip title={t('exportJSON')}>
              <IconButton size="small" onClick={() => handleExport('json')}>
                <DataObjectIcon fontSize="small" />
              </IconButton>
            </Tooltip>
            <Tooltip title={t('exportCSV')}>
              <IconButton size="small" onClick={() => handleExport('csv')}>
                <TableChartIcon fontSize="small" />
              </IconButton>
            </Tooltip>
          </Box>
        </Box>
      }
      maxWidth="md"
      fullWidth
      dividers
      fullScreen={isMobile}
      sx={{
        '& .MuiDialogContent-root': {
          pt: { xs: 1, sm: 1.5 },
          px: { xs: 2, sm: 3 },
          pb: { xs: 2, sm: 3 },
        },
      }}
    >
      {/* Tabs */}
      <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 2 }}>
        <Tabs value={currentTab} onChange={(_, v) => setCurrentTab(v)}>
          <Tab
            label={t('basicInfoTab')}
            icon={<InfoIcon fontSize="small" />}
            iconPosition="start"
          />
          {execution.status === 'FAILED' && execution.errorMessage && (
            <Tab
              label={t('errorDetailsTab')}
              icon={<ErrorDetailsIcon fontSize="small" />}
              iconPosition="start"
            />
          )}
          {execution.details && (
            <Tab
              label={t('executionDetailsTab')}
              icon={<DataObjectIcon fontSize="small" />}
              iconPosition="start"
            />
          )}
        </Tabs>
      </Box>

      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
        {/* Tab 0: 基本資訊 */}
        {currentTab === 0 && (
          <>
            {/* 基本資訊 */}
            <Box>
              <Typography
                variant="subtitle1"
                fontWeight={600}
                gutterBottom
                sx={{ display: 'flex', alignItems: 'center', gap: 1 }}
              >
                📌 {t('basicInfo')}
              </Typography>
              <Paper variant="outlined" sx={{ p: 2 }}>
                <DetailRow
                  label={t('jobName')}
                  value={execution.jobName}
                  layout="horizontal"
                />
                <DetailRow
                  label={t('jobType')}
                  value={
                    <Chip
                      label={execution.jobType.toUpperCase()}
                      size="small"
                      variant="outlined"
                    />
                  }
                  layout="horizontal"
                />
                <DetailRow
                  label={t('duration')}
                  value={formatDuration(execution.duration)}
                  layout="horizontal"
                />
                <DetailRow
                  label={t('instanceId')}
                  value={execution.instanceId || '-'}
                  copyable={!!execution.instanceId}
                  fieldName="instanceId"
                  layout="horizontal"
                />
                {execution.lockId && (
                  <DetailRow
                    label={t('lockId')}
                    value={execution.lockId}
                    copyable
                    fieldName="lockId"
                    layout="horizontal"
                  />
                )}
              </Paper>
            </Box>

            {/* 執行數據 */}
            <Box>
              <Typography
                variant="subtitle1"
                fontWeight={600}
                gutterBottom
                sx={{ display: 'flex', alignItems: 'center', gap: 1 }}
              >
                📊 {t('executionData')}
              </Typography>
              <Box
                sx={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(3, 1fr)',
                  gap: 2,
                }}
              >
                <Paper variant="outlined" sx={{ p: 2, textAlign: 'center' }}>
                  <Typography variant="caption" color="text.secondary">
                    {t('processedCount')}
                  </Typography>
                  <Typography variant="h4">
                    {execution.processedCount ?? '-'}
                  </Typography>
                </Paper>

                <Paper variant="outlined" sx={{ p: 2, textAlign: 'center' }}>
                  <Typography variant="caption" color="success.main">
                    {t('successCount')}
                  </Typography>
                  <Typography variant="h4" color="success.main">
                    {execution.successCount ?? '-'}
                  </Typography>
                </Paper>

                <Paper variant="outlined" sx={{ p: 2, textAlign: 'center' }}>
                  <Typography variant="caption" color="error.main">
                    {t('errorCount')}
                  </Typography>
                  <Typography variant="h4" color="error.main">
                    {execution.errorCount ?? '-'}
                  </Typography>
                </Paper>
              </Box>
            </Box>

            {/* 時間軸 */}
            <Box>
              <Typography
                variant="subtitle1"
                fontWeight={600}
                gutterBottom
                sx={{ display: 'flex', alignItems: 'center', gap: 1 }}
              >
                ⏰ {t('timeline')}
              </Typography>
              <Paper variant="outlined" sx={{ p: 2 }}>
                <DetailRow
                  label={t('startedAt')}
                  value={formatDateTime(execution.startedAt)}
                  layout="horizontal"
                />
                <DetailRow
                  label={t('completedAt')}
                  value={formatDateTime(execution.completedAt)}
                  layout="horizontal"
                />
                {execution.nextRunAt && (
                  <DetailRow
                    label={t('nextRunAt')}
                    value={formatDateTime(execution.nextRunAt)}
                    layout="horizontal"
                  />
                )}
              </Paper>
            </Box>
          </>
        )}

        {/* Tab 1: 錯誤詳情（如果有錯誤） */}
        {execution.status === 'FAILED' &&
          execution.errorMessage &&
          currentTab === 1 && (
            <Box>
              <Typography
                variant="subtitle1"
                fontWeight={600}
                gutterBottom
                sx={{ display: 'flex', alignItems: 'center', gap: 1 }}
                color="error"
              >
                ❌ {t('errorDetails')}
              </Typography>

              <Alert severity="error" sx={{ mb: 2 }}>
                {execution.errorMessage}
              </Alert>

              {execution.errorStack && (
                <Box>
                  <Typography variant="subtitle2" gutterBottom sx={{ mt: 2 }}>
                    {t('errorStack')}
                  </Typography>
                  <Paper
                    variant="outlined"
                    sx={{
                      p: 2,
                      bgcolor: 'grey.50',
                      maxHeight: 500,
                      overflow: 'auto',
                    }}
                  >
                    <pre
                      style={{
                        margin: 0,
                        fontFamily: 'monospace',
                        fontSize: '0.875rem',
                        whiteSpace: 'pre-wrap',
                        wordBreak: 'break-word',
                      }}
                    >
                      {execution.errorStack}
                    </pre>
                  </Paper>
                </Box>
              )}
            </Box>
          )}

        {/* Tab 2/1: 執行詳情（如果有 details） */}
        {execution.details &&
          currentTab ===
            (execution.status === 'FAILED' && execution.errorMessage
              ? 2
              : 1) && (
            <Box>
              <Typography
                variant="subtitle1"
                fontWeight={600}
                gutterBottom
                sx={{ display: 'flex', alignItems: 'center', gap: 1 }}
              >
                📄 {t('executionDetails')}
              </Typography>
              <Paper
                variant="outlined"
                sx={{
                  p: 2,
                  bgcolor: 'grey.50',
                  maxHeight: 500,
                  overflow: 'auto',
                }}
              >
                <pre
                  style={{
                    margin: 0,
                    fontFamily: 'monospace',
                    fontSize: '0.875rem',
                    whiteSpace: 'pre-wrap',
                    wordBreak: 'break-word',
                  }}
                >
                  {formatJSON(execution.details)}
                </pre>
              </Paper>
            </Box>
          )}
      </Box>
    </Modal>
  );
}
