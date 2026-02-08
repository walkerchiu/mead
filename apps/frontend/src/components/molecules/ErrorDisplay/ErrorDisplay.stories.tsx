import type { Meta, StoryObj } from '@storybook/react';
import React from 'react';
import { ErrorDisplay } from './ErrorDisplay';
import Stack from '@mui/material/Stack';
import Button from '@mui/material/Button';
import HomeIcon from '@mui/icons-material/Home';
import LoginIcon from '@mui/icons-material/Login';
import SettingsIcon from '@mui/icons-material/Settings';

/**
 * ErrorDisplay is a page-level error display component.
 *
 * **Purpose: Page-level error display**
 *
 * ## When to Use
 * - **404 Error**: Page not found
 * - **403 Error**: Insufficient permissions
 * - **500 Error**: Server error
 * - **Network Error**: Unable to connect
 * - **Session Expired**: Need to log in again
 * - **Data Load Failed**: Entire page cannot be displayed
 *
 * ## Severity Levels
 * - **error**: Serious error, requires user action
 * - **warning**: Warning message, may affect functionality
 * - **info**: Information notice, does not affect functionality
 *
 * **Note**: For inline messages within forms or pages, use the AlertMessage component
 *
 * ## Difference from AlertMessage
 * - **ErrorDisplay**: Page-level, occupies large space, large icon (80px), centered display
 * - **AlertMessage**: Inline, lightweight, small icon, suitable for forms and page notifications
 */
const meta = {
  title: 'Molecules/ErrorDisplay',
  component: ErrorDisplay,
  parameters: {
    layout: 'fullscreen',
    docs: {
      description: {
        component:
          'Page-level error display component that occupies large space and displays a large icon and error message in the center. Suitable for entire pages or main content area error notifications. For inline messages within forms, use the AlertMessage component.',
      },
    },
  },
  tags: ['autodocs'],
  argTypes: {
    severity: {
      control: 'select',
      options: ['error', 'warning', 'info'],
      description: 'Error severity',
    },
    showRetry: {
      control: 'boolean',
      description: 'Whether to show retry button',
    },
    iconSize: {
      control: 'number',
      description: 'Icon size (px)',
      table: {
        defaultValue: { summary: '80' },
      },
    },
    minHeight: {
      control: 'text',
      description: 'Minimum height',
      table: {
        defaultValue: { summary: '50vh' },
      },
    },
  },
} satisfies Meta<typeof ErrorDisplay>;

export default meta;
type Story = StoryObj<typeof meta>;

/**
 * 404 Page Not Found
 */
export const PageNotFound: Story = {
  args: {
    title: 'Page Not Found',
    message: 'The page you are looking for does not exist or has been moved.',
    severity: 'error',
    showRetry: true,
    retryText: 'Go Home',
    onRetry: () => alert('Navigating to home...'),
  },
};

/**
 * 403 Access Denied
 */
export const AccessDenied: Story = {
  args: {
    title: 'Access Denied',
    message:
      'You do not have permission to access this page. Please contact your administrator.',
    severity: 'warning',
    showRetry: true,
    retryText: 'Go Back',
  },
};

/**
 * 500 Server Error
 */
export const ServerError: Story = {
  args: {
    title: 'Server Error',
    message:
      'An unexpected error occurred on the server. Our team has been notified and is working to fix the issue.',
    severity: 'error',
    showRetry: true,
    retryText: 'Try Again',
  },
};

/**
 * Network Connection Failed
 */
export const NetworkError: Story = {
  args: {
    title: 'Network Error',
    message:
      'Failed to connect to the server. Please check your internet connection and try again.',
    severity: 'error',
    showRetry: true,
    retryText: 'Retry',
    onRetry: () => alert('Retrying...'),
  },
};

/**
 * Session Expired
 */
export const SessionExpired: Story = {
  args: {
    title: 'Session Expired',
    message: 'Your session has expired. Please log in again to continue.',
    severity: 'warning',
    showRetry: true,
    retryText: 'Log In',
    action: (
      <Button variant="outlined" startIcon={<HomeIcon />}>
        Go Home
      </Button>
    ),
  },
};

/**
 * Data Load Failed
 */
