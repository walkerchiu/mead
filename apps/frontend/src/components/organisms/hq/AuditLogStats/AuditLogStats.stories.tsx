import type { Meta, StoryObj } from '@storybook/nextjs';
import { MockedProvider } from '@apollo/client/testing/react';
import { AUDIT_LOG_STATISTICS_QUERY } from '@/lib/audit-logs-queries';
import { AuditLogStats } from './AuditLogStats';

const mockStats = {
  auditLogStatistics: {
    total: 15420,
    successRate: 94.3,
    successCount: 14541,
    failureCount: 879,
    byAction: [
      { action: 'LOGIN', count: 8520 },
      { action: 'UPDATE', count: 3240 },
      { action: 'CREATE', count: 2180 },
      { action: 'DELETE', count: 841 },
      { action: 'LOGOUT', count: 639 },
    ],
  },
};

const defaultMock = {
  request: {
    query: AUDIT_LOG_STATISTICS_QUERY,
  },
  result: {
    data: mockStats,
  },
};

const noDataMock = {
  request: {
    query: AUDIT_LOG_STATISTICS_QUERY,
  },
  result: {
    data: {
      auditLogStatistics: {
        total: 0,
        successRate: 0,
        successCount: 0,
        failureCount: 0,
        byAction: [],
      },
    },
  },
};

const meta = {
  title: 'HQ Scope/Organisms/Audit Logs/Stats',
  component: AuditLogStats,
  parameters: {
    layout: 'padded',
    docs: {
      description: {
        component:
          '稽核日誌統計卡片，顯示總數、成功率、失敗數與熱門操作 — 透過 Apollo 取得。',
      },
    },
  },
  tags: ['autodocs'],
} satisfies Meta<typeof AuditLogStats>;

export default meta;
type Story = StoryObj<typeof meta>;

/**
 * 預設 — 已載入真實資料的統計。
 */
export const Default: Story = {
  decorators: [
    (Story) => (
      <MockedProvider mocks={[defaultMock]} addTypename={false}>
        <Story />
      </MockedProvider>
    ),
  ],
};

/**
 * 載入中 — 空的 mock 讓元件維持在載入骨架狀態。
 */
export const Loading: Story = {
  decorators: [
    (Story) => (
      <MockedProvider mocks={[]} addTypename={false}>
        <Story />
      </MockedProvider>
    ),
  ],
};

/**
 * 無資料 — 所有計數皆為零（全新安裝或空資料庫）。
 */
export const NoData: Story = {
  decorators: [
    (Story) => (
      <MockedProvider mocks={[noDataMock]} addTypename={false}>
        <Story />
      </MockedProvider>
    ),
  ],
};
