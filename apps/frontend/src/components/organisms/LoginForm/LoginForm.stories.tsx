import type { Meta, StoryObj } from '@storybook/nextjs';
import { useState } from 'react';
import { LoginForm } from './LoginForm';
import { AlertMessage } from '@/components/molecules';
import Box from '@mui/material/Box';
import Paper from '@mui/material/Paper';

const meta = {
  title: 'Shared/Organisms/LoginForm',
  component: LoginForm,
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component: '完整的登入表單元件，包含 email、密碼輸入與驗證。',
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
 * 預設狀態
 * 標準的登入表單
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
 * 載入中
 * 表單送出後的載入中狀態
 */
export const Loading: Story = {
  args: {
    loading: true,
    onSubmit: async (data) => console.log(data),
  },
};

/**
 * 含錯誤
 * 顯示登入失敗訊息
 */
export const WithError: Story = {
  args: {
    error: 'Invalid email or password',
    onSubmit: async (data) => console.log(data),
  },
};

/**
 * 含預設 email
 * email 欄位已預先填入
 */
export const WithDefaultEmail: Story = {
  args: {
    defaultEmail: 'user@example.com',
    onSubmit: async (data) => console.log(data),
  },
};

/**
 * 無忘記密碼
 * 隱藏忘記密碼連結
 */
export const NoForgotPassword: Story = {
  args: {
    showForgotPassword: false,
    onSubmit: async (data) => console.log(data),
  },
};

/**
 * 各種錯誤狀態
 * 示範不同的錯誤訊息
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
          error="Account has been locked, please contact hq"
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

/**
 * 含「記住我」
 *
 * 展示送出按鈕上方的「記住我」勾選框。勾選後 login mutation 會帶 rememberMe=true，
 * 後端據此讓 refresh token cookie 持久化（依 REFRESH_TOKEN_MAX_AGE）；未勾選則為
 * session cookie（關閉瀏覽器即失效）。此偏好另寫入 remember_me cookie，供
 * refreshToken / 2FA 驗證後還原同樣的持久化策略。
 */
export const WithRememberMe: Story = {
  args: {
    onSubmit: async (data) => {
      console.log('Login with rememberMe:', data);
      await new Promise((resolve) => setTimeout(resolve, 1000));
    },
  },
};

/**
 * 互動範例
 * 模擬完整的登入流程
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
      if (data.email === 'hq@example.com' && data.password === 'password123') {
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
                {'\n'}Email: hq@example.com
                {'\n'}Password: password123
              </Box>
            </Box>
          </>
        )}
      </Box>
    );
  },
};
