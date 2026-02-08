'use client';

import { useState } from 'react';
import { Button, Stack, Typography, Box, Paper, Chip } from '@mui/material';
import { useErrorState } from '@/hooks/useErrorState';
import { AlertMessage } from '@/components/molecules/AlertMessage';
import { ErrorCategory } from '@/types/errors';
import { createAppError } from '@/lib/error-handler';

/**
 * Test page for error handling system
 *
 * This page allows testing various error scenarios:
 * - Component errors (Error Boundary)
 * - Network errors
 * - Runtime errors
 * - Custom error handling
 */
export default function TestErrorHandlingPage() {
  const { error, setError, clearError, hasError } = useErrorState();
  const [shouldThrow, setShouldThrow] = useState(false);
  const sentryEnabled = !!process.env.NEXT_PUBLIC_SENTRY_DSN;

  // Trigger render error (caught by Error Boundary)
  if (shouldThrow) {
    throw new Error(
      'Test render error - This should be caught by Error Boundary',
    );
  }

  // Test 1: Simple error
  const testSimpleError = () => {
    try {
      throw new Error('This is a simple test error');
    } catch (err) {
      setError(err);
    }
  };

  // Test 2: Network error simulation
  const testNetworkError = async () => {
    try {
      // Simulate network error
      const error = new Error('Network request failed');
      const appError = createAppError({
        originalError: error,
        category: ErrorCategory.NETWORK,
        message:
          'Failed to connect to server. Please check your internet connection.',
      });
      throw appError;
    } catch (err) {
      setError(err);
    }
  };

  // Test 3: Unhandled promise rejection
  const testUnhandledRejection = () => {
    // This should be caught by global error handler
    Promise.reject(new Error('Unhandled promise rejection test'));
  };

  // Test 4: Runtime error
  const testRuntimeError = () => {
    try {
      // @ts-expect-error - Intentionally accessing undefined
      const result = undefined.someMethod();
      console.log(result);
    } catch (err) {
      setError(err, 'Runtime error occurred while executing function');
    }
  };

  // Test 5: GraphQL error simulation
  const testGraphQLError = () => {
    try {
      const mockGraphQLError = {
        graphQLErrors: [
          {
            message: 'User not found',
            extensions: { code: 'NOT_FOUND' },
          },
        ],
      };
      throw mockGraphQLError;
    } catch (err) {
      setError(err);
    }
  };

  // Test 6: Authentication error simulation
  const testAuthError = () => {
    try {
      const mockAuthError = {
        graphQLErrors: [
          {
            message: 'Not authenticated',
            extensions: { code: 'UNAUTHENTICATED' },
          },
        ],
      };
      throw mockAuthError;
    } catch (err) {
      setError(err);
    }
  };

  // Test 7: Component render error
  const testRenderError = () => {
    setShouldThrow(true);
  };

  return (
    <Box sx={{ p: 4, maxWidth: 1200, mx: 'auto' }}>
      <Box sx={{ mb: 3, display: 'flex', alignItems: 'center', gap: 2 }}>
        <Typography variant="h4">Error Handling System Test</Typography>
        <Chip
          label={sentryEnabled ? 'Sentry: Enabled' : 'Sentry: Disabled'}
          color={sentryEnabled ? 'success' : 'default'}
          size="small"
        />
      </Box>

      <Typography variant="body1" color="text.secondary" paragraph>
        This page allows you to test various error scenarios. Check the browser
        console for detailed error logs.
        {sentryEnabled
          ? ' Errors will be reported to Sentry.'
          : ' Set NEXT_PUBLIC_SENTRY_DSN in .env to enable Sentry error tracking.'}
      </Typography>

      {hasError && (
        <Box sx={{ mb: 3 }}>
          <AlertMessage
            severity="error"
            title="Error Occurred"
            closable
            onClose={clearError}
          >
            {error?.message}
          </AlertMessage>
        </Box>
      )}

      <Stack spacing={2}>
        <Paper sx={{ p: 3 }}>
          <Typography variant="h6" gutterBottom>
            Test 1: Simple Error
          </Typography>
          <Typography variant="body2" color="text.secondary" paragraph>
            Tests basic error handling with try-catch and snackbar notification.
          </Typography>
          <Button variant="contained" onClick={testSimpleError}>
            Trigger Simple Error
          </Button>
        </Paper>

        <Paper sx={{ p: 3 }}>
          <Typography variant="h6" gutterBottom>
            Test 2: Network Error
          </Typography>
          <Typography variant="body2" color="text.secondary" paragraph>
            Simulates a network error with user-friendly message.
          </Typography>
          <Button variant="contained" onClick={testNetworkError}>
            Trigger Network Error
          </Button>
        </Paper>

        <Paper sx={{ p: 3 }}>
          <Typography variant="h6" gutterBottom>
            Test 3: Unhandled Promise Rejection
          </Typography>
          <Typography variant="body2" color="text.secondary" paragraph>
            Tests global error handler for unhandled promise rejections. Check
            console.
          </Typography>
          <Button variant="contained" onClick={testUnhandledRejection}>
            Trigger Unhandled Rejection
          </Button>
        </Paper>

        <Paper sx={{ p: 3 }}>
          <Typography variant="h6" gutterBottom>
            Test 4: Runtime Error
          </Typography>
          <Typography variant="body2" color="text.secondary" paragraph>
            Tests handling of JavaScript runtime errors.
          </Typography>
          <Button variant="contained" onClick={testRuntimeError}>
            Trigger Runtime Error
          </Button>
        </Paper>

        <Paper sx={{ p: 3 }}>
          <Typography variant="h6" gutterBottom>
            Test 5: GraphQL Error
          </Typography>
          <Typography variant="body2" color="text.secondary" paragraph>
            Simulates a GraphQL error response.
          </Typography>
          <Button variant="contained" onClick={testGraphQLError}>
            Trigger GraphQL Error
          </Button>
        </Paper>

        <Paper sx={{ p: 3 }}>
          <Typography variant="h6" gutterBottom>
            Test 6: Authentication Error
          </Typography>
          <Typography variant="body2" color="text.secondary" paragraph>
            Simulates an authentication error (UNAUTHENTICATED).
          </Typography>
          <Button variant="contained" onClick={testAuthError}>
            Trigger Auth Error
          </Button>
        </Paper>

        <Paper sx={{ p: 3 }}>
          <Typography variant="h6" gutterBottom>
            Test 7: Component Render Error
          </Typography>
          <Typography variant="body2" color="text.secondary" paragraph>
            Tests Error Boundary by throwing error during render. This will
            crash the page.
          </Typography>
          <Button variant="contained" color="error" onClick={testRenderError}>
            Trigger Render Error (Will Crash)
          </Button>
        </Paper>
      </Stack>
    </Box>
  );
}
