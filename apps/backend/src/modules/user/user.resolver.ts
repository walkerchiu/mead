import { Query, Resolver, Args, Mutation, Context } from '@nestjs/graphql';
import { UseGuards, ForbiddenException } from '@nestjs/common';
import { UserType, PaginatedUsers, RoleType, UserRoleType } from './user.types';
import { ProfileType } from './user.types';
import { UserService } from './user.service';
import { PermissionGuard } from '../../common/guards/permission.guard';
import {
  RequiresScope,
  RequiresAnyScope,
} from '../../common/decorators/requires-scope.decorator';
import { RequiresPermission } from '../../common/decorators/requires-permission.decorator';
import { AccessScope } from '../../common/enums/access-scope.enum';
import { PaginationInput } from '../../common/dto/pagination.input';
import { JwtAuthGuard } from '../../auth/jwt-auth.guard';
import { Throttle } from '@nestjs/throttler';
import { I18nLang } from '../../common/decorators/i18n-lang.decorator';
import {
  UpdateUserInput,
  UpdateProfileInput,
  ChangePasswordInput,
  CreateUserInput,
  HQUpdateUserInput,
  HQResetPasswordInput,
  LockUserInput,
  UserFilterInput,
  AssignRoleInput,
  RevokeRoleInput,
} from './user.input';
import { GraphQLContext } from '../../common/types/graphql-context.type';
import { PermissionService } from '../../rbac/permission.service';

@Resolver(() => UserType)
export class UserResolver {
  constructor(
    private userService: UserService,
    private permissionService: PermissionService,
  ) {}

  // ==================== READ OPERATIONS ====================

  @Query(() => UserType, {
    nullable: true,
    description:
      '依 ID 查詢單一用戶資料（需要 HQ_SCOPE 或 CUSTOMER_SCOPE 且擁有 users:read 權限）',
  })
  @UseGuards(PermissionGuard)
  @RequiresAnyScope([AccessScope.HQ_SCOPE, AccessScope.CUSTOMER_SCOPE])
  @RequiresPermission('users:read')
  async user(
    @Args('id', { description: '用戶唯一識別碼（UUID）' }) id: string,
    @Args('includeDeleted', {
      defaultValue: false,
      description: '是否包含已軟刪除的用戶（僅 HQ_SCOPE 可用）',
    })
    includeDeleted: boolean,
    @Context() context: GraphQLContext,
  ): Promise<UserType | null> {
    // 檢查 includeDeleted 權限：只有 HQ_SCOPE 可以查詢已刪除的資料
    if (includeDeleted) {
      const user = context.req?.user;
      const hasHQScope = user?.accessScopes?.includes(AccessScope.HQ_SCOPE);

      if (!hasHQScope) {
        throw new ForbiddenException('只有管理員可以查詢已刪除的用戶資料');
      }
    }

    // 提取用戶權限上下文
    const userContext = {
      accessScopes: context.req?.user?.accessScopes || [],
      userId: context.req?.user?.userId,
    };

    return this.userService.findUserById(
      id,
      includeDeleted,
      userContext,
    ) as Promise<UserType | null>;
  }

  @Query(() => PaginatedUsers, {
    name: 'usersPaginated',
    description:
      '分頁查詢用戶列表（需要 HQ_SCOPE 或 CUSTOMER_SCOPE 且擁有 users:list 權限）',
  })
  @UseGuards(PermissionGuard)
  @RequiresAnyScope([AccessScope.HQ_SCOPE, AccessScope.CUSTOMER_SCOPE])
  @RequiresPermission('users:list')
  async usersPaginated(
    @Args('pagination', {
      type: () => PaginationInput,
      defaultValue: { page: 1, limit: 20 },
      description: '分頁參數（頁碼和每頁數量）',
    })
    pagination: PaginationInput,
    @Args('filter', {
      nullable: true,
      description: '篩選條件（搜尋、存取範圍、狀態）',
    })
    filter: UserFilterInput,
    @Args('includeDeleted', {
      defaultValue: false,
      description: '是否包含已軟刪除的用戶（僅 HQ_SCOPE 可用）',
    })
    includeDeleted: boolean,
    @Context() context: GraphQLContext,
  ): Promise<PaginatedUsers> {
    // 檢查 includeDeleted 權限：只有 HQ_SCOPE 可以查詢已刪除的資料
    if (includeDeleted) {
      const user = context.req?.user;
      const hasHQScope = user?.accessScopes?.includes(AccessScope.HQ_SCOPE);

      if (!hasHQScope) {
        throw new ForbiddenException('只有管理員可以查詢已刪除的用戶資料');
      }
    }

    // 提取用戶權限上下文
    const userContext = {
      accessScopes: context.req?.user?.accessScopes || [],
      userId: context.req?.user?.userId,
    };

    return this.userService.findAllUsersPaginated(
      pagination.page,
      pagination.limit,
      filter,
      includeDeleted,
      userContext,
    );
  }

