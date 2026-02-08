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
  KeyboardArrowLeft as KeyboardArrowLeftIcon,
  KeyboardArrowRight as KeyboardArrowRightIcon,
  Folder as FolderIcon,
  ShoppingCart as ShoppingCartIcon,
  Work as WorkIcon,
  InsertDriveFile as FileIcon,
  Image as ImageIcon,
  VideoLibrary as VideoIcon,
  MusicNote as MusicIcon,
  Category as CategoryIcon,
  Smartphone as SmartphoneIcon,
  Store as StoreIcon,
  Business as BusinessIcon,
  Contacts as ContactsIcon,
  Assignment as AssignmentIcon,
  Task as TaskIcon,
} from '@mui/icons-material';
import { DrawerState } from '@/components/atoms/Drawer';

/**
 * Sidebar component is an application sidebar based on Drawer, providing navigation functionality.
 *
 * **Features**:
 * - Supports fully expanded and semi-expanded (mini) modes
 * - Mini mode displays only icons, showing tooltips on hover
 * - Supports expandable submenus with three behaviors in mini mode:
 *   - 'hide': Completely hide submenus (default)
 *   - 'popover': Show floating menu on hover
 *   - 'expand': Temporarily expand Sidebar on click
 * - Responsive design: Automatically switches to temporary mode on mobile
 * - Active items automatically highlighted
 * - Supports custom header and footer
 * - Supports left and right anchor positions
 *
 * **Use Cases**:
 * - Application main navigation
 * - Admin dashboard sidebar
 * - Multi-function panels
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
    miniExpandBehavior: {
      control: 'select',
      options: ['hide', 'popover', 'expand'],
      description: 'Expandable menu behavior in mini mode',
      table: {
        defaultValue: { summary: 'hide' },
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

// Simple menu items for Interactive and ApplicationLayout examples
const simpleMenuItems: SidebarMenuItem[] = [
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
    id: 'settings',
    label: 'Settings',
    icon: <SettingsIcon />,
    path: '/settings',
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

    const items = simpleMenuItems.map((item) => ({
      ...item,
      onClick: () => {
        setActiveId(item.id);
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

    const items = simpleMenuItems.map((item) => ({
      ...item,
      onClick: () => {
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

/**
 * Simple expandable menu with one level
 */
export const SimpleExpandableMenu: Story = {
  render: () => {
    const [state, setState] = useState<DrawerState>('open');

    const menuWithChildren: SidebarMenuItem[] = [
      {
        id: 'home',
        label: 'Home',
        icon: <HomeIcon />,
        path: '/',
      },
      {
        id: 'products',
        label: 'Products',
        icon: <ShoppingCartIcon />,
        children: [
          { id: 'products-all', label: 'All Products', icon: <CategoryIcon /> },
          {
            id: 'products-electronics',
            label: 'Electronics',
            icon: <SmartphoneIcon />,
          },
          { id: 'products-clothing', label: 'Clothing', icon: <StoreIcon /> },
        ],
      },
      {
        id: 'reports',
        label: 'Reports',
        icon: <AssessmentIcon />,
        path: '/reports',
      },
      {
        id: 'settings',
        label: 'Settings',
        icon: <SettingsIcon />,
        path: '/settings',
      },
    ];

    return (
      <Box sx={{ display: 'flex', height: '500px' }}>
        <Sidebar
          items={menuWithChildren}
          activeItemId="products-electronics"
          state={state}
          onStateChange={setState}
          variant="permanent"
          header={<Typography variant="h6">Simple Menu</Typography>}
        />
        <Box sx={{ flexGrow: 1, p: 3, bgcolor: 'grey.50' }}>
          <Typography variant="h5">Simple Expandable Menu</Typography>
          <Typography paragraph>
            Current state: <strong>{state}</strong>
          </Typography>
          <Typography paragraph>
            Click on "Products" to expand and see sub-menu items.
          </Typography>
          <Typography paragraph>
            Use the toggle button to switch to mini mode - expandable menus will
            collapse and only show icons with tooltips.
          </Typography>
          <Typography>
            The expand/collapse icon rotates smoothly when toggled.
          </Typography>
        </Box>
      </Box>
    );
  },
};

