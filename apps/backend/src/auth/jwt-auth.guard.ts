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
   * 從 GraphQL context 中提取 request
   */
  getRequest(context: ExecutionContext) {
    const ctx = GqlExecutionContext.create(context);
    const req = ctx.getContext().req;
    logger.debug('[JwtAuthGuard] getRequest called', {
      hasAuthorization: !!req?.headers?.authorization,
    });
    return req;
  }

  async canActivate(context: ExecutionContext): Promise<boolean> {
    logger.debug('[JwtAuthGuard] canActivate called');
    try {
      const result = await super.canActivate(context);
      logger.debug('[JwtAuthGuard] canActivate result', { result });
      return result as boolean;
    } catch (error) {
      logger.error('[JwtAuthGuard] canActivate error', {
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
