import type { Meta, StoryObj } from '@storybook/nextjs';
import { LanguageSwitcher } from './LanguageSwitcher';
import { AppBar, Toolbar, Typography, Box, Paper } from '@mui/material';

/**
 * LanguageSwitcher 讓使用者切換應用程式語言。
 *
 * 功能特性：
 * - 以國旗顯示目前語言
 * - 下拉選單列出所有可用語言
 * - 無需重新整理頁面即可順暢切換語言
 * - 支援多種顯示模式（純圖示或含標籤）
 * - 具備 ARIA 標籤，符合無障礙需求
 */
const meta = {
  title: 'Shared/Molecules/LanguageSwitcher',
  component: LanguageSwitcher,
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component:
          '語言切換元件，讓使用者切換應用程式語言。以 Material-UI 與 next-intl 建構。',
      },
    },
  },
  tags: ['autodocs'],
  argTypes: {
    showLabel: {
      control: 'boolean',
      description: '在圖示旁顯示語言名稱',
      table: {
        defaultValue: { summary: 'false' },
      },
    },
    size: {
      control: 'select',
      options: ['small', 'medium', 'large'],
      description: '圖示按鈕的尺寸',
      table: {
        defaultValue: { summary: 'medium' },
      },
    },
    color: {
      control: 'select',
      options: ['inherit', 'primary', 'secondary', 'default'],
      description: '按鈕的顏色',
      table: {
        defaultValue: { summary: 'inherit' },
      },
    },
  },
} satisfies Meta<typeof LanguageSwitcher>;

export default meta;
type Story = StoryObj<typeof meta>;

/**
 * 預設純圖示顯示
 */
export const Default: Story = {
  args: {},
};

/**
 * 小尺寸按鈕
 */
export const Small: Story = {
  args: {
    size: 'small',
    color: 'primary',
  },
};

/**
 * 大尺寸按鈕
 */
export const Large: Story = {
  args: {
    size: 'large',
    color: 'primary',
  },
};

/**
 * 純圖示，主要色
 */
export const Primary: Story = {
  args: {
    color: 'primary',
  },
};

/**
 * 純圖示，次要色
 */
export const Secondary: Story = {
  args: {
    color: 'secondary',
  },
};

/**
 * 顯示語言標籤
 */
export const WithLabel: Story = {
  args: {
    showLabel: true,
    color: 'primary',
  },
};

/**
 * 不同尺寸比較
 */
export const SizeComparison: Story = {
  render: () => (
    <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
      <Box sx={{ textAlign: 'center' }}>
        <Typography variant="caption" display="block" sx={{ mb: 1 }}>
          Small
        </Typography>
        <LanguageSwitcher size="small" color="primary" />
      </Box>
      <Box sx={{ textAlign: 'center' }}>
        <Typography variant="caption" display="block" sx={{ mb: 1 }}>
          Medium
        </Typography>
        <LanguageSwitcher size="medium" color="primary" />
      </Box>
      <Box sx={{ textAlign: 'center' }}>
        <Typography variant="caption" display="block" sx={{ mb: 1 }}>
          Large
        </Typography>
        <LanguageSwitcher size="large" color="primary" />
      </Box>
    </Box>
  ),
};

/**
 * 顏色變體比較
 */
export const ColorVariants: Story = {
  render: () => (
    <Box sx={{ display: 'flex', gap: 2, flexDirection: 'column' }}>
      <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
        <Typography variant="body2" sx={{ width: 100 }}>
          Default:
        </Typography>
        <LanguageSwitcher color="default" />
      </Box>
      <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
        <Typography variant="body2" sx={{ width: 100 }}>
          Primary:
        </Typography>
        <LanguageSwitcher color="primary" />
      </Box>
      <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
        <Typography variant="body2" sx={{ width: 100 }}>
          Secondary:
        </Typography>
        <LanguageSwitcher color="secondary" />
      </Box>
      <Box
        sx={{
          display: 'flex',
          gap: 2,
          alignItems: 'center',
          bgcolor: 'primary.main',
          p: 2,
          borderRadius: 1,
        }}
      >
        <Typography variant="body2" sx={{ width: 100, color: 'white' }}>
          Inherit:
        </Typography>
        <LanguageSwitcher color="inherit" />
      </Box>
    </Box>
  ),
};

/**
 * 置於 AppBar 中（典型使用情境）
 */
export const InAppBar: Story = {
  args: {
    color: 'inherit',
  },
  decorators: [
    (Story) => (
      <Box sx={{ width: '100%', minWidth: 600 }}>
        <AppBar position="static">
          <Toolbar>
            <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
              Dashboard
            </Typography>
            <Story />
          </Toolbar>
        </AppBar>
      </Box>
    ),
  ],
};

/**
 * 置於 AppBar 中並含標籤
 */
export const InAppBarWithLabel: Story = {
  args: {
    color: 'inherit',
    showLabel: true,
  },
  decorators: [
    (Story) => (
      <Box sx={{ width: '100%', minWidth: 600 }}>
        <AppBar position="static">
          <Toolbar>
            <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
              Dashboard
            </Typography>
            <Story />
          </Toolbar>
        </AppBar>
      </Box>
    ),
  ],
};

/**
 * 置於設定面板中
 */
export const InSettingsPanel: Story = {
  args: {
    color: 'primary',
    showLabel: true,
  },
  decorators: [
    (Story) => (
      <Paper sx={{ p: 3, width: 400 }}>
        <Typography variant="h6" gutterBottom>
          Language Settings
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
          Choose your preferred language
        </Typography>
        <Box sx={{ display: 'flex', alignItems: 'center' }}>
          <Typography variant="body1" sx={{ flexGrow: 1 }}>
            Current Language:
          </Typography>
          <Story />
        </Box>
      </Paper>
    ),
  ],
};

/**
 * 含操作說明的互動範例
 */
export const Interactive: Story = {
  args: {
    color: 'primary',
  },
  decorators: [
    (Story) => (
      <Box sx={{ textAlign: 'center' }}>
        <Paper sx={{ p: 3, mb: 2 }}>
          <Typography variant="h6" gutterBottom>
            Try the Language Switcher
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
            Click the button below to open the language menu
          </Typography>
          <Story />
        </Paper>
        <Typography variant="caption" color="text.secondary">
          Note: In Storybook, the actual language switch may not persist due to
          routing limitations
        </Typography>
      </Box>
    ),
  ],
};

/**
 * 儀表板標題列中的實際應用範例
 */
export const DashboardHeader: Story = {
  render: () => (
    <Box sx={{ width: '100%', minWidth: 800 }}>
      <AppBar position="static">
        <Toolbar>
          <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
            My Dashboard
          </Typography>
          <Box sx={{ display: 'flex', gap: 1 }}>
            <LanguageSwitcher color="inherit" />
            <Box
              component="span"
              sx={{ color: 'inherit', px: 2, py: 1, cursor: 'pointer' }}
            >
              Profile
            </Box>
            <Box
              component="span"
              sx={{ color: 'inherit', px: 2, py: 1, cursor: 'pointer' }}
            >
              Logout
            </Box>
          </Box>
        </Toolbar>
      </AppBar>
      <Paper sx={{ p: 3, mt: 2 }}>
        <Typography variant="h5" gutterBottom>
          Welcome Back!
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Use the language switcher in the top right corner to change the
          interface language.
        </Typography>
      </Paper>
    </Box>
  ),
};
