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
 * Complete user menu component that combines:
 * - UserButton (Atom) - Trigger button
 * - UserMenuHeader (Molecule) - Menu header
 * - UserMenuList (Molecule) - Menu item list
 *
 * Fully follows the Atomic Design architecture like the Notification system.
 */
const meta = {
  title: 'Organisms/UserMenu',
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
 * Default style - complete user menu
 */
export const Default: Story = {
  args: {
    user: defaultUser,
    menuItems: defaultMenuItems,
  },
};

/**
 * Minimal - without email and role
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
 * Full information - show all fields
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
 * Show user name on button
 */
export const WithNameOnButton: Story = {
  args: {
    user: defaultUser,
    menuItems: defaultMenuItems,
    showName: true,
  },
};

/**
 * Icon mode - use unified icon instead of avatar
 */
export const IconMode: Story = {
  args: {
    user: defaultUser,
    menuItems: defaultMenuItems,
    iconMode: true,
  },
};

/**
 * Icon mode with name displayed
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
 * User without avatar
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
 * Different online statuses
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
 * Different sizes
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
 * Different colors
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
 * Without menu items - header only
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
 * Extended menu items
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
 * Customer role
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
 * HQ role
 */
export const HQRole: Story = {
  args: {
    user: defaultUser,
    menuItems: defaultMenuItems,
    showEmail: true,
    showRole: true,
  },
};
