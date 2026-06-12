import type { Meta, StoryObj } from '@storybook/nextjs';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import Box from '@mui/material/Box';
import CheckIcon from '@mui/icons-material/Check';
import CloseIcon from '@mui/icons-material/Close';
import ScheduleIcon from '@mui/icons-material/Schedule';
import { Chip } from './Chip';

const meta = {
  title: 'Shared/Atoms/Chip',
  component: Chip,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
  argTypes: {
    label: {
      control: 'text',
    },
    variant: {
      control: 'select',
      options: ['success', 'warning', 'error', 'info', 'text', 'another'],
    },
    size: {
      control: 'select',
      options: ['small', 'medium', 'large'],
    },
    icon: {
      control: false,
      table: { disable: true },
    },
    className: {
      control: false,
      table: { disable: true },
    },
    dot: {
      control: 'boolean',
    },
    disabled: {
      control: 'boolean',
    },
  },
} satisfies Meta<typeof Chip>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    label: 'Description',
    variant: 'success',
  },
};

const Row = ({
  label,
  left,
  right,
}: {
  label: string;
  left: React.ReactNode;
  right?: React.ReactNode;
}) => (
  <Stack direction="row" spacing={3} alignItems="center">
    <Typography variant="body2" sx={{ width: 100 }}>
      {label}
    </Typography>
    <Box sx={{ minWidth: 180 }}>{left}</Box>
    {right ? <Box sx={{ minWidth: 180 }}>{right}</Box> : null}
  </Stack>
);

export const Variants: Story = {
  render: () => (
    <Stack spacing={3}>
      <Row
        label="Success"
        left={<Chip variant="success" label="Description" size="small" />}
        right={
          <Chip
            variant="success"
            label="Enable"
            icon={<CheckIcon fontSize="inherit" />}
          />
        }
      />
      <Row
        label="Warning"
        left={<Chip variant="warning" label="Description" size="small" />}
        right={
          <Chip
            variant="warning"
            label="Disable"
            icon={<CloseIcon fontSize="inherit" />}
            disabled
          />
        }
      />
      <Row
        label="Error"
        left={<Chip variant="error" label="Description" size="small" />}
        right={
          <Chip
            variant="warning"
            label="Pending"
            icon={<ScheduleIcon fontSize="inherit" />}
          />
        }
      />
      <Row
        label="Info"
        left={<Chip variant="info" label="Description" size="small" />}
        right={
          <Chip
            variant="error"
            label="Failed"
            icon={<CloseIcon fontSize="inherit" />}
          />
        }
      />
      <Row
        label="Text"
        left={<Chip variant="text" label="Description" size="small" />}
      />
      <Row
        label="Another"
        left={<Chip variant="another" label="Description" dot size="small" />}
      />
    </Stack>
  ),
};
