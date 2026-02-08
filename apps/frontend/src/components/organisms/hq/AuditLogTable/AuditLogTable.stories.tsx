import type { Meta, StoryObj } from '@storybook/nextjs';
import { fn } from 'storybook/test';
import { AuditLogTable } from './AuditLogTable';
import { Paper } from '@mui/material';

interface AuditLog {
  id: string;
  requestId: string;
  timestamp: string;
  userId: string;
  userName?: string;
  userEmail?: string;
  action: string;
  entity: string;
  entityId?: string;
  status: string;
  method?: string;
  path?: string;
  ipAddress?: string;
  duration?: number;
}

interface PageInfo {
  currentPage: number;
  totalPages: number;
  totalCount: number;
  limit: number;
  hasNextPage: boolean;
  hasPreviousPage: boolean;
}

const mockAuditLogs: AuditLog[] = [
  {
    id: '1',
    requestId: 'req-001',
    timestamp: new Date(Date.now() - 1000 * 60 * 5).toISOString(), // 5 minutes ago
    userId: 'user-1',
    userName: 'John Doe',
    userEmail: 'john@example.com',
    action: 'LOGIN',
    entity: 'User',
    entityId: 'user-1',
    status: 'SUCCESS',
    method: 'POST',
    path: '/api/auth/login',
    ipAddress: '192.168.1.100',
    duration: 245,
  },
  {
    id: '2',
    requestId: 'req-002',
    timestamp: new Date(Date.now() - 1000 * 60 * 10).toISOString(), // 10 minutes ago
    userId: 'user-2',
    userName: 'Jane Smith',
    userEmail: 'jane@example.com',
    action: 'UPDATE',
    entity: 'Profile',
    entityId: 'profile-2',
    status: 'SUCCESS',
    method: 'PUT',
    path: '/api/users/profile',
    ipAddress: '203.145.23.45',
    duration: 187,
  },
  {
    id: '3',
    requestId: 'req-003',
    timestamp: new Date(Date.now() - 1000 * 60 * 15).toISOString(), // 15 minutes ago
    userId: 'user-1',
    userName: 'John Doe',
    userEmail: 'john@example.com',
    action: 'DELETE',
    entity: 'Session',
    entityId: 'session-123',
    status: 'SUCCESS',
    method: 'DELETE',
    path: '/api/sessions/session-123',
    ipAddress: '192.168.1.100',
    duration: 98,
  },
  {
    id: '4',
    requestId: 'req-004',
    timestamp: new Date(Date.now() - 1000 * 60 * 20).toISOString(), // 20 minutes ago
    userId: 'user-3',
    userName: 'Bob Wilson',
    userEmail: 'bob@example.com',
    action: 'LOGIN',
    entity: 'User',
    entityId: 'user-3',
    status: 'FAILURE',
    method: 'POST',
    path: '/api/auth/login',
    ipAddress: '45.67.89.123',
    duration: 312,
  },
  {
    id: '5',
    requestId: 'req-005',
    timestamp: new Date(Date.now() - 1000 * 60 * 30).toISOString(), // 30 minutes ago
    userId: 'hq-1',
    userName: 'HQ User',
    userEmail: 'hq@example.com',
    action: 'CREATE',
    entity: 'Role',
    entityId: 'role-456',
    status: 'SUCCESS',
    method: 'POST',
    path: '/api/roles',
    ipAddress: '192.168.1.1',
    duration: 156,
  },
];

const mockPageInfo: PageInfo = {
  currentPage: 1,
  totalPages: 5,
  totalCount: 48,
  limit: 10,
  hasNextPage: true,
  hasPreviousPage: false,
};

