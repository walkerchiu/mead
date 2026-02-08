import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { GqlArgumentsHost, GqlExceptionFilter } from '@nestjs/graphql';
import { GraphQLError } from 'graphql';
import { ConfigService } from '@nestjs/config';
import { logger } from '../services/logger.service';

@Catch()
export class AllExceptionsFilter
  implements ExceptionFilter, GqlExceptionFilter
{
  private readonly isDevelopment: boolean;

  constructor(private configService: ConfigService) {
    this.isDevelopment = this.configService.get('NODE_ENV') !== 'production';
  }

  catch(exception: unknown, host: ArgumentsHost) {
    const gqlHost = GqlArgumentsHost.create(host);
    const ctx = gqlHost.getContext();
    let httpReq: { requestId?: string } | undefined;
    try {
      httpReq =
        host.getType<'graphql' | 'http'>() === 'http'
          ? host.switchToHttp().getRequest()
          : undefined;
    } catch {
      /* ignore */
    }
    const requestId =
      ctx?.requestId || ctx?.req?.requestId || httpReq?.requestId || 'unknown';

    if (host.getType<'graphql' | 'http'>() === 'graphql') {
      // GraphQL exception
      return this.handleGraphQLException(exception, requestId);
    }

    // HTTP exception
    const httpHost = host.switchToHttp();
    const response = httpHost.getResponse();
    const request = httpHost.getRequest();

    const status =
      exception instanceof HttpException
        ? exception.getStatus()
        : HttpStatus.INTERNAL_SERVER_ERROR;

    const message =
      exception instanceof HttpException
        ? exception.getResponse()
        : 'Internal server error';

    // 更詳細的錯誤日誌
    if (exception instanceof Error) {
      logger.error(`[${requestId}] Exception`, {
        name: exception.name,
        message: exception.message,
        stack: exception.stack,
        error: exception,
      });
    } else {
      logger.error(`[${requestId}] Exception`, { error: exception });
    }

    response.status(status).json({
      statusCode: status,
      timestamp: new Date().toISOString(),
      path: request.url,
      requestId,
      message,
    });
  }

  private handleGraphQLException(exception: unknown, requestId: string) {
    logger.error(`[${requestId}] GraphQL Exception`, { error: exception });

    if (exception instanceof HttpException) {
      const status = exception.getStatus();
      const response = exception.getResponse();

      // 提取錯誤訊息
      let message = 'An error occurred';
      let details: any = undefined;

      if (typeof response === 'string') {
        message = response;
      } else if (typeof response === 'object' && response !== null) {
        message = (response as any).message || message;
        // 保留其他詳情（如驗證錯誤）
        if ((response as any).errors || (response as any).validationErrors) {
          details = response;
        }
      }

      // 統一錯誤代碼
      const code = this.getErrorCode(status);

      const extensions: any = {
        code,
        requestId,
        timestamp: new Date().toISOString(),
        http: { status },
      };

      // 僅本地開發環境顯示 stack trace（需明確啟用）
      const isLocalDev =
        this.isDevelopment &&
        process.env.SHOW_STACK_TRACE === 'true' &&
        !process.env.CI; // CI 環境不顯示

      if (isLocalDev && exception.stack) {
        extensions.stacktrace = exception.stack.split('\n');
      }

      // 添加額外詳情
      if (details) {
        extensions.details = details;
      }

      return new GraphQLError(message, { extensions });
    }

    // 未知錯誤
    const extensions: any = {
      code: 'INTERNAL_SERVER_ERROR',
      requestId,
      timestamp: new Date().toISOString(),
    };

    if (this.isDevelopment && exception instanceof Error) {
      extensions.stacktrace = exception.stack?.split('\n');
      extensions.originalError = {
        name: exception.name,
        message: exception.message,
      };
    }

    return new GraphQLError('Internal server error', { extensions });
  }

  /**
   * 映射 HTTP Status 到 GraphQL Error Code
   */
  private getErrorCode(status: number): string {
    const codeMap: Record<number, string> = {
      400: 'BAD_USER_INPUT',
      401: 'UNAUTHENTICATED',
      403: 'FORBIDDEN',
      404: 'NOT_FOUND',
      429: 'TOO_MANY_REQUESTS',
      500: 'INTERNAL_SERVER_ERROR',
    };

    return codeMap[status] || 'INTERNAL_SERVER_ERROR';
  }
}
