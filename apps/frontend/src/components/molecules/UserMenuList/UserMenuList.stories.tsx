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
 * User menu item list that combines multiple UserMenuItem (Atom) components.
 * Supports dividers and danger style items.
 */
const meta = {
  title: 'Molecules/UserMenuList',
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
 * Default style - Basic menu items
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
 * Menu with dividers
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
 * Menu with danger action
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
 * Menu using href for navigation
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
 * Menu mixing onClick and href
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
 * Menu items without icons
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
 * Single item only
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
 * Empty list
 */
export const Empty: Story = {
  args: {
    items: [],
  },
};

/**
 * Complete user menu example
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
