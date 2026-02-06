/* eslint-disable @typescript-eslint/no-explicit-any */

import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
} from '@nestjs/common';
import { GqlExecutionContext } from '@nestjs/graphql';
import { Observable, throwError } from 'rxjs';
import { tap, catchError } from 'rxjs/operators';
import { AuditLogService } from './audit-log.service';
import { AuditLogPubSubService } from './audit-log-pubsub.service';
import { logger } from '../common/services/logger.service';

/**
 * 稽核日誌攔截器
 * 自動記錄所有 HTTP 和 GraphQL 請求
 *
 * 智能提取規則：
 * 1. userId: 從 context.user?.id, context.currentUser?.id, response.data?.userId 提取
 * 2. entityId: 從 response.data?.id, response.data?.[entity]?.id 提取
 * 3. action/entity: 從 GraphQL 操作名稱或 HTTP 路徑推斷
 */
@Injectable()
export class AuditLogInterceptor implements NestInterceptor {
  constructor(
    private auditLogService: AuditLogService,
    private pubSubService: AuditLogPubSubService,
  ) {}

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const startTime = Date.now();
    const contextType = context.getType<'graphql' | 'http'>();

    // 取得基本資訊
    let requestId: string;
    let method: string;
    let path: string;
    let ipAddress: string;
    let userAgent: string;
    let operationName: string;
    let entity: string;
    let action: string;
    let contextUserId: string | undefined; // 從 context 中取得的 userId
    let requestInput: any; // 請求輸入參數
    let req: any;
    let gqlContext: any;

    if (contextType === 'graphql') {
      // GraphQL 請求
      const gqlCtx = GqlExecutionContext.create(context);
      const info = gqlCtx.getInfo();

      // ✅ 跳過 Subscriptions（WebSocket）
      // Subscriptions 沒有 req 對象，不需要審計日誌
      if (info?.operation?.operation === 'subscription') {
        return next.handle();
      }

      // ✅ 跳過 Audit Log 查詢（避免無限循環）
      operationName = info.fieldName;
      const auditLogOperations = [
        'auditLogs',
        'auditLogsPaginated',
        'auditLogsByRequestId',
        'auditLogsByUser',
        'auditLogsByEntity',
        'auditLogStatistics',
      ];
      if (auditLogOperations.includes(operationName)) {
        logger.debug(
          `[AuditLog] Skipping audit log operation: ${operationName}`,
        );
        return next.handle();
      }

      gqlContext = gqlCtx.getContext();
      req = gqlContext.req;

      // 確保有 requestId (優先使用 req.requestId, 否則從 header 取得)
      requestId = req.requestId || req.headers['x-request-id'];
      method = 'GraphQL';
      path = `/graphql/${operationName}`;
      ipAddress = req.ip || req.connection?.remoteAddress;
      userAgent = req.headers['user-agent'];

      // 提取 GraphQL 輸入參數（args）
      const args = gqlCtx.getArgs();
      requestInput = {
        args: this.sanitizeData(args),
        variables: this.sanitizeData(info.variableValues),
      };

      // 嘗試從 context 中取得當前使用者 ID
      contextUserId = this.extractUserIdFromContext(gqlContext);

      // 推斷實體和操作類型
      const parsedAction = this.parseGraphQLOperation(
        info.operation.operation,
        operationName,
      );
      entity = parsedAction.entity;
      action = parsedAction.action;
    } else {
      // HTTP 請求
      req = context.switchToHttp().getRequest();

      // 確保有 requestId (優先使用 req.requestId, 否則從 header 取得)
      requestId = req.requestId || req.headers['x-request-id'];
      method = req.method;
      path = req.url;
      ipAddress = req.ip || req.connection?.remoteAddress;
      userAgent = req.headers['user-agent'];

      // 提取 HTTP 輸入參數
      requestInput = {
        body: this.sanitizeData(req.body),
        query: this.sanitizeData(req.query),
        params: this.sanitizeData(req.params),
      };

      // 嘗試從 request 中取得當前使用者 ID
      contextUserId = this.extractUserIdFromContext(req);

      // 推斷實體和操作類型
      const parsedAction = this.parseHttpRequest(method, path);
      entity = parsedAction.entity;
      action = parsedAction.action;
    }

    // 確保 requestId 有效 (如果還是沒有，記錄警告但繼續)
    if (!requestId) {
      logger.warn(`[AuditLog] requestId 不存在於 ${contextType} 請求: ${path}`);
      logger.warn('[AuditLog] 檢查 RequestIdInterceptor 是否正確設定');
      // 不記錄無效的審計日誌
      return next.handle();
    }

