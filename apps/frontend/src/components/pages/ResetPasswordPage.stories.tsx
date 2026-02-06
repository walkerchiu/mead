import type { Meta, StoryObj } from '@storybook/react';
import { useState } from 'react';
import { AuthLayout } from '@/components/templates';
import { ResetPasswordForm } from '@/components/organisms';
import Box from '@mui/material/Box';

const meta = {
  title: 'Pages/ResetPasswordPage',
  parameters: {
    layout: 'fullscreen',
    docs: {
      description: {
        component: '重設密碼頁面，用戶可以設定新密碼。',
      },
    },
  },
  tags: ['autodocs'],
} satisfies Meta;

export default meta;
type Story = StoryObj<typeof meta>;

/**
 * 預設狀態
 */
export const Default: Story = {
  render: () => (
    <AuthLayout title="重設密碼" subtitle="請輸入您的新密碼">
      <ResetPasswordForm
        onSubmit={async (data) => {
          console.log('Reset password:', data);
          await new Promise((resolve) => setTimeout(resolve, 1000));
        }}
      />
    </AuthLayout>
  ),
};

/**
 * 有錯誤
 */
export const WithError: Story = {
  render: () => (
    <AuthLayout title="重設密碼" subtitle="請輸入您的新密碼">
      <ResetPasswordForm
        onSubmit={async (data) => console.log(data)}
        error="密碼重設失敗，請重試"
      />
    </AuthLayout>
  ),
};

/**
 * 成功狀態
 */
export const Success: Story = {
  render: () => (
    <AuthLayout>
      <ResetPasswordForm
        onSubmit={async (data) => console.log(data)}
        success={true}
      />
    </AuthLayout>
  ),
};

/**
 * Token 無效
 */
export const TokenInvalid: Story = {
  render: () => (
    <AuthLayout>
      <ResetPasswordForm
        onSubmit={async (data) => console.log(data)}
        tokenInvalid={true}
      />
    </AuthLayout>
  ),
};

/**
 * 完整流程
 */
export const FullFlow: Story = {
  render: function FullFlowExample() {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string>();
    const [success, setSuccess] = useState(false);

    const handleSubmit = async (data: {
      password: string;
      confirmPassword: string;
    }) => {
      setLoading(true);
      setError(undefined);

      // 模擬 API 請求
      await new Promise((resolve) => setTimeout(resolve, 1500));

      // 驗證密碼強度
      if (data.password.length >= 8) {
        setSuccess(true);
      } else {
        setError('密碼太短');
      }

      setLoading(false);
    };

    return (
      <AuthLayout
        title={success ? undefined : '重設密碼'}
        subtitle={success ? undefined : '請輸入您的新密碼'}
      >
        <Box sx={{ width: '100%' }}>
          <ResetPasswordForm
            onSubmit={handleSubmit}
            loading={loading}
            error={error}
            success={success}
          />
        </Box>
      </AuthLayout>
    );
  },
};
