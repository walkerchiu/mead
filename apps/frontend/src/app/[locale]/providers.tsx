'use client';

import { ReactNode } from 'react';
import { ProgressProvider } from '@bprogress/next/app';
import { ThemeRegistry } from '@/theme/ThemeRegistry';
import { SnackbarProvider } from 'notistack';
import { SnackbarWithProgress } from '@/components/molecules';
import { snackbarConfig } from '@/config/snackbar.config';

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
        @bprogress/next 進度條：在 anchor click 的瞬間（capture 階段）就觸發 bar，
        不必等 next/navigation 的 router event，使用者按下後幾乎是立即看到。

        關鍵設定：
        - delay 0 / stopDelay 0：減掉預設的 buffer
        - startPosition 0.3：bar 一開始就佔 30% 寬度，不會看起來「沒動」
        - shallowRouting：避免 query 改動時也跑 bar
        - options.showSpinner：右上角 spinner 第二重 cue
      */}
      <ProgressProvider
        color="#F59E0B"
        height="4px"
        options={{ showSpinner: true }}
        startPosition={0.3}
        delay={0}
        stopDelay={0}
        shallowRouting
      >
        <SnackbarProvider
          maxSnack={snackbarConfig.maxSnack}
          anchorOrigin={snackbarConfig.anchorOrigin}
          autoHideDuration={snackbarConfig.autoHideDuration}
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
      </ProgressProvider>
    </ThemeRegistry>
  );
}
