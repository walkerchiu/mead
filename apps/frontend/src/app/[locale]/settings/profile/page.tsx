'use client';

import {
  Container,
  Box,
  Typography,
  Card,
  CardContent,
  CircularProgress,
} from '@mui/material';
import { useSnackbar } from 'notistack';
import { useTranslations } from 'next-intl';
import { useQuery, useMutation } from '@apollo/client/react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import ProtectedRoute from '@/components/auth/ProtectedRoute';
import ChangePasswordForm from '@/components/settings/ChangePasswordForm';
import { MainAppBar } from '@/components/layout';
import { logout } from '@/lib/auth';
import {
  ME_QUERY,
  UPDATE_MY_PROFILE_MUTATION,
  UPDATE_MY_PROFILE_DETAILS_MUTATION,
} from '@/lib/graphql';
import { getErrorMessage } from '@/lib/error-utils';
import { FormField, SelectField } from '@/components/molecules';
import { Button } from '@/components/atoms';

export default function ProfileSettingsPage() {
  const { enqueueSnackbar } = useSnackbar();
  const t = useTranslations('pages.settings.profile');
  const tc = useTranslations('common');
  const td = useTranslations('pages.dashboard');
  const tv = useTranslations('validation');

  type MeQueryData = {
    me?: {
      id: string;
      email: string;
      name?: string;
      profile?: {
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
  } = useQuery<MeQueryData>(ME_QUERY);
  const [updateProfile, { loading: updateProfileLoading }] = useMutation(
    UPDATE_MY_PROFILE_MUTATION,
  );
  const [updateProfileDetails, { loading: updateDetailsLoading }] = useMutation(
    UPDATE_MY_PROFILE_DETAILS_MUTATION,
  );

  const user = data?.me;

  // Basic Info Form Schema
  const basicInfoSchema = z.object({
    email: z.string().email(tv('email.invalid')),
    name: z
      .string()
      .max(100, tv('name.maxLength', { max: 100 }))
      .optional(),
  });

  type BasicInfoFormData = z.infer<typeof basicInfoSchema>;

  const {
    register: registerBasic,
    handleSubmit: handleSubmitBasic,
    formState: { errors: errorsBasic },
  } = useForm<BasicInfoFormData>({
    resolver: zodResolver(basicInfoSchema),
    values: {
      email: user?.email || '',
      name: user?.name || '',
    },
  });

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
    register: registerDetails,
    handleSubmit: handleSubmitDetails,
    control: controlDetails,
    formState: { errors: errorsDetails },
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

  const handleLogout = async () => {
    await logout();
    enqueueSnackbar(td('loggedOut'), { variant: 'info' });
  };

  const onSubmitBasicInfo = async (data: BasicInfoFormData) => {
    try {
      await updateProfile({
        variables: {
          input: {
            email: data.email,
            name: data.name || null,
          },
        },
      });

      enqueueSnackbar(t('updateProfileSuccess'), { variant: 'success' });
      refetch();
    } catch (error: unknown) {
      const errorMessage = getErrorMessage(error, t('updateError'));
      if (errorMessage) {
        enqueueSnackbar(errorMessage, { variant: 'error' });
      }
    }
  };

  const onSubmitProfileDetails = async (data: ProfileDetailsFormData) => {
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

      enqueueSnackbar(t('updateDetailsSuccess'), { variant: 'success' });
      refetch();
    } catch (error: unknown) {
      const errorMessage = getErrorMessage(error, t('updateError'));
      if (errorMessage) {
        enqueueSnackbar(errorMessage, { variant: 'error' });
      }
    }
  };

  if (queryLoading) {
    return (
      <ProtectedRoute>
        <Box
          display="flex"
          justifyContent="center"
          alignItems="center"
          minHeight="100vh"
        >
          <CircularProgress />
        </Box>
      </ProtectedRoute>
    );
  }

  return (
    <ProtectedRoute>
      <MainAppBar title={t('title')} showBackButton onLogout={handleLogout} />

      <Container maxWidth="md" sx={{ mt: 4, mb: 4 }}>
        <Typography variant="h4" gutterBottom>
          {t('title')}
        </Typography>
        <Typography variant="body2" color="text.secondary" paragraph>
          {t('description')}
        </Typography>

        {/* Basic Information Card */}
        <Card sx={{ mb: 3 }}>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              {t('basicInfo')}
            </Typography>
            <Box
              component="form"
              onSubmit={handleSubmitBasic(onSubmitBasicInfo)}
              noValidate
            >
              <FormField
                {...registerBasic('email')}
                margin="normal"
                required
                fullWidth
                label={t('email')}
                type="email"
                autoComplete="email"
                error={errorsBasic.email}
                helperText={errorsBasic.email?.message || t('emailHelper')}
                disabled={updateProfileLoading}
              />

              <FormField
                {...registerBasic('name')}
                margin="normal"
                fullWidth
                label={t('name')}
                autoComplete="name"
                error={errorsBasic.name}
                helperText={errorsBasic.name?.message || t('nameHelper')}
                disabled={updateProfileLoading}
              />

              <Button
                type="submit"
                variant="contained"
                loading={updateProfileLoading}
                sx={{ mt: 2 }}
              >
                {tc('save')}
              </Button>
            </Box>
          </CardContent>
        </Card>

        {/* Profile Details Card */}
        <Card sx={{ mb: 3 }}>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              {t('profileDetails')}
            </Typography>
            <Box
              component="form"
              onSubmit={handleSubmitDetails(onSubmitProfileDetails)}
              noValidate
            >
              <FormField
                {...registerDetails('bio')}
                margin="normal"
                fullWidth
                label={t('bio')}
                multiline
                rows={4}
                error={errorsDetails.bio}
                helperText={errorsDetails.bio?.message || t('bioHelper')}
                disabled={updateDetailsLoading}
              />

              <FormField
                {...registerDetails('phone')}
                margin="normal"
                fullWidth
                label={t('phone')}
                autoComplete="tel"
                error={errorsDetails.phone}
                helperText={errorsDetails.phone?.message || t('phoneHelper')}
                disabled={updateDetailsLoading}
              />

              <FormField
                {...registerDetails('address')}
                margin="normal"
                fullWidth
                label={t('address')}
                autoComplete="street-address"
                error={errorsDetails.address}
                helperText={
                  errorsDetails.address?.message || t('addressHelper')
                }
                disabled={updateDetailsLoading}
              />

              <FormField
                {...registerDetails('website')}
                margin="normal"
                fullWidth
                label={t('website')}
                type="url"
                autoComplete="url"
                error={errorsDetails.website}
                helperText={
                  errorsDetails.website?.message || t('websiteHelper')
                }
                disabled={updateDetailsLoading}
              />

              <Controller
                name="language"
                control={controlDetails}
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
                    error={errorsDetails.language}
                    helperText={
                      errorsDetails.language?.message || t('languageHelper')
                    }
                    disabled={updateDetailsLoading}
                  />
                )}
              />

              <Button
                type="submit"
                variant="contained"
                loading={updateDetailsLoading}
                sx={{ mt: 2 }}
              >
                {tc('save')}
              </Button>
            </Box>
          </CardContent>
        </Card>

        {/* Change Password Card */}
        <Card>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              {t('changePassword')}
            </Typography>
            <ChangePasswordForm />
          </CardContent>
        </Card>
      </Container>
    </ProtectedRoute>
  );
}
