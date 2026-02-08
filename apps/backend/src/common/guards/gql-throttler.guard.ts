import { ExecutionContext, Injectable } from '@nestjs/common';
import { GqlExecutionContext } from '@nestjs/graphql';
import { ThrottlerGuard } from '@nestjs/throttler';

@Injectable()
export class GqlThrottlerGuard extends ThrottlerGuard {
  async canActivate(context: ExecutionContext): Promise<boolean> {
    // ✅ 檢查是否為 HTTP 請求（非 GraphQL）
    const contextType = context.getType<'http' | 'graphql'>();
    if (contextType === 'http') {
      // 對於 HTTP 請求，直接使用父類的 throttling
      return super.canActivate(context);
    }

    // 對於 GraphQL 請求
    const gqlCtx = GqlExecutionContext.create(context);
    const info = gqlCtx.getInfo();

    // ✅ 跳過 Subscriptions（WebSocket）
    // Subscriptions 使用單獨的 rate limiting 機制（在 app.module.ts 的 onConnect 中）
    if (info?.operation?.operation === 'subscription') {
      return true;
    }

    // 對於 Query 和 Mutation，使用標準 throttling
    return super.canActivate(context);
  }

  getRequestResponse(context: ExecutionContext) {
    // ✅ 檢查是否為 HTTP 請求
    const contextType = context.getType<'http' | 'graphql'>();
    if (contextType === 'http') {
      // 對於 HTTP 請求，直接從 context 取得
      const req = context.switchToHttp().getRequest();
      const res = context.switchToHttp().getResponse();
      return { req, res };
    }

    // 對於 GraphQL 請求，從 GraphQL context 取得
    const gqlCtx = GqlExecutionContext.create(context);
    const ctx = gqlCtx.getContext();
    return { req: ctx.req, res: ctx.res };
  }
}
