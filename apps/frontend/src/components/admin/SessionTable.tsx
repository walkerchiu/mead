'use client';

import { useState } from 'react';
import { IconButton, Tooltip, Box, Typography } from '@mui/material';
import { Block, Visibility } from '@mui/icons-material';
import { useTranslations } from 'next-intl';
import { useSnackbar } from 'notistack';
import { format } from 'date-fns';
import { Badge } from '@/components/atoms';
import { DataTable, type DataTableColumn } from '@/components/molecules';
import { SessionDetailsModal } from './SessionDetailsModal';
import { RevokeSessionModal } from './RevokeSessionModal';
import type { Session, PageInfo } from '@/hooks/useSessions';

interface SessionTableProps {
  sessions: Session[];
  loading: boolean;
  pageInfo?: PageInfo;
  page: number;
  onPageChange: (page: number) => void;
  onRefresh: () => void;
}

export function SessionTable({
  sessions,
  loading,
  pageInfo,
  page,
  onPageChange,
  onRefresh,
}: SessionTableProps) {
  const t = useTranslations('pages.admin.sessions.table');
  const { enqueueSnackbar } = useSnackbar();
  const [selectedSession, setSelectedSession] = useState<Session | null>(null);
  const [revokeSessionId, setRevokeSessionId] = useState<string | null>(null);
  const [revokeSessionUser, setRevokeSessionUser] = useState<
    { name: string; email: string } | undefined
  >();
  const [detailsOpen, setDetailsOpen] = useState(false);
  const [revokeOpen, setRevokeOpen] = useState(false);

  const handleViewDetails = (session: Session) => {
    setSelectedSession(session);
    setDetailsOpen(true);
  };

  const handleRevokeClick = (session: Session) => {
    setRevokeSessionId(session.id);
    setRevokeSessionUser(
      session.userName && session.userEmail
        ? { name: session.userName, email: session.userEmail }
        : undefined,
    );
    setRevokeOpen(true);
  };

  const handleRevokeFromDetails = (sessionId: string) => {
    setDetailsOpen(false);
    const session = sessions.find((s) => s.id === sessionId);
    if (session) {
      handleRevokeClick(session);
    }
  };

  const handleRevokeSuccess = () => {
    enqueueSnackbar(t('revokeSuccess'), { variant: 'success' });
    onRefresh();
  };

  const getStatusColor = (
    status: string,
  ):
    | 'success'
    | 'error'
    | 'warning'
    | 'default'
    | 'primary'
    | 'secondary'
    | 'info' => {
    switch (status) {
      case 'ACTIVE':
        return 'success';
      case 'REVOKED':
        return 'error';
      case 'EXPIRED':
        return 'warning';
      default:
        return 'default';
    }
  };

  const formatDate = (dateString: string) => {
    try {
      return format(new Date(dateString), 'yyyy-MM-dd HH:mm:ss');
    } catch {
      return dateString;
    }
  };

  // Define table columns
  const columns: DataTableColumn<Session>[] = [
    {
      id: 'user',
      label: t('user'),
      sortable: true,
      filterable: true,
      render: (_, row) => (
        <Box>
          <Typography variant="body2" fontWeight={500}>
            {row.userName || row.userId}
          </Typography>
          <Typography variant="caption" color="text.secondary">
            {row.userEmail}
          </Typography>
        </Box>
      ),
      sortFn: (a, b) => {
        const aName = a.userName || a.userId;
        const bName = b.userName || b.userId;
        return aName.localeCompare(bName);
      },
      filterFn: (row, filterValue) => {
        const searchStr =
          `${row.userName || ''} ${row.userEmail || ''} ${row.userId}`.toLowerCase();
        return searchStr.includes(filterValue.toLowerCase());
      },
    },
    {
      id: 'status',
      label: t('status'),
      sortable: true,
      filterable: true,
      render: (_, row) => (
        <Badge color={getStatusColor(row.status)}>
          {t(`statuses.${row.status.toLowerCase()}`)}
        </Badge>
      ),
    },
    {
      id: 'device',
      label: t('device'),
      render: (_, row) => (
        <Box>
          <Typography variant="body2">{row.browser || '-'}</Typography>
          <Typography variant="caption" color="text.secondary">
            {row.os || '-'}
          </Typography>
        </Box>
      ),
    },
    {
      id: 'ipAddress',
      label: t('ipAddress'),
      sortable: true,
      filterable: true,
      render: (_, row) => (
        <Typography variant="body2" fontFamily="monospace">
          {row.ipAddress || '-'}
        </Typography>
      ),
    },
    {
      id: 'location',
      label: t('location'),
      sortable: true,
      filterable: true,
      render: (_, row) => (
        <Typography variant="body2">{row.location || '-'}</Typography>
      ),
    },
    {
      id: 'createdAt',
      label: t('createdAt'),
      sortable: true,
      render: (_, row) => (
        <Typography variant="caption">{formatDate(row.createdAt)}</Typography>
      ),
      sortFn: (a, b) =>
        new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime(),
    },
    {
      id: 'lastUsedAt',
      label: t('lastUsedAt'),
      sortable: true,
      render: (_, row) => (
        <Typography variant="caption">{formatDate(row.lastUsedAt)}</Typography>
      ),
      sortFn: (a, b) =>
        new Date(a.lastUsedAt).getTime() - new Date(b.lastUsedAt).getTime(),
    },
    {
      id: 'actions',
      label: t('actions'),
      align: 'right',
      render: (_, row) => (
        <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 0.5 }}>
          <Tooltip title={t('viewDetails')}>
            <IconButton size="small" onClick={() => handleViewDetails(row)}>
              <Visibility fontSize="small" />
            </IconButton>
          </Tooltip>
          {row.status === 'ACTIVE' && (
            <Tooltip title={t('revokeSession')}>
              <IconButton
                size="small"
                color="error"
                onClick={() => handleRevokeClick(row)}
              >
                <Block fontSize="small" />
              </IconButton>
            </Tooltip>
          )}
        </Box>
      ),
    },
  ];

  return (
    <>
      <DataTable
        columns={columns}
        data={sessions}
        loading={loading}
        emptyText={t('noSessions')}
        pagination
        page={page}
        totalPages={pageInfo?.totalPages || 0}
        onPageChange={onPageChange}
      />

      {/* Modals */}
      <SessionDetailsModal
        open={detailsOpen}
        session={selectedSession}
        onClose={() => setDetailsOpen(false)}
        onRevoke={handleRevokeFromDetails}
      />

      <RevokeSessionModal
        open={revokeOpen}
        sessionId={revokeSessionId}
        sessionUser={revokeSessionUser}
        onClose={() => setRevokeOpen(false)}
        onSuccess={handleRevokeSuccess}
      />
    </>
  );
}