    // 執行請求並記錄
    return next.handle().pipe(
      tap(async (response) => {
        const duration = Date.now() - startTime;

        logger.debug('[AuditLog] Processing response', {
          operationName,
          responseType: typeof response,
          duration,
        });

        // 智能提取 userId 和 entityId
        const extractedData = this.extractAuditData(
          response,
          entity,
          contextUserId,
        );

        // 建立稽核日誌
        const auditLogData = {
          requestId,
          userId: extractedData.userId,
          action,
          entity,
          entityId: extractedData.entityId,
          status: 'SUCCESS' as const,
          method,
          path,
          ipAddress,
          userAgent,
          details: {
            request: requestInput,
            response: this.sanitizeResponse(response, action),
          },
          duration,
        };

        // 成功記錄（發送到 RabbitMQ 隊列）
        // ⚠️ 注意：訂閱事件會在 Consumer 寫入資料庫後發送
        await this.auditLogService.create(auditLogData);
      }),
      catchError(async (error) => {
        const duration = Date.now() - startTime;

        // 建立失敗記錄
        const auditLogData = {
          requestId,
          userId: contextUserId,
          action,
          entity,
          status: 'FAILURE' as const,
          method,
          path,
          ipAddress,
          userAgent,
          details: {
            request: requestInput,
            error: {
              message: error.message,
              code: error.extensions?.code || error.status,
              stack:
                process.env.NODE_ENV === 'development'
                  ? error.stack
                  : undefined,
            },
          },
          duration,
        };

        // 失敗記錄（發送到 RabbitMQ 隊列）
        // ⚠️ 注意：訂閱事件會在 Consumer 寫入資料庫後發送
        await this.auditLogService.create(auditLogData);

        return throwError(() => error);
      }),
    );
  }

  /**
   * 從 context 中提取當前使用者 ID
   */
  private extractUserIdFromContext(context: any): string | undefined {
    // 嘗試多種常見的 user 屬性位置
    // 注意：JWT strategy 返回的是 userId，而不是 id
    return (
      context.user?.id ||
      context.user?.userId ||
      context.currentUser?.id ||
      context.currentUser?.userId ||
      context.req?.user?.id ||
      context.req?.user?.userId ||
      context.req?.currentUser?.id ||
      context.req?.currentUser?.userId
    );
  }

  /**
   * 智能提取 userId 和 entityId
   */
  private extractAuditData(
    response: any,
    entity: string,
    contextUserId?: string,
  ): {
    userId?: string;
    entityId?: string;
  } {
    const result: { userId?: string; entityId?: string } = {
      userId: contextUserId, // 優先使用 context 中的 userId
    };

    if (!response) {
      return result;
    }

    // 處理標準 BaseResponse 格式
    const data = response.data || response;

    // 提取 userId（如果 context 中沒有）
    if (!result.userId) {
      result.userId =
        data.userId ||
        data.user?.id ||
        data.createdBy?.id ||
        data.updatedBy?.id;
    }

    // 提取 entityId - 嘗試多種常見模式
    result.entityId =
      data.id || // 最常見：data.id
      data[entity.toLowerCase()]?.id || // data.user?.id
      data[`${entity.toLowerCase()}Id`] || // data.userId
      this.findIdInObject(data, entity); // 深度搜尋

    return result;
  }

  /**
   * 在物件中深度搜尋 ID
   */
  private findIdInObject(obj: any, entity: string): string | undefined {
    if (!obj || typeof obj !== 'object') {
      return undefined;
    }

    const lowerEntity = entity.toLowerCase();

    // 遞迴搜尋 (限制深度避免效能問題)
    const search = (o: any, depth = 0): string | undefined => {
      if (depth > 3) return undefined; // 最多搜尋 3 層

      for (const key in o) {
        if (typeof o[key] === 'string' && key.toLowerCase().includes('id')) {
          // 找到包含 id 的字串欄位
          if (
            key.toLowerCase() === 'id' ||
            key.toLowerCase() === `${lowerEntity}id`
          ) {
            return o[key];
          }
        } else if (typeof o[key] === 'object' && o[key] !== null) {
          const found = search(o[key], depth + 1);
          if (found) return found;
        }
      }
      return undefined;
    };

    return search(obj);
  }

  /**
   * 解析 GraphQL 操作
   */
  private parseGraphQLOperation(
    operation: string,
    fieldName: string,
  ): { entity: string; action: string } {
    // 嘗試從 fieldName 推斷實體和操作
    // 例如：createUser -> User, CREATE
    // getUsers -> User, READ
    // updatePost -> Post, UPDATE
    // deleteComment -> Comment, DELETE

    let action = operation === 'mutation' ? 'MUTATION' : 'QUERY';
    let entity = 'Unknown';

    // 常見操作模式匹配
    const patterns = [
      // 2FA 操作
      {
        regex: /^requestEnable2FA$/i,
        action: 'REQUEST_ENABLE',
        entity: 'TwoFactorAuth',
      },
      {
        regex: /^confirmEnable2FA$/i,
        action: 'ENABLE',
        entity: 'TwoFactorAuth',
      },
      {
        regex: /^requestDisable2FA$/i,
        action: 'REQUEST_DISABLE',
        entity: 'TwoFactorAuth',
      },
      {
        regex: /^confirmDisable2FA$/i,
        action: 'DISABLE',
        entity: 'TwoFactorAuth',
      },
      { regex: /^my2FASettings$/i, action: 'READ', entity: 'TwoFactorAuth' },
      // Session 操作
      {
        regex:
          /^(revoke|batchRevoke|revokeOtherDevices|emergencyRevokeAll).*Session/i,
        action: 'REVOKE',
        entity: 'Session',
      },
      // 通用 CRUD 操作
      { regex: /^create(\w+)$/i, action: 'CREATE' },
      { regex: /^update(\w+)$/i, action: 'UPDATE' },
      { regex: /^delete(\w+)$/i, action: 'DELETE' },
      { regex: /^get(\w+)s?$/i, action: 'READ' },
      { regex: /^find(\w+)s?$/i, action: 'READ' },
      { regex: /^list(\w+)s?$/i, action: 'LIST' },
      { regex: /^my(\w+)$/i, action: 'READ' },
    ];

    for (const pattern of patterns) {
      const match = fieldName.match(pattern.regex);
      if (match) {
        action = pattern.action;
        // 如果 pattern 有指定 entity，使用指定的；否則從匹配中提取
        entity = (pattern as any).entity || match[1];
        break;
      }
    }

    // 如果無法推斷，使用原始 fieldName
    if (entity === 'Unknown') {
      entity = fieldName;
    }

    return {
      entity,
      action: `${action}_${entity.toUpperCase()}`,
    };
  }

  /**
   * 解析 HTTP 請求
   */
  private parseHttpRequest(
    method: string,
    path: string,
  ): { entity: string; action: string } {
    // 從路徑推斷實體
    // 例如：/api/users -> User
    const pathParts = path.split('/').filter((p) => p && p !== 'api');
    const entity = pathParts[0] || 'Unknown';

    const actionMap: Record<string, string> = {
      GET: 'READ',
      POST: 'CREATE',
      PUT: 'UPDATE',
      PATCH: 'UPDATE',
      DELETE: 'DELETE',
    };

    const action = actionMap[method] || method;

    return {
      entity: entity.toUpperCase(),
      action: `${action}_${entity.toUpperCase()}`,
    };
  }

  /**
   * 清理 response 資料（防止巨大的 audit logs 記錄）
   */
  private sanitizeResponse(response: any, action: string): any {
    // ⚡ 對於 audit logs 查詢，不記錄詳細的 response
    if (action.includes('AUDITLOG')) {
      return {
        note: 'Response omitted to prevent recursive logging',
        recordCount: Array.isArray(response?.data)
          ? response.data.length
          : Array.isArray(response)
            ? response.length
            : response?.data?.length || 0,
      };
    }

    // ⚡ 對於其他大型列表查詢，限制記錄數量
    const data = response?.data || response;
    if (Array.isArray(data) && data.length > 10) {
      return {
        note: `Large array response (${data.length} items), showing first 10`,
        items: this.sanitizeData(data.slice(0, 10)),
      };
    }

    return this.sanitizeData(response);
  }

  /**
   * 清理敏感資料
   */
  private sanitizeData(data: any): any {
    if (!data) return data;

    // 複製物件避免修改原始資料
    let sanitized: any;
    try {
      sanitized = JSON.parse(JSON.stringify(data));
    } catch (error) {
      // 如果序列化失敗，返回簡化版本
      logger.error('[AuditLog] Failed to sanitize data', {
        error: error instanceof Error ? error.message : String(error),
      });
      return { serialization_error: 'Unable to serialize response' };
    }

    // 移除敏感欄位（更全面的列表）
    const sensitiveFields = [
      // 密碼相關
      'password',
      'passwd',
      'pwd',
      'newPassword',
      'oldPassword',
      'currentPassword',
      // Token 相關（所有 token 都是敏感資料）
      'token',
      'accessToken',
      'access_token',
      'refreshToken',
      'refresh_token',
      'idToken',
      'bearerToken',
      // 密鑰相關
      'secret',
      'apiKey',
      'apikey',
      'api_key',
      'privateKey',
      'private_key',
      'encryptionKey',
      // 2FA/OTP 相關
      'otp',
      'totp',
      'code',
      'verificationCode',
      'pin',
      'mfaCode',
      // 金融相關
      'creditCard',
      'credit_card',
      'cardNumber',
      'card_number',
      'cvv',
      'cvc',
      'bankAccount',
      // 身份相關
      'ssn',
      'socialSecurity',
      'social_security',
      'nationalId',
      'passport',
      // Session 相關
      'sessionId',
      'cookie',
    ];

    const removeSensitive = (obj: any) => {
      if (typeof obj !== 'object' || obj === null) return;

      for (const key in obj) {
        if (
          sensitiveFields.some((field) => key.toLowerCase().includes(field))
        ) {
          obj[key] = '[REDACTED]';
        } else if (typeof obj[key] === 'object') {
          removeSensitive(obj[key]);
        }
      }
    };

    removeSensitive(sanitized);
    return sanitized;
  }
}
