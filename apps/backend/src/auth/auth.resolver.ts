import {
  Resolver,
  Mutation,
  Args,
  Context,
  Query,
  createUnionType,
} from '@nestjs/graphql';
import {
  UseGuards,
  InternalServerErrorException,
  UnauthorizedException,
} from '@nestjs/common';
import { Throttle } from '@nestjs/throttler';
import { I18nService } from 'nestjs-i18n';
import { AuthService } from './auth.service';
import { PasswordResetService } from './password-reset.service';
import { I18nLang } from '../common/decorators/i18n-lang.decorator';
import {
  AuthResponse,
  TwoFactorLoginResponse,
  VerifyTwoFactorInput,
} from './auth.types';
import { setRefreshTokenCookie, clearRefreshTokenCookie } from './cookie.utils';
import {
  PasswordResetResponse,
  VerifyTokenResponse,
} from './password-reset.types';
import { JwtAuthGuard } from './jwt-auth.guard';
import { logger } from '../common/services/logger.service';
import { PermissionGuard } from '../common/guards/permission.guard';
import { RequiresAnyScope } from '../common/decorators/requires-scope.decorator';
import { AccessScope } from '../common/enums/access-scope.enum';
import { GraphQLContextWithExpress } from '../common/types/graphql-context.type';

// 創建 Union type 給 login mutation
const LoginResult = createUnionType({
  name: 'LoginResult',
  types: () => [AuthResponse, TwoFactorLoginResponse] as const,
  resolveType(value) {
    // 2FA 回應
    if ('requiresTwoFactor' in value) {
      return TwoFactorLoginResponse;
    }
    // 預設為 AuthResponse
    return AuthResponse;
  },
});

@Resolver()
export class AuthResolver {
  constructor(
    private authService: AuthService,
    private passwordResetService: PasswordResetService,
    private i18n: I18nService,
  ) {}

  /**
   * 註冊客戶用戶
   * 需要 CUSTOMER_SCOPE 或 ADMIN_SCOPE
   */
  @Mutation(() => AuthResponse, {
    description:
      '註冊新的客戶用戶（需要 CUSTOMER_SCOPE 或 ADMIN_SCOPE 權限，用於邀請制註冊）',
  })
  @UseGuards(JwtAuthGuard, PermissionGuard)
  @RequiresAnyScope([AccessScope.CUSTOMER_SCOPE, AccessScope.ADMIN_SCOPE])
  async registerCustomer(
    @Args('email', { description: '電子郵件地址（必須唯一）' })
    email: string,
    @Args('password', {
      description: '密碼（至少 8 字符，包含大小寫字母和數字）',
    })
    password: string,
    @Args('name', { nullable: true, description: '使用者顯示名稱（選填）' })
    name: string | undefined,
    @I18nLang() lang: string,
    @Context() context: GraphQLContextWithExpress,
  ): Promise<AuthResponse> {
    const { refreshToken, ...authResponse } =
      await this.authService.registerCustomer(
        email,
        password,
        name,
        context.req.headers['user-agent'],
        context.req.ip,
        lang,
      );

    // 驗證 accessToken 是否存在
    if (!authResponse.accessToken) {
      logger.error(
        '[AuthResolver] Register customer failed: accessToken is missing',
        {
          email,
          hasUser: !!authResponse.user,
        },
      );
      throw new InternalServerErrorException(
        this.i18n.translate('auth.loginFailed', { lang }),
      );
    }

    setRefreshTokenCookie(context.res, refreshToken);
    return authResponse;
  }

