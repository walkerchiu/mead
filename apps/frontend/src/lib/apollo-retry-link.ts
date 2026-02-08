import { Observable, FetchResult } from '@apollo/client';
import { onError } from '@apollo/client/link/error';
import type { GraphQLError } from 'graphql';

interface RetryOptions {
  /**
   * Maximum number of retry attempts
   */
  maxRetries?: number;

  /**
   * Initial delay in milliseconds
   */
  initialDelay?: number;

  /**
   * Maximum delay in milliseconds
   */
  maxDelay?: number;

  /**
   * Custom function to determine if error is retryable
   */
  retryIf?: (error: unknown) => boolean;
}

/**
 * Create Apollo Client retry link with exponential backoff
 *
 * Features:
 * - Exponential backoff retry strategy
 * - Configurable retry attempts and delays
 * - Smart retry logic (only retries recoverable errors)
 * - Prevents retry for authentication/authorization errors
 * - Prevents retry for validation errors
 * - Per-operation maxRetries override support
 *
 * @example
 * ```typescript
 * // Create retry link with default configuration
 * const retryLink = createRetryLink({
 *   maxRetries: 3,
 *   initialDelay: 300,
 *   maxDelay: 10000,
 * });
 *
 * // Override maxRetries for specific operation
 * client.query({
 *   query: MY_QUERY,
 *   context: {
 *     maxRetries: 5, // Override default
 *   },
 * });
 * ```
 */
export function createRetryLink(options: RetryOptions = {}) {
  const {
    maxRetries = 3,
    initialDelay = 300,
    maxDelay = 10000,
    retryIf,
  } = options;

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return onError((errorResponse: any) => {
    const { operation, forward, networkError, graphQLErrors } = errorResponse;

    // Don't retry for specific GraphQL error codes
    if (graphQLErrors) {
      const shouldNotRetry = graphQLErrors.some((err: GraphQLError) => {
        const code = err.extensions?.code as string | undefined;
        return (
          code === 'UNAUTHENTICATED' ||
          code === 'FORBIDDEN' ||
          code === 'BAD_USER_INPUT'
        );
      });

      if (shouldNotRetry) {
        console.log(
          `[RetryLink] Not retrying due to error code:`,
          graphQLErrors[0].extensions?.code,
        );
        return;
      }
    }

    // Only retry for network errors or if custom retryIf returns true
    const shouldRetry = networkError || (retryIf && retryIf(networkError));
    if (!shouldRetry) {
      return;
    }

    // Get current retry count from operation context
    const retryCount = operation.getContext().retryCount || 0;

    // Allow per-operation maxRetries override
    const operationMaxRetries = operation.getContext().maxRetries ?? maxRetries;

    if (retryCount >= operationMaxRetries) {
      console.error(
        `[RetryLink] Max retries (${operationMaxRetries}) reached for operation:`,
        operation.operationName,
      );
      return;
    }

    // Calculate delay with exponential backoff
    const delay = Math.min(initialDelay * Math.pow(2, retryCount), maxDelay);

    console.log(
      `[RetryLink] Retrying operation ${operation.operationName} (${retryCount + 1}/${operationMaxRetries}) after ${delay}ms`,
    );

    // Return observable that retries after delay
    return new Observable<FetchResult>((observer) => {
      const timer = setTimeout(() => {
        // Update retry count in context
        operation.setContext({
          retryCount: retryCount + 1,
        });

        // Retry the request
        const subscription = forward(operation).subscribe({
          next: observer.next.bind(observer),
          error: observer.error.bind(observer),
          complete: observer.complete.bind(observer),
        });

        // Cleanup
        return () => {
          clearTimeout(timer);
          subscription.unsubscribe();
        };
      }, delay);

      // Return cleanup function
      return () => {
        clearTimeout(timer);
      };
    });
  });
}
