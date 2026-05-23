import type { Meta, StoryObj } from '@storybook/nextjs';
import { useState } from 'react';
import { Button, Box } from '@mui/material';
import { fn } from 'storybook/test';
import { CronJobExecutionDetailsModal } from './CronJobExecutionDetailsModal';
import type { CronJobExecution } from '@/hooks/useCronJobs';

const successExecution: CronJobExecution = {
  id: 'exec-001',
  jobName: 'session-cleanup',
  jobType: 'cleanup',
  startedAt: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString(),
  completedAt: new Date(Date.now() - 1000 * 60 * 60 * 2 + 1250).toISOString(),
  duration: 1250,
  status: 'SUCCESS',
  processedCount: 1542,
  successCount: 1542,
  errorCount: 0,
  instanceId: 'instance-a1b2c3',
  lockId: 'lock-x9y8z7',
  nextRunAt: new Date(Date.now() + 1000 * 60 * 60 * 22).toISOString(),
};

const failedExecution: CronJobExecution = {
  id: 'exec-002',
  jobName: 'notification-sender',
  jobType: 'notification',
  startedAt: new Date(Date.now() - 1000 * 60 * 30).toISOString(),
  completedAt: new Date(Date.now() - 1000 * 60 * 30 + 3400).toISOString(),
  duration: 3400,
  status: 'FAILED',
  processedCount: 50,
  successCount: 32,
  errorCount: 18,
  errorMessage: 'SMTP connection timeout after 3s',
  errorStack:
    'Error: SMTP connection timeout after 3s\n  at SMTPTransport.send (/app/lib/smtp.js:124:15)\n  at NotificationJob.run (/app/jobs/notifications.js:88:22)',
  instanceId: 'instance-d4e5f6',
  nextRunAt: new Date(Date.now() + 1000 * 60 * 5).toISOString(),
};

const runningExecution: CronJobExecution = {
  id: 'exec-004',
  jobName: 'audit-log-archive',
  jobType: 'archive',
  startedAt: new Date(Date.now() - 1000 * 60 * 2).toISOString(),
  status: 'RUNNING',
  processedCount: 12000,
  successCount: 12000,
  errorCount: 0,
  instanceId: 'instance-j0k1l2',
};

const meta = {
  title: 'HQ Scope/Organisms/Cron Jobs/ExecutionDetailsModal',
  component: CronJobExecutionDetailsModal,
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component:
          'Modal dialog displaying full details of a cron job execution, including timing, counts, and error information.',
      },
    },
  },
  tags: ['autodocs'],
} satisfies Meta<typeof CronJobExecutionDetailsModal>;

export default meta;
type Story = StoryObj<typeof meta>;

/**
 * Successful execution — shows all processed counts and timing.
 */
export const SuccessExecution: Story = {
  args: {
    open: true,
    execution: successExecution,
    onClose: fn(),
  },
};

/**
 * Failed execution — shows error message and stack trace.
 */
export const FailedExecution: Story = {
  args: {
    open: true,
    execution: failedExecution,
    onClose: fn(),
  },
};

/**
 * Running execution — no completion time or duration yet.
 */
export const RunningExecution: Story = {
  args: {
    open: true,
    execution: runningExecution,
    onClose: fn(),
  },
};

/**
 * Interactive — open the modal with a button.
 */
export const Interactive: Story = {
  render: function InteractiveExample() {
    const [open, setOpen] = useState(false);
    const [selected, setSelected] =
      useState<CronJobExecution>(successExecution);

    return (
      <Box sx={{ display: 'flex', gap: 2 }}>
        <Button
          variant="contained"
          color="success"
          onClick={() => {
            setSelected(successExecution);
            setOpen(true);
          }}
        >
          View Success
        </Button>
        <Button
          variant="contained"
          color="error"
          onClick={() => {
            setSelected(failedExecution);
            setOpen(true);
          }}
        >
          View Failed
        </Button>
        <CronJobExecutionDetailsModal
          open={open}
          execution={selected}
          onClose={() => setOpen(false)}
        />
      </Box>
    );
  },
};
