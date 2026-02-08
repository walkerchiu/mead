# GraphQL Subscription 實現指南 (Subscription Guide)

實時 WebSocket 訂閱功能，支援審計日誌即時推送和其他實時更新場景。

---

## 📋 目錄

- [GraphQL Subscription 實現指南 (Subscription Guide)](#graphql-subscription-實現指南-subscription-guide)
  - [📋 目錄](#-目錄)
  - [📖 概述](#-概述)
  - [✨ 為什麼需要 Subscription？](#-為什麼需要-subscription)
    - [適合使用 Subscription](#適合使用-subscription)
    - [不適合使用 Subscription](#不適合使用-subscription)
  - [🎯 已實現範例：審計日誌實時訂閱](#-已實現範例審計日誌實時訂閱)
    - [功能描述](#功能描述)
    - [架構圖](#架構圖)
    - [後端實現](#後端實現)
      - [1. PubSub Service](#1-pubsub-service)
      - [2. GraphQL Resolver](#2-graphql-resolver)
      - [3. 觸發事件](#3-觸發事件)
    - [前端實現](#前端實現)
      - [1. Apollo Client 配置](#1-apollo-client-配置)
      - [2. Subscription Hook](#2-subscription-hook)
      - [3. GraphQL Query](#3-graphql-query)
  - [🔒 安全機制](#-安全機制)
    - [1. WebSocket JWT 驗證](#1-websocket-jwt-驗證)
    - [2. Filter-based 權限檢查](#2-filter-based-權限檢查)
    - [3. 字段級權限過濾](#3-字段級權限過濾)
  - [🔄 替代方案（若不使用 Subscription）](#-替代方案若不使用-subscription)
    - [1. 輪詢 (Polling)](#1-輪詢-polling)
    - [2. Server-Sent Events (SSE)](#2-server-sent-events-sse)
  - [🚀 實現步驟（擴展到其他功能）](#-實現步驟擴展到其他功能)
    - [階段 1：依賴已安裝 ✅](#階段-1依賴已安裝-)
    - [階段 2：GraphQL Module 已配置 ✅](#階段-2graphql-module-已配置-)
    - [階段 3：創建新的 PubSub Service](#階段-3創建新的-pubsub-service)
    - [階段 4：創建 Subscription Resolver](#階段-4創建-subscription-resolver)
    - [階段 5：前端使用](#階段-5前端使用)
  - [🚀 生產環境建議](#-生產環境建議)
    - [1. 使用 Redis PubSub](#1-使用-redis-pubsub)
    - [2. 連接數限制](#2-連接數限制)
    - [3. 監控指標](#3-監控指標)
  - [🧪 測試](#-測試)
    - [後端單元測試](#後端單元測試)
    - [前端整合測試](#前端整合測試)
    - [E2E 測試](#e2e-測試)
  - [🚨 常見問題與除錯](#-常見問題與除錯)
    - [1. WebSocket 連接失敗](#1-websocket-連接失敗)
    - [2. Subscription 未收到資料](#2-subscription-未收到資料)
    - [3. "Unauthorized" 錯誤](#3-unauthorized-錯誤)
    - [4. 記憶體洩漏](#4-記憶體洩漏)
  - [📚 參考資源](#-參考資源)
    - [官方文檔](#官方文檔)
    - [進階主題](#進階主題)
    - [相關文檔](#相關文檔)
  - [🎯 下一步](#-下一步)
    - [立即可做](#立即可做)
    - [短期規劃（1-2 週）](#短期規劃1-2-週)
    - [中期規劃（1-2 月）](#中期規劃1-2-月)
    - [長期規劃（3+ 月）](#長期規劃3-月)

---

## 📖 概述

本文檔說明專案中已實現的 GraphQL Subscription（實時訂閱）功能，以及如何擴展到其他使用場景。

---

## ✨ 為什麼需要 Subscription？

GraphQL Subscription 適用於需要**實時推送**的場景：

### 適合使用 Subscription

- 📱 **即時通訊** - 聊天消息、群組通知
- 🔔 **系統通知** - 用戶狀態變更、訂單更新
- 🎮 **協作編輯** - 多人同時編輯文檔
- 📊 **實時數據** - 股票價格、儀表板數據
- 👥 **在線狀態** - 用戶上線/離線通知

### 不適合使用 Subscription

- 📄 **靜態內容** - 使用 Query 即可
- 🔄 **低頻更新** - 使用輪詢更簡單
- 📦 **批量數據** - Subscription 會產生大量連接

---

## 🎯 已實現範例：審計日誌實時訂閱

### 功能描述

管理員可以訂閱審計日誌創建事件，實時接收新的日誌記錄，無需手動重新整理頁面。

### 架構圖

```text
前端 (React) <--WebSocket--> GraphQL Server <--PubSub--> Audit Log Service
     │                             │                          │
     │ useSubscription()           │ @Subscription()          │ emitAuditLogCreated()
     │                             │                          │
     └── Apollo Client ─────────── GraphQL WS ────────────── Distributed PubSub
                                                              (開發：Memory，生產：Dragonfly)
```

### 後端實現

#### 1. PubSub Service

**位置**: `apps/backend/src/audit-log/audit-log-pubsub.service.ts`

```typescript
import { Injectable } from '@nestjs/common';
import { PubSub } from 'graphql-subscriptions';

export const AUDIT_LOG_EVENTS = {
  CREATED: 'AUDIT_LOG_CREATED',
  DELETED: 'AUDIT_LOG_DELETED',
} as const;

@Injectable()
export class AuditLogPubSubService {
  private pubSub = new PubSub();

  // 發布新稽核日誌事件
  emitAuditLogCreated(auditLog: any) {
    this.pubSub.publish(AUDIT_LOG_EVENTS.CREATED, {
      auditLogCreated: auditLog,
    });
  }

  // 訂閱稽核日誌創建事件
  subscribeToAuditLogCreated() {
    return this.pubSub.asyncIterator([AUDIT_LOG_EVENTS.CREATED]);
  }
}
```

#### 2. GraphQL Resolver

**位置**: `apps/backend/src/audit-log/audit-log.resolver.ts`

```typescript
@Subscription(() => AuditLogType, {
  name: 'auditLogCreated',
  description: '訂閱新稽核日誌（需要 HQ_SCOPE + audit-logs:read）',
  filter: (payload, variables, context) => {
    // WebSocket context 從 extra 中取得 user
    const user = context?.extra?.user || context?.req?.user;

    if (!user) return false;

    // 檢查 HQ_SCOPE
    const hasHQScope = user.accessScopes?.includes(AccessScope.HQ_SCOPE);
    if (!hasHQScope) return false;

    // 檢查 audit-logs:read 權限
    const permissions = user.permissions || [];
    const hasPermission = permissions.some((p: any) =>
      p.name === 'audit-logs:read' || p.resource === 'audit-logs'
    );

    return hasPermission || permissions.length === 0;
  },
})
auditLogCreated(@Context() context: any) {
  return this.pubSubService.subscribeToAuditLogCreated();
}
```

#### 3. 觸發事件

**位置**: `apps/backend/src/audit-log/audit-log.service.ts`

```typescript
async create(data: CreateAuditLogInput): Promise<AuditLog> {
  const auditLog = await this.prisma.auditLog.create({ data });

  // 發布事件到訂閱者
  this.pubSubService.emitAuditLogCreated(auditLog);

  return auditLog;
}
```

### 前端實現

#### 1. Apollo Client 配置

**位置**: `apps/frontend/src/lib/apollo-client.ts`

```typescript
import { GraphQLWsLink } from '@apollo/client/link/subscriptions';
import { createClient } from 'graphql-ws';
import { split } from '@apollo/client';

// WebSocket Link for subscriptions
const wsLink = new GraphQLWsLink(
  createClient({
    url:
      process.env.NEXT_PUBLIC_GRAPHQL_WS_ENDPOINT ||
      'ws://localhost:4000/graphql',
    connectionParams: () => {
      const token = getAccessToken();
      return {
        authorization: token ? `Bearer ${token}` : '',
      };
    },
  }),
);

// Split: subscriptions 用 WS，其他用 HTTP
const splitLink = split(
  ({ query }) => {
    const definition = getMainDefinition(query);
    return (
      definition.kind === 'OperationDefinition' &&
      definition.operation === 'subscription'
    );
  },
  wsLink,
  from([errorLink, langLink, authLink, httpLink]),
);
```

#### 2. Subscription Hook

**位置**: `apps/frontend/src/hooks/useAuditLogSubscription.ts`

```typescript
import { useSubscription } from '@apollo/client/react';
import { AUDIT_LOG_CREATED_SUBSCRIPTION } from '@/lib/audit-logs-queries';

export const useAuditLogSubscription = () => {
  const [newLogsCount, setNewLogsCount] = useState(0);
  const [shouldSubscribe, setShouldSubscribe] = useState(false);

  // 確保已認證後才訂閱
  useEffect(() => {
    const timer = setTimeout(() => {
      if (isAuthenticated()) {
        setShouldSubscribe(true);
      }
    }, 200);
    return () => clearTimeout(timer);
  }, []);

  useSubscription(AUDIT_LOG_CREATED_SUBSCRIPTION, {
    skip: !shouldSubscribe,
    onData: ({ data }) => {
      if (data?.data?.auditLogCreated) {
        setNewLogsCount((prev) => prev + 1);
        console.log('[Audit Log] New log received:', data.data.auditLogCreated);
      }
    },
    onError: (error) => {
      console.error('[Audit Log Subscription] Error:', error);
    },
  });

  return { newLogsCount, clearNewLogsCount: () => setNewLogsCount(0) };
};
```

#### 3. GraphQL Query

```typescript
export const AUDIT_LOG_CREATED_SUBSCRIPTION = gql`
  subscription OnAuditLogCreated {
    auditLogCreated {
      id
      action
      entity
      entityId
      userId
      status
      ipAddress
      requestId
      createdAt
      user {
        id
        name
        email
      }
    }
  }
`;
```

---

## 🔒 安全機制

### 1. WebSocket JWT 驗證

**位置**: `apps/backend/src/app.module.ts`

```typescript
subscriptions: {
  'graphql-ws': {
    onConnect: async (context: any) => {
      const { connectionParams } = context;
      const authHeader = connectionParams?.authorization || '';
      const token = authHeader.replace('Bearer ', '');

      if (!token) {
        return { token: null, user: null };
      }

      try {
        // ✅ 完整簽名驗證（不只是解碼）
        const jwt = require('jsonwebtoken');
        const payload = jwt.verify(token, jwtSecret) as any;

        return {
          token,
          user: {
            id: payload.sub,
            email: payload.email,
            accessScopes: payload.accessScopes || [],
            permissions: payload.permissions || [],
          },
        };
      } catch (error) {
        logger.warn('[WebSocket] Authentication failed');
        return { token: null, user: null };
      }
    },
  },
}
```

### 2. Filter-based 權限檢查

由於 `@UseGuards()` 在 Subscription 中不生效，需要在 `filter` 中手動檢查：

```typescript
filter: (payload, variables, context) => {
  const user = context?.extra?.user || context?.req?.user;

  // 1. 檢查用戶是否存在
  if (!user) return false;

  // 2. 檢查 Scope
  if (!user.accessScopes?.includes(AccessScope.HQ_SCOPE)) {
    return false;
  }

  // 3. 檢查權限
  const hasPermission = user.permissions?.some(
    (p) => p.name === 'audit-logs:read',
  );

  return hasPermission;
};
```

### 3. 字段級權限過濾

`FieldAuthPlugin` 自動過濾敏感欄位（如 `password`, `refreshToken`）。

---

## 🔄 替代方案（若不使用 Subscription）

### 1. 輪詢 (Polling)

```typescript
// 優點：最簡單
// 缺點：延遲高、資源浪費
setInterval(() => {
  apolloClient.query({ query: GET_AUDIT_LOGS });
}, 5000);
```

### 2. Server-Sent Events (SSE)

```typescript
// 優點：單向推送、基於 HTTP
// 缺點：只能服務器→客戶端
@Sse('audit-logs')
auditLogs(@Request() req): Observable<MessageEvent> {
  return this.auditLogService.stream();
}
```

---

## 🚀 實現步驟（擴展到其他功能）

### 階段 1：依賴已安裝 ✅

```bash
# 已安裝的套件
✅ graphql-subscriptions
✅ graphql-ws
✅ ws
✅ @types/ws
```

### 階段 2：GraphQL Module 已配置 ✅

**位置**: `apps/backend/src/app.module.ts`

```typescript
GraphQLModule.forRootAsync<ApolloDriverConfig>({
  driver: ApolloDriver,
  imports: [ConfigModule],
  inject: [ConfigService],
  useFactory: (configService: ConfigService) => ({
    autoSchemaFile: 'apps/api/schema.gql',
    sortSchema: true,

    // ✅ Subscription 已啟用
    subscriptions: {
      'graphql-ws': {
        onConnect: async (context: any) => {
          // JWT 驗證邏輯
          // ...
        },
      },
    },

    context: ({ req, res, extra }: any) => ({
      req,
      res,
      user: extra?.user || req?.user,
    }),
  }),
}),
```

### 階段 3：創建新的 PubSub Service

以通知為例：

```typescript
// apps/backend/src/notification/notification-pubsub.service.ts

import { Injectable } from '@nestjs/common';
import { PubSub } from 'graphql-subscriptions';

export const NOTIFICATION_EVENTS = {
  CREATED: 'NOTIFICATION_CREATED',
  READ: 'NOTIFICATION_READ',
} as const;

@Injectable()
export class NotificationPubSubService {
  private pubSub = new PubSub();

  emitNotificationCreated(notification: any) {
    this.pubSub.publish(NOTIFICATION_EVENTS.CREATED, {
      notificationCreated: notification,
    });
  }

  subscribeToNotificationCreated() {
    return this.pubSub.asyncIterator([NOTIFICATION_EVENTS.CREATED]);
  }
}
```

### 階段 4：創建 Subscription Resolver

```typescript
// apps/backend/src/notification/notification.resolver.ts

@Resolver()
export class NotificationResolver {
  constructor(private pubSubService: NotificationPubSubService) {}

  @Subscription(() => NotificationType, {
    name: 'notificationCreated',
    filter: (payload, variables, context) => {
      const user = context?.extra?.user || context?.req?.user;

      // 只推送給目標用戶
      return payload.notificationCreated.userId === user?.id;
    },
  })
  notificationCreated(@Context() context: any) {
    return this.pubSubService.subscribeToNotificationCreated();
  }

  // 在 mutation 中觸發
  @Mutation(() => NotificationType)
  async createNotification(data: CreateNotificationInput) {
    const notification = await this.service.create(data);

    // 發布事件
    this.pubSubService.emitNotificationCreated(notification);

    return notification;
  }
}
```

### 階段 5：前端使用

```typescript
// hooks/useNotificationSubscription.ts

export const useNotificationSubscription = () => {
  const { data } = useSubscription(NOTIFICATION_CREATED, {
    skip: !isAuthenticated(),
    onData: ({ data }) => {
      toast.info(data.notificationCreated.message);
    },
  });

  return data;
};
```

---

## 🚀 生產環境建議

### 1. 使用 Redis PubSub

**為什麼需要？**

- 記憶體 PubSub 只適用於單一實例
- 多實例部署時，事件無法跨實例傳播
- Redis PubSub 支持水平擴展

**安裝**:

```bash
pnpm add graphql-redis-subscriptions ioredis
```

**實現**:

```typescript
// apps/backend/src/common/services/redis-pubsub.service.ts

import { Injectable } from '@nestjs/common';
import { RedisPubSub } from 'graphql-redis-subscriptions';
import Redis from 'ioredis';

@Injectable()
export class RedisPubSubService extends RedisPubSub {
  constructor() {
    const options = {
      host: process.env.REDIS_HOST || 'localhost',
      port: parseInt(process.env.REDIS_PORT || '6379'),
      retryStrategy: (times: number) => Math.min(times * 50, 2000),
    };

    super({
      publisher: new Redis(options),
      subscriber: new Redis(options),
    });
  }
}
```

**更新 Module**:

```typescript
@Module({
  providers: [
    {
      provide: 'PUB_SUB',
      useClass:
        process.env.NODE_ENV === 'production'
          ? RedisPubSubService
          : PubSubService, // 開發環境用記憶體
    },
  ],
  exports: ['PUB_SUB'],
})
export class PubSubModule {}
```

### 2. 連接數限制

```typescript
const MAX_CONNECTIONS_PER_USER = 5;
const userConnections = new Map<string, number>();

subscriptions: {
  'graphql-ws': {
    onConnect: (context) => {
      const userId = context.extra?.user?.id;
      if (!userId) return { user: null };

      const count = userConnections.get(userId) || 0;
      if (count >= MAX_CONNECTIONS_PER_USER) {
        throw new Error('Too many connections');
      }

      userConnections.set(userId, count + 1);
      return context.extra;
    },
    onDisconnect: (context) => {
      const userId = context.extra?.user?.id;
      if (userId) {
        const count = userConnections.get(userId) || 1;
        userConnections.set(userId, count - 1);
      }
    },
  },
}
```

### 3. 監控指標

```typescript
// 添加 Prometheus metrics
import { Counter, Gauge } from 'prom-client';

const wsConnections = new Gauge({
  name: 'graphql_ws_connections',
  help: 'Number of active WebSocket connections',
});

const subscriptionEvents = new Counter({
  name: 'graphql_subscription_events_total',
  help: 'Total number of subscription events published',
  labelNames: ['event_type'],
});

subscriptions: {
  'graphql-ws': {
    onConnect: () => {
      wsConnections.inc();
    },
    onDisconnect: () => {
      wsConnections.dec();
    },
  },
}

// 發布事件時記錄
emitAuditLogCreated(log: any) {
  this.pubSub.publish(EVENTS.CREATED, { auditLogCreated: log });
  subscriptionEvents.inc({ event_type: 'audit_log_created' });
}
```

---

## 🧪 測試

### 後端單元測試

```typescript
describe('AuditLogPubSubService', () => {
  let service: AuditLogPubSubService;

  beforeEach(() => {
    service = new AuditLogPubSubService();
  });

  it('should emit audit log created event', (done) => {
    const mockLog = {
      id: '1',
      action: 'CREATE',
      entity: 'user',
    };

    const subscription = service.subscribeToAuditLogCreated();

    subscription.next().then((result) => {
      expect(result.value.auditLogCreated).toEqual(mockLog);
      done();
    });

    service.emitAuditLogCreated(mockLog);
  });
});
```

### 前端整合測試

```typescript
describe('useAuditLogSubscription', () => {
  it('should receive new audit logs', async () => {
    const { result } = renderHook(() => useAuditLogSubscription());

    // 模擬後端發送新日誌
    await act(async () => {
      // 觸發 subscription
      await waitFor(() => {
        expect(result.current.newLogsCount).toBe(1);
      });
    });
  });
});
```

### E2E 測試

```typescript
describe('Audit Log Subscription E2E', () => {
  it('should receive real-time updates', async () => {
    const client = createTestApolloClient();

    let receivedLog = null;

    // 訂閱
    client
      .subscribe({
        query: AUDIT_LOG_CREATED_SUBSCRIPTION,
      })
      .subscribe({
        next: (data) => {
          receivedLog = data.data.auditLogCreated;
        },
      });

    // 觸發創建
    await client.mutate({
      mutation: CREATE_USER,
      variables: { name: 'Test' },
    });

    // 驗證訂閱收到資料
    await waitFor(() => {
      expect(receivedLog).toBeDefined();
      expect(receivedLog.action).toBe('CREATE');
    });
  });
});
```

---

## 🚨 常見問題與除錯

### 1. WebSocket 連接失敗

**症狀**: `Socket closed` 或 `Connection failed`

**原因與解決方案**:

```typescript
// 問題 1: Token 未傳遞
connectionParams: () => {
  const token = getAccessToken();
  if (!token) {
    console.error('[WS] No access token available');
  }
  return { authorization: token ? `Bearer ${token}` : '' };
};

// 問題 2: CORS 配置
// 確保後端允許 WebSocket upgrade
app.enableCors({
  origin: process.env.CORS_ORIGIN,
  credentials: true,
  allowedHeaders: ['content-type', 'authorization'],
});

// 問題 3: Token 過期
// 在 token 快過期時自動重新整理
useEffect(() => {
  const interval = setInterval(async () => {
    if (isTokenExpiringSoon()) {
      await refreshAccessToken();
    }
  }, 60000); // 每分鐘檢查

  return () => clearInterval(interval);
}, []);
```

### 2. Subscription 未收到資料

**檢查清單**:

```typescript
// ✅ 1. 確認權限檢查通過
filter: (payload, variables, context) => {
  console.log('[Subscription Filter]', {
    user: context?.extra?.user,
    payload,
  });
  return true; // 暫時返回 true 測試
}

// ✅ 2. 確認事件名稱一致
// 發布端
this.pubSub.publish('AUDIT_LOG_CREATED', { ... });

// 訂閱端
this.pubSub.asyncIterator(['AUDIT_LOG_CREATED']);

// ✅ 3. 確認有觸發發布
async create(data: any) {
  const log = await this.prisma.auditLog.create({ data });
  console.log('[PubSub] Publishing event:', log);
  this.pubSubService.emitAuditLogCreated(log);
  return log;
}
```

### 3. "Unauthorized" 錯誤

```typescript
// 問題: Context 中找不到 user
filter: (payload, variables, context) => {
  // WebSocket 的 user 在 extra 中
  const user = context?.extra?.user || context?.req?.user;

  if (!user) {
    console.error('[Subscription] No user in context:', {
      hasExtra: !!context?.extra,
      hasReq: !!context?.req,
    });
  }

  return !!user;
};
```

### 4. 記憶體洩漏

**症狀**: 長時間運行後記憶體持續增長

**解決方案**:

```typescript
// 1. 使用 Redis PubSub（生產環境必須）
const pubSub = new RedisPubSub({ ... });

// 2. 限制訂閱生命週期
useEffect(() => {
  const subscription = client.subscribe({ ... });

  return () => {
    // 組件卸載時取消訂閱
    subscription.unsubscribe();
  };
}, []);

// 3. 清理過期連接
subscriptions: {
  'graphql-ws': {
    onDisconnect: (context) => {
      // 清理用戶的訂閱資料
      cleanupUserSubscriptions(context.extra?.user?.id);
    },
  },
}
```

---

## 📚 參考資源

### 官方文檔

- [GraphQL Subscriptions 官方文檔](https://www.apollographql.com/docs/apollo-server/data/subscriptions/)
- [graphql-ws GitHub](https://github.com/enisdenjo/graphql-ws)
- [NestJS Subscriptions](https://docs.nestjs.com/graphql/subscriptions)
- [Apollo Client Subscriptions](https://www.apollographql.com/docs/react/data/subscriptions/)

### 進階主題

- [Redis PubSub](https://github.com/davidyaha/graphql-redis-subscriptions)
- [Subscription Batching](https://www.apollographql.com/docs/apollo-server/performance/subscriptions/)
- [WebSocket Security](https://owasp.org/www-community/attacks/WebSocket_security)

### 相關文檔

- [FIELD_AUTHORIZATION.md](../authentication/FIELD_AUTHORIZATION.md) - 字段級權限控制
- [Token 配置](../authentication/TOKEN-CONFIGURATION.md) - JWT 認證機制
- [權限系統](../authentication/PERMISSION_SYSTEM.md) - RBAC 權限系統

---

## 🎯 下一步

### 立即可做

1. ✅ 使用現有的審計日誌訂閱
2. ✅ 基於審計日誌範例擴展到其他功能
3. ✅ 測試 WebSocket 連接穩定性

### 短期規劃（1-2 週）

- [ ] 實現通知系統的實時訂閱
- [ ] 添加連接數監控
- [ ] 實施 Rate Limiting

### 中期規劃（1-2 月）

- [ ] 遷移到 Redis PubSub
- [ ] 實現 Subscription batching
- [ ] 添加完整的監控儀表板

### 長期規劃（3+ 月）

- [ ] 實現聊天/協作功能
- [ ] 添加 Subscription 錯誤重試機制
- [ ] 優化大規模訂閱效能
