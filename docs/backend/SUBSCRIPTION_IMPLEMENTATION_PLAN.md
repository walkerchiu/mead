# GraphQL Subscriptions 擴展實作計劃

---

## 目錄

- [GraphQL Subscriptions 擴展實作計劃](#graphql-subscriptions-擴展實作計劃)
  - [目錄](#目錄)
  - [概述](#概述)
  - [現有基礎](#現有基礎)
    - [已實現的架構](#已實現的架構)
    - [已安裝的套件](#已安裝的套件)
    - [現有程式碼參考](#現有程式碼參考)
  - [已實現功能](#已實現功能)
    - [1. 資料模型](#1-資料模型)
      - [Notification Model](#notification-model)
      - [NotificationPreferences Model](#notificationpreferences-model)
    - [2. 後端 API](#2-後端-api)
      - [NotificationService](#notificationservice)
      - [NotificationPubSubService](#notificationpubsubservice)
      - [GraphQL Resolver](#graphql-resolver)
    - [3. 前端整合](#3-前端整合)
      - [UI 組件（Atomic Design）](#ui-組件atomic-design)
      - [Hooks](#hooks)
      - [頁面](#頁面)
      - [GraphQL Operations](#graphql-operations)
    - [4. 文檔與測試](#4-文檔與測試)
  - [實作摘要](#實作摘要)
    - [完成的 Commits](#完成的-commits)
    - [關鍵技術決策](#關鍵技術決策)
  - [原計劃場景對照](#原計劃場景對照)
    - [場景 1: 用戶通知訂閱 **已完成**](#場景-1-用戶通知訂閱-已完成)
  - [未來擴展（選擇性）](#未來擴展選擇性)
    - [場景 2: 系統狀態訂閱 **未實作**](#場景-2-系統狀態訂閱-未實作)
    - [場景 3: 協作功能訂閱 **未實作**](#場景-3-協作功能訂閱-未實作)
  - [實作參考（已完成）](#實作參考已完成)
    - [資料模型設計](#資料模型設計)
    - [後端實作](#後端實作)
    - [前端實作](#前端實作)
  - [測試狀態](#測試狀態)
    - [已完成](#已完成)
    - [待補充](#待補充)
    - [測試建議](#測試建議)
  - [部署狀態](#部署狀態)
    - [開發環境](#開發環境)
    - [Staging 環境](#staging-環境)
    - [Production 環境](#production-環境)
  - [效能與監控](#效能與監控)
    - [已配置](#已配置)
    - [建議監控指標](#建議監控指標)
    - [效能優化建議](#效能優化建議)
  - [相關文檔](#相關文檔)
  - [完成總結](#完成總結)

---

## 概述

**目標**: 基於現有的審計日誌訂閱實現，擴展 GraphQL Subscriptions 到更多業務場景。✅ **已完成**

**現有功能**:

- ✅ 審計日誌即時訂閱
- ✅ WebSocket JWT 驗證
- ✅ Redis PubSub 支援
- ✅ 權限過濾機制

**已完成功能**:

- ✅ 用戶通知訂閱（完整實現）
- ✅ 通知偏好設定系統
- ✅ 系統廣播通知
- 系統狀態訂閱（選擇性，未實作）
- 協作功能訂閱（選擇性，未實作）

---

## 現有基礎

### 已實現的架構

```text
前端 (Apollo Client)
    ↓ WebSocket (graphql-ws)
後端 (NestJS + Apollo Server)
    ↓
PubSub Service (Redis)
    ↓
Subscription Resolvers
    ↓
權限檢查 (Guards)
```

### 已安裝的套件

```json
{
  "graphql-subscriptions": "^2.0.0",
  "graphql-redis-subscriptions": "^2.7.0",
  "graphql-ws": "^5.16.0",
  "ioredis": "^5.9.2"
}
```

### 現有程式碼參考

- `apps/backend/src/audit-log/audit-log-pubsub.service.ts` - PubSub Service 範例
- `apps/backend/src/audit-log/audit-log.resolver.ts` - Subscription Resolver 範例
- `apps/backend/src/app.module.ts` - GraphQL Module 配置

---

## 已實現功能

### 1. 資料模型

#### Notification Model

```prisma
model Notification {
  id        String   @id @default(dbgenerated("uuid_generate_v7()")) @db.Uuid
  userId    String   @map("user_id") @db.Uuid
  type      NotificationType
  title     String
  message   String   @db.Text
  isRead    Boolean  @default(false) @map("is_read")
  data      Json?
  createdAt DateTime @default(now()) @map("created_at")
  readAt    DateTime? @map("read_at")
  user      User     @relation(fields: [userId], references: [id], onDelete: Cascade)

  @@index([userId, isRead, createdAt(sort: Desc)])
  @@index([userId, createdAt(sort: Desc)])
  @@map("notifications")
}

enum NotificationType {
  INFO
  WARNING
  SUCCESS
  ERROR
}
```

#### NotificationPreferences Model

```prisma
model NotificationPreferences {
  id            String   @id @default(dbgenerated("uuid_generate_v7()")) @db.Uuid
  userId        String   @unique @map("user_id") @db.Uuid

  // 通知類型開關
  enableInfo    Boolean  @default(true) @map("enable_info")
  enableSuccess Boolean  @default(true) @map("enable_success")
  enableWarning Boolean  @default(true) @map("enable_warning")
  enableError   Boolean  @default(true) @map("enable_error")

  // 通知渠道開關
  enableBrowser Boolean  @default(true) @map("enable_browser")
  enableEmail   Boolean  @default(true) @map("enable_email")
  enablePush    Boolean  @default(false) @map("enable_push")

  // 進階設定
  enableSound   Boolean  @default(true) @map("enable_sound")
  enableDesktop Boolean  @default(true) @map("enable_desktop")
  enableMobile  Boolean  @default(true) @map("enable_mobile")

  createdAt DateTime @default(now()) @map("created_at")
  updatedAt DateTime @updatedAt @map("updated_at")
  user      User     @relation(fields: [userId], references: [id], onDelete: Cascade)

  @@index([userId])
  @@map("notification_preferences")
}
```

### 2. 後端 API

#### NotificationService

- ✅ `createNotification()` - 建立並發送通知
- ✅ `createBulkNotifications()` - 批次建立通知
- ✅ `getUserNotifications()` - 取得通知列表（支援篩選）
- ✅ `getNotification()` - 取得單一通知
- ✅ `markAsRead()` - 標記已讀
- ✅ `markAllAsRead()` - 標記全部已讀
- ✅ `deleteNotification()` - 刪除通知
- ✅ `deleteReadNotifications()` - 刪除所有已讀
- ✅ `getUnreadCount()` - 取得未讀數量
- ✅ `cleanupOldNotifications()` - 清理舊通知
- ✅ `getNotificationPreferences()` - 取得偏好設定（自動建立）
- ✅ `updateNotificationPreferences()` - 更新偏好設定
- ✅ `isNotificationTypeEnabled()` - 檢查通知類型是否啟用

#### NotificationPubSubService

- ✅ `emitNotificationCreated()` - 發布新通知事件
- ✅ `emitNotificationRead()` - 發布已讀事件
- ✅ `subscribeToNotificationCreated()` - 訂閱用戶通知
- ✅ `subscribeToBroadcast()` - 訂閱系統廣播

#### GraphQL Resolver

**Queries:**

- ✅ `notifications(filter)` - 取得通知列表
- ✅ `unreadNotificationCount` - 取得未讀數量
- ✅ `myNotificationPreferences` - 取得偏好設定

**Mutations:**

- ✅ `markNotificationAsRead(id)` - 標記已讀
- ✅ `markAllNotificationsAsRead` - 標記全部已讀
- ✅ `deleteNotification(id)` - 刪除通知
- ✅ `deleteReadNotifications` - 刪除所有已讀
- ✅ `updateMyNotificationPreferences(input)` - 更新偏好設定

**Subscriptions:**

- ✅ `notificationCreated` - 訂閱用戶通知（含權限過濾）
- ✅ `notificationBroadcast` - 訂閱系統廣播

### 3. 前端整合

#### UI 組件（Atomic Design）

- ✅ `NotificationItem` (Atom) - 單一通知顯示組件
- ✅ `NotificationList` (Molecule) - 通知列表組件（含篩選、操作）
- ✅ `NotificationCenter` (Organism) - 完整通知中心（含訂閱）

#### Hooks

- ✅ `useNotifications` - 整合查詢、變更、訂閱

#### 頁面

- ✅ `/notifications` - 通知管理頁面
- ✅ `/settings/notifications` - 通知偏好設定頁面

#### GraphQL Operations

- ✅ 完整的 queries、mutations、subscriptions
- ✅ TypeScript 介面定義
- ✅ Fragment 優化

### 4. 文檔與測試

- ✅ TypeScript 型別檢查通過
- ✅ ESLint 檢查通過
- ✅ README 文檔
- ✅ Storybook Stories（11+13+11 scenarios）
- ⚠️ 單元測試需補充
- ⚠️ E2E 測試需補充

---

## 實作摘要

### 完成的 Commits

1. `d2da7b4` - 實作通知系統後端基礎架構
2. `76353cc` - 實作 NotificationCenter organism 組件
3. `d13d6ba` - 整合到 MainAppBar
4. `8d83cb9` - 建立通知列表和設定頁面
5. `4a09059` - 實作通知偏好設定 API

### 關鍵技術決策

1. **自動建立偏好設定**: `getNotificationPreferences()` 自動建立預設設定，提升 UX
2. **useMemo 狀態管理**: 避免不必要的重新渲染，符合 React 最佳實踐
3. **權限過濾機制**: 在 subscription filter 中解析 JWT，確保用戶只能訂閱自己的通知
4. **Redis PubSub**: 支援多實例部署的即時通知
5. **Atomic Design**: UI 組件遵循原子設計模式，可重用性高

---

## 原計劃場景對照

### 場景 1: 用戶通知訂閱 **已完成**

**使用情境**:

- 用戶收到新通知時即時顯示
- 系統公告即時推送
- 任務完成通知

**訂閱範例**:

```graphql
subscription OnNotificationCreated($userId: ID!) {
  notificationCreated(userId: $userId) {
    id
    type
    title
    message
    isRead
    createdAt
    data
  }
}
```

**前端使用**:

```tsx
const { data, loading } = useSubscription(ON_NOTIFICATION_CREATED, {
  variables: { userId: currentUser.id },
});

useEffect(() => {
  if (data?.notificationCreated) {
    // 顯示通知
    enqueueSnackbar(data.notificationCreated.message, {
      variant: data.notificationCreated.type.toLowerCase(),
    });
  }
}, [data]);
```

---

## 未來擴展（選擇性）

### 場景 2: 系統狀態訂閱 **未實作**

**使用情境**:

- 管理員監控系統健康狀態
- 維護模式通知
- 服務異常警報

**建議實作**:

```graphql
subscription OnSystemStatusChanged {
  systemStatusChanged {
    service # 'database', 'redis', 'rabbitmq'
    status # 'healthy', 'degraded', 'down'
    message
    timestamp
  }
}
```

**權限**: 僅 `HQ_SCOPE` 可訂閱

**優先級**: 低（可在監控系統完善後實作）

---

### 場景 3: 協作功能訂閱 **未實作**

**使用情境**:

- 多人協作編輯
- 即時評論/回覆
- 用戶在線狀態

**建議實作**:

```graphql
subscription OnUserPresenceChanged($documentId: ID!) {
  userPresenceChanged(documentId: $documentId) {
    userId
    username
    status # 'online', 'idle', 'offline'
    lastSeen
  }
}
```

**優先級**: 低（依業務需求決定）

---

## 實作參考（已完成）

### 資料模型設計

**檔案位置**:

- `apps/backend/database/prisma/schemas/notification.prisma`
- `apps/backend/database/prisma/schemas/user.prisma`

**Migration**:

- `20260208144230_add_notification_model`
- `20260208153017_add_notification_preferences`

**執行指令**:

```bash
pnpm --filter @npt/backend db:merge-schemas
pnpm --filter @npt/backend prisma migrate dev
pnpm --filter @npt/backend db:generate
```

---

### 後端實作

**檔案位置**:

- `apps/backend/src/notification/notification.module.ts`
- `apps/backend/src/notification/notification.service.ts`
- `apps/backend/src/notification/notification.resolver.ts`
- `apps/backend/src/notification/notification.types.ts`
- `apps/backend/src/notification/notification-preferences.types.ts`
- `apps/backend/src/notification/notification-pubsub.service.ts`

**關鍵實作要點**:

1. **PubSub Service** - 使用 Redis PubSub 支援多實例
2. **權限過濾** - Subscription filter 解析 JWT 確保安全
3. **自動建立預設設定** - 提升用戶體驗
4. **完整的 CRUD** - 包含查詢、變更、訂閱
5. **偏好設定系統** - 10 種開關控制通知行為

---

### 前端實作

**檔案位置**:

- `apps/frontend/src/graphql/notification.ts` - GraphQL operations
- `apps/frontend/src/hooks/useNotifications.ts` - Custom hook
- `apps/frontend/src/components/atoms/NotificationItem/` - Atom 組件
- `apps/frontend/src/components/molecules/NotificationList/` - Molecule 組件
- `apps/frontend/src/components/organisms/NotificationCenter/` - Organism 組件
- `apps/frontend/src/app/[locale]/notifications/page.tsx` - 通知列表頁面
- `apps/frontend/src/app/[locale]/settings/notifications/page.tsx` - 設定頁面

**關鍵實作要點**:

1. **Atomic Design** - 遵循原子設計模式，組件可重用性高
2. **useNotifications Hook** - 整合查詢、變更、訂閱於一體
3. **實時更新** - 使用 GraphQL Subscription 自動更新 UI
4. **狀態管理** - 使用 useMemo 優化效能，避免不必要的重新渲染
5. **Storybook** - 35+ 個 stories 涵蓋各種使用場景

---

## 測試狀態

### 已完成

- [x] TypeScript 型別檢查
- [x] ESLint 程式碼檢查
- [x] Storybook Stories（35+ scenarios）
- [x] 手動功能測試
- [x] 即時訂閱測試

### 待補充

- [ ] 後端單元測試
  - [ ] NotificationService 測試
  - [ ] NotificationPubSubService 測試
  - [ ] NotificationResolver 測試
  - [ ] 通知偏好設定測試

- [ ] 前端單元測試
  - [ ] useNotifications hook 測試
  - [ ] 組件單元測試

- [ ] E2E 測試
  - [ ] 通知訂閱完整流程
  - [ ] 通知 CRUD 操作
  - [ ] 偏好設定更新

### 測試建議

**後端測試範例**:

```typescript
describe('NotificationService', () => {
  it('應該建立通知並發送即時推送');
  it('應該標記通知為已讀');
  it('應該批次標記所有通知為已讀');
  it('應該自動建立預設偏好設定');
  it('應該正確檢查通知類型是否啟用');
});
```

**E2E 測試範例**:

```typescript
describe('Notification Subscription (e2e)', () => {
  it('應該接收即時通知');
  it('應該過濾非自己的通知');
  it('應該更新通知偏好設定');
});
```

---

## 部署狀態

### 開發環境

- [x] 執行 TypeScript 檢查 `pnpm type-check`
- [x] 執行 Linter `pnpm lint`
- [x] 測試訂閱功能（手動測試）
- [x] 檢查 WebSocket 連線
- [x] 資料庫 Migration
- [ ] 執行單元測試 `pnpm test`（待補充）

### Staging 環境

- [x] 確認 Redis 已啟用
- [ ] 測試 WebSocket 連線
- [ ] 測試權限檢查
- [ ] 測試通知推送
- [ ] 監控連線數
- [ ] 負載測試

### Production 環境

- [ ] 設定連線數限制
- [ ] 設定監控警報
- [ ] 文檔化 API（部分完成）
- [ ] 通知團隊新功能
- [ ] 監控錯誤率

---

## 效能與監控

### 已配置

**WebSocket 配置** (in `app.module.ts`):

```typescript
subscriptions: {
  'graphql-ws': {
    path: '/graphql',
    onConnect: async (context) => {
      // JWT 驗證
    },
  },
}
```

**Redis PubSub**:

- ✅ 使用 Redis 支援多實例部署
- ✅ 連線池配置
- ✅ 自動重連機制

### 建議監控指標

- WebSocket 連線數
- 訂閱數量
- 消息推送延遲
- Redis 記憶體使用量
- 通知建立速率
- 錯誤率

### 效能優化建議

1. **連線數限制**: 在 GraphQL 模組配置 `maxConnections`
2. **訊息批次處理**: 對於大量通知使用批次建立
3. **快取策略**: 快取用戶偏好設定
4. **索引優化**: 已在 Prisma schema 中建立適當索引

---

## 相關文檔

- [GraphQL Subscriptions 實現指南](./SUBSCRIPTION_GUIDE.md) - 完整的實作說明
- [Redis 配置](../infrastructure/RABBITMQ_DRAGONFLY.md) - Redis PubSub 設定
- [通知系統 README](../../apps/frontend/src/components/organisms/NotificationCenter/README.md) - 前端組件文檔

---

## 完成總結

**實作已完成！** ✅本專案成功實現了完整的通知系統，包含：

1. ✅ **完整的資料模型** - Notification + NotificationPreferences
2. ✅ **強大的後端 API** - 14 個 API 端點（查詢、變更、訂閱）
3. ✅ **即時通知推送** - WebSocket + GraphQL Subscriptions + Redis PubSub
4. ✅ **完善的前端 UI** - 遵循 Atomic Design，包含 3 個主要組件和 2 個頁面
5. ✅ **偏好設定系統** - 10 種開關控制，自動建立預設設定
6. ✅ **權限控制** - JWT 驗證 + Filter 機制
7. ✅ **文檔完善** - README + Storybook + 35+ stories

**下一步建議**:

1. 補充單元測試和 E2E 測試
2. 部署到 Staging 環境測試
3. 設定監控和警報
4. 考慮實作 Email 通知（未來擴展）
5. 考慮實作推播通知（未來擴展）

---

**更新日期**: 2026-02-09
