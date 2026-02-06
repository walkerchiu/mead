import type { Meta, StoryObj } from '@storybook/react';
import { Tabs } from './Tabs';
import { useState } from 'react';
import { Box, Typography } from '@mui/material';

const meta = {
  title: 'Molecules/Tabs',
  component: Tabs,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
} satisfies Meta<typeof Tabs>;

export default meta;
type Story = StoryObj<typeof meta>;

const sampleTabs = [
  {
    label: '標籤一',
    content: (
      <Box>
        <Typography variant="h6">第一個標籤的內容</Typography>
        <Typography>這是第一個標籤面板的內容。</Typography>
      </Box>
    ),
  },
  {
    label: '標籤二',
    content: (
      <Box>
        <Typography variant="h6">第二個標籤的內容</Typography>
        <Typography>這是第二個標籤面板的內容。</Typography>
      </Box>
    ),
  },
  {
    label: '標籤三',
    content: (
      <Box>
        <Typography variant="h6">第三個標籤的內容</Typography>
        <Typography>這是第三個標籤面板的內容。</Typography>
      </Box>
    ),
  },
];

export const Default: Story = {
  args: {
    tabs: sampleTabs,
  },
};

export const FullWidth: Story = {
  args: {
    tabs: sampleTabs,
    variant: 'fullWidth',
  },
};

export const Centered: Story = {
  args: {
    tabs: sampleTabs,
    centered: true,
  },
};

export const Scrollable: Story = {
  args: {
    tabs: [
      { label: '標籤一', content: <Typography>內容一</Typography> },
      { label: '標籤二', content: <Typography>內容二</Typography> },
      { label: '標籤三', content: <Typography>內容三</Typography> },
      { label: '標籤四', content: <Typography>內容四</Typography> },
      { label: '標籤五', content: <Typography>內容五</Typography> },
      { label: '標籤六', content: <Typography>內容六</Typography> },
      { label: '標籤七', content: <Typography>內容七</Typography> },
      { label: '標籤八', content: <Typography>內容八</Typography> },
    ],
    variant: 'scrollable',
  },
};

export const WithDisabled: Story = {
  args: {
    tabs: [
      { label: '啟用', content: <Typography>這個標籤是啟用的</Typography> },
      {
        label: '禁用',
        content: <Typography>這個標籤是禁用的</Typography>,
        disabled: true,
      },
      { label: '啟用', content: <Typography>這個標籤也是啟用的</Typography> },
    ],
  },
};

export const SecondaryColor: Story = {
  args: {
    tabs: sampleTabs,
    indicatorColor: 'secondary',
    textColor: 'secondary',
  },
};

export const Controlled: Story = {
  render: () => {
    const [value, setValue] = useState(0);
    return (
      <Box>
        <Typography variant="body2" sx={{ mb: 2 }}>
          當前標籤索引: {value}
        </Typography>
        <Tabs tabs={sampleTabs} value={value} onChange={setValue} />
      </Box>
    );
  },
};

export const SettingsTabs: Story = {
  args: {
    tabs: [
      {
        label: '個人資料',
        content: (
          <Box>
            <Typography variant="h6" gutterBottom>
              個人資料設定
            </Typography>
            <Typography>管理您的個人資訊和偏好設定</Typography>
          </Box>
        ),
      },
      {
        label: '安全性',
        content: (
          <Box>
            <Typography variant="h6" gutterBottom>
              安全性設定
            </Typography>
            <Typography>管理您的密碼和雙因素驗證</Typography>
          </Box>
        ),
      },
      {
        label: '通知',
        content: (
          <Box>
            <Typography variant="h6" gutterBottom>
              通知設定
            </Typography>
            <Typography>自訂您的通知偏好</Typography>
          </Box>
        ),
      },
      {
        label: '隱私',
        content: (
          <Box>
            <Typography variant="h6" gutterBottom>
              隱私設定
            </Typography>
            <Typography>控制您的隱私和資料共享設定</Typography>
          </Box>
        ),
      },
    ],
  },
};

export const Vertical: Story = {
  render: () => (
    <Box sx={{ width: '600px', height: '400px' }}>
      <Tabs
        orientation="vertical"
        tabs={[
          {
            label: '概覽',
            content: (
              <Box>
                <Typography variant="h6">概覽</Typography>
                <Typography>查看系統概況和統計資料</Typography>
              </Box>
            ),
          },
          {
            label: '使用者管理',
            content: (
              <Box>
                <Typography variant="h6">使用者管理</Typography>
                <Typography>管理系統使用者和權限</Typography>
              </Box>
            ),
          },
          {
            label: '系統設定',
            content: (
              <Box>
                <Typography variant="h6">系統設定</Typography>
                <Typography>配置系統參數和選項</Typography>
              </Box>
            ),
          },
          {
            label: '日誌記錄',
            content: (
              <Box>
                <Typography variant="h6">日誌記錄</Typography>
                <Typography>查看系統活動日誌</Typography>
              </Box>
            ),
          },
        ]}
      />
    </Box>
  ),
};
