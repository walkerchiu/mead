import { Injectable, Logger } from '@nestjs/common';
import { MailerService } from '@nestjs-modules/mailer';
import { ConfigService } from '@nestjs/config';
import { I18nService } from 'nestjs-i18n';
import { PrismaService } from '../prisma/prisma.service';
import { GraphMailService } from './graph-mail.service';
import * as Handlebars from 'handlebars';
import * as fs from 'fs';
import * as path from 'path';

@Injectable()
export class MailService {
  private readonly logger = new Logger(MailService.name);
  private readonly provider: 'smtp' | 'graph';
  private readonly appUrl: string;

  constructor(
    private mailerService: MailerService,
    private i18n: I18nService,
    private config: ConfigService,
    private prisma: PrismaService,
    private graphMailService: GraphMailService,
  ) {
    this.provider =
      this.config.get<string>('MAIL_PROVIDER', 'graph') === 'smtp'
        ? 'smtp'
        : 'graph';

    if (this.provider === 'graph' && !this.graphMailService.isConfigured()) {
      this.logger.warn(
        'MAIL_PROVIDER=graph but Graph API not configured, falling back to SMTP',
      );
      this.provider = 'smtp';
    }

    this.logger.log(`Mail provider: ${this.provider}`);

    this.appUrl = this.config
      .get<string>('APP_URL', 'http://localhost:3000')
      .replace(/\/$/, '');

    // 註冊 Handlebars helper
    Handlebars.registerHelper('eq', (a: any, b: any) => a === b);
  }

  /**
   * 檢查通知開關是否開啟
   * 環境變數為 'false' 時關閉，其餘情況（含未設定）視為開啟
   */
  private isNotificationEnabled(key: string): boolean {
    return this.config.get<string>(key, 'true') !== 'false';
  }

  /**
   * 檢查用戶是否啟用了 Email 通知（查詢 NotificationPreferences.enableEmail）
   * 核心郵件（密碼重設、2FA）不受此設定影響
   */
  private async isUserEmailEnabled(email: string): Promise<boolean> {
    try {
      const user = await this.prisma.user.findUnique({
        where: { email },
        select: { id: true },
      });
      if (!user) return true; // 用戶不存在時預設允許（避免阻擋）

      const prefs = await this.prisma.notificationPreferences.findUnique({
        where: { userId: user.id },
        select: { enableEmail: true },
      });
      // 未建立偏好時預設啟用
      return prefs?.enableEmail ?? true;
    } catch {
      return true; // 查詢失敗時預設允許
    }
  }

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
   * 渲染 Handlebars 模板為 HTML
   */
  private renderTemplate(templatePath: string, context: any): string {
    const fullPath = path.join(__dirname, 'templates', `${templatePath}.hbs`);
    const source = fs.readFileSync(fullPath, 'utf-8');
    const template = Handlebars.compile(source);
    return template(context);
  }

