'use client';

import { ReactNode } from 'react';
import {
  AppBar,
  Toolbar,
  Typography,
  IconButton,
  Box,
  Link as MuiLink,
} from '@mui/material';
import { ArrowBack } from '@mui/icons-material';
import Link from 'next/link';
import { useRouter } from '@/i18n/routing';
import { LanguageSwitcher, SettingsMenu } from '@/components/atoms';

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
  /**
   * 自訂登出處理函數（可選）
   */
  onLogout?: () => void;
}

/**
 * 統一的應用程式導覽列元件
 * 包含標題/Logo、語言切換、設定選單（Profile、Security、Logout）
 * 可選的返回按鈕和超連結功能
 */
export function MainAppBar({
  title,
  logo,
  titleLink,
  showBackButton = false,
  backPath = '/dashboard',
  onLogout,
}: MainAppBarProps) {
  const router = useRouter();

  const handleBack = () => {
    router.push(backPath);
  };

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

        <LanguageSwitcher color="inherit" sx={{ mr: 2 }} />

        <SettingsMenu color="inherit" onLogout={onLogout} />
      </Toolbar>
    </AppBar>
  );
}
