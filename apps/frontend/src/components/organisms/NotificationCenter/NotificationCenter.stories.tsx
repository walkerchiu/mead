import type { Meta, StoryObj } from '@storybook/nextjs';
import { NotificationCenter } from './NotificationCenter';
import { NotificationMenu } from '@/components/organisms/NotificationMenu';
import {
  Box,
  AppBar,
  Toolbar,
  Typography,
  Alert,
  Menu,
  IconButton,
  CircularProgress,
  Button,
} from '@mui/material';
import {
  Refresh as RefreshIcon,
  Settings as SettingsIcon,
} from '@mui/icons-material';
import { useState } from 'react';
import { NotificationType, UnifiedNotification } from '@/types/notification';
import { NotificationBadge } from '@/components/atoms';

/**
 * NotificationCenter Storybook Stories
 *
 * **重要說明**：
 * NotificationCenter 與 NotificationMenu 之間的差異：
 *
 * - **NotificationCenter**：整合資料層的完整解決方案
 *   - 使用 useNotifications hook 自動從 GraphQL 取得資料
 *   - 支援即時訂閱（WebSocket）
 *   - 自動處理狀態管理、錯誤處理與載入中狀態
 *   - 用於實際應用
 *
 * - **NotificationMenu**：純 UI 元件
 *   - 透過 props 接收 notifications
 *   - 不處理資料取得
 *   - 可在任何地方重用（只要提供資料即可）
 *
 * **這些 Story 的限制**：
 * 為了在 Storybook 中可靠地展示，我們以直接傳入 prop 的方式模擬資料，
 * 而非真正的 GraphQL 整合。在實際應用中，NotificationCenter
 * 自動處理所有資料取得與狀態管理。
 */

// Helper function to log actions
const logAction =
  (actionName: string) =>
  (...args: any[]) => {
    console.log(`[Storybook Action] ${actionName}`, args);
  };

// Mock notifications data (UnifiedNotification format)
const createMockNotifications = (): UnifiedNotification[] => [
  {
    id: '1',
    type: NotificationType.INFO,
    title: 'System Maintenance Notice',
    message:
      'System maintenance will be performed tonight at 11:00 PM, estimated duration 2 hours',
    isRead: false,
    createdAt: new Date(Date.now() - 5 * 60 * 1000).toISOString(),
    readAt: undefined,
  },
  {
    id: '2',
    type: NotificationType.SUCCESS,
    title: 'Password Updated',
    message:
      'Your password has been updated successfully. If this was not you, please contact support immediately',
    isRead: true,
    createdAt: new Date(Date.now() - 60 * 60 * 1000).toISOString(),
    readAt: new Date(Date.now() - 55 * 60 * 1000).toISOString(),
  },
  {
    id: '3',
    type: NotificationType.WARNING,
    title: 'Security Warning',
    message: 'New device login detected, Location: Taipei, IP: 192.168.1.1',
    isRead: false,
    createdAt: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
    readAt: undefined,
  },
  {
    id: '4',
    type: NotificationType.ERROR,
    title: 'Payment Failed',
    message:
      'Your credit card payment failed. Please check your card information or use another payment method',
    isRead: false,
    createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
    readAt: undefined,
  },
];

// Helper component to wrap NotificationMenu with state management
interface MockedNotificationCenterProps {
  initialNotifications: UnifiedNotification[];
  color?: 'inherit' | 'primary' | 'secondary' | 'default';
  size?: 'small' | 'medium' | 'large';
  showSettings?: boolean;
  maxDisplay?: number;
  onViewAll?: () => void;
  onSettingsClick?: () => void;
  onNotificationClick?: (id: string) => void;
  title?: string;
}

