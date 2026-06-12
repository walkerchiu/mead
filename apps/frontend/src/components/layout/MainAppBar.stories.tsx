import type { Meta, StoryObj } from '@storybook/nextjs';
import { MainAppBar } from './MainAppBar';
import { Box, Typography, IconButton, Container } from '@mui/material';
import { ArrowBack } from '@mui/icons-material';
import type { UnifiedNotification } from '@/types/notification';
import { NotificationType } from '@/types/notification';

const mockUser = {
  name: 'John Doe',
  email: 'john.doe@example.com',
  avatar: 'https://i.pravatar.cc/150?img=1',
  role: 'HQ',
  status: 'online' as const,
};

const mockNotifications: UnifiedNotification[] = [
  {
    id: '1',
    type: NotificationType.INFO,
    title: 'System Maintenance',
    message:
      'System maintenance scheduled for tonight at 11:00 PM, estimated duration 2 hours',
    isRead: false,
    createdAt: new Date(Date.now() - 5 * 60 * 1000).toISOString(),
    readAt: undefined,
  },
  {
    id: '2',
    type: NotificationType.SUCCESS,
    title: 'Password Updated',
    message: 'Your password has been successfully updated',
    isRead: true,
    createdAt: new Date(Date.now() - 60 * 60 * 1000).toISOString(),
    readAt: new Date(Date.now() - 55 * 60 * 1000).toISOString(),
  },
  {
    id: '3',
    type: NotificationType.WARNING,
    title: 'Security Warning',
    message: 'Login detected from a new device',
    isRead: false,
    createdAt: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
    readAt: undefined,
  },
  {
    id: '4',
    type: NotificationType.ERROR,
    title: 'Payment Failed',
    message:
      'Your credit card payment failed. Please check your card information',
    isRead: false,
    createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
    readAt: undefined,
  },
];

/**
 * MainAppBar 是統一的應用程式導覽列元件
 *
 * **功能特性**：
 * - 支援文字標題或 Logo
 * - 標題／Logo 可設為超連結
 * - 通知中心（鈴鐺圖示 + 徽章）
 * - 語言切換器
 * - 使用者選單（頭像 + 個人操作）
 * - 設定選單（主題切換 + 說明 + 關於）
 * - 響應式設計
 *
 * **設計原則**：
 * - AppBar 用於全域導覽，恆常顯示網站標題／Logo
 * - 頁面層級的操作（例如返回按鈕）應放在頁面內容區，而非 AppBar 中
 *
 * **使用情境**：
 * - 應用程式頂端導覽列
 * - HQ 面板頁面標題
 * - 儀表板頁面標題
 */
const meta = {
  title: 'HQ Scope/Layout/MainAppBar',
  component: MainAppBar,
  parameters: {
    layout: 'fullscreen',
    docs: {
      description: {
        component:
          '統一的應用程式導覽列，包含通知、語言切換器、使用者選單與設定選單。',
      },
    },
  },
  tags: ['autodocs'],
  argTypes: {
    title: {
      control: 'text',
      description: '頁面標題文字',
    },
    titleLink: {
      control: 'text',
      description: '標題／標誌的連結 URL（選用）',
    },
    showNotifications: {
      control: 'boolean',
      description: '顯示通知鈴鐺',
      table: {
        defaultValue: { summary: 'true' },
      },
    },
    showUserMenu: {
      control: 'boolean',
      description: '顯示使用者選單',
      table: {
        defaultValue: { summary: 'true' },
      },
    },
    showSettings: {
      control: 'boolean',
      description: '顯示設定選單',
      table: {
        defaultValue: { summary: 'true' },
      },
    },
    showUserName: {
      control: 'boolean',
      description: '在使用者選單中顯示使用者名稱',
      table: {
        defaultValue: { summary: 'false' },
      },
    },
    showUserStatus: {
      control: 'boolean',
      description: '顯示使用者線上狀態',
      table: {
        defaultValue: { summary: 'false' },
      },
    },
    useButtonDividers: {
      control: 'boolean',
      description: '在通知、使用者與設定按鈕之間使用分隔線',
      table: {
        defaultValue: { summary: 'false' },
      },
    },
    separateLanguageSwitcher: {
      control: 'boolean',
      description: '在語言切換器前顯示分隔線',
      table: {
        defaultValue: { summary: 'true' },
      },
    },
  },
} satisfies Meta<typeof MainAppBar>;

export default meta;
type Story = StoryObj<typeof meta>;

/**
 * 預設文字標題樣式（不含使用者資訊）
 */
export const Default: Story = {
  render: (args) => (
    <Box>
      <MainAppBar {...args} />
      <Box sx={{ p: 3 }}>
        <p>頁面內容置於此處……</p>
      </Box>
    </Box>
  ),
  args: {
    title: 'Dashboard',
  },
};

/**
 * 完整功能顯示：通知 + 使用者 + 設定 + 語言
 */
