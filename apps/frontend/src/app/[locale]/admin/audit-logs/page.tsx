'use client';

import { useState } from 'react';
import { Box, Container, Typography, Button, Alert } from '@mui/material';
import { Refresh } from '@mui/icons-material';
import { useTranslations } from 'next-intl';
import { MainAppBar } from '@/components/layout';
import { useAuditLogs } from '@/hooks/useAuditLogs';
import { useAuditLogSubscription } from '@/hooks/useAuditLogSubscription';
import { AuditLogStats } from '@/components/admin/AuditLogStats';
import { AuditLogFilters } from '@/components/admin/AuditLogFilters';
import { AuditLogTable } from '@/components/admin/AuditLogTable';
import ProtectedRoute, { useAuthReady } from '@/components/auth/ProtectedRoute';
import { logout } from '@/lib/auth';

function AuditLogsContent() {
  const t = useTranslations('pages.admin.auditLogs');
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
            variant={page === 1 ? 'outlined' : 'contained'}
            startIcon={<Refresh />}
            onClick={handleRefresh}
            disabled={loading}
            sx={
              page === 1
                ? {
                    opacity: 0.7,
                  }
                : {}
            }
          >
            {t('refresh')}
          </Button>
        </Box>

        {/* 新日誌通知（只在非第 1 頁顯示，因為第 1 頁會自動更新）*/}
        {newLogsCount > 0 && page !== 1 && (
          <Alert
            severity="info"
            sx={{ mb: 3, cursor: 'pointer' }}
            onClick={handleRefresh}
            action={
              <Button color="inherit" size="small" onClick={handleRefresh}>
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
        <AuditLogFilters filters={filters} onChange={setFilters} />

        {/* 日誌表格 */}
        <AuditLogTable
          logs={logs}
          loading={loading}
          pageInfo={pageInfo}
          page={page}
          onPageChange={setPage}
        />
      </Container>
    </>
  );
}

export default function AuditLogsPage() {
  return (
    <ProtectedRoute requiredPermission="ADMIN_SCOPE">
      <AuditLogsContent />
    </ProtectedRoute>
  );
}
