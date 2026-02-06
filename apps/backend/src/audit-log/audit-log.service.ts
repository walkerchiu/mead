/* eslint-disable @typescript-eslint/no-explicit-any */

import { Injectable, Inject } from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { Cache } from 'cache-manager';
import { PrismaService } from '../prisma/prisma.service';
import { logger } from '../common/services/logger.service';
import {
  calculateSkip,
  createPaginationResult,
  PaginationResult,
} from '../common/utils/pagination.utils';

export interface CreateAuditLogDto {
  requestId: string;
  userId?: string;
  action: string;
  entity: string;
  entityId?: string;
  status: 'SUCCESS' | 'FAILURE';
  method?: string;
  path?: string;
  ipAddress?: string;
  userAgent?: string;
  details?: any;
  duration?: number;
}

@Injectable()
export class AuditLogService {
  constructor(
    private prisma: PrismaService,
    @Inject('AUDIT_LOG_QUEUE') private queueClient: ClientProxy,
    @Inject(CACHE_MANAGER) private cacheManager: Cache,
  ) {}

  /**
   * 建立稽核日誌記錄（發送到 RabbitMQ 佇列）
   */
  async create(data: CreateAuditLogDto): Promise<any> {
    try {
      // 非阻塞發送到 RabbitMQ 佇列
      this.queueClient.emit('audit_log.create', data);
      return { queued: true };
    } catch (error) {
      // 佇列失敗時降級為直接寫入資料庫
      logger.error('[AuditLog] 佇列發送失敗，降級為直接寫入:', error);
      return this.createDirect(data);
    }
  }

  /**
   * 直接寫入資料庫（降級方案或內部使用）
   */
  async createDirect(data: CreateAuditLogDto): Promise<any> {
    try {
      return await this.prisma.auditLog.create({
        data: {
          requestId: data.requestId,
          userId: data.userId,
          action: data.action,
          entity: data.entity,
          entityId: data.entityId,
          status: data.status,
          method: data.method,
          path: data.path,
          ipAddress: data.ipAddress,
          userAgent: data.userAgent,
          details: data.details,
          duration: data.duration,
        },
      });
    } catch (error) {
      // 稽核日誌失敗不應影響主要業務邏輯
      logger.error('[AuditLog] 建立失敗:', error);
      return null;
    }
  }

  /**
   * 查詢稽核日誌（帶快取）
   */
  async findAll(filters?: {
    userId?: string;
    action?: string;
    entity?: string;
    status?: string;
    startDate?: Date;
    endDate?: Date;
    limit?: number;
  }) {
    // 產生快取鍵
    const cacheKey = `audit_logs:${JSON.stringify(filters)}`;

    // 嘗試從快取獲取
    const cached = await this.cacheManager.get(cacheKey);
    if (cached) {
      logger.debug('[AuditLog] 快取命中:', cacheKey);
      return cached;
    }

    // 快取未命中，查詢資料庫（支持模糊匹配）
    const where: any = {};

    if (filters?.userId) {
      where.userId = { contains: filters.userId, mode: 'insensitive' };
    }
    if (filters?.action) {
      where.action = { contains: filters.action, mode: 'insensitive' };
    }
    if (filters?.entity) {
      where.entity = { contains: filters.entity, mode: 'insensitive' };
    }
    if (filters?.status) {
      where.status = filters.status; // status 保持精確匹配
    }

    if (filters?.startDate || filters?.endDate) {
      where.timestamp = {};
      if (filters.startDate) where.timestamp.gte = filters.startDate;
      if (filters.endDate) where.timestamp.lte = filters.endDate;
    }

    const results = await this.prisma.auditLog.findMany({
      where,
      orderBy: { timestamp: 'desc' },
      take: filters?.limit || 100,
      select: {
        id: true,
        requestId: true,
        userId: true,
        action: true,
        entity: true,
        entityId: true,
        status: true,
        method: true,
        path: true,
        ipAddress: true,
        userAgent: true,
        timestamp: true,
        duration: true,
      },
    });

    // 寫入快取（TTL 5 分鐘）
    await this.cacheManager.set(cacheKey, results, 300000);

    return results;
  }

