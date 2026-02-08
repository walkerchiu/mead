'use client';

import { ReactNode } from 'react';
import {
  AppBar,
  Toolbar,
  Typography,
  IconButton,
  Box,
  Link as MuiLink,
  Divider,
} from '@mui/material';
import { ArrowBack } from '@mui/icons-material';
import Link from 'next/link';
import { useRouter } from '@/i18n/routing';
import { useTranslations } from 'next-intl';
import {
  NotificationMenu,
  LanguageSwitcher,
  UserMenu,
  SettingsMenu,
  createUserMenuItems,
  createSettingsMenuItems,
  type Notification,
  type UserMenuItem,
  type SettingsMenuItem,
} from '@/components/atoms';

export interface MainAppBarProps {
  /**
   * Page title text
   */
  title?: string;
  /**
   * Logo element (ReactNode, e.g., image or custom element)
   */
  logo?: ReactNode;
  /**
   * Link URL for title/logo (optional)
   */
  titleLink?: string;
  /**
   * Whether to show back button (default: false)
   */
  showBackButton?: boolean;
  /**
   * Back path (default: /dashboard)
   */
  backPath?: string;

  // User related
  /**
   * User information
   */
  user?: {
    name: string;
    email?: string;
    avatar?: string;
    role?: string;
    status?: 'online' | 'away' | 'busy' | 'offline';
  };

  // Notification related
  /**
   * Notification list
   */
  notifications?: Notification[];
  /**
   * Unread notification count
   */
  unreadNotificationCount?: number;
  /**
   * Callback when notification is clicked
   */
  onNotificationClick?: (notification: Notification) => void;
  /**
   * Callback for mark all as read
   */
  onMarkAllNotificationsRead?: () => void;
  /**
   * Callback for view all notifications
   */
  onViewAllNotifications?: () => void;
  /**
   * Callback for clear all notifications
   */
  onClearAllNotifications?: () => void;

  // Settings related
  /**
   * Current theme
   */
  currentTheme?: 'light' | 'dark' | 'system';
  /**
   * Callback when theme changes
   */
  onThemeChange?: (theme: 'light' | 'dark' | 'system') => void;
  /**
   * Callback when help is clicked
   */
  onHelpClick?: () => void;
  /**
   * Callback when about is clicked
   */
  onAboutClick?: () => void;

  // User actions
  /**
   * Callback when account settings is clicked
   */
  onAccountClick?: () => void;
  /**
   * Callback when profile is clicked
   */
  onProfileClick?: () => void;
  /**
   * Callback when security settings is clicked
   */
  onSecurityClick?: () => void;
  /**
   * Callback when logout is clicked
   */
  onLogout?: () => void;
  /**
   * Account settings URL (default: /settings/account)
   */
  accountUrl?: string;
  /**
   * Profile URL (default: /settings/profile)
   */
  profileUrl?: string;
  /**
   * Security settings URL (default: /settings/security)
   */
  securityUrl?: string;

  // Display control
  /**
   * Whether to show notification feature (default: true)
   */
  showNotifications?: boolean;
  /**
   * Whether to show user menu (default: true)
   */
  showUserMenu?: boolean;
  /**
   * Whether to show settings menu (default: true)
   */
  showSettings?: boolean;
  /**
   * Whether to show user name in UserMenu (default: false, responsive)
   */
  showUserName?: boolean;
  /**
   * Whether to show user status indicator (default: false)
   */
  showUserStatus?: boolean;
  /**
   * Whether to use dividers between notification, user, and settings buttons (default: false)
   */
  useButtonDividers?: boolean;
  /**
   * Whether to show divider before language switcher (default: true)
   */
  separateLanguageSwitcher?: boolean;
  /**
   * User menu uses pure icon mode (unified style with other icons, default: false)
   */
  userIconMode?: boolean;
  /**
   * Custom content to the right of title (between title and right-side buttons)
   */
  centerContent?: ReactNode;
  /**
   * Extra action buttons to the left of notification button (between left content and right-side buttons)
   */
  extraActions?: ReactNode;
}

/**
 * Unified application navigation bar component
 * Includes title/Logo, notification center, language switcher, user menu, and settings menu
 * Optional back button and hyperlink functionality
 */
