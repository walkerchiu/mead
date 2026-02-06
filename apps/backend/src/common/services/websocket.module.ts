import { Module, Global } from '@nestjs/common';
import { WebSocketConnectionService } from './websocket-connection.service';
import { SubscriptionRateLimiterService } from './subscription-rate-limiter.service';

/**
 * WebSocket Services Module
 * 提供 WebSocket 連接管理和速率限制服務
 */
@Global()
@Module({
  providers: [WebSocketConnectionService, SubscriptionRateLimiterService],
  exports: [WebSocketConnectionService, SubscriptionRateLimiterService],
})
export class WebSocketModule {}
