import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { MailService } from '../mail/mail.service';
import { AuditLogService } from '../audit-log/audit-log.service';
import { logger } from '../common/services/logger.service';
import * as crypto from 'crypto';
import {
  SessionFilters,
  SessionStatus,
  SessionRevocationResult,
  SessionStatistics,
  RevokedMethod,
  SessionNotificationParams,
  BatchSessionNotificationParams,
  RevokeSessionParams,
  RevokeUserSessionsParams,
  RevokeBatchSessionsParams,
  RevokeOtherDevicesParams,
  SessionListResult,
  SessionDetail,
} from './admin-session.types';

@Injectable()
export class AdminSessionService {
  constructor(
    private prisma: PrismaService,
    private mailService: MailService,
    private auditLogService: AuditLogService,
  ) {}

  // ==========================================
  // Query Functions
  // ==========================================

  /**
   * 查詢所有會話（頁碼分頁）
   */
  async listAllSessions(
    filters: SessionFilters = {},
    page: number = 1,
    limit: number = 20,
  ): Promise<SessionListResult> {
    const take = Math.min(limit, 100);
    const skip = (page - 1) * take;
    const where = this.buildWhereClause(filters);

    const [sessions, totalCount] = await Promise.all([
      this.prisma.session.findMany({
        where,
        include: {
          user: {
            select: {
              id: true,
              email: true,
              name: true,
              accessScopes: true,
            },
          },
          revoker: {
            select: {
              id: true,
              email: true,
              name: true,
            },
          },
        },
        orderBy: { lastUsedAt: 'desc' },
        skip,
        take,
      }),
      this.prisma.session.count({ where }),
    ]);

    // 計算分頁資訊
    const totalPages = Math.ceil(totalCount / take);
    const hasNextPage = page < totalPages;
    const hasPreviousPage = page > 1;

    // 處理資料
    const data = sessions.map((session) => ({
      ...session,
      status: this.getSessionStatus(session),
    }));

    return {
      data,
      pageInfo: {
        hasNextPage,
        hasPreviousPage,
        currentPage: page,
        totalPages,
        limit: take,
        totalCount,
      },
    };
  }

  /**
   * 查詢特定用戶的會話（頁碼分頁）
   */
  async listUserSessions(
    userId: string,
    filters: SessionFilters = {},
    page: number = 1,
    limit: number = 20,
  ): Promise<SessionListResult> {
    return this.listAllSessions({ ...filters, userId }, page, limit);
  }

  /**
   * 取得會話詳情
   */
  async getSessionDetails(sessionId: string): Promise<SessionDetail> {
    const session = await this.prisma.session.findUnique({
      where: { id: sessionId },
      include: {
        user: {
          select: {
            id: true,
            email: true,
            name: true,
            accessScopes: true,
          },
        },
        revoker: {
          select: {
            id: true,
            email: true,
            name: true,
          },
        },
      },
    });

    if (!session) {
      throw new NotFoundException('Session not found');
    }

    return session;
  }

