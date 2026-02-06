/* eslint-disable @typescript-eslint/no-explicit-any */

import { Inject, Injectable } from '@nestjs/common';
import { PUB_SUB, IPubSubService } from '../common/services/pubsub.module';
import { logger } from '../common/services/logger.service';

export const AUDIT_LOG_EVENTS = {
  CREATED: 'AUDIT_LOG_CREATED',
  DELETED: 'AUDIT_LOG_DELETED',
} as const;

@Injectable()
export class AuditLogPubSubService {
  constructor(@Inject(PUB_SUB) private pubSub: IPubSubService) {}

  /**
   * 發布新稽核日誌事件
   */
  async emitAuditLogCreated(auditLog: any): Promise<void> {
    logger.debug('[AuditLogPubSub] Emitting audit log created event', {
      id: auditLog.id,
      action: auditLog.action,
      entity: auditLog.entity,
    });
    await this.pubSub.publish(AUDIT_LOG_EVENTS.CREATED, {
      auditLogCreated: auditLog,
    });
    logger.debug('[AuditLogPubSub] Event emitted successfully');
  }

  /**
   * 訂閱稽核日誌創建事件
   */
  subscribeToAuditLogCreated() {
    logger.debug(
      '[AuditLogPubSub] Creating subscription iterator for AUDIT_LOG_CREATED',
    );
    return this.pubSub.asyncIterator([AUDIT_LOG_EVENTS.CREATED]);
  }

  /**
   * 發布稽核日誌刪除事件（預留）
   */
  async emitAuditLogDeleted(id: string): Promise<void> {
    await this.pubSub.publish(AUDIT_LOG_EVENTS.DELETED, {
      auditLogDeleted: { id },
    });
  }
}
