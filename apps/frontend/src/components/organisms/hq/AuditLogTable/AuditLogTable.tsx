'use client';

import React, { useState } from 'react';
import {
  Box,
  Typography,
  Tooltip,
  IconButton,
  Chip,
  Stack,
  useTheme,
  Card,
  CardContent,
} from '@mui/material';
import { Visibility, AccessTime, Language } from '@mui/icons-material';
import { useTranslations } from 'next-intl';
import { format, formatDistanceToNow } from 'date-fns';
import { zhTW, enUS } from 'date-fns/locale';
import { DataTable, type DataTableColumn } from '@/components/molecules';
import { UserLink } from '@/components/atoms';
import { AuditLogDetailsModal } from '../AuditLogDetailsModal';
import {
  getActionColor,
  getEntityColor,
  getSessionStatusColors,
} from '@/utils/theme-colors';

interface AuditLog {
  id: string;
  timestamp: string;
  userId?: string;
  userName?: string;
  userEmail?: string;
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
  const theme = useTheme();
  const t = useTranslations('pages.hq.auditLogs.table');
  const tc = useTranslations('common');
  const [selectedLog, setSelectedLog] = useState<AuditLog | null>(null);
  const [detailsOpen, setDetailsOpen] = useState(false);

  // Select date-fns locale based on current language
  const locale = tc('locale') === 'zh-TW' ? zhTW : enUS;

  const handleViewDetails = (log: AuditLog) => {
    setSelectedLog(log);
    setDetailsOpen(true);
  };

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

