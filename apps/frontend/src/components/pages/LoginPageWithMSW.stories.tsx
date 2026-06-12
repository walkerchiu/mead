import type { Meta, StoryObj } from '@storybook/nextjs';
import { useState } from 'react';
import { graphql, HttpResponse } from 'msw';
import { AuthLayout } from '@/components/templates';
import { LoginForm } from '@/components/organisms';
import { TwoFactorForm } from '@/components/organisms';
import { AlertMessage } from '@/components/molecules';
import Box from '@mui/material/Box';
import { mockTokens } from '@/mocks/fixtures/users';

/**
 * LoginPage with MSW integration example
 *
 * Demonstrates how to use MSW to simulate different API response scenarios.
 */

const meta = {
  title: 'Shared/Pages/LoginPage (MSW)',
  parameters: {
    layout: 'fullscreen',
    docs: {
      description: {
        component:
          'Complete login page flow demonstration using MSW to simulate API.',
      },
    },
  },
  tags: ['autodocs'],
} satisfies Meta;

export default meta;
type Story = StoryObj<typeof meta>;

/**
 * Successful login (without 2FA)
 *
 * Test account:
 * - Email: user@example.com
 * - Password: password
 */
export const SuccessLogin: Story = {
  render: () => {
    const MockLoginDemo = () => {
      const [status, setStatus] = useState<
        'idle' | 'loading' | 'success' | 'error'
      >('idle');
      const [error, setError] = useState<string>();

      const handleSubmit = async (data: {
        email: string;
        password: string;
      }) => {
        setStatus('loading');
        setError(undefined);

        // Simulate API request
        await new Promise((resolve) => setTimeout(resolve, 1000));

        if (data.email === 'user@example.com' && data.password === 'password') {
          setStatus('success');
        } else {
          setStatus('error');
          setError('Invalid email or password');
        }
      };

      if (status === 'success') {
        return (
          <AuthLayout>
            <Box sx={{ textAlign: 'center', width: '100%', maxWidth: 400 }}>
              <AlertMessage severity="success" title="Login Successful">
                Welcome back! Redirecting to dashboard...
              </AlertMessage>
            </Box>
          </AuthLayout>
        );
      }

      return (
        <AuthLayout title="Welcome Back" subtitle="Sign in to continue">
          <Box sx={{ width: '100%' }}>
            <LoginForm
              onSubmit={handleSubmit}
              loading={status === 'loading'}
              error={error}
            />
            <Box sx={{ mt: 2, p: 2, bgcolor: 'info.lighter', borderRadius: 1 }}>
              <Box component="pre" sx={{ fontSize: '0.75rem', m: 0 }}>
                Test account (direct login):{'\n'}
                Email: user@example.com{'\n'}
                Password: password
              </Box>
            </Box>
          </Box>
        </AuthLayout>
      );
    };

    return <MockLoginDemo />;
  },
  parameters: {
    msw: {
      handlers: [
        graphql.mutation('Login', ({ variables }) => {
          const { email, password } = variables as {
            email: string;
            password: string;
          };

          if (email === 'user@example.com' && password === 'password') {
            return HttpResponse.json({
              data: {
                login: {
                  __typename: 'AuthResponse',
                  accessToken: mockTokens.accessToken,
                },
              },
            });
          }

          return HttpResponse.json({
            errors: [
              {
                message: 'Invalid credentials',
                extensions: { code: 'UNAUTHENTICATED' },
              },
            ],
          });
        }),
      ],
    },
  },
};

/**
 * Requires 2FA verification
 *
 * Test account:
 * - Email: hq@example.com
 * - Password: password
 * - 2FA verification code: 123456
 */
export const Requires2FA: Story = {
  render: () => {
    const Mock2FADemo = () => {
      const [step, setStep] = useState<'login' | '2fa' | 'success'>('login');
      const [loading, setLoading] = useState(false);
      const [error, setError] = useState<string>();
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const [temporaryToken, setTemporaryToken] = useState('');

      const handleLogin = async (data: { email: string; password: string }) => {
        setLoading(true);
        setError(undefined);

        await new Promise((resolve) => setTimeout(resolve, 1000));

        if (data.email === 'hq@example.com' && data.password === 'password') {
          setTemporaryToken('temp-token-12345');
          setStep('2fa');
        } else {
          setError('Invalid email or password');
        }

        setLoading(false);
      };

      const handle2FA = async (code: string) => {
        setLoading(true);
        setError(undefined);

        await new Promise((resolve) => setTimeout(resolve, 1000));

        if (code === '123456') {
          setStep('success');
        } else {
          setError('Invalid verification code');
        }

        setLoading(false);
      };

      if (step === 'success') {
        return (
          <AuthLayout>
            <Box sx={{ textAlign: 'center', width: '100%', maxWidth: 400 }}>
              <AlertMessage severity="success" title="Verification Successful">
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
              <Box
                sx={{ mt: 2, p: 2, bgcolor: 'info.lighter', borderRadius: 1 }}
              >
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
              <Box component="pre" sx={{ fontSize: '0.75rem', m: 0 }}>
                Test account (requires 2FA):{'\n'}
                Email: hq@example.com{'\n'}
                Password: password{'\n'}
                Verification code: 123456
              </Box>
            </Box>
          </Box>
        </AuthLayout>
      );
    };

    return <Mock2FADemo />;
  },
  parameters: {
    msw: {
      handlers: [
        graphql.mutation('Login', ({ variables }) => {
          const { email, password } = variables as {
            email: string;
            password: string;
          };

          if (email === 'hq@example.com' && password === 'password') {
            return HttpResponse.json({
              data: {
                login: {
                  __typename: 'TwoFactorLoginResponse',
                  temporaryToken: 'temp-token-12345',
                  message: 'Please enter your 2FA code',
                },
              },
            });
          }

          return HttpResponse.json({
            errors: [
              {
                message: 'Invalid credentials',
                extensions: { code: 'UNAUTHENTICATED' },
              },
            ],
          });
        }),
        graphql.mutation('VerifyTwoFactorLogin', ({ variables }) => {
          const { input } = variables as { input: { code: string } };

          if (input.code === '123456') {
            return HttpResponse.json({
              data: {
                verifyTwoFactorLogin: {
                  accessToken: mockTokens.accessToken,
                  message: 'Login successful',
                },
              },
            });
          }

          return HttpResponse.json({
            errors: [
              {
                message: 'Invalid verification code',
                extensions: { code: 'UNAUTHORIZED' },
              },
            ],
          });
        }),
      ],
    },
  },
};

/**
 * Login failed - Wrong password
 */
export const LoginError: Story = {
  render: () => (
    <AuthLayout title="Welcome Back" subtitle="Sign in to continue">
      <Box sx={{ width: '100%' }}>
        <LoginForm
          onSubmit={async (_data) => {
            await new Promise((resolve) => setTimeout(resolve, 500));
          }}
          defaultEmail="wrong@example.com"
        />
        <Box sx={{ mt: 2, p: 2, bgcolor: 'warning.lighter', borderRadius: 1 }}>
          <Box component="pre" sx={{ fontSize: '0.75rem', m: 0 }}>
            This story demonstrates error handling{'\n'}
            Any credentials will fail
          </Box>
        </Box>
      </Box>
    </AuthLayout>
  ),
  parameters: {
    msw: {
      handlers: [
        graphql.mutation('Login', () => {
          return HttpResponse.json({
            errors: [
              {
                message: 'Invalid email or password',
                extensions: { code: 'UNAUTHENTICATED' },
              },
            ],
          });
        }),
      ],
    },
  },
};
