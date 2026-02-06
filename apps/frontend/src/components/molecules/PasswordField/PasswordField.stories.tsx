import type { Meta, StoryObj } from '@storybook/react';
import { useState } from 'react';
import { PasswordField } from './PasswordField';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import ListItemText from '@mui/material/ListItemText';

/**
 * PasswordField 是專為密碼輸入設計的組件。
 *
 * ## 特色
 * - 顯示/隱藏密碼切換
 * - 密碼強度指示器（可選）
 * - 自動計算密碼強度
 * - 支援所有 TextField 的屬性
 *
 * ## 密碼強度評分規則
 * - 長度 ≥ 8: +25 分
 * - 長度 ≥ 12: +10 分
 * - 長度 ≥ 16: +10 分
 * - 包含小寫字母: +15 分
 * - 包含大寫字母: +15 分
 * - 包含數字: +15 分
 * - 包含特殊字元: +10 分
 */
const meta = {
  title: 'Molecules/PasswordField',
  component: PasswordField,
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component: '專為密碼輸入設計的組件，提供顯示/隱藏切換和密碼強度指示。',
      },
    },
  },
  tags: ['autodocs'],
  argTypes: {
    showStrength: {
      control: 'boolean',
      description: '是否顯示密碼強度指示器',
    },
  },
  decorators: [
    (Story) => (
      <div style={{ width: '400px' }}>
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof PasswordField>;

export default meta;
type Story = StoryObj<typeof meta>;

/**
 * 基本用法
 * 最簡單的密碼輸入框
 */
export const Default: Story = {
  args: {
    label: '密碼',
    placeholder: '輸入密碼',
  },
};

/**
 * 帶強度指示器
 * 顯示密碼強度視覺回饋
 */
export const WithStrength: Story = {
  args: {
    label: '密碼',
    placeholder: '輸入密碼',
    showStrength: true,
    helperText: '至少 8 個字元，包含大小寫字母和數字',
  },
};

/**
 * 必填欄位
 */
export const Required: Story = {
  args: {
    label: '密碼',
    required: true,
    showStrength: true,
  },
};

/**
 * 錯誤狀態
 */
export const Error: Story = {
  args: {
    label: '密碼',
    defaultValue: '123',
    error: true,
    helperText: '密碼太弱，請使用更強的密碼',
    showStrength: true,
  },
};

/**
 * 停用狀態
 */
export const Disabled: Story = {
  args: {
    label: '密碼',
    defaultValue: 'MyPassword123!',
    disabled: true,
  },
};

/**
 * 互動式範例
 * 即時顯示密碼強度變化
 */
export const Interactive: Story = {
  render: function InteractiveExample() {
    const [password, setPassword] = useState('');

    return (
      <Stack spacing={2}>
        <Typography variant="h6">設定密碼</Typography>
        <Typography variant="body2" color="text.secondary">
          試試輸入不同的密碼來看強度變化
        </Typography>

        <PasswordField
          label="新密碼"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          showStrength
          helperText="至少 8 個字元"
        />

        <Typography variant="caption" color="text.secondary">
          當前長度: {password.length} 個字元
        </Typography>
      </Stack>
    );
  },
};

/**
 * 密碼強度示例
 * 展示不同強度的密碼
 */
export const StrengthExamples: Story = {
  render: () => (
    <Stack spacing={3}>
      <div>
        <Typography variant="subtitle2" gutterBottom>
          弱密碼
        </Typography>
        <PasswordField label="密碼" defaultValue="abc123" showStrength />
      </div>

      <div>
        <Typography variant="subtitle2" gutterBottom>
          中等密碼
        </Typography>
        <PasswordField label="密碼" defaultValue="Abc12345" showStrength />
      </div>

      <div>
        <Typography variant="subtitle2" gutterBottom>
          強密碼
        </Typography>
        <PasswordField label="密碼" defaultValue="MyPassword123" showStrength />
      </div>

      <div>
        <Typography variant="subtitle2" gutterBottom>
          非常強密碼
        </Typography>
        <PasswordField
          label="密碼"
          defaultValue="MyP@ssw0rd!2024"
          showStrength
        />
      </div>
    </Stack>
  ),
};

/**
 * 註冊表單範例
 * 包含密碼和確認密碼
 */
export const RegisterForm: Story = {
  render: function RegisterFormExample() {
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [error, setError] = useState('');

    const handleConfirmChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      const value = e.target.value;
      setConfirmPassword(value);

      if (value && value !== password) {
        setError('密碼不相符');
      } else {
        setError('');
      }
    };

    return (
      <Stack spacing={2}>
        <Typography variant="h6">建立新帳號</Typography>

        <PasswordField
          label="密碼"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          showStrength
          helperText="至少 8 個字元，包含大小寫字母和數字"
          required
        />

        <PasswordField
          label="確認密碼"
          value={confirmPassword}
          onChange={handleConfirmChange}
          error={Boolean(error)}
          helperText={error || '請再次輸入密碼'}
          required
        />
      </Stack>
    );
  },
};

/**
 * 密碼要求提示
 * 顯示密碼規則清單
 */
export const WithRequirements: Story = {
  render: function WithRequirementsExample() {
    const [password, setPassword] = useState('');

    const requirements = [
      { label: '至少 8 個字元', met: password.length >= 8 },
      { label: '包含大寫字母', met: /[A-Z]/.test(password) },
      { label: '包含小寫字母', met: /[a-z]/.test(password) },
      { label: '包含數字', met: /\d/.test(password) },
      { label: '包含特殊字元', met: /[^a-zA-Z\d]/.test(password) },
    ];

    return (
      <Stack spacing={2}>
        <Typography variant="h6">設定密碼</Typography>

        <PasswordField
          label="新密碼"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          showStrength
        />

        <List dense>
          <Typography variant="subtitle2" gutterBottom>
            密碼必須符合以下條件：
          </Typography>
          {requirements.map((req, index) => (
            <ListItem key={index} sx={{ py: 0 }}>
              <ListItemText
                primary={req.label}
                primaryTypographyProps={{
                  variant: 'caption',
                  color: req.met ? 'success.main' : 'text.secondary',
                  sx: { fontWeight: req.met ? 600 : 400 },
                }}
              />
              <Typography
                variant="caption"
                color={req.met ? 'success.main' : 'text.disabled'}
              >
                {req.met ? '✓' : '○'}
              </Typography>
            </ListItem>
          ))}
        </List>
      </Stack>
    );
  },
};
