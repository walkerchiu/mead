import type { Meta, StoryObj } from '@storybook/react';
import { Badge } from './Badge';
import { Box, Avatar, IconButton } from '@mui/material';

const meta = {
  title: 'Atoms/Badge',
  component: Badge,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
  argTypes: {
    badgeContent: {
      control: 'text',
      description: 'Badge content',
    },
    color: {
      control: 'select',
      options: [
        'default',
        'primary',
        'secondary',
        'error',
        'info',
        'success',
        'warning',
      ],
      description: 'Color',
    },
    variant: {
      control: 'select',
      options: ['standard', 'dot'],
      description: 'Variant',
    },
  },
} satisfies Meta<typeof Badge>;

export default meta;
type Story = StoryObj<typeof meta>;

// Simple icon replacement
const MailIcon = () => (
  <Box
    sx={{
      width: 40,
      height: 40,
      bgcolor: 'grey.300',
      borderRadius: 1,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
    }}
  >
    📧
  </Box>
);

const NotificationIcon = () => (
  <Box
    sx={{
      width: 40,
      height: 40,
      bgcolor: 'grey.300',
      borderRadius: 1,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
    }}
  >
    🔔
  </Box>
);

export const Default: Story = {
  args: {
    badgeContent: 4,
    color: 'primary',
    children: <MailIcon />,
  },
};

export const Colors: Story = {
  render: () => (
    <Box sx={{ display: 'flex', gap: 3, flexWrap: 'wrap' }}>
      <Badge badgeContent={4} color="default">
        <MailIcon />
      </Badge>
      <Badge badgeContent={4} color="primary">
        <MailIcon />
      </Badge>
      <Badge badgeContent={4} color="secondary">
        <MailIcon />
      </Badge>
      <Badge badgeContent={4} color="error">
        <MailIcon />
      </Badge>
      <Badge badgeContent={4} color="info">
        <MailIcon />
      </Badge>
      <Badge badgeContent={4} color="success">
        <MailIcon />
      </Badge>
      <Badge badgeContent={4} color="warning">
        <MailIcon />
      </Badge>
    </Box>
  ),
};

export const MaxValue: Story = {
  render: () => (
    <Box sx={{ display: 'flex', gap: 3 }}>
      <Badge badgeContent={99} color="error">
        <MailIcon />
      </Badge>
      <Badge badgeContent={100} color="error">
        <MailIcon />
      </Badge>
      <Badge badgeContent={1000} max={999} color="error">
        <MailIcon />
      </Badge>
    </Box>
  ),
};

export const Dot: Story = {
  render: () => (
    <Box sx={{ display: 'flex', gap: 3 }}>
      <Badge variant="dot" color="primary">
        <MailIcon />
      </Badge>
      <Badge variant="dot" color="secondary">
        <NotificationIcon />
      </Badge>
      <Badge variant="dot" color="error">
        <Avatar sx={{ bgcolor: '#1976d2' }}>U</Avatar>
      </Badge>
      <Badge variant="dot" color="success">
        <Avatar sx={{ bgcolor: '#dc004e' }}>A</Avatar>
      </Badge>
    </Box>
  ),
};

export const ShowZero: Story = {
  render: () => (
    <Box sx={{ display: 'flex', gap: 3 }}>
      <Badge badgeContent={0} color="primary">
        <MailIcon />
      </Badge>
      <Badge badgeContent={0} color="primary" showZero>
        <MailIcon />
      </Badge>
    </Box>
  ),
};

export const CustomContent: Story = {
  render: () => (
    <Box sx={{ display: 'flex', gap: 3 }}>
      <Badge badgeContent="new" color="secondary">
        <Box
          sx={{
            width: 60,
            height: 60,
            bgcolor: 'grey.300',
            borderRadius: 1,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          Product
        </Box>
      </Badge>
      <Badge badgeContent="Hot" color="error">
        <Box
          sx={{
            width: 60,
            height: 60,
            bgcolor: 'grey.300',
            borderRadius: 1,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          Item
        </Box>
      </Badge>
      <Badge badgeContent="🔥" color="warning">
        <Box
          sx={{
            width: 60,
            height: 60,
            bgcolor: 'grey.300',
            borderRadius: 1,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          On Sale
        </Box>
      </Badge>
    </Box>
  ),
};

export const AnchorOrigin: Story = {
  render: () => (
    <Box sx={{ display: 'flex', gap: 3, flexWrap: 'wrap' }}>
      <Badge
        badgeContent={4}
        color="primary"
        anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
      >
        <MailIcon />
      </Badge>
      <Badge
        badgeContent={4}
        color="primary"
        anchorOrigin={{ vertical: 'top', horizontal: 'left' }}
      >
        <MailIcon />
      </Badge>
      <Badge
        badgeContent={4}
        color="primary"
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      >
        <MailIcon />
      </Badge>
      <Badge
        badgeContent={4}
        color="primary"
        anchorOrigin={{ vertical: 'bottom', horizontal: 'left' }}
      >
        <MailIcon />
      </Badge>
    </Box>
  ),
};

export const Overlap: Story = {
  render: () => (
    <Box sx={{ display: 'flex', gap: 3 }}>
      <Badge badgeContent={4} color="primary" overlap="rectangular">
        <Box
          sx={{
            width: 50,
            height: 50,
            bgcolor: 'grey.300',
            borderRadius: 1,
          }}
        />
      </Badge>
      <Badge badgeContent={4} color="primary" overlap="circular">
        <Avatar sx={{ bgcolor: '#1976d2' }}>U</Avatar>
      </Badge>
    </Box>
  ),
};

export const Invisible: Story = {
  render: () => (
    <Box sx={{ display: 'flex', gap: 3 }}>
      <Badge badgeContent={4} color="primary">
        <MailIcon />
      </Badge>
      <Badge badgeContent={4} color="primary" invisible>
        <MailIcon />
      </Badge>
    </Box>
  ),
};

export const InAppBar: Story = {
  render: () => (
    <Box
      sx={{
        display: 'flex',
        gap: 2,
        bgcolor: '#1976d2',
        p: 2,
        borderRadius: 1,
      }}
    >
      <IconButton sx={{ color: 'white' }}>
        <Badge badgeContent={4} color="error">
          <NotificationIcon />
        </Badge>
      </IconButton>
      <IconButton sx={{ color: 'white' }}>
        <Badge badgeContent={17} color="error">
          <MailIcon />
        </Badge>
      </IconButton>
      <IconButton sx={{ color: 'white' }}>
        <Badge variant="dot" color="error">
          <Box
            sx={{
              width: 40,
              height: 40,
              bgcolor: 'white',
              borderRadius: '50%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            👤
          </Box>
        </Badge>
      </IconButton>
    </Box>
  ),
};

export const OnlineStatus: Story = {
  render: () => (
    <Box sx={{ display: 'flex', gap: 3 }}>
      <Badge
        variant="dot"
        color="success"
        overlap="circular"
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      >
        <Avatar sx={{ bgcolor: '#1976d2' }}>Online</Avatar>
      </Badge>
      <Badge
        variant="dot"
        color="error"
        overlap="circular"
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      >
        <Avatar sx={{ bgcolor: '#dc004e' }}>Offline</Avatar>
      </Badge>
      <Badge
        variant="dot"
        color="warning"
        overlap="circular"
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      >
        <Avatar sx={{ bgcolor: '#f57c00' }}>Busy</Avatar>
      </Badge>
    </Box>
  ),
};
