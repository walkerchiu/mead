import type { Meta, StoryObj } from '@storybook/nextjs';
import { useState } from 'react';
import { ResetPasswordForm } from './ResetPasswordForm';
import Paper from '@mui/material/Paper';
import Box from '@mui/material/Box';

const meta = {
  title: 'Shared/Organisms/ResetPasswordForm',
  component: ResetPasswordForm,
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component: '重設密碼表單，用於設定新密碼。',
      },
    },
  },
  tags: ['autodocs'],
  decorators: [
    (Story) => (
      <Paper elevation={3} sx={{ p: 4, maxWidth: 500 }}>
        <Story />
      </Paper>
    ),
  ],
} satisfies Meta<typeof ResetPasswordForm>;

export default meta;
type Story = StoryObj<typeof meta>;

/**
 * 預設狀態
 */
export const Default: Story = {
  args: {
    onSubmit: async (data) => {
      console.log('Reset password:', data);
      await new Promise((resolve) => setTimeout(resolve, 1000));
    },
  },
};

/**
 * 載入中
 */
export const Loading: Story = {
  args: {
    loading: true,
    onSubmit: async (data) => console.log(data),
  },
};

/**
 * 含錯誤
 */
export const WithError: Story = {
  args: {
    error: 'Password reset failed, please try again',
    onSubmit: async (data) => console.log(data),
  },
};

/**
 * 成功狀態
 */
export const Success: Story = {
  args: {
    success: true,
    onSubmit: async (data) => console.log(data),
  },
};

/**
 * token 無效
 */
export const TokenInvalid: Story = {
  args: {
    tokenInvalid: true,
    onSubmit: async (data) => console.log(data),
  },
};

/**
 * 互動範例
 */
export const Interactive: Story = {
  render: function InteractiveExample() {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string>();
    const [success, setSuccess] = useState(false);

    const handleSubmit = async (data: {
      password: string;
      confirmPassword: string;
    }) => {
      setLoading(true);
      setError(undefined);

      // Simulate API request
      await new Promise((resolve) => setTimeout(resolve, 1500));

      // Simulate validation
      if (data.password.length >= 8) {
        setSuccess(true);
      } else {
        setError('Password is too short');
      }

      setLoading(false);
    };

    return (
      <Box>
        <ResetPasswordForm
          onSubmit={handleSubmit}
          loading={loading}
          error={error}
          success={success}
        />
      </Box>
    );
  },
};