const meta = {
  title: 'Organisms/HQ/AuditLogTable',
  component: AuditLogTable,
  parameters: {
    layout: 'fullscreen',
    docs: {
      description: {
        component:
          'HQ audit log table displaying system activity with details modal and pagination.',
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
} satisfies Meta<typeof AuditLogTable>;

export default meta;
type Story = StoryObj<typeof meta>;

/**
 * Default state - Table with audit logs.
 */
export const Default: Story = {
  args: {
    logs: mockAuditLogs,
    loading: false,
    pageInfo: mockPageInfo,
    page: 1,
    onPageChange: fn(),
  },
};

/**
 * Loading state.
 */
export const Loading: Story = {
  args: {
    logs: [],
    loading: true,
    page: 1,
    onPageChange: fn(),
  },
};

/**
 * Empty state - No audit logs found.
 */
export const Empty: Story = {
  args: {
    logs: [],
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
  },
};

/**
 * Success logs only - All successful operations.
 */
export const SuccessOnly: Story = {
  args: {
    logs: mockAuditLogs.filter((log) => log.status === 'SUCCESS'),
    loading: false,
    pageInfo: {
      currentPage: 1,
      totalPages: 2,
      totalCount: 15,
      limit: 10,
      hasNextPage: true,
      hasPreviousPage: false,
    },
    page: 1,
    onPageChange: fn(),
  },
};

/**
 * With failures - Mix of success and failure statuses.
 */
export const WithFailures: Story = {
  args: {
    logs: [
      mockAuditLogs[0],
      mockAuditLogs[3], // FAILURE
      {
        ...mockAuditLogs[1],
        status: 'FAILURE',
        action: 'LOGIN',
      },
      mockAuditLogs[2],
      {
        ...mockAuditLogs[4],
        status: 'FAILURE',
        action: 'DELETE',
      },
    ],
    loading: false,
    pageInfo: mockPageInfo,
    page: 1,
    onPageChange: fn(),
  },
};

/**
 * Login attempts - Filter showing only login actions.
 */
export const LoginAttempts: Story = {
  args: {
    logs: [
      mockAuditLogs[0],
      mockAuditLogs[3],
      {
        ...mockAuditLogs[0],
        id: '6',
        timestamp: new Date(Date.now() - 1000 * 60 * 35).toISOString(),
        status: 'SUCCESS',
      },
      {
        ...mockAuditLogs[3],
        id: '7',
        timestamp: new Date(Date.now() - 1000 * 60 * 40).toISOString(),
        status: 'FAILURE',
      },
    ],
    loading: false,
    pageInfo: {
      currentPage: 1,
      totalPages: 3,
      totalCount: 28,
      limit: 10,
      hasNextPage: true,
      hasPreviousPage: false,
    },
    page: 1,
    onPageChange: fn(),
  },
};

/**
 * Many logs - Full table with pagination.
 */
export const ManyLogs: Story = {
  args: {
    logs: Array.from({ length: 10 }, (_, i) => ({
      ...mockAuditLogs[i % mockAuditLogs.length],
      id: `log-${i + 1}`,
      timestamp: new Date(Date.now() - 1000 * 60 * (i + 1) * 5).toISOString(),
    })),
    loading: false,
    pageInfo: {
      currentPage: 2,
      totalPages: 12,
      totalCount: 115,
      limit: 10,
      hasNextPage: true,
      hasPreviousPage: true,
    },
    page: 2,
    onPageChange: fn(),
  },
};

/**
 * HQ actions - HQistrative operations only.
 */
export const HQActions: Story = {
  args: {
    logs: [
      mockAuditLogs[4],
      {
        ...mockAuditLogs[4],
        id: '8',
        action: 'UPDATE',
        entity: 'Permission',
        entityId: 'perm-789',
        timestamp: new Date(Date.now() - 1000 * 60 * 35).toISOString(),
      },
      {
        ...mockAuditLogs[4],
        id: '9',
        action: 'DELETE',
        entity: 'User',
        entityId: 'user-999',
        timestamp: new Date(Date.now() - 1000 * 60 * 45).toISOString(),
      },
    ],
    loading: false,
    pageInfo: {
      currentPage: 1,
      totalPages: 2,
      totalCount: 18,
      limit: 10,
      hasNextPage: true,
      hasPreviousPage: false,
    },
    page: 1,
    onPageChange: fn(),
  },
};

/**
 * Last page - Final page of pagination.
 */
export const LastPage: Story = {
  args: {
    logs: [mockAuditLogs[0], mockAuditLogs[1], mockAuditLogs[2]],
    loading: false,
    pageInfo: {
      currentPage: 5,
      totalPages: 5,
      totalCount: 48,
      limit: 10,
      hasNextPage: false,
      hasPreviousPage: true,
    },
    page: 5,
    onPageChange: fn(),
  },
};

/**
 * Column Alignment Demo - Demonstrates the column alignment configuration.
 *
 * This story showcases how columns are aligned in the audit log table:
 * - **Left-aligned**: Timestamp, User (text content that should be left-aligned for readability)
 * - **Center-aligned**: Action, Entity, Status, IP Address (badges and status indicators)
 * - **Right-aligned**: Duration, Actions (numbers and action buttons typically align right)
 *
 * The alignment is configured in the component's column definitions via the `align` property.
 */
export const ColumnAlignmentDemo: Story = {
  args: {
    logs: mockAuditLogs,
    loading: false,
    pageInfo: mockPageInfo,
    page: 1,
    onPageChange: fn(),
  },
  parameters: {
    docs: {
      description: {
        story:
          'Demonstrates column alignment: Left (Timestamp, User), Center (Action, Entity, Status, IP), Right (Duration, Actions)',
      },
    },
  },
};
