import type { Meta, StoryObj } from '@storybook/nextjs';
import { Card } from './Card';
import { Box, Avatar, IconButton, Typography, Chip } from '@mui/material';

/**
 * Card 是通用卡片容器，用於展示結構化內容（title、subheader、image、content、actions）。
 *
 * **使用時機**：
 * - 文章列表、產品卡、通知卡
 * - 需要圖片 + 標題 + 內文 + 多個 action 按鈕的情境
 *
 * **相關元件**：
 * - 若要展示**單一關鍵數值**（KPI、統計指標），請改用 [`<KPICard>`](/docs/molecules-kpicard--docs) — 它有專為數字設計的排版（icon 方框 + 大字號 + hint 提示），視覺重心不同。
 */
const meta = {
  title: 'Molecules/Card',
  component: Card,
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component:
          '通用卡片容器。若要展示單一關鍵數值（KPI），請改用 KPICard。',
      },
    },
  },
  tags: ['autodocs'],
} satisfies Meta<typeof Card>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    title: 'Card Title',
    content:
      'This is the content area of the card. You can place any text or components here.',
  },
};

export const Outlined: Story = {
  args: {
    title: 'Outlined Card',
    content: 'This card uses the outlined variant with no shadow effect.',
    variant: 'outlined',
  },
};

export const Clickable: Story = {
  args: {
    image: 'https://picsum.photos/400/200',
    title: 'Clickable Card',
    content:
      'Hover over the card for elevation effect, click the entire card to trigger an action.',
    clickable: true,
    onClick: () => alert('Card clicked!'),
  },
};

export const WithImage: Story = {
  args: {
    image: 'https://picsum.photos/400/200',
    title: 'Beautiful Scenery',
    content: 'This image showcases stunning natural landscapes.',
  },
};

export const WithAvatar: Story = {
  args: {
    avatar: <Avatar sx={{ bgcolor: '#1976d2' }}>U</Avatar>,
    title: 'User Name',
    subheader: 'February 6, 2026',
    content: 'This is content posted by a user...',
  },
};

export const WithActions: Story = {
  args: {
    title: 'Article Title',
    content:
      'This is the article summary. Click the buttons below to read more or share with friends.',
    actions: [
      { label: 'Read More', variant: 'contained' },
      { label: 'Share', variant: 'outlined' },
    ],
  },
};

export const Complete: Story = {
  args: {
    image: 'https://picsum.photos/400/200',
    avatar: <Avatar sx={{ bgcolor: '#dc004e' }}>A</Avatar>,
    title: 'Complete Card Example',
    subheader: 'Published on 2026-02-06',
    content:
      'This is a complete card example containing all elements, including avatar, title, subtitle, image, content, and action buttons.',
    actions: [
      { label: 'Like', color: 'primary' },
      { label: 'Comment', color: 'secondary' },
      { label: 'Share' },
    ],
    headerAction: <IconButton aria-label="settings">⚙️</IconButton>,
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
                Product Name
              </Typography>
              <Chip label="New" color="error" size="small" />
            </Box>
            <Typography variant="body2" color="text.secondary" paragraph>
              This is a brief product description introducing its main features
              and benefits.
            </Typography>
            <Typography variant="h5" color="primary" fontWeight="bold">
              $99.99
            </Typography>
          </Box>
        }
        actions={[
          { label: 'Add to Cart', variant: 'contained', color: 'primary' },
          { label: 'Details', variant: 'outlined' },
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
        avatar={<Avatar sx={{ bgcolor: '#9c27b0' }}>A</Avatar>}
        title="Blog Post Title"
        subheader="February 6, 2026 • 5 min read"
        content={
          <Box>
            <Typography variant="body2" color="text.secondary" paragraph>
              This is the article summary, briefly introducing the main topic
              and key points to engage readers...
            </Typography>
            <Box sx={{ display: 'flex', gap: 1 }}>
              <Chip label="Tech" size="small" />
              <Chip label="Tutorial" size="small" />
              <Chip label="React" size="small" />
            </Box>
          </Box>
        }
        actions={[
          { label: 'Read Full Article', variant: 'contained' },
          { label: 'Bookmark', variant: 'text' },
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
          <Avatar sx={{ width: 80, height: 80, bgcolor: '#f57c00' }}>JD</Avatar>
        }
        title={
          <Box>
            <Typography variant="h6">John Doe</Typography>
            <Typography variant="body2" color="text.secondary">
              @johndoe
            </Typography>
          </Box>
        }
        content={
          <Box>
            <Typography variant="body2" color="text.secondary" paragraph>
              Full Stack Engineer | React Enthusiast | Open Source Contributor
            </Typography>
            <Box sx={{ display: 'flex', gap: 3, mt: 2 }}>
              <Box sx={{ textAlign: 'center' }}>
                <Typography variant="h6">156</Typography>
                <Typography variant="caption" color="text.secondary">
                  Following
                </Typography>
              </Box>
              <Box sx={{ textAlign: 'center' }}>
                <Typography variant="h6">1.2K</Typography>
                <Typography variant="caption" color="text.secondary">
                  Followers
                </Typography>
              </Box>
              <Box sx={{ textAlign: 'center' }}>
                <Typography variant="h6">89</Typography>
                <Typography variant="caption" color="text.secondary">
                  Posts
                </Typography>
              </Box>
            </Box>
          </Box>
        }
        actions={[
          { label: 'Follow', variant: 'contained', color: 'primary' },
          { label: 'Message', variant: 'outlined' },
        ]}
      />
    </Box>
  ),
};

export const NotificationCard: Story = {
  render: () => (
    <Box sx={{ width: 400 }}>
      <Card
        avatar={<Avatar sx={{ bgcolor: '#2196f3' }}>ℹ️</Avatar>}
        title="System Notification"
        subheader="5 minutes ago"
        content="Your account security settings have been updated. If this was not you, please contact support immediately."
        actions={[
          { label: 'View Details', variant: 'text', color: 'primary' },
          { label: 'Dismiss', variant: 'text' },
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
              Video Title
            </Typography>
            <Typography variant="body2" color="text.secondary">
              This is an exciting video content description introducing the
              video's theme and highlights...
            </Typography>
          </Box>
        }
        actions={[
          { label: 'Play', variant: 'contained', color: 'primary' },
          { label: 'Add to Playlist', variant: 'outlined' },
          { label: 'Share', variant: 'text' },
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
          title={`Card ${i}`}
          content="This is the card content description..."
          actions={[{ label: 'View', variant: 'text' }]}
        />
      ))}
    </Box>
  ),
};