export const FullFeatured: Story = {
  render: (args) => (
    <Box>
      <MainAppBar {...args} />
      <Box sx={{ p: 3, bgcolor: 'grey.50', minHeight: '400px' }}>
        <h2>歡迎使用 Dashboard</h2>
        <p>已啟用所有功能，並採用新的按鈕排序：</p>
        <ul>
          <li>🔔 通知鈴鐺，含 3 則未讀</li>
          <li>👤 使用者選單，含頭像與名稱</li>
          <li>⚙️ 設定選單，含主題切換</li>
          <li>| 🌐 語言切換器（以分隔線區隔，預設）</li>
        </ul>
      </Box>
    </Box>
  ),
  args: {
    title: 'Dashboard',
    user: mockUser,
    notifications: mockNotifications,
    unreadNotificationCount: 3,
    showUserName: true,
    showUserStatus: true,
    currentTheme: 'light',
    separateLanguageSwitcher: true,
    onAccountClick: () => console.log('Account clicked'),
    onProfileClick: () => console.log('Profile clicked'),
    onSecurityClick: () => console.log('Security clicked'),
    onLogout: () => console.log('Logout clicked'),
    onThemeChange: (theme) => console.log('Theme changed to:', theme),
    onHelpClick: () => console.log('Help clicked'),
    onAboutClick: () => console.log('About clicked'),
    onNotificationClick: (notification) =>
      console.log('Notification clicked:', notification),
    onMarkAllNotificationsRead: () => console.log('Mark all as read'),
    onViewAllNotifications: () => console.log('View all notifications'),
    onClearAllNotifications: () => console.log('Clear all notifications'),
    onNotificationSettingsClick: () =>
      console.log('Notification settings clicked'),
  },
};

/**
 * 所有按鈕（含分隔線）
 */
export const WithAllDividers: Story = {
  render: (args) => (
    <Box>
      <MainAppBar {...args} />
      <Box sx={{ p: 3, bgcolor: 'grey.50', minHeight: '400px' }}>
        <h2>所有按鈕（含分隔線）</h2>
        <p>所有按鈕群組皆以分隔線區隔：</p>
        <ul>
          <li>🔔 | 👤 | ⚙️ | 🌐</li>
        </ul>
        <p>
          <strong>
            同時啟用 useButtonDividers 與 separateLanguageSwitcher
          </strong>
        </p>
      </Box>
    </Box>
  ),
  args: {
    title: 'Dashboard',
    user: mockUser,
    notifications: mockNotifications,
    unreadNotificationCount: 5,
    showUserName: true,
    showUserStatus: true,
    currentTheme: 'light',
    useButtonDividers: true,
    separateLanguageSwitcher: true,
    onAccountClick: () => console.log('Account clicked'),
    onProfileClick: () => console.log('Profile clicked'),
    onSecurityClick: () => console.log('Security clicked'),
    onLogout: () => console.log('Logout clicked'),
    onThemeChange: (theme) => console.log('Theme changed to:', theme),
    onHelpClick: () => console.log('Help clicked'),
    onAboutClick: () => console.log('About clicked'),
  },
};

/**
 * 不含分隔線（精簡版面）
 */
export const WithoutDividers: Story = {
  render: (args) => (
    <Box>
      <MainAppBar {...args} />
      <Box sx={{ p: 3 }}>
        <p>所有按鈕皆不含分隔線（精簡版面）：</p>
        <p>🔔 👤 ⚙️ 🌐</p>
      </Box>
    </Box>
  ),
  args: {
    title: 'Dashboard',
    user: mockUser,
    notifications: mockNotifications,
    unreadNotificationCount: 3,
    useButtonDividers: false,
    separateLanguageSwitcher: false,
    onAccountClick: () => console.log('Account clicked'),
    onProfileClick: () => console.log('Profile clicked'),
    onSecurityClick: () => console.log('Security clicked'),
    onLogout: () => console.log('Logout clicked'),
    onThemeChange: (theme) => console.log('Theme changed to:', theme),
    onHelpClick: () => console.log('Help clicked'),
    onAboutClick: () => console.log('About clicked'),
  },
};

/**
 * 僅語言切換器分隔（預設）
 */
export const OnlyLanguageSeparated: Story = {
  render: (args) => (
    <Box>
      <MainAppBar {...args} />
      <Box sx={{ p: 3 }}>
        <p>僅語言切換器以分隔線區隔（預設行為）：</p>
        <p>🔔 👤 ⚙️ | 🌐</p>
      </Box>
    </Box>
  ),
  args: {
    title: 'Dashboard',
    user: mockUser,
    notifications: mockNotifications,
    unreadNotificationCount: 2,
    useButtonDividers: false,
    separateLanguageSwitcher: true,
    onAccountClick: () => console.log('Account clicked'),
    onProfileClick: () => console.log('Profile clicked'),
    onSecurityClick: () => console.log('Security clicked'),
    onLogout: () => console.log('Logout clicked'),
    onThemeChange: (theme) => console.log('Theme changed to:', theme),
    onHelpClick: () => console.log('Help clicked'),
    onAboutClick: () => console.log('About clicked'),
  },
};

/**
 * 含通知與使用者資訊
 */
