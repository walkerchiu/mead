import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { SubscriptionRateLimiterService } from './common/services/subscription-rate-limiter.service';

@Injectable()
export class AppService implements OnModuleInit {
  private readonly logger = new Logger(AppService.name);

  constructor(
    private subscriptionRateLimiter: SubscriptionRateLimiterService,
  ) {}

  onModuleInit() {
    // 每 5 分鐘清理一次過期的 Rate Limit 記錄
    setInterval(
      () => {
        this.subscriptionRateLimiter.cleanup();
      },
      5 * 60 * 1000,
    );

    this.logger.log('✅ Rate limiter cleanup scheduled (every 5 minutes)');
  }

  getHello(): string {
    return 'Hello World!';
  }
}
