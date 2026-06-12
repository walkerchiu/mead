import type { Meta, StoryObj } from '@storybook/nextjs';
import React from 'react';
import { ErrorDisplay } from './ErrorDisplay';
import Stack from '@mui/material/Stack';
import Button from '@mui/material/Button';
import HomeIcon from '@mui/icons-material/Home';
import LoginIcon from '@mui/icons-material/Login';
import SettingsIcon from '@mui/icons-material/Settings';

/**
 * ErrorDisplay 是頁面層級的錯誤顯示元件。
 *
 * **用途：頁面層級的錯誤顯示**
 *
 * ## 何時使用
 * - **404 錯誤**：找不到頁面
 * - **403 錯誤**：權限不足
 * - **500 錯誤**：伺服器錯誤
 * - **網路錯誤**：無法連線
 * - **Session 過期**：需要重新登入
 * - **資料載入失敗**：整個頁面無法顯示
 *
 * ## 嚴重程度等級
 * - **error**：嚴重錯誤，需要使用者處理
 * - **warning**：警告訊息，可能影響功能
 * - **info**：資訊提示，不影響功能
 *
 * **注意**：若需表單或頁面內的行內訊息，請使用 AlertMessage 元件
 *
 * ## 與 AlertMessage 的差異
 * - **ErrorDisplay**：頁面層級、佔用較大空間、大型圖示（80px）、置中顯示
 * - **AlertMessage**：行內、輕量、小圖示，適合表單與頁面提示
 */
const meta = {
  title: 'Shared/Molecules/ErrorDisplay',
  component: ErrorDisplay,
  parameters: {
    layout: 'fullscreen',
    docs: {
      description: {
        component:
          '頁面層級的錯誤顯示元件，佔用較大空間，並於中央顯示大型圖示與錯誤訊息。適用於整頁或主要內容區的錯誤提示。若需表單內的行內訊息，請使用 AlertMessage 元件。',
      },
    },
  },
  tags: ['autodocs'],
  argTypes: {
    severity: {
      control: 'select',
      options: ['error', 'warning', 'info'],
      description: '錯誤嚴重程度',
    },
    showRetry: {
      control: 'boolean',
      description: '是否顯示重試按鈕',
    },
    iconSize: {
      control: 'number',
      description: '圖示尺寸（px）',
      table: {
        defaultValue: { summary: '80' },
      },
    },
    minHeight: {
      control: 'text',
      description: '最小高度',
      table: {
        defaultValue: { summary: '50vh' },
      },
    },
  },
} satisfies Meta<typeof ErrorDisplay>;

export default meta;
type Story = StoryObj<typeof meta>;

/**
 * 所有嚴重程度等級
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
 * 404 找不到頁面
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
 * 403 拒絕存取
 */
export const AccessDenied: Story = {
  args: {
    title: 'Access Denied',
    message:
      'You do not have permission to access this page. Please contact your hq.',
    severity: 'warning',
    showRetry: true,
    retryText: 'Go Back',
  },
};

/**
 * 500 伺服器錯誤
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
 * 網路連線失敗
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
 * Session 過期
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
 * 資料載入失敗
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
 * 維護通知
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
 * 含多個操作按鈕
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
 * 自訂圖示尺寸
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
 * 自訂高度
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
 * 實際應用範例：404 頁面
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
 * 實際應用範例：拒絕存取
 */
export const RealWorldAccessDenied: Story = {
  render: () => (
    <ErrorDisplay
      title="Access Denied"
      message="You do not have permission to access this page. To request access, please contact your hq."
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
 * 實際應用範例：網路錯誤
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
