import type { Meta, StoryObj } from '@storybook/nextjs';
import { PageHeader } from './PageHeader';
import { Button, IconButton, Box } from '@mui/material';
import {
  Refresh as RefreshIcon,
  Download as DownloadIcon,
  Settings as SettingsIcon,
  Assessment as AssessmentIcon,
  Computer as ComputerIcon,
} from '@mui/icons-material';

const meta = {
  title: 'Shared/Molecules/PageHeader',
  component: PageHeader,
  parameters: {
    layout: 'fullscreen',
    docs: {
      description: {
        component: `
PageHeader component provides a consistent page title area following Material Design 3 and HQ UI best practices.

**Features:**
- Clear visual hierarchy
- Breadcrumb navigation support
- Flexible action button area
- Responsive design
- Full accessibility support

**Use Cases:**
- HQ dashboard pages
- Data list pages
- Detail pages
        `,
      },
    },
  },
  tags: ['autodocs'],
  argTypes: {
    title: {
      control: 'text',
      description: '頁面標題',
    },
    description: {
      control: 'text',
      description: '頁面說明',
    },
    showBackButton: {
      control: 'boolean',
      description: '是否顯示返回按鈕',
    },
    elevated: {
      control: 'boolean',
      description: '是否使用卡片樣式',
    },
    icon: {
      control: false,
      description: '頁面圖示',
    },
    breadcrumbs: {
      control: 'object',
      description: '麵包屑導覽',
    },
    actions: {
      control: false,
      description: '右側操作按鈕',
    },
  },
} satisfies Meta<typeof PageHeader>;

export default meta;
type Story = StoryObj<typeof PageHeader>;

/**
 * 基本用法 - 僅標題
 */
export const Basic: Story = {
  args: {
    title: 'Basic Title',
  },
  render: (args) => (
    <Box sx={{ p: 3, bgcolor: 'background.default', minHeight: '400px' }}>
      <PageHeader {...args} />
    </Box>
  ),
};

/**
 * 含說明
 */
export const WithDescription: Story = {
  args: {
    title: 'Page Title',
    description: '這是一段說明文字，用於闡述此頁面的主要功能與用途。',
  },
  render: (args) => (
    <Box sx={{ p: 3, bgcolor: 'background.default', minHeight: '400px' }}>
      <PageHeader {...args} />
    </Box>
  ),
};

/**
 * 含圖示
 */
export const WithIcon: Story = {
  args: {
    title: 'Audit Logs',
    description: '檢視系統操作記錄、使用者活動與安全事件',
    icon: '📊',
  },
  render: (args) => (
    <Box sx={{ p: 3, bgcolor: 'background.default', minHeight: '400px' }}>
      <PageHeader {...args} />
    </Box>
  ),
};

/**
 * 含返回按鈕
 */
export const WithBackButton: Story = {
  args: {
    title: 'Detail Page',
    description: '檢視詳細資訊',
    showBackButton: true,
    onBack: () => alert('Back to previous page'),
    backAriaLabel: 'Back to list',
  },
  render: (args) => (
    <Box sx={{ p: 3, bgcolor: 'background.default', minHeight: '400px' }}>
      <PageHeader {...args} />
    </Box>
  ),
};

/**
 * 含麵包屑
 */
export const WithBreadcrumbs: Story = {
  args: {
    title: 'Audit Logs',
    description: '檢視系統操作記錄、使用者活動與安全事件',
    icon: <AssessmentIcon sx={{ fontSize: '2rem', color: 'primary.main' }} />,
    breadcrumbs: [
      { label: 'Home', href: '/', onClick: () => console.log('Home') },
      { label: 'HQ', href: '/hq', onClick: () => console.log('HQ') },
      { label: 'Audit Logs' },
    ],
  },
  render: (args) => (
    <Box sx={{ p: 3, bgcolor: 'background.default', minHeight: '400px' }}>
      <PageHeader {...args} />
    </Box>
  ),
};

/**
 * 含單一操作按鈕
 */
export const WithSingleAction: Story = {
  args: {
    title: 'Session Management',
    description: '管理使用者登入狀態、撤銷 session 並監控裝置活動',
    icon: <ComputerIcon sx={{ fontSize: '2rem', color: 'primary.main' }} />,
    showBackButton: true,
    onBack: () => alert('Back'),
    actions: (
      <Button variant="outlined" startIcon={<RefreshIcon />}>
        Refresh
      </Button>
    ),
  },
  render: (args) => (
    <Box sx={{ p: 3, bgcolor: 'background.default', minHeight: '400px' }}>
      <PageHeader {...args} />
    </Box>
  ),
};

