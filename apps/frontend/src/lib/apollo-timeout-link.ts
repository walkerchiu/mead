import { ApolloLink, Observable, FetchResult } from '@apollo/client';
import { validateTimeout } from './apollo.config';

interface TimeoutOptions {
  /**
   * Default timeout in milliseconds
   */
  timeout?: number;
}

/**
 * Create Apollo Client timeout link
 *
 * Features:
 * - Configurable request timeout
 * - Automatic cancellation of timed-out requests
 * - Per-operation timeout override
 * - Proper cleanup of timers
 *
 * @example
 * ```typescript
 * const timeoutLink = createTimeoutLink({ timeout: 30000 });
 *
 * // Use default timeout
 * client.query({ query: MY_QUERY });
 *
 * // Override timeout for specific operation
 * client.query({
 *   query: MY_QUERY,
 *   context: { timeout: 60000 } // 60 seconds
 * });
 * ```
 */
export function createTimeoutLink(options: TimeoutOptions = {}) {
  const { timeout = 30000 } = options; // Default 30 seconds

  return new ApolloLink((operation, forward) => {
    // Allow operation to override timeout with validation
    const contextTimeout = operation.getContext().timeout;
    const operationTimeout =
      contextTimeout !== undefined ? validateTimeout(contextTimeout) : timeout;

    return new Observable<FetchResult>((observer) => {
      // Set timeout
      const timeoutId = setTimeout(() => {
        // Cancel the request
        if (subscription) {
          subscription.unsubscribe();
        }

        // Send timeout error
        const timeoutError = new Error(
          `Request timeout: Operation ${operation.operationName} exceeded ${operationTimeout}ms`,
        );
        timeoutError.name = 'TimeoutError';

        console.error('[TimeoutLink]', timeoutError.message);
        observer.error(timeoutError);
      }, operationTimeout);

      // Execute the request
      const subscription = forward(operation).subscribe({
        next: (result) => {
          // Clear timeout on successful response
          if (timeoutId) {
            clearTimeout(timeoutId);
          }
          observer.next(result);
        },
        error: (error) => {
          // Clear timeout on error
          if (timeoutId) {
            clearTimeout(timeoutId);
          }
          observer.error(error);
        },
        complete: () => {
          // Clear timeout on completion
          if (timeoutId) {
            clearTimeout(timeoutId);
          }
          observer.complete();
        },
      });

      // Cleanup function
      return () => {
        if (timeoutId) {
          clearTimeout(timeoutId);
        }
        if (subscription) {
          subscription.unsubscribe();
        }
      };
    });
  });
}
