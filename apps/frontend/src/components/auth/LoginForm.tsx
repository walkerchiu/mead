'use client';

import { useMutation } from '@apollo/client/react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useSnackbar } from 'notistack';
import { useTranslations } from 'next-intl';
import { Box, Link } from '@mui/material';
import NextLink from 'next/link';
import { LOGIN_MUTATION } from '@/lib/graphql';
import { setAuthTokens } from '@/lib/auth';
import { getErrorMessage } from '@/lib/error-utils';
import { useRouter } from '@/i18n/routing';
import { FormField } from '@/components/molecules';
import { Button } from '@/components/atoms';

interface LoginFormProps {
  onTwoFactorRequired?: (temporaryToken: string, message: string) => void;
}

export default function LoginForm({ onTwoFactorRequired }: LoginFormProps) {
  const router = useRouter();
  const { enqueueSnackbar } = useSnackbar();
  const t = useTranslations('auth.login');
  const tv = useTranslations('validation');
  const [login, { loading }] = useMutation(LOGIN_MUTATION);

  const loginSchema = z.object({
    email: z.string().email(tv('email.invalid')),
    password: z.string().min(1, tv('password.required')),
  });

  type LoginFormData = z.infer<typeof loginSchema>;

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
  });

  const onSubmit = async (data: LoginFormData) => {
    try {
      const result = await login({
        variables: {
          email: data.email,
          password: data.password,
        },
      });

      const loginData = result.data as {
        login?:
          | {
              __typename: 'AuthResponse';
              accessToken: string;
            }
          | {
              __typename: 'TwoFactorLoginResponse';
              requiresTwoFactor: boolean;
              temporaryToken: string;
              message: string;
            };
      };

      const response = loginData?.login;

      if (!response) {
        throw new Error(t('failed'));
      }

      if (response.__typename === 'TwoFactorLoginResponse') {
        enqueueSnackbar(response.message, { variant: 'info' });
        if (onTwoFactorRequired) {
          onTwoFactorRequired(response.temporaryToken, response.message);
        }
      } else if (response.__typename === 'AuthResponse') {
        setAuthTokens({
          accessToken: response.accessToken,
        });
        enqueueSnackbar(t('success'), { variant: 'success' });
        router.push('/dashboard');
      }
    } catch (error: unknown) {
      const errorMessage = getErrorMessage(error, t('error'));
      if (errorMessage) {
        enqueueSnackbar(errorMessage, { variant: 'error' });
      }
    }
  };

  return (
    <Box
      component="form"
      onSubmit={handleSubmit(onSubmit)}
      sx={{ width: '100%', maxWidth: 400 }}
    >
      <FormField
        {...register('email')}
        label={t('emailLabel')}
        type="email"
        fullWidth
        margin="normal"
        error={errors.email}
        autoComplete="email"
        autoFocus
      />

      <FormField
        {...register('password')}
        label={t('passwordLabel')}
        type="password"
        fullWidth
        margin="normal"
        error={errors.password}
        autoComplete="current-password"
      />

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

      <Button
        type="submit"
        variant="contained"
        fullWidth
        size="large"
        loading={loading}
        sx={{ mt: 2 }}
      >
        {t('submit')}
      </Button>
    </Box>
  );
}
