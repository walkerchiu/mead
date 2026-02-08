import type { Meta, StoryObj } from '@storybook/react';
import { useState } from 'react';
import { LoginForm } from './LoginForm';
import { AlertMessage } from '@/components/molecules';
import Box from '@mui/material/Box';
import Paper from '@mui/material/Paper';

const meta = {
  title: 'Organisms/LoginForm',
  component: LoginForm,
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component:
          'Complete login form component with email, password input and validation.',
      },
    },
    msw: {
      handlers: [],
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
} satisfies Meta<typeof LoginForm>;

export default meta;
type Story = StoryObj<typeof meta>;

/**
 * Default state
 * Standard login form
 */
export const Default: Story = {
  args: {
    onSubmit: async (data) => {
      console.log('Login:', data);
      await new Promise((resolve) => setTimeout(resolve, 1000));
    },
  },
};

/**
 * Loading
 * Loading state after form submission
 */
export const Loading: Story = {
  args: {
    loading: true,
    onSubmit: async (data) => console.log(data),
  },
};

/**
 * With error
 * Display login failure message
 */
export const WithError: Story = {
  args: {
    error: 'Invalid email or password',
    onSubmit: async (data) => console.log(data),
  },
};

/**
 * With default email
 * Email field is pre-filled
 */
export const WithDefaultEmail: Story = {
  args: {
    defaultEmail: 'user@example.com',
    onSubmit: async (data) => console.log(data),
  },
};

/**
 * No forgot password
 * Hide forgot password link
 */
export const NoForgotPassword: Story = {
  args: {
    showForgotPassword: false,
    onSubmit: async (data) => console.log(data),
  },
};

/**
 * Interactive example
 * Simulates complete login flow
 */
export const Interactive: Story = {
  render: function InteractiveExample() {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string>();
    const [success, setSuccess] = useState(false);

    const handleSubmit = async (data: { email: string; password: string }) => {
      setLoading(true);
      setError(undefined);
      setSuccess(false);

      // Simulate API request
      await new Promise((resolve) => setTimeout(resolve, 1500));

      // Simulate validation logic
      if (
        data.email === 'admin@example.com' &&
        data.password === 'password123'
      ) {
        setSuccess(true);
      } else {
        setError('Invalid email or password');
      }

      setLoading(false);
    };

    return (
      <Box>
        {success && (
          <Box sx={{ mb: 3 }}>
            <AlertMessage severity="success" title="Login Successful">
              Welcome back! Redirecting to dashboard...
            </AlertMessage>
          </Box>
        )}

        {!success && (
          <>
            <LoginForm
              onSubmit={handleSubmit}
              loading={loading}
              error={error}
            />
            <Box sx={{ mt: 2, p: 2, bgcolor: 'grey.100', borderRadius: 1 }}>
              <Box component="pre" sx={{ fontSize: '0.75rem', m: 0 }}>
                Test Account:
                {'\n'}Email: admin@example.com
                {'\n'}Password: password123
              </Box>
            </Box>
          </>
        )}
      </Box>
    );
  },
};

/**
 * Various error states
 * Demonstrates different error messages
 */
export const ErrorStates: Story = {
  render: () => (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
      <Paper elevation={2} sx={{ p: 3 }}>
        <LoginForm
          onSubmit={async (data) => console.log(data)}
          error="Invalid email or password"
        />
      </Paper>

      <Paper elevation={2} sx={{ p: 3 }}>
        <LoginForm
          onSubmit={async (data) => console.log(data)}
          error="Account has been locked, please contact administrator"
        />
      </Paper>

      <Paper elevation={2} sx={{ p: 3 }}>
        <LoginForm
          onSubmit={async (data) => console.log(data)}
          error="Server connection failed, please try again later"
        />
      </Paper>
    </Box>
  ),
  parameters: {
    layout: 'padded',
  },
};
