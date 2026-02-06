'use client';

import {
  Container,
  Box,
  Typography,
  Button,
  Paper,
  Card,
  CardContent,
  CardActions,
  Grid,
} from '@mui/material';
import { useSnackbar } from 'notistack';
import { useTranslations } from 'next-intl';
import { useEffect, useState } from 'react';
import ProtectedRoute, { useAuthReady } from '@/components/auth/ProtectedRoute';
import { getAccessToken, parseJwt, logout } from '@/lib/auth';
import { useRouter } from '@/i18n/routing';
import { MainAppBar } from '@/components/layout';
import { AccessScope } from '@/types/auth';

function DashboardContent() {
  const router = useRouter();
  const { enqueueSnackbar } = useSnackbar();
  const t = useTranslations('pages.dashboard');
  const [isAdmin, setIsAdmin] = useState(false);
  const authReady = useAuthReady();

  useEffect(() => {
    if (!authReady) {
      return;
    }

    const token = getAccessToken();
    if (token) {
      const payload = parseJwt(token);
      const scopes = payload?.accessScopes as string[] | undefined;
      const hasAdminScope = scopes?.includes(AccessScope.ADMIN_SCOPE) || false;
      setIsAdmin(hasAdminScope);
    } else {
      setIsAdmin(false);
    }
  }, [authReady]);

  const handleLogout = async () => {
    await logout();
    enqueueSnackbar(t('loggedOut'), { variant: 'info' });
  };

  return (
    <>
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
        title={t('title')}
        titleLink="/dashboard"
        onLogout={handleLogout}
      />

      <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
        <Paper sx={{ p: 4 }}>
          <Typography variant="h4" gutterBottom>
            {t('welcome')}
          </Typography>
          <Typography variant="body1" color="text.secondary" paragraph>
            {t('description')}
          </Typography>

          {/* 僅管理員顯示管理功能卡片 */}
          {isAdmin && (
            <Grid container spacing={3} sx={{ mt: 2 }}>
              {/* Admin Audit Logs 卡片 */}
              <Grid size={{ xs: 12, md: 6 }}>
                <Card>
                  <CardContent>
                    <Typography variant="h6" gutterBottom>
                      📊 {t('cards.auditLogs.title')}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      {t('cards.auditLogs.description')}
                    </Typography>
                  </CardContent>
                  <CardActions>
                    <Button
                      size="small"
                      color="primary"
                      onClick={() => router.push('/admin/audit-logs')}
                    >
                      {t('cards.auditLogs.action')}
                    </Button>
                  </CardActions>
                </Card>
              </Grid>

              {/* Admin Sessions 卡片 */}
              <Grid size={{ xs: 12, md: 6 }}>
                <Card>
                  <CardContent>
                    <Typography variant="h6" gutterBottom>
                      🖥️ {t('cards.sessions.title')}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      {t('cards.sessions.description')}
                    </Typography>
                  </CardContent>
                  <CardActions>
                    <Button
                      size="small"
                      color="primary"
                      onClick={() => router.push('/admin/sessions')}
                    >
                      {t('cards.sessions.action')}
                    </Button>
                  </CardActions>
                </Card>
              </Grid>
            </Grid>
          )}

          <Box sx={{ mt: 4 }}>
            <Button variant="outlined" onClick={() => router.push('/')}>
              {t('backToHome')}
            </Button>
          </Box>
        </Paper>
      </Container>
    </>
  );
}

export default function DashboardPage() {
  return (
    <ProtectedRoute>
      <DashboardContent />
    </ProtectedRoute>
  );
}
