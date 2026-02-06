'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import { useTranslations } from 'next-intl';
import { PasswordField, AlertMessage } from '@/components/molecules';
import { Button } from '@/components/atoms';

export type ResetPasswordFormData = {
  password: string;
  confirmPassword: string;
};

export interface ResetPasswordFormProps {
  onSubmit: (data: ResetPasswordFormData) => void | Promise<void>;
  loading?: boolean;
  error?: string;
  success?: boolean;
  tokenInvalid?: boolean;
}

export function ResetPasswordForm({
  onSubmit,
  loading = false,
  error,
  success = false,
  tokenInvalid = false,
}: ResetPasswordFormProps) {
  const t = useTranslations('auth.resetPassword');
  const tv = useTranslations('validation');

  const resetPasswordSchema = z
    .object({
      password: z.string().min(8, tv('password.minLength')),
      confirmPassword: z.string(),
    })
    .refine((data) => data.password === data.confirmPassword, {
      message: tv('password.mismatch'),
      path: ['confirmPassword'],
    });

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ResetPasswordFormData>({
    resolver: zodResolver(resetPasswordSchema),
  });

  if (tokenInvalid) {
    return (
      <Box sx={{ width: '100%', maxWidth: 400, textAlign: 'center' }}>
        <AlertMessage severity="error" sx={{ mt: 3 }}>
          {t('invalidToken')}
        </AlertMessage>
      </Box>
    );
  }

  if (success) {
    return (
      <Box sx={{ width: '100%', maxWidth: 400, textAlign: 'center' }}>
        <AlertMessage severity="success" sx={{ mt: 3 }}>
          {t('successMessage')}
        </AlertMessage>
      </Box>
    );
  }

  return (
    <Box
      component="form"
      onSubmit={handleSubmit(onSubmit)}
      sx={{ width: '100%', maxWidth: 400 }}
    >
      {error && (
        <Box sx={{ mb: 2 }}>
          <Typography color="error" variant="body2">
            {error}
          </Typography>
        </Box>
      )}

      <PasswordField
        {...register('password')}
        label={t('newPassword')}
        error={errors.password}
        autoComplete="new-password"
        autoFocus
        showStrength
        helperText={t('helperText')}
      />

      <Box sx={{ mt: 2 }}>
        <PasswordField
          {...register('confirmPassword')}
          label={t('confirmPassword')}
          error={errors.confirmPassword}
          autoComplete="new-password"
          helperText={t('confirmHelperText')}
        />
      </Box>

      <Button
        type="submit"
        variant="contained"
        fullWidth
        size="large"
        loading={loading}
        disabled={loading}
        sx={{ mt: 3 }}
      >
        {t('submit')}
      </Button>
    </Box>
  );
}

export default ResetPasswordForm;
