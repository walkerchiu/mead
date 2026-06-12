import type { Meta, StoryObj } from '@storybook/nextjs';
import { NotificationMenu } from './NotificationMenu';
import { AppBar, Toolbar, Typography, Box, Alert } from '@mui/material';
import { useState } from 'react';
import { UnifiedNotification, NotificationType } from '@/types/notification';

/**
 * NotificationMenu Storybook Stories
 *
 * **重要說明**：
 * NotificationMenu 是需要外部資料的純 UI 元件（Organism）。
 *
 * **差異：NotificationMenu 與 NotificationCenter**：
 *
 * - **NotificationMenu**（此處的 Stories）：
 *   - 純 UI 元件，不處理資料取得
 *   - 需要透過 props 傳入 notifications、unreadCount 等
 *   - 可在任何地方重用（只要提供資料即可）
 *   - 最適合：當你已有資料來源時
 *
 * - **NotificationCenter**（請參閱 NotificationCenter Stories）：
 *   - 整合資料層，使用 useNotifications hook
 *   - 自動從 GraphQL 取得通知資料
 *   - 支援即時訂閱（WebSocket）
 *   - 內建錯誤處理與載入中狀態
 *   - 最適合：實際應用中的標準使用情境
 *
 * **使用建議**：
 * - 多數情況下，請在應用程式中使用 NotificationCenter
 * - 僅在需要自訂資料來源時才直接使用 NotificationMenu
 */

// Helper function to log actions
const logAction =
  (actionName: string) =>
  (...args: any[]) => {
    console.log(`[Storybook] ${actionName}`, args);
  };

const mockNotifications: UnifiedNotification[] = [
  {
    id: '1',
    type: NotificationType.INFO,
    title: 'System Maintenance',
    message:
      'System maintenance scheduled for tonight at 11:00 PM, estimated duration 2 hours',
    createdAt: new Date(Date.now() - 5 * 60 * 1000).toISOString(), // 5 minutes ago
    isRead: false,
  },
  {
    id: '2',
    type: NotificationType.SUCCESS,
    title: 'Password Updated',
    message:
      'Your password has been successfully updated. If this was not you, please contact support immediately',
    createdAt: new Date(Date.now() - 60 * 60 * 1000).toISOString(), // 1 hour ago
    isRead: true,
  },
  {
    id: '3',
    type: NotificationType.WARNING,
    title: 'Security Warning',
    message:
      'Login detected from a new device, Location: New York, IP: 192.168.1.1',
    createdAt: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(), // 1 day ago
    isRead: false,
  },
  {
    id: '4',
    type: NotificationType.ERROR,
    title: 'Payment Failed',
    message:
      'Your credit card payment failed. Please check your card information or use a different payment method',
    createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(), // 2 days ago
    isRead: false,
  },
  {
    id: '5',
    type: NotificationType.SYSTEM,
    title: 'Feature Update',
    message:
      'New features have been added to the system. Check the changelog for details',
    createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(), // 3 days ago
    isRead: true,
  },
  {
    id: '6',
    type: NotificationType.INFO,
    title: 'Event Notification',
    message: 'Annual sale event has started! Check out limited-time offers now',
    createdAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(), // 7 days ago
    isRead: true,
  },
];

/**
 * NotificationMenu 顯示通知鈴鐺圖示，並附帶顯示未讀數量的徽章
 * 並提供含通知列表的下拉選單。
 *
 * **功能特性**：
 * - 使用 NotificationBadge atom 作為觸發按鈕
 * - 顯示未讀通知數量的徽章
 * - **可點擊標題** - 點擊「Notifications」標題即可導向通知中心
 * - **設定按鈕** - 頁首中選用的設定圖示，用於通知偏好設定
 * - 含通知列表的下拉選單
 * - 不同的通知類型（info、success、warning、error、system）
 * - 標為已讀／全部標為已讀功能
 * - 清除所有通知
 * - 響應式時間顯示（例如「5 分鐘前」）
 *
 * **架構**：
 * - 由 NotificationBadge（atom）組成的 organism 元件
 * - 每則通知直接使用 MenuItem（比 NotificationList molecule 更簡單）
 * - NotificationList molecule 保留給整頁通知檢視使用
 */