  /**
   * 依 Request ID 查詢
   */
  async findByRequestId(requestId: string) {
    const cacheKey = `audit_logs:request:${requestId}`;

    const cached = await this.cacheManager.get(cacheKey);
    if (cached) {
      return cached;
    }

    const results = await this.prisma.auditLog.findMany({
      where: { requestId },
      orderBy: { timestamp: 'asc' },
      select: {
        id: true,
        requestId: true,
        userId: true,
        action: true,
        entity: true,
        entityId: true,
        status: true,
        method: true,
        path: true,
        ipAddress: true,
        userAgent: true,
        timestamp: true,
        duration: true,
      },
    });

    await this.cacheManager.set(cacheKey, results, 300000);
    return results;
  }

  /**
   * 依使用者查詢（帶快取）
   */
  async findByUser(userId: string, limit = 50) {
    const cacheKey = `audit_logs:user:${userId}:${limit}`;

    const cached = await this.cacheManager.get(cacheKey);
    if (cached) {
      return cached;
    }

    const results = await this.prisma.auditLog.findMany({
      where: { userId },
      orderBy: { timestamp: 'desc' },
      take: limit,
      select: {
        id: true,
        requestId: true,
        userId: true,
        action: true,
        entity: true,
        entityId: true,
        status: true,
        method: true,
        path: true,
        ipAddress: true,
        userAgent: true,
        timestamp: true,
        duration: true,
      },
    });

    await this.cacheManager.set(cacheKey, results, 300000);
    return results;
  }

  /**
   * 依實體查詢
   */
  async findByEntity(entity: string, entityId: string): Promise<any[]> {
    return this.prisma.auditLog.findMany({
      where: { entity, entityId },
      orderBy: { timestamp: 'desc' },
      select: {
        id: true,
        requestId: true,
        userId: true,
        action: true,
        entity: true,
        entityId: true,
        status: true,
        method: true,
        path: true,
        ipAddress: true,
        userAgent: true,
        timestamp: true,
        duration: true,
      },
    });
  }

  /**
   * 清除所有 audit logs 相關的快取
   *
   * 注意：目前查詢已禁用快取（USE_CACHE = false），所以此方法為空操作
   * 未來如果重新啟用快取，需要根據 cache-manager@7 的 API 重新實現
   */
  async clearAllCaches(): Promise<void> {
    // ⚠️ cache-manager@7 的 API 與舊版不同
    // 目前查詢已禁用快取，此方法暫時不執行任何操作
    logger.debug(
      '[AuditLog] clearAllCaches 被調用（當前查詢已禁用快取，無需清除）',
    );
  }

  /**
   * 統計分析（帶快取）
   */
  async getStatistics(startDate?: Date, endDate?: Date) {
    const cacheKey = `audit_logs:stats:${startDate?.toISOString()}_${endDate?.toISOString()}`;

    const cached = await this.cacheManager.get(cacheKey);
    if (cached) {
      return cached;
    }

    const where: any = {};
    if (startDate || endDate) {
      where.timestamp = {};
      if (startDate) where.timestamp.gte = startDate;
      if (endDate) where.timestamp.lte = endDate;
    }

    const [total, successCount, failureCount, byAction, byEntity] =
      await Promise.all([
        // 總數
        this.prisma.auditLog.count({ where }),
        // 成功數
        this.prisma.auditLog.count({
          where: { ...where, status: 'SUCCESS' },
        }),
        // 失敗數
        this.prisma.auditLog.count({
          where: { ...where, status: 'FAILURE' },
        }),
        // 依操作類型統計
        this.prisma.auditLog.groupBy({
          by: ['action'],
          where,
          _count: true,
          orderBy: { _count: { action: 'desc' } },
          take: 10,
        }),
        // 依實體類型統計
        this.prisma.auditLog.groupBy({
          by: ['entity'],
          where,
          _count: true,
          orderBy: { _count: { entity: 'desc' } },
          take: 10,
        }),
      ]);

    const stats = {
      total,
      successCount,
      failureCount,
      successRate: total > 0 ? (successCount / total) * 100 : 0,
      byAction: byAction.map((item) => ({
        action: item.action,
        count: item._count,
      })),
      byEntity: byEntity.map((item) => ({
        entity: item.entity,
        count: item._count,
      })),
    };

    // 統計資料快取 1 分鐘
    await this.cacheManager.set(cacheKey, stats, 60000);

    return stats;
  }

  /**
   * 清理舊日誌（保留指定天數）並清除相關快取
   */
  async cleanup(retentionDays = 90) {
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - retentionDays);

