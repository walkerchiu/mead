import type { Meta, StoryObj } from '@storybook/react';
import { MainAppBar } from './MainAppBar';
import { Box, Typography, IconButton, Container } from '@mui/material';
import { ArrowBack } from '@mui/icons-material';
import type { Notification } from '@/components/atoms';

const mockUser = {
  name: 'John Doe',
  email: 'john.doe@example.com',
  avatar: 'https://i.pravatar.cc/150?img=1',
  role: 'Admin',
  status: 'online' as const,
};

const mockNotifications: Notification[] = [
  {
    id: '1',
    type: 'info',
    title: 'System Maintenance',
    message:
      'System maintenance scheduled for tonight at 11:00 PM, estimated duration 2 hours',
    timestamp: new Date(Date.now() - 5 * 60 * 1000),
    read: false,
  },
  {
    id: '2',
    type: 'success',
    title: 'Password Updated',
    message: 'Your password has been successfully updated',
    timestamp: new Date(Date.now() - 60 * 60 * 1000),
    read: true,
  },
  {
    id: '3',
    type: 'warning',
    title: 'Security Warning',
    message: 'Login detected from a new device',
    timestamp: new Date(Date.now() - 24 * 60 * 60 * 1000),
    read: false,
  },
];

/**
 * MainAppBar is a unified application navigation bar component
 *
 * **Features**:
 * - Supports text title or Logo
 * - Title/Logo can be set as a hyperlink
 * - Notification center (bell icon + Badge)
 * - Language switcher
 * - User menu (avatar + personal actions)
 * - Settings menu (theme toggle + help + about)
 * - Responsive design
 *
 * **Design Principles**:
 * - AppBar is for global navigation, always displays site title/Logo
 * - Page-level actions (like back buttons) should be placed in the page content area, not in the AppBar
 *
 * **Use Cases**:
 * - Application top navigation bar
 * - Admin panel page header
 * - Dashboard page header
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
 * Default text title style (without user information)
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
 * Full featured display: notifications + user + settings + language
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
 * All buttons with dividers
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
 * Without dividers (compact layout)
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
 * Only language switcher separated (default)
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
 * With notifications and user information
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
 * User menu displays name
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
 * Without user avatar (shows initials)
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
      name: 'Emily Chen',
      email: 'emily@example.com',
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
 * Notification count over 99
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
 * No notifications
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
 * Title with link
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
 * With Logo (text logo example)
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
 * Hide notifications feature
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
 * Hide user menu
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
 * Hide settings menu
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
 * Admin View example
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
 * Responsive design example (mobile view)
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
 * Complete Dashboard Header example (consistent with frontend implementation)
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
 * Logo only without title
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
 * Settings page example (correct navigation pattern)
 *
 * Demonstrates the correct design pattern:
 * - AppBar displays site title/Logo (global navigation)
 * - Back button placed in page content area (page-level action)
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
            <Typography variant="h4">Account Settings</Typography>
          </Box>
        </Box>
        <Typography variant="body2" color="text.secondary" paragraph>
          This is an example of the correct design pattern:
        </Typography>
        <ul>
          <li>
            <strong>AppBar</strong> - Displays site title "Wind Dashboard"
            (global navigation, consistent across all pages)
          </li>
          <li>
            <strong>Back button</strong> - Placed in page content area
            (page-level action)
          </li>
          <li>
            <strong>Page title</strong> - Displayed in content area, not in
            AppBar
          </li>
        </ul>
        <Typography variant="body2" color="text.secondary" sx={{ mt: 2 }}>
          This design helps users clearly distinguish:
        </Typography>
        <ul>
          <li>
            Click AppBar Logo/title on the left → Return to home/Dashboard
          </li>
          <li>Click back button in page → Return to previous page</li>
        </ul>
      </Container>
    </Box>
  ),
};
