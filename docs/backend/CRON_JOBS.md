# 排程任務系統 (Cron Jobs System)

自動化維護和清理任務，使用分散式鎖確保多實例環境安全執行。

---

## 目錄

- [排程任務系統 (Cron Jobs System)](#排程任務系統-cron-jobs-system)
  - [目錄](#目錄)
  - [概述](#概述)
    - [核心特性](#核心特性)
    - [技術架構](#技術架構)
  - [系統配置](#系統配置)
    - [安裝依賴](#安裝依賴)
    - [啟用排程模組](#啟用排程模組)
  - [現有排程任務](#現有排程任務)
    - [1. 過期會話清理 (Expired Sessions Cleanup)](#1-過期會話清理-expired-sessions-cleanup)
      - [功能說明](#功能說明)
      - [效能優化](#效能優化)
      - [執行時間表](#執行時間表)
      - [日誌範例](#日誌範例)
    - [2. 審計日誌歸檔 (Audit Log Archiving)](#2-審計日誌歸檔-audit-log-archiving)
      - [功能說明](#功能說明-1)
      - [執行時間表](#執行時間表-1)
      - [日誌範例](#日誌範例-1)
    - [3. 通知清理 (Notification Cleanup)](#3-通知清理-notification-cleanup)
      - [功能說明](#功能說明-2)
      - [執行時間表](#執行時間表-2)
      - [日誌範例](#日誌範例-2)
  - [分散式鎖機制](#分散式鎖機制)
    - [DistributedLockService](#distributedlockservice)
    - [Redis 實作細節](#redis-實作細節)
    - [使用範例](#使用範例)
  - [測試與驗證](#測試與驗證)
    - [測試腳本](#測試腳本)
      - [1. 測試過期會話清理](#1-測試過期會話清理)
      - [2. 測試審計日誌歸檔](#2-測試審計日誌歸檔)
      - [3. 測試通知清理](#3-測試通知清理)
    - [啟用實際執行](#啟用實際執行)
  - [監控與維護](#監控與維護)
    - [查看執行狀態](#查看執行狀態)
    - [健康檢查指標](#健康檢查指標)
    - [Redis 鎖監控](#redis-鎖監控)
  - [開發指南](#開發指南)
    - [創建新的 Cron Job](#創建新的-cron-job)
    - [Cron 表達式格式](#cron-表達式格式)
    - [預定義表達式](#預定義表達式)
  - [注意事項](#注意事項)
    - [1. 分散式環境](#1-分散式環境)
    - [2. 長時間運行任務](#2-長時間運行任務)
    - [3. 錯誤處理](#3-錯誤處理)
    - [4. 資料庫連線](#4-資料庫連線)
  - [相關文檔](#相關文檔)

---

## 概述

MEAD 專案使用 `@nestjs/schedule` 模組實作排程任務系統，用於自動化維護、清理和監控工作。

### 核心特性

- ✅ **分散式鎖保護**：使用 Redis 確保多實例環境下只有一個實例執行
- ✅ **自動過期機制**：鎖自動過期防止死鎖
- ✅ **批次處理**：大量數據分批處理，避免記憶體溢出
- ✅ **錯誤隔離**：單個批次失敗不影響其他批次
- ✅ **完整日誌**：詳細記錄每次執行的結果和效能
- ✅ **測試腳本**：提供模擬模式驗證邏輯

### 技術架構

**核心技術**：

- **NestJS Schedule**: 排程任務管理
- **Redis/Dragonfly**: 分散式鎖
- **Prisma**: 資料庫操作
- **Lua Script**: 原子性鎖釋放

**執行流程**：

```text
Cron Trigger
  → DistributedLockService (嘗試獲取鎖)
    → Success: 執行任務 → 釋放鎖
    → Failure: 跳過執行，等待下次調度
```

---

## 系統配置

### 安裝依賴

```bash
pnpm add @nestjs/schedule
```

### 啟用排程模組

在 `app.module.ts` 中導入 `ScheduleModule`：

```typescript
import { ScheduleModule } from '@nestjs/schedule';

@Module({
  imports: [
    ScheduleModule.forRoot(),
    // ... 其他模組
  ],
})
export class AppModule {}
```

---

## 現有排程任務

### 1. 過期會話清理 (Expired Sessions Cleanup)

**服務**：`SessionManagementService`
**方法**：`handleExpiredSessionsCleanup()`
**執行頻率**：每 6 小時
**Cron 表達式**：`0 */6 * * *`
**時區**：Asia/Taipei
**分散式鎖 TTL**：600 秒（10 分鐘）

#### 功能說明

根據 `SESSION_TERMINOLOGY.md` 規範，定期掃描並標記所有過期會話：

1. **掃描過期會話**
   - 查詢所有 `expiresAt < now` 且 `revokedAt = null` 的會話
   - 批量處理，每次最多處理 1000 個會話

2. **標記會話**
   - 設置 `revokedAt = now`
   - 設置 `revokedMethod = AUTO_EXPIRE`
   - 設置 `revokedReason = "Session expired automatically"`

3. **記錄審計日誌**
   - 為每個過期會話創建 `SESSION_EXPIRED` 審計日誌
   - 記錄設備資訊、IP 地址等詳細信息

#### 效能優化

- **批量處理**：每批處理 100 個會話
- **事務管理**：使用 Prisma transaction 確保數據一致性
- **超時設置**：
  - `maxWait`: 5 秒（獲取鎖的最大等待時間）
  - `timeout`: 30 秒（事務執行超時）
- **錯誤處理**：單個批次失敗不影響其他批次

#### 執行時間表

```text
00:00 (午夜 12 點)
06:00 (早上 6 點)
12:00 (中午 12 點)
18:00 (晚上 6 點)
```

#### 日誌範例

**成功執行**：

```text
[DistributedLock] Lock acquired { lockKey: 'cron:cleanup-expired-sessions', lockId: '...', ttl: 600 }
[Cron] Starting expired sessions cleanup job { timestamp: '2026-02-18T00:00:00.000Z' }
[Cron] Found expired sessions to process { count: 127 }
[Cron] Processed batch successfully { batchStart: 0, batchSize: 100 }
[Cron] Processed batch successfully { batchStart: 100, batchSize: 27 }
[Cron] Expired sessions cleanup job completed {
  totalProcessed: 127,
  successCount: 127,
  errorCount: 0,
  durationMs: 3421,
  timestamp: '2026-02-18T00:00:03.421Z'
}
[DistributedLock] Lock released { lockKey: 'cron:cleanup-expired-sessions', lockId: '...' }
```

**無法獲取鎖（其他實例正在執行）**：

```text
[DistributedLock] Failed to acquire lock after retries { lockKey: 'cron:cleanup-expired-sessions' }
[DistributedLock] Cannot acquire lock, skipping task { lockKey: 'cron:cleanup-expired-sessions' }
```

**失敗處理**：

```text
[Cron] Failed to process batch {
  batchStart: 100,
  batchSize: 100,
  error: 'Database connection timeout'
}
[Cron] Expired sessions cleanup job completed {
  totalProcessed: 200,
  successCount: 100,
  errorCount: 100,
  durationMs: 35000
}
```

---

### 2. 審計日誌歸檔 (Audit Log Archiving)

**服務**：`AuditLogService`
**方法**：`handleAuditLogArchiving()`
**執行頻率**：每週日凌晨 12:00
**Cron 表達式**：`0 0 * * 0`
**時區**：Asia/Taipei
**分散式鎖 TTL**：1800 秒（30 分鐘）
**保留期限**：180 天（6 個月）

#### 功能說明

定期清理舊的審計日誌記錄，以維持資料庫效能和儲存空間：

1. **掃描舊記錄**
   - 查詢所有 `timestamp < (now - 180 days)` 的審計日誌
   - 180 天（6 個月）保留期限

2. **批量刪除**
   - 使用 `deleteMany` 批量刪除過期記錄
   - 記錄刪除數量

3. **快取清理**
   - 清除相關審計日誌快取
   - 等待 TTL 自動過期

#### 執行時間表

```text
每週日 00:00 (午夜 12 點)
```

#### 日誌範例

**成功執行**：

```text
[DistributedLock] Lock acquired { lockKey: 'cron:cleanup-audit-logs', lockId: '...', ttl: 1800 }
[AuditLog Cron] Starting scheduled audit log archiving
[AuditLog] 清理完成，刪除 3,542 筆超過 180 天的記錄
[AuditLog Cron] Audit log archiving completed successfully {
  deletedCount: 3542,
  retentionDays: 180,
  nextRun: 'Next Sunday 00:00'
}
[DistributedLock] Lock released { lockKey: 'cron:cleanup-audit-logs', lockId: '...' }
```

**失敗處理**：

```text
[AuditLog Cron] Audit log archiving failed {
  error: 'Query timeout',
  stack: '...'
}
```

---

### 3. 通知清理 (Notification Cleanup)

**服務**：`NotificationService`
**方法**：`handleNotificationCleanup()`
**執行頻率**：每天凌晨 02:00
**Cron 表達式**：`0 2 * * *`
**時區**：Asia/Taipei
**分散式鎖 TTL**：600 秒（10 分鐘）
**保留期限**：30 天（已讀通知）

#### 功能說明

定期清理已讀且過期的舊通知，保持資料庫整潔：

1. **掃描舊通知**
   - 查詢所有 `isRead = true` 且 `readAt < (now - 30 days)` 的通知
   - 30 天保留期限（僅針對已讀通知）

2. **批量刪除**
   - 使用 `deleteMany` 批量刪除過期通知
   - 記錄刪除數量

3. **快取清理**
   - 不需要手動清理快取（用戶特定）
   - 已讀通知不影響未讀計數

#### 執行時間表

```text
每天 02:00 (凌晨 2 點)
```

#### 日誌範例

**成功執行**：

```text
[DistributedLock] Lock acquired { lockKey: 'cron:cleanup-old-notifications', lockId: '...', ttl: 600 }
[Notification Cron] Starting scheduled notification cleanup
[NotificationService] Cleaning up old notifications { daysOld: 30 }
[NotificationService] Old notifications cleaned up { count: 1,247, cutoffDate: '...' }
[Notification Cron] Notification cleanup completed successfully {
  deletedCount: 1247,
  retentionDays: 30,
  nextRun: 'Tomorrow 02:00'
}
[DistributedLock] Lock released { lockKey: 'cron:cleanup-old-notifications', lockId: '...' }
```

**失敗處理**：

```text
[Notification Cron] Notification cleanup failed {
  error: 'Database connection failed',
  stack: '...'
}
```

---

## 分散式鎖機制

### DistributedLockService

**位置**：`src/cache/distributed-lock.service.ts`

提供 Redis 基礎的分散式鎖功能，防止多實例環境下的重複執行。

**主要方法**：

| 方法                | 說明                   | 參數                                 | 返回值          |
| ------------------- | ---------------------- | ------------------------------------ | --------------- |
| `acquireLock()`     | 獲取分散式鎖           | lockKey, ttl, retryTimes, retryDelay | lockId 或 null  |
| `releaseLock()`     | 釋放分散式鎖           | lockKey, lockId                      | boolean         |
| `executeWithLock()` | 自動處理鎖的獲取和釋放 | lockKey, task, ttl, retryTimes       | 任務結果或 null |
| `isLocked()`        | 檢查鎖是否存在         | lockKey                              | boolean         |
| `getLockTTL()`      | 獲取鎖剩餘時間         | lockKey                              | number (秒)     |

**鎖的特點**：

- ✅ **自動過期**：設置 TTL 防止死鎖
- ✅ **唯一持有者**：只有鎖的持有者可以釋放鎖
- ✅ **原子操作**：使用 Lua 腳本確保原子性
- ✅ **失敗跳過**：無法獲取鎖時跳過執行，等待下次調度

### Redis 實作細節

**獲取鎖**：

```bash
SET lock:<key> <unique-lock-id> NX EX <ttl>
```

- `NX`：只有當 key 不存在時才設置
- `EX`：設置過期時間（秒）

**釋放鎖（Lua 腳本）**：

```lua
if redis.call("get", KEYS[1]) == ARGV[1] then
  return redis.call("del", KEYS[1])
else
  return 0
end
```

確保只有鎖的持有者才能釋放鎖，防止誤刪其他實例的鎖。

### 使用範例

**方式一：自動處理鎖（推薦）**：

```typescript
@Cron('0 */6 * * *', {
  name: 'cleanup-expired-sessions',
  timeZone: 'Asia/Taipei',
})
async handleExpiredSessionsCleanup(): Promise<void> {
  // 使用分散式鎖執行任務
  await this.distributedLockService.executeWithLock(
    'cron:cleanup-expired-sessions',
    async () => {
      // 執行任務邏輯
      await this.performCleanup();
    },
    600, // TTL: 10 分鐘
  );
}
```

**方式二：手動處理鎖**：

```typescript
async handleManualLock(): Promise<void> {
  const lockId = await this.distributedLockService.acquireLock(
    'my-task-lock',
    300, // TTL: 5 分鐘
  );

  if (!lockId) {
    logger.warn('Cannot acquire lock, skipping task');
    return;
  }

  try {
    // 執行任務
    await this.performTask();
  } finally {
    // 確保釋放鎖
    await this.distributedLockService.releaseLock('my-task-lock', lockId);
  }
}
```

---

## 測試與驗證

### 測試腳本

系統提供三個測試腳本，分別用於測試三個 Cron Jobs：

#### 1. 測試過期會話清理

```bash
cd apps/backend
npx ts-node src/scripts/test-expired-sessions-cleanup.ts
```

**功能**：

- 連接到資料庫
- 查詢過期會話
- 顯示前 5 個過期會話的詳情
- **不會實際執行清理**（預設為模擬模式）

#### 2. 測試審計日誌歸檔

```bash
cd apps/backend
npx ts-node src/scripts/test-audit-log-archiving.ts
```

**功能**：

- 查詢超過 180 天的舊審計日誌
- 顯示前 10 筆範例
- 統計總數
- **不會實際執行刪除**（預設為模擬模式）

#### 3. 測試通知清理

```bash
cd apps/backend
npx ts-node src/scripts/test-notification-cleanup.ts
```

**功能**：

- 查詢已讀且超過 30 天的舊通知
- 顯示前 10 筆範例
- 按類型統計數量
- **不會實際執行刪除**（預設為模擬模式）

### 啟用實際執行

所有測試腳本預設為**模擬模式**，不會實際修改資料庫。如需實際執行：

1. 編輯對應的測試腳本
2. 找到「實際執行」區塊的註解
3. 取消該區塊的註解

範例（`test-expired-sessions-cleanup.ts`）：

```typescript
// 4. 實際執行（取消下面的註解來真正執行）
/*
let successCount = 0;
const batchSize = 100;

for (let i = 0; i < expiredSessions.length; i += batchSize) {
  // ... 取消這整個區塊的註解
}
*/
```

**⚠️ 警告**：實際執行會永久修改或刪除資料，請謹慎使用！

---

## 監控與維護

### 查看執行狀態

NestJS Schedule 會自動註冊所有 Cron Jobs。可以通過日誌查看執行狀態：

```bash
# 過濾 Cron 相關日誌
grep -i cron logs/application.log

# 查看最近的 Cron 執行
tail -f logs/application.log | grep -i cron

# 查看分散式鎖日誌
tail -f logs/application.log | grep -i "DistributedLock"
```

### 健康檢查指標

建議在監控系統中添加以下指標：

1. **執行頻率**：Cron Job 是否按時執行
2. **成功率**：`successCount / totalProcessed`
3. **執行時間**：`durationMs` 是否在合理範圍內
4. **錯誤計數**：`errorCount` 是否為 0
5. **鎖獲取成功率**：是否頻繁無法獲取鎖

### Redis 鎖監控

**查看所有鎖**：

```bash
redis-cli keys "lock:*"
```

**查看特定鎖的 TTL**：

```bash
redis-cli ttl "lock:cron:cleanup-expired-sessions"
```

**查看鎖的持有者**：

```bash
redis-cli get "lock:cron:cleanup-expired-sessions"
```

**手動釋放鎖（緊急情況）**：

```bash
# ⚠️ 警告：只在確認任務已停止時使用
redis-cli del "lock:cron:cleanup-expired-sessions"
```

---

## 前端監控頁面

系統提供完整的圖形化監控介面，方便管理員即時監控和管理所有 Cron Jobs。

### 訪問路徑

```text
/hq/cron-jobs
```

**權限要求**：需要 `HQ_SCOPE` 權限

### 頁面功能

#### 1. 統計卡片 (Statistics Cards)

即時顯示所有 Cron Jobs 的執行統計：

- **總執行次數** (Total Executions)
- **成功執行次數** (Successful Executions)
- **失敗執行次數** (Failed Executions)
- **超時執行次數** (Timeout Executions)
- **跳過執行次數** (Skipped Executions)
- **成功率** (Success Rate)
- **平均執行時間** (Average Duration)
- **總處理數量** (Total Processed)
- **總錯誤數量** (Total Errors)

**數據來源**：GraphQL Query `cronJobStatistics`

#### 2. Job 配置列表 (Job Configuration List)

顯示所有註冊的 Cron Jobs 及其配置資訊：

**欄位**：

- Job 名稱 (Display Name)
- Job 類型 (Job Type)
- 類別 (Category)
- Cron 表達式 (Cron Expression)
- 時區 (Time Zone)
- 啟用狀態 (Enabled/Disabled) - 可切換
- 最後執行時間 (Last Executed At)
- 最後執行狀態 (Last Status)
- 最後執行時長 (Last Duration)
- 下次執行時間 (Next Run At)
- 連續失敗次數 (Consecutive Failures)
- 總執行/失敗次數 (Total Executions/Failures)

**操作**：

- **切換啟用狀態**：點擊開關即可啟用/停用 Job
- **手動觸發執行**：點擊「執行」按鈕立即觸發 Job
- **查看詳情**：點擊「詳情」查看完整配置

**篩選功能**：

- 按類別篩選 (Category)
- 按 Job 類型篩選 (Job Type)

#### 3. 執行歷史 (Execution History)

顯示所有 Cron Jobs 的執行記錄，支援分頁和篩選：

**欄位**：

- Job 名稱 (Job Name)
- 開始時間 (Started At)
- 結束時間 (Completed At)
- 執行時長 (Duration)
- 執行狀態 (Status)
  - ✅ SUCCESS（成功）
  - ❌ FAILED（失敗）
  - TIMEOUT（超時）
  - RUNNING（執行中）
  - ⊘ SKIPPED（跳過）
- 處理數量 (Processed Count)
- 成功數量 (Success Count)
- 錯誤數量 (Error Count)
- 實例 ID (Instance ID)

**操作**：

- **查看詳情**：點擊「詳情」查看完整執行資訊，包括錯誤堆疊和執行細節

**篩選功能**：

- 按 Job 名稱篩選
- 按執行狀態篩選 (SUCCESS/FAILED/TIMEOUT/RUNNING/SKIPPED)

**分頁功能**：

- 每頁顯示 20 筆記錄
- 支援頁碼切換
- 顯示總頁數和總記錄數

#### 4. 即時更新 (Real-time Updates)

使用 GraphQL Subscriptions 實現即時更新：

**訂閱事件**：

1. **新執行記錄** (`cronJobExecutionCreated`)
   - 當 Cron Job 執行完成時，自動更新執行歷史列表
   - 第 1 頁：新記錄自動插入到列表最上方（無感更新）
   - 其他頁：顯示通知提示有新記錄，可點擊跳回第 1 頁查看

2. **配置更新** (`cronJobConfigUpdated`)
   - 當 Job 配置被修改時，自動重新整理配置列表

**實現細節**：

```typescript
// 訂閱新執行記錄
const { newExecutionsCount, clearNewExecutionsCount } = useCronJobSubscription({
  currentPage: page,
  filters: executionFilters,
  onNewExecution: () => {
    if (page === 1) {
      // 在第 1 頁，新記錄已自動插入
      clearNewExecutionsCount();
    }
    // 在其他頁面，累計新記錄數量
  },
  onConfigUpdated: () => {
    // 配置更新時重新載入
    refetch();
  },
});
```

#### 5. 響應式設計

- 支援桌面、平板和手機瀏覽
- 使用 MUI 的 Grid 和 responsive breakpoints
- 在小螢幕上自動調整佈局

### GraphQL API

#### Queries

```graphql
# 查詢所有 Job 配置
query GetCronJobConfigs {
  cronJobConfigs {
    jobName
    displayName
    description
    jobType
    category
    cronExpression
    timeZone
    isEnabled
    alertOnFailure
    alertOnTimeout
    failureThreshold
    timeoutThresholdMs
    lastExecutedAt
    lastStatus
    lastDuration
    lastErrorMessage
    nextRunAt
    consecutiveFailures
    totalExecutions
    totalFailures
    createdAt
    updatedAt
  }
}

# 查詢執行歷史（支援分頁和篩選）
query GetCronJobExecutions(
  $jobName: String
  $jobType: String
  $status: String
  $startDate: String
  $endDate: String
  $page: Int
  $limit: Int
) {
  cronJobExecutions(
    jobName: $jobName
    jobType: $jobType
    status: $status
    startDate: $startDate
    endDate: $endDate
    page: $page
    limit: $limit
  ) {
    executions {
      id
      jobName
      jobType
      startedAt
      completedAt
      duration
      status
      processedCount
      successCount
      errorCount
      details
      errorMessage
      instanceId
    }
    total
    page
    limit
    totalPages
  }
}

# 查詢統計資料
query GetCronJobStatistics(
  $jobName: String
  $jobType: String
  $startDate: String
  $endDate: String
) {
  cronJobStatistics(
    jobName: $jobName
    jobType: $jobType
    startDate: $startDate
    endDate: $endDate
  ) {
    totalExecutions
    successfulExecutions
    failedExecutions
    timeoutExecutions
    skippedExecutions
    successRate
    averageDuration
    totalProcessed
    totalErrors
    byJobName {
      jobName
      totalExecutions
      successfulExecutions
      failedExecutions
      averageDuration
      lastExecutedAt
      lastStatus
    }
    byJobType {
      jobType
      totalExecutions
      successfulExecutions
      failedExecutions
      averageDuration
    }
    recentExecutions {
      id
      jobName
      status
      startedAt
      duration
    }
  }
}
```

#### Mutations

```graphql
# 更新 Job 配置
mutation UpdateCronJobConfig(
  $jobName: String!
  $input: UpdateCronJobConfigInput!
) {
  updateCronJobConfig(jobName: $jobName, input: $input) {
    jobName
    displayName
    description
    isEnabled
    alertOnFailure
    alertOnTimeout
    failureThreshold
    timeoutThresholdMs
  }
}

# 手動觸發 Job 執行
mutation TriggerCronJob($input: TriggerCronJobInput!) {
  triggerCronJob(input: $input) {
    success
    message
    executionId
  }
}
```

#### Subscriptions

```graphql
# 訂閱新執行記錄
subscription OnCronJobExecutionCreated {
  cronJobExecutionCreated {
    id
    jobName
    jobType
    startedAt
    completedAt
    duration
    status
    processedCount
    successCount
    errorCount
    details
    errorMessage
    instanceId
  }
}

# 訂閱配置更新
subscription OnCronJobConfigUpdated {
  cronJobConfigUpdated {
    jobName
    displayName
    description
    jobType
    category
    cronExpression
    timeZone
    isEnabled
    alertOnFailure
    alertOnTimeout
    failureThreshold
    timeoutThresholdMs
    lastExecutedAt
    lastStatus
    lastDuration
    lastErrorMessage
    nextRunAt
    consecutiveFailures
    totalExecutions
    totalFailures
    createdAt
    updatedAt
  }
}
```

### 技術實現

#### 前端架構

**頁面組件**：

- `apps/frontend/src/app/[locale]/hq/cron-jobs/page.tsx`

**Hooks**：

- `useCronJobs` - 管理 Job 配置列表
- `useCronJobExecutions` - 管理執行歷史（含分頁）
- `useCronStatistics` - 管理統計資料
- `useCronJobSubscription` - 管理即時訂閱

**UI 組件**（Organism 層）：

- `CronJobStats` - 統計卡片
- `CronJobListFilters` - Job 列表篩選器
- `CronJobTable` - Job 配置列表
- `CronJobFilters` - 執行歷史篩選器
- `CronJobExecutionHistory` - 執行歷史列表
- `CronJobExecutionDetailsModal` - 執行詳情彈窗
- `CronJobConfigDetailsModal` - 配置詳情彈窗

#### 後端實現

**Resolver**：

- `apps/backend/src/cron-monitoring/cron-job-monitor.resolver.ts`

**Service**：

- `apps/backend/src/cron-monitoring/cron-job-monitor.service.ts`

**Database Schema**：

```prisma
// Cron Job 配置
model CronJobConfig {
  jobName            String    @id
  displayName        String
  description        String?   @db.Text
  jobType            String
  category           String
  cronExpression     String
  timeZone           String    @default("Asia/Taipei")
  isEnabled          Boolean   @default(true)
  alertOnFailure     Boolean   @default(false)
  alertOnTimeout     Boolean   @default(false)
  failureThreshold   Int       @default(3)
  timeoutThresholdMs Int?
  // 執行狀態
  lastExecutedAt     DateTime?
  lastStatus         CronJobStatus?
  lastDuration       Int?
  lastErrorMessage   String?   @db.Text
  nextRunAt          DateTime?
  consecutiveFailures Int      @default(0)
  totalExecutions    Int       @default(0)
  totalFailures      Int       @default(0)
  // 時間戳記
  createdAt          DateTime  @default(now())
  updatedAt          DateTime  @updatedAt

  @@map("cron_job_configs")
}

// Cron Job 執行記錄
model CronJobExecution {
  id             String        @id @default(dbgenerated("uuid_generate_v7()")) @db.Uuid
  jobName        String
  jobType        String
  startedAt      DateTime
  completedAt    DateTime?
  duration       Int?
  status         CronJobStatus
  processedCount Int?
  successCount   Int?
  errorCount     Int?
  details        Json?
  errorMessage   String?       @db.Text
  errorStack     String?       @db.Text
  instanceId     String
  lockId         String?
  nextRunAt      DateTime?

  @@map("cron_job_executions")
}

enum CronJobStatus {
  RUNNING
  SUCCESS
  FAILED
  TIMEOUT
  SKIPPED
}
```

#### 分頁與篩選策略

**Job 配置列表**：

- 數量較少（通常 < 50 個）
- 前端篩選（`category`, `jobType`）
- 不需要分頁

**執行歷史**：

- 數量持續增長（可能數萬筆）
- 後端分頁和篩選（`jobName`, `status`, `startDate`, `endDate`）
- 每頁 20 筆記錄
- 獨立的 page state

**設計優點**：

- 兩個列表各自獨立，互不干擾
- 執行歷史的篩選和分頁不影響 Job 列表
- 性能優化：大量數據在後端處理

### 使用場景

#### 1. 日常監控

管理員可以：

- 快速查看所有 Cron Jobs 的執行狀態
- 識別失敗或超時的 Job
- 查看成功率和平均執行時間

#### 2. 問題排查

當 Job 執行失敗時：

1. 在執行歷史中找到失敗記錄
2. 點擊「詳情」查看錯誤訊息和堆疊
3. 分析錯誤原因
4. 修正問題後，手動觸發重新執行

#### 3. 配置管理

管理員可以：

- 臨時停用某個 Job（切換開關）
- 調整告警設定
- 修改失敗閾值
- 查看下次執行時間

#### 4. 性能分析

通過統計資料分析：

- 哪些 Job 執行頻率最高
- 哪些 Job 執行時間最長
- 哪些 Job 失敗率最高
- 整體系統的健康狀況

---

## 開發指南

### 創建新的 Cron Job

1. **在 Service 中添加方法**：

   ```typescript
   import { Injectable } from '@nestjs/common';
   import { Cron, CronExpression } from '@nestjs/schedule';
   import { DistributedLockService } from '../cache/distributed-lock.service';
   import { logger } from '../common/services/logger.service';

   @Injectable()
   export class YourService {
     constructor(private distributedLockService: DistributedLockService) {}

     @Cron(CronExpression.EVERY_DAY_AT_MIDNIGHT, {
       name: 'your-job-name',
       timeZone: 'Asia/Taipei',
     })
     async handleYourCronJob(): Promise<void> {
       // 使用分散式鎖執行任務
       await this.distributedLockService.executeWithLock(
         'cron:your-job-name',
         async () => {
           logger.info('[Cron] Starting your job');

           try {
             // 執行任務邏輯
             await this.performYourTask();

             logger.info('[Cron] Your job completed successfully');
           } catch (error) {
             logger.error('[Cron] Your job failed', {
               error: error instanceof Error ? error.message : String(error),
               stack: error instanceof Error ? error.stack : undefined,
             });
             throw error;
           }
         },
         600, // TTL: 10 分鐘
       );
     }

     private async performYourTask(): Promise<void> {
       // 實際的任務邏輯
     }
   }
   ```

2. **添加測試腳本**：

   在 `src/scripts/` 目錄下創建對應的測試腳本（參考現有腳本）。

3. **更新文檔**：

   在本文檔中添加新 Cron Job 的說明。

### Cron 表達式格式

```text
 *    *    *    *    *
 │    │    │    │    │
 │    │    │    │    └─── 星期幾 (0 - 7) (0 和 7 都代表星期日)
 │    │    │    └────── 月份 (1 - 12)
 │    │    └─────────── 日期 (1 - 31)
 │    └──────────────── 小時 (0 - 23)
 └───────────────────── 分鐘 (0 - 59)
```

**範例**：

| 表達式        | 說明          |
| ------------- | ------------- |
| `0 0 * * *`   | 每天午夜      |
| `0 */6 * * *` | 每 6 小時     |
| `0 0 * * 0`   | 每週日午夜    |
| `0 0 1 * *`   | 每月 1 號午夜 |
| `0 2 * * *`   | 每天凌晨 2 點 |
| `*/5 * * * *` | 每 5 分鐘     |

**線上工具**：[crontab.guru](https://crontab.guru/)

### 預定義表達式

```typescript
import { CronExpression } from '@nestjs/schedule';

// 每分鐘
@Cron(CronExpression.EVERY_MINUTE)

// 每 5 分鐘
@Cron(CronExpression.EVERY_5_MINUTES)

// 每小時
@Cron(CronExpression.EVERY_HOUR)

// 每天午夜
@Cron(CronExpression.EVERY_DAY_AT_MIDNIGHT)

// 每天中午
@Cron(CronExpression.EVERY_DAY_AT_NOON)

// 週一到週五凌晨 1 點
@Cron(CronExpression.MONDAY_TO_FRIDAY_AT_1AM)
```

---

## 注意事項

### 1. 分散式環境

**問題**：如果應用程式運行多個實例，Cron Jobs 會在**每個實例**上觸發。

**✅ 已實作解決方案**：本系統所有 Cron Jobs 已使用 Redis 分散式鎖機制。

**工作原理**：

```text
實例 A (00:00:00) → 獲取鎖成功 ✅ → 執行任務
實例 B (00:00:00.1) → 獲取鎖失敗 ❌ → 跳過執行
實例 C (00:00:00.2) → 獲取鎖失敗 ❌ → 跳過執行
```

**其他解決方案**（未使用）：

- **選項 B**：使用外部任務調度器（如 Kubernetes CronJob）
- **選項 C**：確保 Cron Job 邏輯是冪等的

### 2. 長時間運行任務

**避免任務執行時間過長**：

```typescript
@Cron('0 */6 * * *', {
  timeZone: 'Asia/Taipei',
})
async handleLongRunningJob(): Promise<void> {
  // 使用批量處理
  const batchSize = 100;

  // 設置超時
  const timeout = 60000; // 60 秒

  // 限制處理數量
  const maxItems = 1000;

  // 設置適當的鎖 TTL
  await this.distributedLockService.executeWithLock(
    'cron:long-running-job',
    async () => {
      // 任務邏輯
    },
    3600, // TTL: 1 小時（根據實際需求調整）
  );
}
```

**建議**：

- 鎖的 TTL 應該比任務預期執行時間長 50%
- 使用批量處理避免一次處理過多數據
- 添加進度日誌便於監控

### 3. 錯誤處理

**必須**處理錯誤並記錄日誌：

```typescript
try {
  // 執行任務
  await this.performTask();
} catch (error) {
  logger.error('[Cron] Job failed', {
    error: error instanceof Error ? error.message : 'Unknown',
    stack: error instanceof Error ? error.stack : undefined,
  });

  // 不要拋出錯誤，讓下次 Cron 繼續執行
  // 如果使用 executeWithLock，可以拋出錯誤（鎖會在 finally 中釋放）
}
```

### 4. 資料庫連線

確保正確管理資料庫連線，避免連線池耗盡：

```typescript
async handleCronJob() {
  await this.distributedLockService.executeWithLock(
    'cron:database-job',
    async () => {
      try {
        // 使用 Prisma transaction
        await this.prisma.$transaction(
          async (tx) => {
            // 執行資料庫操作
            await tx.model.updateMany({...});
          },
          {
            maxWait: 5000, // 最多等待 5 秒獲取連線
            timeout: 30000, // 30 秒超時
          },
        );
      } finally {
        // Prisma 會自動管理連線
      }
    },
    600,
  );
}
```

---

## 相關文檔

- **外部資源**：
  - [NestJS Schedule Documentation](https://docs.nestjs.com/techniques/task-scheduling)
  - [Cron Expression Syntax](https://crontab.guru/)
  - [Redis Distributed Locks](https://redis.io/docs/manual/patterns/distributed-locks/)

- **內部文檔**：
  - [SESSION_TERMINOLOGY.md](./SESSION_TERMINOLOGY.md) - 會話管理規範
  - [AUDIT_LOG_SYSTEM.md](./AUDIT_LOG_SYSTEM.md) - 審計日誌系統
  - [RABBITMQ_DRAGONFLY.md](../infrastructure/RABBITMQ_DRAGONFLY.md) - RabbitMQ 和 Dragonfly 配置
