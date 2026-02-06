import { vi } from 'vitest';

export const createNavigation = vi.fn((_routing: unknown) => ({
  Link: vi.fn(),
  redirect: vi.fn(),
  usePathname: vi.fn(() => '/'),
  useRouter: vi.fn(() => ({
    push: vi.fn(),
    replace: vi.fn(),
    back: vi.fn(),
    forward: vi.fn(),
    refresh: vi.fn(),
    prefetch: vi.fn(),
  })),
  getPathname: vi.fn(() => '/'),
}));
