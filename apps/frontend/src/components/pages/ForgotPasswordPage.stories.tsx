import type { Meta, StoryObj } from '@storybook/nextjs';
import { useState } from 'react';
import { AuthLayout } from '@/components/templates';
import { ForgotPasswordForm } from '@/components/organisms';
import Box from '@mui/material/Box';

const meta = {
  title: 'Shared/Pages/ForgotPasswordPage',
  parameters: {
    layout: 'fullscreen',
    docs: {
      description: {
        component:
          'Forgot password page where users can request a password reset link.',
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
      title="Forgot Password?"
      subtitle="Enter your email and we'll send you a reset link"
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
 * With error
 */
export const WithError: Story = {
  render: () => (
    <AuthLayout
      title="Forgot Password?"
      subtitle="Enter your email and we'll send you a reset link"
    >
      <ForgotPasswordForm
        onSubmit={async (data) => console.log(data)}
        error="Email address not found"
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
      <ForgotPasswordForm
        onSubmit={async (data) => console.log(data)}
        success={true}
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

    const handleSubmit = async (data: { email: string }) => {
      setLoading(true);
      setError(undefined);

      // Simulate API request
      await new Promise((resolve) => setTimeout(resolve, 1500));

      // Validate email
      if (data.email.includes('@')) {
        setSuccess(true);
      } else {
        setError('Invalid email format');
      }

      setLoading(false);
    };

    return (
      <AuthLayout
        title={success ? undefined : 'Forgot Password?'}
        subtitle={
          success
            ? undefined
            : "Enter your email and we'll send you a reset link"
        }
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
