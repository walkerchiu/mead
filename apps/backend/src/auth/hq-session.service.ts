import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from '../prisma/prisma.service';
import { MailService } from '../mail/mail.service';
import { AuditLogService } from '../audit-log/audit-log.service';
import { CacheService } from '../cache/cache.service';
import { NotificationService } from '../notification/notification.service';
import { RequestContextService } from '../common/request-context/request-context.service';
import { logger } from '../common/services/logger.service';
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
  RecentActivity,
} from './hq-session.types';

@Injectable()
export class HQSessionService {
  constructor(
    private prisma: PrismaService,
    private config: ConfigService,
    private mailService: MailService,
    private auditLogService: AuditLogService,
    private cacheService: CacheService,
    private notificationService: NotificationService,
    private requestContext: RequestContextService,
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
    const data = sessions.map((session) => {
      const status = this.getSessionStatus(session);
      return {
        ...session,
        status,
        isActive: status === SessionStatus.ACTIVE,
      };
    });

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

    const status = this.getSessionStatus(session);
    return {
      ...session,
      status,
      isActive: status === SessionStatus.ACTIVE,
    };
  }

  /**
   * 取得會話統計數據
   */
  async getSessionStatistics(timeRange?: {
    start: Date;
    end: Date;
  }): Promise<SessionStatistics> {
    // 如果沒有 timeRange，嘗試從快取讀取
    if (!timeRange) {
      const cached =
        await this.cacheService.getCachedSessionStats<SessionStatistics>();
      if (cached) {
        logger.debug('[HQSessionService] Cache HIT for session statistics');
        return cached;
      }
      logger.debug('[HQSessionService] Cache MISS for session statistics');
    }

    const now = new Date();

    // 今天開始時間（00:00:00）
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // 基礎查詢條件
    const baseWhere: { createdAt?: { gte: Date; lte: Date } } = {};
    if (timeRange) {
      baseWhere.createdAt = {
        gte: timeRange.start,
        lte: timeRange.end,
      };
    }

    // 並行查詢
    const [
      totalActive,
      totalRevoked,
      totalExpired,
      allSessions,
      todayLogins,
      todayRevocations,
    ] = await Promise.all([
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
              accessScopes: true,
            },
          },
        },
      }),
      // 今日登入統計
      this.prisma.session.count({
        where: {
          createdAt: { gte: today },
        },
      }),
      // 今日撤銷統計
      this.prisma.session.count({
        where: {
          revokedAt: { gte: today, not: null },
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
          lastActivity: session.lastUsedAt,
        });
      }
      const userStat = byUserMap.get(key);
      userStat.count++;
      // 更新最後活動時間（取最新的）
      if (session.lastUsedAt > userStat.lastActivity) {
        userStat.lastActivity = session.lastUsedAt;
      }
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

    // 按 Scope 統計
    const byScopeMap = new Map<
      string,
      { count: number; activeCount: number }
    >();
    allSessions.forEach((session) => {
      const scopes = (session.user.accessScopes as string[]) || [];
      scopes.forEach((scope) => {
        if (!byScopeMap.has(scope)) {
          byScopeMap.set(scope, { count: 0, activeCount: 0 });
        }
        const scopeStat = byScopeMap.get(scope);
        scopeStat.count++;
        // 檢查是否為活躍會話
        if (!session.revokedAt && session.expiresAt > now) {
          scopeStat.activeCount++;
        }
      });
    });

    // 查詢最近活動（最近 20 個創建或撤銷的會話）
    const recentSessionsPromise = this.prisma.session.findMany({
      where: baseWhere,
      include: {
        user: {
          select: {
            id: true,
            name: true,
          },
        },
      },
      orderBy: [{ createdAt: 'desc' }],
      take: 20,
    });

    const recentRevocationsPromise = this.prisma.session.findMany({
      where: {
        ...baseWhere,
        revokedAt: { not: null },
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
          },
        },
      },
      orderBy: [{ revokedAt: 'desc' }],
      take: 10,
    });

    const [recentSessions, recentRevocations] = await Promise.all([
      recentSessionsPromise,
      recentRevocationsPromise,
    ]);

    // 組合最近活動
    const recentActivities: RecentActivity[] = [];

    // 添加最近創建的會話
    recentSessions.slice(0, 10).forEach((session) => {
      recentActivities.push({
        sessionId: session.id,
        userId: session.userId,
        userName: session.user.name,
        activityType: 'LOGIN',
        timestamp: session.createdAt,
        details: {
          deviceInfo: session.deviceInfo,
          ipAddress: session.ipAddress,
          location: session.location,
        },
      });
    });

    // 添加最近撤銷的會話
    recentRevocations.forEach((session) => {
      recentActivities.push({
        sessionId: session.id,
        userId: session.userId,
        userName: session.user.name,
        activityType: 'REVOKE',
        timestamp: session.revokedAt,
        details: {
          revokedMethod: session.revokedMethod,
          revokedReason: session.revokedReason,
        },
      });
    });

    // 按時間排序並取前 20 個
    recentActivities.sort(
      (a, b) => b.timestamp.getTime() - a.timestamp.getTime(),
    );

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

    const result = {
      totalActive,
      totalRevoked,
      totalExpired,
      todayLogins,
      todayRevocations,
      byUser: Array.from(byUserMap.values()).sort((a, b) => b.count - a.count),
      byDevice: Array.from(byDeviceMap.entries())
        .map(([deviceType, count]) => ({ deviceType, count }))
        .sort((a, b) => b.count - a.count),
      byLocation: Array.from(byLocationMap.entries())
        .map(([location, count]) => ({ location, count }))
        .sort((a, b) => b.count - a.count),
      byScope: Array.from(byScopeMap.entries())
        .map(([scope, { count, activeCount }]) => ({
          scope,
          count,
          activeCount,
        }))
        .sort((a, b) => b.count - a.count),
      recentActivities: recentActivities.slice(0, 20),
      averageSessionDuration: Math.round(averageSessionDuration / 1000 / 60), // 轉換為分鐘
    };

    // 如果沒有 timeRange，存入快取 (5 分鐘)
    if (!timeRange) {
      await this.cacheService.cacheSessionStats(result, 300);
    }

    return result;
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

  /**
   * 通過 refresh token hash 查找會話 ID
   * 優先查找活躍且未過期的會話,按最後使用時間排序
   */
  async getSessionIdByRefreshTokenHash(
    tokenHash: string,
  ): Promise<string | null> {
    const now = new Date();

    // 優先查找活躍且未過期的會話
    const session = await this.prisma.session.findFirst({
      where: {
        refreshTokenHash: tokenHash,
        revokedAt: null,
        expiresAt: { gt: now },
      },
      select: { id: true },
      orderBy: { lastUsedAt: 'desc' },
    });

    // 如果沒找到活躍會話,查找任何匹配的會話(可能已過期或撤銷)
    if (!session) {
      const fallbackSession = await this.prisma.session.findFirst({
        where: { refreshTokenHash: tokenHash },
        select: { id: true },
        orderBy: { lastUsedAt: 'desc' },
      });
      return fallbackSession?.id || null;
    }

    return session.id;
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
      hqId,
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
        revokedBy: hqId,
        revokedReason: reason,
        revokedMethod: RevokedMethod.HQ_FORCE,
      },
    });

    // 記錄審計日誌
    await this.auditLogService.create({
      requestId: this.requestContext.getRequestIdOrGenerate(),
      action: 'SESSION_REVOKED',
      entity: 'Session',
      entityId: sessionId,
      userId: hqId,
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
    if (sendNotification && hqId) {
      const hq = await this.prisma.user.findUnique({
        where: { id: hqId },
        select: { id: true, email: true, name: true },
      });

      if (hq) {
        await this.sendRevocationNotification({
          session: { ...session, user: session.user },
          hq,
          reason,
          customMessage: notificationMessage,
        });
      }
    }

    // 清除 Session 統計快取
    await this.cacheService.invalidateSessionStats();

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
      hqId,
      reason,
      sendNotification = false,
      notificationMessage,
      options,
      currentSessionId,
    } = params;

    // 建構查詢條件
    const where: {
      userId: string;
      revokedAt: null;
      id?: { not: string };
      deviceInfo?: { contains: string };
      ipAddress?: { contains: string };
      createdAt?: { lt: Date };
    } = {
      userId,
      revokedAt: null,
    };

    // 根據選項過濾
    if (options?.excludeCurrent && currentSessionId) {
      where.id = { not: currentSessionId };
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
        revokedBy: hqId,
        revokedReason: reason,
        revokedMethod: RevokedMethod.HQ_FORCE,
      },
    });

    // 記錄審計日誌
    await this.auditLogService.create({
      requestId: this.requestContext.getRequestIdOrGenerate(),
      action: 'USER_SESSIONS_REVOKED',
      entity: 'Session',
      userId: hqId,
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
      const hq = await this.prisma.user.findUnique({
        where: { id: hqId },
        select: { id: true, email: true, name: true },
      });

      if (hq && user) {
        await this.sendBatchRevocationNotification({
          user,
          hq,
          sessions: sessionsToRevoke,
          reason,
          customMessage: notificationMessage,
        });
      }
    }

    // 清除 Session 統計快取
    await this.cacheService.invalidateSessionStats();

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
      hqId,
      reason,
      sendNotification = false,
      notificationMessage,
      criteria,
      currentSessionId,
    } = params;

    const where: {
      revokedAt: null;
      id?: { in: string[] } | { notIn: string[] } | { not: string };
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
      // 從指定的會話列表中排除當前會話
      const filteredSessionIds = currentSessionId
        ? criteria.sessionIds.filter((id) => id !== currentSessionId)
        : criteria.sessionIds;

      if (filteredSessionIds.length > 0) {
        where.id = { in: filteredSessionIds };
      } else {
        // 如果過濾後沒有會話，直接返回
        return {
          success: true,
          revokedCount: 0,
          message: 'No sessions to revoke (current session excluded)',
          affectedSessionIds: [],
        };
      }
    } else if (currentSessionId) {
      // 沒有指定會話列表時，排除當前會話
      where.id = { not: currentSessionId };
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
        revokedBy: hqId,
        revokedReason: reason,
        revokedMethod: RevokedMethod.BATCH_REVOKE,
      },
    });

    // 記錄審計日誌
    await this.auditLogService.create({
      requestId: this.requestContext.getRequestIdOrGenerate(),
      action: 'BATCH_SESSIONS_REVOKED',
      entity: 'Session',
      userId: hqId,
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
      const hq = await this.prisma.user.findUnique({
        where: { id: hqId },
        select: { id: true, email: true, name: true },
      });

      if (hq) {
        for (const [, sessions] of Object.entries(sessionsByUser)) {
          const user = sessions[0].user;
          await this.sendBatchRevocationNotification({
            user,
            hq,
            sessions,
            reason,
            customMessage: notificationMessage,
          });
        }
      }
    }

    // 清除 Session 統計快取
    await this.cacheService.invalidateSessionStats();

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
    const { session, hq, reason, customMessage } = params;

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
          email: hq.email,
          name: hq.name,
        },
        reason,
        customMessage,
        userLanguage,
      );

      logger.info(
        '[SessionNotification] Single session revocation email sent',
        {
          userId: session.userId,
          sessionId: session.id,
          hqId: hq.id,
        },
      );
    } catch (error) {
      logger.error('[SessionNotification] Failed to send email', {
        error: error instanceof Error ? error.message : String(error),
        userId: session.userId,
        sessionId: session.id,
      });
    }

    // 系統通知
    if (
      this.config.get<string>('PUSH_NOTIFY_SESSION_REVOKED', 'true') !== 'false'
    ) {
      try {
        await this.notificationService.createLocalizedNotification(
          session.userId,
          'WARNING',
          'SESSION_REVOKED',
          [
            hq.name || hq.email,
            session.browser || session.deviceInfo || 'Unknown',
            reason,
          ],
          { event: 'SESSION_REVOKED', sessionId: session.id, revokedBy: hq.id },
        );
      } catch (error) {
        logger.error(
          '[SessionNotification] Failed to create system notification',
          {
            error: error instanceof Error ? error.message : String(error),
          },
        );
      }
    }
  }

  /**
   * 發送批量撤銷通知
   */
  private async sendBatchRevocationNotification(
    params: BatchSessionNotificationParams,
  ): Promise<void> {
    const { user, hq, sessions, reason, customMessage } = params;

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
          email: hq.email,
          name: hq.name,
        },
        reason,
        customMessage,
        userLanguage,
      );

      logger.info('[SessionNotification] Batch revocation email sent', {
        userId: user.id,
        sessionCount: sessions.length,
        hqId: hq.id,
      });
    } catch (error) {
      logger.error('[SessionNotification] Failed to send batch email', {
        error: error instanceof Error ? error.message : String(error),
        userId: user.id,
      });
    }

    // 系統通知
    if (
      this.config.get<string>('PUSH_NOTIFY_BATCH_SESSIONS_REVOKED', 'true') !==
      'false'
    ) {
      try {
        await this.notificationService.createLocalizedNotification(
          user.id,
          'WARNING',
          'BATCH_SESSIONS_REVOKED',
          [hq.name || hq.email, sessions.length, reason],
          {
            event: 'BATCH_SESSIONS_REVOKED',
            sessionCount: sessions.length,
            revokedBy: hq.id,
          },
        );
      } catch (error) {
        logger.error(
          '[SessionNotification] Failed to send batch notification',
          {
            error: error instanceof Error ? error.message : String(error),
            userId: user.id,
            sessionCount: sessions.length,
          },
        );
      }
    }
  }

  // ==========================================
  // Helper Functions
  // ==========================================

  /**
   * 獲取會話狀態
   * 根據 SESSION_TERMINOLOGY.md 規範：
   * - EXPIRED: revokedMethod = 'AUTO_EXPIRE' OR (revokedAt = null AND expiresAt <= now)
   * - REVOKED: revokedAt != null AND revokedMethod != 'AUTO_EXPIRE'
   * - ACTIVE: revokedAt = null AND expiresAt > now
   */
  private getSessionStatus(session: any): SessionStatus {
    const now = new Date();

    // EXPIRED: AUTO_EXPIRE 或 (未撤銷但已過期)
    if (session.revokedMethod === RevokedMethod.AUTO_EXPIRE) {
      return SessionStatus.EXPIRED;
    }
    if (!session.revokedAt && new Date(session.expiresAt) <= now) {
      return SessionStatus.EXPIRED;
    }

    // REVOKED: 已撤銷且非 AUTO_EXPIRE
    if (
      session.revokedAt &&
      session.revokedMethod !== RevokedMethod.AUTO_EXPIRE
    ) {
      return SessionStatus.REVOKED;
    }

    // ACTIVE: 未撤銷且未過期
    return SessionStatus.ACTIVE;
  }

  /**
   * 建構 Prisma where 子句
   */
  private buildWhereClause(filters: SessionFilters): any {
    const where: any = {};
    const now = new Date();

    // 統一用戶搜尋 (優先使用)
    if (filters.userSearch) {
      const searchTerm = filters.userSearch.trim();

      // 檢查是否為有效的 UUID 格式
      const uuidRegex =
        /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
      const isValidUuid = uuidRegex.test(searchTerm);

      // 使用頂層 OR 來搜尋 userId (Session 表欄位) 和 user.email/user.name (User 表欄位)
      where.OR = [
        // 只有當搜尋詞是有效 UUID 時才搜尋 userId (精確匹配)
        ...(isValidUuid
          ? [
              {
                userId: searchTerm,
              },
            ]
          : []),
        // 搜尋 user email（使用 is 語法確保正確處理 relation）
        {
          user: {
            is: {
              email: {
                contains: searchTerm,
                mode: 'insensitive' as const,
              },
            },
          },
        },
        // 搜尋 user name（使用 is 語法確保正確處理 relation）
        {
          user: {
            is: {
              name: {
                contains: searchTerm,
                mode: 'insensitive' as const,
              },
            },
          },
        },
      ];
    }
    // 向後兼容：如果沒有 userSearch 但有 userId，使用舊邏輯
    else if (filters.userId) {
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

    // 撤銷方式篩選 (只在已撤銷狀態下有效)
    if (filters.revokedMethod) {
      where.revokedMethod = filters.revokedMethod;
      // 確保只篩選已撤銷的會話
      where.revokedAt = { not: null };
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
  lastActivity: Date;
}
