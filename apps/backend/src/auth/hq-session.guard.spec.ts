import { Test, TestingModule } from '@nestjs/testing';
import { ExecutionContext, ForbiddenException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { GqlExecutionContext } from '@nestjs/graphql';
import { HQSessionGuard } from './hq-session.guard';
import { PrismaService } from '../prisma/prisma.service';

describe('HQSessionGuard', () => {
  let guard: HQSessionGuard;

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
        HQSessionGuard,
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

    guard = module.get<HQSessionGuard>(HQSessionGuard);
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
    it('should allow SUPER_HQ to access any session', async () => {
      const user = {
        id: 'hq-1',
        accessScopes: ['HQ_SCOPE'],
        roles: [{ name: 'SUPER_HQ', scope: 'HQ_SCOPE' }],
      };

      const context = createMockExecutionContext(user, { userId: 'any-user' });

      const result = await guard.canActivate(context);

      expect(result).toBe(true);
    });

    it('should allow HQ to access Customer sessions', async () => {
      const user = {
        id: 'hq-1',
        accessScopes: ['HQ_SCOPE'],
        roles: [{ name: 'HQ', scope: 'HQ_SCOPE' }],
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

    it('should block HQ from accessing other HQ sessions', async () => {
      const user = {
        id: 'hq-1',
        accessScopes: ['HQ_SCOPE'],
        roles: [{ name: 'HQ', scope: 'HQ_SCOPE' }],
      };

      const targetUser = {
        id: 'hq-2',
        accessScopes: ['HQ_SCOPE'],
      };

      mockPrismaService.user.findUnique.mockResolvedValue(targetUser);

      const context = createMockExecutionContext(user, { userId: 'hq-2' });

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
        id: 'hq-1',
        accessScopes: ['HQ_SCOPE'],
        roles: [{ name: 'HQ', scope: 'HQ_SCOPE' }],
      };

      const context = createMockExecutionContext(user, {});

      const result = await guard.canActivate(context);

      expect(result).toBe(true);
      expect(mockPrismaService.user.findUnique).not.toHaveBeenCalled();
    });

    it('should throw error if target user not found', async () => {
      const user = {
        id: 'hq-1',
        accessScopes: ['HQ_SCOPE'],
        roles: [{ name: 'HQ', scope: 'HQ_SCOPE' }],
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
        accessScopes: ['HQ_SCOPE', 'CUSTOMER_SCOPE'],
        roles: [
          { name: 'HQ', scope: 'HQ_SCOPE' },
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
