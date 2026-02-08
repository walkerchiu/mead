import { Module, forwardRef } from '@nestjs/common';
import { NotificationService } from './notification.service';
import { NotificationResolver } from './notification.resolver';
import { NotificationPubSubService } from './notification-pubsub.service';
import { PrismaModule } from '../prisma/prisma.module';
import { CronMonitoringModule } from '../cron-monitoring/cron-monitoring.module';
import { AuditLogModule } from '../audit-log/audit-log.module';

/**
 * NotificationModule
 *
 * 提供通知系統功能：
 * - 通知建立與管理
 * - 即時推送訂閱
 * - 已讀狀態管理
 */
@Module({
  imports: [
    PrismaModule,
    forwardRef(() => AuditLogModule),
    forwardRef(() => CronMonitoringModule),
  ],
  providers: [
    NotificationService,
    NotificationResolver,
    NotificationPubSubService,
  ],
  exports: [NotificationService, NotificationPubSubService],
})
export class NotificationModule {}
