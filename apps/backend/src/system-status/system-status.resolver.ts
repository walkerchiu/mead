/* eslint-disable @typescript-eslint/no-explicit-any */

import { Resolver, Query, Subscription, Args } from '@nestjs/graphql';
import { UseGuards } from '@nestjs/common';
import { SystemMonitorService } from './system-monitor.service';
import { SystemStatusPubSubService } from './system-status-pubsub.service';
import {
  SystemStatusGQLType,
  SystemHealthGQLType,
  ServiceFilterInput,
} from './system-status.types';
import { PermissionGuard } from '../common/guards/permission.guard';
import { RequiresScope } from '../common/decorators/requires-scope.decorator';
import { AccessScope } from '../common/enums/access-scope.enum';
import { CurrentUser } from '../auth/current-user.decorator';
import { logger } from '../common/services/logger.service';

/**
 * SystemStatusResolver
 *
 * 提供系統狀態相關的 GraphQL API：
 * - 查詢：系統健康狀態、服務狀態
 * - 訂閱：服務狀態變更
 *
 * 權限：僅 HQ_SCOPE 可存取
 */
@Resolver(() => SystemStatusGQLType)
export class SystemStatusResolver {
  constructor(
    private readonly systemMonitor: SystemMonitorService,
    private readonly systemStatusPubSub: SystemStatusPubSubService,
  ) {}

  /**
   * 查詢：取得系統整體健康狀態
   */
  @Query(() => SystemHealthGQLType, {
    description: '取得系統整體健康狀態（僅管理員）',
  })
  @UseGuards(PermissionGuard)
  @RequiresScope(AccessScope.HQ_SCOPE)
  async systemHealth(@CurrentUser() user: any): Promise<SystemHealthGQLType> {
    logger.debug('[SystemStatusResolver] Fetching system health', {
      userId: user?.id,
      email: user?.email,
    });

    return this.systemMonitor.getSystemHealth();
  }

  /**
   * 查詢：取得所有服務狀態
   */
  @Query(() => [SystemStatusGQLType], {
    description: '取得所有服務狀態（僅管理員）',
  })
  @UseGuards(PermissionGuard)
  @RequiresScope(AccessScope.HQ_SCOPE)
  async systemServices(
    @CurrentUser() user: any,
  ): Promise<SystemStatusGQLType[]> {
    logger.debug('[SystemStatusResolver] Fetching system services', {
      userId: user?.id,
      email: user?.email,
    });

    return this.systemMonitor.checkAllServices();
  }

  /**
   * 訂閱：系統狀態變更
   *
   * 權限檢查在 filter 中進行（因為 Guards 在 Subscription 中不生效）
   * 僅 HQ_SCOPE 用戶可訂閱
   */
  @Subscription(() => SystemStatusGQLType, {
    name: 'systemStatusChanged',
    description: '訂閱系統狀態變更（僅管理員）',
    filter: (payload, variables, context) => {
      try {
        // 從 connectionParams 解析 JWT 獲取 user
        const authHeader = context?.connectionParams?.authorization || '';
        const token = authHeader.replace('Bearer ', '');

        if (!token) {
          logger.debug(
            '[SystemStatus Subscription Filter] No token in connectionParams',
          );
          return false;
        }

        // 解析 JWT（不驗證簽名，因為 onConnect 已經驗證過）
        const jwtPayload = JSON.parse(
          Buffer.from(token.split('.')[1], 'base64').toString(),
        );

        const userScopes = jwtPayload.accessScopes || [];

        // 檢查是否有 HQ_SCOPE
        const hasHQScope = userScopes.includes(AccessScope.HQ_SCOPE);

        if (!hasHQScope) {
          logger.debug(
            '[SystemStatus Subscription Filter] User does not have HQ_SCOPE',
            {
              userId: jwtPayload.sub,
              scopes: userScopes,
            },
          );
          return false;
        }

        // 檢查服務篩選
        const filterInput = variables.filter as ServiceFilterInput | undefined;

        if (filterInput?.services || filterInput?.statuses) {
          const status = payload.systemStatusChanged as SystemStatusGQLType;

          // 如果有服務篩選，檢查是否符合
          if (
            filterInput.services &&
            !filterInput.services.includes(status.service)
          ) {
            return false;
          }

          // 如果有狀態篩選，檢查是否符合
          if (
            filterInput.statuses &&
            !filterInput.statuses.includes(status.status)
          ) {
            return false;
          }
        }

        logger.debug(
          '[SystemStatus Subscription Filter] Allowing subscription',
          {
            userId: jwtPayload.sub,
            filter: filterInput,
          },
        );

        return true;
      } catch (error) {
        logger.error(
          '[SystemStatus Subscription Filter] Error parsing token',
          error,
        );
        return false;
      }
    },
  })
  systemStatusChanged(
    @CurrentUser() user: any,
    @Args('filter', { nullable: true }) filter?: ServiceFilterInput,
  ) {
    logger.debug(
      '[SystemStatusResolver] Setting up system status subscription',
      {
        userId: user?.id || 'unknown',
        filter,
      },
    );

    return this.systemStatusPubSub.subscribeToStatusChanges();
  }
}
