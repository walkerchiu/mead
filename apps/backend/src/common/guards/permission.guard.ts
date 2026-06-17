import {
  Injectable,
  CanActivate,
  ExecutionContext,
  ForbiddenException,
} from '@nestjs/common';
import { Reflector, ModuleRef } from '@nestjs/core';
import { GqlExecutionContext } from '@nestjs/graphql';
import { I18nService } from 'nestjs-i18n';
import { JwtAuthGuard } from '../../auth/jwt-auth.guard';
import { AccessScope } from '../enums/access-scope.enum';
import {
  REQUIRES_SCOPE_KEY,
  REQUIRES_ANY_SCOPE_KEY,
} from '../decorators/requires-scope.decorator';
import {
  REQUIRES_PERMISSION_KEY,
  REQUIRES_ANY_PERMISSION_KEY,
  REQUIRES_ALL_PERMISSIONS_KEY,
} from '../decorators/requires-permission.decorator';

/**
 * Permission Guard
 * 1. 先驗證 JWT Token 或 PAT Token
 * 2. 檢查 AccessScope（如果有設定）
 * 3. 檢查 Permission（如果有設定）
 */
@Injectable()
export class PermissionGuard extends JwtAuthGuard implements CanActivate {
  private patAuthGuard: any; // 延遲載入，避免跨模組依賴問題

  constructor(
    private reflector: Reflector,
    private i18n: I18nService,
    private moduleRef: ModuleRef,
  ) {
    super();
  }

  /**
   * 延遲取得 PatAuthGuard 實例
   */
  private async getPatAuthGuard() {
    if (!this.patAuthGuard) {
      try {
        const { PatAuthGuard } = await import('../../auth/pat-auth.guard');
        this.patAuthGuard = this.moduleRef.get(PatAuthGuard, { strict: false });
      } catch {
        return null;
      }
    }
    return this.patAuthGuard;
  }

  /**
   * 檢查 Authorization header 是否為 PAT Token（mead_ 前綴）
   */
  private isPatRequest(context: ExecutionContext): boolean {
    try {
      // 嘗試 HTTP REST 請求
      const httpRequest = context.switchToHttp().getRequest();
      if (
        httpRequest &&
        httpRequest.url &&
        !httpRequest.url.includes('/graphql')
      ) {
        const authHeader = httpRequest.headers?.authorization;
        return !!authHeader && authHeader.includes('mead_');
      }

      // GraphQL 請求
      const ctx = GqlExecutionContext.create(context);
      const req = ctx.getContext().req;
      const authHeader = req?.headers?.authorization;
      return !!authHeader && authHeader.includes('mead_');
    } catch {
      return false;
    }
  }

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const ctx = GqlExecutionContext.create(context);
    const operationName = ctx.getInfo()?.fieldName;

    // Subscriptions（WebSocket）的認證在各自的 @Subscription filter 中處理
    //（解析 connectionParams 的 JWT 後檢查 scope/permission），與 JwtAuthGuard 一致。
    // 此處直接放行——否則對沒有 req 的 WS context 取 req.user 會誤拋 noUserInfo，
    // 導致掛在「有 class-level guard 的 resolver」上的訂閱（如 cron 監控）整個失效。
    const gqlContext = ctx.getContext();
    if (gqlContext?.connectionParams) {
      return true;
    }

    console.log(
      `🔒 [PermissionGuard] canActivate called for operation: ${operationName}`,
    );

    // Step 1: 驗證認證（JWT 或 PAT）
    let authenticated: boolean;

    if (this.isPatRequest(context)) {
      // PAT Token 路徑
      console.log(
        `🔒 [PermissionGuard] PAT token detected, using PAT auth guard`,
      );
      try {
        const guard = await this.getPatAuthGuard();
        authenticated = guard ? await guard.canActivate(context) : false;
      } catch {
        authenticated = false;
      }
    } else {
      // JWT Token 路徑（原有邏輯）
      authenticated = await super.canActivate(context);
    }

    console.log(`🔒 [PermissionGuard] Authentication result: ${authenticated}`);
    if (!authenticated) {
      console.log(
        `🔒 [PermissionGuard] Authentication failed, rejecting request`,
      );
      return false;
    }

