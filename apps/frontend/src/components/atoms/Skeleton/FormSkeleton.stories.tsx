import type { Meta, StoryObj } from '@storybook/nextjs';
import { FormSkeleton } from './FormSkeleton';
import Box from '@mui/material/Box';

/**
 * FormSkeleton 是表單元件的載入骨架元件。
 *
 * ## 何時使用
 * - 當表單載入時
 * - 在認證表單載入期間
 * - 在設定頁面表單載入期間
 * - 任何需要先取得資料才能顯示的表單
 *
 * ## 功能特性
 * - 可設定的輸入欄位數量
 * - 選用的標題與副標題
 * - 選用的送出按鈕
 * - 選用的表單連結（例如忘記密碼）
 * - Material UI Skeleton 動畫
 *
 * ## 最佳實踐
 * - 讓骨架結構與實際表單版面相符
 * - 使用與實際表單相同數量的欄位
 * - 與實際表單一致地顯示／隱藏元素
 * - 在初次載入與取得資料期間顯示
 */
const meta = {
  title: 'Shared/Atoms/Skeleton/FormSkeleton',
  component: FormSkeleton,
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component:
          '表單載入骨架，模擬各種表單結構，於表單載入期間提供視覺回饋。',
      },
    },
  },
  tags: ['autodocs'],
  argTypes: {
    fields: {
      control: { type: 'number', min: 1, max: 10 },
      description: '要顯示的輸入欄位數量',
      table: {
        type: { summary: 'number' },
        defaultValue: { summary: '2' },
      },
    },
    showTitle: {
      control: 'boolean',
      description: '是否顯示標題骨架',
      table: {
        type: { summary: 'boolean' },
        defaultValue: { summary: 'true' },
      },
    },
    showSubtitle: {
      control: 'boolean',
      description: '是否顯示副標題骨架',
      table: {
        type: { summary: 'boolean' },
        defaultValue: { summary: 'true' },
      },
    },
    showButton: {
      control: 'boolean',
      description: '是否顯示送出按鈕骨架',
      table: {
        type: { summary: 'boolean' },
        defaultValue: { summary: 'true' },
      },
    },
    showLinks: {
      control: 'boolean',
      description: '是否顯示連結骨架（例如忘記密碼）',
      table: {
        type: { summary: 'boolean' },
        defaultValue: { summary: 'false' },
      },
    },
  },
} satisfies Meta<typeof FormSkeleton>;

export default meta;
type Story = StoryObj<typeof meta>;

/**
 * 預設顯示
 * 含 2 個欄位的標準表單骨架
 */
export const Default: Story = {
  args: {},
};

/**
 * 最簡表單
 * 僅欄位與按鈕，無標題或副標題
 */
export const MinimalForm: Story = {
  args: {
    fields: 2,
    showTitle: false,
    showSubtitle: false,
    showButton: true,
    showLinks: false,
  },
};

/**
 * 含連結
 * 含額外連結的表單（例如忘記密碼、註冊）
 */
export const WithLinks: Story = {
  args: {
    fields: 2,
    showTitle: true,
    showSubtitle: true,
    showButton: true,
    showLinks: true,
  },
};

/**
 * 多個欄位
 * 含多個輸入欄位的表單（例如註冊表單）
 */
export const ManyFields: Story = {
  args: {
    fields: 5,
    showTitle: true,
    showSubtitle: true,
    showButton: true,
    showLinks: false,
  },
};

/**
 * 不含按鈕
 * 不含送出按鈕的表單（例如自動儲存表單）
 */
export const WithoutButton: Story = {
  args: {
    fields: 3,
    showTitle: true,
    showSubtitle: false,
    showButton: false,
    showLinks: false,
  },
};

/**
 * 登入表單模擬
 * 典型的登入表單結構（email + 密碼）
 */
export const LoginForm: Story = {
  args: {
    fields: 2,
    showTitle: true,
    showSubtitle: true,
    showButton: true,
    showLinks: true,
  },
};

/**
 * 註冊表單模擬
 * 典型的註冊表單結構
 */
export const SignupForm: Story = {
  args: {
    fields: 4,
    showTitle: true,
    showSubtitle: true,
    showButton: true,
    showLinks: true,
  },
};

/**
 * 單一欄位表單
 * 僅含一個輸入的簡單表單（例如 email 訂閱）
 */
export const SingleField: Story = {
  args: {
    fields: 1,
    showTitle: false,
    showSubtitle: false,
    showButton: true,
    showLinks: false,
  },
};

/**
 * 深色背景
 * 在深色背景上的顯示效果
 */
export const DarkBackground: Story = {
  args: {
    fields: 2,
    showTitle: true,
    showSubtitle: true,
    showButton: true,
    showLinks: true,
  },
  decorators: [
    (Story) => (
      <Box
        sx={{
          bgcolor: '#121212',
          p: 4,
          borderRadius: 2,
          minHeight: '600px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <Story />
      </Box>
    ),
  ],
};

/**
 * 淺色背景
 * 在淺色背景上的顯示效果
 */
export const LightBackground: Story = {
  args: {
    fields: 2,
    showTitle: true,
    showSubtitle: true,
    showButton: true,
    showLinks: false,
  },
  decorators: [
    (Story) => (
      <Box
        sx={{
          bgcolor: '#f5f5f5',
          p: 4,
          borderRadius: 2,
          minHeight: '600px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <Story />
      </Box>
    ),
  ],
};

/**
 * 多個表單
 * 顯示多個表單骨架（例如多步驟表單）
 */
export const MultipleForms: Story = {
  render: () => (
    <Box sx={{ display: 'flex', gap: 4, flexWrap: 'wrap' }}>
      <Box>
        <h3 style={{ textAlign: 'center', marginBottom: 16 }}>Step 1</h3>
        <FormSkeleton fields={2} />
      </Box>
      <Box>
        <h3 style={{ textAlign: 'center', marginBottom: 16 }}>Step 2</h3>
        <FormSkeleton fields={3} />
      </Box>
      <Box>
        <h3 style={{ textAlign: 'center', marginBottom: 16 }}>Step 3</h3>
        <FormSkeleton fields={2} showLinks={true} />
      </Box>
    </Box>
  ),
};

/**
 * 所有變體比較
 * 並列顯示所有設定變體
 */
export const AllVariants: Story = {
  render: () => (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
      <Box>
        <h3 style={{ marginBottom: 16 }}>預設（2 個欄位，所有元素）</h3>
        <FormSkeleton />
      </Box>
      <Box>
        <h3 style={{ marginBottom: 16 }}>精簡（不含標題／副標題）</h3>
        <FormSkeleton showTitle={false} showSubtitle={false} />
      </Box>
      <Box>
        <h3 style={{ marginBottom: 16 }}>含連結</h3>
        <FormSkeleton showLinks={true} />
      </Box>
      <Box>
        <h3 style={{ marginBottom: 16 }}>多個欄位（5 個欄位）</h3>
        <FormSkeleton fields={5} />
      </Box>
      <Box>
        <h3 style={{ marginBottom: 16 }}>不含按鈕</h3>
        <FormSkeleton showButton={false} />
      </Box>
    </Box>
  ),
  parameters: {
    layout: 'padded',
  },
};
