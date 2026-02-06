import type { Meta, StoryObj } from '@storybook/react';
import { useState } from 'react';
import { graphql, HttpResponse } from 'msw';
import { AuthLayout } from '@/components/templates';
import { LoginForm } from '@/components/organisms';
import { TwoFactorForm } from '@/components/organisms';
import { AlertMessage } from '@/components/molecules';
import Box from '@mui/material/Box';
import { mockTokens } from '@/mocks/fixtures/users';

/**
 * LoginPage 與 MSW 整合範例
 *
 * 展示如何使用 MSW 模擬不同的 API 回應情境。
 */

const meta = {
  title: 'Pages/LoginPage (MSW)',
  parameters: {
    layout: 'fullscreen',
    docs: {
      description: {
        component: '使用 MSW 模擬 API 的完整登入頁面流程展示。',
      },
    },
  },
  tags: ['autodocs'],
} satisfies Meta;

export default meta;
type Story = StoryObj<typeof meta>;

/**
 * 成功登入（無 2FA）
 *
 * 測試帳號：
 * - Email: user@example.com
 * - 密碼: password
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

        // 模擬 API 請求
        await new Promise((resolve) => setTimeout(resolve, 1000));

        if (data.email === 'user@example.com' && data.password === 'password') {
          setStatus('success');
        } else {
          setStatus('error');
          setError('電子郵件或密碼錯誤');
        }
      };

      if (status === 'success') {
        return (
          <AuthLayout>
            <Box sx={{ textAlign: 'center', width: '100%', maxWidth: 400 }}>
              <AlertMessage severity="success" title="登入成功">
                歡迎回來！正在導向儀表板...
              </AlertMessage>
            </Box>
          </AuthLayout>
        );
      }

      return (
        <AuthLayout title="歡迎回來" subtitle="登入以繼續使用">
          <Box sx={{ width: '100%' }}>
            <LoginForm
              onSubmit={handleSubmit}
              loading={status === 'loading'}
              error={error}
            />
            <Box sx={{ mt: 2, p: 2, bgcolor: 'info.lighter', borderRadius: 1 }}>
              <Box component="pre" sx={{ fontSize: '0.75rem', m: 0 }}>
                測試帳號 (直接登入):{'\n'}
                Email: user@example.com{'\n'}
                密碼: password
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
 * 需要 2FA 驗證
 *
 * 測試帳號：
 * - Email: admin@example.com
 * - 密碼: password
 * - 2FA 驗證碼: 123456
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

        if (
          data.email === 'admin@example.com' &&
          data.password === 'password'
        ) {
          setTemporaryToken('temp-token-12345');
          setStep('2fa');
        } else {
          setError('電子郵件或密碼錯誤');
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
          setError('驗證碼錯誤');
        }

        setLoading(false);
      };

      if (step === 'success') {
        return (
          <AuthLayout>
            <Box sx={{ textAlign: 'center', width: '100%', maxWidth: 400 }}>
              <AlertMessage severity="success" title="驗證成功">
                正在導向儀表板...
              </AlertMessage>
            </Box>
          </AuthLayout>
        );
      }

      if (step === '2fa') {
        return (
          <AuthLayout title="雙因素認證" subtitle="請輸入驗證碼">
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
                  測試驗證碼: 123456
                </Box>
              </Box>
            </Box>
          </AuthLayout>
        );
      }

      return (
        <AuthLayout title="歡迎回來" subtitle="登入以繼續使用">
          <Box sx={{ width: '100%' }}>
            <LoginForm onSubmit={handleLogin} loading={loading} error={error} />
            <Box sx={{ mt: 2, p: 2, bgcolor: 'info.lighter', borderRadius: 1 }}>
              <Box component="pre" sx={{ fontSize: '0.75rem', m: 0 }}>
                測試帳號 (需要 2FA):{'\n'}
                Email: admin@example.com{'\n'}
                密碼: password{'\n'}
                驗證碼: 123456
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

          if (email === 'admin@example.com' && password === 'password') {
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
 * 登入失敗 - 錯誤密碼
 */
export const LoginError: Story = {
  render: () => (
    <AuthLayout title="歡迎回來" subtitle="登入以繼續使用">
      <Box sx={{ width: '100%' }}>
        <LoginForm
          onSubmit={async (_data) => {
            await new Promise((resolve) => setTimeout(resolve, 500));
          }}
          defaultEmail="wrong@example.com"
        />
        <Box sx={{ mt: 2, p: 2, bgcolor: 'warning.lighter', borderRadius: 1 }}>
          <Box component="pre" sx={{ fontSize: '0.75rem', m: 0 }}>
            此 story 示範錯誤處理{'\n'}
            任何帳號密碼都會失敗
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
