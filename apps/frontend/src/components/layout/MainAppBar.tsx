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
   * 頁面標題
   */
  title?: string;
  /**
   * Logo 元素（ReactNode，例如圖片或自訂元素）
   */
  logo?: ReactNode;
  /**
   * 標題/Logo 的超連結路徑（點擊後導航的位置）
   */
  titleLink?: string;
  /**
   * 是否顯示返回按鈕（預設：false）
   */
  showBackButton?: boolean;
  /**
   * 返回路徑（預設：/dashboard）
   */
  backPath?: string;

  // 使用者相關
  /**
   * 使用者資訊
   */
  user?: {
    name: string;
    email?: string;
    avatar?: string;
    role?: string;
    status?: 'online' | 'away' | 'busy' | 'offline';
  };

  // 通知相關
  /**
   * 通知列表
   */
  notifications?: Notification[];
  /**
   * 未讀通知數量
   */
  unreadNotificationCount?: number;
  /**
   * 點擊通知時的回調
   */
  onNotificationClick?: (notification: Notification) => void;
  /**
   * 全部標記為已讀的回調
   */
  onMarkAllNotificationsRead?: () => void;
  /**
   * 查看全部通知的回調
   */
  onViewAllNotifications?: () => void;
  /**
   * 清除全部通知的回調
   */
  onClearAllNotifications?: () => void;

  // 設定相關
  /**
   * 當前主題
   */
  currentTheme?: 'light' | 'dark' | 'system';
  /**
   * 主題變更的回調
   */
  onThemeChange?: (theme: 'light' | 'dark' | 'system') => void;
  /**
   * 說明文件點擊的回調
   */
  onHelpClick?: () => void;
  /**
   * 關於點擊的回調
   */
  onAboutClick?: () => void;

  // 使用者操作
  /**
   * 帳號設定點擊的回調
   */
  onAccountClick?: () => void;
  /**
   * 個人資料點擊的回調
   */
  onProfileClick?: () => void;
  /**
   * 安全設定點擊的回調
   */
  onSecurityClick?: () => void;
  /**
   * 登出的回調
   */
  onLogout?: () => void;
  /**
   * 帳號設定 URL（預設：/settings/account）
   */
  accountUrl?: string;
  /**
   * 個人資料 URL（預設：/settings/profile）
   */
  profileUrl?: string;
  /**
   * 安全設定 URL（預設：/settings/security）
   */
  securityUrl?: string;

  // 顯示控制
  /**
   * 是否顯示通知功能（預設：true）
   */
  showNotifications?: boolean;
  /**
   * 是否顯示使用者選單（預設：true）
   */
  showUserMenu?: boolean;
  /**
   * 是否顯示設定選單（預設：true）
   */
  showSettings?: boolean;
  /**
   * 是否在 UserMenu 顯示使用者名稱（預設：false，響應式）
   */
  showUserName?: boolean;
  /**
   * 是否顯示使用者狀態指示器（預設：false）
   */
  showUserStatus?: boolean;
  /**
   * 是否在通知、使用者、設定按鈕之間使用分隔線（預設：false）
   */
  useButtonDividers?: boolean;
  /**
   * 是否在語言切換前顯示分隔線（預設：true）
   */
  separateLanguageSwitcher?: boolean;
  /**
   * 使用者選單使用純圖示模式（與其他圖示統一風格，預設：false）
   */
  userIconMode?: boolean;
}

/**
 * 統一的應用程式導覽列元件
 * 包含標題/Logo、通知中心、語言切換、使用者選單、設定選單
 * 可選的返回按鈕和超連結功能
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
}: MainAppBarProps) {
  const router = useRouter();
  const tUser = useTranslations('components.userMenu');
  const tSettings = useTranslations('components.settingsMenu');

  const handleBack = () => {
    router.push(backPath);
  };

  // 創建 UserMenu items (使用 i18n 標籤)
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

  // 創建 SettingsMenu items (使用 i18n 標籤)
  const settingsMenuItems: SettingsMenuItem[] = createSettingsMenuItems({
    onHelpClick,
    onAboutClick,
    helpLabel: tSettings('help'),
    aboutLabel: tSettings('about'),
  });

  // 渲染標題/Logo 內容
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

    // 如果有設定連結，使用 Link 包裹
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
        {/* 左側：返回按鈕 + Logo + 標題 */}
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

        <Box sx={{ flexGrow: 1 }}>{renderTitleContent()}</Box>

        {/* 右側：功能按鈕群 */}
        <Box
          sx={{
            display: 'flex',
            gap: { xs: 0.5, sm: 1 },
            alignItems: 'center',
          }}
        >
          {/* 第一組：通知 */}
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

          {/* 分隔線 1（可選） */}
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

          {/* 第二組：使用者選單 */}
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

          {/* 分隔線 2（可選） */}
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

          {/* 第三組：系統設定 */}
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

          {/* 語言切換前的分隔線（可選，預設顯示） */}
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

          {/* 第四組：語言切換 */}
          <LanguageSwitcher color="inherit" size="medium" />
        </Box>
      </Toolbar>
    </AppBar>
  );
}
