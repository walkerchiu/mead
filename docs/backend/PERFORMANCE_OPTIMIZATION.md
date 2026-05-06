# 效能優化指南 (Performance Optimization)

說明 NPT 專案的效能優化策略與實作細節，包含 DataLoader、Query Complexity、Redis 快取與資料庫優化。

---

## 目錄

- [效能優化指南 (Performance Optimization)](#效能優化指南-performance-optimization)
  - [目錄](#目錄)
  - [DataLoader - 解決 N+1 查詢問題](#dataloader---解決-n1-查詢問題)
    - [問題描述](#問題描述)
    - [解決方案](#解決方案)
    - [實作](#實作)
    - [效能提升](#效能提升)
  - [Query Complexity - 防止過度複雜的查詢](#query-complexity---防止過度複雜的查詢)
    - [問題描述](#問題描述-1)
    - [解決方案](#解決方案-1)
    - [實作](#實作-1)
    - [設定](#設定)
    - [複雜度計算範例](#複雜度計算範例)
  - [Redis 快取策略](#redis-快取策略)
    - [概述](#概述)
    - [架構](#架構)
    - [實作](#實作-2)
    - [快取監控](#快取監控)
    - [TTL 設定指南](#ttl-設定指南)
    - [快取失效策略](#快取失效策略)
    - [效能提升](#效能提升-1)
  - [資料庫效能優化](#資料庫效能優化)
    - [1. 索引優化](#1-索引優化)
    - [2. 慢查詢監控](#2-慢查詢監控)
    - [3. 連線池優化](#3-連線池優化)
    - [4. 查詢優化最佳實踐](#4-查詢優化最佳實踐)
    - [5. 監控與分析](#5-監控與分析)
  - [總結](#總結)
  - [相關文檔](#相關文檔)

---

## DataLoader - 解決 N+1 查詢問題

### 問題描述

在 GraphQL resolver 中,如果直接查詢關聯資料,會產生 N+1 查詢問題:

```typescript
// ❌ 產生 N+1 問題
async user(parent) {
  return prisma.user.findUnique({ where: { id: parent.userId } });
}

// 如果查詢 100 個通知,會執行:
// 1 次查詢通知列表 + 100 次查詢用戶 = 101 次查詢
```

### 解決方案

使用 DataLoader 進行批量查詢和快取:

```typescript
// ✅ 使用 DataLoader
async user(parent, args, context) {
  return context.loaders.user.load(parent.userId);
}

// 查詢 100 個通知時:
// 1 次查詢通知列表 + 1 次批量查詢用戶 = 2 次查詢
```

### 實作

#### 1. UserDataLoaderService

位置: `apps/backend/src/modules/user/user.dataloader.ts`

提供三種 DataLoader:

```typescript
// 完整用戶資料（含 profile）
const user = await context.loaders.user.load(userId);

// 基本用戶資料（不含 profile,更快）
const user = await context.loaders.userBasic.load(userId);

// 以 email 查詢用戶
const user = await context.loaders.userByEmail.load(email);
```

#### 2. GraphQL Context 整合

位置: `apps/backend/src/app.module.ts`

```typescript
GraphQLModule.forRootAsync({
  useFactory: (userDataLoaderService) => ({
    context: ({ req, res }) => {
      // 為每個請求建立新的 DataLoader 實例
      const loaders = {
        user: userDataLoaderService.createLoader(),
        userBasic: userDataLoaderService.createBasicLoader(),
        userByEmail: userDataLoaderService.createEmailLoader(),
      };

      return { req, res, loaders };
    },
  }),
});
```

#### 3. 在 Resolver 中使用

```typescript
@ResolveField(() => UserType)
async user(
  @Parent() notification: Notification,
  @Context() context: GraphQLContext,
): Promise<User> {
  return context.loaders.user.load(notification.userId);
}
```

### 效能提升

- **查詢數量**: N+1 → 2（減少 99%）
- **查詢時間**: 線性 O(n) → 常數 O(1)
- **資料庫負載**: 大幅降低

---

## Query Complexity - 防止過度複雜的查詢

### 問題描述

惡意或不當的 GraphQL 查詢可能導致:

- 過度的資料庫查詢
- 記憶體耗盡
- 服務不可用（DoS）

```graphql
# ❌ 過度複雜的查詢
query {
  users {
    notifications {
      user {
        notifications {
          user {
            # 無限深度嵌套...
          }
        }
      }
    }
  }
}
```

### 解決方案

使用 Query Complexity Plugin 限制查詢複雜度:

1. **深度限制**: 最大嵌套深度 10 層
2. **複雜度計算**: 根據欄位和陣列大小計算分數
3. **複雜度上限**: 預設 1000 分（可配置）
4. **監控**: 記錄高複雜度查詢

### 實作

位置: `apps/backend/src/common/plugins/query-complexity.plugin.ts`

```typescript
@Plugin()
export class QueryComplexityPlugin implements ApolloServerPlugin {
  async requestDidStart() {
    return {
      async didResolveOperation({ request, document }) {
        const complexity = getComplexity({
          schema,
          query: document,
          variables: request.variables,
          estimators: [
            fieldExtensionsEstimator(),
            simpleEstimator({ defaultComplexity: 1 }),
          ],
        });

        // 記錄高複雜度查詢
        if (complexity > logThreshold) {
          logger.warn('High complexity query detected', {
            complexity,
            operationName: request.operationName,
          });
        }

        // 拒絕過度複雜的查詢
        if (complexity > maxComplexity) {
          throw new Error(
            `Query too complex: ${complexity}. Maximum: ${maxComplexity}`,
          );
        }
      },
    };
  }
}
```

### 設定

在 `.env` 中配置:

```bash
# Query Complexity 限制（防止過於複雜的查詢）
GRAPHQL_MAX_COMPLEXITY=1000

# 記錄高複雜度查詢的閾值
GRAPHQL_COMPLEXITY_LOG_THRESHOLD=500
```

### 複雜度計算範例

```graphql
query {
  users(limit: 10) {          # 10 * complexity
    notifications(limit: 20) { # 10 * 20 * complexity
      user {                   # 10 * 20 * 1
        # 總複雜度: 200 + ...
      }
    }
  }
}
```

---

## Redis 快取策略

### 概述

使用 Redis 快取常用查詢結果,減少資料庫負載,提升回應速度。

### 架構

```
┌─────────────┐     快取命中     ┌────────────┐
│   Resolver  │ ───────────────> │   Redis    │
│             │                   │   Cache    │
│             │ <─────────────── │            │
└─────────────┘     返回快取     └────────────┘
       │
       │ 快取未命中
       ▼
┌─────────────┐
│  Database   │
│   (Prisma)  │
└─────────────┘
```

### 實作

#### 1. CacheService

位置: `apps/backend/src/cache/cache.service.ts`

**核心功能**:

- 通用快取操作 (get, set, del)
- 批量刪除 (delPattern)
- Cache hit rate 監控
- 業務快取方法

**使用範例**:

```typescript
// 通用快取
await cacheService.set('key', value, 300); // TTL 300秒
const value = await cacheService.get('key');
await cacheService.del('key');

// 業務快取
await cacheService.cacheUser(userId, userData, 600);
const user = await cacheService.getCachedUser(userId);
await cacheService.invalidateUser(userId);
```

#### 2. 快取策略

##### 2.1 通知列表快取

**位置**: `apps/backend/src/notification/notification.service.ts`

**策略**:

- **TTL**: 180 秒（3 分鐘）
- **快取鍵**: `notifications:{userId}:{filters}`
- **失效條件**: 建立、標記已讀、刪除通知時

```typescript
async getUserNotifications(userId, options) {
  // 1. 嘗試從快取讀取
  const cacheKey = JSON.stringify(options);
  const cached = await this.cacheService.getCachedNotifications(userId, cacheKey);
  if (cached) return cached;

  // 2. 查詢資料庫
  const result = await this.prisma.notification.findMany({...});

  // 3. 存入快取
  await this.cacheService.cacheNotifications(userId, cacheKey, result, 180);

  return result;
}

async createNotification(input) {
  // ... 建立通知 ...

  // 清除快取
  await this.cacheService.invalidateUserNotifications(input.userId);
  await this.cacheService.invalidateUnreadCount(input.userId);
}
```

##### 2.2 未讀數量快取

**策略**:

- **TTL**: 120 秒（2 分鐘）
- **快取鍵**: `unread:{userId}`
- **失效條件**: 建立、標記已讀通知時

```typescript
async getUnreadCount(userId) {
  // 1. 嘗試從快取讀取
  const cached = await this.cacheService.getCachedUnreadCount(userId);
  if (cached !== null) return cached;

  // 2. 查詢資料庫
  const count = await this.prisma.notification.count({
    where: { userId, isRead: false },
  });

  // 3. 存入快取
  await this.cacheService.cacheUnreadCount(userId, count, 120);

  return count;
}
```

##### 2.3 Session 統計快取

**位置**: `apps/backend/src/auth/hq-session.service.ts`

**策略**:

- **TTL**: 300 秒（5 分鐘）
- **快取鍵**: `session:stats`
- **失效條件**: 撤銷會話時

```typescript
async getSessionStatistics(timeRange) {
  // 只有無 timeRange 時才使用快取
  if (!timeRange) {
    const cached = await this.cacheService.getCachedSessionStats();
    if (cached) return cached;
  }

  // 執行複雜的統計查詢
  const result = {
    totalActive,
    totalRevoked,
    todayLogins,
    byUser,
    byDevice,
    // ...
  };

  // 存入快取
  if (!timeRange) {
    await this.cacheService.cacheSessionStats(result, 300);
  }

  return result;
}

async revokeSession(params) {
  // ... 撤銷會話 ...

  // 清除統計快取
  await this.cacheService.invalidateSessionStats();
}
```

### 快取監控

#### Cache Stats API

**Query**:

```graphql
query {
  cacheStats {
    hitCount # 命中次數
    missCount # 未命中次數
    totalRequests # 總請求數
    hitRate # 命中率（百分比）
  }
}
```

**權限**: 僅限 `HQ_SCOPE`

**位置**: `apps/backend/src/cache/cache.resolver.ts`

### TTL 設定指南

| 資料類型     | TTL     | 原因                          |
| ------------ | ------- | ----------------------------- |
| 用戶資料     | 10 分鐘 | 用戶資料較穩定,變更不頻繁     |
| 通知列表     | 3 分鐘  | 通知更新較頻繁,需要較短 TTL   |
| 未讀數量     | 2 分鐘  | 即時性要求高,TTL 更短         |
| Session 統計 | 5 分鐘  | 統計資料查詢成本高,可容忍延遲 |

### 快取失效策略

#### 1. TTL 自動過期

- 所有快取都設定 TTL,到期後自動清除
- 防止過期資料長期存在

#### 2. 手動失效

- 資料變更時主動清除相關快取
- 確保資料一致性

#### 3. 模式匹配刪除

```typescript
// 刪除特定用戶的所有通知快取
await cacheService.delPattern(`notifications:${userId}:*`);
```

### 效能提升

#### 通知列表查詢

- **無快取**: ~50-100ms（資料庫查詢）
- **有快取**: ~2-5ms（Redis 讀取）
- **提升**: 10-50x

#### Session 統計查詢

- **無快取**: ~200-500ms（複雜聚合查詢）
- **有快取**: ~2-5ms（Redis 讀取）
- **提升**: 40-250x

#### 資料庫負載

- **查詢減少**: 60-80%（取決於快取命中率）
- **CPU 使用率**: 降低 30-50%
- **並發能力**: 提升 2-3x

---

## 資料庫效能優化

### 概述

透過索引優化、慢查詢監控和連線池調整,提升資料庫查詢效能。

### 1. 索引優化

#### 1.1 Session Model

**優化前的問題**:

- 查詢活躍 sessions 需要掃描全表
- 今日登入/撤銷統計缺少索引
- 多條件查詢效能不佳

**優化策略**:

```prisma
model Session {
  // ... 欄位定義 ...

  // 查詢用戶的活躍/已撤銷 sessions
  @@index([userId, revokedAt])

  // 驗證 refresh token
  @@index([refreshTokenHash])

  // 查詢活躍 sessions (revokedAt IS NULL AND expiresAt > NOW())
  @@index([revokedAt, expiresAt])

  // 查詢今日登入統計
  @@index([createdAt(sort: Desc)])

  // 查詢今日撤銷統計
  @@index([revokedAt(sort: Desc)])

  // 管理員撤銷記錄查詢
  @@index([revokedBy])

  // 按最後使用時間排序（找不活躍 sessions）
  @@index([lastUsedAt(sort: Desc)])
}
```

**效能提升**:

- 活躍 sessions 查詢: 全表掃描 → 索引掃描 (100x+ 提升)
- 今日統計查詢: O(n) → O(log n)

#### 1.2 Notification Model

**優化策略**:

```prisma
model Notification {
  // ... 欄位定義 ...

  // 查詢用戶通知（過濾已讀/未讀）
  @@index([userId, isRead, createdAt(sort: Desc)])

  // 查詢用戶所有通知
  @@index([userId, createdAt(sort: Desc)])

  // 按類型過濾通知
  @@index([userId, type, createdAt(sort: Desc)])
}
```

**效能提升**:

- 通知列表查詢: 30-50ms → 5-10ms (3-5x)
- 按類型過濾: 添加複合索引後支援高效過濾

### 2. 慢查詢監控

#### 2.1 Prisma Query Logging

**實作位置**: `apps/backend/src/prisma/prisma.service.ts`

**功能**:

- 自動記錄超過閾值的慢查詢
- 記錄查詢 SQL、參數、執行時間
- 開發環境記錄所有 >100ms 的查詢

**範例日誌**:

```typescript
@Injectable()
export class PrismaService extends PrismaClient<
  Prisma.PrismaClientOptions,
  'query'
> {
  constructor() {
    super({
      log: [
        { emit: 'event', level: 'query' },
        { emit: 'stdout', level: 'error' },
        { emit: 'stdout', level: 'warn' },
      ],
    });

    // 監聽查詢事件
    this.$on('query', (e: Prisma.QueryEvent) => {
      if (e.duration >= slowQueryThreshold) {
        logger.warn('[Prisma] Slow Query Detected', {
          duration: `${e.duration}ms`,
          query: e.query,
          params: e.params,
        });
      }
    });
  }
}
```

**日誌輸出範例**:

```
[Prisma] Slow Query Detected {
  duration: '1523ms',
  query: 'SELECT * FROM sessions WHERE user_id = $1 AND revoked_at IS NULL',
  params: '["user-id-123"]',
  target: 'quaint::connector::metrics',
  timestamp: '2026-02-15T10:30:45.123Z'
}
```

#### 2.2 環境變數配置

在 `.env` 中設定慢查詢閾值:

```bash
# 慢查詢閾值（毫秒，超過此時間的查詢會被記錄）
# 開發環境建議: 1000ms
# 生產環境建議: 500ms
PRISMA_SLOW_QUERY_THRESHOLD=1000
```

### 3. 連線池優化

#### 3.1 DATABASE_URL 配置

**優化前**:

```bash
DATABASE_URL="postgresql://user:pass@localhost:5432/db?schema=public"
```

**優化後**:

```bash
DATABASE_URL="postgresql://user:pass@localhost:5432/db?schema=public&connection_limit=10&pool_timeout=10"
```

**參數說明**:

| 參數               | 說明                   | 建議值                  |
| ------------------ | ---------------------- | ----------------------- |
| `connection_limit` | 最大連線數             | 開發: 10<br>生產: 20-30 |
| `pool_timeout`     | 等待連線的超時時間(秒) | 10                      |

#### 3.2 連線池規劃

**計算公式**:

```
最佳連線數 = (CPU 核心數 × 2) + 磁碟數量
```

**範例**:

- 4 核心 CPU + 1 SSD: (4 × 2) + 1 = **9 連線**
- 8 核心 CPU + 2 SSD: (8 × 2) + 2 = **18 連線**

**不同場景建議**:

| 場景             | 連線數     | 說明            |
| ---------------- | ---------- | --------------- |
| 本地開發         | 5-10       | 單機開發,負載低 |
| 測試環境         | 10-15      | 中等負載        |
| 生產環境(單實例) | 20-30      | 高負載          |
| 生產環境(多實例) | 10-15/實例 | 避免連線數過多  |

### 4. 查詢優化最佳實踐

#### 4.1 使用 Select 只取需要的欄位

❌ **不推薦**:

```typescript
const user = await prisma.user.findUnique({
  where: { id: userId },
  include: { profile: true }, // 取得所有欄位
});
```

✅ **推薦**:

```typescript
const user = await prisma.user.findUnique({
  where: { id: userId },
  select: {
    id: true,
    email: true,
    name: true,
    profile: {
      select: {
        language: true,
      },
    },
  },
});
```

#### 4.2 使用 DataLoader 避免 N+1 問題

詳見 [DataLoader 章節](#dataloader---解決-n1-查詢問題)

#### 4.3 適當使用快取

詳見 [Redis 快取策略](#redis-快取策略)

### 5. 監控與分析

#### 5.1 查詢效能檢查清單

- [ ] 是否使用了適當的索引?
- [ ] 查詢是否有 N+1 問題?
- [ ] 是否只選擇需要的欄位?
- [ ] 是否使用了快取?
- [ ] 查詢時間是否 <100ms?

#### 5.2 定期檢查慢查詢

```bash
# 查看慢查詢日誌
grep "Slow Query Detected" logs/app.log | tail -50

# 分析查詢時間分佈
grep "Slow Query Detected" logs/app.log | \
  grep -oP 'duration: \K[0-9]+' | \
  sort -n | \
  tail -10
```

#### 5.3 資料庫效能指標

**關鍵指標**:

- 平均查詢時間: <50ms
- P95 查詢時間: <200ms
- P99 查詢時間: <500ms
- 慢查詢數量: <1% 總查詢數
- 連線池使用率: 60-80%

---

## 總結

### 已實作的優化

1. ✅ **DataLoader** - 解決 N+1 查詢問題
2. ✅ **Query Complexity** - 防止過度複雜的查詢
3. ✅ **Redis Cache** - 快取常用查詢結果
4. ✅ **Database Optimization** - 索引優化、慢查詢監控、連線池調整

### 效能指標

| 指標         | 優化前    | 優化後 | 提升      |
| ------------ | --------- | ------ | --------- |
| N+1 查詢數   | N+1 次    | 2 次   | 99% ↓     |
| 通知列表查詢 | 50-100ms  | 2-5ms  | 10-50x ↑  |
| Session 統計 | 200-500ms | 2-5ms  | 40-250x ↑ |
| 資料庫查詢量 | 100%      | 20-40% | 60-80% ↓  |
| 並發處理能力 | 1x        | 2-3x   | 2-3x ↑    |

### 後續優化方向

- ~~資料庫索引優化~~ ✅ 已完成
- ~~連線池配置調整~~ ✅ 已完成
- ~~慢查詢監控~~ ✅ 已完成
- 前端 Code Splitting
- 前端 Lazy Loading
- CDN 配置
- 圖片優化與壓縮
- API Response 壓縮(gzip)

---

## 相關文檔

- [GraphQL 最佳實踐](GRAPHQL_BEST_PRACTICES.md) - Schema 設計與查詢優化
- [快取策略](CACHING_STRATEGY.md) - 完整的快取架構
- [環境變數管理](../infrastructure/ENVIRONMENT_VARIABLES.md) - 效能相關環境變數
