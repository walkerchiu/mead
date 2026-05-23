'use client';

import { ReactNode, useState, useEffect } from 'react';
import {
  Box,
  useMediaQuery,
  useTheme,
  Typography,
  Link as MuiLink,
  Tooltip,
} from '@mui/material';
import { Dashboard as DashboardIcon } from '@mui/icons-material';
import NextLink from 'next/link';
import { useTranslations } from 'next-intl';
import { MainAppBar } from './MainAppBar';
import { Sidebar } from '@/components/organisms';
import { ScrollControl } from '@/components/molecules';
import { useAppBarConfig } from '@/hooks/useAppBarConfig';
import { useSidebarItems, useActiveItemId } from '@/hooks/useSidebarItems';
import { useNavRouter as useRouter } from '@/i18n/use-nav-router';
import type { DrawerState } from '@/components/organisms';

const SIDEBAR_WIDTH = 240;
const SIDEBAR_MINI_WIDTH = 64;
const APPBAR_HEIGHT = 64;
const SIDEBAR_STATE_STORAGE_KEY = 'mead.sidebarState';

export interface AppShellProps {
  children: ReactNode;
  /** Page title shown in AppBar */
  title?: string;
}

export function AppShell({ children, title }: AppShellProps) {
  const t = useTranslations('pages.dashboard');
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const router = useRouter();

  // 桌面版預設展開，行動版預設關閉；讀取 localStorage 中使用者的偏好
  const [sidebarState, setSidebarState] = useState<DrawerState>(
    isMobile ? 'closed' : 'open',
  );

  // Hydration 後從 localStorage 讀取使用者偏好（僅桌面版）
  useEffect(() => {
    if (isMobile) return;
    const saved = localStorage.getItem(SIDEBAR_STATE_STORAGE_KEY);
    if (saved === 'open' || saved === 'mini') {
      setSidebarState(saved);
    }
  }, [isMobile]);

  // 包裝 setSidebarState，同步寫入 localStorage（僅桌面版）
  const handleSidebarStateChange = (newState: DrawerState) => {
    setSidebarState(newState);
    if (!isMobile && (newState === 'open' || newState === 'mini')) {
      localStorage.setItem(SIDEBAR_STATE_STORAGE_KEY, newState);
    }
  };

  const sidebarItems = useSidebarItems();
  const activeItemId = useActiveItemId();

  const { modals, ...appBarProps } = useAppBarConfig({
    variant: 'simplified',
    title: title || t('title'),
    titleLink: '/dashboard',
    autoSubscribeNotifications: true,
  });

  // Navigate on sidebar item click
  const itemsWithNavigation = sidebarItems.map((item) => {
    if (item.divider) return item;

    if (item.children) {
      return {
        ...item,
        children: item.children.map((child) => ({
          ...child,
          onClick: () => {
            if (child.path)
              router.push(child.path as Parameters<typeof router.push>[0]);
            if (isMobile) setSidebarState('closed');
          },
        })),
      };
    }

    return {
      ...item,
      onClick: () => {
        if (item.path)
          router.push(item.path as Parameters<typeof router.push>[0]);
        if (isMobile) setSidebarState('closed');
      },
    };
  });

  // Sidebar 目前佔用的寬度（供主內容 margin 對齊）
  const sidebarWidth = isMobile
    ? 0
    : sidebarState === 'open'
      ? SIDEBAR_WIDTH
      : sidebarState === 'mini'
        ? SIDEBAR_MINI_WIDTH
        : 0;

  return (
    <Box sx={{ minHeight: '100vh', bgcolor: 'background.default' }}>
      {/* AppBar：fixed 定位，z-index 高於 Sidebar，並預留左側 Sidebar 寬度 */}
      <Box
        sx={{
          position: 'fixed',
          top: 0,
          left: isMobile ? 0 : `${sidebarWidth}px`,
          right: 0,
          zIndex: (theme) => theme.zIndex.drawer + 1,
          transition: theme.transitions.create(['left'], {
            easing: theme.transitions.easing.sharp,
            duration: theme.transitions.duration.leavingScreen,
          }),
        }}
      >
        <MainAppBar {...appBarProps} />
      </Box>
      {modals}

      <Sidebar
        items={itemsWithNavigation}
        activeItemId={activeItemId}
        state={sidebarState}
        onStateChange={handleSidebarStateChange}
        variant={isMobile ? 'temporary' : 'persistent'}
        responsive
        width={SIDEBAR_WIDTH}
        miniWidth={SIDEBAR_MINI_WIDTH}
        miniExpandBehavior="popover"
        header={
          <Tooltip title={t('title')} placement="right" arrow>
            <MuiLink
              component={NextLink}
              href="/dashboard"
              underline="none"
              aria-label={t('title')}
              sx={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 1,
                px: 1.25,
                py: 0.75,
                borderRadius: 1,
                color: 'inherit',
                transition: 'all 0.2s',
                '&:hover': {
                  backgroundColor: 'rgba(255, 255, 255, 0.12)',
                  transform: 'translateX(2px)',
                  '& .mead-home-icon': { opacity: 1 },
                },
              }}
            >
              <DashboardIcon
                className="mead-home-icon"
                sx={{
                  fontSize: 18,
                  opacity: 0.7,
                  transition: 'opacity 0.2s',
                }}
              />
              <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
                MEAD
              </Typography>
            </MuiLink>
          </Tooltip>
        }
      />

      <Box
        component="main"
        sx={{
          ml: isMobile ? 0 : `${sidebarWidth}px`,
          pt: `${APPBAR_HEIGHT}px`,
          minHeight: '100vh',
          transition: theme.transitions.create(['margin-left'], {
            easing: theme.transitions.easing.sharp,
            duration: theme.transitions.duration.leavingScreen,
          }),
        }}
      >
        {children}
      </Box>

      <ScrollControl />
    </Box>
  );
}
