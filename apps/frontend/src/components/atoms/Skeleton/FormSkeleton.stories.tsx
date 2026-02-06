import type { Meta, StoryObj } from '@storybook/react';
import { FormSkeleton } from './FormSkeleton';
import Stack from '@mui/material/Stack';
import Box from '@mui/material/Box';

/**
 * FormSkeleton 是表單載入骨架屏組件。
 *
 * ## 使用時機
 * - 表單頁面載入時
 * - 資料正在擷取時
 * - 改善使用者體驗，避免空白頁面
 *
 * ## 特性
 * - 可配置欄位數量
 * - 可選顯示標題、副標題、按鈕、連結
 * - Material UI Skeleton 動畫效果
 *
 * ## 最佳實踐
 * - 與實際表單結構保持一致
 * - 使用合適的欄位數量
 * - 根據需求顯示或隱藏元素
 */
const meta = {
  title: 'Atoms/Skeleton/FormSkeleton',
  component: FormSkeleton,
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component: '表單載入骨架屏，提供載入時的佔位符動畫，改善使用者體驗。',
      },
    },
  },
  tags: ['autodocs'],
  argTypes: {
    fields: {
      control: { type: 'number', min: 1, max: 10 },
      description: '輸入欄位數量',
    },
    showTitle: {
      control: 'boolean',
      description: '是否顯示標題',
    },
    showSubtitle: {
      control: 'boolean',
      description: '是否顯示副標題',
    },
    showButton: {
      control: 'boolean',
      description: '是否顯示按鈕',
    },
    showLinks: {
      control: 'boolean',
      description: '是否顯示連結',
    },
  },
} satisfies Meta<typeof FormSkeleton>;

export default meta;
type Story = StoryObj<typeof meta>;

/**
 * 預設表單
 * 標準的雙欄位表單骨架屏
 */
export const Default: Story = {
  args: {
    fields: 2,
    showTitle: true,
    showSubtitle: true,
    showButton: true,
    showLinks: false,
  },
};

/**
 * 登入表單
 * 典型的登入頁面骨架屏
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
 * 簡單表單
 * 無標題和副標題的簡潔表單
 */
export const SimpleForm: Story = {
  args: {
    fields: 2,
    showTitle: false,
    showSubtitle: false,
    showButton: true,
    showLinks: false,
  },
};

/**
 * 單欄位表單
 * 只有一個輸入欄位的表單
 */
export const SingleField: Story = {
  args: {
    fields: 1,
    showTitle: true,
    showSubtitle: true,
    showButton: true,
    showLinks: false,
  },
};

/**
 * 多欄位表單
 * 包含多個輸入欄位的複雜表單
 */
export const MultipleFields: Story = {
  args: {
    fields: 5,
    showTitle: true,
    showSubtitle: true,
    showButton: true,
    showLinks: false,
  },
};

/**
 * 無按鈕表單
 * 不顯示提交按鈕的表單
 */
export const WithoutButton: Story = {
  args: {
    fields: 3,
    showTitle: true,
    showSubtitle: true,
    showButton: false,
    showLinks: false,
  },
};

/**
 * 完整表單
 * 包含所有元素的完整表單骨架屏
 */
export const FullForm: Story = {
  args: {
    fields: 4,
    showTitle: true,
    showSubtitle: true,
    showButton: true,
    showLinks: true,
  },
};

/**
 * 最小表單
 * 最簡化的表單骨架屏
 */
export const MinimalForm: Story = {
  args: {
    fields: 1,
    showTitle: false,
    showSubtitle: false,
    showButton: true,
    showLinks: false,
  },
};

/**
 * 不同欄位數量對比
 * 展示 1-5 個欄位的視覺效果
 */
export const FieldComparison: Story = {
  render: () => (
    <Stack spacing={4}>
      <Box>
        <h3 style={{ marginTop: 0, marginBottom: 16 }}>1 Field</h3>
        <FormSkeleton fields={1} />
      </Box>
      <Box>
        <h3 style={{ marginTop: 0, marginBottom: 16 }}>2 Fields</h3>
        <FormSkeleton fields={2} />
      </Box>
      <Box>
        <h3 style={{ marginTop: 0, marginBottom: 16 }}>3 Fields</h3>
        <FormSkeleton fields={3} />
      </Box>
    </Stack>
  ),
};

/**
 * 配置選項對比
 * 展示不同配置的視覺效果
 */
export const ConfigurationComparison: Story = {
  render: () => (
    <Stack spacing={4}>
      <Box>
        <h3 style={{ marginTop: 0, marginBottom: 16 }}>
          With Title & Subtitle
        </h3>
        <FormSkeleton
          fields={2}
          showTitle
          showSubtitle
          showButton
          showLinks={false}
        />
      </Box>
      <Box>
        <h3 style={{ marginTop: 0, marginBottom: 16 }}>With Links</h3>
        <FormSkeleton
          fields={2}
          showTitle={false}
          showSubtitle={false}
          showButton
          showLinks
        />
      </Box>
      <Box>
        <h3 style={{ marginTop: 0, marginBottom: 16 }}>Minimal (No extras)</h3>
        <FormSkeleton
          fields={2}
          showTitle={false}
          showSubtitle={false}
          showButton
          showLinks={false}
        />
      </Box>
    </Stack>
  ),
};

/**
 * 登入頁面範例
 * 實際登入頁面的骨架屏效果
 */
export const LoginPageExample: Story = {
  render: () => (
    <Box
      sx={{
        width: '100%',
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        bgcolor: '#f5f5f5',
        p: 3,
      }}
    >
      <Box
        sx={{
          bgcolor: 'white',
          p: 4,
          borderRadius: 2,
          boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
        }}
      >
        <FormSkeleton fields={2} showTitle showSubtitle showButton showLinks />
      </Box>
    </Box>
  ),
  parameters: {
    layout: 'fullscreen',
  },
};

/**
 * 註冊表單範例
 * 多欄位註冊表單的骨架屏
 */
export const RegisterFormExample: Story = {
  render: () => (
    <Box
      sx={{
        width: '100%',
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        bgcolor: '#f5f5f5',
        p: 3,
      }}
    >
      <Box
        sx={{
          bgcolor: 'white',
          p: 4,
          borderRadius: 2,
          boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
        }}
      >
        <FormSkeleton fields={5} showTitle showSubtitle showButton />
      </Box>
    </Box>
  ),
  parameters: {
    layout: 'fullscreen',
  },
};

/**
 * 響應式範例
 * 在不同容器寬度下的表現
 */
export const ResponsiveExample: Story = {
  render: () => (
    <Stack spacing={4}>
      <Box>
        <h3 style={{ marginTop: 0, marginBottom: 16 }}>Small (320px)</h3>
        <Box sx={{ width: 320 }}>
          <FormSkeleton fields={2} showTitle showSubtitle showButton />
        </Box>
      </Box>
      <Box>
        <h3 style={{ marginTop: 0, marginBottom: 16 }}>Medium (400px)</h3>
        <Box sx={{ width: 400 }}>
          <FormSkeleton fields={2} showTitle showSubtitle showButton />
        </Box>
      </Box>
      <Box>
        <h3 style={{ marginTop: 0, marginBottom: 16 }}>Large (600px)</h3>
        <Box sx={{ width: 600 }}>
          <FormSkeleton fields={2} showTitle showSubtitle showButton />
        </Box>
      </Box>
    </Stack>
  ),
};