export const WithNotificationsAndUser: Story = {
  render: (args) => (
    <Box>
      <MainAppBar {...args} />
      <Box sx={{ p: 3 }}>
        <p>點選通知鈴鐺即可檢視 5 則通知</p>
        <p>點選使用者頭像即可存取個人檔案與設定</p>
      </Box>
    </Box>
  ),
  args: {
    title: 'My Application',
    user: mockUser,
    unreadNotificationCount: 5,
    notifications: mockNotifications,
    onAccountClick: () => console.log('Account clicked'),
    onProfileClick: () => console.log('Profile clicked'),
    onSecurityClick: () => console.log('Security clicked'),
    onLogout: () => console.log('Logout clicked'),
    onThemeChange: (theme) => console.log('Theme changed to:', theme),
    onHelpClick: () => console.log('Help clicked'),
    onAboutClick: () => console.log('About clicked'),
    onNotificationClick: (notification) =>
      console.log('Notification clicked:', notification),
    onMarkAllNotificationsRead: () => console.log('Mark all as read'),
    onViewAllNotifications: () => console.log('View all notifications'),
    onClearAllNotifications: () => console.log('Clear all notifications'),
    onNotificationSettingsClick: () =>
      console.log('Notification settings clicked'),
  },
};

/**
 * 使用者選單顯示姓名
 */
export const WithUserName: Story = {
  render: (args) => (
    <Box>
      <MainAppBar {...args} />
      <Box sx={{ p: 3 }}>
        <p>使用者名稱顯示於頭像旁（桌面檢視）</p>
      </Box>
    </Box>
  ),
  args: {
    title: 'Dashboard',
    user: mockUser,
    showUserName: true,
    showUserStatus: true,
    unreadNotificationCount: 0,
    notifications: [],
    onAccountClick: () => console.log('Account clicked'),
    onProfileClick: () => console.log('Profile clicked'),
    onSecurityClick: () => console.log('Security clicked'),
    onLogout: () => console.log('Logout clicked'),
    onThemeChange: (theme) => console.log('Theme changed to:', theme),
    onHelpClick: () => console.log('Help clicked'),
    onAboutClick: () => console.log('About clicked'),
    onNotificationClick: (notification) =>
      console.log('Notification clicked:', notification),
    onMarkAllNotificationsRead: () => console.log('Mark all as read'),
    onViewAllNotifications: () => console.log('View all notifications'),
    onClearAllNotifications: () => console.log('Clear all notifications'),
    onNotificationSettingsClick: () =>
      console.log('Notification settings clicked'),
  },
};

/**
 * 不含使用者頭像（顯示縮寫）
 */
export const WithoutUserAvatar: Story = {
  render: (args) => (
    <Box>
      <MainAppBar {...args} />
      <Box sx={{ p: 3 }}>
        <p>沒有頭像的使用者會顯示姓名縮寫</p>
      </Box>
    </Box>
  ),
  args: {
    title: 'Dashboard',
    user: {
      name: 'Emily Chen',
      email: 'emily@example.com',
      status: 'online',
    },
    showUserName: true,
    showUserStatus: true,
    unreadNotificationCount: 0,
    notifications: [],
    onAccountClick: () => console.log('Account clicked'),
    onProfileClick: () => console.log('Profile clicked'),
    onSecurityClick: () => console.log('Security clicked'),
    onLogout: () => console.log('Logout clicked'),
    onThemeChange: (theme) => console.log('Theme changed to:', theme),
    onHelpClick: () => console.log('Help clicked'),
    onAboutClick: () => console.log('About clicked'),
    onNotificationClick: (notification) =>
      console.log('Notification clicked:', notification),
    onMarkAllNotificationsRead: () => console.log('Mark all as read'),
    onViewAllNotifications: () => console.log('View all notifications'),
    onClearAllNotifications: () => console.log('Clear all notifications'),
    onNotificationSettingsClick: () =>
      console.log('Notification settings clicked'),
  },
};

/**
 * 通知數量超過 99
 */
export const ManyNotifications: Story = {
  render: (args) => (
    <Box>
      <MainAppBar {...args} />
      <Box sx={{ p: 3 }}>
        <p>數量超過 99 時，徽章會顯示 99+</p>
      </Box>
    </Box>
  ),
  args: {
    title: 'Dashboard',
    user: mockUser,
    unreadNotificationCount: 123,
    notifications: mockNotifications,
    onAccountClick: () => console.log('Account clicked'),
    onProfileClick: () => console.log('Profile clicked'),
    onSecurityClick: () => console.log('Security clicked'),
    onLogout: () => console.log('Logout clicked'),
    onThemeChange: (theme) => console.log('Theme changed to:', theme),
    onHelpClick: () => console.log('Help clicked'),
    onAboutClick: () => console.log('About clicked'),
    onNotificationClick: (notification) =>
      console.log('Notification clicked:', notification),
    onMarkAllNotificationsRead: () => console.log('Mark all as read'),
    onViewAllNotifications: () => console.log('View all notifications'),
    onClearAllNotifications: () => console.log('Clear all notifications'),
    onNotificationSettingsClick: () =>
      console.log('Notification settings clicked'),
  },
};

/**
 * 沒有通知
 */
