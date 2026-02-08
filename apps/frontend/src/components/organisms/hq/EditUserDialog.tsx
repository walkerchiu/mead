'use client';

import { useState, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  Box,
  Alert,
  CircularProgress,
} from '@mui/material';
import { useTranslations } from 'next-intl';
import { useSnackbar } from 'notistack';
import { useMutation } from '@apollo/client/react';
import { HQ_UPDATE_USER, HQUpdateUserInput, User } from '@/graphql/users';

interface EditUserDialogProps {
  open: boolean;
  user: User;
  onClose: () => void;
  onSuccess: () => void;
}

export default function EditUserDialog({
  open,
  user,
  onClose,
  onSuccess,
}: EditUserDialogProps) {
  const t = useTranslations('pages.hq.users');
  const tc = useTranslations('common');
  const { enqueueSnackbar } = useSnackbar();

  const [formData, setFormData] = useState<HQUpdateUserInput>({
    email: user.email,
    name: user.name || '',
  });
  const [errors, setErrors] = useState<Partial<HQUpdateUserInput>>({});

  useEffect(() => {
    if (user) {
      setFormData({
        email: user.email,
        name: user.name || '',
      });
    }
  }, [user]);

  const [updateUser, { loading }] = useMutation(HQ_UPDATE_USER, {
    onCompleted: () => {
      enqueueSnackbar(t('updateSuccess'), { variant: 'success' });
      onSuccess();
      handleClose();
    },
    onError: (error) => {
      enqueueSnackbar(`${tc('error.updateFailed')}: ${error.message}`, {
        variant: 'error',
      });
    },
  });

  const handleClose = () => {
    setErrors({});
    onClose();
  };

  const validateForm = (): boolean => {
    const newErrors: Partial<HQUpdateUserInput> = {};

    if (formData.email) {
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
        newErrors.email = t('validation.emailInvalid');
      }
    }

    if (formData.name && formData.name.length > 100) {
      newErrors.name = t('validation.nameTooLong');
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    // 只發送有變更的欄位
    const input: HQUpdateUserInput = {};
    if (formData.email !== user.email) {
      input.email = formData.email;
    }
    if (formData.name !== user.name) {
      input.name = formData.name;
    }

    if (Object.keys(input).length === 0) {
      enqueueSnackbar(t('noChanges'), { variant: 'info' });
      handleClose();
      return;
    }

    await updateUser({
      variables: {
        id: user.id,
        input,
      },
    });
  };

  const handleChange =
    (field: keyof HQUpdateUserInput) =>
    (e: React.ChangeEvent<HTMLInputElement>) => {
      setFormData((prev) => ({ ...prev, [field]: e.target.value }));
      // 清除該欄位的錯誤
      if (errors[field]) {
        setErrors((prev) => ({ ...prev, [field]: undefined }));
      }
    };

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
      <form onSubmit={handleSubmit}>
        <DialogTitle>{t('editUser')}</DialogTitle>
        <DialogContent>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, pt: 2 }}>
            <Alert severity="info">{t('editUserHint')}</Alert>

            <TextField
              label={t('form.email')}
              type="email"
              value={formData.email}
              onChange={handleChange('email')}
              error={Boolean(errors.email)}
              helperText={errors.email}
              fullWidth
              autoFocus
            />

            <TextField
              label={t('form.name')}
              value={formData.name}
              onChange={handleChange('name')}
              error={Boolean(errors.name)}
              helperText={errors.name}
              fullWidth
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose} disabled={loading}>
            {tc('cancel')}
          </Button>
          <Button
            type="submit"
            variant="contained"
            disabled={loading}
            startIcon={loading && <CircularProgress size={20} />}
          >
            {loading ? tc('updating') : tc('update')}
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  );
}
