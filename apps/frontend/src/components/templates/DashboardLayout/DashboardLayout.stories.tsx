import type { Meta, StoryObj } from '@storybook/nextjs';
import { DashboardLayout } from './DashboardLayout';
import { Box, Typography, Card, CardContent, Grid, Paper } from '@mui/material';
import {
  Dashboard,
  People,
  Settings,
  BarChart,
  Map,
  Assessment,
} from '@mui/icons-material';
import type { Notification } from '@/components/atoms';
import type { SidebarMenuItem } from '@/components/organisms';

const mockUser = {
  name: 'John Doe',
  email: 'john.doe@example.com',
  avatar: 'https://i.pravatar.cc/150?img=1',
  role: 'HQ',
  status: 'online' as const,
};

const mockNotifications: Notification[] = [
  {
    id: '1',
    type: 'info',
    title: 'System Maintenance',
    message:
      'System maintenance scheduled for tonight at 11:00 PM, estimated duration 2 hours',
    timestamp: new Date(Date.now() - 5 * 60 * 1000),
    read: false,
  },
  {
    id: '2',
    type: 'success',
    title: 'Password Updated',
    message: 'Your password has been successfully updated',
    timestamp: new Date(Date.now() - 60 * 60 * 1000),
    read: true,
  },
  {
    id: '3',
    type: 'warning',
    title: 'Security Warning',
    message: 'Login detected from a new device',
    timestamp: new Date(Date.now() - 24 * 60 * 60 * 1000),
    read: false,
  },
];

const mockSidebarItems: SidebarMenuItem[] = [
  {
    id: 'overview',
    label: 'Overview',
    icon: <Dashboard />,
    path: '/overview',
    onClick: () => console.log('Navigate to Overview'),
  },
  {
    id: 'asset',
    label: 'Asset Management',
    icon: <BarChart />,
    path: '/asset',
    onClick: () => console.log('Navigate to Asset Management'),
    expandable: true,
  },
  {
    id: 'report',
    label: 'Report Management',
    icon: <Assessment />,
    path: '/report',
    onClick: () => console.log('Navigate to Report Management'),
    expandable: true,
  },
  {
    id: 'record',
    label: 'Record Management',
    icon: <Map />,
    path: '/record',
    onClick: () => console.log('Navigate to Record Management'),
    expandable: true,
  },
  {
    id: 'event',
    label: 'Event Management',
    icon: <People />,
    path: '/event',
    onClick: () => console.log('Navigate to Event Management'),
    expandable: true,
  },
  {
    id: 'dispatch',
    label: 'Dispatch Management',
    icon: <Settings />,
    path: '/dispatch',
    onClick: () => console.log('Navigate to Dispatch Management'),
    expandable: true,
  },
  {
    id: 'user',
    label: 'User Management',
    icon: <People />,
    path: '/user',
    onClick: () => console.log('Navigate to User Management'),
    expandable: true,
  },
];

const SampleContent = () => (
  <Box>
    <Typography variant="h4" gutterBottom>
      Welcome to Dashboard
    </Typography>
    <Typography variant="body1" color="text.secondary" paragraph>
      This is a complete dashboard layout template combining MainAppBar and
      Sidebar.
    </Typography>

    <Grid container spacing={3} sx={{ mt: 2 }}>
      <Grid item xs={12} md={4}>
        <Card>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              Total Users
            </Typography>
            <Typography variant="h3" color="primary">
              1,234
            </Typography>
            <Typography variant="body2" color="text.secondary">
              12% increase from last month
            </Typography>
          </CardContent>
        </Card>
      </Grid>
      <Grid item xs={12} md={4}>
        <Card>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              Active Sessions
            </Typography>
            <Typography variant="h3" color="success.main">
              567
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Currently online users
            </Typography>
          </CardContent>
        </Card>
      </Grid>
      <Grid item xs={12} md={4}>
        <Card>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              System Status
            </Typography>
            <Typography variant="h3" color="info.main">
              98.9%
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Uptime
            </Typography>
          </CardContent>
        </Card>
      </Grid>
    </Grid>

    <Paper sx={{ p: 3, mt: 3 }}>
      <Typography variant="h6" gutterBottom>
        Recent Activity
      </Typography>
      <Typography variant="body2" color="text.secondary">
        This area can display recent system activity logs or other relevant
        information.
      </Typography>
    </Paper>
  </Box>
);

