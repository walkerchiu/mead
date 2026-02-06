'use client';

import { useState } from 'react';
import { useMutation } from '@apollo/client/react';
import { useSnackbar } from 'notistack';
import { useTranslations } from 'next-intl';
import { AuthLayout } from '@/components/templates';
import { ForgotPasswordForm } from '@/components/organisms';
import { REQUEST_PASSWORD_RESET_MUTATION } from '@/lib/graphql';
import { getErrorMessage } from '@/lib/error-utils';

export default function ForgotPasswordPage() {
  const { enqueueSnackbar } = useSnackbar();
  const t = useTranslations('auth.forgotPassword');
  const [error, setError] = useState<string>();
  const [success, setSuccess] = useState(false);

  const [requestReset, { loading }] = useMutation(
    REQUEST_PASSWORD_RESET_MUTATION,
  );

  const handleSubmit = async (data: { email: string }) => {
    setError(undefined);

    try {
      const result = await requestReset({
        variables: {
          email: data.email,
        },
      });

      const responseData = result.data as {
        requestPasswordReset?: { success?: boolean; message?: string };
      };

      if (responseData?.requestPasswordReset?.success) {
        setSuccess(true);
        enqueueSnackbar(
          responseData.requestPasswordReset.message || t('success'),
          { variant: 'success' },
        );
      }
    } catch (err: unknown) {
      const errorMessage = getErrorMessage(err, t('error'));
      if (errorMessage) {
        setError(errorMessage);
      }
    }
  };

  return (
    <AuthLayout
      title={success ? undefined : t('title')}
      subtitle={success ? undefined : t('subtitle')}
    >
      <ForgotPasswordForm
        onSubmit={handleSubmit}
        loading={loading}
        error={error}
        success={success}
      />
    </AuthLayout>
  );
}
