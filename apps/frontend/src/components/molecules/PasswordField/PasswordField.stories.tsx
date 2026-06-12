import type { Meta, StoryObj } from '@storybook/nextjs';
import { useState } from 'react';
import { PasswordField } from './PasswordField';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import ListItemText from '@mui/material/ListItemText';

/**
 * PasswordField 是專為密碼輸入設計的元件。
 *
 * ## 功能特性
 * - 顯示／隱藏密碼切換
 * - 密碼強度指示器（選用）
 * - 自動計算密碼強度
 * - 支援所有 TextField 屬性
 *
 * ## 密碼強度計分規則
 * - 長度 ≥ 8：+25 分
 * - 長度 ≥ 12：+10 分
 * - 長度 ≥ 16：+10 分
 * - 包含小寫字母：+15 分
 * - 包含大寫字母：+15 分
 * - 包含數字：+15 分
 * - 包含特殊字元：+10 分
 */
const meta = {
  title: 'Shared/Molecules/PasswordField',
  component: PasswordField,
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component: '專為密碼輸入設計的元件，提供顯示／隱藏切換與密碼強度提示。',
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
 * 最簡單的密碼輸入欄位
 */
export const Default: Story = {
  args: {
    label: 'Password',
    placeholder: 'Enter password',
  },
};

/**
 * 含強度指示器
 * 顯示密碼強度的視覺回饋
 */
export const WithStrength: Story = {
  args: {
    label: 'Password',
    placeholder: 'Enter password',
    showStrength: true,
    helperText:
      'At least 8 characters, including uppercase, lowercase letters and numbers',
  },
};

/**
 * 必填欄位
 */
export const Required: Story = {
  args: {
    label: 'Password',
    required: true,
    showStrength: true,
  },
};

/**
 * 錯誤狀態
 */
export const Error: Story = {
  args: {
    label: 'Password',
    defaultValue: '123',
    error: true,
    helperText: 'Password is too weak, please use a stronger password',
    showStrength: true,
  },
};

/**
 * 停用狀態
 */
export const Disabled: Story = {
  args: {
    label: 'Password',
    defaultValue: 'MyPassword123!',
    disabled: true,
  },
};

/**
 * 互動範例
 * 顯示即時的密碼強度變化
 */
export const Interactive: Story = {
  render: function InteractiveExample() {
    const [password, setPassword] = useState('');

    return (
      <Stack spacing={2}>
        <Typography variant="h6">Set Password</Typography>
        <Typography variant="body2" color="text.secondary">
          Try entering different passwords to see strength changes
        </Typography>

        <PasswordField
          label="New Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          showStrength
          helperText="At least 8 characters"
        />

        <Typography variant="caption" color="text.secondary">
          Current length: {password.length} characters
        </Typography>
      </Stack>
    );
  },
};

/**
 * 密碼強度範例
 * 示範不同強度的密碼
 */
export const StrengthExamples: Story = {
  render: () => (
    <Stack spacing={3}>
      <div>
        <Typography variant="subtitle2" gutterBottom>
          Weak Password
        </Typography>
        <PasswordField label="Password" defaultValue="abc123" showStrength />
      </div>

      <div>
        <Typography variant="subtitle2" gutterBottom>
          Medium Password
        </Typography>
        <PasswordField label="Password" defaultValue="Abc12345" showStrength />
      </div>

      <div>
        <Typography variant="subtitle2" gutterBottom>
          Strong Password
        </Typography>
        <PasswordField
          label="Password"
          defaultValue="MyPassword123"
          showStrength
        />
      </div>

      <div>
        <Typography variant="subtitle2" gutterBottom>
          Very Strong Password
        </Typography>
        <PasswordField
          label="Password"
          defaultValue="MyP@ssw0rd!2024"
          showStrength
        />
      </div>
    </Stack>
  ),
};

/**
 * 註冊表單範例
 * 包含密碼與確認密碼
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
        setError('Passwords do not match');
      } else {
        setError('');
      }
    };

    return (
      <Stack spacing={2}>
        <Typography variant="h6">Create New Account</Typography>

        <PasswordField
          label="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          showStrength
          helperText="At least 8 characters, including uppercase, lowercase letters and numbers"
          required
        />

        <PasswordField
          label="Confirm Password"
          value={confirmPassword}
          onChange={handleConfirmChange}
          error={Boolean(error)}
          helperText={error || 'Please enter password again'}
          required
        />
      </Stack>
    );
  },
};

/**
 * 密碼需求工具提示
 * 顯示密碼規則檢查清單
 */
export const WithRequirements: Story = {
  render: function WithRequirementsExample() {
    const [password, setPassword] = useState('');

    const requirements = [
      { label: 'At least 8 characters', met: password.length >= 8 },
      { label: 'Contains uppercase letter', met: /[A-Z]/.test(password) },
      { label: 'Contains lowercase letter', met: /[a-z]/.test(password) },
      { label: 'Contains number', met: /\d/.test(password) },
      {
        label: 'Contains special character',
        met: /[^a-zA-Z\d]/.test(password),
      },
    ];

    return (
      <Stack spacing={2}>
        <Typography variant="h6">Set Password</Typography>

        <PasswordField
          label="New Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          showStrength
        />

        <List dense>
          <Typography variant="subtitle2" gutterBottom>
            Password must meet the following requirements:
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
