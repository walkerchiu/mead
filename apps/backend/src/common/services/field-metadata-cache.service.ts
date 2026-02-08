import { Injectable, Logger } from '@nestjs/common';
import { AccessScope } from '../enums/access-scope.enum';
import {
  FIELD_SENSITIVE,
  FIELD_HQ_ONLY,
  FIELD_REQUIRES_SCOPE,
  FIELD_REQUIRES_PERMISSION,
} from '../decorators/field-auth.decorator';

/**
 * 欄位權限規則
 */
export interface FieldRule {
  fieldName: string;
  isSensitive: boolean;
  isHQOnly: boolean;
  requiredScopes?: AccessScope[];
  requiredPermission?: string;
  sensitivePermission?: string;
}

/**
 * 欄位 Metadata 快取服務
 *
 * 效能優化：
 * - 啟動時一次性掃描所有 Type
 * - 使用 Map 實現 O(1) 查找
 * - 避免執行時的反射操作
 */
@Injectable()
export class FieldMetadataCache {
  // eslint-disable-next-line @typescript-eslint/no-unsafe-function-type
  private fieldRulesCache = new Map<Function, Map<string, FieldRule>>();
  private logger = new Logger(FieldMetadataCache.name);

  constructor() {}

  /**
   * 註冊 Type 的欄位規則
   * 應該在應用啟動時調用
   */
  // eslint-disable-next-line @typescript-eslint/no-unsafe-function-type
  registerType(typeClass: Function): void {
    if (this.fieldRulesCache.has(typeClass)) {
      return; // 已註冊
    }

    const fieldRules = new Map<string, FieldRule>();
    const prototype = typeClass.prototype;

    // 取得所有屬性
    const propertyNames = Object.getOwnPropertyNames(prototype);

    for (const fieldName of propertyNames) {
      if (fieldName === 'constructor') continue;

      const rule = this.extractFieldRule(typeClass, fieldName);
      if (rule) {
        fieldRules.set(fieldName, rule);
      }
    }

    this.fieldRulesCache.set(typeClass, fieldRules);
  }

  /**
   * 從 Type 提取欄位規則
   */

  private extractFieldRule(
    target: Function,
    fieldName: string,
  ): FieldRule | null {
    const isSensitive = Reflect.getMetadata(
      FIELD_SENSITIVE,
      target.prototype,
      fieldName,
    );
    const isHQOnly = Reflect.getMetadata(
      FIELD_HQ_ONLY,
      target.prototype,
      fieldName,
    );
    const requiredScopes = Reflect.getMetadata(
      FIELD_REQUIRES_SCOPE,
      target.prototype,
      fieldName,
    );
    const requiredPermission = Reflect.getMetadata(
      FIELD_REQUIRES_PERMISSION,
      target.prototype,
      fieldName,
    );

    // 如果沒有任何限制，返回 null
    if (!isSensitive && !isHQOnly && !requiredScopes && !requiredPermission) {
      return null;
    }

    const rule: FieldRule = {
      fieldName,
      isSensitive: !!isSensitive,
      isHQOnly: !!isHQOnly,
    };

    if (requiredScopes) {
      rule.requiredScopes = requiredScopes;
    }

    if (requiredPermission) {
      rule.requiredPermission = requiredPermission;
    }

    if (typeof isSensitive === 'string') {
      rule.sensitivePermission = isSensitive;
    }

    return rule;
  }

  /**
   * 取得 Type 的欄位規則（O(1) 查找）
   */
  // eslint-disable-next-line @typescript-eslint/no-unsafe-function-type
  getFieldRules(typeClass: Function): Map<string, FieldRule> | undefined {
    return this.fieldRulesCache.get(typeClass);
  }

  /**
   * 檢查欄位是否需要過濾
   */
  // eslint-disable-next-line @typescript-eslint/no-unsafe-function-type
  hasFieldRestrictions(typeClass: Function): boolean {
    const rules = this.fieldRulesCache.get(typeClass);
    return rules !== undefined && rules.size > 0;
  }

  /**
   * 取得所有已註冊的 Type
   */
  // eslint-disable-next-line @typescript-eslint/no-unsafe-function-type
  getRegisteredTypes(): Function[] {
    return Array.from(this.fieldRulesCache.keys());
  }

  /**
   * 清除快取（主要用於測試）
   */
  clear(): void {
    this.fieldRulesCache.clear();
  }
}
