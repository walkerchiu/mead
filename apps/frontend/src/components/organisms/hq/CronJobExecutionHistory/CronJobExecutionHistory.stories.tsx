import type { Meta, StoryObj } from '@storybook/nextjs';
import { fn } from 'storybook/test';
import { Paper } from '@mui/material';
import { CronJobExecutionHistory } from './CronJobExecutionHistory';
import type { CronJobExecution } from '@/hooks/useCronJobs';
import type { PageInfo } from './CronJobExecutionHistory';

const mockCronJobExecutions: CronJobExecution[] = [
  {
    id: 'exec-001',
    jobName: 'session-cleanup',
    jobType: 'cleanup',
    startedAt: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString(),
    completedAt: new Date(Date.now() - 1000 * 60 * 60 * 2 + 1250).toISOString(),
    duration: 1250,
    status: 'SUCCESS',
    processedCount: 1542,
    successCount: 1542,
    errorCount: 0,
    instanceId: 'instance-a1b2c3',
    lockId: 'lock-x9y8z7',
    nextRunAt: new Date(Date.now() + 1000 * 60 * 60 * 22).toISOString(),
  },
  {
    id: 'exec-002',
    jobName: 'notification-sender',
    jobType: 'notification',
    startedAt: new Date(Date.now() - 1000 * 60 * 30).toISOString(),
    completedAt: new Date(Date.now() - 1000 * 60 * 30 + 3400).toISOString(),
    duration: 3400,
    status: 'FAILED',
    processedCount: 50,
    successCount: 32,
    errorCount: 18,
    errorMessage: 'SMTP connection timeout after 3s',
    errorStack:
      'Error: SMTP connection timeout after 3s\n  at SMTPTransport.send (/app/lib/smtp.js:124:15)\n  at NotificationJob.run (/app/jobs/notifications.js:88:22)',
    instanceId: 'instance-d4e5f6',
    nextRunAt: new Date(Date.now() + 1000 * 60 * 5).toISOString(),
  },
  {
    id: 'exec-003',
    jobName: 'audit-log-archive',
    jobType: 'archive',
    startedAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 7).toISOString(),
    completedAt: new Date(
      Date.now() - 1000 * 60 * 60 * 24 * 7 + 45200,
    ).toISOString(),
    duration: 45200,
    status: 'SUCCESS',
    processedCount: 89432,
    successCount: 89432,
    errorCount: 0,
    instanceId: 'instance-g7h8i9',
  },
];

const mockConfigs = [
  { jobName: 'session-cleanup', displayName: 'Session Cleanup' },
  { jobName: 'audit-log-archive', displayName: 'Audit Log Archive' },
  { jobName: 'notification-sender', displayName: 'Notification Sender' },
];

const mockPageInfo: PageInfo = {
  currentPage: 1,
  totalPages: 5,
  totalCount: 48,
  hasNextPage: true,
  hasPreviousPage: false,
};

const meta = {
  title: 'Organisms/HQ/CronJobExecutionHistory',
  component: CronJobExecutionHistory,
  parameters: {
    layout: 'fullscreen',
    docs: {
      description: {
        component:
          'Paginated table displaying cron job execution history with status indicators and detail modal access.',
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
} satisfies Meta<typeof CronJobExecutionHistory>;

export default meta;
type Story = StoryObj<typeof meta>;

/**
 * Default — execution history with pagination.
 */
export const Default: Story = {
  args: {
    executions: mockCronJobExecutions,
    configs: mockConfigs,
    loading: false,
    pageInfo: mockPageInfo,
    page: 1,
    onPageChange: fn(),
  },
};

/**
 * Loading state — skeleton rows while data is being fetched.
 */
export const Loading: Story = {
  args: {
    executions: [],
    configs: mockConfigs,
    loading: true,
    page: 1,
    onPageChange: fn(),
  },
};

/**
 * Empty — no executions found.
 */
export const Empty: Story = {
  args: {
    executions: [],
    configs: mockConfigs,
    loading: false,
    pageInfo: {
      currentPage: 1,
      totalPages: 0,
      totalCount: 0,
      hasNextPage: false,
      hasPreviousPage: false,
    },
    page: 1,
    onPageChange: fn(),
  },
};

/**
 * With failed executions — highlights problematic jobs.
 */
export const WithFailedExecutions: Story = {
  args: {
    executions: [
      mockCronJobExecutions[1],
      {
        ...mockCronJobExecutions[0],
        id: 'exec-005',
        status: 'TIMEOUT' as const,
        duration: 310000,
        errorMessage: 'Job exceeded timeout threshold of 300s',
      },
      {
        ...mockCronJobExecutions[2],
        id: 'exec-006',
        status: 'SKIPPED' as const,
        duration: undefined,
        completedAt: undefined,
      },
    ],
    configs: mockConfigs,
    loading: false,
    pageInfo: mockPageInfo,
    page: 1,
    onPageChange: fn(),
  },
};
