import type { Meta, StoryObj } from '@storybook/react';
import { useState } from 'react';
import { Sidebar, SidebarMenuItem } from './Sidebar';
import {
  Box,
  Typography,
  AppBar,
  Toolbar,
  IconButton,
  Avatar,
  useMediaQuery,
  useTheme,
} from '@mui/material';
import {
  Home as HomeIcon,
  Dashboard as DashboardIcon,
  People as PeopleIcon,
  Assessment as AssessmentIcon,
  Settings as SettingsIcon,
  Notifications as NotificationsIcon,
  Mail as MailIcon,
  Logout as LogoutIcon,
  Menu as MenuIcon,
} from '@mui/icons-material';
import { DrawerState } from '@/components/atoms/Drawer';

/**
 * Sidebar 元件是基於 Drawer 的應用程式側邊欄，提供導航功能。
 *
 * **特性**:
 * - 支援完全展開和半展開（mini）模式
 * - Mini 模式下只顯示圖示，hover 顯示 tooltip
 * - 響應式設計：手機版自動切換為 temporary 模式
 * - 活動項目自動高亮
 * - 支援自訂 header 和 footer
 * - 支援左側和右側錨點
 *
 * **使用場景**:
 * - 應用程式主導航
 * - 管理後台側邊欄
 * - 多功能面板
 */
const meta = {
  title: 'Organisms/Sidebar',
  component: Sidebar,
  parameters: {
    layout: 'fullscreen',
    docs: {
      description: {
        component:
          'Application sidebar component with navigation menu, supporting responsive design and mini mode.',
      },
    },
  },
  tags: ['autodocs'],
  argTypes: {
    state: {
      control: 'select',
      options: ['closed', 'mini', 'open'],
      description: 'Display state',
      table: {
        defaultValue: { summary: 'open' },
      },
    },
    variant: {
      control: 'select',
      options: ['temporary', 'persistent', 'permanent'],
      description: 'Drawer variant',
      table: {
        defaultValue: { summary: 'persistent' },
      },
    },
    anchor: {
      control: 'select',
      options: ['left', 'right'],
      description: 'Side of the screen',
      table: {
        defaultValue: { summary: 'left' },
      },
    },
    responsive: {
      control: 'boolean',
      description: 'Enable responsive behavior',
      table: {
        defaultValue: { summary: 'true' },
      },
    },
  },
} satisfies Meta<typeof Sidebar>;

export default meta;
type Story = StoryObj<typeof meta>;

// Sample menu items
const menuItems: SidebarMenuItem[] = [
  {
    id: 'home',
    label: 'Home',
    icon: <HomeIcon />,
    path: '/',
  },
  {
    id: 'dashboard',
    label: 'Dashboard',
    icon: <DashboardIcon />,
    path: '/dashboard',
  },
  {
    id: 'users',
    label: 'Users',
    icon: <PeopleIcon />,
    path: '/users',
  },
  {
    id: 'reports',
    label: 'Reports',
    icon: <AssessmentIcon />,
    path: '/reports',
  },
  {
    id: 'divider-1',
    label: '',
    divider: true,
  },
  {
    id: 'settings',
    label: 'Settings',
    icon: <SettingsIcon />,
    path: '/settings',
  },
  {
    id: 'logout',
    label: 'Logout',
    icon: <LogoutIcon />,
    onClick: () => alert('Logout clicked'),
  },
];

/**
 * Default sidebar with open state
 */
export const Default: Story = {
  render: (args) => (
    <Box sx={{ display: 'flex', height: '500px' }}>
      <Sidebar {...args} />
      <Box sx={{ flexGrow: 1, p: 3, bgcolor: 'grey.50' }}>
        <Typography variant="h5">Main Content</Typography>
        <Typography>Default sidebar with full width menu items.</Typography>
      </Box>
    </Box>
  ),
  args: {
    items: menuItems,
    activeItemId: 'dashboard',
    state: 'open',
    variant: 'persistent',
    header: <Typography variant="h6">My App</Typography>,
  },
};

