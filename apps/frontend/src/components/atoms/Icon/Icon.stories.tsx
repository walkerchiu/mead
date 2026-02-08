import type { Meta, StoryObj } from '@storybook/nextjs';
import { Icon } from './Icon';
import { Box, Typography } from '@mui/material';

const meta = {
  title: 'Atoms/Icon',
  component: Icon,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
  argTypes: {
    size: {
      control: 'select',
      options: ['small', 'medium', 'large'],
      description: 'Icon size',
    },
    color: {
      control: 'select',
      options: [
        'inherit',
        'primary',
        'secondary',
        'error',
        'warning',
        'info',
        'success',
        'disabled',
      ],
      description: 'Icon color',
    },
  },
} satisfies Meta<typeof Icon>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    children: '🏠',
  },
};

export const Sizes: Story = {
  render: () => (
    <Box sx={{ display: 'flex', gap: 3, alignItems: 'center' }}>
      <Icon size="small">⭐</Icon>
      <Icon size="medium">⭐</Icon>
      <Icon size="large">⭐</Icon>
    </Box>
  ),
};

export const Colors: Story = {
  render: () => (
    <Box
      sx={{ display: 'flex', gap: 2, flexWrap: 'wrap', alignItems: 'center' }}
    >
      <Box sx={{ textAlign: 'center' }}>
        <Icon color="primary">❤️</Icon>
        <Typography variant="caption" display="block">
          Primary
        </Typography>
      </Box>
      <Box sx={{ textAlign: 'center' }}>
        <Icon color="secondary">💜</Icon>
        <Typography variant="caption" display="block">
          Secondary
        </Typography>
      </Box>
      <Box sx={{ textAlign: 'center' }}>
        <Icon color="error">🔴</Icon>
        <Typography variant="caption" display="block">
          Error
        </Typography>
      </Box>
      <Box sx={{ textAlign: 'center' }}>
        <Icon color="warning">🟡</Icon>
        <Typography variant="caption" display="block">
          Warning
        </Typography>
      </Box>
      <Box sx={{ textAlign: 'center' }}>
        <Icon color="info">🔵</Icon>
        <Typography variant="caption" display="block">
          Info
        </Typography>
      </Box>
      <Box sx={{ textAlign: 'center' }}>
        <Icon color="success">🟢</Icon>
        <Typography variant="caption" display="block">
          Success
        </Typography>
      </Box>
    </Box>
  ),
};

export const CustomSize: Story = {
  render: () => (
    <Box sx={{ display: 'flex', gap: 3, alignItems: 'center' }}>
      <Icon fontSize={16}>🎨</Icon>
      <Icon fontSize={24}>🎨</Icon>
      <Icon fontSize={32}>🎨</Icon>
      <Icon fontSize={48}>🎨</Icon>
      <Icon fontSize={64}>🎨</Icon>
    </Box>
  ),
};

export const CommonIcons: Story = {
  render: () => (
    <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
      <Icon>🏠</Icon>
      <Icon>⚙️</Icon>
      <Icon>👤</Icon>
      <Icon>📧</Icon>
      <Icon>🔔</Icon>
      <Icon>💬</Icon>
      <Icon>📱</Icon>
      <Icon>💻</Icon>
      <Icon>🔍</Icon>
      <Icon>✏️</Icon>
      <Icon>🗑️</Icon>
      <Icon>❤️</Icon>
      <Icon>⭐</Icon>
      <Icon>✅</Icon>
      <Icon>❌</Icon>
      <Icon>⚠️</Icon>
      <Icon>ℹ️</Icon>
      <Icon>🔒</Icon>
      <Icon>🔓</Icon>
      <Icon>📁</Icon>
      <Icon>📄</Icon>
      <Icon>🖼️</Icon>
      <Icon>🎵</Icon>
      <Icon>🎬</Icon>
    </Box>
  ),
};

export const WithLabels: Story = {
  render: () => (
    <Box sx={{ display: 'flex', gap: 3, flexWrap: 'wrap' }}>
      {[
        { icon: '🏠', label: 'Home' },
        { icon: '⚙️', label: 'Settings' },
        { icon: '👤', label: 'Profile' },
        { icon: '📧', label: 'Mail' },
        { icon: '🔔', label: 'Notifications' },
        { icon: '💬', label: 'Messages' },
      ].map((item) => (
        <Box
          key={item.label}
          sx={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: 0.5,
          }}
        >
          <Icon size="large">{item.icon}</Icon>
          <Typography variant="caption">{item.label}</Typography>
        </Box>
      ))}
    </Box>
  ),
};