/**
 * 含多個操作按鈕
 */
export const WithMultipleActions: Story = {
  args: {
    title: 'Audit Logs',
    description: '檢視系統操作記錄、使用者活動與安全事件',
    icon: <AssessmentIcon sx={{ fontSize: '2rem', color: 'primary.main' }} />,
    showBackButton: true,
    onBack: () => alert('Back'),
    breadcrumbs: [
      { label: 'Home', href: '/' },
      { label: 'HQ', href: '/hq' },
      { label: 'Audit Logs' },
    ],
    actions: (
      <Box sx={{ display: 'flex', gap: 1 }}>
        <IconButton aria-label="Download">
          <DownloadIcon />
        </IconButton>
        <IconButton aria-label="Settings">
          <SettingsIcon />
        </IconButton>
        <Button variant="contained" startIcon={<RefreshIcon />}>
          Refresh
        </Button>
      </Box>
    ),
  },
  render: (args) => (
    <Box sx={{ p: 3, bgcolor: 'background.default', minHeight: '400px' }}>
      <PageHeader {...args} />
    </Box>
  ),
};

/**
 * 非浮起樣式（扁平）
 */
export const NonElevated: Story = {
  args: {
    title: 'Flat Style Title',
    description: '無卡片樣式，直接顯示於背景上',
    icon: '🎨',
    elevated: false,
    actions: (
      <Button variant="outlined" startIcon={<RefreshIcon />}>
        Refresh
      </Button>
    ),
  },
  render: (args) => (
    <Box sx={{ p: 3, bgcolor: 'background.default', minHeight: '400px' }}>
      <PageHeader {...args} />
    </Box>
  ),
};

/**
 * 稽核日誌完整範例
 */
export const AuditLogsExample: Story = {
  args: {
    title: 'Audit Logs',
    description: '檢視系統操作記錄、使用者活動與安全事件',
    icon: <AssessmentIcon sx={{ fontSize: '2rem', color: 'primary.main' }} />,
    showBackButton: true,
    onBack: () => alert('Back to Dashboard'),
    breadcrumbs: [
      { label: 'Dashboard', href: '/dashboard' },
      { label: 'HQ', href: '/hq' },
      { label: 'Audit Logs' },
    ],
    actions: (
      <Button
        variant="outlined"
        startIcon={<RefreshIcon />}
        onClick={() => alert('Refresh')}
      >
        Refresh
      </Button>
    ),
  },
  render: (args) => (
    <Box sx={{ bgcolor: 'background.default', minHeight: '100vh', p: 3 }}>
      <PageHeader {...args} />
      <Box sx={{ mt: 3, p: 3, bgcolor: 'background.paper', borderRadius: 2 }}>
        <p>頁面內容區……</p>
      </Box>
    </Box>
  ),
};

/**
 * Session 管理完整範例
 */
export const SessionsExample: Story = {
  args: {
    title: 'Session Management',
    description: '管理使用者登入狀態、撤銷 session 並監控裝置活動',
    icon: <ComputerIcon sx={{ fontSize: '2rem', color: 'primary.main' }} />,
    showBackButton: true,
    onBack: () => alert('Back to Dashboard'),
    breadcrumbs: [
      { label: 'Dashboard', href: '/dashboard' },
      { label: 'HQ', href: '/hq' },
      { label: 'Session Management' },
    ],
    actions: (
      <Button
        variant="outlined"
        startIcon={<RefreshIcon />}
        onClick={() => alert('Refresh')}
      >
        Refresh
      </Button>
    ),
  },
  render: (args) => (
    <Box sx={{ bgcolor: 'background.default', minHeight: '100vh', p: 3 }}>
      <PageHeader {...args} />
      <Box sx={{ mt: 3, p: 3, bgcolor: 'background.paper', borderRadius: 2 }}>
        <p>頁面內容區……</p>
      </Box>
    </Box>
  ),
};

/**
 * 響應式展示
 */
export const Responsive: Story = {
  args: {
    title: 'Responsive Title',
    description: '依不同螢幕尺寸自動調整樣式',
    icon: '📱',
    showBackButton: true,
    onBack: () => alert('Back'),
    actions: (
      <Button variant="contained" startIcon={<RefreshIcon />}>
        Action
      </Button>
    ),
  },
  render: (args) => (
    <Box sx={{ bgcolor: 'background.default', minHeight: '400px', p: 3 }}>
      <PageHeader {...args} />
      <Box sx={{ mt: 2, p: 2, bgcolor: 'info.light', borderRadius: 1 }}>
        <p>💡 提示：調整瀏覽器視窗大小即可觀察響應式效果</p>
      </Box>
    </Box>
  ),
};
