'use client';

import { useState } from 'react';
import dynamic from 'next/dynamic';
import { Container, Box, Alert, Skeleton } from '@mui/material';
import { Button } from '@/components/atoms';
import {
  Refresh as RefreshIcon,
  DeleteSweep,
  Computer as ComputerIcon,
} from '@mui/icons-material';
import { useTranslations } from 'next-intl';
import { useSnackbar } from 'notistack';
import { AppShell } from '@/components/layout';
import { PageHeader } from '@/components/molecules';
import ProtectedRoute, { useAuthReady } from '@/components/auth/ProtectedRoute';
import { useSessions } from '@/hooks/useSessions';

// Lazy load heavy components
const SessionStats = dynamic(
  () => import('@/components/organisms/hq').then((mod) => mod.SessionStats),
  {
    loading: () => <Skeleton variant="rectangular" height={200} />,
  },
);

const SessionFilters = dynamic(
  () => import('@/components/organisms/hq').then((mod) => mod.SessionFilters),
  {
    loading: () => <Skeleton variant="rectangular" height={120} />,
  },
);

const SessionTable = dynamic(
  () => import('@/components/organisms/hq').then((mod) => mod.SessionTable),
  {
    loading: () => <Skeleton variant="rectangular" height={400} />,
  },
);

const BatchRevokeModal = dynamic(
  () => import('@/components/organisms/hq').then((mod) => mod.BatchRevokeModal),
  {
    ssr: false, // Modal 不需要 SSR
  },
);

function SessionsContent() {
  const t = useTranslations('pages.hq.sessions');
  const tc = useTranslations('common');
  const { enqueueSnackbar } = useSnackbar();
  const [filters, setFilters] = useState({});
  const authReady = useAuthReady();
  const [batchRevokeOpen, setBatchRevokeOpen] = useState(false);

  const { sessions, loading, error, pageInfo, page, setPage, refetch } =
    useSessions({ filters, authReady });

  const handleRefresh = async () => {
    await refetch();
    enqueueSnackbar(tc('refreshed'), {
      variant: 'success',
      autoHideDuration: 2000,
    });
  };

  const handlePageChange = (newPage: number) => {
    setPage(newPage);
  };

  const handleBatchRevokeSuccess = (count: number) => {
    // Show toast based on revoked count
    if (count > 0) {
      enqueueSnackbar(t('batchRevokeSuccess', { count }), {
        variant: 'success',
        autoHideDuration: 3000,
      });
    } else {
      enqueueSnackbar(t('batchRevokeNoMatch'), {
        variant: 'info',
        autoHideDuration: 3000,
      });
    }
    refetch();
  };

  return (
    <AppShell>
      {/* 主要內容區 */}
      <Container maxWidth="xl" sx={{ mt: 4, mb: 4 }}>
        {/* 頁面標題 */}
        <PageHeader
          breadcrumbs={[
            { label: tc('breadcrumb.dashboard'), href: '/dashboard' },
            { label: tc('breadcrumb.hq') },
            { label: tc('breadcrumb.sessions') },
          ]}
          title={t('title')}
          description={t('description')}
          icon={
            <ComputerIcon sx={{ fontSize: '2rem', color: 'primary.main' }} />
          }
          actions={
            <Box
              sx={{
                display: 'flex',
                gap: { xs: 1, sm: 2 },
                flexWrap: { xs: 'wrap', sm: 'nowrap' },
                width: '100%',
              }}
            >
              <Button
                variant="contained"
                color="primary"
                startIcon={<RefreshIcon />}
                onClick={handleRefresh}
                disabled={loading}
              >
                {tc('refresh')}
              </Button>
              <Button
                variant="contained"
                color="error"
                startIcon={<DeleteSweep />}
                onClick={() => setBatchRevokeOpen(true)}
                sx={{
                  flex: { xs: '1 1 auto', sm: '0 0 auto' },
                  minWidth: { xs: 0, sm: 'auto' },
                  '& .MuiButton-startIcon': {
                    display: { xs: 'none', sm: 'inline-flex' },
                  },
                }}
              >
                {t('batchRevoke')}
              </Button>
            </Box>
          }
        />

        {/* 錯誤提示 */}
        {error && (
          <Alert severity="error" sx={{ mb: 3 }}>
            {tc('error.loadFailed')}: {error.message}
          </Alert>
        )}

        {/* 統計卡片 */}
        <SessionStats />

        {/* 篩選器 */}
        <SessionFilters
          filters={filters}
          onFiltersChange={setFilters}
          resultCount={pageInfo?.totalCount}
        />

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

      {/* Batch Revoke Modal */}
      <BatchRevokeModal
        open={batchRevokeOpen}
        onClose={() => setBatchRevokeOpen(false)}
        onSuccess={handleBatchRevokeSuccess}
      />
    </AppShell>
  );
}

export default function SessionsPage() {
  return (
    <ProtectedRoute requiredPermission="HQ_SCOPE">
      <SessionsContent />
    </ProtectedRoute>
  );
}
