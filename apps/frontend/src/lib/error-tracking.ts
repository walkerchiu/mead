import type { AppError } from '@/types/errors';

export interface ErrorTrackingService {
  captureError(error: AppError): void;
  captureMessage(message: string, level: 'info' | 'warning' | 'error'): void;
  setUser(user: { id: string; email?: string; username?: string }): void;
  setContext(key: string, value: unknown): void;
}

class ErrorTracker {
  private services: ErrorTrackingService[] = [];
  private isEnabled: boolean;

  constructor() {
    this.isEnabled = process.env.NODE_ENV === 'production';
  }

  addService(service: ErrorTrackingService) {
    this.services.push(service);
  }

  logError(error: AppError) {
    // Development: Log to console
    if (process.env.NODE_ENV === 'development') {
      console.group(`[Error] ${error.category} - ${error.severity}`);
      console.error('Message:', error.message);
      console.error('Location:', error.location || 'Unknown');
      console.error('Original Error:', error.originalError);
      if (error.details) {
        console.error('Details:', error.details);
      }
      console.groupEnd();
    }

    // Production: Send to error tracking services
    if (this.isEnabled) {
      this.services.forEach((service) => {
        try {
          service.captureError(error);
        } catch (err) {
          console.error('[ErrorTracker] Failed to capture error:', err);
        }
      });
    }
  }

  logMessage(message: string, level: 'info' | 'warning' | 'error' = 'info') {
    if (process.env.NODE_ENV === 'development') {
      const consoleMethod = level === 'warning' ? 'warn' : level;
      console[consoleMethod](`[${level.toUpperCase()}]`, message);
    }

    if (this.isEnabled) {
      this.services.forEach((service) => {
        try {
          service.captureMessage(message, level);
        } catch (err) {
          console.error('[ErrorTracker] Failed to capture message:', err);
        }
      });
    }
  }

  setUser(user: { id: string; email?: string; username?: string }) {
    this.services.forEach((service) => {
      try {
        service.setUser(user);
      } catch (err) {
        console.error('[ErrorTracker] Failed to set user:', err);
      }
    });
  }

  setContext(key: string, value: unknown) {
    this.services.forEach((service) => {
      try {
        service.setContext(key, value);
      } catch (err) {
        console.error('[ErrorTracker] Failed to set context:', err);
      }
    });
  }
}

// Singleton instance
export const errorTracker = new ErrorTracker();

// Convenience functions
export const logError = (error: AppError) => errorTracker.logError(error);
export const logMessage = (
  message: string,
  level?: 'info' | 'warning' | 'error',
) => errorTracker.logMessage(message, level);
export const setUser = (user: {
  id: string;
  email?: string;
  username?: string;
}) => errorTracker.setUser(user);
export const setContext = (key: string, value: unknown) =>
  errorTracker.setContext(key, value);
