import {
  Injectable,
  CanActivate,
  ExecutionContext,
  ForbiddenException,
} from '@nestjs/common';
import { GqlExecutionContext } from '@nestjs/graphql';
import { PrismaService } from '../prisma/prisma.service';
import { logger } from '../common/services/logger.service';

@Injectable()
export class AdminSessionGuard implements CanActivate {
  constructor(private prisma: PrismaService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const gqlContext = GqlExecutionContext.create(context);
    const { req } = gqlContext.getContext();
    const user = req.user;

    if (!user) {
      throw new ForbiddenException('User not authenticated');
    }

    // 從請求參數中獲取目標用戶 ID 或會話 ID
    const args = gqlContext.getArgs();
    const targetUserId = args.userId || args.input?.userId;
    const sessionId = args.sessionId || args.input?.sessionId;

    // Super Admin: 完全訪問
    if (this.isSuperAdmin(user)) {
      return true;
    }

    // Admin: 有條件訪問
    if (this.isAdmin(user)) {
      // 如果提供了 sessionId 但沒有 userId，需要查詢會話以獲取 userId
      if (sessionId && !targetUserId) {
        const session = await this.prisma.session.findUnique({
          where: { id: sessionId },
          select: {
            userId: true,
            refreshTokenHash: true,
            user: {
              select: {
                id: true,
                accessScopes: true,
                refreshToken: true,
              },
            },
          },
        });

        if (!session) {
          throw new ForbiddenException('Session not found');
        }

        // Admin 可以撤銷自己的舊會話
        if (session.userId === user.userId || session.userId === user.sub) {
          // 檢查是否為當前會話
          const isCurrentSession =
            session.user.refreshToken === session.refreshTokenHash;
          if (isCurrentSession) {
            logger.warn(
              '[AdminSessionGuard] Admin attempted to revoke current session',
              {
                adminId: user.userId || user.sub,
                sessionId,
              },
            );
            throw new ForbiddenException(
              'Cannot revoke your current session. Please use logout instead.',
            );
          }
          return true;
        }

        // Admin 不能撤銷其他 Admin 的會話
        if (session.user.accessScopes.includes('ADMIN_SCOPE')) {
          logger.warn(
            '[AdminSessionGuard] Admin attempted to revoke another admin session',
            {
              adminId: user.userId || user.sub,
              sessionUserId: session.userId,
              sessionId,
            },
          );
          throw new ForbiddenException(
            'Cannot revoke other administrator sessions',
          );
        }

        return true;
      }

      // 如果沒有指定目標用戶，允許查看所有（但在 service 層會過濾）
      if (!targetUserId) {
        return true;
      }

      // 檢查目標用戶是否為 Admin
      const targetUser = await this.prisma.user.findUnique({
        where: { id: targetUserId },
        select: { accessScopes: true },
      });

      if (!targetUser) {
        throw new ForbiddenException('Target user not found');
      }

      // Admin 不能查看其他 Admin 的會話
      if (targetUser.accessScopes.includes('ADMIN_SCOPE')) {
        logger.warn(
          '[AdminSessionGuard] Admin attempted to access another admin sessions',
          {
            adminId: user.id,
            targetUserId,
          },
        );
        throw new ForbiddenException(
          'Cannot access administrator user sessions',
        );
      }

      return true;
    }

    // 一般用戶：僅可訪問自己的會話
    if (targetUserId && targetUserId !== user.id) {
      throw new ForbiddenException('You can only access your own sessions');
    }

    if (sessionId) {
      const session = await this.prisma.session.findUnique({
        where: { id: sessionId },
        select: { userId: true },
      });

      if (!session) {
        throw new ForbiddenException('Session not found');
      }

      if (session.userId !== user.id) {
        throw new ForbiddenException('You can only access your own sessions');
      }
    }

    return true;
  }

  /**
   * 檢查用戶是否為 Super Admin
   */
  private isSuperAdmin(user: any): boolean {
    return (
      user.roles?.some(
        (role: any) =>
          role.name === 'SUPER_ADMIN' && role.scope === 'ADMIN_SCOPE',
      ) || false
    );
  }

  /**
   * 檢查用戶是否為 Admin（非 Super Admin）
   */
  private isAdmin(user: any): boolean {
    return (
      user.accessScopes?.includes('ADMIN_SCOPE') && !this.isSuperAdmin(user)
    );
  }
}
