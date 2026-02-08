import 'reflect-metadata';
import { AccessScope } from '../enums/access-scope.enum';

/**
 * Metadata keys for field-level authorization
 * 使用 Symbol 以獲得更好的效能和避免衝突
 */
export const FIELD_SENSITIVE = Symbol('field:sensitive');
export const FIELD_HQ_ONLY = Symbol('field:hqOnly');
export const FIELD_REQUIRES_SCOPE = Symbol('field:requiresScope');
export const FIELD_REQUIRES_PERMISSION = Symbol('field:requiresPermission');
export const FIELD_SELF_ACCESSIBLE = Symbol('field:selfAccessible');

/**
 * 標記欄位為敏感欄位
 * 只有具備對應權限的用戶才能看到
 *
 * @param permission - 需要的權限，如 'users:read-sensitive'
 *
 * @example
 * ```typescript
 * @ObjectType()
 * export class UserType {
 *   @Field()
 *   @SensitiveField('users:read-sensitive')
 *   email: string;
 * }
 * ```
 */
export function SensitiveField(permission?: string): PropertyDecorator {
  return (target: object, propertyKey: string | symbol) => {
    Reflect.defineMetadata(
      FIELD_SENSITIVE,
      permission || true,
      target,
      propertyKey,
    );
  };
}

/**
 * 標記欄位僅 HQ 可見
 *
 * @example
 * ```typescript
 * @ObjectType()
 * export class UserType {
 *   @Field({ nullable: true })
 *   @HQOnly()
 *   deletedAt?: Date;
 * }
 * ```
 */
export function HQOnly(): PropertyDecorator {
  return (target: object, propertyKey: string | symbol) => {
    Reflect.defineMetadata(FIELD_HQ_ONLY, true, target, propertyKey);
  };
}

/**
 * 標記欄位需要特定的 AccessScope
 *
 * @param scopes - 需要的 AccessScope（單個或陣列）
 *
 * @example
 * ```typescript
 * @Field()
 * @FieldRequiresScope(AccessScope.HQ_SCOPE)
 * hqNotes: string;
 *
 * @Field()
 * @FieldRequiresScope([AccessScope.HQ_SCOPE, AccessScope.CUSTOMER_SCOPE])
 * sharedData: string;
 * ```
 */
export function FieldRequiresScope(
  scopes: AccessScope | AccessScope[],
): PropertyDecorator {
  return (target: object, propertyKey: string | symbol) => {
    Reflect.defineMetadata(
      FIELD_REQUIRES_SCOPE,
      Array.isArray(scopes) ? scopes : [scopes],
      target,
      propertyKey,
    );
  };
}

/**
 * 標記欄位需要特定權限
 *
 * @param permission - 需要的權限
 *
 * @example
 * ```typescript
 * @Field()
 * @FieldRequiresPermission('users:read-phone')
 * phone: string;
 * ```
 */
export function FieldRequiresPermission(permission: string): PropertyDecorator {
  return (target: object, propertyKey: string | symbol) => {
    Reflect.defineMetadata(
      FIELD_REQUIRES_PERMISSION,
      permission,
      target,
      propertyKey,
    );
  };
}

/**
 * 標記欄位允許"自己"訪問
 * 用於敏感欄位，允許用戶查看自己的資料，但不能查看其他人的
 *
 * @param options.idField - 用於識別資源擁有者的欄位名稱，預設為 'id'
 *
 * @example
 * ```typescript
 * @ObjectType()
 * export class UserType {
 *   @Field()
 *   @SensitiveField()
 *   @SelfAccessible()  // Customer 可以看到自己的 email
 *   email: string;
 *
 *   @Field()
 *   @SensitiveField()
 *   @SelfAccessible({ idField: 'userId' })  // 使用 userId 而不是 id
 *   phone: string;
 * }
 * ```
 */
export function SelfAccessible(options?: {
  idField?: string;
}): PropertyDecorator {
  return (target: object, propertyKey: string | symbol) => {
    Reflect.defineMetadata(
      FIELD_SELF_ACCESSIBLE,
      {
        idField: options?.idField || 'id',
      },
      target,
      propertyKey,
    );
  };
}
