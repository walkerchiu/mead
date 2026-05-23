import type { Meta, StoryObj } from '@storybook/nextjs';
import { NotificationCenter } from './NotificationCenter';
import { NotificationMenu } from '@/components/organisms/NotificationMenu';
import {
  Box,
  AppBar,
  Toolbar,
  Typography,
  Alert,
  Menu,
  IconButton,
  CircularProgress,
  Button,
} from '@mui/material';
import {
  Refresh as RefreshIcon,
  Settings as SettingsIcon,
} from '@mui/icons-material';
import { useState } from 'react';
import { NotificationType, UnifiedNotification } from '@/types/notification';
import { NotificationBadge } from '@/components/atoms';

/**
 * NotificationCenter Storybook Stories
 *
 * **Important Note**:
 * Differences between NotificationCenter and NotificationMenu:
 *
 * - **NotificationCenter**: Complete solution with integrated data layer
 *   - Uses useNotifications hook to automatically fetch data from GraphQL
 *   - Supports real-time subscriptions (WebSocket)
 *   - Automatically handles state management, error handling, loading states
 *   - Used in real applications
 *
 * - **NotificationMenu**: Pure UI component
 *   - Receives notifications as props
 *   - Does not handle data fetching
 *   - Can be reused anywhere (as long as data is provided)
 *
 * **Limitations of these Stories**:
 * For reliable demonstration in Storybook, we use direct prop passing to simulate data,
 * rather than real GraphQL integration. In real applications, NotificationCenter
 * automatically handles all data fetching and state management.
 */

// Helper function to log actions
const logAction =
  (actionName: string) =>
  (...args: any[]) => {
    console.log(`[Storybook Action] ${actionName}`, args);
  };

// Mock notifications data (UnifiedNotification format)
const createMockNotifications = (): UnifiedNotification[] => [
  {
    id: '1',
    type: NotificationType.INFO,
    title: 'System Maintenance Notice',
    message:
      'System maintenance will be performed tonight at 11:00 PM, estimated duration 2 hours',
    isRead: false,
    createdAt: new Date(Date.now() - 5 * 60 * 1000).toISOString(),
    readAt: undefined,
  },
  {
    id: '2',
    type: NotificationType.SUCCESS,
    title: 'Password Updated',
    message:
      'Your password has been updated successfully. If this was not you, please contact support immediately',
    isRead: true,
    createdAt: new Date(Date.now() - 60 * 60 * 1000).toISOString(),
    readAt: new Date(Date.now() - 55 * 60 * 1000).toISOString(),
  },
  {
    id: '3',
    type: NotificationType.WARNING,
    title: 'Security Warning',
    message: 'New device login detected, Location: Taipei, IP: 192.168.1.1',
    isRead: false,
    createdAt: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
    readAt: undefined,
  },
  {
    id: '4',
    type: NotificationType.ERROR,
    title: 'Payment Failed',
    message:
      'Your credit card payment failed. Please check your card information or use another payment method',
    isRead: false,
    createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
    readAt: undefined,
  },
];

// Helper component to wrap NotificationMenu with state management
interface MockedNotificationCenterProps {
  initialNotifications: UnifiedNotification[];
  color?: 'inherit' | 'primary' | 'secondary' | 'default';
  size?: 'small' | 'medium' | 'large';
  showSettings?: boolean;
  maxDisplay?: number;
  onViewAll?: () => void;
  onSettingsClick?: () => void;
  onNotificationClick?: (id: string) => void;
  title?: string;
}

