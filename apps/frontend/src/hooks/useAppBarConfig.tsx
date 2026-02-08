'use client';

import React, { useCallback, useEffect, useState, useMemo } from 'react';
import { useNavRouter as useRouter } from '@/i18n/use-nav-router';
import { useSnackbar } from 'notistack';
import { useTranslations } from 'next-intl';
import { Box } from '@mui/material';
import { getAccessToken, parseJwt, logout } from '@/lib/auth';
import { AccessScope } from '@/types/auth';
import { useCurrentUser } from './useCurrentUser';
import { useTheme } from './useTheme';
import { useNotifications } from './useNotifications';
import { Modal } from '@/components/organisms/Modal';
import { HelpContent } from '@/components/molecules/HelpContent';
import { AboutContent } from '@/components/molecules/AboutContent';
import { Help as HelpIcon, Info as InfoIcon } from '@mui/icons-material';
import type { MainAppBarProps } from '@/components/layout/MainAppBar';
import type { UnifiedNotification } from '@/types/notification';
import { fromGraphQLNotification } from '@/types/notification';

export type AppBarVariant = 'full' | 'simplified' | 'minimal';

export interface UseAppBarConfigOptions {
  /**
   * 頁面標題
   */
  title?: string;

  /**
   * 配置變體
   * - full: 完整功能（Dashboard 等主要頁面）
   * - simplified: 簡化版（設定頁面等）
   * - minimal: 最小化（認證頁面等）
   * @default 'full'
   */
  variant?: AppBarVariant;

  /**
   * 是否顯示返回按鈕
   */
  showBackButton?: boolean;

  /**
   * 返回路徑
   */
  backPath?: string;

  /**
   * 是否自動訂閱通知
   * @default true (for full), false (for simplified)
   */
  autoSubscribeNotifications?: boolean;

  /**
   * 是否顯示 logo
   * @default true
   */
  showLogo?: boolean;

  /**
   * 標題連結
   * @default '/dashboard'
   */
  titleLink?: string;

  /**
   * 是否顯示用戶名
   * @default true (for full), false (for simplified)
   */
  showUserName?: boolean;

  /**
   * 是否顯示用戶狀態
   * @default true (for full), false (for simplified)
   */
  showUserStatus?: boolean;
}

/**
 * 統一的 AppBar 配置 Hook
 * 提供一致的導覽列配置給所有頁面使用
 *
 * @example
 * ```tsx
 * // Dashboard - 完整功能
 * const appBarConfig = useAppBarConfig({
 *   variant: 'full',
 *   title: 'Dashboard',
 *   autoSubscribeNotifications: true,
 * });
 *
 * // Settings - 簡化版
 * const appBarConfig = useAppBarConfig({
 *   variant: 'simplified',
 *   title: 'Settings',
 * });
 *
 * // Auth - 最小化
 * const appBarConfig = useAppBarConfig({
 *   variant: 'minimal',
 *   title: 'Login',
 * });
 * ```
 */
export interface UseAppBarConfigResult extends MainAppBarProps {
  /**
   * Modal 元件（需要在頁面中渲染）
   */
  modals?: React.ReactNode;
}

