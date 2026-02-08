import { Injectable, Inject, forwardRef } from '@nestjs/common';
import { Cron } from '@nestjs/schedule';
import { PrismaService } from '../prisma/prisma.service';
import { GeoIPService } from '../common/services/geoip.service';
import { AuditLogService } from '../audit-log/audit-log.service';
import { DistributedLockService } from '../cache/distributed-lock.service';
import { CronJobMonitorService } from '../cron-monitoring/cron-job-monitor.service';
import { RequestContextService } from '../common/request-context/request-context.service';
import { CronJobStatus } from '@prisma/client';
import { logger } from '../common/services/logger.service';
import { RevokedMethod } from './hq-session.types';
import * as crypto from 'crypto';
import { UAParser } from 'ua-parser-js';

export interface SessionInfo {
  id: string;
  deviceInfo: string;
  deviceType?: string;
  browser?: string;
  os?: string;
  ipAddress?: string;
  location?: string;
  lastUsedAt: Date;
  createdAt: Date;
  expiresAt: Date;
  isCurrent: boolean;
}

@Injectable()
export class SessionManagementService {
  private readonly REFRESH_TOKEN_EXPIRES_DAYS = 7;

  constructor(
    private prisma: PrismaService,
    private geoipService: GeoIPService,
    private auditLogService: AuditLogService,
    private distributedLockService: DistributedLockService,
    @Inject(forwardRef(() => CronJobMonitorService))
    private cronMonitorService: CronJobMonitorService,
    private requestContext: RequestContextService,
  ) {}

  /**
   * 創建新的 session
   */
  async createSession(
    userId: string,
    refreshToken: string,
    userAgent?: string,
    ipAddress?: string,
  ): Promise<string> {
    // Hash refresh token
    const refreshTokenHash = crypto
      .createHash('sha256')
      .update(refreshToken)
      .digest('hex');

    // 解析 User-Agent
    const parser = new UAParser();
    const parsedUA = userAgent ? parser.setUA(userAgent).getResult() : null;

    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + this.REFRESH_TOKEN_EXPIRES_DAYS);

    // 獲取地理位置
    let location: string | null = null;
    if (ipAddress) {
      try {
        // 檢查是否為本地 IP
        const isLocalIP =
          ipAddress === '127.0.0.1' ||
          ipAddress === '::1' ||
          ipAddress === 'localhost' ||
          ipAddress.startsWith('192.168.') ||
          ipAddress.startsWith('10.') ||
          ipAddress.startsWith('172.');

        if (isLocalIP) {
          location = 'Local';
        } else {
          location = await this.geoipService.getLocationString(ipAddress);
        }
      } catch (error) {
        logger.debug('[SessionManagement] Failed to get location', {
          ipAddress,
          error: error instanceof Error ? error.message : 'Unknown error',
        });
      }
    }

    const session = await this.prisma.session.create({
      data: {
        userId,
        refreshTokenHash,
        deviceInfo: userAgent || 'Unknown',
        deviceType: parsedUA?.device.type || 'desktop',
        browser: parsedUA?.browser.name || null,
        os: parsedUA?.os.name || null,
        ipAddress,
        location,
        expiresAt,
      },
    });

    logger.debug('[SessionManagement] Session created', {
      userId,
      sessionId: session.id,
      deviceType: session.deviceType,
      browser: session.browser,
    });

    // 清理過期 sessions
    await this.cleanupExpiredSessions(userId);

