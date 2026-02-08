import type { Meta, StoryObj } from '@storybook/nextjs';
import { fn } from 'storybook/test';
import { Paper } from '@mui/material';
import { CronJobTable } from './CronJobTable';
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
  title: 'Organisms/HQ/CronJobTable',
  component: CronJobTable,
  parameters: {
    layout: 'fullscreen',
    docs: {
      description: {
        component:
          'Table displaying cron job configurations with enable/disable toggles, manual trigger, and detail view capabilities.',
      },
    },
  },
  tags: ['autodocs'],
  decorators: [
    (Story) => (
      <Paper sx={{ p: 3, minHeight: 400 }}>
        <Story />
      </Paper>
    ),
  ],
} satisfies Meta<typeof CronJobTable>;

export default meta;
type Story = StoryObj<typeof meta>;

/**
 * Default — table with all mock cron job configs.
 */
export const Default: Story = {
  args: {
    configs: mockCronJobConfigs,
    loading: false,
    onToggleEnabled: fn().mockResolvedValue(undefined),
    onTriggerJob: fn().mockResolvedValue({ success: true }),
    triggering: false,
    onRefresh: fn(),
  },
};

/**
 * Loading state — skeleton rows while configs are being fetched.
 */
export const Loading: Story = {
  args: {
    configs: [],
    loading: true,
    onToggleEnabled: fn().mockResolvedValue(undefined),
    onTriggerJob: fn().mockResolvedValue({ success: true }),
    onRefresh: fn(),
  },
};

/**
 * Empty configs — no cron jobs configured.
 */
export const EmptyConfigs: Story = {
  args: {
    configs: [],
    loading: false,
    onToggleEnabled: fn().mockResolvedValue(undefined),
    onTriggerJob: fn().mockResolvedValue({ success: true }),
    onRefresh: fn(),
  },
};

/**
 * With disabled jobs — some jobs are disabled with failure history.
 */
export const WithDisabledJobs: Story = {
  args: {
    configs: [
      mockCronJobConfigs[0],
      {
        ...mockCronJobConfigs[1],
        isEnabled: false,
        lastStatus: 'TIMEOUT',
        consecutiveFailures: 2,
      },
      mockCronJobConfigs[2],
    ],
    loading: false,
    onToggleEnabled: fn().mockResolvedValue(undefined),
    onTriggerJob: fn().mockResolvedValue({ success: true }),
    onRefresh: fn(),
  },
};