const MockedNotificationCenter = ({
  initialNotifications,
  color = 'inherit',
  size = 'medium',
  showSettings = true,
  maxDisplay = 5,
  onViewAll,
  onSettingsClick,
  onNotificationClick,
  title = 'Dashboard',
}: MockedNotificationCenterProps) => {
  const [notifications, setNotifications] =
    useState<UnifiedNotification[]>(initialNotifications);
  const unreadCount = notifications.filter((n) => !n.isRead).length;

  return (
    <Box sx={{ width: '100%', minWidth: 800 }}>
      <AppBar position="static">
        <Toolbar>
          <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
            {title}
          </Typography>
          <NotificationMenu
            color={color}
            size={size}
            unreadCount={unreadCount}
            notifications={notifications}
            showSettings={showSettings}
            maxDisplay={maxDisplay}
            onViewAll={onViewAll}
            onSettingsClick={onSettingsClick}
            onNotificationClick={(notification) => {
              onNotificationClick?.(notification.id);
              // Auto mark as read when clicked
              if (!notification.isRead) {
                setNotifications((prev) =>
                  prev.map((n) =>
                    n.id === notification.id ? { ...n, isRead: true } : n,
                  ),
                );
              }
            }}
            onMarkAsRead={(id) => {
              setNotifications((prev) =>
                prev.map((n) => (n.id === id ? { ...n, isRead: true } : n)),
              );
            }}
            onMarkAllAsRead={() => {
              setNotifications((prev) =>
                prev.map((n) => ({ ...n, isRead: true })),
              );
            }}
            onClearAll={() => {
              setNotifications((prev) => prev.filter((n) => !n.isRead));
            }}
          />
        </Toolbar>
      </AppBar>
    </Box>
  );
};

const meta = {
  title: 'Shared/Organisms/NotificationCenter',
  component: NotificationCenter,
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component:
          '完整的通知中心，與 NotificationMenu 整合。' +
          'Provides notification management with mark as read, clear, and real-time updates. ' +
          'These stories use direct props for demonstration purposes.',
      },
    },
  },
  tags: ['autodocs'],
  argTypes: {
    color: {
      control: 'select',
      options: ['inherit', 'primary', 'secondary', 'default'],
      description: '按鈕顏色',
    },
    size: {
      control: 'select',
      options: ['small', 'medium', 'large'],
      description: '圖示按鈕尺寸',
    },
    showSettings: {
      control: 'boolean',
      description: '在通知選單標題列顯示設定按鈕',
    },
    maxDisplay: {
      control: 'number',
      description: '選單中最多顯示的通知數量',
    },
  },
} satisfies Meta<typeof NotificationCenter>;

export default meta;
type Story = StoryObj<typeof meta>;

/**
 * AppBar 中的預設通知中心（模擬資料）
 *
 * **此 Story 展示的內容**：UI 外觀與互動行為
 *
 * **試試這些互動：**
 * - 點擊通知鈴鐺即可開啟選單
 * - 點擊「Notifications」標題即可導向通知中心
 * - 點擊設定圖示即可前往通知設定
 * - 點擊「Mark All as Read」即可將所有通知標為已讀
 * - 點擊「Clear」即可刪除所有已讀通知
 *
 * **注意**：此處使用模擬資料來展示 UI。在實際應用中，
 * NotificationCenter 將使用 useNotifications hook 自動從 GraphQL 取得資料。
 */
export const Default: Story = {
  render: () => (
    <MockedNotificationCenter
      initialNotifications={createMockNotifications()}
      color="inherit"
      size="medium"
      showSettings={true}
      maxDisplay={5}
      onViewAll={() => logAction('navigate-to-notification-center')()}
      onSettingsClick={() => logAction('navigate-to-settings')()}
      onNotificationClick={logAction('notification-clicked')}
    />
  ),
};

/**
 * 空狀態 - 沒有通知
 *
 * 當使用者沒有通知時顯示空狀態
 */
export const Empty: Story = {
  render: () => (
    <MockedNotificationCenter
      initialNotifications={[]}
      color="inherit"
      size="medium"
      showSettings={true}
      onViewAll={() => logAction('navigate-to-notification-center')()}
      onSettingsClick={() => logAction('navigate-to-settings')()}
      onNotificationClick={logAction('notification-clicked')}
      title="Dashboard (No Notifications)"
    />
  ),
};

/**
 * 載入中狀態（視覺模擬）
 *
 * 展示從伺服器取得通知期間 UI 的外觀。
 * 這是用於展示預期使用體驗的視覺模擬。
 */
