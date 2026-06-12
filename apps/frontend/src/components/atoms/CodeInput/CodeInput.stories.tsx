import type { Meta, StoryObj } from '@storybook/nextjs';
import { useState } from 'react';
import { CodeInput } from './CodeInput';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Alert from '@mui/material/Alert';

/**
 * CodeInput 是專為驗證碼輸入設計的元件。
 *
 * ## 功能特性
 * - 自動聚焦至下一個輸入框
 * - 支援貼上完整驗證碼
 * - Backspace 自動回到上一個輸入框
 * - 僅允許數字輸入
 * - 完成時自動觸發回呼
 *
 * ## 使用情境
 * - 2FA 雙因素驗證
 * - email 或簡訊驗證碼
 * - 密碼重設驗證
 */
const meta = {
  title: 'Shared/Atoms/CodeInput',
  component: CodeInput,
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component: '專為驗證碼輸入設計的元件，提供流暢的輸入體驗。',
      },
    },
  },
  tags: ['autodocs'],
  decorators: [
    (Story) => (
      <div style={{ minWidth: '500px', padding: '20px' }}>
        <Story />
      </div>
    ),
  ],
  argTypes: {
    length: {
      control: { type: 'number', min: 4, max: 8 },
      description: '驗證碼長度',
    },
    error: {
      control: 'boolean',
      description: '是否顯示錯誤狀態',
    },
    disabled: {
      control: 'boolean',
      description: '是否停用輸入',
    },
    onChange: {
      description: '驗證碼變更時的回呼',
    },
    onComplete: {
      description: '輸入完成時的回呼',
    },
  },
} satisfies Meta<typeof CodeInput>;

export default meta;
type Story = StoryObj<typeof meta>;

/**
 * 基本用法
 * 6 位數驗證碼輸入
 */
export const Default: Story = {
  render: function DefaultExample() {
    const [code, setCode] = useState('');

    return (
      <Box sx={{ textAlign: 'center' }}>
        <Typography variant="h6" gutterBottom>
          6-digit verification code
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
          Most common verification code length, used for email or SMS
          verification
        </Typography>

        <CodeInput length={6} value={code} onChange={setCode} />

        <Alert severity="info" sx={{ mt: 2, textAlign: 'left' }}>
          <Typography variant="body2">
            <strong>Current Input:</strong>
            {code || '(not entered yet)'}
            <br />
            <strong>Length:</strong>
            {code.length} / 6<br />
            <strong>Example:</strong>Try entering 123456
          </Typography>
        </Alert>
      </Box>
    );
  },
};

/**
 * 4 位數驗證碼
 * 較短的驗證碼（例如 PIN 碼）
 */
export const FourDigits: Story = {
  render: function FourDigitsExample() {
    const [code, setCode] = useState('');

    return (
      <Box sx={{ textAlign: 'center' }}>
        <Typography variant="h6" gutterBottom>
          4-digit verification code
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
          Shorter verification code, commonly used for ATM PIN, phone unlock
        </Typography>

        <CodeInput length={4} value={code} onChange={setCode} />

        <Alert severity="info" sx={{ mt: 2, textAlign: 'left' }}>
          <Typography variant="body2">
            <strong>Current Input:</strong>
            {code || '(not entered yet)'}
            <br />
            <strong>Length:</strong>
            {code.length} / 4<br />
            <strong>Example:</strong>Try entering 1234
          </Typography>
        </Alert>
      </Box>
    );
  },
};

/**
 * 8 位數驗證碼
 * 較長的驗證碼
 */
export const EightDigits: Story = {
  render: function EightDigitsExample() {
    const [code, setCode] = useState('');

    return (
      <Box sx={{ textAlign: 'center' }}>
        <Typography variant="h6" gutterBottom>
          8-digit verification code
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
          Longer verification code, provides higher security, used for sensitive
          operations
        </Typography>

        <CodeInput length={8} value={code} onChange={setCode} />

        <Alert severity="info" sx={{ mt: 2, textAlign: 'left' }}>
          <Typography variant="body2">
            <strong>Current Input:</strong>
            {code || '(not entered yet)'}
            <br />
            <strong>Length:</strong>
            {code.length} / 8<br />
            <strong>Example:</strong>Try entering 12345678
          </Typography>
        </Alert>
      </Box>
    );
  },
};

