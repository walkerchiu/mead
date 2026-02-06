'use client';

import { useState, useEffect } from 'react';
import {
  Container,
  Box,
  Typography,
  Card,
  CardContent,
  IconButton,
} from '@mui/material';
import { ArrowBack } from '@mui/icons-material';
import { useSnackbar } from 'notistack';
import { useTranslations } from 'next-intl';
import { useRouter } from '@/i18n/routing';
import ProtectedRoute, { useAuthReady } from '@/components/auth/ProtectedRoute';
import TwoFactorSettings from '@/components/auth/TwoFactorSettings';
import ChangePasswordForm from '@/components/settings/ChangePasswordForm';
import { MainAppBar } from '@/components/layout';
import { logout, getAccessToken, parseJwt } from '@/lib/auth';
import { useCurrentUser } from '@/hooks/useCurrentUser';

export default function SecuritySettingsPage() {
  const router = useRouter();
  const { enqueueSnackbar } = useSnackbar();
  const t = useTranslations('pages.settings.security');
  const td = useTranslations('pages.dashboard');
  const authReady = useAuthReady();
  const [userFromToken, setUserFromToken] = useState<{
    name: string;
    email: string;
  } | null>(null);

  // 取得當前使用者資訊
  const { user: currentUser } = useCurrentUser({ skip: !authReady });

  useEffect(() => {
    const token = getAccessToken();
    if (token) {
      const payload = parseJwt(token);
      // 從 token 取得基本使用者資訊作為 fallback
      if (payload?.email) {
        setUserFromToken({
          name: (payload.email as string).split('@')[0],
          email: payload.email as string,
        });
      }
    } else {
      setUserFromToken(null);
    }
  }, [authReady]);

  // 使用 GraphQL 查詢結果，如果失敗則使用 token 中的資訊
  const displayUser = currentUser || userFromToken;

  // Debug logging
  useEffect(() => {
    console.log('[SecuritySettings] authReady:', authReady);
    console.log('[SecuritySettings] currentUser:', currentUser);
    console.log('[SecuritySettings] userFromToken:', userFromToken);
    console.log('[SecuritySettings] displayUser:', displayUser);
  }, [authReady, currentUser, userFromToken, displayUser]);

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

        {/* Change Password Card */}
        <Card sx={{ mt: 3 }}>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              {t('changePassword')}
            </Typography>
            <ChangePasswordForm />
          </CardContent>
        </Card>

        {/* Two-Factor Authentication Card */}
        <Box sx={{ mt: 3 }}>
          <TwoFactorSettings />
        </Box>
      </Container>
    </ProtectedRoute>
  );
}
