import {
  Injectable,
  UnauthorizedException,
  ConflictException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { I18nService } from 'nestjs-i18n';
import { PrismaService } from '../prisma/prisma.service';
import { TwoFactorAuthService } from '../two-factor-auth/two-factor-auth.service';
import { SessionManagementService } from './session-management.service';
import * as bcrypt from 'bcrypt';
import * as crypto from 'crypto';
import { AccessScope } from '../common/enums/access-scope.enum';
import {
  JwtPayload,
  AuthTokenResult,
  TwoFactorLoginResponse,
} from './auth.types';
import { RevokedMethod } from './admin-session.types';
import { assertPasswordStrength } from '../common/utils/password-validator';
import {
  assertValidEmail,
  assertValidName,
} from '../common/utils/input-validator';
import { logger } from '../common/services/logger.service';

@Injectable()
export class AuthService {
  private readonly SALT_ROUNDS = 12; // OWASP 建議 12-14 rounds
  private readonly ACCESS_TOKEN_EXPIRES_IN: string;
  private readonly REFRESH_TOKEN_EXPIRES_IN: string;
  private readonly TEMP_TOKEN_EXPIRES_IN = '5m';

  constructor(
    private prisma: PrismaService,
    private jwtService: JwtService,
    private twoFactorAuthService: TwoFactorAuthService,
    private sessionManagementService: SessionManagementService,
    private i18n: I18nService,
    private configService: ConfigService,
  ) {
    // 從環境變量讀取 token 過期時間，提供安全的默認值
    this.ACCESS_TOKEN_EXPIRES_IN =
      this.configService.get<string>('JWT_EXPIRES_IN') || '15m';
    this.REFRESH_TOKEN_EXPIRES_IN =
      this.configService.get<string>('JWT_REFRESH_EXPIRES_IN') || '7d';

    logger.info('[AuthService] Token expiration configured', {
      accessToken: this.ACCESS_TOKEN_EXPIRES_IN,
      refreshToken: this.REFRESH_TOKEN_EXPIRES_IN,
    });
  }

  /**
   * 註冊客戶用戶
   * 只有 CUSTOMER_SCOPE 或 ADMIN_SCOPE 的用戶可以調用
   */
  async registerCustomer(
    email: string,
    password: string,
    name?: string,
    userAgent?: string,
    ipAddress?: string,
    lang?: string,
  ): Promise<AuthTokenResult> {
    assertValidEmail(email, lang, this.i18n);
    assertValidName(name, lang, this.i18n);

    const existingUser = await this.prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      throw new ConflictException(
        this.i18n.translate('auth.emailAlreadyRegistered', { lang }),
      );
    }

    // 驗證密碼強度（包含相似度檢查）
    assertPasswordStrength(password, lang, this.i18n, {
      email,
      name,
    });

    const hashedPassword = await bcrypt.hash(password, this.SALT_ROUNDS);

    const user = await this.prisma.user.create({
      data: {
        email,
        password: hashedPassword,
        name,
        accessScopes: [AccessScope.CUSTOMER_SCOPE],
      },
      include: {
        userRoles: {
          include: {
            role: true,
          },
        },
      },
    });

    // 註冊時創建新會話
    return this.generateTokens(user, userAgent, ipAddress, true);
  }

  /**
   * 註冊管理員用戶
   * 只有 ADMIN_SCOPE 的用戶可以調用
   */
  async registerAdmin(
    email: string,
    password: string,
    name?: string,
    userAgent?: string,
    ipAddress?: string,
    lang?: string,
  ): Promise<AuthTokenResult> {
    assertValidEmail(email, lang, this.i18n);
    assertValidName(name, lang, this.i18n);

    const existingUser = await this.prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      throw new ConflictException(
        this.i18n.translate('auth.emailAlreadyRegistered', { lang }),
      );
    }

    // 驗證密碼強度（包含相似度檢查）
    assertPasswordStrength(password, lang, this.i18n, {
      email,
      name,
    });

    const hashedPassword = await bcrypt.hash(password, this.SALT_ROUNDS);

    const user = await this.prisma.user.create({
      data: {
        email,
        password: hashedPassword,
        name,
        accessScopes: [AccessScope.ADMIN_SCOPE],
      },
      include: {
        userRoles: {
          include: {
            role: true,
          },
        },
      },
    });

    // 註冊時創建新會話
    return this.generateTokens(user, userAgent, ipAddress, true);
  }

  async login(
    email: string,
    password: string,
    ipAddress?: string,
    userAgent?: string,
    lang?: string,
  ): Promise<AuthTokenResult | TwoFactorLoginResponse> {
    logger.info('[AuthService] Login started', { email });
    assertValidEmail(email, lang, this.i18n);

    const user = await this.prisma.user.findUnique({
      where: { email },
      include: {
        userRoles: {
          include: {
            role: true,
          },
        },
      },
    });

    if (!user || user.deletedAt) {
      throw new UnauthorizedException(
        this.i18n.translate('auth.invalidCredentials', { lang }),
      );
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      throw new UnauthorizedException(
        this.i18n.translate('auth.invalidCredentials', { lang }),
      );
    }

    // 檢查是否啟用 2FA
    const is2FAEnabled = await this.twoFactorAuthService.isEnabled(user.id);

    if (is2FAEnabled) {
      // 發送 2FA 驗證碼
      await this.twoFactorAuthService.sendLoginCode(
        user.id,
        user.email,
        user.name,
        ipAddress,
        lang,
      );

      // 生成臨時 Token（僅用於 2FA 驗證）
      const temporaryToken = this.jwtService.sign(
        { sub: user.id, email: user.email, purpose: '2fa-login' },
        { expiresIn: this.TEMP_TOKEN_EXPIRES_IN },
      );

      return {
        requiresTwoFactor: true,
        temporaryToken,
        message: this.i18n.translate('auth.twoFactorCodeSent', { lang }),
      };
    }

    // 沒有啟用 2FA，直接登入
    await this.prisma.user.update({
      where: { id: user.id },
      data: { lastLoginAt: new Date() },
    });

    const result = await this.generateTokens(user, userAgent, ipAddress, true);
    return result;
  }

  /**
   * 驗證 2FA 並完成登入
   */
  async verifyTwoFactor(
    temporaryToken: string,
    code: string,
    isBackupCode: boolean = false,
    userAgent?: string,
    ipAddress?: string,
    lang?: string,
  ): Promise<AuthTokenResult> {
    try {
      // 驗證臨時 Token
      const payload = this.jwtService.verify<{
        sub: string;
        email: string;
        purpose: string;
      }>(temporaryToken);

      if (payload.purpose !== '2fa-login') {
        throw new UnauthorizedException(
          this.i18n.translate('auth.invalidTemporaryToken', { lang }),
        );
      }

      const user = await this.prisma.user.findUnique({
        where: { id: payload.sub },
        include: {
          userRoles: {
            include: {
              role: true,
            },
          },
        },
      });

      if (!user || user.deletedAt) {
        throw new UnauthorizedException(
          this.i18n.translate('auth.invalidCredentials', { lang }),
        );
      }

      // 驗證 2FA 驗證碼
      let verified = false;

      if (isBackupCode) {
        verified = await this.twoFactorAuthService.useBackupCode(user.id, code);
      } else {
        verified = await this.twoFactorAuthService.verifyLoginCode(
          user.id,
          code,
        );
      }

      if (!verified) {
        throw new UnauthorizedException(
          this.i18n.translate('auth.codeExpiredOrInvalid', { lang }),
        );
      }

      // 更新最後登入時間
      await this.prisma.user.update({
        where: { id: user.id },
        data: { lastLoginAt: new Date() },
      });

      // 生成正式的登入 Token，2FA 驗證成功後創建新會話
      return this.generateTokens(user, userAgent, ipAddress, true);
    } catch {
      throw new UnauthorizedException(
        this.i18n.translate('auth.verificationFailed', { lang }),
      );
    }
  }

  async refresh(refreshToken: string): Promise<AuthTokenResult> {
    try {
      logger.debug('[AuthService] Attempting token refresh');
      const payload = this.jwtService.verify<JwtPayload>(refreshToken);
      logger.debug('[AuthService] Token verified', { userId: payload.sub });

      const user = await this.prisma.user.findUnique({
        where: { id: payload.sub },
        include: {
          userRoles: {
            include: {
              role: true,
            },
          },
        },
      });

      if (!user || user.deletedAt || !user.refreshToken) {
        logger.warn('[AuthService] Invalid user state', {
          userId: payload.sub,
          exists: !!user,
          deleted: !!user?.deletedAt,
        });
        throw new UnauthorizedException('Invalid refresh token');
      }

      // 比對 refresh token 雜湊值
      const tokenHash = crypto
        .createHash('sha256')
        .update(refreshToken)
        .digest('hex');

      if (user.refreshToken !== tokenHash) {
        logger.warn('[AuthService] Token hash mismatch', { userId: user.id });
        throw new UnauthorizedException('Invalid refresh token');
      }

      logger.debug('[AuthService] Generating new tokens', { userId: user.id });
      // Refresh token 時不創建新會話，而是更新現有會話
      const result = await this.generateTokens(
        user,
        undefined,
        undefined,
        false,
      );
      return result;
    } catch (error) {
      logger.error('[AuthService] Token refresh failed', {
        error: error instanceof Error ? error.message : 'Unknown error',
      });
      throw new UnauthorizedException('Invalid or expired refresh token');
    }
  }

  /**
   * 登出（清除伺服器端的 Refresh Token 並撤銷會話）
   */
  async logout(userId: string, refreshToken?: string): Promise<boolean> {
    try {
      logger.info('[Auth] Logout called', {
        userId,
        hasRefreshToken: !!refreshToken,
        refreshTokenLength: refreshToken?.length,
      });

      // 如果提供了 refreshToken，撤銷對應的會話
      if (refreshToken) {
        try {
          const revoked =
            await this.sessionManagementService.revokeSessionByRefreshToken(
              userId,
              refreshToken,
              RevokedMethod.USER_LOGOUT,
            );
          if (revoked) {
            logger.info('[Auth] Session revoked on logout', { userId });
          } else {
            logger.warn('[Auth] Session revocation returned false', { userId });
          }
        } catch (error) {
          logger.error('[Auth] Failed to revoke session on logout', {
            userId,
            error: error instanceof Error ? error.message : 'Unknown error',
            stack: error instanceof Error ? error.stack : undefined,
          });
          // 即使撤銷會話失敗，仍然清除 refresh token
        }
      } else {
        logger.warn('[Auth] No refresh token provided for logout', { userId });
      }

      // 清除用戶的 Refresh Token
      await this.prisma.user.update({
        where: { id: userId },
        data: { refreshToken: null },
      });

      logger.info('[Auth] User logged out successfully', { userId });
      return true;
    } catch (error) {
      logger.error('[Auth] Logout failed', {
        userId,
        error: error instanceof Error ? error.message : 'Unknown error',
      });
      return false;
    }
  }

  async validateUser(payload: JwtPayload) {
    const user = await this.prisma.user.findUnique({
      where: { id: payload.sub },
      include: {
        userRoles: {
          include: {
            role: true,
          },
        },
      },
    });

    if (!user || user.deletedAt) {
      throw new UnauthorizedException('User not found');
    }

    const rolesByScope = this.groupRolesByScope(user.userRoles);

    return {
      sub: user.id, // JWT 標準使用 sub 表示 subject (user ID)
      userId: user.id, // 保留 userId 以保持向後兼容
      email: user.email,
      accessScopes: user.accessScopes,
      roles: rolesByScope,
    };
  }

  private async generateTokens(
    user: any,
    userAgent?: string,
    ipAddress?: string,
    createNewSession: boolean = false,
  ): Promise<AuthTokenResult> {
    const rolesByScope = this.groupRolesByScope(user.userRoles || []);
    const accessScopes = user.accessScopes || [];

    logger.debug('[AuthService] Generating tokens', {
      userId: user.id,
      email: user.email,
      accessScopes,
      createNewSession,
    });

    const payload: JwtPayload = {
      sub: user.id,
      email: user.email,
      accessScopes,
      roles: rolesByScope,
    };

    const accessToken = this.jwtService.sign(payload, {
      expiresIn: this.ACCESS_TOKEN_EXPIRES_IN as any,
    });

    const refreshToken = this.jwtService.sign(payload, {
      expiresIn: this.REFRESH_TOKEN_EXPIRES_IN as any,
    });

    logger.info('[AuthService] Tokens generated', {
      userId: user.id,
      accessTokenLength: accessToken?.length,
      refreshTokenLength: refreshToken?.length,
      hasAccessToken: !!accessToken,
      hasRefreshToken: !!refreshToken,
    });

    if (!accessToken || !refreshToken) {
      logger.error(
        '[AuthService] Token generation failed - tokens are null/undefined',
        {
          userId: user.id,
          hasAccessToken: !!accessToken,
          hasRefreshToken: !!refreshToken,
        },
      );
      throw new Error('Token generation failed');
    }

    // 儲存 refresh token 的 SHA-256 雜湊值
    const refreshTokenHash = crypto
      .createHash('sha256')
      .update(refreshToken)
      .digest('hex');

    await this.prisma.user.update({
      where: { id: user.id },
      data: { refreshToken: refreshTokenHash },
    });

    // 根據情況創建新會話或更新現有會話
    if (createNewSession) {
      // 登入時創建新會話
      await this.sessionManagementService.createSession(
        user.id,
        refreshToken,
        userAgent,
        ipAddress,
      );
      logger.info('[AuthService] New session created', { userId: user.id });
    } else {
      // Refresh token 時更新現有會話
      await this.sessionManagementService.updateSessionActivity(refreshToken);
      logger.info('[AuthService] Session activity updated', {
        userId: user.id,
      });
    }

    const result = {
      accessToken,
      refreshToken,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        accessScopes,
        lastLoginAt: user.lastLoginAt,
        createdAt: user.createdAt,
        updatedAt: user.updatedAt,
      },
    };

    logger.info('[AuthService] Returning token result', {
      userId: user.id,
      hasAccessToken: !!result.accessToken,
      hasRefreshToken: !!result.refreshToken,
      hasUser: !!result.user,
    });

    return result;
  }

  private groupRolesByScope(userRoles: any[]) {
    const grouped = new Map<AccessScope, string[]>();

    for (const userRole of userRoles) {
      const scope = userRole.role.scope;
      if (!grouped.has(scope)) {
        grouped.set(scope, []);
      }
      grouped.get(scope).push(userRole.role.name);
    }

    return Array.from(grouped.entries()).map(([scope, roleNames]) => ({
      scope,
      roleNames,
    }));
  }
}
