import type { Meta, StoryObj } from '@storybook/nextjs';
import { Avatar, AvatarGroup } from './Avatar';

const meta = {
  title: 'Atoms/Avatar',
  component: Avatar,
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component:
          'Avatar component for displaying user pictures or text initials. Supports multiple sizes, shapes, and avatar group features.',
      },
    },
  },
  tags: ['autodocs'],
  argTypes: {
    src: {
      control: 'text',
      description: 'Image source',
    },
    alt: {
      control: 'text',
      description: 'Alternative text',
    },
    size: {
      control: 'select',
      options: ['small', 'medium', 'large'],
      description: 'Avatar size',
    },
    variant: {
      control: 'select',
      options: ['circular', 'rounded', 'square'],
      description: 'Avatar shape',
    },
    children: {
      control: 'text',
      description: 'Text content or initials',
    },
  },
} satisfies Meta<typeof Avatar>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    children: 'W',
  },
};

export const WithImage: Story = {
  args: {
    src: 'https://i.pravatar.cc/150?img=1',
    alt: 'User Avatar',
  },
};

export const WithText: Story = {
  args: {
    children: 'WX',
  },
};

export const WithInitials: Story = {
  args: {
    children: 'WX',
  },
};

export const Rounded: Story = {
  args: {
    children: 'R',
    variant: 'rounded',
  },
};

export const Square: Story = {
  args: {
    children: 'S',
    variant: 'square',
  },
};

export const Sizes: Story = {
  render: () => (
    <div style={{ display: 'flex', gap: '16px', alignItems: 'center' }}>
      <Avatar size="small">S</Avatar>
      <Avatar size="medium">M</Avatar>
      <Avatar size="large">L</Avatar>
      <Avatar size={80}>XL</Avatar>
    </div>
  ),
};

export const Variants: Story = {
  render: () => (
    <div style={{ display: 'flex', gap: '16px' }}>
      <Avatar variant="circular" src="https://i.pravatar.cc/150?img=2" />
      <Avatar variant="rounded" src="https://i.pravatar.cc/150?img=3" />
      <Avatar variant="square" src="https://i.pravatar.cc/150?img=4" />
    </div>
  ),
};

export const Group: Story = {
  render: () => (
    <AvatarGroup max={4}>
      <Avatar src="https://i.pravatar.cc/150?img=5" alt="User 1" />
      <Avatar src="https://i.pravatar.cc/150?img=6" alt="User 2" />
      <Avatar src="https://i.pravatar.cc/150?img=7" alt="User 3" />
      <Avatar src="https://i.pravatar.cc/150?img=8" alt="User 4" />
      <Avatar src="https://i.pravatar.cc/150?img=9" alt="User 5" />
      <Avatar src="https://i.pravatar.cc/150?img=10" alt="User 6" />
    </AvatarGroup>
  ),
};

export const GroupWithText: Story = {
  render: () => (
    <AvatarGroup max={3}>
      <Avatar>W</Avatar>
      <Avatar>L</Avatar>
      <Avatar>Z</Avatar>
      <Avatar>C</Avatar>
      <Avatar>K</Avatar>
    </AvatarGroup>
  ),
};

export const ColorfulAvatars: Story = {
  render: () => (
    <div style={{ display: 'flex', gap: '16px' }}>
      <Avatar sx={{ bgcolor: '#1976d2' }}>A</Avatar>
      <Avatar sx={{ bgcolor: '#dc004e' }}>B</Avatar>
      <Avatar sx={{ bgcolor: '#9c27b0' }}>C</Avatar>
      <Avatar sx={{ bgcolor: '#f57c00' }}>D</Avatar>
      <Avatar sx={{ bgcolor: '#388e3c' }}>E</Avatar>
    </div>
  ),
};
