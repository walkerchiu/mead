import type { Meta, StoryObj } from '@storybook/nextjs';
import { NotificationList } from './NotificationList';
import { Box } from '@mui/material';

// Helper function to log actions
const logAction = (actionName: string) => () => {
  console.log(`[Storybook] ${actionName}`);
};

// Mock notification data
const mockNotifications = [
  {
    id: '1',
    type: 'ERROR' as const,
    title: 'Payment Failed',
    message:
      'Your payment could not be processed. Please update your payment method.',
    isRead: false,
    createdAt: new Date(Date.now() - 1000 * 60 * 2).toISOString(),
  },
  {
    id: '2',
    type: 'SUCCESS' as const,
    title: 'Profile Updated',
    message: 'Your profile information has been successfully updated.',
    isRead: false,
    createdAt: new Date(Date.now() - 1000 * 60 * 15).toISOString(),
  },
  {
    id: '3',
    type: 'INFO' as const,
    title: 'New Feature Available',
    message: 'Check out our new dark mode feature in settings.',
    isRead: true,
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 3).toISOString(),
  },
  {
    id: '4',
    type: 'WARNING' as const,
    title: 'Password Expiring Soon',
    message: 'Your password will expire in 7 days. Please change it soon.',
    isRead: true,
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString(),
  },
  {
    id: '5',
    type: 'INFO' as const,
    title: 'Welcome',
    message: 'Welcome to our platform! Get started by completing your profile.',
    isRead: true,
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 3).toISOString(),
  },
];

const meta = {
  title: 'Shared/Molecules/NotificationList',
  component: NotificationList,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
  argTypes: {
    loading: {
      control: 'boolean',
      description: 'Loading state',
    },
    showFilterTabs: {
      control: 'boolean',
      description: 'Show filter tabs (All/Unread)',
    },
    showActions: {
      control: 'boolean',
      description: 'Show action buttons (Mark all read, Clear read)',
    },
    showDeleteButton: {
      control: 'boolean',
      description: 'Show delete button on each notification item',
    },
    maxHeight: {
      control: 'number',
      description: 'Maximum height of the list (scrollable)',
    },
  },
} satisfies Meta<typeof NotificationList>;

export default meta;
type Story = StoryObj<typeof meta>;

/**
 * Default notification list with mixed read/unread notifications
 */
export const Default: Story = {
  args: {
    notifications: mockNotifications,
    onNotificationClick: logAction('notification-clicked'),
    onNotificationDelete: logAction('notification-deleted'),
    onMarkAllRead: logAction('mark-all-read'),
    onClearRead: logAction('clear-read'),
  },
  render: (args) => (
    <Box sx={{ width: 450 }}>
      <NotificationList {...args} />
    </Box>
  ),
};

/**
 * Empty state
 */
export const Empty: Story = {
  args: {
    notifications: [],
    loading: false,
    emptyText: 'No notifications',
  },
  render: (args) => (
    <Box sx={{ width: 450 }}>
      <NotificationList {...args} />
    </Box>
  ),
};

/**
 * Loading state
 */
export const Loading: Story = {
  args: {
    notifications: [],
    loading: true,
  },
  render: (args) => (
    <Box sx={{ width: 450 }}>
      <NotificationList {...args} />
    </Box>
  ),
};

/**
 * Only unread notifications
 */
export const OnlyUnread: Story = {
  args: {
    notifications: mockNotifications.filter((n) => !n.isRead),
    onNotificationClick: logAction('notification-clicked'),
    onNotificationDelete: logAction('notification-deleted'),
    onMarkAllRead: logAction('mark-all-read'),
    onClearRead: logAction('clear-read'),
  },
  render: (args) => (
    <Box sx={{ width: 450 }}>
      <NotificationList {...args} />
    </Box>
  ),
};

/**
 * Only read notifications
 */
export const OnlyRead: Story = {
  args: {
    notifications: mockNotifications.filter((n) => n.isRead),
    onNotificationClick: logAction('notification-clicked'),
    onNotificationDelete: logAction('notification-deleted'),
    onMarkAllRead: logAction('mark-all-read'),
    onClearRead: logAction('clear-read'),
  },
  render: (args) => (
    <Box sx={{ width: 450 }}>
      <NotificationList {...args} />
    </Box>
  ),
};

/**
 * Minimal configuration (no tabs, no actions, no delete buttons)
 */
export const Minimal: Story = {
  args: {
    notifications: mockNotifications,
    showFilterTabs: false,
    showActions: false,
    showDeleteButton: false,
    onNotificationClick: logAction('notification-clicked'),
  },
  render: (args) => (
    <Box sx={{ width: 450 }}>
      <NotificationList {...args} />
    </Box>
  ),
};

