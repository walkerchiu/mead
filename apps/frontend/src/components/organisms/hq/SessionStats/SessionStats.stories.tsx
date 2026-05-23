import type { Meta, StoryObj } from '@storybook/nextjs';
import { MockedProvider } from '@apollo/client/testing/react';
import { SESSION_STATISTICS_QUERY } from '@/lib/session-management-queries';
import { SessionStats } from './SessionStats';

const mockStats = {
  sessionStatistics: {
    totalSessions: 4820,
    activeSessions: 1243,
    totalRevoked: 892,
    totalExpired: 2685,
    todayLogins: 147,
    todayRevocations: 12,
    byScope: [
      { scope: 'WEB', count: 3100, activeCount: 820 },
      { scope: 'MOBILE', count: 1720, activeCount: 423 },
    ],
    topActiveUsers: [
      {
        userId: 'user-001',
        userName: 'John Doe',
        userEmail: 'john@example.com',
        sessionCount: 5,
        lastActivity: new Date(Date.now() - 1000 * 60 * 5),
      },
    ],
    topDevices: [
      { deviceInfo: 'Chrome 120 on Windows 10', count: 1850 },
      { deviceInfo: 'Safari 17 on iOS 17', count: 920 },
    ],
    recentActivities: [],
  },
};

const defaultMock = {
  request: {
    query: SESSION_STATISTICS_QUERY,
  },
  result: {
    data: mockStats,
  },
};

const meta = {
  title: 'HQ Scope/Organisms/Sessions/Stats',
  component: SessionStats,
  parameters: {
    layout: 'padded',
    docs: {
      description: {
        component:
          'Statistics cards for session management, showing active, revoked, expired counts and top device — fetched via Apollo.',
      },
    },
  },
  tags: ['autodocs'],
} satisfies Meta<typeof SessionStats>;

export default meta;
type Story = StoryObj<typeof meta>;

/**
 * Default — statistics loaded with realistic session data.
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
