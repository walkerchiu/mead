'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Link from '@mui/material/Link';
import NextLink from 'next/link';
import { useTranslations } from 'next-intl';
import { FormField, AlertMessage } from '@/components/molecules';
import { Button } from '@/components/atoms';

export type ForgotPasswordFormData = {
  email: string;
};

export interface ForgotPasswordFormProps {
  onSubmit: (data: ForgotPasswordFormData) => void | Promise<void>;
  loading?: boolean;
  error?: string;
  success?: boolean;
  defaultEmail?: string;
  /** 「返回登入」連結目標（HQ 軌傳 /hq/login）。 */
  backToLoginHref?: string;
}

export function ForgotPasswordForm({
  onSubmit,
  loading = false,
  error,
  success = false,
  defaultEmail = '',
  backToLoginHref = '/login',
}: ForgotPasswordFormProps) {
  const t = useTranslations('auth.forgotPassword');
  const tv = useTranslations('validation');

  const forgotPasswordSchema = z.object({
    email: z.string().email(tv('email.invalid')),
  });

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ForgotPasswordFormData>({
    resolver: zodResolver(forgotPasswordSchema),
    defaultValues: {
      email: defaultEmail,
    },
  });

  if (success) {
    return (
      <Box sx={{ width: '100%', maxWidth: 400, textAlign: 'center' }}>
        <Typography variant="h4" component="h1" gutterBottom>
          {t('successTitle')}
        </Typography>

        <AlertMessage severity="success" sx={{ mt: 3, mb: 3 }}>
          {t('successMessage')}
        </AlertMessage>

        <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
          {t('successHint')}
        </Typography>

        <Link
          component={NextLink}
          href={backToLoginHref}
          variant="body2"
          underline="hover"
        >
          {t('backToLogin')}
        </Link>
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

      <FormField
        {...register('email')}
        label={
          tv('email.required').includes('email')
            ? 'Email'
            : tv('email.required').split(' ')[0]
        }
        type="email"
        error={errors.email}
        autoComplete="email"
        autoFocus
        placeholder="your@email.com"
      />

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

      <Box sx={{ mt: 2, textAlign: 'center' }}>
        <Link
          component={NextLink}
          href={backToLoginHref}
          variant="body2"
          underline="hover"
        >
          {t('backToLogin')}
        </Link>
      </Box>
    </Box>
  );
}

export default ForgotPasswordForm;
