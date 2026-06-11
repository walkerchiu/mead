import {
  Injectable,
  BadRequestException,
  UnauthorizedException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { MailService } from '../mail/mail.service';
import { ConfigService } from '@nestjs/config';
import { I18nService } from 'nestjs-i18n';
import * as crypto from 'crypto';
import * as bcrypt from 'bcrypt';
import { assertPasswordStrengthAsync } from '../common/utils/password-validator';
import { logger } from '../common/services/logger.service';
import { NotificationService } from '../notification/notification.service';
import { RevokedMethod } from './hq-session.types';

@Injectable()
export class PasswordResetService {
  private readonly SALT_ROUNDS = 10;
  private readonly TOKEN_BYTES = 32;
  private readonly EXPIRE_MINUTES: number;
  private readonly RESET_URL: string;

  constructor(
    private prisma: PrismaService,
    private mailService: MailService,
    private notificationService: NotificationService,
    private config: ConfigService,
    private i18n: I18nService,
  ) {
    // 縮短過期時間至 15 分鐘（安全性增強）
    this.EXPIRE_MINUTES = parseInt(
      this.config.get('PASSWORD_RESET_EXPIRE_MINUTES', '15'),
    );
    // PASSWORD_RESET_URL 優先，否則從 APP_URL 推導
    this.RESET_URL =
      this.config.get('PASSWORD_RESET_URL') ||
      `${this.config.get('APP_URL', 'http://localhost:3000')}/reset-password`;
  }

  /**
   * 請求密碼重置
   * 即使 email 不存在也返回成功（防止列舉攻擊）
   */
  async requestPasswordReset(
    email: string,
    ipAddress?: string,
    lang?: string,
  ): Promise<boolean> {
    // 查找用戶（email 已非唯一；多帳號共用同一 email 時取最早建立者）
    const user = await this.prisma.user.findFirst({
      where: { email },
      orderBy: { createdAt: 'asc' },
    });

    // 即使用戶不存在也等待相同時間（防止時序攻擊）
    if (!user || user.deletedAt) {
      // 模擬處理時間
      await this.simulateProcessing();
      return true; // 不透露用戶是否存在
    }

    // 生成隨機 token
    const rawToken = crypto.randomBytes(this.TOKEN_BYTES).toString('hex');
    const hashedToken = await bcrypt.hash(rawToken, this.SALT_ROUNDS);

    // 計算過期時間
    const expiresAt = new Date();
    expiresAt.setMinutes(expiresAt.getMinutes() + this.EXPIRE_MINUTES);

    // 刪除該用戶之前的未使用重置請求
    await this.prisma.passwordReset.deleteMany({
      where: {
        userId: user.id,
        usedAt: null,
      },
    });

    // 創建新的重置請求
    await this.prisma.passwordReset.create({
      data: {
        userId: user.id,
        token: hashedToken,
        expiresAt,
        ipAddress,
      },
    });

    // 發送重置 email
    try {
      await this.mailService.sendPasswordResetEmail(
        user.email,
        user.name,
        rawToken,
        this.RESET_URL,
        ipAddress,
        lang,
      );
    } catch (error) {
      // Email 發送失敗也不拋出錯誤，避免洩漏信息
      logger.error('[PasswordReset] Failed to send email:', error);
    }

    return true;
  }

  /**
   * 驗證重置 token 是否有效
   */
  async verifyResetToken(token: string): Promise<boolean> {
    try {
      const resetRequest = await this.findValidResetRequest(token);
      return !!resetRequest;
    } catch {
      return false;
    } finally {
      // 防止時序攻擊：無論結果如何，確保回應時間一致
      await this.simulateProcessing();
    }
  }

  /**
   * 重置密碼
   */
  async resetPassword(
    token: string,
    newPassword: string,
    ipAddress?: string,
    lang?: string,
  ): Promise<boolean> {
    // 查找有效的重置請求（先取得用戶資訊以進行相似度檢查）
    const resetRequest = await this.findValidResetRequest(token);
    if (!resetRequest) {
      throw new UnauthorizedException(
        this.i18n.translate('auth.invalidResetToken', { lang }),
      );
    }

    // 獲取用戶
    const user = await this.prisma.user.findUnique({
      where: { id: resetRequest.userId },
    });

    if (!user || user.deletedAt) {
      throw new UnauthorizedException(
        this.i18n.translate('auth.userNotFound', { lang }),
      );
    }

    // 查詢最近 3 組密碼歷史記錄（用於檢查密碼重複使用）
    const passwordHistories = await this.prisma.passwordHistory.findMany({
      where: { userId: user.id },
      orderBy: { createdAt: 'desc' },
      take: 3,
      select: { passwordHash: true },
    });

    // 驗證新密碼強度（包含相似度檢查和密碼歷史檢查）
    await assertPasswordStrengthAsync(
      newPassword,
      lang,
      this.i18n,
      {
        email: user.email,
        name: user.name || undefined,
      },
      {
        passwordHashes: passwordHistories.map((h) => h.passwordHash),
      },
    );

    // 檢查新密碼是否與當前密碼相同
    const isSamePassword = await bcrypt.compare(newPassword, user.password);
    if (isSamePassword) {
      throw new BadRequestException(
        this.i18n.translate('auth.passwordSameAsOld', { lang }),
      );
    }

    // Hash 新密碼
    const hashedPassword = await bcrypt.hash(newPassword, this.SALT_ROUNDS);

    // 開始事務
    await this.prisma.$transaction(async (tx) => {
      // 1. 將當前密碼儲存到歷史記錄
      await tx.passwordHistory.create({
        data: {
          userId: user.id,
          passwordHash: user.password,
        },
      });

      // 2. 更新密碼
      await tx.user.update({
        where: { id: user.id },
        data: {
          password: hashedPassword,
          updatedAt: new Date(),
        },
      });

      // 3. 只保留最近 3 組密碼歷史記錄（刪除更舊的記錄）
      const allHistories = await tx.passwordHistory.findMany({
        where: { userId: user.id },
        orderBy: { createdAt: 'desc' },
        select: { id: true },
      });

      if (allHistories.length > 3) {
        const idsToKeep = allHistories.slice(0, 3).map((h) => h.id);
        await tx.passwordHistory.deleteMany({
          where: {
            userId: user.id,
            id: {
              notIn: idsToKeep,
            },
          },
        });
      }

      // 4. 標記 token 為已使用
      await tx.passwordReset.update({
        where: { id: resetRequest.id },
        data: { usedAt: new Date() },
      });

      // 5. 撤銷所有 sessions，強制重新登入（改用 Session 表）
      await tx.session.updateMany({
        where: {
          userId: user.id,
          revokedAt: null,
        },
        data: {
          revokedAt: new Date(),
          revokedMethod: RevokedMethod.SECURITY_MEASURE,
          revokedReason: 'Password reset - all sessions revoked for security',
        },
      });
    });

    // 發送密碼變更通知（email + 系統通知）
    try {
      await this.mailService.sendPasswordChangedEmail(
        user.email,
        user.name,
        ipAddress,
        lang,
      );
    } catch (error) {
      logger.error('[PasswordReset] Failed to send email notification:', error);
    }

    if (
      this.config.get<string>('PUSH_NOTIFY_PASSWORD_CHANGED', 'true') !==
      'false'
    ) {
      try {
        await this.notificationService.createLocalizedNotification(
          user.id,
          'INFO',
          'PASSWORD_CHANGED_RESET',
          [],
          { event: 'PASSWORD_CHANGED', source: 'password_reset', ipAddress },
        );
      } catch (error) {
        logger.error(
          '[PasswordReset] Failed to create system notification:',
          error,
        );
      }
    }

    return true;
  }

  /**
   * 查找有效的重置請求
   */
  private async findValidResetRequest(token: string) {
    // 獲取所有未使用且未過期的重置請求
    const resetRequests = await this.prisma.passwordReset.findMany({
      where: {
        usedAt: null,
        expiresAt: {
          gt: new Date(),
        },
      },
    });

    // 逐一比對 token（因為 token 是 hashed）
    for (const request of resetRequests) {
      const isValid = await bcrypt.compare(token, request.token);
      if (isValid) {
        return request;
      }
    }

    return null;
  }

  /**
   * 模擬處理時間（防止時序攻擊）
   */
  private async simulateProcessing(): Promise<void> {
    const delay = 100 + Math.random() * 200; // 100-300ms
    await new Promise((resolve) => setTimeout(resolve, delay));
  }

  /**
   * 清除過期的重置請求（cron job 使用）
   */
  async cleanupExpiredTokens(): Promise<number> {
    const result = await this.prisma.passwordReset.deleteMany({
      where: {
        expiresAt: {
          lt: new Date(),
        },
      },
    });

    return result.count;
  }
}
