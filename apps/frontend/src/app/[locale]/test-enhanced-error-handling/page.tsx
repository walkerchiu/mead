'use client';

import { useState } from 'react';
import { Button, Stack, Typography, Box, Paper, Divider } from '@mui/material';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { FeatureErrorBoundary } from '@/components/errors';
import { useErrorRecovery } from '@/hooks/useErrorRecovery';
import { useFormErrorHandler } from '@/hooks/useFormErrorHandler';
import { AlertMessage } from '@/components/molecules/AlertMessage';
import { FormField } from '@/components/molecules/FormField';

/**
 * Test page for P2 enhanced error handling features
 *
 * This page demonstrates:
 * - FeatureErrorBoundary (error isolation)
 * - useErrorRecovery (smart error recovery)
 * - useFormErrorHandler (form validation with server errors)
 * - Apollo Client retry and timeout (integrated)
 */

// Test component that throws error
function ProblematicFeature({ shouldFail }: { shouldFail: boolean }) {
  if (shouldFail) {
    throw new Error('Feature failed intentionally');
  }
  return (
    <Box sx={{ p: 2, bgcolor: 'success.light', borderRadius: 1 }}>
      <Typography variant="body1">✅ Feature is working correctly!</Typography>
    </Box>
  );
}

// Form validation schema
const testFormSchema = z.object({
  email: z.string().email('Invalid email address'),
  username: z.string().min(3, 'Username must be at least 3 characters'),
});

type TestFormData = z.infer<typeof testFormSchema>;

