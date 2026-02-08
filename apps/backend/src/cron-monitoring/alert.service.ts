/**
 * Cron Job 告警服務
 * 負責發送 Cron Job 失敗/超時告警
 */

import { Injectable } from '@nestjs/common';
import { CronJobStatus } from '@prisma/client';
import { MailerService } from '@nestjs-modules/mailer';
import { NotificationService } from '../notification/notification.service';
import { CacheService } from '../cache/cache.service';
import { PrismaService } from '../prisma/prisma.service';
import { AccessScope } from '../common/enums/access-scope.enum';
import { logger } from '../common/services/logger.service';
import {
  AlertParams,
  AlertMethod,
  AlertRecipient,
} from './cron-job-monitor.types';

@Injectable()
export class AlertService {
  // 告警去重緩存 TTL（5 分鐘）
  private readonly ALERT_DEDUP_TTL = 300;

  constructor(
    private readonly mailerService: MailerService,
    private readonly notificationService: NotificationService,
    private readonly cacheService: CacheService,
    private readonly prisma: PrismaService,
  ) {}

  /**
   * 發送告警
   * 根據配置的告警方式發送通知
   */
  async sendAlert(
    params: AlertParams,
    config: {
      alertMethods?: string[];
      alertRecipients?: AlertRecipient[];
    },
  ): Promise<void> {
    const {
      jobName,
      jobType: _jobType,
      status,
      executionId: _executionId,
      errorMessage: _errorMessage,
      duration: _duration,
      consecutiveFailures: _consecutiveFailures,
    } = params;

    try {
      // 檢查是否需要去重（避免短時間內重複告警）
      const dedupKey = `alert:${jobName}:${status}`;
      const shouldSkip = await this.shouldSkipAlert(dedupKey);

      if (shouldSkip) {
        logger.info('[AlertService] Skipping duplicate alert', {
          jobName,
          status,
        });
        return;
      }

      // 設定去重緩存
      await this.setAlertDedup(dedupKey);

      // 解析告警方式（預設使用系統通知）
      const methods = config.alertMethods || ['system'];
      const recipients = config.alertRecipients || [];

      logger.info('[AlertService] Sending alert', {
        jobName,
        status,
        methods,
        recipientsCount: recipients.length,
      });

      // 並行發送所有告警
      const alertPromises: Promise<void>[] = [];

      for (const method of methods) {
        switch (method) {
          case 'email':
            alertPromises.push(
              this.sendEmailAlert(
                params,
                recipients.filter((r) => r.type === AlertMethod.EMAIL),
              ),
            );
            break;
          case 'system':
            alertPromises.push(
              this.sendSystemNotification(
                params,
                recipients.filter((r) => r.type === AlertMethod.SYSTEM),
              ),
            );
            break;
          case 'webhook':
            alertPromises.push(
              this.sendWebhookAlert(
                params,
                recipients.filter((r) => r.type === AlertMethod.WEBHOOK),
              ),
            );
            break;
        }
      }

      await Promise.allSettled(alertPromises);

      logger.info('[AlertService] Alert sent successfully', {
        jobName,
        status,
        methodsCount: methods.length,
      });
    } catch (error) {
      logger.error('[AlertService] Failed to send alert', {
        jobName,
        error: error instanceof Error ? error.message : String(error),
      });
      // 不拋出錯誤，避免影響主流程
    }
  }

  /**
   * 發送 Email 告警
   */
  private async sendEmailAlert(
    params: AlertParams,
    recipients: AlertRecipient[],
  ): Promise<void> {
    if (recipients.length === 0) {
      logger.debug('[AlertService] No email recipients configured');
      return;
    }

    const {
      jobName,
      status,
      errorMessage: _errorMessage,
      consecutiveFailures: _consecutiveFailures,
    } = params;

    try {
      const subject = this.buildEmailSubject(jobName, status);
      const html = this.buildEmailContent(params);

      // 發送給所有收件人
      for (const recipient of recipients) {
        await this.mailerService.sendMail({
          to: recipient.value,
          subject,
          html,
        });
      }

      logger.info('[AlertService] Email alerts sent', {
        jobName,
        recipientsCount: recipients.length,
      });
    } catch (error) {
      logger.error('[AlertService] Failed to send email alert', {
        jobName,
        error: error instanceof Error ? error.message : String(error),
      });
    }
  }