export const Loading: Story = {
  render: () => {
    const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
    const t = {
      title: 'Notifications',
      markAllAsRead: 'Mark All as Read',
      clearAll: 'Clear',
    };

    return (
      <Box sx={{ width: '100%', minWidth: 800 }}>
        <Alert severity="info" sx={{ mb: 2 }}>
          <Typography variant="body2">
            <strong>Visual Mock:</strong> This demonstrates what the loading
            state should look like. In the actual NotificationCenter component,
            this state is triggered automatically when data is being fetched
            from GraphQL.
          </Typography>
        </Alert>
        <AppBar position="static">
          <Toolbar>
            <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
              Dashboard (Loading State)
            </Typography>
            <Box>
              <IconButton
                color="inherit"
                size="medium"
                onClick={(e) => setAnchorEl(e.currentTarget)}
              >
                <NotificationBadge count={0} />
              </IconButton>
              <Menu
                anchorEl={anchorEl}
                open={Boolean(anchorEl)}
                onClose={() => setAnchorEl(null)}
                PaperProps={{
                  sx: {
                    width: 400,
                    maxHeight: 500,
                  },
                }}
              >
                {/* Header */}
                <Box
                  sx={{
                    px: 2,
                    py: 1.5,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    borderBottom: 1,
                    borderColor: 'divider',
                  }}
                >
                  <Typography
                    variant="h6"
                    component="div"
                    sx={{
                      cursor: 'pointer',
                      '&:hover': { color: 'primary.main' },
                    }}
                    onClick={() => logAction('view-all')()}
                  >
                    {t.title}
                  </Typography>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <Button
                      size="small"
                      color="primary"
                      disabled
                      sx={{ textTransform: 'none' }}
                    >
                      {t.clearAll}
                    </Button>
                    <IconButton
                      size="small"
                      onClick={() => logAction('settings')()}
                    >
                      <SettingsIcon fontSize="small" />
                    </IconButton>
                  </Box>
                </Box>

                {/* Loading content */}
                <Box
                  sx={{
                    py: 6,
                    px: 3,
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    gap: 2,
                  }}
                >
                  <CircularProgress size={40} />
                  <Typography variant="body2" color="text.secondary">
                    Loading notifications...
                  </Typography>
                </Box>
              </Menu>
            </Box>
          </Toolbar>
        </AppBar>
      </Box>
    );
  },
};

/**
 * 錯誤狀態（視覺模擬）
 *
 * 展示當 API 無法載入通知時 UI 的外觀。
 * 這是用於展示錯誤處理使用體驗的視覺模擬。
 */
export const Error: Story = {
  render: () => {
    const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
    const t = {
      title: 'Notifications',
      markAllAsRead: 'Mark All as Read',
      clearAll: 'Clear',
    };

    return (
      <Box sx={{ width: '100%', minWidth: 800 }}>
        <Alert severity="info" sx={{ mb: 2 }}>
          <Typography variant="body2">
            <strong>Visual Mock:</strong> This demonstrates what the error state
            should look like. In the actual NotificationCenter component, this
            state is triggered automatically when the GraphQL query fails.
          </Typography>
        </Alert>
        <AppBar position="static">
          <Toolbar>
            <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
              Dashboard (Error State)
            </Typography>
            <Box>
              <IconButton
                color="inherit"
                size="medium"
                onClick={(e) => setAnchorEl(e.currentTarget)}
              >
                <NotificationBadge count={0} />
              </IconButton>
              <Menu
                anchorEl={anchorEl}
                open={Boolean(anchorEl)}
                onClose={() => setAnchorEl(null)}
                PaperProps={{
                  sx: {
                    width: 400,
                    maxHeight: 500,
                  },
                }}
              >
                {/* Header */}
                <Box
                  sx={{
                    px: 2,
                    py: 1.5,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    borderBottom: 1,
                    borderColor: 'divider',
                  }}
                >
                  <Typography
                    variant="h6"
                    component="div"
                    sx={{
                      cursor: 'pointer',
                      '&:hover': { color: 'primary.main' },
                    }}
                    onClick={() => logAction('view-all')()}
                  >
                    {t.title}
                  </Typography>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <Button
                      size="small"
                      color="primary"
                      disabled
                      sx={{ textTransform: 'none' }}
                    >
                      {t.clearAll}
                    </Button>
                    <IconButton
                      size="small"
                      onClick={() => logAction('settings')()}
                    >
                      <SettingsIcon fontSize="small" />
                    </IconButton>
                  </Box>
                </Box>

                {/* Error content */}
                <Box sx={{ p: 2 }}>
                  <Alert severity="error" sx={{ mb: 2 }}>
                    <Typography variant="body2" gutterBottom>
                      <strong>載入通知失敗</strong>
                    </Typography>
                    <Typography variant="caption">
                      無法連線至伺服器。請檢查你的網路連線後 再試一次。
                    </Typography>
                  </Alert>
                  <Button
                    variant="outlined"
                    size="small"
                    fullWidth
                    startIcon={<RefreshIcon />}
                    onClick={() => logAction('retry')()}
                  >
                    重試
                  </Button>
                </Box>
              </Menu>
            </Box>
          </Toolbar>
        </AppBar>
      </Box>
    );
  },
};

