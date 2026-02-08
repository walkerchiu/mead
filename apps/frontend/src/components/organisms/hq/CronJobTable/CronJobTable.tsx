'use client';

import { useState, useEffect } from 'react';
import {
  Card,
  CardContent,
  Typography,
  Box,
  Chip,
  IconButton,
  Tooltip,
  Stack,
} from '@mui/material';
import {
  PlayArrow as PlayArrowIcon,
  CheckCircle as SuccessIcon,
  Error as ErrorIcon,
  HourglassEmpty as TimeoutIcon,
  PlayArrow as RunningIcon,
  Block as SkippedIcon,
  Visibility as VisibilityIcon,
} from '@mui/icons-material';
import { useTranslations } from 'next-intl';
import { DataTable, type DataTableColumn } from '@/components/molecules';
import { CronJobConfigDetailsModal } from '../CronJobConfigDetailsModal';
import { CronJobTriggerDialog } from '../CronJobTriggerDialog';
import type { CronJobStatus, CronJobConfig } from '@/hooks/useCronJobs';

interface CronJobTableProps {
  configs: CronJobConfig[];
  loading?: boolean;
  onToggleEnabled: (jobName: string, isEnabled: boolean) => Promise<void>;
  onTriggerJob: (jobName: string, force: boolean) => Promise<any>;
  triggering?: boolean;
  onRefresh?: () => void;
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
 * 狀態顏色映射
 */
const STATUS_COLORS: Record<
  CronJobStatus,
  'success' | 'error' | 'warning' | 'info' | 'default'
> = {
  SUCCESS: 'success',
  FAILED: 'error',
  TIMEOUT: 'warning',
  RUNNING: 'info',
  SKIPPED: 'default',
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
function calculateSuccessRate(total: number, successful: number): number {
  if (total === 0) return 0;
  return Math.round((successful / total) * 100);
}

export function CronJobTable({
  configs,
  loading,
  onToggleEnabled,
  onTriggerJob,
  triggering,
}: CronJobTableProps) {
  const t = useTranslations('pages.hq.cronJobs.table');
  const [detailsOpen, setDetailsOpen] = useState(false);
  const [selectedConfig, setSelectedConfig] = useState<CronJobConfig | null>(
    null,
  );
  const [triggerDialogOpen, setTriggerDialogOpen] = useState(false);
  const [jobToTrigger, setJobToTrigger] = useState<CronJobConfig | null>(null);

  const handleOpenDetails = (config: CronJobConfig) => {
    setSelectedConfig(config);
    setDetailsOpen(true);
  };

  const handleCloseDetails = () => {
    setDetailsOpen(false);
    setSelectedConfig(null);
  };

  const handleOpenTriggerDialog = (config: CronJobConfig) => {
    setJobToTrigger(config);
    setTriggerDialogOpen(true);
  };

  const handleCloseTriggerDialog = () => {
    setTriggerDialogOpen(false);
    setJobToTrigger(null);
  };

  const handleConfirmTrigger = async (force: boolean) => {
    if (jobToTrigger) {
      await onTriggerJob(jobToTrigger.jobName, force);
      handleCloseTriggerDialog();
    }
  };

  // 當 configs 更新時，同步更新 selectedConfig
  useEffect(() => {
    if (selectedConfig && configs.length > 0) {
      const updatedConfig = configs.find(
        (c) => c.jobName === selectedConfig.jobName,
      );
      if (updatedConfig) {
        setSelectedConfig(updatedConfig);
      }
    }
  }, [configs, selectedConfig]);

  // 定義表格列
  const columns: DataTableColumn<CronJobConfig>[] = [
    {
      id: 'displayName',
      label: t('jobName'),
      sortable: true,
      width: '180px',
      render: (_, row) => (
        <Box>
          <Typography variant="body2" fontWeight="medium">
            {row.displayName}
          </Typography>
          <Typography variant="caption" color="text.secondary">
            {row.jobName}
          </Typography>
        </Box>
      ),
    },
    {
      id: 'category',
      label: t('category'),
      sortable: true,
      align: 'center',
      width: '120px',
      render: (_, row) => (
        <Chip
          label={row.category.toUpperCase()}
          size="small"
          variant="outlined"
        />
      ),
    },
    {
      id: 'jobType',
      label: t('type'),
      sortable: true,
      align: 'center',
      width: '100px',
      render: (_, row) => (
        <Chip
          label={row.jobType.toUpperCase()}
          size="small"
          variant="outlined"
        />
      ),
    },
    {
      id: 'cronExpression',
      label: t('schedule'),
      align: 'center',
      width: '150px',
      render: (_, row) => (
        <Typography
          variant="body2"
          fontFamily="monospace"
          sx={{ fontSize: '0.875rem' }}
        >
          {row.cronExpression}
        </Typography>
      ),
    },
    {
      id: 'lastExecutedAt',
      label: t('lastExecution'),
      sortable: true,
      align: 'center',
      width: '180px',
      render: (_, row) => (
        <Box>
          <Typography variant="body2">
            {formatDateTime(row.lastExecutedAt)}
          </Typography>
          {row.lastDuration && (
            <Typography variant="caption" color="text.secondary">
              ({formatDuration(row.lastDuration)})
            </Typography>
          )}
        </Box>
      ),
    },
    {
      id: 'lastStatus',
      label: t('status'),
      align: 'center',
      width: '120px',
      render: (_, row) =>
        row.lastStatus ? (
          <Chip
            icon={STATUS_ICONS[row.lastStatus]}
            label={row.lastStatus}
            color={STATUS_COLORS[row.lastStatus]}
            size="small"
          />
        ) : null,
    },
    {
      id: 'successRate',
      label: t('successRate'),
      sortable: true,
      align: 'center',
      width: '120px',
      render: (_, row) => {
        const successRate = calculateSuccessRate(
          row.totalExecutions,
          row.totalExecutions - row.totalFailures,
        );
        return (
          <Box>
            <Typography
              variant="body2"
              color={successRate >= 95 ? 'success.main' : 'error.main'}
              fontWeight="medium"
            >
              {successRate}%
            </Typography>
            <Typography variant="caption" color="text.secondary">
              {row.totalExecutions - row.totalFailures}/{row.totalExecutions}
            </Typography>
          </Box>
        );
      },
    },
    {
      id: 'consecutiveFailures',
      label: t('consecutiveFailures'),
      align: 'center',
      width: '120px',
      render: (_, row) =>
        row.consecutiveFailures > 0 ? (
          <Chip label={row.consecutiveFailures} color="error" size="small" />
        ) : null,
    },
    {
      id: 'isEnabled',
      label: t('enabled'),
      align: 'center',
      width: '100px',
      render: (_, row) => (
        <Chip
          label={row.isEnabled ? t('statuses.enabled') : t('statuses.disabled')}
          size="small"
          color={row.isEnabled ? 'success' : 'default'}
          sx={{
            fontWeight: 500,
            minWidth: '70px',
          }}
        />
      ),
    },
    {
      id: 'actions',
      label: t('actions'),
      align: 'center',
      width: '120px',
      render: (_, row) => (
        <Stack direction="row" spacing={0.5} justifyContent="center">
          <Tooltip title={t('viewDetails')}>
            <IconButton
              size="medium"
              onClick={(e) => {
                e.stopPropagation();
                handleOpenDetails(row);
              }}
            >
              <VisibilityIcon fontSize="small" />
            </IconButton>
          </Tooltip>
          <Tooltip title={t('trigger')}>
            <span>
              <IconButton
                onClick={(e) => {
                  e.stopPropagation();
                  handleOpenTriggerDialog(row);
                }}
                disabled={triggering}
                size="medium"
                color="primary"
              >
                <PlayArrowIcon fontSize="small" />
              </IconButton>
            </span>
          </Tooltip>
        </Stack>
      ),
    },
  ];

  // 為 DataTable 添加 id 屬性
  const configsWithId = configs.map((config) => ({
    ...config,
    id: config.jobName,
  }));

  return (
    <Card elevation={2} sx={{ mb: 3 }}>
      <CardContent>
        <Typography variant="h6" gutterBottom>
          {t('title')}
        </Typography>
        <DataTable
          columns={columns}
          data={configsWithId}
          loading={loading}
          emptyText={t('noJobs')}
        />
      </CardContent>

      {/* Config Details Modal - conditional rendering to avoid z-index issues */}
      {detailsOpen && (
        <CronJobConfigDetailsModal
          open={detailsOpen}
          config={selectedConfig}
          onClose={handleCloseDetails}
          onToggleEnabled={onToggleEnabled}
        />
      )}

      {/* Trigger Confirmation Dialog */}
      {jobToTrigger && (
        <CronJobTriggerDialog
          open={triggerDialogOpen}
          jobName={jobToTrigger.jobName}
          displayName={jobToTrigger.displayName}
          isEnabled={jobToTrigger.isEnabled}
          onClose={handleCloseTriggerDialog}
          onConfirm={handleConfirmTrigger}
          triggering={triggering}
        />
      )}
    </Card>
  );
}