/**
 * Mini (collapsed) state - shows only icons
 */
export const Mini: Story = {
  render: (args) => (
    <Box sx={{ display: 'flex', height: '500px' }}>
      <Sidebar {...args} />
      <Box sx={{ flexGrow: 1, p: 3, bgcolor: 'grey.50' }}>
        <Typography variant="h5">Main Content</Typography>
        <Typography>
          Mini mode showing only icons. Hover to see tooltips.
        </Typography>
      </Box>
    </Box>
  ),
  args: {
    items: menuItems,
    activeItemId: 'dashboard',
    state: 'mini',
    variant: 'persistent',
    header: <Typography variant="h6">My App</Typography>,
  },
};

/**
 * Permanent sidebar - always visible
 */
export const Permanent: Story = {
  render: (args) => (
    <Box sx={{ display: 'flex', height: '500px' }}>
      <Sidebar {...args} />
      <Box sx={{ flexGrow: 1, p: 3, bgcolor: 'grey.50' }}>
        <Typography variant="h5">Main Content</Typography>
        <Typography>
          Permanent sidebar is always visible and cannot be closed.
        </Typography>
      </Box>
    </Box>
  ),
  args: {
    items: menuItems,
    activeItemId: 'home',
    state: 'open',
    variant: 'permanent',
    header: <Typography variant="h6">Dashboard</Typography>,
  },
};

/**
 * Right-anchored sidebar
 */
export const RightAnchor: Story = {
  render: (args) => (
    <Box sx={{ display: 'flex', height: '500px' }}>
      <Box sx={{ flexGrow: 1, p: 3, bgcolor: 'grey.50' }}>
        <Typography variant="h5">Main Content</Typography>
        <Typography>
          Right-anchored sidebar for actions or notifications.
        </Typography>
      </Box>
      <Sidebar {...args} />
    </Box>
  ),
  args: {
    items: [
      {
        id: 'notifications',
        label: 'Notifications',
        icon: <NotificationsIcon />,
      },
      {
        id: 'messages',
        label: 'Messages',
        icon: <MailIcon />,
      },
      {
        id: 'settings',
        label: 'Settings',
        icon: <SettingsIcon />,
      },
    ],
    activeItemId: 'notifications',
    state: 'open',
    variant: 'persistent',
    anchor: 'right',
    header: <Typography variant="h6">Actions</Typography>,
  },
};

/**
 * With custom header and footer
 */
export const WithHeaderFooter: Story = {
  render: (args) => (
    <Box sx={{ display: 'flex', height: '500px' }}>
      <Sidebar {...args} />
      <Box sx={{ flexGrow: 1, p: 3, bgcolor: 'grey.50' }}>
        <Typography variant="h5">Main Content</Typography>
        <Typography>
          Sidebar with customized header and footer sections.
        </Typography>
      </Box>
    </Box>
  ),
  args: {
    items: menuItems,
    activeItemId: 'dashboard',
    state: 'open',
    variant: 'persistent',
    header: (
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
        <Avatar sx={{ width: 32, height: 32, bgcolor: 'primary.main' }}>
          A
        </Avatar>
        <Box>
          <Typography variant="subtitle2">My App</Typography>
          <Typography variant="caption" color="text.secondary">
            v1.0.0
          </Typography>
        </Box>
      </Box>
    ),
    footer: (
      <Box sx={{ textAlign: 'center' }}>
        <Avatar sx={{ width: 40, height: 40, mx: 'auto', mb: 1 }}>JD</Avatar>
        <Typography variant="caption" display="block">
          John Doe
        </Typography>
        <Typography variant="caption" color="text.secondary">
          john@example.com
        </Typography>
      </Box>
    ),
  },
};

/**
 * Mini mode comparison
 */
