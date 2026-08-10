import * as Sentry from '@sentry/nextjs';
import type { AppError, ErrorSeverity } from '@/types/errors';
import type { ErrorTrackingService } from './error-tracking';

/**
 * Sentry Error Tracking Service
 *
 * Implements ErrorTrackingService interface for Sentry integration.
 * Automatically captures and reports errors to Sentry in production.
 */
export class SentryService implements ErrorTrackingService {
  private isInitialized: boolean = false;

  constructor() {
    this.initialize();
  }

  /**
   * Initialize Sentry SDK
   */
  private initialize() {
    // Only initialize in production or when DSN is provided
    if (!process.env.NEXT_PUBLIC_SENTRY_DSN) {
      console.log('[Sentry] ⚠️  DSN not provided, skipping initialization');
      return;
    }

    try {
      Sentry.init({
        dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,
        environment: process.env.NODE_ENV,

        // Performance Monitoring
        tracesSampleRate: process.env.NODE_ENV === 'production' ? 0.1 : 1.0,

        // Session Replay
        replaysSessionSampleRate: 0.1, // 10% of sessions
        replaysOnErrorSampleRate: 1.0, // 100% of sessions with errors

        // Enable debug mode in development
        debug: process.env.NODE_ENV === 'development',

        // Filter errors before sending
        beforeSend: (event, hint) => {
          const error = hint.originalException;

          // Don't send AbortError
          if (error instanceof Error && error.name === 'AbortError') {
            return null;
          }

          return event;
        },

        // Integrations
        integrations: [
          Sentry.replayIntegration({
            maskAllText: false,
            blockAllMedia: false,
          }),
        ],
      });

      this.isInitialized = true;
      console.log('[Sentry] ✅ Initialized');
    } catch (error) {
      console.error('[Sentry] ❌ Failed to initialize:', error);
    }
  }

  /**
   * Capture error to Sentry
   */
  captureError(error: AppError): void {
    if (!this.isInitialized) {
      return;
    }

    Sentry.withScope((scope) => {
      // Set error level
      scope.setLevel(this.mapSeverityToSentryLevel(error.severity));

      // Set tags
      scope.setTag('error_category', error.category);
      scope.setTag('error_severity', error.severity);

      if (error.location) {
        scope.setTag('location', error.location);
      }

      // Set fingerprint for grouping similar errors
      scope.setFingerprint([error.category, error.message]);

      // Set extra context
      if (error.details) {
        scope.setContext('error_details', error.details);
      }

      scope.setContext('error_info', {
        id: error.id,
        timestamp: error.timestamp.toISOString(),
        retryable: error.retryable,
        translationKey: error.translationKey,
      });

      // Capture exception
      if (error.originalError instanceof Error) {
        Sentry.captureException(error.originalError);
      } else {
        Sentry.captureMessage(error.message, 'error');
      }
    });
  }

  /**
   * Capture message to Sentry
   */
  captureMessage(message: string, level: 'info' | 'warning' | 'error'): void {
    if (!this.isInitialized) {
      return;
    }

    const sentryLevel = this.mapLogLevelToSentryLevel(level);
    Sentry.captureMessage(message, sentryLevel);
  }

  /**
   * Set user information
   */
  setUser(user: { id: string; email?: string; username?: string }): void {
    if (!this.isInitialized) {
      return;
    }

    Sentry.setUser({
      id: user.id,
      email: user.email,
      username: user.username || user.email?.split('@')[0],
    });
  }

  /**
   * Set context information
   */
  setContext(key: string, value: unknown): void {
    if (!this.isInitialized) {
      return;
    }

    Sentry.setContext(key, value as Record<string, unknown>);
  }

  /**
   * Clear user context
   */
  clearUser(): void {
    if (!this.isInitialized) {
      return;
    }

    Sentry.setUser(null);
  }

  /**
   * Map ErrorSeverity to Sentry level
   */
  private mapSeverityToSentryLevel(
    severity: ErrorSeverity,
  ): Sentry.SeverityLevel {
    switch (severity) {
      case 'CRITICAL':
        return 'fatal';
      case 'ERROR':
        return 'error';
      case 'WARNING':
        return 'warning';
      case 'INFO':
        return 'info';
      default:
        return 'error';
    }
  }

  /**
   * Map log level to Sentry level
   */
  private mapLogLevelToSentryLevel(
    level: 'info' | 'warning' | 'error',
  ): Sentry.SeverityLevel {
    switch (level) {
      case 'info':
        return 'info';
      case 'warning':
        return 'warning';
      case 'error':
        return 'error';
      default:
        return 'info';
    }
  }
}

/**
 * Create and export Sentry service instance
 */
export function createSentryService(): SentryService | null {
  // Only create in browser environment
  if (typeof window === 'undefined') {
    return null;
  }

  return new SentryService();
}
