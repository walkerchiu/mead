import type { Meta, StoryObj } from '@storybook/nextjs';
import { Box, Typography } from '@mui/material';
import { UserButton } from './UserButton';

/**
 * UserButton - Atomic Design: Atom
 *
 * 使用者選單的觸發按鈕，可顯示使用者頭像或圖示，支援顯示姓名與線上狀態。
 */
const meta = {
  title: 'Shared/Atoms/UserButton',
  component: UserButton,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
  argTypes: {
    color: {
      control: 'select',
      options: [
        'inherit',
        'primary',
        'secondary',
        'success',
        'error',
        'info',
        'warning',
      ],
    },
    size: {
      control: 'select',
      options: ['small', 'medium', 'large'],
    },
    showName: {
      control: 'boolean',
    },
    showStatus: {
      control: 'boolean',
    },
    iconMode: {
      control: 'boolean',
    },
  },
} satisfies Meta<typeof UserButton>;

export default meta;
type Story = StoryObj<typeof meta>;

const defaultUser = {
  name: 'John Doe',
  email: 'john@example.com',
  avatar: '/avatars/user-01.jpg',
  status: 'online' as const,
};

/**
 * 預設樣式 - 僅頭像
 */
export const Default: Story = {
  args: {
    user: defaultUser,
  },
};

/**
 * 顯示使用者名稱
 */
export const WithName: Story = {
  args: {
    user: defaultUser,
    showName: true,
  },
};

/**
 * 顯示線上狀態指示器
 */
export const WithStatus: Story = {
  args: {
    user: defaultUser,
    showStatus: true,
  },
};

/**
 * 完整模式 - 顯示姓名與狀態
 */
export const Full: Story = {
  args: {
    user: defaultUser,
    showName: true,
    showStatus: true,
  },
};

/**
 * 圖示模式 - 使用統一圖示取代頭像
 */
export const IconMode: Story = {
  args: {
    user: defaultUser,
    iconMode: true,
  },
};

/**
 * 圖示模式 + 顯示姓名
 */
export const IconModeWithName: Story = {
  args: {
    user: defaultUser,
    iconMode: true,
    showName: true,
  },
};

/**
 * 無頭像的使用者（顯示縮寫）
 */
export const WithoutAvatar: Story = {
  args: {
    user: {
      name: 'Jane Smith',
      email: 'jane@example.com',
      status: 'online' as const,
    },
    showName: true,
  },
};

/**
 * 不同尺寸比較
 */
export const Sizes: Story = {
  render: () => (
    <Box sx={{ display: 'flex', gap: 4, alignItems: 'center' }}>
      <Box
        sx={{
          display: 'flex',
          flexDirection: 'column',
          gap: 1,
          alignItems: 'center',
        }}
      >
        <UserButton user={defaultUser} showName size="small" />
        <Typography variant="caption">Small</Typography>
      </Box>
      <Box
        sx={{
          display: 'flex',
          flexDirection: 'column',
          gap: 1,
          alignItems: 'center',
        }}
      >
        <UserButton user={defaultUser} showName size="medium" />
        <Typography variant="caption">Medium</Typography>
      </Box>
      <Box
        sx={{
          display: 'flex',
          flexDirection: 'column',
          gap: 1,
          alignItems: 'center',
        }}
      >
        <UserButton user={defaultUser} showName size="large" />
        <Typography variant="caption">Large</Typography>
      </Box>
    </Box>
  ),
};

/**
 * 不同顏色比較
 */
export const Colors: Story = {
  render: () => (
    <Box sx={{ display: 'flex', gap: 4, alignItems: 'center' }}>
      <Box
        sx={{
          display: 'flex',
          flexDirection: 'column',
          gap: 1,
          alignItems: 'center',
        }}
      >
        <UserButton user={defaultUser} color="primary" />
        <Typography variant="caption">Primary</Typography>
      </Box>
      <Box
        sx={{
          display: 'flex',
          flexDirection: 'column',
          gap: 1,
          alignItems: 'center',
        }}
      >
        <UserButton user={defaultUser} color="secondary" />
        <Typography variant="caption">Secondary</Typography>
      </Box>
    </Box>
  ),
};

/**
 * 所有狀態指示器比較
 */
export const AllStatuses: Story = {
  render: () => (
    <Box sx={{ display: 'flex', gap: 4, alignItems: 'center' }}>
      <Box
        sx={{
          display: 'flex',
          flexDirection: 'column',
          gap: 1,
          alignItems: 'center',
        }}
      >
        <UserButton
          user={{ ...defaultUser, status: 'online' as const }}
          showStatus
        />
        <Typography variant="caption">Online</Typography>
      </Box>
      <Box
        sx={{
          display: 'flex',
          flexDirection: 'column',
          gap: 1,
          alignItems: 'center',
        }}
      >
        <UserButton
          user={{ ...defaultUser, status: 'away' as const }}
          showStatus
        />
        <Typography variant="caption">Away</Typography>
      </Box>
      <Box
        sx={{
          display: 'flex',
          flexDirection: 'column',
          gap: 1,
          alignItems: 'center',
        }}
      >
        <UserButton
          user={{ ...defaultUser, status: 'busy' as const }}
          showStatus
        />
        <Typography variant="caption">Busy</Typography>
      </Box>
      <Box
        sx={{
          display: 'flex',
          flexDirection: 'column',
          gap: 1,
          alignItems: 'center',
        }}
      >
        <UserButton
          user={{ ...defaultUser, status: 'offline' as const }}
          showStatus
        />
        <Typography variant="caption">Offline</Typography>
      </Box>
    </Box>
  ),
};
