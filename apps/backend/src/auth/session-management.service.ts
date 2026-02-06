import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { GeoIPService } from '../common/services/geoip.service';
import { AuditLogService } from '../audit-log/audit-log.service';
import { logger } from '../common/services/logger.service';
import { RevokedMethod } from './admin-session.types';
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
   */
  async updateSessionActivity(refreshToken: string): Promise<void> {
    const refreshTokenHash = crypto
      .createHash('sha256')
      .update(refreshToken)
      .digest('hex');

    await this.prisma.session.updateMany({
      where: {
        refreshTokenHash,
        revokedAt: null,
      },
      data: {
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
          requestId: crypto.randomUUID(), // 為系統操作生成唯一 ID
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

      // 同時清除 user 的 refresh token（如果是當前 session）
      const user = await this.prisma.user.findUnique({
        where: { id: userId },
        select: { refreshToken: true },
      });

      if (user?.refreshToken) {
        const userTokenHash = crypto
          .createHash('sha256')
          .update(user.refreshToken)
          .digest('hex');

        if (userTokenHash === session.refreshTokenHash) {
          await this.prisma.user.update({
            where: { id: userId },
            data: { refreshToken: null },
          });
        }
      }

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

    // 同時清除 user 的 refresh token
    await this.prisma.user.update({
      where: { id: userId },
      data: { refreshToken: null },
    });

    logger.info('[SessionManagement] All sessions revoked', {
      userId,
      count: result.count,
    });

    return result.count;
  }

  /**
   * 查詢使用者的活躍 sessions
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
   */
  private async cleanupExpiredSessions(userId: string): Promise<void> {
    await this.prisma.session.deleteMany({
      where: {
        userId,
        OR: [{ expiresAt: { lt: new Date() } }, { revokedAt: { not: null } }],
      },
    });
  }
}
