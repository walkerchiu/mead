import type { Meta, StoryObj } from '@storybook/nextjs';
import { useState } from 'react';
import { Button, Box } from '@mui/material';
import { fn } from 'storybook/test';
import { CronJobTriggerDialog } from './CronJobTriggerDialog';

const meta = {
  title: 'HQ Scope/Organisms/Cron Jobs/TriggerDialog',
  component: CronJobTriggerDialog,
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component:
          '用於手動觸發 cron job 的確認對話框，提供一般或強制執行的選項。',
      },
    },
  },
  tags: ['autodocs'],
} satisfies Meta<typeof CronJobTriggerDialog>;

export default meta;
type Story = StoryObj<typeof meta>;

/**
 * 預設 — 為已啟用的任務開啟對話框。
 */
export const Default: Story = {
  render: function InteractiveExample() {
    const [open, setOpen] = useState(true);
    return (
      <Box>
        <Button variant="contained" onClick={() => setOpen(true)}>
          Open Dialog
        </Button>
        <CronJobTriggerDialog
          open={open}
          jobName="session-cleanup"
          displayName="Session Cleanup"
          isEnabled={true}
          onClose={() => setOpen(false)}
          onConfirm={(force) => {
            console.log('Confirmed, force:', force);
            setOpen(false);
          }}
        />
      </Box>
    );
  },
};

/**
 * 已停用的任務 — 一般執行按鈕已停用；仍可使用強制執行。
 */
export const DisabledJob: Story = {
  render: function DisabledJobExample() {
    const [open, setOpen] = useState(true);
    return (
      <Box>
        <Button variant="contained" onClick={() => setOpen(true)}>
          Open Dialog
        </Button>
        <CronJobTriggerDialog
          open={open}
          jobName="notification-sender"
          displayName="Notification Sender"
          isEnabled={false}
          onClose={() => setOpen(false)}
          onConfirm={(force) => {
            console.log('Confirmed, force:', force);
            setOpen(false);
          }}
        />
      </Box>
    );
  },
};

/**
 * 觸發中狀態 — 在任務觸發期間顯示載入指示器。
 */
export const Triggering: Story = {
  args: {
    open: true,
    jobName: 'session-cleanup',
    displayName: 'Session Cleanup',
    isEnabled: true,
    onClose: fn(),
    onConfirm: fn(),
    triggering: true,
  },
};

/**
 * 互動 — 以按鈕開啟對話框並處理確認。
 */
export const Interactive: Story = {
  render: function InteractiveExample() {
    const [open, setOpen] = useState(false);
    const [lastAction, setLastAction] = useState<string | null>(null);

    return (
      <Box
        sx={{
          display: 'flex',
          flexDirection: 'column',
          gap: 2,
          alignItems: 'center',
        }}
      >
        <Button
          variant="contained"
          color="primary"
          onClick={() => setOpen(true)}
        >
          Trigger Session Cleanup
        </Button>
        {lastAction && (
          <Box
            sx={{
              p: 1,
              bgcolor: 'grey.100',
              borderRadius: 1,
              fontSize: '0.875rem',
            }}
          >
            Last action: {lastAction}
          </Box>
        )}
        <CronJobTriggerDialog
          open={open}
          jobName="session-cleanup"
          displayName="Session Cleanup"
          isEnabled={true}
          onClose={() => setOpen(false)}
          onConfirm={(force) => {
            setLastAction(force ? 'Force execute' : 'Normal execute');
            setOpen(false);
          }}
        />
      </Box>
    );
  },
};
