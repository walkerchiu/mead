import type { Meta, StoryObj } from '@storybook/nextjs';
import { useState } from 'react';
import { Button, Box } from '@mui/material';
import { fn } from 'storybook/test';
import { MockedProvider } from '@apollo/client/testing/react';
import { AUDIT_LOG_BY_ID_QUERY } from '@/lib/audit-logs-queries';
import { AuditLogDetailsModal } from './AuditLogDetailsModal';

const mockAuditLog = {
  id: 'audit-xyz789',
  timestamp: new Date(Date.now() - 1000 * 60 * 30).toISOString(),
  userId: 'user-001',
  userName: 'John Doe',
  userEmail: 'john.doe@example.com',
  action: 'LOGIN',
  entity: 'User',
  entityId: 'user-001',
  status: 'SUCCESS',
  method: 'POST',
  ipAddress: '192.168.1.100',
  userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) Chrome/120.0.0.0',
  duration: 245,
  requestBody: { email: 'john.doe@example.com' },
  responseStatus: 200,
};

const mockAuditLogQueryResult = {
  request: {
    query: AUDIT_LOG_BY_ID_QUERY,
    variables: { id: 'audit-xyz789' },
  },
  result: {
    data: {
      auditLogById: mockAuditLog,
    },
  },
};

const meta = {
  title: 'HQ Scope/Organisms/Audit Logs/DetailsModal',
  component: AuditLogDetailsModal,
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component:
          '顯示稽核日誌項目完整詳情的 modal 對話框，包含 request／response 資料與 metadata 分頁。',
      },
    },
  },
  tags: ['autodocs'],
  decorators: [
    (Story) => (
      <MockedProvider mocks={[mockAuditLogQueryResult]} addTypename={false}>
        <Story />
      </MockedProvider>
    ),
  ],
} satisfies Meta<typeof AuditLogDetailsModal>;

export default meta;
type Story = StoryObj<typeof meta>;

/**
 * 預設 — 以完整的稽核日誌項目開啟。
 */
export const Default: Story = {
  args: {
    open: true,
    log: mockAuditLog,
    onClose: fn(),
  },
};

/**
 * 失敗的日誌 — 顯示一筆失敗的稽核日誌項目。
 */
export const FailedLog: Story = {
  args: {
    open: true,
    log: {
      ...mockAuditLog,
      id: 'audit-failed-001',
      action: 'DELETE',
      entity: 'Role',
      entityId: 'role-999',
      status: 'FAILURE',
      responseStatus: 403,
      duration: 89,
    },
    onClose: fn(),
  },
};

/**
 * Null 日誌 — 當 log 為 null 時，modal 不應渲染任何內容。
 */
export const NullLog: Story = {
  args: {
    open: true,
    log: null,
    onClose: fn(),
  },
};

/**
 * 互動 — 以按鈕開啟 modal。
 */
export const Interactive: Story = {
  render: function InteractiveExample() {
    const [open, setOpen] = useState(false);

    return (
      <Box>
        <Button variant="contained" onClick={() => setOpen(true)}>
          View Audit Log
        </Button>
        <AuditLogDetailsModal
          open={open}
          log={mockAuditLog}
          onClose={() => setOpen(false)}
        />
      </Box>
    );
  },
};
