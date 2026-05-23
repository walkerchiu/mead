import {
  Injectable,
  BadRequestException,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from '../../prisma/prisma.service';
import { I18nService } from 'nestjs-i18n';
import * as crypto from 'crypto';
import { logger } from '../../common/services/logger.service';
import { NotificationService } from '../../notification/notification.service';
import { MailService } from '../../mail/mail.service';

/** 允許的 PAT scope 白名單 */
const ALLOWED_SCOPES: readonly string[] = [] as const;

/** 允許的到期天數選項 */
const ALLOWED_EXPIRE_DAYS = [30, 90, 180] as const;

/** 每位用戶最多有效 Token 數量 */
const MAX_ACTIVE_TOKENS_PER_USER = 3;

/** Token 前綴 */
const TOKEN_PREFIX = 'mead_';

@Injectable()
export class PersonalAccessTokenService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly i18n: I18nService,
    private readonly config: ConfigService,
    private readonly notificationService: NotificationService,
    private readonly mailService: MailService,
  ) {}

  /**
   * 產生 Token 的 SHA-256 雜湊值
   */
  private hashToken(rawToken: string): string {
    return crypto.createHash('sha256').update(rawToken).digest('hex');
  }

  /**
   * 產生隨機 Token
   * 格式：mead_<32 字元 hex>
   */
  private generateRawToken(): string {
    const random = crypto.randomBytes(16).toString('hex');
    return `${TOKEN_PREFIX}${random}`;
  }

  /**
   * 檢查是否為有效的 PAT 格式
   */
  isPatToken(token: string): boolean {
    return token.startsWith(TOKEN_PREFIX) && token.length === 37;
  }

  /**
   * 取得允許的 scope 列表
   */
  getAllowedScopes(): readonly string[] {
    return ALLOWED_SCOPES;
  }

  /**
   * 建立個人存取權杖
   * @returns 明文 Token（僅此一次）+ PAT 記錄
   */
  async create(
    userId: string,
    name: string,
    scopes: string[],
    expiresInDays: number,
    lang?: string,
  ) {
    // 驗證名稱
    if (!name || name.trim().length < 3 || name.length > 100) {
      throw new BadRequestException(
        this.i18n.translate('pat.invalidName', { lang }),
      );
    }

    // 驗證 scopes
    if (!scopes || scopes.length === 0) {
      throw new BadRequestException(
        this.i18n.translate('pat.scopesRequired', { lang }),
      );
    }
    const invalidScopes = scopes.filter((s) => !ALLOWED_SCOPES.includes(s));
    if (invalidScopes.length > 0) {
      throw new BadRequestException(
        this.i18n.translate('pat.invalidScopes', {
          lang,
          args: { scopes: invalidScopes.join(', ') },
        }),
      );
    }

    // 驗證到期天數
    if (!(ALLOWED_EXPIRE_DAYS as readonly number[]).includes(expiresInDays)) {
      throw new BadRequestException(
        this.i18n.translate('pat.invalidExpireDays', { lang }),
      );
    }

    // 檢查有效 Token 數量上限
    const activeCount = await this.prisma.personalAccessToken.count({
      where: {
        userId,
        revokedAt: null,
        expiresAt: { gt: new Date() },
      },
    });
    if (activeCount >= MAX_ACTIVE_TOKENS_PER_USER) {
      throw new ForbiddenException(
        this.i18n.translate('pat.maxTokensReached', {
          lang,
          args: { max: MAX_ACTIVE_TOKENS_PER_USER },
        }),
      );
    }

    // 產生 Token
    const rawToken = this.generateRawToken();
    const tokenHash = this.hashToken(rawToken);
    const tokenPrefix = rawToken.substring(0, 12);

    // 計算到期時間
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + expiresInDays);

    const pat = await this.prisma.personalAccessToken.create({
      data: {
        userId,
        name: name.trim(),
        tokenHash,
        tokenPrefix,
        scopes,
        expiresAt,
      },
      select: {
        id: true,
        name: true,
        tokenPrefix: true,
        scopes: true,
        lastUsedAt: true,
        lastUsedIp: true,
        expiresAt: true,
        createdAt: true,
        revokedAt: true,
      },
    });

    logger.info('[PAT] Token created', {
      userId,
      tokenId: pat.id,
      name: pat.name,
      scopes,
      expiresAt: pat.expiresAt,
    });

    // 發送通知
    await this.sendPatNotification(
      userId,
      pat.name,
      tokenPrefix,
      scopes,
      'created',
      pat.expiresAt,
    );

    return {
      token: rawToken, // 僅此一次回傳明文
      personalAccessToken: pat,
    };
  }

  /**
   * 列出用戶的所有 Token（不含 hash）
   */
  async findAllByUser(userId: string) {
    return this.prisma.personalAccessToken.findMany({
      where: { userId },
      select: {
        id: true,
        name: true,
        tokenPrefix: true,
        scopes: true,
        lastUsedAt: true,
        lastUsedIp: true,
        expiresAt: true,
        createdAt: true,
        revokedAt: true,
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  /**
   * 撤銷 Token
   */
  async revoke(userId: string, tokenId: string, lang?: string) {
    const pat = await this.prisma.personalAccessToken.findFirst({
      where: { id: tokenId, userId },
    });

    if (!pat) {
      throw new NotFoundException(
        this.i18n.translate('pat.notFound', { lang }),
      );
    }

    if (pat.revokedAt) {
      throw new BadRequestException(
        this.i18n.translate('pat.alreadyRevoked', { lang }),
      );
    }

    await this.prisma.personalAccessToken.update({
      where: { id: tokenId },
      data: { revokedAt: new Date() },
    });

    logger.info('[PAT] Token revoked', {
      userId,
      tokenId,
      name: pat.name,
    });

    // 發送通知
    await this.sendPatNotification(
      userId,
      pat.name,
      pat.tokenPrefix,
      pat.scopes,
      'revoked',
    );

    return true;
  }

  /**
   * 驗證 Token（供 Guard 使用）
   * @returns userId + scopes，或 null（驗證失敗）
   */
  async validateToken(
    rawToken: string,
    ip?: string,
  ): Promise<{ userId: string; scopes: string[] } | null> {
    if (!this.isPatToken(rawToken)) {
      return null;
    }

    const tokenHash = this.hashToken(rawToken);

    const pat = await this.prisma.personalAccessToken.findFirst({
      where: {
        tokenHash,
        revokedAt: null,
        expiresAt: { gt: new Date() },
      },
      select: {
        id: true,
        userId: true,
        scopes: true,
      },
    });

    if (!pat) {
      return null;
    }

    // 非同步更新最後使用時間（不阻塞回應）
    this.prisma.personalAccessToken
      .update({
        where: { id: pat.id },
        data: {
          lastUsedAt: new Date(),
          lastUsedIp: ip || null,
        },
      })
      .catch((err) => {
        logger.warn('[PAT] Failed to update lastUsedAt', {
          tokenId: pat.id,
          error: err.message,
        });
      });

    return {
      userId: pat.userId,
      scopes: pat.scopes,
    };
  }

  /**
   * 發送 PAT 相關通知（系統通知 + Email）
   */
  private async sendPatNotification(
    userId: string,
    tokenName: string,
    tokenPrefix: string,
    scopes: string[],
    event: 'created' | 'revoked',
    expiresAt?: Date,
  ): Promise<void> {
    // 系統通知（鈴鐺）
    if (this.config.get<string>('PUSH_NOTIFY_PAT', 'true') !== 'false') {
      try {
        const messageKey = event === 'created' ? 'PAT_CREATED' : 'PAT_REVOKED';
        const messageArgs =
          event === 'created' && expiresAt
            ? [
                tokenName,
                Math.round(
                  (expiresAt.getTime() - Date.now()) / (1000 * 60 * 60 * 24),
                ),
              ]
            : [tokenName];

        await this.notificationService.createLocalizedNotification(
          userId,
          'INFO',
          messageKey,
          messageArgs,
          {
            event: messageKey,
            tokenName,
            tokenPrefix,
            actionUrl: '/settings/pat',
          },
        );
      } catch (error) {
        logger.error('[PAT] Failed to create system notification', {
          error: error instanceof Error ? error.message : String(error),
        });
      }
    }

    // Email 通知
    try {
      const user = await this.prisma.user.findUnique({
        where: { id: userId },
        select: {
          email: true,
          name: true,
          profile: { select: { language: true } },
        },
      });

      if (user) {
        await this.mailService.sendPatNotificationEmail(
          user.email,
          user.name,
          {
            name: tokenName,
            prefix: tokenPrefix,
            scopes,
            expiresAt,
          },
          event,
          user.profile?.language || undefined,
        );
      }
    } catch (error) {
      logger.error('[PAT] Failed to send email notification', {
        error: error instanceof Error ? error.message : String(error),
      });
    }
  }
}
