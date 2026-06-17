import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { AccessScope } from '../common/enums/access-scope.enum';
import { logger } from '../common/services/logger.service';

@Injectable()
export class PermissionService {
  constructor(private prisma: PrismaService) {}

  /**
   * 檢查用戶是否有指定權限（支援權限層級）
   * 如果用戶有 resource:manage 權限，則自動擁有該資源的所有 CRUD 權限
   */
  async checkPermission(
    userId: string,
    scope: AccessScope,
    permissionName: string,
  ): Promise<boolean> {
    // 查詢用戶在指定 scope 內的所有權限
    const userPermissions = await this.getUserPermissions(userId, scope);

    // 直接檢查是否包含所需權限
    if (userPermissions.includes(permissionName)) {
      logger.debug('[PermissionService] checkPermission - Direct match', {
        userId,
        scope,
        permissionName,
        hasPermission: true,
      });
      return true;
    }

    // 檢查權限層級：如果用戶有 manage 權限，則自動擁有所有子權限
    const parts = permissionName.split(':');
    if (parts.length === 2) {
      const [resource] = parts;
      const managePermission = `${resource}:manage`;

      if (userPermissions.includes(managePermission)) {
        logger.debug(
          '[PermissionService] checkPermission - Implied by manage',
          {
            userId,
            scope,
            permissionName,
            managePermission,
            hasPermission: true,
          },
        );
        return true;
      }
    }

    // 跨 scope 權限檢查：HQ_SCOPE 角色可能擁有 CUSTOMER_SCOPE 的權限（統一五階下 HQ 各階皆可跨界）
    if (scope !== AccessScope.HQ_SCOPE) {
      const hqPermissions = await this.getUserPermissions(
        userId,
        AccessScope.HQ_SCOPE,
      );
      if (hqPermissions.includes(permissionName)) {
        logger.debug(
          '[PermissionService] checkPermission - Cross-scope match from HQ',
          {
            userId,
            scope,
            permissionName,
            hasPermission: true,
          },
        );
        return true;
      }

      // 也檢查 HQ_SCOPE 的 manage 權限是否隱含所需權限
      if (parts.length === 2) {
        const [resource] = parts;
        const managePermission = `${resource}:manage`;
        if (hqPermissions.includes(managePermission)) {
          logger.debug(
            '[PermissionService] checkPermission - Cross-scope implied by HQ manage',
            {
              userId,
              scope,
              permissionName,
              managePermission,
              hasPermission: true,
            },
          );
          return true;
        }
      }
    }

    logger.debug('[PermissionService] checkPermission - No permission', {
      userId,
      scope,
      permissionName,
      userPermissions,
      hasPermission: false,
    });

    return false;
  }

  /**
   * 檢查用戶是否有任一指定權限（OR 邏輯）
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
   * 檢查用戶是否有所有指定權限（AND 邏輯）
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
   * 取得用戶在指定 scope 內的所有權限名稱
   */
  async getUserPermissions(
    userId: string,
    scope: AccessScope,
  ): Promise<string[]> {
    // 查詢用戶的角色和權限
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
   * 取得用戶在指定 scope 內的所有角色
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
   * 授予角色給用戶
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
   * 撤銷用戶的角色
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
   * 檢查用戶是否有指定角色
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
