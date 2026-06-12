import type { Meta, StoryObj } from '@storybook/nextjs';
import { useState } from 'react';
import { ForgotPasswordForm } from './ForgotPasswordForm';
import Paper from '@mui/material/Paper';
import Box from '@mui/material/Box';

const meta = {
  title: 'Shared/Organisms/ForgotPasswordForm',
  component: ForgotPasswordForm,
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component: '忘記密碼表單，用於申請密碼重設連結。',
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
} satisfies Meta<typeof ForgotPasswordForm>;

export default meta;
type Story = StoryObj<typeof meta>;

/**
 * 預設狀態
 */
export const Default: Story = {
  args: {
    onSubmit: async (data) => {
      console.log('Forgot password:', data);
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
    error: 'Email address not found',
    onSubmit: async (data) => console.log(data),
  },
};

/**
 * 成功狀態
 * 顯示已寄送 email 的訊息
 */
export const Success: Story = {
  args: {
    success: true,
    onSubmit: async (data) => console.log(data),
  },
};

/**
 * 含預設 email
 */
export const WithDefaultEmail: Story = {
  args: {
    defaultEmail: 'user@example.com',
    onSubmit: async (data) => console.log(data),
  },
};

/**
 * 互動範例
 * 模擬完整流程
 */
export const Interactive: Story = {
  render: function InteractiveExample() {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string>();
    const [success, setSuccess] = useState(false);

    const handleSubmit = async (data: { email: string }) => {
      setLoading(true);
      setError(undefined);

      // Simulate API request
      await new Promise((resolve) => setTimeout(resolve, 1500));

      // Simulate validation
      if (data.email.includes('@')) {
        setSuccess(true);
      } else {
        setError('Invalid email format');
      }

      setLoading(false);
    };

    return (
      <Box>
        <ForgotPasswordForm
          onSubmit={handleSubmit}
          loading={loading}
          error={error}
          success={success}
        />
      </Box>
    );
  },
};
