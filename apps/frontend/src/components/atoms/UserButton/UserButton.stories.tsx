import type { Meta, StoryObj } from '@storybook/nextjs';
import { Box, Typography } from '@mui/material';
import { UserButton } from './UserButton';

/**
 * UserButton - Atomic Design: Atom
 *
 * Trigger button for user menu, can display user avatar or icon, supports displaying name and online status.
 */
const meta = {
  title: 'Shared/Atoms/UserButton',
  component: UserButton,
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
    showStatus: {
      control: 'boolean',
    },
    iconMode: {
      control: 'boolean',
    },
  },
} satisfies Meta<typeof UserButton>;

export default meta;
type Story = StoryObj<typeof meta>;

const defaultUser = {
  name: 'John Doe',
  email: 'john@example.com',
  avatar: '/avatars/user-01.jpg',
  status: 'online' as const,
};

/**
 * Default style - Avatar only
 */
export const Default: Story = {
  args: {
    user: defaultUser,
  },
};

/**
 * Display user name
 */
export const WithName: Story = {
  args: {
    user: defaultUser,
    showName: true,
  },
};

/**
 * Display online status indicator
 */
export const WithStatus: Story = {
  args: {
    user: defaultUser,
    showStatus: true,
  },
};

/**
 * Full mode - Display name and status
 */
export const Full: Story = {
  args: {
    user: defaultUser,
    showName: true,
    showStatus: true,
  },
};

/**
 * Icon mode - Use unified icon instead of avatar
 */
export const IconMode: Story = {
  args: {
    user: defaultUser,
    iconMode: true,
  },
};

/**
 * Icon mode + Display name
 */
export const IconModeWithName: Story = {
  args: {
    user: defaultUser,
    iconMode: true,
    showName: true,
  },
};

/**
 * User without avatar (display initials)
 */
export const WithoutAvatar: Story = {
  args: {
    user: {
      name: 'Jane Smith',
      email: 'jane@example.com',
      status: 'online' as const,
    },
    showName: true,
  },
};

/**
 * Different sizes comparison
 */
export const Sizes: Story = {
  render: () => (
    <Box sx={{ display: 'flex', gap: 4, alignItems: 'center' }}>
      <Box
        sx={{
          display: 'flex',
          flexDirection: 'column',
          gap: 1,
          alignItems: 'center',
        }}
      >
        <UserButton user={defaultUser} showName size="small" />
        <Typography variant="caption">Small</Typography>
      </Box>
      <Box
        sx={{
          display: 'flex',
          flexDirection: 'column',
          gap: 1,
          alignItems: 'center',
        }}
      >
        <UserButton user={defaultUser} showName size="medium" />
        <Typography variant="caption">Medium</Typography>
      </Box>
      <Box
        sx={{
          display: 'flex',
          flexDirection: 'column',
          gap: 1,
          alignItems: 'center',
        }}
      >
        <UserButton user={defaultUser} showName size="large" />
        <Typography variant="caption">Large</Typography>
      </Box>
    </Box>
  ),
};

/**
 * Different colors comparison
 */
export const Colors: Story = {
  render: () => (
    <Box sx={{ display: 'flex', gap: 4, alignItems: 'center' }}>
      <Box
        sx={{
          display: 'flex',
          flexDirection: 'column',
          gap: 1,
          alignItems: 'center',
        }}
      >
        <UserButton user={defaultUser} color="primary" />
        <Typography variant="caption">Primary</Typography>
      </Box>
      <Box
        sx={{
          display: 'flex',
          flexDirection: 'column',
          gap: 1,
          alignItems: 'center',
        }}
      >
        <UserButton user={defaultUser} color="secondary" />
        <Typography variant="caption">Secondary</Typography>
      </Box>
    </Box>
  ),
};

/**
 * All status indicators comparison
 */
export const AllStatuses: Story = {
  render: () => (
    <Box sx={{ display: 'flex', gap: 4, alignItems: 'center' }}>
      <Box
        sx={{
          display: 'flex',
          flexDirection: 'column',
          gap: 1,
          alignItems: 'center',
        }}
      >
        <UserButton
          user={{ ...defaultUser, status: 'online' as const }}
          showStatus
        />
        <Typography variant="caption">Online</Typography>
      </Box>
      <Box
        sx={{
          display: 'flex',
          flexDirection: 'column',
          gap: 1,
          alignItems: 'center',
        }}
      >
        <UserButton
          user={{ ...defaultUser, status: 'away' as const }}
          showStatus
        />
        <Typography variant="caption">Away</Typography>
      </Box>
      <Box
        sx={{
          display: 'flex',
          flexDirection: 'column',
          gap: 1,
          alignItems: 'center',
        }}
      >
        <UserButton
          user={{ ...defaultUser, status: 'busy' as const }}
          showStatus
        />
        <Typography variant="caption">Busy</Typography>
      </Box>
      <Box
        sx={{
          display: 'flex',
          flexDirection: 'column',
          gap: 1,
          alignItems: 'center',
        }}
      >
        <UserButton
          user={{ ...defaultUser, status: 'offline' as const }}
          showStatus
        />
        <Typography variant="caption">Offline</Typography>
      </Box>
    </Box>
  ),
};