    // Step 2: 取得用戶資訊
    const { req } = ctx.getContext();
    const user = req.user;

    console.log(`🔒 [PermissionGuard] req.user:`, JSON.stringify(user));

    if (!user || !user.userId) {
      console.log(
        `🔒 [PermissionGuard] User validation failed - user: ${user}, userId: ${user?.userId}`,
      );
      throw new ForbiddenException(
        this.i18n.translate('common.forbidden.noUserInfo', {
          lang: this.getLang(context),
        }),
      );
    }

    const lang = this.getLang(context);

    // Step 3: 檢查 AccessScope
    console.log(
      `🔒 [PermissionGuard] Checking AccessScope for user: ${user.userId}`,
    );
    const scopeCheckPassed = await this.checkAccessScope(context, user, lang);
    console.log(
      `🔒 [PermissionGuard] AccessScope check result: ${scopeCheckPassed}`,
    );
    if (!scopeCheckPassed) {
      console.log(
        `🔒 [PermissionGuard] AccessScope check failed, rejecting request`,
      );
      return false;
    }

    // Step 4: 檢查 Permission
    console.log(
      `🔒 [PermissionGuard] Checking Permission for user: ${user.userId}`,
    );
    const permissionCheckPassed = await this.checkPermission(
      context,
      user,
      lang,
    );
    console.log(
      `🔒 [PermissionGuard] Permission check result: ${permissionCheckPassed}`,
    );
    if (!permissionCheckPassed) {
      console.log(
        `🔒 [PermissionGuard] Permission check failed, rejecting request`,
      );
      return false;
    }