export const MiniModeComparison: Story = {
  render: () => {
    return (
      <Box>
        <Typography variant="h5" gutterBottom sx={{ p: 2 }}>
          Sidebar States Comparison
        </Typography>

        <Box sx={{ display: 'flex', gap: 4, p: 2 }}>
          {/* Open */}
          <Box>
            <Typography variant="h6" gutterBottom>
              Open (Full Width)
            </Typography>
            <Box
              sx={{ display: 'flex', height: 400, border: '1px solid #ddd' }}
            >
              <Sidebar
                items={menuItems.slice(0, 5)}
                activeItemId="dashboard"
                state="open"
                variant="permanent"
                header={<Typography variant="subtitle1">My App</Typography>}
              />
            </Box>
          </Box>

          {/* Mini */}
          <Box>
            <Typography variant="h6" gutterBottom>
              Mini (Icons Only)
            </Typography>
            <Box
              sx={{ display: 'flex', height: 400, border: '1px solid #ddd' }}
            >
              <Sidebar
                items={menuItems.slice(0, 5)}
                activeItemId="dashboard"
                state="mini"
                variant="permanent"
                header={<Typography variant="subtitle1">My App</Typography>}
              />
            </Box>
          </Box>
        </Box>

        <Typography variant="body2" sx={{ p: 2, color: 'text.secondary' }}>
          Hover over icons in mini mode to see tooltips with labels
        </Typography>
      </Box>
    );
  },
};

/**
 * Interactive example - toggle between states
 */
export const Interactive: Story = {
  render: (args) => {
    const [state, setState] = useState<DrawerState>('open');
    const [activeId, setActiveId] = useState('dashboard');

    const items = menuItems.map((item) => ({
      ...item,
      onClick: item.divider
        ? undefined
        : () => {
            setActiveId(item.id);
            if (item.onClick) item.onClick();
          },
    }));

    return (
      <Box sx={{ display: 'flex', height: '600px' }}>
        <Sidebar
          {...args}
          items={items}
          activeItemId={activeId}
          state={state}
          onStateChange={setState}
          header={<Typography variant="h6">My App</Typography>}
          footer={
            <Typography
              variant="caption"
              sx={{ textAlign: 'center', display: 'block' }}
            >
              © 2026 Company
            </Typography>
          }
        />

        <Box sx={{ flexGrow: 1, p: 3, bgcolor: 'grey.50' }}>
          <Typography variant="h5" gutterBottom>
            Main Content Area
          </Typography>
          <Typography paragraph>
            Current state: <strong>{state}</strong>
          </Typography>
          <Typography paragraph>
            Active item: <strong>{activeId}</strong>
          </Typography>
          <Typography>
            Click menu items to change active state. Use the toggle button to
            switch between open and mini modes.
          </Typography>
        </Box>
      </Box>
    );
  },
  args: {
    variant: 'persistent',
  },
};

/**
 * Complete application layout with AppBar and responsive behavior
 */