export const NoNotifications: Story = {
  render: (args) => (
    <Box>
      <MainAppBar {...args} />
      <Box sx={{ p: 3 }}>
        <p>通知選單顯示空狀態</p>
        <p>
          <strong>備註</strong>：即使沒有任何通知，設定按鈕仍會顯示於 通知選單中
        </p>
      </Box>
    </Box>
  ),
  args: {
    title: 'Dashboard',
    user: mockUser,
    unreadNotificationCount: 0,
    notifications: [],
    onAccountClick: () => console.log('Account clicked'),
    onProfileClick: () => console.log('Profile clicked'),
    onSecurityClick: () => console.log('Security clicked'),
    onLogout: () => console.log('Logout clicked'),
    onThemeChange: (theme) => console.log('Theme changed to:', theme),
    onHelpClick: () => console.log('Help clicked'),
    onAboutClick: () => console.log('About clicked'),
    onNotificationClick: (notification) =>
      console.log('Notification clicked:', notification),
    onMarkAllNotificationsRead: () => console.log('Mark all as read'),
    onViewAllNotifications: () => console.log('View all notifications'),
    onClearAllNotifications: () => console.log('Clear all notifications'),
    onNotificationSettingsClick: () =>
      console.log('Notification settings clicked'),
  },
};

/**
 * 含連結的標題
 */
export const WithTitleLink: Story = {
  render: (args) => (
    <Box>
      <MainAppBar {...args} />
      <Box sx={{ p: 3 }}>
        <p>點選標題即可導向首頁</p>
      </Box>
    </Box>
  ),
  args: {
    title: 'My Application',
    titleLink: '/',
    user: mockUser,
    unreadNotificationCount: 2,
    notifications: mockNotifications,
    onAccountClick: () => console.log('Account clicked'),
    onProfileClick: () => console.log('Profile clicked'),
    onSecurityClick: () => console.log('Security clicked'),
    onLogout: () => console.log('Logout clicked'),
    onThemeChange: (theme) => console.log('Theme changed to:', theme),
    onHelpClick: () => console.log('Help clicked'),
    onAboutClick: () => console.log('About clicked'),
    onNotificationClick: (notification) =>
      console.log('Notification clicked:', notification),
    onMarkAllNotificationsRead: () => console.log('Mark all as read'),
    onViewAllNotifications: () => console.log('View all notifications'),
    onClearAllNotifications: () => console.log('Clear all notifications'),
    onNotificationSettingsClick: () =>
      console.log('Notification settings clicked'),
  },
};

/**
 * 含 Logo（文字 Logo 範例）
 */
export const WithLogo: Story = {
  render: (args) => (
    <Box>
      <MainAppBar {...args} />
      <Box sx={{ p: 3 }}>
        <p>搭配自訂 logo 與標題使用</p>
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
    title: 'My App',
    titleLink: '/dashboard',
    user: mockUser,
    unreadNotificationCount: 3,
    notifications: mockNotifications,
    showUserName: true,
    onAccountClick: () => console.log('Account clicked'),
    onProfileClick: () => console.log('Profile clicked'),
    onSecurityClick: () => console.log('Security clicked'),
    onLogout: () => console.log('Logout clicked'),
    onThemeChange: (theme) => console.log('Theme changed to:', theme),
    onHelpClick: () => console.log('Help clicked'),
    onAboutClick: () => console.log('About clicked'),
    onNotificationClick: (notification) =>
      console.log('Notification clicked:', notification),
    onMarkAllNotificationsRead: () => console.log('Mark all as read'),
    onViewAllNotifications: () => console.log('View all notifications'),
    onClearAllNotifications: () => console.log('Clear all notifications'),
    onNotificationSettingsClick: () =>
      console.log('Notification settings clicked'),
  },
};

/**
 * 隱藏通知功能
 */
export const WithoutNotifications: Story = {
  render: (args) => (
    <Box>
      <MainAppBar {...args} />
      <Box sx={{ p: 3 }}>
        <p>已隱藏通知鈴鐺</p>
      </Box>
    </Box>
  ),
  args: {
    title: 'Dashboard',
    user: mockUser,
    showNotifications: false,
  },
};

/**
 * 隱藏使用者選單
 */
export const WithoutUserMenu: Story = {
  render: (args) => (
    <Box>
      <MainAppBar {...args} />
      <Box sx={{ p: 3 }}>
        <p>已隱藏使用者選單（例如公開頁面）</p>
        <p>
          <strong>備註</strong>：即使沒有使用者選單，通知設定按鈕 仍然可用
        </p>
      </Box>
    </Box>
  ),
  args: {
    title: 'Public Dashboard',
    showUserMenu: false,
    unreadNotificationCount: 0,
    notifications: [],
    onNotificationClick: (notification) =>
      console.log('Notification clicked:', notification),
    onMarkAllNotificationsRead: () => console.log('Mark all as read'),
    onViewAllNotifications: () => console.log('View all notifications'),
    onClearAllNotifications: () => console.log('Clear all notifications'),
    onNotificationSettingsClick: () =>
      console.log('Notification settings clicked'),
  },
};

/**
 * 隱藏設定選單
 */
