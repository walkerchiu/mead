import type { Meta, StoryObj } from '@storybook/nextjs';
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
import { DrawerState } from '@/components/organisms';

/**
 * Sidebar 元件是以 Drawer 為基礎的應用程式側邊欄，提供導覽功能。
 *
 * **功能特性**：
 * - 支援完全展開與半展開（mini）模式
 * - 迷你模式僅顯示圖示，滑鼠移入時顯示工具提示
 * - 支援可展開的子選單，迷你模式下有三種行為：
 *   - 'hide'：完全隱藏子選單（預設）
 *   - 'popover'：滑鼠移入時顯示浮動選單
 *   - 'expand'：點擊時暫時展開 Sidebar
 * - 響應式設計：行動裝置上自動切換為 temporary 模式
 * - 啟用中的項目自動高亮
 * - 支援自訂頁首與頁尾
 * - 支援靠左與靠右的錨定位置
 *
 * **使用情境**：
 * - 應用程式主導覽
 * - HQ 儀表板側邊欄
 * - 多功能面板
 */
const meta = {
  title: 'Shared/Organisms/Sidebar',
  component: Sidebar,
  parameters: {
    layout: 'fullscreen',
    docs: {
      description: {
        component: '應用程式側邊欄元件，含導覽選單，支援響應式設計與迷你模式。',
      },
    },
  },
  tags: ['autodocs'],
  argTypes: {
    state: {
      control: 'select',
      options: ['closed', 'mini', 'open'],
      description: '顯示狀態',
      table: {
        defaultValue: { summary: 'open' },
      },
    },
    variant: {
      control: 'select',
      options: ['temporary', 'persistent', 'permanent'],
      description: 'Drawer 變體',
      table: {
        defaultValue: { summary: 'persistent' },
      },
    },
    anchor: {
      control: 'select',
      options: ['left', 'right'],
      description: '螢幕側邊',
      table: {
        defaultValue: { summary: 'left' },
      },
    },
    responsive: {
      control: 'boolean',
      description: '啟用響應式行為',
      table: {
        defaultValue: { summary: 'true' },
      },
    },
    miniExpandBehavior: {
      control: 'select',
      options: ['hide', 'popover', 'expand'],
      description: '迷你模式下可展開選單的行為',
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
 * open 狀態的預設側邊欄
 */
export const Default: Story = {
  render: (args) => (
    <Box sx={{ display: 'flex', height: '500px' }}>
      <Sidebar {...args} />
      <Box sx={{ flexGrow: 1, p: 3, bgcolor: 'grey.50' }}>
        <Typography variant="h5">主要內容</Typography>
        <Typography>預設側邊欄，選單項目為完整寬度。</Typography>
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
 * Mini（收合）狀態 - 僅顯示圖示
 */
export const Mini: Story = {
  render: (args) => (
    <Box sx={{ display: 'flex', height: '500px' }}>
      <Sidebar {...args} />
      <Box sx={{ flexGrow: 1, p: 3, bgcolor: 'grey.50' }}>
        <Typography variant="h5">主要內容</Typography>
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
 * Permanent 側邊欄 - 恆常顯示
 */
export const Permanent: Story = {
  render: (args) => (
    <Box sx={{ display: 'flex', height: '500px' }}>
      <Sidebar {...args} />
      <Box sx={{ flexGrow: 1, p: 3, bgcolor: 'grey.50' }}>
        <Typography variant="h5">主要內容</Typography>
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
 * 靠右錨定的側邊欄
 */
export const RightAnchor: Story = {
  render: (args) => (
    <Box sx={{ display: 'flex', height: '500px' }}>
      <Box sx={{ flexGrow: 1, p: 3, bgcolor: 'grey.50' }}>
        <Typography variant="h5">主要內容</Typography>
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
 * 含自訂頁首與頁尾
 */
export const WithHeaderFooter: Story = {
  render: (args) => (
    <Box sx={{ display: 'flex', height: '500px' }}>
      <Sidebar {...args} />
      <Box sx={{ flexGrow: 1, p: 3, bgcolor: 'grey.50' }}>
        <Typography variant="h5">主要內容</Typography>
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
 * 單層級的簡單可展開選單
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
          header={<Typography variant="h6">簡易選單</Typography>}
        />
        <Box sx={{ flexGrow: 1, p: 3, bgcolor: 'grey.50' }}>
          <Typography variant="h5">簡易可展開選單</Typography>
          <Typography paragraph>
            目前狀態：<strong>{state}</strong>
          </Typography>
          <Typography paragraph>
            點選「Products」即可展開並檢視子選單項目。
          </Typography>
          <Typography paragraph>
            使用切換按鈕即可切換至迷你模式－可展開選單會
            收合，並僅以圖示搭配工具提示顯示。
          </Typography>
          <Typography>切換時，展開／收合圖示會平滑旋轉。</Typography>
        </Box>
      </Box>
    );
  },
};

/**
 * 多層級可展開選單（巢狀）
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
          header={<Typography variant="h6">檔案管理員</Typography>}
        />
        <Box sx={{ flexGrow: 1, p: 3, bgcolor: 'grey.50' }}>
          <Typography variant="h5">多層級可展開選單</Typography>
          <Typography paragraph>
            目前狀態：<strong>{state}</strong>
          </Typography>
          <Typography paragraph>具有多層深度的巢狀子選單。</Typography>
          <Typography paragraph>
            請留意子項目如何以縮排呈現層級結構。
          </Typography>
          <Typography paragraph>
            「Files」選單已設為 defaultExpanded，因此會 自動展開。
          </Typography>
          <Typography>
            切換至迷你模式－所有子選單都會隱藏，僅以工具提示
            顯示父層圖示。將滑鼠移至圖示上即可檢視完整的選單 結構。
          </Typography>
        </Box>
      </Box>
    );
  },
};

/**
 * 迷你模式行為 - Hide（預設）
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
          header={<Typography variant="h6">Hide 行為</Typography>}
        />
        <Box sx={{ flexGrow: 1, p: 3, bgcolor: 'grey.50' }}>
          <Typography variant="h5">迷你模式行為：Hide</Typography>
          <Typography paragraph>
            目前狀態：<strong>{state}</strong>
          </Typography>
          <Typography paragraph>
            <strong>行為說明：</strong>
          </Typography>
          <Typography paragraph component="div">
            <ul>
              <li>在迷你模式下，含子選單的項目會完全隱藏其子項目</li>
              <li>點選含子選單的項目不會有任何作用</li>
              <li>這是預設行為（miniExpandBehavior="hide"）</li>
              <li>切換至展開模式即可檢視完整的子選單</li>
            </ul>
          </Typography>
          <Typography paragraph>
            點選切換按鈕即可切換至展開模式，並檢視 Products 子選單。
          </Typography>
        </Box>
      </Box>
    );
  },
};

/**
 * 迷你模式行為 - Popover
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
          header={<Typography variant="h6">Popover 行為</Typography>}
        />
        <Box sx={{ flexGrow: 1, p: 3, bgcolor: 'grey.50' }}>
          <Typography variant="h5">迷你模式行為：Popover</Typography>
          <Typography paragraph>
            目前狀態：<strong>{state}</strong>
          </Typography>
          <Typography paragraph>
            <strong>行為說明：</strong>
          </Typography>
          <Typography paragraph component="div">
            <ul>
              <li>在迷你模式下，將滑鼠移至含子選單的項目上</li>
              <li>右側會出現浮動選單，顯示子項目</li>
              <li>這是業界最佳實踐 （miniExpandBehavior="popover"）</li>
              <li>在不展開整個 Sidebar 的情況下，提供最佳的 使用者體驗</li>
              <li>試著將滑鼠移至 Products 或 Files 圖示上</li>
            </ul>
          </Typography>
        </Box>
      </Box>
    );
  },
};

/**
 * 迷你模式行為 - Temporary Expand
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
          header={<Typography variant="h6">Expand 行為</Typography>}
        />
        <Box sx={{ flexGrow: 1, p: 3, bgcolor: 'grey.50' }}>
          <Typography variant="h5">迷你模式行為：Temporary Expand</Typography>
          <Typography paragraph>
            目前狀態：<strong>{state}</strong>
          </Typography>
          <Typography paragraph>
            <strong>行為說明：</strong>
          </Typography>
          <Typography paragraph component="div">
            <ul>
              <li>在迷你模式下，點選含子選單的項目</li>
              <li>Sidebar 會暫時完全展開以顯示子選單</li>
              <li>點選任一子項目後，會自動回到迷你 模式</li>
              <li>這是 miniExpandBehavior="expand" 的行為</li>
              <li>試著在迷你模式下點選 Products 或 Files 圖示</li>
            </ul>
          </Typography>
          <Typography paragraph>
            點選任一子選單項目後，Sidebar 會自動 收合回迷你模式。
          </Typography>
        </Box>
      </Box>
    );
  },
};

/**
 * 側邊欄外的浮動切換按鈕
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
          header={<Typography variant="h6">選單</Typography>}
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
          <Typography variant="h5">浮動切換按鈕</Typography>
          <Typography paragraph>
            將切換按鈕置於 Sidebar 之外，營造浮動 效果。
          </Typography>
          <Typography>
            做法是設定 showToggleButton=false，並自行實作你的 自訂切換按鈕。
          </Typography>
        </Box>
      </Box>
    );
  },
};

/**
 * 迷你模式比較
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
 * 左側與右側側邊欄並存
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
 * 互動範例 - 在各狀態間切換
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
 * 含 AppBar 與響應式行為的完整應用程式版面
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
                使用者名稱
              </Typography>
            </Box>
          }
        />

        {/* Main Content */}
        <Box component="main" sx={{ flexGrow: 1, p: 3, bgcolor: 'grey.50' }}>
          <Toolbar />
          <Typography variant="h4" gutterBottom>
            {items.find((i) => i.id === activeId)?.label || '歡迎'}
          </Typography>
          <Typography paragraph>
            這是完整響應式應用程式版面配置的範例。
          </Typography>
          <Typography paragraph>
            <strong>響應式行為：</strong>
          </Typography>
          <ul>
            <li>桌面：可在展開與迷你模式之間切換的常駐抽屜</li>
            <li>行動裝置：覆蓋於內容上的臨時抽屜</li>
            <li>
              目前螢幕尺寸： <strong>{isMobile ? '行動裝置' : '桌面'}</strong>
            </li>
          </ul>
          <Typography>試著調整瀏覽器視窗大小，即可觀察響應式行為！</Typography>
        </Box>
      </Box>
    );
  },
};
