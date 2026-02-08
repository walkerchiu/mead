import { Module } from '@nestjs/common';
import { SystemMonitorService } from './system-monitor.service';
import { SystemStatusPubSubService } from './system-status-pubsub.service';
import { SystemStatusResolver } from './system-status.resolver';
import { PrismaModule } from '../prisma/prisma.module';
import { ConfigModule } from '@nestjs/config';
import { RbacModule } from '../rbac/rbac.module';

/**
 * SystemStatusModule
 *
 * 提供系統狀態監控功能：
 * - 定期監控各服務健康狀態
 * - 即時推送狀態變更
 * - 提供健康檢查 API
 */
@Module({
  imports: [PrismaModule, ConfigModule, RbacModule],
  providers: [
    SystemMonitorService,
    SystemStatusPubSubService,
    SystemStatusResolver,
  ],
  exports: [SystemMonitorService, SystemStatusPubSubService],
})
export class SystemStatusModule {}
