import type { Meta, StoryObj } from '@storybook/nextjs';
import { NotificationBadge } from './NotificationBadge';
import { Box, AppBar, Toolbar, Typography } from '@mui/material';

// Helper function to log actions
const logAction =
  (actionName: string) =>
  (...args: any[]) => {
    console.log(`[Storybook Action] ${actionName}`, args);
  };

/**
 * NotificationBadge displays a notification icon with a badge showing the unread count.
 *
 * **Features**:
 * - Badge showing unread notification count
 * - Multiple color variants
 * - Different sizes
 * - Tooltip on hover
 *
 * **Use Cases**:
 * - Application header notification button
 * - Dashboard notification widget
 * - Any place that needs a notification indicator
 */
const meta = {
  title: 'Shared/Atoms/NotificationBadge',
  component: NotificationBadge,
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component:
          'A notification badge button that displays a bell icon with unread count badge.',
      },
    },
  },
  tags: ['autodocs'],
  argTypes: {
    unreadCount: {
      control: 'number',
      description: 'Number of unread notifications',
      table: {
        defaultValue: { summary: '0' },
      },
    },
    color: {
      control: 'select',
      options: ['inherit', 'primary', 'secondary', 'default'],
      description: 'Button color',
      table: {
        defaultValue: { summary: 'inherit' },
      },
    },
    size: {
      control: 'select',
      options: ['small', 'medium', 'large'],
      description: 'Icon button size',
      table: {
        defaultValue: { summary: 'medium' },
      },
    },
    tooltipTitle: {
      control: 'text',
      description: 'Tooltip text',
      table: {
        defaultValue: { summary: 'Notifications' },
      },
    },
  },
} satisfies Meta<typeof NotificationBadge>;

export default meta;
type Story = StoryObj<typeof meta>;

/**
 * Default notification badge with no unread notifications
 */
export const Default: Story = {
  args: {
    unreadCount: 0,
    onClick: logAction('badge-clicked'),
  },
};

/**
 * Badge with unread notifications
 */
export const WithUnread: Story = {
  args: {
    unreadCount: 5,
    onClick: logAction('badge-clicked'),
  },
};

/**
 * Badge with many unread notifications (shows 99)
 */
export const ManyUnread: Story = {
  args: {
    unreadCount: 45,
    onClick: logAction('badge-clicked'),
  },
};

/**
 * Badge with over 100 unread notifications (shows 99+)
 */
export const OverHundred: Story = {
  args: {
    unreadCount: 123,
    onClick: logAction('badge-clicked'),
  },
};

/**
 * In AppBar (typical use case)
 */
export const InAppBar: Story = {
  args: {
    color: 'inherit',
    unreadCount: 12,
    onClick: logAction('badge-clicked'),
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
 * Different sizes
 */
export const Sizes: Story = {
  render: () => (
    <Box sx={{ display: 'flex', alignItems: 'center', gap: 3 }}>
      <Box sx={{ textAlign: 'center' }}>
        <NotificationBadge
          size="small"
          unreadCount={5}
          onClick={logAction('small-clicked')}
        />
        <Typography variant="caption" display="block" sx={{ mt: 1 }}>
          Small
        </Typography>
      </Box>
      <Box sx={{ textAlign: 'center' }}>
        <NotificationBadge
          size="medium"
          unreadCount={5}
          onClick={logAction('medium-clicked')}
        />
        <Typography variant="caption" display="block" sx={{ mt: 1 }}>
          Medium
        </Typography>
      </Box>
      <Box sx={{ textAlign: 'center' }}>
        <NotificationBadge
          size="large"
          unreadCount={5}
          onClick={logAction('large-clicked')}
        />
        <Typography variant="caption" display="block" sx={{ mt: 1 }}>
          Large
        </Typography>
      </Box>
    </Box>
  ),
};

/**
 * Different colors
 */
export const Colors: Story = {
  render: () => (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          gap: 2,
          p: 2,
          bgcolor: 'grey.100',
        }}
      >
        <Typography variant="body2" sx={{ width: 120 }}>
          Inherit:
        </Typography>
        <NotificationBadge
          color="inherit"
          unreadCount={5}
          onClick={logAction('inherit-clicked')}
        />
      </Box>
      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          gap: 2,
          p: 2,
          bgcolor: 'grey.100',
        }}
      >
        <Typography variant="body2" sx={{ width: 120 }}>
          Primary:
        </Typography>
        <NotificationBadge
          color="primary"
          unreadCount={5}
          onClick={logAction('primary-clicked')}
        />
      </Box>
      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          gap: 2,
          p: 2,
          bgcolor: 'grey.100',
        }}
      >
        <Typography variant="body2" sx={{ width: 120 }}>
          Secondary:
        </Typography>
        <NotificationBadge
          color="secondary"
          unreadCount={5}
          onClick={logAction('secondary-clicked')}
        />
      </Box>
      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          gap: 2,
          p: 2,
          bgcolor: 'grey.100',
        }}
      >
        <Typography variant="body2" sx={{ width: 120 }}>
          Default:
        </Typography>
        <NotificationBadge
          color="default"
          unreadCount={5}
          onClick={logAction('default-clicked')}
        />
      </Box>
    </Box>
  ),
};

/**
 * Custom tooltip
 */
export const CustomTooltip: Story = {
  args: {
    unreadCount: 7,
    tooltipTitle: 'You have 7 unread notifications',
    onClick: logAction('badge-clicked'),
  },
};
