import {
  Injectable,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { AccessScope } from '../common/enums/access-scope.enum';
import { roleRank, maxRank } from './role-hierarchy';
import { featuresForScope, findFeature } from './feature-matrix.constants';
import { RoleFeatureRowType } from './feature-matrix.types';

/** 呼叫者身分（取自 JWT claim，無需再查 DB）。 */
interface Caller {
  accessScopes?: AccessScope[];
  permissions?: string[];
  roles?: { scope: AccessScope; roleNames: string[] }[];
}

/**
 * 功能權限矩陣服務（對齊 nptc GetFeatureMatrixQuery / SetRoleFeatureAccessCommand，跟隨 npt）。
 * 以「角色 × 功能 read/write 權限 bundle」的 RolePermission 為單一來源；管理隱含檢視；OWNER 鎖定。
 */
@Injectable()
export class FeatureMatrixService {
  constructor(private prisma: PrismaService) {}

  private callerHasHQ(caller: Caller): boolean {
    return !!caller.accessScopes?.includes(AccessScope.HQ_SCOPE);
  }

  private callerRankInScope(caller: Caller, scope: AccessScope): number {
    const group = caller.roles?.find((r) => r.scope === scope);
    return group ? maxRank(group.roleNames) : 0;
  }

  /** 指定 scope 的功能權限矩陣：列出該 scope 所有角色 + 各功能的檢視／管理狀態。 */
  async getFeatureMatrix(
    scope: AccessScope,
    caller: Caller,
  ): Promise<RoleFeatureRowType[]> {
    // 檢視授權：HQ 矩陣僅 HQ 呼叫者可見；CUSTOMER 矩陣 HQ 或 customer 皆可見。
    const callerHasHQ = this.callerHasHQ(caller);
    const callerHasCustomer = !!caller.accessScopes?.includes(
      AccessScope.CUSTOMER_SCOPE,
    );
    if (scope === AccessScope.HQ_SCOPE && !callerHasHQ) return [];
    if (
      scope === AccessScope.CUSTOMER_SCOPE &&
      !callerHasHQ &&
      !callerHasCustomer
    ) {
      return [];
    }
    if (scope === AccessScope.PUBLIC_SCOPE) return [];

    const features = featuresForScope(scope);
    const roles = await this.prisma.role.findMany({
      where: { scope: scope as any },
      include: { rolePermissions: { include: { permission: true } } },
    });

    const rows = roles.map((r) => {
      const perms = new Set(r.rolePermissions.map((rp) => rp.permission.name));
      const locked = r.name === 'OWNER';
      return {
        roleId: r.id,
        name: r.name,
        displayName: r.displayName,
        rank: roleRank(r.name),
        locked,
        features: features.map((f) => ({
          featureKey: f.key,
          canRead: locked || f.readPermissions.every((p) => perms.has(p)),
          canWrite: locked || f.writePermissions.every((p) => perms.has(p)),
        })),
      };
    });

    rows.sort((a, b) => b.rank - a.rank || a.name.localeCompare(b.name));
    return rows;
  }

  /** 設定某角色對單一功能的檢視／管理存取（矩陣格子 toggle）。 */
  async setRoleFeatureAccess(
    input: {
      roleId: string;
      featureKey: string;
      canRead: boolean;
      canWrite: boolean;
    },
    caller: Caller,
  ): Promise<boolean> {
    const role = await this.prisma.role.findUnique({
      where: { id: input.roleId },
    });
    if (!role) {
      throw new NotFoundException('Role not found');
    }

    const feature = findFeature(role.scope as AccessScope, input.featureKey);
    if (!feature) {
      throw new NotFoundException('Feature not found');
    }

    // OWNER 永遠全開、鎖定，不可調整。
    if (role.name === 'OWNER') {
      throw new ForbiddenException(
        'The OWNER role always has full access and cannot be changed.',
      );
    }

    this.ensureCanEdit(role.scope as AccessScope, role.name, caller);

    // 解析功能 read/write bundle 對應「該角色 scope」的權限實體。
    const allNames = [
      ...new Set([...feature.readPermissions, ...feature.writePermissions]),
    ];
    const perms = await this.prisma.permission.findMany({
      where: { scope: role.scope as any, name: { in: allNames } },
      select: { id: true, name: true },
    });
    const readPermIds = perms
      .filter((p) => feature.readPermissions.includes(p.name))
      .map((p) => p.id);
    const writePermIds = perms
      .filter((p) => feature.writePermissions.includes(p.name))
      .map((p) => p.id);

    // 管理隱含檢視：勾管理時自動視為有檢視。
    const effectiveRead = input.canRead || input.canWrite;

    const ensure = async (permIds: string[]) => {
      for (const permissionId of permIds) {
        await this.prisma.rolePermission.upsert({
          where: {
            roleId_permissionId: { roleId: role.id, permissionId },
          },
          update: {},
          create: { roleId: role.id, permissionId },
        });
      }
    };
    const remove = async (permIds: string[]) => {
      if (permIds.length === 0) return;
      await this.prisma.rolePermission.deleteMany({
        where: { roleId: role.id, permissionId: { in: permIds } },
      });
    };

    if (effectiveRead) {
      await ensure(readPermIds);
    } else {
      await remove(readPermIds);
    }
    if (input.canWrite) {
      await ensure(writePermIds);
    } else {
      await remove(writePermIds);
    }

    return true;
  }

  /**
   * 編輯授權（對齊 nptc EnsureCanEditAsync）：需 roles:manage，且依角色 scope 套 rank 階層。
   * - HQ 角色：需 HQ 呼叫者且 HQ rank 嚴格高於該角色。
   * - customer 角色：HQ 呼叫者放行；customer 呼叫者需 rank 嚴格高於該角色。
   */
  private ensureCanEdit(
    roleScope: AccessScope,
    roleName: string,
    caller: Caller,
  ): void {
    const rank = roleRank(roleName);
    const callerHasHQ = this.callerHasHQ(caller);

    if (!caller.permissions?.includes('roles:manage')) {
      throw new ForbiddenException(
        'You need roles:manage to edit the feature matrix.',
      );
    }

    if (roleScope === AccessScope.HQ_SCOPE) {
      if (!callerHasHQ) {
        throw new ForbiddenException(
          'Only HQ users can edit HQ-scope role access.',
        );
      }
      if (this.callerRankInScope(caller, AccessScope.HQ_SCOPE) > rank) return;
      throw new ForbiddenException(
        'You can only configure roles strictly below your own.',
      );
    }

    if (callerHasHQ) return;
    if (this.callerRankInScope(caller, AccessScope.CUSTOMER_SCOPE) > rank) {
      return;
    }
    throw new ForbiddenException(
      'You can only configure roles strictly below your own.',
    );
  }
}
