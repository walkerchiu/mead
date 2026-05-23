import type { Meta, StoryObj } from '@storybook/nextjs';
import { useState } from 'react';
import { Button, Box } from '@mui/material';
import { fn } from 'storybook/test';
import { CronJobConfigDetailsModal } from './CronJobConfigDetailsModal';
import type { CronJobConfig } from '@/hooks/useCronJobs';

const successConfig: CronJobConfig = {
  jobName: 'session-cleanup',
  displayName: 'Session Cleanup',
  description: 'Removes expired sessions from the database',
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
  description: 'Sends pending email notifications',
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
          'Modal dialog displaying full configuration details of a cron job, with the ability to toggle the enabled state.',
      },
    },
  },
  tags: ['autodocs'],
} satisfies Meta<typeof CronJobConfigDetailsModal>;

export default meta;
type Story = StoryObj<typeof meta>;

/**
 * Default — open with a successfully-running enabled job.
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
 * Disabled job — shows a disabled job with recent failures.
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
 * Interactive — open the modal with a button and handle enable toggle.
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
