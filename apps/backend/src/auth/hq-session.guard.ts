import {
  Injectable,
  CanActivate,
  ExecutionContext,
  ForbiddenException,
} from '@nestjs/common';
import { GqlExecutionContext } from '@nestjs/graphql';
import * as crypto from 'crypto';
import { PrismaService } from '../prisma/prisma.service';
import { logger } from '../common/services/logger.service';

@Injectable()
export class HQSessionGuard implements CanActivate {
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

    // HQ OWNER/ADMIN：完全訪問（統一五階頂層，已具 sessions:* 權限）。
    if (this.isHqFullAccess(user)) {
      return true;
    }

    // HQ（其餘）: 有條件訪問
    if (this.isHQ(user)) {
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
              },
            },
          },
        });

        if (!session) {
          throw new ForbiddenException('Session not found');
        }

        // HQ 可以撤銷自己的舊會話
        if (session.userId === user.userId || session.userId === user.sub) {
          // ✅ 檢查是否為當前會話（從 request 中獲取 refresh token）
          const currentRefreshToken = context.switchToHttp().getRequest()
            .cookies?.refresh_token;

          let isCurrentSession = false;
          if (currentRefreshToken) {
            const currentTokenHash = crypto
              .createHash('sha256')
              .update(currentRefreshToken)
              .digest('hex');
            isCurrentSession = currentTokenHash === session.refreshTokenHash;
          }
          if (isCurrentSession) {
            logger.warn(
              '[HQSessionGuard] HQ attempted to revoke current session',
              {
                hqId: user.userId || user.sub,
                sessionId,
              },
            );
            throw new ForbiddenException(
              'Cannot revoke your current session. Please use logout instead.',
            );
          }
          return true;
        }

        // HQ 不能撤銷其他 HQ 的會話
        if (session.user.accessScopes.includes('HQ_SCOPE')) {
          logger.warn(
            '[HQSessionGuard] HQ attempted to revoke another hq session',
            {
              hqId: user.userId || user.sub,
              sessionUserId: session.userId,
              sessionId,
            },
          );
          throw new ForbiddenException('Cannot revoke other hq sessions');
        }

        return true;
      }

      // 如果沒有指定目標用戶，允許查看所有（但在 service 層會過濾）
      if (!targetUserId) {
        return true;
      }

      // 檢查目標用戶是否為 HQ
      const targetUser = await this.prisma.user.findUnique({
        where: { id: targetUserId },
        select: { accessScopes: true },
      });

      if (!targetUser) {
        throw new ForbiddenException('Target user not found');
      }

      // HQ 不能查看其他 HQ 的會話
      if (targetUser.accessScopes.includes('HQ_SCOPE')) {
        logger.warn(
          '[HQSessionGuard] HQ attempted to access another hq sessions',
          {
            hqId: user.id,
            targetUserId,
          },
        );
        throw new ForbiddenException('Cannot access hq user sessions');
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
   * 檢查用戶是否為 HQ 頂層角色（OWNER / ADMIN）——統一五階模型下具完整會話存取。
   * JWT 的 roles 形如 [{ scope, roleNames[] }]。
   */
  private isHqFullAccess(user: any): boolean {
    return (
      user.roles?.some(
        (r: any) =>
          r.scope === 'HQ_SCOPE' &&
          (r.roleNames?.includes('OWNER') || r.roleNames?.includes('ADMIN')),
      ) || false
    );
  }

  /**
   * 檢查用戶是否為 HQ（非頂層 OWNER/ADMIN）
   */
  private isHQ(user: any): boolean {
    return (
      user.accessScopes?.includes('HQ_SCOPE') && !this.isHqFullAccess(user)
    );
  }
}