  @Query(() => UserType, {
    nullable: true,
    description:
      '依 Email 查詢用戶（需要 HQ_SCOPE 或 CUSTOMER_SCOPE 且擁有 users:read 權限）',
  })
  @UseGuards(PermissionGuard)
  @RequiresAnyScope([AccessScope.HQ_SCOPE, AccessScope.CUSTOMER_SCOPE])
  @RequiresPermission('users:read')
  async userByEmail(
    @Args('email', { description: '用戶電子郵件地址' })
    email: string,
    @Args('includeDeleted', {
      defaultValue: false,
      description: '是否包含已軟刪除的用戶（僅 HQ_SCOPE 可用）',
    })
    includeDeleted: boolean,
    @Context() context: GraphQLContext,
  ): Promise<UserType | null> {
    // 檢查 includeDeleted 權限：只有 HQ_SCOPE 可以查詢已刪除的資料
    if (includeDeleted) {
      const user = context.req?.user;
      const hasHQScope = user?.accessScopes?.includes(AccessScope.HQ_SCOPE);

      if (!hasHQScope) {
        throw new ForbiddenException('只有管理員可以查詢已刪除的用戶資料');
      }
    }

    // 提取用戶權限上下文
    const userContext = {
      accessScopes: context.req?.user?.accessScopes || [],
      userId: context.req?.user?.userId,
    };

    return this.userService.findUserByEmail(
      email,
      includeDeleted,
      userContext,
    ) as Promise<UserType | null>;
  }

  // ==================== SELF-SERVICE OPERATIONS ====================

  @Query(() => UserType, {
    description: '查詢當前登入用戶的完整資料',
  })
  @UseGuards(JwtAuthGuard)
  async me(@Context() context: GraphQLContext): Promise<UserType> {
    const userId = context.req.user?.userId || context.req.user?.sub;
    if (!userId) {
      throw new ForbiddenException('User ID not found in context');
    }
    // 查詢自己不受 accessScope 過濾，傳入完整 context 以繞過 PUBLIC_SCOPE 限制
    const userContext = {
      userId,
      accessScopes: context.req.user?.accessScopes || [],
      roles: context.req.user?.roles || [],
    };
    return this.userService.findUserById(
      userId,
      false,
      userContext,
    ) as Promise<UserType>;
  }

  @Mutation(() => UserType, {
    description: '更新當前用戶的基本資料（email、name）',
  })
  @UseGuards(JwtAuthGuard)
  @Throttle({ default: { limit: 10, ttl: 60000 } })
  async updateMyProfile(
    @Args('input') input: UpdateUserInput,
    @Context() context: GraphQLContext,
    @I18nLang() lang: string,
  ): Promise<UserType> {
    const userId = context.req.user?.userId || context.req.user?.sub;
    if (!userId) {
      throw new ForbiddenException('User ID not found in context');
    }
    const ipAddress = context.req.ip;
    return this.userService.updateUserSelf(userId, input, ipAddress, lang);
  }

  @Mutation(() => ProfileType, {
    description: '更新當前用戶的詳細資料（Profile）',
  })
  @UseGuards(JwtAuthGuard)
  @Throttle({ default: { limit: 10, ttl: 60000 } })
  async updateMyProfileDetails(
    @Args('input') input: UpdateProfileInput,
    @Context() context: GraphQLContext,
    @I18nLang() lang: string,
  ): Promise<ProfileType> {
    const userId = context.req.user?.userId || context.req.user?.sub;
    if (!userId) {
      throw new ForbiddenException('User ID not found in context');
    }
    return this.userService.updateProfileSelf(userId, input, lang);
  }