  /**
   * 取得會話統計數據
   */
  async getSessionStatistics(timeRange?: {
    start: Date;
    end: Date;
  }): Promise<SessionStatistics> {
    const now = new Date();

    // 基礎查詢條件
    const baseWhere: { createdAt?: { gte: Date; lte: Date } } = {};
    if (timeRange) {
      baseWhere.createdAt = {
        gte: timeRange.start,
        lte: timeRange.end,
      };
    }

    // 並行查詢
    const [totalActive, totalRevoked, totalExpired, allSessions] =
      await Promise.all([
        // 活躍會話
        this.prisma.session.count({
          where: {
            ...baseWhere,
            revokedAt: null,
            expiresAt: { gt: now },
          },
        }),
        // 已撤銷會話
        this.prisma.session.count({
          where: {
            ...baseWhere,
            revokedAt: { not: null },
          },
        }),
        // 已過期會話
        this.prisma.session.count({
          where: {
            ...baseWhere,
            revokedAt: null,
            expiresAt: { lte: now },
          },
        }),
        // 所有會話（用於統計）
        this.prisma.session.findMany({
          where: baseWhere,
          include: {
            user: {
              select: {
                id: true,
                email: true,
                name: true,
              },
            },
          },
        }),
      ]);

    // 按用戶統計
    const byUserMap = new Map<string, UserSessionCount>();
    allSessions.forEach((session) => {
      const key = session.userId;
      if (!byUserMap.has(key)) {
        byUserMap.set(key, {
          userId: session.user.id,
          userName: session.user.name || 'Unknown',
          email: session.user.email,
          count: 0,
        });
      }
      byUserMap.get(key).count++;
    });

    // 按設備類型統計
    const byDeviceMap = new Map<string, number>();
    allSessions.forEach((session) => {
      const deviceType = session.deviceType || 'unknown';
      byDeviceMap.set(deviceType, (byDeviceMap.get(deviceType) || 0) + 1);
    });

    // 按位置統計
    const byLocationMap = new Map<string, number>();
    allSessions.forEach((session) => {
      const location = session.location || 'unknown';
      byLocationMap.set(location, (byLocationMap.get(location) || 0) + 1);
    });

    // 計算平均會話持續時間
    const durations = allSessions
      .filter((s) => s.revokedAt || s.expiresAt < now)
      .map((s) => {
        const endTime = s.revokedAt || (s.expiresAt < now ? s.expiresAt : now);
        return endTime.getTime() - s.createdAt.getTime();
      });
    const averageSessionDuration =
      durations.length > 0
        ? durations.reduce((a, b) => a + b, 0) / durations.length
        : 0;

    return {
      totalActive,
      totalRevoked,
      totalExpired,
      byUser: Array.from(byUserMap.values()).sort((a, b) => b.count - a.count),
      byDevice: Array.from(byDeviceMap.entries())
        .map(([deviceType, count]) => ({ deviceType, count }))
        .sort((a, b) => b.count - a.count),
      byLocation: Array.from(byLocationMap.entries())
        .map(([location, count]) => ({ location, count }))
        .sort((a, b) => b.count - a.count),
      averageSessionDuration: Math.round(averageSessionDuration / 1000 / 60), // 轉換為分鐘
    };
  }

  /**
   * 取得活躍會話數量
   */
  async getActiveSessionCount(
    groupBy?: 'user' | 'device' | 'location',
  ): Promise<number | Record<string, number>> {
    const now = new Date();

    if (!groupBy) {
      return this.prisma.session.count({
        where: {
          revokedAt: null,
          expiresAt: { gt: now },
        },
      });
    }

    const sessions = await this.prisma.session.findMany({
      where: {
        revokedAt: null,
        expiresAt: { gt: now },
      },
      include:
        groupBy === 'user'
          ? {
              user: {
                select: { id: true, email: true, name: true },
              },
            }
          : undefined,
    });

    if (groupBy === 'user') {
      const grouped = new Map<string, number>();
      sessions.forEach((s) => {
        const key = s.userId;
        grouped.set(key, (grouped.get(key) || 0) + 1);
      });
      return Object.fromEntries(grouped);
    }

    if (groupBy === 'device') {
      const grouped = new Map<string, number>();
      sessions.forEach((s) => {
        const key = s.deviceType || 'unknown';
        grouped.set(key, (grouped.get(key) || 0) + 1);
      });
      return Object.fromEntries(grouped);
    }

    if (groupBy === 'location') {
      const grouped = new Map<string, number>();
      sessions.forEach((s) => {
        const key = s.location || 'unknown';
        grouped.set(key, (grouped.get(key) || 0) + 1);
      });
      return Object.fromEntries(grouped);
    }
  }

  // ==========================================
  // Revoke Functions
  // ==========================================

  /**
   * 撤銷單一會話
   */
  async revokeSession(
    params: RevokeSessionParams,
  ): Promise<SessionRevocationResult> {
    const {
      sessionId,
      adminId,
      reason,
      sendNotification = true,
      notificationMessage,
    } = params;

    const session = await this.prisma.session.findUnique({
      where: { id: sessionId },
      include: {
        user: {
          select: {
            id: true,
            email: true,
            name: true,
            profile: {
              select: {
                language: true,
              },
            },
          },
        },
      },
    });

    if (!session) {
      throw new NotFoundException('Session not found');
    }

    if (session.revokedAt) {
      throw new BadRequestException('Session already revoked');
    }

    // 更新會話狀態
    await this.prisma.session.update({
      where: { id: sessionId },
      data: {
        revokedAt: new Date(),
        revokedBy: adminId,
        revokedReason: reason,
        revokedMethod: RevokedMethod.ADMIN_FORCE,
      },
    });

    // 記錄審計日誌
    await this.auditLogService.create({
      requestId: crypto.randomUUID(),
      action: 'SESSION_REVOKED',
      entity: 'Session',
      entityId: sessionId,
      userId: adminId,
      status: 'SUCCESS',
      details: {
        targetUserId: session.userId,
        targetUserEmail: session.user.email,
        reason,
        sendNotification,
        notificationMessage,
        deviceInfo: session.deviceInfo,
        ipAddress: session.ipAddress,
      },
    });

    // 發送通知（如果啟用）
    if (sendNotification && adminId) {
      const admin = await this.prisma.user.findUnique({
        where: { id: adminId },
        select: { id: true, email: true, name: true },
      });

      if (admin) {
        await this.sendRevocationNotification({
          session: { ...session, user: session.user },
          admin,
          reason,
          customMessage: notificationMessage,
        });
      }
    }

    return {
      success: true,
      revokedCount: 1,
      message: 'Session revoked successfully',
      affectedSessionIds: [sessionId],
    };
  }