/**
 * Without filter tabs
 */
export const WithoutFilterTabs: Story = {
  args: {
    notifications: mockNotifications,
    showFilterTabs: false,
    onNotificationClick: logAction('notification-clicked'),
    onNotificationDelete: logAction('notification-deleted'),
    onMarkAllRead: logAction('mark-all-read'),
    onClearRead: logAction('clear-read'),
  },
  render: (args) => (
    <Box sx={{ width: 450 }}>
      <NotificationList {...args} />
    </Box>
  ),
};

/**
 * Without action buttons
 */
export const WithoutActions: Story = {
  args: {
    notifications: mockNotifications,
    showActions: false,
    onNotificationClick: logAction('notification-clicked'),
    onNotificationDelete: logAction('notification-deleted'),
  },
  render: (args) => (
    <Box sx={{ width: 450 }}>
      <NotificationList {...args} />
    </Box>
  ),
};

/**
 * Without delete buttons on items
 */
export const WithoutDeleteButtons: Story = {
  args: {
    notifications: mockNotifications,
    showDeleteButton: false,
    onNotificationClick: logAction('notification-clicked'),
    onMarkAllRead: logAction('mark-all-read'),
    onClearRead: logAction('clear-read'),
  },
  render: (args) => (
    <Box sx={{ width: 450 }}>
      <NotificationList {...args} />
    </Box>
  ),
};

/**
 * Compact width (mobile-like)
 */
export const CompactWidth: Story = {
  args: {
    notifications: mockNotifications,
    onNotificationClick: logAction('notification-clicked'),
    onNotificationDelete: logAction('notification-deleted'),
    onMarkAllRead: logAction('mark-all-read'),
    onClearRead: logAction('clear-read'),
  },
  render: (args) => (
    <Box sx={{ width: 320 }}>
      <NotificationList {...args} />
    </Box>
  ),
};

/**
 * Wide width (desktop-like)
 */
export const WideWidth: Story = {
  args: {
    notifications: mockNotifications,
    onNotificationClick: logAction('notification-clicked'),
    onNotificationDelete: logAction('notification-deleted'),
    onMarkAllRead: logAction('mark-all-read'),
    onClearRead: logAction('clear-read'),
  },
  render: (args) => (
    <Box sx={{ width: 600 }}>
      <NotificationList {...args} />
    </Box>
  ),
};

/**
 * Custom max height with many notifications
 */
export const ScrollableList: Story = {
  args: {
    notifications: [
      ...mockNotifications,
      {
        id: '6',
        type: 'SUCCESS' as const,
        title: 'Order Shipped',
        message: 'Your order #12345 has been shipped.',
        isRead: false,
        createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 2).toISOString(),
      },
      {
        id: '7',
        type: 'INFO' as const,
        title: 'New Message',
        message: 'You have received a new message from support.',
        isRead: false,
        createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 3).toISOString(),
      },
      {
        id: '8',
        type: 'WARNING' as const,
        title: 'Subscription Expiring',
        message: 'Your subscription will expire in 3 days.',
        isRead: false,
        createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 4).toISOString(),
      },
      {
        id: '9',
        type: 'ERROR' as const,
        title: 'Backup Failed',
        message: 'The scheduled backup could not be completed.',
        isRead: true,
        createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 5).toISOString(),
      },
      {
        id: '10',
        type: 'SUCCESS' as const,
        title: 'Account Verified',
        message: 'Your account has been successfully verified.',
        isRead: true,
        createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 7).toISOString(),
      },
    ],
    maxHeight: 400,
    onNotificationClick: logAction('notification-clicked'),
    onNotificationDelete: logAction('notification-deleted'),
    onMarkAllRead: logAction('mark-all-read'),
    onClearRead: logAction('clear-read'),
  },
  render: (args) => (
    <Box sx={{ width: 450 }}>
      <NotificationList {...args} />
    </Box>
  ),
};

/**
 * Custom unread count (override calculated value)
 */
export const CustomUnreadCount: Story = {
  args: {
    notifications: mockNotifications,
    unreadCount: 99,
    onNotificationClick: logAction('notification-clicked'),
    onNotificationDelete: logAction('notification-deleted'),
    onMarkAllRead: logAction('mark-all-read'),
    onClearRead: logAction('clear-read'),
  },
  render: (args) => (
    <Box sx={{ width: 450 }}>
      <NotificationList {...args} />
    </Box>
  ),
};
