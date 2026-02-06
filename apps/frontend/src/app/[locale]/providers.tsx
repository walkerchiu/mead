'use client';

import { ReactNode } from 'react';
import { ThemeRegistry } from '@/theme/ThemeRegistry';
import { ApolloProvider } from '@/lib/apollo-provider';
import { SnackbarProvider } from 'notistack';
import { SnackbarWithProgress } from '@/components/atoms';
import { useAuthInit } from '@/hooks/useAuthInit';

function AuthInitializer({ children }: { children: ReactNode }) {
  useAuthInit(); // 初始化認證並啟動自動刷新
  return <>{children}</>;
}

export function Providers({ children }: { children: ReactNode }) {
  return (
    <ThemeRegistry>
      <ApolloProvider>
        <AuthInitializer>
          <SnackbarProvider
            maxSnack={3}
            anchorOrigin={{
              vertical: 'top',
              horizontal: 'right',
            }}
            autoHideDuration={2000}
            // Use custom component with progress bar for all variants
            Components={{
              success: SnackbarWithProgress,
              error: SnackbarWithProgress,
              warning: SnackbarWithProgress,
              info: SnackbarWithProgress,
              default: SnackbarWithProgress,
            }}
          >
            {children}
          </SnackbarProvider>
        </AuthInitializer>
      </ApolloProvider>
    </ThemeRegistry>
  );
}
