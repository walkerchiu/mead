import type { Meta, StoryObj } from '@storybook/react';
import { UserMenu, createUserMenuItems } from './UserMenu';
import { AppBar, Toolbar, Typography, Box } from '@mui/material';

const mockUser = {
  name: '王小明',
  email: 'wang@example.com',
  avatar: 'https://i.pravatar.cc/150?img=1',
  role: 'Admin',
  status: 'online' as const,
};

// 默認的 menu items（使用 i18n 中的標籤）
const defaultMenuItems = createUserMenuItems({
  onAccountClick: () => console.log('Account settings clicked'),
  onProfileClick: () => console.log('Profile clicked'),
  onSecurityClick: () => console.log('Security clicked'),
  onLogout: () => console.log('Logout clicked'),
  accountUrl: '/settings/account',
  profileUrl: '/settings/profile',
  securityUrl: '/settings/security',
  accountLabel: '帳號設定', // 對應 i18n: components.userMenu.account
  profileLabel: '個人資料', // 對應 i18n: components.userMenu.profile
  securityLabel: '安全設定', // 對應 i18n: components.userMenu.security
  logoutLabel: '登出', // 對應 i18n: components.userMenu.logout
});

/**
 * UserMenu displays user information and provides quick access to
 * account settings, profile, security settings, and logout.
 *
 * **Features**:
 * - User avatar with optional status indicator
 * - Optional user name display (responsive)
 * - User info card in dropdown menu
 * - Quick access to account settings, profile, and security
 * - Logout functionality
 * - Responsive design (auto-hide name on mobile)
 * - All menu options are conditional based on callback presence
 *
 * **Use Cases**:
 * - Application header user menu
 * - Dashboard user profile widget
 * - Navigation bar user section
 */
const meta = {
  title: 'Atoms/UserMenu',
  component: UserMenu,
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component:
          'A user menu component that displays user information and provides quick navigation to user-related pages.',
      },
    },
  },
  tags: ['autodocs'],
  argTypes: {
    showName: {
      control: 'boolean',
      description: 'Show user name next to avatar',
      table: {
        defaultValue: { summary: 'false' },
      },
    },
    showEmail: {
      control: 'boolean',
      description: 'Show email in menu dropdown',
      table: {
        defaultValue: { summary: 'true' },
      },
    },
    showRole: {
      control: 'boolean',
      description: 'Show role badge in menu dropdown',
      table: {
        defaultValue: { summary: 'false' },
      },
    },
    showStatus: {
      control: 'boolean',
      description: 'Show online status indicator',
      table: {
        defaultValue: { summary: 'false' },
      },
    },
    size: {
      control: 'select',
      options: ['small', 'medium', 'large'],
      description: 'Size of the button',
      table: {
        defaultValue: { summary: 'medium' },
      },
    },
    color: {
      control: 'select',
      options: [
        'inherit',
        'primary',
        'secondary',
        'success',
        'error',
        'info',
        'warning',
      ],
      description: 'Color of the button',
      table: {
        defaultValue: { summary: 'inherit' },
      },
    },
    onAccountClick: {
      action: 'account clicked',
      description: 'Callback when account settings is clicked',
    },
    onProfileClick: {
      action: 'profile clicked',
      description: 'Callback when profile is clicked',
    },
    onSecurityClick: {
      action: 'security clicked',
      description: 'Callback when security settings is clicked',
    },
    onLogout: {
      action: 'logout clicked',
      description: 'Callback when logout is clicked',
    },
  },
} satisfies Meta<typeof UserMenu>;

export default meta;
type Story = StoryObj<typeof meta>;

/**
 * Default user menu with avatar only and standard menu items
 */
export const Default: Story = {
  args: {
    user: mockUser,
    menuItems: defaultMenuItems,
  },
};

/**
 * User menu with name displayed
 */
export const WithName: Story = {
  args: {
    user: mockUser,
    menuItems: defaultMenuItems,
    showName: true,
  },
};

/**
 * User menu with status indicator
 */
export const WithStatus: Story = {
  args: {
    user: mockUser,
    menuItems: defaultMenuItems,
    showStatus: true,
  },
};

/**
 * User menu with name and status
 */
export const WithNameAndStatus: Story = {
  args: {
    user: mockUser,
    menuItems: defaultMenuItems,
    showName: true,
    showStatus: true,
  },
};

/**
 * User without avatar (shows initials)
 */
export const WithoutAvatar: Story = {
  args: {
    user: {
      name: '張小華',
      email: 'chang@example.com',
      status: 'online',
    },
    menuItems: defaultMenuItems,
    showName: true,
    showStatus: true,
  },
};

/**
 * User menu showing role badge
 */
export const WithRole: Story = {
  args: {
    user: mockUser,
    menuItems: defaultMenuItems,
    showRole: true,
  },
};

/**
 * User menu without email
 */
export const WithoutEmail: Story = {
  args: {
    user: {
      name: '李大明',
      avatar: 'https://i.pravatar.cc/150?img=5',
    },
    menuItems: defaultMenuItems,
    showEmail: false,
  },
};

/**
 * Different user statuses
 */
