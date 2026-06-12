import {
  Injectable,
  BadRequestException,
  UnauthorizedException,
} from '@nestjs/common';
import { I18nService } from 'nestjs-i18n';
import { PrismaService } from '../prisma/prisma.service';
import { MailService } from '../mail/mail.service';
import * as crypto from 'crypto';
import * as bcrypt from 'bcrypt';

export enum TwoFactorType {
  EMAIL = 'EMAIL',
  TOTP = 'TOTP',
  SMS = 'SMS',
}

export enum VerificationPurpose {
  LOGIN = 'LOGIN',
  ENABLE = 'ENABLE',
  DISABLE = 'DISABLE',
}

@Injectable()
export class TwoFactorAuthService {
  private readonly CODE_LENGTH = 6;
  private readonly CODE_EXPIRY_MINUTES = 10;
  private readonly MAX_ATTEMPTS = 5;
  private readonly SALT_ROUNDS = 12; // OWASP 建議 12-14 rounds

  constructor(
    private prisma: PrismaService,
    private mailService: MailService,
    private i18n: I18nService,
  ) {}

  /**
   * 檢查用戶是否已啟用 2FA
   */
  async isEnabled(userId: string): Promise<boolean> {
    const twoFactorAuth = await this.prisma.twoFactorAuth.findUnique({
      where: { userId },
    });

    return twoFactorAuth?.enabled || false;
  }

