'use client';

import { ReactNode, useState } from 'react';
import { Box, useMediaQuery, useTheme } from '@mui/material';
import { MainAppBar } from '@/components/layout/MainAppBar';
import { Sidebar, SidebarMenuItem } from '@/components/molecules/Sidebar';
import { DrawerState } from '@/components/atoms/Drawer';
import type { Notification } from '@/components/atoms';

export interface DashboardLayoutProps {
  /**
   * Main content area
   */
  children: ReactNode;
  /**
   * Page title
   */
  title?: string;
  /**
   * AppBar Logo
   */
  logo?: ReactNode;
  /**
   * AppBar title link
   */
  titleLink?: string;
  /**
   * User information
   */
  user?: {
    name: string;
    email: string;
    avatar?: string;
    role?: string;
    status?: 'online' | 'offline' | 'busy';
  };
  /**
   * Sidebar menu items
   */
  sidebarItems: SidebarMenuItem[];
  /**
   * Current active sidebar item ID
   */
  activeSidebarItemId?: string;
  /**
   * Sidebar Header Content
   */
  sidebarHeader?: ReactNode;
  /**
   * Sidebar Footer Content
   */
  sidebarFooter?: ReactNode;
  /**
   * sidebar initial state
   */
  sidebarInitialState?: DrawerState;
  /**
   * sidebar width
   */
  sidebarWidth?: number;
  /**
   * notification list
   */
  notifications?: Notification[];
  /**
   * unread notifications count
   */
  unreadNotificationCount?: number;
  /**
   * display username
   */
  showUserName?: boolean;
  /**
   * display user status
   */
  showUserStatus?: boolean;
  /**
   * use icon mode
   */
  usericonMode?: boolean;
  /**
   * current theme
   */
  currentTheme?: 'light' | 'dark' | 'system';
  /**
   * theme change callback
   */
  onThemeChange?: (theme: 'light' | 'dark' | 'system') => void;
  /**
   * accountSettingscallback
   */
  onAccountClick?: () => void;
  /**
   * Profilecallback
   */
  onProfileClick?: () => void;
  /**
   * Security settingscallback
   */
  onSecurityClick?: () => void;
  /**
   * Logout callback
   */
  onLogout?: () => void;
  /**
   * Descriptioncallback
   */
  onHelpClick?: () => void;
  /**
   * about callback
   */
  onAboutClick?: () => void;
  /**
   * NotificationsClick callback
   */
  onNotificationClick?: (notification: Notification) => void;
  /**
   * mark all notifications as read
   */
  onMarkAllNotificationsRead?: () => void;
  /**
   * view all notifications
   */
  onViewAllNotifications?: () => void;
  /**
   * clear all notifications
   */
  onClearAllNotifications?: () => void;
  /**
   * sidebar background color
   */
  sidebarBgColor?: string;
  /**
   * Sidebar text color
   */
  sidebarColor?: string;
  /**
   * sidebar active item background color
   */
  sidebarActiveBackgroundColor?: string;
  /**
   * Sidebar hover item background color
   */
  sidebarHoverBackgroundColor?: string;
  /**
   * MainAppBar middlecustomContent（Titleright side）
   */
  centerContent?: ReactNode;
  /**
   * MainAppBar extraAction button（to the left of notification button）
   */
  extraActions?: ReactNode;
  /**
   * Sidebar toggleButtoncustomContent
   */
  sidebarToggleButtonContent?: ReactNode;
  /**
   * Sidebar toggle button style
   */
  sidebarToggleButtonSx?: import('@mui/material').SxProps<
    import('@mui/material').Theme
  >;
}

/**
 * DashboardLayout - Complete dashboard layout template
 *
 * Groupcollapse MainAppBar + Sidebar + Content Area
 *
 * Features：
 * - Responsive design（mobile versionautohidden Sidebar）
 * - Sidebar supports expansion/collapse
 * - fixed AppBar and Sidebar
 * - Main content areaAuto fill remaining space
 */