/**
 * 全部為已讀通知
 *
 * 所有通知皆已讀（徽章顯示 0）
 */
export const AllRead: Story = {
  render: () => {
    const allRead = createMockNotifications().map((n) => ({
      ...n,
      isRead: true,
    }));
    return (
      <MockedNotificationCenter
        initialNotifications={allRead}
        color="inherit"
        size="medium"
        showSettings={true}
        onViewAll={() => logAction('navigate-to-notification-center')()}
        onSettingsClick={() => logAction('navigate-to-settings')()}
        onNotificationClick={logAction('notification-clicked')}
        title="Dashboard (All Read)"
      />
    );
  },
};

/**
 * 僅未讀通知
 *
 * 僅顯示未讀通知（實用的篩選情境）
 */
export const UnreadOnly: Story = {
  render: () => {
    const unreadOnly = createMockNotifications().filter((n) => !n.isRead);
    return (
      <MockedNotificationCenter
        initialNotifications={unreadOnly}
        color="inherit"
        size="medium"
        showSettings={true}
        onViewAll={() => logAction('navigate-to-notification-center')()}
        onSettingsClick={() => logAction('navigate-to-settings')()}
        onNotificationClick={logAction('notification-clicked')}
        title="Dashboard (Unread Only)"
      />
    );
  },
};

/**
 * 不含設定按鈕
 */
export const WithoutSettings: Story = {
  render: () => (
    <MockedNotificationCenter
      initialNotifications={createMockNotifications()}
      color="inherit"
      size="medium"
      showSettings={false}
      maxDisplay={5}
      onViewAll={() => logAction('navigate-to-notification-center')()}
      onNotificationClick={logAction('notification-clicked')}
      title="Dashboard (No Settings Button)"
    />
  ),
};

/**
 * 最簡設定
 *
 * 無設定按鈕、無檢視全部回呼
 */
export const Minimal: Story = {
  render: () => (
    <MockedNotificationCenter
      initialNotifications={createMockNotifications()}
      color="inherit"
      size="medium"
      showSettings={false}
      maxDisplay={3}
      onNotificationClick={logAction('notification-clicked')}
      title="Dashboard (Minimal)"
    />
  ),
};

/**
 * 不同尺寸
 */
export const Sizes: Story = {
  render: () => (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
      <MockedNotificationCenter
        initialNotifications={createMockNotifications()}
        color="inherit"
        size="small"
        showSettings={true}
        onViewAll={() => logAction('small-view-all')()}
        onSettingsClick={() => logAction('small-settings')()}
        onNotificationClick={logAction('small-notification')}
        title="Small Size"
      />
      <MockedNotificationCenter
        initialNotifications={createMockNotifications()}
        color="inherit"
        size="medium"
        showSettings={true}
        onViewAll={() => logAction('medium-view-all')()}
        onSettingsClick={() => logAction('medium-settings')()}
        onNotificationClick={logAction('medium-notification')}
        title="Medium Size (Default)"
      />
      <MockedNotificationCenter
        initialNotifications={createMockNotifications()}
        color="inherit"
        size="large"
        showSettings={true}
        onViewAll={() => logAction('large-view-all')()}
        onSettingsClick={() => logAction('large-settings')()}
        onNotificationClick={logAction('large-notification')}
        title="Large Size"
      />
    </Box>
  ),
};

/**
 * 不同顏色
 */
