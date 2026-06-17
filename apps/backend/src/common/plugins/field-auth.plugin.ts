import { Plugin } from '@nestjs/apollo';
import { ApolloServerPlugin, GraphQLRequestListener } from '@apollo/server';
import { Logger } from '@nestjs/common';
import { AccessScope } from '../enums/access-scope.enum';
import { FieldMetadataCache } from '../services/field-metadata-cache.service';
import {
  FIELD_SENSITIVE,
  FIELD_HQ_ONLY,
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
          'verifyTwoFactorLogin',
          'VerifyTwoFactorLogin',
        ];

        // 檢查是否是認證操作
        // 1. 先檢查 operationName
        let isAuthOperation = authOperations.includes(operationName || '');

        // 2. 如果 operationName 為 undefined，檢查回應資料的根鍵
        //    （例如 {login: {...}}, {refreshToken: {...}}）
        if (!isAuthOperation && response.body.singleResult.data) {
          const dataKeys = Object.keys(response.body.singleResult.data);
          isAuthOperation = dataKeys.some((key) =>
            authOperations.includes(key),
          );
        }

        logger.debug('[FieldAuthPlugin] Processing response', {
          operationName,
          operationNameType: typeof operationName,
          hasUser: !!user,
          userId: user?.userId,
          isHQ: user?.accessScopes?.includes('HQ_SCOPE'),
          isAuthOperation,
          dataKeys: response.body.singleResult.data
            ? Object.keys(response.body.singleResult.data)
            : [],
        });

        // 效能監控
        const startTime = performance.now();

        // 如果沒有用戶資訊
        if (!user) {
          const data = response.body.singleResult.data;

          // 對於認證操作，只移除永不暴露的欄位（password, refreshToken hash）
          if (isAuthOperation) {
            logger.debug(
              '[FieldAuthPlugin] Auth operation, removing never-exposed fields only',
              {
                operationName,
                isAuthOperation,
              },
            );
            removeNeverExposedFields(data);
          } else {
            logger.debug(
              '[FieldAuthPlugin] Non-auth operation without user, filtering all sensitive fields',
              {
                operationName,
                isAuthOperation,
              },
            );
            // 移除所有敏感欄位和 HQ 欄位
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
          isHQ: accessScopesSet.has(AccessScope.HQ_SCOPE),
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
   * 從用戶資訊中提取權限集合（O(n) 一次性處理）
   * 優先使用 JWT 中的 permissions 陣列
   */
  private extractPermissionsSet(user: any): Set<string> {
    const permissions = new Set<string>();

    // 優先使用 JWT payload 中的 permissions 陣列
    if (user.permissions && Array.isArray(user.permissions)) {
      for (const permission of user.permissions) {
        permissions.add(permission);
      }
      return permissions;
    }

    // Fallback: 從 roles 推斷權限（向後兼容）
    if (!user.roles || !Array.isArray(user.roles)) {
      return permissions;
    }

    // 根據用戶的 scope 和 role 推斷權限（統一五階模型已無角色式全域繞過；
    // OWNER/ADMIN 的全權來自 seed 階段展開的 glob，正常情況下會出現在 user.permissions，
    // 此處僅為缺 permissions claim 時的最小向後兼容）
    for (const roleInfo of user.roles) {
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
      isHQ: boolean;
    } | null,
  ): void {
    if (!data || typeof data !== 'object') {
      return;
    }

    // 使用佇列進行廣度優先遍歷（避免深度遞迴）
    // 佇列項目格式：{ obj: 當前對象, parent: 父對象, depth: 深度 }
    const queue: Array<{ obj: any; parent: any; depth: number }> = [
      { obj: data, parent: null, depth: 0 },
    ];
    const visited = new WeakSet();

    while (queue.length > 0) {
      const { obj: current, parent, depth } = queue.shift();

      if (!current || typeof current !== 'object' || visited.has(current)) {
        continue;
      }

      visited.add(current);

      if (Array.isArray(current)) {
        // 處理陣列
        for (const item of current) {
          if (item && typeof item === 'object') {
            queue.push({ obj: item, parent, depth: depth + 1 });
          }
        }
      } else {
        // 處理物件
        this.filterObject(current, userContext, parent, depth);

        // 將子物件加入佇列
        for (const key of Object.keys(current)) {
          const value = current[key];
          if (value && typeof value === 'object') {
            queue.push({ obj: value, parent: current, depth: depth + 1 });
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
      isHQ: boolean;
    } | null,
    parent: any = null,
    depth: number = 0,
  ): void {
    // 取得物件的所有鍵（一次性）
    const keys = Object.keys(obj);

    for (const fieldName of keys) {
      // 檢查是否應該移除此欄位
      if (this.shouldRemoveField(fieldName, userContext, obj, parent, depth)) {
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
      isHQ: boolean;
    } | null,
    obj: any,
    parent: any = null,
    depth: number = 0,
  ): boolean {
    // 永不暴露的欄位 - 但只在深度 > 0 時刪除（避免刪除頂層 mutation 名稱）
    // 例如 refreshToken mutation 或其他需保護敏感欄位的 mutation
    if (
      depth > 0 &&
      (fieldName === 'password' || fieldName === 'refreshToken')
    ) {
      // 檢查值是否已經被遮罩 (例如 '[REDACTED]')
      const fieldValue = obj[fieldName];
      if (fieldValue === '[REDACTED]' || fieldValue === '[MASKED]') {
        // 已經被遮罩的敏感欄位可以保留(用於 audit log 等場景)
        return false;
      }
      return true;
    }

    // 動態查找欄位規則
    const isSensitive = this.checkFieldMetadata(
      obj,
      fieldName,
      FIELD_SENSITIVE,
    );
    const isHQOnly = this.checkFieldMetadata(obj, fieldName, FIELD_HQ_ONLY);
    const selfAccessibleConfig = this.checkFieldMetadata(
      obj,
      fieldName,
      FIELD_SELF_ACCESSIBLE,
    );

    // 如果沒有用戶 context，移除所有敏感欄位和 HQ 欄位
    if (!userContext) {
      return isSensitive || isHQOnly;
    }

    // 檢查 HQ-only 欄位（只有 HQ 可見）
    if (isHQOnly) {
      // HQ 可以看到
      if (userContext.isHQ) {
        return false;
      }

      // users:read 權限也可以查看 User 相關的 HQ-only 欄位（如 deletedAt）
      if (userContext.permissions.has('users:read')) {
        const userHQFields = new Set(['deletedAt']);
        if (userHQFields.has(fieldName)) {
          return false; // 允許存取
        }
      }

      // 其他情況移除欄位
      return true;
    }

    // 檢查敏感欄位
    if (isSensitive) {
      // HQ 可以看到所有敏感欄位
      if (userContext.isHQ) {
        return false;
      }

      // 特殊處理: users:read 權限可以查看所有用戶的基本資訊欄位
      // (email, lastLoginAt, deletedAt 等 User 相關欄位)
      if (userContext.permissions.has('users:read')) {
        const userRelatedFields = new Set([
          'email',
          'lastLoginAt',
          'deletedAt',
        ]);
        if (userRelatedFields.has(fieldName)) {
          return false; // 允許存取
        }
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
        if (metadataKey === FIELD_HQ_ONLY) {
          return rule.isHQOnly;
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
    if (metadataKey === FIELD_HQ_ONLY) {
      return this.isHardcodedHQOnlyField(fieldName);
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
   * 硬編碼的 HQ-only 欄位（作為 fallback）
   */
  private isHardcodedHQOnlyField(fieldName: string): boolean {
    const hqOnlyFields = new Set(['deletedAt']);
    return hqOnlyFields.has(fieldName);
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
