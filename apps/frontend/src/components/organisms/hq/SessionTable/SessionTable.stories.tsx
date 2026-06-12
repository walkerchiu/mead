import type { Meta, StoryObj } from '@storybook/nextjs';
import { fn } from 'storybook/test';
import { SessionTable } from './SessionTable';
import { Paper } from '@mui/material';
import type { Session, PageInfo } from '@/hooks/useSessions';

const mockSessions: Session[] = [
  {
    id: '1',
    userId: 'user-1',
    userName: 'John Doe',
    userEmail: 'john@example.com',
    status: 'ACTIVE',
    ipAddress: '192.168.1.100',
    deviceInfo: 'Chrome 120 on Windows 10',
    userAgent:
      'Mozilla/5.0 (Windows NT 10.0; Win64; x64) Chrome/120.0.0.0 Safari/537.36',
    location: 'Taipei, Taiwan',
    browser: 'Chrome 120',
    os: 'Windows 10',
    lastUsedAt: new Date(Date.now() - 1000 * 60 * 5).toISOString(), // 5 minutes ago
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString(), // 2 hours ago
    expiresAt: new Date(Date.now() + 1000 * 60 * 60 * 24 * 7).toISOString(), // 7 days later
    isCurrent: true,
  },
  {
    id: '2',
    userId: 'user-1',
    userName: 'John Doe',
    userEmail: 'john@example.com',
    status: 'ACTIVE',
    ipAddress: '192.168.1.101',
    deviceInfo: 'Safari 17 on iOS 17',
    userAgent:
      'Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) Safari/604.1',
    location: 'Taipei, Taiwan',
    browser: 'Safari 17',
    os: 'iOS 17',
    lastUsedAt: new Date(Date.now() - 1000 * 60 * 30).toISOString(), // 30 minutes ago
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString(), // 1 day ago
    expiresAt: new Date(Date.now() + 1000 * 60 * 60 * 24 * 6).toISOString(),
  },
  {
    id: '3',
    userId: 'user-2',
    userName: 'Jane Smith',
    userEmail: 'jane@example.com',
    status: 'ACTIVE',
    ipAddress: '203.145.23.45',
    deviceInfo: 'Chrome 120 on macOS 10.15',
    userAgent:
      'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) Chrome/120.0.0.0',
    location: 'Tokyo, Japan',
    browser: 'Chrome 120',
    os: 'macOS 10.15',
    lastUsedAt: new Date(Date.now() - 1000 * 60 * 60).toISOString(), // 1 hour ago
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 5).toISOString(), // 5 hours ago
    expiresAt: new Date(Date.now() + 1000 * 60 * 60 * 24 * 7).toISOString(),
  },
  {
    id: '4',
    userId: 'user-2',
    userName: 'Jane Smith',
    userEmail: 'jane@example.com',
    status: 'REVOKED',
    ipAddress: '203.145.23.46',
    deviceInfo: 'Safari 17 on iPadOS 17',
    userAgent: 'Mozilla/5.0 (iPad; CPU OS 17_0 like Mac OS X) Safari/604.1',
    location: 'Tokyo, Japan',
    browser: 'Safari 17',
    os: 'iPadOS 17',
    lastUsedAt: new Date(Date.now() - 1000 * 60 * 60 * 3).toISOString(), // 3 hours ago
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 2).toISOString(), // 2 days ago
    revokedAt: new Date(Date.now() - 1000 * 60 * 60).toISOString(), // Revoked 1 hour ago
    revokedMethod: 'HQ_FORCE',
    revokedByName: 'HQ User',
    expiresAt: new Date(Date.now() + 1000 * 60 * 60 * 24 * 5).toISOString(),
  },
];

const mockPageInfo: PageInfo = {
  currentPage: 1,
  totalPages: 3,
  totalCount: 24,
  limit: 10,
  hasNextPage: true,
  hasPreviousPage: false,
};

const meta = {
  title: 'HQ Scope/Organisms/Sessions/Table',
  component: SessionTable,
  parameters: {
    layout: 'fullscreen',
    docs: {
      description: {
        component: 'HQ session 管理表格，具備分頁、篩選與撤銷功能。',
      },
    },
  },
  tags: ['autodocs'],
  decorators: [
    (Story) => (
      <Paper sx={{ p: 3, minHeight: 600 }}>
        <Story />
      </Paper>
    ),
  ],
} satisfies Meta<typeof SessionTable>;

