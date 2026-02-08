'use client';

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
  Switch,
  CircularProgress,
} from '@mui/material';
import {
  Schedule as ScheduleIcon,
  Info as InfoIcon,
  Assessment as AssessmentIcon,
  CheckCircle as SuccessIcon,
  Error as ErrorIcon,
  HourglassEmpty as TimeoutIcon,
  PlayArrow as RunningIcon,
  Block as SkippedIcon,
  DataObject as DataObjectIcon,
  TableChart as TableChartIcon,
  Warning as WarningIcon,
} from '@mui/icons-material';
import { useTranslations } from 'next-intl';
import { useSnackbar } from 'notistack';
import { Modal } from '@/components/organisms';
import { DetailRow } from '@/components/molecules';
import { useMediaQuery } from '@/hooks/useMediaQuery';
import { downloadJSON, downloadCSV } from '@/utils/download';
import type { CronJobConfig, CronJobStatus } from '@/hooks/useCronJobs';

interface CronJobConfigDetailsModalProps {
  open: boolean;
  config: CronJobConfig | null;
  onClose: () => void;
  onToggleEnabled?: (jobName: string, isEnabled: boolean) => Promise<void>;
}

/**
 * 狀態圖示映射
 */
const STATUS_ICONS: Record<CronJobStatus, React.ReactElement> = {
  SUCCESS: <SuccessIcon color="success" fontSize="small" />,
  FAILED: <ErrorIcon color="error" fontSize="small" />,
  TIMEOUT: <TimeoutIcon color="warning" fontSize="small" />,
  RUNNING: <RunningIcon color="info" fontSize="small" />,
  SKIPPED: <SkippedIcon color="disabled" fontSize="small" />,
};

/**
 * 格式化時長（毫秒 -> 秒/分鐘）
 */
function formatDuration(ms?: number): string {
  if (!ms) return '-';
  if (ms < 1000) return `${ms}ms`;
  if (ms < 60000) return `${(ms / 1000).toFixed(1)}s`;
  return `${(ms / 60000).toFixed(1)}min`;
}

/**
 * 格式化日期時間
 */
function formatDateTime(dateStr?: string): string {
  if (!dateStr) return '-';
  return new Date(dateStr).toLocaleString('zh-TW', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
  });
}

/**
 * 計算成功率
 */
function calculateSuccessRate(total: number, failures: number): number {
  if (total === 0) return 0;
  const successful = total - failures;
  return Math.round((successful / total) * 100);
}

/**
 * 獲取任務影響說明
 */
function getJobImpactDescription(
  jobName: string,
  t: any,
): {
  title: string;
  description: string;
  impacts: string[];
  dataRetention: string;
  deletionType: string;
} {
  switch (jobName) {
    case 'cleanup-expired-sessions':
      return {
        title: t('impacts.session.title'),
        description: t('impacts.session.description'),
        impacts: [
          t('impacts.session.impact1'),
          t('impacts.session.impact2'),
          t('impacts.session.impact3'),
        ],
        dataRetention: t('impacts.session.retention'),
        deletionType: t('impacts.softDelete'),
      };
    case 'cleanup-audit-logs':
      return {
        title: t('impacts.auditLog.title'),
        description: t('impacts.auditLog.description'),
        impacts: [
          t('impacts.auditLog.impact1'),
          t('impacts.auditLog.impact2'),
          t('impacts.auditLog.impact3'),
        ],
        dataRetention: t('impacts.auditLog.retention'),
        deletionType: t('impacts.hardDelete'),
      };
    case 'cleanup-old-notifications':
      return {
        title: t('impacts.notification.title'),
        description: t('impacts.notification.description'),
        impacts: [
          t('impacts.notification.impact1'),
          t('impacts.notification.impact2'),
          t('impacts.notification.impact3'),
        ],
        dataRetention: t('impacts.notification.retention'),
        deletionType: t('impacts.hardDelete'),
      };
    default:
      return {
        title: t('impacts.default.title'),
        description: t('impacts.default.description'),
        impacts: [],
        dataRetention: '-',
        deletionType: '-',
      };
  }
}