export function DashboardLayout({
  children,
  title,
  logo,
  titleLink,
  user,
  sidebarItems,
  activeSidebarItemId,
  sidebarHeader,
  sidebarFooter,
  sidebarInitialState = 'open',
  sidebarWidth = 240,
  notifications,
  unreadNotificationCount,
  showUserName = false,
  showUserStatus = false,
  usericonMode = true,
  currentTheme = 'light',
  onThemeChange,
  onAccountClick,
  onProfileClick,
  onSecurityClick,
  onLogout,
  onHelpClick,
  onAboutClick,
  onNotificationClick,
  onMarkAllNotificationsRead,
  onViewAllNotifications,
  onClearAllNotifications,
  sidebarBgColor,
  sidebarColor,
  sidebarActiveBackgroundColor,
  sidebarHoverBackgroundColor,
  centerContent,
  extraActions,
  sidebarToggleButtonContent,
  sidebarToggleButtonSx,
}: DashboardLayoutProps) {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const [sidebarState, setSidebarState] =
    useState<DrawerState>(sidebarInitialState);

  // calculate sidebar width
  const getSidebarWidth = () => {
    if (isMobile) return 0; // mobile version Sidebar Yes temporary，does not occupy space
    if (sidebarState === 'open') return sidebarWidth;
    if (sidebarState === 'mini') return 64;
    return 0;
  };

  const currentSidebarWidth = getSidebarWidth();

  return (
    <Box sx={{ display: 'flex', minHeight: '100vh' }}>
      {/* Sidebar */}
      <Sidebar
        items={sidebarItems}
        activeItemId={activeSidebarItemId}
        state={sidebarState}
        onStateChange={setSidebarState}
        variant="persistent"
        anchor="left"
        width={sidebarWidth}
        miniWidth={64}
        header={sidebarHeader}
        footer={sidebarFooter}
        responsive
        mobileBreakpoint="md"
        bgcolor={sidebarBgColor}
        color={sidebarColor}
        activeBackgroundColor={sidebarActiveBackgroundColor}
        hoverBackgroundColor={sidebarHoverBackgroundColor}
        toggleButtonContent={sidebarToggleButtonContent}
        toggleButtonSx={sidebarToggleButtonSx}
      />

      {/* Main Content Area */}
      <Box
        sx={{
          flexGrow: 1,
          display: 'flex',
          flexDirection: 'column',
          transition: theme.transitions.create(['width'], {
            easing: theme.transitions.easing.sharp,
            duration: theme.transitions.duration.leavingScreen,
          }),
        }}
      >
        {/* AppBar - fixed at top，widthaccording to Sidebar state auto adjust */}
        <Box
          sx={{
            position: 'fixed',
            top: 0,
            left: isMobile ? 0 : currentSidebarWidth,
            right: 0,
            zIndex: theme.zIndex.appBar,
            transition: theme.transitions.create(['left'], {
              easing: theme.transitions.easing.sharp,
              duration: theme.transitions.duration.leavingScreen,
            }),
          }}
        >
          <MainAppBar
            logo={logo}
            title={title}
            titleLink={titleLink}
            user={user}
            notifications={notifications}
            unreadNotificationCount={unreadNotificationCount}
            showUserName={showUserName}
            showUserStatus={showUserStatus}
            userIconMode={usericonMode}
            currentTheme={currentTheme}
            centerContent={centerContent}
            extraActions={extraActions}
            onThemeChange={onThemeChange}
            onAccountClick={onAccountClick}
            onProfileClick={onProfileClick}
            onSecurityClick={onSecurityClick}
            onLogout={onLogout}
            onHelpClick={onHelpClick}
            onAboutClick={onAboutClick}
            onNotificationClick={onNotificationClick}
            onMarkAllNotificationsRead={onMarkAllNotificationsRead}
            onViewAllNotifications={onViewAllNotifications}
            onClearAllNotifications={onClearAllNotifications}
          />
        </Box>

        {/* Content - Add paddingTop avoid being AppBar obstructed */}
        <Box
          component="main"
          sx={{
            flexGrow: 1,
            p: 3,
            pt: 11, // AppBar height (64px) + padding (24px)
            backgroundColor: theme.palette.background.default,
            minHeight: '100vh',
          }}
        >
          {children}
        </Box>
      </Box>
    </Box>
  );
}
