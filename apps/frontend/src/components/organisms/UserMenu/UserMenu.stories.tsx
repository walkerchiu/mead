import type { Meta, StoryObj } from '@storybook/nextjs';
import { Box, Typography } from '@mui/material';
import { UserMenu } from './UserMenu';
import {
  AccountCircle,
  Person,
  Security,
  Settings,
  Notifications,
  ExitToApp,
} from '@mui/icons-material';

/**
 * UserMenu - Atomic Design: Organism
 *
 * 完整的使用者選單元件，結合：
 * - UserButton（Atom）- 觸發按鈕
 * - UserMenuHeader（Molecule）- 選單頁首
 * - UserMenuList（Molecule）- 選單項目列表
 *
 * 如同 Notification 系統一般，完全遵循 Atomic Design 架構。
 */
const meta = {
  title: 'Shared/Organisms/UserMenu',
  component: UserMenu,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
  argTypes: {
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
    },
    size: {
      control: 'select',
      options: ['small', 'medium', 'large'],
    },
    showName: {
      control: 'boolean',
    },
    showEmail: {
      control: 'boolean',
    },
    showRole: {
      control: 'boolean',
    },
    showStatus: {
      control: 'boolean',
    },
    iconMode: {
      control: 'boolean',
    },
  },
} satisfies Meta<typeof UserMenu>;

export default meta;
type Story = StoryObj<typeof meta>;

const defaultUser = {
  name: 'John Doe',
  email: 'john@example.com',
  avatar: '/avatars/user-01.jpg',
  role: 'HQ',
  status: 'online' as const,
};

const defaultMenuItems = [
  {
    id: 'account',
    label: 'Account Settings',
    icon: <AccountCircle />,
    onClick: () => alert('Account Settings clicked'),
  },
  {
    id: 'profile',
    label: 'Profile',
    icon: <Person />,
    onClick: () => alert('Profile clicked'),
  },
  {
    id: 'security',
    label: 'Security',
    icon: <Security />,
    onClick: () => alert('Security clicked'),
    dividerAfter: true,
  },
  {
    id: 'logout',
    label: 'Logout',
    icon: <ExitToApp />,
    variant: 'danger' as const,
    onClick: () => alert('Logout clicked'),
  },
];

/**
 * 預設樣式 - 完整的使用者選單
 */
export const Default: Story = {
  args: {
    user: defaultUser,
    menuItems: defaultMenuItems,
  },
};

/**
 * 精簡 - 不含 email 與角色
 */
export const Minimal: Story = {
  args: {
    user: defaultUser,
    menuItems: defaultMenuItems,
    showEmail: false,
    showRole: false,
  },
};

/**
 * 完整資訊 - 顯示所有欄位
 */
export const FullInformation: Story = {
  args: {
    user: defaultUser,
    menuItems: defaultMenuItems,
    showName: true,
    showEmail: true,
    showRole: true,
    showStatus: true,
  },
};

/**
 * 在按鈕上顯示使用者名稱
 */
export const WithNameOnButton: Story = {
  args: {
    user: defaultUser,
    menuItems: defaultMenuItems,
    showName: true,
  },
};

/**
 * 圖示模式 - 使用統一圖示取代頭像
 */
export const IconMode: Story = {
  args: {
    user: defaultUser,
    menuItems: defaultMenuItems,
    iconMode: true,
  },
};

/**
 * 顯示姓名的圖示模式
 */
export const IconModeWithName: Story = {
  args: {
    user: defaultUser,
    menuItems: defaultMenuItems,
    iconMode: true,
    showName: true,
  },
};

/**
 * 無頭像的使用者
 */
export const WithoutAvatar: Story = {
  args: {
    user: {
      name: 'Jane Smith',
      email: 'jane@example.com',
      role: 'Customer',
      status: 'online' as const,
    },
    menuItems: defaultMenuItems,
    showEmail: true,
    showRole: true,
  },
};

/**
 * 不同的線上狀態
 */