/**
 * Multi-level expandable menu (nested)
 */
export const MultiLevelExpandableMenu: Story = {
  render: () => {
    const [state, setState] = useState<DrawerState>('open');

    const nestedMenu: SidebarMenuItem[] = [
      {
        id: 'home',
        label: 'Home',
        icon: <HomeIcon />,
      },
      {
        id: 'files',
        label: 'Files',
        icon: <FolderIcon />,
        defaultExpanded: true,
        children: [
          {
            id: 'files-documents',
            label: 'Documents',
            icon: <FileIcon />,
            children: [
              {
                id: 'files-documents-work',
                label: 'Work',
                icon: <BusinessIcon />,
              },
              {
                id: 'files-documents-personal',
                label: 'Personal',
                icon: <ContactsIcon />,
              },
            ],
          },
          {
            id: 'files-media',
            label: 'Media',
            icon: <ImageIcon />,
            children: [
              {
                id: 'files-media-photos',
                label: 'Photos',
                icon: <ImageIcon />,
              },
              {
                id: 'files-media-videos',
                label: 'Videos',
                icon: <VideoIcon />,
              },
              { id: 'files-media-music', label: 'Music', icon: <MusicIcon /> },
            ],
          },
        ],
      },
      {
        id: 'projects',
        label: 'Projects',
        icon: <WorkIcon />,
        children: [
          { id: 'projects-active', label: 'Active', icon: <AssignmentIcon /> },
          { id: 'projects-completed', label: 'Completed', icon: <TaskIcon /> },
        ],
      },
      {
        id: 'settings',
        label: 'Settings',
        icon: <SettingsIcon />,
      },
    ];

    return (
      <Box sx={{ display: 'flex', height: '600px' }}>
        <Sidebar
          items={nestedMenu}
          activeItemId="files-media-photos"
          state={state}
          onStateChange={setState}
          variant="permanent"
          header={<Typography variant="h6">File Manager</Typography>}
        />
        <Box sx={{ flexGrow: 1, p: 3, bgcolor: 'grey.50' }}>
          <Typography variant="h5">Multi-Level Expandable Menu</Typography>
          <Typography paragraph>
            Current state: <strong>{state}</strong>
          </Typography>
          <Typography paragraph>
            Nested sub-menus with multiple levels of depth.
          </Typography>
          <Typography paragraph>
            Notice how sub-items are indented to show hierarchy.
          </Typography>
          <Typography paragraph>
            The "Files" menu is set to defaultExpanded, so it opens
            automatically.
          </Typography>
          <Typography>
            Toggle to mini mode - all sub-menus will be hidden and only parent
            icons will show with tooltips. Hover over icons to see the full menu
            structure.
          </Typography>
        </Box>
      </Box>
    );
  },
};

/**
 * Mini mode behavior - Hide (Default)
 */
export const MiniExpandBehaviorHide: Story = {
  render: () => {
    const [state, setState] = useState<DrawerState>('mini');

    const menuWithChildren: SidebarMenuItem[] = [
      {
        id: 'home',
        label: 'Home',
        icon: <HomeIcon />,
        path: '/',
      },
      {
        id: 'products',
        label: 'Products',
        icon: <ShoppingCartIcon />,
        children: [
          { id: 'products-all', label: 'All Products', icon: <CategoryIcon /> },
          {
            id: 'products-electronics',
            label: 'Electronics',
            icon: <SmartphoneIcon />,
          },
          { id: 'products-clothing', label: 'Clothing', icon: <StoreIcon /> },
        ],
      },
      {
        id: 'reports',
        label: 'Reports',
        icon: <AssessmentIcon />,
        path: '/reports',
      },
      {
        id: 'settings',
        label: 'Settings',
        icon: <SettingsIcon />,
        path: '/settings',
      },
    ];

    return (
      <Box sx={{ display: 'flex', height: '500px' }}>
        <Sidebar
          items={menuWithChildren}
          activeItemId="products-electronics"
          state={state}
          onStateChange={setState}
          variant="permanent"
          miniExpandBehavior="hide"
          header={<Typography variant="h6">Hide Behavior</Typography>}
        />
        <Box sx={{ flexGrow: 1, p: 3, bgcolor: 'grey.50' }}>
          <Typography variant="h5">Mini Mode Behavior: Hide</Typography>
          <Typography paragraph>
            Current state: <strong>{state}</strong>
          </Typography>
          <Typography paragraph>
            <strong>Behavior Description:</strong>
          </Typography>
          <Typography paragraph component="div">
            <ul>
              <li>
                In mini mode, items with submenus completely hide their children
              </li>
              <li>Clicking on items with submenus has no effect</li>
              <li>This is the default behavior (miniExpandBehavior="hide")</li>
              <li>Toggle to open mode to see the full submenu</li>
            </ul>
          </Typography>
          <Typography paragraph>
            Click the toggle button to switch to open mode and view the Products
            submenu.
          </Typography>
        </Box>
      </Box>
    );
  },
};

