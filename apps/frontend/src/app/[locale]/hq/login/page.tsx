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
  ME_QUERY,
} from '@/lib/graphql';
import {
  setAuthTokens,
  isAuthenticated,
  getAccessToken,
  parseJwt,
} from '@/lib/auth';
import { AccessScope } from '@/types/auth';
import { getErrorMessage } from '@/lib/error-utils';
import { useNavRouter as useRouter } from '@/i18n/use-nav-router';
import { useParams } from 'next/navigation';
import { useApolloClient } from '@apollo/client/react';

/**
 * HQ 登入頁落點：以登入入口 scope 優先 —— 含 HQ_SCOPE → /hq/users，
 * 僅 CUSTOMER_SCOPE → fallback /dashboard，無 scope → /dashboard。
 */
function resolveLandingPath(): string {
  const token = getAccessToken();
  if (!token) return '/dashboard';
  const scopes = (parseJwt(token)?.accessScopes as string[]) || [];
  if (scopes.includes(AccessScope.HQ_SCOPE)) return '/hq/users';
  if (scopes.includes(AccessScope.CUSTOMER_SCOPE)) return '/dashboard';
  return '/dashboard';
}

export default function HqLoginPage() {
  const router = useRouter();
  const params = useParams();
  const apolloClient = useApolloClient();
  const { enqueueSnackbar } = useSnackbar();
  const t = useTranslations('auth.login');
  const t2fa = useTranslations('auth.twoFactor');
  const [redirecting, setRedirecting] = useState(false);
  const currentLocale = (params.locale as string) || 'en';

  const [showTwoFactor, setShowTwoFactor] = useState(false);
  const [temporaryToken, setTemporaryToken] = useState('');
  const [loginError, setLoginError] = useState<string>();
  const [twoFactorError, setTwoFactorError] = useState<string>();

  const [login, { loading: loginLoading }] = useMutation(LOGIN_MUTATION);
  const [verifyTwoFactor, { loading: twoFactorLoading }] = useMutation(
    VERIFY_TWO_FACTOR_LOGIN_MUTATION,
  );

  useEffect(() => {
    const checkAuth = async () => {
      if (isAuthenticated()) {
        setRedirecting(true);
        router.replace(resolveLandingPath());
        return;
      }

      const maxAttempts = 3;
      let attempts = 0;
      while (attempts < maxAttempts) {
        await new Promise((resolve) => setTimeout(resolve, 100));
        attempts++;
        if (isAuthenticated()) {
          setRedirecting(true);
          router.replace(resolveLandingPath());
          return;
        }
      }
    };

    checkAuth();
  }, [router]);

  const redirectToDashboard = async () => {
    const landing = resolveLandingPath();
    try {
      const { data: meData } = await apolloClient.query({
        query: ME_QUERY,
        fetchPolicy: 'network-only',
      });
      const profileLanguage = (meData as any)?.me?.profile?.language;
      if (profileLanguage && profileLanguage !== currentLocale) {
        window.location.href = `/${profileLanguage}${landing}`;
        return;
      }
    } catch {
      // 查詢失敗，使用當前 locale
    }
    router.push(landing);
  };

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
        await redirectToDashboard();
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
      await redirectToDashboard();
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

  return (
    <AuthLayout
      title={showTwoFactor ? t2fa('title') : t('title')}
      subtitle={showTwoFactor ? t2fa('subtitle') : t('subtitle')}
    >
      {!showTwoFactor ? (
        <LoginForm
          onSubmit={handleLogin}
          loading={loginLoading || redirecting}
          error={loginError}
          forgotPasswordHref="/hq/forgot-password"
        />
      ) : (
        <TwoFactorForm
          onSubmit={handleTwoFactor}
          loading={twoFactorLoading || redirecting}
          error={twoFactorError}
          onBack={handleBack}
        />
      )}
    </AuthLayout>
  );
}
