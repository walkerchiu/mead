import type { Meta, StoryObj } from '@storybook/nextjs';
import { useState } from 'react';
import { Box, Paper, Typography } from '@mui/material';
import { CronJobListFilters } from './CronJobListFilters';
import type { CronJobConfig } from '@/hooks/useCronJobs';

const mockCronJobConfigs: CronJobConfig[] = [
  {
    jobName: 'session-cleanup',
    displayName: 'Session Cleanup',
    description: '從資料庫移除過期的 session',
    jobType: 'cleanup',
    category: 'maintenance',
    cronExpression: '0 2 * * *',
    timeZone: 'Asia/Taipei',
    isEnabled: true,
    alertOnFailure: true,
    alertOnTimeout: true,
    failureThreshold: 3,
    timeoutThresholdMs: 300000,
    lastExecutedAt: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString(),
    lastStatus: 'SUCCESS',
    lastDuration: 1250,
    nextRunAt: new Date(Date.now() + 1000 * 60 * 60 * 22).toISOString(),
    consecutiveFailures: 0,
    totalExecutions: 365,
    totalFailures: 2,
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 365).toISOString(),
    updatedAt: new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString(),
  },
  {
    jobName: 'audit-log-archive',
    displayName: 'Audit Log Archive',
    description: '將舊的稽核日誌封存至冷儲存',
    jobType: 'archive',
    category: 'maintenance',
    cronExpression: '0 3 * * 0',
    timeZone: 'Asia/Taipei',
    isEnabled: true,
    alertOnFailure: true,
    alertOnTimeout: false,
    failureThreshold: 2,
    timeoutThresholdMs: 600000,
    lastExecutedAt: new Date(
      Date.now() - 1000 * 60 * 60 * 24 * 7,
    ).toISOString(),
    lastStatus: 'SUCCESS',
    lastDuration: 45200,
    nextRunAt: new Date(Date.now() + 1000 * 60 * 60 * 24 * 7).toISOString(),
    consecutiveFailures: 0,
    totalExecutions: 52,
    totalFailures: 1,
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 365).toISOString(),
    updatedAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 7).toISOString(),
  },
  {
    jobName: 'notification-sender',
    displayName: 'Notification Sender',
    description: '寄送待發送的 email 通知',
    jobType: 'notification',
    category: 'communication',
    cronExpression: '*/5 * * * *',
    timeZone: 'Asia/Taipei',
    isEnabled: false,
    alertOnFailure: true,
    alertOnTimeout: true,
    failureThreshold: 5,
    timeoutThresholdMs: 120000,
    lastExecutedAt: new Date(Date.now() - 1000 * 60 * 30).toISOString(),
    lastStatus: 'FAILED',
    lastDuration: 3400,
    lastErrorMessage: 'SMTP connection timeout',
    consecutiveFailures: 3,
    totalExecutions: 2880,
    totalFailures: 45,
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 180).toISOString(),
    updatedAt: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString(),
  },
];

const meta = {
  title: 'HQ Scope/Organisms/Cron Jobs/ListFilters',
  component: CronJobListFilters,
  parameters: {
    layout: 'padded',
    docs: {
      description: {
        component:
          'cron job 列表的篩選面板，支援分類與任務類型篩選，並含啟用中篩選標籤。',
      },
    },
  },
  tags: ['autodocs'],
} satisfies Meta<typeof CronJobListFilters>;

export default meta;
type Story = StoryObj<typeof meta>;

/**
 * 預設狀態 — 展開且無啟用中的篩選。
 */
export const Default: Story = {
  args: {
    configs: mockCronJobConfigs,
    filters: {},
    onChange: (filters) => console.log('Filters changed:', filters),
    resultCount: 3,
    defaultExpanded: true,
  },
};

/**
 * 收合狀態 — 篩選面板預設為收合。
 */
export const Collapsed: Story = {
  args: {
    configs: mockCronJobConfigs,
    filters: {},
    onChange: (filters) => console.log('Filters changed:', filters),
    resultCount: 3,
    defaultExpanded: false,
  },
};

/**
 * 含分類篩選 — 僅顯示維護類任務。
 */
export const WithCategoryFilter: Story = {
  args: {
    configs: mockCronJobConfigs,
    filters: { category: 'maintenance' },
    onChange: (filters) => console.log('Filters changed:', filters),
    resultCount: 2,
    defaultExpanded: true,
  },
};

/**
 * 含任務類型篩選 — 僅顯示清理類任務。
 */
export const WithTypeFilter: Story = {
  args: {
    configs: mockCronJobConfigs,
    filters: { jobType: 'cleanup' },
    onChange: (filters) => console.log('Filters changed:', filters),
    resultCount: 1,
    defaultExpanded: true,
  },
};

/**
 * 互動 — 含即時狀態、完全可互動的篩選展示。
 */
export const Interactive: Story = {
  render: function InteractiveExample() {
    const [filters, setFilters] = useState<{
      category?: string;
      jobType?: string;
    }>({});

    let filteredCount = mockCronJobConfigs.length;
    if (filters.category) {
      filteredCount = mockCronJobConfigs.filter(
        (c) => c.category === filters.category,
      ).length;
    }
    if (filters.jobType) {
      filteredCount = mockCronJobConfigs.filter(
        (c) => c.jobType === filters.jobType,
      ).length;
    }

    return (
      <Box>
        <Paper elevation={2} sx={{ p: 3, mb: 3 }}>
          <Typography variant="h5" gutterBottom>
            Job List Filters Demo
          </Typography>
          <CronJobListFilters
            configs={mockCronJobConfigs}
            filters={filters}
            onChange={setFilters}
            defaultExpanded={true}
            resultCount={filteredCount}
          />
        </Paper>
        <Paper elevation={1} sx={{ p: 3 }}>
          <Typography variant="h6" gutterBottom>
            Current Filters
          </Typography>
          <Box
            component="pre"
            sx={{
              p: 2,
              bgcolor: 'grey.100',
              borderRadius: 1,
              fontSize: '0.875rem',
            }}
          >
            {JSON.stringify(filters, null, 2)}
          </Box>
        </Paper>
      </Box>
    );
  },
};
