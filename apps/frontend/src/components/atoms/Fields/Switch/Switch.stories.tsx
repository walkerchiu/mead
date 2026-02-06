import type { Meta, StoryObj } from '@storybook/nextjs';
import Box from '@mui/material/Box';
import FormControlLabel from '@mui/material/FormControlLabel';
import FormGroup from '@mui/material/FormGroup';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import { Switch } from './Switch';

const meta = {
  title: 'Atoms/Switch',
  component: Switch,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
  argTypes: {
    size: {
      control: 'select',
      options: ['small', 'medium'],
    },
    defaultChecked: {
      control: 'boolean',
    },
    checked: {
      control: false,
      table: {
        disable: true,
      },
    },
    disabled: {
      control: 'boolean',
    },
  },
} satisfies Meta<typeof Switch>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    defaultChecked: false,
    size: 'medium',
  },
};

export const Variants: Story = {
  render: () => (
    <Stack spacing={3}>
      <Stack direction="row" spacing={2} alignItems="center">
        <Switch />
        <Switch defaultChecked />
        <Switch disabled />
      </Stack>
      <Stack direction="row" spacing={2} alignItems="center">
        <Switch size="small" />
        <Switch size="small" defaultChecked />
        <Switch size="small" disabled />
      </Stack>
    </Stack>
  ),
};

export const BasicSwitch: Story = {
  render: () => (
    <Stack spacing={2}>
      <FormControlLabel control={<Switch />} label="False" />
      <FormControlLabel control={<Switch defaultChecked />} label="True" />
      <FormControlLabel control={<Switch disabled />} label="Disabled" />
    </Stack>
  ),
};

export const LabelPlacement: Story = {
  render: () => (
    <Stack direction="row" spacing={1} alignItems="center">
      <FormControlLabel
        value="top"
        control={<Switch />}
        label="Top"
        labelPlacement="top"
        sx={{ gap: 1, m: 0 }}
      />
      <FormControlLabel
        value="start"
        control={<Switch />}
        label="Start"
        labelPlacement="start"
        sx={{ gap: 1, m: 0 }}
      />
      <FormControlLabel
        value="bottom"
        control={<Switch />}
        label="Bottom"
        labelPlacement="bottom"
        sx={{ gap: 1, m: 0 }}
      />
      <FormControlLabel
        value="end"
        control={<Switch />}
        label="End"
        labelPlacement="end"
        sx={{ gap: 1, m: 0 }}
      />
    </Stack>
  ),
};

export const FormGroupExample: Story = {
  render: () => (
    <Box>
      <Typography variant="subtitle1" sx={{ mb: 2 }}>
        Form Group
      </Typography>
      <FormGroup>
        <Stack direction="row" spacing={1} alignItems="center" sx={{ mb: 3 }}>
          <FormControlLabel
            control={<Switch />}
            label="Option"
            sx={{ gap: 1, m: 0 }}
          />
          <FormControlLabel
            control={<Switch />}
            label="Option"
            sx={{ gap: 1, m: 0 }}
          />
        </Stack>
        <Stack direction="row" spacing={1} alignItems="center" sx={{ mb: 3 }}>
          <FormControlLabel
            control={<Switch />}
            label="Option"
            sx={{ gap: 1, m: 0 }}
          />
          <FormControlLabel
            control={<Switch />}
            label="Option"
            sx={{ gap: 1, m: 0 }}
          />
        </Stack>
        <Stack direction="row" spacing={1} alignItems="center">
          <FormControlLabel
            control={<Switch />}
            label="Option"
            sx={{ gap: 1, m: 0 }}
          />
          <FormControlLabel
            control={<Switch />}
            label="Option"
            sx={{ gap: 1, m: 0 }}
          />
        </Stack>
      </FormGroup>
    </Box>
  ),
};
