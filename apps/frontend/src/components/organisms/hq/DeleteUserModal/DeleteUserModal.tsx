'use client';

import { useState } from 'react';
import { Box, Typography, Alert } from '@mui/material';
import { useTranslations } from 'next-intl';
import { useMutation } from '@apollo/client/react';
import { SOFT_DELETE_USER, User } from '@/graphql/users';
import { Modal } from '@/components/organisms/Modal';
import { getErrorMessage } from '@/lib/error-utils';

interface DeleteUserModalProps {
  open: boolean;
  user: User | null;
  onClose: () => void;
  onSuccess?: () => void;
}

export function DeleteUserModal({
  open,
  user,
  onClose,
  onSuccess,
}: DeleteUserModalProps) {
  const t = useTranslations('pages.hq.users');
  const tc = useTranslations('common');

  const [localError, setLocalError] = useState<string | null>(null);

  const [softDeleteUser, { loading }] = useMutation(SOFT_DELETE_USER, {
    onCompleted: () => {
      onSuccess?.();
      handleClose();
    },
    onError: (err) => {
      console.error('Failed to delete user:', err);
      setLocalError(getErrorMessage(err, t('deleteError')));
    },
  });

  const handleDelete = async () => {
    if (!user) return;

    setLocalError(null);

    await softDeleteUser({
      variables: {
        id: user.id,
      },
    });
  };

  const handleClose = () => {
    setLocalError(null);
    onClose();
  };

  if (!user) return null;

  return (
    <Modal
      open={open}
      onClose={handleClose}
      title={t('deleteUserTitle')}
      maxWidth="sm"
      fullWidth
      variant="warning"
      icon={null}
      dividers
      actions={[
        {
          label: tc('cancel'),
          onClick: handleClose,
          disabled: loading,
        },
        {
          label: loading ? tc('processing') : t('deleteConfirm'),
          onClick: handleDelete,
          variant: 'contained',
          color: 'error',
          disabled: loading,
          loading: loading,
        },
      ]}
    >
      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
        <Alert severity="warning">{t('deleteWarning')}</Alert>

        <Box sx={{ p: 2, bgcolor: 'action.hover', borderRadius: 1 }}>
          <Typography variant="subtitle2" gutterBottom>
            {t('targetUser')}
          </Typography>
          <Typography variant="body2" fontWeight={600}>
            {user.name || t('unnamed')}
          </Typography>
          <Typography variant="body2" color="text.secondary">
            {user.email}
          </Typography>
        </Box>

        <Typography variant="body2" color="text.secondary">
          {t('deleteInfo')}
        </Typography>

        {localError && (
          <Alert severity="error" sx={{ mt: 2 }}>
            {localError}
          </Alert>
        )}
      </Box>
    </Modal>
  );
}
