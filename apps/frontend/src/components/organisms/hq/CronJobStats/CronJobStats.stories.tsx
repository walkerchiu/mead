import type { Meta, StoryObj } from '@storybook/nextjs';
import { CronJobStats } from './CronJobStats';

const meta = {
  title: 'HQ Scope/Organisms/Cron Jobs/Stats',
  component: CronJobStats,
  parameters: {
    layout: 'padded',
    docs: {
      description: {
        component:
          'Statistics cards for cron job executions, showing totals, success rate, failure count, and average duration.',
      },
    },
  },
  tags: ['autodocs'],
} satisfies Meta<typeof CronJobStats>;

export default meta;
type Story = StoryObj<typeof meta>;

const mockStatistics = {
  totalExecutions: 3297,
  successfulExecutions: 3185,
  failedExecutions: 87,
  timeoutExecutions: 15,
  skippedExecutions: 10,
  successRate: 96.6,
  averageDuration: 4320,
  totalProcessed: 248900,
  totalErrors: 102,
  byJobName: [],
  byJobType: [],
  recentExecutions: [],
};

/**
 * Default state with realistic statistics data.
 */
export const Default: Story = {
  args: {
    statistics: mockStatistics,
    loading: false,
  },
};

/**
 * Loading state — shows skeleton cards while data is being fetched.
 */
export const Loading: Story = {
  args: {
    statistics: null,
    loading: true,
  },
};

/**
 * Empty stats — all values are zero (no executions recorded yet).
 */
export const EmptyStats: Story = {
  args: {
    statistics: {
      totalExecutions: 0,
      successfulExecutions: 0,
      failedExecutions: 0,
      timeoutExecutions: 0,
      skippedExecutions: 0,
      successRate: 0,
      averageDuration: 0,
      totalProcessed: 0,
      totalErrors: 0,
      byJobName: [],
      byJobType: [],
      recentExecutions: [],
    },
    loading: false,
  },
};

/**
 * High success rate — 99%+ success across many executions.
 */
export const HighSuccessRate: Story = {
  args: {
    statistics: {
      ...mockStatistics,
      totalExecutions: 10000,
      successfulExecutions: 9987,
      failedExecutions: 8,
      timeoutExecutions: 3,
      skippedExecutions: 2,
      successRate: 99.87,
      averageDuration: 1200,
    },
    loading: false,
  },
};

/**
 * High failure rate — many failures requiring attention.
 */
export const HighFailureRate: Story = {
  args: {
    statistics: {
      ...mockStatistics,
      totalExecutions: 500,
      successfulExecutions: 310,
      failedExecutions: 145,
      timeoutExecutions: 30,
      skippedExecutions: 15,
      successRate: 62.0,
      averageDuration: 8500,
      totalErrors: 175,
    },
    loading: false,
  },
};
