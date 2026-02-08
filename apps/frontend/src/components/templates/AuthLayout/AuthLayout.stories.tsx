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
          'Unified layout template for authentication pages, providing centered card, responsive design, and brand identity.',
      },
    },
  },
  tags: ['autodocs'],
  argTypes: {
    background: {
      control: 'select',
      options: ['gradient', 'solid', 'image'],
      description: 'Background style',
    },
  },
} satisfies Meta<typeof AuthLayout>;

export default meta;
type Story = StoryObj<typeof meta>;

/**
 * Default style
 * Gradient background
 */
export const Default: Story = {
  args: {
    title: 'Welcome Back',
    subtitle: 'Sign in to continue',
    children: <Typography variant="body1">Form components go here</Typography>,
  },
};

/**
 * Without Logo
 */
export const NoLogo: Story = {
  args: {
    showLogo: false,
    children: <Typography variant="body1">Layout without logo</Typography>,
  },
};

/**
 * Without Footer
 */
export const NoFooter: Story = {
  args: {
    title: 'Sign In',
    showFooter: false,
    children: <Typography variant="body1">Layout without footer</Typography>,
  },
};

/**
 * Solid background
 */
export const SolidBackground: Story = {
  args: {
    title: 'Sign In',
    background: 'solid',
    children: <Typography variant="body1">Solid background style</Typography>,
  },
};

/**
 * Complete Login page
 * Demonstrates actual login form
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
 * Two-Factor Authentication page
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
 * Forgot Password page
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
 * Reset Password page
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
 * Custom content
 * Demonstrates flexibility
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
 * Small width
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
 * Large width
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
 * Responsive test
 * Test with different window sizes
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
