import { defineConfig } from 'vitest/config';
import path from 'path';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  test: {
    globals: true,
    environment: 'jsdom',
    include: ['src/**/*.test.ts', 'src/**/*.test.tsx', 'src/**/*.spec.ts'],
    setupFiles: './src/test/setup.ts',
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
      // 子模組必須在父模組之前定義
      'next-intl/routing': path.resolve(
        __dirname,
        './src/__mocks__/next-intl-routing.ts',
      ),
      'next-intl/navigation': path.resolve(
        __dirname,
        './src/__mocks__/next-intl-navigation.ts',
      ),
      'next-intl': path.resolve(__dirname, './src/__mocks__/next-intl.ts'),
      'next/navigation': path.resolve(
        __dirname,
        './src/__mocks__/next/navigation.ts',
      ),
    },
  },
});
