'use client';

import { useState, useEffect } from 'react';
import {
  Box,
  Container,
  Typography,
  Button,
  Alert,
  Fab,
  Tooltip,
  IconButton,
} from '@mui/material';
import { Refresh, DeleteSweep, ArrowBack } from '@mui/icons-material';
import { useTranslations } from 'next-intl';
import { useRouter } from '@/i18n/routing';
import { MainAppBar } from '@/components/layout';
import ProtectedRoute, { useAuthReady } from '@/components/auth/ProtectedRoute';
import { logout, getAccessToken, parseJwt } from '@/lib/auth';
import { useSessions } from '@/hooks/useSessions';
import { SessionStats } from '@/components/admin/SessionStats';
import { SessionFilters } from '@/components/admin/SessionFilters';
import { SessionTable } from '@/components/admin/SessionTable';
import { BatchRevokeModal } from '@/components/admin/BatchRevokeModal';
import { useCurrentUser } from '@/hooks/useCurrentUser';

function SessionsContent() {
  const router = useRouter();
  const t = useTranslations('pages.admin.sessions');
  const tc = useTranslations('common');
  const [filters, setFilters] = useState({});
  const authReady = useAuthReady();
  const [batchRevokeOpen, setBatchRevokeOpen] = useState(false);
  const [userFromToken, setUserFromToken] = useState<{
    name: string;
    email: string;
  } | null>(null);

  // 取得當前使用者資訊
  const { user: currentUser } = useCurrentUser({ skip: !authReady });

  useEffect(() => {
    if (!authReady) {
      return;
    }

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

  const { sessions, loading, error, pageInfo, page, setPage, refetch } =
    useSessions({ filters, authReady });

  const handleRefresh = async () => {
    await refetch();
  };

  const handlePageChange = (newPage: number) => {
    setPage(newPage);
  };

  const handleBatchRevokeSuccess = (_count: number) => {
    // Show success message
    refetch();
  };

  const handleLogout = async () => {
    await logout();
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
      {/* 頂部導航欄 */}
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
        title={'Wind Dashboard'}
        titleLink="/dashboard"
        user={
          displayUser
            ? {
                name: displayUser.name,
                email: displayUser.email,
                avatar: currentUser?.avatar,
                role: 'Admin',
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

      {/* 主要內容區 */}
      <Container maxWidth="xl" sx={{ mt: 4, mb: 4 }}>
        {/* 頁面標題與重新整理按鈕 */}
        <Box
          sx={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            mb: 3,
          }}
        >
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <IconButton
              onClick={() => router.push('/dashboard')}
              sx={{ mr: 1 }}
              aria-label="back to dashboard"
            >
              <ArrowBack />
            </IconButton>
            <Box>
              <Typography variant="h4" gutterBottom>
                {t('title')}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {t('description')}
              </Typography>
            </Box>
          </Box>

          <Button
            variant="outlined"
            startIcon={<Refresh />}
            onClick={handleRefresh}
            disabled={loading}
          >
            {tc('refresh')}
          </Button>
        </Box>

        {/* 錯誤提示 */}
        {error && (
          <Alert severity="error" sx={{ mb: 3 }}>
            {tc('error.loadFailed')}: {error.message}
          </Alert>
        )}

        {/* 統計卡片 */}
        <SessionStats />

        {/* 篩選器 */}
        <SessionFilters filters={filters} onFiltersChange={setFilters} />

        {/* 會話列表 */}
        <SessionTable
          sessions={sessions}
          loading={loading}
          pageInfo={pageInfo}
          page={page}
          onPageChange={handlePageChange}
          onRefresh={refetch}
        />
      </Container>

      {/* Floating Action Button for Batch Revoke */}
      <Tooltip title={t('batchRevoke')} placement="left">
        <Fab
          color="error"
          aria-label="batch revoke"
          sx={{
            position: 'fixed',
            bottom: 24,
            right: 24,
          }}
          onClick={() => setBatchRevokeOpen(true)}
        >
          <DeleteSweep />
        </Fab>
      </Tooltip>

      {/* Batch Revoke Modal */}
      <BatchRevokeModal
        open={batchRevokeOpen}
        onClose={() => setBatchRevokeOpen(false)}
        onSuccess={handleBatchRevokeSuccess}
      />
    </>
  );
}

export default function SessionsPage() {
  return (
    <ProtectedRoute requiredPermission="ADMIN_SCOPE">
      <SessionsContent />
    </ProtectedRoute>
  );
}
