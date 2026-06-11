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
 * Login Form Component - Atomic Design: Organism
 */

export interface LoginFormProps {
  onSubmit: (data: LoginFormData) => void | Promise<void>;
  loading?: boolean;
  error?: string;
  defaultEmail?: string;
  showForgotPassword?: boolean;
  /** 「忘記密碼」連結目標（HQ 軌傳 /hq/forgot-password）。 */
  forgotPasswordHref?: string;
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
  forgotPasswordHref = '/forgot-password',
}: LoginFormProps) {
  const t = useTranslations('auth.login');
  const tv = useTranslations('validation');

  // 登入識別子為「帳號」（非 email）。form data 欄位名沿用 `email` 為向後相容保留（語意為帳號）。
  const loginSchema = z.object({
    email: z
      .string()
      .min(1, tv('account.required'))
      .regex(/^[a-zA-Z0-9_]{3,20}$/, tv('account.invalid')),
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
        label={t('accountLabel')}
        type="text"
        error={errors.email}
        autoComplete="username"
        autoFocus
        placeholder={t('accountPlaceholder')}
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
            href={forgotPasswordHref}
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
