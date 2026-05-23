import Box from '@mui/material/Box';
import FormControlLabel from '@mui/material/FormControlLabel';
import FormGroup from '@mui/material/FormGroup';
import FormLabel from '@mui/material/FormLabel';
import RadioGroup from '@mui/material/RadioGroup';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import type { Meta, StoryObj } from '@storybook/nextjs';
import { Radio } from './Radio';

const meta = {
  title: 'HQ Scope/Atoms/Fields/Radio',
  component: Radio,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
  argTypes: {
    size: {
      control: 'select',
      options: ['small', 'medium', 'large'],
    },
    color: {
      control: 'text',
      description: 'Custom color (any color code)',
    },
    checked: {
      control: false,
      table: {
        disable: true,
      },
    },
    defaultChecked: {
      control: 'boolean',
    },
    disabled: {
      control: 'boolean',
    },
  },
} satisfies Meta<typeof Radio>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    defaultChecked: false,
    size: 'medium',
    color: '#F94F16',
  },
};

const headerCellSx = { textAlign: 'center', width: 48 };
const rowGridSx = {
  display: 'grid',
  gridTemplateColumns: '140px repeat(4, 48px)',
  columnGap: 16,
  alignItems: 'center',
} as const;

const StateHeader = () => (
  <Box sx={rowGridSx}>
    <Box />
    <Typography variant="caption" sx={headerCellSx}>
      Default
    </Typography>
    <Typography variant="caption" sx={headerCellSx}>
      Hover
    </Typography>
    <Typography variant="caption" sx={headerCellSx}>
      Pressed
    </Typography>
    <Typography variant="caption" sx={headerCellSx}>
      Disable
    </Typography>
  </Box>
);

const RadioStateRow = ({
  size,
  checked,
  label,
}: {
  size: 'small' | 'medium' | 'large';
  checked: boolean;
  label: string;
}) => (
  <Box sx={rowGridSx}>
    <Typography variant="body2">{label}</Typography>
    <Box sx={{ display: 'flex', justifyContent: 'center' }}>
      <Radio size={size} checked={checked} onChange={() => {}} />
    </Box>
    <Box sx={{ display: 'flex', justifyContent: 'center' }}>
      <Radio
        size={size}
        checked={checked}
        className="preview-hover"
        onChange={() => {}}
      />
    </Box>
    <Box sx={{ display: 'flex', justifyContent: 'center' }}>
      <Radio
        size={size}
        checked={checked}
        className="preview-pressed"
        onChange={() => {}}
      />
    </Box>
    <Box sx={{ display: 'flex', justifyContent: 'center' }}>
      <Radio size={size} checked={checked} disabled onChange={() => {}} />
    </Box>
  </Box>
);

const SizeBlock = ({
  title,
  size,
}: {
  title: string;
  size: 'small' | 'medium' | 'large';
}) => (
  <Stack spacing={2}>
    <Typography variant="subtitle1" color="primary">
      {title}
    </Typography>
    <Stack spacing={2}>
      <StateHeader />
      <RadioStateRow size={size} checked label="Checked: True" />
      <RadioStateRow size={size} checked={false} label="Checked: False" />
    </Stack>
  </Stack>
);

export const Variants: Story = {
  render: () => (
    <Stack spacing={4}>
      <SizeBlock title="Large" size="large" />
      <SizeBlock title="Medium" size="medium" />
      <SizeBlock title="Small" size="small" />
    </Stack>
  ),
};

export const Direction: Story = {
  render: () => (
    <Stack spacing={2}>
      <FormLabel>Direction</FormLabel>
      <RadioGroup row defaultValue="label1" sx={{ columnGap: 3 }}>
        <FormControlLabel
          value="label1"
          control={<Radio color="#F94F16" />}
          label="Label"
          sx={{ gap: 1, m: 0 }}
        />
        <FormControlLabel
          value="label2"
          control={<Radio color="#F94F16" />}
          label="Label"
          sx={{ gap: 1, m: 0 }}
        />
        <FormControlLabel
          value="label3"
          control={<Radio color="#F94F16" />}
          label="Label"
          sx={{ gap: 1, m: 0 }}
        />
      </RadioGroup>
    </Stack>
  ),
};

export const Colors: Story = {
  render: () => (
    <Stack spacing={2}>
      <FormLabel>Color</FormLabel>
      <Stack direction="row" spacing={2} alignItems="center">
        <Radio defaultChecked color="#F94F16" />
        <Radio defaultChecked color="#05AE02" />
        <Radio defaultChecked color="#F06406" />
        <Radio defaultChecked color="#E61728" />
      </Stack>
    </Stack>
  ),
};

export const FormGroupExample: Story = {
  render: () => (
    <Box>
      <FormLabel>Form Group</FormLabel>
      <FormGroup>
        <Stack direction="row" spacing={3} alignItems="center">
          <FormControlLabel
            control={<Radio defaultChecked />}
            label="Top"
            labelPlacement="top"
            sx={{ gap: 1, m: 0 }}
          />
          <FormControlLabel
            control={<Radio />}
            label="Start"
            labelPlacement="start"
            sx={{ gap: 1, m: 0 }}
          />
          <FormControlLabel
            control={<Radio />}
            label="End"
            labelPlacement="end"
            sx={{ gap: 1, m: 0 }}
          />
          <FormControlLabel
            control={<Radio />}
            label="Bottom"
            labelPlacement="bottom"
            sx={{ gap: 1, m: 0 }}
          />
        </Stack>
      </FormGroup>
    </Box>
  ),
};
