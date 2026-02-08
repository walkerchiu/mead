import type { Meta, StoryObj } from '@storybook/nextjs';
import { useState } from 'react';
import { Button, Box } from '@mui/material';
import { fn } from 'storybook/test';
import { MockedProvider } from '@apollo/client/testing/react';
import { BatchRevokeModal } from './BatchRevokeModal';

const meta = {
  title: 'Organisms/HQ/BatchRevokeModal',
  component: BatchRevokeModal,
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component:
          'Modal dialog for batch-revoking multiple sessions at once, supporting criteria-based and user-list-based revocation.',
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
} satisfies Meta<typeof BatchRevokeModal>;

export default meta;
type Story = StoryObj<typeof meta>;

/**
 * Default — open batch revoke modal.
 */
export const Default: Story = {
  args: {
    open: true,
    onClose: fn(),
    onSuccess: fn(),
  },
};

/**
 * Interactive — open the modal with a button and handle success callback.
 */
export const Interactive: Story = {
  render: function InteractiveExample() {
    const [open, setOpen] = useState(false);
    const [revokedCount, setRevokedCount] = useState<number | null>(null);

    return (
      <Box
        sx={{
          display: 'flex',
          flexDirection: 'column',
          gap: 2,
          alignItems: 'center',
        }}
      >
        <Button variant="contained" color="error" onClick={() => setOpen(true)}>
          Batch Revoke Sessions
        </Button>
        {revokedCount !== null && (
          <Box sx={{ color: 'success.main', fontSize: '0.875rem' }}>
            Successfully revoked {revokedCount} session(s)
          </Box>
        )}
        <BatchRevokeModal
          open={open}
          onClose={() => setOpen(false)}
          onSuccess={(count) => {
            setRevokedCount(count);
            setOpen(false);
          }}
        />
      </Box>
    );
  },
};
