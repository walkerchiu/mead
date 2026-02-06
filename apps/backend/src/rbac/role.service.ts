import { Injectable } from '@nestjs/common';
import { I18nService } from 'nestjs-i18n';
import { PrismaService } from '../prisma/prisma.service';
import { AccessScope } from '../common/enums/access-scope.enum';

@Injectable()
export class RoleService {
  constructor(
    private prisma: PrismaService,
    private i18n: I18nService,
  ) {}

  /**
   * 創建角色
   */
  async createRole(data: {
    name: string;
    displayName: string;
    scope: AccessScope;
    description?: string;
    isSystem?: boolean;
  }) {
    return this.prisma.role.create({
      data,
    });
  }

  /**
   * 取得角色（包含權限）
   */
  async getRole(roleId: string) {
    return this.prisma.role.findUnique({
      where: { id: roleId },
      include: {
        rolePermissions: {
          include: {
            permission: true,
          },
        },
      },
    });
  }

  /**
   * 取得指定 scope 的所有角色
   */
  async getRolesByScope(scope: AccessScope) {
    return this.prisma.role.findMany({
      where: { scope },
      orderBy: { createdAt: 'asc' },
    });
  }

  /**
   * 更新角色
   */
  async updateRole(
    roleId: string,
    data: {
      displayName?: string;
      description?: string;
    },
  ) {
    return this.prisma.role.update({
      where: { id: roleId },
      data,
    });
  }

  /**
   * 刪除角色（僅非系統角色）
   */
  async deleteRole(roleId: string, lang?: string) {
    // 確認不是系統角色
    const role = await this.prisma.role.findUnique({
      where: { id: roleId },
    });

    if (role?.isSystem) {
      throw new Error(
        this.i18n.translate('auth.cannotDeleteSystemRole', { lang }),
      );
    }

    return this.prisma.role.delete({
      where: { id: roleId },
    });
  }

  /**
   * 為角色分配權限
   */
  async assignPermission(roleId: string, permissionId: string) {
    return this.prisma.rolePermission.create({
      data: {
        roleId,
        permissionId,
      },
    });
  }

  /**
   * 撤銷角色的權限
   */
  async revokePermission(roleId: string, permissionId: string) {
    return this.prisma.rolePermission.deleteMany({
      where: {
        roleId,
        permissionId,
      },
    });
  }

  /**
   * 批次分配權限
   */
  async assignPermissions(roleId: string, permissionIds: string[]) {
    const data = permissionIds.map((permissionId) => ({
      roleId,
      permissionId,
    }));

    return this.prisma.rolePermission.createMany({
      data,
      skipDuplicates: true,
    });
  }
}
