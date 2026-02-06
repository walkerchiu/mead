import { Injectable, Logger } from '@nestjs/common';

/**
 * WebSocket 連接管理服務
 * 追蹤和限制每個用戶的連接數
 */
@Injectable()
export class WebSocketConnectionService {
  private readonly logger = new Logger(WebSocketConnectionService.name);
  private readonly MAX_CONNECTIONS_PER_USER = 10; // ✅ 提高限制到 10（開發環境 HMR 會產生多個連接）

  // 用戶 ID -> 連接數的映射
  private userConnections = new Map<string, number>();

  // 用戶 ID -> Set<連接 ID> 的映射（用於追蹤具體連接）
  private userConnectionIds = new Map<string, Set<string>>();

  // 連接 ID -> 時間戳（用於清理過期連接）
  private connectionTimestamps = new Map<string, number>();

  /**
   * 檢查用戶是否可以創建新連接
   */
  canConnect(userId: string): boolean {
    // ✅ 先清理過期連接（超過 5 分鐘的連接）
    this.cleanupStaleConnections(userId);

    const currentCount = this.userConnections.get(userId) || 0;

    if (currentCount >= this.MAX_CONNECTIONS_PER_USER) {
      this.logger.warn(
        `User ${userId} reached max connections limit (${this.MAX_CONNECTIONS_PER_USER})`,
      );
      return false;
    }

    return true;
  }

  /**
   * 清理過期連接
   */
  private cleanupStaleConnections(userId: string): void {
    const connectionIds = this.userConnectionIds.get(userId);
    if (!connectionIds) return;

    const now = Date.now();
    const STALE_THRESHOLD = 5 * 60 * 1000; // 5 分鐘

    for (const connectionId of connectionIds) {
      const timestamp = this.connectionTimestamps.get(connectionId);
      if (timestamp && now - timestamp > STALE_THRESHOLD) {
        this.logger.warn(
          `Cleaning up stale connection ${connectionId} for user ${userId}`,
        );
        this.unregisterConnection(userId, connectionId);
      }
    }
  }

  /**
   * 註冊新連接
   */
  registerConnection(userId: string, connectionId: string): void {
    // 更新連接計數
    const currentCount = this.userConnections.get(userId) || 0;
    this.userConnections.set(userId, currentCount + 1);

    // 追蹤連接 ID
    if (!this.userConnectionIds.has(userId)) {
      this.userConnectionIds.set(userId, new Set());
    }
    this.userConnectionIds.get(userId).add(connectionId);

    // ✅ 記錄連接時間戳
    this.connectionTimestamps.set(connectionId, Date.now());

    this.logger.log(
      `User ${userId} connected (${currentCount + 1}/${this.MAX_CONNECTIONS_PER_USER})`,
    );
  }

  /**
   * 取消註冊連接
   */
  unregisterConnection(userId: string, connectionId: string): void {
    // 更新連接計數
    const currentCount = this.userConnections.get(userId) || 0;
    if (currentCount > 0) {
      this.userConnections.set(userId, currentCount - 1);

      // 如果連接數降為 0，清理映射
      if (currentCount === 1) {
        this.userConnections.delete(userId);
      }
    }

    // 移除連接 ID
    const connectionIds = this.userConnectionIds.get(userId);
    if (connectionIds) {
      connectionIds.delete(connectionId);

      // 如果沒有連接了，清理映射
      if (connectionIds.size === 0) {
        this.userConnectionIds.delete(userId);
      }
    }

    // ✅ 清理時間戳
    this.connectionTimestamps.delete(connectionId);

    this.logger.log(
      `User ${userId} disconnected (${Math.max(0, currentCount - 1)}/${this.MAX_CONNECTIONS_PER_USER})`,
    );
  }

  /**
   * 獲取用戶當前連接數
   */
  getConnectionCount(userId: string): number {
    return this.userConnections.get(userId) || 0;
  }

  /**
   * 獲取總連接數
   */
  getTotalConnections(): number {
    return Array.from(this.userConnections.values()).reduce(
      (sum, count) => sum + count,
      0,
    );
  }

  /**
   * 獲取統計資訊
   */
  getStats() {
    return {
      totalUsers: this.userConnections.size,
      totalConnections: this.getTotalConnections(),
      maxConnectionsPerUser: this.MAX_CONNECTIONS_PER_USER,
      userConnections: Array.from(this.userConnections.entries()).map(
        ([userId, count]) => ({
          userId,
          connections: count,
        }),
      ),
    };
  }

  /**
   * 強制斷開用戶的所有連接（管理員功能）
   */
  disconnectUser(userId: string): string[] {
    const connectionIds = Array.from(this.userConnectionIds.get(userId) || []);

    // 清理狀態
    this.userConnections.delete(userId);
    this.userConnectionIds.delete(userId);

    this.logger.warn(`Force disconnected all connections for user ${userId}`);

    return connectionIds;
  }
}
