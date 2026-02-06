'use client';

import { useState, useEffect } from 'react';
import {
  Container,
  Box,
  Typography,
  Card,
  CardContent,
  CircularProgress,
  IconButton,
} from '@mui/material';
import { ArrowBack } from '@mui/icons-material';
import { useSnackbar } from 'notistack';
import { useTranslations } from 'next-intl';
import { useRouter } from '@/i18n/routing';
import { useQuery, useMutation } from '@apollo/client/react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import ProtectedRoute, { useAuthReady } from '@/components/auth/ProtectedRoute';
import { MainAppBar } from '@/components/layout';
import { logout, getAccessToken, parseJwt } from '@/lib/auth';
import { ME_QUERY, UPDATE_MY_PROFILE_MUTATION } from '@/lib/graphql';
import { getErrorMessage } from '@/lib/error-utils';
import { FormField } from '@/components/molecules';
import { Button } from '@/components/atoms';
import { useCurrentUser } from '@/hooks/useCurrentUser';

export default function AccountSettingsPage() {
  const router = useRouter();
  const { enqueueSnackbar } = useSnackbar();
  const t = useTranslations('pages.settings.account');
  const tc = useTranslations('common');
  const td = useTranslations('pages.dashboard');
  const tv = useTranslations('validation');
  const authReady = useAuthReady();
  const [userFromToken, setUserFromToken] = useState<{
    name: string;
    email: string;
  } | null>(null);

  // 取得當前使用者資訊
  const { user: currentUser } = useCurrentUser({ skip: !authReady });

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
  } = useQuery<MeQueryData>(ME_QUERY);
  const [updateProfile, { loading: updateProfileLoading }] = useMutation(
    UPDATE_MY_PROFILE_MUTATION,
  );

  const user = data?.me;

  useEffect(() => {
    console.log('[AccountSettings] useEffect triggered, authReady:', authReady);

    const token = getAccessToken();
    if (token) {
      const payload = parseJwt(token);
      // 從 token 取得基本使用者資訊作為 fallback
      if (payload?.email) {
        const user = {
          name: (payload.email as string).split('@')[0],
          email: payload.email as string,
        };
        console.log('[AccountSettings] Setting userFromToken:', user);
        setUserFromToken(user);
      }
    } else {
      console.log(
        '[AccountSettings] No token found, setting userFromToken to null',
      );
      setUserFromToken(null);
    }
  }, [authReady]);

  // 使用 GraphQL 查詢結果，如果失敗則使用 token 中的資訊
  const displayUser = currentUser || userFromToken;

  // Debug logging
  useEffect(() => {
    console.log('[AccountSettings] authReady:', authReady);
    console.log('[AccountSettings] currentUser:', currentUser);
    console.log('[AccountSettings] userFromToken:', userFromToken);
    console.log('[AccountSettings] displayUser:', displayUser);
  }, [authReady, currentUser, userFromToken, displayUser]);

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

  const handleLogout = async () => {
    await logout();
    enqueueSnackbar(td('loggedOut'), { variant: 'info' });
  };

  const handleAccountClick = () => {
    router.push('/settings/account');
  };

  const handleProfileClick = () => {
    router.push('/settings/profile');
  };

  const handleSecurityClick = () => {
    router.push('/settings/security');
  };

  const handleHelpClick = () => {
    // TODO: Navigate to help page or open help dialog
    console.log('Help clicked');
  };

  const handleAboutClick = () => {
    // TODO: Navigate to about page or open about dialog
    console.log('About clicked');
  };

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
      <MainAppBar
        logo={
          <Box
            sx={{
              fontSize: '1.75rem',
              fontWeight: 'bold',
              color: 'white',
            }}
          >
            📊
          </Box>
        }
        title={td('title')}
        titleLink="/dashboard"
        user={
          displayUser
            ? {
                name: displayUser.name,
                email: displayUser.email,
                avatar: currentUser?.avatar,
                status: 'online',
              }
            : undefined
        }
        accountUrl="/settings/account"
        profileUrl="/settings/profile"
        securityUrl="/settings/security"
        onAccountClick={handleAccountClick}
        onProfileClick={handleProfileClick}
        onSecurityClick={handleSecurityClick}
        onLogout={handleLogout}
        onHelpClick={handleHelpClick}
        onAboutClick={handleAboutClick}
        userIconMode={true}
      />

      <Container maxWidth="md" sx={{ mt: 4, mb: 4 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
          <IconButton
            onClick={() => router.push('/dashboard')}
            sx={{ mr: 1 }}
            aria-label="back to dashboard"
          >
            <ArrowBack />
          </IconButton>
          <Box>
            <Typography variant="h4">{t('title')}</Typography>
          </Box>
        </Box>
        <Typography variant="body2" color="text.secondary" paragraph>
          {t('description')}
        </Typography>

        {/* Account Information Card */}
        <Card>
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
                disabled={updateProfileLoading}
              />

              <FormField
                {...register('name')}
                margin="normal"
                fullWidth
                label={t('name')}
                autoComplete="name"
                error={errors.name}
                helperText={errors.name?.message || t('nameHelper')}
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
      </Container>
    </ProtectedRoute>
  );
}
