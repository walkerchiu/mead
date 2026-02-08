import { Global, MiddlewareConsumer, Module, NestModule } from '@nestjs/common';
import { RequestContextService } from './request-context.service';
import { RequestContextMiddleware } from './request-context.middleware';

/**
 * RequestContextModule
 *
 * 提供：
 * - RequestContextService（AsyncLocalStorage 管理 per-request requestId）
 * - RequestContextMiddleware（附到所有路由，起 ALS scope）
 *
 * 設為 `@Global`，避免每個 feature module 都要 re-import。
 */
@Global()
@Module({
  providers: [RequestContextService],
  exports: [RequestContextService],
})
export class RequestContextModule implements NestModule {
  configure(consumer: MiddlewareConsumer): void {
    consumer.apply(RequestContextMiddleware).forRoutes('*');
  }
}
