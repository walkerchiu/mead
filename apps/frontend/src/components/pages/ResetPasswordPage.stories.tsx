import type { Meta, StoryObj } from '@storybook/nextjs';
import { useState } from 'react';
import { AuthLayout } from '@/components/templates';
import { ResetPasswordForm } from '@/components/organisms';
import Box from '@mui/material/Box';

const meta = {
  title: 'HQ Scope/Pages/ResetPasswordPage',
  parameters: {
    layout: 'fullscreen',
    docs: {
      description: {
        component: 'Reset password page where users can set a new password.',
      },
    },
  },
  tags: ['autodocs'],
} satisfies Meta;

export default meta;
type Story = StoryObj<typeof meta>;

/**
 * Default state
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
 * With error
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
 * Success state
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
 * Invalid token
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
 * Full flow
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