export const Colors: Story = {
  render: () => (
    <Box
      sx={{ display: 'flex', flexDirection: 'column', gap: 2, minWidth: 800 }}
    >
      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          gap: 2,
          p: 2,
          bgcolor: 'grey.100',
        }}
      >
        <Typography variant="body2" sx={{ width: 150 }}>
          Inherit:
        </Typography>
        <NotificationMenu
          color="inherit"
          size="medium"
          unreadCount={3}
          notifications={createMockNotifications()}
          showSettings={true}
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
        <Typography variant="body2" sx={{ width: 150 }}>
          Primary:
        </Typography>
        <NotificationMenu
          color="primary"
          size="medium"
          unreadCount={3}
          notifications={createMockNotifications()}
          showSettings={true}
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
        <Typography variant="body2" sx={{ width: 150 }}>
          Secondary:
        </Typography>
        <NotificationMenu
          color="secondary"
          size="medium"
          unreadCount={3}
          notifications={createMockNotifications()}
          showSettings={true}
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
        <Typography variant="body2" sx={{ width: 150 }}>
          Default:
        </Typography>
        <NotificationMenu
          color="default"
          size="medium"
          unreadCount={3}
          notifications={createMockNotifications()}
          showSettings={true}
        />
      </Box>
    </Box>
  ),
};

/**
 * 自訂最多顯示數量
 *
 * 選單中僅顯示最近的 2 則通知
 */
export const CustomMaxDisplay: Story = {
  render: () => (
    <MockedNotificationCenter
      initialNotifications={createMockNotifications()}
      color="inherit"
      size="medium"
      showSettings={true}
      maxDisplay={2}
      onViewAll={() => logAction('navigate-to-notification-center')()}
      onSettingsClick={() => logAction('navigate-to-settings')()}
      onNotificationClick={logAction('notification-clicked')}
      title="Dashboard (Max 2 Notifications)"
    />
  ),
};

/**
 * 大量通知
 *
 * 以大量通知測試捲動行為
 */
export const ManyNotifications: Story = {
  render: () => {
    const manyNotifications = Array.from({ length: 20 }, (_, i) => ({
      id: `${i + 1}`,
      type: [
        NotificationType.INFO,
        NotificationType.SUCCESS,
        NotificationType.WARNING,
        NotificationType.ERROR,
        NotificationType.SYSTEM,
      ][i % 5],
      title: `Notification #${i + 1}`,
      message: `This is the content of notification #${i + 1}`,
      isRead: i % 3 === 0,
      createdAt: new Date(Date.now() - i * 60 * 60 * 1000).toISOString(),
      readAt: i % 3 === 0 ? new Date().toISOString() : undefined,
    }));

    return (
      <MockedNotificationCenter
        initialNotifications={manyNotifications}
        color="inherit"
        size="medium"
        showSettings={true}
        maxDisplay={10}
        onViewAll={() => logAction('navigate-to-notification-center')()}
        onSettingsClick={() => logAction('navigate-to-settings')()}
        onNotificationClick={logAction('notification-clicked')}
        title="Dashboard (20 Notifications)"
      />
    );
  },
};

/**
 * 長內容通知
 *
 * 以極長的標題與訊息測試文字溢出處理
 */
export const LongContent: Story = {
  render: () => {
    const longNotifications = [
      {
        id: '1',
        type: NotificationType.INFO,
        title:
          'This is a very very very very very very very very very very long notification title to test text overflow behavior',
        message:
          'This is a very very very very very very very very very very very very very very long notification message content to test how the component handles text truncation and ellipsis display when content is too long. This text should be limited to a specific number of lines and the overflow part will be displayed with ellipsis. Let us add more text to make sure it is really long enough to test line wrapping and truncation functionality.',
        isRead: false,
        createdAt: new Date(Date.now() - 5 * 60 * 1000).toISOString(),
        readAt: undefined,
      },
      {
        id: '2',
        type: NotificationType.WARNING,
        title: 'Normal length title',
        message: 'Normal length content',
        isRead: false,
        createdAt: new Date(Date.now() - 10 * 60 * 1000).toISOString(),
        readAt: undefined,
      },
    ];

    return (
      <MockedNotificationCenter
        initialNotifications={longNotifications}
        color="inherit"
        size="medium"
        showSettings={true}
        onViewAll={() => logAction('navigate-to-notification-center')()}
        onSettingsClick={() => logAction('navigate-to-settings')()}
        onNotificationClick={logAction('notification-clicked')}
        title="Dashboard (Long Content Test)"
      />
    );
  },
};

/**
 * 實際使用範例（供文件參考）
 *
 * **此 Story 展示的內容**：NotificationCenter 的實際使用
 *
 * **與 NotificationMenu 的差異**：
 * - NotificationCenter 自動從 GraphQL 取得資料（無需傳入 notifications prop）
 * - 支援即時訂閱（autoSubscribe=true）
 * - 自動處理載入中與錯誤狀態
 * - NotificationMenu 需要外部傳入的 notifications 資料
 *
 * **注意**：此 Story 在 Storybook 環境中無法正常運作（沒有真正的 GraphQL 後端），
 * 但它示範了如何在實際應用中使用 NotificationCenter。
 */