export default meta;
type Story = StoryObj<typeof meta>;

/**
 * 預設狀態 - 含 session 資料的表格。
 */
export const Default: Story = {
  args: {
    sessions: mockSessions,
    loading: false,
    pageInfo: mockPageInfo,
    page: 1,
    onPageChange: fn(),
    onRefresh: fn(),
  },
};

/**
 * 載入中狀態。
 */
export const Loading: Story = {
  args: {
    sessions: [],
    loading: true,
    page: 1,
    onPageChange: fn(),
    onRefresh: fn(),
  },
};

/**
 * 空狀態 - 找不到 session。
 */
export const Empty: Story = {
  args: {
    sessions: [],
    loading: false,
    pageInfo: {
      currentPage: 1,
      totalPages: 0,
      totalCount: 0,
      limit: 10,
      hasNextPage: false,
      hasPreviousPage: false,
    },
    page: 1,
    onPageChange: fn(),
    onRefresh: fn(),
  },
};

/**
 * 單一 session - 僅一個啟用中的 session。
 */
export const SingleSession: Story = {
  args: {
    sessions: [mockSessions[0]],
    loading: false,
    pageInfo: {
      currentPage: 1,
      totalPages: 1,
      totalCount: 1,
      limit: 10,
      hasNextPage: false,
      hasPreviousPage: false,
    },
    page: 1,
    onPageChange: fn(),
    onRefresh: fn(),
  },
};

/**
 * 大量 session - 含分頁的完整表格。
 */
export const ManySessions: Story = {
  args: {
    sessions: Array.from({ length: 10 }, (_, i) => ({
      ...mockSessions[i % mockSessions.length],
      id: `session-${i + 1}`,
      lastUsedAt: new Date(
        Date.now() - 1000 * 60 * Math.random() * 60,
      ).toISOString(),
    })),
    loading: false,
    pageInfo: {
      currentPage: 2,
      totalPages: 10,
      totalCount: 95,
      limit: 10,
      hasNextPage: true,
      hasPreviousPage: true,
    },
    page: 2,
    onPageChange: fn(),
    onRefresh: fn(),
  },
};

/**
 * 含已撤銷 session - 啟用中與已撤銷 session 混合。
 */
export const WithRevokedSessions: Story = {
  args: {
    sessions: [
      mockSessions[0],
      mockSessions[1],
      mockSessions[3], // Revoked
      {
        ...mockSessions[2],
        revokedAt: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString(),
      },
    ],
    loading: false,
    pageInfo: mockPageInfo,
    page: 1,
    onPageChange: fn(),
    onRefresh: fn(),
  },
};

/**
 * 最後一頁 - 分頁的最末頁。
 */
export const LastPage: Story = {
  args: {
    sessions: [mockSessions[0], mockSessions[1]],
    loading: false,
    pageInfo: {
      currentPage: 5,
      totalPages: 5,
      totalCount: 42,
      limit: 10,
      hasNextPage: false,
      hasPreviousPage: true,
    },
    page: 5,
    onPageChange: fn(),
    onRefresh: fn(),
  },
};

/**
 * 欄位對齊示範 - 展示欄位對齊設定。
 *
 * 此 story 展示 session 表格中欄位的對齊方式：
 * - **靠左對齊**：User、Device、Revoked Method、Created At、Last Used At（文字內容與時間戳）
 * - **置中對齊**：Status、IP Address、Location（徽章與狀態指示器）
 * - **靠右對齊**：Actions（操作按鈕通常靠右對齊）
 *
 * 對齊方式透過元件欄位定義中的 `align` 屬性設定。
 */
export const ColumnAlignmentDemo: Story = {
  args: {
    sessions: mockSessions,
    loading: false,
    pageInfo: mockPageInfo,
    page: 1,
    onPageChange: fn(),
    onRefresh: fn(),
  },
  parameters: {
    docs: {
      description: {
        story:
          '示範欄位對齊：靠左（User、Device、Revoked Method、Timestamps）、置中（Status、IP、Location）、靠右（Actions）',
      },
    },
  },
};