  /**
   * 發送系統通知
   */
  private async sendSystemNotification(
    params: AlertParams,
    recipients: AlertRecipient[],
  ): Promise<void> {
    const {
      jobName,
      jobType,
      status,
      errorMessage,
      consecutiveFailures: _consecutiveFailures,
    } = params;

    try {
      const title = this.buildNotificationTitle(jobName, status);
      const message = this.buildNotificationMessage(params);

      let targetUserIds: string[] = [];

      // 如果沒有指定收件人或收件人為 'HQ'，查詢所有管理員
      if (
        recipients.length === 0 ||
        recipients.some((r) => r.value === 'HQ' || r.value === 'system')
      ) {
        // 查詢所有具有 HQ_SCOPE 的用戶
        const hqUsers = await this.prisma.user.findMany({
          where: {
            accessScopes: {
              has: AccessScope.HQ_SCOPE,
            },
            deletedAt: null, // 排除已刪除的用戶
          },
          select: {
            id: true,
          },
        });

        targetUserIds = hqUsers.map((u) => u.id);

        logger.info('[AlertService] Found hq users for notification', {
          jobName,
          hqCount: targetUserIds.length,
        });
      } else {
        // 使用指定的收件人
        targetUserIds = recipients.map((r) => r.value);
      }

      // 如果沒有找到任何收件人，記錄警告並退出
      if (targetUserIds.length === 0) {
        logger.warn(
          '[AlertService] No recipients found for system notification',
          {
            jobName,
          },
        );
        return;
      }

      // 發送給所有目標用戶
      for (const userId of targetUserIds) {
        try {
          await this.notificationService.createNotification({
            userId,
            type: status === CronJobStatus.FAILED ? 'ERROR' : 'WARNING',
            title,
            message,
            data: {
              jobName,
              jobType,
              status,
              errorMessage,
            },
          });
        } catch (error) {
          logger.error('[AlertService] Failed to send notification to user', {
            jobName,
            userId,
            error: error instanceof Error ? error.message : String(error),
          });
          // 繼續發送給其他用戶
        }
      }

      logger.info('[AlertService] System notifications sent', {
        jobName,
        recipientsCount: targetUserIds.length,
      });
    } catch (error) {
      logger.error('[AlertService] Failed to send system notification', {
        jobName,
        error: error instanceof Error ? error.message : String(error),
      });
    }
  }

