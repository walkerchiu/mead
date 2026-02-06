import type { Meta, StoryObj } from '@storybook/react';
import { Card } from './Card';
import { Box, Avatar, IconButton, Typography, Chip } from '@mui/material';

const meta = {
  title: 'Molecules/Card',
  component: Card,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
} satisfies Meta<typeof Card>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    title: '卡片標題',
    content: '這是卡片的內容區域。可以放置任何文字或組件。',
  },
};

export const WithImage: Story = {
  args: {
    image: 'https://picsum.photos/400/200',
    title: '美麗的風景',
    content: '這張圖片展示了令人驚嘆的自然風光。',
  },
};

export const WithAvatar: Story = {
  args: {
    avatar: <Avatar sx={{ bgcolor: '#1976d2' }}>U</Avatar>,
    title: '使用者名稱',
    subheader: '2026年2月6日',
    content: '這是一則使用者發布的內容...',
  },
};

export const WithActions: Story = {
  args: {
    title: '文章標題',
    content: '這是文章的摘要內容，點擊下方按鈕可以閱讀更多或分享給朋友。',
    actions: [
      { label: '閱讀更多', variant: 'contained' },
      { label: '分享', variant: 'outlined' },
    ],
  },
};

export const Complete: Story = {
  args: {
    image: 'https://picsum.photos/400/200',
    avatar: <Avatar sx={{ bgcolor: '#dc004e' }}>A</Avatar>,
    title: '完整卡片範例',
    subheader: '發布於 2026-02-06',
    content:
      '這是一個包含所有元素的完整卡片範例，包括頭像、標題、副標題、圖片、內容和操作按鈕。',
    actions: [
      { label: '喜歡', color: 'primary' },
      { label: '評論', color: 'secondary' },
      { label: '分享' },
    ],
    headerAction: <IconButton aria-label="settings">⚙️</IconButton>,
  },
};

export const Outlined: Story = {
  args: {
    title: '外框卡片',
    content: '這個卡片使用 outlined 變體，沒有陰影效果。',
    variant: 'outlined',
  },
};

export const Clickable: Story = {
  args: {
    image: 'https://picsum.photos/400/200',
    title: '可點擊的卡片',
    content: '滑鼠移到卡片上會有提升效果，點擊整張卡片會觸發動作。',
    clickable: true,
    onClick: () => alert('卡片被點擊了！'),
  },
};

export const ProductCard: Story = {
  render: () => (
    <Box sx={{ width: 320 }}>
      <Card
        image="https://picsum.photos/400/300"
        imageHeight={200}
        content={
          <Box>
            <Box
              sx={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                mb: 1,
              }}
            >
              <Typography variant="h6" component="div">
                產品名稱
              </Typography>
              <Chip label="新品" color="error" size="small" />
            </Box>
            <Typography variant="body2" color="text.secondary" paragraph>
              這是產品的簡短描述，介紹產品的主要特點和優勢。
            </Typography>
            <Typography variant="h5" color="primary" fontWeight="bold">
              $99.99
            </Typography>
          </Box>
        }
        actions={[
          { label: '加入購物車', variant: 'contained', color: 'primary' },
          { label: '詳細資訊', variant: 'outlined' },
        ]}
      />
    </Box>
  ),
};

export const BlogCard: Story = {
  render: () => (
    <Box sx={{ width: 400 }}>
      <Card
        image="https://picsum.photos/400/250"
        avatar={<Avatar sx={{ bgcolor: '#9c27b0' }}>作</Avatar>}
        title="部落格文章標題"
        subheader="2026年2月6日 • 5分鐘閱讀"
        content={
          <Box>
            <Typography variant="body2" color="text.secondary" paragraph>
              這是文章的摘要內容，簡要介紹文章的主題和要點，吸引讀者繼續閱讀...
            </Typography>
            <Box sx={{ display: 'flex', gap: 1 }}>
              <Chip label="技術" size="small" />
              <Chip label="教學" size="small" />
              <Chip label="React" size="small" />
            </Box>
          </Box>
        }
        actions={[
          { label: '閱讀全文', variant: 'contained' },
          { label: '收藏', variant: 'text' },
        ]}
        headerAction={<IconButton aria-label="share">📤</IconButton>}
      />
    </Box>
  ),
};

export const UserProfileCard: Story = {
  render: () => (
    <Box sx={{ width: 300 }}>
      <Card
        avatar={
          <Avatar sx={{ width: 80, height: 80, bgcolor: '#f57c00' }}>王</Avatar>
        }
        title={
          <Box>
            <Typography variant="h6">王小明</Typography>
            <Typography variant="body2" color="text.secondary">
              @xiaoming
            </Typography>
          </Box>
        }
        content={
          <Box>
            <Typography variant="body2" color="text.secondary" paragraph>
              全端工程師 | React 愛好者 | 開源貢獻者
            </Typography>
            <Box sx={{ display: 'flex', gap: 3, mt: 2 }}>
              <Box sx={{ textAlign: 'center' }}>
                <Typography variant="h6">156</Typography>
                <Typography variant="caption" color="text.secondary">
                  追蹤中
                </Typography>
              </Box>
              <Box sx={{ textAlign: 'center' }}>
                <Typography variant="h6">1.2K</Typography>
                <Typography variant="caption" color="text.secondary">
                  追蹤者
                </Typography>
              </Box>
              <Box sx={{ textAlign: 'center' }}>
                <Typography variant="h6">89</Typography>
                <Typography variant="caption" color="text.secondary">
                  文章
                </Typography>
              </Box>
            </Box>
          </Box>
        }
        actions={[
          { label: '追蹤', variant: 'contained', color: 'primary' },
          { label: '訊息', variant: 'outlined' },
        ]}
      />
    </Box>
  ),
};

export const Grid: Story = {
  render: () => (
    <Box
      sx={{
        display: 'grid',
        gridTemplateColumns: 'repeat(3, 1fr)',
        gap: 2,
        maxWidth: 1000,
      }}
    >
      {[1, 2, 3, 4, 5, 6].map((i) => (
        <Card
          key={i}
          image={`https://picsum.photos/400/300?random=${i}`}
          title={`卡片 ${i}`}
          content="這是卡片的內容描述..."
          actions={[{ label: '查看', variant: 'text' }]}
        />
      ))}
    </Box>
  ),
};

export const NotificationCard: Story = {
  render: () => (
    <Box sx={{ width: 400 }}>
      <Card
        avatar={<Avatar sx={{ bgcolor: '#2196f3' }}>ℹ️</Avatar>}
        title="系統通知"
        subheader="5分鐘前"
        content="您的帳戶安全設定已更新。如果這不是您的操作，請立即聯絡客服。"
        actions={[
          { label: '查看詳情', variant: 'text', color: 'primary' },
          { label: '關閉', variant: 'text' },
        ]}
      />
    </Box>
  ),
};

export const MediaCard: Story = {
  render: () => (
    <Box sx={{ width: 350 }}>
      <Card
        image="https://picsum.photos/400/225"
        imageHeight={200}
        content={
          <Box>
            <Typography gutterBottom variant="h5" component="div">
              影片標題
            </Typography>
            <Typography variant="body2" color="text.secondary">
              這是一段精彩的影片內容描述，介紹影片的主題和亮點...
            </Typography>
          </Box>
        }
        actions={[
          { label: '播放', variant: 'contained', color: 'primary' },
          { label: '加入清單', variant: 'outlined' },
          { label: '分享', variant: 'text' },
        ]}
      />
    </Box>
  ),
};
