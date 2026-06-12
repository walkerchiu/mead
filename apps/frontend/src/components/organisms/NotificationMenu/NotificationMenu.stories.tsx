import type { Meta, StoryObj } from '@storybook/nextjs';
import { NotificationMenu } from './NotificationMenu';
import { AppBar, Toolbar, Typography, Box, Alert } from '@mui/material';
import { useState } from 'react';
import { UnifiedNotification, NotificationType } from '@/types/notification';

/**
 * NotificationMenu Storybook Stories
 *
 * **Important Note**:
 * NotificationMenu is a pure UI component (Organism) that requires external data.
 *
 * **Difference: NotificationMenu vs NotificationCenter**:
 *
 * - **NotificationMenu** (Stories here):
 *   - Pure UI component, does not handle data fetching
 *   - Requires external notifications, unreadCount, etc. to be passed as props
 *   - Can be reused anywhere (as long as data is provided)
 *   - Best for: When you already have a data source
 *
 * - **NotificationCenter** (See NotificationCenter Stories):
 *   - Integrates data layer, uses useNotifications hook
 *   - Automatically fetches notification data from GraphQL
 *   - Supports real-time subscriptions (WebSocket)
 *   - Built-in error handling and loading states
 *   - Best for: Standard usage scenarios in real applications
 *
 * **Usage Recommendation**:
 * - In most cases, use NotificationCenter in your application
 * - Only use NotificationMenu directly when you need custom data sources
 */

// Helper function to log actions
const logAction =
  (actionName: string) =>
  (...args: any[]) => {
    console.log(`[Storybook] ${actionName}`, args);
  };

const mockNotifications: UnifiedNotification[] = [
  {
    id: '1',
    type: NotificationType.INFO,
    title: 'System Maintenance',
    message:
      'System maintenance scheduled for tonight at 11:00 PM, estimated duration 2 hours',
    createdAt: new Date(Date.now() - 5 * 60 * 1000).toISOString(), // 5 minutes ago
    isRead: false,
  },
  {
    id: '2',
    type: NotificationType.SUCCESS,
    title: 'Password Updated',
    message:
      'Your password has been successfully updated. If this was not you, please contact support immediately',
    createdAt: new Date(Date.now() - 60 * 60 * 1000).toISOString(), // 1 hour ago
    isRead: true,
  },
  {
    id: '3',
    type: NotificationType.WARNING,
    title: 'Security Warning',
    message:
      'Login detected from a new device, Location: New York, IP: 192.168.1.1',
    createdAt: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(), // 1 day ago
    isRead: false,
  },
  {
    id: '4',
    type: NotificationType.ERROR,
    title: 'Payment Failed',
    message:
      'Your credit card payment failed. Please check your card information or use a different payment method',
    createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(), // 2 days ago
    isRead: false,
  },
  {
    id: '5',
    type: NotificationType.SYSTEM,
    title: 'Feature Update',
    message:
      'New features have been added to the system. Check the changelog for details',
    createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(), // 3 days ago
    isRead: true,
  },
  {
    id: '6',
    type: NotificationType.INFO,
    title: 'Event Notification',
    message: 'Annual sale event has started! Check out limited-time offers now',
    createdAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(), // 7 days ago
    isRead: true,
  },
];

/**
 * NotificationMenu displays a notification bell icon with badge showing unread count
 * and provides a dropdown menu with notification list.
 *
 * **Features**:
 * - Uses NotificationBadge atom as trigger button
 * - Badge showing unread notification count
 * - **Clickable title** - Click "Notifications" header to navigate to notification center
 * - **Settings button** - Optional settings icon in header for notification preferences
 * - Dropdown menu with notification list
 * - Different notification types (info, success, warning, error, system)
 * - Mark as read / Mark all as read functionality
 * - Clear all notifications
 * - Responsive time display (e.g., "5 minutes ago")
 *
 * **Architecture**:
 * - Organism component composed of NotificationBadge (atom)
 * - Directly uses MenuItem for each notification (simpler than NotificationList molecule)
 * - NotificationList molecule is reserved for full-page notification view
 */
