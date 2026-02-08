'use client';

import { Container, Box, Card, CardContent } from '@mui/material';
import { AccountCircle as AccountIcon } from '@mui/icons-material';
import { useSnackbar } from 'notistack';
import { useTranslations } from 'next-intl';
import { useQuery, useMutation } from '@apollo/client/react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import ProtectedRoute from '@/components/auth/ProtectedRoute';
import { AppShell } from '@/components/layout';
import { PageHeader, FormField } from '@/components/molecules';
import { ME_QUERY, UPDATE_MY_PROFILE_MUTATION } from '@/lib/graphql';
import { getErrorMessage } from '@/lib/error-utils';
import { Button } from '@/components/atoms';

function AccountSettingsPageContent() {
  const { enqueueSnackbar } = useSnackbar();
  const t = useTranslations('pages.settings.account');
  const tc = useTranslations('common');
  const tv = useTranslations('validation');

  type MeQueryData = {
    me?: {
      id: string;
      email: string;
      name?: string;
      profile?: {
        avatar?: string;
      };
    };
  };

  const {
    data,
    loading: queryLoading,
    refetch,
  } = useQuery<MeQueryData>(ME_QUERY, {
    fetchPolicy: 'cache-first', // 使用緩存優先，減少重複請求
  });
  const [updateProfile, { loading: updateProfileLoading }] = useMutation(
    UPDATE_MY_PROFILE_MUTATION,
  );

  const user = data?.me;

  // Account Info Form Schema
  const accountSchema = z.object({
    email: z.string().email(tv('email.invalid')),
    name: z
      .string()
      .max(100, tv('name.maxLength', { max: 100 }))
      .optional(),
  });

  type AccountFormData = z.infer<typeof accountSchema>;

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<AccountFormData>({
    resolver: zodResolver(accountSchema),
    values: {
      email: user?.email || '',
      name: user?.name || '',
    },
  });

  const onSubmit = async (data: AccountFormData) => {
    try {
      await updateProfile({
        variables: {
          input: {
            email: data.email,
            name: data.name || null,
          },
        },
      });

      enqueueSnackbar(t('updateSuccess'), { variant: 'success' });
      refetch();
    } catch (error: unknown) {
      const errorMessage = getErrorMessage(error, t('updateError'));
      if (errorMessage) {
        enqueueSnackbar(errorMessage, { variant: 'error' });
      }
    }
  };

  return (
    <AppShell>
      <Container maxWidth="md" sx={{ mt: 4, mb: 4 }}>
        <PageHeader
          breadcrumbs={[
            { label: tc('breadcrumb.dashboard'), href: '/dashboard' },
            { label: tc('breadcrumb.account') },
          ]}
          title={t('title')}
          description={t('description')}
          icon={
            <AccountIcon sx={{ fontSize: '2rem', color: 'primary.main' }} />
          }
        />

        {/* Account Information Card */}
        <Card elevation={2}>
          <CardContent>
            <Box component="form" onSubmit={handleSubmit(onSubmit)} noValidate>
              <FormField
                {...register('email')}
                margin="normal"
                required
                fullWidth
                label={t('email')}
                type="email"
                autoComplete="email"
                error={errors.email}
                helperText={errors.email?.message || t('emailHelper')}
                disabled={queryLoading || updateProfileLoading}
              />

              <FormField
                {...register('name')}
                margin="normal"
                fullWidth
                label={t('name')}
                autoComplete="name"
                error={errors.name}
                helperText={errors.name?.message || t('nameHelper')}
                disabled={queryLoading || updateProfileLoading}
              />

              <Button
                type="submit"
                variant="contained"
                loading={updateProfileLoading}
                disabled={queryLoading}
                sx={{ mt: 2 }}
              >
                {tc('save')}
              </Button>
            </Box>
          </CardContent>
        </Card>
      </Container>
    </AppShell>
  );
}

export default function AccountSettingsPage() {
  return (
    <ProtectedRoute>
      <AccountSettingsPageContent />
    </ProtectedRoute>
  );
}
