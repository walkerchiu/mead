'use client';

import {
  Box,
  Typography,
  Chip,
  Paper,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Tooltip,
  IconButton,
} from '@mui/material';
import {
  ExpandMore as ExpandMoreIcon,
  DataObject as DataObjectIcon,
  TableChart as TableChartIcon,
} from '@mui/icons-material';
import { useTranslations } from 'next-intl';
import { format } from 'date-fns';
import type { Session } from '@/hooks/useSessions';
import { Modal } from '@/components/organisms';
import { DetailRow } from '@/components/molecules';
import { downloadJSON, downloadCSV } from '@/utils/download';
import { useMediaQuery } from '@/hooks/useMediaQuery';

interface SessionDetailsModalProps {
  open: boolean;
  session: Session | null;
  onClose: () => void;
  onRevoke?: (sessionId: string) => void;
}

export function SessionDetailsModal({
  open,
  session,
  onClose,
  onRevoke,
}: SessionDetailsModalProps) {
  const t = useTranslations('pages.hq.sessions.details');
  const tt = useTranslations('pages.hq.sessions.table');
  const tc = useTranslations('common');
  const { isMobile } = useMediaQuery();

  if (!session) return null;

  const formatDate = (dateString: string) => {
    try {
      return format(new Date(dateString), 'yyyy-MM-dd HH:mm:ss');
    } catch {
      return dateString;
    }
  };

  const getStatusColor = (
    status: string,
  ): 'success' | 'error' | 'warning' | 'default' => {
    switch (status) {
      case 'ACTIVE':
        return 'success';
      case 'REVOKED':
        return 'error';
      case 'EXPIRED':
        return 'default'; // Gray color, according to SESSION_TERMINOLOGY.md
      default:
        return 'default';
    }
  };

  const getRevokedMethodColor = (
    method: string | null | undefined,
  ): 'success' | 'error' | 'warning' | 'default' => {
    switch (method) {
      case 'USER_LOGOUT':
        return 'success';
      case 'HQ_FORCE':
      case 'BATCH_REVOKE':
        return 'warning';
      case 'AUTO_EXPIRE':
        return 'default';
      case 'SECURITY_MEASURE':
        return 'error';
      default:
        return 'default';
    }
  };

  const getRevokedMethodLabel = (
    method: string | null | undefined,
    revokedByName: string | null | undefined,
  ): string => {
    if (!method) return '-';

    const methodKey = method.toLowerCase();

    if ((method === 'HQ_FORCE' || method === 'BATCH_REVOKE') && revokedByName) {
      const translationKey = `${methodKey}_with_name`;
      return tt(`revokedMethods.${translationKey}`, { name: revokedByName });
    }

    return tt(`revokedMethods.${methodKey}`);
  };

  // Export functionality
  const handleExport = (format: 'json' | 'csv') => {
    const exportData = {
      id: session.id,
      userId: session.userId,
      userName: session.userName || '',
      userEmail: session.userEmail || '',
      status: session.status,
      browser: session.browser || '',
      os: session.os || '',
      deviceInfo: session.deviceInfo || '',
      ipAddress: session.ipAddress || '',
      location: session.location || '',
      createdAt: formatDate(session.createdAt),
      lastUsedAt: formatDate(session.lastUsedAt),
      expiresAt: formatDate(session.expiresAt),
      revokedAt: session.revokedAt ? formatDate(session.revokedAt) : '',
      revokedBy: session.revokedBy || '',
      revokedByName: session.revokedByName || '',
      revokedReason: session.revokedReason || '',
      revokedMethod: session.revokedMethod || '',
      isCurrent: session.isCurrent,
    };

    const filename = `session-${session.id}-${Date.now()}`;
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
          {session.isCurrent && (
            <Chip
              label={t('currentSession')}
              color="info"
              size="medium"
              variant="outlined"
            />
          )}
          <Chip
            label={t(`statuses.${session.status.toLowerCase()}`)}
            color={getStatusColor(session.status)}
            size="medium"
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
      actions={[
        ...(session.status === 'ACTIVE' && !session.isCurrent && onRevoke
          ? [
              {
                label: t('revokeSession'),
                onClick: () => {
                  onRevoke(session.id);
                  onClose();
                },
                variant: 'outlined' as const,
                color: 'error' as const,
              },
            ]
          : []),
        {
          label: tc('close'),
          onClick: onClose,
          variant: 'contained' as const,
        },
      ]}
    >
      {/* User Information */}
      <Box sx={{ mb: 3 }}>
        <Typography
          variant="subtitle1"
          fontWeight={600}
          gutterBottom
          sx={{ display: 'flex', alignItems: 'center', gap: 1 }}
        >
          👤 {t('userInfo')}
        </Typography>
        <Paper variant="outlined" sx={{ p: 2 }}>
          <DetailRow
            label={t('userName')}
            value={session.userName || session.userId}
            layout="auto"
          />
          <DetailRow
            label={t('userEmail')}
            value={session.userEmail || '-'}
            layout="auto"
          />
          <DetailRow
            label={t('userId')}
            value={session.userId}
            copyable
            fieldName="userId"
            layout="horizontal"
          />
        </Paper>
      </Box>

      {/* Device Information */}
      <Box sx={{ mb: 3 }}>
        <Typography
          variant="subtitle1"
          fontWeight={600}
          gutterBottom
          sx={{ display: 'flex', alignItems: 'center', gap: 1 }}
        >
          💻 {t('deviceInfo')}
        </Typography>
        <Paper variant="outlined" sx={{ p: 2 }}>
          <DetailRow
            label={t('browser')}
            value={session.browser || '-'}
            layout="horizontal"
          />
          <DetailRow
            label={t('os')}
            value={session.os || '-'}
            layout="horizontal"
          />
          {session.deviceInfo && session.deviceInfo !== '-' && (
            <DetailRow
              label={t('deviceDetails')}
              value={
                <Typography
                  variant="body2"
                  sx={{
                    wordBreak: 'break-word',
                    fontFamily: 'monospace',
                    fontSize: '0.8rem',
                    color: 'text.secondary',
                    maxHeight: '60px',
                    overflow: 'auto',
                    p: 1,
                    bgcolor: 'grey.50',
                    borderRadius: 1,
                  }}
                >
                  {session.deviceInfo}
                </Typography>
              }
              layout="vertical"
            />
          )}
        </Paper>
      </Box>

      {/* Location Information */}
      <Box sx={{ mb: 3 }}>
        <Typography
          variant="subtitle1"
          fontWeight={600}
          gutterBottom
          sx={{ display: 'flex', alignItems: 'center', gap: 1 }}
        >
          📍 {t('locationInfo')}
        </Typography>
        <Paper variant="outlined" sx={{ p: 2 }}>
          <DetailRow
            label={t('ipAddress')}
            value={session.ipAddress || '-'}
            copyable
            fieldName="ipAddress"
            layout="horizontal"
          />
          <DetailRow
            label={t('location')}
            value={session.location || '-'}
            layout="horizontal"
          />
        </Paper>
      </Box>

      {/* Time Information */}
      <Box sx={{ mb: 3 }}>
        <Typography
          variant="subtitle1"
          fontWeight={600}
          gutterBottom
          sx={{ display: 'flex', alignItems: 'center', gap: 1 }}
        >
          ⏰ {t('timeInfo')}
        </Typography>
        <Paper variant="outlined" sx={{ p: 2 }}>
          <DetailRow
            label={t('createdAt')}
            value={formatDate(session.createdAt)}
            layout="horizontal"
          />
          <DetailRow
            label={t('lastUsedAt')}
            value={formatDate(session.lastUsedAt)}
            layout="horizontal"
          />
          <DetailRow
            label={t('expiresAt')}
            value={formatDate(session.expiresAt)}
            layout="horizontal"
          />
        </Paper>
      </Box>

      {/* Revocation Information (if revoked or expired with AUTO_EXPIRE) */}
      {session.revokedAt && (
        <Accordion defaultExpanded={false} sx={{ mb: 3 }}>
          <AccordionSummary
            expandIcon={<ExpandMoreIcon />}
            sx={{
              bgcolor: session.status === 'EXPIRED' ? 'grey.50' : 'error.light',
              '&:hover': {
                bgcolor:
                  session.status === 'EXPIRED' ? 'grey.100' : 'error.light',
              },
            }}
          >
            <Typography
              variant="subtitle1"
              fontWeight={600}
              sx={{
                display: 'flex',
                alignItems: 'center',
                gap: 1,
                color:
                  session.status === 'EXPIRED'
                    ? 'text.secondary'
                    : 'error.main',
              }}
            >
              🚫 {t('revocationInfo')}
            </Typography>
          </AccordionSummary>
          <AccordionDetails sx={{ p: 2 }}>
            <DetailRow
              label={t('revokedAt')}
              value={session.revokedAt ? formatDate(session.revokedAt) : '-'}
              layout="horizontal"
            />
            <DetailRow
              label={t('revokedBy')}
              value={
                session.revokedByName ||
                session.revokedBy ||
                (session.revokedMethod === 'AUTO_EXPIRE'
                  ? t('systemAutomatic')
                  : '-')
              }
              layout="horizontal"
            />
            <DetailRow
              label={t('revokedMethod')}
              value={
                <Chip
                  label={getRevokedMethodLabel(
                    session.revokedMethod,
                    session.revokedByName,
                  )}
                  color={getRevokedMethodColor(session.revokedMethod)}
                  size="small"
                />
              }
              layout="horizontal"
            />
            {session.revokedReason && session.revokedReason !== '-' && (
              <DetailRow
                label={t('revokedReason')}
                value={session.revokedReason}
                layout="vertical"
              />
            )}
          </AccordionDetails>
        </Accordion>
      )}

      {/* Session ID */}
      <Paper
        variant="outlined"
        sx={{
          mt: 3,
          p: 2,
          bgcolor: 'grey.50',
          borderStyle: 'dashed',
        }}
      >
        <DetailRow
          label={t('sessionId')}
          value={session.id}
          copyable
          fieldName="sessionId"
          layout="horizontal"
        />
      </Paper>
    </Modal>
  );
}
