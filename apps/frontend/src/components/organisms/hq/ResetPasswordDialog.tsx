'use client';

import { useState } from 'react';
import {
  Box,
  Alert,
  FormControlLabel,
  Checkbox,
  Typography,
} from '@mui/material';
import { LockReset } from '@mui/icons-material';
import { useTranslations } from 'next-intl';
import { useSnackbar } from 'notistack';
import { useMutation } from '@apollo/client/react';
import { HQ_RESET_PASSWORD, HQResetPasswordInput, User } from '@/graphql/users';
import { Modal } from '@/components/organisms/Modal';
import { PasswordField } from '@/components/molecules';
import { PasswordStrengthIndicator } from '@/components/atoms';
import { validatePassword } from '@/utils/password-validator';

interface ResetPasswordDialogProps {
  open: boolean;
  user: User;
  onClose: () => void;
  onSuccess: () => void;
}

export default function ResetPasswordDialog({
  open,
  user,
  onClose,
  onSuccess,
}: ResetPasswordDialogProps) {
  const t = useTranslations('pages.hq.users');
  const tc = useTranslations('common');
  const { enqueueSnackbar } = useSnackbar();

  const [formData, setFormData] = useState<HQResetPasswordInput>({
    newPassword: '',
    revokeAllSessions: true,
  });
  const [confirmPassword, setConfirmPassword] = useState('');
  const [errors, setErrors] = useState<{
    newPassword?: string;
    confirmPassword?: string;
  }>({});

  const [resetPassword, { loading }] = useMutation(HQ_RESET_PASSWORD, {
    onCompleted: () => {
      enqueueSnackbar(t('resetPasswordSuccess'), { variant: 'success' });
      onSuccess();
      handleClose();
    },
    onError: (error) => {
      enqueueSnackbar(`${tc('error.resetPasswordFailed')}: ${error.message}`, {
        variant: 'error',
      });
    },
  });

  const handleClose = () => {
    setFormData({ newPassword: '', revokeAllSessions: true });
    setConfirmPassword('');
    setErrors({});
    onClose();
  };

  const validateForm = (): boolean => {
    const newErrors: {
      newPassword?: string;
      confirmPassword?: string;
    } = {};

    if (!formData.newPassword) {
      newErrors.newPassword = t('validation.passwordRequired');
    } else {
      // 使用完整的密碼強度驗證
      const validationResult = validatePassword(formData.newPassword);
      if (!validationResult.isValid) {
        newErrors.newPassword =
          '密碼不符合要求: ' + validationResult.errors.join(', ');
      }
    }

    if (!confirmPassword) {
      newErrors.confirmPassword = t('validation.confirmPasswordRequired');
    } else if (confirmPassword !== formData.newPassword) {
      newErrors.confirmPassword = t('validation.passwordMismatch');
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validateForm()) {
      return;
    }

    await resetPassword({
      variables: {
        id: user.id,
        input: {
          newPassword: formData.newPassword,
          revokeAllSessions: formData.revokeAllSessions,
        },
      },
    });
  };

  const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData((prev) => ({ ...prev, newPassword: e.target.value }));
    if (errors.newPassword) {
      setErrors((prev) => ({ ...prev, newPassword: undefined }));
    }
  };

  const handleConfirmPasswordChange = (
    e: React.ChangeEvent<HTMLInputElement>,
  ) => {
    setConfirmPassword(e.target.value);
    if (errors.confirmPassword) {
      setErrors((prev) => ({ ...prev, confirmPassword: undefined }));
    }
  };

  const handleRevokeSessionsChange = (
    e: React.ChangeEvent<HTMLInputElement>,
  ) => {
    setFormData((prev) => ({ ...prev, revokeAllSessions: e.target.checked }));
  };

  return (
    <Modal
      open={open}
      onClose={handleClose}
      title={t('resetPassword')}
      icon={<LockReset sx={{ color: 'warning.main' }} />}
      maxWidth="sm"
      fullWidth
      dividers
      actions={[
        {
          label: tc('cancel'),
          onClick: handleClose,
          disabled: loading,
        },
        {
          label: loading ? tc('resetting') : tc('reset'),
          onClick: handleSubmit,
          variant: 'contained',
          color: 'warning',
          disabled: loading,
          loading: loading,
        },
      ]}
    >
      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
        <Alert severity="warning">{t('resetPasswordWarning')}</Alert>

        <Typography variant="body2" color="text.secondary">
          {t('resetPasswordFor')}: <strong>{user.email}</strong>
        </Typography>

        <PasswordField
          label={t('form.newPassword')}
          value={formData.newPassword}
          onChange={handlePasswordChange}
          error={errors.newPassword}
          required
          fullWidth
          autoFocus
        />

        <PasswordField
          label={t('form.confirmPassword')}
          value={confirmPassword}
          onChange={handleConfirmPasswordChange}
          error={errors.confirmPassword}
          required
          fullWidth
        />

        <PasswordStrengthIndicator password={formData.newPassword} />

        <Box>
          <FormControlLabel
            control={
              <Checkbox
                checked={formData.revokeAllSessions}
                onChange={handleRevokeSessionsChange}
              />
            }
            label={t('form.revokeAllSessions')}
          />
          <Typography
            variant="caption"
            color="text.secondary"
            display="block"
            sx={{ ml: 4 }}
          >
            {t('form.revokeAllSessionsHint')}
          </Typography>
        </Box>
      </Box>
    </Modal>
  );
}
