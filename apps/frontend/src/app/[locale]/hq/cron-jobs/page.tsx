'use client';

import { useState } from 'react';
import dynamic from 'next/dynamic';
import { Container, Alert, Skeleton } from '@mui/material';
import { Button } from '@/components/atoms';
import {
  Refresh as RefreshIcon,
  Schedule as ScheduleIcon,
} from '@mui/icons-material';
import { useSnackbar } from 'notistack';
import { useTranslations } from 'next-intl';
import { AppShell } from '@/components/layout';
import { PageHeader } from '@/components/molecules';
import ProtectedRoute, { useAuthReady } from '@/components/auth/ProtectedRoute';
import { useCronJobs, useCronJobExecutions } from '@/hooks/useCronJobs';
import { useCronStatistics } from '@/hooks/useCronStatistics';
import { useCronJobSubscription } from '@/hooks/useCronJobSubscription';
import type { CronJobStatus } from '@/hooks/useCronJobs';

// Lazy load heavy components
const CronJobStats = dynamic(
  () => import('@/components/organisms/hq').then((mod) => mod.CronJobStats),
  {
    loading: () => <Skeleton variant="rectangular" height={200} />,
  },
);

const CronJobListFilters = dynamic(
  () =>
    import('@/components/organisms/hq').then((mod) => mod.CronJobListFilters),
  {
    loading: () => <Skeleton variant="rectangular" height={120} />,
  },
);

const CronJobTable = dynamic(
  () => import('@/components/organisms/hq').then((mod) => mod.CronJobTable),
  {
    loading: () => <Skeleton variant="rectangular" height={400} />,
  },
);

const CronJobFilters = dynamic(
  () => import('@/components/organisms/hq').then((mod) => mod.CronJobFilters),
  {
    loading: () => <Skeleton variant="rectangular" height={120} />,
  },
);

const CronJobExecutionHistory = dynamic(
  () =>
    import('@/components/organisms/hq').then(
      (mod) => mod.CronJobExecutionHistory,
    ),
  {
    loading: () => <Skeleton variant="rectangular" height={400} />,
  },
);

