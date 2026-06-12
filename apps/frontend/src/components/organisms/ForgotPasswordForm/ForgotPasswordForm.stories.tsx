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
        component: 'Forgot password form for requesting password reset link.',
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
 * Default state
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
    error: 'Email address not found',
    onSubmit: async (data) => console.log(data),
  },
};

/**
 * Success state
 * Show email sent message
 */
export const Success: Story = {
  args: {
    success: true,
    onSubmit: async (data) => console.log(data),
  },
};

/**
 * With default email
 */
export const WithDefaultEmail: Story = {
  args: {
    defaultEmail: 'user@example.com',
    onSubmit: async (data) => console.log(data),
  },
};

/**
 * Interactive example
 * Simulates complete flow
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
