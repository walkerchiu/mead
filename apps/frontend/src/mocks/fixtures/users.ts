/**
 * Test user fixtures for Storybook stories
 */

// Mock password for testing (not a real password pattern)
// Can be overridden via environment variable VITE_MOCK_PASSWORD
export const MOCK_PASSWORD = process.env.VITE_MOCK_PASSWORD || 'TestPass123!@#';

export const mockUsers = {
  customer: {
    id: 'user-customer-1',
    email: 'customer@example.com',
    name: 'Test Customer',
    role: 'CUSTOMER',
    tier: 'FREE',
    twoFactorEnabled: false,
  },
  customerWith2FA: {
    id: 'user-customer-2fa',
    email: 'customer2fa@example.com',
    name: 'Customer with 2FA',
    role: 'CUSTOMER',
    tier: 'FREE',
    twoFactorEnabled: true,
  },
  hq: {
    id: 'user-hq-1',
    email: 'hq@example.com',
    name: 'Test HQ',
    role: 'HQ',
    tier: 'PREMIUM',
    twoFactorEnabled: false,
  },
  hqWith2FA: {
    id: 'user-hq-2fa',
    email: 'hq2fa@example.com',
    name: 'HQ with 2FA',
    role: 'HQ',
    tier: 'PREMIUM',
    twoFactorEnabled: true,
  },
};

export const mockTokens = {
  accessToken: 'mock-access-token-' + Date.now(),
};

export const mock2FACodes = {
  validCode: '123456',
  invalidCode: '000000',
  backupCode: 'BACKUP12',
  backupCodes: [
    'BACKUP01',
    'BACKUP02',
    'BACKUP03',
    'BACKUP04',
    'BACKUP05',
    'BACKUP06',
    'BACKUP07',
    'BACKUP08',
    'BACKUP09',
    'BACKUP10',
  ],
};

export const mockPasswordResetToken = 'mock-reset-token-' + Date.now();
