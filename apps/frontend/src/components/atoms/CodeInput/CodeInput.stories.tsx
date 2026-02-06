import type { Meta, StoryObj } from '@storybook/react';
import { useState } from 'react';
import { CodeInput } from './CodeInput';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Alert from '@mui/material/Alert';

/**
 * CodeInput 是專門用於輸入驗證碼的組件。
 *
 * ## 特色功能
 * - 自動聚焦到下一個輸入框
 * - 支援貼上完整驗證碼
 * - 退格鍵自動回到上一個框
 * - 只允許數字輸入
 * - 輸入完成自動觸發回調
 *
 * ## 使用場景
 * - 2FA 雙因素認證
 * - Email 或簡訊驗證碼
 * - 重設密碼驗證
 */
const meta = {
  title: 'Atoms/CodeInput',
  component: CodeInput,
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component: '專為驗證碼輸入設計的組件，提供流暢的輸入體驗。',
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
      description: '驗證碼變更時的回調',
    },
    onComplete: {
      description: '輸入完成時的回調',
    },
  },
} satisfies Meta<typeof CodeInput>;

export default meta;
type Story = StoryObj<typeof meta>;

/**
 * 基本用法
 * 6位數驗證碼輸入
 */
export const Default: Story = {
  render: function DefaultExample() {
    const [code, setCode] = useState('');

    return (
      <Box sx={{ textAlign: 'center' }}>
        <Typography variant="h6" gutterBottom>
          6 位數驗證碼
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
          最常見的驗證碼長度，用於 Email 或簡訊驗證
        </Typography>

        <CodeInput length={6} value={code} onChange={setCode} />

        <Alert severity="info" sx={{ mt: 2, textAlign: 'left' }}>
          <Typography variant="body2">
            <strong>當前輸入：</strong>
            {code || '(尚未輸入)'}
            <br />
            <strong>長度：</strong>
            {code.length} / 6<br />
            <strong>範例：</strong>試試輸入 123456
          </Typography>
        </Alert>
      </Box>
    );
  },
};

/**
 * 4位數驗證碼
 * 較短的驗證碼（如 PIN 碼）
 */
export const FourDigits: Story = {
  render: function FourDigitsExample() {
    const [code, setCode] = useState('');

    return (
      <Box sx={{ textAlign: 'center' }}>
        <Typography variant="h6" gutterBottom>
          4 位數驗證碼
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
          較短的驗證碼，常用於 ATM PIN 碼、手機解鎖
        </Typography>

        <CodeInput length={4} value={code} onChange={setCode} />

        <Alert severity="info" sx={{ mt: 2, textAlign: 'left' }}>
          <Typography variant="body2">
            <strong>當前輸入：</strong>
            {code || '(尚未輸入)'}
            <br />
            <strong>長度：</strong>
            {code.length} / 4<br />
            <strong>範例：</strong>試試輸入 1234
          </Typography>
        </Alert>
      </Box>
    );
  },
};

/**
 * 8位數驗證碼
 * 較長的驗證碼
 */
export const EightDigits: Story = {
  render: function EightDigitsExample() {
    const [code, setCode] = useState('');

    return (
      <Box sx={{ textAlign: 'center' }}>
        <Typography variant="h6" gutterBottom>
          8 位數驗證碼
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
          較長的驗證碼，提供更高的安全性，用於敏感操作
        </Typography>

        <CodeInput length={8} value={code} onChange={setCode} />

        <Alert severity="info" sx={{ mt: 2, textAlign: 'left' }}>
          <Typography variant="body2">
            <strong>當前輸入：</strong>
            {code || '(尚未輸入)'}
            <br />
            <strong>長度：</strong>
            {code.length} / 8<br />
            <strong>範例：</strong>試試輸入 12345678
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
 * 輸入框不可編輯
 */
export const Disabled: Story = {
  args: {
    length: 6,
    disabled: true,
    value: '123456',
  },
};

/**
 * 互動式範例
 * 展示輸入完成後的回調
 */
export const Interactive: Story = {
  render: function InteractiveCodeInput() {
    const [code, setCode] = useState('');
    const [completed, setCompleted] = useState(false);

    const handleComplete = (value: string) => {
      setCompleted(true);
      console.log('驗證碼輸入完成:', value);
    };

    return (
      <Box sx={{ textAlign: 'center' }}>
        <Typography variant="h6" gutterBottom>
          請輸入 6 位數驗證碼
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
          驗證碼已發送到您的郵箱
        </Typography>

        <CodeInput
          length={6}
          value={code}
          onChange={setCode}
          onComplete={handleComplete}
        />

        <Typography variant="body2" color="text.secondary" sx={{ mt: 2 }}>
          當前輸入: {code || '(尚未輸入)'}
        </Typography>

        {completed && (
          <Alert severity="success" sx={{ mt: 2 }}>
            驗證碼輸入完成！
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

      // 模擬 API 驗證
      setTimeout(() => {
        if (value === correctCode) {
          setStatus('success');
        } else {
          setStatus('error');
          setCode(''); // 清空錯誤的驗證碼
        }
      }, 1000);
    };

    return (
      <Box sx={{ textAlign: 'center', width: '400px' }}>
        <Typography variant="h6" gutterBottom>
          雙因素認證
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
          請輸入發送到您郵箱的 6 位數驗證碼
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
              提示：正確的驗證碼是 {correctCode}
            </Typography>
          )}

          {status === 'verifying' && <Alert severity="info">驗證中...</Alert>}

          {status === 'success' && <Alert severity="success">驗證成功！</Alert>}

          {status === 'error' && (
            <Alert severity="error">驗證碼錯誤，請重試</Alert>
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
          貼上測試
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
          試試複製這個驗證碼並貼到輸入框：<strong>789012</strong>
        </Typography>

        <CodeInput length={6} value={code} onChange={setCode} />

        <Typography variant="body2" color="text.secondary" sx={{ mt: 2 }}>
          當前值: {code || '(尚未輸入)'}
        </Typography>
      </Box>
    );
  },
};
