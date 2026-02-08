import { Injectable, NestMiddleware } from '@nestjs/common';
import type { NextFunction, Request, Response } from 'express';
import { uuidv7 } from 'uuidv7';
import { RequestContextService } from './request-context.service';

// audit_log.requestId DB 欄位是 PostgreSQL uuid 型別，header 必須通過嚴格 UUID 驗證後才能採用，
// 否則用 fallback，避免 client 注入非法字串導致 audit_log 寫入失敗或 cache key 污染
const UUID_REGEX =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

function pickValidHeaderId(raw: unknown): string | undefined {
  return typeof raw === 'string' && UUID_REGEX.test(raw) ? raw : undefined;
}

/**
 * RequestContextMiddleware
 *
 * 每個 HTTP request 進來：
 * 1. 從 `x-request-id` header 解析（嚴格 UUID 驗證），不通過就 `uuidv7()` 自生
 * 2. 寫 `req.requestId`（給 RequestIdInterceptor / RequestIdPlugin 沿用）
 * 3. 設 `X-Request-ID` response header
 * 4. `RequestContextService.run(requestId, () => next())` 起 ALS scope，
 *    讓深層 service（auth / notification / etc.）不必透過參數即可取得當前 requestId
 *
 * 為什麼用 middleware 而非 interceptor 起 ALS scope：
 * - middleware 在 NestJS pipeline 最外層（早於 guard / interceptor / resolver）
 * - 直接以 `next()` callback 形式包覆,ALS scope 自然 cover 整個 async chain
 * - interceptor 用 RxJS Observable，ALS scope 跟 subscribe 之間易踩坑
 */
@Injectable()
export class RequestContextMiddleware implements NestMiddleware {
  constructor(private readonly ctx: RequestContextService) {}

  use(req: Request, res: Response, next: NextFunction): void {
    const requestId =
      pickValidHeaderId(req.headers['x-request-id']) || uuidv7();

    (req as Request & { requestId?: string }).requestId = requestId;

    if (typeof res.setHeader === 'function') {
      res.setHeader('X-Request-ID', requestId);
    }

    this.ctx.run(requestId, () => next());
  }
}