const MockedNotificationCenter = ({
  initialNotifications,
  color = 'inherit',
  size = 'medium',
  showSettings = true,
  maxDisplay = 5,
  onViewAll,
  onSettingsClick,
  onNotificationClick,
  title = 'Dashboard',
}: MockedNotificationCenterProps) => {
  const [notifications, setNotifications] =
    useState<UnifiedNotification[]>(initialNotifications);
  const unreadCount = notifications.filter((n) => !n.isRead).length;

  return (
    <Box sx={{ width: '100%', minWidth: 800 }}>
      <AppBar position="static">
        <Toolbar>
          <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
            {title}
          </Typography>
          <NotificationMenu
            color={color}
            size={size}
            unreadCount={unreadCount}
            notifications={notifications}
            showSettings={showSettings}
            maxDisplay={maxDisplay}
            onViewAll={onViewAll}
            onSettingsClick={onSettingsClick}
            onNotificationClick={(notification) => {
              onNotificationClick?.(notification.id);
              // Auto mark as read when clicked
              if (!notification.isRead) {
                setNotifications((prev) =>
                  prev.map((n) =>
                    n.id === notification.id ? { ...n, isRead: true } : n,
                  ),
                );
              }
            }}
            onMarkAsRead={(id) => {
              setNotifications((prev) =>
                prev.map((n) => (n.id === id ? { ...n, isRead: true } : n)),
              );
            }}
            onMarkAllAsRead={() => {
              setNotifications((prev) =>
                prev.map((n) => ({ ...n, isRead: true })),
              );
            }}
            onClearAll={() => {
              setNotifications((prev) => prev.filter((n) => !n.isRead));
            }}
          />
        </Toolbar>
      </AppBar>
    </Box>
  );
};

const meta = {
  title: 'HQ Scope/Organisms/NotificationCenter',
  component: NotificationCenter,
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component:
          'Complete notification center that integrates with NotificationMenu. ' +
          'Provides notification management with mark as read, clear, and real-time updates. ' +
          'These stories use direct props for demonstration purposes.',
      },
    },
  },
  tags: ['autodocs'],
  argTypes: {
    color: {
      control: 'select',
      options: ['inherit', 'primary', 'secondary', 'default'],
      description: 'Button color',
    },
    size: {
      control: 'select',
      options: ['small', 'medium', 'large'],
      description: 'Icon button size',
    },
    showSettings: {
      control: 'boolean',
      description: 'Show settings button in notification menu header',
    },
    maxDisplay: {
      control: 'number',
      description: 'Maximum number of notifications to display in menu',
    },
  },
} satisfies Meta<typeof NotificationCenter>;

export default meta;
type Story = StoryObj<typeof meta>;

/**
 * Default notification center in AppBar (Mocked Data)
 *
 * **What this Story demonstrates**: UI appearance and interaction behavior
 *
 * **Try these interactions:**
 * - Click the notification bell to open the menu
 * - Click "Notifications" title to navigate to notification center
 * - Click settings icon to go to notification settings
 * - Click "Mark All as Read" to mark all notifications as read
 * - Click "Clear" to delete all read notifications
 *
 * **Note**: This uses mocked data to demonstrate the UI. In real applications,
 * NotificationCenter will use useNotifications hook to automatically fetch data from GraphQL.
 */
export const Default: Story = {
  render: () => (
    <MockedNotificationCenter
      initialNotifications={createMockNotifications()}
      color="inherit"
      size="medium"
      showSettings={true}
      maxDisplay={5}
      onViewAll={() => logAction('navigate-to-notification-center')()}
      onSettingsClick={() => logAction('navigate-to-settings')()}
      onNotificationClick={logAction('notification-clicked')}
    />
  ),
};

/**
 * Empty state - No notifications
 *
 * Shows empty state when user has no notifications
 */
export const Empty: Story = {
  render: () => (
    <MockedNotificationCenter
      initialNotifications={[]}
      color="inherit"
      size="medium"
      showSettings={true}
      onViewAll={() => logAction('navigate-to-notification-center')()}
      onSettingsClick={() => logAction('navigate-to-settings')()}
      onNotificationClick={logAction('notification-clicked')}
      title="Dashboard (No Notifications)"
    />
  ),
};

/**
 * Loading state (Visual Mock)
 *
 * Shows how the UI looks while fetching notifications from the server.
 * This is a visual mock to demonstrate the intended UX.
 */
