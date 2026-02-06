import { Module } from '@nestjs/common';
import { APP_INTERCEPTOR } from '@nestjs/core';
import { AuditLogService } from './audit-log.service';
import { AuditLogPubSubService } from './audit-log-pubsub.service';
import { AuditLogInterceptor } from './audit-log.interceptor';
import { AuditLogResolver } from './audit-log.resolver';
import { AuditLogConsumer } from './audit-log.consumer';
import { QueueModule } from '../queue/queue.module';
import { CacheModule } from '../cache/cache.module';
import { RbacModule } from '../rbac/rbac.module';
import { PubSubModule } from '../common/services/pubsub.module';

@Module({
  imports: [QueueModule, CacheModule, RbacModule, PubSubModule],
  controllers: [AuditLogConsumer],
  providers: [
    AuditLogService,
    AuditLogPubSubService,
    AuditLogResolver,
    {
      provide: APP_INTERCEPTOR,
      useClass: AuditLogInterceptor,
    },
  ],
  exports: [AuditLogService, AuditLogPubSubService, AuditLogResolver],
})
export class AuditLogModule {}