export const WithoutSettings: Story = {
  render: (args) => (
    <Box>
      <MainAppBar {...args} />
      <Box sx={{ p: 3 }}>
        <p>已隱藏設定選單</p>
        <p>
          <strong>備註</strong>：通知設定按鈕仍可於通知選單中 使用
        </p>
      </Box>
    </Box>
  ),
  args: {
    title: 'Dashboard',
    user: mockUser,
    showSettings: false,
    unreadNotificationCount: 2,
    notifications: mockNotifications,
    onAccountClick: () => console.log('Account clicked'),
    onLogout: () => console.log('Logout clicked'),
    onNotificationClick: (notification) =>
      console.log('Notification clicked:', notification),
    onMarkAllNotificationsRead: () => console.log('Mark all as read'),
    onViewAllNotifications: () => console.log('View all notifications'),
    onClearAllNotifications: () => console.log('Clear all notifications'),
    onNotificationSettingsClick: () =>
      console.log('Notification settings clicked'),
  },
};

/**
 * HQ 檢視範例
 */
export const HQView: Story = {
  render: (args) => (
    <Box>
      <MainAppBar {...args} />
      <Box sx={{ p: 3, bgcolor: 'grey.50', minHeight: '400px' }}>
        <h2>HQ Panel</h2>
        <p>功能完整的 HQ 導覽列，包含：</p>
        <ul>
          <li>含連結的 logo 與標題</li>
          <li>12 則未讀通知</li>
          <li>含狀態的 HQ 使用者</li>
          <li>已選用深色主題</li>
        </ul>
        <p>
          <strong>備註：</strong>返回按鈕等頁面層級操作應置於 頁面內容區，而非
          AppBar 中。
        </p>
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
        }}
      >
        ⚙️
      </Box>
    ),
    title: 'HQ Panel',
    titleLink: '/hq',
    user: {
      name: 'HQ User',
      email: 'hq@example.com',
      role: 'Super HQ',
      status: 'online',
    },
    unreadNotificationCount: 12,
    notifications: mockNotifications,
    showUserName: true,
    showUserStatus: true,
    currentTheme: 'dark',
    userIconMode: true,
    onAccountClick: () => console.log('Account clicked'),
    onProfileClick: () => console.log('Profile clicked'),
    onSecurityClick: () => console.log('Security clicked'),
    onLogout: () => console.log('Logout clicked'),
    onThemeChange: (theme) => console.log('Theme changed to:', theme),
    onHelpClick: () => console.log('Help clicked'),
    onAboutClick: () => console.log('About clicked'),
    onNotificationClick: (notification) =>
      console.log('Notification clicked:', notification),
    onMarkAllNotificationsRead: () => console.log('Mark all as read'),
    onViewAllNotifications: () => console.log('View all notifications'),
    onClearAllNotifications: () => console.log('Clear all notifications'),
    onNotificationSettingsClick: () =>
      console.log('Notification settings clicked'),
  },
};

/**
 * 響應式設計範例（行動裝置檢視）
 */
export const MobileView: Story = {
  render: (args) => (
    <Box>
      <MainAppBar {...args} />
      <Box sx={{ p: 3 }}>
        <p>調整視窗大小即可觀察響應式行為：</p>
        <ul>
          <li>行動裝置上採用較小的按鈕尺寸</li>
          <li>行動裝置上隱藏使用者名稱</li>
          <li>縮小按鈕之間的間距</li>
        </ul>
      </Box>
    </Box>
  ),
  args: {
    title: 'Dashboard',
    user: mockUser,
    unreadNotificationCount: 5,
    notifications: mockNotifications,
    showUserName: true,
    showUserStatus: true,
    onAccountClick: () => console.log('Account clicked'),
    onProfileClick: () => console.log('Profile clicked'),
    onSecurityClick: () => console.log('Security clicked'),
    onLogout: () => console.log('Logout clicked'),
    onThemeChange: (theme) => console.log('Theme changed to:', theme),
    onHelpClick: () => console.log('Help clicked'),
    onAboutClick: () => console.log('About clicked'),
    onNotificationClick: (notification) =>
      console.log('Notification clicked:', notification),
    onMarkAllNotificationsRead: () => console.log('Mark all as read'),
    onViewAllNotifications: () => console.log('View all notifications'),
    onClearAllNotifications: () => console.log('Clear all notifications'),
    onNotificationSettingsClick: () =>
      console.log('Notification settings clicked'),
  },
  parameters: {
    viewport: {
      defaultViewport: 'mobile1',
    },
  },
};