export const Loading: Story = {
  render: () => {
    const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
    const t = {
      title: 'Notifications',
      markAllAsRead: 'Mark All as Read',
      clearAll: 'Clear',
    };

    return (
      <Box sx={{ width: '100%', minWidth: 800 }}>
        <Alert severity="info" sx={{ mb: 2 }}>
          <Typography variant="body2">
            <strong>Visual Mock:</strong> This demonstrates what the loading
            state should look like. In the actual NotificationCenter component,
            this state is triggered automatically when data is being fetched
            from GraphQL.
          </Typography>
        </Alert>
        <AppBar position="static">
          <Toolbar>
            <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
              Dashboard (Loading State)
            </Typography>
            <Box>
              <IconButton
                color="inherit"
                size="medium"
                onClick={(e) => setAnchorEl(e.currentTarget)}
              >
                <NotificationBadge count={0} />
              </IconButton>
              <Menu
                anchorEl={anchorEl}
                open={Boolean(anchorEl)}
                onClose={() => setAnchorEl(null)}
                PaperProps={{
                  sx: {
                    width: 400,
                    maxHeight: 500,
                  },
                }}
              >
                {/* Header */}
                <Box
                  sx={{
                    px: 2,
                    py: 1.5,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    borderBottom: 1,
                    borderColor: 'divider',
                  }}
                >
                  <Typography
                    variant="h6"
                    component="div"
                    sx={{
                      cursor: 'pointer',
                      '&:hover': { color: 'primary.main' },
                    }}
                    onClick={() => logAction('view-all')()}
                  >
                    {t.title}
                  </Typography>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <Button
                      size="small"
                      color="primary"
                      disabled
                      sx={{ textTransform: 'none' }}
                    >
                      {t.clearAll}
                    </Button>
                    <IconButton
                      size="small"
                      onClick={() => logAction('settings')()}
                    >
                      <SettingsIcon fontSize="small" />
                    </IconButton>
                  </Box>
                </Box>

                {/* Loading content */}
                <Box
                  sx={{
                    py: 6,
                    px: 3,
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    gap: 2,
                  }}
                >
                  <CircularProgress size={40} />
                  <Typography variant="body2" color="text.secondary">
                    Loading notifications...
                  </Typography>
                </Box>
              </Menu>
            </Box>
          </Toolbar>
        </AppBar>
      </Box>
    );
  },
};

/**
 * Error state (Visual Mock)
 *
 * Shows how the UI looks when the API fails to load notifications.
 * This is a visual mock to demonstrate error handling UX.
 */
export const Error: Story = {
  render: () => {
    const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
    const t = {
      title: 'Notifications',
      markAllAsRead: 'Mark All as Read',
      clearAll: 'Clear',
    };

    return (
      <Box sx={{ width: '100%', minWidth: 800 }}>
        <Alert severity="info" sx={{ mb: 2 }}>
          <Typography variant="body2">
            <strong>Visual Mock:</strong> This demonstrates what the error state
            should look like. In the actual NotificationCenter component, this
            state is triggered automatically when the GraphQL query fails.
          </Typography>
        </Alert>
        <AppBar position="static">
          <Toolbar>
            <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
              Dashboard (Error State)
            </Typography>
            <Box>
              <IconButton
                color="inherit"
                size="medium"
                onClick={(e) => setAnchorEl(e.currentTarget)}
              >
                <NotificationBadge count={0} />
              </IconButton>
              <Menu
                anchorEl={anchorEl}
                open={Boolean(anchorEl)}
                onClose={() => setAnchorEl(null)}
                PaperProps={{
                  sx: {
                    width: 400,
                    maxHeight: 500,
                  },
                }}
              >
                {/* Header */}
                <Box
                  sx={{
                    px: 2,
                    py: 1.5,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    borderBottom: 1,
                    borderColor: 'divider',
                  }}
                >
                  <Typography
                    variant="h6"
                    component="div"
                    sx={{
                      cursor: 'pointer',
                      '&:hover': { color: 'primary.main' },
                    }}
                    onClick={() => logAction('view-all')()}
                  >
                    {t.title}
                  </Typography>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <Button
                      size="small"
                      color="primary"
                      disabled
                      sx={{ textTransform: 'none' }}
                    >
                      {t.clearAll}
                    </Button>
                    <IconButton
                      size="small"
                      onClick={() => logAction('settings')()}
                    >
                      <SettingsIcon fontSize="small" />
                    </IconButton>
                  </Box>
                </Box>

                {/* Error content */}
                <Box sx={{ p: 2 }}>
                  <Alert severity="error" sx={{ mb: 2 }}>
                    <Typography variant="body2" gutterBottom>
                      <strong>Failed to load notifications</strong>
                    </Typography>
                    <Typography variant="caption">
                      Unable to connect to the server. Please check your
                      internet connection and try again.
                    </Typography>
                  </Alert>
                  <Button
                    variant="outlined"
                    size="small"
                    fullWidth
                    startIcon={<RefreshIcon />}
                    onClick={() => logAction('retry')()}
                  >
                    Retry
                  </Button>
                </Box>
              </Menu>
            </Box>
          </Toolbar>
        </AppBar>
      </Box>
    );
  },
};

