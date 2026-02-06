import { SetMetadata } from '@nestjs/common';

/**
 * Permission 檢查 Decorator
 * 標記操作需要的權限
 *
 * @example
 * @Mutation(() => UserType)
 * @UseGuards(JwtAuthGuard, PermissionGuard)
 * @RequiresPermission('users:create')
 * async createUser() { }
 */
export const REQUIRES_PERMISSION_KEY = 'requiresPermission';
export const RequiresPermission = (permission: string) =>
  SetMetadata(REQUIRES_PERMISSION_KEY, permission);

/**
 * 檢查任一權限（OR 邏輯）
 */
export const REQUIRES_ANY_PERMISSION_KEY = 'requiresAnyPermission';
export const RequiresAnyPermission = (permissions: string[]) =>
  SetMetadata(REQUIRES_ANY_PERMISSION_KEY, permissions);

/**
 * 檢查所有權限（AND 邏輯）
 */
export const REQUIRES_ALL_PERMISSIONS_KEY = 'requiresAllPermissions';
export const RequiresAllPermissions = (permissions: string[]) =>
  SetMetadata(REQUIRES_ALL_PERMISSIONS_KEY, permissions);