function CronJobsContent() {
  const t = useTranslations('pages.hq.cronJobs');
  const tc = useTranslations('common');
  const authReady = useAuthReady();

  // 分開管理兩個不同功能區域的篩選器
  const [listFilters, setListFilters] = useState<{
    category?: string;
    jobType?: string;
  }>({});

  const [executionFilters, setExecutionFilters] = useState<{
    jobName?: string;
    status?: CronJobStatus;
  }>({});

  // 使用全站統一的 notistack（帶進度條的 Toast）
  const { enqueueSnackbar } = useSnackbar();

  const {
    configs,
    loading,
    error,
    toggleJobEnabled,
    triggerJob,
    triggering,
    refetch,
  } = useCronJobs({ authReady });

  // 統計數據（使用執行歷史的篩選器）
  const { statistics, loading: statsLoading } = useCronStatistics({
    filters: executionFilters,
    authReady,
  });

  // 查詢執行歷史（使用執行歷史的篩選器）
  const {
    executions,
    loading: executionsLoading,
    pageInfo,
    page,
    setPage,
    refetch: refetchExecutions,
  } = useCronJobExecutions({
    filters: executionFilters,
    authReady,
  });

  // 訂閱新執行記錄（智能無感更新：第 1 頁直接插入新記錄，其他頁顯示通知）
  const { newExecutionsCount, clearNewExecutionsCount } =
    useCronJobSubscription({
      currentPage: page,
      filters: executionFilters,
      onNewExecution: () => {
        if (page === 1) {
          // ✅ 在第 1 頁，新記錄已自動插入到列表最上方
          console.log('[Cron Job] New execution auto-inserted at the top');
          clearNewExecutionsCount();
        } else {
          // ℹ️ 在其他頁面，只累計新記錄數量
          console.log('[Cron Job] New execution detected on page', page);
        }
      },
      onConfigUpdated: () => {
        // 配置更新時重新載入配置列表
        console.log('[Cron Job] Config updated, refreshing...');
        refetch();
      },
    });

  const handleRefresh = async () => {
    // 如果有新記錄且不在第 1 頁，先跳回第 1 頁
    if (newExecutionsCount > 0 && page !== 1) {
      console.log('[Cron Job] Jumping to page 1 to see new executions');
      setPage(1);
      clearNewExecutionsCount();
    } else {
      await refetch();
      await refetchExecutions();
      clearNewExecutionsCount();
    }
    enqueueSnackbar(tc('refreshed'), {
      variant: 'success',
      autoHideDuration: 2000,
    });
  };

  const handlePageChange = (newPage: number) => {
    setPage(newPage);
  };

  const handleTriggerJob = async (jobName: string, force: boolean) => {
    try {
      console.log('[CronJobs] Triggering job:', jobName);
      const result = await triggerJob(jobName, force);
      console.log('[CronJobs] Trigger result:', result);

      // 顯示成功提示（綠色，帶進度條）
      enqueueSnackbar(result?.message || `Job "${jobName}" 已成功觸發`, {
        variant: 'success',
      });

      // 1秒後重新整理執行歷史
      setTimeout(() => {
        refetchExecutions();
      }, 1000);
      return result;
    } catch (error) {
      console.error('[CronJobs] Failed to trigger job:', error);

      // 顯示錯誤提示（紅色，帶進度條）
      enqueueSnackbar(
        error instanceof Error ? error.message : '觸發 Job 失敗',
        {
          variant: 'error',
        },
      );

      throw error;
    }
  };

  // 前端篩選 Job 配置列表（使用 listFilters）
  const filteredConfigs = configs.filter((config) => {
    if (listFilters.category && config.category !== listFilters.category)
      return false;
    if (listFilters.jobType && config.jobType !== listFilters.jobType)
      return false;
    return true;
  });

  return (
    <AppShell>
      {/* 主要內容區 */}
      <Container maxWidth="xl" sx={{ mt: 4, mb: 4 }}>
        {/* 頁面標題 */}
        <PageHeader
          breadcrumbs={[
            { label: tc('breadcrumb.dashboard'), href: '/dashboard' },
            { label: tc('breadcrumb.hq') },
            { label: tc('breadcrumb.cronJobs') },
          ]}
          title={t('title')}
          description={t('description')}
          icon={
            <ScheduleIcon sx={{ fontSize: '2rem', color: 'primary.main' }} />
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

        {/* 新記錄通知（只在非第 1 頁顯示）*/}
        {newExecutionsCount > 0 && page !== 1 && (
          <Alert
            severity="info"
            sx={{ mb: 3, cursor: 'pointer' }}
            onClick={handleRefresh}
            action={
              <Button color="inherit" size="medium" onClick={handleRefresh}>
                {t('viewNewExecutions')}
              </Button>
            }
          >
            {t('newExecutionsAlert', { count: newExecutionsCount })}
          </Alert>
        )}

        {/* 錯誤提示 */}
        {error && (
          <Alert severity="error" sx={{ mb: 3 }}>
            {tc('error.loadFailed')}: {error.message}
          </Alert>
        )}

        {/* 統計卡片 */}
        <CronJobStats statistics={statistics} loading={statsLoading} />

        {/* Job 配置列表篩選器 */}
        <CronJobListFilters
          configs={configs}
          filters={listFilters}
          onChange={setListFilters}
          resultCount={filteredConfigs.length}
          defaultExpanded={true}
        />

        {/* Job 配置列表 */}
        <CronJobTable
          configs={filteredConfigs}
          loading={loading}
          onToggleEnabled={toggleJobEnabled}
          onTriggerJob={handleTriggerJob}
          triggering={triggering}
          onRefresh={refetch}
        />

        {/* 執行歷史篩選器 */}
        <CronJobFilters
          configs={configs}
          filters={executionFilters}
          onChange={setExecutionFilters}
          resultCount={pageInfo?.totalCount}
          defaultExpanded={true}
        />

        {/* 執行歷史 */}
        <CronJobExecutionHistory
          executions={executions}
          configs={configs}
          loading={executionsLoading}
          pageInfo={pageInfo}
          page={page}
          onPageChange={handlePageChange}
        />
      </Container>
    </AppShell>
  );
}

export default function CronJobsPage() {
  return (
    <ProtectedRoute requiredScopes={['HQ_SCOPE']}>
      <CronJobsContent />
    </ProtectedRoute>
  );
}
