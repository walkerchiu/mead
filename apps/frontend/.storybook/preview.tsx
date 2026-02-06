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
        method: 'alphabetical',
        order: [
          'Introduction',
          ['Welcome', 'Best Practices', '*'],
          'Design System',
          ['Colors', 'Typography', '*'],
          'Atoms',
          [
            'Button',
            'TextField',
            'CodeInput',
            'Skeleton',
            'Switch',
            'Slider',
            'Avatar',
            'Badge',
            'Icon',
            'Divider',
            'Progress',
            '*',
          ],
          'Molecules',
          [
            'FormField',
            'PasswordField',
            'SelectField',
            'RadioGroup',
            'CheckboxGroup',
            'Card',
            'Accordion',
            'Tabs',
            'Stepper',
            'Pagination',
            'LanguageSwitcher',
            {
              SettingsMenu: [
                'Docs',
                'Default',
                'Primary',
                'Secondary',
                'With Label',
                'Small',
                'Large',
                'Size Comparison',
                'In App Bar',
                'In App Bar With Label',
                'Dashboard Header',
                'With Main App Bar',
              ],
            },
            'SnackbarWithProgress',
            'AlertMessage',
            'ErrorDisplay',
            '*',
          ],
          'Organisms',
          [
            'Drawer',
            'Modal',
            'Sidebar',
            'MainAppBar',
            'LoginForm',
            'ForgotPasswordForm',
            'ResetPasswordForm',
            'TwoFactorForm',
            '*',
          ],
          'Templates',
          ['AuthLayout', '*'],
          'Pages',
          [
            'LoginPage',
            'LoginPage (MSW)',
            'ForgotPasswordPage',
            'ResetPasswordPage',
            '*',
          ],
          'Example',
          '*',
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
