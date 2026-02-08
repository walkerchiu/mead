'use client';

import { Container, Box, Typography, Card, CardContent } from '@mui/material';
import { Security as SecurityIcon } from '@mui/icons-material';
import { useTranslations } from 'next-intl';
import ProtectedRoute from '@/components/auth/ProtectedRoute';
import { TwoFactorSettings, ChangePasswordForm } from '@/components/organisms';
import { AppShell } from '@/components/layout';
import { PageHeader } from '@/components/molecules';

function SecuritySettingsPageContent() {
  const t = useTranslations('pages.settings.security');
  const tc = useTranslations('common');

  return (
    <AppShell>
      <Container maxWidth="md" sx={{ mt: 4, mb: 4 }}>
        <PageHeader
          breadcrumbs={[
            { label: tc('breadcrumb.dashboard'), href: '/dashboard' },
            { label: tc('breadcrumb.security') },
          ]}
          title={t('title')}
          description={t('description')}
          icon={
            <SecurityIcon sx={{ fontSize: '2rem', color: 'primary.main' }} />
          }
        />

        {/* Change Password Card */}
        <Card elevation={2} sx={{ mt: 3 }}>
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
    </AppShell>
  );
}

export default function SecuritySettingsPage() {
  return (
    <ProtectedRoute>
      <SecuritySettingsPageContent />
    </ProtectedRoute>
  );
}
