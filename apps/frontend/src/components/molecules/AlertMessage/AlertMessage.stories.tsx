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
        Unable to load plan data
      </AlertMessage>
      <AlertMessage severity="warning" title="Warning">
        This link opens an external website
      </AlertMessage>
      <AlertMessage severity="info" title="Info">
        Timeline content is available in Chinese and English
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
    title: 'Data Loaded',
    children: 'The plan data is ready to display.',
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
        <div>Before viewing plan resources, please note the following:</div>
        <ul style={{ margin: '8px 0', paddingLeft: '20px' }}>
          <li>Some links open each plan's official website in a new tab</li>
          <li>Timeline content follows the published plan data</li>
          <li>Images may take longer to load on slow networks</li>
          <li>Use the language switcher to view localized content</li>
        </ul>
      </>
    ),
  },
};

/**
 * 含重試按鈕
 * 在資料載入失敗時提供重試功能
 */
export const WithRetry: Story = {
  render: function WithRetryExample() {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(false);

    const handleRetry = () => {
      setLoading(true);
      setError(false);
      // Simulate data loading
      setTimeout(() => {
        setLoading(false);
        setError(Math.random() > 0.5);
      }, 1500);
    };

    return (
      <Stack spacing={2}>
        <Button onClick={handleRetry} variant="contained" disabled={loading}>
          {loading ? 'Loading...' : 'Load Plan Data'}
        </Button>

        {error && (
          <AlertMessage
            severity="error"
            title="Connection Failed"
            showRetry
            retryText="Retry"
            onRetry={handleRetry}
          >
            Unable to load plan data. Please check your network connection.
          </AlertMessage>
        )}

        {!error && !loading && (
          <AlertMessage severity="success">
            Plan data loaded successfully!
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
    title: 'External Website',
    children:
      "This action opens the selected plan's official website in a new tab.",
    action: (
      <Button color="inherit" size="small" variant="outlined">
        Open
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
 * 資料檢查範例
 * 顯示入口網資料檢查結果
 */
export const DataValidation: Story = {
  render: function DataValidationExample() {
    const [status, setStatus] = useState<'idle' | 'success' | 'error'>('idle');

    const handleSubmit = () => {
      setStatus('idle');
      // Simulate data validation
      setTimeout(() => {
        setStatus(Math.random() > 0.5 ? 'success' : 'error');
      }, 1000);
    };

    return (
      <Stack spacing={2}>
        <Button onClick={handleSubmit} variant="contained">
          Validate Plan Data
        </Button>

        {status === 'success' && (
          <AlertMessage
            severity="success"
            title="Submission Successful"
            closable
            onClose={() => setStatus('idle')}
          >
            Plan data passed the display checks.
          </AlertMessage>
        )}

        {status === 'error' && (
          <AlertMessage
            severity="error"
            title="Submission Failed"
            closable
            onClose={() => setStatus('idle')}
          >
            Some plan data is unavailable. Please reload the page and try again.
          </AlertMessage>
        )}
      </Stack>
    );
  },
};

/**
 * 資料載入錯誤處理範例
 * 實際的資料載入錯誤處理情境
 */
export const DataErrorHandling: Story = {
  render: function DataErrorExample() {
    const [status, setStatus] = useState<
      'idle' | 'loading' | 'success' | 'error'
    >('idle');

    const handleSubmit = () => {
      setStatus('loading');
      // Simulate data loading
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
          <Typography variant="h6">Load Plan Resources</Typography>

          <Button
            onClick={handleSubmit}
            variant="contained"
            disabled={status === 'loading'}
            fullWidth
          >
            {status === 'loading' ? 'Loading...' : 'Load'}
          </Button>

          {status === 'success' && (
            <AlertMessage
              severity="success"
              title="Loaded Successfully"
              closable
              onClose={() => setStatus('idle')}
            >
              Plan resources are ready.
            </AlertMessage>
          )}

          {status === 'error' && (
            <AlertMessage
              severity="error"
              title="Load Failed"
              showRetry
              retryText="Try Again"
              onRetry={handleRetry}
            >
              Unable to load plan resources. Please try again later.
            </AlertMessage>
          )}
        </Stack>
      </Box>
    );
  },
};

/**
 * 資料檢查錯誤
 * 顯示多個資料檢查錯誤
 */
export const DataValidationErrors: Story = {
  render: () => (
    <Box sx={{ width: '500px' }}>
      <Stack spacing={2}>
        <Typography variant="h6">Plan Data Validation</Typography>

        <AlertMessage severity="error" title="Plan Data Validation Failed">
          <ul style={{ margin: '8px 0', paddingLeft: '20px' }}>
            <li>Missing localized plan title</li>
            <li>Timeline event month is outside the visible range</li>
            <li>Official website URL is unavailable</li>
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
        message: 'Plan data loaded successfully',
      },
      { id: 2, severity: 'info' as const, message: 'Language switched' },
      {
        id: 3,
        severity: 'warning' as const,
        message: 'External website opens in a new tab',
      },
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
