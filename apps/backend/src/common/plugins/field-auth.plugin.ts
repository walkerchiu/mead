import { Plugin } from '@nestjs/apollo';
import { ApolloServerPlugin, GraphQLRequestListener } from '@apollo/server';
import { Logger } from '@nestjs/common';
import { AccessScope } from '../enums/access-scope.enum';
import { FieldMetadataCache } from '../services/field-metadata-cache.service';
import {
  FIELD_SENSITIVE,
  FIELD_ADMIN_ONLY,
  FIELD_SELF_ACCESSIBLE,
} from '../decorators/field-auth.decorator';

/**
 * GraphQL 欄位級別權限控制 Plugin
 *
 * 效能優化策略：
 * 1. 從 JWT context 取得權限（避免資料庫查詢）
 * 2. 使用 Set 進行 O(1) 權限查找
 * 3. 批次過濾欄位（一次遍歷）
 * 4. 原地修改物件（避免複製）
 * 5. 非遞迴處理巢狀結構（使用佇列）
 * 6. 啟動時快取欄位規則（避免運行時反射）
 */
@Plugin()
export class FieldAuthPlugin implements ApolloServerPlugin {
  private readonly logger = new Logger(FieldAuthPlugin.name);
  private performanceThresholdMs = 10; // 效能警告閾值

  constructor(private fieldMetadataCache?: FieldMetadataCache) {}

  async requestDidStart(): Promise<GraphQLRequestListener<any>> {
    const filterData = this.filterData.bind(this);
    const extractPermissionsSet = this.extractPermissionsSet.bind(this);
    const removeNeverExposedFields = this.removeNeverExposedFields.bind(this);
    const logger = this.logger;
    const performanceThresholdMs = this.performanceThresholdMs;

    return {
      async willSendResponse({ response, contextValue, request }) {
        // 只處理成功的響應
        if (
          response.body.kind !== 'single' ||
          !response.body.singleResult.data
        ) {
          return;
        }

        const user = contextValue.req?.user;
        const operationName = request?.operationName;

        // 認證相關的 mutation 不需要過濾敏感欄位（因為是返回給用戶自己的）
        const authOperations = [
          'login',
          'Login',
          'refreshToken',
          'RefreshToken',
          'registerCustomer',
          'RegisterCustomer',
          'registerAdmin',
          'RegisterAdmin',
          'verifyTwoFactorLogin',
          'VerifyTwoFactorLogin',
        ];

        logger.debug('[FieldAuthPlugin] Processing response', {
          operationName,
          hasUser: !!user,
          isAuthOperation: authOperations.includes(operationName || ''),
        });

        // 效能監控
        const startTime = performance.now();

        // 如果沒有使用者資訊
        if (!user) {
          const data = response.body.singleResult.data;

          // 對於認證操作，只移除永不暴露的欄位（password, refreshToken hash）
          if (authOperations.includes(operationName || '')) {
            logger.debug(
              '[FieldAuthPlugin] Auth operation, removing never-exposed fields only',
              {
                operationName,
              },
            );
            removeNeverExposedFields(data);
          } else {
            logger.debug(
              '[FieldAuthPlugin] Non-auth operation without user, filtering all sensitive fields',
              {
                operationName,
              },
            );
            // 移除所有敏感欄位和 Admin 欄位
            filterData(data, null);
          }

          const elapsed = performance.now() - startTime;
          logger.log(
            `[FieldAuthPlugin] Filtering complete: ${elapsed.toFixed(2)}ms (no user)`,
          );
          return;
        }

        // 從 JWT 中取得權限資訊（避免資料庫查詢）
        const accessScopesSet = new Set<AccessScope>(user.accessScopes || []);
        const permissionsSet = extractPermissionsSet(user);

        // 過濾資料
        filterData(response.body.singleResult.data, {
          userId: user.userId,
          accessScopes: accessScopesSet,
          permissions: permissionsSet,
          isAdmin: accessScopesSet.has(AccessScope.ADMIN_SCOPE),
        });

        // 效能日誌 - 總是輸出，不只警告
        const elapsed = performance.now() - startTime;
        logger.log(
          `[FieldAuthPlugin] Filtering complete: ${elapsed.toFixed(2)}ms for ${operationName}`,
        );

        if (elapsed > performanceThresholdMs) {
          logger.warn(
            `[FieldAuthPlugin] ⚠️ Slow field filtering: ${elapsed.toFixed(2)}ms (threshold: ${performanceThresholdMs}ms)`,
          );
        }
      },
    };
  }