const meta = {
  title: 'Shared/Organisms/NotificationMenu',
  component: NotificationMenu,
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component:
          '通知選單元件，於下拉選單中顯示通知並附帶徽章計數。由 NotificationBadge atom 組成。',
      },
    },
  },
  tags: ['autodocs'],
  argTypes: {
    unreadCount: {
      control: 'number',
      description: '未讀通知數量',
    },
    maxDisplay: {
      control: 'number',
      description: '選單中最多顯示的通知數量',
      table: {
        defaultValue: { summary: '5' },
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
    showSettings: {
      control: 'boolean',
      description: '在標題列（右側）顯示設定圖示按鈕',
      table: {
        defaultValue: { summary: 'false' },
      },
    },
  },
} satisfies Meta<typeof NotificationMenu>;

export default meta;
type Story = StoryObj<typeof meta>;

/**
 * 含未讀通知的預設通知選單
 *
 * **提示**：點擊「Notifications」標題即可導向通知中心
 */
export const Default: Story = {
  args: {
    unreadCount: 3,
    notifications: mockNotifications,
    onViewAll: logAction('navigate-to-notification-center'),
    onSettingsClick: logAction('settings-clicked'),
    onClearAll: logAction('clear-all'),
    showSettings: true,
  },
};

/**
 * 無通知狀態
 */
export const NoNotifications: Story = {
  args: {
    unreadCount: 0,
    notifications: [],
  },
};

/**
 * 全部為已讀通知
 *
 * 所有通知皆已讀 - 徽章顯示 0
 */
export const AllRead: Story = {
  args: {
    unreadCount: 0,
    notifications: mockNotifications.map((n) => ({ ...n, isRead: true })),
    showSettings: true,
    onViewAll: logAction('navigate-to-notification-center'),
    onSettingsClick: logAction('settings-clicked'),
    onClearAll: logAction('clear-all'),
  },
};

/**
 * 大量未讀通知（徽章顯示 99）
 */
export const ManyUnread: Story = {
  args: {
    unreadCount: 45,
    notifications: mockNotifications,
    onClearAll: logAction('clear-all'),
    showSettings: true,
  },
};

/**
 * 所有通知類型
 *
 * 顯示全部 5 種通知類型及其圖示與顏色
 */
export const AllTypes: Story = {
  args: {
    unreadCount: 5,
    notifications: [
      {
        id: '1',
        type: NotificationType.INFO,
        title: 'Info Notification',
        message: 'This is an informational notification',
        createdAt: new Date().toISOString(),
        isRead: false,
      },
      {
        id: '2',
        type: NotificationType.SUCCESS,
        title: 'Success Notification',
        message: 'This is a success notification',
        createdAt: new Date().toISOString(),
        isRead: false,
      },
      {
        id: '3',
        type: NotificationType.WARNING,
        title: 'Warning Notification',
        message: 'This is a warning notification',
        createdAt: new Date().toISOString(),
        isRead: false,
      },
      {
        id: '4',
        type: NotificationType.ERROR,
        title: 'Error Notification',
        message: 'This is an error notification',
        createdAt: new Date().toISOString(),
        isRead: false,
      },
      {
        id: '5',
        type: NotificationType.SYSTEM,
        title: 'System Notification',
        message: 'This is a system notification',
        createdAt: new Date().toISOString(),
        isRead: false,
      },
    ],
    showSettings: true,
    onClearAll: logAction('clear-all'),
  },
};

/**
 * 不同尺寸比較
 *
 * 並列顯示所有可用尺寸
 */
export const Sizes: Story = {
  render: () => (
    <Box sx={{ display: 'flex', gap: 4, alignItems: 'center', p: 3 }}>
      <Box sx={{ textAlign: 'center' }}>
        <Typography variant="caption" display="block" mb={1}>
          Small
        </Typography>
        <NotificationMenu
          size="small"
          unreadCount={5}
          notifications={mockNotifications}
          showSettings={true}
          onViewAll={logAction('small-view-all')}
          onSettingsClick={logAction('small-settings')}
          onClearAll={logAction('small-clear-all')}
        />
      </Box>
      <Box sx={{ textAlign: 'center' }}>
        <Typography variant="caption" display="block" mb={1}>
          Medium (Default)
        </Typography>
        <NotificationMenu
          size="medium"
          unreadCount={5}
          notifications={mockNotifications}
          showSettings={true}
          onViewAll={logAction('medium-view-all')}
          onSettingsClick={logAction('medium-settings')}
          onClearAll={logAction('medium-clear-all')}
        />
      </Box>
      <Box sx={{ textAlign: 'center' }}>
        <Typography variant="caption" display="block" mb={1}>
          Large
        </Typography>
        <NotificationMenu
          size="large"
          unreadCount={5}
          notifications={mockNotifications}
          showSettings={true}
          onViewAll={logAction('large-view-all')}
          onSettingsClick={logAction('large-settings')}
          onClearAll={logAction('large-clear-all')}
        />
      </Box>
    </Box>
  ),
};

/**
 * 不同顏色比較
 *
 * 顯示所有可用的顏色變體
 */
export const Colors: Story = {
  render: () => (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, p: 3 }}>
      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          gap: 2,
          p: 2,
          bgcolor: 'grey.100',
        }}
      >
        <Typography sx={{ width: 100 }}>Inherit:</Typography>
        <NotificationMenu
          color="inherit"
          unreadCount={3}
          notifications={mockNotifications}
          showSettings={true}
          onClearAll={logAction('inherit-clear-all')}
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
        <Typography sx={{ width: 100 }}>Primary:</Typography>
        <NotificationMenu
          color="primary"
          unreadCount={3}
          notifications={mockNotifications}
          showSettings={true}
          onClearAll={logAction('primary-clear-all')}
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
        <Typography sx={{ width: 100 }}>Secondary:</Typography>
        <NotificationMenu
          color="secondary"
          unreadCount={3}
          notifications={mockNotifications}
          showSettings={true}
          onClearAll={logAction('secondary-clear-all')}
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
        <Typography sx={{ width: 100 }}>Default:</Typography>
        <NotificationMenu
          color="default"
          unreadCount={3}
          notifications={mockNotifications}
          showSettings={true}
          onClearAll={logAction('default-clear-all')}
        />
      </Box>
    </Box>
  ),
};

