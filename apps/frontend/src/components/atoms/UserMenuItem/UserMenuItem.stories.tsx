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
 * Single user menu item that supports icon, label, click events, and danger styling.
 */
const meta = {
  title: 'Atoms/UserMenuItem',
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
 * Default style
 */
export const Default: Story = {
  args: {
    icon: <AccountCircle />,
    label: 'Account Settings',
    onClick: () => alert('Account Settings clicked'),
  },
};

/**
 * Different icon examples
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
 * Danger variant - For logout or delete actions
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
 * Without icon
 */
export const WithoutIcon: Story = {
  args: {
    label: 'Simple Menu Item',
    onClick: () => alert('Clicked'),
  },
};

/**
 * Using href for navigation
 */
export const WithHref: Story = {
  args: {
    icon: <AccountCircle />,
    label: 'Go to Account Settings',
    href: '/settings/account',
  },
};

/**
 * Multiple items combined display
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