/**
 * Mini mode behavior - Popover
 */
export const MiniExpandBehaviorPopover: Story = {
  render: () => {
    const [state, setState] = useState<DrawerState>('mini');

    const menuWithChildren: SidebarMenuItem[] = [
      {
        id: 'home',
        label: 'Home',
        icon: <HomeIcon />,
        path: '/',
      },
      {
        id: 'products',
        label: 'Products',
        icon: <ShoppingCartIcon />,
        children: [
          { id: 'products-all', label: 'All Products', icon: <CategoryIcon /> },
          {
            id: 'products-electronics',
            label: 'Electronics',
            icon: <SmartphoneIcon />,
          },
          { id: 'products-clothing', label: 'Clothing', icon: <StoreIcon /> },
        ],
      },
      {
        id: 'files',
        label: 'Files',
        icon: <FolderIcon />,
        children: [
          { id: 'files-documents', label: 'Documents', icon: <FileIcon /> },
          { id: 'files-images', label: 'Images', icon: <ImageIcon /> },
          { id: 'files-videos', label: 'Videos', icon: <VideoIcon /> },
        ],
      },
      {
        id: 'reports',
        label: 'Reports',
        icon: <AssessmentIcon />,
        path: '/reports',
      },
      {
        id: 'settings',
        label: 'Settings',
        icon: <SettingsIcon />,
        path: '/settings',
      },
    ];

    return (
      <Box sx={{ display: 'flex', height: '500px' }}>
        <Sidebar
          items={menuWithChildren}
          activeItemId="products-electronics"
          state={state}
          onStateChange={setState}
          variant="permanent"
          miniExpandBehavior="popover"
          header={<Typography variant="h6">Popover Behavior</Typography>}
        />
        <Box sx={{ flexGrow: 1, p: 3, bgcolor: 'grey.50' }}>
          <Typography variant="h5">Mini Mode Behavior: Popover</Typography>
          <Typography paragraph>
            Current state: <strong>{state}</strong>
          </Typography>
          <Typography paragraph>
            <strong>Behavior Description:</strong>
          </Typography>
          <Typography paragraph component="div">
            <ul>
              <li>In mini mode, hover over items with submenus</li>
              <li>A floating menu appears on the right showing child items</li>
              <li>
                This is the industry best practice
                (miniExpandBehavior="popover")
              </li>
              <li>
                Provides the best user experience without expanding the entire
                Sidebar
              </li>
              <li>Try hovering over the Products or Files icons</li>
            </ul>
          </Typography>
        </Box>
      </Box>
    );
  },
};

/**
 * Mini mode behavior - Temporary Expand
 */
