import type { Meta, StoryObj } from '@storybook/react';
import { MainAppBar } from './MainAppBar';
import { Box } from '@mui/material';

/**
 * MainAppBar 是統一的應用程式導覽列元件
 *
 * **特性**:
 * - 支援文字標題或 Logo
 * - 標題/Logo 可設定超連結
 * - 內建語言切換器
 * - 內建設定選單（Profile、Security、Logout）
 * - 可選的返回按鈕
 *
 * **使用場景**:
 * - 應用程式頂部導覽列
 * - 管理後台頁面標題列
 * - 需要統一 UI 的頁面 header
 */
const meta = {
  title: 'Organisms/MainAppBar',
  component: MainAppBar,
  parameters: {
    layout: 'fullscreen',
    docs: {
      description: {
        component:
          'Unified application navigation bar with title/logo, language switcher, and settings menu.',
      },
    },
  },
  tags: ['autodocs'],
  argTypes: {
    title: {
      control: 'text',
      description: 'Page title text',
    },
    titleLink: {
      control: 'text',
      description: 'Link URL for title/logo (optional)',
    },
    showBackButton: {
      control: 'boolean',
      description: 'Show back button',
      table: {
        defaultValue: { summary: 'false' },
      },
    },
    backPath: {
      control: 'text',
      description: 'Back button navigation path',
      table: {
        defaultValue: { summary: '/dashboard' },
      },
    },
  },
} satisfies Meta<typeof MainAppBar>;

export default meta;
type Story = StoryObj<typeof meta>;

/**
 * 預設的文字標題樣式
 */
export const Default: Story = {
  render: (args) => (
    <Box>
      <MainAppBar {...args} />
      <Box sx={{ p: 3 }}>
        <p>Page content goes here...</p>
      </Box>
    </Box>
  ),
  args: {
    title: 'Dashboard',
  },
};

/**
 * 標題帶有超連結
 */
export const WithTitleLink: Story = {
  render: (args) => (
    <Box>
      <MainAppBar {...args} />
      <Box sx={{ p: 3 }}>
        <p>Click the title to navigate to home page</p>
      </Box>
    </Box>
  ),
  args: {
    title: 'My Application',
    titleLink: '/',
  },
};

/**
 * 使用 Logo（文字 Logo 示例）
 */
export const WithTextLogo: Story = {
  render: (args) => (
    <Box>
      <MainAppBar {...args} />
      <Box sx={{ p: 3 }}>
        <p>Using a custom text logo with link</p>
      </Box>
    </Box>
  ),
  args: {
    logo: (
      <Box
        sx={{
          fontSize: '1.5rem',
          fontWeight: 'bold',
          color: 'white',
          px: 1,
        }}
      >
        LOGO
      </Box>
    ),
    titleLink: '/',
  },
};

/**
 * Logo 加標題組合
 */
export const LogoWithTitle: Story = {
  render: (args) => (
    <Box>
      <MainAppBar {...args} />
      <Box sx={{ p: 3 }}>
        <p>Logo and title combined with a clickable link</p>
      </Box>
    </Box>
  ),
  args: {
    logo: (
      <Box
        sx={{
          width: 32,
          height: 32,
          borderRadius: '50%',
          bgcolor: 'white',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontWeight: 'bold',
          color: 'primary.main',
        }}
      >
        A
      </Box>
    ),
    title: 'My App',
    titleLink: '/dashboard',
  },
};

/**
 * 帶有返回按鈕
 */
export const WithBackButton: Story = {
  render: (args) => (
    <Box>
      <MainAppBar {...args} />
      <Box sx={{ p: 3 }}>
        <p>Shows back button on the left</p>
      </Box>
    </Box>
  ),
  args: {
    title: 'Settings',
    showBackButton: true,
    backPath: '/dashboard',
  },
};

/**
 * 完整功能展示（Logo + 標題 + 返回按鈕 + 連結）
 */
export const FullFeatures: Story = {
  render: (args) => (
    <Box>
      <MainAppBar {...args} />
      <Box sx={{ p: 3 }}>
        <p>All features enabled: logo, title, link, and back button</p>
      </Box>
    </Box>
  ),
  args: {
    logo: (
      <Box
        sx={{
          width: 40,
          height: 40,
          borderRadius: 1,
          bgcolor: 'white',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontWeight: 'bold',
          color: 'primary.main',
        }}
      >
        🚀
      </Box>
    ),
    title: 'User Profile',
    titleLink: '/',
    showBackButton: true,
    backPath: '/dashboard',
  },
};

/**
 * Dashboard Header 示例
 */
export const DashboardHeader: Story = {
  render: () => (
    <Box>
      <MainAppBar
        logo={
          <Box
            sx={{
              fontSize: '1.75rem',
              fontWeight: 'bold',
              color: 'white',
            }}
          >
            📊
          </Box>
        }
        title="Dashboard"
        titleLink="/dashboard"
      />
      <Box sx={{ p: 3, bgcolor: 'grey.50', minHeight: '400px' }}>
        <h2>Welcome to Dashboard</h2>
        <p>Click the logo and title to go back to homepage</p>
      </Box>
    </Box>
  ),
};

/**
 * 僅 Logo 不含標題
 */
export const LogoOnly: Story = {
  render: (args) => (
    <Box>
      <MainAppBar {...args} />
      <Box sx={{ p: 3 }}>
        <p>Only logo, no title text</p>
      </Box>
    </Box>
  ),
  args: {
    logo: (
      <Box
        sx={{
          fontSize: '2rem',
          fontWeight: 'bold',
          color: 'white',
          px: 2,
        }}
      >
        MY BRAND
      </Box>
    ),
    titleLink: '/',
  },
};
