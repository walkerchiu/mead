import type { Meta, StoryObj } from '@storybook/nextjs';
import { fn } from 'storybook/test';
import ChangePasswordForm from './ChangePasswordForm';
import { Paper } from '@mui/material';
import { graphql, HttpResponse, delay } from 'msw';

const meta = {
  title: 'Shared/Organisms/ChangePasswordForm',
  component: ChangePasswordForm,
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component:
          '用於變更使用者密碼的表單元件，具備驗證與撤銷 session 的選項。',
      },
    },
  },
  tags: ['autodocs'],
  decorators: [
    (Story) => (
      <Paper elevation={3} sx={{ p: 4, maxWidth: 500 }}>
        <Story />
      </Paper>
    ),
  ],
} satisfies Meta<typeof ChangePasswordForm>;

export default meta;
type Story = StoryObj<typeof meta>;

/**
 * 預設狀態 - 標準的變更密碼表單。
 */
export const Default: Story = {
  args: {
    onSuccess: fn('onSuccess'),
  },
  parameters: {
    msw: {
      handlers: [
        graphql.mutation('ChangePassword', async () => {
          await delay(800);
          return HttpResponse.json({
            data: {
              changePassword: {
                success: true,
                message: 'Password changed successfully',
              },
            },
          });
        }),
      ],
    },
  },
};

/**
 * 成功狀態 - 密碼變更成功。
 */
export const Success: Story = {
  args: {
    onSuccess: fn('onSuccess'),
  },
  parameters: {
    msw: {
      handlers: [
        graphql.mutation('ChangePassword', async () => {
          await delay(300);
          return HttpResponse.json({
            data: {
              changePassword: {
                success: true,
                message: 'Password changed successfully',
              },
            },
          });
        }),
      ],
    },
  },
  play: async () => {
    // Auto-trigger success scenario
    fn('Password changed successfully')();
  },
};

/**
 * 錯誤：目前密碼不正確。
 */
export const IncorrectPassword: Story = {
  args: {
    onSuccess: fn('onSuccess'),
  },
  parameters: {
    msw: {
      handlers: [
        graphql.mutation('ChangePassword', async () => {
          await delay(800);
          return HttpResponse.json({
            errors: [
              {
                message: 'Current password is incorrect',
                extensions: {
                  code: 'INVALID_PASSWORD',
                },
              },
            ],
          });
        }),
      ],
    },
  },
};

/**
 * 錯誤：新密碼強度過弱。
 */
export const WeakPassword: Story = {
  args: {
    onSuccess: fn('onSuccess'),
  },
  parameters: {
    msw: {
      handlers: [
        graphql.mutation('ChangePassword', async () => {
          await delay(800);
          return HttpResponse.json({
            errors: [
              {
                message:
                  'Password must contain at least 8 characters, including uppercase, lowercase, number, and special character',
                extensions: {
                  code: 'WEAK_PASSWORD',
                },
              },
            ],
          });
        }),
      ],
    },
  },
};

/**
 * 載入中狀態 - 正在送出密碼變更。
 */
export const Loading: Story = {
  args: {
    onSuccess: fn('onSuccess'),
  },
  parameters: {
    msw: {
      handlers: [
        graphql.mutation('ChangePassword', async () => {
          await delay(10000);
          return HttpResponse.json({
            data: {
              changePassword: {
                success: true,
                message: 'Password changed successfully',
              },
            },
          });
        }),
      ],
    },
  },
};

/**
 * 錯誤：網路錯誤。
 */
export const NetworkError: Story = {
  args: {
    onSuccess: fn('onSuccess'),
  },
  parameters: {
    msw: {
      handlers: [
        graphql.mutation('ChangePassword', async () => {
          await delay(800);
          return HttpResponse.error();
        }),
      ],
    },
  },
};
