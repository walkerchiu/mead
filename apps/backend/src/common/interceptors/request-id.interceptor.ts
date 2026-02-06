import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';
import { uuidv7 } from 'uuidv7';
import { GqlExecutionContext } from '@nestjs/graphql';
import { logger } from '../services/logger.service';

@Injectable()
export class RequestIdInterceptor implements NestInterceptor {
  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const ctx = context.getType<'graphql' | 'http'>();
    let requestId: string;
    let res: any;

    if (ctx === 'graphql') {
      // GraphQL context
      const gqlContext = GqlExecutionContext.create(context);
      const gqlInfo = gqlContext.getInfo();

      // ✅ 跳過 Subscriptions（WebSocket）
      // Subscriptions 沒有 req/res 對象
      if (gqlInfo?.operation?.operation === 'subscription') {
        return next.handle();
      }

      const { req, res: gqlRes } = gqlContext.getContext();
      res = gqlRes;

      // 安全檢查：確保 req 和 headers 存在
      if (req && req.headers) {
        requestId = req.headers['x-request-id'] || uuidv7();
        req.requestId = requestId;
      } else {
        requestId = uuidv7();
      }
    } else {
      // HTTP context
      const request = context.switchToHttp().getRequest();
      res = context.switchToHttp().getResponse();
      requestId = request.headers['x-request-id'] || uuidv7();
      request.requestId = requestId;
    }

    // Set response header
    if (res && res.setHeader) {
      res.setHeader('X-Request-ID', requestId);
    }

    return next.handle().pipe(
      tap(() => {
        // Log request completion
        logger.debug(`[${requestId}] Request completed`);
      }),
    );
  }
}