/**
 * 完整的儀表板標題列範例（與前端實作一致）
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
        user={mockUser}
        unreadNotificationCount={3}
        notifications={mockNotifications}
        showUserName={true}
        showUserStatus={true}
        userIconMode={true}
        currentTheme="light"
        useButtonDividers={false}
        separateLanguageSwitcher={true}
        onAccountClick={() => console.log('Account clicked')}
        onProfileClick={() => console.log('Profile clicked')}
        onSecurityClick={() => console.log('Security clicked')}
        onLogout={() => console.log('Logout clicked')}
        onThemeChange={(theme) => console.log('Theme changed to:', theme)}
        onHelpClick={() => console.log('Help clicked')}
        onAboutClick={() => console.log('About clicked')}
        onNotificationClick={(notification) =>
          console.log('Notification clicked:', notification)
        }
        onMarkAllNotificationsRead={() => console.log('Mark all as read')}
        onViewAllNotifications={() => console.log('View all notifications')}
        onClearAllNotifications={() => console.log('Clear all notifications')}
        onNotificationSettingsClick={() =>
          console.log('Notification settings clicked')
        }
      />
      <Box sx={{ p: 3, bgcolor: 'grey.50', minHeight: '400px' }}>
        <h2>歡迎使用 Dashboard</h2>
        <p>這是實際的 dashboard 實作模式：</p>
        <ul>
          <li>📊 含連結至 dashboard 的 logo（emoji）</li>
          <li>標題：「Dashboard」（取自 i18n）</li>
          <li>🔔 3 則未讀通知</li>
          <li>👤 使用者選單採純圖示模式（userIconMode=true）</li>
          <li>⚙️ 含說明與關於的設定選單</li>
          <li>| 🌐 語言切換器（以分隔線區隔）</li>
        </ul>
        <p>
          <strong>備註：</strong>此範例對應 dashboard/page.tsx 中的 實際前端實作
        </p>
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
        <p>僅顯示 logo，不含標題文字</p>
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
    user: mockUser,
    unreadNotificationCount: 5,
    notifications: mockNotifications,
    onAccountClick: () => console.log('Account clicked'),
    onProfileClick: () => console.log('Profile clicked'),
    onSecurityClick: () => console.log('Security clicked'),
    onLogout: () => console.log('Logout clicked'),
    onThemeChange: (theme) => console.log('Theme changed to:', theme),
    onHelpClick: () => console.log('Help clicked'),
    onAboutClick: () => console.log('About clicked'),
    onNotificationClick: (notification) =>
      console.log('Notification clicked:', notification),
    onMarkAllNotificationsRead: () => console.log('Mark all as read'),
    onViewAllNotifications: () => console.log('View all notifications'),
    onClearAllNotifications: () => console.log('Clear all notifications'),
    onNotificationSettingsClick: () =>
      console.log('Notification settings clicked'),
  },
};

/**
 * 設定頁面範例（正確的導覽模式）
 *
 * 示範正確的設計模式：
 * - AppBar 顯示網站標題／Logo（全域導覽）
 * - 返回按鈕放在頁面內容區（頁面層級操作）
 */
export const SettingsPagePattern: Story = {
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
        title="MEAD Dashboard"
        titleLink="/dashboard"
        user={mockUser}
        unreadNotificationCount={2}
        notifications={mockNotifications}
        showUserName={true}
        showUserStatus={true}
        userIconMode={true}
        currentTheme="light"
        onAccountClick={() => console.log('Account clicked')}
        onProfileClick={() => console.log('Profile clicked')}
        onSecurityClick={() => console.log('Security clicked')}
        onLogout={() => console.log('Logout clicked')}
        onThemeChange={(theme) => console.log('Theme changed to:', theme)}
        onHelpClick={() => console.log('Help clicked')}
        onAboutClick={() => console.log('About clicked')}
        onNotificationClick={(notification) =>
          console.log('Notification clicked:', notification)
        }
        onMarkAllNotificationsRead={() =>
          console.log('Mark all notifications as read')
        }
        onViewAllNotifications={() => console.log('View all notifications')}
        onClearAllNotifications={() => console.log('Clear all notifications')}
        onNotificationSettingsClick={() =>
          console.log('Notification settings clicked')
        }
      />
      <Container maxWidth="md" sx={{ mt: 4, mb: 4 }}>
        {/* Back button placed in page content area */}
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
          <IconButton
            onClick={() => console.log('Navigate back to dashboard')}
            sx={{ mr: 1 }}
            aria-label="back to dashboard"
          >
            <ArrowBack />
          </IconButton>
          <Box>
            <Typography variant="h4">帳號設定</Typography>
          </Box>
        </Box>
        <Typography variant="body2" color="text.secondary" paragraph>
          這是正確設計模式的範例：
        </Typography>
        <ul>
          <li>
            <strong>AppBar</strong>－顯示網站標題「MEAD Dashboard」
            （全域導覽，在所有頁面中保持一致）
          </li>
          <li>
            <strong>返回按鈕</strong>－置於頁面內容區 （頁面層級操作）
          </li>
          <li>
            <strong>頁面標題</strong>－顯示於內容區，而非 AppBar 中
          </li>
        </ul>
        <Typography variant="body2" color="text.secondary" sx={{ mt: 2 }}>
          此設計能協助使用者清楚區分：
        </Typography>
        <ul>
          <li>點選左側 AppBar 的 Logo／標題 → 返回首頁／Dashboard</li>
          <li>點選頁面中的返回按鈕 → 回到上一頁</li>
        </ul>
      </Container>
    </Box>
  ),
};

/**
 * 通知功能 - 互動示範
 *
 * 示範所有與通知相關的功能：
 * - 點擊通知鈴鐺即可檢視通知
 * - 點擊個別通知即可標為已讀
 * - 點擊「Mark All as Read」即可全部標為已讀
 * - 點擊「View All」即可導向通知中心
 * - 點擊「Clear」即可移除已讀通知
 */
