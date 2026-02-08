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
  title: 'Organisms/HQ/AuditLogDetailsModal',
  component: AuditLogDetailsModal,
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component:
          'Modal dialog displaying full details of an audit log entry, including request/response data and metadata tabs.',
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
 * Default — open with a full audit log entry.
 */
export const Default: Story = {
  args: {
    open: true,
    log: mockAuditLog,
    onClose: fn(),
  },
};

/**
 * Failed log — shows a failed audit log entry.
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
 * Null log — modal should render nothing when log is null.
 */
export const NullLog: Story = {
  args: {
    open: true,
    log: null,
    onClose: fn(),
  },
};

/**
 * Interactive — open the modal with a button.
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
