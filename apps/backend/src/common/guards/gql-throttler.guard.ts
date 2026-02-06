import { ExecutionContext, Injectable } from '@nestjs/common';
import { GqlExecutionContext } from '@nestjs/graphql';
import { ThrottlerGuard } from '@nestjs/throttler';

@Injectable()
export class GqlThrottlerGuard extends ThrottlerGuard {
  async canActivate(context: ExecutionContext): Promise<boolean> {
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
    const gqlCtx = GqlExecutionContext.create(context);
    const ctx = gqlCtx.getContext();

    // 對於 GraphQL，從 context 取得 req 和 res
    return { req: ctx.req, res: ctx.res };
  }
}
