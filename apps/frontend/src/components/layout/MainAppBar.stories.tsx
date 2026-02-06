import type { Meta, StoryObj } from '@storybook/react';
import { MainAppBar } from './MainAppBar';
import { Box, Typography, IconButton, Container } from '@mui/material';
import { ArrowBack } from '@mui/icons-material';
import type { Notification } from '@/components/atoms';

const mockUser = {
  name: '王小明',
  email: 'wang@example.com',
  avatar: 'https://i.pravatar.cc/150?img=1',
  role: 'Admin',
  status: 'online' as const,
};

const mockNotifications: Notification[] = [
  {
    id: '1',
    type: 'info',
    title: '系統維護通知',
    message: '系統將於今晚 23:00 進行維護，預計維護時間 2 小時',
    timestamp: new Date(Date.now() - 5 * 60 * 1000),
    read: false,
  },
  {
    id: '2',
    type: 'success',
    title: '密碼已更新',
    message: '您的密碼已成功更新',
    timestamp: new Date(Date.now() - 60 * 60 * 1000),
    read: true,
  },
  {
    id: '3',
    type: 'warning',
    title: '安全警告',
    message: '檢測到來自新裝置的登入',
    timestamp: new Date(Date.now() - 24 * 60 * 60 * 1000),
    read: false,
  },
];

/**
 * MainAppBar 是統一的應用程式導覽列元件
 *
 * **特性**:
 * - 支援文字標題或 Logo
 * - 標題/Logo 可設定超連結
 * - 通知中心（鈴鐺 + Badge）
 * - 語言切換器
 * - 使用者選單（頭像 + 個人操作）
 * - 設定選單（主題切換 + 說明 + 關於）
 * - 響應式設計
 *
 * **設計原則**:
 * - AppBar 為全域導航，始終顯示網站標題/Logo
 * - 頁面層級操作（如返回按鈕）應放在頁面內容區域，不在 AppBar 中
 *
 * **使用場景**:
 * - 應用程式頂部導覽列
 * - 管理後台頁面標題列
 * - Dashboard 頁面 header
 */