/**
 * 置於 AppBar 情境中（典型使用情境）
 */
export const InAppBar: Story = {
  args: {
    color: 'inherit',
    unreadCount: 5,
    notifications: mockNotifications,
    showSettings: true,
    onViewAll: logAction('navigate-to-notification-center'),
    onSettingsClick: logAction('settings-clicked'),
    onClearAll: logAction('clear-all'),
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
 * 不含設定按鈕
 *
 * 不含設定圖示的精簡版本
 */
export const WithoutSettings: Story = {
  args: {
    unreadCount: 3,
    notifications: mockNotifications,
    showSettings: false,
    onViewAll: logAction('view-all'),
    onClearAll: logAction('clear-all'),
  },
};

/**
 * 限制顯示數量
 *
 * 下拉選單中僅顯示 3 則通知
 */
export const LimitedDisplay: Story = {
  args: {
    unreadCount: 3,
    notifications: mockNotifications,
    maxDisplay: 3,
    showSettings: true,
    onViewAll: logAction('view-all'),
    onClearAll: logAction('clear-all'),
  },
  decorators: [
    (Story) => (
      <Box sx={{ p: 3 }}>
        <Alert severity="info" sx={{ mb: 2 }}>
          Maximum 3 notifications displayed, click "View All" to see the
          complete list
        </Alert>
        <Story />
      </Box>
    ),
  ],
};

/**
 * 含大量未讀（徽章溢出）
 *
 * 數量超過 99 時徽章顯示「99+」
 */
export const ManyUnreadBadge: Story = {
  args: {
    unreadCount: 125,
    notifications: mockNotifications,
    showSettings: true,
    onClearAll: logAction('clear-all'),
  },
  decorators: [
    (Story) => (
      <Box sx={{ p: 3 }}>
        <Alert severity="info" sx={{ mb: 2 }}>
          When unread count exceeds 99, badge shows "99+"
        </Alert>
        <Story />
      </Box>
    ),
  ],
};

/**
 * 長內容處理
 *
 * 以極長的標題與訊息測試文字溢出
 */
export const LongContent: Story = {
  args: {
    unreadCount: 2,
    notifications: [
      {
        id: '1',
        type: NotificationType.INFO,
        title:
          'This is a very very very very very very very very very very long notification title to test text overflow behavior',
        message:
          'This is a very very very very very very very very very very very very very very long notification message content to test how the component handles text truncation and ellipsis display when content is too long. This text should be limited to a specific number of lines and the overflow part will be displayed with ellipsis.',
        createdAt: new Date().toISOString(),
        isRead: false,
      },
      {
        id: '2',
        type: NotificationType.WARNING,
        title: 'Normal length title',
        message: 'Normal length content',
        createdAt: new Date().toISOString(),
        isRead: false,
      },
    ],
    showSettings: true,
    onClearAll: logAction('clear-all'),
  },
};

/**
 * 含狀態的互動範例
 *
 * 完全可互動的範例，你可在其中將通知標為已讀／未讀
 */
export const Interactive: Story = {
  render: () => {
    const [notifications, setNotifications] =
      useState<UnifiedNotification[]>(mockNotifications);
    const unreadCount = notifications.filter((n) => !n.isRead).length;

    return (
      <Box>
        <Box sx={{ p: 3, bgcolor: 'grey.50' }}>
          <Alert severity="info" sx={{ mb: 2 }}>
            <strong>Interactive Test:</strong> Click notifications to mark as
            read and observe badge number changes
          </Alert>
          <Typography variant="body2" gutterBottom>
            Unread count: <strong>{unreadCount}</strong> /{' '}
            {notifications.length}
          </Typography>
        </Box>
        <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}>
          <NotificationMenu
            unreadCount={unreadCount}
            notifications={notifications}
            showSettings={true}
            onNotificationClick={(notification) => {
              setNotifications((prev) =>
                prev.map((n) =>
                  n.id === notification.id ? { ...n, isRead: true } : n,
                ),
              );
            }}
            onMarkAllAsRead={() => {
              setNotifications((prev) =>
                prev.map((n) => ({ ...n, isRead: true })),
              );
            }}
            onClearAll={() => {
              setNotifications([]);
            }}
          />
        </Box>
      </Box>
    );
  },
};

/**
 * 實際整合範例
 *
 * 展示 NotificationMenu 與路由整合的完整範例，
 * 狀態管理與所有回呼處理器。
 */
export const RealWorldExample: Story = {
  render: () => {
    const [notifications, setNotifications] =
      useState<UnifiedNotification[]>(mockNotifications);
    const [lastAction, setLastAction] = useState<string>('');
    const unreadCount = notifications.filter((n) => !n.isRead).length;

    const handleViewAll = () => {
      setLastAction('✅ Navigated to /notifications (notification center)');
      console.log('[App] router.push("/notifications")');
    };

    const handleNotificationClick = (notification: UnifiedNotification) => {
      setLastAction(`📬 Clicked notification: "${notification.title}"`);

      // Auto mark as read
      setNotifications((prev) =>
        prev.map((n) =>
          n.id === notification.id ? { ...n, isRead: true } : n,
        ),
      );

      // Navigate to action URL or detail page
      if (notification.actionUrl) {
        console.log(
          '[App] router.push(notification.actionUrl):',
          notification.actionUrl,
        );
      } else {
        console.log('[App] router.push("/notifications/" + notification.id)');
      }
    };

    const handleMarkAsRead = (id: string) => {
      setLastAction(`✓ Marked notification ${id} as read`);
      setNotifications((prev) =>
        prev.map((n) => (n.id === id ? { ...n, isRead: true } : n)),
      );
    };

    const handleMarkAllAsRead = () => {
      setLastAction('✓✓ Marked all notifications as read');
      setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
    };

    const handleClearAll = () => {
      setLastAction('🗑️ Cleared all notifications');
      setNotifications([]);
    };

    const handleSettings = () => {
      setLastAction('⚙️ Navigated to notification settings');
      console.log('[App] router.push("/settings/notifications")');
    };

    return (
      <Box sx={{ width: '100%', minWidth: 700 }}>
        <AppBar position="static">
          <Toolbar>
            <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
              Dashboard
            </Typography>
            <NotificationMenu
              color="inherit"
              unreadCount={unreadCount}
              notifications={notifications}
              showSettings={true}
              onNotificationClick={handleNotificationClick}
              onMarkAsRead={handleMarkAsRead}
              onMarkAllAsRead={handleMarkAllAsRead}
              onViewAll={handleViewAll}
              onSettingsClick={handleSettings}
              onClearAll={handleClearAll}
            />
          </Toolbar>
        </AppBar>

        <Box sx={{ p: 3 }}>
          {lastAction && (
            <Alert severity="info" sx={{ mb: 2 }}>
              <strong>Last Action:</strong> {lastAction}
            </Alert>
          )}

          <Typography variant="body2" color="text.secondary" gutterBottom>
            <strong>Features:</strong>
          </Typography>
          <Box component="ul" sx={{ mt: 1, pl: 3 }}>
            <Typography component="li" variant="body2" color="text.secondary">
              🔔 Badge shows {unreadCount} unread notifications
            </Typography>
            <Typography component="li" variant="body2" color="text.secondary">
              📬 Click notification → Auto mark as read + Navigate
            </Typography>
            <Typography component="li" variant="body2" color="text.secondary">
              📋 Click "Notifications" title → Navigate to /notifications
            </Typography>
            <Typography component="li" variant="body2" color="text.secondary">
              ⚙️ Settings icon → Navigate to /settings/notifications
            </Typography>
            <Typography component="li" variant="body2" color="text.secondary">
              ✓ "Mark All as Read" button → Batch update
            </Typography>
            <Typography component="li" variant="body2" color="text.secondary">
              🗑️ "Clear All" button → Remove all notifications
            </Typography>
          </Box>
        </Box>
      </Box>
    );
  },
};
