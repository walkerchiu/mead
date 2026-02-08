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
  Tabs,
  Tab,
} from '@mui/material';
import { DeleteSweep, Warning } from '@mui/icons-material';
import { useTranslations } from 'next-intl';
import { useRevokeBatchSessions } from '@/hooks/useSessionMutations';

interface BatchRevokeModalProps {
  open: boolean;
  onClose: () => void;
  onSuccess?: (count: number) => void;
}

export function BatchRevokeModal({
  open,
  onClose,
  onSuccess,
}: BatchRevokeModalProps) {
  const t = useTranslations('pages.hq.sessions.batchRevokeModal');
  const tc = useTranslations('common');
  const { revokeBatchSessions, loading, error } = useRevokeBatchSessions();

  const [tabIndex, setTabIndex] = useState(0);
  const [reason, setReason] = useState('');
  const [sendNotification, setSendNotification] = useState(false);
  const [customMessage, setCustomMessage] = useState('');

  // Criteria fields
  const [userIds, setUserIds] = useState('');
  const [ipAddress, setIpAddress] = useState('');
  const [deviceInfo, setDeviceInfo] = useState('');
  const [inactiveDays, setInactiveDays] = useState('');
  const [createdBeforeDays, setCreatedBeforeDays] = useState('');

  const handleRevoke = async () => {
    try {
      // Build criteria based on filled fields
      const criteria: Record<string, string | string[]> = {};

      if (userIds.trim()) {
        criteria.userIds = userIds
          .split(',')
          .map((id) => id.trim())
          .filter((id) => id);
      }

      if (ipAddress.trim()) {
        criteria.ipAddress = ipAddress.trim();
      }

      if (deviceInfo.trim()) {
        criteria.deviceInfo = deviceInfo.trim();
      }

      if (inactiveDays) {
        const days = parseInt(inactiveDays);
        if (!isNaN(days) && days > 0) {
          const date = new Date();
          date.setDate(date.getDate() - days);
          criteria.inactiveSince = date.toISOString();
        }
      }

      if (createdBeforeDays) {
        const days = parseInt(createdBeforeDays);
        if (!isNaN(days) && days > 0) {
          const date = new Date();
          date.setDate(date.getDate() - days);
          criteria.createdBefore = date.toISOString();
        }
      }

      const result = await revokeBatchSessions({
        variables: {
          input: {
            reason: reason || t('defaultReason'),
            sendNotification,
            notificationMessage: customMessage || undefined,
            criteria,
          },
        },
      });

      if (result.data?.revokeBatchSessions?.success) {
        const count = result.data.revokeBatchSessions.revokedCount;
        onSuccess?.(count);
        handleClose();
      }
    } catch (err) {
      console.error('Failed to revoke batch sessions:', err);
    }
  };

  const handleClose = () => {
    setTabIndex(0);
    setReason('');
    setSendNotification(false);
    setCustomMessage('');
    setUserIds('');
    setIpAddress('');
    setDeviceInfo('');
    setInactiveDays('');
    setCreatedBeforeDays('');
    onClose();
  };

  const hasCriteria =
    userIds.trim() ||
    ipAddress.trim() ||
    deviceInfo.trim() ||
    inactiveDays ||
    createdBeforeDays;

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="md" fullWidth>
      <DialogTitle>
        <Box sx={{ display: 'flex', alignItems: 'center' }}>
          <DeleteSweep sx={{ mr: 1, color: 'error.main' }} />
          {t('title')}
        </Box>
      </DialogTitle>

      <DialogContent dividers>
        {/* Warning Alert */}
        <Alert severity="error" icon={<Warning />} sx={{ mb: 3 }}>
          {t('warning')}
        </Alert>

        {/* Tabs */}
        <Tabs
          value={tabIndex}
          onChange={(e, v) => setTabIndex(v)}
          sx={{ mb: 3 }}
        >
          <Tab label={t('tabs.criteria')} />
          <Tab label={t('tabs.options')} />
        </Tabs>

        {/* Tab Panel 0: Criteria */}
        {tabIndex === 0 && (
          <Box>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
              {t('criteriaDescription')}
            </Typography>

            {/* User IDs */}
            <TextField
              fullWidth
              label={t('userIds')}
              placeholder={t('userIdsPlaceholder')}
              value={userIds}
              onChange={(e) => setUserIds(e.target.value)}
              helperText={t('userIdsHelp')}
              sx={{ mb: 2 }}
            />

            {/* IP Address */}
            <TextField
              fullWidth
              label={t('ipAddress')}
              placeholder={t('ipAddressPlaceholder')}
              value={ipAddress}
              onChange={(e) => setIpAddress(e.target.value)}
              helperText={t('ipAddressHelp')}
              sx={{ mb: 2 }}
            />

            {/* Device Info */}
            <TextField
              fullWidth
              label={t('deviceInfo')}
              placeholder={t('deviceInfoPlaceholder')}
              value={deviceInfo}
              onChange={(e) => setDeviceInfo(e.target.value)}
              helperText={t('deviceInfoHelp')}
              sx={{ mb: 2 }}
            />

            {/* Inactive Days */}
            <TextField
              fullWidth
              type="number"
              label={t('inactiveDays')}
              placeholder="30"
              value={inactiveDays}
              onChange={(e) => setInactiveDays(e.target.value)}
              helperText={t('inactiveDaysHelp')}
              sx={{ mb: 2 }}
            />

            {/* Created Before Days */}
            <TextField
              fullWidth
              type="number"
              label={t('createdBeforeDays')}
              placeholder="90"
              value={createdBeforeDays}
              onChange={(e) => setCreatedBeforeDays(e.target.value)}
              helperText={t('createdBeforeDaysHelp')}
            />
          </Box>
        )}

        {/* Tab Panel 1: Options */}
        {tabIndex === 1 && (
          <Box>
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
              helperText={t('reasonHelp')}
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

            <Alert severity="info" sx={{ mb: 2 }}>
              {t('notificationInfo')}
            </Alert>

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
          </Box>
        )}

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
          color="error"
          variant="contained"
          disabled={loading || !hasCriteria}
          startIcon={loading ? <CircularProgress size={16} /> : <DeleteSweep />}
        >
          {loading ? tc('processing') : t('confirm')}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
