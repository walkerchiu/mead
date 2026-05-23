import type { Meta, StoryObj } from '@storybook/nextjs';
import { useState } from 'react';
import { AuthLayout } from '@/components/templates';
import { LoginForm } from '@/components/organisms';
import { TwoFactorForm } from '@/components/organisms';
import { AlertMessage } from '@/components/molecules';
import Box from '@mui/material/Box';

/**
 * LoginPage - Complete login page flow
 *
 * Demonstrates the complete flow from login to 2FA verification.
 */

const meta = {
  title: 'HQ Scope/Pages/LoginPage',
  parameters: {
    layout: 'fullscreen',
    docs: {
      description: {
        component:
          'Complete login page including login form and 2FA verification flow.',
      },
    },
  },
  tags: ['autodocs'],
} satisfies Meta;

export default meta;
type Story = StoryObj<typeof meta>;

/**
 * Standard login page
 */
export const Default: Story = {
  render: () => (
    <AuthLayout title="Welcome Back" subtitle="Sign in to continue">
      <LoginForm
        onSubmit={async (data) => {
          console.log('Login:', data);
          await new Promise((resolve) => setTimeout(resolve, 1000));
        }}
      />
    </AuthLayout>
  ),
};

/**
 * Login error state
 */
export const WithError: Story = {
  render: () => (
    <AuthLayout title="Welcome Back" subtitle="Sign in to continue">
      <LoginForm
        onSubmit={async (data) => console.log(data)}
        error="Invalid email or password"
      />
    </AuthLayout>
  ),
};

/**
 * Loading state
 */
export const Loading: Story = {
  render: () => (
    <AuthLayout title="Welcome Back" subtitle="Sign in to continue">
      <LoginForm onSubmit={async (data) => console.log(data)} loading={true} />
    </AuthLayout>
  ),
};

/**
 * Full interactive flow
 * Demonstrates the complete flow: Login → 2FA → Success
 */
export const FullFlow: Story = {
  render: function FullFlowExample() {
    const [step, setStep] = useState<'login' | '2fa' | 'success'>('login');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string>();
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const [temporaryToken, setTemporaryToken] = useState('');

    const handleLogin = async (data: { email: string; password: string }) => {
      setLoading(true);
      setError(undefined);

      // Simulate API request
      await new Promise((resolve) => setTimeout(resolve, 1500));

      // Test account: hq@example.com / password123 (requires 2FA)
      // Test account: user@example.com / password123 (direct login)
      if (data.email === 'hq@example.com' && data.password === 'password123') {
        // Requires 2FA
        setTemporaryToken('temp_token_12345');
        setStep('2fa');
      } else if (
        data.email === 'user@example.com' &&
        data.password === 'password123'
      ) {
        // Direct login success
        setStep('success');
      } else {
        // Login failed
        setError('Invalid email or password');
      }

      setLoading(false);
    };

    const handle2FA = async (code: string) => {
      setLoading(true);
      setError(undefined);

      // Simulate API request
      await new Promise((resolve) => setTimeout(resolve, 1500));

      // Correct verification code: 123456
      if (code === '123456') {
        setStep('success');
      } else {
        setError('Invalid verification code');
      }

      setLoading(false);
    };

    if (step === 'success') {
      return (
        <AuthLayout title="Login Successful">
          <Box sx={{ textAlign: 'center', width: '100%', maxWidth: 400 }}>
            <AlertMessage severity="success" title="Welcome Back!">
              Redirecting to dashboard...
            </AlertMessage>
          </Box>
        </AuthLayout>
      );
    }

    if (step === '2fa') {
      return (
        <AuthLayout
          title="Two-Factor Authentication"
          subtitle="Please enter your verification code"
        >
          <Box sx={{ width: '100%' }}>
            <TwoFactorForm
              onSubmit={handle2FA}
              loading={loading}
              error={error}
              onBack={() => {
                setStep('login');
                setError(undefined);
              }}
            />
            <Box sx={{ mt: 2, p: 2, bgcolor: 'info.lighter', borderRadius: 1 }}>
              <Box component="pre" sx={{ fontSize: '0.75rem', m: 0 }}>
                Test verification code: 123456
              </Box>
            </Box>
          </Box>
        </AuthLayout>
      );
    }

    return (
      <AuthLayout title="Welcome Back" subtitle="Sign in to continue">
        <Box sx={{ width: '100%' }}>
          <LoginForm onSubmit={handleLogin} loading={loading} error={error} />
          <Box sx={{ mt: 2, p: 2, bgcolor: 'info.lighter', borderRadius: 1 }}>
            <Box
              component="pre"
              sx={{ fontSize: '0.75rem', m: 0, whiteSpace: 'pre-wrap' }}
            >
              Test account (requires 2FA):{'\n'}
              Email: hq@example.com{'\n'}
              Password: password123{'\n'}
              {'\n'}
              Test account (direct login):{'\n'}
              Email: user@example.com{'\n'}
              Password: password123
            </Box>
          </Box>
        </Box>
      </AuthLayout>
    );
  },
};

/**
 * Solid background
 */
export const SolidBackground: Story = {
  render: () => (
    <AuthLayout
      title="Welcome Back"
      subtitle="Sign in to continue"
      background="solid"
    >
      <LoginForm onSubmit={async (data) => console.log(data)} />
    </AuthLayout>
  ),
};

/**
 * No logo
 */
export const NoLogo: Story = {
  render: () => (
    <AuthLayout
      title="Welcome Back"
      subtitle="Sign in to continue"
      showLogo={false}
    >
      <LoginForm onSubmit={async (data) => console.log(data)} />
    </AuthLayout>
  ),
};
