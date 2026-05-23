import {
  Injectable,
  CanActivate,
  ExecutionContext,
  UnauthorizedException,
} from '@nestjs/common';
import { GqlExecutionContext } from '@nestjs/graphql';
import { ModuleRef } from '@nestjs/core';
import { PrismaService } from '../prisma/prisma.service';
import { AccessScope } from '../common/enums/access-scope.enum';
import { logger } from '../common/services/logger.service';

/**
 * PAT Auth Guard
 * 從 Authorization header 提取 mead_ 前綴的 Token，驗證後注入 req.user
 * 與 JWT Guard 互斥：先由 PermissionGuard 判斷該走哪條路徑
 */
@Injectable()
export class PatAuthGuard implements CanActivate {
  private patService: any; // 延遲載入避免循環依賴

  constructor(
    private readonly moduleRef: ModuleRef,
    private readonly prisma: PrismaService,
  ) {}

  private async getPatService() {
    if (!this.patService) {
      // 延遲載入 PersonalAccessTokenService
      const { PersonalAccessTokenService } =
        await import('../modules/personal-access-token/personal-access-token.service');
      this.patService = this.moduleRef.get(PersonalAccessTokenService, {
        strict: false,
      });
    }
    return this.patService;
  }

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const req = this.getRequest(context);
    if (!req) return false;

    const authHeader = req.headers?.authorization;
    if (!authHeader) {
      throw new UnauthorizedException('Missing authorization header');
    }

    const token = authHeader.replace('Bearer ', '');
    if (!token.startsWith('mead_')) {
      throw new UnauthorizedException('Invalid token format');
    }

    const patService = await this.getPatService();
    const ip =
      req.headers?.['x-forwarded-for']?.toString().split(',')[0]?.trim() ||
      req.ip ||
      req.socket?.remoteAddress;

    const result = await patService.validateToken(token, ip);
    if (!result) {
      throw new UnauthorizedException('Invalid or expired token');
    }

    // 查詢用戶資訊，建構與 JWT 相同格式的 user payload
    const user = await this.prisma.user.findFirst({
      where: { id: result.userId, deletedAt: null },
      include: {
        userRoles: {
          include: {
            role: { select: { name: true, scope: true } },
          },
        },
      },
    });

    if (!user) {
      throw new UnauthorizedException('User not found');
    }

    // PAT scopes 直接作為該請求的有效 permissions
    // PAT 僅允許操作自己的資源（由 service 層的 authorId 檢查保障）
    // 注入 req.user，格式與 JWT payload 一致
    req.user = {
      userId: user.id,
      email: user.email,
      accessScopes: user.accessScopes as AccessScope[],
      permissions: result.scopes,
      isSuperHQ: false, // PAT 不授予 SuperHQ 權限
      isPatAuth: true, // 標記為 PAT 認證
      roles: user.userRoles.map((ur) => ({
        scope: ur.role.scope as AccessScope,
        roleNames: [ur.role.name],
      })),
    };

    logger.debug('[PatAuthGuard] PAT authentication successful', {
      userId: user.id,
      scopes: result.scopes,
    });

    return true;
  }

  private getRequest(context: ExecutionContext) {
    // 嘗試 HTTP REST 請求
    const httpRequest = context.switchToHttp().getRequest();
    if (
      httpRequest &&
      httpRequest.url &&
      !httpRequest.url.includes('/graphql')
    ) {
      return httpRequest;
    }

    // GraphQL 請求
    try {
      const ctx = GqlExecutionContext.create(context);
      return ctx.getContext().req;
    } catch {
      return httpRequest;
    }
  }
}