/**
 * All read notifications
 *
 * All notifications have been read (badge shows 0)
 */
export const AllRead: Story = {
  render: () => {
    const allRead = createMockNotifications().map((n) => ({
      ...n,
      isRead: true,
    }));
    return (
      <MockedNotificationCenter
        initialNotifications={allRead}
        color="inherit"
        size="medium"
        showSettings={true}
        onViewAll={() => logAction('navigate-to-notification-center')()}
        onSettingsClick={() => logAction('navigate-to-settings')()}
        onNotificationClick={logAction('notification-clicked')}
        title="Dashboard (All Read)"
      />
    );
  },
};

/**
 * Unread only notifications
 *
 * Shows only unread notifications (useful filter scenario)
 */
export const UnreadOnly: Story = {
  render: () => {
    const unreadOnly = createMockNotifications().filter((n) => !n.isRead);
    return (
      <MockedNotificationCenter
        initialNotifications={unreadOnly}
        color="inherit"
        size="medium"
        showSettings={true}
        onViewAll={() => logAction('navigate-to-notification-center')()}
        onSettingsClick={() => logAction('navigate-to-settings')()}
        onNotificationClick={logAction('notification-clicked')}
        title="Dashboard (Unread Only)"
      />
    );
  },
};

/**
 * Without settings button
 */
export const WithoutSettings: Story = {
  render: () => (
    <MockedNotificationCenter
      initialNotifications={createMockNotifications()}
      color="inherit"
      size="medium"
      showSettings={false}
      maxDisplay={5}
      onViewAll={() => logAction('navigate-to-notification-center')()}
      onNotificationClick={logAction('notification-clicked')}
      title="Dashboard (No Settings Button)"
    />
  ),
};

/**
 * Minimal configuration
 *
 * No settings button, no view all callback
 */
export const Minimal: Story = {
  render: () => (
    <MockedNotificationCenter
      initialNotifications={createMockNotifications()}
      color="inherit"
      size="medium"
      showSettings={false}
      maxDisplay={3}
      onNotificationClick={logAction('notification-clicked')}
      title="Dashboard (Minimal)"
    />
  ),
};

/**
 * Different sizes
 */
export const Sizes: Story = {
  render: () => (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
      <MockedNotificationCenter
        initialNotifications={createMockNotifications()}
        color="inherit"
        size="small"
        showSettings={true}
        onViewAll={() => logAction('small-view-all')()}
        onSettingsClick={() => logAction('small-settings')()}
        onNotificationClick={logAction('small-notification')}
        title="Small Size"
      />
      <MockedNotificationCenter
        initialNotifications={createMockNotifications()}
        color="inherit"
        size="medium"
        showSettings={true}
        onViewAll={() => logAction('medium-view-all')()}
        onSettingsClick={() => logAction('medium-settings')()}
        onNotificationClick={logAction('medium-notification')}
        title="Medium Size (Default)"
      />
      <MockedNotificationCenter
        initialNotifications={createMockNotifications()}
        color="inherit"
        size="large"
        showSettings={true}
        onViewAll={() => logAction('large-view-all')()}
        onSettingsClick={() => logAction('large-settings')()}
        onNotificationClick={logAction('large-notification')}
        title="Large Size"
      />
    </Box>
  ),
};

/**
 * Different colors
 */
export const Colors: Story = {
  render: () => (
    <Box
      sx={{ display: 'flex', flexDirection: 'column', gap: 2, minWidth: 800 }}
    >
      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          gap: 2,
          p: 2,
          bgcolor: 'grey.100',
        }}
      >
        <Typography variant="body2" sx={{ width: 150 }}>
          Inherit:
        </Typography>
        <NotificationMenu
          color="inherit"
          size="medium"
          unreadCount={3}
          notifications={createMockNotifications()}
          showSettings={true}
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
        <Typography variant="body2" sx={{ width: 150 }}>
          Primary:
        </Typography>
        <NotificationMenu
          color="primary"
          size="medium"
          unreadCount={3}
          notifications={createMockNotifications()}
          showSettings={true}
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
        <Typography variant="body2" sx={{ width: 150 }}>
          Secondary:
        </Typography>
        <NotificationMenu
          color="secondary"
          size="medium"
          unreadCount={3}
          notifications={createMockNotifications()}
          showSettings={true}
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
        <Typography variant="body2" sx={{ width: 150 }}>
          Default:
        </Typography>
        <NotificationMenu
          color="default"
          size="medium"
          unreadCount={3}
          notifications={createMockNotifications()}
          showSettings={true}
        />
      </Box>
    </Box>
  ),
};

