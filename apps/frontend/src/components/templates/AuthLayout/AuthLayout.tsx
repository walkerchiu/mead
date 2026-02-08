'use client';

import { ReactNode } from 'react';
import Box from '@mui/material/Box';
import Container from '@mui/material/Container';
import Paper from '@mui/material/Paper';
import Typography from '@mui/material/Typography';
import { useTheme } from '@mui/material/styles';
import useMediaQuery from '@mui/material/useMediaQuery';
import { ScrollControl } from '@/components/molecules';

/**
 * AuthLayout Template - Atomic Design: Template
 *
 * Unified layout template for authentication pages, includes:
 * - Centered card container
 * - Responsive design
 * - Brand Logo/Title area
 * - Footer links
 *
 * @example
 * ```tsx
 * <AuthLayout title="Welcome back">
 *   <LoginForm onSubmit={handleLogin} />
 * </AuthLayout>
 * ```
 */

export interface AuthLayoutProps {
  /**
   * ChildcomponentContent (typically a form)
   */
  children: ReactNode;

  /**
   * Page title
   */
  title?: string;

  /**
   * Subtitle/Description
   */
  subtitle?: string;

  /**
   * whether to show Logo
   */
  showLogo?: boolean;

  /**
   * whether to show Footer
   */
  showFooter?: boolean;

  /**
   * Background color mode
   */
  background?: 'gradient' | 'solid' | 'image';

  /**
   * Maximum width
   */
  maxWidth?: number;
}

/**
 * AuthLayout component
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

  // background style - Using CSS custom properties for theme-aware backgrounds
  // This prevents hydration mismatch by relying on CSS instead of JS theme detection
  const getBackgroundStyle = () => {
    switch (background) {
      case 'gradient':
        return {
          background: 'var(--auth-gradient-bg)',
        };
      case 'solid':
        return {
          backgroundColor: 'var(--auth-solid-bg)',
        };
      case 'image':
        return {
          backgroundColor: 'var(--auth-solid-bg)',
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
      {/* Main content area */}
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
          {/* logo area */}
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
                🌊 NPT
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

          {/* formContent */}
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
            © 2026 加雲聯網 Intelligent Cloud Plus, Inc. All rights reserved.
          </Typography>
        </Box>
      )}

      {/* Scroll Control - Fixed position scroll buttons */}
      <ScrollControl
        position="right-bottom"
        showScrollUp={true}
        showScrollDown={true}
        showScrollToTop={true}
        showScrollToBottom={true}
        offset={500}
        visibilityThreshold={300}
      />
    </Box>
  );
}

export default AuthLayout;