export default function TestEnhancedErrorHandlingPage() {
  const [featureShouldFail, setFeatureShouldFail] = useState(false);
  const { error, handleError, retry, isRecovering } = useErrorRecovery();

  // Form setup
  const {
    register,
    handleSubmit,
    setError,
    formState: { errors },
  } = useForm<TestFormData>({
    resolver: zodResolver(testFormSchema),
  });

  const { handleFormError, handleFieldErrors } = useFormErrorHandler({
    setError,
  });

  // Test 1: FeatureErrorBoundary
  const testFeatureErrorBoundary = () => {
    setFeatureShouldFail(true);
  };

  const resetFeature = () => {
    setFeatureShouldFail(false);
  };

  // Test 2: Error Recovery with retry
  const testErrorRecovery = async () => {
    let attemptCount = 0;

    const unreliableOperation = async () => {
      attemptCount++;
      if (attemptCount < 3) {
        throw new Error(`Operation failed (attempt ${attemptCount})`);
      }
      return 'Success!';
    };

    try {
      await unreliableOperation();
    } catch (err) {
      handleError(err, 'Operation failed, you can retry');
    }
  };

  // Test 3: Form validation with server error simulation
  const onSubmit = async (_data: TestFormData) => {
    try {
      // Simulate server validation error
      const mockServerError = {
        graphQLErrors: [
          {
            extensions: {
              code: 'BAD_USER_INPUT',
              validationErrors: [
                {
                  field: 'username',
                  message: 'Username already taken',
                },
              ],
            },
          },
        ],
      };

      throw mockServerError;
    } catch (error) {
      handleFormError(error);
    }
  };

  const onFormError = () => {
    handleFieldErrors(errors);
  };

  return (
    <Box sx={{ p: 4, maxWidth: 1200, mx: 'auto' }}>
      <Typography variant="h4" gutterBottom>
        Enhanced Error Handling Test (P2)
      </Typography>

      <Typography variant="body1" color="text.secondary" paragraph>
        This page demonstrates the enhanced error handling features implemented
        in P2.
      </Typography>

      <Stack spacing={3}>
        {/* Test 1: FeatureErrorBoundary */}
        <Paper sx={{ p: 3 }}>
          <Typography variant="h6" gutterBottom>
            Test 1: FeatureErrorBoundary
          </Typography>
          <Typography variant="body2" color="text.secondary" paragraph>
            Isolates errors within features without crashing the entire app.
          </Typography>

          <FeatureErrorBoundary featureName="Test Feature" showRetry>
            <ProblematicFeature shouldFail={featureShouldFail} />
          </FeatureErrorBoundary>

          <Box sx={{ mt: 2, display: 'flex', gap: 2 }}>
            <Button
              variant="contained"
              onClick={testFeatureErrorBoundary}
              disabled={featureShouldFail}
            >
              Trigger Feature Error
            </Button>
            <Button variant="outlined" onClick={resetFeature}>
              Reset Feature
            </Button>
          </Box>
        </Paper>

        {/* Test 2: Error Recovery */}
        <Paper sx={{ p: 3 }}>
          <Typography variant="h6" gutterBottom>
            Test 2: Smart Error Recovery
          </Typography>
          <Typography variant="body2" color="text.secondary" paragraph>
            Demonstrates error recovery with retry functionality.
          </Typography>

          {error && (
            <AlertMessage
              severity="error"
              showRetry={error.retryable}
              onRetry={() =>
                retry(async () => {
                  // Simulate successful retry
                  console.log('Retrying operation...');
                })
              }
              sx={{ mb: 2 }}
            >
              {error.message}
            </AlertMessage>
          )}

          <Button
            variant="contained"
            onClick={testErrorRecovery}
            disabled={isRecovering}
          >
            {isRecovering ? 'Recovering...' : 'Test Error Recovery'}
          </Button>
        </Paper>

        {/* Test 3: Form Error Handling */}
        <Paper sx={{ p: 3 }}>
          <Typography variant="h6" gutterBottom>
            Test 3: Form Error Handling
          </Typography>
          <Typography variant="body2" color="text.secondary" paragraph>
            Demonstrates form validation with server-side error handling.
          </Typography>

          <form onSubmit={handleSubmit(onSubmit, onFormError)}>
            <Stack spacing={2}>
              <FormField
                {...register('email')}
                label="Email"
                type="email"
                error={errors.email}
                helperText="Enter your email address"
              />

              <FormField
                {...register('username')}
                label="Username"
                error={errors.username}
                helperText="Enter a username (will simulate server error)"
              />

              <Button type="submit" variant="contained">
                Submit Form
              </Button>
            </Stack>
          </form>
        </Paper>

        <Divider />

        {/* Apollo Client Features */}
        <Paper sx={{ p: 3 }}>
          <Typography variant="h6" gutterBottom>
            Apollo Client Enhancements
          </Typography>
          <Typography variant="body2" color="text.secondary" paragraph>
            The following features are automatically integrated:
          </Typography>

          <Stack spacing={1}>
            <Typography variant="body2">
              ✅ <strong>Retry Link:</strong> Automatically retries failed
              network requests with exponential backoff (max 3 attempts)
            </Typography>
            <Typography variant="body2">
              ✅ <strong>Timeout Link:</strong> Automatically cancels requests
              that exceed 30 seconds (configurable per request)
            </Typography>
            <Typography variant="body2">
              ✅ <strong>Smart Filtering:</strong> Doesn't retry authentication
              or validation errors
            </Typography>
          </Stack>
        </Paper>

        {/* Usage Examples */}
        <Paper sx={{ p: 3, bgcolor: 'grey.50' }}>
          <Typography variant="h6" gutterBottom>
            Quick Usage Guide
          </Typography>

          <Typography variant="subtitle2" gutterBottom sx={{ mt: 2 }}>
            1. Wrap features with FeatureErrorBoundary:
          </Typography>
          <Box
            component="pre"
            sx={{
              p: 2,
              bgcolor: 'background.paper',
              borderRadius: 1,
              overflow: 'auto',
              fontSize: '0.875rem',
            }}
          >
            {`<FeatureErrorBoundary featureName="My Feature">
  <MyFeature />
</FeatureErrorBoundary>`}
          </Box>

          <Typography variant="subtitle2" gutterBottom sx={{ mt: 2 }}>
            2. Use error recovery in components:
          </Typography>
          <Box
            component="pre"
            sx={{
              p: 2,
              bgcolor: 'background.paper',
              borderRadius: 1,
              overflow: 'auto',
              fontSize: '0.875rem',
            }}
          >
            {`const { error, handleError, retry } = useErrorRecovery();

try {
  await action();
} catch (err) {
  handleError(err);
}`}
          </Box>

          <Typography variant="subtitle2" gutterBottom sx={{ mt: 2 }}>
            3. Handle form errors:
          </Typography>
          <Box
            component="pre"
            sx={{
              p: 2,
              bgcolor: 'background.paper',
              borderRadius: 1,
              overflow: 'auto',
              fontSize: '0.875rem',
            }}
          >
            {`const { handleFormError } = useFormErrorHandler({ setError });

try {
  await mutation();
} catch (error) {
  handleFormError(error);
}`}
          </Box>
        </Paper>
      </Stack>
    </Box>
  );
}
