import type { Preview } from '@storybook/nextjs-vite';
import React from 'react';
import { NextIntlClientProvider } from 'next-intl';
import { ProgressProvider } from '@bprogress/next/app';
import { StorybookThemeRegistry } from '../src/theme/StorybookThemeRegistry';
import { StorybookApolloProvider } from '../src/lib/apollo-provider-storybook';
import { SnackbarProvider } from 'notistack';
import { initialize, mswLoader } from 'msw-storybook-addon';
import enMessages from '../messages/en.json';
import zhTWMessages from '../messages/zh-TW.json';

// Initialize MSW
initialize({
  onUnhandledRequest: 'bypass',
});

// Language support
const messages = {
  en: enMessages,
  'zh-TW': zhTWMessages,
};

const preview: Preview = {
  globalTypes: {
    locale: {
      description: 'Internationalization locale',
      defaultValue: 'en',
      toolbar: {
        icon: 'globe',
        items: [
          { value: 'en', title: 'English' },
          { value: 'zh-TW', title: '正體中文' },
        ],
        showName: true,
        dynamicTitle: true,
      },
    },
  },
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
    locale: 'en',
    locales: {
      en: 'English',
      'zh-TW': '正體中文',
    },
    options: {
      storySort: {
        // method: 'alphabetical' — items inside each category are sorted A→Z.
        // `order` only fixes the top-level category sequence. Children inside
        // (Atoms / Molecules / Organisms / …) are auto-sorted by `method`,
        // no manual maintenance needed.
        method: 'alphabetical',
        order: [
          // 1. Introduction (explicit order, not alphabetical)
          'Introduction',
          ['Welcome', 'Best Practices', 'Getting Started'],

          // 2. Design System (explicit order, not alphabetical)
          'Design System',
          ['Colors', 'Typography'],

          // 3. Atoms (auto-sorted A→Z internally)
          'Atoms',

          // 4. Molecules (auto-sorted A→Z internally)
          'Molecules',

          // 5. Organisms (auto-sorted A→Z internally)
          'Organisms',

          // 6. Layout
          'Layout',

          // 7. Templates
          'Templates',

          // 8. Pages
          'Pages',
        ],
        locales: 'en-US',
      },
    },
  },
  decorators: [
    (Story, context) => {
      const locale = context.globals.locale || 'en';
      const currentMessages =
        messages[locale as keyof typeof messages] || enMessages;

      return (
        <NextIntlClientProvider
          locale={locale}
          messages={currentMessages}
          timeZone="Asia/Taipei"
        >
          {/*
            ProgressProvider — required by `useNavRouter` (which calls
            `useProgress`). Any story that touches MainAppBar / Sidebar /
            DashboardLayout / etc. transitively needs this; without it the
            story errors with "useProgress must be used within a
            ProgressProvider".
          */}
          <ProgressProvider color="#F59E0B" height="4px">
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
          </ProgressProvider>
        </NextIntlClientProvider>
      );
    },
  ],
  loaders: [mswLoader],
};

export default preview;