  /**
   * 從使用者資訊中提取權限集合（O(n) 一次性處理）
   */
  private extractPermissionsSet(user: any): Set<string> {
    const permissions = new Set<string>();

    if (!user.roles || !Array.isArray(user.roles)) {
      return permissions;
    }

    // 根據使用者的 scope 和 role 推斷權限
    // 這裡簡化處理：假設 SUPER_ADMIN 有所有權限
    for (const roleInfo of user.roles) {
      if (roleInfo.roleNames?.includes('SUPER_ADMIN')) {
        // SUPER_ADMIN 有所有權限
        permissions.add('*');
      }
      if (roleInfo.roleNames?.includes('OWNER')) {
        // OWNER 有該 scope 的所有權限
        permissions.add(`${roleInfo.scope}:*`);
      }
      // 可以根據需要添加更多規則
    }

    return permissions;
  }

  /**
   * 移除永不暴露的欄位（password, refreshToken）
   * 用於認證響應，確保即使在登入/註冊時也不會暴露這些敏感資訊
   */
  /**
   * 移除永不暴露的欄位（password, refreshToken hash）
   * 注意：這裡的 refreshToken 是指 User 物件中的 refresh token hash，
   * 不是 GraphQL mutation 的名稱
   */
  private removeNeverExposedFields(data: any): void {
    if (!data || typeof data !== 'object') {
      return;
    }

    const queue: { obj: any; depth: number }[] = [{ obj: data, depth: 0 }];
    const visited = new WeakSet();

    while (queue.length > 0) {
      const { obj: current, depth } = queue.shift();

      if (!current || typeof current !== 'object' || visited.has(current)) {
        continue;
      }

      visited.add(current);

      if (Array.isArray(current)) {
        for (const item of current) {
          if (item && typeof item === 'object') {
            queue.push({ obj: item, depth: depth + 1 });
          }
        }
      } else {
        // 只在深度 > 0 時刪除敏感欄位（避免刪除頂層 mutation 名稱）
        if (depth > 0) {
          delete current.password;
          delete current.refreshToken; // User 物件中的 refresh token hash
        }

        // 將子物件加入佇列
        for (const key of Object.keys(current)) {
          const value = current[key];
          if (value && typeof value === 'object') {
            queue.push({ obj: value, depth: depth + 1 });
          }
        }
      }
    }
  }

  /**
   * 過濾資料（非遞迴，使用佇列）
   */
  private filterData(
    data: any,
    userContext: {
      userId: string;
      accessScopes: Set<AccessScope>;
      permissions: Set<string>;
      isAdmin: boolean;
    } | null,
  ): void {
    if (!data || typeof data !== 'object') {
      return;
    }

    // 使用佇列進行廣度優先遍歷（避免深度遞迴）
    // 佇列項目格式：{ obj: 當前對象, parent: 父對象 }
    const queue: Array<{ obj: any; parent: any }> = [
      { obj: data, parent: null },
    ];
    const visited = new WeakSet();

    while (queue.length > 0) {
      const { obj: current, parent } = queue.shift();

      if (!current || typeof current !== 'object' || visited.has(current)) {
        continue;
      }

      visited.add(current);

      if (Array.isArray(current)) {
        // 處理陣列
        for (const item of current) {
          if (item && typeof item === 'object') {
            queue.push({ obj: item, parent });
          }
        }
      } else {
        // 處理物件
        this.filterObject(current, userContext, parent);

        // 將子物件加入佇列
        for (const key of Object.keys(current)) {
          const value = current[key];
          if (value && typeof value === 'object') {
            queue.push({ obj: value, parent: current });
          }
        }
      }
    }
  }

  /**
   * 過濾單個物件的欄位（批次處理）
   */
  private filterObject(
    obj: any,
    userContext: {
      userId: string;
      accessScopes: Set<AccessScope>;
      permissions: Set<string>;
      isAdmin: boolean;
    } | null,
    parent: any = null,
  ): void {
    // 取得物件的所有鍵（一次性）
    const keys = Object.keys(obj);

    for (const fieldName of keys) {
      // 檢查是否應該移除此欄位
      if (this.shouldRemoveField(fieldName, userContext, obj, parent)) {
        delete obj[fieldName]; // 原地刪除（高效）
      }
    }
  }