/**
 * Custom max display
 *
 * Only shows the 2 most recent notifications in the menu
 */
export const CustomMaxDisplay: Story = {
  render: () => (
    <MockedNotificationCenter
      initialNotifications={createMockNotifications()}
      color="inherit"
      size="medium"
      showSettings={true}
      maxDisplay={2}
      onViewAll={() => logAction('navigate-to-notification-center')()}
      onSettingsClick={() => logAction('navigate-to-settings')()}
      onNotificationClick={logAction('notification-clicked')}
      title="Dashboard (Max 2 Notifications)"
    />
  ),
};

/**
 * Many notifications
 *
 * Tests scrolling behavior with many notifications
 */
export const ManyNotifications: Story = {
  render: () => {
    const manyNotifications = Array.from({ length: 20 }, (_, i) => ({
      id: `${i + 1}`,
      type: [
        NotificationType.INFO,
        NotificationType.SUCCESS,
        NotificationType.WARNING,
        NotificationType.ERROR,
        NotificationType.SYSTEM,
      ][i % 5],
      title: `Notification #${i + 1}`,
      message: `This is the content of notification #${i + 1}`,
      isRead: i % 3 === 0,
      createdAt: new Date(Date.now() - i * 60 * 60 * 1000).toISOString(),
      readAt: i % 3 === 0 ? new Date().toISOString() : undefined,
    }));

    return (
      <MockedNotificationCenter
        initialNotifications={manyNotifications}
        color="inherit"
        size="medium"
        showSettings={true}
        maxDisplay={10}
        onViewAll={() => logAction('navigate-to-notification-center')()}
        onSettingsClick={() => logAction('navigate-to-settings')()}
        onNotificationClick={logAction('notification-clicked')}
        title="Dashboard (20 Notifications)"
      />
    );
  },
};

/**
 * Long content notifications
 *
 * Tests text overflow handling with very long titles and messages
 */
export const LongContent: Story = {
  render: () => {
    const longNotifications = [
      {
        id: '1',
        type: NotificationType.INFO,
        title:
          'This is a very very very very very very very very very very long notification title to test text overflow behavior',
        message:
          'This is a very very very very very very very very very very very very very very long notification message content to test how the component handles text truncation and ellipsis display when content is too long. This text should be limited to a specific number of lines and the overflow part will be displayed with ellipsis. Let us add more text to make sure it is really long enough to test line wrapping and truncation functionality.',
        isRead: false,
        createdAt: new Date(Date.now() - 5 * 60 * 1000).toISOString(),
        readAt: undefined,
      },
      {
        id: '2',
        type: NotificationType.WARNING,
        title: 'Normal length title',
        message: 'Normal length content',
        isRead: false,
        createdAt: new Date(Date.now() - 10 * 60 * 1000).toISOString(),
        readAt: undefined,
      },
    ];

    return (
      <MockedNotificationCenter
        initialNotifications={longNotifications}
        color="inherit"
        size="medium"
        showSettings={true}
        onViewAll={() => logAction('navigate-to-notification-center')()}
        onSettingsClick={() => logAction('navigate-to-settings')()}
        onNotificationClick={logAction('notification-clicked')}
        title="Dashboard (Long Content Test)"
      />
    );
  },
};

/**
 * Real Usage Example (For Documentation)
 *
 * **What this Story demonstrates**: Real usage of NotificationCenter
 *
 * **Difference from NotificationMenu**:
 * - NotificationCenter automatically fetches data from GraphQL (no need to pass notifications prop)
 * - Supports real-time subscriptions (autoSubscribe=true)
 * - Automatically handles loading and error states
 * - NotificationMenu requires external notifications data
 *
 * **Note**: This Story won't work properly in Storybook environment (no real GraphQL backend),
 * but it demonstrates how to use NotificationCenter in real applications.
 */
