'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import Box from '@mui/material/Box';
import Link from '@mui/material/Link';
import NextLink from 'next/link';
import { useTranslations } from 'next-intl';
import { FormField, PasswordField, AlertMessage } from '@/components/molecules';
import { Button } from '@/components/atoms';

/**
 * 登入表單組件 - Atomic Design: Organism
 */

export interface LoginFormProps {
  onSubmit: (data: LoginFormData) => void | Promise<void>;
  loading?: boolean;
  error?: string;
  defaultEmail?: string;
  showForgotPassword?: boolean;
}

export type LoginFormData = {
  email: string;
  password: string;
};

export function LoginForm({
  onSubmit,
  loading = false,
  error,
  defaultEmail = '',
  showForgotPassword = true,
}: LoginFormProps) {
  const t = useTranslations('auth.login');
  const tv = useTranslations('validation');

  const loginSchema = z.object({
    email: z.string().email(tv('email.invalid')),
    password: z.string().min(1, tv('password.required')),
  });

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: defaultEmail,
      password: '',
    },
  });

  const handleRetry = () => {
    reset({ email: defaultEmail, password: '' });
  };

  return (
    <Box
      component="form"
      onSubmit={handleSubmit(onSubmit)}
      sx={{ width: '100%', maxWidth: 400 }}
    >
      {error && (
        <AlertMessage
          severity="error"
          showRetry
          retryText={t('retry') || 'Try Again'}
          onRetry={handleRetry}
          sx={{ mb: 3 }}
        >
          {error}
        </AlertMessage>
      )}

      <FormField
        {...register('email')}
        label={t('emailLabel')}
        type="email"
        error={errors.email}
        autoComplete="email"
        autoFocus
        placeholder="your@email.com"
        disabled={loading}
      />

      <Box sx={{ mt: 2 }}>
        <PasswordField
          {...register('password')}
          label={t('passwordLabel')}
          error={errors.password}
          autoComplete="current-password"
          disabled={loading}
        />
      </Box>

      {showForgotPassword && (
        <Box sx={{ mt: 1, mb: 2, textAlign: 'right' }}>
          <Link
            component={NextLink}
            href="/forgot-password"
            variant="body2"
            underline="hover"
          >
            {t('forgotPassword')}
          </Link>
        </Box>
      )}

      <Button
        type="submit"
        variant="contained"
        fullWidth
        size="large"
        loading={loading}
        disabled={loading}
        sx={{ mt: 2 }}
      >
        {t('submit')}
      </Button>
    </Box>
  );
}

export default LoginForm;
