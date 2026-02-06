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
