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
  title: 'Organisms/HQ/AuditLogStats',
  component: AuditLogStats,
  parameters: {
    layout: 'padded',
    docs: {
      description: {
        component:
          'Statistics cards for audit logs, showing total count, success rate, failure count, and top action — fetched via Apollo.',
      },
    },
  },
  tags: ['autodocs'],
} satisfies Meta<typeof AuditLogStats>;

export default meta;
type Story = StoryObj<typeof meta>;

/**
 * Default — statistics loaded with realistic data.
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
 * Loading — empty mocks keep the component in its loading skeleton state.
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
 * No data — all counts are zero (fresh installation or empty database).
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