  /**
   * 註冊管理員用戶
   * 只有 ADMIN_SCOPE 可以調用
   */
  @Mutation(() => AuthResponse, {
    description:
      '註冊新的管理員用戶（僅限 ADMIN_SCOPE 權限，用於建立管理團隊）',
  })
  @UseGuards(JwtAuthGuard, PermissionGuard)
  @RequiresAnyScope([AccessScope.ADMIN_SCOPE])
  async registerAdmin(
    @Args('email', { description: '電子郵件地址（必須唯一）' })
    email: string,
    @Args('password', {
      description: '密碼（至少 8 字符，包含大小寫字母和數字）',
    })
    password: string,
    @Args('name', { nullable: true, description: '使用者顯示名稱（選填）' })
    name: string | undefined,
    @I18nLang() lang: string,
    @Context() context: GraphQLContextWithExpress,
  ): Promise<AuthResponse> {
    const { refreshToken, ...authResponse } =
      await this.authService.registerAdmin(
        email,
        password,
        name,
        context.req.headers['user-agent'],
        context.req.ip,
        lang,
      );

    // 驗證 accessToken 是否存在
    if (!authResponse.accessToken) {
      logger.error(
        '[AuthResolver] Register admin failed: accessToken is missing',
        {
          email,
          hasUser: !!authResponse.user,
        },
      );
      throw new InternalServerErrorException(
        this.i18n.translate('auth.loginFailed', { lang }),
      );
    }

    setRefreshTokenCookie(context.res, refreshToken);
    return authResponse;
  }

  /**
   * 使用者登入（可能需要 2FA）
   */
  @Mutation(() => LoginResult, {
    description:
      '使用者登入（使用 email 和密碼）。如果啟用 2FA，將返回臨時 Token 並發送驗證碼',
  })
  @Throttle({ default: { limit: 5, ttl: 60000 } })
  async login(
    @Args('email', { description: '註冊的電子郵件地址' })
    email: string,
    @Args('password', { description: '使用者密碼' })
    password: string,
    @Context() context: GraphQLContextWithExpress,
    @I18nLang() lang: string,
  ): Promise<typeof LoginResult> {
    const result = await this.authService.login(
      email,
      password,
      context.req.ip,
      context.req.headers['user-agent'],
      lang,
    );

    // 如果是 AuthTokenResult（包含 refreshToken）
    if ('refreshToken' in result) {
      const { refreshToken, ...authResponse } = result;

      // 驗證 accessToken 是否存在
      if (!authResponse.accessToken) {
        logger.error('[AuthResolver] Login failed: accessToken is missing', {
          email,
          hasUser: !!authResponse.user,
        });
        throw new InternalServerErrorException(
          this.i18n.translate('auth.loginFailed', { lang }),
        );
      }

      // 設置 refresh token cookie
      setRefreshTokenCookie(context.res, refreshToken);
      return authResponse;
    }

    // 否則是 TwoFactorLoginResponse
    return result;
  }

  /**
   * 驗證 2FA 並完成登入
   */
  @Mutation(() => AuthResponse, {
    description: '驗證雙因素認證碼並完成登入（獲取正式的 JWT tokens）',
  })
  @Throttle({ default: { limit: 5, ttl: 60000 } })
  async verifyTwoFactorLogin(
    @Args('input') input: VerifyTwoFactorInput,
    @I18nLang() lang: string,
    @Context() context: GraphQLContextWithExpress,
  ): Promise<AuthResponse> {
    const { refreshToken, ...authResponse } =
      await this.authService.verifyTwoFactor(
        input.temporaryToken,
        input.code,
        input.isBackupCode || false,
        context.req.headers['user-agent'],
        context.req.ip,
        lang,
      );

    // 驗證 accessToken 是否存在
    if (!authResponse.accessToken) {
      logger.error('[AuthResolver] Verify 2FA failed: accessToken is missing', {
        hasUser: !!authResponse.user,
      });
      throw new InternalServerErrorException(
        this.i18n.translate('auth.loginFailed', { lang }),
      );
    }

    setRefreshTokenCookie(context.res, refreshToken);
    return authResponse;
  }

