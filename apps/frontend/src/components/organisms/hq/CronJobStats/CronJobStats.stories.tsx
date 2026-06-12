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
          'cron job 執行統計卡片，顯示總數、成功率、失敗數與平均耗時。',
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
 * 含真實統計資料的預設狀態。
 */
export const Default: Story = {
  args: {
    statistics: mockStatistics,
    loading: false,
  },
};

/**
 * 載入中狀態 — 在取得資料期間顯示骨架卡片。
 */
export const Loading: Story = {
  args: {
    statistics: null,
    loading: true,
  },
};

/**
 * 空統計 — 所有數值皆為零（尚無執行紀錄）。
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
 * 高成功率 — 大量執行中成功率達 99% 以上。
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
 * 高失敗率 — 大量失敗需要注意。
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
