import { SetMetadata } from '@nestjs/common';
import { AccessScope } from '../enums/access-scope.enum';

/**
 * AccessScope 檢查 Decorator
 * 標記操作需要的 AccessScope
 *
 * @example
 * @Query(() => UserType)
 * @UseGuards(JwtAuthGuard)
 * @RequiresScope(AccessScope.ADMIN_SCOPE)
 * async adminUsers() { }
 */
export const REQUIRES_SCOPE_KEY = 'requiresScope';
export const RequiresScope = (scope: AccessScope) =>
  SetMetadata(REQUIRES_SCOPE_KEY, scope);

/**
 * 檢查任一 AccessScope（OR 邏輯）
 */
export const REQUIRES_ANY_SCOPE_KEY = 'requiresAnyScope';
export const RequiresAnyScope = (scopes: AccessScope[]) =>
  SetMetadata(REQUIRES_ANY_SCOPE_KEY, scopes);
