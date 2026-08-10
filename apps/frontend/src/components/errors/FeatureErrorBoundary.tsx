'use client';

import { Component, ErrorInfo, ReactNode } from 'react';
import { AlertMessage } from '@/components/molecules/AlertMessage';
import { logError } from '@/lib/error-tracking';
import { ErrorCategory, ErrorSeverity } from '@/types/errors';
import type { AppError } from '@/types/errors';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
  featureName?: string;
  onError?: (error: AppError) => void;
  showError?: boolean;
  /**
   * Custom error message to display
   */
  errorMessage?: string;
  /**
   * Whether to show retry button
   */
  showRetry?: boolean;
}

interface State {
  hasError: boolean;
  error: AppError | null;
}

/**
 * FeatureErrorBoundary - Isolates errors within feature modules
 *
 * This component catches errors in specific features without crashing
 * the entire application. It allows users to continue using other parts
 * of the app while displaying a friendly error message for the failed feature.
 *
 * Features:
 * - Isolates feature-level errors
 * - Displays inline error message
 * - Provides retry functionality
 * - Logs errors for debugging
 * - Can be customized per feature
 *
 * @example
 * ```tsx
 * <FeatureErrorBoundary
 *   featureName="User Dashboard"
 *   showRetry
 *   errorMessage="Unable to load dashboard"
 * >
 *   <DashboardFeature />
 * </FeatureErrorBoundary>
 * ```
 */
export class FeatureErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): State {
    const appError: AppError = {
      id: crypto.randomUUID(),
      category: ErrorCategory.COMPONENT,
      severity: ErrorSeverity.ERROR,
      originalError: error,
      message: error.message,
      timestamp: new Date(),
      location: undefined,
      retryable: true,
    };

    return { hasError: true, error: appError };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    const appError: AppError = {
      id: crypto.randomUUID(),
      category: ErrorCategory.COMPONENT,
      severity: ErrorSeverity.ERROR,
      originalError: error,
      message: error.message,
      timestamp: new Date(),
      location: this.props.featureName,
      retryable: true,
      details: {
        componentStack: errorInfo.componentStack,
      },
    };

    console.error(
      `[FeatureErrorBoundary ${this.props.featureName || 'Unknown'}]`,
      error,
      errorInfo,
    );

    // Log error to tracking service
    logError(appError);

    // Call custom onError callback
    this.props.onError?.(appError);
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

      // Hide error if showError is false
      if (this.props.showError === false) {
        return null;
      }

      // Display error message
      const errorMessage =
        this.props.errorMessage ||
        (this.props.featureName
          ? `Error in ${this.props.featureName}`
          : 'An error occurred in this feature');

      return (
        <AlertMessage
          severity="error"
          title={errorMessage}
          showRetry={this.props.showRetry !== false}
          onRetry={this.handleReset}
        >
          {this.state.error?.message || 'An unexpected error occurred'}
        </AlertMessage>
      );
    }

    return this.props.children;
  }
}
