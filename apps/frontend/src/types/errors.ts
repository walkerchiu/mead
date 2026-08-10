/**
 * Error handling types and interfaces
 */

export enum ErrorCategory {
  // Resource loading and request errors
  NETWORK = 'NETWORK',
  VALIDATION = 'VALIDATION',

  // Application errors
  COMPONENT = 'COMPONENT',
  RUNTIME = 'RUNTIME',

  // Business logic errors
  BUSINESS_LOGIC = 'BUSINESS_LOGIC',

  // Unknown errors
  UNKNOWN = 'UNKNOWN',
}

export enum ErrorSeverity {
  // Critical: Application cannot continue
  CRITICAL = 'CRITICAL',

  // Error: Feature cannot work properly, but app can continue
  ERROR = 'ERROR',

  // Warning: Feature is limited but still usable
  WARNING = 'WARNING',

  // Info: Does not affect functionality
  INFO = 'INFO',
}

export interface RecoveryAction {
  // Action type
  type: 'RETRY' | 'REDIRECT' | 'REFRESH' | 'CUSTOM';

  // Action label (shown to user)
  label: string;

  // Action handler function
  handler: () => void | Promise<void>;
}

export interface AppError {
  // Unique identifier
  id: string;

  // Error category
  category: ErrorCategory;

  // Severity level
  severity: ErrorSeverity;

  // Original error
  originalError: unknown;

  // User-friendly message
  message: string;

  // Translation key (for i18n)
  translationKey?: string;

  // Technical details (for logging only)
  details?: Record<string, unknown>;

  // Timestamp
  timestamp: Date;

  // Location (component name, file path, etc.)
  location?: string;

  // Whether error is retryable
  retryable: boolean;

  // Recovery suggestion
  recoveryAction?: RecoveryAction;
}
