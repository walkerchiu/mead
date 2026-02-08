'use client';

import { useState } from 'react';
import {
  Card,
  CardContent,
  Typography,
  Box,
  Chip,
  IconButton,
  Tooltip,
} from '@mui/material';
import {
  CheckCircle as SuccessIcon,
  Error as ErrorIcon,
  HourglassEmpty as TimeoutIcon,
  PlayArrow as RunningIcon,
  Block as SkippedIcon,
  Visibility as VisibilityIcon,
} from '@mui/icons-material';
import { useTranslations } from 'next-intl';
import { DataTable, type DataTableColumn } from '@/components/molecules';
import { CronJobExecutionDetailsModal } from '../CronJobExecutionDetailsModal';
import type { CronJobStatus, CronJobExecution } from '@/hooks/useCronJobs';

export interface PageInfo {
  currentPage: number;
  totalPages: number;
  totalCount: number;
  hasNextPage: boolean;
  hasPreviousPage: boolean;
}

interface CronJobExecutionHistoryProps {
  executions: CronJobExecution[];
  configs?: { jobName: string; displayName: string }[];
  loading?: boolean;
  pageInfo?: PageInfo;
  page: number;
  onPageChange?: (page: number) => void;
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
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
  });
}

export function CronJobExecutionHistory({
  executions,
  configs,
  loading,
  pageInfo,
  page,
  onPageChange,
}: CronJobExecutionHistoryProps) {
  const t = useTranslations('pages.hq.cronJobs.executionHistory');
  const [detailsOpen, setDetailsOpen] = useState(false);
  const [selectedExecution, setSelectedExecution] =
    useState<CronJobExecution | null>(null);

  // 創建 jobName -> displayName 的映射
  const jobNameMap = new Map(configs?.map((c) => [c.jobName, c.displayName]));

  // 獲取顯示名稱的輔助函數
  const getDisplayName = (jobName: string): string => {
    return jobNameMap.get(jobName) || jobName;
  };

  const handleOpenDetails = (execution: CronJobExecution) => {
    setSelectedExecution(execution);
    setDetailsOpen(true);
  };

  const handleCloseDetails = () => {
    setDetailsOpen(false);
    setSelectedExecution(null);
  };

  // 定義表格列
  const columns: DataTableColumn<CronJobExecution>[] = [
    {
      id: 'jobName',
      label: t('job'),
      sortable: true,
      width: '180px',
      render: (_, row) => (
        <Box>
          <Typography variant="body2" fontWeight="medium">
            {getDisplayName(row.jobName)}
          </Typography>
          <Typography
            variant="caption"
            color="text.secondary"
            sx={{ fontFamily: 'monospace', fontSize: '0.7rem' }}
          >
            {row.jobName}
          </Typography>
        </Box>
      ),
    },
    {
      id: 'startedAt',
      label: t('startTime'),
      sortable: true,
      align: 'center',
      width: '130px',
      render: (_, row) => (
        <Typography variant="body2">{formatDateTime(row.startedAt)}</Typography>
      ),
    },
    {
      id: 'completedAt',
      label: t('endTime'),
      sortable: true,
      align: 'center',
      width: '130px',
      render: (_, row) => (
        <Typography variant="body2">
          {formatDateTime(row.completedAt)}
        </Typography>
      ),
    },
    {
      id: 'duration',
      label: t('duration'),
      sortable: true,
      align: 'center',
      width: '100px',
      render: (_, row) => (
        <Typography variant="body2" fontFamily="monospace">
          {formatDuration(row.duration)}
        </Typography>
      ),
    },
    {
      id: 'status',
      label: t('status'),
      align: 'center',
      width: '120px',
      render: (_, row) => (
        <Chip
          icon={STATUS_ICONS[row.status]}
          label={row.status}
          color={STATUS_COLORS[row.status]}
          size="small"
        />
      ),
    },
    {
      id: 'counts',
      label: t('processedSuccessFailed'),
      align: 'center',
      width: '150px',
      render: (_, row) => (
        <Box
          sx={{
            display: 'flex',
            gap: 0.5,
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <Typography variant="body2">{row.processedCount || 0}</Typography>
          <Typography variant="body2" color="text.secondary">
            /
          </Typography>
          <Typography variant="body2" color="success.main">
            {row.successCount || 0}
          </Typography>
          <Typography variant="body2" color="text.secondary">
            /
          </Typography>
          <Typography variant="body2" color="error.main">
            {row.errorCount || 0}
          </Typography>
        </Box>
      ),
    },
    {
      id: 'instanceId',
      label: t('instance'),
      align: 'center',
      width: '150px',
      render: (_, row) => (
        <Typography
          variant="caption"
          color="text.secondary"
          sx={{ fontFamily: 'monospace', fontSize: '0.75rem' }}
        >
          {row.instanceId}
        </Typography>
      ),
    },
    {
      id: 'actions',
      label: t('actions'),
      align: 'center',
      width: '70px',
      render: (_, row) => (
        <Tooltip title={t('viewDetails')}>
          <IconButton size="medium" onClick={() => handleOpenDetails(row)}>
            <VisibilityIcon fontSize="small" />
          </IconButton>
        </Tooltip>
      ),
    },
  ];

  return (
    <Card elevation={2}>
      <CardContent>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
          <Typography variant="h6">{t('title')}</Typography>
          {pageInfo && pageInfo.totalCount > 0 && (
            <Typography variant="body2" color="text.secondary">
              {pageInfo.totalPages > 1
                ? // 多頁：顯示範圍和頁碼
                  t('showingRecordsWithPage', {
                    start: (pageInfo.currentPage - 1) * 20 + 1,
                    end: Math.min(
                      pageInfo.currentPage * 20,
                      pageInfo.totalCount,
                    ),
                    total: pageInfo.totalCount,
                    page: pageInfo.currentPage,
                    totalPages: pageInfo.totalPages,
                  })
                : // 單頁：只顯示總數
                  t('totalRecords', { total: pageInfo.totalCount })}
            </Typography>
          )}
        </Box>

        <DataTable
          columns={columns}
          data={executions}
          loading={loading}
          emptyText={t('noExecutions')}
          pagination={(pageInfo?.totalPages || 0) > 1}
          page={page}
          totalPages={pageInfo?.totalPages || 0}
          onPageChange={onPageChange || (() => {})}
        />
      </CardContent>

      {/* Execution Details Modal - conditional rendering to avoid z-index issues */}
      {detailsOpen && (
        <CronJobExecutionDetailsModal
          open={detailsOpen}
          execution={selectedExecution}
          onClose={handleCloseDetails}
        />
      )}
    </Card>
  );
}
