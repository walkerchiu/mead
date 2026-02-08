'use client';

import { useState } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  Box,
  Typography,
  Alert,
  CircularProgress,
} from '@mui/material';
import { DevicesOther, Info } from '@mui/icons-material';
import { useTranslations } from 'next-intl';
import { useRevokeOtherDevices } from '@/hooks/useSessionMutations';

interface RevokeOtherDevicesModalProps {
  open: boolean;
  currentSessionId: string | null;
  onClose: () => void;
  onSuccess?: (count: number) => void;
}

export function RevokeOtherDevicesModal({
  open,
  currentSessionId,
  onClose,
  onSuccess,
}: RevokeOtherDevicesModalProps) {
  const t = useTranslations('pages.hq.sessions.revokeOtherDevicesModal');
  const tc = useTranslations('common');
  const { revokeOtherDevices, loading, error } = useRevokeOtherDevices();

  const [reason, setReason] = useState('');

  const handleRevoke = async () => {
    if (!currentSessionId) return;

    try {
      const result = await revokeOtherDevices({
        variables: {
          input: {
            currentSessionId,
            reason: reason || t('defaultReason'),
          },
        },
      });

      if (result.data?.revokeOtherDevices?.success) {
        const count = result.data.revokeOtherDevices.revokedCount;
        onSuccess?.(count);
        handleClose();
      }
    } catch (err) {
      console.error('Failed to revoke other devices:', err);
    }
  };

  const handleClose = () => {
    setReason('');
    onClose();
  };

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
      <DialogTitle>
        <Box sx={{ display: 'flex', alignItems: 'center' }}>
          <DevicesOther sx={{ mr: 1, color: 'primary.main' }} />
          {t('title')}
        </Box>
      </DialogTitle>

      <DialogContent dividers>
        {/* Info Alert */}
        <Alert severity="info" icon={<Info />} sx={{ mb: 3 }}>
          {t('info')}
        </Alert>

        {/* Description */}
        <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
          {t('description')}
        </Typography>

        {/* Current Device Notice */}
        <Box sx={{ p: 2, bgcolor: 'success.light', borderRadius: 1, mb: 3 }}>
          <Typography variant="subtitle2" fontWeight={600} gutterBottom>
            {t('currentDevice')}
          </Typography>
          <Typography variant="body2">
            {t('currentDeviceDescription')}
          </Typography>
        </Box>

        {/* Reason */}
        <TextField
          fullWidth
          label={t('reason')}
          placeholder={t('reasonPlaceholder')}
          value={reason}
          onChange={(e) => setReason(e.target.value)}
          multiline
          rows={3}
          helperText={t('reasonHelp')}
        />

        {/* Error Display */}
        {error && (
          <Alert severity="error" sx={{ mt: 2 }}>
            {t('error')}: {error.message}
          </Alert>
        )}
      </DialogContent>

      <DialogActions>
        <Button onClick={handleClose} disabled={loading}>
          {tc('cancel')}
        </Button>
        <Button
          onClick={handleRevoke}
          color="primary"
          variant="contained"
          disabled={loading}
          startIcon={
            loading ? <CircularProgress size={16} /> : <DevicesOther />
          }
        >
          {loading ? tc('processing') : t('confirm')}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
