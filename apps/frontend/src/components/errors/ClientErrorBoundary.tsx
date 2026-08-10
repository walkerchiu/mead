'use client';

import { ReactNode, useEffect } from 'react';
import { GlobalErrorBoundary } from './GlobalErrorBoundary';
import { initGlobalErrorHandlers } from '@/lib/global-error-handler';
import { errorTracker } from '@/lib/error-tracking';
import { createSentryService } from '@/lib/sentry-service';
import { initErrorContext } from '@/lib/error-context';

interface ClientErrorBoundaryProps {
  children: ReactNode;
}

/**
 * Client-side error boundary wrapper
 *
 * This component wraps GlobalErrorBoundary and initializes:
 * - Global error handlers (unhandled promise rejection, window errors)
 * - Sentry error tracking service (if DSN is provided)
 * - Error context (environment and browser information)
 */
export function ClientErrorBoundary({ children }: ClientErrorBoundaryProps) {
  useEffect(() => {
    // Initialize global error handlers
    initGlobalErrorHandlers();

    // Initialize Sentry service
    const sentryService = createSentryService();
    if (sentryService) {
      errorTracker.addService(sentryService);
      console.log('[ClientErrorBoundary] ✅ Sentry service added');
    }

    // Initialize error context
    initErrorContext();
  }, []);

  return <GlobalErrorBoundary>{children}</GlobalErrorBoundary>;
}
