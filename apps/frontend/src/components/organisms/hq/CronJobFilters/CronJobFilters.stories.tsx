import type { Meta, StoryObj } from '@storybook/nextjs';
import { useState } from 'react';
import { Box, Paper, Typography } from '@mui/material';
import { CronJobFilters } from './CronJobFilters';
import type { CronJobConfig } from '@/hooks/useCronJobs';

const mockCronJobConfigs: CronJobConfig[] = [
  {
    jobName: 'session-cleanup',
    displayName: 'Session Cleanup',
    description: 'Removes expired sessions from the database',
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
    description: 'Archives old audit logs to cold storage',
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
    description: 'Sends pending email notifications',
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
  title: 'Organisms/HQ/CronJobFilters',
  component: CronJobFilters,
  parameters: {
    layout: 'padded',
    docs: {
      description: {
        component:
          'Filter panel for cron job execution history, supporting job name and status filters with active filter chips.',
      },
    },
  },
  tags: ['autodocs'],
} satisfies Meta<typeof CronJobFilters>;

export default meta;
type Story = StoryObj<typeof meta>;

/**
 * Default state — expanded with no active filters.
 */
export const Default: Story = {
  args: {
    configs: mockCronJobConfigs,
    filters: {},
    onChange: (filters) => console.log('Filters changed:', filters),
    resultCount: 150,
    defaultExpanded: true,
  },
};

/**
 * Collapsed state — filter panel collapsed by default.
 */
export const Collapsed: Story = {
  args: {
    configs: mockCronJobConfigs,
    filters: {},
    onChange: (filters) => console.log('Filters changed:', filters),
    resultCount: 150,
    defaultExpanded: false,
  },
};

/**
 * With job name filter applied.
 */
export const WithJobFilter: Story = {
  args: {
    configs: mockCronJobConfigs,
    filters: { jobName: 'session-cleanup' },
    onChange: (filters) => console.log('Filters changed:', filters),
    resultCount: 42,
    defaultExpanded: true,
  },
};

/**
 * With status filter — showing only failed executions.
 */
export const WithStatusFilter: Story = {
  args: {
    configs: mockCronJobConfigs,
    filters: { status: 'FAILED' },
    onChange: (filters) => console.log('Filters changed:', filters),
    resultCount: 18,
    defaultExpanded: true,
  },
};

/**
 * All filters applied — both job name and status set.
 */
export const AllFilters: Story = {
  args: {
    configs: mockCronJobConfigs,
    filters: { jobName: 'notification-sender', status: 'FAILED' },
    onChange: (filters) => console.log('Filters changed:', filters),
    resultCount: 12,
    defaultExpanded: true,
  },
};

/**
 * Interactive — fully interactive filter demonstration with live state.
 */
export const Interactive: Story = {
  render: function InteractiveExample() {
    const [filters, setFilters] = useState<{
      jobName?: string;
      status?: 'RUNNING' | 'SUCCESS' | 'FAILED' | 'TIMEOUT' | 'SKIPPED';
    }>({});

    const totalCount = 150;
    let filteredCount = totalCount;
    if (filters.jobName) filteredCount = Math.floor(filteredCount * 0.3);
    if (filters.status) filteredCount = Math.floor(filteredCount * 0.5);

    return (
      <Box>
        <Paper elevation={2} sx={{ p: 3, mb: 3 }}>
          <Typography variant="h5" gutterBottom>
            Execution Filters Demo
          </Typography>
          <CronJobFilters
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
