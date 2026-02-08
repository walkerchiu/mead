'use client';

import { ReactNode } from 'react';
import { ProgressProvider } from '@bprogress/next/app';
import { ThemeRegistry } from '@/theme/ThemeRegistry';
import { ApolloProvider } from '@/lib/apollo-provider';
import { SnackbarProvider } from 'notistack';
import { SnackbarWithProgress } from '@/components/molecules';
import { useAuthInit } from '@/hooks/useAuthInit';
import { snackbarConfig } from '@/config/snackbar.config';

function AuthInitializer({ children }: { children: ReactNode }) {
  useAuthInit(); // 初始化認證並啟動自動重新整理
  return <>{children}</>;
}

export function Providers({
  children,
  nonce,
}: {
  children: ReactNode;
  nonce?: string;
}) {
  return (
    <ThemeRegistry nonce={nonce}>
      {/*
        @bprogress/next 進度條 — 取代原本的 nextjs-toploader。
        差別：bprogress 在 anchor click 的瞬間（capture 階段）就觸發 bar，
        不必等 next/navigation 的 router event，使用者按下後幾乎是立即看到。

        關鍵設定：
        - delay 0 / stopDelay 0：減掉預設的 buffer
        - startPosition 0.3：bar 一開始就佔 30% 寬度，不會看起來「沒動」
        - shallowRouting：避免 query 改動時也跑 bar
        - options.showSpinner：右上角 spinner 第二重 cue
      */}
      <ProgressProvider
        // 琥珀金（tones.accent[500]）— 跟 MainAppBar 的 primary 深藍 #0c3467
        // 對比明顯。原本同色系容易看不出進度條在跑。
        color="#F59E0B"
        height="4px"
        options={{ showSpinner: true }}
        startPosition={0.3}
        delay={0}
        stopDelay={0}
        shallowRouting
      >
        <ApolloProvider>
          <AuthInitializer>
            <SnackbarProvider
              maxSnack={snackbarConfig.maxSnack}
              anchorOrigin={snackbarConfig.anchorOrigin}
              autoHideDuration={snackbarConfig.autoHideDuration}
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
      </ProgressProvider>
    </ThemeRegistry>
  );
}