export const RealUsageExample: Story = {
  render: () => (
    <Box sx={{ width: '100%', minWidth: 800 }}>
      <Alert severity="info" sx={{ mb: 2 }}>
        <Typography variant="subtitle2" gutterBottom>
          <strong>Difference: NotificationCenter vs NotificationMenu:</strong>
        </Typography>
        <Typography variant="body2" component="div" sx={{ mt: 1 }}>
          <strong>1. NotificationCenter (shown below)</strong>:
          <ul style={{ marginTop: 8, marginBottom: 8 }}>
            <li>
              Automatically fetches notification data from GraphQL (uses
              useNotifications hook)
            </li>
            <li>
              Supports real-time subscriptions (WebSocket), new notifications
              pushed automatically
            </li>
            <li>Built-in error handling and loading states</li>
            <li>
              Usage: <code>&lt;NotificationCenter /&gt;</code> (no need to pass
              notifications)
            </li>
          </ul>
          <strong>2. NotificationMenu</strong>:
          <ul style={{ marginTop: 8, marginBottom: 8 }}>
            <li>Pure UI component, requires external notifications data</li>
            <li>Does not handle data fetching or subscriptions</li>
            <li>Can be reused anywhere (as long as data is provided)</li>
            <li>
              Usage:{' '}
              <code>
                &lt;NotificationMenu notifications=&#123;data&#125; /&gt;
              </code>
            </li>
          </ul>
        </Typography>
        <Typography variant="body2" sx={{ mt: 1, color: 'warning.main' }}>
          ⚠️ In Storybook environment, NotificationCenter will show empty state
          due to lack of real backend. In real applications, it will
          automatically load notification data.
        </Typography>
      </Alert>
      <AppBar position="static">
        <Toolbar>
          <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
            Real NotificationCenter (will show empty state)
          </Typography>
          <NotificationCenter
            color="inherit"
            size="medium"
            autoSubscribe={true}
            showSettings={true}
            onViewAll={() => logAction('navigate-to-notification-center')()}
            onSettingsClick={() => logAction('navigate-to-settings')()}
            onNotificationClick={logAction('notification-clicked')}
          />
        </Toolbar>
      </AppBar>
      <Box sx={{ p: 2, mt: 2 }}>
        <Alert severity="success">
          <Typography variant="body2">
            <strong>Code example in real application:</strong>
          </Typography>
          <pre style={{ marginTop: 8, fontSize: '0.875rem' }}>
            {`// In real applications, simply use it like this:
import { NotificationCenter } from '@/components/organisms';

function AppBar() {
  return (
    <NotificationCenter
      autoSubscribe={true}  // Auto subscribe to new notifications
      onViewAll={() => router.push('/notifications')}
      onSettingsClick={() => router.push('/settings/notifications')}
    />
  );
}

// NotificationCenter will automatically:
// 1. Use useNotifications hook to fetch data
// 2. Subscribe to GraphQL subscription
// 3. Handle errors and loading states
// 4. Delegate UI rendering to NotificationMenu`}
          </pre>
        </Alert>
      </Box>
    </Box>
  ),
};

/**
 * Side-by-Side Comparison
 *
 * **Visual Difference Demonstration**: NotificationCenter vs NotificationMenu
 *
 * This Story shows both components side by side to help understand their differences:
 * - Left: NotificationMenu (requires data to be passed)
 * - Right: NotificationCenter (automatically fetches data, but shows empty state in Storybook)
 */
