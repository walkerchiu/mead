import AddIcon from '@mui/icons-material/Add';
import Stack from '@mui/material/Stack';
import type { Meta, StoryObj } from '@storybook/nextjs';
import { Button } from './Button';

/**
 * Button 是最基礎的互動元件，用於觸發操作。
 *
 * ## 使用時機
 * - 提交表單
 * - 觸發對話框
 * - 導航到其他頁面
 * - 執行任何用戶操作
 *
 * ## 變體選擇
 * - **contained**: 最重要的操作（如「提交」、「確認」）
 * - **outlined**: 次要操作（如「取消」、「返回」）
 * - **text**: 較不重要的操作（如「了解更多」）
 */
const meta = {
  title: 'Atoms/Button',
  component: Button,
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component: '基於 MUI Button 的封裝，提供統一的按鈕樣式和載入狀態支援。',
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
      description: '是否顯示載入狀態',
    },
    disabled: {
      control: 'boolean',
      description: '是否停用按鈕',
    },
    fullWidth: {
      control: 'boolean',
      description: '是否佔滿父容器寬度',
    },
  },
} satisfies Meta<typeof Button>;

export default meta;
type Story = StoryObj<typeof meta>;

/**
 * 主要按鈕樣式 (Contained)
 * 用於最重要的操作，如提交表單、確認動作等
 */
export const Primary: Story = {
  args: {
    children: '主要按鈕',
    variant: 'contained',
    color: 'primary',
  },
};

/**
 * 次要按鈕樣式 (Outlined)
 * 用於次要操作，如取消、返回等
 */
export const Secondary: Story = {
  args: {
    children: '次要按鈕',
    variant: 'outlined',
    color: 'secondary',
  },
};

/**
 * 文字按鈕 (Text)
 * 用於較不重要的操作
 */
export const Text: Story = {
  args: {
    children: '文字按鈕',
    variant: 'text',
  },
};

/**
 * 載入狀態
 * 當執行非同步操作時顯示
 */
export const Loading: Story = {
  args: {
    children: '處理中...',
    loading: true,
  },
};

/**
 * 停用狀態
 * 當操作暫時不可用時
 */
export const Disabled: Story = {
  args: {
    children: '停用按鈕',
    disabled: true,
  },
};

/**
 * 全寬度按鈕
 * 佔滿父容器的整個寬度
 */
export const FullWidth: Story = {
  args: {
    children: '全寬度按鈕',
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
 * 小、中、大三種尺寸
 */
export const Sizes: Story = {
  render: () => (
    <Stack direction="row" spacing={2} alignItems="center">
      <Button size="small">小按鈕</Button>
      <Button size="medium">中按鈕</Button>
      <Button size="large">大按鈕</Button>
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
          刪除
        </Button>
        <Button variant="outlined" color="error">
          取消
        </Button>
        <Button variant="text" color="error">
          了解更多
        </Button>
      </Stack>
    </Stack>
  ),
};

/**
 * 表單操作示例
 * 典型的表單提交和取消按鈕組合
 */
export const FormActions: Story = {
  render: () => (
    <Stack direction="row" spacing={2}>
      <Button variant="outlined" color="inherit">
        取消
      </Button>
      <Button variant="contained" color="primary">
        提交
      </Button>
    </Stack>
  ),
};
