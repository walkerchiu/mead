import type { Meta, StoryObj } from '@storybook/nextjs';
import { useState } from 'react';
import { ResetPasswordForm } from './ResetPasswordForm';
import Paper from '@mui/material/Paper';
import Box from '@mui/material/Box';

const meta = {
  title: 'HQ Scope/Organisms/ResetPasswordForm',
  component: ResetPasswordForm,
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component: 'Reset password form for setting a new password.',
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
 * Default state
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
 * Loading
 */
export const Loading: Story = {
  args: {
    loading: true,
    onSubmit: async (data) => console.log(data),
  },
};

/**
 * With error
 */
export const WithError: Story = {
  args: {
    error: 'Password reset failed, please try again',
    onSubmit: async (data) => console.log(data),
  },
};

/**
 * Success state
 */
export const Success: Story = {
  args: {
    success: true,
    onSubmit: async (data) => console.log(data),
  },
};

/**
 * Token invalid
 */
export const TokenInvalid: Story = {
  args: {
    tokenInvalid: true,
    onSubmit: async (data) => console.log(data),
  },
};

/**
 * Interactive example
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
