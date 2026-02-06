import type { Preview } from '@storybook/nextjs-vite';
import React from 'react';
import { NextIntlClientProvider } from 'next-intl';
import { StorybookThemeRegistry } from '../src/theme/StorybookThemeRegistry';
import { StorybookApolloProvider } from '../src/lib/apollo-provider-storybook';
import { SnackbarProvider } from 'notistack';
import { initialize, mswLoader } from 'msw-storybook-addon';
import enMessages from '../messages/en.json';

// Initialize MSW
initialize({
  onUnhandledRequest: 'bypass',
});

const preview: Preview = {
  parameters: {
    controls: {
      matchers: {
        color: /(background|color)$/i,
        date: /Date$/i,
      },
    },
    nextjs: {
      appDirectory: true,
    },
    options: {
      storySort: {
        order: [
          // 1. 介紹與文檔
          'Introduction',
          ['Welcome', 'Best Practices', 'Getting Started'],

          // 2. 設計系統基礎
          'Design System',
          [
            'Colors', // 顏色系統
            'Typography', // 字體排版
          ],

          // 3. Atoms - 原子組件(按功能分組)
          'Atoms',
          [
            // 按鈕類
            'Button',
            'ActionButton',
            'IconButton',

            // 表單欄位類
            'TextField',
            'Search',
            'DatePicker',
            'TimePicker',
            'Radio',
            'Switch',

            // 輸入組件
            'CodeInput',
            'Slider',

            // 標籤與標記
            'Chip',
            'Badge',

            // 資料顯示
            'Avatar',
            'Icon',
            'Progress',
            'Skeleton',

            // 佈局與分隔
            'Divider',

            // 選單類
            'NotificationMenu',
            'UserMenu',
            'SettingsMenu',
          ],

          // 4. Molecules - 分子組件(按功能分組)
          'Molecules',
          [
            // 表單組件
            'FormField',
            'PasswordField',
            'SelectField',
            'CheckboxGroup',
            'RadioGroup',

            // 反饋組件
            'AlertMessage',
            'ErrorDisplay',
            'SnackbarWithProgress',

            // 導航組件
            'Tabs',
            'Stepper',
            'Pagination',

            // 語言與設定
            'LanguageSwitcher',

            // 資料展示組件
            'Card',
            'DataTable',
            'DataList',
            'Accordion',
          ],

          // 5. Organisms - 有機組件
          'Organisms',
          [
            // 佈局組件
            'Drawer',
            'Modal',
            'Sidebar',

            // 認證表單
            'LoginForm',
            'ForgotPasswordForm',
            'ResetPasswordForm',
            'TwoFactorForm',
          ],

          // 6. Layout - 佈局組件
          'Layout',
          ['MainAppBar'],

          // 7. Templates - 模板
          'Templates',
          ['AuthLayout'],

          // 8. Pages - 完整頁面
          'Pages',
          [
            'LoginPage',
            'LoginPage (MSW)',
            'ForgotPasswordPage',
            'ResetPasswordPage',
          ],

          // 9. Examples - 範例與測試
          'Example',
          ['Apollo + MSW Test'],
        ],
      },
    },
  },
  decorators: [
    (Story) => (
      <NextIntlClientProvider locale="en" messages={enMessages}>
        <StorybookThemeRegistry>
          <StorybookApolloProvider>
            <SnackbarProvider
              maxSnack={3}
              anchorOrigin={{
                vertical: 'top',
                horizontal: 'right',
              }}
              autoHideDuration={5000}
            >
              <Story />
            </SnackbarProvider>
          </StorybookApolloProvider>
        </StorybookThemeRegistry>
      </NextIntlClientProvider>
    ),
  ],
  loaders: [mswLoader],
};

export default preview;