export const MiniExpandBehaviorExpand: Story = {
  render: () => {
    const [state, setState] = useState<DrawerState>('mini');

    const menuWithChildren: SidebarMenuItem[] = [
      {
        id: 'home',
        label: 'Home',
        icon: <HomeIcon />,
        onClick: () => alert('Home clicked'),
      },
      {
        id: 'products',
        label: 'Products',
        icon: <ShoppingCartIcon />,
        children: [
          {
            id: 'products-all',
            label: 'All Products',
            icon: <CategoryIcon />,
            onClick: () => alert('All Products clicked'),
          },
          {
            id: 'products-electronics',
            label: 'Electronics',
            icon: <SmartphoneIcon />,
            onClick: () => alert('Electronics clicked'),
          },
          {
            id: 'products-clothing',
            label: 'Clothing',
            icon: <StoreIcon />,
            onClick: () => alert('Clothing clicked'),
          },
        ],
      },
      {
        id: 'files',
        label: 'Files',
        icon: <FolderIcon />,
        children: [
          {
            id: 'files-documents',
            label: 'Documents',
            icon: <FileIcon />,
            onClick: () => alert('Documents clicked'),
          },
          {
            id: 'files-images',
            label: 'Images',
            icon: <ImageIcon />,
            onClick: () => alert('Images clicked'),
          },
          {
            id: 'files-videos',
            label: 'Videos',
            icon: <VideoIcon />,
            onClick: () => alert('Videos clicked'),
          },
        ],
      },
      {
        id: 'reports',
        label: 'Reports',
        icon: <AssessmentIcon />,
        onClick: () => alert('Reports clicked'),
      },
      {
        id: 'settings',
        label: 'Settings',
        icon: <SettingsIcon />,
        onClick: () => alert('Settings clicked'),
      },
    ];

    return (
      <Box sx={{ display: 'flex', height: '500px' }}>
        <Sidebar
          items={menuWithChildren}
          activeItemId="products-electronics"
          state={state}
          onStateChange={setState}
          variant="permanent"
          miniExpandBehavior="expand"
          header={<Typography variant="h6">Expand Behavior</Typography>}
        />
        <Box sx={{ flexGrow: 1, p: 3, bgcolor: 'grey.50' }}>
          <Typography variant="h5">
            Mini Mode Behavior: Temporary Expand
          </Typography>
          <Typography paragraph>
            Current state: <strong>{state}</strong>
          </Typography>
          <Typography paragraph>
            <strong>Behavior Description:</strong>
          </Typography>
          <Typography paragraph component="div">
            <ul>
              <li>In mini mode, click on items with submenus</li>
              <li>The Sidebar temporarily expands fully to show the submenu</li>
              <li>
                After clicking any child item, it automatically returns to mini
                mode
              </li>
              <li>This is the miniExpandBehavior="expand" behavior</li>
              <li>Try clicking the Products or Files icons in mini mode</li>
            </ul>
          </Typography>
          <Typography paragraph>
            After clicking any submenu item, the Sidebar will automatically
            collapse back to mini mode.
          </Typography>
        </Box>
      </Box>
    );
  },
};

/**
 * Floating toggle button outside sidebar
 */
export const FloatingToggleButton: Story = {
  render: () => {
    const [state, setState] = useState<DrawerState>('open');

    return (
      <Box sx={{ display: 'flex', height: '500px', position: 'relative' }}>
        <Sidebar
          items={menuItems.slice(0, 5)}
          activeItemId="dashboard"
          state={state}
          onStateChange={setState}
          variant="permanent"
          header={<Typography variant="h6">Menu</Typography>}
          showToggleButton={false}
        />
        {/* Custom floating toggle button */}
        <IconButton
          onClick={() => setState(state === 'mini' ? 'open' : 'mini')}
          sx={{
            position: 'absolute',
            left: state === 'mini' ? 48 : 224,
            top: 16,
            zIndex: 1300,
            bgcolor: 'primary.main',
            color: 'white',
            boxShadow: 3,
            '&:hover': {
              bgcolor: 'primary.dark',
            },
            transition: 'left 0.3s',
          }}
        >
          {state === 'mini' ? (
            <KeyboardArrowRightIcon />
          ) : (
            <KeyboardArrowLeftIcon />
          )}
        </IconButton>
        <Box sx={{ flexGrow: 1, p: 3, bgcolor: 'grey.50' }}>
          <Typography variant="h5">Floating Toggle Button</Typography>
          <Typography paragraph>
            Places the toggle button outside the Sidebar, creating a floating
            effect.
          </Typography>
          <Typography>
            By setting showToggleButton=false and implementing your own custom
            toggle button.
          </Typography>
        </Box>
      </Box>
    );
  },
};
