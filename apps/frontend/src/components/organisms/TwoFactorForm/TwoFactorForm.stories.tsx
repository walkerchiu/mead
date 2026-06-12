import type { Meta, StoryObj } from '@storybook/nextjs';
import { useState } from 'react';
import { TwoFactorForm } from './TwoFactorForm';
import { AlertMessage } from '@/components/molecules';
import Box from '@mui/material/Box';
import Paper from '@mui/material/Paper';

const meta = {
  title: 'Shared/Organisms/TwoFactorForm',
  component: TwoFactorForm,
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component: '雙因素驗證表單，用於輸入 6 位數驗證碼或備用碼。',
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
} satisfies Meta<typeof TwoFactorForm>;

export default meta;
type Story = StoryObj<typeof meta>;

/**
 * 預設狀態
 * 標準的 2FA 驗證表單
 */
export const Default: Story = {
  args: {
    onSubmit: async (code, isBackupCode) => {
      console.log('2FA Code:', code, 'Is Backup:', isBackupCode);
      await new Promise((resolve) => setTimeout(resolve, 1000));
    },
  },
};

/**
 * 載入中
 * 驗證過程中的載入中狀態
 */
export const Loading: Story = {
  args: {
    loading: true,
    onSubmit: async (code) => console.log(code),
  },
};

/**
 * 含錯誤
 * 顯示驗證失敗訊息
 */
export const WithError: Story = {
  args: {
    error: 'Invalid verification code, please try again',
    onSubmit: async (code) => console.log(code),
  },
};

/**
 * 含返回按鈕
 * 顯示返回登入連結
 */
export const WithBackButton: Story = {
  args: {
    onSubmit: async (code) => console.log(code),
    onBack: () => console.log('Back to login'),
  },
};

/**
 * 備用碼模式
 * 使用備用碼進行驗證
 */
export const BackupCodeMode: Story = {
  render: function BackupCodeExample() {
    return (
      <Box>
        <TwoFactorForm
          onSubmit={async (code, isBackupCode) => {
            console.log('Code:', code, 'Is Backup:', isBackupCode);
          }}
        />
        <Box sx={{ mt: 2, p: 2, bgcolor: 'info.lighter', borderRadius: 1 }}>
          <Box component="pre" sx={{ fontSize: '0.75rem', m: 0 }}>
            Tip: Check "Use backup code" to enter a backup code
          </Box>
        </Box>
      </Box>
    );
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
        <TwoFactorForm
          onSubmit={async (code) => console.log(code)}
          error="Invalid verification code"
        />
      </Paper>

      <Paper elevation={2} sx={{ p: 3 }}>
        <TwoFactorForm
          onSubmit={async (code) => console.log(code)}
          error="Verification code has expired, please log in again"
        />
      </Paper>

      <Paper elevation={2} sx={{ p: 3 }}>
        <TwoFactorForm
          onSubmit={async (code) => console.log(code)}
          error="Too many attempts, account temporarily locked"
        />
      </Paper>
    </Box>
  ),
  parameters: {
    layout: 'padded',
  },
};

/**
 * 互動範例
 * 模擬完整的 2FA 驗證流程
 */
export const Interactive: Story = {
  render: function InteractiveExample() {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string>();
    const [success, setSuccess] = useState(false);

    const correctCode = '123456';

    const handleSubmit = async (code: string, _isBackupCode: boolean) => {
      setLoading(true);
      setError(undefined);
      setSuccess(false);

      // Simulate API request
      await new Promise((resolve) => setTimeout(resolve, 1500));

      // Simulate verification logic
      if (code === correctCode) {
        setSuccess(true);
      } else {
        setError('Invalid verification code, please try again');
      }

      setLoading(false);
    };

    const handleBack = () => {
      console.log('Back to login');
      setError(undefined);
      setSuccess(false);
    };

    return (
      <Box>
        {success ? (
          <Box sx={{ textAlign: 'center' }}>
            <AlertMessage severity="success" title="Verification Successful">
              Logging in...
            </AlertMessage>
          </Box>
        ) : (
          <>
            <TwoFactorForm
              onSubmit={handleSubmit}
              loading={loading}
              error={error}
              onBack={handleBack}
            />
            <Box sx={{ mt: 2, p: 2, bgcolor: 'grey.100', borderRadius: 1 }}>
              <Box component="pre" sx={{ fontSize: '0.75rem', m: 0 }}>
                Test verification code: {correctCode}
              </Box>
            </Box>
          </>
        )}
      </Box>
    );
  },
};
