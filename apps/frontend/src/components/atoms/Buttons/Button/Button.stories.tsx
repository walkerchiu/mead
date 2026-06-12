import AddIcon from '@mui/icons-material/Add';
import Stack from '@mui/material/Stack';
import type { Meta, StoryObj } from '@storybook/nextjs';
import { Button } from './Button';

/**
 * Button 是用於觸發操作的最基本互動元件。
 *
 * ## 何時使用
 * - 送出表單
 * - 觸發對話框
 * - 導向其他頁面
 * - 執行任意使用者操作
 *
 * ## 變體選擇
 * - **contained**：最重要的操作（例如「Submit」、「Confirm」）
 * - **outlined**：次要操作（例如「Cancel」、「Back」）
 * - **text**：較不重要的操作（例如「Learn More」）
 */
const meta = {
  title: 'Shared/Atoms/Button',
  component: Button,
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component: 'MUI Button 的封裝，提供統一的按鈕樣式並支援載入中狀態。',
      },
    },
  },
  tags: ['autodocs'],
  argTypes: {
    variant: {
      control: 'select',
      options: [
        'contained',
        'outlined',
        'text',
        'elevated',
        'tagContained',
        'tagText',
        'iconGradient',
      ],
      description: '按鈕的視覺樣式',
    },
    size: {
      control: 'select',
      options: ['small', 'medium', 'large'],
      description: '按鈕的尺寸',
    },
    loading: {
      control: 'boolean',
      description: '是否顯示載入中狀態',
    },
    disabled: {
      control: 'boolean',
      description: '按鈕是否停用',
    },
    fullWidth: {
      control: 'boolean',
      description: '按鈕是否佔滿父容器寬度',
    },
  },
} satisfies Meta<typeof Button>;

export default meta;
type Story = StoryObj<typeof meta>;

/**
 * 主要按鈕樣式（Contained）
 * 用於最重要的操作，例如表單送出、確認等。
 */
export const Primary: Story = {
  args: {
    children: 'Primary Button',
    variant: 'contained',
    color: 'primary',
  },
};

/**
 * 次要按鈕樣式（Outlined）
 * 用於次要操作，例如取消、返回等。
 */
export const Secondary: Story = {
  args: {
    children: 'Secondary Button',
    variant: 'outlined',
    color: 'secondary',
  },
};

/**
 * 文字按鈕
 * 用於較不重要的操作
 */
export const Text: Story = {
  args: {
    children: 'Text Button',
    variant: 'text',
  },
};

/**
 * 載入中狀態
 * 執行非同步操作時顯示
 */
export const Loading: Story = {
  args: {
    children: 'Processing...',
    loading: true,
  },
};

/**
 * 停用狀態
 * 當操作暫時無法使用時
 */
export const Disabled: Story = {
  args: {
    children: 'Disabled Button',
    disabled: true,
  },
};

/**
 * 完整寬度按鈕
 * 佔滿父容器的完整寬度
 */
export const FullWidth: Story = {
  args: {
    children: 'Full Width Button',
    fullWidth: true,
  },
  decorators: [
    (Story) => (
      <div style={{ width: '400px' }}>
        <Story />
      </div>
    ),
  ],
};

/**
 * 所有尺寸
 * 三種尺寸：small、medium、large
 */
export const Sizes: Story = {
  render: () => (
    <Stack direction="row" spacing={2} alignItems="center">
      <Button size="small">Small Button</Button>
      <Button size="medium">Medium Button</Button>
      <Button size="large">Large Button</Button>
    </Stack>
  ),
};

export const Elevated: Story = {
  args: {
    children: 'Button',
    variant: 'elevated',
  },
};

export const TagContained: Story = {
  args: {
    children: 'Button',
    variant: 'tagContained',
  },
};

export const TagText: Story = {
  args: {
    children: 'Button',
    variant: 'tagText',
  },
};

export const IconGradient: Story = {
  args: {
    children: 'Button',
    variant: 'iconGradient',
    startIcon: <AddIcon />,
  },
};

export const WithAddIcon: Story = {
  args: {
    children: 'Button',
    variant: 'contained',
    startIcon: <AddIcon />,
  },
};

/**
 * 所有變體組合
 * Contained、Outlined、Text、Elevated、Tag、Icon Gradient
 */
export const Variants: Story = {
  render: () => (
    <Stack spacing={2}>
      <Stack direction="row" spacing={2}>
        <Button variant="contained">Contained</Button>
        <Button variant="outlined">Outlined</Button>
        <Button variant="text">Text</Button>
        <Button variant="elevated">Elevated</Button>
        <Button variant="tagContained">Tag Contained</Button>
        <Button variant="tagText">Tag Text</Button>
        <Button variant="iconGradient" startIcon={<AddIcon />}>
          Icon Gradient
        </Button>
      </Stack>
      <Stack direction="row" spacing={2}>
        <Button variant="contained" color="error">
          Delete
        </Button>
        <Button variant="outlined" color="error">
          Cancel
        </Button>
        <Button variant="text" color="error">
          Learn More
        </Button>
      </Stack>
    </Stack>
  ),
};

/**
 * 表單操作範例
 * 典型的表單送出與取消按鈕組合
 */
export const FormActions: Story = {
  render: () => (
    <Stack direction="row" spacing={2}>
      <Button variant="outlined" color="inherit">
        Cancel
      </Button>
      <Button variant="contained" color="primary">
        Submit
      </Button>
    </Stack>
  ),
};