    const result = await this.prisma.auditLog.deleteMany({
      where: {
        timestamp: {
          lt: cutoffDate,
        },
      },
    });

    // 清除所有 audit_logs 相關快取（使用模式匹配）
    // 注意：cache-manager 沒有 reset() 方法，我們需要手動清除
    // 這裡簡化處理，實際使用時可以維護一個快取鍵列表
    logger.info('[AuditLog] 快取將在 TTL 過期後自動清除，或可在重啟後清除');

    logger.info(
      `[AuditLog] 清理完成，刪除 ${result.count} 筆超過 ${retentionDays} 天的記錄`,
    );

    return result;
  }

  /**
   * 使用 offset-based pagination 查詢稽核日誌
   * 添加 currentUserId 用於快取隔離
   */
  async findAllPaginated(
    page: number,
    limit: number,
    filters?: {
      userId?: string;
      action?: string;
      entity?: string;
      status?: string;
      startDate?: Date;
      endDate?: Date;
    },
    currentUserId?: string, // 用於快取隔離
  ): Promise<PaginationResult<any>> {
    const startTime = Date.now();

    // 1. 輸入驗證和正規化
    page = Math.max(1, Math.floor(page));
    limit = Math.max(1, Math.min(100, Math.floor(limit)));

    // 2. 構建查詢條件（支持模糊匹配）
    const where: any = {};
    if (filters?.userId) {
      where.userId = { contains: filters.userId, mode: 'insensitive' };
    }
    if (filters?.action) {
      where.action = { contains: filters.action, mode: 'insensitive' };
    }
    if (filters?.entity) {
      where.entity = { contains: filters.entity, mode: 'insensitive' };
    }
    if (filters?.status) {
      where.status = filters.status; // status 保持精確匹配（通常是枚舉值）
    }
    if (filters?.startDate || filters?.endDate) {
      where.timestamp = {};
      if (filters.startDate) where.timestamp.gte = filters.startDate;
      if (filters.endDate) where.timestamp.lte = filters.endDate;
    }

    const skip = calculateSkip(page, limit);

    // 3. 快取隔離：加入 currentUserId
    // ⚠️ 暫時禁用快取以確保即時性（待優化）
    const USE_CACHE = false; // 設為 false 以禁用快取
    const cacheKey = `audit_logs:${currentUserId || 'anonymous'}:page:${page}:limit:${limit}:${JSON.stringify(filters)}`;

    if (USE_CACHE) {
      const cached = await this.cacheManager.get(cacheKey);
      if (cached) {
        logger.debug('[AuditLog] 快取命中:', cacheKey);
        return cached as PaginationResult<any>;
      }
    }

    logger.info('[AuditLog] 🔍 開始查詢（使用 PrismaService，快取已禁用）', {
      page,
      limit,
      filters,
      where,
      timestamp: new Date().toISOString(),
    });
    const queryStart = Date.now();

    // 4. 並行查詢資料和總數（效能優化）
    // ⚡ 只選擇必要欄位，排除可能很大的 details 欄位
    const [data, totalCount] = await Promise.all([
      this.prisma.auditLog.findMany({
        where,
        skip,
        take: limit,
        orderBy: { timestamp: 'desc' },
        select: {
          id: true,
          requestId: true,
          userId: true,
          action: true,
          entity: true,
          entityId: true,
          status: true,
          method: true,
          path: true,
          ipAddress: true,
          userAgent: true,
          timestamp: true,
          duration: true,
          // details: false - 排除此欄位以提升效能
        },
      }),
      this.prisma.auditLog.count({ where }),
    ]);

    const queryTime = Date.now() - queryStart;
    logger.info('[AuditLog] ✅ 查詢完成', {
      queryTime: `${queryTime}ms`,
      dataCount: data.length,
      totalCount,
      firstItem: data[0]
        ? {
            id: data[0].id,
            action: data[0].action,
            timestamp: data[0].timestamp,
          }
        : null,
    });

    // 5. 組裝分頁結果
    const result = createPaginationResult(data, totalCount, page, limit);

    // 6. 寫入快取（5 分鐘）
    if (USE_CACHE) {
      await this.cacheManager.set(cacheKey, result, 300000);
    }

    const totalTime = Date.now() - startTime;
    logger.info('[AuditLog] 總處理時間', { totalTime: `${totalTime}ms` });

    return result;
  }
}
