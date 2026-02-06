import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { AccessScope } from '../common/enums/access-scope.enum';
import { logger } from '../common/services/logger.service';

@Injectable()
export class PermissionService {
  constructor(private prisma: PrismaService) {}

  /**
   * 檢查使用者是否有指定權限（OR 邏輯）
   * 只要有任一符合的權限即通過
   */
  async checkPermission(
    userId: string,
    scope: AccessScope,
    permissionName: string,
  ): Promise<boolean> {
    // 查詢使用者在指定 scope 內的所有權限
    const userPermissions = await this.getUserPermissions(userId, scope);

    logger.debug('[PermissionService] checkPermission', {
      userId,
      scope,
      permissionName,
      userPermissions,
      hasPermission: userPermissions.includes(permissionName),
    });

    // 檢查是否包含所需權限
    return userPermissions.includes(permissionName);
  }

  /**
   * 檢查使用者是否有任一指定權限（OR 邏輯）
   */
  async checkAnyPermission(
    userId: string,
    scope: AccessScope,
    permissionNames: string[],
  ): Promise<boolean> {
    const userPermissions = await this.getUserPermissions(userId, scope);

    // 只要有任一權限符合即返回 true
    return permissionNames.some((permission) =>
      userPermissions.includes(permission),
    );
  }

  /**
   * 檢查使用者是否有所有指定權限（AND 邏輯）
   */
  async checkAllPermissions(
    userId: string,
    scope: AccessScope,
    permissionNames: string[],
  ): Promise<boolean> {
    const userPermissions = await this.getUserPermissions(userId, scope);

    // 必須所有權限都符合才返回 true
    return permissionNames.every((permission) =>
      userPermissions.includes(permission),
    );
  }

  /**
   * 取得使用者在指定 scope 內的所有權限名稱
   */
  async getUserPermissions(
    userId: string,
    scope: AccessScope,
  ): Promise<string[]> {
    // 查詢使用者的角色和權限
    const userRoles = await this.prisma.userRole.findMany({
      where: {
        userId,
        role: {
          scope, // 只查詢指定 scope 的角色
        },
      },
      include: {
        role: {
          include: {
            rolePermissions: {
              include: {
                permission: true,
              },
            },
          },
        },
      },
    });

    // 提取所有權限名稱（去重）
    const permissions = new Set<string>();
    for (const userRole of userRoles) {
      for (const rolePermission of userRole.role.rolePermissions) {
        permissions.add(rolePermission.permission.name);
      }
    }

    return Array.from(permissions);
  }

  /**
   * 取得使用者在指定 scope 內的所有角色
   */
  async getUserRoles(userId: string, scope: AccessScope) {
    return this.prisma.userRole.findMany({
      where: {
        userId,
        role: {
          scope,
        },
      },
      include: {
        role: true,
      },
    });
  }

  /**
   * 授予角色給使用者
   */
  async grantRole(
    userId: string,
    roleId: string,
    grantedBy?: string,
  ): Promise<void> {
    await this.prisma.userRole.create({
      data: {
        userId,
        roleId,
        grantedBy,
      },
    });
  }

  /**
   * 撤銷使用者的角色
   */
  async revokeRole(userId: string, roleId: string): Promise<void> {
    await this.prisma.userRole.deleteMany({
      where: {
        userId,
        roleId,
      },
    });
  }

  /**
   * 檢查使用者是否有指定角色
   */
  async hasRole(
    userId: string,
    scope: AccessScope,
    roleName: string,
  ): Promise<boolean> {
    const count = await this.prisma.userRole.count({
      where: {
        userId,
        role: {
          scope,
          name: roleName,
        },
      },
    });

    return count > 0;
  }
}