    return session.id;
  }

  /**
   * 更新 session 最後使用時間
   * @param oldRefreshToken 舊的 refresh token（用於找到 session）
   * @param newRefreshToken 新的 refresh token（用於更新 session 的 hash）
   */
  async updateSessionActivity(
    oldRefreshToken: string,
    newRefreshToken?: string,
  ): Promise<void> {
    const oldHash = crypto
      .createHash('sha256')
      .update(oldRefreshToken)
      .digest('hex');

    // 如果提供了新的 refresh token，則更新 hash；否則只更新 lastUsedAt
    const newHash = newRefreshToken
      ? crypto.createHash('sha256').update(newRefreshToken).digest('hex')
      : undefined;

    await this.prisma.session.updateMany({
      where: {
        refreshTokenHash: oldHash,
        revokedAt: null,
      },
      data: {
        ...(newHash && { refreshTokenHash: newHash }),
        lastUsedAt: new Date(),
      },
    });
  }

  /**
   * 使用 refresh token 撤銷會話（用於登出）
   */
  async revokeSessionByRefreshToken(
    userId: string,
    refreshToken: string,
    reason: string = RevokedMethod.USER_LOGOUT,
  ): Promise<boolean> {
    try {
      logger.debug('[SessionManagement] Attempting to revoke session', {
        userId,
        hasRefreshToken: !!refreshToken,
        refreshTokenLength: refreshToken?.length,
      });

      const refreshTokenHash = crypto
        .createHash('sha256')
        .update(refreshToken)
        .digest('hex');

      logger.debug('[SessionManagement] Looking for session', {
        userId,
        refreshTokenHash: refreshTokenHash.substring(0, 10) + '...',
      });

      // 先檢查該用戶的所有活躍會話
      const allSessions = await this.prisma.session.findMany({
        where: {
          userId,
          revokedAt: null,
        },
        select: {
          id: true,
          refreshTokenHash: true,
        },
      });

      logger.debug('[SessionManagement] Found active sessions', {
        userId,
        count: allSessions.length,
        sessionHashes: allSessions.map(
          (s) => s.refreshTokenHash.substring(0, 10) + '...',
        ),
      });

      const session = await this.prisma.session.findFirst({
        where: {
          userId,
          refreshTokenHash,
          revokedAt: null,
        },
      });

      if (!session) {
        logger.warn('[SessionManagement] Session not found for revocation', {
          userId,
          refreshTokenHash: refreshTokenHash.substring(0, 10) + '...',
          allSessionsCount: allSessions.length,
        });
        return false;
      }

      await this.prisma.session.update({
        where: { id: session.id },
        data: {
          revokedAt: new Date(),
          revokedMethod: reason,
        },
      });

      logger.info('[SessionManagement] Session revoked by refresh token', {
        userId,
        sessionId: session.id,
        reason,
      });

      // 創建審計日誌
      try {
        logger.debug('[SessionManagement] Creating SESSION_REVOKED audit log', {
          sessionId: session.id,
          hasAuditLogService: !!this.auditLogService,
        });

        await this.auditLogService.create({
          requestId: this.requestContext.getRequestIdOrGenerate(),
          userId,
          action: 'SESSION_REVOKED',
          entity: 'Session',
          entityId: session.id,
          status: 'SUCCESS',
          details: {
            reason,
            revokedMethod: reason,
            deviceInfo: session.deviceInfo,
            ipAddress: session.ipAddress,
            revokedVia: 'logout', // 標記這是通過登出撤銷的
          },
        });

        logger.info('[SessionManagement] SESSION_REVOKED audit log created', {
          sessionId: session.id,
        });
      } catch (error) {
        logger.error('[SessionManagement] Failed to create audit log', {
          sessionId: session.id,
          error: error instanceof Error ? error.message : 'Unknown error',
          stack: error instanceof Error ? error.stack : undefined,
        });
        // 不拋出錯誤，因為審計日誌失敗不應該影響主要操作
      }

      return true;
    } catch (error) {
      logger.error('[SessionManagement] Failed to revoke session', {
        userId,
        error: error instanceof Error ? error.message : 'Unknown error',
      });
      return false;
    }
  }

  /**
   * 撤銷特定 session（登出單一裝置）
   */
  async revokeSession(sessionId: string, userId: string): Promise<boolean> {
    try {
      const session = await this.prisma.session.findFirst({
        where: {
          id: sessionId,
          userId,
          revokedAt: null,
        },
      });

      if (!session) {
        return false;
      }

      await this.prisma.session.update({
        where: { id: sessionId },
        data: {
          revokedAt: new Date(),
        },
      });

      // ✅ Refresh token 現在只存在 Session 表，不需要清除 User 表

      logger.info('[SessionManagement] Session revoked', {
        userId,
        sessionId,
      });

      return true;
    } catch (error) {
      logger.error('[SessionManagement] Failed to revoke session', {
        error,
        sessionId,
        userId,
      });
      return false;
    }
  }

  /**
   * 撤銷所有其他 sessions（登出所有其他裝置）
   */
  async revokeOtherSessions(
    currentRefreshToken: string,
    userId: string,
  ): Promise<number> {
    const currentTokenHash = crypto
      .createHash('sha256')
      .update(currentRefreshToken)
      .digest('hex');

    const result = await this.prisma.session.updateMany({
      where: {
        userId,
        refreshTokenHash: { not: currentTokenHash },
        revokedAt: null,
      },
      data: {
        revokedAt: new Date(),
      },
    });

    logger.info('[SessionManagement] Other sessions revoked', {
      userId,
      count: result.count,
    });

    return result.count;
  }

  /**
   * 撤銷所有 sessions（用於密碼重設、帳號安全事件）
   */
  async revokeAllSessions(userId: string): Promise<number> {
    const result = await this.prisma.session.updateMany({
      where: {
        userId,
        revokedAt: null,
      },
      data: {
        revokedAt: new Date(),
      },
    });

    // ✅ Refresh token 現在只存在 Session 表，不需要清除 User 表

    logger.info('[SessionManagement] All sessions revoked', {
      userId,
      count: result.count,
    });

    return result.count;
  }

  /**
   * 查詢用戶的活躍 sessions
   */
  async getActiveSessions(
    userId: string,
    currentRefreshToken?: string,
  ): Promise<SessionInfo[]> {
    let currentTokenHash: string | undefined;
    if (currentRefreshToken) {
      currentTokenHash = crypto
        .createHash('sha256')
        .update(currentRefreshToken)
        .digest('hex');
    }

    const sessions = await this.prisma.session.findMany({
      where: {
        userId,
        revokedAt: null,
        expiresAt: { gt: new Date() },
      },
      orderBy: {
        lastUsedAt: 'desc',
      },
    });

    return sessions.map((session) => ({
      id: session.id,
      deviceInfo: session.deviceInfo || 'Unknown',
      deviceType: session.deviceType || undefined,
      browser: session.browser || undefined,
      os: session.os || undefined,
      ipAddress: session.ipAddress || undefined,
      location: session.location || undefined,
      lastUsedAt: session.lastUsedAt,
      createdAt: session.createdAt,
      expiresAt: session.expiresAt,
      isCurrent: session.refreshTokenHash === currentTokenHash,
    }));
  }

  /**
   * 驗證 session 是否有效
   */
  async isSessionValid(refreshToken: string, userId: string): Promise<boolean> {
    const refreshTokenHash = crypto
      .createHash('sha256')
      .update(refreshToken)
      .digest('hex');

    const session = await this.prisma.session.findFirst({
      where: {
        userId,
        refreshTokenHash,
        revokedAt: null,
        expiresAt: { gt: new Date() },
      },
    });

    return !!session;
  }

  /**
   * 清理過期的 sessions
   * 根據 SESSION_TERMINOLOGY.md 規範：
   * - 不刪除會話（保留作為審計記錄）
   * - 標記過期會話為 AUTO_EXPIRE
   * - 記錄 SESSION_EXPIRED audit log
   */
  private async cleanupExpiredSessions(userId: string): Promise<void> {
    const now = new Date();

    // 找出所有過期但尚未被標記的會話
    const expiredSessions = await this.prisma.session.findMany({
      where: {
        userId,
        expiresAt: { lt: now },
        revokedAt: null, // 只處理尚未被標記的會話
      },
    });

    // 標記過期會話並記錄審計日誌
    for (const session of expiredSessions) {
      // 更新會話狀態
      await this.prisma.session.update({
        where: { id: session.id },
        data: {
          revokedAt: now,
          revokedMethod: RevokedMethod.AUTO_EXPIRE,
          revokedReason: 'Session expired automatically',
        },
      });

      // 記錄審計日誌
      await this.auditLogService.create({
        requestId: this.requestContext.getRequestIdOrGenerate(),
        userId: session.userId,
        action: 'SESSION_EXPIRED',
        entity: 'Session',
        entityId: session.id,
        status: 'SUCCESS',
        details: {
          reason: 'Session expired automatically',
          revokedMethod: RevokedMethod.AUTO_EXPIRE,
          expiresAt: session.expiresAt,
          deviceInfo: session.deviceInfo,
          ipAddress: session.ipAddress,
        },
      });

      logger.debug('[SessionManagement] Session expired and marked', {
        sessionId: session.id,
        userId: session.userId,
        expiresAt: session.expiresAt,
      });
    }

    if (expiredSessions.length > 0) {
      logger.info('[SessionManagement] Cleaned up expired sessions', {
        userId,
        count: expiredSessions.length,
      });
    }
  }

  /**
   * Cron Job: 定期掃描並標記所有過期會話
   * 執行頻率: 每 6 小時
   * 根據 SESSION_TERMINOLOGY.md 規範
   *
   * 使用分散式鎖防止多實例重複執行
   */
  @Cron('0 */6 * * *', {
    name: 'cleanup-expired-sessions',
    timeZone: 'Asia/Taipei',
  })
  async handleExpiredSessionsCleanup(): Promise<void> {
    const jobName = 'cleanup-expired-sessions';
    const jobType = 'cleanup';
    const instanceId = process.env.INSTANCE_ID || 'default';

    // 記錄執行開始
    const executionId = await this.cronMonitorService.startExecution({
      jobName,
      jobType,
      instanceId,
    });

    try {
      // 使用分散式鎖執行任務
      // TTL: 600 秒（10 分鐘），足夠執行整個清理任務
      const lockAcquired = await this.distributedLockService.executeWithLock(
        'cron:cleanup-expired-sessions',
        async () => {
          const now = new Date();

          logger.info('[Cron] Starting expired sessions cleanup job', {
            timestamp: now.toISOString(),
            executionId,
          });

          // 找出所有過期但尚未被標記的會話
          const expiredSessions = await this.prisma.session.findMany({
            where: {
              expiresAt: { lt: now },
              revokedAt: null, // 只處理尚未被標記的會話
            },
            // 批量處理，避免記憶體問題
            take: 1000,
          });

          logger.info('[Cron] Found expired sessions to process', {
            count: expiredSessions.length,
          });

          let successCount = 0;
          let errorCount = 0;

          // 批量處理：使用 transaction 提升效能
          const batchSize = 100;
          for (let i = 0; i < expiredSessions.length; i += batchSize) {
            const batch = expiredSessions.slice(i, i + batchSize);

            try {
              await this.prisma.$transaction(
                async (tx) => {
                  for (const session of batch) {
                    // 更新會話狀態
                    await tx.session.update({
                      where: { id: session.id },
                      data: {
                        revokedAt: now,
                        revokedMethod: RevokedMethod.AUTO_EXPIRE,
                        revokedReason: 'Session expired automatically',
                      },
                    });

                    // 記錄審計日誌
                    await this.auditLogService.create({
                      requestId: this.requestContext.getRequestIdOrGenerate(),
                      userId: session.userId,
                      action: 'SESSION_EXPIRED',
                      entity: 'Session',
                      entityId: session.id,
                      status: 'SUCCESS',
                      details: {
                        reason: 'Session expired automatically',
                        revokedMethod: RevokedMethod.AUTO_EXPIRE,
                        expiresAt: session.expiresAt,
                        deviceInfo: session.deviceInfo,
                        ipAddress: session.ipAddress,
                      },
                    });

                    successCount++;
                  }
                },
                {
                  maxWait: 5000, // 最多等待 5 秒獲取鎖
                  timeout: 30000, // 30 秒超時
                },
              );

              logger.debug('[Cron] Processed batch successfully', {
                batchStart: i,
                batchSize: batch.length,
              });
            } catch (error) {
              errorCount += batch.length;
              logger.error('[Cron] Failed to process batch', {
                batchStart: i,
                batchSize: batch.length,
                error: error instanceof Error ? error.message : 'Unknown error',
              });
            }
          }

          logger.info('[Cron] Expired sessions cleanup job completed', {
            totalProcessed: expiredSessions.length,
            successCount,
            errorCount,
            timestamp: new Date().toISOString(),
          });

          // 記錄執行成功
          await this.cronMonitorService.completeExecution({
            executionId,
            status: CronJobStatus.SUCCESS,
            processedCount: expiredSessions.length,
            successCount,
            errorCount,
            details: {
              batchSize: 100,
              maxRecords: 1000,
            },
          });

          return true;
        },
        600, // TTL: 10 分鐘
      );

      // 如果無法獲取鎖，記錄為 SKIPPED
      if (!lockAcquired) {
        await this.cronMonitorService.recordSkipped({
          jobName,
          jobType,
          instanceId,
          reason:
            'Could not acquire distributed lock (another instance is running)',
        });
      }
    } catch (error) {
      logger.error('[Cron] Expired sessions cleanup job failed', {
        error: error instanceof Error ? error.message : 'Unknown error',
        stack: error instanceof Error ? error.stack : undefined,
        executionId,
      });

      // 記錄執行失敗
      await this.cronMonitorService.completeExecution({
        executionId,
        status: CronJobStatus.FAILED,
        errorMessage: error instanceof Error ? error.message : 'Unknown error',
        errorStack: error instanceof Error ? error.stack : undefined,
      });

      // 檢查告警
      await this.cronMonitorService.checkAndAlert(executionId);

      // 不拋出錯誤，讓下次 Cron 繼續執行
    }
  }
}