export const DataLoadFailed: Story = {
  args: {
    title: 'Failed to Load Data',
    message:
      'Unable to load the requested data. This might be due to a temporary network issue.',
    severity: 'error',
    showRetry: true,
    retryText: 'Reload',
  },
};

/**
 * Maintenance Notice
 */
export const MaintenanceMode: Story = {
  args: {
    title: 'Under Maintenance',
    message:
      'The system is currently undergoing scheduled maintenance. We will be back shortly.',
    severity: 'info',
    showRetry: true,
    retryText: 'Check Status',
  },
};

/**
 * With Multiple Action Buttons
 */
export const WithMultipleActions: Story = {
  args: {
    title: 'Authentication Required',
    message: 'You need to be logged in to access this page.',
    severity: 'warning',
    showRetry: true,
    retryText: 'Log In',
    action: (
      <Stack direction="row" spacing={2}>
        <Button variant="outlined" startIcon={<HomeIcon />}>
          Go Home
        </Button>
        <Button variant="outlined" startIcon={<SettingsIcon />}>
          Settings
        </Button>
      </Stack>
    ),
  },
};

/**
 * Custom Icon Size
 */
export const CustomIconSize: Story = {
  args: {
    title: 'Custom Icon Size',
    message: 'This error display uses a larger icon (120px).',
    severity: 'error',
    iconSize: 120,
    showRetry: true,
    retryText: 'OK',
  },
};

/**
 * Custom Height
 */
export const CustomHeight: Story = {
  args: {
    title: 'Custom Height',
    message: 'This error display has a smaller minimum height (30vh).',
    severity: 'info',
    minHeight: '30vh',
  },
};

/**
 * All Severity Levels
 */
export const AllSeverities: Story = {
  render: () => (
    <Stack spacing={0}>
      <ErrorDisplay
        title="Error Severity"
        message="This is an error message with high severity."
        severity="error"
        minHeight="33vh"
      />
      <ErrorDisplay
        title="Warning Severity"
        message="This is a warning message with medium severity."
        severity="warning"
        minHeight="33vh"
      />
      <ErrorDisplay
        title="Info Severity"
        message="This is an informational message with low severity."
        severity="info"
        minHeight="34vh"
      />
    </Stack>
  ),
};

/**
 * Real World Example: 404 Page
 */
export const RealWorld404: Story = {
  render: () => (
    <ErrorDisplay
      title="404 - Page Not Found"
      message="Sorry, the page you are looking for does not exist or has been removed."
      severity="error"
      showRetry
      retryText="Go to Home"
      onRetry={() => alert('Navigate to home')}
      action={
        <Button
          variant="outlined"
          onClick={() => alert('Go back to previous page')}
        >
          Go Back
        </Button>
      }
    />
  ),
};

/**
 * Real World Example: Access Denied
 */
export const RealWorldAccessDenied: Story = {
  render: () => (
    <ErrorDisplay
      title="Access Denied"
      message="You do not have permission to access this page. To request access, please contact your administrator."
      severity="warning"
      action={
        <Stack direction="row" spacing={2}>
          <Button
            variant="contained"
            startIcon={<LoginIcon />}
            onClick={() => alert('Switch account')}
          >
            Switch Account
          </Button>
          <Button
            variant="outlined"
            startIcon={<HomeIcon />}
            onClick={() => alert('Go to home')}
          >
            Go Home
          </Button>
        </Stack>
      }
    />
  ),
};

/**
 * Real World Example: Network Error
 */
export const RealWorldNetworkError: Story = {
  render: function NetworkErrorExample() {
    const [retryCount, setRetryCount] = React.useState(0);

    const handleRetry = () => {
      setRetryCount(retryCount + 1);
      alert(`Retry count: ${retryCount + 1}`);
    };

    return (
      <ErrorDisplay
        title="Unable to Connect to Server"
        message="Please check your network connection, or try again later. If the problem persists, please contact technical support."
        severity="error"
        showRetry
        retryText={retryCount > 0 ? `Retry (${retryCount})` : 'Retry'}
        onRetry={handleRetry}
        action={
          <Button variant="outlined" onClick={() => alert('View status page')}>
            Check System Status
          </Button>
        }
      />
    );
  },
};
