import type { Meta, StoryObj } from '@storybook/nextjs';
import { UserMenuHeader } from './UserMenuHeader';
import { Box, Typography } from '@mui/material';

/**
 * UserMenuHeader - Atomic Design: Molecule
 *
 * User menu header that displays user avatar, name, email, role, and online status.
 * Combines Avatar (Atom) and Badge (Atom).
 */
const meta = {
  title: 'Molecules/UserMenuHeader',
  component: UserMenuHeader,
  parameters: {
    layout: 'padded',
  },
  tags: ['autodocs'],
  argTypes: {
    showEmail: {
      control: 'boolean',
    },
    showRole: {
      control: 'boolean',
    },
    showStatus: {
      control: 'boolean',
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
} satisfies Meta<typeof UserMenuHeader>;

export default meta;
type Story = StoryObj<typeof meta>;

const defaultUser = {
  name: 'John Doe',
  email: 'john@example.com',
  avatar: '/avatars/user-01.jpg',
  role: 'HQ',
  status: 'online' as const,
};

/**
 * Default style - Shows name and email
 */
export const Default: Story = {
  args: {
    user: defaultUser,
  },
};

/**
 * Full information - Shows all fields
 */
export const Full: Story = {
  args: {
    user: defaultUser,
    showEmail: true,
    showRole: true,
    showStatus: true,
  },
};

/**
 * Name only
 */
export const NameOnly: Story = {
  args: {
    user: defaultUser,
    showEmail: false,
    showRole: false,
    showStatus: false,
  },
};

/**
 * With name and role
 */
export const WithRole: Story = {
  args: {
    user: defaultUser,
    showEmail: false,
    showRole: true,
    showStatus: false,
  },
};

/**
 * With name and status
 */
export const WithStatus: Story = {
  args: {
    user: defaultUser,
    showEmail: false,
    showRole: false,
    showStatus: true,
  },
};

/**
 * All status variants displayed side by side
 */
export const AllStatuses: Story = {
  decorators: [
    (_Story) => (
      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
        <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
          <Box sx={{ flex: '1 1 280px' }}>
            <Typography variant="subtitle2" gutterBottom>
              Online
            </Typography>
            <Box
              sx={{
                border: '1px solid',
                borderColor: 'divider',
                borderRadius: 1,
              }}
            >
              <UserMenuHeader
                user={{ ...defaultUser, status: 'online' as const }}
                showEmail={true}
                showRole={true}
                showStatus={true}
              />
            </Box>
          </Box>
          <Box sx={{ flex: '1 1 280px' }}>
            <Typography variant="subtitle2" gutterBottom>
              Away
            </Typography>
            <Box
              sx={{
                border: '1px solid',
                borderColor: 'divider',
                borderRadius: 1,
              }}
            >
              <UserMenuHeader
                user={{ ...defaultUser, status: 'away' as const }}
                showEmail={true}
                showRole={true}
                showStatus={true}
              />
            </Box>
          </Box>
        </Box>
        <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
          <Box sx={{ flex: '1 1 280px' }}>
            <Typography variant="subtitle2" gutterBottom>
              Busy
            </Typography>
            <Box
              sx={{
                border: '1px solid',
                borderColor: 'divider',
                borderRadius: 1,
              }}
            >
              <UserMenuHeader
                user={{ ...defaultUser, status: 'busy' as const }}
                showEmail={true}
                showRole={true}
                showStatus={true}
              />
            </Box>
          </Box>
          <Box sx={{ flex: '1 1 280px' }}>
            <Typography variant="subtitle2" gutterBottom>
              Offline
            </Typography>
            <Box
              sx={{
                border: '1px solid',
                borderColor: 'divider',
                borderRadius: 1,
              }}
            >
              <UserMenuHeader
                user={{ ...defaultUser, status: 'offline' as const }}
                showEmail={true}
                showRole={true}
                showStatus={true}
              />
            </Box>
          </Box>
        </Box>
      </Box>
    ),
  ],
  args: {
    user: defaultUser,
    showEmail: true,
    showRole: true,
    showStatus: true,
  },
};

/**
 * All role variants displayed side by side
 */
export const AllRoles: Story = {
  decorators: [
    (_Story) => (
      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
        <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
          <Box sx={{ flex: '1 1 280px' }}>
            <Typography variant="subtitle2" gutterBottom>
              HQ
            </Typography>
            <Box
              sx={{
                border: '1px solid',
                borderColor: 'divider',
                borderRadius: 1,
              }}
            >
              <UserMenuHeader
                user={{ ...defaultUser, role: 'HQ' }}
                showEmail={true}
                showRole={true}
              />
            </Box>
          </Box>
          <Box sx={{ flex: '1 1 280px' }}>
            <Typography variant="subtitle2" gutterBottom>
              Customer
            </Typography>
            <Box
              sx={{
                border: '1px solid',
                borderColor: 'divider',
                borderRadius: 1,
              }}
            >
              <UserMenuHeader
                user={{ ...defaultUser, role: 'Customer' }}
                showEmail={true}
                showRole={true}
              />
            </Box>
          </Box>
        </Box>
        <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
          <Box sx={{ flex: '1 1 280px' }}>
            <Typography variant="subtitle2" gutterBottom>
              Manager
            </Typography>
            <Box
              sx={{
                border: '1px solid',
                borderColor: 'divider',
                borderRadius: 1,
              }}
            >
              <UserMenuHeader
                user={{ ...defaultUser, role: 'Manager' }}
                showEmail={true}
                showRole={true}
              />
            </Box>
          </Box>
        </Box>
      </Box>
    ),
  ],
  args: {
    user: defaultUser,
    showEmail: true,
    showRole: true,
  },
};

/**
 * User without avatar (shows initials)
 */
export const WithoutAvatar: Story = {
  args: {
    user: {
      name: 'Jane Smith',
      email: 'jane@example.com',
      role: 'Customer',
      status: 'online' as const,
    },
    showEmail: true,
    showRole: true,
    showStatus: true,
  },
};

/**
 * User without role
 */
export const WithoutRole: Story = {
  args: {
    user: {
      name: 'John Doe',
      email: 'john@example.com',
      status: 'online' as const,
    },
    showEmail: true,
    showRole: true,
    showStatus: true,
  },
};

/**
 * Long name and email
 */
export const LongContent: Story = {
  args: {
    user: {
      name: 'Alexander Christopher Wellington',
      email: 'alexander.wellington@very-long-company-domain.com',
      role: 'Senior System HQistrator',
      status: 'online' as const,
    },
    showEmail: true,
    showRole: true,
    showStatus: true,
  },
};
