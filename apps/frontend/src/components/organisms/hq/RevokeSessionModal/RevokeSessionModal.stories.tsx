import type { Meta, StoryObj } from '@storybook/nextjs';
import { useState } from 'react';
import { Button, Box } from '@mui/material';
import { fn } from 'storybook/test';
import { MockedProvider } from '@apollo/client/testing/react';
import { RevokeSessionModal } from './RevokeSessionModal';

const meta = {
  title: 'Organisms/HQ/RevokeSessionModal',
  component: RevokeSessionModal,
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component:
          'Modal dialog for revoking a specific user session, with optional reason, notification, and custom message fields.',
      },
    },
  },
  tags: ['autodocs'],
  decorators: [
    (Story) => (
      <MockedProvider mocks={[]} addTypename={false}>
        <Story />
      </MockedProvider>
    ),
  ],
} satisfies Meta<typeof RevokeSessionModal>;

export default meta;
type Story = StoryObj<typeof meta>;

/**
 * Default — open with session user info.
 */
export const Default: Story = {
  render: function DefaultExample() {
    const [open, setOpen] = useState(true);
    return (
      <Box>
        <Button variant="contained" onClick={() => setOpen(true)}>
          Open Modal
        </Button>
        <RevokeSessionModal
          open={open}
          sessionId="sess-abc123def456"
          sessionUser={{ name: 'John Doe', email: 'john.doe@example.com' }}
          onClose={() => setOpen(false)}
          onSuccess={() => {
            console.log('Session revoked');
            setOpen(false);
          }}
        />
      </Box>
    );
  },
};

/**
 * Without user info — no session user provided.
 */
export const WithoutUser: Story = {
  args: {
    open: true,
    sessionId: 'sess-xyz789',
    onClose: fn(),
    onSuccess: fn(),
  },
};

/**
 * Interactive — open and close the modal with a button.
 */
export const Interactive: Story = {
  render: function InteractiveExample() {
    const [open, setOpen] = useState(false);
    const [revoked, setRevoked] = useState(false);

    return (
      <Box
        sx={{
          display: 'flex',
          flexDirection: 'column',
          gap: 2,
          alignItems: 'center',
        }}
      >
        <Button
          variant="contained"
          color="error"
          onClick={() => setOpen(true)}
          disabled={revoked}
        >
          Revoke Session
        </Button>
        {revoked && (
          <Box sx={{ color: 'success.main', fontSize: '0.875rem' }}>
            Session successfully revoked
          </Box>
        )}
        <RevokeSessionModal
          open={open}
          sessionId="sess-abc123def456"
          sessionUser={{ name: 'John Doe', email: 'john.doe@example.com' }}
          onClose={() => setOpen(false)}
          onSuccess={() => {
            setRevoked(true);
            setOpen(false);
          }}
        />
      </Box>
    );
  },
};