  /**
   * 刷新 Token
   */
  @Mutation(() => AuthResponse, {
    description:
      '使用 HttpOnly Cookie 中的 Refresh Token 取得新的 Access Token（當 Access Token 過期時使用）',
  })
  async refreshToken(
    @Context() context: GraphQLContextWithExpress,
    @I18nLang() lang: string,
  ): Promise<AuthResponse> {
    logger.debug('[AuthResolver] RefreshToken mutation called');

    const token = context.req.cookies?.refresh_token;

    if (!token) {
      logger.warn('[AuthResolver] Refresh token not found in cookies');
      throw new UnauthorizedException(
        this.i18n.translate('auth.refreshTokenNotFound', {
          lang,
          defaultValue: 'Refresh token not found',
        }),
      );
    }

    try {
      logger.debug('[AuthResolver] Calling authService.refresh');
      const { refreshToken, ...authResponse } =
        await this.authService.refresh(token);

      // ✅ 验证返回值
      if (!authResponse.accessToken) {
        logger.error('[AuthResolver] ❌ accessToken is missing!', {
          authResponse,
          hasUser: !!authResponse.user,
        });
        throw new InternalServerErrorException(
          this.i18n.translate('auth.loginFailed', { lang }),
        );
      }

      logger.debug('[AuthResolver] Setting new refresh token cookie', {
        userId: authResponse.user?.id,
        hasAccessToken: !!authResponse.accessToken,
      });
      setRefreshTokenCookie(context.res, refreshToken);

      return authResponse;
    } catch (error) {
      // 清除無效的 refresh token cookie
      clearRefreshTokenCookie(context.res);

      logger.warn('[AuthResolver] Token refresh failed, cookie cleared', {
        error: error instanceof Error ? error.message : String(error),
      });

      // 重新拋出原始錯誤
      throw error;
    }
  }

  /**
   * 登出
   */
  @Mutation(() => Boolean, {
    description: '登出（清除伺服器端的 Refresh Token 和 Cookie）',
  })
  @UseGuards(JwtAuthGuard)
  async logout(
    @Context() context: GraphQLContextWithExpress,
  ): Promise<boolean> {
    const userId = context.req.user?.userId || context.req.user?.sub;
    if (!userId) {
      throw new UnauthorizedException('User ID not found in context');
    }
    const refreshToken = context.req.cookies?.refresh_token;

    logger.info('[AuthResolver] Logout called', {
      userId,
      hasRefreshToken: !!refreshToken,
      cookieKeys: Object.keys(context.req.cookies || {}),
      refreshTokenLength: refreshToken?.length,
    });

    // 顯式撤銷 refresh token 並清除 cookie（安全性增強）
    const success = await this.authService.logout(userId, refreshToken);

    if (success) {
      clearRefreshTokenCookie(context.res);
    }

    return success;
  }

  /**
   * 請求密碼重置
   */
  @Mutation(() => PasswordResetResponse, {
    description: '請求密碼重置（發送重置連結到註冊的電子郵件，30 分鐘內有效）',
  })
  @Throttle({ default: { limit: 3, ttl: 300000 } }) // 5 分鐘內最多 3 次
  async requestPasswordReset(
    @Args('email', { description: '註冊的電子郵件地址' })
    email: string,
    @Context() context: GraphQLContextWithExpress,
    @I18nLang() lang: string,
  ): Promise<PasswordResetResponse> {
    const ipAddress =
      context.req?.ip ||
      context.req?.connection?.remoteAddress ||
      context.req?.socket?.remoteAddress ||
      '未知';

    await this.passwordResetService.requestPasswordReset(
      email,
      ipAddress,
      lang,
    );

    return {
      success: true,
      message: '如果該郵箱存在，我們已發送重置連結到您的信箱',
    };
  }

  /**
   * 驗證重置 token
   */
  @Query(() => VerifyTokenResponse, {
    description: '驗證密碼重置 token 是否有效（檢查是否過期或已使用）',
  })
  async verifyPasswordResetToken(
    @Args('token', { description: '從重置郵件中獲得的 token' })
    token: string,
  ): Promise<VerifyTokenResponse> {
    const valid = await this.passwordResetService.verifyResetToken(token);

    return { valid };
  }

  /**
   * 重置密碼
   */
  @Mutation(() => Boolean, {
    description: '使用 token 重置密碼（token 使用後將失效）',
  })
  @Throttle({ default: { limit: 5, ttl: 300000 } }) // 5 分鐘內最多 5 次
  async resetPassword(
    @Args('token', { description: '從重置郵件中獲得的 token' })
    token: string,
    @Args('newPassword', {
      description: '新密碼（至少 8 字符，包含大小寫字母和數字）',
    })
    newPassword: string,
    @Context() context: GraphQLContextWithExpress,
    @I18nLang() lang: string,
  ): Promise<boolean> {
    const ipAddress =
      context.req?.ip ||
      context.req?.connection?.remoteAddress ||
      context.req?.socket?.remoteAddress ||
      '未知';

    return this.passwordResetService.resetPassword(
      token,
      newPassword,
      ipAddress,
      lang,
    );
  }
}
