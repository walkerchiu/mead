import type { Meta, StoryObj } from '@storybook/nextjs';
import { SnackbarProvider, useSnackbar } from 'notistack';
import { SnackbarWithProgress } from './SnackbarWithProgress';
import { Button, Box, Stack, Typography, Paper } from '@mui/material';

/**
 * SnackbarWithProgress provides visual feedback with a countdown progress bar.
 *
 * Features:
 * - Visual countdown with linear progress bar
 * - Manual close button
 * - Auto-dismiss after duration
 * - Supports all Material-UI Alert severities
 * - Smooth animations
 */
const meta = {
  title: 'HQ Scope/Molecules/SnackbarWithProgress',
  component: SnackbarWithProgress,
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component:
          'A custom snackbar component with countdown progress bar. Shows remaining time visually and allows manual dismissal.',
      },
    },
  },
  tags: ['autodocs'],
  decorators: [
    (Story) => (
      <SnackbarProvider
        maxSnack={3}
        anchorOrigin={{
          vertical: 'top',
          horizontal: 'right',
        }}
        autoHideDuration={5000}
        Components={{
          success: SnackbarWithProgress,
          error: SnackbarWithProgress,
          warning: SnackbarWithProgress,
          info: SnackbarWithProgress,
          default: SnackbarWithProgress,
        }}
      >
        <Story />
      </SnackbarProvider>
    ),
  ],
} satisfies Meta<typeof SnackbarWithProgress>;

export default meta;
type Story = StoryObj<typeof meta>;

/**
 * Demo component to trigger snackbars
 */
function SnackbarDemo({
  variant,
  message,
  duration,
}: {
  variant: 'success' | 'error' | 'warning' | 'info' | 'default';
  message: string;
  duration?: number;
}) {
  const { enqueueSnackbar } = useSnackbar();

  const handleClick = () => {
    enqueueSnackbar(message, {
      variant,
      autoHideDuration: duration,
    });
  };

  return (
    <Button variant="contained" onClick={handleClick}>
      Show {variant} notification
    </Button>
  );
}

/**
 * Success notification with progress bar
 */
export const Success: Story = {
  render: () => (
    <SnackbarDemo
      variant="success"
      message="Operation completed successfully!"
    />
  ),
};

/**
 * Error notification with progress bar
 */
export const Error: Story = {
  render: () => (
    <SnackbarDemo
      variant="error"
      message="An error occurred. Please try again."
    />
  ),
};

/**
 * Warning notification with progress bar
 */
export const Warning: Story = {
  render: () => (
    <SnackbarDemo
      variant="warning"
      message="This action may have consequences."
    />
  ),
};

/**
 * Info notification with progress bar
 */
export const Info: Story = {
  render: () => (
    <SnackbarDemo
      variant="info"
      message="Did you know? This is an info message."
    />
  ),
};

/**
 * Short duration (3 seconds)
 */
export const ShortDuration: Story = {
  render: () => (
    <SnackbarDemo
      variant="success"
      message="Quick notification (3s)"
      duration={3000}
    />
  ),
};

/**
 * Long duration (10 seconds)
 */
export const LongDuration: Story = {
  render: () => (
    <SnackbarDemo
      variant="info"
      message="This stays longer (10s)"
      duration={10000}
    />
  ),
};

/**
 * Multiple notifications
 */
export const Multiple: Story = {
  render: () => {
    const { enqueueSnackbar } = useSnackbar();

    const handleMultiple = () => {
      enqueueSnackbar('First notification', { variant: 'success' });
      setTimeout(() => {
        enqueueSnackbar('Second notification', { variant: 'info' });
      }, 500);
      setTimeout(() => {
        enqueueSnackbar('Third notification', { variant: 'warning' });
      }, 1000);
    };

    return (
      <Button variant="contained" onClick={handleMultiple}>
        Show 3 notifications
      </Button>
    );
  },
};

/**
 * All variants comparison
 */
