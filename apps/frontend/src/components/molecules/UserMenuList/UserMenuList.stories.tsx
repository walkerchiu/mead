import type { Meta, StoryObj } from '@storybook/nextjs';
import { UserMenuList } from './UserMenuList';
import {
  AccountCircle,
  Person,
  Security,
  Settings,
  Notifications,
  ExitToApp,
} from '@mui/icons-material';
import { Box } from '@mui/material';

/**
 * UserMenuList - Atomic Design: Molecule
 *
 * 結合多個 UserMenuItem（Atom）元件的使用者選單項目列表。
 * 支援分隔線與 danger 樣式項目。
 */
const meta = {
  title: 'Shared/Molecules/UserMenuList',
  component: UserMenuList,
  parameters: {
    layout: 'padded',
  },
  tags: ['autodocs'],
  decorators: [
    (Story) => (
      <Box
        sx={{
          width: 300,
          border: '1px solid',
          borderColor: 'divider',
          borderRadius: 1,
        }}
      >
        <Story />
      </Box>
    ),
  ],
} satisfies Meta<typeof UserMenuList>;

export default meta;
type Story = StoryObj<typeof meta>;

/**
 * 預設樣式 - 基本選單項目
 */
export const Default: Story = {
  args: {
    items: [
      {
        id: 'account',
        label: 'Account Settings',
        icon: <AccountCircle />,
        onClick: () => alert('Account clicked'),
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
      },
    ],
  },
};

/**
 * 含分隔線的選單
 */
export const WithDividers: Story = {
  args: {
    items: [
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
        id: 'settings',
        label: 'Preferences',
        icon: <Settings />,
        onClick: () => console.log('Settings'),
      },
      {
        id: 'notifications',
        label: 'Notifications',
        icon: <Notifications />,
        onClick: () => console.log('Notifications'),
        dividerAfter: true,
      },
      {
        id: 'logout',
        label: 'Logout',
        icon: <ExitToApp />,
        variant: 'danger',
        onClick: () => console.log('Logout'),
      },
    ],
  },
};

/**
 * 含 danger 操作的選單
 */
export const WithDangerItem: Story = {
  args: {
    items: [
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
        dividerAfter: true,
      },
      {
        id: 'logout',
        label: 'Logout',
        icon: <ExitToApp />,
        variant: 'danger',
        onClick: () => console.log('Logout'),
      },
    ],
  },
};

/**
 * 使用 href 導覽的選單
 */
export const WithHrefNavigation: Story = {
  args: {
    items: [
      {
        id: 'account',
        label: 'Account Settings',
        icon: <AccountCircle />,
        href: '/settings/account',
      },
      {
        id: 'profile',
        label: 'Profile',
        icon: <Person />,
        href: '/settings/profile',
      },
      {
        id: 'security',
        label: 'Security',
        icon: <Security />,
        href: '/settings/security',
      },
    ],
  },
};

/**
 * 混用 onClick 與 href 的選單
 */
export const MixedNavigation: Story = {
  args: {
    items: [
      {
        id: 'account',
        label: 'Account Settings',
        icon: <AccountCircle />,
        href: '/settings/account',
      },
      {
        id: 'profile',
        label: 'Profile',
        icon: <Person />,
        href: '/settings/profile',
      },
      {
        id: 'security',
        label: 'Security',
        icon: <Security />,
        href: '/settings/security',
        dividerAfter: true,
      },
      {
        id: 'logout',
        label: 'Logout',
        icon: <ExitToApp />,
        variant: 'danger',
        onClick: () => alert('Logging out...'),
      },
    ],
  },
};

/**
 * 不含圖示的選單項目
 */
export const WithoutIcons: Story = {
  args: {
    items: [
      {
        id: 'account',
        label: 'Account Settings',
        onClick: () => console.log('Account'),
      },
      {
        id: 'profile',
        label: 'Profile',
        onClick: () => console.log('Profile'),
      },
      {
        id: 'security',
        label: 'Security',
        onClick: () => console.log('Security'),
      },
    ],
  },
};

/**
 * 僅單一項目
 */
export const SingleItem: Story = {
  args: {
    items: [
      {
        id: 'logout',
        label: 'Logout',
        icon: <ExitToApp />,
        variant: 'danger',
        onClick: () => alert('Logout clicked'),
      },
    ],
  },
};

/**
 * 空列表
 */
export const Empty: Story = {
  args: {
    items: [],
  },
};

/**
 * 完整的使用者選單範例
 */
export const CompleteUserMenu: Story = {
  args: {
    items: [
      {
        id: 'account',
        label: 'Account Settings',
        icon: <AccountCircle />,
        href: '/settings/account',
      },
      {
        id: 'profile',
        label: 'Profile',
        icon: <Person />,
        href: '/settings/profile',
      },
      {
        id: 'security',
        label: 'Security',
        icon: <Security />,
        href: '/settings/security',
      },
      {
        id: 'preferences',
        label: 'Preferences',
        icon: <Settings />,
        href: '/settings/preferences',
      },
      {
        id: 'notifications',
        label: 'Notification Settings',
        icon: <Notifications />,
        href: '/settings/notifications',
        dividerAfter: true,
      },
      {
        id: 'logout',
        label: 'Logout',
        icon: <ExitToApp />,
        variant: 'danger',
        onClick: () => alert('Logging out...'),
      },
    ],
  },
};