export const Comparison: Story = {
  render: () => {
    const mockData = createMockNotifications();
    const unreadCount = mockData.filter((n) => !n.isRead).length;

    return (
      <Box sx={{ width: '100%', minWidth: 1200 }}>
        <Alert severity="info" sx={{ mb: 3 }}>
          <Typography variant="subtitle2" gutterBottom>
            <strong>
              Side-by-Side Comparison: NotificationMenu vs NotificationCenter
            </strong>
          </Typography>
          <Typography variant="body2">
            The NotificationMenu on the left requires manual data provision,
            while the NotificationCenter on the right automatically fetches data
            (but shows empty state in Storybook environment due to lack of real
            backend).
          </Typography>
        </Alert>

        <Box
          sx={{
            display: 'grid',
            gridTemplateColumns: '1fr 1fr',
            gap: 3,
          }}
        >
          {/* NotificationMenu - Requires data provision */}
          <Box>
            <Typography
              variant="h6"
              gutterBottom
              sx={{ px: 2, py: 1, bgcolor: 'success.light', color: 'white' }}
            >
              NotificationMenu (With Data)
            </Typography>
            <AppBar position="static">
              <Toolbar>
                <Typography
                  variant="body1"
                  component="div"
                  sx={{ flexGrow: 1 }}
                >
                  Dashboard
                </Typography>
                <NotificationMenu
                  color="inherit"
                  size="medium"
                  unreadCount={unreadCount}
                  notifications={mockData}
                  showSettings={true}
                  onViewAll={() => logAction('menu-view-all')()}
                  onSettingsClick={() => logAction('menu-settings')()}
                />
              </Toolbar>
            </AppBar>
            <Box sx={{ p: 2, bgcolor: 'grey.50' }}>
              <Typography variant="caption" component="div" gutterBottom>
                <strong>Usage:</strong>
              </Typography>
              <pre
                style={{
                  fontSize: '0.75rem',
                  backgroundColor: '#f5f5f5',
                  padding: '8px',
                  borderRadius: '4px',
                  overflow: 'auto',
                }}
              >
                {`<NotificationMenu
  notifications={data}
  unreadCount={count}
  onViewAll={...}
/>`}
              </pre>
              <Typography variant="caption" color="success.main" sx={{ mt: 1 }}>
                ✅ Pros: Full control over data source, easy to test
              </Typography>
              <br />
              <Typography variant="caption" color="text.secondary">
                ⚠️ Requires: Manual data fetching and state management
              </Typography>
            </Box>
          </Box>

          {/* NotificationCenter - Auto-fetches data */}
          <Box>
            <Typography
              variant="h6"
              gutterBottom
              sx={{ px: 2, py: 1, bgcolor: 'primary.main', color: 'white' }}
            >
              NotificationCenter (Auto-fetch)
            </Typography>
            <AppBar position="static">
              <Toolbar>
                <Typography
                  variant="body1"
                  component="div"
                  sx={{ flexGrow: 1 }}
                >
                  Dashboard
                </Typography>
                <NotificationCenter
                  color="inherit"
                  size="medium"
                  autoSubscribe={true}
                  showSettings={true}
                  onViewAll={() => logAction('center-view-all')()}
                  onSettingsClick={() => logAction('center-settings')()}
                />
              </Toolbar>
            </AppBar>
            <Box sx={{ p: 2, bgcolor: 'grey.50' }}>
              <Typography variant="caption" component="div" gutterBottom>
                <strong>Usage:</strong>
              </Typography>
              <pre
                style={{
                  fontSize: '0.75rem',
                  backgroundColor: '#f5f5f5',
                  padding: '8px',
                  borderRadius: '4px',
                  overflow: 'auto',
                }}
              >
                {`<NotificationCenter
  autoSubscribe={true}
  onViewAll={...}
/>`}
              </pre>
              <Typography variant="caption" color="primary.main" sx={{ mt: 1 }}>
                ✅ Pros: Auto data fetching, real-time subscriptions, error
                handling
              </Typography>
              <br />
              <Typography variant="caption" color="warning.main">
                ⚠️ Storybook: Shows empty state without backend
              </Typography>
            </Box>
          </Box>
        </Box>

        <Alert severity="warning" sx={{ mt: 3 }}>
          <Typography variant="body2">
            <strong>Why is the right side empty?</strong>
            <br />
            NotificationCenter in real applications will use the
            useNotifications hook to automatically fetch data from GraphQL. But
            in the Storybook environment, it shows an empty state due to the
            lack of connection to a real backend server.
            <br />
            <br />
            <strong>In real applications:</strong>
            <br />
            NotificationCenter will automatically load notifications, subscribe
            to new notification pushes, and handle errors and loading states.
            This is the key difference from NotificationMenu - it is a complete
            data integration solution, while NotificationMenu is just a UI
            component.
          </Typography>
        </Alert>
      </Box>
    );
  },
};
