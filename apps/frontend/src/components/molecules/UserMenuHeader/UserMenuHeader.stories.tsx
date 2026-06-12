import type { Meta, StoryObj } from '@storybook/nextjs';
import { UserMenuHeader } from './UserMenuHeader';
import { Box, Typography } from '@mui/material';

/**
 * UserMenuHeader - Atomic Design: Molecule
 *
 * 使用者選單頁首，顯示使用者頭像、姓名、email、角色與線上狀態。
 * 結合 Avatar（Atom）與 Badge（Atom）。
 */
const meta = {
  title: 'Shared/Molecules/UserMenuHeader',
  component: UserMenuHeader,
  parameters: {
    layout: 'padded',
  },
  tags: ['autodocs'],
  argTypes: {
    showEmail: {
      control: 'boolean',
    },
    showRole: {
      control: 'boolean',
    },
    showStatus: {
      control: 'boolean',
    },
  },
  decorators: [
    (Story) => (
      <Box
        sx={{
          width: 300,
          border: '1px solid',
          borderColor: 'divider',
          borderRadius: 1,
        }}
      >
        <Story />
      </Box>
    ),
  ],
} satisfies Meta<typeof UserMenuHeader>;

export default meta;
type Story = StoryObj<typeof meta>;

const defaultUser = {
  name: 'John Doe',
  email: 'john@example.com',
  avatar: '/avatars/user-01.jpg',
  role: 'HQ',
  status: 'online' as const,
};

/**
 * 預設樣式 - 顯示姓名與 email
 */
export const Default: Story = {
  args: {
    user: defaultUser,
  },
};

/**
 * 完整資訊 - 顯示所有欄位
 */
export const Full: Story = {
  args: {
    user: defaultUser,
    showEmail: true,
    showRole: true,
    showStatus: true,
  },
};

/**
 * 僅姓名
 */
export const NameOnly: Story = {
  args: {
    user: defaultUser,
    showEmail: false,
    showRole: false,
    showStatus: false,
  },
};

/**
 * 含姓名與角色
 */
export const WithRole: Story = {
  args: {
    user: defaultUser,
    showEmail: false,
    showRole: true,
    showStatus: false,
  },
};

/**
 * 含姓名與狀態
 */
export const WithStatus: Story = {
  args: {
    user: defaultUser,
    showEmail: false,
    showRole: false,
    showStatus: true,
  },
};

/**
 * 所有狀態變體並列顯示
 */
export const AllStatuses: Story = {
  decorators: [
    (_Story) => (
      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
        <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
          <Box sx={{ flex: '1 1 280px' }}>
            <Typography variant="subtitle2" gutterBottom>
              Online
            </Typography>
            <Box
              sx={{
                border: '1px solid',
                borderColor: 'divider',
                borderRadius: 1,
              }}
            >
              <UserMenuHeader
                user={{ ...defaultUser, status: 'online' as const }}
                showEmail={true}
                showRole={true}
                showStatus={true}
              />
            </Box>
          </Box>
          <Box sx={{ flex: '1 1 280px' }}>
            <Typography variant="subtitle2" gutterBottom>
              Away
            </Typography>
            <Box
              sx={{
                border: '1px solid',
                borderColor: 'divider',
                borderRadius: 1,
              }}
            >
              <UserMenuHeader
                user={{ ...defaultUser, status: 'away' as const }}
                showEmail={true}
                showRole={true}
                showStatus={true}
              />
            </Box>
          </Box>
        </Box>
        <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
          <Box sx={{ flex: '1 1 280px' }}>
            <Typography variant="subtitle2" gutterBottom>
              Busy
            </Typography>
            <Box
              sx={{
                border: '1px solid',
                borderColor: 'divider',
                borderRadius: 1,
              }}
            >
              <UserMenuHeader
                user={{ ...defaultUser, status: 'busy' as const }}
                showEmail={true}
                showRole={true}
                showStatus={true}
              />
            </Box>
          </Box>
          <Box sx={{ flex: '1 1 280px' }}>
            <Typography variant="subtitle2" gutterBottom>
              Offline
            </Typography>
            <Box
              sx={{
                border: '1px solid',
                borderColor: 'divider',
                borderRadius: 1,
              }}
            >
              <UserMenuHeader
                user={{ ...defaultUser, status: 'offline' as const }}
                showEmail={true}
                showRole={true}
                showStatus={true}
              />
            </Box>
          </Box>
        </Box>
      </Box>
    ),
  ],
  args: {
    user: defaultUser,
    showEmail: true,
    showRole: true,
    showStatus: true,
  },
};

/**
 * 所有角色變體並列顯示
 */
export const AllRoles: Story = {
  decorators: [
    (_Story) => (
      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
        <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
          <Box sx={{ flex: '1 1 280px' }}>
            <Typography variant="subtitle2" gutterBottom>
              HQ
            </Typography>
            <Box
              sx={{
                border: '1px solid',
                borderColor: 'divider',
                borderRadius: 1,
              }}
            >
              <UserMenuHeader
                user={{ ...defaultUser, role: 'HQ' }}
                showEmail={true}
                showRole={true}
              />
            </Box>
          </Box>
          <Box sx={{ flex: '1 1 280px' }}>
            <Typography variant="subtitle2" gutterBottom>
              Customer
            </Typography>
            <Box
              sx={{
                border: '1px solid',
                borderColor: 'divider',
                borderRadius: 1,
              }}
            >
              <UserMenuHeader
                user={{ ...defaultUser, role: 'Customer' }}
                showEmail={true}
                showRole={true}
              />
            </Box>
          </Box>
        </Box>
        <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
          <Box sx={{ flex: '1 1 280px' }}>
            <Typography variant="subtitle2" gutterBottom>
              Manager
            </Typography>
            <Box
              sx={{
                border: '1px solid',
                borderColor: 'divider',
                borderRadius: 1,
              }}
            >
              <UserMenuHeader
                user={{ ...defaultUser, role: 'Manager' }}
                showEmail={true}
                showRole={true}
              />
            </Box>
          </Box>
        </Box>
      </Box>
    ),
  ],
  args: {
    user: defaultUser,
    showEmail: true,
    showRole: true,
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
      role: 'Customer',
      status: 'online' as const,
    },
    showEmail: true,
    showRole: true,
    showStatus: true,
  },
};

/**
 * 無角色的使用者
 */
export const WithoutRole: Story = {
  args: {
    user: {
      name: 'John Doe',
      email: 'john@example.com',
      status: 'online' as const,
    },
    showEmail: true,
    showRole: true,
    showStatus: true,
  },
};

/**
 * 長姓名與 email
 */
export const LongContent: Story = {
  args: {
    user: {
      name: 'Alexander Christopher Wellington',
      email: 'alexander.wellington@very-long-company-domain.com',
      role: 'Senior System HQistrator',
      status: 'online' as const,
    },
    showEmail: true,
    showRole: true,
    showStatus: true,
  },
};
