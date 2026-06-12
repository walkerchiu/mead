import type { Meta, StoryObj } from '@storybook/nextjs';
import { Divider } from './Divider';
import { Box, Typography } from '@mui/material';

const meta = {
  title: 'Shared/Atoms/Divider',
  component: Divider,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
  argTypes: {
    orientation: {
      control: 'select',
      options: ['horizontal', 'vertical'],
      description: '分隔線方向',
    },
    variant: {
      control: 'select',
      options: ['fullWidth', 'inset', 'middle'],
      description: '分隔線變體',
    },
    textAlign: {
      control: 'select',
      options: ['left', 'center', 'right'],
      description: '文字對齊',
    },
  },
} satisfies Meta<typeof Divider>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  render: () => (
    <Box sx={{ width: '400px' }}>
      <Typography>Content above</Typography>
      <Divider />
      <Typography>Content below</Typography>
    </Box>
  ),
};

export const WithText: Story = {
  render: () => (
    <Box sx={{ width: '400px' }}>
      <Typography>Login Options</Typography>
      <Divider>OR</Divider>
      <Typography>Other Options</Typography>
    </Box>
  ),
};

export const TextAlignLeft: Story = {
  render: () => (
    <Box sx={{ width: '400px' }}>
      <Divider textAlign="left">Left aligned</Divider>
    </Box>
  ),
};

export const TextAlignCenter: Story = {
  render: () => (
    <Box sx={{ width: '400px' }}>
      <Divider textAlign="center">Center</Divider>
    </Box>
  ),
};

export const TextAlignRight: Story = {
  render: () => (
    <Box sx={{ width: '400px' }}>
      <Divider textAlign="right">Right aligned</Divider>
    </Box>
  ),
};

export const Middle: Story = {
  render: () => (
    <Box sx={{ width: '400px' }}>
      <Typography>Content Block 1</Typography>
      <Divider variant="middle" />
      <Typography>Content Block 2</Typography>
    </Box>
  ),
};

export const Inset: Story = {
  render: () => (
    <Box sx={{ width: '400px' }}>
      <Typography>List Item 1</Typography>
      <Divider variant="inset" />
      <Typography>List Item 2</Typography>
    </Box>
  ),
};

export const Vertical: Story = {
  render: () => (
    <Box sx={{ display: 'flex', alignItems: 'center', height: '100px' }}>
      <Typography>Left</Typography>
      <Divider orientation="vertical" flexItem sx={{ mx: 2 }} />
      <Typography>Right</Typography>
    </Box>
  ),
};

export const VerticalWithText: Story = {
  render: () => (
    <Box sx={{ display: 'flex', alignItems: 'center', height: '100px' }}>
      <Typography>Option 1</Typography>
      <Divider orientation="vertical" flexItem sx={{ mx: 2 }}>
        OR
      </Divider>
      <Typography>Option 2</Typography>
    </Box>
  ),
};

export const Light: Story = {
  render: () => (
    <Box sx={{ width: '400px', bgcolor: '#333', p: 2 }}>
      <Typography sx={{ color: 'white' }}>Dark Background</Typography>
      <Divider light sx={{ my: 1 }} />
      <Typography sx={{ color: 'white' }}>Light divider</Typography>
    </Box>
  ),
};

export const InList: Story = {
  render: () => (
    <Box sx={{ width: '400px' }}>
      <Typography variant="h6">Shopping List</Typography>
      <Divider sx={{ my: 1 }} />
      <Typography>Apple</Typography>
      <Divider />
      <Typography>Banana</Typography>
      <Divider />
      <Typography>Orange</Typography>
    </Box>
  ),
};

export const Section: Story = {
  render: () => (
    <Box sx={{ width: '400px' }}>
      <Typography variant="h5">Title</Typography>
      <Typography variant="body2" color="text.secondary">
        Subtitle description
      </Typography>
      <Divider sx={{ my: 2 }}>Section 1</Divider>
      <Typography>Section 1 content...</Typography>
      <Divider sx={{ my: 2 }}>Section 2</Divider>
      <Typography>Section 2 content...</Typography>
    </Box>
  ),
};
