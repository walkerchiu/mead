import { ThemeProvider } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import { theme } from './theme';

/**
 * Storybook-specific ThemeRegistry without Next.js dependencies
 * This version doesn't use 'use client' directive or AppRouterCacheProvider
 */
export function StorybookThemeRegistry({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      {children}
    </ThemeProvider>
  );
}
