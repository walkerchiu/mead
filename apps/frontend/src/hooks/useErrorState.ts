import { useState, useCallback } from 'react';
import { useSnackbar } from 'notistack';
import { getErrorMessage } from '@/lib/error-utils';
import { createAppError, shouldDisplayError } from '@/lib/error-handler';
import { logError } from '@/lib/error-tracking';
import type { AppError } from '@/types/errors';

interface UseErrorStateOptions {
  defaultMessage?: string;
  showSnackbar?: boolean;
  logError?: boolean;
}

/**
 * Hook for managing error state in components
 *
 * This hook provides a convenient way to handle errors in components:
 * - Automatically creates standardized AppError objects
 * - Optionally displays errors in snackbar
 * - Optionally logs errors to tracking service
 *
 * @example
 * ```tsx
 * const { error, setError, clearError, hasError } = useErrorState();
 *
 * const handleAction = async () => {
 *   try {
 *     await someAction();
 *   } catch (err) {
 *     setError(err, 'Failed to perform action');
 *   }
 * };
 *
 * return (
 *   <>
 *     {hasError && (
 *       <AlertMessage severity="error" onClose={clearError}>
 *         {error?.message}
 *       </AlertMessage>
 *     )}
 *     <Button onClick={handleAction}>Do Action</Button>
 *   </>
 * );
 * ```
 */
export function useErrorState(options: UseErrorStateOptions = {}) {
  const {
    defaultMessage = 'An error occurred',
    showSnackbar = true,
    logError: shouldLog = true,
  } = options;

  const { enqueueSnackbar } = useSnackbar();
  const [error, setError] = useState<AppError | null>(null);

  const setErrorState = useCallback(
    (err: unknown, customMessage?: string) => {
      const appError = createAppError({
        originalError: err,
        message: customMessage || getErrorMessage(err, defaultMessage),
      });

      setError(appError);

      // Log error
      if (shouldLog) {
        logError(appError);
      }

      // Show snackbar
      if (showSnackbar && shouldDisplayError(appError)) {
        enqueueSnackbar(appError.message, {
          variant: 'error',
          autoHideDuration: 5000,
        });
      }
    },
    [defaultMessage, showSnackbar, shouldLog, enqueueSnackbar],
  );

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  return {
    error,
    setError: setErrorState,
    clearError,
    hasError: error !== null,
  };
}
