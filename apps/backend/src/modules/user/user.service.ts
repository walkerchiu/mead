import { Injectable, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { AccessScope } from '../../common/enums/access-scope.enum';
import {
  createPaginationResult,
  calculateSkip,
  PaginationResult,
} from '../../common/utils/pagination.utils';
import { I18nService } from 'nestjs-i18n';
import { MailService } from '../../mail/mail.service';
import { SessionManagementService } from '../../auth/session-management.service';
import {
  assertValidEmail,
  assertValidName,
} from '../../common/utils/input-validator';
import { assertPasswordStrength } from '../../common/utils/password-validator';
import { UpdateUserInput } from './user.input';
import { UpdateProfileInput } from './user.input';
import { ChangePasswordInput } from './user.input';
import * as bcrypt from 'bcrypt';

/**
 * 使用者查詢上下文（包含當前使用者的權限資訊）
 */
export interface UserQueryContext {
  accessScopes?: AccessScope[];
  userId?: string;
}

@Injectable()
export class UserService {
  private readonly SALT_ROUNDS = 10;

  constructor(
    private prisma: PrismaService,
    private i18n: I18nService,
    private mailService: MailService,
    private sessionManagementService: SessionManagementService,
  ) {}

  /**
   * 根據使用者的 accessScopes 建立資料過濾條件
   *
   * 規則：
   * - ADMIN_SCOPE: 可以查詢所有帳號
   * - CUSTOMER_SCOPE: 只能查詢 CUSTOMER_SCOPE 和 PUBLIC_SCOPE 的帳號
   * - PUBLIC_SCOPE: 只能查詢 PUBLIC_SCOPE 的帳號
   */
  private buildAccessScopeFilter(context?: UserQueryContext) {
    if (
      !context ||
      !context.accessScopes ||
      context.accessScopes.length === 0
    ) {
      // 未認證的使用者，只能查詢 PUBLIC_SCOPE
      return {
        accessScopes: {
          hasSome: [AccessScope.PUBLIC_SCOPE],
        },
      };
    }

    const accessScopes = context.accessScopes;

    // ADMIN 可以查詢所有帳號
    if (accessScopes.includes(AccessScope.ADMIN_SCOPE)) {
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
   * 分頁查詢使用者（支援 Row-Level Security）
   * @param page 頁碼
   * @param limit 每頁筆數
   * @param includeDeleted 是否包含已刪除的資料
   * @param context 查詢上下文（包含使用者權限）
   */
  async findAllUsersPaginated(
    page: number,
    limit: number,
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

    const where = {
      ...baseWhere,
      ...accessScopeFilter,
    };

    const skip = calculateSkip(page, limit);

    // 並行查詢資料和總數
    const [data, totalCount] = await Promise.all([
      this.prisma.user.findMany({
        where,
        include: {
          profile: {
            where: includeDeleted ? {} : { deletedAt: null },
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

    return createPaginationResult(data, totalCount, page, limit);
  }

  /**
   * 查詢所有使用者（預設不包含已刪除，支援 Row-Level Security）
   * @param includeDeleted 是否包含已刪除的資料
   * @param context 查詢上下文（包含使用者權限）
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
   * 依 ID 查詢使用者（支援 Row-Level Security）
   * @param id 使用者 ID
   * @param includeDeleted 是否包含已刪除的資料
   * @param context 查詢上下文（包含使用者權限）
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
   * 依 Email 查詢使用者（支援 Row-Level Security）
   * @param email Email
   * @param includeDeleted 是否包含已刪除的資料
   * @param context 查詢上下文（包含使用者權限）
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
   * 建立使用者（由 Auth Service 呼叫，需要 password）
   * 一般情況應該使用 AuthService.register() 而非直接呼叫此方法
   */
  async createUser(data: {
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
   * 更新使用者
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
   * 軟刪除使用者
   */
  async softDeleteUser(id: string) {
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
   * 恢復已刪除的使用者
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
   * 使用者更新自己的基本資料（email、name）
   */
  async updateUserSelf(
    userId: string,
    data: UpdateUserInput,
    lang?: string,
  ): Promise<any> {
    // 驗證 email 格式
    if (data.email) {
      assertValidEmail(data.email, lang, this.i18n);

      // 檢查 email 是否已被其他使用者使用
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

    // 更新使用者資料
    return this.prisma.user.update({
      where: { id: userId },
      data,
      include: {
        profile: {
          where: { deletedAt: null },
        },
      },
    });
  }

  /**
   * 使用者更新自己的詳細資料（Profile）
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
   * 使用者修改自己的密碼
   */
  async changePasswordSelf(
    userId: string,
    input: ChangePasswordInput,
    ipAddress?: string,
    userAgent?: string,
    lang?: string,
  ): Promise<boolean> {
    const { currentPassword, newPassword, revokeOtherSessions } = input;

    // 獲取使用者資料
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

    // 驗證新密碼強度
    assertPasswordStrength(newPassword, lang, this.i18n, {
      email: user.email,
      name: user.name || undefined,
    });

    // 加密新密碼
    const hashedPassword = await bcrypt.hash(newPassword, this.SALT_ROUNDS);

    // 更新密碼
    await this.prisma.user.update({
      where: { id: userId },
      data: { password: hashedPassword },
    });

    // 撤銷其他設備的 sessions（可選）
    if (revokeOtherSessions) {
      // 撤銷所有 sessions（包含當前 session）
      // 使用者需要重新登入
      await this.sessionManagementService.revokeAllSessions(userId);
    }

    // 發送密碼變更通知
    const userLang = user.profile?.language || lang;
    await this.mailService.sendPasswordChangedEmail(
      user.email,
      user.name,
      ipAddress,
      userLang,
    );

    return true;
  }
}
