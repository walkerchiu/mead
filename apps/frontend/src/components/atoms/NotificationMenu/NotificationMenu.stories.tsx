import type { Meta, StoryObj } from '@storybook/react';
import { NotificationMenu, type Notification } from './NotificationMenu';
import { AppBar, Toolbar, Typography, Box } from '@mui/material';

const mockNotifications: Notification[] = [
  {
    id: '1',
    type: 'info',
    title: '系統維護通知',
    message: '系統將於今晚 23:00 進行維護，預計維護時間 2 小時',
    timestamp: new Date(Date.now() - 5 * 60 * 1000), // 5 minutes ago
    read: false,
  },
  {
    id: '2',
    type: 'success',
    title: '密碼已更新',
    message: '您的密碼已成功更新，如非本人操作請立即聯繫客服',
    timestamp: new Date(Date.now() - 60 * 60 * 1000), // 1 hour ago
    read: true,
  },
  {
    id: '3',
    type: 'warning',
    title: '安全警告',
    message: '檢測到來自新裝置的登入，地點：台北市，IP: 192.168.1.1',
    timestamp: new Date(Date.now() - 24 * 60 * 60 * 1000), // 1 day ago
    read: false,
  },
  {
    id: '4',
    type: 'error',
    title: '付款失敗',
    message: '您的信用卡付款失敗，請檢查卡片資訊或更換付款方式',
    timestamp: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000), // 2 days ago
    read: false,
  },
  {
    id: '5',
    type: 'system',
    title: '功能更新',
    message: '系統已新增多項功能，請查看更新日誌了解詳情',
    timestamp: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000), // 3 days ago
    read: true,
  },
  {
    id: '6',
    type: 'info',
    title: '活動通知',
    message: '年度優惠活動開始了！立即查看限時優惠商品',
    timestamp: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000), // 7 days ago
    read: true,
  },
];

/**
 * NotificationMenu displays a bell icon with badge showing unread count
 * and provides a dropdown menu with notification list.
 *
 * **Features**:
 * - Badge showing unread notification count
 * - Dropdown menu with notification list
 * - Different notification types (info, success, warning, error, system)
 * - Mark as read / Mark all as read functionality
 * - View all notifications
 * - Clear all notifications
 * - Responsive time display (e.g., "5 minutes ago")
 *
 * **Use Cases**:
 * - Application header notification center
 * - Dashboard notification widget
 * - Real-time notification system
 */
const meta = {
  title: 'Atoms/NotificationMenu',
  component: NotificationMenu,
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component:
          'A notification menu component that displays notifications in a dropdown menu with badge counter.',
      },
    },
  },
  tags: ['autodocs'],
  argTypes: {
    unreadCount: {
      control: 'number',
      description: 'Number of unread notifications',
    },
    maxDisplay: {
      control: 'number',
      description: 'Maximum number of notifications to display in menu',
      table: {
        defaultValue: { summary: '5' },
      },
    },
    size: {
      control: 'select',
      options: ['small', 'medium', 'large'],
      description: 'Size of the icon button',
      table: {
        defaultValue: { summary: 'medium' },
      },
    },
    color: {
      control: 'select',
      options: ['inherit', 'primary', 'secondary', 'default'],
      description: 'Color of the button',
      table: {
        defaultValue: { summary: 'inherit' },
      },
    },
    onNotificationClick: {
      action: 'notification clicked',
    },
    onMarkAsRead: {
      action: 'mark as read',
    },
    onMarkAllAsRead: {
      action: 'mark all as read',
    },
    onViewAll: {
      action: 'view all clicked',
    },
    onClearAll: {
      action: 'clear all clicked',
    },
  },
} satisfies Meta<typeof NotificationMenu>;

export default meta;
type Story = StoryObj<typeof meta>;

/**
 * Default notification menu with unread notifications
 */
export const Default: Story = {
  args: {
    unreadCount: 3,
    notifications: mockNotifications,
  },
};

/**
 * No notifications state
 */
export const NoNotifications: Story = {
  args: {
    unreadCount: 0,
    notifications: [],
  },
};

/**
 * Many unread notifications (badge shows 99)
 */
export const ManyUnread: Story = {
  args: {
    unreadCount: 45,
    notifications: mockNotifications,
  },
};

/**
 * Over 100 unread notifications (badge shows 99+)
 */
export const OverHundred: Story = {
  args: {
    unreadCount: 123,
    notifications: mockNotifications,
  },
};

/**
 * Only unread notifications
 */
