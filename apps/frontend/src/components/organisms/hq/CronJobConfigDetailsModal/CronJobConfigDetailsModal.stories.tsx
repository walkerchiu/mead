import type { Meta, StoryObj } from '@storybook/nextjs';
import { useState } from 'react';
import { Button, Box } from '@mui/material';
import { fn } from 'storybook/test';
import { CronJobConfigDetailsModal } from './CronJobConfigDetailsModal';
import type { CronJobConfig } from '@/hooks/useCronJobs';

const successConfig: CronJobConfig = {
  jobName: 'session-cleanup',
  displayName: 'Session Cleanup',
  description: '從資料庫移除過期的 session',
  jobType: 'cleanup',
  category: 'maintenance',
  cronExpression: '0 2 * * *',
  timeZone: 'Asia/Taipei',
  isEnabled: true,
  alertOnFailure: true,
  alertOnTimeout: true,
  failureThreshold: 3,
  timeoutThresholdMs: 300000,
  lastExecutedAt: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString(),
  lastStatus: 'SUCCESS',
  lastDuration: 1250,
  nextRunAt: new Date(Date.now() + 1000 * 60 * 60 * 22).toISOString(),
  consecutiveFailures: 0,
  totalExecutions: 365,
  totalFailures: 2,
  createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 365).toISOString(),
  updatedAt: new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString(),
};

const failedDisabledConfig: CronJobConfig = {
  jobName: 'notification-sender',
  displayName: 'Notification Sender',
  description: '寄送待發送的 email 通知',
  jobType: 'notification',
  category: 'communication',
  cronExpression: '*/5 * * * *',
  timeZone: 'Asia/Taipei',
  isEnabled: false,
  alertOnFailure: true,
  alertOnTimeout: true,
  failureThreshold: 5,
  timeoutThresholdMs: 120000,
  lastExecutedAt: new Date(Date.now() - 1000 * 60 * 30).toISOString(),
  lastStatus: 'FAILED',
  lastDuration: 3400,
  lastErrorMessage: 'SMTP connection timeout',
  consecutiveFailures: 3,
  totalExecutions: 2880,
  totalFailures: 45,
  createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 180).toISOString(),
  updatedAt: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString(),
};

const meta = {
  title: 'HQ Scope/Organisms/Cron Jobs/ConfigDetailsModal',
  component: CronJobConfigDetailsModal,
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component:
          '顯示 cron job 完整設定詳情的 modal 對話框，可切換啟用狀態。',
      },
    },
  },
  tags: ['autodocs'],
} satisfies Meta<typeof CronJobConfigDetailsModal>;

export default meta;
type Story = StoryObj<typeof meta>;

/**
 * 預設 — 以成功執行中的已啟用任務開啟。
 */
export const Default: Story = {
  args: {
    open: true,
    config: successConfig,
    onClose: fn(),
    onToggleEnabled: fn().mockResolvedValue(undefined),
  },
};

/**
 * 已停用的任務 — 顯示一個近期有失敗紀錄的已停用任務。
 */
export const DisabledJob: Story = {
  args: {
    open: true,
    config: failedDisabledConfig,
    onClose: fn(),
    onToggleEnabled: fn().mockResolvedValue(undefined),
  },
};

/**
 * 互動 — 以按鈕開啟 modal 並處理啟用切換。
 */
export const Interactive: Story = {
  render: function InteractiveExample() {
    const [open, setOpen] = useState(false);
    const [config, setConfig] = useState<CronJobConfig>(successConfig);

    const handleToggle = async (jobName: string, isEnabled: boolean) => {
      setConfig((prev) => ({ ...prev, isEnabled }));
      console.log('Toggle:', jobName, isEnabled);
    };

    return (
      <Box>
        <Button variant="contained" onClick={() => setOpen(true)}>
          View Config Details
        </Button>
        <CronJobConfigDetailsModal
          open={open}
          config={config}
          onClose={() => setOpen(false)}
          onToggleEnabled={handleToggle}
        />
      </Box>
    );
  },
};
