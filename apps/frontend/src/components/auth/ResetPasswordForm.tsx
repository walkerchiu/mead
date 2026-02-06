'use client';

import { useSearchParams } from 'next/navigation';
import { useMutation, useQuery } from '@apollo/client/react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useSnackbar } from 'notistack';
import { useTranslations } from 'next-intl';
import { Box, Typography, Alert, CircularProgress } from '@mui/material';
import {
  RESET_PASSWORD_MUTATION,
  VERIFY_PASSWORD_RESET_TOKEN_QUERY,
} from '@/lib/graphql';
import { useRouter } from '@/i18n/routing';
import { getErrorMessage } from '@/lib/error-utils';
import { FormField } from '@/components/molecules';
import { Button } from '@/components/atoms';

export default function ResetPasswordForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get('token');
  const { enqueueSnackbar } = useSnackbar();
  const t = useTranslations('auth.resetPassword');
  const tv = useTranslations('validation');

  const { data: tokenData, loading: tokenLoading } = useQuery(
    VERIFY_PASSWORD_RESET_TOKEN_QUERY,
    {
      variables: { token: token || '' },
      skip: !token,
    },
  );

  const [resetPassword, { loading }] = useMutation(RESET_PASSWORD_MUTATION);

  const resetPasswordSchema = z
    .object({
      newPassword: z
        .string()
        .min(8, tv('password.minLength'))
        .regex(/[A-Z]/, tv('password.uppercase'))
        .regex(/[a-z]/, tv('password.lowercase'))
        .regex(/[0-9]/, tv('password.number')),
      confirmPassword: z.string(),
    })
    .refine((data) => data.newPassword === data.confirmPassword, {
      message: tv('password.mismatch'),
      path: ['confirmPassword'],
    });

  type ResetPasswordFormData = z.infer<typeof resetPasswordSchema>;

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ResetPasswordFormData>({
    resolver: zodResolver(resetPasswordSchema),
  });

  const onSubmit = async (data: ResetPasswordFormData) => {
    if (!token) {
      enqueueSnackbar(t('missingToken'), { variant: 'error' });
      return;
    }

    try {
      const result = await resetPassword({
        variables: {
          token,
          newPassword: data.newPassword,
        },
      });

      const responseData = result.data as {
        resetPassword?: boolean;
      };

      if (responseData?.resetPassword) {
        enqueueSnackbar(t('success'), {
          variant: 'success',
        });
        setTimeout(() => {
          router.push('/login');
        }, 2000);
      }
    } catch (error: unknown) {
      const errorMessage = getErrorMessage(error, t('error'));
      if (errorMessage) {
        enqueueSnackbar(errorMessage, { variant: 'error' });
      }
    }
  };

  if (tokenLoading) {
    return (
      <Box sx={{ textAlign: 'center', py: 4 }}>
        <CircularProgress />
        <Typography variant="body2" sx={{ mt: 2 }}>
          {/* loading */}
        </Typography>
      </Box>
    );
  }

  const tokenResponse = tokenData as {
    verifyPasswordResetToken?: { valid?: boolean };
  };

  if (!token || !tokenResponse?.verifyPasswordResetToken?.valid) {
    return (
      <Box sx={{ width: '100%', maxWidth: 400 }}>
        <Alert severity="error">{t('invalidToken')}</Alert>
        <Button
          variant="contained"
          fullWidth
          onClick={() => router.push('/forgot-password')}
          sx={{ mt: 3 }}
        >
          {t('backToForgotPassword')}
        </Button>
      </Box>
    );
  }

  return (
    <Box
      component="form"
      onSubmit={handleSubmit(onSubmit)}
      sx={{ width: '100%', maxWidth: 400 }}
    >
      <Alert severity="info" sx={{ mb: 3 }}>
        {t('passwordRequirements')}
        <ul style={{ margin: '8px 0', paddingLeft: '20px' }}>
          <li>{t('minLength')}</li>
          <li>{t('uppercase')}</li>
          <li>{t('lowercase')}</li>
          <li>{t('number')}</li>
        </ul>
      </Alert>

      <FormField
        {...register('newPassword')}
        label={t('newPassword')}
        type="password"
        fullWidth
        margin="normal"
        error={errors.newPassword}
        autoComplete="new-password"
        autoFocus
      />

      <FormField
        {...register('confirmPassword')}
        label={t('confirmPassword')}
        type="password"
        fullWidth
        margin="normal"
        error={errors.confirmPassword}
        autoComplete="new-password"
      />

      <Button
        type="submit"
        variant="contained"
        fullWidth
        size="large"
        loading={loading}
        sx={{ mt: 3 }}
      >
        {t('submit')}
      </Button>
    </Box>
  );
}
