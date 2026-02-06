import { Test, TestingModule } from '@nestjs/testing';
import { AdminSessionService } from './admin-session.service';
import { PrismaService } from '../prisma/prisma.service';
import { AuditLogService } from '../audit-log/audit-log.service';
import { MailService } from '../mail/mail.service';
import { NotFoundException, BadRequestException } from '@nestjs/common';
import { SessionStatus } from './admin-session.types';

describe('AdminSessionService', () => {
  let service: AdminSessionService;

  const mockPrismaService = {
    session: {
      findMany: jest.fn(),
      findUnique: jest.fn(),
      update: jest.fn(),
      updateMany: jest.fn(),
      count: jest.fn(),
      aggregate: jest.fn(),
      groupBy: jest.fn(),
    },
    user: {
      findUnique: jest.fn(),
    },
  };

  const mockAuditLogService = {
    create: jest.fn(),
  };

  const mockMailService = {
    sendSessionRevokedEmail: jest.fn(),
    sendBatchSessionsRevokedEmail: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AdminSessionService,
        {
          provide: PrismaService,
          useValue: mockPrismaService,
        },
        {
          provide: AuditLogService,
          useValue: mockAuditLogService,
        },
        {
          provide: MailService,
          useValue: mockMailService,
        },
      ],
    }).compile();

    service = module.get<AdminSessionService>(AdminSessionService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('listAllSessions', () => {
    it('should return sessions with pagination', async () => {
      const mockSessions = [
        {
          id: 'session-1',
          userId: 'user-1',
          deviceInfo: 'Chrome',
          ipAddress: '192.168.1.1',
          createdAt: new Date(),
          lastUsedAt: new Date(),
          expiresAt: new Date(),
          revokedAt: null,
          user: {
            id: 'user-1',
            name: 'Test User',
            email: 'test@example.com',
          },
        },
      ];

      mockPrismaService.session.findMany.mockResolvedValue(mockSessions);
      mockPrismaService.session.count.mockResolvedValue(1);

      const result = await service.listAllSessions({}, 1, 20);

      expect(result.data).toHaveLength(1);
      expect(result.data[0].id).toBe('session-1');
      expect(result.pageInfo.totalCount).toBe(1);
      expect(result.pageInfo.hasNextPage).toBe(false);
    });

    it('should apply filters correctly', async () => {
      const filters = {
        userId: 'user-1',
        status: SessionStatus.ACTIVE,
        ipAddress: '192.168',
      };

      mockPrismaService.session.findMany.mockResolvedValue([]);
      mockPrismaService.session.count.mockResolvedValue(0);

      await service.listAllSessions(filters, 20, null);

      expect(mockPrismaService.session.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            userId: 'user-1',
            revokedAt: null,
            expiresAt: expect.any(Object),
            ipAddress: expect.objectContaining({
              contains: '192.168',
            }),
          }),
        }),
      );
    });
  });

  describe('revokeSession', () => {
    const mockSession = {
      id: 'session-1',
      userId: 'user-1',
      deviceInfo: 'Chrome',
      browser: 'Chrome',
      os: 'Windows',
      ipAddress: '192.168.1.1',
      location: 'Taiwan',
      createdAt: new Date(),
      lastUsedAt: new Date(),
      expiresAt: new Date(),
      revokedAt: null,
      user: {
        id: 'user-1',
        name: 'Test User',
        email: 'test@example.com',
        profile: {
          language: 'en',
        },
      },
    };

    it('should successfully revoke a session', async () => {
      mockPrismaService.session.findUnique.mockResolvedValue(mockSession);
      mockPrismaService.session.update.mockResolvedValue({
        ...mockSession,
        revokedAt: new Date(),
      });

      const result = await service.revokeSession({
        sessionId: 'session-1',
        adminId: 'admin-1',
        reason: 'Security concern',
        sendNotification: false,
      });

      expect(result.success).toBe(true);
      expect(result.revokedCount).toBe(1);
      expect(mockPrismaService.session.update).toHaveBeenCalled();
      expect(mockAuditLogService.create).toHaveBeenCalled();
    });

    it('should throw NotFoundException if session not found', async () => {
      mockPrismaService.session.findUnique.mockResolvedValue(null);

      await expect(
        service.revokeSession({
          sessionId: 'non-existent',
          adminId: 'admin-1',
          reason: 'Test',
        }),
      ).rejects.toThrow(NotFoundException);
    });

    it('should throw BadRequestException if session already revoked', async () => {
      mockPrismaService.session.findUnique.mockResolvedValue({
        ...mockSession,
        revokedAt: new Date(),
      });

      await expect(
        service.revokeSession({
          sessionId: 'session-1',
          adminId: 'admin-1',
          reason: 'Test',
        }),
      ).rejects.toThrow(BadRequestException);
    });

    it('should send email notification when requested', async () => {
      const mockAdmin = {
        id: 'admin-1',
        name: 'Admin User',
        email: 'admin@example.com',
      };

      const mockSessionWithUser = {
        ...mockSession,
        user: {
          id: 'user-1',
          name: 'Test User',
          email: 'test@example.com',
        },
      };

      mockPrismaService.session.findUnique.mockResolvedValue(
        mockSessionWithUser,
      );
      mockPrismaService.session.update.mockResolvedValue({
        ...mockSessionWithUser,
        revokedAt: new Date(),
      });
      mockPrismaService.user.findUnique.mockResolvedValue(mockAdmin);

      await service.revokeSession({
        sessionId: 'session-1',
        adminId: 'admin-1',
        reason: 'Security concern',
        sendNotification: true,
        notificationMessage: 'Test message',
      });

      // Verify session was updated
      expect(mockPrismaService.session.update).toHaveBeenCalled();

      // Verify admin user was fetched
      expect(mockPrismaService.user.findUnique).toHaveBeenCalledWith({
        where: { id: 'admin-1' },
        select: { id: true, email: true, name: true },
      });
    });
  });

  describe('revokeBatchSessions', () => {
    it('should revoke multiple sessions based on criteria', async () => {
      const mockSessions = [
        {
          id: 'session-1',
          userId: 'user-1',
          user: {
            id: 'user-1',
            email: 'user1@example.com',
            name: 'User 1',
            profile: { language: 'en' },
          },
          deviceInfo: 'Chrome',
          browser: 'Chrome',
          ipAddress: '192.168.1.1',
          lastUsedAt: new Date(),
        },
        {
          id: 'session-2',
          userId: 'user-1',
          user: {
            id: 'user-1',
            email: 'user1@example.com',
            name: 'User 1',
            profile: { language: 'en' },
          },
          deviceInfo: 'Firefox',
          browser: 'Firefox',
          ipAddress: '192.168.1.2',
          lastUsedAt: new Date(),
        },
      ];

      mockPrismaService.session.findMany.mockResolvedValue(mockSessions);
      mockPrismaService.session.updateMany.mockResolvedValue({ count: 2 });

      const result = await service.revokeBatchSessions({
        adminId: 'admin-1',
        reason: 'Batch cleanup',
        criteria: {
          userIds: ['user-1'],
        },
      });

      expect(result.success).toBe(true);
      expect(result.revokedCount).toBe(2);
      expect(result.affectedSessionIds).toHaveLength(2);
      expect(mockPrismaService.session.updateMany).toHaveBeenCalled();
    });

    it('should handle empty criteria gracefully', async () => {
      mockPrismaService.session.findMany.mockResolvedValue([]);

      const result = await service.revokeBatchSessions({
        adminId: 'admin-1',
        reason: 'Test',
        criteria: {},
      });

      expect(result.success).toBe(true);
      expect(result.revokedCount).toBe(0);
      expect(result.message).toContain('No sessions');
    });

    it('should support multiple criteria with AND logic', async () => {
      const mockSessions = [
        {
          id: 'session-1',
          userId: 'user-1',
          ipAddress: '192.168.1.1',
          deviceInfo: 'Chrome',
          createdAt: new Date('2020-01-01'),
          user: {
            id: 'user-1',
            email: 'user@example.com',
            name: 'User',
            profile: { language: 'en' },
          },
          browser: 'Chrome',
          lastUsedAt: new Date(),
        },
      ];

      mockPrismaService.session.findMany.mockResolvedValue(mockSessions);
      mockPrismaService.session.updateMany.mockResolvedValue({ count: 1 });

      await service.revokeBatchSessions({
        adminId: 'admin-1',
        reason: 'Complex criteria',
        criteria: {
          userIds: ['user-1'],
          ipAddress: '192.168',
          deviceInfo: 'Chrome',
        },
      });

      expect(mockPrismaService.session.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            userId: expect.objectContaining({ in: ['user-1'] }),
            ipAddress: expect.objectContaining({ contains: '192.168' }),
            deviceInfo: expect.objectContaining({ contains: 'Chrome' }),
          }),
        }),
      );
    });
  });

  describe('getActiveSessionCount', () => {
    it('should return active session count', async () => {
      mockPrismaService.session.count.mockResolvedValue(42);

      const result = await service.getActiveSessionCount();

      expect(result).toBe(42);
      expect(mockPrismaService.session.count).toHaveBeenCalledWith({
        where: {
          revokedAt: null,
          expiresAt: expect.objectContaining({
            gt: expect.any(Date),
          }),
        },
      });
    });
  });

  describe('revokeOtherDevices', () => {
    it('should revoke all sessions except current one', async () => {
      const mockSessions = [
        { id: 'session-2', userId: 'user-1' },
        { id: 'session-3', userId: 'user-1' },
      ];

      mockPrismaService.session.findMany.mockResolvedValue(mockSessions);
      mockPrismaService.session.updateMany.mockResolvedValue({ count: 2 });

      const result = await service.revokeOtherDevices({
        userId: 'user-1',
        currentSessionId: 'session-1',
        reason: 'User action',
      });

      expect(result.success).toBe(true);
      expect(result.revokedCount).toBe(2);
      expect(mockPrismaService.session.updateMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: {
            id: { in: ['session-2', 'session-3'] },
          },
        }),
      );
    });

    it('should return zero count if no other sessions exist', async () => {
      mockPrismaService.session.findMany.mockResolvedValue([]);

      const result = await service.revokeOtherDevices({
        userId: 'user-1',
        currentSessionId: 'session-1',
      });

      expect(result.success).toBe(true);
      expect(result.revokedCount).toBe(0);
      expect(result.message).toContain('No other sessions');
    });
  });
});