export const StatusVariants: Story = {
  render: () => (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
      <Box>
        <Typography variant="subtitle2" gutterBottom>
          Online Status
        </Typography>
        <UserMenu
          user={{ ...defaultUser, status: 'online' as const }}
          menuItems={defaultMenuItems}
          showStatus={true}
          showEmail={true}
          showRole={true}
        />
      </Box>
      <Box>
        <Typography variant="subtitle2" gutterBottom>
          Away Status
        </Typography>
        <UserMenu
          user={{ ...defaultUser, status: 'away' as const }}
          menuItems={defaultMenuItems}
          showStatus={true}
          showEmail={true}
          showRole={true}
        />
      </Box>
      <Box>
        <Typography variant="subtitle2" gutterBottom>
          Busy Status
        </Typography>
        <UserMenu
          user={{ ...defaultUser, status: 'busy' as const }}
          menuItems={defaultMenuItems}
          showStatus={true}
          showEmail={true}
          showRole={true}
        />
      </Box>
      <Box>
        <Typography variant="subtitle2" gutterBottom>
          Offline Status
        </Typography>
        <UserMenu
          user={{ ...defaultUser, status: 'offline' as const }}
          menuItems={defaultMenuItems}
          showStatus={true}
          showEmail={true}
          showRole={true}
        />
      </Box>
    </Box>
  ),
};

/**
 * 不同尺寸
 */
export const Sizes: Story = {
  render: () => (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
      <Box>
        <Typography variant="subtitle2" gutterBottom>
          Small Size
        </Typography>
        <UserMenu
          user={defaultUser}
          menuItems={defaultMenuItems}
          size="small"
        />
      </Box>
      <Box>
        <Typography variant="subtitle2" gutterBottom>
          Medium Size
        </Typography>
        <UserMenu
          user={defaultUser}
          menuItems={defaultMenuItems}
          size="medium"
        />
      </Box>
      <Box>
        <Typography variant="subtitle2" gutterBottom>
          Large Size
        </Typography>
        <UserMenu
          user={defaultUser}
          menuItems={defaultMenuItems}
          size="large"
        />
      </Box>
    </Box>
  ),
};

/**
 * 不同顏色
 */
export const Colors: Story = {
  render: () => (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
      <Box>
        <Typography variant="subtitle2" gutterBottom>
          Primary Color
        </Typography>
        <UserMenu
          user={defaultUser}
          menuItems={defaultMenuItems}
          color="primary"
        />
      </Box>
      <Box>
        <Typography variant="subtitle2" gutterBottom>
          Secondary Color
        </Typography>
        <UserMenu
          user={defaultUser}
          menuItems={defaultMenuItems}
          color="secondary"
        />
      </Box>
    </Box>
  ),
};

/**
 * 不含選單項目 - 僅頁首
 */
export const WithoutMenuItems: Story = {
  args: {
    user: defaultUser,
    menuItems: [],
    showEmail: true,
    showRole: true,
  },
};

/**
 * 延伸的選單項目
 */
export const ExtendedMenuItems: Story = {
  args: {
    user: defaultUser,
    menuItems: [
      {
        id: 'account',
        label: 'Account Settings',
        icon: <AccountCircle />,
        onClick: () => console.log('Account'),
      },
      {
        id: 'profile',
        label: 'Profile',
        icon: <Person />,
        onClick: () => console.log('Profile'),
      },
      {
        id: 'security',
        label: 'Security',
        icon: <Security />,
        onClick: () => console.log('Security'),
      },
      {
        id: 'preferences',
        label: 'Preferences',
        icon: <Settings />,
        onClick: () => console.log('Preferences'),
      },
      {
        id: 'notifications',
        label: 'Notification Settings',
        icon: <Notifications />,
        onClick: () => console.log('Notifications'),
        dividerAfter: true,
      },
      {
        id: 'logout',
        label: 'Logout',
        icon: <ExitToApp />,
        variant: 'danger' as const,
        onClick: () => alert('Logging out...'),
      },
    ],
    showEmail: true,
    showRole: true,
  },
};

/**
 * Customer 角色
 */
export const CustomerRole: Story = {
  args: {
    user: {
      name: 'Jane Smith',
      email: 'jane@example.com',
      role: 'Customer',
      status: 'online' as const,
    },
    menuItems: [
      {
        id: 'account',
        label: 'Account Settings',
        icon: <AccountCircle />,
        onClick: () => console.log('Account'),
      },
      {
        id: 'profile',
        label: 'Profile',
        icon: <Person />,
        onClick: () => console.log('Profile'),
        dividerAfter: true,
      },
      {
        id: 'logout',
        label: 'Logout',
        icon: <ExitToApp />,
        variant: 'danger' as const,
        onClick: () => alert('Logging out...'),
      },
    ],
    showEmail: true,
    showRole: true,
  },
};

/**
 * HQ 角色
 */
export const HQRole: Story = {
  args: {
    user: defaultUser,
    menuItems: defaultMenuItems,
    showEmail: true,
    showRole: true,
  },
};
