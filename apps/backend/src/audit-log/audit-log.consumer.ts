import { Injectable, Controller } from '@nestjs/common';
import { EventPattern, Payload } from '@nestjs/microservices';
import { AuditLogService, CreateAuditLogDto } from './audit-log.service';
import { AuditLogPubSubService } from './audit-log-pubsub.service';
import { logger } from '../common/services/logger.service';

@Controller()
@Injectable()
export class AuditLogConsumer {
  private batchBuffer: CreateAuditLogDto[] = [];
  private batchTimer: NodeJS.Timeout | null = null;
  private readonly BATCH_SIZE = 100;
  // 開發環境使用較短的延遲時間，方便測試
  private readonly BATCH_INTERVAL_MS =
    process.env.NODE_ENV === 'development' ? 1000 : 5000; // 開發：1秒，生產：5秒

  constructor(
    private auditLogService: AuditLogService,
    private pubSubService: AuditLogPubSubService,
  ) {}

  /**
   * 監聽 audit_log.create 事件
   */
  @EventPattern('audit_log.create')
  async handleAuditLogCreate(@Payload() data: CreateAuditLogDto) {
    // 加入批次緩衝區
    this.batchBuffer.push(data);

    // 如果達到批次大小，立即處理
    if (this.batchBuffer.length >= this.BATCH_SIZE) {
      await this.processBatch();
    } else if (!this.batchTimer) {
      // 設定定時器，確保即使未達批次大小也會定期處理
      this.batchTimer = setTimeout(() => {
        this.processBatch();
      }, this.BATCH_INTERVAL_MS);
    }
  }

  /**
   * 批次處理稽核日誌
   */
  private async processBatch() {
    // 清除定時器
    if (this.batchTimer) {
      clearTimeout(this.batchTimer);
      this.batchTimer = null;
    }

    // 取出當前緩衝區的所有項目
    const batch = [...this.batchBuffer];
    this.batchBuffer = [];

    if (batch.length === 0) {
      return;
    }

    logger.debug(`[AuditLogConsumer] 開始處理批次，共 ${batch.length} 筆記錄`);
    const startTime = Date.now();

    try {
      // 批次寫入資料庫
      const results = await Promise.all(
        batch.map((data) => this.auditLogService.createDirect(data)),
      );

      // ✅ 清除所有 audit logs 快取（確保查詢能取得最新資料）
      await this.auditLogService.clearAllCaches();

      // ✅ 寫入成功後，發布訂閱事件
      for (const auditLog of results) {
        if (auditLog) {
          // 非阻塞發送，不影響批次處理性能
          this.pubSubService.emitAuditLogCreated(auditLog).catch((err) => {
            logger.error(
              '[AuditLogConsumer] Failed to emit subscription event',
              { error: err },
            );
          });
        }
      }

      const duration = Date.now() - startTime;
      logger.info(
        `[AuditLogConsumer] 批次處理完成，共 ${batch.length} 筆，耗時 ${duration}ms`,
      );
    } catch (error) {
      logger.error('[AuditLogConsumer] 批次處理失敗', { error });

      // 失敗時，嘗試逐筆處理避免全部失敗
      logger.warn('[AuditLogConsumer] 嘗試逐筆重試...');
      let successCount = 0;
      for (const data of batch) {
        try {
          const auditLog = await this.auditLogService.createDirect(data);
          // ✅ 單筆成功後也發送訂閱事件
          if (auditLog) {
            successCount++;
            this.pubSubService.emitAuditLogCreated(auditLog).catch((err) => {
              logger.error(
                '[AuditLogConsumer] Failed to emit subscription event',
                { error: err },
              );
            });
          }
        } catch (err) {
          logger.error('[AuditLogConsumer] 單筆處理失敗', { error: err });
        }
      }

      // 如果有成功寫入的記錄，清除快取
      if (successCount > 0) {
        await this.auditLogService.clearAllCaches();
        logger.info(`[AuditLogConsumer] 逐筆重試完成，成功 ${successCount} 筆`);
      }
    }
  }

  /**
   * 優雅關閉：處理剩餘的批次
   */
  async onModuleDestroy() {
    logger.info('[AuditLogConsumer] 正在關閉，處理剩餘批次...');
    await this.processBatch();
  }
}
