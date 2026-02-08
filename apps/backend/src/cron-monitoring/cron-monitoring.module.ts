/**
 * Cron Job 監控模組
 */

import { Module, forwardRef } from '@nestjs/common';
import { CronJobMonitorService } from './cron-job-monitor.service';
import { CronJobMonitorResolver } from './cron-job-monitor.resolver';
import { CronJobPubSubService } from './cron-job-pubsub.service';
import { AlertService } from './alert.service';
import { PrismaModule } from '../prisma/prisma.module';
import { RbacModule } from '../rbac/rbac.module';
import { MailModule } from '../mail/mail.module';
import { NotificationModule } from '../notification/notification.module';
import { CacheModule } from '../cache/cache.module';
import { PubSubModule } from '../common/services/pubsub.module';

@Module({
  imports: [
    PrismaModule,
    RbacModule,
    MailModule,
    forwardRef(() => NotificationModule),
    CacheModule,
    PubSubModule,
  ],
  providers: [
    CronJobMonitorService,
    CronJobMonitorResolver,
    CronJobPubSubService,
    AlertService,
  ],
  exports: [CronJobMonitorService, CronJobPubSubService, AlertService],
})
export class CronMonitoringModule {}
