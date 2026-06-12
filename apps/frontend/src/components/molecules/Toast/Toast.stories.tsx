import type { Meta, StoryObj } from '@storybook/nextjs';
import { useState } from 'react';
import { Toast } from './Toast';
import type { ToastState } from '@/hooks/useToast';
import { Button, Stack, Typography } from '@mui/material';

const meta = {
  title: 'Shared/Molecules/Toast',
  component: Toast,
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component:
          '以 MUI Snackbar 建構的全站 toast 通知元件。支援四種嚴重程度：success、error、warning 與 info。請使用 `useToast` hook 管理 toast 狀態。',
      },
    },
  },
  tags: ['autodocs'],
  argTypes: {
    toast: {
      control: 'object',
      description: 'Toast 狀態物件，包含 `open`、`message` 與 `severity`',
    },
    onClose: {
      action: 'onClose',
      description: 'Toast 關閉時觸發的回呼',
    },
    autoHideDuration: {
      control: { type: 'number', min: 0, step: 500 },
      description: '自動隱藏的時間（毫秒）',
      table: {
        defaultValue: { summary: '6000' },
      },
    },
  },
} satisfies Meta<typeof Toast>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Success: Story = {
  render: function SuccessExample() {
    const [toast, setToast] = useState<ToastState>({
      open: true,
      message: 'Operation completed successfully!',
      severity: 'success',
    });
    return (
      <>
        <Button
          variant="contained"
          onClick={() => setToast((t) => ({ ...t, open: true }))}
        >
          Show Toast
        </Button>
        <Toast
          toast={toast}
          onClose={() => setToast((t) => ({ ...t, open: false }))}
        />
      </>
    );
  },
};

export const Error: Story = {
  render: function ErrorExample() {
    const [toast, setToast] = useState<ToastState>({
      open: true,
      message: 'An error occurred. Please try again.',
      severity: 'error',
    });
    return (
      <>
        <Button
          variant="contained"
          color="error"
          onClick={() => setToast((t) => ({ ...t, open: true }))}
        >
          Show Toast
        </Button>
        <Toast
          toast={toast}
          onClose={() => setToast((t) => ({ ...t, open: false }))}
        />
      </>
    );
  },
};

export const Warning: Story = {
  render: function WarningExample() {
    const [toast, setToast] = useState<ToastState>({
      open: true,
      message: 'Your session will expire in 5 minutes.',
      severity: 'warning',
    });
    return (
      <>
        <Button
          variant="contained"
          color="warning"
          onClick={() => setToast((t) => ({ ...t, open: true }))}
        >
          Show Toast
        </Button>
        <Toast
          toast={toast}
          onClose={() => setToast((t) => ({ ...t, open: false }))}
        />
      </>
    );
  },
};

export const Info: Story = {
  render: function InfoExample() {
    const [toast, setToast] = useState<ToastState>({
      open: true,
      message: 'A new version is available.',
      severity: 'info',
    });
    return (
      <>
        <Button
          variant="contained"
          color="info"
          onClick={() => setToast((t) => ({ ...t, open: true }))}
        >
          Show Toast
        </Button>
        <Toast
          toast={toast}
          onClose={() => setToast((t) => ({ ...t, open: false }))}
        />
      </>
    );
  },
};

export const AllSeverities: Story = {
  render: function AllSeveritiesExample() {
    const [toast, setToast] = useState<ToastState>({
      open: false,
      message: '',
      severity: 'info',
    });

    const show = (message: string, severity: ToastState['severity']) => {
      setToast({ open: true, message, severity });
    };

    return (
      <>
        <Stack direction="row" spacing={2} alignItems="center">
          <Typography variant="body2" color="text.secondary">
            Click to preview:
          </Typography>
          <Button
            size="small"
            variant="outlined"
            color="success"
            onClick={() => show('File saved successfully!', 'success')}
          >
            Success
          </Button>
          <Button
            size="small"
            variant="outlined"
            color="error"
            onClick={() => show('Failed to connect to server.', 'error')}
          >
            Error
          </Button>
          <Button
            size="small"
            variant="outlined"
            color="warning"
            onClick={() => show('Disk space running low.', 'warning')}
          >
            Warning
          </Button>
          <Button
            size="small"
            variant="outlined"
            color="info"
            onClick={() => show('System maintenance in 5 minutes.', 'info')}
          >
            Info
          </Button>
        </Stack>
        <Toast
          toast={toast}
          onClose={() => setToast((t) => ({ ...t, open: false }))}
        />
      </>
    );
  },
};

export const CustomDuration: Story = {
  render: function CustomDurationExample() {
    const [toast, setToast] = useState<ToastState>({
      open: true,
      message: 'This toast will close after 2 seconds.',
      severity: 'info',
    });
    return (
      <>
        <Button
          variant="outlined"
          onClick={() => setToast((t) => ({ ...t, open: true }))}
        >
          Show Toast (2s)
        </Button>
        <Toast
          toast={toast}
          onClose={() => setToast((t) => ({ ...t, open: false }))}
          autoHideDuration={2000}
        />
      </>
    );
  },
};