/**
 * DashboardLayout is a complete dashboard layout template
 *
 * **Features**:
 * - Combines MainAppBar + Sidebar + Content Area
 * - Responsive design (automatically hides Sidebar on mobile)
 * - Sidebar supports three states: Open/Mini/Closed
 * - Fixed AppBar and Sidebar
 * - Main content area automatically fills remaining space
 * - Content area automatically adjusts margin based on Sidebar state
 *
 * **Use Cases**:
 * - HQ dashboard interface
 * - Dashboard pages
 * - Applications requiring side navigation
 */
const meta = {
  title: 'Templates/DashboardLayout',
  component: DashboardLayout,
  parameters: {
    layout: 'fullscreen',
    docs: {
      description: {
        component:
          'Complete dashboard layout template combining MainAppBar, Sidebar, and content area. Supports responsive design and Sidebar state switching.',
      },
    },
  },
  tags: ['autodocs'],
  argTypes: {
    sidebarInitialState: {
      control: 'select',
      options: ['open', 'mini', 'closed'],
      description: 'Sidebar initial state',
      table: {
        defaultValue: { summary: 'open' },
      },
    },
    sidebarWidth: {
      control: 'number',
      description: 'Width when Sidebar is fully expanded',
      table: {
        defaultValue: { summary: '240' },
      },
    },
    showUserName: {
      control: 'boolean',
      description: 'Show user name',
      table: {
        defaultValue: { summary: 'false' },
      },
    },
    showUserStatus: {
      control: 'boolean',
      description: 'Show user status',
      table: {
        defaultValue: { summary: 'false' },
      },
    },
    userIconMode: {
      control: 'boolean',
      description: 'Use icon mode',
      table: {
        defaultValue: { summary: 'true' },
      },
    },
    currentTheme: {
      control: 'select',
      options: ['light', 'dark', 'system'],
      description: 'Current theme',
      table: {
        defaultValue: { summary: 'light' },
      },
    },
  },
} satisfies Meta<typeof DashboardLayout>;

export default meta;
type Story = StoryObj<typeof meta>;

/**
 * Default layout - Sidebar fully expanded
 */
export const Default: Story = {
  args: {
    title: 'NPT Dashboard',
    logo: (
      <Box
        sx={{
          fontSize: '1.75rem',
          fontWeight: 'bold',
          color: 'white',
        }}
      >
        📊
      </Box>
    ),
    titleLink: '/dashboard',
    user: mockUser,
    sidebarItems: mockSidebarItems,
    activeSidebarItemId: 'dashboard',
    notifications: mockNotifications,
    unreadNotificationCount: 2,
    showUserName: true,
    showUserStatus: true,
    userIconMode: true,
    currentTheme: 'light',
    sidebarInitialState: 'open',
    onAccountClick: () => console.log('Account clicked'),
    onProfileClick: () => console.log('Profile clicked'),
    onSecurityClick: () => console.log('Security clicked'),
    onLogout: () => console.log('Logout clicked'),
    onThemeChange: (theme) => console.log('Theme changed to:', theme),
    onHelpClick: () => console.log('Help clicked'),
    onAboutClick: () => console.log('About clicked'),
    children: <SampleContent />,
  },
};

/**
 * Full-featured demo
 * All features enabled, showcasing complete dashboard experience
 */
export const FullFeatured: Story = {
  args: {
    title: 'NPT Dashboard',
    logo: (
      <Box
        sx={{
          fontSize: '1.75rem',
          fontWeight: 'bold',
          color: 'white',
        }}
      >
        📊
      </Box>
    ),
    titleLink: '/dashboard',
    user: mockUser,
    sidebarItems: mockSidebarItems,
    activeSidebarItemId: 'dashboard',
    sidebarHeader: (
      <Box sx={{ p: 2, textAlign: 'center' }}>
        <Typography variant="subtitle2" color="text.secondary">
          Intelligent Cloud Plus, Inc.
        </Typography>
      </Box>
    ),
    sidebarFooter: (
      <Box
        sx={{ p: 2, textAlign: 'center', borderTop: 1, borderColor: 'divider' }}
      >
        <Typography variant="caption" color="text.secondary">
          Version 1.0.0
        </Typography>
      </Box>
    ),
    notifications: mockNotifications,
    unreadNotificationCount: 3,
    showUserName: true,
    showUserStatus: true,
    userIconMode: true,
    currentTheme: 'light',
    sidebarInitialState: 'open',
    onAccountClick: () => console.log('Account clicked'),
    onProfileClick: () => console.log('Profile clicked'),
    onSecurityClick: () => console.log('Security clicked'),
    onLogout: () => console.log('Logout clicked'),
    onThemeChange: (theme) => console.log('Theme changed to:', theme),
    onHelpClick: () => console.log('Help clicked'),
    onAboutClick: () => console.log('About clicked'),
    onNotificationClick: (notification) =>
      console.log('Notification clicked:', notification),
    onMarkAllNotificationsRead: () => console.log('Mark all as read'),
    onViewAllNotifications: () => console.log('View all notifications'),
    onClearAllNotifications: () => console.log('Clear all notifications'),
    children: <SampleContent />,
  },
};

