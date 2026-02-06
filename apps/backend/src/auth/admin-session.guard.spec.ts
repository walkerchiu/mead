import { Test, TestingModule } from '@nestjs/testing';
import { ExecutionContext, ForbiddenException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { GqlExecutionContext } from '@nestjs/graphql';
import { AdminSessionGuard } from './admin-session.guard';
import { PrismaService } from '../prisma/prisma.service';

describe('AdminSessionGuard', () => {
  let guard: AdminSessionGuard;

  const mockPrismaService = {
    user: {
      findUnique: jest.fn(),
    },
  };

  const mockReflector = {
    get: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AdminSessionGuard,
        {
          provide: PrismaService,
          useValue: mockPrismaService,
        },
        {
          provide: Reflector,
          useValue: mockReflector,
        },
      ],
    }).compile();

    guard = module.get<AdminSessionGuard>(AdminSessionGuard);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  const createMockExecutionContext = (
    user: unknown,
    args: Record<string, unknown> = {},
  ): ExecutionContext => {
    const mockContext = {
      getHandler: jest.fn(),
      getClass: jest.fn(),
      switchToHttp: jest.fn(),
      getType: jest.fn().mockReturnValue('graphql'),
      getArgs: jest.fn(),
      getArgByIndex: jest.fn(),
      switchToRpc: jest.fn(),
      switchToWs: jest.fn(),
    };

    jest.spyOn(GqlExecutionContext, 'create').mockReturnValue({
      getContext: jest.fn().mockReturnValue({
        req: { user },
      }),
      getArgs: jest.fn().mockReturnValue(args), // 直接返回 args 對象
    } as unknown as ReturnType<typeof GqlExecutionContext.create>);

    return mockContext as ExecutionContext;
  };

  describe('canActivate', () => {
    it('should allow SUPER_ADMIN to access any session', async () => {
      const user = {
        id: 'admin-1',
        accessScopes: ['ADMIN_SCOPE'],
        roles: [{ name: 'SUPER_ADMIN', scope: 'ADMIN_SCOPE' }],
      };

      const context = createMockExecutionContext(user, { userId: 'any-user' });

      const result = await guard.canActivate(context);

      expect(result).toBe(true);
    });

    it('should allow Admin to access Customer sessions', async () => {
      const user = {
        id: 'admin-1',
        accessScopes: ['ADMIN_SCOPE'],
        roles: [{ name: 'ADMIN', scope: 'ADMIN_SCOPE' }],
      };

      const targetUser = {
        id: 'customer-1',
        accessScopes: ['CUSTOMER_SCOPE'],
      };

      mockPrismaService.user.findUnique.mockResolvedValue(targetUser);

      const context = createMockExecutionContext(user, {
        userId: 'customer-1',
      });

      const result = await guard.canActivate(context);

      expect(result).toBe(true);
      expect(mockPrismaService.user.findUnique).toHaveBeenCalledWith({
        where: { id: 'customer-1' },
        select: { accessScopes: true },
      });
    });

    it('should block Admin from accessing other Admin sessions', async () => {
      const user = {
        id: 'admin-1',
        accessScopes: ['ADMIN_SCOPE'],
        roles: [{ name: 'ADMIN', scope: 'ADMIN_SCOPE' }],
      };

      const targetUser = {
        id: 'admin-2',
        accessScopes: ['ADMIN_SCOPE'],
      };

      mockPrismaService.user.findUnique.mockResolvedValue(targetUser);

      const context = createMockExecutionContext(user, { userId: 'admin-2' });

      await expect(guard.canActivate(context)).rejects.toThrow(
        ForbiddenException,
      );
    });

    it('should allow Customer to access their own sessions', async () => {
      const user = {
        id: 'customer-1',
        accessScopes: ['CUSTOMER_SCOPE'],
        roles: [{ name: 'CUSTOMER', scope: 'CUSTOMER_SCOPE' }],
      };

      const context = createMockExecutionContext(user, {
        userId: 'customer-1',
      });

      const result = await guard.canActivate(context);

      expect(result).toBe(true);
    });

    it('should block Customer from accessing other user sessions', async () => {
      const user = {
        id: 'customer-1',
        accessScopes: ['CUSTOMER_SCOPE'],
        roles: [{ name: 'CUSTOMER', scope: 'CUSTOMER_SCOPE' }],
      };

      const context = createMockExecutionContext(user, {
        userId: 'customer-2',
      });

      await expect(guard.canActivate(context)).rejects.toThrow(
        ForbiddenException,
      );
    });

    it('should allow access when no userId is provided (queries all sessions)', async () => {
      const user = {
        id: 'admin-1',
        accessScopes: ['ADMIN_SCOPE'],
        roles: [{ name: 'ADMIN', scope: 'ADMIN_SCOPE' }],
      };

      const context = createMockExecutionContext(user, {});

      const result = await guard.canActivate(context);

      expect(result).toBe(true);
      expect(mockPrismaService.user.findUnique).not.toHaveBeenCalled();
    });

    it('should throw error if target user not found', async () => {
      const user = {
        id: 'admin-1',
        accessScopes: ['ADMIN_SCOPE'],
        roles: [{ name: 'ADMIN', scope: 'ADMIN_SCOPE' }],
      };

      mockPrismaService.user.findUnique.mockResolvedValue(null);

      const context = createMockExecutionContext(user, {
        userId: 'non-existent',
      });

      await expect(guard.canActivate(context)).rejects.toThrow(
        ForbiddenException,
      );
    });

    it('should handle users with multiple roles', async () => {
      const user = {
        id: 'hybrid-1',
        accessScopes: ['ADMIN_SCOPE', 'CUSTOMER_SCOPE'],
        roles: [
          { name: 'ADMIN', scope: 'ADMIN_SCOPE' },
          { name: 'CUSTOMER', scope: 'CUSTOMER_SCOPE' },
        ],
      };

      const targetUser = {
        id: 'customer-1',
        accessScopes: ['CUSTOMER_SCOPE'],
      };

      mockPrismaService.user.findUnique.mockResolvedValue(targetUser);

      const context = createMockExecutionContext(user, {
        userId: 'customer-1',
      });

      const result = await guard.canActivate(context);

      expect(result).toBe(true);
    });
  });
});
