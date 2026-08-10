import { vi } from 'vitest';

export const defineRouting = vi.fn((config: Record<string, unknown>) => ({
  ...config,
  locales: config.locales || ['en', 'zh-TW'],
  defaultLocale: config.defaultLocale || 'en',
}));