  @Mutation(() => Boolean, {
    description: '修改當前用戶的密碼',
  })
  @UseGuards(JwtAuthGuard)
  @Throttle({ default: { limit: 5, ttl: 300000 } })
  async changePassword(
    @Args('input') input: ChangePasswordInput,
    @Context() context: GraphQLContext,
    @I18nLang() lang: string,
  ): Promise<boolean> {
    const userId = context.req.user?.userId || context.req.user?.sub;
    if (!userId) {
      throw new ForbiddenException('User ID not found in context');
    }
    const ipAddress = context.req.ip;
    const userAgentHeader = context.req.headers?.['user-agent'];
    const userAgent = Array.isArray(userAgentHeader)
      ? userAgentHeader[0]
      : userAgentHeader;
    // 取得當前 session 的 refresh token（與 logout / refresh handler 同源），
    // 供「登出其他裝置」時保留當前 session、只撤其他。
    const currentRefreshToken = context.req.cookies?.refresh_token;
    return this.userService.changePasswordSelf(
      userId,
      input,
      ipAddress,
      userAgent,
      lang,
      currentRefreshToken,
    );
  }

  // ==================== WRITE OPERATIONS (HQ/MANAGER) ====================

  @Mutation(() => UserType, {
    description: '創建新用戶（僅限 HQ_SCOPE，需要 users:create 權限）',
  })
  @UseGuards(PermissionGuard)
  @RequiresScope(AccessScope.HQ_SCOPE)
  @RequiresPermission('users:create')
  async createUser(
    @Args('input') input: CreateUserInput,
    @Context() context: GraphQLContext,
    @I18nLang() lang: string,
  ): Promise<UserType> {
    const userContext = {
      accessScopes: context.req?.user?.accessScopes || [],
      userId: context.req?.user?.userId,
      permissions: context.req?.user?.permissions || [],
    };

    return this.userService.createUser(input, userContext, lang);
  }

  @Mutation(() => UserType, {
    description: '管理員更新用戶資料（僅限 HQ_SCOPE，需要 users:update 權限）',
  })
  @UseGuards(PermissionGuard)
  @RequiresScope(AccessScope.HQ_SCOPE)
  @RequiresPermission('users:update')
  async hqUpdateUser(
    @Args('id', { description: '用戶 ID' }) id: string,
    @Args('input') input: HQUpdateUserInput,
    @Context() context: GraphQLContext,
    @I18nLang() lang: string,
  ): Promise<UserType> {
    const userContext = {
      accessScopes: context.req?.user?.accessScopes || [],
      userId: context.req?.user?.userId,
      permissions: context.req?.user?.permissions || [],
    };

    return this.userService.hqUpdateUser(id, input, userContext, lang);
  }

  @Mutation(() => Boolean, {
    description:
      '管理員重設用戶密碼（僅限 HQ_SCOPE，需要 users:reset_password 權限）',
  })
  @UseGuards(PermissionGuard)
  @RequiresScope(AccessScope.HQ_SCOPE)
  @RequiresPermission('users:reset_password')
  async hqResetPassword(
    @Args('id', { description: '用戶 ID' }) id: string,
    @Args('input') input: HQResetPasswordInput,
    @Context() context: GraphQLContext,
    @I18nLang() lang: string,
  ): Promise<boolean> {
    const userContext = {
      accessScopes: context.req?.user?.accessScopes || [],
      userId: context.req?.user?.userId,
      permissions: context.req?.user?.permissions || [],
    };

    const ipAddress = context.req.ip;
    const userAgentHeader = context.req.headers?.['user-agent'];
    const userAgent = Array.isArray(userAgentHeader)
      ? userAgentHeader[0]
      : userAgentHeader;

    return this.userService.hqResetPassword(
      id,
      input,
      userContext,
      ipAddress,
      userAgent,
      lang,
    );
  }

  @Mutation(() => UserType, {
    description: '軟刪除用戶（僅限 HQ_SCOPE，需要 users:delete 權限）',
  })
  @UseGuards(PermissionGuard)
  @RequiresScope(AccessScope.HQ_SCOPE)
  @RequiresPermission('users:delete')
  async softDeleteUser(
    @Args('id') id: string,
    @Context() context: GraphQLContext,
  ): Promise<UserType | null> {
    const userContext = {
      accessScopes: context.req?.user?.accessScopes || [],
      userId: context.req?.user?.userId,
      permissions: context.req?.user?.permissions || [],
    };

    return this.userService.softDeleteUser(
      id,
      userContext,
    ) as Promise<UserType | null>;
  }