export const OnlyUnread: Story = {
  args: {
    unreadCount: 3,
    notifications: mockNotifications.filter((n) => !n.read),
  },
};

/**
 * All read notifications
 */
export const AllRead: Story = {
  args: {
    unreadCount: 0,
    notifications: mockNotifications.map((n) => ({ ...n, read: true })),
  },
};

/**
 * Different notification types
 */
export const DifferentTypes: Story = {
  render: () => (
    <Box sx={{ display: 'flex', gap: 2, flexDirection: 'column' }}>
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
        <Typography variant="body2" sx={{ width: 100 }}>
          Info:
        </Typography>
        <NotificationMenu
          unreadCount={1}
          notifications={mockNotifications.filter((n) => n.type === 'info')}
        />
      </Box>
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
        <Typography variant="body2" sx={{ width: 100 }}>
          Success:
        </Typography>
        <NotificationMenu
          unreadCount={1}
          notifications={mockNotifications.filter((n) => n.type === 'success')}
        />
      </Box>
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
        <Typography variant="body2" sx={{ width: 100 }}>
          Warning:
        </Typography>
        <NotificationMenu
          unreadCount={1}
          notifications={mockNotifications.filter((n) => n.type === 'warning')}
        />
      </Box>
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
        <Typography variant="body2" sx={{ width: 100 }}>
          Error:
        </Typography>
        <NotificationMenu
          unreadCount={1}
          notifications={mockNotifications.filter((n) => n.type === 'error')}
        />
      </Box>
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
        <Typography variant="body2" sx={{ width: 100 }}>
          System:
        </Typography>
        <NotificationMenu
          unreadCount={1}
          notifications={mockNotifications.filter((n) => n.type === 'system')}
        />
      </Box>
    </Box>
  ),
};

/**
 * Small size button
 */
export const Small: Story = {
  args: {
    size: 'small',
    unreadCount: 5,
    notifications: mockNotifications,
  },
};

/**
 * Large size button
 */
export const Large: Story = {
  args: {
    size: 'large',
    unreadCount: 5,
    notifications: mockNotifications,
  },
};

/**
 * Primary color
 */
export const Primary: Story = {
  args: {
    color: 'primary',
    unreadCount: 5,
    notifications: mockNotifications,
  },
};

/**
 * In AppBar (typical use case)
 */
export const InAppBar: Story = {
  args: {
    color: 'inherit',
    unreadCount: 5,
    notifications: mockNotifications,
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
 * In AppBar with other elements
 */
export const InAppBarWithOthers: Story = {
  args: {
    color: 'inherit',
    unreadCount: 12,
    notifications: mockNotifications,
  },
  decorators: [
    (Story) => (
      <Box sx={{ width: '100%', minWidth: 800 }}>
        <AppBar position="static">
          <Toolbar>
            <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
              My Application
            </Typography>
            <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
              <Story />
              <Box
                component="span"
                sx={{
                  color: 'inherit',
                  px: 2,
                  py: 1,
                  cursor: 'pointer',
                  borderRadius: 1,
                  '&:hover': {
                    bgcolor: 'rgba(255, 255, 255, 0.1)',
                  },
                }}
              >
                🌐 EN
              </Box>
              <Box
                component="span"
                sx={{
                  color: 'inherit',
                  px: 2,
                  py: 1,
                  cursor: 'pointer',
                  borderRadius: 1,
                  '&:hover': {
                    bgcolor: 'rgba(255, 255, 255, 0.1)',
                  },
                }}
              >
                ⚙️ Settings
              </Box>
            </Box>
          </Toolbar>
        </AppBar>
      </Box>
    ),
  ],
};

/**
 * Limit displayed notifications
 */
export const LimitedDisplay: Story = {
  args: {
    unreadCount: 6,
    notifications: mockNotifications,
    maxDisplay: 3,
  },
};

/**
 * Interactive example
 */
export const Interactive: Story = {
  args: {
    unreadCount: 3,
    notifications: mockNotifications,
  },
  render: (args) => (
    <Box sx={{ textAlign: 'center' }}>
      <Box
        sx={{
          mb: 2,
          p: 3,
          border: 1,
          borderColor: 'divider',
          borderRadius: 1,
        }}
      >
        <Typography variant="h6" gutterBottom>
          Try the Notification Menu
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
          Click the bell icon to see notifications
        </Typography>
        <NotificationMenu {...args} />
      </Box>
      <Typography variant="caption" color="text.secondary">
        Click on notifications to mark them as read
      </Typography>
    </Box>
  ),
};
