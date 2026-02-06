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
import { useCurrentUser } from '@/hooks/useCurrentUser';

function DashboardContent() {
  const router = useRouter();
  const { enqueueSnackbar } = useSnackbar();
  const t = useTranslations('pages.dashboard');
  const [isAdmin, setIsAdmin] = useState(false);
  const [userFromToken, setUserFromToken] = useState<{
    name: string;
    email: string;
  } | null>(null);
  const authReady = useAuthReady();

  // 取得當前使用者資訊
  const {
    user: currentUser,
    loading: userLoading,
    error: userError,
  } = useCurrentUser({ skip: !authReady });

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

      // 從 token 取得基本使用者資訊作為 fallback
      if (payload?.email) {
        setUserFromToken({
          name: (payload.email as string).split('@')[0], // 使用 email 前綴作為名稱
          email: payload.email as string,
        });
      }
    } else {
      setIsAdmin(false);
      setUserFromToken(null);
    }
  }, [authReady]);

  // 調試：顯示使用者載入狀態
  useEffect(() => {
    console.log('[Dashboard] authReady:', authReady);
    console.log('[Dashboard] currentUser:', currentUser);
    console.log('[Dashboard] userFromToken:', userFromToken);
    console.log('[Dashboard] userLoading:', userLoading);
    console.log('[Dashboard] userError:', userError);
  }, [authReady, currentUser, userFromToken, userLoading, userError]);

  // 使用 GraphQL 查詢結果，如果失敗則使用 token 中的資訊
  const displayUser = currentUser || userFromToken;

  const handleLogout = async () => {
    await logout();
    enqueueSnackbar(t('loggedOut'), { variant: 'info' });
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
        user={
          displayUser
            ? {
                name: displayUser.name,
                email: displayUser.email,
                avatar: currentUser?.avatar, // 只有 GraphQL 查詢成功才有 avatar
                role: isAdmin ? 'Admin' : 'User',
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
