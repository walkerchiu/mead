import type { Meta, StoryObj } from '@storybook/nextjs';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import Box from '@mui/material/Box';
import { Search } from './Search';

const meta = {
  title: 'Shared/Atoms/Fields/Search',
  component: Search,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
  argTypes: {
    value: {
      control: 'text',
    },
    onChange: {
      control: false,
      table: { disable: true },
    },
    disabled: {
      control: 'boolean',
    },
    size: {
      control: 'select',
      options: ['small', 'medium', 'large'],
    },
    variant: {
      control: 'select',
      options: ['pill', 'rounded'],
    },
    state: {
      control: 'select',
      options: ['default', 'hover', 'focus', 'active', 'disabled'],
    },
  },
} satisfies Meta<typeof Search>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    placeholder: 'Search keyword',
    value: '',
    onChange: () => {},
  },
};

const StateRow = ({
  label,
  className,
  value,
  disabled,
  state,
}: {
  label: string;
  className?: string;
  value?: string;
  disabled?: boolean;
  state?: 'default' | 'hover' | 'focus' | 'active' | 'disabled';
}) => (
  <Stack direction="row" spacing={3} alignItems="center">
    <Typography variant="body2" sx={{ width: 80 }}>
      {label}
    </Typography>
    <Box sx={{ width: 320 }}>
      <Search
        placeholder="Search keyword"
        value={value ?? ''}
        onChange={() => {}}
        className={className}
        disabled={disabled}
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
      <StateRow label="Active" state="active" value="Input content" />
      <StateRow
        label="Disable"
        state="disabled"
        value="Search keyword"
        disabled
      />
    </Stack>
  ),
};