    console.log(
      `🔒 [PermissionGuard] All checks passed, allowing request for operation: ${operationName}`,
    );
    console.log(`🔒 [PermissionGuard] About to return true`);
    const result = true;
    console.log(`🔒 [PermissionGuard] Returning:`, result);
    return result;
  }

  private getLang(context: ExecutionContext): string {
    const ctx = GqlExecutionContext.create(context);
    const req = ctx.getContext().req;
    return (
      req?.headers?.['x-lang'] ||
      req?.headers?.['accept-language']?.split(',')[0]?.split('-')[0] ||
      'en'
    );
  }

  /**
   * 檢查 AccessScope
   */
  private async checkAccessScope(
    context: ExecutionContext,
    user: any,
    lang?: string,
  ): Promise<boolean> {
    // 檢查單一 scope
    const requiredScope = this.reflector.getAllAndOverride<AccessScope>(
      REQUIRES_SCOPE_KEY,
      [context.getHandler(), context.getClass()],
    );

    if (requiredScope) {
      if (!user.accessScopes || !user.accessScopes.includes(requiredScope)) {
        throw new ForbiddenException(
          this.i18n.translate('common.forbidden.requireScope', {
            lang,
            args: { scope: requiredScope },
          }),
        );
      }
    }

    // 檢查任一 scope（OR 邏輯）
    const requiredAnyScopes = this.reflector.getAllAndOverride<AccessScope[]>(
      REQUIRES_ANY_SCOPE_KEY,
      [context.getHandler(), context.getClass()],
    );

    if (requiredAnyScopes && requiredAnyScopes.length > 0) {
      const hasAnyScope = requiredAnyScopes.some((scope) =>
        user.accessScopes?.includes(scope),
      );

      if (!hasAnyScope) {
        throw new ForbiddenException(
          this.i18n.translate('common.forbidden.requireAnyScope', {
            lang,
            args: { scopes: requiredAnyScopes.join(', ') },
          }),
        );
      }
    }

    return true;
  }

  /**
   * 檢查 Permission
   */
  private async checkPermission(
    context: ExecutionContext,
    user: any,
    lang?: string,
  ): Promise<boolean> {
    // 取得當前操作的 scope（從 user 的 accessScopes 或 decorator 推斷）
    const scope = this.inferScope(context, user);

    if (!scope) {
      // 沒有 scope 要求，跳過權限檢查
      return true;
    }

    // 檢查單一權限
    const requiredPermission = this.reflector.getAllAndOverride<string>(
      REQUIRES_PERMISSION_KEY,
      [context.getHandler(), context.getClass()],
    );

    if (requiredPermission) {
      // 無狀態：讀 JWT permissions claim（發 token 時由啟用角色衍生），不每請求查 DB。
      const hasPermission = this.permissionSatisfied(
        user.permissions || [],
        requiredPermission,
      );

      if (!hasPermission) {
        throw new ForbiddenException(
          this.i18n.translate('common.forbidden.requirePermission', {
            lang,
            args: { permission: requiredPermission },
          }),
        );
      }
    }

    // 檢查任一權限（OR 邏輯）
    const requiredAnyPermissions = this.reflector.getAllAndOverride<string[]>(
      REQUIRES_ANY_PERMISSION_KEY,
      [context.getHandler(), context.getClass()],
    );

    if (requiredAnyPermissions && requiredAnyPermissions.length > 0) {
      // 統一模型無角色繞過，一律以 JWT permissions 判斷（OWNER/ADMIN 已含全部權限）。
      const userPermissions: string[] = user.permissions || [];
      const hasAnyPermission = requiredAnyPermissions.some((permission) =>
        this.permissionSatisfied(userPermissions, permission),
      );

      if (!hasAnyPermission) {
        throw new ForbiddenException(
          this.i18n.translate('common.forbidden.requireAnyPermission', {
            lang,
            args: { permissions: requiredAnyPermissions.join(', ') },
          }),
        );
      }
    }

    // 檢查所有權限（AND 邏輯）
    const requiredAllPermissions = this.reflector.getAllAndOverride<string[]>(
      REQUIRES_ALL_PERMISSIONS_KEY,
      [context.getHandler(), context.getClass()],
    );

    if (requiredAllPermissions && requiredAllPermissions.length > 0) {
      const userPermissions: string[] = user.permissions || [];
      const hasAllPermissions = requiredAllPermissions.every((permission) =>
        this.permissionSatisfied(userPermissions, permission),
      );

      if (!hasAllPermissions) {
        throw new ForbiddenException(
          this.i18n.translate('common.forbidden.requireAllPermissions', {
            lang,
            args: { permissions: requiredAllPermissions.join(', ') },
          }),
        );
      }
    }

    return true;
  }

  /**
   * 純記憶體權限判定（不查 DB）：直接命中，或持有 `resource:manage` 隱含同 resource 的子動作。
   * 對齊 DB checkPermission 的「direct + manage 隱含」；claim 為跨「啟用角色」的 flat 權限集，
   * 等同其跨 scope fallback 行為（操作的 scope 另由 checkAccessScope 守門）。
   */
  private permissionSatisfied(
    userPermissions: string[],
    required: string,
  ): boolean {
    if (userPermissions.includes(required)) {
      return true;
    }
    const parts = required.split(':');
    if (parts.length === 2) {
      return userPermissions.includes(`${parts[0]}:manage`);
    }
    return false;
  }

  /**
   * 推斷當前操作的 scope
   */
  private inferScope(context: ExecutionContext, user: any): AccessScope | null {
    // 優先使用 decorator 指定的 scope
    const explicitScope = this.reflector.getAllAndOverride<AccessScope>(
      REQUIRES_SCOPE_KEY,
      [context.getHandler(), context.getClass()],
    );

    if (explicitScope) {
      return explicitScope;
    }

    // 檢查是否使用 RequiresAnyScope
    const requiredAnyScopes = this.reflector.getAllAndOverride<AccessScope[]>(
      REQUIRES_ANY_SCOPE_KEY,
      [context.getHandler(), context.getClass()],
    );

    if (requiredAnyScopes && requiredAnyScopes.length > 0) {
      // 找出用戶擁有的 scope 中，符合要求的那些
      const matchingScopes =
        user.accessScopes?.filter((scope: AccessScope) =>
          requiredAnyScopes.includes(scope),
        ) || [];

      // 如果只有一個匹配的 scope，使用該 scope
      if (matchingScopes.length === 1) {
        return matchingScopes[0];
      }

      // 如果有多個匹配的 scope，無法推斷
      // 在這種情況下，應該使用 RequiresScope 明確指定
      return null;
    }

    // 如果用戶只有一個 scope，使用該 scope
    if (user.accessScopes?.length === 1) {
      return user.accessScopes[0];
    }

    // 無法推斷，返回 null（不檢查權限）
    return null;
  }
}
