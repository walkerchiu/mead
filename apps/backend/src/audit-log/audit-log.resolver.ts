/* eslint-disable @typescript-eslint/no-explicit-any */

import { Query, Resolver, Args, Subscription, Context } from '@nestjs/graphql';
import { UseGuards } from '@nestjs/common';
import { AuditLogService } from './audit-log.service';
import { AuditLogPubSubService } from './audit-log-pubsub.service';
import {
  AuditLogType,
  AuditLogStatisticsType,
  PaginatedAuditLogs,
} from './audit-log.types';
import { PaginationInput } from '../common/dto/pagination.input';
import { PermissionGuard } from '../common/guards/permission.guard';
import { RequiresScope } from '../common/decorators/requires-scope.decorator';
import { RequiresPermission } from '../common/decorators/requires-permission.decorator';
import { AccessScope } from '../common/enums/access-scope.enum';
import { logger } from '../common/services/logger.service';

@Resolver()
export class AuditLogResolver {
  constructor(
    private auditLogService: AuditLogService,
    private pubSubService: AuditLogPubSubService,
  ) {}

  @Query(() => PaginatedAuditLogs, {
    description: '分頁查詢稽核日誌（需要 ADMIN_SCOPE + audit-logs:read）',
  })
  @UseGuards(PermissionGuard)
  @RequiresScope(AccessScope.ADMIN_SCOPE)
  @RequiresPermission('audit-logs:read')
  async auditLogsPaginated(
    @Args('pagination', {
      type: () => PaginationInput,
      defaultValue: { page: 1, limit: 50 },
    })
    pagination: PaginationInput,
    @Args('userId', { nullable: true }) userId?: string,
    @Args('action', { nullable: true }) action?: string,
    @Args('entity', { nullable: true }) entity?: string,
    @Args('status', { nullable: true }) status?: string,
    @Context() context?: any,
  ): Promise<PaginatedAuditLogs> {
    // 取得當前用戶 ID 用於快取隔離
    const currentUserId = context?.req?.user?.id;

    return this.auditLogService.findAllPaginated(
      pagination.page,
      pagination.limit,
      { userId, action, entity, status },
      currentUserId, // 傳遞當前用戶 ID
    );
  }

  @Query(() => [AuditLogType], {
    description: '查詢稽核日誌（需要 ADMIN_SCOPE + audit-logs:read）',
  })
  @UseGuards(PermissionGuard)
  @RequiresScope(AccessScope.ADMIN_SCOPE)
  @RequiresPermission('audit-logs:read')
  async auditLogs(
    @Args('userId', { nullable: true }) userId?: string,
    @Args('action', { nullable: true }) action?: string,
    @Args('entity', { nullable: true }) entity?: string,
    @Args('status', { nullable: true }) status?: string,
    @Args('limit', { nullable: true }) limit?: number,
  ): Promise<AuditLogType[]> {
    const result = await this.auditLogService.findAll({
      userId,
      action,
      entity,
      status,
      limit,
    });
    return result as AuditLogType[];
  }

  @Query(() => [AuditLogType], {
    description:
      '依 Request ID 查詢稽核日誌（需要 ADMIN_SCOPE + audit-logs:read）',
  })
  @UseGuards(PermissionGuard)
  @RequiresScope(AccessScope.ADMIN_SCOPE)
  @RequiresPermission('audit-logs:read')
  async auditLogsByRequestId(
    @Args('requestId') requestId: string,
  ): Promise<AuditLogType[]> {
    const result = await this.auditLogService.findByRequestId(requestId);
    return result as AuditLogType[];
  }

  @Query(() => [AuditLogType], {
    description: '依使用者查詢稽核日誌（需要 ADMIN_SCOPE + audit-logs:read）',
  })
  @UseGuards(PermissionGuard)
  @RequiresScope(AccessScope.ADMIN_SCOPE)
  @RequiresPermission('audit-logs:read')
  async auditLogsByUser(
    @Args('userId') userId: string,
    @Args('limit', { nullable: true }) limit?: number,
  ): Promise<AuditLogType[]> {
    const result = await this.auditLogService.findByUser(userId, limit);
    return result as AuditLogType[];
  }

  @Query(() => [AuditLogType], {
    description: '依實體查詢稽核日誌（需要 ADMIN_SCOPE + audit-logs:read）',
  })
  @UseGuards(PermissionGuard)
  @RequiresScope(AccessScope.ADMIN_SCOPE)
  @RequiresPermission('audit-logs:read')
  async auditLogsByEntity(
    @Args('entity') entity: string,
    @Args('entityId') entityId: string,
  ): Promise<AuditLogType[]> {
    const result = await this.auditLogService.findByEntity(entity, entityId);
    return result as AuditLogType[];
  }

  @Query(() => AuditLogStatisticsType, {
    description: '取得稽核日誌統計資料（需要 ADMIN_SCOPE + audit-logs:read）',
  })
  @UseGuards(PermissionGuard)
  @RequiresScope(AccessScope.ADMIN_SCOPE)
  @RequiresPermission('audit-logs:read')
  async auditLogStatistics(): Promise<AuditLogStatisticsType> {
    const result = await this.auditLogService.getStatistics();
    return result as AuditLogStatisticsType;
  }

  /**
   * 訂閱新稽核日誌（即時推送）
   * 權限檢查在 filter 中進行（因為 Guards 在 Subscription 中不生效）
   */
  @Subscription(() => AuditLogType, {
    name: 'auditLogCreated',
    description: '訂閱新稽核日誌（需要 ADMIN_SCOPE + audit-logs:read）',
    filter: (payload, variables, context) => {
      // 🔍 從 connectionParams 解析 JWT 獲取 user
      try {
        const authHeader = context?.connectionParams?.authorization || '';
        const token = authHeader.replace('Bearer ', '');

        if (!token) {
          logger.debug('[Subscription Filter] No token in connectionParams');
          return false;
        }

        // 解析 JWT（不驗證簽名，因為 onConnect 已經驗證過）
        const payload = JSON.parse(
          Buffer.from(token.split('.')[1], 'base64').toString(),
        );

        const user = {
          id: payload.sub,
          email: payload.email,
          accessScopes: payload.accessScopes || [],
          permissions: payload.permissions || [],
        };

        logger.debug('[Subscription Filter] User parsed from token', {
          userId: user.id,
          email: user.email,
          accessScopes: user.accessScopes,
        });

        // 檢查是否有 ADMIN_SCOPE
        const hasAdminScope = user.accessScopes.includes('ADMIN_SCOPE');
        if (!hasAdminScope) {
          logger.debug('[Subscription Filter] User lacks ADMIN_SCOPE');
          return false;
        }

        // 檢查是否有 audit-logs:read 權限
        const hasPermission = user.permissions.some(
          (p: any) =>
            p.name === 'audit-logs:read' || p.resource === 'audit-logs',
        );

        if (!hasPermission && user.permissions.length > 0) {
          logger.debug(
            '[Subscription Filter] User lacks audit-logs:read permission',
          );
          return false;
        }

        logger.debug('[Subscription Filter] All checks passed, allowing event');
        return true;
      } catch (error) {
        const errorMessage =
          error instanceof Error ? error.message : 'Unknown error';
        logger.warn('[Subscription Filter] Error parsing token', {
          error: errorMessage,
        });
        return false;
      }
    },
  })
  auditLogCreated(@Context() _context: any) {
    logger.debug('[Subscription Resolver] auditLogCreated called');
    return this.pubSubService.subscribeToAuditLogCreated();
  }
}
