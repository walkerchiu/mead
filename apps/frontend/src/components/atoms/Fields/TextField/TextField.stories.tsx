import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import type { Meta, StoryObj } from '@storybook/nextjs';
import { TextField } from './TextField';

/**
 * TextField 是基本的文字輸入元件。
 *
 * ## 何時使用
 * - 單行文字輸入（姓名、email、電話等）
 * - 密碼輸入
 * - 數字輸入
 * - 日期選擇
 *
 * ## 最佳實踐
 * - 一律提供清楚的標籤
 * - 使用 helperText 提供額外說明
 * - 發生錯誤時顯示具體的錯誤訊息
 * - 使用適當的 type 屬性（email、password、number 等）
 */
const meta = {
  title: 'Shared/Atoms/Fields/TextField',
  component: TextField,
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component: 'MUI TextField 的封裝，提供統一的輸入欄位樣式與行為。',
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
      description: '輸入欄位的標籤',
    },
    placeholder: {
      control: 'text',
      description: '輸入欄位的佔位文字',
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
      description: '輸入欄位是否停用',
    },
    required: {
      control: 'boolean',
      description: '欄位是否必填',
    },
    fullWidth: {
      control: 'boolean',
      description: '是否佔滿父容器寬度',
    },
    size: {
      control: 'select',
      options: ['small', 'medium', 'large'],
      description: '輸入欄位的尺寸',
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
 * 簡單的文字輸入欄位
 */
export const Default: Story = {
  args: {
    label: 'Name',
    placeholder: 'Enter your name',
  },
};

/**
 * 含輔助文字
 * 提供額外的說明或提示
 */
export const WithHelperText: Story = {
  args: {
    label: 'Email',
    type: 'email',
    placeholder: 'user@example.com',
    helperText: "We won't share your email address",
  },
};

/**
 * 必填欄位
 * 使用 required 屬性標示為必填
 */
export const Required: Story = {
  args: {
    label: 'Username',
    required: true,
    helperText: 'This field is required',
  },
};

/**
 * 錯誤狀態
 * 顯示驗證錯誤
 */
export const Error: Story = {
  args: {
    label: 'Password',
    type: 'password',
    error: true,
    helperText: 'Password must be at least 8 characters',
    defaultValue: '123',
  },
};

/**
 * 停用狀態
 * 輸入欄位無法編輯
 */
export const Disabled: Story = {
  args: {
    label: 'Email',
    disabled: true,
    defaultValue: 'user@example.com',
    helperText: 'This field cannot be modified',
  },
};

/**
 * 密碼輸入
 * 使用 password type 隱藏輸入內容
 */
export const Password: Story = {
  args: {
    label: 'Password',
    type: 'password',
    placeholder: 'Enter password',
    helperText:
      'At least 8 characters, including uppercase, lowercase letters and numbers',
  },
};

/**
 * 數字輸入
 * 使用 number type 限制為僅數字輸入
 */
export const Number: Story = {
  args: {
    label: 'Age',
    type: 'number',
    helperText: 'Enter your age',
  },
};

/**
 * 所有輸入類型
 * 示範不同的輸入類型
 */
export const InputTypes: Story = {
  render: () => (
    <Stack spacing={2}>
      <TextField label="Text" type="text" placeholder="General text" />
      <TextField label="Email" type="email" placeholder="user@example.com" />
      <TextField
        label="Password"
        type="password"
        placeholder="Enter password"
      />
      <TextField label="Phone" type="tel" placeholder="0912-345-678" />
      <TextField label="URL" type="url" placeholder="https://example.com" />
      <TextField label="Number" type="number" defaultValue="42" />
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
        label="Password"
        type="password"
        placeholder="Enter password"
        required
        helperText="At least 8 characters"
      />
    </Stack>
  ),
};

/**
 * 尺寸變化
 * Small、Medium 與 Large 尺寸
 */
export const Sizes: Story = {
  render: () => (
    <Stack spacing={2}>
      <TextField label="Small Size" size="medium" defaultValue="Small size" />
      <TextField label="Medium Size" size="medium" defaultValue="Medium size" />
      <TextField label="Large Size" size="large" defaultValue="Large size" />
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
      <TextFieldRow size="medium" hasValue />
      <TextFieldRow size="large" hasValue={false} />
      <TextFieldRow size="medium" hasValue={false} />
      <TextFieldRow size="medium" hasValue={false} />
    </Stack>
  ),
};
