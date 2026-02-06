'use client';

import { useState } from 'react';
import { useMutation, useQuery } from '@apollo/client/react';
import { useSnackbar } from 'notistack';
import { useTranslations } from 'next-intl';
import {
  Box,
  Typography,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  List,
  ListItem,
  ListItemText,
  Alert,
  Card,
  CardContent,
} from '@mui/material';
import { Lock, LockOpen, Check, Close, Download } from '@mui/icons-material';
import { Button, Badge, Progress, Divider } from '@/components/atoms';
import {
  MY_2FA_SETTINGS_QUERY,
  REQUEST_ENABLE_2FA_MUTATION,
  CONFIRM_ENABLE_2FA_MUTATION,
  REQUEST_DISABLE_2FA_MUTATION,
  CONFIRM_DISABLE_2FA_MUTATION,
} from '@/lib/graphql';
import { getErrorMessage } from '@/lib/error-utils';

type DialogState =
  | 'none'
  | 'enable-request'
  | 'enable-confirm'
  | 'disable-request'
  | 'disable-confirm'
  | 'backup-codes';

export default function TwoFactorSettings() {
  const { enqueueSnackbar } = useSnackbar();
  const t = useTranslations('auth.twoFactorSettings');
  const tc = useTranslations('common');
  const [dialogState, setDialogState] = useState<DialogState>('none');
  const [verificationCode, setVerificationCode] = useState('');
  const [backupCodes, setBackupCodes] = useState<string[]>([]);

  const { data, loading, refetch } = useQuery(MY_2FA_SETTINGS_QUERY);

  const [requestEnable, { loading: requestingEnable }] = useMutation(
    REQUEST_ENABLE_2FA_MUTATION,
  );
  const [confirmEnable, { loading: confirmingEnable }] = useMutation(
    CONFIRM_ENABLE_2FA_MUTATION,
  );
  const [requestDisable, { loading: requestingDisable }] = useMutation(
    REQUEST_DISABLE_2FA_MUTATION,
  );
  const [confirmDisable, { loading: confirmingDisable }] = useMutation(
    CONFIRM_DISABLE_2FA_MUTATION,
  );

  type TwoFactorSettingsData = {
    my2FASettings?: {
      type: string;
      enabled: boolean;
      lastVerifiedAt?: string;
      createdAt: string;
      updatedAt: string;
    };
  };

  type MutationResponse = {
    requestEnable2FA?: { message?: string };
    confirmEnable2FA?: { message?: string; backupCodes?: string[] };
    requestDisable2FA?: { message?: string };
    confirmDisable2FA?: { message?: string };
  };

  const settingsData = data as TwoFactorSettingsData | undefined;
  const twoFactorSettings = settingsData?.my2FASettings;
  const isEnabled = twoFactorSettings?.enabled || false;

  const handleEnableClick = async () => {
    try {
      const result = await requestEnable();
      const responseData = result.data as MutationResponse | undefined;
      enqueueSnackbar(
        responseData?.requestEnable2FA?.message || t('verificationCodeSent'),
        { variant: 'success' },
      );
      setDialogState('enable-confirm');
    } catch (error: unknown) {
      const errorMessage = getErrorMessage(error, t('requestFailed'));
      if (errorMessage) {
        enqueueSnackbar(errorMessage, { variant: 'error' });
      }
    }
  };

  const handleConfirmEnable = async () => {
    if (!verificationCode) {
      enqueueSnackbar(t('enterCode'), { variant: 'warning' });
      return;
    }

    try {
      const result = await confirmEnable({
        variables: { code: verificationCode },
      });

      const responseData = result.data as MutationResponse | undefined;
      const codes = responseData?.confirmEnable2FA?.backupCodes || [];
      setBackupCodes(codes);
      setDialogState('backup-codes');
      setVerificationCode('');

      enqueueSnackbar(t('enableSuccess'), { variant: 'success' });

      // ✅ 在成功提示後非同步更新狀態
      refetch();
    } catch (error: unknown) {
      const errorMessage = getErrorMessage(error, t('verificationFailed'));
      if (errorMessage) {
        enqueueSnackbar(errorMessage, { variant: 'error' });
      }
    }
  };

  const handleDisableClick = async () => {
    try {
      const result = await requestDisable();
      const responseData = result.data as MutationResponse | undefined;
      enqueueSnackbar(
        responseData?.requestDisable2FA?.message || t('verificationCodeSent'),
        { variant: 'success' },
      );
      setDialogState('disable-confirm');
    } catch (error: unknown) {
      const errorMessage = getErrorMessage(error, t('requestFailed'));
      if (errorMessage) {
        enqueueSnackbar(errorMessage, { variant: 'error' });
      }
    }
  };

  const handleConfirmDisable = async () => {
    if (!verificationCode) {
      enqueueSnackbar(t('enterCode'), { variant: 'warning' });
      return;
    }

    try {
      await confirmDisable({
        variables: { code: verificationCode },
      });

      setDialogState('none');
      setVerificationCode('');

      enqueueSnackbar(t('disableSuccess'), { variant: 'success' });

      // ✅ 在成功提示後非同步更新狀態
      refetch();
    } catch (error: unknown) {
      const errorMessage = getErrorMessage(error, t('verificationFailed'));
      if (errorMessage) {
        enqueueSnackbar(errorMessage, { variant: 'error' });
      }
    }
  };

  const handleCloseDialog = () => {
    setDialogState('none');
    setVerificationCode('');
  };

  const handleDownloadBackupCodes = () => {
    const content = backupCodes.join('\n');
    const blob = new Blob([content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'backup-codes.txt';
    a.click();
    URL.revokeObjectURL(url);
  };

  if (loading) {
    return (
      <Box sx={{ textAlign: 'center', py: 4 }}>
        <Progress type="circular" />
      </Box>
    );
  }

  return (
    <Card>
      <CardContent>
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
          <Typography variant="h6" sx={{ flexGrow: 1 }}>
            {t('title')}
          </Typography>
          {isEnabled ? (
            <Badge color="success">{t('enabled')}</Badge>
          ) : (
            <Badge color="default">{t('disabled')}</Badge>
          )}
        </Box>

        <Typography variant="body2" color="text.secondary" paragraph>
          {t('description')}
        </Typography>

        {isEnabled && twoFactorSettings && (
          <Alert severity="info" sx={{ mb: 2 }}>
            <Typography variant="body2">
              {t('type')}：{twoFactorSettings.type}
            </Typography>
            {twoFactorSettings.lastVerifiedAt && (
              <Typography variant="body2">
                {t('lastVerified')}：
                {new Date(twoFactorSettings.lastVerifiedAt).toLocaleString()}
              </Typography>
            )}
          </Alert>
        )}

        {isEnabled ? (
          <Button
            variant="outlined"
            color="error"
            onClick={handleDisableClick}
            loading={requestingDisable}
            startIcon={<LockOpen />}
          >
            {t('disable')}
          </Button>
        ) : (
          <Button
            variant="contained"
            onClick={handleEnableClick}
            loading={requestingEnable}
            startIcon={<Lock />}
          >
            {t('enable')}
          </Button>
        )}

        {/* Confirm enable dialog */}
        <Dialog
          open={dialogState === 'enable-confirm'}
          onClose={handleCloseDialog}
        >
          <DialogTitle>{t('confirmEnableTitle')}</DialogTitle>
          <DialogContent>
            <Alert severity="info" sx={{ mb: 2 }}>
              {t('confirmEnableMessage')}
            </Alert>
            <TextField
              label={t('enterCode')}
              fullWidth
              value={verificationCode}
              onChange={(e) => setVerificationCode(e.target.value)}
              autoFocus
              inputProps={{
                maxLength: 6,
                style: {
                  letterSpacing: '0.5em',
                  textAlign: 'center',
                  fontSize: '1.5rem',
                },
              }}
            />
          </DialogContent>
          <DialogActions>
            <Button onClick={handleCloseDialog} startIcon={<Close />}>
              {tc('cancel')}
            </Button>
            <Button
              onClick={handleConfirmEnable}
              variant="contained"
              loading={confirmingEnable}
              startIcon={<Check />}
            >
              {tc('confirm')}
            </Button>
          </DialogActions>
        </Dialog>

        {/* Backup codes dialog */}
        <Dialog
          open={dialogState === 'backup-codes'}
          onClose={() => setDialogState('none')}
          maxWidth="sm"
          fullWidth
        >
          <DialogTitle>{t('backupCodesTitle')}</DialogTitle>
          <DialogContent>
            <Alert severity="warning" sx={{ mb: 2 }}>
              {t('backupCodesWarning')}
            </Alert>
            <List>
              {backupCodes.map((code, index) => (
                <div key={code}>
                  <ListItem>
                    <ListItemText
                      primary={code}
                      primaryTypographyProps={{
                        fontFamily: 'monospace',
                        fontSize: '1.2rem',
                      }}
                    />
                  </ListItem>
                  {index < backupCodes.length - 1 && <Divider />}
                </div>
              ))}
            </List>
          </DialogContent>
          <DialogActions>
            <Button
              onClick={handleDownloadBackupCodes}
              startIcon={<Download />}
            >
              {tc('download')}
            </Button>
            <Button
              onClick={() => setDialogState('none')}
              variant="contained"
              startIcon={<Check />}
            >
              {tc('done')}
            </Button>
          </DialogActions>
        </Dialog>

        {/* Confirm disable dialog */}
        <Dialog
          open={dialogState === 'disable-confirm'}
          onClose={handleCloseDialog}
        >
          <DialogTitle>{t('confirmDisableTitle')}</DialogTitle>
          <DialogContent>
            <Alert severity="warning" sx={{ mb: 2 }}>
              {t('confirmDisableWarning')}
            </Alert>
            <TextField
              label={t('enterCode')}
              fullWidth
              value={verificationCode}
              onChange={(e) => setVerificationCode(e.target.value)}
              autoFocus
              inputProps={{
                maxLength: 6,
                style: {
                  letterSpacing: '0.5em',
                  textAlign: 'center',
                  fontSize: '1.5rem',
                },
              }}
            />
          </DialogContent>
          <DialogActions>
            <Button onClick={handleCloseDialog} startIcon={<Close />}>
              {tc('cancel')}
            </Button>
            <Button
              onClick={handleConfirmDisable}
              variant="contained"
              color="error"
              loading={confirmingDisable}
              startIcon={<Check />}
            >
              {t('confirmDisable')}
            </Button>
          </DialogActions>
        </Dialog>
      </CardContent>
    </Card>
  );
}
