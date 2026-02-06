'use client';

import { useMutation } from '@apollo/client/react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useSnackbar } from 'notistack';
import { useTranslations } from 'next-intl';
import { Box, FormControlLabel, Checkbox, Alert } from '@mui/material';
import { VERIFY_TWO_FACTOR_LOGIN_MUTATION } from '@/lib/graphql';
import { setAuthTokens } from '@/lib/auth';
import { useRouter } from '@/i18n/routing';
import { getErrorMessage } from '@/lib/error-utils';
import { FormField } from '@/components/molecules';
import { Button } from '@/components/atoms';

interface TwoFactorFormProps {
  temporaryToken: string;
  onBack?: () => void;
}

export default function TwoFactorForm({
  temporaryToken,
  onBack,
}: TwoFactorFormProps) {
  const router = useRouter();
  const { enqueueSnackbar } = useSnackbar();
  const t = useTranslations('auth.twoFactor');
  const tLogin = useTranslations('auth.login');
  const [verifyTwoFactor, { loading }] = useMutation(
    VERIFY_TWO_FACTOR_LOGIN_MUTATION,
  );

  const twoFactorSchema = z.object({
    code: z.string().min(6, t('codeRequired')).max(8, t('codeTooLong')),
    isBackupCode: z.boolean().optional(),
  });

  type TwoFactorFormData = z.infer<typeof twoFactorSchema>;

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<TwoFactorFormData>({
    resolver: zodResolver(twoFactorSchema),
    defaultValues: {
      isBackupCode: false,
    },
  });

  const isBackupCode = watch('isBackupCode');

  const onSubmit = async (data: TwoFactorFormData) => {
    try {
      const result = await verifyTwoFactor({
        variables: {
          input: {
            temporaryToken,
            code: data.code,
            isBackupCode: data.isBackupCode || false,
          },
        },
      });

      const responseData = result.data as {
        verifyTwoFactorLogin?: {
          accessToken: string;
          user: {
            id: string;
            email: string;
            name?: string;
          };
        };
      };

      const response = responseData?.verifyTwoFactorLogin;

      if (!response || !response.accessToken) {
        throw new Error(t('verificationFailed'));
      }

      setAuthTokens({
        accessToken: response.accessToken,
      });

      enqueueSnackbar(tLogin('success'), { variant: 'success' });
      router.push('/dashboard');
    } catch (error: unknown) {
      const errorMessage = getErrorMessage(error, t('codeInvalid'));
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
      <Alert severity="info" sx={{ mb: 3 }}>
        {t('codeInfo')}
      </Alert>

      <FormField
        {...register('code')}
        label={isBackupCode ? t('backupCodeLabel') : t('codeLabel')}
        fullWidth
        margin="normal"
        error={errors.code}
        autoComplete="off"
        autoFocus
        inputProps={{
          maxLength: 8,
          style: {
            letterSpacing: '0.5em',
            textAlign: 'center',
            fontSize: '1.5rem',
          },
        }}
      />

      <FormControlLabel
        control={<Checkbox {...register('isBackupCode')} />}
        label={t('useBackupCode')}
        sx={{ mt: 1 }}
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

      {onBack && (
        <Button
          variant="text"
          fullWidth
          onClick={onBack}
          disabled={loading}
          sx={{ mt: 1 }}
        >
          {t('backToLogin')}
        </Button>
      )}
    </Box>
  );
}