  @Mutation(() => UserType, {
    description: '恢復已刪除的用戶（僅 HQ，需要 users:restore 權限）',
  })
  @UseGuards(PermissionGuard)
  @RequiresScope(AccessScope.HQ_SCOPE)
  @RequiresPermission('users:restore')
  async restoreUser(@Args('id') id: string): Promise<UserType | null> {
    return this.userService.restoreUser(id) as Promise<UserType | null>;
  }

  @Mutation(() => UserType, {
    description: '鎖定用戶（僅限 HQ_SCOPE，需要 users:update 權限）',
  })
  @UseGuards(PermissionGuard)
  @RequiresScope(AccessScope.HQ_SCOPE)
  @RequiresPermission('users:update')
  async lockUser(
    @Args('id', { description: '用戶 ID' }) id: string,
    @Args('input') input: LockUserInput,
    @Context() context: GraphQLContext,
    @I18nLang() lang: string,
  ): Promise<UserType> {
    const userContext = {
      accessScopes: context.req?.user?.accessScopes || [],
      userId: context.req?.user?.userId,
      permissions: context.req?.user?.permissions || [],
    };

    return this.userService.lockUser(
      id,
      input,
      userContext,
      lang,
    ) as Promise<UserType>;
  }

  @Mutation(() => UserType, {
    description: '解鎖用戶（僅限 HQ_SCOPE，需要 users:update 權限）',
  })
  @UseGuards(PermissionGuard)
  @RequiresScope(AccessScope.HQ_SCOPE)
  @RequiresPermission('users:update')
  async unlockUser(
    @Args('id', { description: '用戶 ID' }) id: string,
    @Context() context: GraphQLContext,
    @I18nLang() lang: string,
  ): Promise<UserType> {
    const userContext = {
      accessScopes: context.req?.user?.accessScopes || [],
      userId: context.req?.user?.userId,
      permissions: context.req?.user?.permissions || [],
    };

    return this.userService.unlockUser(
      id,
      userContext,
      lang,
    ) as Promise<UserType>;
  }

  // ==================== ROLE ASSIGNMENT OPERATIONS ====================

  @Query(() => [UserRoleType], {
    description:
      '查詢指定用戶的角色列表（需要 HQ_SCOPE 或 CUSTOMER_SCOPE 且擁有 roles:manage 權限）',
  })
  @UseGuards(PermissionGuard)
  @RequiresAnyScope([AccessScope.HQ_SCOPE, AccessScope.CUSTOMER_SCOPE])
  async userRoles(
    @Args('userId', { description: '用戶 ID' }) userId: string,
    @Context() context: GraphQLContext,
  ): Promise<UserRoleType[]> {
    const callerUserId = context.req.user?.userId || context.req.user?.sub;
    if (!callerUserId) {
      throw new ForbiddenException('User ID not found in context');
    }

    // Manually check roles:manage permission
    const accessScopes = context.req?.user?.accessScopes || [];
    const isHQ = accessScopes.includes(AccessScope.HQ_SCOPE);
    const hasHQPermission = isHQ
      ? await this.permissionService.checkPermission(
          callerUserId,
          AccessScope.HQ_SCOPE,
          'roles:manage',
        )
      : false;
    const hasCustomerPermission = accessScopes.includes(
      AccessScope.CUSTOMER_SCOPE,
    )
      ? await this.permissionService.checkPermission(
          callerUserId,
          AccessScope.CUSTOMER_SCOPE,
          'roles:manage',
        )
      : false;

    if (!hasHQPermission && !hasCustomerPermission) {
      throw new ForbiddenException('沒有 roles:manage 權限');
    }

    const userContext = {
      accessScopes,
      userId: callerUserId,
      permissions: context.req?.user?.permissions || [],
    };

    return this.userService.getUserRolesForManagement(
      userId,
      userContext,
    ) as Promise<UserRoleType[]>;
  }

