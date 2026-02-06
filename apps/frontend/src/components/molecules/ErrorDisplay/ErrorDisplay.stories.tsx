import type { Meta, StoryObj } from '@storybook/react';
import React from 'react';
import { ErrorDisplay } from './ErrorDisplay';
import Stack from '@mui/material/Stack';
import Button from '@mui/material/Button';
import HomeIcon from '@mui/icons-material/Home';
import LoginIcon from '@mui/icons-material/Login';
import SettingsIcon from '@mui/icons-material/Settings';

/**
 * ErrorDisplay 是頁面級錯誤顯示組件。
 *
 * **用途：頁面級錯誤顯示**
 *
 * ## 使用時機
 * - **404 錯誤**: 頁面未找到
 * - **403 錯誤**: 權限不足
 * - **500 錯誤**: 伺服器錯誤
 * - **網路錯誤**: 無法連線
 * - **Session 過期**: 需要重新登入
 * - **資料載入失敗**: 整個頁面無法顯示
 *
 * ## 嚴重性等級
 * - **error**: 嚴重錯誤，需要用戶操作
 * - **warning**: 警告訊息，可能影響功能
 * - **info**: 資訊提示，不影響功能
 *
 * **注意**：表單內或頁面內的內嵌訊息請使用 AlertMessage 組件
 *
 * ## 與 AlertMessage 的區別
 * - **ErrorDisplay**: 頁面級，佔據大空間，大圖示 (80px)，中央顯示
 * - **AlertMessage**: 內嵌式，輕量級，小圖示，適合表單和頁面內提示
 */
const meta = {
  title: 'Molecules/ErrorDisplay',
  component: ErrorDisplay,
  parameters: {
    layout: 'fullscreen',
    docs: {
      description: {
        component:
          '頁面級錯誤顯示組件，佔據大空間並在中央顯示大圖示和錯誤訊息。適合作為整個頁面或主要內容區域的錯誤提示。表單內的內嵌訊息請使用 AlertMessage 組件。',
      },
    },
  },
  tags: ['autodocs'],
  argTypes: {
    severity: {
      control: 'select',
      options: ['error', 'warning', 'info'],
      description: '錯誤嚴重性',
    },
    showRetry: {
      control: 'boolean',
      description: '是否顯示重試按鈕',
    },
    iconSize: {
      control: 'number',
      description: '圖示大小 (px)',
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
 * 404 頁面未找到
 */
export const PageNotFound: Story = {
  args: {
    title: 'Page Not Found',
    message: 'The page you are looking for does not exist or has been moved.',
    severity: 'error',
    showRetry: true,
    retryText: 'Go Home',
    onRetry: () => alert('返回首頁...'),
  },
};

/**
 * 403 權限不足
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
    onRetry: () => alert('重試中...'),
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
 * 帶多個操作按鈕
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
 * 自訂圖示大小
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
 * 所有嚴重性等級
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
 * 真實世界範例：404 頁面
 */
export const RealWorld404: Story = {
  render: () => (
    <ErrorDisplay
      title="404 - 找不到頁面"
      message="抱歉，您訪問的頁面不存在或已被移除。"
      severity="error"
      showRetry
      retryText="返回首頁"
      onRetry={() => alert('導航到首頁')}
      action={
        <Button variant="outlined" onClick={() => alert('返回上一頁')}>
          返回上一頁
        </Button>
      }
    />
  ),
};

/**
 * 真實世界範例：權限不足
 */
export const RealWorldAccessDenied: Story = {
  render: () => (
    <ErrorDisplay
      title="權限不足"
      message="您沒有權限訪問此頁面。如需訪問，請聯繫管理員申請權限。"
      severity="warning"
      action={
        <Stack direction="row" spacing={2}>
          <Button
            variant="contained"
            startIcon={<LoginIcon />}
            onClick={() => alert('切換帳號')}
          >
            切換帳號
          </Button>
          <Button
            variant="outlined"
            startIcon={<HomeIcon />}
            onClick={() => alert('返回首頁')}
          >
            返回首頁
          </Button>
        </Stack>
      }
    />
  ),
};

/**
 * 真實世界範例：網路錯誤
 */
export const RealWorldNetworkError: Story = {
  render: function NetworkErrorExample() {
    const [retryCount, setRetryCount] = React.useState(0);

    const handleRetry = () => {
      setRetryCount(retryCount + 1);
      alert(`重試次數: ${retryCount + 1}`);
    };

    return (
      <ErrorDisplay
        title="無法連線到伺服器"
        message="請檢查您的網路連線，或稍後再試。如果問題持續發生，請聯繫技術支援。"
        severity="error"
        showRetry
        retryText={retryCount > 0 ? `重試 (${retryCount})` : '重試'}
        onRetry={handleRetry}
        action={
          <Button variant="outlined" onClick={() => alert('查看狀態頁面')}>
            查看系統狀態
          </Button>
        }
      />
    );
  },
};
