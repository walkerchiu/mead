'use client';

import { useMutation } from '@apollo/client/react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useSnackbar } from 'notistack';
import { useTranslations } from 'next-intl';
import { Box, Link, Alert } from '@mui/material';
import NextLink from 'next/link';
import { REQUEST_PASSWORD_RESET_MUTATION } from '@/lib/graphql';
import { getErrorMessage } from '@/lib/error-utils';
import { FormField } from '@/components/molecules';
import { Button } from '@/components/atoms';

export default function ForgotPasswordForm() {
  const { enqueueSnackbar } = useSnackbar();
  const t = useTranslations('auth.forgotPassword');
  const tv = useTranslations('validation');
  const [requestReset, { loading, data }] = useMutation(
    REQUEST_PASSWORD_RESET_MUTATION,
  );

  const forgotPasswordSchema = z.object({
    email: z.string().email(tv('email.invalid')),
  });

  type ForgotPasswordFormData = z.infer<typeof forgotPasswordSchema>;

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ForgotPasswordFormData>({
    resolver: zodResolver(forgotPasswordSchema),
  });

  const onSubmit = async (formData: ForgotPasswordFormData) => {
    try {
      const result = await requestReset({
        variables: {
          email: formData.email,
        },
      });

      const data = result.data as {
        requestPasswordReset?: { success?: boolean; message?: string };
      };

      if (data?.requestPasswordReset?.success) {
        enqueueSnackbar(data.requestPasswordReset.message || t('success'), {
          variant: 'success',
        });
      }
    } catch (error: unknown) {
      const errorMessage = getErrorMessage(error, t('error'));
      if (errorMessage) {
        enqueueSnackbar(errorMessage, { variant: 'error' });
      }
    }
  };

  const responseData = data as {
    requestPasswordReset?: { success?: boolean; message?: string };
  };
  const success = responseData?.requestPasswordReset?.success;

  return (
    <Box
      component="form"
      onSubmit={handleSubmit(onSubmit)}
      sx={{ width: '100%', maxWidth: 400 }}
    >
      {success && (
        <Alert severity="success" sx={{ mb: 3 }}>
          {t('successMessage')}
        </Alert>
      )}

      <FormField
        {...register('email')}
        label={tv('email.required').includes('email') ? 'Email' : 'Email'}
        type="email"
        fullWidth
        margin="normal"
        error={errors.email}
        autoComplete="email"
        autoFocus
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

      <Box sx={{ mt: 2, textAlign: 'center' }}>
        <Link
          component={NextLink}
          href="/login"
          variant="body2"
          underline="hover"
        >
          {t('backToLogin')}
        </Link>
      </Box>
    </Box>
  );
}
