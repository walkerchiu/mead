import type { Meta, StoryObj } from '@storybook/nextjs';
import Stack from '@mui/material/Stack';
import TuneIcon from '@mui/icons-material/Tune';
import { IconButton } from './IconButton';

const meta = {
  title: 'HQ Scope/Atoms/IconButton',
  component: IconButton,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
  argTypes: {
    variant: {
      control: 'select',
      options: ['default', 'tonal', 'outline', 'toggle'],
      description: 'Icon button variant',
    },
    children: {
      control: false,
      table: {
        disable: true,
      },
    },
    disabled: {
      control: 'boolean',
      description: 'Whether to disable',
    },
  },
} satisfies Meta<typeof IconButton>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    variant: 'default',
    children: <TuneIcon fontSize="small" />,
  },
};

export const Variants: Story = {
  render: () => (
    <Stack spacing={2}>
      <Stack direction="row" spacing={2} alignItems="center">
        <IconButton variant="default" aria-label="default">
          <TuneIcon fontSize="small" />
        </IconButton>
        <IconButton variant="tonal" aria-label="tonal">
          <TuneIcon fontSize="small" />
        </IconButton>
        <IconButton variant="outline" aria-label="outline">
          <TuneIcon fontSize="small" />
        </IconButton>
        <IconButton variant="toggle" aria-label="toggle">
          <TuneIcon fontSize="small" />
        </IconButton>
      </Stack>
      <Stack direction="row" spacing={2} alignItems="center">
        <IconButton variant="default" aria-label="default" disabled>
          <TuneIcon fontSize="small" />
        </IconButton>
        <IconButton variant="tonal" aria-label="tonal" disabled>
          <TuneIcon fontSize="small" />
        </IconButton>
        <IconButton variant="outline" aria-label="outline" disabled>
          <TuneIcon fontSize="small" />
        </IconButton>
        <IconButton variant="toggle" aria-label="toggle" disabled>
          <TuneIcon fontSize="small" />
        </IconButton>
      </Stack>
    </Stack>
  ),
};