export const InButton: Story = {
  render: () => (
    <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
      <Box
        sx={{
          px: 2,
          py: 1,
          bgcolor: 'primary.main',
          color: 'white',
          borderRadius: 1,
          display: 'flex',
          alignItems: 'center',
          gap: 1,
          cursor: 'pointer',
        }}
      >
        <Icon color="inherit">🏠</Icon>
        <Typography>Home</Typography>
      </Box>
      <Box
        sx={{
          px: 2,
          py: 1,
          bgcolor: 'secondary.main',
          color: 'white',
          borderRadius: 1,
          display: 'flex',
          alignItems: 'center',
          gap: 1,
          cursor: 'pointer',
        }}
      >
        <Icon color="inherit">⚙️</Icon>
        <Typography>Settings</Typography>
      </Box>
      <Box
        sx={{
          px: 2,
          py: 1,
          bgcolor: 'error.main',
          color: 'white',
          borderRadius: 1,
          display: 'flex',
          alignItems: 'center',
          gap: 1,
          cursor: 'pointer',
        }}
      >
        <Icon color="inherit">🗑️</Icon>
        <Typography>Delete</Typography>
      </Box>
    </Box>
  ),
};

export const NavigationIcons: Story = {
  render: () => (
    <Box
      sx={{
        bgcolor: 'background.paper',
        borderRadius: 2,
        p: 2,
        display: 'flex',
        flexDirection: 'column',
        gap: 1,
        minWidth: 200,
        boxShadow: 1,
      }}
    >
      {[
        { icon: '🏠', label: 'Home', active: true },
        { icon: '🔍', label: 'Explore', active: false },
        { icon: '💬', label: 'Messages', active: false },
        { icon: '🔔', label: 'Notifications', active: false },
        { icon: '👤', label: 'Profile', active: false },
      ].map((item) => (
        <Box
          key={item.label}
          sx={{
            display: 'flex',
            alignItems: 'center',
            gap: 2,
            px: 2,
            py: 1.5,
            borderRadius: 1,
            bgcolor: item.active ? 'action.selected' : 'transparent',
            cursor: 'pointer',
            '&:hover': {
              bgcolor: 'action.hover',
            },
          }}
        >
          <Icon size="medium">{item.icon}</Icon>
          <Typography
            sx={{
              fontWeight: item.active ? 600 : 400,
            }}
          >
            {item.label}
          </Typography>
        </Box>
      ))}
    </Box>
  ),
};

export const StatusIcons: Story = {
  render: () => (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
      {[
        { icon: '✅', label: 'Success', color: 'success' },
        { icon: '❌', label: 'Error', color: 'error' },
        { icon: '⚠️', label: 'Warning', color: 'warning' },
        { icon: 'ℹ️', label: 'Info', color: 'info' },
      ].map((item) => (
        <Box
          key={item.label}
          sx={{
            display: 'flex',
            alignItems: 'center',
            gap: 2,
            p: 2,
            borderRadius: 1,
            border: 1,
            borderColor: 'divider',
          }}
        >
          {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
          <Icon color={item.color as any} size="large">
            {item.icon}
          </Icon>
          <Box>
            <Typography variant="subtitle2">{item.label}</Typography>
            <Typography variant="body2" color="text.secondary">
              This is a {item.label} message example
            </Typography>
          </Box>
        </Box>
      ))}
    </Box>
  ),
};

export const FileTypeIcons: Story = {
  render: () => (
    <Box sx={{ display: 'flex', gap: 3, flexWrap: 'wrap' }}>
      {[
        { icon: '📄', label: 'Document' },
        { icon: '🖼️', label: 'Image' },
        { icon: '🎵', label: 'Audio' },
        { icon: '🎬', label: 'Video' },
        { icon: '📁', label: 'Folder' },
        { icon: '🗜️', label: 'Archive' },
        { icon: '💾', label: 'Data' },
        { icon: '🔗', label: 'Link' },
      ].map((item) => (
        <Box
          key={item.label}
          sx={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: 1,
            p: 2,
            border: 1,
            borderColor: 'divider',
            borderRadius: 2,
            minWidth: 80,
          }}
        >
          <Icon size="large">{item.icon}</Icon>
          <Typography variant="caption">{item.label}</Typography>
        </Box>
      ))}
    </Box>
  ),
};
