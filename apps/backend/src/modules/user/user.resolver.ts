import { Query, Resolver, Args, Mutation, Context } from '@nestjs/graphql';
import { UseGuards, ForbiddenException } from '@nestjs/common';
import { UserType, PaginatedUsers } from './user.types';
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
} from './user.input';
import { GraphQLContext } from '../../common/types/graphql-context.type';

@Resolver(() => UserType)
export class UserResolver {
  constructor(private userService: UserService) {}

  // ==================== READ OPERATIONS ====================

  @Query(() => UserType, {
    nullable: true,
    description:
      '依 ID 查詢單一使用者資料（需要 ADMIN_SCOPE 或 CUSTOMER_SCOPE 且擁有 users:read 權限）',
  })
  @UseGuards(PermissionGuard)
  @RequiresAnyScope([AccessScope.ADMIN_SCOPE, AccessScope.CUSTOMER_SCOPE])
  @RequiresPermission('users:read')
  async user(
    @Args('id', { description: '使用者唯一識別碼（UUID）' }) id: string,
    @Args('includeDeleted', {
      defaultValue: false,
      description: '是否包含已軟刪除的使用者（僅 ADMIN_SCOPE 可用）',
    })
    includeDeleted: boolean,
    @Context() context: GraphQLContext,
  ): Promise<UserType | null> {
    // 檢查 includeDeleted 權限：只有 ADMIN_SCOPE 可以查詢已刪除的資料
    if (includeDeleted) {
      const user = context.req?.user;
      const hasAdminScope = user?.accessScopes?.includes(
        AccessScope.ADMIN_SCOPE,
      );

      if (!hasAdminScope) {
        throw new ForbiddenException('只有管理員可以查詢已刪除的使用者資料');
      }
    }

    // 提取使用者權限上下文
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
    description: '分頁查詢使用者列表（支援排序、篩選，推薦使用此 API）',
  })
  @UseGuards(PermissionGuard)
  @RequiresAnyScope([AccessScope.ADMIN_SCOPE, AccessScope.CUSTOMER_SCOPE])
  @RequiresPermission('users:list')
  async usersPaginated(
    @Args('pagination', {
      type: () => PaginationInput,
      defaultValue: { page: 1, limit: 20 },
      description: '分頁參數（頁碼和每頁數量）',
    })
    pagination: PaginationInput,
    @Args('includeDeleted', {
      defaultValue: false,
      description: '是否包含已軟刪除的使用者（僅 ADMIN_SCOPE 可用）',
    })
    includeDeleted: boolean,
    @Context() context: GraphQLContext,
  ): Promise<PaginatedUsers> {
    // 檢查 includeDeleted 權限：只有 ADMIN_SCOPE 可以查詢已刪除的資料
    if (includeDeleted) {
      const user = context.req?.user;
      const hasAdminScope = user?.accessScopes?.includes(
        AccessScope.ADMIN_SCOPE,
      );

      if (!hasAdminScope) {
        throw new ForbiddenException('只有管理員可以查詢已刪除的使用者資料');
      }
    }

    // 提取使用者權限上下文
    const userContext = {
      accessScopes: context.req?.user?.accessScopes || [],
      userId: context.req?.user?.userId,
    };

    return this.userService.findAllUsersPaginated(
      pagination.page,
      pagination.limit,
      includeDeleted,
      userContext,
    );
  }

  @Query(() => UserType, {
    nullable: true,
    description:
      '依 Email 查詢使用者（需要 ADMIN_SCOPE 或 CUSTOMER_SCOPE 且擁有 users:read 權限）',
  })
  @UseGuards(PermissionGuard)
  @RequiresAnyScope([AccessScope.ADMIN_SCOPE, AccessScope.CUSTOMER_SCOPE])
  @RequiresPermission('users:read')
  async userByEmail(
    @Args('email', { description: '使用者電子郵件地址' })
    email: string,
    @Args('includeDeleted', {
      defaultValue: false,
      description: '是否包含已軟刪除的使用者（僅 ADMIN_SCOPE 可用）',
    })
    includeDeleted: boolean,
    @Context() context: GraphQLContext,
  ): Promise<UserType | null> {
    // 檢查 includeDeleted 權限：只有 ADMIN_SCOPE 可以查詢已刪除的資料
    if (includeDeleted) {
      const user = context.req?.user;
      const hasAdminScope = user?.accessScopes?.includes(
        AccessScope.ADMIN_SCOPE,
      );

      if (!hasAdminScope) {
        throw new ForbiddenException('只有管理員可以查詢已刪除的使用者資料');
      }
    }

    // 提取使用者權限上下文
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
    description: '查詢當前登入使用者的完整資料',
  })
  @UseGuards(JwtAuthGuard)
  async me(@Context() context: GraphQLContext): Promise<UserType> {
    const userId = context.req.user?.userId || context.req.user?.sub;
    if (!userId) {
      throw new ForbiddenException('User ID not found in context');
    }
    return this.userService.findUserById(userId, false) as Promise<UserType>;
  }

  @Mutation(() => UserType, {
    description: '更新當前使用者的基本資料（email、name）',
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
    return this.userService.updateUserSelf(userId, input, lang);
  }

  @Mutation(() => ProfileType, {
    description: '更新當前使用者的詳細資料（Profile）',
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
    description: '修改當前使用者的密碼',
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
    return this.userService.changePasswordSelf(
      userId,
      input,
      ipAddress,
      userAgent,
      lang,
    );
  }

  // ==================== WRITE OPERATIONS (ADMIN ONLY) ====================

  @Mutation(() => UserType, {
    description: '軟刪除使用者（僅 ADMIN，需要 users:delete 權限）',
  })
  @UseGuards(PermissionGuard)
  @RequiresScope(AccessScope.ADMIN_SCOPE)
  @RequiresPermission('users:delete')
  async softDeleteUser(@Args('id') id: string): Promise<UserType | null> {
    return this.userService.softDeleteUser(id) as Promise<UserType | null>;
  }

  @Mutation(() => UserType, {
    description: '恢復已刪除的使用者（僅 ADMIN，需要 users:restore 權限）',
  })
  @UseGuards(PermissionGuard)
  @RequiresScope(AccessScope.ADMIN_SCOPE)
  @RequiresPermission('users:restore')
  async restoreUser(@Args('id') id: string): Promise<UserType | null> {
    return this.userService.restoreUser(id) as Promise<UserType | null>;
  }
}
