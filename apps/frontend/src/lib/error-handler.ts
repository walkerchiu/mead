import type { AppError, RecoveryAction } from '@/types/errors';
import { ErrorCategory, ErrorSeverity } from '@/types/errors';
import { getErrorMessage, getErrorTranslationKey } from './error-utils';

interface CreateAppErrorOptions {
  originalError: unknown;
  category?: ErrorCategory;
  severity?: ErrorSeverity;
  message?: string;
  translationKey?: string;
  location?: string;
  retryable?: boolean;
  recoveryAction?: RecoveryAction;
  details?: Record<string, unknown>;
}

/**
 * Create standardized AppError object
 */
export function createAppError(options: CreateAppErrorOptions): AppError {
  const {
    originalError,
    category,
    severity,
    message,
    translationKey,
    location,
    retryable,
    recoveryAction,
    details,
  } = options;

  // Auto classify error
  const autoCategory = category || classifyError(originalError);

  // Auto set severity
  const autoSeverity = severity || getSeverity(autoCategory);

  // Extract error message
  const errorMessage =
    message || getErrorMessage(originalError, 'An unexpected error occurred');

  // Get translation key
  const autoTranslationKey =
    translationKey || getErrorTranslationKey(errorMessage);

  // Determine if retryable
  const autoRetryable =
    retryable !== undefined ? retryable : isRetryable(autoCategory);

  return {
    id: crypto.randomUUID(),
    category: autoCategory,
    severity: autoSeverity,
    originalError,
    message: errorMessage,
    translationKey: autoTranslationKey || undefined,
    timestamp: new Date(),
    location,
    retryable: autoRetryable,
    recoveryAction,
    details: details || extractErrorDetails(originalError),
  };
}

/**
 * Classify error based on error object
 */
export function classifyError(error: unknown): ErrorCategory {
  if (error && typeof error === 'object') {
    // GraphQL error
    if ('graphQLErrors' in error || 'networkError' in error) {
      const apolloError = error as {
        graphQLErrors?: Array<{ extensions?: { code?: string } }>;
        networkError?: unknown;
      };

      // Check if authentication error
      if (
        apolloError.graphQLErrors?.some(
          (err) => err.extensions?.code === 'UNAUTHENTICATED',
        )
      ) {
        return ErrorCategory.AUTHENTICATION;
      }

      // Check if authorization error
      if (
        apolloError.graphQLErrors?.some(
          (err) => err.extensions?.code === 'FORBIDDEN',
        )
      ) {
        return ErrorCategory.AUTHORIZATION;
      }

      // Network error
      if (apolloError.networkError) {
        return ErrorCategory.NETWORK;
      }

      return ErrorCategory.GRAPHQL;
    }

    // Form validation error
    if ('type' in error && error.type === 'validation') {
      return ErrorCategory.VALIDATION;
    }
  }

  // AbortError
  if (error instanceof Error && error.name === 'AbortError') {
    return ErrorCategory.NETWORK;
  }

  return ErrorCategory.UNKNOWN;
}

/**
 * Get severity level based on error category
 */
function getSeverity(category: ErrorCategory): ErrorSeverity {
  switch (category) {
    case ErrorCategory.AUTHENTICATION:
    case ErrorCategory.AUTHORIZATION:
      return ErrorSeverity.WARNING;

    case ErrorCategory.VALIDATION:
      return ErrorSeverity.INFO;

    case ErrorCategory.NETWORK:
      return ErrorSeverity.WARNING;

    case ErrorCategory.COMPONENT:
    case ErrorCategory.RUNTIME:
      return ErrorSeverity.ERROR;

    default:
      return ErrorSeverity.ERROR;
  }
}

/**
 * Determine if error is retryable
 */
function isRetryable(category: ErrorCategory): boolean {
  switch (category) {
    case ErrorCategory.NETWORK:
    case ErrorCategory.GRAPHQL:
      return true;

    case ErrorCategory.AUTHENTICATION:
    case ErrorCategory.AUTHORIZATION:
    case ErrorCategory.VALIDATION:
      return false;

    default:
      return true;
  }
}

/**
 * Extract error details for logging
 */
function extractErrorDetails(error: unknown): Record<string, unknown> {
  if (error instanceof Error) {
    return {
      name: error.name,
      message: error.message,
      stack: error.stack,
    };
  }

  if (error && typeof error === 'object') {
    return { ...error };
  }

  return { error };
}

/**
 * Determine if error should be displayed to user
 */
export function shouldDisplayError(error: AppError): boolean {
  // Don't display AbortError
  if (
    error.originalError instanceof Error &&
    error.originalError.name === 'AbortError'
  ) {
    return false;
  }

  // Don't display token refresh errors (handled by auth system)
  if (
    error.message.includes('Refresh token not found') ||
    error.message.includes('Invalid refresh token')
  ) {
    return false;
  }

  return true;
}

/**
 * Get recovery action for error
 */
export function getRecoveryAction(
  error: AppError,
  t: (key: string) => string,
): RecoveryAction | undefined {
  switch (error.category) {
    case ErrorCategory.AUTHENTICATION:
      return {
        type: 'LOGOUT',
        label: t('errors.actions.relogin'),
        handler: () => {
          window.location.href = '/login';
        },
      };

    case ErrorCategory.NETWORK:
      return {
        type: 'RETRY',
        label: t('errors.actions.retry'),
        handler: () => {
          window.location.reload();
        },
      };

    default:
      return undefined;
  }
}