export const DifferentStatuses: Story = {
  render: () => (
    <Box sx={{ display: 'flex', gap: 2, flexDirection: 'column' }}>
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
        <Typography variant="body2" sx={{ width: 80 }}>
          Online:
        </Typography>
        <UserMenu
          user={{ ...mockUser, status: 'online' }}
          menuItems={defaultMenuItems}
          showStatus
          showName
        />
      </Box>
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
        <Typography variant="body2" sx={{ width: 80 }}>
          Away:
        </Typography>
        <UserMenu
          user={{ ...mockUser, status: 'away' }}
          menuItems={defaultMenuItems}
          showStatus
          showName
        />
      </Box>
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
        <Typography variant="body2" sx={{ width: 80 }}>
          Busy:
        </Typography>
        <UserMenu
          user={{ ...mockUser, status: 'busy' }}
          menuItems={defaultMenuItems}
          showStatus
          showName
        />
      </Box>
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
        <Typography variant="body2" sx={{ width: 80 }}>
          Offline:
        </Typography>
        <UserMenu
          user={{ ...mockUser, status: 'offline' }}
          menuItems={defaultMenuItems}
          showStatus
          showName
        />
      </Box>
    </Box>
  ),
};

/**
 * Different sizes
 */
export const Sizes: Story = {
  render: () => (
    <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
      <Box sx={{ textAlign: 'center' }}>
        <Typography variant="caption" display="block" sx={{ mb: 1 }}>
          Small
        </Typography>
        <UserMenu user={mockUser} menuItems={defaultMenuItems} size="small" />
      </Box>
      <Box sx={{ textAlign: 'center' }}>
        <Typography variant="caption" display="block" sx={{ mb: 1 }}>
          Medium
        </Typography>
        <UserMenu user={mockUser} menuItems={defaultMenuItems} size="medium" />
      </Box>
      <Box sx={{ textAlign: 'center' }}>
        <Typography variant="caption" display="block" sx={{ mb: 1 }}>
          Large
        </Typography>
        <UserMenu user={mockUser} menuItems={defaultMenuItems} size="large" />
      </Box>
    </Box>
  ),
};

/**
 * In AppBar (typical use case)
 */
export const InAppBar: Story = {
  args: {
    user: mockUser,
    menuItems: defaultMenuItems,
    color: 'inherit',
    showStatus: true,
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
 * In AppBar with name shown
 */
export const InAppBarWithName: Story = {
  args: {
    user: mockUser,
    menuItems: defaultMenuItems,
    color: 'inherit',
    showName: true,
    showStatus: true,
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
    user: mockUser,
    menuItems: defaultMenuItems,
    color: 'inherit',
    showName: true,
    showStatus: true,
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
                🔔 3
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
                🌐 EN
              </Box>
              <Story />
              <Box
                component="span"
                sx={{
                  color: 'inherit',
                  px: 1.5,
                  py: 1,
                  cursor: 'pointer',
                  borderRadius: 1,
                  '&:hover': {
                    bgcolor: 'rgba(255, 255, 255, 0.1)',
                  },
                }}
              >
                ⚙️
              </Box>
            </Box>
          </Toolbar>
        </AppBar>
      </Box>
    ),
  ],
};

/**
 * Admin user with role badge
 */
export const AdminUser: Story = {
  args: {
    user: {
      name: 'Admin User',
      email: 'admin@example.com',
      avatar: 'https://i.pravatar.cc/150?img=8',
      role: 'Super Admin',
      status: 'online',
    },
    menuItems: defaultMenuItems,
    showName: true,
    showRole: true,
    showStatus: true,
  },
};

/**
 * Full featured example
 */
export const FullFeatured: Story = {
  args: {
    user: mockUser,
    menuItems: defaultMenuItems,
    showName: true,
    showEmail: true,
    showRole: true,
    showStatus: true,
  },
};

/**
 * Interactive example
 */
export const Interactive: Story = {
  args: {
    user: mockUser,
    menuItems: defaultMenuItems,
    showName: true,
    showStatus: true,
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
          Try the User Menu
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
          Click the user avatar to see menu options
        </Typography>
        <UserMenu {...args} />
      </Box>
      <Typography variant="caption" color="text.secondary">
        Menu includes Account Settings, Profile, Security, and Logout
      </Typography>
    </Box>
  ),
};

/**
 * With Only Account and Logout (minimal setup)
 */
export const MinimalSetup: Story = {
  args: {
    user: mockUser,
    showName: true,
    showStatus: true,
    // 只包含帳號設定和登出
    menuItems: createUserMenuItems({
      onAccountClick: () => console.log('Account clicked'),
      onLogout: () => console.log('Logout clicked'),
      accountUrl: '/settings/account',
      accountLabel: '帳號設定',
      logoutLabel: '登出',
    }),
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
          Minimal User Menu
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
          Only shows Account Settings and Logout
        </Typography>
        <UserMenu {...args} />
      </Box>
      <Typography variant="caption" color="text.secondary">
        Menu includes only Account Settings and Logout
      </Typography>
    </Box>
  ),
};

/**
 * Full Setup with All Options
 */
export const FullSetup: Story = {
  args: {
    user: mockUser,
    menuItems: defaultMenuItems,
    showName: true,
    showStatus: true,
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
          Full User Menu
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
          Shows all menu options
        </Typography>
        <UserMenu {...args} />
      </Box>
      <Typography variant="caption" color="text.secondary">
        Menu includes Account Settings, Profile, Security, and Logout
      </Typography>
    </Box>
  ),
};
