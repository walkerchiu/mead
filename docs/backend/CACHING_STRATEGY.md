# 快取策略指南 (Caching Strategy)

使用 Dragonfly 提供高效能的快取解決方案，大幅提升 API 回應速度。

---

## 📋 目錄

- [快取策略指南 (Caching Strategy)](#快取策略指南-caching-strategy)
  - [📋 目錄](#-目錄)
  - [📖 概述](#-概述)
    - [技術棧](#技術棧)
    - [為什麼需要快取？](#為什麼需要快取)
  - [✨ 為什麼使用 Dragonfly](#-為什麼使用-dragonfly)
    - [Dragonfly vs Redis](#dragonfly-vs-redis)
    - [關鍵優勢](#關鍵優勢)
  - [🔧 配置設定](#-配置設定)
    - [1. Docker Compose 配置](#1-docker-compose-配置)
    - [2. 環境變數](#2-環境變數)
    - [3. NestJS CacheModule 配置](#3-nestjs-cachemodule-配置)
  - [🎯 快取策略](#-快取策略)
    - [1. Cache-Aside（旁路快取）](#1-cache-aside旁路快取)
    - [2. Write-Through（寫穿快取）](#2-write-through寫穿快取)
    - [3. Cache Invalidation（快取失效）](#3-cache-invalidation快取失效)
  - [📝 實際應用](#-實際應用)
    - [1. 審計日誌快取](#1-審計日誌快取)
      - [查詢快取](#查詢快取)
      - [Request ID 快取](#request-id-快取)
      - [統計資料快取（短 TTL）](#統計資料快取短-ttl)
    - [2. Session 儲存](#2-session-儲存)
    - [3. Rate Limiting](#3-rate-limiting)
  - [⚡ 效能優化](#-效能優化)
    - [1. 快取鍵命名規則](#1-快取鍵命名規則)
    - [2. 選擇性快取](#2-選擇性快取)
    - [3. 快取預熱](#3-快取預熱)
    - [4. 批次刪除快取](#4-批次刪除快取)
  - [🎯 最佳實踐](#-最佳實踐)
    - [✅ DO - 應該這樣做](#-do---應該這樣做)
      - [1. 設定適當的 TTL](#1-設定適當的-ttl)
      - [2. 處理快取穿透](#2-處理快取穿透)
      - [3. 監控快取命中率](#3-監控快取命中率)
      - [4. 使用快取鎖防止雪崩](#4-使用快取鎖防止雪崩)
    - [❌ DON'T - 不要這樣做](#-dont---不要這樣做)
      - [1. 不要快取敏感資料](#1-不要快取敏感資料)
      - [2. 不要設定過長的 TTL](#2-不要設定過長的-ttl)
      - [3. 不要忘記處理快取失敗](#3-不要忘記處理快取失敗)
  - [📚 相關文檔](#-相關文檔)

---

## 📖 概述

Starter 專案使用 **Dragonfly** 作為快取系統，它是 Redis 的現代化替代品，提供更高的效能和更低的記憶體使用。

### 技術棧

- **快取系統**: Dragonfly 1.14.5
- **NestJS 整合**: @nestjs/cache-manager 3.1.0
- **驅動程式**: cache-manager-ioredis-yet 2.1.2
- **協議**: 完全兼容 Redis 協議

### 為什麼需要快取？

| 場景               | 無快取     | 有快取  | 改善    |
| ------------------ | ---------- | ------- | ------- |
| 審計日誌查詢       | 100-500ms  | 5-10ms  | 10-50x  |
| 統計資料查詢       | 500-2000ms | 10-20ms | 25-100x |
| Session 讀取       | 50-100ms   | <5ms    | 10-20x  |
| Rate Limiting 檢查 | 10-30ms    | <2ms    | 5-15x   |

---

## ✨ 為什麼使用 Dragonfly

### Dragonfly vs Redis

| 特性           | Redis    | Dragonfly      | 優勢          |
| -------------- | -------- | -------------- | ------------- |
| **吞吐量**     | 基準     | **25x**        | 🚀 極高效能   |
| **記憶體使用** | 基準     | **30% 更少**   | 💾 節省資源   |
| **延遲**       | ~1ms     | **<1ms**       | ⚡ 更快回應   |
| **架構**       | 單執行緒 | **多執行緒**   | 🔧 現代化設計 |
| **協議兼容**   | Redis    | **100% Redis** | ✅ 無縫遷移   |
| **快照速度**   | 慢       | **10x 更快**   | 📸 快速備份   |

### 關鍵優勢

1. **多執行緒架構** - 充分利用多核 CPU
2. **共享記憶體** - 減少記憶體碎片
3. **垂直擴展** - 單節點即可處理大量請求
4. **開發友善** - 完全兼容 Redis 指令和客戶端

---

## 🔧 配置設定

### 1. Docker Compose 配置

`docker-compose.yml`

```yaml
services:
  dragonfly:
    image: docker.dragonflydb.io/dragonflydb/dragonfly:v1.14.5
    container_name: starter-dragonfly
    ports:
      - '6379:6379'
    volumes:
      - dragonfly-data:/data
    command: >
      --logtostderr
      --requirepass=${REDIS_PASSWORD:-}
    healthcheck:
      test: ['CMD', 'redis-cli', 'ping']
      interval: 10s
      timeout: 5s
      retries: 5
    networks:
      - starter-network

volumes:
  dragonfly-data:
    driver: local

networks:
  starter-network:
    driver: bridge
```

### 2. 環境變數

`.env`

```env
# Dragonfly (Redis-compatible) Configuration
REDIS_HOST=localhost
REDIS_PORT=6379
REDIS_PASSWORD=                # 可選：生產環境建議設定
REDIS_DB=0                     # 預設資料庫
CACHE_TTL=300                  # 預設 TTL（秒）
```

### 3. NestJS CacheModule 配置

`/src/cache/cache.module.ts`

```typescript
import { Global, Module } from '@nestjs/common';
import { CacheModule as NestCacheModule } from '@nestjs/cache-manager';
import { redisStore } from 'cache-manager-ioredis-yet';

@Global()
@Module({
  imports: [
    NestCacheModule.registerAsync({
      useFactory: async () => ({
        store: await redisStore({
          host: process.env.REDIS_HOST || 'localhost',
          port: parseInt(process.env.REDIS_PORT || '6379'),
          password: process.env.REDIS_PASSWORD || undefined,
          db: parseInt(process.env.REDIS_DB || '0'),
          ttl: parseInt(process.env.CACHE_TTL || '300') * 1000, // 毫秒
        }),
      }),
    }),
  ],
  exports: [NestCacheModule],
})
export class CacheModule {}
```

**特性**:

- ✅ 全局模組（`@Global()`）- 所有模組都可使用
- ✅ 非同步配置 - 支援從環境變數讀取
- ✅ 預設 TTL 5 分鐘
- ✅ 完全兼容 Redis 協議

---

## 🎯 快取策略

### 1. Cache-Aside（旁路快取）

**最常用的策略**，應用程式負責管理快取：

```typescript
async findById(id: string) {
  // 1. 嘗試從快取讀取
  const cacheKey = `user:${id}`;
  const cached = await this.cacheManager.get(cacheKey);

  if (cached) {
    return cached; // 快取命中
  }

  // 2. 快取未命中，從資料庫查詢
  const user = await this.prisma.user.findUnique({ where: { id } });

  // 3. 寫入快取
  if (user) {
    await this.cacheManager.set(cacheKey, user, 300000); // 5 分鐘
  }

  return user;
}
```

**優點**: 簡單、可靠  
**缺點**: 快取未命中時延遲較高

### 2. Write-Through（寫穿快取）

**寫入時同時更新快取**：

```typescript
async updateUser(id: string, data: UpdateUserDto) {
  // 1. 更新資料庫
  const user = await this.prisma.user.update({
    where: { id },
    data,
  });

  // 2. 同時更新快取
  const cacheKey = `user:${id}`;
  await this.cacheManager.set(cacheKey, user, 300000);

  return user;
}
```

**優點**: 快取始終保持最新  
**缺點**: 寫入延遲稍高

### 3. Cache Invalidation（快取失效）

**刪除過時的快取**：

```typescript
async deleteUser(id: string) {
  // 1. 刪除資料庫記錄
  await this.prisma.user.delete({ where: { id } });

  // 2. 刪除相關快取
  await this.cacheManager.del(`user:${id}`);
  await this.cacheManager.del(`user:list:*`); // 刪除列表快取
}
```

---

## 📝 實際應用

### 1. 審計日誌快取

**位置**: `/src/modules/audit-log/audit-log.service.ts`

#### 查詢快取

```typescript
async findAll(filters: AuditLogFilters) {
  const cacheKey = `audit_logs:${JSON.stringify(filters)}`;

  // 檢查快取
  const cached = await this.cacheManager.get(cacheKey);
  if (cached) {
    this.logger.debug(`Cache hit: ${cacheKey}`);
    return cached;
  }

  // 查詢資料庫
  const logs = await this.prisma.auditLog.findMany({
    where: this.buildWhereClause(filters),
    orderBy: { createdAt: 'desc' },
  });

  // 寫入快取（5 分鐘）
  await this.cacheManager.set(cacheKey, logs, 300000);

  return logs;
}
```

#### Request ID 快取

```typescript
async findByRequestId(requestId: string) {
  const cacheKey = `audit_logs:request:${requestId}`;

  const cached = await this.cacheManager.get(cacheKey);
  if (cached) return cached;

  const logs = await this.prisma.auditLog.findMany({
    where: { requestId },
  });

  await this.cacheManager.set(cacheKey, logs, 300000);
  return logs;
}
```

#### 統計資料快取（短 TTL）

```typescript
async getStatistics(startDate: Date, endDate: Date) {
  const cacheKey = `audit_logs:stats:${startDate.toISOString()}_${endDate.toISOString()}`;

  const cached = await this.cacheManager.get(cacheKey);
  if (cached) return cached;

  const stats = await this.prisma.auditLog.aggregate({
    where: {
      createdAt: { gte: startDate, lte: endDate },
    },
    _count: true,
  });

  // 統計資料快取 1 分鐘（更頻繁更新）
  await this.cacheManager.set(cacheKey, stats, 60000);
  return stats;
}
```

### 2. Session 儲存

```typescript
async createSession(userId: string, token: string) {
  const cacheKey = `session:${token}`;
  const sessionData = {
    userId,
    createdAt: new Date(),
  };

  // Session 快取 1 小時
  await this.cacheManager.set(cacheKey, sessionData, 3600000);
}

async getSession(token: string) {
  const cacheKey = `session:${token}`;
  return await this.cacheManager.get(cacheKey);
}
```

### 3. Rate Limiting

```typescript
async checkRateLimit(userId: string): Promise<boolean> {
  const cacheKey = `rate_limit:${userId}`;
  const current = await this.cacheManager.get<number>(cacheKey) || 0;

  if (current >= 100) {
    return false; // 超過限制
  }

  // 增加計數器（1 分鐘 TTL）
  await this.cacheManager.set(cacheKey, current + 1, 60000);
  return true;
}
```

---

## ⚡ 效能優化

### 1. 快取鍵命名規則

**統一格式**，便於管理和清理：

```typescript
// 模式：module:context:identifier:params
const cacheKey = `${module}:${context}:${id}:${params}`;

// 範例
('user:profile:123');
('audit_logs:request:req-123456');
('audit_logs:user:user-789:limit-10');
('stats:daily:2026-01-30');
```

### 2. 選擇性快取

**不是所有資料都需要快取**：

| 資料類型       | 是否快取 | TTL     | 原因         |
| -------------- | -------- | ------- | ------------ |
| 使用者資訊     | ✅       | 5 分鐘  | 讀取頻繁     |
| 審計日誌       | ✅       | 5 分鐘  | 查詢密集     |
| 統計資料       | ✅       | 1 分鐘  | 即時性要求   |
| 交易記錄       | ❌       | -       | 強一致性需求 |
| Session        | ✅       | 1 小時  | 高頻讀取     |
| 密碼重設 Token | ✅       | 30 分鐘 | 有效期限制   |

### 3. 快取預熱

**應用啟動時預先載入常用資料**：

```typescript
@Injectable()
export class CacheWarmupService implements OnModuleInit {
  async onModuleInit() {
    // 預載入熱門資料
    await this.warmupUserCache();
    await this.warmupConfigCache();
  }

  private async warmupUserCache() {
    const activeUsers = await this.prisma.user.findMany({
      where: { lastLoginAt: { gte: new Date(Date.now() - 86400000) } },
      take: 100,
    });

    for (const user of activeUsers) {
      await this.cacheManager.set(`user:${user.id}`, user, 300000);
    }
  }
}
```

### 4. 批次刪除快取

```typescript
async clearUserCache(userId: string) {
  const pattern = `user:${userId}:*`;

  // 注意：Redis SCAN 在 Dragonfly 中效能更好
  const keys = await this.redis.keys(pattern);

  if (keys.length > 0) {
    await this.cacheManager.del(...keys);
  }
}
```

---

## 🎯 最佳實踐

### ✅ DO - 應該這樣做

#### 1. 設定適當的 TTL

```typescript
// ✅ 好：依據資料特性設定
await this.cacheManager.set('user:profile', user, 300000); // 5 分鐘
await this.cacheManager.set('stats:daily', stats, 60000); // 1 分鐘
await this.cacheManager.set('config:app', config, 3600000); // 1 小時
```

#### 2. 處理快取穿透

```typescript
// ✅ 好：快取空結果
const user = await this.prisma.user.findUnique({ where: { id } });

if (!user) {
  // 快取「不存在」，避免重複查詢
  await this.cacheManager.set(cacheKey, null, 60000);
  return null;
}
```

#### 3. 監控快取命中率

```typescript
private cacheHits = 0;
private cacheMisses = 0;

async get(key: string) {
  const value = await this.cacheManager.get(key);

  if (value) {
    this.cacheHits++;
    this.logger.debug(`Cache hit: ${key} (率: ${this.getHitRate()}%)`);
  } else {
    this.cacheMisses++;
  }

  return value;
}

private getHitRate(): number {
  const total = this.cacheHits + this.cacheMisses;
  return total > 0 ? (this.cacheHits / total) * 100 : 0;
}
```

#### 4. 使用快取鎖防止雪崩

```typescript
async getWithLock(key: string, fetchFn: () => Promise<any>) {
  const lockKey = `lock:${key}`;

  // 嘗試獲取鎖
  const locked = await this.redis.set(lockKey, '1', 'EX', 10, 'NX');

  if (!locked) {
    // 等待其他請求完成
    await this.sleep(100);
    return await this.cacheManager.get(key);
  }

  try {
    const data = await fetchFn();
    await this.cacheManager.set(key, data, 300000);
    return data;
  } finally {
    await this.redis.del(lockKey);
  }
}
```

### ❌ DON'T - 不要這樣做

#### 1. 不要快取敏感資料

```typescript
// ❌ 錯誤：快取包含密碼的完整使用者物件
await this.cacheManager.set('user:123', userWithPassword);

// ✅ 正確：只快取安全的欄位
const safeUser = {
  id: user.id,
  email: user.email,
  name: user.name,
};
await this.cacheManager.set('user:123', safeUser);
```

#### 2. 不要設定過長的 TTL

```typescript
// ❌ 錯誤：TTL 太長，資料可能過時
await this.cacheManager.set('user', user, 86400000); // 24 小時

// ✅ 正確：合理的 TTL
await this.cacheManager.set('user', user, 300000); // 5 分鐘
```

#### 3. 不要忘記處理快取失敗

```typescript
// ❌ 錯誤：快取失敗中斷應用
const user = await this.cacheManager.get('user:123');

// ✅ 正確：快取失敗時降級
try {
  const user = await this.cacheManager.get('user:123');
} catch (error) {
  this.logger.warn('Cache read failed, fallback to database');
  return await this.prisma.user.findUnique({ where: { id: '123' } });
}
```

---

## 📚 相關文檔

- [AUDIT_LOG_SYSTEM.md](../infrastructure/AUDIT_LOG_SYSTEM.md) - 審計日誌快取應用
- [RABBITMQ_DRAGONFLY.md](../infrastructure/RABBITMQ_DRAGONFLY.md) - Dragonfly 詳細配置
- [DOCKER_SETUP.md](../getting-started/DOCKER_SETUP.md) - Docker 環境設置
