import { createAppError, shouldDisplayError } from './error-handler';
import { logError } from './error-tracking';
import { ErrorCategory } from '@/types/errors';

let isInitialized = false;

/**
 * Initialize global error handlers
 *
 * This function sets up handlers for:
 * 1. Unhandled Promise rejections
 * 2. Global window errors
 *
 * These handlers catch errors that are not caught by try-catch blocks
 * or Error Boundaries, ensuring no error goes unnoticed.
 */
export function initGlobalErrorHandlers() {
  if (isInitialized) {
    return;
  }

  // Handle unhandled promise rejections
  window.addEventListener('unhandledrejection', (event) => {
    console.error('[Unhandled Promise Rejection]', event.reason);

    const appError = createAppError({
      originalError: event.reason,
      category: ErrorCategory.RUNTIME,
      location: 'Unhandled Promise Rejection',
    });

    logError(appError);

    // Display error if needed (optional)
    if (shouldDisplayError(appError)) {
      // Could show a toast notification here
      console.error('Unhandled error:', appError.message);
    }

    // Prevent default browser behavior
    event.preventDefault();
  });

  // Handle global window errors
  window.addEventListener('error', (event) => {
    console.error('[Window Error]', event.error);

    const appError = createAppError({
      originalError: event.error,
      category: ErrorCategory.RUNTIME,
      location: `${event.filename}:${event.lineno}:${event.colno}`,
    });

    logError(appError);

    // Prevent default browser behavior
    event.preventDefault();
  });

  isInitialized = true;
  console.log('[GlobalErrorHandler] ✅ Initialized');
}

/**
 * Reset error handlers (useful for testing)
 */
export function resetGlobalErrorHandlers() {
  isInitialized = false;
}
