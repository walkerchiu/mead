import type { Meta, StoryObj } from '@storybook/react';
import { Divider } from './Divider';
import { Box, Typography } from '@mui/material';

const meta = {
  title: 'Atoms/Divider',
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
      description: '文字對齊方式',
    },
  },
} satisfies Meta<typeof Divider>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  render: () => (
    <Box sx={{ width: '400px' }}>
      <Typography>上方內容</Typography>
      <Divider />
      <Typography>下方內容</Typography>
    </Box>
  ),
};

export const WithText: Story = {
  render: () => (
    <Box sx={{ width: '400px' }}>
      <Typography>登入方式</Typography>
      <Divider>或</Divider>
      <Typography>其他選項</Typography>
    </Box>
  ),
};

export const TextAlignLeft: Story = {
  render: () => (
    <Box sx={{ width: '400px' }}>
      <Divider textAlign="left">左對齊</Divider>
    </Box>
  ),
};

export const TextAlignCenter: Story = {
  render: () => (
    <Box sx={{ width: '400px' }}>
      <Divider textAlign="center">置中</Divider>
    </Box>
  ),
};

export const TextAlignRight: Story = {
  render: () => (
    <Box sx={{ width: '400px' }}>
      <Divider textAlign="right">右對齊</Divider>
    </Box>
  ),
};

export const Middle: Story = {
  render: () => (
    <Box sx={{ width: '400px' }}>
      <Typography>內容區塊一</Typography>
      <Divider variant="middle" />
      <Typography>內容區塊二</Typography>
    </Box>
  ),
};

export const Inset: Story = {
  render: () => (
    <Box sx={{ width: '400px' }}>
      <Typography>列表項目一</Typography>
      <Divider variant="inset" />
      <Typography>列表項目二</Typography>
    </Box>
  ),
};

export const Vertical: Story = {
  render: () => (
    <Box sx={{ display: 'flex', alignItems: 'center', height: '100px' }}>
      <Typography>左側</Typography>
      <Divider orientation="vertical" flexItem sx={{ mx: 2 }} />
      <Typography>右側</Typography>
    </Box>
  ),
};

export const VerticalWithText: Story = {
  render: () => (
    <Box sx={{ display: 'flex', alignItems: 'center', height: '100px' }}>
      <Typography>選項一</Typography>
      <Divider orientation="vertical" flexItem sx={{ mx: 2 }}>
        或
      </Divider>
      <Typography>選項二</Typography>
    </Box>
  ),
};

export const Light: Story = {
  render: () => (
    <Box sx={{ width: '400px', bgcolor: '#333', p: 2 }}>
      <Typography sx={{ color: 'white' }}>深色背景</Typography>
      <Divider light sx={{ my: 1 }} />
      <Typography sx={{ color: 'white' }}>淺色分隔線</Typography>
    </Box>
  ),
};

export const InList: Story = {
  render: () => (
    <Box sx={{ width: '400px' }}>
      <Typography variant="h6">購物清單</Typography>
      <Divider sx={{ my: 1 }} />
      <Typography>蘋果</Typography>
      <Divider />
      <Typography>香蕉</Typography>
      <Divider />
      <Typography>橘子</Typography>
    </Box>
  ),
};

export const Section: Story = {
  render: () => (
    <Box sx={{ width: '400px' }}>
      <Typography variant="h5">標題</Typography>
      <Typography variant="body2" color="text.secondary">
        副標題描述
      </Typography>
      <Divider sx={{ my: 2 }}>第一節</Divider>
      <Typography>第一節內容...</Typography>
      <Divider sx={{ my: 2 }}>第二節</Divider>
      <Typography>第二節內容...</Typography>
    </Box>
  ),
};