  @Query(() => [RoleType], {
    description:
      '查詢當前用戶可分配的角色列表（需要 HQ_SCOPE 或 CUSTOMER_SCOPE 且擁有 roles:manage 權限）',
  })
  @UseGuards(PermissionGuard)
  @RequiresAnyScope([AccessScope.HQ_SCOPE, AccessScope.CUSTOMER_SCOPE])
  async assignableRoles(
    @Context() context: GraphQLContext,
  ): Promise<RoleType[]> {
    const callerUserId = context.req.user?.userId || context.req.user?.sub;
    if (!callerUserId) {
      throw new ForbiddenException('User ID not found in context');
    }

    // Manually check roles:manage permission
    const accessScopes = context.req?.user?.accessScopes || [];
    const isHQ = accessScopes.includes(AccessScope.HQ_SCOPE);
    const hasHQPermission = isHQ
      ? await this.permissionService.checkPermission(
          callerUserId,
          AccessScope.HQ_SCOPE,
          'roles:manage',
        )
      : false;
    const hasCustomerPermission = accessScopes.includes(
      AccessScope.CUSTOMER_SCOPE,
    )
      ? await this.permissionService.checkPermission(
          callerUserId,
          AccessScope.CUSTOMER_SCOPE,
          'roles:manage',
        )
      : false;

    if (!hasHQPermission && !hasCustomerPermission) {
      throw new ForbiddenException('沒有 roles:manage 權限');
    }

    const userContext = {
      accessScopes,
      userId: callerUserId,
      permissions: context.req?.user?.permissions || [],
    };

    return this.userService.getAssignableRoles(userContext) as Promise<
      RoleType[]
    >;
  }

  @Mutation(() => Boolean, {
    description:
      '分配角色給用戶（需要 HQ_SCOPE 或 CUSTOMER_SCOPE 且擁有 roles:manage 權限）',
  })
  @UseGuards(PermissionGuard)
  @RequiresAnyScope([AccessScope.HQ_SCOPE, AccessScope.CUSTOMER_SCOPE])
  async assignRole(
    @Args('input') input: AssignRoleInput,
    @Context() context: GraphQLContext,
    @I18nLang() lang: string,
  ): Promise<boolean> {
    const callerUserId = context.req.user?.userId || context.req.user?.sub;
    if (!callerUserId) {
      throw new ForbiddenException('User ID not found in context');
    }

    // Manually check roles:manage permission
    const accessScopes = context.req?.user?.accessScopes || [];
    const isHQ = accessScopes.includes(AccessScope.HQ_SCOPE);
    const hasHQPermission = isHQ
      ? await this.permissionService.checkPermission(
          callerUserId,
          AccessScope.HQ_SCOPE,
          'roles:manage',
        )
      : false;
    const hasCustomerPermission = accessScopes.includes(
      AccessScope.CUSTOMER_SCOPE,
    )
      ? await this.permissionService.checkPermission(
          callerUserId,
          AccessScope.CUSTOMER_SCOPE,
          'roles:manage',
        )
      : false;

    if (!hasHQPermission && !hasCustomerPermission) {
      throw new ForbiddenException('沒有 roles:manage 權限');
    }

    const userContext = {
      accessScopes,
      userId: callerUserId,
      permissions: context.req?.user?.permissions || [],
    };

    return this.userService.assignRole(input, userContext, lang);
  }

  @Mutation(() => Boolean, {
    description:
      '撤銷用戶的角色（需要 HQ_SCOPE 或 CUSTOMER_SCOPE 且擁有 roles:manage 權限）',
  })
  @UseGuards(PermissionGuard)
  @RequiresAnyScope([AccessScope.HQ_SCOPE, AccessScope.CUSTOMER_SCOPE])
  async revokeRole(
    @Args('input') input: RevokeRoleInput,
    @Context() context: GraphQLContext,
    @I18nLang() lang: string,
  ): Promise<boolean> {
    const callerUserId = context.req.user?.userId || context.req.user?.sub;
    if (!callerUserId) {
      throw new ForbiddenException('User ID not found in context');
    }

    // Manually check roles:manage permission
    const accessScopes = context.req?.user?.accessScopes || [];
    const isHQ = accessScopes.includes(AccessScope.HQ_SCOPE);
    const hasHQPermission = isHQ
      ? await this.permissionService.checkPermission(
          callerUserId,
          AccessScope.HQ_SCOPE,
          'roles:manage',
        )
      : false;
    const hasCustomerPermission = accessScopes.includes(
      AccessScope.CUSTOMER_SCOPE,
    )
      ? await this.permissionService.checkPermission(
          callerUserId,
          AccessScope.CUSTOMER_SCOPE,
          'roles:manage',
        )
      : false;

    if (!hasHQPermission && !hasCustomerPermission) {
      throw new ForbiddenException('沒有 roles:manage 權限');
    }

    const userContext = {
      accessScopes,
      userId: callerUserId,
      permissions: context.req?.user?.permissions || [],
    };

    return this.userService.revokeRole(input, userContext, lang);
  }
}