const meta = {
  title: 'Layout/MainAppBar',
  component: MainAppBar,
  parameters: {
    layout: 'fullscreen',
    docs: {
      description: {
        component:
          'Unified application navigation bar with notifications, language switcher, user menu, and settings menu.',
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
    showNotifications: {
      control: 'boolean',
      description: 'Show notification bell',
      table: {
        defaultValue: { summary: 'true' },
      },
    },
    showUserMenu: {
      control: 'boolean',
      description: 'Show user menu',
      table: {
        defaultValue: { summary: 'true' },
      },
    },
    showSettings: {
      control: 'boolean',
      description: 'Show settings menu',
      table: {
        defaultValue: { summary: 'true' },
      },
    },
    showUserName: {
      control: 'boolean',
      description: 'Show user name in user menu',
      table: {
        defaultValue: { summary: 'false' },
      },
    },
    showUserStatus: {
      control: 'boolean',
      description: 'Show user online status',
      table: {
        defaultValue: { summary: 'false' },
      },
    },
    useButtonDividers: {
      control: 'boolean',
      description:
        'Use dividers between notification, user, and settings buttons',
      table: {
        defaultValue: { summary: 'false' },
      },
    },
    separateLanguageSwitcher: {
      control: 'boolean',
      description: 'Show divider before language switcher',
      table: {
        defaultValue: { summary: 'true' },
      },
    },
  },
} satisfies Meta<typeof MainAppBar>;

export default meta;
type Story = StoryObj<typeof meta>;

/**
 * 預設的文字標題樣式（不含使用者資訊）
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
 * 完整功能展示：通知 + 使用者 + 設定 + 語言
 */
export const FullFeatured: Story = {
  render: (args) => (
    <Box>
      <MainAppBar {...args} />
      <Box sx={{ p: 3, bgcolor: 'grey.50', minHeight: '400px' }}>
        <h2>Welcome to Dashboard</h2>
        <p>All features enabled with new button order:</p>
        <ul>
          <li>🔔 Notification bell with 3 unread</li>
          <li>👤 User menu with avatar and name</li>
          <li>⚙️ Settings menu with theme toggle</li>
          <li>| 🌐 Language switcher (separated by divider, default)</li>
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
  },
};

/**
 * 所有按鈕都有分隔線
 */
export const WithAllDividers: Story = {
  render: (args) => (
    <Box>
      <MainAppBar {...args} />
      <Box sx={{ p: 3, bgcolor: 'grey.50', minHeight: '400px' }}>
        <h2>All Buttons with Dividers</h2>
        <p>All button groups are separated with dividers:</p>
        <ul>
          <li>🔔 | 👤 | ⚙️ | 🌐</li>
        </ul>
        <p>
          <strong>
            Both useButtonDividers and separateLanguageSwitcher are enabled
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
 * 無分隔線（緊密排列）
 */
export const WithoutDividers: Story = {
  render: (args) => (
    <Box>
      <MainAppBar {...args} />
      <Box sx={{ p: 3 }}>
        <p>All buttons without dividers (compact layout):</p>
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
 * 僅語言切換有分隔線（預設）
 */
export const OnlyLanguageSeparated: Story = {
  render: (args) => (
    <Box>
      <MainAppBar {...args} />
      <Box sx={{ p: 3 }}>
        <p>Only language switcher is separated (default behavior):</p>
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
 * 帶有通知和使用者資訊
 */
export const WithNotificationsAndUser: Story = {
  render: (args) => (
    <Box>
      <MainAppBar {...args} />
      <Box sx={{ p: 3 }}>
        <p>Click notification bell to see 5 notifications</p>
        <p>Click user avatar to access profile and settings</p>
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
  },
};

/**
 * 使用者選單顯示名稱
 */
export const WithUserName: Story = {
  render: (args) => (
    <Box>
      <MainAppBar {...args} />
      <Box sx={{ p: 3 }}>
        <p>User name is displayed next to avatar (desktop view)</p>
      </Box>
    </Box>
  ),
  args: {
    title: 'Dashboard',
    user: mockUser,
    showUserName: true,
    showUserStatus: true,
    unreadNotificationCount: 0,
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
 * 無使用者頭像（顯示縮寫）
 */
export const WithoutUserAvatar: Story = {
  render: (args) => (
    <Box>
      <MainAppBar {...args} />
      <Box sx={{ p: 3 }}>
        <p>User without avatar shows initials</p>
      </Box>
    </Box>
  ),
  args: {
    title: 'Dashboard',
    user: {
      name: '張小華',
      email: 'chang@example.com',
      status: 'online',
    },
    showUserName: true,
    showUserStatus: true,
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
 * 通知數量超過 99
 */
export const ManyNotifications: Story = {
  render: (args) => (
    <Box>
      <MainAppBar {...args} />
      <Box sx={{ p: 3 }}>
        <p>Badge shows 99+ for counts over 99</p>
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
  },
};

/**
 * 無通知
 */
export const NoNotifications: Story = {
  render: (args) => (
    <Box>
      <MainAppBar {...args} />
      <Box sx={{ p: 3 }}>
        <p>Notification menu shows empty state</p>
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
    user: mockUser,
    unreadNotificationCount: 2,
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
 * 使用 Logo（文字 Logo 示例）
 */
export const WithLogo: Story = {
  render: (args) => (
    <Box>
      <MainAppBar {...args} />
      <Box sx={{ p: 3 }}>
        <p>Using a custom logo with title</p>
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
    showUserName: true,
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
 * 隱藏通知功能
 */
export const WithoutNotifications: Story = {
  render: (args) => (
    <Box>
      <MainAppBar {...args} />
      <Box sx={{ p: 3 }}>
        <p>Notification bell is hidden</p>
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
        <p>User menu is hidden (e.g., public pages)</p>
      </Box>
    </Box>
  ),
  args: {
    title: 'Public Dashboard',
    showUserMenu: false,
    unreadNotificationCount: 0,
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
        <p>Settings menu is hidden</p>
      </Box>
    </Box>
  ),
  args: {
    title: 'Dashboard',
    user: mockUser,
    showSettings: false,
    unreadNotificationCount: 2,
  },
};

/**
 * Admin View 示例
 */
export const AdminView: Story = {
  render: (args) => (
    <Box>
      <MainAppBar {...args} />
      <Box sx={{ p: 3, bgcolor: 'grey.50', minHeight: '400px' }}>
        <h2>Admin Panel</h2>
        <p>Full featured admin navigation bar with:</p>
        <ul>
          <li>Logo and title with link</li>
          <li>12 unread notifications</li>
          <li>Admin user with status</li>
          <li>Dark theme selected</li>
        </ul>
        <p>
          <strong>Note:</strong> Page-level actions like back buttons should be
          placed in the page content area, not in the AppBar.
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
    title: 'Admin Panel',
    titleLink: '/admin',
    user: {
      name: 'Admin User',
      email: 'admin@example.com',
      role: 'Super Admin',
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
  },
};

/**
 * 響應式設計示例（手機版）
 */
export const MobileView: Story = {
  render: (args) => (
    <Box>
      <MainAppBar {...args} />
      <Box sx={{ p: 3 }}>
        <p>Resize window to see responsive behavior:</p>
        <ul>
          <li>Smaller button sizes on mobile</li>
          <li>User name hidden on mobile</li>
          <li>Reduced gap between buttons</li>
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
  },
  parameters: {
    viewport: {
      defaultViewport: 'mobile1',
    },
  },
};

/**
 * Dashboard Header 完整示例（與前端實作一致）
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
      />
      <Box sx={{ p: 3, bgcolor: 'grey.50', minHeight: '400px' }}>
        <h2>Welcome to Dashboard</h2>
        <p>This is the actual dashboard implementation pattern:</p>
        <ul>
          <li>📊 Logo (emoji) with link to dashboard</li>
          <li>Title: "Dashboard" (from i18n)</li>
          <li>🔔 3 unread notifications</li>
          <li>👤 User menu in icon-only mode (userIconMode=true)</li>
          <li>⚙️ Settings menu with Help and About</li>
          <li>| 🌐 Language switcher (separated by divider)</li>
        </ul>
        <p>
          <strong>Note:</strong> This matches the actual frontend implementation
          in dashboard/page.tsx
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
    user: mockUser,
    unreadNotificationCount: 5,
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
 * 設定頁面範例（正確的導航模式）
 *
 * 展示正確的設計模式：
 * - AppBar 顯示網站標題/Logo（全域導航）
 * - 返回按鈕放在頁面內容區域（頁面層級操作）
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
        title="Wind Dashboard"
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
      />
      <Container maxWidth="md" sx={{ mt: 4, mb: 4 }}>
        {/* 返回按鈕放在頁面內容區域 */}
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
          這是正確的設計模式範例：
        </Typography>
        <ul>
          <li>
            <strong>AppBar</strong> - 顯示網站標題「Wind
            Dashboard」（全域導航，所有頁面一致）
          </li>
          <li>
            <strong>返回按鈕</strong> - 放在頁面內容區域（頁面層級操作）
          </li>
          <li>
            <strong>頁面標題</strong> - 在內容區域顯示，不在 AppBar 中
          </li>
        </ul>
        <Typography variant="body2" color="text.secondary" sx={{ mt: 2 }}>
          這樣的設計讓使用者清楚區分：
        </Typography>
        <ul>
          <li>點擊 AppBar 左側的 Logo/標題 → 回到首頁/Dashboard</li>
          <li>點擊頁面內的返回按鈕 → 返回上一頁</li>
        </ul>
      </Container>
    </Box>
  ),
};