const meta = {
  title: 'Shared/Organisms/NotificationMenu',
  component: NotificationMenu,
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component:
          'A notification menu component that displays notifications in a dropdown menu with badge counter. Composed of NotificationBadge atom.',
      },
    },
  },
  tags: ['autodocs'],
  argTypes: {
    unreadCount: {
      control: 'number',
      description: 'Number of unread notifications',
    },
    maxDisplay: {
      control: 'number',
      description: 'Maximum number of notifications to display in menu',
      table: {
        defaultValue: { summary: '5' },
      },
    },
    size: {
      control: 'select',
      options: ['small', 'medium', 'large'],
      description: 'Size of the icon button',
      table: {
        defaultValue: { summary: 'medium' },
      },
    },
    color: {
      control: 'select',
      options: ['inherit', 'primary', 'secondary', 'default'],
      description: 'Color of the button',
      table: {
        defaultValue: { summary: 'inherit' },
      },
    },
    showSettings: {
      control: 'boolean',
      description: 'Show settings icon button in header (on the right side)',
      table: {
        defaultValue: { summary: 'false' },
      },
    },
  },
} satisfies Meta<typeof NotificationMenu>;

export default meta;
type Story = StoryObj<typeof meta>;

/**
 * Default notification menu with unread notifications
 *
 * **Tip**: Click the "Notifications" title to navigate to notification center
 */
export const Default: Story = {
  args: {
    unreadCount: 3,
    notifications: mockNotifications,
    onViewAll: logAction('navigate-to-notification-center'),
    onSettingsClick: logAction('settings-clicked'),
    onClearAll: logAction('clear-all'),
    showSettings: true,
  },
};

/**
 * No notifications state
 */
export const NoNotifications: Story = {
  args: {
    unreadCount: 0,
    notifications: [],
  },
};

/**
 * All read notifications
 *
 * All notifications have been read - badge shows 0
 */
export const AllRead: Story = {
  args: {
    unreadCount: 0,
    notifications: mockNotifications.map((n) => ({ ...n, isRead: true })),
    showSettings: true,
    onViewAll: logAction('navigate-to-notification-center'),
    onSettingsClick: logAction('settings-clicked'),
    onClearAll: logAction('clear-all'),
  },
};

/**
 * Many unread notifications (badge shows 99)
 */
export const ManyUnread: Story = {
  args: {
    unreadCount: 45,
    notifications: mockNotifications,
    onClearAll: logAction('clear-all'),
    showSettings: true,
  },
};

/**
 * All notification types
 *
 * Shows all 5 notification types with their icons and colors
 */
export const AllTypes: Story = {
  args: {
    unreadCount: 5,
    notifications: [
      {
        id: '1',
        type: NotificationType.INFO,
        title: 'Info Notification',
        message: 'This is an informational notification',
        createdAt: new Date().toISOString(),
        isRead: false,
      },
      {
        id: '2',
        type: NotificationType.SUCCESS,
        title: 'Success Notification',
        message: 'This is a success notification',
        createdAt: new Date().toISOString(),
        isRead: false,
      },
      {
        id: '3',
        type: NotificationType.WARNING,
        title: 'Warning Notification',
        message: 'This is a warning notification',
        createdAt: new Date().toISOString(),
        isRead: false,
      },
      {
        id: '4',
        type: NotificationType.ERROR,
        title: 'Error Notification',
        message: 'This is an error notification',
        createdAt: new Date().toISOString(),
        isRead: false,
      },
      {
        id: '5',
        type: NotificationType.SYSTEM,
        title: 'System Notification',
        message: 'This is a system notification',
        createdAt: new Date().toISOString(),
        isRead: false,
      },
    ],
    showSettings: true,
    onClearAll: logAction('clear-all'),
  },
};

/**
 * Different sizes comparison
 *
 * Shows all available sizes side by side
 */
export const Sizes: Story = {
  render: () => (
    <Box sx={{ display: 'flex', gap: 4, alignItems: 'center', p: 3 }}>
      <Box sx={{ textAlign: 'center' }}>
        <Typography variant="caption" display="block" mb={1}>
          Small
        </Typography>
        <NotificationMenu
          size="small"
          unreadCount={5}
          notifications={mockNotifications}
          showSettings={true}
          onViewAll={logAction('small-view-all')}
          onSettingsClick={logAction('small-settings')}
          onClearAll={logAction('small-clear-all')}
        />
      </Box>
      <Box sx={{ textAlign: 'center' }}>
        <Typography variant="caption" display="block" mb={1}>
          Medium (Default)
        </Typography>
        <NotificationMenu
          size="medium"
          unreadCount={5}
          notifications={mockNotifications}
          showSettings={true}
          onViewAll={logAction('medium-view-all')}
          onSettingsClick={logAction('medium-settings')}
          onClearAll={logAction('medium-clear-all')}
        />
      </Box>
      <Box sx={{ textAlign: 'center' }}>
        <Typography variant="caption" display="block" mb={1}>
          Large
        </Typography>
        <NotificationMenu
          size="large"
          unreadCount={5}
          notifications={mockNotifications}
          showSettings={true}
          onViewAll={logAction('large-view-all')}
          onSettingsClick={logAction('large-settings')}
          onClearAll={logAction('large-clear-all')}
        />
      </Box>
    </Box>
  ),
};

