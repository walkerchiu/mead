import { vi } from 'vitest';

export const useTranslations = vi.fn((namespace?: string) => {
  return (key: string) => {
    // Return the key itself for testing
    return `${namespace ? namespace + '.' : ''}${key}`;
  };
});

export const useLocale = vi.fn(() => 'en');

export const useMessages = vi.fn(() => ({}));
