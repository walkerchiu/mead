import { Resolver, Query } from '@nestjs/graphql';
import { UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { PermissionGuard } from '../common/guards/permission.guard';
import { RequiresPermission } from '../common/decorators/requires-permission.decorator';
import { CacheService } from './cache.service';
import { CacheStats } from './cache.types';

/**
 * Cache Resolver
 *
 * 提供快取統計和管理的 GraphQL API
 * 僅限 HQ_SCOPE 訪問
 */
@Resolver()
@UseGuards(JwtAuthGuard, PermissionGuard)
export class CacheResolver {
  constructor(private cacheService: CacheService) {}

  /**
   * 查詢快取統計資訊
   *
   * 包含:
   * - Cache hit count (命中次數)
   * - Cache miss count (未命中次數)
   * - Total requests (總請求數)
   * - Hit rate (命中率 %)
   */
  @Query(() => CacheStats, {
    description: '查詢快取統計資訊（僅限管理員）',
  })
  @RequiresPermission('HQ_SCOPE')
  cacheStats(): CacheStats {
    return this.cacheService.getCacheStats();
  }
}