export function MainAppBar({
  title,
  logo,
  titleLink,
  showBackButton = false,
  backPath = '/dashboard',
  user,
  notifications = [],
  unreadNotificationCount = 0,
  onNotificationClick,
  onMarkAllNotificationsRead,
  onViewAllNotifications,
  onClearAllNotifications,
  currentTheme = 'system',
  onThemeChange,
  onHelpClick,
  onAboutClick,
  onAccountClick,
  onProfileClick,
  onSecurityClick,
  onLogout,
  accountUrl,
  profileUrl,
  securityUrl,
  showNotifications = true,
  showUserMenu = true,
  showSettings = true,
  showUserName = false,
  showUserStatus = false,
  useButtonDividers = false,
  separateLanguageSwitcher = true,
  userIconMode = false,
  centerContent,
  extraActions,
}: MainAppBarProps) {
  const router = useRouter();
  const tUser = useTranslations('components.userMenu');
  const tSettings = useTranslations('components.settingsMenu');

  const handleBack = () => {
    router.push(backPath);
  };

  // Create UserMenu items (using i18n labels)
  const userMenuItems: UserMenuItem[] = createUserMenuItems({
    onAccountClick,
    onProfileClick,
    onSecurityClick,
    onLogout,
    accountUrl,
    profileUrl,
    securityUrl,
    accountLabel: tUser('account'),
    profileLabel: tUser('profile'),
    securityLabel: tUser('security'),
    logoutLabel: tUser('logout'),
  });

  // Create SettingsMenu items (using i18n labels)
  const settingsMenuItems: SettingsMenuItem[] = createSettingsMenuItems({
    onHelpClick,
    onAboutClick,
    helpLabel: tSettings('help'),
    aboutLabel: tSettings('about'),
  });

  // Render title/Logo content
  const renderTitleContent = () => {
    const content = (
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
        {logo}
        {title && (
          <Typography variant="h6" component="span">
            {title}
          </Typography>
        )}
      </Box>
    );

    // If link is set, wrap with Link
    if (titleLink) {
      return (
        <MuiLink
          component={Link}
          href={titleLink}
          sx={{
            color: 'inherit',
            textDecoration: 'none',
            display: 'flex',
            alignItems: 'center',
            '&:hover': {
              opacity: 0.8,
            },
          }}
        >
          {content}
        </MuiLink>
      );
    }

    return content;
  };

  return (
    <AppBar position="static">
      <Toolbar>
        {/* Left: Back button + Logo + Title */}
        {showBackButton && (
          <IconButton
            edge="start"
            color="inherit"
            onClick={handleBack}
            sx={{ mr: 2 }}
            aria-label="back"
          >
            <ArrowBack />
          </IconButton>
        )}

        {/* Title area (left side) */}
        {(logo || title) && (
          <Box sx={{ flexGrow: 0 }}>{renderTitleContent()}</Box>
        )}

        {/* Center custom content */}
        {centerContent && (
          <Box
            sx={{ flexGrow: 0, mx: 2, display: 'flex', alignItems: 'center' }}
          >
            {centerContent}
          </Box>
        )}

        {/* Spacer */}
        <Box sx={{ flexGrow: 1 }} />

        {/* Extra action buttons */}
        {extraActions && (
          <Box sx={{ mr: 2, display: 'flex', alignItems: 'center' }}>
            {extraActions}
          </Box>
        )}

        {/* Right: Feature button group */}
        <Box
          sx={{
            display: 'flex',
            gap: { xs: 0.5, sm: 1 },
            alignItems: 'center',
          }}
        >
          {/* Group 1: Notifications */}
          {showNotifications && (
            <NotificationMenu
              color="inherit"
              size="medium"
              unreadCount={unreadNotificationCount}
              notifications={notifications}
              onNotificationClick={onNotificationClick}
              onMarkAllAsRead={onMarkAllNotificationsRead}
              onViewAll={onViewAllNotifications}
              onClearAll={onClearAllNotifications}
            />
          )}

          {/* Divider 1 (optional) */}
          {useButtonDividers && showNotifications && showUserMenu && user && (
            <Divider
              orientation="vertical"
              flexItem
              sx={{
                mx: { xs: 0.5, sm: 1 },
                borderColor: 'rgba(255, 255, 255, 0.3)',
              }}
            />
          )}

          {/* Group 2: User menu */}
          {showUserMenu && user && (
            <UserMenu
              color="inherit"
              size="medium"
              user={user}
              showName={showUserName}
              showStatus={showUserStatus}
              menuItems={userMenuItems}
              iconMode={userIconMode}
            />
          )}

          {/* Divider 2 (optional) */}
          {useButtonDividers && showUserMenu && user && showSettings && (
            <Divider
              orientation="vertical"
              flexItem
              sx={{
                mx: { xs: 0.5, sm: 1 },
                borderColor: 'rgba(255, 255, 255, 0.3)',
              }}
            />
          )}

          {/* Group 3: System settings */}
          {showSettings && (
            <SettingsMenu
              color="inherit"
              size="medium"
              showThemeToggle={!!onThemeChange}
              currentTheme={currentTheme}
              onThemeChange={onThemeChange}
              menuItems={settingsMenuItems}
            />
          )}

          {/* Divider before language switcher (optional, default shown) */}
          {separateLanguageSwitcher && (
            <Divider
              orientation="vertical"
              flexItem
              sx={{
                mx: { xs: 0.5, sm: 1 },
                borderColor: 'rgba(255, 255, 255, 0.3)',
              }}
            />
          )}

          {/* Group 4: Language switcher */}
          <LanguageSwitcher color="inherit" size="medium" />
        </Box>
      </Toolbar>
    </AppBar>
  );
}