export const NotificationFeatures: Story = {
  render: () => (
    <Box>
      <MainAppBar
        title="Notification Demo"
        user={mockUser}
        notifications={mockNotifications}
        unreadNotificationCount={3}
        showUserName={true}
        currentTheme="light"
        onAccountClick={() => console.log('Account clicked')}
        onProfileClick={() => console.log('Profile clicked')}
        onSecurityClick={() => console.log('Security clicked')}
        onLogout={() => console.log('Logout clicked')}
        onThemeChange={(theme) => console.log('Theme changed to:', theme)}
        onHelpClick={() => console.log('Help clicked')}
        onAboutClick={() => console.log('About clicked')}
        onNotificationClick={(notification) => {
          console.log('Notification clicked:', notification);
          alert(`Clicked: ${notification.title}\n\n${notification.message}`);
        }}
        onMarkAllNotificationsRead={() => {
          console.log('Mark all notifications as read');
          alert('All notifications marked as read');
        }}
        onViewAllNotifications={() => {
          console.log('Navigate to notification center');
          alert('Navigate to /notifications');
        }}
        onClearAllNotifications={() => {
          console.log('Clear all read notifications');
          alert('All read notifications cleared');
        }}
        onNotificationSettingsClick={() => {
          console.log('Navigate to notification settings');
          alert('Navigate to /settings/notifications');
        }}
      />
      <Box sx={{ p: 3, bgcolor: 'grey.50', minHeight: '400px' }}>
        <Typography variant="h5" gutterBottom>
          通知功能示範
        </Typography>
        <Typography variant="body1" paragraph>
          點選 AppBar 中的通知鈴鐺（🔔）即可試用以下功能：
        </Typography>
        <Box component="ul" sx={{ pl: 3 }}>
          <li>
            <Typography variant="body2" gutterBottom>
              <strong>檢視通知</strong>：點選鈴鐺圖示即可開啟 通知選單
            </Typography>
          </li>
          <li>
            <Typography variant="body2" gutterBottom>
              <strong>點選個別通知</strong>：點選任一則通知
              即可檢視詳情並標為已讀
            </Typography>
          </li>
          <li>
            <Typography variant="body2" gutterBottom>
              <strong>全部標為已讀</strong>：點選選單頁尾的
              「全部標為已讀」按鈕（有未讀通知時才會顯示）
            </Typography>
          </li>
          <li>
            <Typography variant="body2" gutterBottom>
              <strong>檢視全部通知</strong>：點選選單頁首的
              「通知」標題即可導向通知中心
            </Typography>
          </li>
          <li>
            <Typography variant="body2" gutterBottom>
              <strong>清除已讀通知</strong>：點選選單頁首的
              「清除」按鈕即可移除所有已讀通知
            </Typography>
          </li>
          <li>
            <Typography variant="body2" gutterBottom>
              <strong>通知設定</strong>：點選選單頁首的設定圖示（⚙️）
              即可導向通知設定
            </Typography>
          </li>
        </Box>
        <Box sx={{ mt: 3, p: 2, bgcolor: 'info.light', borderRadius: 1 }}>
          <Typography variant="body2">
            <strong>目前狀態</strong>：共 {mockNotifications.length} 則 通知，3
            則未讀
          </Typography>
        </Box>
      </Box>
    </Box>
  ),
};

/**
 * 通知類型 - 所有類型示範
 *
 * 顯示所有不同的通知類型及其對應的圖示與顏色
 */
export const NotificationTypes: Story = {
  render: () => {
    const allTypesNotifications: UnifiedNotification[] = [
      {
        id: '1',
        type: NotificationType.INFO,
        title: 'Info Notification',
        message: 'This is an informational notification',
        isRead: false,
        createdAt: new Date(Date.now() - 5 * 60 * 1000).toISOString(),
      },
      {
        id: '2',
        type: NotificationType.SUCCESS,
        title: 'Success Notification',
        message: 'Operation completed successfully',
        isRead: false,
        createdAt: new Date(Date.now() - 10 * 60 * 1000).toISOString(),
      },
      {
        id: '3',
        type: NotificationType.WARNING,
        title: 'Warning Notification',
        message: 'Please pay attention to this warning',
        isRead: false,
        createdAt: new Date(Date.now() - 15 * 60 * 1000).toISOString(),
      },
      {
        id: '4',
        type: NotificationType.ERROR,
        title: 'Error Notification',
        message: 'An error has occurred',
        isRead: false,
        createdAt: new Date(Date.now() - 20 * 60 * 1000).toISOString(),
      },
      {
        id: '5',
        type: NotificationType.SYSTEM,
        title: 'System Notification',
        message: 'System maintenance scheduled',
        isRead: false,
        createdAt: new Date(Date.now() - 25 * 60 * 1000).toISOString(),
      },
    ];

    return (
      <Box>
        <MainAppBar
          title="All Notification Types"
          user={mockUser}
          notifications={allTypesNotifications}
          unreadNotificationCount={5}
          currentTheme="light"
          onAccountClick={() => console.log('Account clicked')}
          onLogout={() => console.log('Logout clicked')}
          onNotificationClick={(notification) =>
            console.log('Notification clicked:', notification)
          }
          onMarkAllNotificationsRead={() => console.log('Mark all as read')}
          onViewAllNotifications={() => console.log('View all notifications')}
          onClearAllNotifications={() => console.log('Clear all notifications')}
          onNotificationSettingsClick={() =>
            console.log('Notification settings clicked')
          }
        />
        <Box sx={{ p: 3 }}>
          <Typography variant="h6" gutterBottom>
            All Notification Types
          </Typography>
          <Typography variant="body2">
            Click the notification bell to see all 5 notification types:
          </Typography>
          <Box component="ul" sx={{ mt: 2 }}>
            <li>
              <Typography variant="body2">
                <strong>INFO</strong>: Blue - Informational messages
              </Typography>
            </li>
            <li>
              <Typography variant="body2">
                <strong>SUCCESS</strong>: Green - Success confirmations
              </Typography>
            </li>
            <li>
              <Typography variant="body2">
                <strong>WARNING</strong>: Orange - Warning messages
              </Typography>
            </li>
            <li>
              <Typography variant="body2">
                <strong>ERROR</strong>: Red - Error messages
              </Typography>
            </li>
            <li>
              <Typography variant="body2">
                <strong>SYSTEM</strong>: Gray - System notifications
              </Typography>
            </li>
          </Box>
        </Box>
      </Box>
    );
  },
};

