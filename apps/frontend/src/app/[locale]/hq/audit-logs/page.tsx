'use client';

import { useState } from 'react';
import dynamic from 'next/dynamic';
import { Container, Alert, Skeleton } from '@mui/material';
import { Button } from '@/components/atoms';
import {
  Refresh as RefreshIcon,
  Assessment as AssessmentIcon,
} from '@mui/icons-material';
import { useTranslations } from 'next-intl';
import { useSnackbar } from 'notistack';
import { AppShell } from '@/components/layout';
import { PageHeader } from '@/components/molecules';
import { useAuditLogs } from '@/hooks/useAuditLogs';
import { useAuditLogSubscription } from '@/hooks/useAuditLogSubscription';
import ProtectedRoute, { useAuthReady } from '@/components/auth/ProtectedRoute';

// Lazy load heavy components
const AuditLogStats = dynamic(
  () => import('@/components/organisms/hq').then((mod) => mod.AuditLogStats),
  {
    loading: () => <Skeleton variant="rectangular" height={200} />,
  },
);

const AuditLogFilters = dynamic(
  () => import('@/components/organisms/hq').then((mod) => mod.AuditLogFilters),
  {
    loading: () => <Skeleton variant="rectangular" height={120} />,
  },
);

const AuditLogTable = dynamic(
  () => import('@/components/organisms/hq').then((mod) => mod.AuditLogTable),
  {
    loading: () => <Skeleton variant="rectangular" height={400} />,
  },
);

function AuditLogsContent() {
  const t = useTranslations('pages.hq.auditLogs');
  const tc = useTranslations('common');
  const { enqueueSnackbar } = useSnackbar();
  const [filters, setFilters] = useState({});
  const authReady = useAuthReady();

  const { logs, loading, error, pageInfo, page, setPage, refetch } =
    useAuditLogs({ filters, authReady });

  // 訂閱新日誌（智能無感更新：第 1 頁直接插入新日誌，其他頁顯示通知）
  const { newLogsCount, clearNewLogsCount } = useAuditLogSubscription({
    currentPage: page,
    filters,
    onNewLog: () => {
      if (page === 1) {
        // ✅ 在第 1 頁，新日誌已自動插入到列表最上方（無感更新）
        console.log('[Audit Log] New log auto-inserted at the top');
        // 清除新日誌計數
        clearNewLogsCount();
      } else {
        // ℹ️ 在其他頁面，只累計新日誌數量（顯示通知）
        console.log('[Audit Log] New log detected on page', page);
      }
    },
  });

  const handleRefresh = async () => {
    // 如果有新日誌且不在第 1 頁，先跳回第 1 頁（useQuery 會自動 refetch）
    if (newLogsCount > 0 && page !== 1) {
      console.log('[Audit Log] Jumping to page 1 to see new logs');
      setPage(1);
      clearNewLogsCount();
    } else {
      // 如果已經在第 1 頁或沒有新日誌，手動 refetch
      await refetch();
      clearNewLogsCount();
    }
    enqueueSnackbar(tc('refreshed'), {
      variant: 'success',
      autoHideDuration: 2000,
    });
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
            { label: tc('breadcrumb.auditLogs') },
          ]}
          title={t('title')}
          description={t('description')}
          icon={
            <AssessmentIcon sx={{ fontSize: '2rem', color: 'primary.main' }} />
          }
          actions={
            <Button
              variant="contained"
              color="primary"
              startIcon={<RefreshIcon />}
              onClick={handleRefresh}
              disabled={loading}
            >
              {t('refresh')}
            </Button>
          }
        />

        {/* 新日誌通知（只在非第 1 頁顯示,因為第 1 頁會自動更新）*/}
        {newLogsCount > 0 && page !== 1 && (
          <Alert
            severity="info"
            sx={{ mb: 3, cursor: 'pointer' }}
            onClick={handleRefresh}
            action={
              <Button color="inherit" size="medium" onClick={handleRefresh}>
                {t('viewNew')}
              </Button>
            }
          >
            {t('newLogsOnOtherPage', { count: newLogsCount })}
          </Alert>
        )}

        {/* 錯誤訊息 */}
        {error && (
          <Alert severity="error" sx={{ mb: 3 }}>
            {t('loadError')}: {error.message}
          </Alert>
        )}

        {/* 統計卡片 */}
        <AuditLogStats />

        {/* 篩選器 */}
        <AuditLogFilters
          filters={filters}
          onChange={setFilters}
          resultCount={pageInfo?.totalCount}
        />

        {/* 日誌表格 */}
        <AuditLogTable
          logs={logs}
          loading={loading}
          pageInfo={pageInfo}
          page={page}
          onPageChange={setPage}
        />
      </Container>
    </AppShell>
  );
}

export default function AuditLogsPage() {
  return (
    <ProtectedRoute requiredScopes={['HQ_SCOPE']}>
      <AuditLogsContent />
    </ProtectedRoute>
  );
}