export const ApplicationLayout: Story = {
  render: () => {
    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down('md'));
    const [state, setState] = useState<DrawerState>(
      isMobile ? 'closed' : 'open',
    );
    const [activeId, setActiveId] = useState('dashboard');

    const handleMenuClick = () => {
      setState(state === 'closed' ? 'open' : 'closed');
    };

    const items = menuItems.map((item) => ({
      ...item,
      onClick: item.divider
        ? undefined
        : () => {
            setActiveId(item.id);
            // On mobile, close drawer after selection
            if (isMobile) {
              setState('closed');
            }
          },
    }));

    return (
      <Box sx={{ display: 'flex', height: '600px' }}>
        {/* Top AppBar */}
        <AppBar
          position="fixed"
          sx={{
            zIndex: (theme) => theme.zIndex.drawer + 1,
          }}
        >
          <Toolbar>
            <IconButton
              color="inherit"
              edge="start"
              onClick={handleMenuClick}
              sx={{ mr: 2 }}
            >
              <MenuIcon />
            </IconButton>
            <Typography variant="h6" noWrap component="div">
              Dashboard Application
            </Typography>
          </Toolbar>
        </AppBar>

        {/* Sidebar */}
        <Sidebar
          items={items}
          activeItemId={activeId}
          state={state}
          variant="persistent"
          onStateChange={setState}
          responsive={true}
          header={
            <Box sx={{ mt: isMobile ? 0 : 8 }}>
              <Typography variant="h6">Navigation</Typography>
            </Box>
          }
          footer={
            <Box sx={{ textAlign: 'center' }}>
              <Avatar sx={{ width: 32, height: 32, mx: 'auto', mb: 0.5 }}>
                U
              </Avatar>
              <Typography variant="caption" display="block">
                User Name
              </Typography>
            </Box>
          }
        />

        {/* Main Content */}
        <Box component="main" sx={{ flexGrow: 1, p: 3, bgcolor: 'grey.50' }}>
          <Toolbar />
          <Typography variant="h4" gutterBottom>
            {items.find((i) => i.id === activeId)?.label || 'Welcome'}
          </Typography>
          <Typography paragraph>
            This is an example of a complete responsive application layout.
          </Typography>
          <Typography paragraph>
            <strong>Responsive Behavior:</strong>
          </Typography>
          <ul>
            <li>
              Desktop: Persistent drawer that can toggle between open and mini
            </li>
            <li>Mobile: Temporary drawer that overlays content</li>
            <li>
              Current screen size:{' '}
              <strong>{isMobile ? 'Mobile' : 'Desktop'}</strong>
            </li>
          </ul>
          <Typography>
            Try resizing your browser window to see the responsive behavior!
          </Typography>
        </Box>
      </Box>
    );
  },
};

/**
 * Left and Right sidebars together
 */
export const DualSidebars: Story = {
  render: () => {
    const [leftState, setLeftState] = useState<DrawerState>('open');
    const [rightState, setRightState] = useState<DrawerState>('mini');

    const leftItems: SidebarMenuItem[] = [
      { id: 'home', label: 'Home', icon: <HomeIcon /> },
      { id: 'dashboard', label: 'Dashboard', icon: <DashboardIcon /> },
      { id: 'users', label: 'Users', icon: <PeopleIcon /> },
    ];

    const rightItems: SidebarMenuItem[] = [
      {
        id: 'notifications',
        label: 'Notifications',
        icon: <NotificationsIcon />,
      },
      { id: 'messages', label: 'Messages', icon: <MailIcon /> },
      { id: 'settings', label: 'Settings', icon: <SettingsIcon /> },
    ];

    return (
      <Box sx={{ display: 'flex', height: '600px' }}>
        {/* Left Sidebar */}
        <Sidebar
          items={leftItems}
          activeItemId="dashboard"
          state={leftState}
          variant="permanent"
          onStateChange={setLeftState}
          anchor="left"
          header={<Typography variant="h6">Navigation</Typography>}
        />

        {/* Main Content */}
        <Box sx={{ flexGrow: 1, p: 3, bgcolor: 'grey.50' }}>
          <Typography variant="h4" gutterBottom>
            Dual Sidebars Layout
          </Typography>
          <Typography paragraph>
            This layout demonstrates using both left and right sidebars
            simultaneously.
          </Typography>
          <Typography>
            Left sidebar: <strong>{leftState}</strong> | Right sidebar:{' '}
            <strong>{rightState}</strong>
          </Typography>
        </Box>

        {/* Right Sidebar */}
        <Sidebar
          items={rightItems}
          activeItemId="notifications"
          state={rightState}
          variant="permanent"
          onStateChange={setRightState}
          anchor="right"
          header={<Typography variant="h6">Actions</Typography>}
        />
      </Box>
    );
  },
};