        // Clear new log marker after 5 seconds
        setTimeout(() => {
          setNewLogIds(new Set());
        }, 5000);
      }
    }

    prevLogsRef.current = logs;
  }, [logs]);

  const getStatusIcon = (status: string) => {
    return status === 'SUCCESS' ? '✓' : '✕';
  };

  const getStatusLabel = (status: string) => {
    return status === 'SUCCESS' ? t('success') : t('failure');
  };

  const formatDate = (dateString: string) => {
    try {
      return format(new Date(dateString), 'yyyy-MM-dd HH:mm:ss');
    } catch {
      return dateString;
    }
  };

  const getRelativeTime = (dateString: string) => {
    try {
      return formatDistanceToNow(new Date(dateString), {
        addSuffix: true,
        locale,
      });
    } catch {
      return '';
    }
  };

  // Define table columns
  const columns: DataTableColumn<AuditLog>[] = [
    {
      id: 'timestamp',
      label: t('timestamp'),
      sortable: true,
      align: 'center',
      width: '170px',
      render: (_, row) => (
        <Tooltip title={getRelativeTime(row.timestamp)} arrow>
          <Stack
            direction="row"
            spacing={0.5}
            alignItems="center"
            justifyContent="center"
          >
            <AccessTime sx={{ fontSize: 14, color: 'text.secondary' }} />
            <Typography variant="caption" noWrap>
              {formatDate(row.timestamp)}
            </Typography>
          </Stack>
        </Tooltip>
      ),
      sortFn: (a, b) =>
        new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime(),
    },
    {
      id: 'userId',
      label: t('user'),
      sortable: true,
      align: 'left',
      width: '200px',
      render: (_, row) => (
        <Box>
          {row.userId ? (
            <UserLink
              userId={row.userId}
              name={row.userName}
              email={row.userEmail}
              showAvatar={false}
            />
          ) : (
            <Typography variant="body2" fontWeight={500} noWrap>
              {t('unknown')}
            </Typography>
          )}
          {row.userEmail && (
            <Typography variant="caption" color="text.secondary" noWrap>
              {row.userEmail}
            </Typography>
          )}
        </Box>
      ),
      sortFn: (a, b) => {
        const aName = a.userName || a.userId || '';
        const bName = b.userName || b.userId || '';
        return aName.localeCompare(bName);
      },
    },
    {
      id: 'action',
      label: t('action'),
      sortable: true,
      align: 'center',
      width: '180px', // 增加寬度以容納較長的標籤
      render: (_, row) => {
        const colors = getActionColor(row.action, theme.palette.mode);
        return (
          <Chip
            label={row.action.toUpperCase()}
            size="small"
            variant="outlined"
            sx={{
              fontWeight: 500,
              maxWidth: '100%',
              height: '26px',
              fontSize: '0.75rem',
              letterSpacing: '0.02em',
              color: colors.text,
              borderColor: colors.border,
              '& .MuiChip-label': {
                px: 1,
                py: 0.25,
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                whiteSpace: 'nowrap',
              },
            }}
          />
        );
      },
    },
    {
      id: 'entity',
      label: t('entity'),
      sortable: true,
      align: 'center',
      width: '170px', // 增加寬度以容納較長的標籤
      render: (_, row) => {
        const colors = getEntityColor(row.entity, theme.palette.mode);
        return (
          <Chip
            label={row.entity.toUpperCase()}
            size="small"
            variant="outlined"
            sx={{
              fontWeight: 500,
              maxWidth: '100%',
              height: '26px',
              fontSize: '0.75rem',
              letterSpacing: '0.02em',
              color: colors.text,
              borderColor: colors.border,
              '& .MuiChip-label': {
                px: 1,
                py: 0.25,
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                whiteSpace: 'nowrap',
              },
            }}
          />
        );
      },
    },
    {
      id: 'status',
      label: t('status'),
      sortable: true,
      align: 'center',
      width: '110px',
      render: (_, row) => {
        const statusColors = getSessionStatusColors(theme.palette.mode);
        const colors =
          statusColors[row.status as keyof typeof statusColors] ||
          statusColors.SUCCESS;

        return (
          <Chip
            label={
              <>
                {getStatusIcon(row.status)} {getStatusLabel(row.status)}
              </>
            }
            size="small"
            sx={{
              fontWeight: 600,
              minWidth: '90px',
              height: '26px',
              fontSize: '0.75rem',
              bgcolor: colors.bg,
              border: `1px solid ${colors.border}`,
              color: colors.text,
            }}
          />
        );
      },
    },
    {
      id: 'ipAddress',
      label: t('ipAddress'),
      sortable: true,
      align: 'center',
      width: '140px',
      render: (_, row) =>
        row.ipAddress ? (
          <Chip
            icon={<Language fontSize="small" />}
            label={row.ipAddress}
            size="small"
            variant="outlined"
            sx={{
              fontFamily: 'monospace',
              fontSize: '0.75rem',
              maxWidth: '100%',
              '& .MuiChip-icon': {
                color:
                  theme.palette.mode === 'dark'
                    ? theme.palette.text.primary
                    : theme.palette.text.secondary,
              },
            }}
          />
        ) : (
          <Typography variant="caption" color="text.secondary">
            -
          </Typography>
        ),
    },
    {
      id: 'duration',
      label: t('duration'),
      sortable: true,
      align: 'right',
      width: '90px',
      render: (_, row) => (
        <Typography variant="body2" sx={{ pr: 1 }}>
          {row.duration ? `${row.duration}ms` : '-'}
        </Typography>
      ),
      sortFn: (a, b) => (a.duration || 0) - (b.duration || 0),
    },
    {
      id: 'actions',
      label: t('actions'),
      align: 'center',
      width: '70px',
      render: (_, row) => (
        <Tooltip title={t('viewDetails')}>
          <IconButton size="medium" onClick={() => handleViewDetails(row)}>
            <Visibility fontSize="small" />
          </IconButton>
        </Tooltip>
      ),
    },
  ];

  return (
    <>
      <Card elevation={2}>
        <CardContent>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
            <Typography variant="h6">{t('logsTable')}</Typography>
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
            data={logs}
            loading={loading}
            emptyText={t('noData')}
            pagination={(pageInfo?.totalPages || 0) > 1}
            page={page}
            totalPages={pageInfo?.totalPages || 0}
            onPageChange={onPageChange}
            highlightRow={(row) => newLogIds.has(row.id)}
            highlightColor="rgba(76, 175, 80, 0.1)"
            animateHighlight={true}
          />
        </CardContent>
      </Card>

      {/* Details Modal - conditional rendering to avoid z-index issues */}
      {detailsOpen && (
        <AuditLogDetailsModal
          open={detailsOpen}
          log={selectedLog}
          onClose={() => setDetailsOpen(false)}
        />
      )}
    </>
  );
}
