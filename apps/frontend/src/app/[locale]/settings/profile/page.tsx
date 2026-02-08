'use client';
import { Container, Box, Card, CardContent } from '@mui/material';
import { Person as PersonIcon } from '@mui/icons-material';
import { useSnackbar } from 'notistack';
import { useTranslations } from 'next-intl';
import { useQuery, useMutation } from '@apollo/client/react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import ProtectedRoute from '@/components/auth/ProtectedRoute';
import { AppShell } from '@/components/layout';
import { ME_QUERY, UPDATE_MY_PROFILE_DETAILS_MUTATION } from '@/lib/graphql';
import { getErrorMessage } from '@/lib/error-utils';
import { FormField, SelectField, PageHeader } from '@/components/molecules';
import { Button, TextArea } from '@/components/atoms';

function ProfileSettingsPageContent() {
  const { enqueueSnackbar } = useSnackbar();
  const t = useTranslations('pages.settings.profile');
  const tc = useTranslations('common');
  const tv = useTranslations('validation');

  type MeQueryData = {
    me?: {
      id: string;
      email: string;
      name?: string;
      profile?: {
        avatar?: string;
        bio?: string;
        phone?: string;
        address?: string;
        website?: string;
        language?: 'en' | 'zh-TW';
      };
    };
  };

  const {
    data,
    loading: queryLoading,
    refetch,
  } = useQuery<MeQueryData>(ME_QUERY, {
    fetchPolicy: 'cache-and-network', // 確保 profile 欄位是最新資料
  });
  const [updateProfileDetails, { loading: updateDetailsLoading }] = useMutation(
    UPDATE_MY_PROFILE_DETAILS_MUTATION,
  );

  const user = data?.me;

  // Profile Details Form Schema
  const profileDetailsSchema = z.object({
    bio: z.string().max(500, tv('bio.maxLength')).optional(),
    phone: z.string().optional(),
    address: z.string().optional(),
    website: z
      .string()
      .refine(
        (val) => !val || val === '' || /^https?:\/\/.+/.test(val),
        tv('website.invalid'),
      )
      .optional(),
    language: z.enum(['en', 'zh-TW']).optional(),
  });

  type ProfileDetailsFormData = z.infer<typeof profileDetailsSchema>;

  const {
    register,
    handleSubmit,
    control,
    formState: { errors },
  } = useForm<ProfileDetailsFormData>({
    resolver: zodResolver(profileDetailsSchema),
    values: {
      bio: user?.profile?.bio || '',
      phone: user?.profile?.phone || '',
      address: user?.profile?.address || '',
      website: user?.profile?.website || '',
      language: (user?.profile?.language as 'en' | 'zh-TW' | undefined) || 'en',
    },
  });

  const onSubmit = async (data: ProfileDetailsFormData) => {
    try {
      await updateProfileDetails({
        variables: {
          input: {
            bio: data.bio || null,
            phone: data.phone || null,
            address: data.address || null,
            website: data.website || null,
            language: data.language || null,
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
            { label: tc('breadcrumb.profile') },
          ]}
          title={t('title')}
          description={t('description')}
          icon={<PersonIcon sx={{ fontSize: '2rem', color: 'primary.main' }} />}
        />

        {/* Profile Details Card */}
        <Card elevation={2}>
          <CardContent>
            <Box component="form" onSubmit={handleSubmit(onSubmit)} noValidate>
              <TextArea
                {...register('bio')}
                margin="normal"
                fullWidth
                label={t('bio')}
                rows={4}
                error={!!errors.bio}
                helperText={errors.bio?.message || t('bioHelper')}
                disabled={queryLoading || updateDetailsLoading}
              />

              <FormField
                {...register('phone')}
                margin="normal"
                fullWidth
                label={t('phone')}
                autoComplete="tel"
                error={errors.phone}
                helperText={errors.phone?.message || t('phoneHelper')}
                disabled={queryLoading || updateDetailsLoading}
              />

              <FormField
                {...register('address')}
                margin="normal"
                fullWidth
                label={t('address')}
                autoComplete="street-address"
                error={errors.address}
                helperText={errors.address?.message || t('addressHelper')}
                disabled={queryLoading || updateDetailsLoading}
              />

              <FormField
                {...register('website')}
                margin="normal"
                fullWidth
                label={t('website')}
                type="url"
                autoComplete="url"
                error={errors.website}
                helperText={errors.website?.message || t('websiteHelper')}
                disabled={queryLoading || updateDetailsLoading}
              />

              <Controller
                name="language"
                control={control}
                render={({ field }) => (
                  <SelectField
                    {...field}
                    margin="normal"
                    fullWidth
                    label={t('language')}
                    options={[
                      { value: 'en', label: 'English' },
                      { value: 'zh-TW', label: '繁體中文' },
                    ]}
                    error={errors.language}
                    helperText={errors.language?.message || t('languageHelper')}
                    disabled={queryLoading || updateDetailsLoading}
                  />
                )}
              />

              <Button
                type="submit"
                variant="contained"
                loading={updateDetailsLoading}
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

export default function ProfileSettingsPage() {
  return (
    <ProtectedRoute>
      <ProfileSettingsPageContent />
    </ProtectedRoute>
  );
}
