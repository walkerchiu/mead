import type { Preview } from '@storybook/nextjs-vite';
import React from 'react';
import { NextIntlClientProvider } from 'next-intl';
import { ProgressProvider } from '@bprogress/next/app';
import { StorybookThemeRegistry } from '../src/theme/StorybookThemeRegistry';
import { SnackbarProvider } from 'notistack';
import enMessages from '../messages/en.json';
import zhTWMessages from '../messages/zh-TW.json';

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
        method: 'alphabetical',
        order: [
          'Introduction',
          ['Welcome', 'Getting Started'],
          'Public Scope',
          [
            'Overview',
            'Design System',
            ['Colors', 'Typography'],
            'Atoms',
            'Molecules',
            'Organisms',
            'Pages',
          ],
          'Shared',
          [
            'Overview',
            'Design System',
            ['Colors', 'Typography'],
            'Atoms',
            'Molecules',
          ],
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
            `useProgress`). Any story that navigates needs this; without it the
            story errors with "useProgress must be used within a
            ProgressProvider".
          */}
          <ProgressProvider color="#F59E0B" height="4px">
            <StorybookThemeRegistry>
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
            </StorybookThemeRegistry>
          </ProgressProvider>
        </NextIntlClientProvider>
      );
    },
  ],
};

export default preview;
