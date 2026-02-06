'use client';

import { useState, useEffect } from 'react';
import { useMutation } from '@apollo/client/react';
import { useSnackbar } from 'notistack';
import { useTranslations } from 'next-intl';
import { AuthLayout } from '@/components/templates';
import { LoginForm, TwoFactorForm } from '@/components/organisms';
import {
  LOGIN_MUTATION,
  VERIFY_TWO_FACTOR_LOGIN_MUTATION,
} from '@/lib/graphql';
import { setAuthTokens, isAuthenticated } from '@/lib/auth';
import { getErrorMessage } from '@/lib/error-utils';
import { useRouter } from '@/i18n/routing';
import { DashboardSkeleton } from '@/components/atoms';

export default function LoginPage() {
  const router = useRouter();
  const { enqueueSnackbar } = useSnackbar();
  const t = useTranslations('auth.login');
  const t2fa = useTranslations('auth.twoFactor');
  const [checking, setChecking] = useState(true);

  const [showTwoFactor, setShowTwoFactor] = useState(false);
  const [temporaryToken, setTemporaryToken] = useState('');
  const [loginError, setLoginError] = useState<string>();
  const [twoFactorError, setTwoFactorError] = useState<string>();

  const [login, { loading: loginLoading }] = useMutation(LOGIN_MUTATION);
  const [verifyTwoFactor, { loading: twoFactorLoading }] = useMutation(
    VERIFY_TWO_FACTOR_LOGIN_MUTATION,
  );

  // 檢查是否已登入，如果已登入則重定向到首頁
  useEffect(() => {
    const checkAuth = async () => {
      // 等待一小段時間讓 useAuthInit 完成初始化
      await new Promise((resolve) => setTimeout(resolve, 300));

      if (isAuthenticated()) {
        router.replace('/dashboard');
      } else {
        setChecking(false);
      }
    };

    checkAuth();
  }, [router]);

  const handleLogin = async (data: { email: string; password: string }) => {
    setLoginError(undefined);

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
        setTemporaryToken(response.temporaryToken);
        setShowTwoFactor(true);
        enqueueSnackbar(response.message, { variant: 'info' });
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
        setLoginError(errorMessage);
      }
    }
  };

  const handleTwoFactor = async (code: string, isBackupCode: boolean) => {
    setTwoFactorError(undefined);

    try {
      const result = await verifyTwoFactor({
        variables: {
          input: {
            temporaryToken,
            code,
            isBackupCode,
          },
        },
      });

      const responseData = result.data as {
        verifyTwoFactorLogin?: {
          accessToken: string;
          message: string;
        };
      };

      const response = responseData?.verifyTwoFactorLogin;

      if (!response) {
        throw new Error(t2fa('verificationFailed'));
      }

      setAuthTokens({
        accessToken: response.accessToken,
      });

      enqueueSnackbar(t('success'), { variant: 'success' });
      router.push('/dashboard');
    } catch (error: unknown) {
      const errorMessage = getErrorMessage(error, t2fa('codeInvalid'));
      if (errorMessage) {
        setTwoFactorError(errorMessage);
      }
    }
  };

  const handleBack = () => {
    setShowTwoFactor(false);
    setTemporaryToken('');
    setTwoFactorError(undefined);
  };

  // 正在檢查認證狀態
  if (checking) {
    return <DashboardSkeleton />;
  }

  return (
    <AuthLayout
      title={showTwoFactor ? t2fa('title') : t('title')}
      subtitle={showTwoFactor ? t2fa('subtitle') : t('subtitle')}
    >
      {!showTwoFactor ? (
        <LoginForm
          onSubmit={handleLogin}
          loading={loginLoading}
          error={loginError}
        />
      ) : (
        <TwoFactorForm
          onSubmit={handleTwoFactor}
          loading={twoFactorLoading}
          error={twoFactorError}
          onBack={handleBack}
        />
      )}
    </AuthLayout>
  );
}
