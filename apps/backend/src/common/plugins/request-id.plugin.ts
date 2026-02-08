import { Plugin } from '@nestjs/apollo';
import {
  ApolloServerPlugin,
  GraphQLRequestListener,
  GraphQLRequestContext,
} from '@apollo/server';
import { uuidv7 } from 'uuidv7';

/**
 * Request ID Plugin for GraphQL
 *
 * 與 RequestContextMiddleware + RequestIdInterceptor 三層協作：
 * - middleware 已對 `x-request-id` header 做嚴格 UUID 驗證、寫入 `req.requestId`
 * - 本 plugin 優先沿用 `req.requestId`，header / fallback 僅為防禦性後路
 * - 將 requestId 同步到 contextValue 與 response header
 */
// audit_log.requestId DB 欄位是 PostgreSQL uuid 型別。本層仍保留 UUID 驗證作為防禦性後路
// （避免 plugin 在 middleware 未生效的退化路徑下接受非法字串）
const UUID_REGEX =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

function pickValidHeaderId(raw: unknown): string | undefined {
  return typeof raw === 'string' && UUID_REGEX.test(raw) ? raw : undefined;
}

@Plugin()
export class RequestIdPlugin implements ApolloServerPlugin {
  async requestDidStart(
    requestContext: GraphQLRequestContext<any>,
  ): Promise<GraphQLRequestListener<any>> {
    const { contextValue } = requestContext;

    // ✅ 跳過 Subscription / WebSocket：沒有 HTTP req/res，requestId 無處可寫且無人讀
    // 與 NestJS RequestIdInterceptor 對 subscription skip 的行為對齊
    if (!contextValue.req) {
      return {};
    }

    // 優先沿用 RequestContextMiddleware 已設定的 req.requestId
    // header / uuidv7 fallback 僅在 middleware 未生效的退化路徑下啟用
    const requestId =
      contextValue.req.requestId ||
      pickValidHeaderId(contextValue.req.headers?.['x-request-id']) ||
      uuidv7();

    // 同步到 context 與 req（給 NestJS pipeline 後續層讀取）
    contextValue.req.requestId = requestId;
    contextValue.requestId = requestId;

    // 設定響應 header
    if (contextValue.res && contextValue.res.setHeader) {
      contextValue.res.setHeader('X-Request-ID', requestId);
    }

    return {
      async willSendResponse() {
        // 確保響應中包含 requestId（透過 formatError 處理）
        // 這裡只需要確保 header 已設定
        return;
      },
    };
  }
}