  /**
   * 檢查欄位是否應該被移除
   */
  private shouldRemoveField(
    fieldName: string,
    userContext: {
      userId: string;
      accessScopes: Set<AccessScope>;
      permissions: Set<string>;
      isAdmin: boolean;
    } | null,
    obj: any,
    parent: any = null,
  ): boolean {
    // 永不暴露的欄位
    if (fieldName === 'password' || fieldName === 'refreshToken') {
      return true;
    }

    // 動態查找欄位規則
    const isSensitive = this.checkFieldMetadata(
      obj,
      fieldName,
      FIELD_SENSITIVE,
    );
    const isAdminOnly = this.checkFieldMetadata(
      obj,
      fieldName,
      FIELD_ADMIN_ONLY,
    );
    const selfAccessibleConfig = this.checkFieldMetadata(
      obj,
      fieldName,
      FIELD_SELF_ACCESSIBLE,
    );

    // 如果沒有使用者 context，移除所有敏感欄位和 Admin 欄位
    if (!userContext) {
      return isSensitive || isAdminOnly;
    }

    // 檢查 Admin-only 欄位（只有 Admin 可見）
    if (isAdminOnly && !userContext.isAdmin) {
      return true;
    }

    // 檢查敏感欄位
    if (isSensitive) {
      // Admin 可以看到所有敏感欄位
      if (userContext.isAdmin) {
        return false;
      }

      // 檢查是否為 Self-Accessible 欄位
      if (selfAccessibleConfig) {
        // 嘗試從對象中獲取資源 ID
        const idField = selfAccessibleConfig.idField || 'id';
        const resourceId = this.getResourceId(obj, parent, idField);
        if (resourceId && resourceId === userContext.userId) {
          // 是自己的資料，允許訪問
          return false;
        }
        // 不是自己的資料，移除欄位
        return true;
      }

      // 對於非 Self-Accessible 的敏感欄位，Customer 可以看到
      if (userContext.accessScopes.has(AccessScope.CUSTOMER_SCOPE)) {
        return false;
      }

      // Public 看不到敏感欄位
      return true;
    }

    // 其他欄位都可見
    return false;
  }

  /**
   * 動態檢查欄位 metadata
   * 優先使用 FieldMetadataCache，fallback 到直接反射，最後使用硬編碼規則
   */
  private checkFieldMetadata(
    obj: any,
    fieldName: string,
    metadataKey: symbol,
  ): any {
    // 如果有 FieldMetadataCache 且對象有 constructor
    if (this.fieldMetadataCache && obj && obj.constructor) {
      const rules = this.fieldMetadataCache.getFieldRules(obj.constructor);
      if (rules && rules.has(fieldName)) {
        const rule = rules.get(fieldName);
        // 根據 metadataKey 返回相應的值
        if (metadataKey === FIELD_SENSITIVE) {
          return rule.isSensitive;
        }
        if (metadataKey === FIELD_ADMIN_ONLY) {
          return rule.isAdminOnly;
        }
        // FIELD_SELF_ACCESSIBLE 需要從 metadata 讀取
      }
    }

    // Fallback 1: 嘗試通過反射讀取（效能較差但向後兼容）
    try {
      if (obj && obj.constructor && obj.constructor.prototype) {
        const metadata = Reflect.getMetadata(
          metadataKey,
          obj.constructor.prototype,
          fieldName,
        );
        if (metadata !== undefined) {
          return metadata;
        }
      }
    } catch {
      // 忽略反射錯誤
    }

    // Fallback 2: 硬編碼規則（用於測試和向後兼容）
    if (metadataKey === FIELD_SENSITIVE) {
      return this.isHardcodedSensitiveField(fieldName);
    }
    if (metadataKey === FIELD_ADMIN_ONLY) {
      return this.isHardcodedAdminOnlyField(fieldName);
    }
    if (metadataKey === FIELD_SELF_ACCESSIBLE) {
      return this.isHardcodedSelfAccessibleField(fieldName)
        ? { idField: 'id' }
        : undefined;
    }

    return undefined;
  }

  /**
   * 硬編碼的敏感欄位（作為 fallback）
   */
  private isHardcodedSensitiveField(fieldName: string): boolean {
    const sensitiveFields = new Set([
      'email',
      'phone',
      'address',
      'lastLoginAt',
    ]);
    return sensitiveFields.has(fieldName);
  }

  /**
   * 硬編碼的 Admin-only 欄位（作為 fallback）
   */
  private isHardcodedAdminOnlyField(fieldName: string): boolean {
    const adminOnlyFields = new Set(['deletedAt']);
    return adminOnlyFields.has(fieldName);
  }

  /**
   * 硬編碼的 Self-Accessible 欄位（作為 fallback）
   */
  private isHardcodedSelfAccessibleField(fieldName: string): boolean {
    const selfAccessibleFields = new Set([
      'email',
      'phone',
      'address',
      'lastLoginAt',
    ]);
    return selfAccessibleFields.has(fieldName);
  }

  /**
   * 從對象中獲取資源 ID
   * 嘗試多個常見的 ID 欄位名稱
   */
  private getResourceId(
    obj: any,
    parent: any,
    idField: string = 'id',
  ): string | null {
    if (!obj || typeof obj !== 'object') {
      return null;
    }

    // 優先使用指定的 idField
    if (obj[idField]) {
      return String(obj[idField]);
    }

    // 優先使用 userId（對於 Profile 等關聯對象）
    if (obj.userId) {
      return String(obj.userId);
    }

    // 如果當前對象沒有 userId，嘗試從父對象獲取 id
    // 這適用於 profile 這種從 user 嵌套查詢的情況
    if (parent && parent.id) {
      return String(parent.id);
    }

    // 其次嘗試常見的 ID 欄位
    const idCandidates = ['id', 'ownerId'];

    for (const candidate of idCandidates) {
      if (obj[candidate]) {
        return String(obj[candidate]);
      }
    }

    return null;
  }
}
