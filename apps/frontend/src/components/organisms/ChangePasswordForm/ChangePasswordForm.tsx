'use client';

import { useMutation } from '@apollo/client/react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useSnackbar } from 'notistack';
import { useTranslations } from 'next-intl';
import { Box } from '@mui/material';
import { Lock } from '@mui/icons-material';
import { CHANGE_PASSWORD_MUTATION } from '@/lib/graphql';
import { getErrorMessage } from '@/lib/error-utils';
import { PasswordField } from '@/components/molecules';
import { Button } from '@/components/atoms';

interface ChangePasswordFormProps {
  onSuccess?: () => void;
}

export default function ChangePasswordForm({
  onSuccess,
}: ChangePasswordFormProps) {
  const { enqueueSnackbar } = useSnackbar();
  const t = useTranslations('pages.settings.security');
  const tv = useTranslations('validation');

  const [changePassword, { loading }] = useMutation(CHANGE_PASSWORD_MUTATION);

  type ChangePasswordFormData = {
    currentPassword: string;
    newPassword: string;
    confirmPassword: string;
  };

  const changePasswordSchema = z
    .object({
      currentPassword: z.string().min(1, tv('password.required')),
      newPassword: z
        .string()
        .min(8, tv('password.minLength'))
        .regex(/[A-Z]/, tv('password.uppercase'))
        .regex(/[a-z]/, tv('password.lowercase'))
        .regex(/[0-9]/, tv('password.number'))
        .regex(
          /[!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?]/,
          tv('password.specialChar'),
        ),
      confirmPassword: z.string(),
    })
    .refine((data) => data.newPassword === data.confirmPassword, {
      message: tv('password.mismatch'),
      path: ['confirmPassword'],
    });

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<ChangePasswordFormData>({
    resolver: zodResolver(changePasswordSchema),
    defaultValues: {
      currentPassword: '',
      newPassword: '',
      confirmPassword: '',
    },
  });

  const onSubmit = async (data: ChangePasswordFormData) => {
    try {
      type ChangePasswordMutationData = {
        changePassword: boolean;
      };

      const result = await changePassword({
        variables: {
          input: {
            currentPassword: data.currentPassword,
            newPassword: data.newPassword,
          },
        },
      });

      const responseData = result.data as
        | ChangePasswordMutationData
        | undefined;

      if (responseData?.changePassword) {
        enqueueSnackbar(t('passwordChanged'), {
          variant: 'success',
        });
        reset();
        onSuccess?.();
      }
    } catch (error: unknown) {
      const errorMessage = getErrorMessage(error, t('updateError'));
      if (errorMessage) {
        enqueueSnackbar(errorMessage, { variant: 'error' });
      }
    }
  };

  return (
    <Box component="form" onSubmit={handleSubmit(onSubmit)} noValidate>
      <PasswordField
        {...register('currentPassword')}
        margin="normal"
        required
        fullWidth
        label={t('currentPassword')}
        autoComplete="current-password"
        error={errors.currentPassword}
        helperText={
          errors.currentPassword?.message || t('currentPasswordHelper')
        }
        disabled={loading}
      />

      <PasswordField
        {...register('newPassword')}
        margin="normal"
        required
        fullWidth
        label={t('newPassword')}
        autoComplete="new-password"
        error={errors.newPassword}
        helperText={errors.newPassword?.message || t('newPasswordHelper')}
        disabled={loading}
      />

      <PasswordField
        {...register('confirmPassword')}
        margin="normal"
        required
        fullWidth
        label={t('confirmPassword')}
        autoComplete="new-password"
        error={errors.confirmPassword}
        helperText={
          errors.confirmPassword?.message || t('confirmPasswordHelper')
        }
        disabled={loading}
      />

      <Button
        type="submit"
        fullWidth
        variant="contained"
        loading={loading}
        startIcon={<Lock />}
        sx={{ mt: 1 }}
      >
        {t('changePassword')}
      </Button>
    </Box>
  );
}
