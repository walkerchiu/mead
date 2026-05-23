import type { Meta, StoryObj } from '@storybook/nextjs';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import Box from '@mui/material/Box';
import { DatePicker } from './DatePicker';

const meta = {
  title: 'HQ Scope/Atoms/Fields/DatePicker',
  component: DatePicker,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
  args: {
    label: 'Select date',
    value: '',
    placeholder: 'MM/DD/YYYY',
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
    state: {
      control: 'select',
      options: ['default', 'hover', 'focus', 'press'],
    },
    disabled: {
      control: 'boolean',
    },
  },
} satisfies Meta<typeof DatePicker>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    label: 'Select date',
    value: '',
    placeholder: 'MM/DD/YYYY',
    onChange: () => {},
  },
};

const StateRow = ({
  label,
  state,
}: {
  label: string;
  state: 'default' | 'hover' | 'focus' | 'press';
}) => (
  <Stack direction="row" spacing={3} alignItems="center">
    <Typography variant="body2" sx={{ width: 80 }}>
      {label}
    </Typography>
    <Box sx={{ width: 260 }}>
      <DatePicker
        label="Select date"
        value=""
        onChange={() => {}}
        state={state}
      />
    </Box>
  </Stack>
);

export const Variants: Story = {
  render: () => (
    <Stack spacing={3}>
      <StateRow label="Enable" state="default" />
      <StateRow label="Hover" state="hover" />
      <StateRow label="Focus" state="focus" />
      <StateRow label="Press" state="press" />
    </Stack>
  ),
};