  /**
   * 統一發送郵件方法 — 根據 provider 選擇 SMTP 或 Graph API
   */
  private async sendMail(options: {
    to: string;
    subject: string;
    template: string;
    context: any;
  }): Promise<void> {
    // 自動注入 appUrl 和 dashboardUrl 到所有模板
    options.context.appUrl = this.appUrl;
    options.context.dashboardUrl = `${this.appUrl}/dashboard`;

    if (this.provider === 'graph') {
      const html = this.renderTemplate(options.template, options.context);
      await this.graphMailService.sendMail({
        to: options.to,
        subject: options.subject,
        html,
      });
    } else {
      await this.mailerService.sendMail({
        to: options.to,
        subject: options.subject,
        template: options.template,
        context: options.context,
      });
    }
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

    await this.sendMail({
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
    if (!this.isNotificationEnabled('MAIL_NOTIFY_PASSWORD_CHANGED')) {
      this.logger.debug('Password changed notification disabled, skipping');
      return;
    }
    if (!(await this.isUserEmailEnabled(email))) {
      this.logger.debug(
        `User ${email} has email notifications disabled, skipping`,
      );
      return;
    }
    const locale = this.getLocale(lang);
    const unknown = this.i18n.translate('common.unknown', { lang: locale });

    await this.sendMail({
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
    if (!this.isNotificationEnabled('MAIL_NOTIFY_PROFILE_UPDATED')) {
      this.logger.debug('Profile updated notification disabled, skipping');
      return;
    }
    if (!(await this.isUserEmailEnabled(email))) {
      this.logger.debug(
        `User ${email} has email notifications disabled, skipping`,
      );
      return;
    }
    const locale = this.getLocale(lang);
    const unknown = this.i18n.translate('common.unknown', { lang: locale });

    await this.sendMail({
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

    await this.sendMail({
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
    if (!this.isNotificationEnabled('MAIL_NOTIFY_ACCOUNT_LOCKED')) {
      this.logger.debug('Account locked notification disabled, skipping');
      return;
    }
    if (!(await this.isUserEmailEnabled(email))) {
      this.logger.debug(
        `User ${email} has email notifications disabled, skipping`,
      );
      return;
    }
    const locale = this.getLocale(lang);
    const unknown = this.i18n.translate('common.unknown', { lang: locale });

    await this.sendMail({
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
    if (!this.isNotificationEnabled('MAIL_NOTIFY_SESSION_REVOKED')) {
      this.logger.debug('Session revoked notification disabled, skipping');
      return;
    }
    if (!(await this.isUserEmailEnabled(email))) {
      this.logger.debug(
        `User ${email} has email notifications disabled, skipping`,
      );
      return;
    }
    const locale = this.getLocale(lang);
    const unknown = this.i18n.translate('common.unknown', { lang: locale });

    await this.sendMail({
      to: email,
      subject: this.i18n.translate('email.sessionRevoked.subject', {
        lang: locale,
      }),
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
    if (!this.isNotificationEnabled('MAIL_NOTIFY_BATCH_SESSIONS_REVOKED')) {
      this.logger.debug(
        'Batch sessions revoked notification disabled, skipping',
      );
      return;
    }
    if (!(await this.isUserEmailEnabled(email))) {
      this.logger.debug(
        `User ${email} has email notifications disabled, skipping`,
      );
      return;
    }
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

    await this.sendMail({
      to: email,
      subject: this.i18n.translate('email.batchSessionsRevoked.subject', {
        lang: locale,
        args: { count: sessions.length },
      }),
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

  /**
   * 發送個人存取權杖通知 email
   */
  async sendPatNotificationEmail(
    email: string,
    userName: string | null,
    token: {
      name: string;
      prefix: string;
      scopes: string[];
      expiresAt?: Date;
    },
    event: 'created' | 'revoked',
    lang?: string,
  ): Promise<void> {
    if (!this.isNotificationEnabled('MAIL_NOTIFY_PAT')) {
      this.logger.debug('PAT notification disabled, skipping');
      return;
    }
    if (!(await this.isUserEmailEnabled(email))) {
      this.logger.debug(
        `User ${email} has email notifications disabled, skipping`,
      );
      return;
    }
    const locale = this.getLocale(lang);
    const subjectKey =
      event === 'created' ? 'email.pat.created' : 'email.pat.revoked';

    await this.sendMail({
      to: email,
      subject: this.i18n.translate(subjectKey, { lang: locale }),
      template: `./${locale}/pat-notification`,
      context: {
        userName: userName || email,
        isCreated: event === 'created',
        tokenName: token.name,
        tokenPrefix: token.prefix,
        scopes: token.scopes.join(', '),
        expiresAt: token.expiresAt
          ? token.expiresAt.toLocaleString(
              locale === 'zh-TW' ? 'zh-TW' : 'en-US',
              { timeZone: locale === 'zh-TW' ? 'Asia/Taipei' : 'UTC' },
            )
          : undefined,
        timestamp: new Date().toLocaleString(
          locale === 'zh-TW' ? 'zh-TW' : 'en-US',
          { timeZone: locale === 'zh-TW' ? 'Asia/Taipei' : 'UTC' },
        ),
        supportEmail: process.env.SUPPORT_EMAIL || 'support@example.com',
      },
    });
  }
}
