import { Injectable } from '@nestjs/common';
import { MailerService } from '@nestjs-modules/mailer';
import { I18nService } from 'nestjs-i18n';

@Injectable()
export class MailService {
  constructor(
    private mailerService: MailerService,
    private i18n: I18nService,
  ) {}

  /**
   * 驗證 URL hostname 是否在允許清單內
   */
  private validateUrl(url: string): void {
    const allowedHosts = process.env.ALLOWED_RESET_HOSTS;
    if (!allowedHosts) return;

    const allowed = allowedHosts.split(',').map((h) => h.trim());
    const { hostname } = new URL(url);
    if (!allowed.includes(hostname)) {
      throw new Error(`Reset URL hostname "${hostname}" is not allowed`);
    }
  }

  private getLocale(lang?: string): string {
    const supported = ['en', 'zh-TW'];
    if (lang && supported.includes(lang)) return lang;
    if (lang === 'zh') return 'zh-TW';
    return 'en';
  }

  /**
   * 發送密碼重置 email
   */
  async sendPasswordResetEmail(
    email: string,
    name: string | null,
    resetToken: string,
    resetUrl: string,
    ipAddress?: string,
    lang?: string,
  ): Promise<void> {
    const locale = this.getLocale(lang);
    this.validateUrl(resetUrl);
    const url = `${resetUrl}?token=${resetToken}`;
    const unknown = this.i18n.translate('common.unknown', { lang: locale });

    await this.mailerService.sendMail({
      to: email,
      subject: this.i18n.translate('email.passwordReset.subject', {
        lang: locale,
      }),
      template: `./${locale}/password-reset`,
      context: {
        name: name || email,
        url,
        ipAddress: ipAddress || unknown,
        expiresIn: locale === 'zh-TW' ? '30 分鐘' : '30 minutes',
        timestamp: new Date().toLocaleString(
          locale === 'zh-TW' ? 'zh-TW' : 'en-US',
          {
            timeZone: locale === 'zh-TW' ? 'Asia/Taipei' : 'UTC',
          },
        ),
      },
    });
  }

  /**
   * 發送密碼變更通知 email
   */
  async sendPasswordChangedEmail(
    email: string,
    name: string | null,
    ipAddress?: string,
    lang?: string,
  ): Promise<void> {
    const locale = this.getLocale(lang);
    const unknown = this.i18n.translate('common.unknown', { lang: locale });

    await this.mailerService.sendMail({
      to: email,
      subject: this.i18n.translate('email.passwordChanged.subject', {
        lang: locale,
      }),
      template: `./${locale}/password-changed`,
      context: {
        name: name || email,
        ipAddress: ipAddress || unknown,
        timestamp: new Date().toLocaleString(
          locale === 'zh-TW' ? 'zh-TW' : 'en-US',
          {
            timeZone: locale === 'zh-TW' ? 'Asia/Taipei' : 'UTC',
          },
        ),
      },
    });
  }

  /**
   * 發送個人資料更新通知 email
   */
  async sendProfileUpdatedEmail(
    email: string,
    name: string | null,
    changes: string[],
    ipAddress?: string,
    lang?: string,
  ): Promise<void> {
    const locale = this.getLocale(lang);
    const unknown = this.i18n.translate('common.unknown', { lang: locale });

    await this.mailerService.sendMail({
      to: email,
      subject: this.i18n.translate('email.profileUpdated.subject', {
        lang: locale,
      }),
      template: `./${locale}/profile-updated`,
      context: {
        name: name || email,
        changes,
        ipAddress: ipAddress || unknown,
        timestamp: new Date().toLocaleString(
          locale === 'zh-TW' ? 'zh-TW' : 'en-US',
          {
            timeZone: locale === 'zh-TW' ? 'Asia/Taipei' : 'UTC',
          },
        ),
      },
    });
  }

  /**
   * 發送雙因素認證驗證碼 email
   */
  async sendTwoFactorCode(
    email: string,
    name: string,
    code: string,
    expiryMinutes: number,
    purpose: string,
    ipAddress?: string,
    lang?: string,
  ): Promise<void> {
    const locale = this.getLocale(lang);
    const unknown = this.i18n.translate('common.unknown', { lang: locale });

    const subjectKey =
      {
        LOGIN: 'email.twoFactorCode.login',
        ENABLE: 'email.twoFactorCode.enable',
        DISABLE: 'email.twoFactorCode.disable',
      }[purpose] || 'email.twoFactorCode.default';

    await this.mailerService.sendMail({
      to: email,
      subject: this.i18n.translate(subjectKey, { lang: locale }),
      template: `./${locale}/two-factor-code`,
      context: {
        name,
        code,
        expiryMinutes,
        purpose,
        ipAddress: ipAddress || unknown,
        timestamp: new Date().toLocaleString(
          locale === 'zh-TW' ? 'zh-TW' : 'en-US',
          {
            timeZone: locale === 'zh-TW' ? 'Asia/Taipei' : 'UTC',
          },
        ),
      },
    });
  }

