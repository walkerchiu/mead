import type { Meta, StoryObj } from '@storybook/nextjs';
import { useState } from 'react';
import { Button, Box } from '@mui/material';
import { fn } from 'storybook/test';
import { MockedProvider } from '@apollo/client/testing/react';
import { BatchRevokeModal } from './BatchRevokeModal';

const meta = {
  title: 'HQ Scope/Organisms/Sessions/BatchRevokeModal',
  component: BatchRevokeModal,
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component:
          '用於一次批次撤銷多個 session 的 modal 對話框，支援依條件與依使用者清單撤銷。',
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
 * 預設 — 開啟批次撤銷 modal。
 */
export const Default: Story = {
  args: {
    open: true,
    onClose: fn(),
    onSuccess: fn(),
  },
};

/**
 * 互動 — 以按鈕開啟 modal 並處理成功回呼。
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