  /**
   * 獲取用戶的 2FA 設定
   */
  async getSettings(userId: string) {
    const twoFactorAuth = await this.prisma.twoFactorAuth.findUnique({
      where: { userId },
      select: {
        type: true,
        enabled: true,
        lastVerifiedAt: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    if (!twoFactorAuth) {
      return null;
    }

    return {
      ...twoFactorAuth,
      type: twoFactorAuth.type as TwoFactorType,
    };
  }

  /**
   * 請求啟用 2FA（發送驗證碼到 Email）
   */
  async requestEnable(
    userId: string,
    email: string,
    name: string | null,
    ipAddress?: string,
    lang?: string,
  ): Promise<{ message: string }> {
    // 檢查是否已啟用
    const existing = await this.prisma.twoFactorAuth.findUnique({
      where: { userId },
    });

    if (existing?.enabled) {
      throw new BadRequestException(
        this.i18n.translate('twoFactor.alreadyEnabled', { lang }),
      );
    }

    // 生成並發送驗證碼
    await this.generateAndSendCode(
      userId,
      email,
      name,
      VerificationPurpose.ENABLE,
      ipAddress,
      lang,
    );

    return {
      message: this.i18n.translate('twoFactor.codeSent', { lang }),
    };
  }

  /**
   * 確認啟用 2FA
   */
  async confirmEnable(
    userId: string,
    code: string,
    lang?: string,
  ): Promise<{ backupCodes: string[] }> {
    // 驗證驗證碼
    await this.verifyCode(userId, code, VerificationPurpose.ENABLE, lang);

    // 生成備用驗證碼
    const backupCodes = this.generateBackupCodes();

    // 雜湊備用驗證碼後儲存
    const hashedBackupCodes = await Promise.all(
      backupCodes.map(async (code) => ({
        hash: await bcrypt.hash(code, this.SALT_ROUNDS),
        used: false,
        usedAt: null,
      })),
    );

    // 創建或更新 2FA 設定
    await this.prisma.twoFactorAuth.upsert({
      where: { userId },
      create: {
        userId,
        type: TwoFactorType.EMAIL,
        enabled: true,
        backupCodes: hashedBackupCodes,
        lastVerifiedAt: new Date(),
      },
      update: {
        enabled: true,
        type: TwoFactorType.EMAIL,
        backupCodes: hashedBackupCodes,
        lastVerifiedAt: new Date(),
      },
    });

    // 回傳明文給用戶（僅此一次）
    return { backupCodes };
  }

  /**
   * 請求停用 2FA（發送驗證碼到 Email）
   */
  async requestDisable(
    userId: string,
    email: string,
    name: string | null,
    ipAddress?: string,
    lang?: string,
  ): Promise<{ message: string }> {
    // 檢查是否已啟用
    const existing = await this.prisma.twoFactorAuth.findUnique({
      where: { userId },
    });

    if (!existing?.enabled) {
      throw new BadRequestException(
        this.i18n.translate('twoFactor.notEnabled', {
          lang,
          defaultValue: 'Two-factor authentication is not enabled',
        }),
      );
    }

    // 生成並發送驗證碼
    await this.generateAndSendCode(
      userId,
      email,
      name,
      VerificationPurpose.DISABLE,
      ipAddress,
      lang,
    );

    return {
      message: this.i18n.translate('twoFactor.codeSent', { lang }),
    };
  }

  /**
   * 確認停用 2FA
   */
  async confirmDisable(
    userId: string,
    code: string,
    lang?: string,
  ): Promise<{ message: string }> {
    // 驗證驗證碼
    await this.verifyCode(userId, code, VerificationPurpose.DISABLE, lang);

    // 停用 2FA
    await this.prisma.twoFactorAuth.update({
      where: { userId },
      data: {
        enabled: false,
        backupCodes: [],
      },
    });

    return {
      message: this.i18n.translate('twoFactor.disableSuccess', { lang }),
    };
  }

  /**
   * 登入時發送 2FA 驗證碼
   */
  async sendLoginCode(
    userId: string,
    email: string,
    name: string | null,
    ipAddress?: string,
    lang?: string,
  ): Promise<void> {
    await this.generateAndSendCode(
      userId,
      email,
      name,
      VerificationPurpose.LOGIN,
      ipAddress,
      lang,
    );
  }

  /**
   * 驗證登入驗證碼
   */
  async verifyLoginCode(userId: string, code: string): Promise<boolean> {
    try {
      await this.verifyCode(userId, code, VerificationPurpose.LOGIN);

      // 更新最後驗證時間
      await this.prisma.twoFactorAuth.update({
        where: { userId },
        data: { lastVerifiedAt: new Date() },
      });

      return true;
    } catch {
      return false;
    }
  }

  /**
   * 使用備用驗證碼
   */
  async useBackupCode(userId: string, code: string): Promise<boolean> {
    const twoFactorAuth = await this.prisma.twoFactorAuth.findUnique({
      where: { userId },
    });

    if (!twoFactorAuth?.enabled || !twoFactorAuth.backupCodes) {
      return false;
    }

    const backupCodes = twoFactorAuth.backupCodes as Array<{
      hash: string;
      used: boolean;
      usedAt: string | null;
    }>;

    // 逐一比對未使用的備用碼（bcrypt compare）
    let matchedIndex = -1;
    for (let i = 0; i < backupCodes.length; i++) {
      if (
        !backupCodes[i].used &&
        (await bcrypt.compare(code, backupCodes[i].hash))
      ) {
        matchedIndex = i;
        break;
      }
    }

    if (matchedIndex === -1) {
      return false;
    }

    // 標記為已使用
    const updatedCodes = backupCodes.map((bc, i) =>
      i === matchedIndex
        ? { ...bc, used: true, usedAt: new Date().toISOString() }
        : bc,
    );

    await this.prisma.twoFactorAuth.update({
      where: { userId },
      data: {
        backupCodes: updatedCodes,
        lastVerifiedAt: new Date(),
      },
    });

    return true;
  }

  /**
   * 生成並發送驗證碼
   */
  private async generateAndSendCode(
    userId: string,
    email: string,
    name: string | null,
    purpose: VerificationPurpose,
    ipAddress?: string,
    lang?: string,
  ): Promise<void> {
    // 生成 6 位數驗證碼
    const code = this.generateCode();

    // 加密驗證碼
    const hashedCode = await bcrypt.hash(code, this.SALT_ROUNDS);

    // 計算過期時間
    const expiresAt = new Date(
      Date.now() + this.CODE_EXPIRY_MINUTES * 60 * 1000,
    );

    // 刪除該用戶該目的的舊驗證碼
    await this.prisma.twoFactorVerification.deleteMany({
      where: {
        userId,
        purpose,
        verifiedAt: null,
      },
    });

    // 創建新的驗證記錄
    await this.prisma.twoFactorVerification.create({
      data: {
        userId,
        purpose,
        code: hashedCode,
        expiresAt,
        ipAddress,
      },
    });

    // 發送驗證碼到 Email
    await this.mailService.sendTwoFactorCode(
      email,
      name || email,
      code,
      this.CODE_EXPIRY_MINUTES,
      purpose,
      ipAddress,
      lang,
    );
  }

  /**
   * 驗證驗證碼
   */
  private async verifyCode(
    userId: string,
    code: string,
    purpose: VerificationPurpose,
    lang?: string,
  ): Promise<void> {
    // 查找最新的未驗證記錄
    const verification = await this.prisma.twoFactorVerification.findFirst({
      where: {
        userId,
        purpose,
        verifiedAt: null,
        expiresAt: { gt: new Date() },
      },
      orderBy: { createdAt: 'desc' },
    });

    if (!verification) {
      throw new UnauthorizedException(
        this.i18n.translate('twoFactor.codeNotFoundOrExpired', { lang }),
      );
    }

    // 檢查嘗試次數
    if (verification.attempts >= this.MAX_ATTEMPTS) {
      throw new UnauthorizedException(
        this.i18n.translate('twoFactor.tooManyAttempts', { lang }),
      );
    }

    // 驗證驗證碼
    const isValid = await bcrypt.compare(code, verification.code);

    if (!isValid) {
      // 增加嘗試次數
      await this.prisma.twoFactorVerification.update({
        where: { id: verification.id },
        data: { attempts: verification.attempts + 1 },
      });

      throw new UnauthorizedException(
        this.i18n.translate('twoFactor.codeInvalid', { lang }),
      );
    }

    // 標記為已驗證
    await this.prisma.twoFactorVerification.update({
      where: { id: verification.id },
      data: { verifiedAt: new Date() },
    });
  }

  /**
   * 生成隨機驗證碼
   */
  private generateCode(): string {
    return crypto
      .randomInt(0, Math.pow(10, this.CODE_LENGTH))
      .toString()
      .padStart(this.CODE_LENGTH, '0');
  }

  /**
   * 生成備用驗證碼
   */
  private generateBackupCodes(count: number = 10): string[] {
    const codes: string[] = [];
    for (let i = 0; i < count; i++) {
      const code = crypto.randomBytes(4).toString('hex').toUpperCase();
      codes.push(code);
    }
    return codes;
  }

  /**
   * 清理過期的驗證記錄（可以用 Cron job 定期執行）
   */
  async cleanupExpiredVerifications(): Promise<number> {
    const result = await this.prisma.twoFactorVerification.deleteMany({
      where: {
        expiresAt: { lt: new Date() },
      },
    });

    return result.count;
  }
}
