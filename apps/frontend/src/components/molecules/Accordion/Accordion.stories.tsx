import type { Meta, StoryObj } from '@storybook/react';
import { Accordion } from './Accordion';
import { useState } from 'react';
import { Typography, Box } from '@mui/material';

const meta = {
  title: 'Molecules/Accordion',
  component: Accordion,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
} satisfies Meta<typeof Accordion>;

export default meta;
type Story = StoryObj<typeof meta>;

const sampleItems = [
  {
    title: '什麼是 React？',
    content: 'React 是一個用於建構使用者介面的 JavaScript 函式庫。',
  },
  {
    title: '什麼是 TypeScript？',
    content: 'TypeScript 是 JavaScript 的超集合，添加了靜態型別檢查。',
  },
  {
    title: '什麼是 Next.js？',
    content: 'Next.js 是一個基於 React 的全端框架，支援 SSR 和 SSG。',
  },
];

export const Default: Story = {
  args: {
    items: sampleItems,
  },
};

export const DefaultExpanded: Story = {
  args: {
    items: sampleItems,
    defaultExpanded: 0,
  },
};

export const WithSubtitle: Story = {
  args: {
    items: [
      {
        title: '個人資料',
        subtitle: '管理您的基本資訊',
        content: (
          <Box>
            <Typography>在這裡您可以更新您的姓名、電子郵件等資訊。</Typography>
          </Box>
        ),
      },
      {
        title: '安全設定',
        subtitle: '密碼與雙因素驗證',
        content: (
          <Box>
            <Typography>修改密碼、啟用雙因素驗證以保護您的帳戶。</Typography>
          </Box>
        ),
      },
      {
        title: '通知偏好',
        subtitle: '自訂您的通知設定',
        content: (
          <Box>
            <Typography>選擇您想接收的通知類型和頻率。</Typography>
          </Box>
        ),
      },
    ],
  },
};

export const WithDisabled: Story = {
  args: {
    items: [
      { title: '可用項目一', content: '這個項目可以展開' },
      { title: '禁用項目', content: '這個項目被禁用了', disabled: true },
      { title: '可用項目二', content: '這個項目也可以展開' },
    ],
  },
};

export const Multiple: Story = {
  args: {
    items: sampleItems,
    multiple: true,
  },
};

export const NoGutters: Story = {
  args: {
    items: sampleItems,
    disableGutters: true,
  },
};

export const Square: Story = {
  args: {
    items: sampleItems,
    square: true,
  },
};

export const Controlled: Story = {
  render: () => {
    const [expanded, setExpanded] = useState<number | false>(0);
    return (
      <Box sx={{ width: '600px' }}>
        <Typography variant="body2" sx={{ mb: 2 }}>
          當前展開面板: {expanded !== false ? expanded : '無'}
        </Typography>
        <Accordion
          items={sampleItems}
          expanded={expanded}
          onChange={setExpanded}
        />
      </Box>
    );
  },
};

export const FAQ: Story = {
  args: {
    items: [
      {
        title: '如何註冊帳號？',
        content:
          '點擊右上角的「註冊」按鈕，填寫必要資訊即可完成註冊。您需要提供有效的電子郵件地址。',
      },
      {
        title: '忘記密碼怎麼辦？',
        content:
          '在登入頁面點擊「忘記密碼」連結，輸入您的電子郵件地址，系統會發送重設密碼的連結給您。',
      },
      {
        title: '如何變更個人資料？',
        content:
          '登入後進入「設定」頁面，點擊「個人資料」標籤，即可編輯您的資訊。記得儲存變更。',
      },
      {
        title: '支援哪些付款方式？',
        content: '我們支援信用卡、金融卡、PayPal 和銀行轉帳等多種付款方式。',
      },
      {
        title: '如何聯絡客服？',
        content:
          '您可以透過電子郵件 support@example.com 或使用網站內的即時聊天功能聯絡我們。',
      },
    ],
    defaultExpanded: 0,
  },
};

export const Documentation: Story = {
  args: {
    items: [
      {
        title: '快速開始',
        subtitle: '5 分鐘快速上手',
        content: (
          <Box>
            <Typography variant="subtitle2" gutterBottom>
              安裝
            </Typography>
            <Typography
              variant="body2"
              component="pre"
              sx={{ bgcolor: '#f5f5f5', p: 1 }}
            >
              npm install @mui/material
            </Typography>
            <Typography variant="subtitle2" gutterBottom sx={{ mt: 2 }}>
              基本使用
            </Typography>
            <Typography variant="body2">
              匯入所需的組件並在您的應用程式中使用。
            </Typography>
          </Box>
        ),
      },
      {
        title: 'API 參考',
        subtitle: '完整的 API 文件',
        content: (
          <Box>
            <Typography variant="body2">
              查看完整的 API 文件以了解所有可用的屬性和方法。
            </Typography>
          </Box>
        ),
      },
      {
        title: '範例',
        subtitle: '實際使用範例',
        content: (
          <Box>
            <Typography variant="body2">
              瀏覽各種實際使用範例，了解如何在不同場景中使用組件。
            </Typography>
          </Box>
        ),
      },
    ],
  },
};

export const RichContent: Story = {
  render: () => (
    <Box sx={{ width: '700px' }}>
      <Accordion
        items={[
          {
            title: (
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <Box
                  sx={{
                    width: 8,
                    height: 8,
                    borderRadius: '50%',
                    bgcolor: 'success.main',
                  }}
                />
                <Typography>已完成</Typography>
              </Box>
            ),
            content: (
              <Box>
                <Typography variant="body2" paragraph>
                  這個任務已經完成。
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  完成時間: 2026-02-06 10:30
                </Typography>
              </Box>
            ),
          },
          {
            title: (
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <Box
                  sx={{
                    width: 8,
                    height: 8,
                    borderRadius: '50%',
                    bgcolor: 'warning.main',
                  }}
                />
                <Typography>進行中</Typography>
              </Box>
            ),
            content: (
              <Box>
                <Typography variant="body2" paragraph>
                  這個任務正在進行中。
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  預計完成: 2026-02-07
                </Typography>
              </Box>
            ),
          },
        ]}
      />
    </Box>
  ),
};
