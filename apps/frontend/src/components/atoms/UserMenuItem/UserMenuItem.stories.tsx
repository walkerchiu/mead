import type { Meta, StoryObj } from '@storybook/nextjs';
import { UserMenuItem } from './UserMenuItem';
import {
  AccountCircle,
  Person,
  Security,
  Settings,
  ExitToApp,
  Help,
} from '@mui/icons-material';
import { Box } from '@mui/material';

/**
 * UserMenuItem - Atomic Design: Atom
 *
 * 單一使用者選單項目，支援圖示、標籤、點擊事件與 danger 樣式。
 */
const meta = {
  title: 'Shared/Atoms/UserMenuItem',
  component: UserMenuItem,
  parameters: {
    layout: 'padded',
  },
  tags: ['autodocs'],
  argTypes: {
    variant: {
      control: 'select',
      options: ['default', 'danger'],
    },
  },
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
} satisfies Meta<typeof UserMenuItem>;

export default meta;
type Story = StoryObj<typeof meta>;

/**
 * 預設樣式
 */
export const Default: Story = {
  args: {
    icon: <AccountCircle />,
    label: 'Account Settings',
    onClick: () => alert('Account Settings clicked'),
  },
};

/**
 * 不同圖示範例
 */
export const WithPersonIcon: Story = {
  args: {
    icon: <Person />,
    label: 'Profile',
    onClick: () => alert('Profile clicked'),
  },
};

export const WithSecurityIcon: Story = {
  args: {
    icon: <Security />,
    label: 'Security',
    onClick: () => alert('Security clicked'),
  },
};

export const WithSettingsIcon: Story = {
  args: {
    icon: <Settings />,
    label: 'Preferences',
    onClick: () => alert('Preferences clicked'),
  },
};

export const WithHelpIcon: Story = {
  args: {
    icon: <Help />,
    label: 'Help & Support',
    onClick: () => alert('Help clicked'),
  },
};

/**
 * Danger 變體 - 用於登出或刪除操作
 */
export const DangerVariant: Story = {
  args: {
    icon: <ExitToApp />,
    label: 'Logout',
    variant: 'danger',
    onClick: () => alert('Logout clicked'),
  },
};

/**
 * 不含圖示
 */
export const WithoutIcon: Story = {
  args: {
    label: 'Simple Menu Item',
    onClick: () => alert('Clicked'),
  },
};

/**
 * 使用 href 進行導覽
 */
export const WithHref: Story = {
  args: {
    icon: <AccountCircle />,
    label: 'Go to Account Settings',
    href: '/settings/account',
  },
};

/**
 * 多個項目組合顯示
 */
export const MenuItemList: Story = {
  render: () => (
    <Box
      sx={{
        width: 300,
        border: '1px solid',
        borderColor: 'divider',
        borderRadius: 1,
      }}
    >
      <UserMenuItem
        icon={<AccountCircle />}
        label="Account Settings"
        onClick={() => console.log('Account')}
      />
      <UserMenuItem
        icon={<Person />}
        label="Profile"
        onClick={() => console.log('Profile')}
      />
      <UserMenuItem
        icon={<Security />}
        label="Security"
        onClick={() => console.log('Security')}
      />
      <UserMenuItem
        icon={<Settings />}
        label="Preferences"
        onClick={() => console.log('Preferences')}
      />
      <UserMenuItem
        icon={<Help />}
        label="Help"
        onClick={() => console.log('Help')}
      />
      <UserMenuItem
        icon={<ExitToApp />}
        label="Logout"
        variant="danger"
        onClick={() => console.log('Logout')}
      />
    </Box>
  ),
};
