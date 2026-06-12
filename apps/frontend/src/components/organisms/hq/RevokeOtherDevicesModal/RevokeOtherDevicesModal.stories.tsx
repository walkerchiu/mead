import type { Meta, StoryObj } from '@storybook/nextjs';
import { useState } from 'react';
import { Button, Box } from '@mui/material';
import { fn } from 'storybook/test';
import { MockedProvider } from '@apollo/client/testing/react';
import { RevokeOtherDevicesModal } from './RevokeOtherDevicesModal';

const meta = {
  title: 'HQ Scope/Organisms/Sessions/RevokeOtherDevicesModal',
  component: RevokeOtherDevicesModal,
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component:
          '用於撤銷除目前以外所有 session 的 modal 對話框，適合登出其他裝置。',
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
} satisfies Meta<typeof RevokeOtherDevicesModal>;

export default meta;
type Story = StoryObj<typeof meta>;

/**
 * 預設 — 以目前 session ID 開啟。
 */
export const Default: Story = {
  args: {
    open: true,
    currentSessionId: 'sess-abc123def456',
    onClose: fn(),
    onSuccess: fn(),
  },
};

/**
 * 互動 — 以按鈕開啟與關閉 modal。
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
        <Button
          variant="contained"
          color="warning"
          onClick={() => setOpen(true)}
        >
          Revoke Other Devices
        </Button>
        {revokedCount !== null && (
          <Box sx={{ color: 'success.main', fontSize: '0.875rem' }}>
            Revoked {revokedCount} other session(s)
          </Box>
        )}
        <RevokeOtherDevicesModal
          open={open}
          currentSessionId="sess-abc123def456"
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
