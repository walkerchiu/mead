'use client';

import { Component, ErrorInfo, ReactNode } from 'react';
import { ErrorDisplay } from '@/components/molecules/ErrorDisplay';
import { logError } from '@/lib/error-tracking';
import { createAppError } from '@/lib/error-handler';
import { ErrorCategory } from '@/types/errors';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
  onError?: (error: Error, errorInfo: ErrorInfo) => void;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

/**
 * GlobalErrorBoundary - Catches all unhandled React errors
 *
 * This component wraps the entire application and catches any errors
 * that occur during rendering, in lifecycle methods, or in constructors
 * of the whole tree below them.
 *
 * Features:
 * - Displays friendly error page instead of white screen
 * - Logs errors to console in development
 * - Sends errors to tracking service in production
 * - Provides reload option to recover
 */
export class GlobalErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    // Log error details
    console.error('[GlobalErrorBoundary] Caught error:', error, errorInfo);

    // Create app error for tracking
    const appError = createAppError({
      originalError: error,
      category: ErrorCategory.COMPONENT,
      message: error.message,
      location: 'GlobalErrorBoundary',
      details: {
        componentStack: errorInfo.componentStack,
      },
    });

    // Track error
    logError(appError);

    // Call custom onError callback
    this.props.onError?.(error, errorInfo);
  }

  handleReset = () => {
    this.setState({ hasError: false, error: null });
  };

  render() {
    if (this.state.hasError) {
      // Use custom fallback if provided
      if (this.props.fallback) {
        return this.props.fallback;
      }

      // Default error display
      return (
        <ErrorDisplay
          title="Something went wrong"
          message="An unexpected error occurred. Please try refreshing the page."
          severity="error"
          showRetry
          retryText="Reload Page"
          onRetry={() => window.location.reload()}
        />
      );
    }

    return this.props.children;
  }
}
