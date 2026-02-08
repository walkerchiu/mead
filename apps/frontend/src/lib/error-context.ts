import { setContext } from './error-tracking';

/**
 * Environment context information
 */
interface EnvironmentContext {
  appVersion: string;
  appName: string;
  environment: string;
  buildId?: string;
  commitSha?: string;
}

/**
 * Browser context information
 */
interface BrowserContext {
  userAgent: string;
  language: string;
  platform: string;
  vendor: string;
  screenWidth: number;
  screenHeight: number;
  windowWidth: number;
  windowHeight: number;
  timezone: string;
  online: boolean;
}

/**
 * Get environment context
 */
export function getEnvironmentContext(): EnvironmentContext {
  return {
    appVersion: process.env.NEXT_PUBLIC_APP_VERSION || '0.1.0',
    appName: 'NPT Frontend',
    environment: process.env.NODE_ENV,
    buildId: process.env.NEXT_PUBLIC_BUILD_ID,
    commitSha: process.env.NEXT_PUBLIC_COMMIT_SHA,
  };
}

/**
 * Get browser context
 */
export function getBrowserContext(): BrowserContext | null {
  if (typeof window === 'undefined') {
    return null;
  }

  return {
    userAgent: navigator.userAgent,
    language: navigator.language,
    platform: navigator.platform,
    vendor: navigator.vendor,
    screenWidth: window.screen.width,
    screenHeight: window.screen.height,
    windowWidth: window.innerWidth,
    windowHeight: window.innerHeight,
    timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
    online: navigator.onLine,
  };
}

/**
 * Initialize error context
 *
 * Sets up environment and browser context information
 * for error tracking services.
 */
export function initErrorContext() {
  if (typeof window === 'undefined') {
    return;
  }

  // Set environment context
  const envContext = getEnvironmentContext();
  setContext('environment', envContext);

  // Set browser context
  const browserContext = getBrowserContext();
  if (browserContext) {
    setContext('browser', browserContext);
  }

  console.log('[ErrorContext] ✅ Initialized', {
    environment: envContext.environment,
    version: envContext.appVersion,
  });
}

/**
 * Update browser context (useful for responsive/window resize)
 */
export function updateBrowserContext() {
  if (typeof window === 'undefined') {
    return;
  }

  const browserContext = getBrowserContext();
  if (browserContext) {
    setContext('browser', browserContext);
  }
}
