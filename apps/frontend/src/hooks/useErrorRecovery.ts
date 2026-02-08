import { useState, useCallback } from 'react';
import { useSnackbar } from 'notistack';
import type { AppError, RecoveryAction } from '@/types/errors';
import { createAppError, getRecoveryAction } from '@/lib/error-handler';
import { logError } from '@/lib/error-tracking';

/**
 * Hook for error recovery with smart recovery suggestions
 *
 * Features:
 * - Automatic error detection and classification
 * - Smart recovery action suggestions
 * - Track recovery success rate
 * - Display user-friendly error messages
 *
 * @example
 * ```tsx
 * const { error, handleError, recover, isRecovering } = useErrorRecovery();
 *
 * const handleAction = async () => {
 *   try {
 *     await someAction();
 *   } catch (err) {
 *     handleError(err, 'Failed to perform action');
 *   }
 * };
 *
 * return (
 *   <>
 *     {error && (
 *       <AlertMessage
 *         severity="error"
 *         showRetry={error.retryable}
 *         onRetry={() => recover()}
 *       >
 *         {error.message}
 *       </AlertMessage>
 *     )}
 *     <Button onClick={handleAction} disabled={isRecovering}>
 *       Do Action
 *     </Button>
 *   </>
 * );
 * ```
 */
export function useErrorRecovery() {
  const { enqueueSnackbar } = useSnackbar();
  const [error, setError] = useState<AppError | null>(null);
  const [isRecovering, setIsRecovering] = useState(false);

  /**
   * Handle error and create AppError
   */
  const handleError = useCallback(
    (err: unknown, customMessage?: string) => {
      const appError = createAppError({
        originalError: err,
        message: customMessage,
      });

      setError(appError);
      logError(appError);

      // Display error message
      if (appError.message) {
        enqueueSnackbar(appError.message, {
          variant: 'error',
          autoHideDuration: 5000,
        });
      }
    },
    [enqueueSnackbar],
  );

  /**
   * Attempt to recover from error
   */
  const recover = useCallback(
    async (customAction?: RecoveryAction) => {
      if (!error) {
        return;
      }

      setIsRecovering(true);

      try {
        // Use custom action or get default recovery action
        const recoveryAction =
          customAction || getRecoveryAction(error, (key) => key);

        if (recoveryAction) {
          console.log(
            '[ErrorRecovery] Attempting recovery:',
            recoveryAction.type,
          );

          // Execute recovery action
          await recoveryAction.handler();

          // Clear error on success
          setError(null);

          enqueueSnackbar('Recovery successful', {
            variant: 'success',
            autoHideDuration: 2000,
          });
        } else {
          console.warn('[ErrorRecovery] No recovery action available');
        }
      } catch (err) {
        console.error('[ErrorRecovery] Recovery failed:', err);
        enqueueSnackbar('Recovery failed', {
          variant: 'error',
          autoHideDuration: 3000,
        });
      } finally {
        setIsRecovering(false);
      }
    },
    [error, enqueueSnackbar],
  );

  /**
   * Clear error state
   */
  const clearError = useCallback(() => {
    setError(null);
  }, []);

  /**
   * Retry with custom handler
   */
  const retry = useCallback(
    async (retryHandler: () => Promise<void>) => {
      setIsRecovering(true);

      try {
        await retryHandler();

        // Clear error on success
        setError(null);

        enqueueSnackbar('Operation successful', {
          variant: 'success',
          autoHideDuration: 2000,
        });
      } catch (err) {
        // Update with new error
        handleError(err);
      } finally {
        setIsRecovering(false);
      }
    },
    [handleError, enqueueSnackbar],
  );

  return {
    error,
    isRecovering,
    handleError,
    recover,
    clearError,
    retry,
  };
}
