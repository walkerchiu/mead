import type { Meta, StoryObj } from '@storybook/nextjs';
import { Box, Stack } from '@mui/material';
import { UserLink } from './UserLink';

/**
 * UserLink — 使用者名稱 + 頭像的內聯顯示元件。
 *
 * **使用場景**：所有「顯示使用者身份」的表格欄位、通知操作者、留言作者等。
 *
 * **設計重點**：
 * - 模板未提供公開個人檔案頁，本元件僅做純粹顯示，不再導向
 * - 未設定頭像時顯示姓名首字
 * - 可選擇隱藏 Avatar（超緊湊場景）
 */
const meta = {
  title: 'HQ Scope/Atoms/UserLink',
  component: UserLink,
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component:
          '使用者名稱 + Avatar 的內聯顯示元件，統一用於系統中所有顯示使用者身份的場景。',
      },
    },
  },
  tags: ['autodocs'],
  argTypes: {
    userId: { control: 'text', description: '使用者 ID' },
    name: { control: 'text', description: '顯示名稱' },
    email: { control: 'text', description: '電子郵件（fallback）' },
    avatar: { control: 'text', description: '頭像 URL' },
    showAvatar: { control: 'boolean', description: '是否顯示 Avatar' },
    avatarSize: {
      control: { type: 'number', min: 16, max: 64, step: 4 },
      description: 'Avatar 尺寸（px）',
    },
    variant: {
      control: 'select',
      options: ['body1', 'body2', 'caption'],
    },
  },
} satisfies Meta<typeof UserLink>;

export default meta;
type Story = StoryObj<typeof meta>;

/** 基本用法：姓名 + Avatar */
export const Default: Story = {
  args: {
    userId: '1',
    name: '邱晨真 Walker Chiu',
    email: 'walker.chiu@icp-si.com',
  },
};

/** 無姓名時 fallback 為 Email */
export const EmailFallback: Story = {
  args: {
    userId: '2',
    name: null,
    email: 'user@example.com',
  },
};

/** 有頭像 URL */
export const WithAvatarImage: Story = {
  args: {
    userId: '3',
    name: 'Jane Doe',
    avatar: 'https://i.pravatar.cc/100?img=5',
  },
};

/** 僅顯示名稱（隱藏 Avatar）*/
export const NoAvatar: Story = {
  args: {
    userId: '4',
    name: '邱晨真 Walker Chiu',
    showAvatar: false,
  },
};

/** 大尺寸 Avatar（40px，適合 header 或詳情頁）*/
export const LargeAvatar: Story = {
  args: {
    userId: '5',
    name: '邱晨真 Walker Chiu',
    avatarSize: 40,
    variant: 'body1',
  },
};

/** 多個 UserLink 在一個容器中（例如協作者列表）*/
export const Stack_Example: Story = {
  name: 'Stack（多人列表）',
  render: () => (
    <Stack spacing={1}>
      <UserLink userId="1" name="邱晨真 Walker Chiu" />
      <UserLink userId="2" name="邱晨真 Gmail" />
      <UserLink userId="3" name="邱晨真 YMail" />
      <UserLink
        userId="4"
        email="noname@example.com"
        avatar="https://i.pravatar.cc/100?img=8"
      />
    </Stack>
  ),
};

/** 在表格儲存格中的使用（緊湊模式）*/
export const InTableCell: Story = {
  render: () => (
    <Box
      sx={{
        display: 'grid',
        gridTemplateColumns: '140px 1fr 200px',
        gap: 2,
        p: 2,
        border: '1px solid',
        borderColor: 'divider',
        borderRadius: 1,
        width: 600,
      }}
    >
      <Box sx={{ color: 'text.secondary', fontSize: 14 }}>編號</Box>
      <Box sx={{ color: 'text.secondary', fontSize: 14 }}>標題</Box>
      <Box sx={{ color: 'text.secondary', fontSize: 14 }}>建立者</Box>

      <Box sx={{ fontSize: 14, color: 'primary.main' }}>REC-001</Box>
      <Box sx={{ fontSize: 14 }}>範例紀錄一</Box>
      <UserLink name="Walker Chiu" variant="body2" avatarSize={20} />

      <Box sx={{ fontSize: 14, color: 'primary.main' }}>REC-002</Box>
      <Box sx={{ fontSize: 14 }}>範例紀錄二</Box>
      <UserLink name="Jane Doe" variant="body2" avatarSize={20} />
    </Box>
  ),
  parameters: { layout: 'padded' },
};
