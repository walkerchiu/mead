import type { Meta, StoryObj } from '@storybook/react';
import { useState } from 'react';
import { AuthLayout } from '@/components/templates';
import { ForgotPasswordForm } from '@/components/organisms';
import Box from '@mui/material/Box';

const meta = {
  title: 'Pages/ForgotPasswordPage',
  parameters: {
    layout: 'fullscreen',
    docs: {
      description: {
        component: '忘記密碼頁面，用戶可以請求密碼重設連結。',
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
    <AuthLayout
      title="忘記密碼？"
      subtitle="輸入您的電子郵件，我們將發送重設連結"
    >
      <ForgotPasswordForm
        onSubmit={async (data) => {
          console.log('Forgot password:', data);
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
    <AuthLayout
      title="忘記密碼？"
      subtitle="輸入您的電子郵件，我們將發送重設連結"
    >
      <ForgotPasswordForm
        onSubmit={async (data) => console.log(data)}
        error="找不到此電子郵件地址"
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
      <ForgotPasswordForm
        onSubmit={async (data) => console.log(data)}
        success={true}
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

    const handleSubmit = async (data: { email: string }) => {
      setLoading(true);
      setError(undefined);

      // 模擬 API 請求
      await new Promise((resolve) => setTimeout(resolve, 1500));

      // 驗證 email
      if (data.email.includes('@')) {
        setSuccess(true);
      } else {
        setError('電子郵件格式錯誤');
      }

      setLoading(false);
    };

    return (
      <AuthLayout
        title={success ? undefined : '忘記密碼？'}
        subtitle={success ? undefined : '輸入您的電子郵件，我們將發送重設連結'}
      >
        <Box sx={{ width: '100%' }}>
          <ForgotPasswordForm
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
