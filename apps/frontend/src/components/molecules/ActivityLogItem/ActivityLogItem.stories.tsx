import type { Meta, StoryObj } from '@storybook/nextjs';
import { Box, Chip, Typography } from '@mui/material';
import {
  Edit as EditIcon,
  SwapHoriz as StatusIcon,
  AttachFile as FileIcon,
  Gavel as GavelIcon,
  PersonAdd as PersonAddIcon,
  PersonRemove as PersonRemoveIcon,
} from '@mui/icons-material';
import { ActivityLogItem } from './ActivityLogItem';

const meta: Meta<typeof ActivityLogItem> = {
  title: 'Molecules/ActivityLogItem',
  component: ActivityLogItem,
  parameters: {
    layout: 'padded',
    docs: {
      description: {
        component:
          'Unified timeline row element used across every activity feed.',
      },
    },
  },
  tags: ['autodocs'],
  argTypes: {
    color: {
      control: 'select',
      options: ['primary', 'success', 'error', 'warning', 'info', 'grey'],
    },
  },
};

export default meta;

type Story = StoryObj<typeof ActivityLogItem>;

export const Single: Story = {
  args: {
    actorName: 'Walker Chiu',
    timestamp: new Date('2026-04-14T13:52:00+08:00'),
    icon: <EditIcon />,
    color: 'info',
    isFirst: true,
    isLast: true,
    children: (
      <>
        Changed &quot;Content&quot;: 2132432432342fff → 2132432432342fff (long
        text)
      </>
    ),
  },
};

export const Timeline: Story = {
  render: () => (
    <Box sx={{ maxWidth: 600 }}>
      <ActivityLogItem
        actorName="Walker Chiu"
        timestamp={new Date('2026-04-14T13:54:00+08:00')}
        icon={<EditIcon />}
        color="info"
        isFirst
        onClick={() => {}}
      >
        Changed &quot;Content&quot;: 2132 → 2132432432342fff
      </ActivityLogItem>
      <ActivityLogItem
        actorName="Walker Chiu"
        timestamp={new Date('2026-04-14T13:52:00+08:00')}
        icon={<EditIcon />}
        color="info"
        onClick={() => {}}
      >
        Changed &quot;Work Date&quot;: 2026-04-12 → 2026-04-14
      </ActivityLogItem>
      <ActivityLogItem
        actorName="Kawuu Lin"
        timestamp={new Date('2026-04-14T12:10:00+08:00')}
        icon={<StatusIcon />}
        color="warning"
      >
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
          Status changed to
          <Chip label="In Review" size="small" variant="outlined" />
        </Box>
      </ActivityLogItem>
      <ActivityLogItem
        actorName="Ken Ho"
        timestamp={new Date('2026-04-13T17:20:00+08:00')}
        icon={<FileIcon />}
        color="success"
      >
        Uploaded &quot;Requirements v2.pdf&quot;
      </ActivityLogItem>
      <ActivityLogItem
        actorName="Jacky Chang"
        timestamp={new Date('2026-04-13T15:30:00+08:00')}
        icon={<GavelIcon />}
        color="success"
      >
        Approved
      </ActivityLogItem>
      <ActivityLogItem
        actorName="Jacky Chen"
        timestamp={new Date('2026-04-13T11:05:00+08:00')}
        icon={<PersonAddIcon />}
        color="primary"
      >
        Invited MH Hsu as Technical Reviewer
      </ActivityLogItem>
      <ActivityLogItem
        actorName="Jacky Chen"
        timestamp={new Date('2026-04-12T09:00:00+08:00')}
        icon={<PersonRemoveIcon />}
        color="error"
        isLast
      >
        Removed Test Member
      </ActivityLogItem>
    </Box>
  ),
};

export const Clickable: Story = {
  args: {
    actorName: 'System',
    timestamp: new Date(),
    icon: <EditIcon />,
    color: 'info',
    isFirst: true,
    isLast: true,
    onClick: () => alert('Clicked — opens Diff Modal'),
    children: (
      <Typography variant="body2" color="text.secondary">
        Click to open Diff Modal (entire row is hover / clickable)
      </Typography>
    ),
  },
};
