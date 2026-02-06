import { Resolver, Query, Mutation, Args, Int } from '@nestjs/graphql';
import { UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from './jwt-auth.guard';
import { PermissionGuard } from '../common/guards/permission.guard';
import { AdminSessionGuard } from './admin-session.guard';
import { CurrentUser } from './current-user.decorator';
import {
  RequiresPermission,
  RequiresAnyPermission,
} from '../common/decorators/requires-permission.decorator';
import { AdminSessionService } from './admin-session.service';
import {
  SessionType,
  PaginatedSessions,
  SessionStatisticsType,
  SessionFiltersInput,
  RevokeSessionInput,
  RevokeUserSessionsInput,
  BatchRevokeInput,
  RevokeOtherDevicesInput,
  RevokeResultType,
  SessionPaginationInput,
} from './admin-session-graphql.types';
import { JwtPayload } from './auth.types';
import { logger } from '../common/services/logger.service';

@Resolver()
@UseGuards(JwtAuthGuard, PermissionGuard)
export class AdminSessionResolver {
  constructor(private adminSessionService: AdminSessionService) {}

  /**
   * 查詢所有會話（管理員功能）
   * 需要權限：sessions:read_all
   */
  @Query(() => PaginatedSessions, {
    description: '查詢所有會話（管理員功能，支援分頁和過濾）',
  })
  @UseGuards(AdminSessionGuard)
  @RequiresPermission('sessions:read_all')
  async sessions(
    @Args('filters', { type: () => SessionFiltersInput, nullable: true })
    filters?: SessionFiltersInput,
    @Args('pagination', { type: () => SessionPaginationInput, nullable: true })
    pagination?: SessionPaginationInput,
  ): Promise<PaginatedSessions> {
    const page = pagination?.page || 1;
    const limit = pagination?.limit || 20;

    const result = await this.adminSessionService.listAllSessions(
      filters,
      page,
      limit,
    );

    return {
      data: result.data.map((session) => this.mapSessionToGraphQL(session)),
      pageInfo: result.pageInfo,
    };
  }

  /**
   * 查詢特定用戶的會話
   * 需要權限：sessions:read_user（查看他人）或 sessions:read（查看自己）
   */
  @Query(() => PaginatedSessions, {
    description: '查詢特定用戶的會話',
  })
  @UseGuards(AdminSessionGuard)
  @RequiresAnyPermission(['sessions:read_user', 'sessions:read'])
  async userSessions(
    @Args('userId', { type: () => String }) userId: string,
    @Args('filters', { type: () => SessionFiltersInput, nullable: true })
    filters?: SessionFiltersInput,
    @Args('pagination', { type: () => SessionPaginationInput, nullable: true })
    pagination?: SessionPaginationInput,
  ): Promise<PaginatedSessions> {
    const page = pagination?.page || 1;
    const limit = pagination?.limit || 20;

    const result = await this.adminSessionService.listUserSessions(
      userId,
      filters,
      page,
      limit,
    );

    return {
      data: result.data.map((session) => this.mapSessionToGraphQL(session)),
      pageInfo: result.pageInfo,
    };
  }

  /**
   * 查詢當前用戶的會話
   */
  @Query(() => PaginatedSessions, {
    description: '查詢當前用戶的會話',
  })
  @RequiresPermission('sessions:read')
  async mySessions(
    @CurrentUser() currentUser: JwtPayload,
    @Args('filters', { type: () => SessionFiltersInput, nullable: true })
    filters?: SessionFiltersInput,
    @Args('pagination', { type: () => SessionPaginationInput, nullable: true })
    pagination?: SessionPaginationInput,
  ): Promise<PaginatedSessions> {
    const page = pagination?.page || 1;
    const limit = pagination?.limit || 20;

    const result = await this.adminSessionService.listUserSessions(
      currentUser.sub,
      filters,
      page,
      limit,
    );

    return {
      data: result.data.map((session) => this.mapSessionToGraphQL(session)),
      pageInfo: result.pageInfo,
    };
  }

  /**
   * 查詢單個會話詳情
   * 需要權限：sessions:read_all（查看所有）或 sessions:read（查看自己）
   */
  @Query(() => SessionType, {
    description: '查詢單個會話詳情',
  })
  @UseGuards(AdminSessionGuard)
  @RequiresAnyPermission(['sessions:read_all', 'sessions:read'])
  async sessionDetails(
    @Args('sessionId', { type: () => String }) sessionId: string,
  ): Promise<SessionType> {
    const result = await this.adminSessionService.getSessionDetails(sessionId);
    return this.mapSessionToGraphQL(result);
  }

  /**
   * 查詢會話統計資訊（管理員功能）
   * 需要權限：sessions:read_all
   */
  @Query(() => SessionStatisticsType, {
    description: '查詢會話統計資訊（管理員功能）',
  })
  @RequiresPermission('sessions:read_all')
  async sessionStatistics(): Promise<SessionStatisticsType> {
    const stats = await this.adminSessionService.getSessionStatistics();

    // 轉換為 GraphQL 類型
    return {
      totalSessions:
        stats.totalActive + stats.totalRevoked + stats.totalExpired,
      activeSessions: stats.totalActive,
      totalRevoked: stats.totalRevoked,
      totalExpired: stats.totalExpired,
      todayLogins: 0, // TODO: 實現今日登入統計
      todayRevocations: 0, // TODO: 實現今日撤銷統計
      byScope: [], // TODO: 實現 Scope 統計
      topActiveUsers: stats.byUser.slice(0, 5).map((u) => ({
        userId: u.userId,
        userName: u.userName,
        userEmail: u.email,
        sessionCount: u.count,
        lastActivity: new Date(), // TODO: 實現最後活動時間
      })),
      topDevices: stats.byDevice.slice(0, 5).map((d) => ({
        deviceInfo: d.deviceType,
        count: d.count,
      })),
      recentActivities: [], // TODO: 實現最近活動
    };
  }

  /**
   * 查詢活躍會話數量
   * 需要權限：sessions:read_all
   */
  @Query(() => Int, {
    description: '查詢活躍會話數量',
  })
  @RequiresPermission('sessions:read_all')
  async activeSessionCount(): Promise<number> {
    const result = await this.adminSessionService.getActiveSessionCount();
    return typeof result === 'number' ? result : 0;
  }

  /**
   * ============================================
   * Mutations - 撤銷操作
   * ============================================
   */

  /**
   * 撤銷單個會話
   * 需要權限：sessions:revoke（撤銷他人）或 sessions:read（撤銷自己）
   */
  @Mutation(() => RevokeResultType, {
    description: '撤銷單個會話',
  })
  @UseGuards(AdminSessionGuard)
  @RequiresAnyPermission(['sessions:revoke', 'sessions:read'])
  async revokeSession(
    @Args('input', { type: () => RevokeSessionInput })
    input: RevokeSessionInput,
    @CurrentUser() currentUser: JwtPayload,
  ): Promise<RevokeResultType> {
    try {
      // 確保 currentUser 和 sub 存在
      if (!currentUser || !currentUser.sub) {
        throw new Error('User not authenticated');
      }

      const result = await this.adminSessionService.revokeSession({
        sessionId: input.sessionId,
        adminId: currentUser.sub,
        reason: input.reason,
        sendNotification: input.sendNotification ?? true,
        notificationMessage: input.notificationMessage,
      });

      return {
        success: result.success,
        revokedCount: result.revokedCount || 1,
        message: result.message,
        affectedSessionIds: result.affectedSessionIds || [input.sessionId],
      };
    } catch (error) {
      // 記錄錯誤
      logger.error('[AdminSessionResolver] Failed to revoke session', {
        error: error instanceof Error ? error.message : String(error),
        sessionId: input.sessionId,
        adminId: currentUser.sub,
      });

      // 返回錯誤結果而不是拋出異常
      return {
        success: false,
        revokedCount: 0,
        message:
          error instanceof Error ? error.message : 'Failed to revoke session',
        affectedSessionIds: [],
      };
    }
  }

  /**
   * 撤銷用戶所有會話
   * 需要權限：sessions:revoke_user
   */
  @Mutation(() => RevokeResultType, {
    description: '撤銷用戶所有會話',
  })
  @UseGuards(AdminSessionGuard)
  @RequiresPermission('sessions:revoke_user')
  async revokeUserSessions(
    @Args('input', { type: () => RevokeUserSessionsInput })
    input: RevokeUserSessionsInput,
    @CurrentUser() currentUser: JwtPayload,
  ): Promise<RevokeResultType> {
    // 確保 currentUser 和 sub 存在
    if (!currentUser || !currentUser.sub) {
      throw new Error('User not authenticated');
    }

    const result = await this.adminSessionService.revokeUserSessions({
      userId: input.userId,
      adminId: currentUser.sub,
      reason: input.reason,
      sendNotification: input.sendNotification ?? false,
      notificationMessage: input.notificationMessage,
      options: input.options
        ? {
            excludeCurrent: input.options.excludeCurrent,
            deviceInfo: input.options.deviceInfo,
            ipAddress: input.options.ipAddress,
            olderThan: input.options.olderThan,
          }
        : undefined,
    });

    return {
      success: result.success,
      revokedCount: result.revokedCount,
      message: result.message,
      affectedSessionIds: result.affectedSessionIds,
    };
  }

  /**
   * 批量撤銷會話
   * 需要權限：sessions:revoke_batch
   */
  @Mutation(() => RevokeResultType, {
    description: '批量撤銷會話（根據條件）',
  })
  @RequiresPermission('sessions:revoke_batch')
  async revokeBatchSessions(
    @Args('input', { type: () => BatchRevokeInput }) input: BatchRevokeInput,
    @CurrentUser() currentUser: JwtPayload,
  ): Promise<RevokeResultType> {
    // 確保 currentUser 和 sub 存在
    if (!currentUser || !currentUser.sub) {
      throw new Error('User not authenticated');
    }

    const result = await this.adminSessionService.revokeBatchSessions({
      adminId: currentUser.sub,
      reason: input.reason,
      sendNotification: input.sendNotification ?? false,
      notificationMessage: input.notificationMessage,
      criteria: {
        sessionIds: input.criteria.sessionIds,
        userIds: input.criteria.userIds,
        ipAddress: input.criteria.ipAddress,
        deviceInfo: input.criteria.deviceInfo,
        inactiveSince: input.criteria.inactiveSince,
        createdBefore: input.criteria.createdBefore,
      },
    });

    return {
      success: result.success,
      revokedCount: result.revokedCount,
      message: result.message,
      affectedSessionIds: result.affectedSessionIds,
    };
  }

  /**
   * 撤銷當前用戶的其他設備會話（用戶自主操作）
   * 需要權限：sessions:read
   */
  @Mutation(() => RevokeResultType, {
    description: '撤銷當前用戶的其他設備會話',
  })
  @RequiresPermission('sessions:read')
  async revokeOtherDevices(
    @Args('input', { type: () => RevokeOtherDevicesInput })
    input: RevokeOtherDevicesInput,
    @CurrentUser() currentUser: JwtPayload,
  ): Promise<RevokeResultType> {
    // 確保 currentUser 和 sub 存在
    if (!currentUser || !currentUser.sub) {
      throw new Error('User not authenticated');
    }

    const result = await this.adminSessionService.revokeOtherDevices({
      userId: currentUser.sub,
      currentSessionId: input.currentSessionId,
      reason: input.reason || '用戶主動登出其他設備',
    });

    return {
      success: result.success,
      revokedCount: result.revokedCount,
      message: result.message,
      affectedSessionIds: result.affectedSessionIds,
    };
  }

  /**
   * 全域緊急撤銷（所有會話）
   * 需要權限：sessions:revoke_all
   * 注意：這是高風險操作，需要提供詳細原因
   */
  @Mutation(() => RevokeResultType, {
    description: '全域緊急撤銷所有會話（高風險操作）',
  })
  @RequiresPermission('sessions:revoke_all')
  async revokeAllSessions(
    @Args('reason', { type: () => String, description: '撤銷原因（必填）' })
    reason: string,
    @Args('notificationMessage', {
      type: () => String,
      description: '通知訊息（必填）',
    })
    notificationMessage: string,
    @CurrentUser() currentUser: JwtPayload,
  ): Promise<RevokeResultType> {
    // 確保 currentUser 和 sub 存在
    if (!currentUser || !currentUser.sub) {
      throw new Error('User not authenticated');
    }

    const result = await this.adminSessionService.revokeBatchSessions({
      adminId: currentUser.sub,
      reason,
      sendNotification: true, // 強制發送通知
      notificationMessage,
      criteria: {
        // 空條件表示所有會話
      },
    });

    return {
      success: result.success,
      revokedCount: result.revokedCount,
      message: result.message,
    };
  }

  /**
   * Helper: 映射內部 Session 到 GraphQL SessionType
   */
  private mapSessionToGraphQL(session: any): SessionType {
    return {
      id: session.id,
      userId: session.userId,
      userName: session.user?.name,
      userEmail: session.user?.email,
      deviceInfo: session.deviceInfo,
      browser: session.browser,
      os: session.os,
      ipAddress: session.ipAddress,
      location: session.location,
      isActive: session.isActive,
      status: session.status,
      lastUsedAt: session.lastUsedAt,
      expiresAt: session.expiresAt,
      createdAt: session.createdAt,
      revokedBy: session.revokedBy,
      revokedByName: session.revoker?.name,
      revokedReason: session.revokedReason,
      revokedMethod: session.revokedMethod,
      revokedAt: session.updatedAt, // 使用 updatedAt 作為撤銷時間
    };
  }
}
