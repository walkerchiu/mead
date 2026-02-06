'use client';

import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Box,
  Typography,
  Divider,
  Chip,
} from '@mui/material';
import {
  Person,
  Computer,
  LocationOn,
  AccessTime,
  Block,
} from '@mui/icons-material';
import { useTranslations } from 'next-intl';
import { format } from 'date-fns';
import type { Session } from '@/hooks/useSessions';

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
  const t = useTranslations('pages.admin.sessions.details');
  const tc = useTranslations('common');

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
        return 'warning';
      default:
        return 'default';
    }
  };

  const DetailRow = ({
    label,
    value,
    icon,
  }: {
    label: string;
    value: string | React.ReactNode;
    icon?: React.ReactNode;
  }) => (
    <Box sx={{ mb: 2 }}>
      <Box sx={{ display: 'flex', alignItems: 'center', mb: 0.5 }}>
        {icon && (
          <Box sx={{ mr: 1, display: 'flex', color: 'text.secondary' }}>
            {icon}
          </Box>
        )}
        <Typography variant="caption" color="text.secondary" fontWeight={500}>
          {label}
        </Typography>
      </Box>
      <Typography variant="body1" sx={{ pl: icon ? 4 : 0 }}>
        {value}
      </Typography>
    </Box>
  );

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle>
        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
          }}
        >
          <Typography variant="h6">{t('title')}</Typography>
          <Chip
            label={t(`statuses.${session.status.toLowerCase()}`)}
            color={getStatusColor(session.status)}
            size="small"
          />
        </Box>
      </DialogTitle>

      <DialogContent dividers>
        {/* User Information */}
        <Box sx={{ mb: 3 }}>
          <Typography variant="subtitle1" fontWeight={600} gutterBottom>
            <Person sx={{ verticalAlign: 'middle', mr: 1 }} />
            {t('userInfo')}
          </Typography>
          <Divider sx={{ mb: 2 }} />
          <DetailRow
            label={t('userName')}
            value={session.userName || session.userId}
          />
          <DetailRow label={t('userEmail')} value={session.userEmail || '-'} />
          <DetailRow
            label={t('userId')}
            value={
              <Typography variant="body2" fontFamily="monospace">
                {session.userId}
              </Typography>
            }
          />
        </Box>

        {/* Device Information */}
        <Box sx={{ mb: 3 }}>
          <Typography variant="subtitle1" fontWeight={600} gutterBottom>
            <Computer sx={{ verticalAlign: 'middle', mr: 1 }} />
            {t('deviceInfo')}
          </Typography>
          <Divider sx={{ mb: 2 }} />
          <DetailRow label={t('browser')} value={session.browser || '-'} />
          <DetailRow label={t('os')} value={session.os || '-'} />
          <DetailRow
            label={t('deviceDetails')}
            value={session.deviceInfo || '-'}
          />
        </Box>

        {/* Location Information */}
        <Box sx={{ mb: 3 }}>
          <Typography variant="subtitle1" fontWeight={600} gutterBottom>
            <LocationOn sx={{ verticalAlign: 'middle', mr: 1 }} />
            {t('locationInfo')}
          </Typography>
          <Divider sx={{ mb: 2 }} />
          <DetailRow
            label={t('ipAddress')}
            value={
              <Typography variant="body2" fontFamily="monospace">
                {session.ipAddress || '-'}
              </Typography>
            }
          />
          <DetailRow label={t('location')} value={session.location || '-'} />
        </Box>

        {/* Time Information */}
        <Box sx={{ mb: 3 }}>
          <Typography variant="subtitle1" fontWeight={600} gutterBottom>
            <AccessTime sx={{ verticalAlign: 'middle', mr: 1 }} />
            {t('timeInfo')}
          </Typography>
          <Divider sx={{ mb: 2 }} />
          <DetailRow
            label={t('createdAt')}
            value={formatDate(session.createdAt)}
          />
          <DetailRow
            label={t('lastUsedAt')}
            value={formatDate(session.lastUsedAt)}
          />
          <DetailRow
            label={t('expiresAt')}
            value={formatDate(session.expiresAt)}
          />
        </Box>

        {/* Revocation Information (if revoked) */}
        {session.status === 'REVOKED' && (
          <Box>
            <Typography
              variant="subtitle1"
              fontWeight={600}
              gutterBottom
              color="error"
            >
              <Block sx={{ verticalAlign: 'middle', mr: 1 }} />
              {t('revocationInfo')}
            </Typography>
            <Divider sx={{ mb: 2 }} />
            <DetailRow
              label={t('revokedAt')}
              value={session.revokedAt ? formatDate(session.revokedAt) : '-'}
            />
            <DetailRow
              label={t('revokedBy')}
              value={session.revokedByName || session.revokedBy || '-'}
            />
            <DetailRow
              label={t('revokedReason')}
              value={session.revokedReason || '-'}
            />
            <DetailRow
              label={t('revokedMethod')}
              value={session.revokedMethod || '-'}
            />
          </Box>
        )}

        {/* Session ID */}
        <Box sx={{ mt: 3, p: 2, bgcolor: 'grey.50', borderRadius: 1 }}>
          <Typography
            variant="caption"
            color="text.secondary"
            display="block"
            gutterBottom
          >
            {t('sessionId')}
          </Typography>
          <Typography variant="body2" fontFamily="monospace">
            {session.id}
          </Typography>
        </Box>
      </DialogContent>

      <DialogActions>
        {session.status === 'ACTIVE' && onRevoke && (
          <Button
            onClick={() => {
              onRevoke(session.id);
              onClose();
            }}
            color="error"
            variant="outlined"
            startIcon={<Block />}
          >
            {t('revokeSession')}
          </Button>
        )}
        <Button onClick={onClose} variant="contained">
          {tc('close')}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
