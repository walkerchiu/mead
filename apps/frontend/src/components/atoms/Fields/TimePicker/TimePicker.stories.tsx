import type { Meta, StoryObj } from '@storybook/nextjs';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import Box from '@mui/material/Box';
import { TimePicker } from './TimePicker';

const meta = {
  title: 'HQ Scope/Atoms/Fields/TimePicker',
  component: TimePicker,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
  args: {
    label: 'Time',
    value: '',
    placeholder: 'hh:mm aa',
  },
  argTypes: {
    placeholder: {
      control: 'text',
    },
    value: {
      control: 'text',
    },
    onChange: {
      control: false,
      table: { disable: true },
    },
    slotProps: {
      control: false,
      table: { disable: true },
    },
    state: {
      control: 'select',
      options: ['default', 'hover', 'focus', 'press'],
    },
    disabled: {
      control: 'boolean',
    },
    error: {
      control: 'boolean',
    },
  },
} satisfies Meta<typeof TimePicker>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    label: 'Time',
    value: '',
    placeholder: 'hh:mm aa',
    onChange: () => {},
  },
};

const StateRow = ({
  label,
  state,
  error,
  helperText,
}: {
  label: string;
  state: 'default' | 'hover' | 'focus' | 'press';
  error?: boolean;
  helperText?: string;
}) => (
  <Stack direction="row" spacing={3} alignItems="center">
    <Typography variant="body2" sx={{ width: 80 }}>
      {label}
    </Typography>
    <Box sx={{ width: 260 }}>
      <TimePicker
        label="Time"
        value=""
        onChange={() => {}}
        state={state}
        error={error}
        helperText={helperText}
      />
    </Box>
  </Stack>
);

export const Variants: Story = {
  args: {
    label: 'Time',
    value: '',
    placeholder: 'hh:mm aa',
    onChange: () => {},
  },
  render: () => (
    <Stack spacing={3}>
      <StateRow label="Enable" state="default" />
      <StateRow label="Press" state="press" />
      <StateRow label="Error" state="press" error helperText="Helper text" />
    </Stack>
  ),
};
