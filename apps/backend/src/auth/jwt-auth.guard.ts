import {
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { GqlExecutionContext } from '@nestjs/graphql';
import { AuthGuard } from '@nestjs/passport';
import { logger } from '../common/services/logger.service';

@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {
  /**
   * 從 GraphQL 或 REST context 中提取 request
   */
  getRequest(context: ExecutionContext) {
    // 檢查是否為 HTTP REST 請求（非 GraphQL）
    const httpRequest = context.switchToHttp().getRequest();
    if (
      httpRequest &&
      httpRequest.url &&
      !httpRequest.url.includes('/graphql')
    ) {
      console.log('[JwtAuthGuard] REST API request detected', {
        url: httpRequest.url,
        hasCookies: !!httpRequest.cookies,
      });
      return httpRequest;
    }

    // GraphQL 請求處理
    const ctx = GqlExecutionContext.create(context);
    const gqlContext = ctx.getContext();

    // 檢查是否為 Subscription（WebSocket 連接）
    if (gqlContext.connectionParams) {
      console.log('[JwtAuthGuard] Subscription detected, skipping HTTP auth');
      // 對於 Subscriptions，返回 null 表示跳過 HTTP 認證
      // 認證在 Subscription filter 中處理
      return null;
    }

    const req = gqlContext.req;
    console.log('[JwtAuthGuard] GraphQL request detected', {
      hasAuthorization: !!req?.headers?.authorization,
      authHeader: req?.headers?.authorization?.substring(0, 20),
      hasReq: !!req,
    });
    return req;
  }

  async canActivate(context: ExecutionContext): Promise<boolean> {
    console.log('[JwtAuthGuard] canActivate called');

    // 檢查是否為 Subscription
    const ctx = GqlExecutionContext.create(context);
    const gqlContext = ctx.getContext();
    if (gqlContext.connectionParams) {
      console.log(
        '[JwtAuthGuard] Subscription detected, allowing through (auth handled in filter)',
      );
      // Subscriptions 的認證在 filter 中處理，這裡直接放行
      return true;
    }

    try {
      const result = await super.canActivate(context);
      console.log('[JwtAuthGuard] canActivate result', { result });
      return result as boolean;
    } catch (error) {
      console.log('[JwtAuthGuard] canActivate error', {
        error: error instanceof Error ? error.message : String(error),
      });
      throw error;
    }
  }

  handleRequest(err: any, user: any, info: any) {
    logger.debug('[JwtAuthGuard] handleRequest', {
      hasError: !!err,
      hasUser: !!user,
      info: info?.message || info,
      userId: user?.userId,
    });

    if (err || !user) {
      logger.warn('[JwtAuthGuard] Authentication failed', {
        error: err instanceof Error ? err.message : err || 'No user',
      });
      throw err || new UnauthorizedException();
    }
    return user;
  }
}
