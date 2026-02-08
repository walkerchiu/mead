'use client';

import React from 'react';
import { Box, Typography, Tooltip } from '@mui/material';
import { useTranslations } from 'next-intl';
import { formatDistanceToNow } from 'date-fns';
import { zhTW, enUS } from 'date-fns/locale';
import { Badge } from '@/components/atoms';
import { DataTable, type DataTableColumn } from '@/components/molecules';

interface AuditLog {
  id: string;
  timestamp: string;
  userId?: string;
  action: string;
  entity: string;
  entityId?: string;
  status: string;
  method?: string;
  path?: string;
  ipAddress?: string;
  duration?: number;
}

interface PageInfo {
  currentPage: number;
  totalPages: number;
  totalCount: number;
  hasNextPage: boolean;
  hasPreviousPage: boolean;
}

interface AuditLogTableProps {
  logs: AuditLog[];
  loading: boolean;
  pageInfo?: PageInfo;
  page: number;
  onPageChange: (page: number) => void;
}

export function AuditLogTable({
  logs,
  loading,
  pageInfo,
  page,
  onPageChange,
}: AuditLogTableProps) {
  const t = useTranslations('pages.admin.auditLogs.table');
  const tc = useTranslations('common');

  // Select date-fns locale based on current language
  const locale = tc('locale') === 'zh-TW' ? zhTW : enUS;

  // ✅ Track newly inserted log IDs (for animation effects)
  const [newLogIds, setNewLogIds] = React.useState<Set<string>>(new Set());
  const prevLogsRef = React.useRef<AuditLog[]>(logs);

  React.useEffect(() => {
    if (logs.length > 0 && prevLogsRef.current.length > 0) {
      // Detect newly inserted logs (appear at top of list but not in previous list)
      const prevIds = new Set(prevLogsRef.current.map((log) => log.id));
      const newIds = logs
        .filter((log) => !prevIds.has(log.id))
        .map((log) => log.id);

      if (newIds.length > 0) {
        console.log(
          `[AuditLogTable] Detected ${newIds.length} new logs:`,
          newIds,
        );
        setNewLogIds(new Set(newIds));

        // 3 seconds before clearing new log marker
        setTimeout(() => {
          setNewLogIds(new Set());
        }, 3000);
      }
    }

    prevLogsRef.current = logs;
  }, [logs]);

  const getStatusColor = (
    status: string,
  ):
    | 'success'
    | 'error'
    | 'primary'
    | 'secondary'
    | 'warning'
    | 'info'
    | 'default' => {
    return status === 'SUCCESS' ? 'success' : 'error';
  };

  const getStatusLabel = (status: string) => {
    return status === 'SUCCESS' ? t('success') : t('failure');
  };

  // Define table columns
  const columns: DataTableColumn<AuditLog>[] = [
    {
      id: 'timestamp',
      label: t('timestamp'),
      sortable: true,
      render: (_, row) => (
        <Tooltip title={new Date(row.timestamp).toLocaleString()}>
          <span style={{ cursor: 'help' }}>
            {formatDistanceToNow(new Date(row.timestamp), {
              addSuffix: true,
              locale,
            })}
          </span>
        </Tooltip>
      ),
      sortFn: (a, b) =>
        new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime(),
    },
    {
      id: 'userId',
      label: t('user'),
      sortable: true,
      filterable: true,
      render: (_, row) => (
        <Typography variant="body2" noWrap sx={{ maxWidth: 150 }}>
          {row.userId || t('unknown')}
        </Typography>
      ),
    },
    {
      id: 'action',
      label: t('action'),
      sortable: true,
      filterable: true,
      render: (_, row) => (
        <Typography variant="body2" fontWeight="medium">
          {row.action}
        </Typography>
      ),
    },
    {
      id: 'entity',
      label: t('entity'),
      sortable: true,
      filterable: true,
      render: (_, row) => (
        <Box>
          <Typography variant="body2">{row.entity}</Typography>
          {row.entityId && (
            <Typography variant="caption" color="text.secondary" noWrap>
              {row.entityId.substring(0, 8)}...
            </Typography>
          )}
        </Box>
      ),
    },
    {
      id: 'status',
      label: t('status'),
      sortable: true,
      filterable: true,
      render: (_, row) => (
        <Badge color={getStatusColor(row.status)}>
          {getStatusLabel(row.status)}
        </Badge>
      ),
    },
    {
      id: 'ipAddress',
      label: t('ip'),
      sortable: true,
      filterable: true,
      render: (_, row) => (
        <Typography variant="body2" noWrap>
          {row.ipAddress || '-'}
        </Typography>
      ),
    },
    {
      id: 'duration',
      label: t('duration'),
      sortable: true,
      align: 'right',
      render: (_, row) => (
        <Typography variant="body2">
          {row.duration ? `${row.duration}ms` : '-'}
        </Typography>
      ),
      sortFn: (a, b) => (a.duration || 0) - (b.duration || 0),
    },
  ];

  return (
    <DataTable
      columns={columns}
      data={logs}
      loading={loading}
      emptyText={t('noData')}
      pagination
      page={page}
      totalPages={pageInfo?.totalPages || 0}
      onPageChange={onPageChange}
      highlightRow={(row) => newLogIds.has(row.id)}
      highlightColor="rgba(76, 175, 80, 0.1)"
    />
  );
}
