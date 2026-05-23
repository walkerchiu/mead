import type { Meta, StoryObj } from '@storybook/nextjs';
import { useState } from 'react';
import { Button, Box } from '@mui/material';
import { fn } from 'storybook/test';
import { SessionDetailsModal } from './SessionDetailsModal';
import type { Session } from '@/hooks/useSessions';

const mockSession: Session = {
  id: 'sess-abc123def456',
  userId: 'user-001',
  userName: 'John Doe',
  userEmail: 'john.doe@example.com',
  status: 'ACTIVE',
  ipAddress: '192.168.1.100',
  deviceInfo:
    'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
  location: 'Taipei, Taiwan',
  browser: 'Chrome 120',
  os: 'Windows 10',
  createdAt: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString(),
  lastUsedAt: new Date(Date.now() - 1000 * 60 * 5).toISOString(),
  expiresAt: new Date(Date.now() + 1000 * 60 * 60 * 24 * 7).toISOString(),
  isCurrent: false,
};

const meta = {
  title: 'HQ Scope/Organisms/Sessions/DetailsModal',
  component: SessionDetailsModal,
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component:
          'Modal dialog displaying detailed information about a user session, including device, location, and revocation data.',
      },
    },
  },
  tags: ['autodocs'],
} satisfies Meta<typeof SessionDetailsModal>;

export default meta;
type Story = StoryObj<typeof meta>;

/**
 * Default — open with an active session and revoke handler.
 */
export const Default: Story = {
  args: {
    open: true,
    session: mockSession,
    onClose: fn(),
    onRevoke: fn(),
  },
};

/**
 * Revoked session — shows revocation details.
 */
export const RevokedSession: Story = {
  args: {
    open: true,
    session: {
      ...mockSession,
      status: 'REVOKED',
      revokedAt: new Date(Date.now() - 1000 * 60 * 60).toISOString(),
      revokedBy: 'admin-001',
      revokedByName: 'HQ Admin',
      revokedReason: 'Suspicious activity detected',
      revokedMethod: 'HQ_FORCE',
    },
    onClose: fn(),
  },
};

/**
 * Current session — the session belongs to the currently authenticated user.
 */
export const CurrentSession: Story = {
  args: {
    open: true,
    session: {
      ...mockSession,
      isCurrent: true,
    },
    onClose: fn(),
    onRevoke: fn(),
  },
};

/**
 * Expired session — session has passed its expiry time.
 */
export const ExpiredSession: Story = {
  args: {
    open: true,
    session: {
      ...mockSession,
      status: 'EXPIRED',
      expiresAt: new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString(),
    },
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
          View Session Details
        </Button>
        <SessionDetailsModal
          open={open}
          session={mockSession}
          onClose={() => setOpen(false)}
          onRevoke={(id) => {
            console.log('Revoke session:', id);
            setOpen(false);
          }}
        />
      </Box>
    );
  },
};
