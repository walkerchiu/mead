import type { Meta, StoryObj } from '@storybook/react';
import { useState } from 'react';
import { AlertMessage } from './AlertMessage';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import { Button } from '@/components/atoms';
import Box from '@mui/material/Box';

/**
 * AlertMessage 用於顯示重要訊息給用戶。
 *
 * ## 使用時機
 * - **Success**: 操作成功完成
 * - **Error**: 操作失敗或發生錯誤
 * - **Warning**: 需要注意的警告訊息
 * - **Info**: 一般資訊提示
 *
 * ## 最佳實踐
 * - 使用清晰簡潔的文字
 * - 重要訊息使用 title
 * - 提供關閉按鈕（對於非關鍵訊息）
 */
const meta = {
  title: 'Molecules/AlertMessage',
  component: AlertMessage,
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component: '統一的訊息顯示組件，支援成功、錯誤、警告和資訊四種類型。',
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
      description: '是否顯示關閉按鈕',
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
    children: '操作已成功完成！',
  },
};

/**
 * 錯誤訊息
 * 用於操作失敗或錯誤
 */
export const Error: Story = {
  args: {
    severity: 'error',
    children: '操作失敗，請稍後再試。',
  },
};

/**
 * 警告訊息
 * 用於需要注意的情況
 */
export const Warning: Story = {
  args: {
    severity: 'warning',
    children: '此操作無法復原，請謹慎操作。',
  },
};

/**
 * 資訊訊息
 * 用於一般提示
 */
export const Info: Story = {
  args: {
    severity: 'info',
    children: '您有 3 則未讀訊息。',
  },
};

/**
 * 帶標題
 * 提供更詳細的訊息結構
 */
export const WithTitle: Story = {
  args: {
    severity: 'success',
    title: '登入成功',
    children: '歡迎回來！您已成功登入系統。',
  },
};

/**
 * 可關閉
 * 顯示關閉按鈕
 */
export const Closable: Story = {
  args: {
    severity: 'info',
    title: '新功能提示',
    children: '我們剛剛發布了新功能，快來試試看！',
    closable: true,
  },
};

/**
 * 不同變體
 * Filled、Outlined、Standard 三種樣式
 */
export const Variants: Story = {
  render: () => (
    <Stack spacing={2}>
      <AlertMessage severity="info" variant="filled">
        Filled 樣式（預設）
      </AlertMessage>
      <AlertMessage severity="info" variant="outlined">
        Outlined 樣式
      </AlertMessage>
      <AlertMessage severity="info" variant="standard">
        Standard 樣式
      </AlertMessage>
    </Stack>
  ),
};

/**
 * 所有類型
 * 展示四種訊息類型
 */
export const AllSeverities: Story = {
  render: () => (
    <Stack spacing={2}>
      <AlertMessage severity="success" title="成功">
        資料已成功儲存
      </AlertMessage>
      <AlertMessage severity="error" title="錯誤">
        無法連線到伺服器
      </AlertMessage>
      <AlertMessage severity="warning" title="警告">
        您的密碼將在 7 天後過期
      </AlertMessage>
      <AlertMessage severity="info" title="提示">
        系統將在 5 分鐘後進行維護
      </AlertMessage>
    </Stack>
  ),
};

/**
 * 互動式範例
 * 可以關閉的訊息
 */
