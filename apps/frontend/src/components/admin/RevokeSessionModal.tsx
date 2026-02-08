'use client';

import { useState } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  FormControlLabel,
  Checkbox,
  Box,
  Typography,
  Alert,
  CircularProgress,
} from '@mui/material';
import { Block, Warning } from '@mui/icons-material';
import { useTranslations } from 'next-intl';
import { useRevokeSession } from '@/hooks/useSessionMutations';
import { getErrorMessage, getErrorTranslationKey } from '@/lib/error-utils';

interface RevokeSessionModalProps {
  open: boolean;
  sessionId: string | null;
  sessionUser?: {
    name: string;
    email: string;
  };
  onClose: () => void;
  onSuccess?: () => void;
}

export function RevokeSessionModal({
  open,
  sessionId,
  sessionUser,
  onClose,
  onSuccess,
}: RevokeSessionModalProps) {
  const t = useTranslations('pages.admin.sessions.revokeModal');
  const tc = useTranslations('common');
  const { revokeSession, loading, error } = useRevokeSession();

  const [reason, setReason] = useState('');
  const [sendNotification, setSendNotification] = useState(true);
  const [customMessage, setCustomMessage] = useState('');

  const [localError, setLocalError] = useState<string | null>(null);

  const handleRevoke = async () => {
    if (!sessionId) return;

    setLocalError(null);

    try {
      const result = await revokeSession({
        variables: {
          input: {
            sessionId,
            reason: reason || t('defaultReason'),
            sendNotification,
            notificationMessage: customMessage || undefined,
          },
        },
      });

      if (result.data?.revokeSession?.success) {
        onSuccess?.();
        handleClose();
      } else {
        // Revoke failed, show error message
        const errorMsg = result.data?.revokeSession?.message || '';
        const errorKey = errorMsg ? getErrorTranslationKey(errorMsg) : null;
        const friendlyError = errorKey
          ? t(`errors.${errorKey}`)
          : errorMsg || t('errorMessage');
        setLocalError(friendlyError);
      }
    } catch (err) {
      console.error('Failed to revoke session:', err);
      const rawError = getErrorMessage(err, t('errorMessage'));
      const errorKey = getErrorTranslationKey(rawError);
      const friendlyError = errorKey ? t(`errors.${errorKey}`) : rawError;
      setLocalError(friendlyError);
    }
  };

  const handleClose = () => {
    setReason('');
    setSendNotification(true);
    setCustomMessage('');
    setLocalError(null);
    onClose();
  };

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
      <DialogTitle>
        <Box sx={{ display: 'flex', alignItems: 'center' }}>
          <Block sx={{ mr: 1, color: 'error.main' }} />
          {t('title')}
        </Box>
      </DialogTitle>

      <DialogContent dividers>
        {/* Warning Alert */}
        <Alert severity="warning" icon={<Warning />} sx={{ mb: 3 }}>
          {t('warning')}
        </Alert>

        {/* User Information */}
        {sessionUser && (
          <Box sx={{ mb: 3, p: 2, bgcolor: 'grey.50', borderRadius: 1 }}>
            <Typography variant="subtitle2" gutterBottom>
              {t('targetUser')}
            </Typography>
            <Typography variant="body2" fontWeight={600}>
              {sessionUser.name}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              {sessionUser.email}
            </Typography>
          </Box>
        )}

        {/* Reason */}
        <TextField
          fullWidth
          label={t('reason')}
          placeholder={t('reasonPlaceholder')}
          value={reason}
          onChange={(e) => setReason(e.target.value)}
          multiline
          rows={3}
          sx={{ mb: 2 }}
          required
        />

        {/* Send Notification */}
        <FormControlLabel
          control={
            <Checkbox
              checked={sendNotification}
              onChange={(e) => setSendNotification(e.target.checked)}
            />
          }
          label={t('sendNotification')}
          sx={{ mb: 2 }}
        />

        {/* Custom Message (if notification enabled) */}
        {sendNotification && (
          <TextField
            fullWidth
            label={t('customMessage')}
            placeholder={t('customMessagePlaceholder')}
            value={customMessage}
            onChange={(e) => setCustomMessage(e.target.value)}
            multiline
            rows={2}
            helperText={t('customMessageHelp')}
          />
        )}

        {/* Error Display */}
        {(error || localError) && (
          <Alert severity="error" sx={{ mt: 2 }}>
            {localError || getErrorMessage(error, t('errorMessage'))}
          </Alert>
        )}
      </DialogContent>

      <DialogActions>
        <Button onClick={handleClose} disabled={loading}>
          {tc('cancel')}
        </Button>
        <Button
          onClick={handleRevoke}
          color="error"
          variant="contained"
          disabled={loading || !reason.trim()}
          startIcon={loading ? <CircularProgress size={16} /> : <Block />}
        >
          {loading ? tc('processing') : t('confirm')}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
