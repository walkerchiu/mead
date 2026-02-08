import { Resolver, Mutation, Query, Args, Context } from '@nestjs/graphql';
import { UseGuards } from '@nestjs/common';
import { Throttle } from '@nestjs/throttler';
import { I18nService } from 'nestjs-i18n';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { CurrentUser } from '../auth/current-user.decorator';
import { I18nLang } from '../common/decorators/i18n-lang.decorator';
import { TwoFactorAuthService } from './two-factor-auth.service';
import {
  TwoFactorAuthType,
  BasicResponse,
  Enable2FAResponse,
} from './two-factor-auth.types';
import { GraphQLContextWithExpress } from '../common/types/graphql-context.type';

/**
 * 雙因素認證 Resolver
 */
@Resolver()
export class TwoFactorAuthResolver {
  constructor(
    private twoFactorAuthService: TwoFactorAuthService,
    private i18n: I18nService,
  ) {}

  /**
   * 查詢當前用戶的 2FA 設定
   */
  @Query(() => TwoFactorAuthType, {
    nullable: true,
    description: '查詢當前用戶的雙因素認證設定',
  })
  @UseGuards(JwtAuthGuard)
  async my2FASettings(
    @CurrentUser() user: { userId: string },
  ): Promise<TwoFactorAuthType | null> {
    return this.twoFactorAuthService.getSettings(user.userId);
  }

  /**
   * 請求啟用 2FA（發送驗證碼到 Email）
   */
  @Mutation(() => BasicResponse, {
    description: '請求啟用雙因素認證（會發送驗證碼到您的 Email）',
  })
  @UseGuards(JwtAuthGuard)
  async requestEnable2FA(
    @CurrentUser() user: { userId: string; email: string; name: string | null },
    @Context() context: GraphQLContextWithExpress,
    @I18nLang() lang: string,
  ): Promise<BasicResponse> {
    const ipAddress =
      context.req?.ip || context.req?.connection?.remoteAddress || '未知';

    return this.twoFactorAuthService.requestEnable(
      user.userId,
      user.email,
      user.name,
      ipAddress,
      lang,
    );
  }

  /**
   * 確認啟用 2FA
   */
  @Mutation(() => Enable2FAResponse, {
    description: '確認啟用雙因素認證（使用 Email 收到的驗證碼）',
  })
  @UseGuards(JwtAuthGuard)
  @Throttle({ default: { limit: 3, ttl: 60000 } })
  async confirmEnable2FA(
    @CurrentUser() user: { userId: string },
    @Args('code', { description: '6 位數驗證碼' }) code: string,
    @I18nLang() lang: string,
  ): Promise<Enable2FAResponse> {
    const result = await this.twoFactorAuthService.confirmEnable(
      user.userId,
      code,
      lang,
    );

    return {
      message: this.i18n.translate('twoFactor.enableSuccess', { lang }),
      backupCodes: result.backupCodes,
    };
  }

  /**
   * 請求停用 2FA（發送驗證碼到 Email）
   */
  @Mutation(() => BasicResponse, {
    description: '請求停用雙因素認證（會發送驗證碼到您的 Email）',
  })
  @UseGuards(JwtAuthGuard)
  async requestDisable2FA(
    @CurrentUser() user: { userId: string; email: string; name: string | null },
    @Context() context: GraphQLContextWithExpress,
    @I18nLang() lang: string,
  ): Promise<BasicResponse> {
    const ipAddress =
      context.req?.ip || context.req?.connection?.remoteAddress || '未知';

    return this.twoFactorAuthService.requestDisable(
      user.userId,
      user.email,
      user.name,
      ipAddress,
      lang,
    );
  }

  /**
   * 確認停用 2FA
   */
  @Mutation(() => BasicResponse, {
    description: '確認停用雙因素認證（使用 Email 收到的驗證碼）',
  })
  @UseGuards(JwtAuthGuard)
  @Throttle({ default: { limit: 3, ttl: 60000 } })
  async confirmDisable2FA(
    @CurrentUser() user: { userId: string },
    @Args('code', { description: '6 位數驗證碼' }) code: string,
    @I18nLang() lang: string,
  ): Promise<BasicResponse> {
    const result = await this.twoFactorAuthService.confirmDisable(
      user.userId,
      code,
      lang,
    );

    return result;
  }
}