export function CronJobConfigDetailsModal({
  open,
  config,
  onClose,
  onToggleEnabled,
}: CronJobConfigDetailsModalProps) {
  const t = useTranslations('pages.hq.cronJobs.configDetails');
  const tc = useTranslations('common');
  const tPage = useTranslations('pages.hq.cronJobs');
  const { isMobile } = useMediaQuery();
  const { enqueueSnackbar } = useSnackbar();
  const [currentTab, setCurrentTab] = useState(0);
  const [toggling, setToggling] = useState(false);

  if (!config) return null;

  const handleToggleEnabled = async () => {
    if (!onToggleEnabled) {
      console.warn(
        '[CronJobConfigDetailsModal] onToggleEnabled is not provided',
      );
      return;
    }

    console.log('[CronJobConfigDetailsModal] Toggling job enabled status:', {
      jobName: config.jobName,
      currentStatus: config.isEnabled,
      newStatus: !config.isEnabled,
    });

    setToggling(true);
    try {
      await onToggleEnabled(config.jobName, !config.isEnabled);

      enqueueSnackbar(tPage('toggleSuccess'), {
        variant: 'success',
        autoHideDuration: 2000,
      });

      console.log(
        '[CronJobConfigDetailsModal] Successfully toggled job enabled status',
      );
    } catch (error) {
      console.error(
        '[CronJobConfigDetailsModal] Failed to toggle job enabled status:',
        error,
      );

      enqueueSnackbar(tPage('toggleError'), {
        variant: 'error',
        autoHideDuration: 3000,
      });
    } finally {
      setToggling(false);
    }
  };

  const successRate = calculateSuccessRate(
    config.totalExecutions,
    config.totalFailures,
  );
  const impactInfo = getJobImpactDescription(config.jobName, t);

  // 匯出功能
  const handleExport = (format: 'json' | 'csv') => {
    const exportData = {
      jobName: config.jobName,
      displayName: config.displayName,
      jobType: config.jobType,
      category: config.category,
      description: config.description || '',
      cronExpression: config.cronExpression,
      timeZone: config.timeZone,
      nextRunAt: config.nextRunAt || '',
      lastExecutedAt: config.lastExecutedAt || '',
      lastStatus: config.lastStatus || '',
      lastDuration: config.lastDuration || 0,
      isEnabled: config.isEnabled,
      timeoutThresholdMs: config.timeoutThresholdMs,
      alertOnFailure: config.alertOnFailure,
      failureThreshold: config.failureThreshold,
      totalExecutions: config.totalExecutions,
      totalFailures: config.totalFailures,
      consecutiveFailures: config.consecutiveFailures,
      successRate: successRate,
      createdAt: config.createdAt || '',
      updatedAt: config.updatedAt || '',
    };

    const filename = `cron-job-config-${config.jobName}-${Date.now()}`;
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
          <ScheduleIcon color="primary" />
          <Typography variant="h6">{config.displayName}</Typography>
          <Chip
            label={config.jobType.toUpperCase()}
            size="small"
            variant="outlined"
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
        '& .MuiPaper-root': {
          maxHeight: '90vh',
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
          <Tab
            label={t('configImpactTab')}
            icon={<WarningIcon fontSize="small" />}
            iconPosition="start"
          />
          <Tab
            label={t('statisticsTab')}
            icon={<AssessmentIcon fontSize="small" />}
            iconPosition="start"
          />
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
                  value={config.jobName}
                  copyable
                  fieldName="jobName"
                  layout="horizontal"
                />
                <DetailRow
                  label={t('type')}
                  value={
                    <Chip
                      label={config.jobType.toUpperCase()}
                      size="small"
                      variant="outlined"
                    />
                  }
                  layout="horizontal"
                />
                <DetailRow
                  label={t('category')}
                  value={
                    <Chip
                      label={config.category.toUpperCase()}
                      size="small"
                      variant="outlined"
                    />
                  }
                  layout="horizontal"
                />
                <DetailRow
                  label={t('description')}
                  value={config.description || '-'}
                  layout="horizontal"
                />
              </Paper>
            </Box>

            {/* 排程資訊 */}
            <Box>
              <Typography
                variant="subtitle1"
                fontWeight={600}
                gutterBottom
                sx={{ display: 'flex', alignItems: 'center', gap: 1 }}
              >
                ⏰ {t('schedule')}
              </Typography>
              <Paper variant="outlined" sx={{ p: 2 }}>
                <DetailRow
                  label={t('cronExpression')}
                  value={
                    <Typography variant="body2" fontFamily="monospace">
                      {config.cronExpression}
                    </Typography>
                  }
                  layout="horizontal"
                />
                <DetailRow
                  label={t('timeZone')}
                  value={config.timeZone}
                  layout="horizontal"
                />
                <DetailRow
                  label={t('nextRun')}
                  value={formatDateTime(config.nextRunAt)}
                  layout="horizontal"
                />
                <DetailRow
                  label={t('lastExecution')}
                  value={formatDateTime(config.lastExecutedAt)}
                  layout="horizontal"
                />
              </Paper>
            </Box>
          </>
        )}

        {/* Tab 1: 配置與影響 */}
        {currentTab === 1 && (
          <>
            {/* 影響說明 */}
            <Box>
              <Typography
                variant="subtitle1"
                fontWeight={600}
                gutterBottom
                sx={{ display: 'flex', alignItems: 'center', gap: 1 }}
              >
                ⚠️ {impactInfo.title}
              </Typography>
              <Alert severity="info" sx={{ mb: 2 }}>
                {impactInfo.description}
              </Alert>
              <Box sx={{ mb: 2 }}>
                <Typography variant="subtitle2" gutterBottom>
                  {t('impacts.title')}:
                </Typography>
                {impactInfo.impacts.map((impact, index) => (
                  <Typography
                    key={index}
                    variant="body2"
                    sx={{ mb: 0.5, pl: 2 }}
                  >
                    • {impact}
                  </Typography>
                ))}
              </Box>
              <Paper variant="outlined" sx={{ p: 2 }}>
                <DetailRow
                  label={t('dataRetention')}
                  value={
                    <Typography variant="body2" fontWeight="medium">
                      {impactInfo.dataRetention}
                    </Typography>
                  }
                  layout="horizontal"
                />
                <DetailRow
                  label={t('deletionType')}
                  value={
                    <Chip
                      label={impactInfo.deletionType}
                      size="small"
                      color={
                        impactInfo.deletionType === t('impacts.softDelete')
                          ? 'success'
                          : 'warning'
                      }
                    />
                  }
                  layout="horizontal"
                />
              </Paper>
            </Box>

            {/* 配置資訊 */}
            <Box>
              <Typography
                variant="subtitle1"
                fontWeight={600}
                gutterBottom
                sx={{ display: 'flex', alignItems: 'center', gap: 1 }}
              >
                🔧 {t('configuration')}
              </Typography>
              <Paper variant="outlined" sx={{ p: 2 }}>
                <DetailRow
                  label={t('status')}
                  value={
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <Switch
                        checked={config.isEnabled}
                        onChange={handleToggleEnabled}
                        disabled={!onToggleEnabled || toggling}
                        size="small"
                      />
                      <Typography variant="body2" color="text.secondary">
                        {config.isEnabled ? t('enabled') : t('disabled')}
                      </Typography>
                      {toggling && (
                        <CircularProgress size={16} sx={{ ml: 0.5 }} />
                      )}
                    </Box>
                  }
                  layout="horizontal"
                />
                <DetailRow
                  label={t('timeout')}
                  value={formatDuration(config.timeoutThresholdMs)}
                  layout="horizontal"
                />
                <DetailRow
                  label={t('alertOnFailure')}
                  value={config.alertOnFailure ? tc('yes') : tc('no')}
                  layout="horizontal"
                />
                <DetailRow
                  label={t('failureThreshold')}
                  value={`${config.failureThreshold} ${t('times')}`}
                  layout="horizontal"
                />
              </Paper>
            </Box>
          </>
        )}

        {/* Tab 2: 執行統計 */}
        {currentTab === 2 && (
          <Box>
            <Typography
              variant="subtitle1"
              fontWeight={600}
              gutterBottom
              sx={{ display: 'flex', alignItems: 'center', gap: 1 }}
            >
              📊 {t('statistics')}
            </Typography>
            <Paper variant="outlined" sx={{ p: 2 }}>
              <DetailRow
                label={t('totalExecutions')}
                value={
                  <Typography variant="body2" fontWeight="medium">
                    {config.totalExecutions}
                  </Typography>
                }
                layout="horizontal"
              />
              <DetailRow
                label={t('successRate')}
                value={
                  <Typography
                    variant="body2"
                    fontWeight="medium"
                    color={successRate >= 95 ? 'success.main' : 'error.main'}
                  >
                    {successRate}% (
                    {config.totalExecutions - config.totalFailures}/
                    {config.totalExecutions})
                  </Typography>
                }
                layout="horizontal"
              />
              <DetailRow
                label={t('consecutiveFailures')}
                value={
                  <Typography
                    variant="body2"
                    fontWeight="medium"
                    color={
                      config.consecutiveFailures > 0
                        ? 'error.main'
                        : 'text.primary'
                    }
                  >
                    {config.consecutiveFailures}
                  </Typography>
                }
                layout="horizontal"
              />
              <DetailRow
                label={t('lastStatus')}
                value={
                  config.lastStatus ? (
                    <Chip
                      icon={STATUS_ICONS[config.lastStatus]}
                      label={config.lastStatus}
                      size="small"
                    />
                  ) : (
                    '-'
                  )
                }
                layout="horizontal"
              />
              <DetailRow
                label={t('lastDuration')}
                value={
                  <Typography variant="body2" fontFamily="monospace">
                    {formatDuration(config.lastDuration)}
                  </Typography>
                }
                layout="horizontal"
              />
            </Paper>
          </Box>
        )}
      </Box>
    </Modal>
  );
}