/**
 * Mini Sidebar mode
 * Sidebar in semi-expanded state, showing only icons
 */
export const WithMiniSidebar: Story = {
  args: {
    title: 'NPT Dashboard',
    logo: (
      <Box
        sx={{
          fontSize: '1.75rem',
          fontWeight: 'bold',
          color: 'white',
        }}
      >
        📊
      </Box>
    ),
    titleLink: '/dashboard',
    user: mockUser,
    sidebarItems: mockSidebarItems,
    activeSidebarItemId: 'analytics',
    notifications: mockNotifications,
    unreadNotificationCount: 1,
    showUserName: true,
    showUserStatus: true,
    userIconMode: true,
    currentTheme: 'light',
    sidebarInitialState: 'mini',
    onAccountClick: () => console.log('Account clicked'),
    onProfileClick: () => console.log('Profile clicked'),
    onSecurityClick: () => console.log('Security clicked'),
    onLogout: () => console.log('Logout clicked'),
    onThemeChange: (theme) => console.log('Theme changed to:', theme),
    onHelpClick: () => console.log('Help clicked'),
    onAboutClick: () => console.log('About clicked'),
    children: <SampleContent />,
  },
};

/**
 * Sidebar closed
 * Sidebar completely hidden, content area spans full width
 */
export const WithClosedSidebar: Story = {
  args: {
    title: 'NPT Dashboard',
    logo: (
      <Box
        sx={{
          fontSize: '1.75rem',
          fontWeight: 'bold',
          color: 'white',
        }}
      >
        📊
      </Box>
    ),
    titleLink: '/dashboard',
    user: mockUser,
    sidebarItems: mockSidebarItems,
    notifications: mockNotifications,
    unreadNotificationCount: 0,
    showUserName: true,
    showUserStatus: true,
    userIconMode: true,
    currentTheme: 'light',
    sidebarInitialState: 'closed',
    onAccountClick: () => console.log('Account clicked'),
    onProfileClick: () => console.log('Profile clicked'),
    onSecurityClick: () => console.log('Security clicked'),
    onLogout: () => console.log('Logout clicked'),
    onThemeChange: (theme) => console.log('Theme changed to:', theme),
    onHelpClick: () => console.log('Help clicked'),
    onAboutClick: () => console.log('About clicked'),
    children: <SampleContent />,
  },
};

/**
 * Custom content
 * Demonstrates layout flexibility
 */
export const CustomContent: Story = {
  args: {
    title: 'Custom Application',
    user: mockUser,
    sidebarItems: mockSidebarItems,
    activeSidebarItemId: 'settings',
    notifications: mockNotifications,
    unreadNotificationCount: 1,
    showUserName: true,
    showUserStatus: true,
    userIconMode: true,
    currentTheme: 'light',
    sidebarInitialState: 'open',
    onAccountClick: () => console.log('Account clicked'),
    onProfileClick: () => console.log('Profile clicked'),
    onSecurityClick: () => console.log('Security clicked'),
    onLogout: () => console.log('Logout clicked'),
    onThemeChange: (theme) => console.log('Theme changed to:', theme),
    onHelpClick: () => console.log('Help clicked'),
    onAboutClick: () => console.log('About clicked'),
    children: (
      <Box sx={{ textAlign: 'center', py: 8 }}>
        <Typography variant="h3" gutterBottom>
          🎨 Custom Content Area
        </Typography>
        <Typography variant="h6" color="text.secondary" paragraph>
          DashboardLayout can contain any custom content
        </Typography>
        <Typography variant="body1" color="text.secondary">
          You can place any React components, forms, charts, tables, etc. here.
        </Typography>
      </Box>
    ),
  },
};
