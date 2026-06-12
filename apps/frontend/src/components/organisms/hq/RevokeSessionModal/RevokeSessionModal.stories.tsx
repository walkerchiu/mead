import type { Meta, StoryObj } from '@storybook/nextjs';
import { useState } from 'react';
import { Button, Box } from '@mui/material';
import { fn } from 'storybook/test';
import { MockedProvider } from '@apollo/client/testing/react';
import { RevokeSessionModal } from './RevokeSessionModal';

const meta = {
  title: 'HQ Scope/Organisms/Sessions/RevokeSessionModal',
  component: RevokeSessionModal,
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component:
          '用於撤銷特定使用者 session 的 modal 對話框，可選填原因、通知與自訂訊息欄位。',
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
 * 預設 — 以 session 使用者資訊開啟。
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
 * 不含使用者資訊 — 未提供 session 使用者。
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
 * 互動 — 以按鈕開啟與關閉 modal。
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
