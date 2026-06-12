import Stack from '@mui/material/Stack';
import type { Meta, StoryObj } from '@storybook/nextjs';
import { TextArea } from './TextArea';

/**
 * TextArea 是用於輸入較長文字內容的多行文字輸入元件。
 *
 * ## 何時使用
 * - 留言與意見回饋
 * - 說明與備註
 * - 訊息與內容建立
 * - 任何需要多行的文字輸入
 *
 * ## 最佳實踐
 * - 一律提供清楚的標籤
 * - 依預期內容長度設定適當的列數
 * - 使用 helperText 提供字數限制或說明
 * - 驗證失敗時顯示具體的錯誤訊息
 */
const meta = {
  title: 'Shared/Atoms/Fields/TextArea',
  component: TextArea,
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component:
          '以 MUI TextField 建構的多行文字輸入元件，針對 textarea 使用情境最佳化。',
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
      description: '文字區域的標籤',
    },
    placeholder: {
      control: 'text',
      description: '文字區域的佔位文字',
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
      description: '文字區域是否停用',
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
      description: '文字區域的尺寸',
    },
    rows: {
      control: 'number',
      description: '要顯示的列數',
    },
  },
  decorators: [
    (Story) => (
      <div style={{ width: '500px' }}>
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof TextArea>;

export default meta;
type Story = StoryObj<typeof meta>;

/**
 * 基本用法
 * 簡單的多行文字輸入
 */
export const Default: Story = {
  args: {
    label: 'Description',
    placeholder: 'Enter your description here...',
    rows: 4,
  },
};

/**
 * 含預設值
 * 展示 textarea 如何顯示既有內容
 */
export const WithValue: Story = {
  args: {
    label: 'Comments',
    rows: 4,
    defaultValue:
      'This is a sample comment.\nIt supports multiple lines of text.\nYou can add as many lines as you need.',
    helperText: 'Share your thoughts',
  },
};

/**
 * 含字數限制
 * 顯示字數指引
 */
export const WithCharacterLimit: Story = {
  args: {
    label: 'Bio',
    rows: 5,
    placeholder: 'Tell us about yourself...',
    helperText: 'Maximum 500 characters',
    inputProps: {
      maxLength: 500,
    },
  },
};

/**
 * 必填欄位
 * 標示為必填
 */
export const Required: Story = {
  args: {
    label: 'Message',
    required: true,
    rows: 4,
    placeholder: 'Enter your message...',
    helperText: 'This field is required',
  },
};

/**
 * 錯誤狀態
 * 顯示驗證錯誤
 */
export const Error: Story = {
  args: {
    label: 'Message',
    rows: 4,
    defaultValue: 'Too short',
    error: true,
    helperText: 'Message must be at least 20 characters',
  },
};

/**
 * 停用狀態
 * 無法編輯的 textarea
 */
export const Disabled: Story = {
  args: {
    label: 'Notes',
    rows: 3,
    defaultValue: 'This is a read-only note.\nIt cannot be edited by the user.',
    disabled: true,
    helperText: 'This field is read-only',
  },
};

/**
 * 不同的列高
 * 示範各種 textarea 高度
 */
export const DifferentRows: Story = {
  render: () => (
    <Stack spacing={2}>
      <TextArea label="2 Rows" rows={2} placeholder="Compact textarea" />
      <TextArea
        label="4 Rows (Default)"
        rows={4}
        placeholder="Standard textarea"
      />
      <TextArea label="6 Rows" rows={6} placeholder="Larger textarea" />
      <TextArea label="8 Rows" rows={8} placeholder="Extra large textarea" />
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
      <TextArea
        label="Small Size"
        size="small"
        rows={3}
        placeholder="Small size textarea"
      />
      <TextArea
        label="Medium Size"
        size="medium"
        rows={3}
        placeholder="Medium size textarea"
      />
      <TextArea
        label="Large Size"
        size="large"
        rows={3}
        placeholder="Large size textarea"
      />
    </Stack>
  ),
};

/**
 * 自動展開的 textarea
 * 使用 minRows 與 maxRows 隨內容增長
 */
export const AutoExpanding: Story = {
  args: {
    label: 'Flexible Notes',
    minRows: 2,
    maxRows: 8,
    placeholder: 'This textarea will expand as you type...',
    helperText: 'Automatically adjusts height based on content',
  },
};

/**
 * 表單範例
 * 典型的意見回饋表單 textarea
 */
export const FormExample: Story = {
  render: () => (
    <Stack spacing={2}>
      <TextArea
        label="Feedback"
        required
        rows={6}
        placeholder="Please share your feedback..."
        helperText="Tell us what you think - minimum 50 characters"
      />
      <TextArea
        label="Additional Comments"
        rows={4}
        placeholder="Any other comments? (optional)"
      />
    </Stack>
  ),
};
