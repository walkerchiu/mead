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
        component: '完整的登入表單組件，包含 email、密碼輸入和驗證。',
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
 * 提交表單後的載入狀態
 */
export const Loading: Story = {
  args: {
    loading: true,
    onSubmit: async (data) => console.log(data),
  },
};

/**
 * 有錯誤
 * 顯示登入失敗訊息
 */
export const WithError: Story = {
  args: {
    error: '電子郵件或密碼錯誤',
    onSubmit: async (data) => console.log(data),
  },
};

/**
 * 預填 Email
 * Email 欄位已預填
 */
export const WithDefaultEmail: Story = {
  args: {
    defaultEmail: 'user@example.com',
    onSubmit: async (data) => console.log(data),
  },
};

/**
 * 不顯示忘記密碼
 * 隱藏忘記密碼連結
 */
export const NoForgotPassword: Story = {
  args: {
    showForgotPassword: false,
    onSubmit: async (data) => console.log(data),
  },
};

/**
 * 互動式範例
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

      // 模擬 API 請求
      await new Promise((resolve) => setTimeout(resolve, 1500));

      // 模擬驗證邏輯
      if (
        data.email === 'admin@example.com' &&
        data.password === 'password123'
      ) {
        setSuccess(true);
      } else {
        setError('電子郵件或密碼錯誤');
      }

      setLoading(false);
    };

    return (
      <Box>
        {success && (
          <Box sx={{ mb: 3 }}>
            <AlertMessage severity="success" title="登入成功">
              歡迎回來！正在導向儀表板...
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
                測試帳號：
                {'\n'}Email: admin@example.com
                {'\n'}密碼: password123
              </Box>
            </Box>
          </>
        )}
      </Box>
    );
  },
};

/**
 * 各種錯誤狀態
 * 展示不同的錯誤訊息
 */
export const ErrorStates: Story = {
  render: () => (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
      <Paper elevation={2} sx={{ p: 3 }}>
        <LoginForm
          onSubmit={async (data) => console.log(data)}
          error="電子郵件或密碼錯誤"
        />
      </Paper>

      <Paper elevation={2} sx={{ p: 3 }}>
        <LoginForm
          onSubmit={async (data) => console.log(data)}
          error="帳號已被鎖定，請聯繫管理員"
        />
      </Paper>

      <Paper elevation={2} sx={{ p: 3 }}>
        <LoginForm
          onSubmit={async (data) => console.log(data)}
          error="伺服器連線失敗，請稍後再試"
        />
      </Paper>
    </Box>
  ),
  parameters: {
    layout: 'padded',
  },
};
