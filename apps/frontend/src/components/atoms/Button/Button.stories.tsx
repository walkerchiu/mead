import type { Meta, StoryObj } from '@storybook/react';
import { Button } from './Button';
import { Icon } from '../Icon/Icon';
import Stack from '@mui/material/Stack';
import {
  Add,
  Delete,
  Edit,
  Download,
  Upload,
  Search,
  Send,
  Save,
  Close,
  ArrowBack,
  ArrowForward,
} from '@mui/icons-material';

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
 *
 * ## 圖示支援
 * - **startIcon**: 在文字左側顯示圖示
 * - **endIcon**: 在文字右側顯示圖示
 * - **iconOnly**: 僅顯示圖示，無文字（適合工具列）
 * - 可使用 MUI Icons 或自訂 Icon 組件（支援 Emoji）
 */
const meta = {
  title: 'Atoms/Button',
  component: Button,
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component:
          '基於 MUI Button 的封裝，提供統一的按鈕樣式、載入狀態和圖示支援。支援 startIcon、endIcon 和純圖示按鈕模式。',
      },
    },
  },
  tags: ['autodocs'],
  argTypes: {
    variant: {
      control: 'select',
      options: ['contained', 'outlined', 'text'],
      description: '按鈕的視覺樣式',
    },
    color: {
      control: 'select',
      options: ['primary', 'secondary', 'success', 'error', 'info', 'warning'],
      description: '按鈕的顏色主題',
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
 * 錯誤/刪除按鈕
 * 用於危險操作，如刪除、取消訂閱等
 */
export const Error: Story = {
  args: {
    children: '刪除',
    variant: 'contained',
    color: 'error',
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

/**
 * 所有顏色主題
 * 展示不同的語意顏色
 */
export const Colors: Story = {
  render: () => (
    <Stack spacing={2}>
      <Stack direction="row" spacing={2}>
        <Button color="primary">Primary</Button>
        <Button color="secondary">Secondary</Button>
        <Button color="success">Success</Button>
      </Stack>
      <Stack direction="row" spacing={2}>
        <Button color="error">Error</Button>
        <Button color="info">Info</Button>
        <Button color="warning">Warning</Button>
      </Stack>
    </Stack>
  ),
};

/**
 * 所有變體組合
 * Contained、Outlined、Text 三種樣式
 */
export const Variants: Story = {
  render: () => (
    <Stack spacing={2}>
      <Stack direction="row" spacing={2}>
        <Button variant="contained">Contained</Button>
        <Button variant="outlined">Outlined</Button>
        <Button variant="text">Text</Button>
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

/**
 * 帶開始圖示的按鈕
 * 圖示顯示在文字左側
 */
export const WithStartIcon: Story = {
  render: () => (
    <Stack spacing={2}>
      <Stack direction="row" spacing={2}>
        <Button startIcon={<Add />}>新增</Button>
        <Button startIcon={<Edit />} variant="outlined">
          編輯
        </Button>
        <Button startIcon={<Delete />} color="error">
          刪除
        </Button>
      </Stack>
      <Stack direction="row" spacing={2}>
        <Button startIcon={<Download />}>下載</Button>
        <Button startIcon={<Upload />}>上傳</Button>
        <Button startIcon={<Save />} color="success">
          儲存
        </Button>
      </Stack>
      <Stack direction="row" spacing={2}>
        <Button startIcon={<Icon>➕</Icon>}>使用 Emoji</Button>
        <Button startIcon={<Icon>📁</Icon>} variant="outlined">
          開啟檔案
        </Button>
        <Button startIcon={<Icon>💾</Icon>} color="info">
          儲存檔案
        </Button>
      </Stack>
    </Stack>
  ),
};

/**
 * 帶結束圖示的按鈕
 * 圖示顯示在文字右側
 */
export const WithEndIcon: Story = {
  render: () => (
    <Stack spacing={2}>
      <Stack direction="row" spacing={2}>
        <Button endIcon={<Send />}>發送</Button>
        <Button endIcon={<ArrowForward />}>下一步</Button>
        <Button endIcon={<Download />} variant="outlined">
          匯出
        </Button>
      </Stack>
      <Stack direction="row" spacing={2}>
        <Button startIcon={<ArrowBack />}>返回</Button>
        <Button endIcon={<ArrowForward />}>繼續</Button>
      </Stack>
    </Stack>
  ),
};

/**
 * 同時帶開始和結束圖示
 * 兩側都有圖示的按鈕
 */
export const WithBothIcons: Story = {
  args: {
    children: '操作',
    startIcon: <Edit />,
    endIcon: <ArrowForward />,
  },
};

/**
 * 純圖示按鈕
 * 只顯示圖示，沒有文字
 */
export const IconOnly: Story = {
  render: () => (
    <Stack spacing={2}>
      <Stack direction="row" spacing={1}>
        <Button iconOnly>
          <Search />
        </Button>
        <Button iconOnly variant="outlined">
          <Edit />
        </Button>
        <Button iconOnly color="error">
          <Delete />
        </Button>
        <Button iconOnly color="success">
          <Add />
        </Button>
      </Stack>
      <Stack direction="row" spacing={1}>
        <Button iconOnly size="small">
          <Search />
        </Button>
        <Button iconOnly size="medium">
          <Edit />
        </Button>
        <Button iconOnly size="large">
          <Delete />
        </Button>
      </Stack>
      <Stack direction="row" spacing={1}>
        <Button iconOnly>
          <Icon>🔍</Icon>
        </Button>
        <Button iconOnly variant="outlined">
          <Icon>✏️</Icon>
        </Button>
        <Button iconOnly color="error">
          <Icon>🗑️</Icon>
        </Button>
      </Stack>
    </Stack>
  ),
};

/**
 * 帶圖示的載入狀態
 * 載入時圖示會被替換為載入指示器
 */
export const IconWithLoading: Story = {
  render: () => (
    <Stack spacing={2}>
      <Stack direction="row" spacing={2}>
        <Button startIcon={<Save />} loading>
          儲存中...
        </Button>
        <Button startIcon={<Upload />} variant="outlined" loading>
          上傳中...
        </Button>
      </Stack>
      <Stack direction="row" spacing={2}>
        <Button iconOnly loading>
          <Save />
        </Button>
        <Button iconOnly variant="outlined" loading>
          <Search />
        </Button>
      </Stack>
    </Stack>
  ),
};

/**
 * 實際使用場景範例
 * 常見的按鈕使用情境
 */
export const RealWorldExamples: Story = {
  render: () => (
    <Stack spacing={3}>
      <Stack spacing={1}>
        <div style={{ fontWeight: 'bold' }}>工具列操作</div>
        <Stack direction="row" spacing={1}>
          <Button startIcon={<Add />} size="small">
            新增
          </Button>
          <Button startIcon={<Edit />} size="small" variant="outlined">
            編輯
          </Button>
          <Button
            startIcon={<Delete />}
            size="small"
            color="error"
            variant="outlined"
          >
            刪除
          </Button>
        </Stack>
      </Stack>

      <Stack spacing={1}>
        <div style={{ fontWeight: 'bold' }}>檔案操作</div>
        <Stack direction="row" spacing={2}>
          <Button startIcon={<Upload />} variant="outlined">
            上傳檔案
          </Button>
          <Button startIcon={<Download />}>下載檔案</Button>
        </Stack>
      </Stack>

      <Stack spacing={1}>
        <div style={{ fontWeight: 'bold' }}>導航按鈕</div>
        <Stack direction="row" spacing={2}>
          <Button startIcon={<ArrowBack />} variant="outlined">
            返回
          </Button>
          <Button endIcon={<ArrowForward />}>下一步</Button>
        </Stack>
      </Stack>

      <Stack spacing={1}>
        <div style={{ fontWeight: 'bold' }}>對話框操作</div>
        <Stack direction="row" spacing={2}>
          <Button startIcon={<Close />} variant="outlined">
            取消
          </Button>
          <Button startIcon={<Save />} color="primary">
            確認儲存
          </Button>
        </Stack>
      </Stack>

      <Stack spacing={1}>
        <div style={{ fontWeight: 'bold' }}>快捷操作圖示按鈕</div>
        <Stack direction="row" spacing={1}>
          <Button iconOnly size="small">
            <Search />
          </Button>
          <Button iconOnly size="small" variant="outlined">
            <Edit />
          </Button>
          <Button iconOnly size="small" variant="outlined">
            <Download />
          </Button>
          <Button iconOnly size="small" color="error" variant="outlined">
            <Delete />
          </Button>
        </Stack>
      </Stack>
    </Stack>
  ),
};