/**
 * Different colors comparison
 *
 * Shows all available color variants
 */
export const Colors: Story = {
  render: () => (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, p: 3 }}>
      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          gap: 2,
          p: 2,
          bgcolor: 'grey.100',
        }}
      >
        <Typography sx={{ width: 100 }}>Inherit:</Typography>
        <NotificationMenu
          color="inherit"
          unreadCount={3}
          notifications={mockNotifications}
          showSettings={true}
          onClearAll={logAction('inherit-clear-all')}
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
        <Typography sx={{ width: 100 }}>Primary:</Typography>
        <NotificationMenu
          color="primary"
          unreadCount={3}
          notifications={mockNotifications}
          showSettings={true}
          onClearAll={logAction('primary-clear-all')}
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
        <Typography sx={{ width: 100 }}>Secondary:</Typography>
        <NotificationMenu
          color="secondary"
          unreadCount={3}
          notifications={mockNotifications}
          showSettings={true}
          onClearAll={logAction('secondary-clear-all')}
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
        <Typography sx={{ width: 100 }}>Default:</Typography>
        <NotificationMenu
          color="default"
          unreadCount={3}
          notifications={mockNotifications}
          showSettings={true}
          onClearAll={logAction('default-clear-all')}
        />
      </Box>
    </Box>
  ),
};

/**
 * In AppBar context (typical use case)
 */