export function useAppBarConfig(
  options: UseAppBarConfigOptions = {},
): UseAppBarConfigResult {
  const {
    title = '',
    variant = 'full',
    showBackButton = false,
    backPath = '/dashboard',
    showLogo = true,
    titleLink = '/dashboard',
    showUserName = variant === 'full',
    showUserStatus = variant === 'full',
    autoSubscribeNotifications,
  } = options;

  const router = useRouter();
  const { enqueueSnackbar } = useSnackbar();
  const t = useTranslations('pages.dashboard');
  const tCommon = useTranslations('common');
  const tHelpModal = useTranslations('components.helpModal');
  const tAboutModal = useTranslations('components.aboutModal');
  const { currentTheme, setTheme } = useTheme();
  const [isHQ, setIsHQ] = useState(false);
  const [userFromToken, setUserFromToken] = useState<{
    name: string;
    email: string;
  } | null>(null);
  const [helpModalOpen, setHelpModalOpen] = useState(false);
  const [aboutModalOpen, setAboutModalOpen] = useState(false);

  // 整合通知功能
  const {
    notifications: gqlNotifications,
    unreadCount,
    markAsRead,
    markAllAsRead,
    deleteReadNotifications,
  } = useNotifications({
    limit: 20,
    autoSubscribe: autoSubscribeNotifications ?? variant === 'full',
  });

  // 取得當前用戶資訊（minimal 模式不需要）
  const { user: currentUser } = useCurrentUser({
    skip: variant === 'minimal',
  });

  // 檢查管理員權限和設置 token 用戶 - 使用輪詢機制確保 token 可用後立即設置
  useEffect(() => {
    if (variant === 'minimal') return; // minimal 模式不需要用戶信息

    const updateUserFromToken = () => {
      const token = getAccessToken();
      if (token) {
        const payload = parseJwt(token);
        const scopes = (payload?.accessScopes as string[]) || [];
        const hasHQScope = scopes.includes(AccessScope.HQ_SCOPE);
        setIsHQ(hasHQScope);

        // 從 token 取得基本用戶資訊作為 fallback
        if (payload?.email) {
          setUserFromToken({
            name: (payload.email as string).split('@')[0],
            email: payload.email as string,
          });
          return true; // 表示成功設置
        }
      }
      return false; // 表示尚未成功設置
    };

    // 立即執行一次
    const success = updateUserFromToken();

    // 如果初始設置失敗，使用輪詢機制等待 token 可用（最多 5 秒）
    if (!success) {
      let attempts = 0;
      const maxAttempts = 10; // 10 次 * 500ms = 5 秒

      const pollInterval = setInterval(() => {
        attempts++;
        const pollSuccess = updateUserFromToken();
        if (pollSuccess || attempts >= maxAttempts) {
          clearInterval(pollInterval);
        }
      }, 500);

      return () => clearInterval(pollInterval);
    }
  }, [variant]);

  // 使用 useMemo 穩定 displayUser，避免不必要的重新渲染
  const displayUser = useMemo(() => {
    // 優先使用 currentUser（GraphQL 查詢結果，更完整）
    // 回退到 userFromToken（快速可用，但數據較少）
    // 這確保一旦完整數據可用就使用它，避免來回切換
    if (currentUser) {
      return currentUser;
    }
    return userFromToken;
  }, [currentUser, userFromToken]);

  // Handlers
  const handleLogout = useCallback(async () => {
    await logout();
    enqueueSnackbar(t('loggedOut'), { variant: 'info' });
  }, [enqueueSnackbar, t]);

  const handleAccountClick = useCallback(() => {
    router.push('/settings/account');
  }, [router]);

  const handleProfileClick = useCallback(() => {
    router.push('/settings/profile');
  }, [router]);

  const handleSecurityClick = useCallback(() => {
    router.push('/settings/security');
  }, [router]);

  const handleTokensClick = useCallback(() => {
    router.push('/settings/tokens');
  }, [router]);

  const handleHelpClick = useCallback(() => {
    setHelpModalOpen(true);
  }, []);

  const handleAboutClick = useCallback(() => {
    setAboutModalOpen(true);
  }, []);

  const handleViewAllNotifications = useCallback(() => {
    router.push('/notifications');
  }, [router]);

  const handleNotificationClick = useCallback(
    (notification: UnifiedNotification) => {
      console.log('Notification clicked:', notification.id);
      // 標記為已讀
      markAsRead(notification.id);

      // 如果有 actionUrl，導航到指定 URL
      if (notification.actionUrl) {
        // 檢查是否為外部 URL
        if (
          notification.actionUrl.startsWith('http://') ||
          notification.actionUrl.startsWith('https://')
        ) {
          // 外部 URL：在新分頁開啟
          window.open(notification.actionUrl, '_blank', 'noopener,noreferrer');
        } else {
          // 內部路徑：使用 router 導航
          router.push(notification.actionUrl);
        }
      }
    },
    [markAsRead, router],
  );

  const handleMarkAllNotificationsRead = useCallback(() => {
    console.log('Mark all notifications as read');
    markAllAsRead();
  }, [markAllAsRead]);

  const handleClearAllNotifications = useCallback(() => {
    console.log('Clear all notifications');
    deleteReadNotifications();
  }, [deleteReadNotifications]);

  const handleNotificationSettingsClick = useCallback(() => {
    router.push('/settings/notifications');
  }, [router]);

  // Logo
  const logo = showLogo ? (
    <Box
      sx={{
        fontSize: '1.75rem',
        fontWeight: 'bold',
        color: 'white',
      }}
    >
      📊
    </Box>
  ) : undefined;

  // 基礎配置
  const baseConfig: MainAppBarProps = {
    logo,
    title,
    titleLink,
    showBackButton,
    backPath,

    // 主題配置（所有變體都支援）
    currentTheme,
    onThemeChange: setTheme,

    // 視覺配置
    separateLanguageSwitcher: true,
    useButtonDividers: false,
  };

  // Minimal 模式（認證頁面等）
  if (variant === 'minimal') {
    return {
      ...baseConfig,
      showNotifications: false,
      showUserMenu: false,
      showSettings: true, // 只顯示設定選單（主題切換）
      onHelpClick: handleHelpClick,
      onAboutClick: handleAboutClick,
      modals: (
        <>
          <Modal
            open={helpModalOpen}
            onClose={() => setHelpModalOpen(false)}
            title={tHelpModal('title')}
            maxWidth="md"
            icon={<HelpIcon color="primary" sx={{ fontSize: 40 }} />}
            actions={[
              {
                label: tCommon('close'),
                onClick: () => setHelpModalOpen(false),
                variant: 'contained',
                color: 'primary',
              },
            ]}
          >
            <HelpContent />
          </Modal>
          <Modal
            open={aboutModalOpen}
            onClose={() => setAboutModalOpen(false)}
            title={tAboutModal('title')}
            maxWidth="md"
            icon={<InfoIcon color="primary" sx={{ fontSize: 40 }} />}
            actions={[
              {
                label: tCommon('close'),
                onClick: () => setAboutModalOpen(false),
                variant: 'contained',
                color: 'primary',
              },
            ]}
          >
            <AboutContent />
          </Modal>
        </>
      ),
    };
  }

  // Full 或 Simplified 模式
  const userIconMode = variant === 'simplified';

  return {
    ...baseConfig,

    // User configuration
    user: displayUser
      ? {
          name: displayUser.name,
          email: displayUser.email,
          avatar: currentUser?.avatar,
          role: isHQ ? 'HQ' : 'User',
          status: 'online' as const,
        }
      : undefined,
    showUserMenu: true,
    showUserName,
    showUserStatus,
    userIconMode,

    // User menu items
    accountUrl: '/settings/account',
    profileUrl: '/settings/profile',
    securityUrl: '/settings/security',
    tokensUrl: '/settings/tokens',
    onAccountClick: handleAccountClick,
    onProfileClick: handleProfileClick,
    onSecurityClick: handleSecurityClick,
    onTokensClick: handleTokensClick,
    onLogout: handleLogout,

    // Notifications
    showNotifications: true,
    notifications: gqlNotifications.map(fromGraphQLNotification),
    unreadNotificationCount: unreadCount,
    onNotificationClick: handleNotificationClick,
    onMarkAllNotificationsRead: handleMarkAllNotificationsRead,
    onViewAllNotifications: handleViewAllNotifications,
    onClearAllNotifications: handleClearAllNotifications,
    onNotificationSettingsClick: handleNotificationSettingsClick,

    // Settings menu
    showSettings: true,
    onHelpClick: handleHelpClick,
    onAboutClick: handleAboutClick,

    // Modal components - only render when open to avoid backdrop z-index issues
    modals: (
      <>
        {helpModalOpen && (
          <Modal
            open={helpModalOpen}
            onClose={() => setHelpModalOpen(false)}
            title={tHelpModal('title')}
            maxWidth="md"
            icon={<HelpIcon color="primary" sx={{ fontSize: 40 }} />}
            actions={[
              {
                label: tCommon('close'),
                onClick: () => setHelpModalOpen(false),
                variant: 'contained',
                color: 'primary',
              },
            ]}
          >
            <HelpContent />
          </Modal>
        )}
        {aboutModalOpen && (
          <Modal
            open={aboutModalOpen}
            onClose={() => setAboutModalOpen(false)}
            title={tAboutModal('title')}
            maxWidth="md"
            icon={<InfoIcon color="primary" sx={{ fontSize: 40 }} />}
            actions={[
              {
                label: tCommon('close'),
                onClick: () => setAboutModalOpen(false),
                variant: 'contained',
                color: 'primary',
              },
            ]}
          >
            <AboutContent />
          </Modal>
        )}
      </>
    ),
  };
}