  /**
   * 撤銷特定用戶的所有會話
   */
  async revokeUserSessions(
    params: RevokeUserSessionsParams,
  ): Promise<SessionRevocationResult> {
    const {
      userId,
      adminId,
      reason,
      sendNotification = false,
      notificationMessage,
      options,
    } = params;

    // 建構查詢條件
    const where: {
      userId: string;
      revokedAt: null;
      deviceInfo?: { contains: string };
      ipAddress?: { contains: string };
      createdAt?: { lt: Date };
    } = {
      userId,
      revokedAt: null,
    };

    // 根據選項過濾
    if (options?.excludeCurrent) {
      // Note: excludeCurrent 需要在 resolver 層面處理，這裡暫不實現
    }

    if (options?.deviceInfo) {
      where.deviceInfo = { contains: options.deviceInfo };
    }

    if (options?.ipAddress) {
      where.ipAddress = { contains: options.ipAddress };
    }

    if (options?.olderThan) {
      where.createdAt = { lt: options.olderThan };
    }

    // 查詢要撤銷的會話
    const sessionsToRevoke = await this.prisma.session.findMany({
      where,
      include: {
        user: {
          select: {
            id: true,
            email: true,
            name: true,
            profile: {
              select: {
                language: true,
              },
            },
          },
        },
      },
    });

    const revokedCount = sessionsToRevoke.length;

    if (revokedCount === 0) {
      return {
        success: true,
        revokedCount: 0,
        message: 'No sessions to revoke',
        affectedSessionIds: [],
      };
    }

    const sessionIds = sessionsToRevoke.map((s) => s.id);

    // 批量更新會話
    await this.prisma.session.updateMany({
      where: {
        id: { in: sessionIds },
      },
      data: {
        revokedAt: new Date(),
        revokedBy: adminId,
        revokedReason: reason,
        revokedMethod: RevokedMethod.ADMIN_FORCE,
      },
    });

    // 記錄審計日誌
    await this.auditLogService.create({
      requestId: crypto.randomUUID(),
      action: 'USER_SESSIONS_REVOKED',
      entity: 'Session',
      userId: adminId,
      status: 'SUCCESS',
      details: {
        targetUserId: userId,
        revokedCount,
        reason,
        sendNotification,
        options,
      },
    });

    // 發送通知（如果啟用）
    if (sendNotification && revokedCount > 0) {
      const user = sessionsToRevoke[0].user;
      const admin = await this.prisma.user.findUnique({
        where: { id: adminId },
        select: { id: true, email: true, name: true },
      });

      if (admin && user) {
        await this.sendBatchRevocationNotification({
          user,
          admin,
          sessions: sessionsToRevoke,
          reason,
          customMessage: notificationMessage,
        });
      }
    }

    return {
      success: true,
      revokedCount,
      message: `Successfully revoked ${revokedCount} session(s)`,
      affectedSessionIds: sessionIds,
    };
  }

