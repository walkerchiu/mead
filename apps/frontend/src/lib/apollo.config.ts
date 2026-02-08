/**
 * Apollo Client Configuration
 *
 * Centralized configuration for Apollo Client with:
 * - Environment variable support
 * - Safe defaults
 * - Configuration validation
 * - Type safety
 */

interface TimeoutConfig {
  default: number;
  min: number;
  max: number;
}

interface RetryConfig {
  maxRetries: number;
  initialDelay: number;
  maxDelay: number;
  minRetries: number;
  maxRetriesLimit: number;
}

interface ApolloConfig {
  timeout: TimeoutConfig;
  retry: RetryConfig;
}

/**
 * Parse and validate timeout value
 */
function parseTimeout(value: string | undefined, fallback: number): number {
  if (!value) return fallback;

  const parsed = parseInt(value, 10);
  if (isNaN(parsed)) {
    console.warn(
      `[Apollo Config] Invalid timeout value: ${value}, using default: ${fallback}ms`,
    );
    return fallback;
  }

  // Enforce min/max boundaries
  const MIN_TIMEOUT = 5000; // 5 seconds
  const MAX_TIMEOUT = 300000; // 5 minutes

  if (parsed < MIN_TIMEOUT) {
    console.warn(
      `[Apollo Config] Timeout ${parsed}ms is too low, using minimum: ${MIN_TIMEOUT}ms`,
    );
    return MIN_TIMEOUT;
  }

  if (parsed > MAX_TIMEOUT) {
    console.warn(
      `[Apollo Config] Timeout ${parsed}ms is too high, using maximum: ${MAX_TIMEOUT}ms`,
    );
    return MAX_TIMEOUT;
  }

  return parsed;
}

/**
 * Parse and validate retry count
 */
function parseRetryCount(value: string | undefined, fallback: number): number {
  if (!value) return fallback;

  const parsed = parseInt(value, 10);
  if (isNaN(parsed)) {
    console.warn(
      `[Apollo Config] Invalid retry count: ${value}, using default: ${fallback}`,
    );
    return fallback;
  }

  // Enforce boundaries
  const MIN_RETRIES = 0;
  const MAX_RETRIES = 10;

  if (parsed < MIN_RETRIES) {
    console.warn(
      `[Apollo Config] Retry count ${parsed} is negative, using minimum: ${MIN_RETRIES}`,
    );
    return MIN_RETRIES;
  }

  if (parsed > MAX_RETRIES) {
    console.warn(
      `[Apollo Config] Retry count ${parsed} is too high, using maximum: ${MAX_RETRIES}`,
    );
    return MAX_RETRIES;
  }

  return parsed;
}

/**
 * Parse and validate delay value
 */
function parseDelay(
  value: string | undefined,
  fallback: number,
  type: 'initial' | 'max',
): number {
  if (!value) return fallback;

  const parsed = parseInt(value, 10);
  if (isNaN(parsed)) {
    console.warn(
      `[Apollo Config] Invalid ${type} delay: ${value}, using default: ${fallback}ms`,
    );
    return fallback;
  }

  // Enforce boundaries
  const MIN_DELAY = 100; // 100ms
  const MAX_DELAY = 60000; // 1 minute

  if (parsed < MIN_DELAY) {
    console.warn(
      `[Apollo Config] ${type} delay ${parsed}ms is too low, using minimum: ${MIN_DELAY}ms`,
    );
    return MIN_DELAY;
  }

  if (parsed > MAX_DELAY) {
    console.warn(
      `[Apollo Config] ${type} delay ${parsed}ms is too high, using maximum: ${MAX_DELAY}ms`,
    );
    return MAX_DELAY;
  }

  return parsed;
}

/**
 * Apollo Client Configuration
 *
 * Reads from environment variables with safe defaults:
 *
 * Environment Variables:
 * - NEXT_PUBLIC_APOLLO_TIMEOUT: Request timeout in milliseconds (default: 30000)
 * - NEXT_PUBLIC_APOLLO_MAX_RETRIES: Maximum retry attempts (default: 3)
 * - NEXT_PUBLIC_APOLLO_RETRY_INITIAL_DELAY: Initial retry delay in ms (default: 300)
 * - NEXT_PUBLIC_APOLLO_RETRY_MAX_DELAY: Maximum retry delay in ms (default: 10000)
 *
 * @example
 * ```typescript
 * // Use default configuration
 * const timeoutLink = createTimeoutLink({
 *   timeout: apolloConfig.timeout.default
 * });
 *
 * // Validate custom timeout
 * const customTimeout = Math.min(
 *   Math.max(userTimeout, apolloConfig.timeout.min),
 *   apolloConfig.timeout.max
 * );
 * ```
 */
export const apolloConfig: ApolloConfig = {
  timeout: {
    default: parseTimeout(process.env.NEXT_PUBLIC_APOLLO_TIMEOUT, 30000),
    min: 5000, // 5 seconds
    max: 300000, // 5 minutes
  },
  retry: {
    maxRetries: parseRetryCount(process.env.NEXT_PUBLIC_APOLLO_MAX_RETRIES, 3),
    initialDelay: parseDelay(
      process.env.NEXT_PUBLIC_APOLLO_RETRY_INITIAL_DELAY,
      300,
      'initial',
    ),
    maxDelay: parseDelay(
      process.env.NEXT_PUBLIC_APOLLO_RETRY_MAX_DELAY,
      10000,
      'max',
    ),
    minRetries: 0,
    maxRetriesLimit: 10,
  },
};

/**
 * Validate per-operation timeout
 */
export function validateTimeout(timeout: number | undefined): number {
  if (timeout === undefined) {
    return apolloConfig.timeout.default;
  }

  return Math.min(
    Math.max(timeout, apolloConfig.timeout.min),
    apolloConfig.timeout.max,
  );
}

/**
 * Validate per-operation max retries
 */
export function validateMaxRetries(maxRetries: number | undefined): number {
  if (maxRetries === undefined) {
    return apolloConfig.retry.maxRetries;
  }

  return Math.min(
    Math.max(maxRetries, apolloConfig.retry.minRetries),
    apolloConfig.retry.maxRetriesLimit,
  );
}

// Log configuration on initialization (only in development)
if (process.env.NODE_ENV === 'development') {
  console.log('[Apollo Config] Initialized with:', {
    timeout: `${apolloConfig.timeout.default}ms`,
    maxRetries: apolloConfig.retry.maxRetries,
    initialDelay: `${apolloConfig.retry.initialDelay}ms`,
    maxDelay: `${apolloConfig.retry.maxDelay}ms`,
  });
}