export const InAppBar: Story = {
  args: {
    color: 'inherit',
    unreadCount: 5,
    notifications: mockNotifications,
    showSettings: true,
    onViewAll: logAction('navigate-to-notification-center'),
    onSettingsClick: logAction('settings-clicked'),
    onClearAll: logAction('clear-all'),
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
 * Without settings button
 *
 * Simplified version without settings icon
 */
export const WithoutSettings: Story = {
  args: {
    unreadCount: 3,
    notifications: mockNotifications,
    showSettings: false,
    onViewAll: logAction('view-all'),
    onClearAll: logAction('clear-all'),
  },
};

/**
 * Limited display
 *
 * Only shows 3 notifications in the dropdown
 */
export const LimitedDisplay: Story = {
  args: {
    unreadCount: 3,
    notifications: mockNotifications,
    maxDisplay: 3,
    showSettings: true,
    onViewAll: logAction('view-all'),
    onClearAll: logAction('clear-all'),
  },
  decorators: [
    (Story) => (
      <Box sx={{ p: 3 }}>
        <Alert severity="info" sx={{ mb: 2 }}>
          Maximum 3 notifications displayed, click "View All" to see the
          complete list
        </Alert>
        <Story />
      </Box>
    ),
  ],
};

/**
 * With many unread (badge overflow)
 *
 * Badge shows "99+" when count exceeds 99
 */
export const ManyUnreadBadge: Story = {
  args: {
    unreadCount: 125,
    notifications: mockNotifications,
    showSettings: true,
    onClearAll: logAction('clear-all'),
  },
  decorators: [
    (Story) => (
      <Box sx={{ p: 3 }}>
        <Alert severity="info" sx={{ mb: 2 }}>
          When unread count exceeds 99, badge shows "99+"
        </Alert>
        <Story />
      </Box>
    ),
  ],
};

/**
 * Long content handling
 *
 * Tests text overflow with very long titles and messages
 */
export const LongContent: Story = {
  args: {
    unreadCount: 2,
    notifications: [
      {
        id: '1',
        type: NotificationType.INFO,
        title:
          'This is a very very very very very very very very very very long notification title to test text overflow behavior',
        message:
          'This is a very very very very very very very very very very very very very very long notification message content to test how the component handles text truncation and ellipsis display when content is too long. This text should be limited to a specific number of lines and the overflow part will be displayed with ellipsis.',
        createdAt: new Date().toISOString(),
        isRead: false,
      },
      {
        id: '2',
        type: NotificationType.WARNING,
        title: 'Normal length title',
        message: 'Normal length content',
        createdAt: new Date().toISOString(),
        isRead: false,
      },
    ],
    showSettings: true,
    onClearAll: logAction('clear-all'),
  },
};

/**
 * Interactive example with state
 *
 * Fully interactive example where you can mark notifications as read/unread
 */
export const Interactive: Story = {
  render: () => {
    const [notifications, setNotifications] =
      useState<UnifiedNotification[]>(mockNotifications);
    const unreadCount = notifications.filter((n) => !n.isRead).length;

    return (
      <Box>
        <Box sx={{ p: 3, bgcolor: 'grey.50' }}>
          <Alert severity="info" sx={{ mb: 2 }}>
            <strong>Interactive Test:</strong> Click notifications to mark as
            read and observe badge number changes
          </Alert>
          <Typography variant="body2" gutterBottom>
            Unread count: <strong>{unreadCount}</strong> /{' '}
            {notifications.length}
          </Typography>
        </Box>
        <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}>
          <NotificationMenu
            unreadCount={unreadCount}
            notifications={notifications}
            showSettings={true}
            onNotificationClick={(notification) => {
              setNotifications((prev) =>
                prev.map((n) =>
                  n.id === notification.id ? { ...n, isRead: true } : n,
                ),
              );
            }}
            onMarkAllAsRead={() => {
              setNotifications((prev) =>
                prev.map((n) => ({ ...n, isRead: true })),
              );
            }}
            onClearAll={() => {
              setNotifications([]);
            }}
          />
        </Box>
      </Box>
    );
  },
};

/**
 * Real-world Integration Example
 *
 * Complete example showing NotificationMenu integrated with routing,
 * state management, and all callback handlers.
 */
export const RealWorldExample: Story = {
  render: () => {
    const [notifications, setNotifications] =
      useState<UnifiedNotification[]>(mockNotifications);
    const [lastAction, setLastAction] = useState<string>('');
    const unreadCount = notifications.filter((n) => !n.isRead).length;

    const handleViewAll = () => {
      setLastAction('✅ Navigated to /notifications (notification center)');
      console.log('[App] router.push("/notifications")');
    };

    const handleNotificationClick = (notification: UnifiedNotification) => {
      setLastAction(`📬 Clicked notification: "${notification.title}"`);

      // Auto mark as read
      setNotifications((prev) =>
        prev.map((n) =>
          n.id === notification.id ? { ...n, isRead: true } : n,
        ),
      );

      // Navigate to action URL or detail page
      if (notification.actionUrl) {
        console.log(
          '[App] router.push(notification.actionUrl):',
          notification.actionUrl,
        );
      } else {
        console.log('[App] router.push("/notifications/" + notification.id)');
      }
    };

    const handleMarkAsRead = (id: string) => {
      setLastAction(`✓ Marked notification ${id} as read`);
      setNotifications((prev) =>
        prev.map((n) => (n.id === id ? { ...n, isRead: true } : n)),
      );
    };

    const handleMarkAllAsRead = () => {
      setLastAction('✓✓ Marked all notifications as read');
      setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
    };

    const handleClearAll = () => {
      setLastAction('🗑️ Cleared all notifications');
      setNotifications([]);
    };

    const handleSettings = () => {
      setLastAction('⚙️ Navigated to notification settings');
      console.log('[App] router.push("/settings/notifications")');
    };

    return (
      <Box sx={{ width: '100%', minWidth: 700 }}>
        <AppBar position="static">
          <Toolbar>
            <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
              Dashboard
            </Typography>
            <NotificationMenu
              color="inherit"
              unreadCount={unreadCount}
              notifications={notifications}
              showSettings={true}
              onNotificationClick={handleNotificationClick}
              onMarkAsRead={handleMarkAsRead}
              onMarkAllAsRead={handleMarkAllAsRead}
              onViewAll={handleViewAll}
              onSettingsClick={handleSettings}
              onClearAll={handleClearAll}
            />
          </Toolbar>
        </AppBar>

        <Box sx={{ p: 3 }}>
          {lastAction && (
            <Alert severity="info" sx={{ mb: 2 }}>
              <strong>Last Action:</strong> {lastAction}
            </Alert>
          )}

          <Typography variant="body2" color="text.secondary" gutterBottom>
            <strong>Features:</strong>
          </Typography>
          <Box component="ul" sx={{ mt: 1, pl: 3 }}>
            <Typography component="li" variant="body2" color="text.secondary">
              🔔 Badge shows {unreadCount} unread notifications
            </Typography>
            <Typography component="li" variant="body2" color="text.secondary">
              📬 Click notification → Auto mark as read + Navigate
            </Typography>
            <Typography component="li" variant="body2" color="text.secondary">
              📋 Click "Notifications" title → Navigate to /notifications
            </Typography>
            <Typography component="li" variant="body2" color="text.secondary">
              ⚙️ Settings icon → Navigate to /settings/notifications
            </Typography>
            <Typography component="li" variant="body2" color="text.secondary">
              ✓ "Mark All as Read" button → Batch update
            </Typography>
            <Typography component="li" variant="body2" color="text.secondary">
              🗑️ "Clear All" button → Remove all notifications
            </Typography>
          </Box>
        </Box>
      </Box>
    );
  },
};
