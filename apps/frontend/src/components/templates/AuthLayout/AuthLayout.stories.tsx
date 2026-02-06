import type { Meta, StoryObj } from '@storybook/react';
import { AuthLayout } from './AuthLayout';
import { LoginForm } from '@/components/organisms';
import { TwoFactorForm } from '@/components/organisms';
import { ForgotPasswordForm } from '@/components/organisms';
import { ResetPasswordForm } from '@/components/organisms';
import Typography from '@mui/material/Typography';
import Box from '@mui/material/Box';

const meta = {
  title: 'Templates/AuthLayout',
  component: AuthLayout,
  parameters: {
    layout: 'fullscreen',
    docs: {
      description: {
        component:
          '認證頁面的統一佈局模板，提供居中卡片、響應式設計和品牌識別。',
      },
    },
  },
  tags: ['autodocs'],
  argTypes: {
    background: {
      control: 'select',
      options: ['gradient', 'solid', 'image'],
      description: '背景樣式',
    },
  },
} satisfies Meta<typeof AuthLayout>;

export default meta;
type Story = StoryObj<typeof meta>;

/**
 * 預設樣式
 * 漸層背景
 */
export const Default: Story = {
  args: {
    title: '歡迎回來',
    subtitle: '登入以繼續',
    children: <Typography variant="body1">這裡放置表單組件</Typography>,
  },
};

/**
 * 不顯示 Logo
 */
export const NoLogo: Story = {
  args: {
    showLogo: false,
    children: <Typography variant="body1">沒有 Logo 的佈局</Typography>,
  },
};

/**
 * 不顯示 Footer
 */
export const NoFooter: Story = {
  args: {
    title: '登入',
    showFooter: false,
    children: <Typography variant="body1">沒有 Footer 的佈局</Typography>,
  },
};

/**
 * 純色背景
 */
export const SolidBackground: Story = {
  args: {
    title: '登入',
    background: 'solid',
    children: <Typography variant="body1">純色背景樣式</Typography>,
  },
};

/**
 * 完整 Login 頁面
 * 展示實際的登入表單
 */
export const LoginPage: Story = {
  args: {
    title: '歡迎回來',
    subtitle: '登入以繼續使用',
    children: (
      <LoginForm
        onSubmit={async (data) => {
          console.log('Login:', data);
          await new Promise((resolve) => setTimeout(resolve, 1000));
        }}
      />
    ),
  },
};

/**
 * 2FA 頁面
 */
export const TwoFactorPage: Story = {
  args: {
    title: '雙因素認證',
    subtitle: '請輸入驗證碼',
    children: (
      <TwoFactorForm
        onSubmit={async (code) => {
          console.log('2FA:', code);
          await new Promise((resolve) => setTimeout(resolve, 1000));
        }}
      />
    ),
  },
};

/**
 * 忘記密碼頁面
 */
export const ForgotPasswordPage: Story = {
  args: {
    title: '重設密碼',
    subtitle: '我們會發送重設連結到您的郵箱',
    children: (
      <ForgotPasswordForm
        onSubmit={async (data) => {
          console.log('Forgot password:', data);
          await new Promise((resolve) => setTimeout(resolve, 1000));
        }}
      />
    ),
  },
};

/**
 * 重設密碼頁面
 */
export const ResetPasswordPage: Story = {
  args: {
    title: '設定新密碼',
    subtitle: '請輸入您的新密碼',
    children: (
      <ResetPasswordForm
        onSubmit={async (data) => {
          console.log('Reset password:', data);
          await new Promise((resolve) => setTimeout(resolve, 1000));
        }}
      />
    ),
  },
};

/**
 * 自訂內容
 * 展示靈活性
 */
export const CustomContent: Story = {
  args: {
    title: '自訂內容',
    children: (
      <Box sx={{ textAlign: 'center', p: 3 }}>
        <Typography variant="h6" gutterBottom>
          這是自訂內容
        </Typography>
        <Typography variant="body2" color="text.secondary">
          AuthLayout 可以包含任何內容
        </Typography>
      </Box>
    ),
  },
};

/**
 * 小寬度
 */
export const SmallWidth: Story = {
  args: {
    title: '登入',
    maxWidth: 360,
    children: (
      <LoginForm
        onSubmit={async (data) => console.log(data)}
        showForgotPassword={false}
      />
    ),
  },
};

/**
 * 大寬度
 */
export const LargeWidth: Story = {
  args: {
    title: '登入',
    maxWidth: 600,
    children: (
      <Box sx={{ width: '100%' }}>
        <LoginForm onSubmit={async (data) => console.log(data)} />
      </Box>
    ),
  },
};

/**
 * 響應式測試
 * 在不同視窗大小測試
 */
export const ResponsiveTest: Story = {
  args: {
    title: '響應式佈局',
    subtitle: '調整瀏覽器視窗大小查看效果',
    children: <LoginForm onSubmit={async (data) => console.log(data)} />,
  },
  parameters: {
    viewport: {
      defaultViewport: 'mobile1',
    },
  },
};