  /**
   * 發送帳號鎖定通知 email
   */
  async sendAccountLockedEmail(
    email: string,
    name: string | null,
    lockoutMinutes: number,
    ipAddress?: string,
    lang?: string,
  ): Promise<void> {
    const locale = this.getLocale(lang);
    const unknown = this.i18n.translate('common.unknown', { lang: locale });

    await this.mailerService.sendMail({
      to: email,
      subject: this.i18n.translate('email.accountLocked.subject', {
        lang: locale,
      }),
      template: `./${locale}/account-locked`,
      context: {
        name: name || email,
        lockoutMinutes,
        ipAddress: ipAddress || unknown,
        timestamp: new Date().toLocaleString(
          locale === 'zh-TW' ? 'zh-TW' : 'en-US',
          {
            timeZone: locale === 'zh-TW' ? 'Asia/Taipei' : 'UTC',
          },
        ),
      },
    });
  }

  /**
   * 發送會話撤銷通知 email
   */
  async sendSessionRevokedEmail(
    email: string,
    userName: string | null,
    sessionInfo: {
      deviceInfo?: string;
      browser?: string;
      os?: string;
      ipAddress?: string;
      location?: string;
    },
    revokedBy: {
      email: string;
      name?: string;
    },
    reason: string,
    customMessage?: string,
    lang?: string,
  ): Promise<void> {
    const locale = this.getLocale(lang);
    const unknown = this.i18n.translate('common.unknown', { lang: locale });

    await this.mailerService.sendMail({
      to: email,
      subject:
        locale === 'zh-TW'
          ? '您的登入會話已被終止'
          : 'Your Session Has Been Terminated',
      template: `./${locale}/session-revoked`,
      context: {
        userName: userName || email,
        deviceInfo: sessionInfo.deviceInfo || unknown,
        browser: sessionInfo.browser,
        os: sessionInfo.os,
        ipAddress: sessionInfo.ipAddress,
        location: sessionInfo.location,
        revokedBy: revokedBy.email,
        revokedByName: revokedBy.name || revokedBy.email,
        reason,
        customMessage,
        timestamp: new Date().toLocaleString(
          locale === 'zh-TW' ? 'zh-TW' : 'en-US',
          {
            timeZone: locale === 'zh-TW' ? 'Asia/Taipei' : 'UTC',
          },
        ),
        supportEmail: process.env.SUPPORT_EMAIL || 'support@example.com',
      },
    });
  }

  /**
   * 發送批量會話撤銷通知 email
   */
  async sendBatchSessionsRevokedEmail(
    email: string,
    userName: string | null,
    sessions: Array<{
      deviceInfo?: string;
      browser?: string;
      ipAddress?: string;
      lastUsedAt: Date;
    }>,
    revokedBy: {
      email: string;
      name?: string;
    },
    reason: string,
    customMessage?: string,
    lang?: string,
  ): Promise<void> {
    const locale = this.getLocale(lang);

    const formattedSessions = sessions.map((s) => ({
      ...s,
      lastUsedAt: s.lastUsedAt.toLocaleString(
        locale === 'zh-TW' ? 'zh-TW' : 'en-US',
        {
          timeZone: locale === 'zh-TW' ? 'Asia/Taipei' : 'UTC',
        },
      ),
    }));

    await this.mailerService.sendMail({
      to: email,
      subject:
        locale === 'zh-TW'
          ? `您的 ${sessions.length} 個登入會話已被終止`
          : `${sessions.length} of Your Sessions Have Been Terminated`,
      template: `./${locale}/sessions-batch-revoked`,
      context: {
        userName: userName || email,
        sessionCount: sessions.length,
        sessions: formattedSessions,
        revokedBy: revokedBy.email,
        revokedByName: revokedBy.name || revokedBy.email,
        reason,
        customMessage,
        timestamp: new Date().toLocaleString(
          locale === 'zh-TW' ? 'zh-TW' : 'en-US',
          {
            timeZone: locale === 'zh-TW' ? 'Asia/Taipei' : 'UTC',
          },
        ),
        supportEmail: process.env.SUPPORT_EMAIL || 'support@example.com',
      },
    });
  }
}