/**
 * 通知狀態 - 已讀與未讀
 *
 * 示範已讀與未讀通知之間的視覺差異
 */
export const NotificationStates: Story = {
  render: () => {
    const mixedNotifications: UnifiedNotification[] = [
      {
        id: '1',
        type: NotificationType.INFO,
        title: 'Unread Notification 1',
        message: 'This notification has not been read',
        isRead: false,
        createdAt: new Date(Date.now() - 5 * 60 * 1000).toISOString(),
      },
      {
        id: '2',
        type: NotificationType.SUCCESS,
        title: 'Read Notification 1',
        message: 'This notification has been read',
        isRead: true,
        createdAt: new Date(Date.now() - 60 * 60 * 1000).toISOString(),
        readAt: new Date(Date.now() - 55 * 60 * 1000).toISOString(),
      },
      {
        id: '3',
        type: NotificationType.WARNING,
        title: 'Unread Notification 2',
        message: 'Another unread notification',
        isRead: false,
        createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
      },
      {
        id: '4',
        type: NotificationType.ERROR,
        title: 'Read Notification 2',
        message: 'This has also been read',
        isRead: true,
        createdAt: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
        readAt: new Date(Date.now() - 23 * 60 * 60 * 1000).toISOString(),
      },
    ];

    return (
      <Box>
        <MainAppBar
          title="Notification States"
          user={mockUser}
          notifications={mixedNotifications}
          unreadNotificationCount={2}
          currentTheme="light"
          onAccountClick={() => console.log('Account clicked')}
          onLogout={() => console.log('Logout clicked')}
          onNotificationClick={(notification) =>
            console.log('Notification clicked:', notification)
          }
          onMarkAllNotificationsRead={() => console.log('Mark all as read')}
          onViewAllNotifications={() => console.log('View all notifications')}
          onClearAllNotifications={() => console.log('Clear all notifications')}
          onNotificationSettingsClick={() =>
            console.log('Notification settings clicked')
          }
        />
        <Box sx={{ p: 3 }}>
          <Typography variant="h6" gutterBottom>
            通知狀態示範
          </Typography>
          <Typography variant="body2" paragraph>
            此示範顯示 4 則通知：2 則未讀與 2 則已讀
          </Typography>
          <Typography variant="body2">
            <strong>視覺差異：</strong>
          </Typography>
          <Box component="ul" sx={{ mt: 1 }}>
            <li>
              <Typography variant="body2">
                未讀通知會有<strong>藍點指示</strong>
              </Typography>
            </li>
            <li>
              <Typography variant="body2">
                未讀通知的<strong>文字字重較粗</strong>
              </Typography>
            </li>
            <li>
              <Typography variant="body2">
                已讀通知的<strong>文字色彩較淺</strong>
              </Typography>
            </li>
            <li>
              <Typography variant="body2">
                徽章會顯示<strong>未讀數量（2）</strong>
              </Typography>
            </li>
          </Box>
        </Box>
      </Box>
    );
  },
};

/**
 * 空通知狀態
 *
 * 當沒有通知時顯示空狀態
 */
export const EmptyNotifications: Story = {
  render: () => (
    <Box>
      <MainAppBar
        title="Empty Notifications"
        user={mockUser}
        notifications={[]}
        unreadNotificationCount={0}
        currentTheme="light"
        onAccountClick={() => console.log('Account clicked')}
        onLogout={() => console.log('Logout clicked')}
        onNotificationClick={(notification) =>
          console.log('Notification clicked:', notification)
        }
        onMarkAllNotificationsRead={() => console.log('Mark all as read')}
        onViewAllNotifications={() => console.log('View all notifications')}
        onClearAllNotifications={() => console.log('Clear all notifications')}
        onNotificationSettingsClick={() =>
          console.log('Notification settings clicked')
        }
      />
      <Box sx={{ p: 3 }}>
        <Typography variant="h6" gutterBottom>
          Empty Notification State
        </Typography>
        <Typography variant="body2">
          Click the notification bell to see the empty state message when there
          are no notifications.
        </Typography>
      </Box>
    </Box>
  ),
};
