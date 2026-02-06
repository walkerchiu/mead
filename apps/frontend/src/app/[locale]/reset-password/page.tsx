'use client';

import { Suspense, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { useMutation, useQuery } from '@apollo/client/react';
import { useSnackbar } from 'notistack';
import { useTranslations } from 'next-intl';
import { Box } from '@mui/material';
import { Progress } from '@/components/atoms';
import { AuthLayout } from '@/components/templates';
import { ResetPasswordForm } from '@/components/organisms';
import {
  RESET_PASSWORD_MUTATION,
  VERIFY_PASSWORD_RESET_TOKEN_QUERY,
} from '@/lib/graphql';
import { useRouter } from '@/i18n/routing';
import { getErrorMessage } from '@/lib/error-utils';

function ResetPasswordContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get('token');
  const { enqueueSnackbar } = useSnackbar();
  const t = useTranslations('auth.resetPassword');

  const [error, setError] = useState<string>();
  const [success, setSuccess] = useState(false);

  const { data: tokenData, loading: tokenLoading } = useQuery(
    VERIFY_PASSWORD_RESET_TOKEN_QUERY,
    {
      variables: { token: token || '' },
      skip: !token,
    },
  );

  const [resetPassword, { loading }] = useMutation(RESET_PASSWORD_MUTATION);

  const tokenValidData = tokenData as {
    verifyPasswordResetToken?: { valid?: boolean };
  };
  const isTokenValid = tokenValidData?.verifyPasswordResetToken?.valid;

  const handleSubmit = async (data: {
    password: string;
    confirmPassword: string;
  }) => {
    if (!token) {
      setError(t('missingToken'));
      return;
    }

    setError(undefined);

    try {
      const result = await resetPassword({
        variables: {
          token,
          newPassword: data.password,
        },
      });

      const responseData = result.data as {
        resetPassword?: boolean;
      };

      if (responseData?.resetPassword) {
        setSuccess(true);
        enqueueSnackbar(t('success'), {
          variant: 'success',
        });
        setTimeout(() => {
          router.push('/login');
        }, 2000);
      }
    } catch (err: unknown) {
      const errorMessage = getErrorMessage(err, t('error'));
      if (errorMessage) {
        setError(errorMessage);
      }
    }
  };

  if (tokenLoading) {
    return (
      <AuthLayout>
        <Box sx={{ textAlign: 'center', py: 4 }}>
          <Progress type="circular" />
        </Box>
      </AuthLayout>
    );
  }

  if (!token || isTokenValid === false) {
    return (
      <AuthLayout title={t('invalidTokenTitle')} subtitle="">
        <ResetPasswordForm onSubmit={handleSubmit} tokenInvalid={true} />
      </AuthLayout>
    );
  }

  return (
    <AuthLayout
      title={success ? undefined : t('title')}
      subtitle={success ? undefined : t('subtitle')}
    >
      <ResetPasswordForm
        onSubmit={handleSubmit}
        loading={loading}
        error={error}
        success={success}
      />
    </AuthLayout>
  );
}

export default function ResetPasswordPage() {
  return (
    <Suspense
      fallback={
        <Box
          sx={{
            minHeight: '100vh',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <Progress type="circular" />
        </Box>
      }
    >
      <ResetPasswordContent />
    </Suspense>
  );
}
