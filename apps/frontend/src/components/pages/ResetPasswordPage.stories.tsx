import type { Meta, StoryObj } from '@storybook/nextjs';
import { useState } from 'react';
import { AuthLayout } from '@/components/templates';
import { ResetPasswordForm } from '@/components/organisms';
import Box from '@mui/material/Box';

const meta = {
  title: 'Shared/Pages/ResetPasswordPage',
  parameters: {
    layout: 'fullscreen',
    docs: {
      description: {
        component: '重設密碼頁面，使用者可在此設定新密碼。',
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
      title="Reset Password"
      subtitle="Please enter your new password"
    >
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
 * 含錯誤
 */
export const WithError: Story = {
  render: () => (
    <AuthLayout
      title="Reset Password"
      subtitle="Please enter your new password"
    >
      <ResetPasswordForm
        onSubmit={async (data) => console.log(data)}
        error="Password reset failed, please try again"
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
 * 無效的 token
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

      // Simulate API request
      await new Promise((resolve) => setTimeout(resolve, 1500));

      // Validate password strength
      if (data.password.length >= 8) {
        setSuccess(true);
      } else {
        setError('Password is too short');
      }

      setLoading(false);
    };

    return (
      <AuthLayout
        title={success ? undefined : 'Reset Password'}
        subtitle={success ? undefined : 'Please enter your new password'}
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