export const RealUsageExample: Story = {
  render: () => (
    <Box sx={{ width: '100%', minWidth: 800 }}>
      <Alert severity="info" sx={{ mb: 2 }}>
        <Typography variant="subtitle2" gutterBottom>
          <strong>差異：NotificationCenter vs NotificationMenu：</strong>
        </Typography>
        <Typography variant="body2" component="div" sx={{ mt: 1 }}>
          <strong>1. NotificationCenter（如下所示）</strong>：
          <ul style={{ marginTop: 8, marginBottom: 8 }}>
            <li>自動從 GraphQL 取得通知資料（使用 useNotifications hook）</li>
            <li>支援即時訂閱（WebSocket），新通知會 自動推送</li>
            <li>內建錯誤處理與載入中狀態</li>
            <li>
              用法：<code>&lt;NotificationCenter /&gt;</code>（無須傳入
              notifications）
            </li>
          </ul>
          <strong>2. NotificationMenu</strong>：
          <ul style={{ marginTop: 8, marginBottom: 8 }}>
            <li>純 UI 元件，需要外部傳入 notifications 資料</li>
            <li>不處理資料取得或訂閱</li>
            <li>可在任何地方重用（只要提供資料即可）</li>
            <li>
              用法：{' '}
              <code>
                &lt;NotificationMenu notifications=&#123;data&#125; /&gt;
              </code>
            </li>
          </ul>
        </Typography>
        <Typography variant="body2" sx={{ mt: 1, color: 'warning.main' }}>
          ⚠️ 在 Storybook 環境中，由於缺少真正的後端，NotificationCenter
          會顯示空狀態。在實際應用中，它會自動 載入通知資料。
        </Typography>
      </Alert>
      <AppBar position="static">
        <Toolbar>
          <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
            真實的 NotificationCenter（會顯示空狀態）
          </Typography>
          <NotificationCenter
            color="inherit"
            size="medium"
            autoSubscribe={true}
            showSettings={true}
            onViewAll={() => logAction('navigate-to-notification-center')()}
            onSettingsClick={() => logAction('navigate-to-settings')()}
            onNotificationClick={logAction('notification-clicked')}
          />
        </Toolbar>
      </AppBar>
      <Box sx={{ p: 2, mt: 2 }}>
        <Alert severity="success">
          <Typography variant="body2">
            <strong>實際應用中的程式碼範例：</strong>
          </Typography>
          <pre style={{ marginTop: 8, fontSize: '0.875rem' }}>
            {`// In real applications, simply use it like this:
import { NotificationCenter } from '@/components/organisms';

function AppBar() {
  return (
    <NotificationCenter
      autoSubscribe={true}  // Auto subscribe to new notifications
      onViewAll={() => router.push('/notifications')}
      onSettingsClick={() => router.push('/settings/notifications')}
    />
  );
}

// NotificationCenter will automatically:
// 1. Use useNotifications hook to fetch data
// 2. Subscribe to GraphQL subscription
// 3. Handle errors and loading states
// 4. Delegate UI rendering to NotificationMenu`}
          </pre>
        </Alert>
      </Box>
    </Box>
  ),
};

/**
 * 並列比較
 *
 * **視覺差異展示**：NotificationCenter 與 NotificationMenu
 *
 * 此 Story 並列顯示兩個元件，協助理解它們之間的差異：
 * - 左側：NotificationMenu（需要傳入資料）
 * - 右側：NotificationCenter（自動取得資料，但在 Storybook 中顯示空狀態）
 */
