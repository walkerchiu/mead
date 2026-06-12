import type { Meta, StoryObj } from '@storybook/nextjs';
import { AuthLayout } from './AuthLayout';
import { LoginForm } from '@/components/organisms';
import { TwoFactorForm } from '@/components/organisms';
import { ForgotPasswordForm } from '@/components/organisms';
import { ResetPasswordForm } from '@/components/organisms';
import Typography from '@mui/material/Typography';
import Box from '@mui/material/Box';

const meta = {
  title: 'Shared/Templates/AuthLayout',
  component: AuthLayout,
  parameters: {
    layout: 'fullscreen',
    docs: {
      description: {
        component:
          '認證頁面的統一版面範本，提供置中卡片、響應式設計與品牌識別。',
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
    title: 'Welcome Back',
    subtitle: 'Sign in to continue',
    children: <Typography variant="body1">Form components go here</Typography>,
  },
};

/**
 * 不含 Logo
 */
export const NoLogo: Story = {
  args: {
    showLogo: false,
    children: <Typography variant="body1">Layout without logo</Typography>,
  },
};

/**
 * 不含頁尾
 */
export const NoFooter: Story = {
  args: {
    title: 'Sign In',
    showFooter: false,
    children: <Typography variant="body1">Layout without footer</Typography>,
  },
};

/**
 * 純色背景
 */
export const SolidBackground: Story = {
  args: {
    title: 'Sign In',
    background: 'solid',
    children: <Typography variant="body1">Solid background style</Typography>,
  },
};

/**
 * 完整的登入頁面
 * 示範實際的登入表單
 */
export const LoginPage: Story = {
  args: {
    title: 'Welcome Back',
    subtitle: 'Sign in to continue',
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
 * 雙因素驗證頁面
 */
export const TwoFactorPage: Story = {
  args: {
    title: 'Two-Factor Authentication',
    subtitle: 'Please enter your verification code',
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
    title: 'Reset Password',
    subtitle: 'We will send a reset link to your email',
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
    title: 'Set New Password',
    subtitle: 'Please enter your new password',
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
 * 示範彈性
 */
export const CustomContent: Story = {
  args: {
    title: 'Custom Content',
    children: (
      <Box sx={{ textAlign: 'center', p: 3 }}>
        <Typography variant="h6" gutterBottom>
          This is custom content
        </Typography>
        <Typography variant="body2" color="text.secondary">
          AuthLayout can contain any content
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
    title: 'Sign In',
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
    title: 'Sign In',
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
 * 以不同的視窗尺寸測試
 */
export const ResponsiveTest: Story = {
  args: {
    title: 'Responsive Layout',
    subtitle: 'Resize the browser window to see the effect',
    children: <LoginForm onSubmit={async (data) => console.log(data)} />,
  },
  parameters: {
    viewport: {
      defaultViewport: 'mobile1',
    },
  },
};