export const AllVariants: Story = {
  render: () => {
    const { enqueueSnackbar } = useSnackbar();

    const handleAll = () => {
      enqueueSnackbar('Success message', { variant: 'success' });
      setTimeout(() => {
        enqueueSnackbar('Error message', { variant: 'error' });
      }, 300);
      setTimeout(() => {
        enqueueSnackbar('Warning message', { variant: 'warning' });
      }, 600);
      setTimeout(() => {
        enqueueSnackbar('Info message', { variant: 'info' });
      }, 900);
    };

    return (
      <Button variant="contained" onClick={handleAll}>
        Show all variants
      </Button>
    );
  },
};

/**
 * Real-world login example
 */
export const LoginExample: Story = {
  render: () => {
    const { enqueueSnackbar } = useSnackbar();

    const handleLogin = () => {
      enqueueSnackbar('Login successful! Redirecting...', {
        variant: 'success',
      });
    };

    const handleError = () => {
      enqueueSnackbar('Invalid email or password', { variant: 'error' });
    };

    return (
      <Stack spacing={2}>
        <Button variant="contained" color="primary" onClick={handleLogin}>
          Simulate Login Success
        </Button>
        <Button variant="contained" color="error" onClick={handleError}>
          Simulate Login Error
        </Button>
      </Stack>
    );
  },
};

/**
 * Interactive playground
 */
export const Interactive: Story = {
  render: () => {
    const { enqueueSnackbar } = useSnackbar();

    return (
      <Paper sx={{ p: 3, maxWidth: 400 }}>
        <Typography variant="h6" gutterBottom>
          Notification Playground
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
          Click the buttons below to see notifications with countdown progress
          bars
        </Typography>
        <Stack spacing={1}>
          <Button
            variant="contained"
            color="success"
            fullWidth
            onClick={() =>
              enqueueSnackbar('Operation completed!', { variant: 'success' })
            }
          >
            Success
          </Button>
          <Button
            variant="contained"
            color="error"
            fullWidth
            onClick={() =>
              enqueueSnackbar('Something went wrong!', { variant: 'error' })
            }
          >
            Error
          </Button>
          <Button
            variant="contained"
            color="warning"
            fullWidth
            onClick={() =>
              enqueueSnackbar('Please be careful!', { variant: 'warning' })
            }
          >
            Warning
          </Button>
          <Button
            variant="contained"
            color="info"
            fullWidth
            onClick={() =>
              enqueueSnackbar('Here is some information', { variant: 'info' })
            }
          >
            Info
          </Button>
        </Stack>
      </Paper>
    );
  },
};

/**
 * Features demonstration
 */
export const Features: Story = {
  render: () => {
    const { enqueueSnackbar } = useSnackbar();

    return (
      <Box sx={{ maxWidth: 600 }}>
        <Typography variant="h6" gutterBottom>
          Snackbar Features
        </Typography>
        <Stack spacing={2}>
          <Paper sx={{ p: 2 }}>
            <Typography variant="subtitle2" gutterBottom>
              ✨ Visual Countdown
            </Typography>
            <Typography variant="body2" color="text.secondary" paragraph>
              Watch the progress bar decrease as the notification approaches
              auto-close
            </Typography>
            <Button
              size="small"
              variant="outlined"
              onClick={() =>
                enqueueSnackbar('Notice the progress bar!', {
                  variant: 'info',
                })
              }
            >
              Try it
            </Button>
          </Paper>

          <Paper sx={{ p: 2 }}>
            <Typography variant="subtitle2" gutterBottom>
              ❌ Manual Dismissal
            </Typography>
            <Typography variant="body2" color="text.secondary" paragraph>
              Click the X button on the notification to close it immediately
            </Typography>
            <Button
              size="small"
              variant="outlined"
              onClick={() =>
                enqueueSnackbar('You can close this manually', {
                  variant: 'success',
                })
              }
            >
              Try it
            </Button>
          </Paper>

          <Paper sx={{ p: 2 }}>
            <Typography variant="subtitle2" gutterBottom>
              ⏱️ Auto-Close
            </Typography>
            <Typography variant="body2" color="text.secondary" paragraph>
              Notifications automatically close after 5 seconds
            </Typography>
            <Button
              size="small"
              variant="outlined"
              onClick={() =>
                enqueueSnackbar('I will close in 5 seconds', {
                  variant: 'warning',
                })
              }
            >
              Try it
            </Button>
          </Paper>
        </Stack>
      </Box>
    );
  },
};
