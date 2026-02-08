import type { StorybookConfig } from '@storybook/nextjs-vite';
import { fileURLToPath } from 'url';
import { dirname, resolve } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const config: StorybookConfig = {
  stories: ['../src/**/*.mdx', '../src/**/*.stories.@(js|jsx|mjs|ts|tsx)'],
  addons: [
    '@chromatic-com/storybook',
    '@storybook/addon-vitest',
    '@storybook/addon-a11y',
    '@storybook/addon-docs',
  ],
  framework: '@storybook/nextjs-vite',
  staticDirs: ['../public'],
  core: {
    disableTelemetry: true,
  },
  viteFinal: async (config) => {
    // Configure path aliases for Vite
    config.resolve = config.resolve || {};
    config.resolve.alias = {
      ...config.resolve.alias,
      '@': resolve(__dirname, '../src'),
    };

    // Optimize MUI icons for better performance and avoid dynamic import errors
    config.optimizeDeps = config.optimizeDeps || {};
    config.optimizeDeps.include = [
      ...(config.optimizeDeps.include || []),
      '@mui/icons-material/Download',
      '@mui/icons-material/NavigateNext',
      '@mui/icons-material/Computer',
      '@mui/icons-material/Settings',
      '@mui/icons-material/Assessment',
      '@mui/icons-material/Refresh',
      '@mui/icons-material/ArrowBack',
      // HQ component icons
      '@mui/icons-material/Block',
      '@mui/icons-material/Visibility',
      '@mui/icons-material/PhoneAndroid',
      '@mui/icons-material/Tablet',
      '@mui/icons-material/DesktopWindows',
      '@mui/icons-material/Apple',
      '@mui/icons-material/Android',
      '@mui/icons-material/Language',
      '@mui/icons-material/AccessTime',
    ];

    return config;
  },
};
export default config;
