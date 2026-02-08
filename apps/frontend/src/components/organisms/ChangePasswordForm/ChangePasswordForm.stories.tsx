import type { Meta, StoryObj } from '@storybook/nextjs';
import { fn } from 'storybook/test';
import ChangePasswordForm from './ChangePasswordForm';
import { Paper } from '@mui/material';
import { graphql, HttpResponse, delay } from 'msw';

const meta = {
  title: 'Organisms/ChangePasswordForm',
  component: ChangePasswordForm,
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component:
          'Form component for changing user password with validation and session revocation option.',
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
 * Default state - Standard password change form.
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
 * Success state - Password changed successfully.
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
 * Error: Incorrect current password.
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
 * Error: New password too weak.
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
 * Loading state - Submitting password change.
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
 * Error: Network error.
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
