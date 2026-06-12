import type { Meta, StoryObj } from '@storybook/nextjs';
import TwoFactorSettings from './TwoFactorSettings';
import { Paper } from '@mui/material';
import { graphql, HttpResponse, delay } from 'msw';

const meta = {
  title: 'Shared/Organisms/TwoFactorSettings',
  component: TwoFactorSettings,
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component: '完整的 2FA 管理元件，具備啟用／停用功能與備用碼。',
      },
    },
  },
  tags: ['autodocs'],
  decorators: [
    (Story) => (
      <Paper elevation={3} sx={{ p: 4, maxWidth: 600 }}>
        <Story />
      </Paper>
    ),
  ],
} satisfies Meta<typeof TwoFactorSettings>;

export default meta;
type Story = StoryObj<typeof meta>;

/**
 * 預設狀態 - 2FA 已停用。
 */
export const Disabled: Story = {
  parameters: {
    msw: {
      handlers: [
        graphql.query('My2FASettings', async () => {
          await delay(300);
          return HttpResponse.json({
            data: {
              my2FASettings: {
                enabled: false,
                hasBackupCodes: false,
              },
            },
          });
        }),
      ],
    },
  },
};

/**
 * 2FA 啟用狀態。
 */
export const Enabled: Story = {
  parameters: {
    msw: {
      handlers: [
        graphql.query('My2FASettings', async () => {
          await delay(300);
          return HttpResponse.json({
            data: {
              my2FASettings: {
                enabled: true,
                hasBackupCodes: true,
              },
            },
          });
        }),
      ],
    },
  },
};

/**
 * 載入中狀態。
 */
export const Loading: Story = {
  parameters: {
    msw: {
      handlers: [
        graphql.query('My2FASettings', async () => {
          await delay(10000);
          return HttpResponse.json({
            data: {
              my2FASettings: {
                enabled: false,
                hasBackupCodes: false,
              },
            },
          });
        }),
      ],
    },
  },
};

/**
 * 啟用請求 - 顯示 QR code 與密鑰。
 */
export const EnableRequest: Story = {
  parameters: {
    msw: {
      handlers: [
        graphql.query('My2FASettings', async () => {
          await delay(300);
          return HttpResponse.json({
            data: {
              my2FASettings: {
                enabled: false,
                hasBackupCodes: false,
              },
            },
          });
        }),
        graphql.mutation('RequestEnable2FA', async () => {
          await delay(500);
          return HttpResponse.json({
            data: {
              requestEnable2FA: {
                qrCodeUrl:
                  'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==',
                secret: 'JBSWY3DPEHPK3PXP',
              },
            },
          });
        }),
      ],
    },
  },
  play: async () => {
    // Simulate clicking enable button
    // This would require user interaction in actual Storybook
  },
};

/**
 * 啟用確認 - 輸入驗證碼。
 */
export const EnableConfirm: Story = {
  parameters: {
    msw: {
      handlers: [
        graphql.query('My2FASettings', async () => {
          await delay(300);
          return HttpResponse.json({
            data: {
              my2FASettings: {
                enabled: false,
                hasBackupCodes: false,
              },
            },
          });
        }),
        graphql.mutation('ConfirmEnable2FA', async () => {
          await delay(800);
          return HttpResponse.json({
            data: {
              confirmEnable2FA: {
                success: true,
                backupCodes: [
                  'ABCD-1234',
                  'EFGH-5678',
                  'IJKL-9012',
                  'MNOP-3456',
                  'QRST-7890',
                ],
              },
            },
          });
        }),
      ],
    },
  },
};

/**
 * 停用請求 - 確認停用 2FA。
 */
export const DisableRequest: Story = {
  parameters: {
    msw: {
      handlers: [
        graphql.query('My2FASettings', async () => {
          await delay(300);
          return HttpResponse.json({
            data: {
              my2FASettings: {
                enabled: true,
                hasBackupCodes: true,
              },
            },
          });
        }),
        graphql.mutation('RequestDisable2FA', async () => {
          await delay(500);
          return HttpResponse.json({
            data: {
              requestDisable2FA: {
                success: true,
              },
            },
          });
        }),
      ],
    },
  },
};

/**
 * 錯誤：驗證碼無效。
 */
export const InvalidCode: Story = {
  parameters: {
    msw: {
      handlers: [
        graphql.query('My2FASettings', async () => {
          await delay(300);
          return HttpResponse.json({
            data: {
              my2FASettings: {
                enabled: false,
                hasBackupCodes: false,
              },
            },
          });
        }),
        graphql.mutation('ConfirmEnable2FA', async () => {
          await delay(800);
          return HttpResponse.json({
            errors: [
              {
                message: 'Invalid verification code',
                extensions: {
                  code: 'INVALID_2FA_CODE',
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
 * 備用碼顯示。
 */
export const BackupCodes: Story = {
  parameters: {
    msw: {
      handlers: [
        graphql.query('My2FASettings', async () => {
          await delay(300);
          return HttpResponse.json({
            data: {
              my2FASettings: {
                enabled: true,
                hasBackupCodes: true,
                backupCodes: [
                  'ABCD-1234',
                  'EFGH-5678',
                  'IJKL-9012',
                  'MNOP-3456',
                  'QRST-7890',
                  'UVWX-1357',
                  'YZAB-2468',
                  'CDEF-9753',
                ],
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
  parameters: {
    msw: {
      handlers: [
        graphql.query('My2FASettings', async () => {
          await delay(800);
          return HttpResponse.error();
        }),
      ],
    },
  },
};