export const Comparison: Story = {
  render: () => {
    const mockData = createMockNotifications();
    const unreadCount = mockData.filter((n) => !n.isRead).length;

    return (
      <Box sx={{ width: '100%', minWidth: 1200 }}>
        <Alert severity="info" sx={{ mb: 3 }}>
          <Typography variant="subtitle2" gutterBottom>
            <strong>
              Side-by-Side Comparison: NotificationMenu vs NotificationCenter
            </strong>
          </Typography>
          <Typography variant="body2">
            The NotificationMenu on the left requires manual data provision,
            while the NotificationCenter on the right automatically fetches data
            (but shows empty state in Storybook environment due to lack of real
            backend).
          </Typography>
        </Alert>

        <Box
          sx={{
            display: 'grid',
            gridTemplateColumns: '1fr 1fr',
            gap: 3,
          }}
        >
          {/* NotificationMenu - Requires data provision */}
          <Box>
            <Typography
              variant="h6"
              gutterBottom
              sx={{ px: 2, py: 1, bgcolor: 'success.light', color: 'white' }}
            >
              NotificationMenu (With Data)
            </Typography>
            <AppBar position="static">
              <Toolbar>
                <Typography
                  variant="body1"
                  component="div"
                  sx={{ flexGrow: 1 }}
                >
                  Dashboard
                </Typography>
                <NotificationMenu
                  color="inherit"
                  size="medium"
                  unreadCount={unreadCount}
                  notifications={mockData}
                  showSettings={true}
                  onViewAll={() => logAction('menu-view-all')()}
                  onSettingsClick={() => logAction('menu-settings')()}
                />
              </Toolbar>
            </AppBar>
            <Box sx={{ p: 2, bgcolor: 'grey.50' }}>
              <Typography variant="caption" component="div" gutterBottom>
                <strong>Usage:</strong>
              </Typography>
              <pre
                style={{
                  fontSize: '0.75rem',
                  backgroundColor: '#f5f5f5',
                  padding: '8px',
                  borderRadius: '4px',
                  overflow: 'auto',
                }}
              >
                {`<NotificationMenu
  notifications={data}
  unreadCount={count}
  onViewAll={...}
/>`}
              </pre>
              <Typography variant="caption" color="success.main" sx={{ mt: 1 }}>
                ✅ Pros: Full control over data source, easy to test
              </Typography>
              <br />
              <Typography variant="caption" color="text.secondary">
                ⚠️ Requires: Manual data fetching and state management
              </Typography>
            </Box>
          </Box>

          {/* NotificationCenter - Auto-fetches data */}
          <Box>
            <Typography
              variant="h6"
              gutterBottom
              sx={{ px: 2, py: 1, bgcolor: 'primary.main', color: 'white' }}
            >
              NotificationCenter (Auto-fetch)
            </Typography>
            <AppBar position="static">
              <Toolbar>
                <Typography
                  variant="body1"
                  component="div"
                  sx={{ flexGrow: 1 }}
                >
                  Dashboard
                </Typography>
                <NotificationCenter
                  color="inherit"
                  size="medium"
                  autoSubscribe={true}
                  showSettings={true}
                  onViewAll={() => logAction('center-view-all')()}
                  onSettingsClick={() => logAction('center-settings')()}
                />
              </Toolbar>
            </AppBar>
            <Box sx={{ p: 2, bgcolor: 'grey.50' }}>
              <Typography variant="caption" component="div" gutterBottom>
                <strong>Usage:</strong>
              </Typography>
              <pre
                style={{
                  fontSize: '0.75rem',
                  backgroundColor: '#f5f5f5',
                  padding: '8px',
                  borderRadius: '4px',
                  overflow: 'auto',
                }}
              >
                {`<NotificationCenter
  autoSubscribe={true}
  onViewAll={...}
/>`}
              </pre>
              <Typography variant="caption" color="primary.main" sx={{ mt: 1 }}>
                ✅ Pros: Auto data fetching, real-time subscriptions, error
                handling
              </Typography>
              <br />
              <Typography variant="caption" color="warning.main">
                ⚠️ Storybook: Shows empty state without backend
              </Typography>
            </Box>
          </Box>
        </Box>

        <Alert severity="warning" sx={{ mt: 3 }}>
          <Typography variant="body2">
            <strong>為什麼右側是空的？</strong>
            <br />
            在實際應用中，NotificationCenter 會使用 useNotifications hook 自動從
            GraphQL 取得資料。但在 Storybook 環境中，由於沒有
            連線至真正的後端伺服器，它會顯示空狀態。
            <br />
            <br />
            <strong>在實際應用中：</strong>
            <br />
            NotificationCenter 會自動載入通知、訂閱新通知推送，
            並處理錯誤與載入中狀態。這正是它與 NotificationMenu 的
            關鍵差異－它是完整的資料整合方案，而 NotificationMenu 只是 UI 元件。
          </Typography>
        </Alert>
      </Box>
    );
  },
};