  /**
   * 批量撤銷會話
   */
  async revokeBatchSessions(
    params: RevokeBatchSessionsParams,
  ): Promise<SessionRevocationResult> {
    const {
      adminId,
      reason,
      sendNotification = false,
      notificationMessage,
      criteria,
    } = params;

    const where: {
      revokedAt: null;
      id?: { in: string[] };
      userId?: { in: string[] };
      ipAddress?: { contains: string };
      deviceInfo?: { contains: string };
      createdAt?: { lt: Date };
      lastUsedAt?: { lt: Date };
    } = {
      revokedAt: null,
    };

    // 指定的會話 IDs
    if (criteria.sessionIds && criteria.sessionIds.length > 0) {
      where.id = { in: criteria.sessionIds };
    }

    // 指定的用戶 IDs
    if (criteria.userIds && criteria.userIds.length > 0) {
      where.userId = { in: criteria.userIds };
    }

    // IP 地址模式匹配
    if (criteria.ipAddress) {
      where.ipAddress = { contains: criteria.ipAddress };
    }

    // 設備資訊匹配
    if (criteria.deviceInfo) {
      where.deviceInfo = { contains: criteria.deviceInfo };
    }

    // 創建時間早於
    if (criteria.createdBefore) {
      where.createdAt = { lt: criteria.createdBefore };
    }

    // 最後使用時間早於（不活躍）
    if (criteria.inactiveSince) {
      where.lastUsedAt = { lt: criteria.inactiveSince };
    }

    const sessionsToRevoke = await this.prisma.session.findMany({
      where,
      include: {
        user: {
          select: {
            id: true,
            email: true,
            name: true,
            profile: {
              select: {
                language: true,
              },
            },
          },
        },
      },
    });

    const revokedCount = sessionsToRevoke.length;

    if (revokedCount === 0) {
      return {
        success: true,
        revokedCount: 0,
        message: 'No sessions match the criteria',
        affectedSessionIds: [],
      };
    }

    const sessionIds = sessionsToRevoke.map((s) => s.id);

    // 批量更新
    await this.prisma.session.updateMany({
      where: {
        id: { in: sessionIds },
      },
      data: {
        revokedAt: new Date(),
        revokedBy: adminId,
        revokedReason: reason,
        revokedMethod: RevokedMethod.BATCH_REVOKE,
      },
    });

    // 記錄審計日誌
    await this.auditLogService.create({
      requestId: crypto.randomUUID(),
      action: 'BATCH_SESSIONS_REVOKED',
      entity: 'Session',
      userId: adminId,
      status: 'SUCCESS',
      details: {
        criteria,
        revokedCount,
        reason,
        sendNotification,
      },
    });

    // 發送通知（如果啟用）
    if (sendNotification) {
      // 按用戶分組
      const sessionsByUser = this.groupSessionsByUser(sessionsToRevoke);
      const admin = await this.prisma.user.findUnique({
        where: { id: adminId },
        select: { id: true, email: true, name: true },
      });

      if (admin) {
        for (const [, sessions] of Object.entries(sessionsByUser)) {
          const user = sessions[0].user;
          await this.sendBatchRevocationNotification({
            user,
            admin,
            sessions,
            reason,
            customMessage: notificationMessage,
          });
        }
      }
    }

    return {
      success: true,
      revokedCount,
      message: `Successfully revoked ${revokedCount} session(s)`,
      affectedSessionIds: sessionIds,
    };
  }

  /**
   * 撤銷用戶的其他設備（保留當前會話）
   */
  async revokeOtherDevices(
    params: RevokeOtherDevicesParams,
  ): Promise<SessionRevocationResult> {
    const {
      userId,
      currentSessionId,
      reason = '用戶主動登出其他設備',
    } = params;

    const where = {
      userId,
      id: { not: currentSessionId },
      revokedAt: null,
    };

    const sessionsToRevoke = await this.prisma.session.findMany({
      where,
    });

    const revokedCount = sessionsToRevoke.length;

    if (revokedCount === 0) {
      return {
        success: true,
        revokedCount: 0,
        message: 'No other sessions to revoke',
        affectedSessionIds: [],
      };
    }

    const sessionIds = sessionsToRevoke.map((s) => s.id);

    // 批量更新
    await this.prisma.session.updateMany({
      where: {
        id: { in: sessionIds },
      },
      data: {
        revokedAt: new Date(),
        revokedBy: userId, // 用戶自己撤銷
        revokedReason: reason,
        revokedMethod: RevokedMethod.USER_LOGOUT,
      },
    });

    return {
      success: true,
      revokedCount,
      message: `Successfully revoked ${revokedCount} other session(s)`,
      affectedSessionIds: sessionIds,
    };
  }

  // ==========================================
  // Notification Functions
  // ==========================================

