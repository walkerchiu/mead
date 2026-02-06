import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import type { Meta, StoryObj } from '@storybook/nextjs';
import { TextField } from './TextField';

/**
 * TextField 是基本的文字輸入組件。
 *
 * ## 使用時機
 * - 單行文字輸入（姓名、Email、電話等）
 * - 密碼輸入
 * - 數字輸入
 * - 日期選擇
 *
 * ## 最佳實踐
 * - 總是提供清晰的 label
 * - 使用 helperText 提供額外說明
 * - 錯誤時顯示具體的錯誤訊息
 * - 使用適當的 type 屬性（email、password、number 等）
 */
const meta = {
  title: 'Atoms/TextField',
  component: TextField,
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component: '基於 MUI TextField 的封裝，提供統一的輸入框樣式和行為。',
      },
    },
  },
  tags: ['autodocs'],
  argTypes: {
    variant: {
      control: false,
      table: {
        disable: true,
      },
    },
    label: {
      control: 'text',
      description: '輸入框的標籤',
    },
    placeholder: {
      control: 'text',
      description: '輸入框的佔位符',
    },
    helperText: {
      control: 'text',
      description: '輔助文字或錯誤訊息',
    },
    error: {
      control: 'boolean',
      description: '是否顯示錯誤狀態',
    },
    disabled: {
      control: 'boolean',
      description: '是否停用輸入框',
    },
    required: {
      control: 'boolean',
      description: '是否為必填欄位',
    },
    fullWidth: {
      control: 'boolean',
      description: '是否佔滿父容器寬度',
    },
    size: {
      control: 'select',
      options: ['small', 'medium', 'large'],
      description: '輸入框尺寸',
    },
    type: {
      control: 'select',
      options: ['text', 'email', 'password', 'number', 'tel', 'url'],
      description: '輸入類型',
    },
  },
  decorators: [
    (Story) => (
      <div style={{ width: '400px' }}>
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof TextField>;

export default meta;
type Story = StoryObj<typeof meta>;

/**
 * 基本用法
 * 簡單的文字輸入框
 */
export const Default: Story = {
  args: {
    label: '姓名',
    placeholder: '請輸入您的姓名',
  },
};

/**
 * 帶輔助文字
 * 提供額外的說明或提示
 */
export const WithHelperText: Story = {
  args: {
    label: 'Email',
    type: 'email',
    placeholder: 'user@example.com',
    helperText: '我們不會分享您的電子郵件地址',
  },
};

/**
 * 必填欄位
 * 使用 required 屬性標記必填
 */
export const Required: Story = {
  args: {
    label: '使用者名稱',
    required: true,
    helperText: '此欄位為必填',
  },
};

/**
 * 錯誤狀態
 * 顯示驗證錯誤
 */
export const Error: Story = {
  args: {
    label: '密碼',
    type: 'password',
    error: true,
    helperText: '密碼長度必須至少 8 個字元',
    defaultValue: '123',
  },
};

/**
 * 停用狀態
 * 輸入框不可編輯
 */
export const Disabled: Story = {
  args: {
    label: 'Email',
    disabled: true,
    defaultValue: 'user@example.com',
    helperText: '此欄位無法修改',
  },
};

/**
 * 密碼輸入
 * 使用 password 類型隱藏輸入內容
 */
export const Password: Story = {
  args: {
    label: '密碼',
    type: 'password',
    placeholder: '請輸入密碼',
    helperText: '至少 8 個字元，包含大小寫字母和數字',
  },
};

/**
 * 數字輸入
 * 使用 number 類型限制只能輸入數字
 */
export const Number: Story = {
  args: {
    label: '年齡',
    type: 'number',
    helperText: '請輸入您的年齡',
  },
};

/**
 * 所有輸入類型
 * 展示不同的輸入類型
 */
export const InputTypes: Story = {
  render: () => (
    <Stack spacing={2}>
      <TextField label="文字" type="text" placeholder="一般文字" />
      <TextField label="Email" type="email" placeholder="user@example.com" />
      <TextField label="密碼" type="password" placeholder="輸入密碼" />
      <TextField label="電話" type="tel" placeholder="0912-345-678" />
      <TextField label="網址" type="url" placeholder="https://example.com" />
      <TextField label="數字" type="number" defaultValue="42" />
    </Stack>
  ),
};

/**
 * 表單範例
 * 典型的登入表單欄位
 */
export const FormExample: Story = {
  render: () => (
    <Stack spacing={2}>
      <TextField
        label="Email"
        type="email"
        placeholder="user@example.com"
        required
      />
      <TextField
        label="密碼"
        type="password"
        placeholder="輸入密碼"
        required
        helperText="至少 8 個字元"
      />
    </Stack>
  ),
};

/**
 * 尺寸變化
 * Small 和 Medium 兩種尺寸
 */
export const Sizes: Story = {
  render: () => (
    <Stack spacing={2}>
      <TextField label="Small Size" size="small" defaultValue="小尺寸" />
      <TextField label="Medium Size" size="medium" defaultValue="中等尺寸" />
      <TextField label="Large Size" size="large" defaultValue="大尺寸" />
    </Stack>
  ),
};

const TextFieldRow = ({
  size,
  hasValue,
}: {
  size: 'small' | 'medium' | 'large';
  hasValue: boolean;
}) => (
  <Stack spacing={1}>
    <Box
      sx={{
        display: 'grid',
        gridTemplateColumns: '120px repeat(5, 220px)',
        columnGap: 16,
        alignItems: 'center',
      }}
    >
      <Box />
      <Typography variant="caption">Enable</Typography>
      <Typography variant="caption">Hover</Typography>
      <Typography variant="caption">Focus</Typography>
      <Typography variant="caption">Disable</Typography>
      <Typography variant="caption">Error</Typography>
    </Box>
    <Box
      sx={{
        display: 'grid',
        gridTemplateColumns: '120px repeat(5, 220px)',
        columnGap: 16,
        alignItems: 'center',
      }}
    >
      <Typography variant="body2">
        {hasValue ? `${size}, Value=True` : `${size}, Value=False`}
      </Typography>
      <TextField
        size={size}
        label="title"
        placeholder="Input text"
        defaultValue={hasValue ? 'Input text' : undefined}
      />
      <TextField
        size={size}
        label="title"
        placeholder="Input text"
        defaultValue={hasValue ? 'Input text' : undefined}
        className="preview-hover"
      />
      <TextField
        size={size}
        label="title"
        placeholder="Input text"
        defaultValue={hasValue ? 'Input text' : undefined}
        className="preview-focus"
      />
      <TextField
        size={size}
        label="title"
        placeholder="Input text"
        defaultValue={hasValue ? 'Input text' : undefined}
        disabled
      />
      <TextField
        size={size}
        label="title"
        placeholder="Input text"
        defaultValue={hasValue ? 'Input text' : undefined}
        error
        helperText="description"
      />
    </Box>
  </Stack>
);

export const Variants: Story = {
  render: () => (
    <Stack spacing={4}>
      <TextFieldRow size="large" hasValue />
      <TextFieldRow size="medium" hasValue />
      <TextFieldRow size="small" hasValue />
      <TextFieldRow size="large" hasValue={false} />
      <TextFieldRow size="medium" hasValue={false} />
      <TextFieldRow size="small" hasValue={false} />
    </Stack>
  ),
};
