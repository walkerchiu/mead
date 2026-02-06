import type { Meta, StoryObj } from '@storybook/react';
import { useState } from 'react';
import { AuthLayout } from '@/components/templates';
import { LoginForm } from '@/components/organisms';
import { TwoFactorForm } from '@/components/organisms';
import { AlertMessage } from '@/components/molecules';
import Box from '@mui/material/Box';

/**
 * LoginPage - 完整的登入頁面流程
 *
 * 展示從登入到 2FA 驗證的完整流程。
 */

const meta = {
  title: 'Pages/LoginPage',
  parameters: {
    layout: 'fullscreen',
    docs: {
      description: {
        component: '完整的登入頁面，包含登入表單和 2FA 驗證流程。',
      },
    },
  },
  tags: ['autodocs'],
} satisfies Meta;

export default meta;
type Story = StoryObj<typeof meta>;

/**
 * 標準登入頁面
 */
export const Default: Story = {
  render: () => (
    <AuthLayout title="歡迎回來" subtitle="登入以繼續使用">
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
 * 登入錯誤狀態
 */
export const WithError: Story = {
  render: () => (
    <AuthLayout title="歡迎回來" subtitle="登入以繼續使用">
      <LoginForm
        onSubmit={async (data) => console.log(data)}
        error="電子郵件或密碼錯誤"
      />
    </AuthLayout>
  ),
};

/**
 * 載入中狀態
 */
export const Loading: Story = {
  render: () => (
    <AuthLayout title="歡迎回來" subtitle="登入以繼續使用">
      <LoginForm onSubmit={async (data) => console.log(data)} loading={true} />
    </AuthLayout>
  ),
};

/**
 * 完整互動流程
 * 展示登入 → 2FA → 成功的完整流程
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

      // 模擬 API 請求
      await new Promise((resolve) => setTimeout(resolve, 1500));

      // 測試帳號：admin@example.com / password123 (需要 2FA)
      // 測試帳號：user@example.com / password123 (直接登入)
      if (
        data.email === 'admin@example.com' &&
        data.password === 'password123'
      ) {
        // 需要 2FA
        setTemporaryToken('temp_token_12345');
        setStep('2fa');
      } else if (
        data.email === 'user@example.com' &&
        data.password === 'password123'
      ) {
        // 直接登入成功
        setStep('success');
      } else {
        // 登入失敗
        setError('電子郵件或密碼錯誤');
      }

      setLoading(false);
    };

    const handle2FA = async (code: string) => {
      setLoading(true);
      setError(undefined);

      // 模擬 API 請求
      await new Promise((resolve) => setTimeout(resolve, 1500));

      // 正確的驗證碼：123456
      if (code === '123456') {
        setStep('success');
      } else {
        setError('驗證碼錯誤');
      }

      setLoading(false);
    };

    if (step === 'success') {
      return (
        <AuthLayout title="登入成功">
          <Box sx={{ textAlign: 'center', width: '100%', maxWidth: 400 }}>
            <AlertMessage severity="success" title="歡迎回來！">
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
            <Box sx={{ mt: 2, p: 2, bgcolor: 'info.lighter', borderRadius: 1 }}>
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
            <Box
              component="pre"
              sx={{ fontSize: '0.75rem', m: 0, whiteSpace: 'pre-wrap' }}
            >
              測試帳號 (需要 2FA):{'\n'}
              Email: admin@example.com{'\n'}
              密碼: password123{'\n'}
              {'\n'}
              測試帳號 (直接登入):{'\n'}
              Email: user@example.com{'\n'}
              密碼: password123
            </Box>
          </Box>
        </Box>
      </AuthLayout>
    );
  },
};

/**
 * 純色背景
 */
export const SolidBackground: Story = {
  render: () => (
    <AuthLayout title="歡迎回來" subtitle="登入以繼續使用" background="solid">
      <LoginForm onSubmit={async (data) => console.log(data)} />
    </AuthLayout>
  ),
};

/**
 * 無 Logo
 */
export const NoLogo: Story = {
  render: () => (
    <AuthLayout title="歡迎回來" subtitle="登入以繼續使用" showLogo={false}>
      <LoginForm onSubmit={async (data) => console.log(data)} />
    </AuthLayout>
  ),
};
