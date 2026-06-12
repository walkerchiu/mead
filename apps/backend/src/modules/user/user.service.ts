import {
  Injectable,
  BadRequestException,
  ForbiddenException,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { AccessScope } from '../../common/enums/access-scope.enum';
import {
  createPaginationResult,
  calculateSkip,
  PaginationResult,
} from '../../common/utils/pagination.utils';
import { I18nService } from 'nestjs-i18n';
import { ConfigService } from '@nestjs/config';
import { MailService } from '../../mail/mail.service';
import { SessionManagementService } from '../../auth/session-management.service';
import {
  assertValidEmail,
  assertValidName,
  assertValidAccountName,
} from '../../common/utils/input-validator';
import { logger } from '../../common/services/logger.service';
import {
  assertPasswordStrength,
  assertPasswordStrengthAsync,
} from '../../common/utils/password-validator';
import { UpdateUserInput } from './user.input';
import { UpdateProfileInput } from './user.input';
import { ChangePasswordInput } from './user.input';
import { CreateUserInput } from './user.input';
import { HQUpdateUserInput } from './user.input';
import { HQResetPasswordInput } from './user.input';
import { LockUserInput } from './user.input';
import { UserFilterInput, UserStatus } from './user.input';
import { AssignRoleInput, RevokeRoleInput } from './user.input';
import { PermissionService } from '../../rbac/permission.service';
import { RoleService } from '../../rbac/role.service';
import { NotificationService } from '../../notification/notification.service';
import * as bcrypt from 'bcrypt';

/**
 * 用戶查詢上下文（包含當前用戶的權限資訊）
 */
export interface UserQueryContext {
  accessScopes?: AccessScope[];
  userId?: string;
}

@Injectable()
export class UserService {
  private readonly SALT_ROUNDS = 12; // OWASP 建議 12-14 rounds

  constructor(
    private prisma: PrismaService,
    private i18n: I18nService,
    private config: ConfigService,
    private mailService: MailService,
    private sessionManagementService: SessionManagementService,
    private permissionService: PermissionService,
    private roleService: RoleService,
    private notificationService: NotificationService,
  ) {}

  /**
   * 根據用戶的 accessScopes 建立資料過濾條件
   *
   * 規則：
   * - HQ_SCOPE: 可以查詢所有帳號
   * - CUSTOMER_SCOPE: 只能查詢 CUSTOMER_SCOPE 和 PUBLIC_SCOPE 的帳號
   * - PUBLIC_SCOPE: 只能查詢 PUBLIC_SCOPE 的帳號
   */
  private buildAccessScopeFilter(context?: UserQueryContext) {
    if (
      !context ||
      !context.accessScopes ||
      context.accessScopes.length === 0
    ) {
      // 未認證的用戶，只能查詢 PUBLIC_SCOPE
      return {
        accessScopes: {
          hasSome: [AccessScope.PUBLIC_SCOPE],
        },
      };
    }

    const accessScopes = context.accessScopes;

    // HQ 可以查詢所有帳號
    if (accessScopes.includes(AccessScope.HQ_SCOPE)) {
      return {}; // 無過濾條件
    }

    // CUSTOMER 可以查詢 CUSTOMER_SCOPE 和 PUBLIC_SCOPE
    if (accessScopes.includes(AccessScope.CUSTOMER_SCOPE)) {
      return {
        accessScopes: {
          hasSome: [AccessScope.CUSTOMER_SCOPE, AccessScope.PUBLIC_SCOPE],
        },
      };
    }

    // PUBLIC 只能查詢 PUBLIC_SCOPE
    if (accessScopes.includes(AccessScope.PUBLIC_SCOPE)) {
      return {
        accessScopes: {
          hasSome: [AccessScope.PUBLIC_SCOPE],
        },
      };
    }

    // 預設：無權限查看任何資料
    return {
      id: 'impossible-id-to-match', // 確保不會匹配任何資料
    };
  }

  /**
   * 分頁查詢用戶（支援 Row-Level Security）
   * @param page 頁碼
   * @param limit 每頁筆數
   * @param includeDeleted 是否包含已刪除的資料
   * @param context 查詢上下文（包含用戶權限）
   */
  async findAllUsersPaginated(
    page: number,
    limit: number,
    filter?: UserFilterInput,
    includeDeleted = false,
    context?: UserQueryContext,
  ): Promise<PaginationResult<any>> {
    // 輸入驗證
    page = Math.max(1, Math.floor(page));
    limit = Math.max(1, Math.min(100, Math.floor(limit)));

    // 建立基礎過濾條件
    const baseWhere = includeDeleted ? {} : { deletedAt: null };

    // 添加 accessScope 過濾條件
    const accessScopeFilter = this.buildAccessScopeFilter(context);

    // 建立篩選條件
    const filterWhere: any = {};

    // 1. 搜尋篩選（名稱或電子郵件）
    if (filter?.search) {
      filterWhere.OR = [
        { name: { contains: filter.search, mode: 'insensitive' } },
        { email: { contains: filter.search, mode: 'insensitive' } },
      ];
    }

    // 2. 存取範圍篩選
    if (filter?.accessScope) {
      filterWhere.accessScopes = {
        has: filter.accessScope,
      };
    }

    // 3. 角色篩選
    if (filter?.roleId) {
      filterWhere.userRoles = {
        some: {
          roleId: filter.roleId,
        },
      };
    }

    // 4. 狀態篩選
    if (filter?.status) {
      const now = new Date();

      switch (filter.status) {
        case UserStatus.ACTIVE:
          // 啟用：未刪除且未鎖定（或鎖定已過期）
          filterWhere.deletedAt = null;
          filterWhere.OR = [
            { lockedUntil: null },
            { lockedUntil: { lt: now } },
          ];
          break;
        case UserStatus.LOCKED:
          // 已鎖定：未刪除且鎖定時間在未來
          filterWhere.deletedAt = null;
          filterWhere.lockedUntil = { gte: now };
          break;
        case UserStatus.DELETED:
          // 已刪除：有 deletedAt 時間戳
          filterWhere.deletedAt = { not: null };
          break;
      }
    }

    const where = {
      ...baseWhere,
      ...accessScopeFilter,
      ...filterWhere,
    };

    const skip = calculateSkip(page, limit);

    // 並行查詢資料和總數
    const [rawData, totalCount] = await Promise.all([
      this.prisma.user.findMany({
        where,
        include: {
          profile: {
            where: includeDeleted ? {} : { deletedAt: null },
          },
          userRoles: {
            include: {
              role: true,
            },
          },
        },
        orderBy: {
          createdAt: 'desc',
        },
        skip,
        take: limit,
      }),
      this.prisma.user.count({ where }),
    ]);

    // Map userRoles to a flat roles array for each user
    const data = rawData.map((user) => ({
      ...user,
      roles: user.userRoles?.map((ur) => ur.role) || [],
    }));

    return createPaginationResult(data, totalCount, page, limit);
  }

  /**
   * 查詢所有用戶（預設不包含已刪除，支援 Row-Level Security）
   * @param includeDeleted 是否包含已刪除的資料
   * @param context 查詢上下文（包含用戶權限）
   */
  async findAllUsers(includeDeleted = false, context?: UserQueryContext) {
    const baseWhere = includeDeleted ? {} : { deletedAt: null };
    const accessScopeFilter = this.buildAccessScopeFilter(context);

    const where = {
      ...baseWhere,
      ...accessScopeFilter,
    };

    return this.prisma.user.findMany({
      where,
      include: {
        profile: {
          where: includeDeleted ? {} : { deletedAt: null },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });
  }

  /**
   * 依 ID 查詢用戶（支援 Row-Level Security）
   * @param id 用戶 ID
   * @param includeDeleted 是否包含已刪除的資料
   * @param context 查詢上下文（包含用戶權限）
   */
  async findUserById(
    id: string,
    includeDeleted = false,
    context?: UserQueryContext,
  ) {
    const baseWhere = includeDeleted ? {} : { deletedAt: null };
    const accessScopeFilter = this.buildAccessScopeFilter(context);

    return this.prisma.user.findFirst({
      where: {
        id,
        ...baseWhere,
        ...accessScopeFilter,
      },
      include: {
        profile: {
          where: includeDeleted ? {} : { deletedAt: null },
        },
      },
    });
  }

  /**
   * 依 Email 查詢用戶（支援 Row-Level Security）
   * @param email Email
   * @param includeDeleted 是否包含已刪除的資料
   * @param context 查詢上下文（包含用戶權限）
   */
  async findUserByEmail(
    email: string,
    includeDeleted = false,
    context?: UserQueryContext,
  ) {
    const baseWhere = includeDeleted ? {} : { deletedAt: null };
    const accessScopeFilter = this.buildAccessScopeFilter(context);

    return this.prisma.user.findFirst({
      where: {
        email,
        ...baseWhere,
        ...accessScopeFilter,
      },
      include: {
        profile: {
          where: includeDeleted ? {} : { deletedAt: null },
        },
      },
    });
  }

  /**
   * 建立用戶（內部方法，由 Auth Service 呼叫）
   * 一般情況應該使用 AuthService.register() 而非直接呼叫此方法
   */
  async createUserInternal(data: {
    email: string;
    password: string;
    name?: string;
    role?: any;
  }) {
    return this.prisma.user.create({
      data,
      include: {
        profile: true,
      },
    });
  }

  /**
   * 更新用戶
   */
  async updateUser(id: string, data: { name?: string; email?: string }) {
    return this.prisma.user.update({
      where: { id },
      data,
      include: {
        profile: true,
      },
    });
  }

  /**
   * 恢復已刪除的用戶
   */
  async restoreUser(id: string) {
    return this.prisma.user.update({
      where: { id },
      data: {
        deletedAt: null,
      },
      include: {
        profile: true,
      },
    });
  }

  /**
   * 建立 Profile
   */
  async createProfile(data: {
    userId: string;
    bio?: string;
    avatar?: string;
    phone?: string;
    address?: string;
    website?: string;
  }) {
    return this.prisma.profile.create({
      data,
    });
  }

  /**
   * 更新 Profile
   */
  async updateProfile(
    userId: string,
    data: {
      bio?: string;
      avatar?: string;
      phone?: string;
      address?: string;
      website?: string;
    },
  ) {
    return this.prisma.profile.update({
      where: { userId },
      data,
    });
  }

  /**
   * 用戶更新自己的基本資料（email、name）
   */
  async updateUserSelf(
    userId: string,
    data: UpdateUserInput,
    ipAddress?: string,
    lang?: string,
  ): Promise<any> {
    // 驗證 email 格式
    if (data.email) {
      assertValidEmail(data.email, lang, this.i18n);

      // 檢查 email 是否已被其他用戶使用
      const existingUser = await this.prisma.user.findFirst({
        where: {
          email: data.email,
          id: { not: userId },
          deletedAt: null,
        },
      });

      if (existingUser) {
        const message = this.i18n.translate('validation.email.alreadyUsed', {
          lang,
        });
        throw new BadRequestException(message);
      }
    }

    // 驗證 name 長度
    if (data.name !== undefined) {
      assertValidName(data.name, lang, this.i18n);
    }

    // 查詢原始資料以比對變更
    const originalUser = await this.prisma.user.findUnique({
      where: { id: userId },
      include: { profile: true },
    });

    // 更新用戶資料
    const updatedUser = await this.prisma.user.update({
      where: { id: userId },
      data,
      include: {
        profile: {
          where: { deletedAt: null },
        },
      },
    });

    // 發送個人資料更新通知
    if (originalUser) {
      const changes: string[] = [];
      if (data.name !== undefined && data.name !== originalUser.name) {
        changes.push(`姓名：${originalUser.name || '(未設定)'} → ${data.name}`);
      }
      if (data.email && data.email !== originalUser.email) {
        changes.push(`Email：${originalUser.email} → ${data.email}`);
      }

      if (changes.length > 0) {
        const userLang = originalUser.profile?.language || lang;
        try {
          await this.mailService.sendProfileUpdatedEmail(
            originalUser.email,
            originalUser.name,
            changes,
            ipAddress,
            userLang,
          );
        } catch (error) {
          logger.error('[UserService] Failed to send profile updated email', {
            userId,
            error: error instanceof Error ? error.message : 'Unknown error',
          });
        }
      }
    }

    return updatedUser;
  }

  /**
   * 用戶更新自己的詳細資料（Profile）
   */
  async updateProfileSelf(
    userId: string,
    data: UpdateProfileInput,
    lang?: string,
  ): Promise<any> {
    // 驗證 language 欄位
    if (data.language && !['en', 'zh-TW'].includes(data.language)) {
      const message = this.i18n.translate('validation.language.invalid', {
        lang,
      });
      throw new BadRequestException(message);
    }

    // 驗證 website URL 格式
    if (data.website && data.website.trim() !== '') {
      try {
        new URL(data.website);
      } catch {
        const message = this.i18n.translate('validation.website.invalid', {
          lang,
        });
        throw new BadRequestException(message);
      }
    }

    // 檢查 Profile 是否存在
    const existingProfile = await this.prisma.profile.findUnique({
      where: { userId },
    });

    if (existingProfile) {
      // 更新現有 Profile
      return this.prisma.profile.update({
        where: { userId },
        data,
      });
    } else {
      // 創建新 Profile
      return this.prisma.profile.create({
        data: {
          userId,
          ...data,
        },
      });
    }
  }

  /**
   * 用戶修改自己的密碼
   */
  async changePasswordSelf(
    userId: string,
    input: ChangePasswordInput,
    ipAddress?: string,
    userAgent?: string,
    lang?: string,
  ): Promise<boolean> {
    const { currentPassword, newPassword, revokeOtherSessions } = input;

    // 獲取用戶資料
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      include: {
        profile: true,
      },
    });

    if (!user) {
      const message = this.i18n.translate('validation.user.notFound', { lang });
      throw new BadRequestException(message);
    }

    // 驗證當前密碼
    const isPasswordValid = await bcrypt.compare(
      currentPassword,
      user.password,
    );
    if (!isPasswordValid) {
      const message = this.i18n.translate(
        'validation.password.currentIncorrect',
        { lang },
      );
      throw new BadRequestException(message);
    }

    // 確保新舊密碼不同
    const isSamePassword = await bcrypt.compare(newPassword, user.password);
    if (isSamePassword) {
      const message = this.i18n.translate(
        'validation.password.mustBeDifferent',
        { lang },
      );
      throw new BadRequestException(message);
    }

    // 查詢最近 3 組密碼歷史記錄（用於檢查密碼重複使用）
    const passwordHistories = await this.prisma.passwordHistory.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
      take: 3,
      select: { passwordHash: true },
    });

    // 驗證新密碼強度（包含密碼歷史檢查）
    await assertPasswordStrengthAsync(
      newPassword,
      lang,
      this.i18n,
      {
        email: user.email,
        name: user.name || undefined,
        username: user.accountName || undefined,
      },
      {
        passwordHashes: passwordHistories.map((h) => h.passwordHash),
      },
    );

    // 加密新密碼
    const hashedPassword = await bcrypt.hash(newPassword, this.SALT_ROUNDS);

    // 使用交易來確保密碼更新和歷史記錄的原子性
    await this.prisma.$transaction(async (tx) => {
      // 1. 將當前密碼儲存到歷史記錄
      await tx.passwordHistory.create({
        data: {
          userId,
          passwordHash: user.password,
        },
      });

      // 2. 更新密碼（一併解除「首次登入須改密」關卡）
      await tx.user.update({
        where: { id: userId },
        data: { password: hashedPassword, mustChangePassword: false },
      });

      // 3. 只保留最近 3 組密碼歷史記錄（刪除更舊的記錄）
      // 先查詢所有歷史記錄並取得 ID
      const allHistories = await tx.passwordHistory.findMany({
        where: { userId },
        orderBy: { createdAt: 'desc' },
        select: { id: true },
      });

      // 如果超過 3 組，刪除多餘的
      if (allHistories.length > 3) {
        const idsToKeep = allHistories.slice(0, 3).map((h) => h.id);
        await tx.passwordHistory.deleteMany({
          where: {
            userId,
            id: {
              notIn: idsToKeep,
            },
          },
        });
      }
    });

    // 撤銷其他設備的 sessions（可選）
    if (revokeOtherSessions) {
      // 撤銷所有 sessions（包含當前 session）
      // 用戶需要重新登入
      await this.sessionManagementService.revokeAllSessions(userId);
    }

    // 發送密碼變更通知（email + 系統通知）
    // 通知信寄送失敗不應使整個改密操作失敗（密碼已於上方交易提交）；僅記錄錯誤。
    const userLang = user.profile?.language || lang;
    try {
      await this.mailService.sendPasswordChangedEmail(
        user.email,
        user.name,
        ipAddress,
        userLang,
      );
    } catch (error) {
      logger.error(
        '[UserService] Failed to send password change email:',
        error,
      );
    }

    if (
      this.config.get<string>('PUSH_NOTIFY_PASSWORD_CHANGED', 'true') !==
      'false'
    ) {
      try {
        await this.notificationService.createLocalizedNotification(
          userId,
          'INFO',
          'PASSWORD_CHANGED_SELF',
          [],
          { event: 'PASSWORD_CHANGED', source: 'self_change', ipAddress },
        );
      } catch (error) {
        logger.error(
          '[UserService] Failed to create password change notification:',
          error,
        );
      }
    }

    return true;
  }

  // ==================== HQ/MANAGER OPERATIONS ====================

  /**
   * 擴展的 UserQueryContext 包含權限資訊
   */
  private hasPermission(
    context: UserQueryContext & { permissions?: string[] },
    permission: string,
  ): boolean {
    return (
      context.permissions?.includes(permission) ||
      context.permissions?.includes('*') ||
      false
    );
  }

  /**
   * 檢查是否為 HQ 或 CUSTOMER_SCOPE 的 OWNER/MANAGER
   */
  private canManageUsers(
    context: UserQueryContext & { permissions?: string[] },
  ): boolean {
    const isHQ = context.accessScopes?.includes(AccessScope.HQ_SCOPE);
    const isCustomerManager =
      context.accessScopes?.includes(AccessScope.CUSTOMER_SCOPE) &&
      (this.hasPermission(context, 'users:create') ||
        this.hasPermission(context, 'users:update') ||
        this.hasPermission(context, 'users:delete'));

    return isHQ || isCustomerManager;
  }

  /**
   * 驗證用戶管理權限（目標用戶限制檢查）
   *
   * 規則：
   * - SUPER_HQ: 可管理任何人
   * - CONTENT_EDITOR (HQ non-SUPER_HQ): 不可管理 SUPER_HQ 用戶
   * - OWNER (CUSTOMER_SCOPE): 僅可管理 CUSTOMER_SCOPE 用戶
   * - MANAGER (CUSTOMER_SCOPE): 僅可管理 CUSTOMER_SCOPE 用戶，且不可管理 OWNER
   */
  private async validateUserManagementPermission(
    callerContext: UserQueryContext & { permissions?: string[] },
    targetUserId: string,
    lang?: string,
  ): Promise<void> {
    const callerIsHQ = callerContext.accessScopes?.includes(
      AccessScope.HQ_SCOPE,
    );

    // 檢查呼叫者是否為 SUPER_HQ
    const callerIsSuperHQ =
      callerIsHQ && callerContext.userId
        ? await this.permissionService.hasRole(
            callerContext.userId,
            AccessScope.HQ_SCOPE,
            'SUPER_HQ',
          )
        : false;

    // SUPER_HQ 可管理任何人
    if (callerIsSuperHQ) return;

    // 取得目標用戶資訊
    const targetUser = await this.prisma.user.findUnique({
      where: { id: targetUserId },
      include: { userRoles: { include: { role: true } } },
    });

    if (!targetUser) {
      throw new NotFoundException(
        this.i18n.translate('user.notFound', { lang }) || 'User not found',
      );
    }

    const targetRoleNames = targetUser.userRoles.map((ur) => ur.role.name);
    const targetIsHQ = targetUser.accessScopes?.includes(AccessScope.HQ_SCOPE);
    const targetIsSuperHQ = targetRoleNames.includes('SUPER_HQ');
    const targetIsOwner = targetRoleNames.includes('OWNER');

    // CONTENT_EDITOR (HQ non-SUPER_HQ): 不可管理 SUPER_HQ 用戶
    if (callerIsHQ) {
      if (targetIsSuperHQ) {
        throw new ForbiddenException(
          this.i18n.translate('auth.forbidden.manageSuperHQ', { lang }) ||
            'Cannot manage SUPER_HQ users',
        );
      }
      return; // 可管理其他所有人
    }

    // OWNER/MANAGER (non-HQ): 只能管理 CUSTOMER_SCOPE 用戶
    if (targetIsHQ) {
      throw new ForbiddenException(
        this.i18n.translate('auth.forbidden.manageHQUser', { lang }) ||
          'Cannot manage HQ users',
      );
    }

    // MANAGER 不可管理 OWNER
    if (callerContext.userId) {
      const callerIsOwner = await this.permissionService.hasRole(
        callerContext.userId,
        AccessScope.CUSTOMER_SCOPE,
        'OWNER',
      );

      if (!callerIsOwner && targetIsOwner) {
        throw new ForbiddenException(
          this.i18n.translate('auth.forbidden.manageOwner', { lang }) ||
            'Cannot manage OWNER users',
        );
      }
    }
  }

  /**
   * 創建新用戶（管理員功能）
   */
  async createUser(
    input: CreateUserInput,
    context: UserQueryContext & { permissions?: string[] },
    lang?: string,
  ): Promise<any> {
    // 驗證權限
    if (!this.canManageUsers(context)) {
      const message = this.i18n.translate('auth.forbidden.createUser', {
        lang,
      });
      throw new BadRequestException(message);
    }

    // 帳號（登入識別子）一律小寫化；驗證格式
    const accountLower = input.accountName.trim().toLowerCase();
    assertValidAccountName(accountLower, lang, this.i18n);

    // 驗證 email 格式（email 已非唯一、僅通知用）
    assertValidEmail(input.email, lang, this.i18n);

    // 驗證名稱
    assertValidName(input.name, lang, this.i18n);

    // 唯一性以「帳號」為準（email 已非唯一）
    const existingUser = await this.prisma.user.findFirst({
      where: {
        accountName: accountLower,
      },
    });

    if (existingUser) {
      const message = this.i18n.translate('validation.account.alreadyUsed', {
        lang,
      });
      throw new BadRequestException(message);
    }

    // 驗證密碼強度（username 帶帳號避免密碼含帳號片段）
    assertPasswordStrength(input.password, lang, this.i18n, {
      email: input.email,
      name: input.name,
      username: accountLower,
    });

    // 加密密碼
    const hashedPassword = await bcrypt.hash(input.password, this.SALT_ROUNDS);

    // CUSTOMER_SCOPE 管理員只能創建 CUSTOMER_SCOPE 用戶
    const accessScopes = context.accessScopes?.includes(AccessScope.HQ_SCOPE)
      ? [AccessScope.CUSTOMER_SCOPE] // 預設創建為 CUSTOMER
      : [AccessScope.CUSTOMER_SCOPE];

    // 創建用戶
    const user = await this.prisma.user.create({
      data: {
        accountName: accountLower,
        email: input.email,
        name: input.name,
        password: hashedPassword,
        accessScopes,
        // 管理員建立的是臨時密碼，首次登入須強制變更
        mustChangePassword: true,
      },
      include: {
        profile: true,
      },
    });

    // 發送歡迎郵件（可選）
    // await this.mailService.sendWelcomeEmail(user.email, user.name, lang);

    return user;
  }

  /**
   * 管理員更新用戶資料
   */
  async hqUpdateUser(
    id: string,
    input: HQUpdateUserInput,
    context: UserQueryContext & { permissions?: string[] },
    lang?: string,
  ): Promise<any> {
    // 驗證權限
    if (!this.canManageUsers(context)) {
      const message = this.i18n.translate('auth.forbidden.updateUser', {
        lang,
      });
      throw new BadRequestException(message);
    }

    // 驗證目標用戶管理權限（含角色層級限制）
    await this.validateUserManagementPermission(context, id, lang);

    // 檢查目標用戶是否存在
    const targetUser = await this.prisma.user.findUnique({
      where: { id },
    });

    if (!targetUser) {
      const message = this.i18n.translate('user.notFound', { lang });
      throw new BadRequestException(message);
    }

    // 驗證 email（如果要更新）
    if (input.email) {
      assertValidEmail(input.email, lang, this.i18n);

      // 檢查 email 是否已被其他用戶使用
      const existingUser = await this.prisma.user.findFirst({
        where: {
          email: input.email,
          id: { not: id },
          deletedAt: null,
        },
      });

      if (existingUser) {
        const message = this.i18n.translate('validation.email.alreadyUsed', {
          lang,
        });
        throw new BadRequestException(message);
      }
    }

    // 驗證名稱（如果要更新）
    if (input.name) {
      assertValidName(input.name, lang, this.i18n);
    }

    // 更新用戶
    return this.prisma.user.update({
      where: { id },
      data: {
        ...(input.email && { email: input.email }),
        ...(input.name && { name: input.name }),
      },
      include: {
        profile: true,
      },
    });
  }

  /**
   * 管理員重設用戶密碼
   */
  async hqResetPassword(
    id: string,
    input: HQResetPasswordInput,
    context: UserQueryContext & { permissions?: string[] },
    ipAddress?: string,
    userAgent?: string,
    lang?: string,
  ): Promise<boolean> {
    // 驗證權限
    if (!this.canManageUsers(context)) {
      const message = this.i18n.translate('auth.forbidden.resetPassword', {
        lang,
      });
      throw new BadRequestException(message);
    }

    // 驗證目標用戶管理權限（含角色層級限制）
    await this.validateUserManagementPermission(context, id, lang);

    // 檢查目標用戶是否存在
    const targetUser = await this.prisma.user.findUnique({
      where: { id },
      include: {
        profile: true,
      },
    });

    if (!targetUser) {
      const message = this.i18n.translate('user.notFound', { lang });
      throw new BadRequestException(message);
    }

    // 驗證新密碼強度
    assertPasswordStrength(input.newPassword, lang, this.i18n, {
      email: targetUser.email,
      name: targetUser.name || undefined,
      username: targetUser.accountName || undefined,
    });

    // 加密新密碼
    const hashedPassword = await bcrypt.hash(
      input.newPassword,
      this.SALT_ROUNDS,
    );

    // 更新密碼（管理員重設的是臨時密碼，使用者下次登入須強制改密）
    await this.prisma.user.update({
      where: { id },
      data: { password: hashedPassword, mustChangePassword: true },
    });

    // 撤銷該用戶的所有 sessions
    if (input.revokeAllSessions) {
      await this.sessionManagementService.revokeAllSessions(id);
    }

    // 發送密碼變更通知（email + 系統通知）
    // 通知信寄送失敗不應使整個操作失敗（密碼已更新）；僅記錄錯誤。
    const userLang = targetUser.profile?.language || lang;
    try {
      await this.mailService.sendPasswordChangedEmail(
        targetUser.email,
        targetUser.name,
        ipAddress,
        userLang,
      );
    } catch (error) {
      logger.error(
        '[UserService] Failed to send password change email:',
        error,
      );
    }

    if (
      this.config.get<string>('PUSH_NOTIFY_PASSWORD_CHANGED', 'true') !==
      'false'
    ) {
      try {
        await this.notificationService.createLocalizedNotification(
          id,
          'WARNING',
          'PASSWORD_CHANGED_HQ',
          [],
          {
            event: 'PASSWORD_CHANGED',
            source: 'hq_reset',
            operatorId: context.userId,
          },
        );
      } catch (error) {
        logger.error(
          '[UserService] Failed to create hq reset notification:',
          error,
        );
      }
    }

    return true;
  }

  /**
   * 軟刪除用戶（帶權限檢查）
   */
  async softDeleteUser(
    id: string,
    context?: UserQueryContext & { permissions?: string[] },
  ) {
    // 如果提供了 context，進行權限檢查
    if (context && !this.canManageUsers(context)) {
      throw new BadRequestException('沒有權限刪除用戶');
    }

    // 驗證目標用戶管理權限（含角色層級限制）
    if (context) {
      await this.validateUserManagementPermission(context, id);
    }

    return this.prisma.user.update({
      where: { id },
      data: {
        deletedAt: new Date(),
      },
      include: {
        profile: true,
      },
    });
  }

  /**
   * 鎖定用戶
   * @param id 用戶 ID
   * @param input 鎖定輸入
   * @param context 用戶上下文
   * @param lang 語言
   * @returns 更新後的用戶
   */
  async lockUser(
    id: string,
    input: LockUserInput,
    context: UserQueryContext & { permissions?: string[] },
    lang: string,
  ) {
    // 驗證目標用戶管理權限（含角色層級限制）
    await this.validateUserManagementPermission(context, id, lang);

    // 檢查目標用戶是否存在
    const targetUser = await this.prisma.user.findUnique({
      where: { id, deletedAt: null },
      select: {
        id: true,
        email: true,
        name: true,
        accessScopes: true,
      },
    });

    if (!targetUser) {
      throw new BadRequestException(
        this.i18n.t('errors.user.not_found', { lang }),
      );
    }

    // 計算鎖定結束時間
    const lockedUntil = new Date();
    lockedUntil.setMinutes(
      lockedUntil.getMinutes() + input.lockDurationMinutes,
    );

    // 更新用戶鎖定狀態
    const updatedUser = await this.prisma.user.update({
      where: { id },
      data: {
        lockedUntil,
        failedLoginAttempts: 0, // 重置失敗登入次數
      },
      include: {
        profile: true,
      },
    });

    // TODO: 記錄審計日誌（鎖定原因）
    // TODO: 撤銷該用戶的所有 sessions

    return updatedUser;
  }

  /**
   * 解鎖用戶
   * @param id 用戶 ID
   * @param context 用戶上下文
   * @param lang 語言
   * @returns 更新後的用戶
   */
  async unlockUser(
    id: string,
    context: UserQueryContext & { permissions?: string[] },
    lang: string,
  ) {
    // 驗證目標用戶管理權限（含角色層級限制）
    await this.validateUserManagementPermission(context, id, lang);

    // 檢查目標用戶是否存在
    const targetUser = await this.prisma.user.findUnique({
      where: { id, deletedAt: null },
      select: {
        id: true,
        email: true,
        name: true,
        accessScopes: true,
        lockedUntil: true,
      },
    });

    if (!targetUser) {
      throw new BadRequestException(
        this.i18n.t('errors.user.not_found', { lang }),
      );
    }

    // 檢查是否已經解鎖
    if (!targetUser.lockedUntil || targetUser.lockedUntil < new Date()) {
      throw new BadRequestException('該用戶未被鎖定');
    }

    // 解鎖用戶
    const updatedUser = await this.prisma.user.update({
      where: { id },
      data: {
        lockedUntil: null,
        failedLoginAttempts: 0, // 重置失敗登入次數
      },
      include: {
        profile: true,
      },
    });

    // TODO: 記錄審計日誌

    return updatedUser;
  }

  // ==================== ROLE ASSIGNMENT OPERATIONS ====================

  /**
   * 取得呼叫者可分配的角色列表
   * - HQ: 所有角色（HQ_SCOPE + CUSTOMER_SCOPE）
   * - OWNER: 所有 CUSTOMER_SCOPE 角色
   * - MANAGER: CUSTOMER_SCOPE 角色，但排除 OWNER 和 MANAGER
   */
  async getAssignableRoles(
    context: UserQueryContext & { permissions?: string[] },
  ) {
    const isHQ = context.accessScopes?.includes(AccessScope.HQ_SCOPE);

    if (isHQ) {
      // HQ: return all roles (both scopes)
      const [hqRoles, customerRoles] = await Promise.all([
        this.roleService.getRolesByScope(AccessScope.HQ_SCOPE),
        this.roleService.getRolesByScope(AccessScope.CUSTOMER_SCOPE),
      ]);
      return [...hqRoles, ...customerRoles];
    }

    // Non-HQ: get CUSTOMER_SCOPE roles
    const customerRoles = await this.roleService.getRolesByScope(
      AccessScope.CUSTOMER_SCOPE,
    );

    // Check if caller is OWNER
    const isOwner = context.userId
      ? await this.permissionService.hasRole(
          context.userId,
          AccessScope.CUSTOMER_SCOPE,
          'OWNER',
        )
      : false;

    if (isOwner) {
      // OWNER: return all CUSTOMER_SCOPE roles
      return customerRoles;
    }

    // MANAGER: return CUSTOMER_SCOPE roles excluding OWNER and MANAGER
    return customerRoles.filter(
      (role) => role.name !== 'OWNER' && role.name !== 'MANAGER',
    );
  }

  /**
   * 取得目標用戶的角色列表（用於管理界面）
   * - HQ: 所有角色
   * - Non-HQ: 僅 CUSTOMER_SCOPE 角色
   */
  async getUserRolesForManagement(
    targetUserId: string,
    context: UserQueryContext & { permissions?: string[] },
  ) {
    const isHQ = context.accessScopes?.includes(AccessScope.HQ_SCOPE);

    if (isHQ) {
      // HQ: return all roles for the user
      return this.prisma.userRole.findMany({
        where: { userId: targetUserId },
        include: { role: true },
      });
    }

    // Non-HQ: return only CUSTOMER_SCOPE roles
    return this.prisma.userRole.findMany({
      where: {
        userId: targetUserId,
        role: { scope: AccessScope.CUSTOMER_SCOPE },
      },
      include: { role: true },
    });
  }

  /**
   * 驗證角色分配/撤銷的權限
   */
  private async validateRoleAssignmentPermission(
    roleId: string,
    targetUserId: string,
    context: UserQueryContext & { permissions?: string[] },
    lang?: string,
  ) {
    const isHQ = context.accessScopes?.includes(AccessScope.HQ_SCOPE);

    // HQ: no restrictions
    if (isHQ) {
      return;
    }

    // Get the target role
    const targetRole = await this.roleService.getRole(roleId);
    if (!targetRole) {
      throw new BadRequestException(
        this.i18n.translate('errors.role.not_found', { lang }) || '角色不存在',
      );
    }

    // Non-HQ: verify target role is CUSTOMER_SCOPE
    if (targetRole.scope !== AccessScope.CUSTOMER_SCOPE) {
      throw new BadRequestException('只能分配 CUSTOMER_SCOPE 角色');
    }

    // Non-HQ: verify target user is CUSTOMER_SCOPE
    const targetUser = await this.prisma.user.findUnique({
      where: { id: targetUserId },
      select: { accessScopes: true },
    });

    if (!targetUser) {
      throw new BadRequestException(
        this.i18n.translate('errors.user.not_found', { lang }) ||
          '目標用戶不存在',
      );
    }

    if (!targetUser.accessScopes.includes(AccessScope.CUSTOMER_SCOPE)) {
      throw new BadRequestException('只能管理 CUSTOMER_SCOPE 用戶的角色');
    }

    // Check if caller is OWNER
    const isOwner = context.userId
      ? await this.permissionService.hasRole(
          context.userId,
          AccessScope.CUSTOMER_SCOPE,
          'OWNER',
        )
      : false;

    // If not OWNER (i.e. MANAGER), additionally verify role is not OWNER or MANAGER
    if (!isOwner) {
      if (targetRole.name === 'OWNER' || targetRole.name === 'MANAGER') {
        throw new BadRequestException('無法分配或撤銷 OWNER 或 MANAGER 角色');
      }
    }
  }

  /**
   * 分配角色給用戶
   */
  async assignRole(
    input: AssignRoleInput,
    context: UserQueryContext & { permissions?: string[] },
    lang?: string,
  ) {
    // Validate permissions
    await this.validateRoleAssignmentPermission(
      input.roleId,
      input.targetUserId,
      context,
      lang,
    );

    try {
      await this.permissionService.grantRole(
        input.targetUserId,
        input.roleId,
        context.userId,
      );
    } catch (error: any) {
      // Handle P2002 (unique constraint) error
      if (error?.code === 'P2002') {
        throw new BadRequestException('該用戶已擁有此角色');
      }
      throw error;
    }

    return true;
  }

  /**
   * 撤銷用戶的角色
   */
  async revokeRole(
    input: RevokeRoleInput,
    context: UserQueryContext & { permissions?: string[] },
    lang?: string,
  ) {
    // Same permission checks as assignRole
    await this.validateRoleAssignmentPermission(
      input.roleId,
      input.targetUserId,
      context,
      lang,
    );

    await this.permissionService.revokeRole(input.targetUserId, input.roleId);

    return true;
  }
}
