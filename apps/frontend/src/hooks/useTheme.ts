'use client';

import { useState, useEffect } from 'react';

export type ThemeMode = 'light' | 'dark' | 'system';

/**
 * useTheme Hook
 *
 * 管理應用主題狀態，支援 light/dark/system 模式
 *
 * @example
 * ```tsx
 * const { currentTheme, setTheme } = useTheme();
 *
 * // 切換主題
 * setTheme('dark');
 * ```
 */
export function useTheme() {
  const [currentTheme, setCurrentTheme] = useState<ThemeMode>('system');
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  useEffect(() => {
    if (!isClient) return;

    // 從 localStorage 讀取主題設定
    const savedTheme = localStorage.getItem('theme') as ThemeMode | null;
    if (savedTheme && ['light', 'dark', 'system'].includes(savedTheme)) {
      setCurrentTheme(savedTheme);
      applyTheme(savedTheme);
    } else {
      applyTheme('system');
    }

    // 監聽系統主題變化（當選擇 system 模式時）
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    const handleChange = () => {
      if (currentTheme === 'system') {
        applyTheme('system');
      }
    };

    mediaQuery.addEventListener('change', handleChange);
    return () => mediaQuery.removeEventListener('change', handleChange);
  }, [isClient, currentTheme]);

  const applyTheme = (theme: ThemeMode) => {
    if (!isClient) return;

    let effectiveTheme: 'light' | 'dark' = 'light';

    if (theme === 'system') {
      effectiveTheme = window.matchMedia('(prefers-color-scheme: dark)').matches
        ? 'dark'
        : 'light';
    } else {
      effectiveTheme = theme;
    }

    // 應用主題到 document
    document.documentElement.setAttribute('data-theme', effectiveTheme);

    // 更新 MUI theme（如果有使用 MUI ThemeProvider）
    // 這裡可以觸發 MUI theme 更新的邏輯
  };

  const handleThemeChange = (theme: ThemeMode) => {
    if (!isClient) return;

    setCurrentTheme(theme);
    localStorage.setItem('theme', theme);
    applyTheme(theme);

    // 觸發自定義事件通知 ThemeRegistry 更新
    window.dispatchEvent(new Event('theme-change'));
  };

  return {
    currentTheme,
    setTheme: handleThemeChange,
    isClient,
  };
}
