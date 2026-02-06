'use client';

import { useState } from 'react';
import {
  Box,
  Container,
  Typography,
  Button,
  Alert,
  Fab,
  Tooltip,
} from '@mui/material';
import { Refresh, DeleteSweep } from '@mui/icons-material';
import { useTranslations } from 'next-intl';
import { MainAppBar } from '@/components/layout';
import ProtectedRoute, { useAuthReady } from '@/components/auth/ProtectedRoute';
import { logout } from '@/lib/auth';
import { useSessions } from '@/hooks/useSessions';
import { SessionStats } from '@/components/admin/SessionStats';
import { SessionFilters } from '@/components/admin/SessionFilters';
import { SessionTable } from '@/components/admin/SessionTable';
import { BatchRevokeModal } from '@/components/admin/BatchRevokeModal';

function SessionsContent() {
  const t = useTranslations('pages.admin.sessions');
  const tc = useTranslations('common');
  const [filters, setFilters] = useState({});
  const authReady = useAuthReady();
  const [batchRevokeOpen, setBatchRevokeOpen] = useState(false);

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

  return (
    <>
      {/* 頂部導航欄 */}
      <MainAppBar title={t('title')} showBackButton onLogout={handleLogout} />

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
          <Box>
            <Typography variant="h4" gutterBottom>
              {t('title')}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              {t('description')}
            </Typography>
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