  /**
   * 發送單一會話撤銷通知
   */
  private async sendRevocationNotification(
    params: SessionNotificationParams,
  ): Promise<void> {
    const { session, admin, reason, customMessage } = params;

    try {
      // 從用戶 profile 獲取偏好語言，預設為 'en'
      const userLanguage = session.user.profile?.language || 'en';

      // 郵件通知
      await this.mailService.sendSessionRevokedEmail(
        session.user.email,
        session.user.name,
        {
          deviceInfo: session.deviceInfo,
          browser: session.browser,
          os: session.os,
          ipAddress: session.ipAddress,
          location: session.location,
        },
        {
          email: admin.email,
          name: admin.name,
        },
        reason,
        customMessage,
        userLanguage,
      );

      logger.info(
        '[SessionNotification] Single session revocation notification sent',
        {
          userId: session.userId,
          sessionId: session.id,
          adminId: admin.id,
        },
      );
    } catch (error) {
      logger.error('[SessionNotification] Failed to send notification', {
        error: error instanceof Error ? error.message : String(error),
        userId: session.userId,
        sessionId: session.id,
      });
    }
  }

  /**
   * 發送批量撤銷通知
   */
  private async sendBatchRevocationNotification(
    params: BatchSessionNotificationParams,
  ): Promise<void> {
    const { user, admin, sessions, reason, customMessage } = params;

    try {
      // 從用戶 profile 獲取偏好語言，預設為 'en'
      const userLanguage = user.profile?.language || 'en';

      await this.mailService.sendBatchSessionsRevokedEmail(
        user.email,
        user.name,
        sessions.map((s) => ({
          deviceInfo: s.deviceInfo,
          browser: s.browser,
          ipAddress: s.ipAddress,
          lastUsedAt: s.lastUsedAt,
        })),
        {
          email: admin.email,
          name: admin.name,
        },
        reason,
        customMessage,
        userLanguage,
      );

      logger.info('[SessionNotification] Batch revocation notification sent', {
        userId: user.id,
        sessionCount: sessions.length,
        adminId: admin.id,
      });
    } catch (error) {
      logger.error('[SessionNotification] Failed to send batch notification', {
        error: error instanceof Error ? error.message : String(error),
        userId: user.id,
        sessionCount: sessions.length,
      });
    }
  }

  // ==========================================
  // Helper Functions
  // ==========================================

  /**
   * 獲取會話狀態
   */
  private getSessionStatus(session: any): SessionStatus {
    if (session.revokedAt) {
      return SessionStatus.REVOKED;
    }
    if (new Date(session.expiresAt) < new Date()) {
      return SessionStatus.EXPIRED;
    }
    return SessionStatus.ACTIVE;
  }

  /**
   * 建構 Prisma where 子句
   */
  private buildWhereClause(filters: SessionFilters): any {
    const where: any = {};
    const now = new Date();

    if (filters.userId) {
      where.userId = filters.userId;
    }

    if (filters.ipAddress) {
      where.ipAddress = { contains: filters.ipAddress, mode: 'insensitive' };
    }

    if (filters.deviceType) {
      where.deviceType = filters.deviceType;
    }

    // 支援 deviceInfo 篩選（前端傳來的字段）
    if (filters.deviceInfo) {
      where.deviceInfo = { contains: filters.deviceInfo, mode: 'insensitive' };
    }

    if (filters.browser) {
      where.browser = { contains: filters.browser, mode: 'insensitive' };
    }

    if (filters.location) {
      where.location = { contains: filters.location, mode: 'insensitive' };
    }

    if (filters.status) {
      switch (filters.status) {
        case SessionStatus.ACTIVE:
          where.revokedAt = null;
          where.expiresAt = { gt: now };
          break;
        case SessionStatus.EXPIRED:
          where.revokedAt = null;
          where.expiresAt = { lte: now };
          break;
        case SessionStatus.REVOKED:
          where.revokedAt = { not: null };
          break;
      }
    }

    if (filters.createdAfter) {
      where.createdAt = { ...where.createdAt, gte: filters.createdAfter };
    }

    if (filters.createdBefore) {
      where.createdAt = { ...where.createdAt, lte: filters.createdBefore };
    }

    if (filters.lastUsedAfter) {
      where.lastUsedAt = { gte: filters.lastUsedAfter };
    }

    return where;
  }

  /**
   * 按用戶分組會話
   */
  private groupSessionsByUser(sessions: any[]): Record<string, any[]> {
    return sessions.reduce(
      (acc, session) => {
        if (!acc[session.userId]) {
          acc[session.userId] = [];
        }
        acc[session.userId].push(session);
        return acc;
      },
      {} as Record<string, any[]>,
    );
  }
}

// ==========================================
// Type Definitions for Missing Interfaces
// ==========================================

interface UserSessionCount {
  userId: string;
  userName: string;
  email: string;
  count: number;
}