  /**
   * 發送 Webhook 告警
   */
  private async sendWebhookAlert(
    params: AlertParams,
    recipients: AlertRecipient[],
  ): Promise<void> {
    if (recipients.length === 0) {
      logger.debug('[AlertService] No webhook recipients configured');
      return;
    }

    const {
      jobName,
      jobType,
      status,
      executionId,
      errorMessage,
      duration,
      consecutiveFailures,
    } = params;

    try {
      const payload = {
        jobName,
        jobType,
        status,
        executionId,
        errorMessage,
        duration,
        consecutiveFailures,
        timestamp: new Date().toISOString(),
      };

      // 發送到所有 Webhook URL
      for (const recipient of recipients) {
        try {
          const response = await fetch(recipient.value, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify(payload),
          });

          if (!response.ok) {
            throw new Error(`HTTP ${response.status}: ${response.statusText}`);
          }

          logger.debug('[AlertService] Webhook sent', {
            jobName,
            url: recipient.value,
          });
        } catch (error) {
          logger.error('[AlertService] Failed to send webhook', {
            jobName,
            url: recipient.value,
            error: error instanceof Error ? error.message : String(error),
          });
        }
      }

      logger.info('[AlertService] Webhook alerts sent', {
        jobName,
        webhooksCount: recipients.length,
      });
    } catch (error) {
      logger.error('[AlertService] Failed to send webhook alert', {
        jobName,
        error: error instanceof Error ? error.message : String(error),
      });
    }
  }

  /**
   * 構建 Email 主旨
   */
  private buildEmailSubject(jobName: string, status: CronJobStatus): string {
    const statusText = {
      [CronJobStatus.FAILED]: '失敗',
      [CronJobStatus.TIMEOUT]: '超時',
      [CronJobStatus.SKIPPED]: '跳過',
      [CronJobStatus.RUNNING]: '執行中',
      [CronJobStatus.SUCCESS]: '成功',
    };

    return `[Cron Job 告警] ${jobName} - ${statusText[status]}`;
  }

  /**
   * 構建 Email 內容
   */
  private buildEmailContent(params: AlertParams): string {
    const {
      jobName,
      jobType,
      status,
      executionId,
      errorMessage,
      duration,
      consecutiveFailures,
    } = params;

    const statusColor = {
      [CronJobStatus.FAILED]: '#dc3545',
      [CronJobStatus.TIMEOUT]: '#ffc107',
      [CronJobStatus.SKIPPED]: '#6c757d',
      [CronJobStatus.RUNNING]: '#17a2b8',
      [CronJobStatus.SUCCESS]: '#28a745',
    };

    return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <style>
    body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
    .container { max-width: 600px; margin: 0 auto; padding: 20px; }
    .header { background-color: ${statusColor[status]}; color: white; padding: 20px; border-radius: 5px 5px 0 0; }
    .content { background-color: #f9f9f9; padding: 20px; border-radius: 0 0 5px 5px; }
    .field { margin-bottom: 15px; }
    .label { font-weight: bold; color: #555; }
    .value { color: #333; }
    .error-box { background-color: #fff3cd; border-left: 4px solid #ffc107; padding: 10px; margin-top: 15px; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h2>Cron Job 告警通知</h2>
    </div>
    <div class="content">
      <div class="field">
        <span class="label">Job 名稱：</span>
        <span class="value">${jobName}</span>
      </div>
      <div class="field">
        <span class="label">Job 類型：</span>
        <span class="value">${jobType}</span>
      </div>
      <div class="field">
        <span class="label">執行狀態：</span>
        <span class="value" style="color: ${statusColor[status]}; font-weight: bold;">${status}</span>
      </div>
      <div class="field">
        <span class="label">執行 ID：</span>
        <span class="value">${executionId}</span>
      </div>
      ${duration ? `<div class="field"><span class="label">執行時長：</span><span class="value">${duration}ms</span></div>` : ''}
      ${consecutiveFailures ? `<div class="field"><span class="label">連續失敗次數：</span><span class="value">${consecutiveFailures}</span></div>` : ''}
      ${
        errorMessage
          ? `
      <div class="error-box">
        <strong>錯誤訊息：</strong><br>
        <pre style="white-space: pre-wrap; word-wrap: break-word;">${errorMessage}</pre>
      </div>
      `
          : ''
      }
      <div style="margin-top: 20px; padding-top: 20px; border-top: 1px solid #ddd;">
        <p style="color: #666; font-size: 12px;">此郵件由系統自動發送，請勿直接回覆。</p>
      </div>
    </div>
  </div>
</body>
</html>
    `;
  }

  /**
   * 構建系統通知標題
   */
  private buildNotificationTitle(
    jobName: string,
    status: CronJobStatus,
  ): string {
    const statusText = {
      [CronJobStatus.FAILED]: '執行失敗',
      [CronJobStatus.TIMEOUT]: '執行超時',
      [CronJobStatus.SKIPPED]: '執行跳過',
      [CronJobStatus.RUNNING]: '執行中',
      [CronJobStatus.SUCCESS]: '執行成功',
    };

    return `Cron Job ${statusText[status]}`;
  }

  /**
   * 構建系統通知內容
   */
  private buildNotificationMessage(params: AlertParams): string {
    const { jobName, errorMessage, consecutiveFailures } = params;

    let message = `Job「${jobName}」`;

    if (consecutiveFailures && consecutiveFailures > 1) {
      message += `已連續失敗 ${consecutiveFailures} 次`;
    }

    if (errorMessage) {
      message += `\n錯誤：${errorMessage.substring(0, 100)}${errorMessage.length > 100 ? '...' : ''}`;
    }

    return message;
  }

  /**
   * 檢查是否應該跳過告警（去重）
   */
  private async shouldSkipAlert(dedupKey: string): Promise<boolean> {
    try {
      const cached = await this.cacheService.get(dedupKey);
      return !!cached;
    } catch (error) {
      logger.error('[AlertService] Failed to check alert dedup', {
        dedupKey,
        error: error instanceof Error ? error.message : String(error),
      });
      return false;
    }
  }

  /**
   * 設定告警去重緩存
   */
  private async setAlertDedup(dedupKey: string): Promise<void> {
    try {
      await this.cacheService.set(dedupKey, 'true', this.ALERT_DEDUP_TTL);
    } catch (error) {
      logger.error('[AlertService] Failed to set alert dedup', {
        dedupKey,
        error: error instanceof Error ? error.message : String(error),
      });
    }
  }
}
