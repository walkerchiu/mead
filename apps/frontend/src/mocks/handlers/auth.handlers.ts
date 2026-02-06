import { graphql, HttpResponse } from 'msw';
import {
  mockUsers,
  mockTokens,
  mock2FACodes,
  mockPasswordResetToken,
  MOCK_PASSWORD,
} from '../fixtures/users';

/**
 * GraphQL handlers for authentication-related mutations and queries
 */

export const authHandlers = [
  // LOGIN - Success without 2FA
  graphql.mutation('Login', ({ variables }) => {
    const { email, password } = variables as {
      email: string;
      password: string;
    };

    // Check credentials
    if (password !== MOCK_PASSWORD) {
      return HttpResponse.json({
        errors: [
          {
            message: 'Invalid credentials',
            extensions: { code: 'UNAUTHENTICATED' },
          },
        ],
      });
    }

    // Check if user has 2FA enabled
    const user2FA =
      email === mockUsers.customerWith2FA.email ||
      email === mockUsers.adminWith2FA.email;

    if (user2FA) {
      // Return temporary token for 2FA
      return HttpResponse.json({
        data: {
          login: {
            __typename: 'TwoFactorLoginResponse',
            temporaryToken: 'temp-token-' + Date.now(),
            message: 'Please enter your 2FA code',
          },
        },
      });
    }

    // Return regular auth response
    const user =
      email === mockUsers.admin.email ? mockUsers.admin : mockUsers.customer;

    return HttpResponse.json({
      data: {
        login: {
          __typename: 'AuthResponse',
          accessToken: mockTokens.accessToken,
          user,
        },
      },
    });
  }),

  // VERIFY_TWO_FACTOR_LOGIN - Success
  graphql.mutation('VerifyTwoFactorLogin', ({ variables }) => {
    const { code } = variables as {
      temporaryToken: string;
      code: string;
    };

    if (code !== mock2FACodes.validCode && code !== mock2FACodes.backupCode) {
      return HttpResponse.json({
        errors: [
          {
            message: 'Invalid verification code',
            extensions: { code: 'UNAUTHORIZED' },
          },
        ],
      });
    }

    const user = mockUsers.customerWith2FA;

    return HttpResponse.json({
      data: {
        verifyTwoFactorLogin: {
          accessToken: mockTokens.accessToken,
          user,
        },
      },
    });
  }),

  // REQUEST_PASSWORD_RESET - Success
  graphql.mutation('RequestPasswordReset', ({ variables: _variables }) => {
    return HttpResponse.json({
      data: {
        requestPasswordReset: {
          success: true,
          message: 'Password reset email sent successfully',
        },
      },
    });
  }),

  // VERIFY_PASSWORD_RESET_TOKEN - Check token validity
  graphql.query('VerifyPasswordResetToken', ({ variables }) => {
    const { token } = variables as { token: string };

    const isValid = token === mockPasswordResetToken || token === 'valid-token';

    return HttpResponse.json({
      data: {
        verifyPasswordResetToken: {
          valid: isValid,
        },
      },
    });
  }),

  // VALIDATE_RESET_TOKEN - Success (legacy, kept for compatibility)
  graphql.query('ValidateResetToken', ({ variables }) => {
    const { token } = variables as { token: string };

    const isValid = token === mockPasswordResetToken || token === 'valid-token';

    if (!isValid) {
      return HttpResponse.json({
        errors: [
          {
            message: 'Invalid or expired reset token',
            extensions: { code: 'BAD_USER_INPUT' },
          },
        ],
      });
    }

    return HttpResponse.json({
      data: {
        validateResetToken: {
          valid: true,
        },
      },
    });
  }),

  // RESET_PASSWORD - Success
  graphql.mutation('ResetPassword', ({ variables }) => {
    const { token } = variables as {
      token: string;
      newPassword: string;
    };

    if (token !== mockPasswordResetToken && token !== 'valid-token') {
      return HttpResponse.json({
        errors: [
          {
            message: 'Invalid or expired reset token',
            extensions: { code: 'BAD_USER_INPUT' },
          },
        ],
      });
    }

    return HttpResponse.json({
      data: {
        resetPassword: {
          success: true,
          message: 'Password reset successfully',
        },
      },
    });
  }),

  // ENABLE_TWO_FACTOR - Request code
  graphql.mutation('EnableTwoFactor', () => {
    return HttpResponse.json({
      data: {
        enableTwoFactor: {
          success: true,
          message: 'Verification code sent to your email',
        },
      },
    });
  }),

  // CONFIRM_ENABLE_TWO_FACTOR - Confirm enable
  graphql.mutation('ConfirmEnableTwoFactor', ({ variables }) => {
    const { code } = variables as { code: string };

    if (code !== mock2FACodes.validCode) {
      return HttpResponse.json({
        errors: [
          {
            message: 'Invalid verification code',
            extensions: { code: 'UNAUTHORIZED' },
          },
        ],
      });
    }

    return HttpResponse.json({
      data: {
        confirmEnableTwoFactor: {
          success: true,
          backupCodes: mock2FACodes.backupCodes,
        },
      },
    });
  }),

  // DISABLE_TWO_FACTOR - Request code
  graphql.mutation('DisableTwoFactor', () => {
    return HttpResponse.json({
      data: {
        disableTwoFactor: {
          success: true,
          message: 'Verification code sent to your email',
        },
      },
    });
  }),

  // CONFIRM_DISABLE_TWO_FACTOR - Confirm disable
  graphql.mutation('ConfirmDisableTwoFactor', ({ variables }) => {
    const { code } = variables as { code: string };

    if (code !== mock2FACodes.validCode) {
      return HttpResponse.json({
        errors: [
          {
            message: 'Invalid verification code',
            extensions: { code: 'UNAUTHORIZED' },
          },
        ],
      });
    }

    return HttpResponse.json({
      data: {
        confirmDisableTwoFactor: {
          success: true,
          message: 'Two-factor authentication disabled successfully',
        },
      },
    });
  }),

  // GET_TWO_FACTOR_STATUS - Query
  graphql.query('GetTwoFactorStatus', () => {
    return HttpResponse.json({
      data: {
        me: {
          id: mockUsers.customer.id,
          email: mockUsers.customer.email,
          twoFactorEnabled: false,
        },
      },
    });
  }),
];
