# 會話管理系統用詞規範 (Session Terminology)

定義會話管理系統中所有術語的統一用法，確保前後端、UI 和審計日誌的一致性。

---

## 目錄

- [會話管理系統用詞規範 (Session Terminology)](#會話管理系統用詞規範-session-terminology)
  - [目錄](#目錄)
  - [會話狀態 (Session Status)](#會話狀態-session-status)
    - [狀態定義](#狀態定義)
    - [狀態轉換](#狀態轉換)
  - [撤銷方式 (Revoked Method)](#撤銷方式-revoked-method)
    - [方式定義](#方式定義)
  - [審計日誌動作 (Audit Log Actions)](#審計日誌動作-audit-log-actions)
    - [動作定義](#動作定義)
    - [審計日誌內容範例](#審計日誌內容範例)
  - [UI 顯示規範](#ui-顯示規範)
  - [前端翻譯鍵值](#前端翻譯鍵值)
  - [數據庫欄位](#數據庫欄位)
  - [實現檢查清單](#實現檢查清單)
  - [常見問題 (FAQ)](#常見問題-faq)
  - [相關文檔](#相關文檔)
  - [測試工具](#測試工具)

---

## 會話狀態 (Session Status)

### 狀態定義

| 狀態代碼  | 中文   | 英文    | 判斷邏輯                                                                   | UI 顯示  |
| --------- | ------ | ------- | -------------------------------------------------------------------------- | -------- |
| `ACTIVE`  | 活躍中 | Active  | `revokedAt = null AND expiresAt > now`                                     | 綠色徽章 |
| `EXPIRED` | 已過期 | Expired | `revokedMethod = 'AUTO_EXPIRE' OR (revokedAt = null AND expiresAt <= now)` | 灰色徽章 |
| `REVOKED` | 已撤銷 | Revoked | `revokedAt != null AND revokedMethod != 'AUTO_EXPIRE'`                     | 紅色徽章 |

### 狀態轉換

```text
ACTIVE ──用戶登出──→ REVOKED (USER_LOGOUT)
       ──管理員撤銷→ REVOKED (HQ_FORCE)
       ──批量撤銷──→ REVOKED (BATCH_REVOKE)
       ──安全措施──→ REVOKED (SECURITY_MEASURE)
       ──時間過期──→ EXPIRED (AUTO_EXPIRE)
```

### 重要說明

**已過期 (EXPIRED)** 和 **已撤銷 (REVOKED)** 是不同的概念：

- **已過期**：會話因時間到期而自然失效，由系統 Cron Job 自動處理
- **已撤銷**：會話被人為主動終止（用戶登出、管理員操作、安全措施）

---

## 撤銷方式 (Revoked Method)

### 方式定義

| 代碼               | 中文標籤   | 英文標籤         | 使用場景               | 顏色 | 操作者   |
| ------------------ | ---------- | ---------------- | ---------------------- | ---- | -------- |
| `USER_LOGOUT`      | 自己登出   | Self Logout      | 用戶主動登出當前會話   | 綠色 | 用戶自己 |
| `HQ_FORCE`         | 管理員撤銷 | HQ Revoked       | 管理員撤銷單一會話     | 橙色 | 管理員   |
| `BATCH_REVOKE`     | 批量撤銷   | Batch Revoked    | 管理員批量撤銷多個會話 | 橙色 | 管理員   |
| `AUTO_EXPIRE`      | 自動過期   | Auto Expired     | Cron Job 處理過期會話  | 灰色 | 系統     |
| `SECURITY_MEASURE` | 安全措施   | Security Revoked | 安全事件觸發的撤銷     | 紅色 | 系統     |

### 詳細說明

#### USER_LOGOUT（自己登出）

- **觸發時機**：用戶點擊登出按鈕
- **影響範圍**：僅當前會話
- **數據庫記錄**：
  - `revokedAt`: 登出時間
  - `revokedBy`: 用戶自己的 ID
  - `revokedMethod`: `USER_LOGOUT`
  - `revokedReason`: "用戶主動登出" 或自定義原因
- **審計日誌動作**：`SESSION_REVOKED`

#### HQ_FORCE（管理員撤銷）

- **觸發時機**：管理員在會話管理頁面撤銷特定會話
- **影響範圍**：單一會話
- **數據庫記錄**：
  - `revokedAt`: 撤銷時間
  - `revokedBy`: 管理員 ID
  - `revokedMethod`: `HQ_FORCE`
  - `revokedReason`: 管理員提供的原因
- **審計日誌動作**：`SESSION_REVOKED`
- **UI 顯示**：顯示撤銷者姓名（例如："管理員撤銷 (Super HQ)"）

#### BATCH_REVOKE（批量撤銷）

- **觸發時機**：管理員使用批量撤銷功能
- **影響範圍**：多個會話（根據條件篩選）
- **數據庫記錄**：
  - `revokedAt`: 撤銷時間
  - `revokedBy`: 管理員 ID
  - `revokedMethod`: `BATCH_REVOKE`
  - `revokedReason`: 管理員提供的原因
- **審計日誌動作**：`BATCH_SESSIONS_REVOKED`
- **UI 顯示**：顯示撤銷者姓名（例如："批量撤銷 (Super HQ)"）

#### AUTO_EXPIRE（自動過期）

- **觸發時機**：Cron Job 定期掃描（每 6 小時）
- **影響範圍**：所有已過期但未處理的會話
- **數據庫記錄**：
  - `revokedAt`: 處理時間
  - `revokedBy`: `null`（系統自動）
  - `revokedMethod`: `AUTO_EXPIRE`
  - `revokedReason`: "Session expired automatically"
- **審計日誌動作**：`SESSION_EXPIRED`
- **UI 顯示**：顯示為「已過期」狀態，而非「已撤銷」

#### SECURITY_MEASURE（安全措施）

- **觸發時機**：
  - 偵測到可疑活動
  - 密碼重設後撤銷所有會話
  - 帳號被鎖定或停用
- **影響範圍**：特定用戶的所有會話
- **數據庫記錄**：
  - `revokedAt`: 撤銷時間
  - `revokedBy`: 系統 ID 或管理員 ID
  - `revokedMethod`: `SECURITY_MEASURE`
  - `revokedReason`: 詳細的安全原因
- **審計日誌動作**：`SESSION_REVOKED`

---

## 審計日誌動作 (Audit Log Actions)

### 動作定義

| 動作代碼                 | 中文           | 使用時機               | 關聯的 revokedMethod                          |
| ------------------------ | -------------- | ---------------------- | --------------------------------------------- |
| `SESSION_REVOKED`        | 會話被撤銷     | 手動撤銷單一會話       | `USER_LOGOUT`, `HQ_FORCE`, `SECURITY_MEASURE` |
| `SESSION_EXPIRED`        | 會話已過期     | Cron Job 自動處理      | `AUTO_EXPIRE`                                 |
| `USER_SESSIONS_REVOKED`  | 用戶會話被撤銷 | 撤銷特定用戶的所有會話 | `HQ_FORCE`, `SECURITY_MEASURE`                |
| `BATCH_SESSIONS_REVOKED` | 批量會話被撤銷 | 批量撤銷操作           | `BATCH_REVOKE`                                |

### 審計日誌內容範例

#### SESSION_REVOKED（單一會話撤銷）

```json
{
  "requestId": "uuid",
  "action": "SESSION_REVOKED",
  "entity": "Session",
  "entityId": "session-id",
  "userId": "hq-id",
  "status": "SUCCESS",
  "details": {
    "targetUserId": "user-id",
    "targetUserEmail": "user@example.com",
    "reason": "Suspicious activity detected",
    "revokedMethod": "HQ_FORCE",
    "revokedBy": "hq-id",
    "deviceInfo": "Chrome on Windows",
    "ipAddress": "192.168.1.1"
  }
}
```

#### SESSION_EXPIRED（自動過期）

```json
{
  "requestId": "uuid",
  "action": "SESSION_EXPIRED",
  "entity": "Session",
  "entityId": "session-id",
  "userId": "user-id",
  "status": "SUCCESS",
  "details": {
    "reason": "Session expired automatically",
    "revokedMethod": "AUTO_EXPIRE",
    "expiresAt": "2024-01-01T00:00:00Z",
    "deviceInfo": "Chrome on Windows",
    "ipAddress": "192.168.1.1",
    "location": "Taiwan"
  }
}
```

---

## UI 顯示規範

### 會話列表表格

| 欄位     | 顯示內容              | 說明                       |
| -------- | --------------------- | -------------------------- |
| 用戶     | 姓名 + Email          | 會話所屬用戶               |
| 狀態     | 活躍中/已過期/已撤銷  | 使用徽章顯示，顏色如上定義 |
| 撤銷方式 | 依 revokedMethod 顯示 | 僅在已撤銷時顯示           |
| 設備     | 瀏覽器 + 作業系統     | 例如："Chrome / Windows"   |
| IP 地址  | 完整 IP               | 使用等寬字體               |
| 地理位置 | 城市或國家            | 例如："Taiwan" 或 "Local"  |
| 創建時間 | YYYY-MM-DD HH:mm:ss   | 會話創建時間               |
| 最後使用 | YYYY-MM-DD HH:mm:ss   | 最後活動時間               |
| 操作     | 查看詳情 / 撤銷按鈕   | 當前會話顯示「當前」徽章   |

### 會話狀態徽章

```typescript
// 顏色對應
ACTIVE    → success (綠色)
EXPIRED   → default (灰色)
REVOKED   → error (紅色)
```

### 撤銷方式徽章

```typescript
// 顏色對應
USER_LOGOUT       → success (綠色)
HQ_FORCE       → warning (橙色)
BATCH_REVOKE      → warning (橙色)
AUTO_EXPIRE       → default (灰色)
SECURITY_MEASURE  → error (紅色)
```

---

## 前端翻譯鍵值

### 會話狀態

- `pages.hq.sessions.table.statuses.active` → "活躍中" / "Active"
- `pages.hq.sessions.table.statuses.expired` → "已過期" / "Expired"
- `pages.hq.sessions.table.statuses.revoked` → "已撤銷" / "Revoked"

### 撤銷方式

- `pages.hq.sessions.table.revokedMethods.user_logout` → "自己登出" / "Self Logout"
- `pages.hq.sessions.table.revokedMethods.hq_force` → "管理員撤銷" / "HQ Revoked"
- `pages.hq.sessions.table.revokedMethods.hq_force_with_name` → "管理員撤銷 ({name})" / "HQ Revoked ({name})"
- `pages.hq.sessions.table.revokedMethods.batch_revoke` → "批量撤銷" / "Batch Revoked"
- `pages.hq.sessions.table.revokedMethods.batch_revoke_with_name` → "批量撤銷 ({name})" / "Batch Revoked ({name})"
- `pages.hq.sessions.table.revokedMethods.auto_expire` → "自動過期" / "Auto Expired"
- `pages.hq.sessions.table.revokedMethods.security_measure` → "安全措施" / "Security Revoked"

---

## 數據庫欄位

### Session 表相關欄位

| 欄位               | 類型      | 說明                   | 範例                          |
| ------------------ | --------- | ---------------------- | ----------------------------- |
| `id`               | String    | 會話 ID                | UUID                          |
| `userId`           | String    | 用戶 ID                | UUID                          |
| `refreshTokenHash` | String    | Refresh Token 雜湊值   | SHA-256 hash                  |
| `deviceInfo`       | String    | 設備資訊（User-Agent） | "Mozilla/5.0..."              |
| `deviceType`       | String    | 設備類型               | "desktop", "mobile", "tablet" |
| `browser`          | String    | 瀏覽器名稱             | "Chrome", "Safari", "Firefox" |
| `os`               | String    | 作業系統               | "Windows", "macOS", "iOS"     |
| `ipAddress`        | String    | IP 地址                | "192.168.1.1"                 |
| `location`         | String    | 地理位置               | "Taiwan", "Local"             |
| `expiresAt`        | DateTime  | 過期時間               | ISO 8601 格式                 |
| `lastUsedAt`       | DateTime  | 最後使用時間           | ISO 8601 格式                 |
| `createdAt`        | DateTime  | 創建時間               | ISO 8601 格式                 |
| `revokedAt`        | DateTime? | 撤銷時間（nullable）   | ISO 8601 格式或 null          |
| `revokedBy`        | String?   | 撤銷者 ID（nullable）  | UUID 或 null（系統自動）      |
| `revokedReason`    | String?   | 撤銷原因（nullable）   | 文字描述                      |
| `revokedMethod`    | String?   | 撤銷方式（nullable）   | 見上方定義                    |

---

## 實現檢查清單

### 後端實作

- ✅ **已完成** - `getSessionStatus` 方法正確區分 EXPIRED 和 REVOKED
  - 檔案：`apps/backend/src/auth/hq-session.service.ts:897-922`
  - 實作：當 `revokedMethod === 'AUTO_EXPIRE'` 時返回 EXPIRED

- ✅ **已完成** - Cron Job 使用 `AUTO_EXPIRE` 並記錄 `SESSION_EXPIRED` 審計日誌
  - 檔案：`apps/backend/src/auth/session-management.service.ts`
  - 實作：
    - `cleanupExpiredSessions` 方法（行 447-501）：用戶創建新會話時觸發
    - `handleExpiredSessionsCleanup` Cron Job（行 503-619）：每 6 小時自動執行
    - 使用 `@Cron('0 */6 * * *')` 裝飾器
    - 批量處理（每批 100 個會話）
    - 使用 Prisma transaction 確保數據一致性
    - 完整的錯誤處理和日誌記錄

- ✅ **已完成** - 手動撤銷使用對應的 `revokedMethod` 並記錄 `SESSION_REVOKED`
  - 檔案：`apps/backend/src/auth/hq-session.service.ts`
  - 實作：`revokeSession` 使用 `HQ_FORCE`、`revokeOtherDevices` 使用 `USER_LOGOUT`

- ✅ **已完成** - 批量撤銷使用 `BATCH_REVOKE` 並記錄 `BATCH_SESSIONS_REVOKED`
  - 檔案：`apps/backend/src/auth/hq-session.service.ts`
  - 實作：`revokeBatchSessions` 使用 `BATCH_REVOKE`

- ✅ **已完成** - `cleanupExpiredSessions` 標記過期會話而非刪除（保留審計記錄）
  - 檔案：`apps/backend/src/auth/session-management.service.ts:439-499`
  - 實作：使用 `update` 標記而非 `deleteMany` 刪除

- ✅ **已完成** - RevokedMethod enum 包含所有 5 種撤銷方式
  - 檔案：`apps/backend/src/auth/hq-session.types.ts:11-16`
  - 實作：包含 `USER_LOGOUT`, `HQ_FORCE`, `BATCH_REVOKE`, `AUTO_EXPIRE`, `SECURITY_MEASURE`

### 前端實作

- ✅ **已完成** - 翻譯檔案包含所有狀態和撤銷方式
  - 檔案：`apps/frontend/messages/en.json`, `apps/frontend/messages/zh-TW.json`
  - 實作：包含所有 5 種 revokedMethods 的翻譯（含 `auto_expire`）

- ✅ **已完成** - UI 顯示正確的顏色和標籤
  - 檔案：`apps/frontend/src/components/organisms/SessionsTable/SessionsTable.tsx`
  - 實作：ACTIVE(綠)、EXPIRED(灰)、REVOKED(紅)、AUTO_EXPIRE(灰)

- ✅ **已完成** - 撤銷方式顯示撤銷者姓名（HQ_FORCE, BATCH_REVOKE）
  - 檔案：`apps/frontend/src/components/organisms/SessionsTable/SessionsTable.tsx`
  - 實作：使用 `_with_name` 變體顯示管理員名稱

- ✅ **已完成** - 篩選器支持按狀態和撤銷方式篩選
  - 檔案：`apps/frontend/src/components/hq/SessionFilters.tsx`
  - 實作：包含狀態篩選和撤銷方式篩選（含 `AUTO_EXPIRE`）

- ✅ **已完成** - 會話詳情模態框正確顯示所有資訊
  - 檔案：`apps/frontend/src/components/hq/SessionDetailsModal.tsx`
  - 實作：
    - EXPIRED 狀態顯示灰色（default）符合規範
    - 當 `revokedAt` 存在時顯示撤銷資訊（包含 AUTO_EXPIRE）
    - AUTO_EXPIRE 顯示「系統（自動）」作為撤銷者
    - 使用正確的翻譯路徑 `table.revokedMethods`
    - 支援所有 5 種撤銷方式的顯示

### 測試覆蓋

- **待完成** - 單元測試：`getSessionStatus` 各種情況
- **待完成** - 整合測試：Cron Job 正確標記過期會話為 EXPIRED
- **待完成** - E2E 測試：撤銷會話後重新登入，會話仍顯示為 REVOKED
- **待完成** - E2E 測試：過期會話顯示為 EXPIRED 而非 REVOKED

---

## 常見問題 (FAQ)

### Q1: 為什麼要區分「已過期」和「已撤銷」？

**A:** 這兩者代表不同的原因和責任：

- **已過期**：自然的時間流逝，系統預期行為
- **已撤銷**：人為主動操作，可能是安全問題或用戶選擇

區分這兩者有助於審計和安全分析。

### Q2: 自動過期的會話會被刪除嗎？

**A:** ❌ 不會。所有已過期和已撤銷的會話都會保留作為審計記錄，不會被刪除。

**實作細節**：

系統有兩個機制來處理過期會話：

1. **Cron Job 定期處理**（主要機制）
   - 每 6 小時執行 `handleExpiredSessionsCleanup` 方法
   - 掃描所有已過期但尚未標記的會話（`expiresAt < now AND revokedAt = null`）
   - 批量處理（每批 100 個，最多 1000 個）
   - 標記為 `AUTO_EXPIRE` 並記錄 `SESSION_EXPIRED` 審計日誌
   - 使用 Prisma transaction 確保數據一致性

2. **用戶登入時觸發**（輔助機制）
   - 當用戶創建新會話時，調用 `cleanupExpiredSessions` 方法
   - 只處理該用戶的過期會話
   - 確保用戶的會話列表保持整潔

**Cron Job 執行時間**：

- 00:00（午夜）
- 06:00（早上 6 點）
- 12:00（中午）
- 18:00（晚上 6 點）

### Q3: 當前會話可以被撤銷嗎？

**A:** ❌ 不可以。前端會檢查 `isActive` 標記，當前會話不會顯示「撤銷」按鈕，而是顯示「當前」徽章。

### Q4: 管理員可以撤銷其他管理員的會話嗎？

**A:** ⚠️ 取決於權限配置。`HQSessionGuard` 會檢查權限，防止低權限管理員撤銷高權限管理員的會話。

### Q5: 撤銷會話後用戶會立即登出嗎？

**A:** ✅ 是的。撤銷會話後，該 refresh token 立即失效。當用戶嘗試重新整理 access token 時會失敗，前端會檢測到並導航到登入頁面。

---

## 相關文檔

- [Cron Jobs 文檔](./CRON_JOBS.md) - 定期任務實作指南
- [前端錯誤處理指南](../frontend/FRONTEND_ERROR_HANDLING_GUIDE.md)
- [GraphQL Subscriptions 實現計劃](./SUBSCRIPTION_IMPLEMENTATION_PLAN.md)
- [RBAC 架構](../authentication/RBAC_ARCHITECTURE.md)

## 測試工具

- [過期會話清理測試腳本](../../apps/backend/src/scripts/test-expired-sessions-cleanup.ts)
