'use client';

import { ReactNode } from 'react';
import Box from '@mui/material/Box';
import Container from '@mui/material/Container';
import Paper from '@mui/material/Paper';
import Typography from '@mui/material/Typography';
import { useTheme } from '@mui/material/styles';
import useMediaQuery from '@mui/material/useMediaQuery';

/**
 * AuthLayout 模板 - Atomic Design: Template
 *
 * 認證頁面的統一佈局模板，包含：
 * - 居中的卡片容器
 * - 響應式設計
 * - 品牌 Logo/標題區域
 * - Footer 連結
 *
 * @example
 * ```tsx
 * <AuthLayout title="歡迎回來">
 *   <LoginForm onSubmit={handleLogin} />
 * </AuthLayout>
 * ```
 */

export interface AuthLayoutProps {
  /**
   * 子組件內容 (通常是表單)
   */
  children: ReactNode;

  /**
   * 頁面標題
   */
  title?: string;

  /**
   * 副標題/描述
   */
  subtitle?: string;

  /**
   * 是否顯示 Logo
   */
  showLogo?: boolean;

  /**
   * 是否顯示 Footer
   */
  showFooter?: boolean;

  /**
   * 背景顏色模式
   */
  background?: 'gradient' | 'solid' | 'image';

  /**
   * 最大寬度
   */
  maxWidth?: number;
}

/**
 * AuthLayout 組件
 */
export function AuthLayout({
  children,
  title,
  subtitle,
  showLogo = true,
  showFooter = true,
  background = 'gradient',
  maxWidth = 480,
}: AuthLayoutProps) {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  // 背景樣式
  const getBackgroundStyle = () => {
    switch (background) {
      case 'gradient':
        return {
          background: `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${theme.palette.primary.dark} 100%)`,
        };
      case 'solid':
        return {
          backgroundColor: theme.palette.grey[100],
        };
      case 'image':
        return {
          backgroundColor: theme.palette.grey[100],
          backgroundImage: 'url(/auth-background.jpg)',
          backgroundSize: 'cover',
          backgroundPosition: 'center',
        };
      default:
        return {};
    }
  };

  return (
    <Box
      sx={{
        minHeight: '100vh',
        display: 'flex',
        flexDirection: 'column',
        ...getBackgroundStyle(),
      }}
    >
      {/* 主要內容區域 */}
      <Container
        maxWidth="lg"
        sx={{
          flex: 1,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          py: { xs: 3, sm: 4, md: 6 },
        }}
      >
        <Paper
          elevation={isMobile ? 0 : 8}
          sx={{
            width: '100%',
            maxWidth,
            p: { xs: 3, sm: 4, md: 5 },
            borderRadius: { xs: 0, sm: 2 },
            backgroundColor: 'background.paper',
          }}
        >
          {/* Logo 區域 */}
          {showLogo && (
            <Box
              sx={{
                textAlign: 'center',
                mb: 4,
              }}
            >
              <Typography
                variant="h3"
                component="div"
                sx={{
                  fontWeight: 700,
                  color: 'primary.main',
                  mb: 1,
                }}
              >
                🌊 Starter
              </Typography>
              {title && (
                <Typography
                  variant="h5"
                  component="h1"
                  sx={{
                    fontWeight: 600,
                    color: 'text.primary',
                    mb: subtitle ? 1 : 0,
                  }}
                >
                  {title}
                </Typography>
              )}
              {subtitle && (
                <Typography
                  variant="body2"
                  color="text.secondary"
                  sx={{ mt: 1 }}
                >
                  {subtitle}
                </Typography>
              )}
            </Box>
          )}

          {/* 表單內容 */}
          <Box sx={{ display: 'flex', justifyContent: 'center' }}>
            {children}
          </Box>
        </Paper>
      </Container>

      {/* Footer */}
      {showFooter && (
        <Box
          component="footer"
          sx={{
            py: 3,
            textAlign: 'center',
            color:
              background === 'gradient' ? 'common.white' : 'text.secondary',
          }}
        >
          <Typography variant="body2">
            © 2026 Starter. All rights reserved.
          </Typography>
        </Box>
      )}
    </Box>
  );
}

export default AuthLayout;
