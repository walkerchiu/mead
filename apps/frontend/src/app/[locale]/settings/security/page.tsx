'use client';

import { Container, Box, Typography } from '@mui/material';
import { useSnackbar } from 'notistack';
import { useTranslations } from 'next-intl';
import ProtectedRoute from '@/components/auth/ProtectedRoute';
import TwoFactorSettings from '@/components/auth/TwoFactorSettings';
import { MainAppBar } from '@/components/layout';
import { logout } from '@/lib/auth';

export default function SecuritySettingsPage() {
  const { enqueueSnackbar } = useSnackbar();
  const t = useTranslations('pages.settings.security');
  const td = useTranslations('pages.dashboard');

  const handleLogout = async () => {
    await logout();
    enqueueSnackbar(td('loggedOut'), { variant: 'info' });
  };

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

        <Box sx={{ mt: 3 }}>
          <TwoFactorSettings />
        </Box>
      </Container>
    </ProtectedRoute>
  );
}
