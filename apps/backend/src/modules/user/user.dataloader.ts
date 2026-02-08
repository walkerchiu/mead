import { Injectable } from '@nestjs/common';
import DataLoader from 'dataloader';
import { PrismaService } from '../../prisma/prisma.service';
import { User } from '@prisma/client';

/**
 * User DataLoader Service
 *
 * 使用 DataLoader 模式批量載入用戶資料，避免 N+1 查詢問題。
 * DataLoader 會自動：
 * 1. 批量合併相同請求週期內的多個查詢
 * 2. 快取查詢結果（每個請求週期）
 * 3. 確保每個 ID 只查詢一次
 *
 * 效能改善：
 * - 之前：N 個 resolver 調用 = N 次資料庫查詢
 * - 之後：N 個 resolver 調用 = 1 次批量查詢
 */
@Injectable()
export class UserDataLoaderService {
  constructor(private prisma: PrismaService) {}

  /**
   * 建立用戶 DataLoader
   * 每個請求都應該建立新的 DataLoader 實例（在 GraphQL context 中）
   */
  createLoader(): DataLoader<string, User | null> {
    return new DataLoader<string, User | null>(
      async (userIds: readonly string[]) => {
        // 批量查詢所有用戶
        const users = await this.prisma.user.findMany({
          where: {
            id: { in: [...userIds] },
            deletedAt: null,
          },
          include: {
            profile: {
              where: { deletedAt: null },
            },
          },
        });

        // 建立 ID 到 User 的映射
        const userMap = new Map<string, User>();
        users.forEach((user) => {
          userMap.set(user.id, user as User);
        });

        // 按照原始 userIds 的順序返回結果
        // DataLoader 要求返回的順序必須與輸入的 ID 順序一致
        return userIds.map((id) => userMap.get(id) || null);
      },
      {
        // 快取選項（預設啟用，每個請求週期快取）
        cache: true,
        // 最大批量大小（避免單次查詢過大）
        maxBatchSize: 100,
      },
    );
  }

  /**
   * 建立用戶 DataLoader（簡化版，不包含 profile）
   * 用於只需要基本用戶資訊的場景
   */
  createBasicLoader(): DataLoader<string, User | null> {
    return new DataLoader<string, User | null>(
      async (userIds: readonly string[]) => {
        const users = await this.prisma.user.findMany({
          where: {
            id: { in: [...userIds] },
            deletedAt: null,
          },
          // 不包含 profile，減少查詢開銷
        });

        const userMap = new Map<string, User>();
        users.forEach((user) => {
          userMap.set(user.id, user);
        });

        return userIds.map((id) => userMap.get(id) || null);
      },
      {
        cache: true,
        maxBatchSize: 100,
      },
    );
  }

  /**
   * 建立 Email 到用戶的 DataLoader
   * 用於需要通過 email 查詢用戶的場景
   */
  createEmailLoader(): DataLoader<string, User | null> {
    return new DataLoader<string, User | null>(
      async (emails: readonly string[]) => {
        const users = await this.prisma.user.findMany({
          where: {
            email: { in: [...emails] },
            deletedAt: null,
          },
          include: {
            profile: {
              where: { deletedAt: null },
            },
          },
        });

        const userMap = new Map<string, User>();
        users.forEach((user) => {
          userMap.set(user.email, user as User);
        });

        return emails.map((email) => userMap.get(email) || null);
      },
      {
        cache: true,
        maxBatchSize: 100,
      },
    );
  }
}