/**
 * 錯誤狀態
 * 驗證失敗時顯示紅色邊框
 */
export const Error: Story = {
  args: {
    length: 6,
    error: true,
    value: '123456',
  },
};

/**
 * 停用狀態
 * 輸入框無法編輯
 */
export const Disabled: Story = {
  args: {
    length: 6,
    disabled: true,
    value: '123456',
  },
};

/**
 * 互動範例
 * 示範完成後的回呼
 */
export const Interactive: Story = {
  render: function InteractiveCodeInput() {
    const [code, setCode] = useState('');
    const [completed, setCompleted] = useState(false);

    const handleComplete = (value: string) => {
      setCompleted(true);
      console.log('Verification code input complete:', value);
    };

    return (
      <Box sx={{ textAlign: 'center' }}>
        <Typography variant="h6" gutterBottom>
          Enter 6-digit verification code
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
          Verification code has been sent to your email
        </Typography>

        <CodeInput
          length={6}
          value={code}
          onChange={setCode}
          onComplete={handleComplete}
        />

        <Typography variant="body2" color="text.secondary" sx={{ mt: 2 }}>
          Current Input: {code || '(not entered yet)'}
        </Typography>

        {completed && (
          <Alert severity="success" sx={{ mt: 2 }}>
            Verification code input complete!
          </Alert>
        )}
      </Box>
    );
  },
};

/**
 * 驗證流程範例
 * 完整的驗證碼輸入與驗證流程
 */
export const VerificationFlow: Story = {
  render: function VerificationFlowExample() {
    const [code, setCode] = useState('');
    const [status, setStatus] = useState<
      'idle' | 'verifying' | 'success' | 'error'
    >('idle');
    const correctCode = '123456';

    const handleComplete = (value: string) => {
      setStatus('verifying');

      // Simulate API verification
      setTimeout(() => {
        if (value === correctCode) {
          setStatus('success');
        } else {
          setStatus('error');
          setCode(''); // Clear incorrect verification code
        }
      }, 1000);
    };

    return (
      <Box sx={{ textAlign: 'center', width: '400px' }}>
        <Typography variant="h6" gutterBottom>
          Two-Factor Authentication
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
          Enter the 6-digit verification code sent to your email
        </Typography>

        <CodeInput
          length={6}
          value={code}
          onChange={setCode}
          onComplete={handleComplete}
          error={status === 'error'}
          disabled={status === 'verifying' || status === 'success'}
        />

        <Box sx={{ mt: 2, minHeight: '60px' }}>
          {status === 'idle' && (
            <Typography variant="caption" color="text.secondary">
              Hint: The correct verification code is {correctCode}
            </Typography>
          )}

          {status === 'verifying' && (
            <Alert severity="info">Verifying...</Alert>
          )}

          {status === 'success' && (
            <Alert severity="success">Verification successful!</Alert>
          )}

          {status === 'error' && (
            <Alert severity="error">
              Verification code is incorrect, please try again
            </Alert>
          )}
        </Box>
      </Box>
    );
  },
};

/**
 * 貼上測試
 * 測試貼上完整驗證碼的功能
 */
export const PasteTest: Story = {
  render: function PasteTestExample() {
    const [code, setCode] = useState('');

    return (
      <Box sx={{ textAlign: 'center' }}>
        <Typography variant="h6" gutterBottom>
          Paste Test
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
          Try copying this verification code and pasting it into the input box:
          <strong>789012</strong>
        </Typography>

        <CodeInput length={6} value={code} onChange={setCode} />

        <Typography variant="body2" color="text.secondary" sx={{ mt: 2 }}>
          Current value: {code || '(not entered yet)'}
        </Typography>
      </Box>
    );
  },
};