export const Interactive: Story = {
  render: function InteractiveExample() {
    const [show, setShow] = useState(true);

    return (
      <Stack spacing={2}>
        {!show && (
          <Button onClick={() => setShow(true)} variant="outlined">
            顯示訊息
          </Button>
        )}

        {show && (
          <AlertMessage
            severity="info"
            title="提示"
            closable
            onClose={() => setShow(false)}
          >
            這是一則可以關閉的訊息。點擊右側的 X 圖示關閉。
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
      // 模擬 API 請求
      setTimeout(() => {
        // 隨機成功或失敗
        setStatus(Math.random() > 0.5 ? 'success' : 'error');
      }, 1000);
    };

    return (
      <Stack spacing={2}>
        <Button onClick={handleSubmit} variant="contained">
          提交表單
        </Button>

        {status === 'success' && (
          <AlertMessage
            severity="success"
            title="提交成功"
            closable
            onClose={() => setStatus('idle')}
          >
            您的表單已成功提交，我們會盡快處理。
          </AlertMessage>
        )}

        {status === 'error' && (
          <AlertMessage
            severity="error"
            title="提交失敗"
            closable
            onClose={() => setStatus('idle')}
          >
            提交過程中發生錯誤，請檢查您的網路連線後重試。
          </AlertMessage>
        )}
      </Stack>
    );
  },
};

/**
 * 多行內容
 * 顯示較長的訊息
 */
export const LongContent: Story = {
  args: {
    severity: 'warning',
    title: '重要通知',
    closable: true,
    children: (
      <>
        <div>為了確保您的帳號安全，請注意以下事項：</div>
        <ul style={{ margin: '8px 0', paddingLeft: '20px' }}>
          <li>不要與他人分享您的密碼</li>
          <li>定期更新密碼</li>
          <li>啟用雙因素認證</li>
          <li>注意可疑的登入活動</li>
        </ul>
      </>
    ),
  },
};

/**
 * 通知堆疊
 * 多個訊息同時顯示
 */
export const NotificationStack: Story = {
  render: function NotificationStackExample() {
    const [notifications, setNotifications] = useState([
      { id: 1, severity: 'success' as const, message: '檔案上傳成功' },
      { id: 2, severity: 'info' as const, message: '您有新訊息' },
      { id: 3, severity: 'warning' as const, message: '磁碟空間不足' },
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
              { id: newId, severity: 'info', message: `新通知 #${newId}` },
            ]);
          }}
          variant="outlined"
          sx={{ mb: 2 }}
        >
          新增通知
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

/**
 * 帶重試按鈕
 * API 請求失敗時提供重試功能
 */
export const WithRetry: Story = {
  render: function WithRetryExample() {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(false);

    const handleRetry = () => {
      setLoading(true);
      setError(false);
      // 模擬 API 請求
      setTimeout(() => {
        setLoading(false);
        setError(Math.random() > 0.5);
      }, 1500);
    };

    return (
      <Stack spacing={2}>
        <Button onClick={handleRetry} variant="contained" disabled={loading}>
          {loading ? '載入中...' : '發送請求'}
        </Button>

        {error && (
          <AlertMessage
            severity="error"
            title="連線失敗"
            showRetry
            retryText="重試"
            onRetry={handleRetry}
          >
            無法連線到伺服器，請檢查您的網路連線。
          </AlertMessage>
        )}

        {!error && !loading && (
          <AlertMessage severity="success">請求成功完成！</AlertMessage>
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
    title: '密碼即將過期',
    children: '您的密碼將在 7 天後過期，請及時更新密碼以保障帳號安全。',
    action: (
      <Button color="inherit" size="small" variant="outlined">
        立即更新
      </Button>
    ),
  },
};

/**
 * API 錯誤處理範例
 * 實際的 API 錯誤處理場景
 */
export const ApiErrorHandling: Story = {
  render: function ApiErrorExample() {
    const [status, setStatus] = useState<
      'idle' | 'loading' | 'success' | 'error'
    >('idle');

    const handleSubmit = () => {
      setStatus('loading');
      // 模擬 API 請求
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
          <Typography variant="h6">儲存設定</Typography>

          <Button
            onClick={handleSubmit}
            variant="contained"
            disabled={status === 'loading'}
            fullWidth
          >
            {status === 'loading' ? '儲存中...' : '儲存'}
          </Button>

          {status === 'success' && (
            <AlertMessage
              severity="success"
              title="儲存成功"
              closable
              onClose={() => setStatus('idle')}
            >
              您的設定已成功儲存。
            </AlertMessage>
          )}

          {status === 'error' && (
            <AlertMessage
              severity="error"
              title="儲存失敗"
              showRetry
              retryText="重新嘗試"
              onRetry={handleRetry}
            >
              無法儲存設定，請稍後再試。
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
        <Typography variant="h6">表單驗證</Typography>

        <AlertMessage severity="error" title="表單驗證失敗">
          <ul style={{ margin: '8px 0', paddingLeft: '20px' }}>
            <li>電子郵件格式不正確</li>
            <li>密碼長度至少需要 8 個字元</li>
            <li>請勾選同意服務條款</li>
          </ul>
        </AlertMessage>
      </Stack>
    </Box>
  ),
};
