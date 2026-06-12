import type { Meta, StoryObj } from '@storybook/nextjs';
import { useState } from 'react';
import { AlertMessage } from './AlertMessage';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import { Button } from '@/components/atoms';
import Box from '@mui/material/Box';

/**
 * AlertMessage 用於向使用者顯示重要訊息。
 *
 * ## 使用情境
 * - **Success**：操作成功完成
 * - **Error**：操作失敗或發生錯誤
 * - **Warning**：需要注意的警告訊息
 * - **Info**：一般資訊提示
 *
 * ## 最佳實踐
 * - 使用清楚簡潔的文字
 * - 重要訊息請使用 title
 * - 提供關閉按鈕（用於非關鍵訊息）
 */
const meta = {
  title: 'Shared/Molecules/AlertMessage',
  component: AlertMessage,
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component:
          '統一的訊息顯示元件，支援四種類型：success、error、warning 與 info。',
      },
    },
  },
  tags: ['autodocs'],
  argTypes: {
    severity: {
      control: 'select',
      options: ['success', 'error', 'warning', 'info'],
      description: '訊息類型',
    },
    closable: {
      control: 'boolean',
      description: '顯示關閉按鈕',
    },
    variant: {
      control: 'select',
      options: ['filled', 'outlined', 'standard'],
      description: '視覺樣式',
    },
  },
  decorators: [
    (Story) => (
      <div style={{ width: '500px' }}>
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof AlertMessage>;

export default meta;
type Story = StoryObj<typeof meta>;

/**
 * 成功訊息
 * 用於操作成功的回饋
 */
export const Success: Story = {
  args: {
    severity: 'success',
    children: 'Operation completed successfully!',
  },
};

/**
 * 錯誤訊息
 * 用於操作失敗或錯誤
 */
export const Error: Story = {
  args: {
    severity: 'error',
    children: 'Operation failed. Please try again later.',
  },
};

/**
 * 警告訊息
 * 用於需要注意的情況
 */
export const Warning: Story = {
  args: {
    severity: 'warning',
    children: 'This action cannot be undone. Please proceed with caution.',
  },
};

/**
 * 資訊訊息
 * 用於一般提示
 */
export const Info: Story = {
  args: {
    severity: 'info',
    children: 'You have 3 unread messages.',
  },
};

/**
 * 所有嚴重程度類型
 * 顯示全部四種訊息類型
 */
export const AllSeverities: Story = {
  render: () => (
    <Stack spacing={2}>
      <AlertMessage severity="success" title="Success">
        Data saved successfully
      </AlertMessage>
      <AlertMessage severity="error" title="Error">
        Unable to connect to server
      </AlertMessage>
      <AlertMessage severity="warning" title="Warning">
        Your password will expire in 7 days
      </AlertMessage>
      <AlertMessage severity="info" title="Info">
        System maintenance will begin in 5 minutes
      </AlertMessage>
    </Stack>
  ),
};

/**
 * 不同變體
 * 三種樣式：Filled、Outlined、Standard
 */
export const Variants: Story = {
  render: () => (
    <Stack spacing={2}>
      <AlertMessage severity="info" variant="filled">
        Filled style (default)
      </AlertMessage>
      <AlertMessage severity="info" variant="outlined">
        Outlined style
      </AlertMessage>
      <AlertMessage severity="info" variant="standard">
        Standard style
      </AlertMessage>
    </Stack>
  ),
};

/**
 * 含標題
 * 提供更詳細的訊息結構
 */
export const WithTitle: Story = {
  args: {
    severity: 'success',
    title: 'Login Successful',
    children: 'Welcome back! You have successfully logged in.',
  },
};

/**
 * 可關閉
 * 顯示關閉按鈕
 */
export const Closable: Story = {
  args: {
    severity: 'info',
    title: 'New Feature',
    children: 'We just released new features. Check them out!',
    closable: true,
  },
};

/**
 * 多行內容
 * 顯示較長的訊息
 */
export const LongContent: Story = {
  args: {
    severity: 'warning',
    title: 'Important Notice',
    closable: true,
    children: (
      <>
        <div>To ensure your account security, please note the following:</div>
        <ul style={{ margin: '8px 0', paddingLeft: '20px' }}>
          <li>Do not share your password with others</li>
          <li>Update your password regularly</li>
          <li>Enable two-factor authentication</li>
          <li>Watch for suspicious login activity</li>
        </ul>
      </>
    ),
  },
};

/**
 * 含重試按鈕
 * 在 API 請求失敗時提供重試功能
 */
export const WithRetry: Story = {
  render: function WithRetryExample() {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(false);

    const handleRetry = () => {
      setLoading(true);
      setError(false);
      // Simulate API request
      setTimeout(() => {
        setLoading(false);
        setError(Math.random() > 0.5);
      }, 1500);
    };

    return (
      <Stack spacing={2}>
        <Button onClick={handleRetry} variant="contained" disabled={loading}>
          {loading ? 'Loading...' : 'Send Request'}
        </Button>

        {error && (
          <AlertMessage
            severity="error"
            title="Connection Failed"
            showRetry
            retryText="Retry"
            onRetry={handleRetry}
          >
            Unable to connect to server. Please check your network connection.
          </AlertMessage>
        )}

        {!error && !loading && (
          <AlertMessage severity="success">
            Request completed successfully!
          </AlertMessage>
        )}
      </Stack>
    );
  },
};

/**
 * 自訂操作按鈕
 * 提供額外的操作選項
 */
export const WithCustomAction: Story = {
  args: {
    severity: 'warning',
    title: 'Password Expiring Soon',
    children:
      'Your password will expire in 7 days. Please update it promptly to keep your account secure.',
    action: (
      <Button color="inherit" size="small" variant="outlined">
        Update Now
      </Button>
    ),
  },
};

/**
 * 互動範例
 * 可關閉的訊息
 */
export const Interactive: Story = {
  render: function InteractiveExample() {
    const [show, setShow] = useState(true);

    return (
      <Stack spacing={2}>
        {!show && (
          <Button onClick={() => setShow(true)} variant="outlined">
            Show Message
          </Button>
        )}

        {show && (
          <AlertMessage
            severity="info"
            title="Info"
            closable
            onClose={() => setShow(false)}
          >
            This is a closable message. Click the X icon on the right to close.
          </AlertMessage>
        )}
      </Stack>
    );
  },
};

/**
 * 表單驗證範例
 * 顯示驗證結果
 */
export const FormValidation: Story = {
  render: function FormValidationExample() {
    const [status, setStatus] = useState<'idle' | 'success' | 'error'>('idle');

    const handleSubmit = () => {
      setStatus('idle');
      // Simulate API request
      setTimeout(() => {
        // Random success or failure
        setStatus(Math.random() > 0.5 ? 'success' : 'error');
      }, 1000);
    };

    return (
      <Stack spacing={2}>
        <Button onClick={handleSubmit} variant="contained">
          Submit Form
        </Button>

        {status === 'success' && (
          <AlertMessage
            severity="success"
            title="Submission Successful"
            closable
            onClose={() => setStatus('idle')}
          >
            Your form has been submitted successfully. We will process it
            shortly.
          </AlertMessage>
        )}

        {status === 'error' && (
          <AlertMessage
            severity="error"
            title="Submission Failed"
            closable
            onClose={() => setStatus('idle')}
          >
            An error occurred during submission. Please check your network
            connection and try again.
          </AlertMessage>
        )}
      </Stack>
    );
  },
};

/**
 * API 錯誤處理範例
 * 實際的 API 錯誤處理情境
 */
export const ApiErrorHandling: Story = {
  render: function ApiErrorExample() {
    const [status, setStatus] = useState<
      'idle' | 'loading' | 'success' | 'error'
    >('idle');

    const handleSubmit = () => {
      setStatus('loading');
      // Simulate API request
      setTimeout(() => {
        setStatus(Math.random() > 0.3 ? 'success' : 'error');
      }, 1500);
    };

    const handleRetry = () => {
      handleSubmit();
    };

    return (
      <Box sx={{ width: '500px' }}>
        <Stack spacing={2}>
          <Typography variant="h6">Save Settings</Typography>

          <Button
            onClick={handleSubmit}
            variant="contained"
            disabled={status === 'loading'}
            fullWidth
          >
            {status === 'loading' ? 'Saving...' : 'Save'}
          </Button>

          {status === 'success' && (
            <AlertMessage
              severity="success"
              title="Saved Successfully"
              closable
              onClose={() => setStatus('idle')}
            >
              Your settings have been saved successfully.
            </AlertMessage>
          )}

          {status === 'error' && (
            <AlertMessage
              severity="error"
              title="Save Failed"
              showRetry
              retryText="Try Again"
              onRetry={handleRetry}
            >
              Unable to save settings. Please try again later.
            </AlertMessage>
          )}
        </Stack>
      </Box>
    );
  },
};

/**
 * 表單驗證錯誤
 * 顯示多個驗證錯誤
 */
export const FormValidationErrors: Story = {
  render: () => (
    <Box sx={{ width: '500px' }}>
      <Stack spacing={2}>
        <Typography variant="h6">Form Validation</Typography>

        <AlertMessage severity="error" title="Form Validation Failed">
          <ul style={{ margin: '8px 0', paddingLeft: '20px' }}>
            <li>Email format is incorrect</li>
            <li>Password must be at least 8 characters</li>
            <li>Please agree to the terms of service</li>
          </ul>
        </AlertMessage>
      </Stack>
    </Box>
  ),
};

/**
 * 通知堆疊
 * 同時顯示多則訊息
 */
export const NotificationStack: Story = {
  render: function NotificationStackExample() {
    const [notifications, setNotifications] = useState([
      {
        id: 1,
        severity: 'success' as const,
        message: 'File uploaded successfully',
      },
      { id: 2, severity: 'info' as const, message: 'You have new messages' },
      { id: 3, severity: 'warning' as const, message: 'Low disk space' },
    ]);

    const removeNotification = (id: number) => {
      setNotifications(notifications.filter((n) => n.id !== id));
    };

    return (
      <Box>
        <Button
          onClick={() => {
            const newId = Math.max(0, ...notifications.map((n) => n.id)) + 1;
            setNotifications([
              ...notifications,
              {
                id: newId,
                severity: 'info',
                message: `New notification #${newId}`,
              },
            ]);
          }}
          variant="outlined"
          sx={{ mb: 2 }}
        >
          Add Notification
        </Button>

        <Stack spacing={1}>
          {notifications.map((notif) => (
            <AlertMessage
              key={notif.id}
              severity={notif.severity}
              closable
              onClose={() => removeNotification(notif.id)}
            >
              {notif.message}
            </AlertMessage>
          ))}
        </Stack>
      </Box>
    );
  },
};
