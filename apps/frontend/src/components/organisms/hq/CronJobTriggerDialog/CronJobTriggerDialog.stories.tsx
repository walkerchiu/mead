import type { Meta, StoryObj } from '@storybook/nextjs';
import { useState } from 'react';
import { Button, Box } from '@mui/material';
import { fn } from 'storybook/test';
import { CronJobTriggerDialog } from './CronJobTriggerDialog';

const meta = {
  title: 'Organisms/HQ/CronJobTriggerDialog',
  component: CronJobTriggerDialog,
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component:
          'Confirmation dialog for triggering a cron job manually, with options for normal or forced execution.',
      },
    },
  },
  tags: ['autodocs'],
} satisfies Meta<typeof CronJobTriggerDialog>;

export default meta;
type Story = StoryObj<typeof meta>;

/**
 * Default — open dialog for an enabled job.
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
 * Disabled job — normal execution button is disabled; force execution is still available.
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
 * Triggering state — shows loading indicator while the job is being triggered.
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
 * Interactive — open the dialog with a button and handle confirmation.
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
