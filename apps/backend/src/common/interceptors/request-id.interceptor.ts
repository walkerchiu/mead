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

// audit_log.requestId DB 欄位是 PostgreSQL uuid 型別，header 必須通過嚴格 UUID 驗證後才能採用，
// 否則用 fallback，避免 client 注入非法字串導致 audit_log 寫入失敗或 cache key 污染
const UUID_REGEX =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

function pickValidHeaderId(raw: unknown): string | undefined {
  return typeof raw === 'string' && UUID_REGEX.test(raw) ? raw : undefined;
}

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
      // 優先沿用 RequestIdPlugin 已設定的 req.requestId，避免同一請求產生兩個不同的 ID
      if (req && req.headers) {
        requestId =
          req.requestId ||
          pickValidHeaderId(req.headers['x-request-id']) ||
          uuidv7();
        req.requestId = requestId;
      } else {
        requestId = uuidv7();
      }
    } else {
      // HTTP context
      const request = context.switchToHttp().getRequest();
      res = context.switchToHttp().getResponse();
      requestId =
        request.requestId ||
        pickValidHeaderId(request.headers?.['x-request-id']) ||
        uuidv7();
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
