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
  Alert,
  CircularProgress,
} from '@mui/material';
import { useTranslations } from 'next-intl';
import { useSnackbar } from 'notistack';
import { useMutation } from '@apollo/client/react';
import { CREATE_USER, CreateUserInput } from '@/graphql/users';
import { PasswordField } from '@/components/molecules';
import { PasswordStrengthIndicator } from '@/components/atoms';
import { validatePassword } from '@/utils/password-validator';

interface CreateUserDialogProps {
  open: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export default function CreateUserDialog({
  open,
  onClose,
  onSuccess,
}: CreateUserDialogProps) {
  const t = useTranslations('pages.hq.users');
  const tc = useTranslations('common');
  const { enqueueSnackbar } = useSnackbar();

  const [formData, setFormData] = useState<CreateUserInput>({
    email: '',
    name: '',
    password: '',
  });
  const [errors, setErrors] = useState<Partial<CreateUserInput>>({});

  const [createUser, { loading }] = useMutation(CREATE_USER, {
    onCompleted: () => {
      enqueueSnackbar(t('createSuccess'), { variant: 'success' });
      onSuccess();
      handleClose();
    },
    onError: (error) => {
      enqueueSnackbar(`${tc('error.createFailed')}: ${error.message}`, {
        variant: 'error',
      });
    },
  });

  const handleClose = () => {
    setFormData({ email: '', name: '', password: '' });
    setErrors({});
    onClose();
  };

  const validateForm = (): boolean => {
    const newErrors: Partial<CreateUserInput> = {};

    if (!formData.email) {
      newErrors.email = t('validation.emailRequired');
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = t('validation.emailInvalid');
    }

    if (!formData.name) {
      newErrors.name = t('validation.nameRequired');
    } else if (formData.name.length > 100) {
      newErrors.name = t('validation.nameTooLong');
    }

    if (!formData.password) {
      newErrors.password = t('validation.passwordRequired');
    } else {
      // 使用完整的密碼強度驗證
      const validationResult = validatePassword(formData.password);
      if (!validationResult.isValid) {
        newErrors.password =
          '密碼不符合要求: ' + validationResult.errors.join(', ');
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    await createUser({
      variables: {
        input: formData,
      },
    });
  };

  const handleChange =
    (field: keyof CreateUserInput) =>
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
        <DialogTitle>{t('createUser')}</DialogTitle>
        <DialogContent>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, pt: 2 }}>
            <Alert severity="info">{t('createUserHint')}</Alert>

            <TextField
              label={t('form.email')}
              type="email"
              value={formData.email}
              onChange={handleChange('email')}
              error={Boolean(errors.email)}
              helperText={errors.email}
              required
              fullWidth
              autoFocus
            />

            <TextField
              label={t('form.name')}
              value={formData.name}
              onChange={handleChange('name')}
              error={Boolean(errors.name)}
              helperText={errors.name}
              required
              fullWidth
            />

            <Box>
              <PasswordField
                label={t('form.password')}
                value={formData.password}
                onChange={handleChange('password')}
                error={errors.password}
                required
                fullWidth
              />
              <PasswordStrengthIndicator password={formData.password} />
            </Box>
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
            {loading ? tc('creating') : tc('create')}
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  );
}
