import type { Meta, StoryObj } from '@storybook/nextjs';
import { NotificationBadge } from './NotificationBadge';
import { Box, AppBar, Toolbar, Typography } from '@mui/material';

// Helper function to log actions
const logAction =
  (actionName: string) =>
  (...args: any[]) => {
    console.log(`[Storybook Action] ${actionName}`, args);
  };

/**
 * NotificationBadge 顯示一個通知圖示，並附帶顯示未讀數量的徽章。
 *
 * **功能特性**：
 * - 顯示未讀通知數量的徽章
 * - 多種顏色變體
 * - 不同尺寸
 * - 滑鼠移入時顯示工具提示
 *
 * **使用情境**：
 * - 應用程式標題列通知按鈕
 * - 儀表板通知小工具
 * - 任何需要通知指示器的位置
 */
const meta = {
  title: 'Shared/Atoms/NotificationBadge',
  component: NotificationBadge,
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component: '通知徽章按鈕，顯示鈴鐺圖示並附帶未讀數量徽章。',
      },
    },
  },
  tags: ['autodocs'],
  argTypes: {
    unreadCount: {
      control: 'number',
      description: '未讀通知數量',
      table: {
        defaultValue: { summary: '0' },
      },
    },
    color: {
      control: 'select',
      options: ['inherit', 'primary', 'secondary', 'default'],
      description: '按鈕顏色',
      table: {
        defaultValue: { summary: 'inherit' },
      },
    },
    size: {
      control: 'select',
      options: ['small', 'medium', 'large'],
      description: '圖示按鈕尺寸',
      table: {
        defaultValue: { summary: 'medium' },
      },
    },
    tooltipTitle: {
      control: 'text',
      description: '工具提示文字',
      table: {
        defaultValue: { summary: 'Notifications' },
      },
    },
  },
} satisfies Meta<typeof NotificationBadge>;

export default meta;
type Story = StoryObj<typeof meta>;

/**
 * 無未讀通知的預設通知徽章
 */
export const Default: Story = {
  args: {
    unreadCount: 0,
    onClick: logAction('badge-clicked'),
  },
};

/**
 * 含未讀通知的徽章
 */
export const WithUnread: Story = {
  args: {
    unreadCount: 5,
    onClick: logAction('badge-clicked'),
  },
};

/**
 * 含大量未讀通知的徽章（顯示 99）
 */
export const ManyUnread: Story = {
  args: {
    unreadCount: 45,
    onClick: logAction('badge-clicked'),
  },
};

/**
 * 含超過 100 則未讀通知的徽章（顯示 99+）
 */
export const OverHundred: Story = {
  args: {
    unreadCount: 123,
    onClick: logAction('badge-clicked'),
  },
};

/**
 * 置於 AppBar 中（典型使用情境）
 */
export const InAppBar: Story = {
  args: {
    color: 'inherit',
    unreadCount: 12,
    onClick: logAction('badge-clicked'),
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
 * 不同尺寸
 */
export const Sizes: Story = {
  render: () => (
    <Box sx={{ display: 'flex', alignItems: 'center', gap: 3 }}>
      <Box sx={{ textAlign: 'center' }}>
        <NotificationBadge
          size="small"
          unreadCount={5}
          onClick={logAction('small-clicked')}
        />
        <Typography variant="caption" display="block" sx={{ mt: 1 }}>
          Small
        </Typography>
      </Box>
      <Box sx={{ textAlign: 'center' }}>
        <NotificationBadge
          size="medium"
          unreadCount={5}
          onClick={logAction('medium-clicked')}
        />
        <Typography variant="caption" display="block" sx={{ mt: 1 }}>
          Medium
        </Typography>
      </Box>
      <Box sx={{ textAlign: 'center' }}>
        <NotificationBadge
          size="large"
          unreadCount={5}
          onClick={logAction('large-clicked')}
        />
        <Typography variant="caption" display="block" sx={{ mt: 1 }}>
          Large
        </Typography>
      </Box>
    </Box>
  ),
};

/**
 * 不同顏色
 */
export const Colors: Story = {
  render: () => (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          gap: 2,
          p: 2,
          bgcolor: 'grey.100',
        }}
      >
        <Typography variant="body2" sx={{ width: 120 }}>
          Inherit:
        </Typography>
        <NotificationBadge
          color="inherit"
          unreadCount={5}
          onClick={logAction('inherit-clicked')}
        />
      </Box>
      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          gap: 2,
          p: 2,
          bgcolor: 'grey.100',
        }}
      >
        <Typography variant="body2" sx={{ width: 120 }}>
          Primary:
        </Typography>
        <NotificationBadge
          color="primary"
          unreadCount={5}
          onClick={logAction('primary-clicked')}
        />
      </Box>
      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          gap: 2,
          p: 2,
          bgcolor: 'grey.100',
        }}
      >
        <Typography variant="body2" sx={{ width: 120 }}>
          Secondary:
        </Typography>
        <NotificationBadge
          color="secondary"
          unreadCount={5}
          onClick={logAction('secondary-clicked')}
        />
      </Box>
      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          gap: 2,
          p: 2,
          bgcolor: 'grey.100',
        }}
      >
        <Typography variant="body2" sx={{ width: 120 }}>
          Default:
        </Typography>
        <NotificationBadge
          color="default"
          unreadCount={5}
          onClick={logAction('default-clicked')}
        />
      </Box>
    </Box>
  ),
};

/**
 * 自訂工具提示
 */
export const CustomTooltip: Story = {
  args: {
    unreadCount: 7,
    tooltipTitle: 'You have 7 unread notifications',
    onClick: logAction('badge-clicked'),
  },
};
