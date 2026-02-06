import type { Meta, StoryObj } from '@storybook/react';
import { useState } from 'react';
import { ForgotPasswordForm } from './ForgotPasswordForm';
import Paper from '@mui/material/Paper';
import Box from '@mui/material/Box';

const meta = {
  title: 'Organisms/ForgotPasswordForm',
  component: ForgotPasswordForm,
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component: '忘記密碼表單，用於請求密碼重設連結。',
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
 * 有錯誤
 */
export const WithError: Story = {
  args: {
    error: '找不到此電子郵件地址',
    onSubmit: async (data) => console.log(data),
  },
};

/**
 * 成功狀態
 * 顯示郵件已發送訊息
 */
export const Success: Story = {
  args: {
    success: true,
    onSubmit: async (data) => console.log(data),
  },
};

/**
 * 預填 Email
 */
export const WithDefaultEmail: Story = {
  args: {
    defaultEmail: 'user@example.com',
    onSubmit: async (data) => console.log(data),
  },
};

/**
 * 互動式範例
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

      // 模擬 API 請求
      await new Promise((resolve) => setTimeout(resolve, 1500));

      // 模擬驗證
      if (data.email.includes('@')) {
        setSuccess(true);
      } else {
        setError('電子郵件格式錯誤');
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
