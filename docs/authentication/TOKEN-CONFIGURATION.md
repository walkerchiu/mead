# Token 配置與安全實踐

JWT Token 配置策略、安全實踐和 Session 管理機制，平衡安全性與用戶體驗。

---

## 目錄

- [Token 配置與安全實踐](#token-配置與安全實踐)
  - [目錄](#目錄)
  - [概述](#概述)
  - [配置總覽](#配置總覽)
    - [當前 Token 時效設定](#當前-token-時效設定)
  - [設計原則](#設計原則)
    - [Access Token 短時效 (15-30分鐘)](#access-token-短時效-15-30分鐘)
    - [Refresh Token 中等時效 (7天)](#refresh-token-中等時效-7天)
  - [Session 撤銷機制](#session-撤銷機制)
    - [撤銷策略](#撤銷策略)
    - [為什麼只撤銷 Refresh Token？](#為什麼只撤銷-refresh-token)
    - [風險分析](#風險分析)
  - [實作細節](#實作細節)
    - [程式碼實現](#程式碼實現)
    - [環境變量配置](#環境變量配置)
  - [使用流程](#使用流程)
    - [正常使用流程](#正常使用流程)
    - [Session 撤銷流程](#session-撤銷流程)
  - [安全性考量](#安全性考量)
    - [多層防護](#多層防護)
    - [業界參考](#業界參考)
  - [監控與日誌](#監控與日誌)
    - [啟動日誌](#啟動日誌)
    - [撤銷日誌](#撤銷日誌)
  - [部署檢查清單](#部署檢查清單)
    - [部署前檢查](#部署前檢查)
    - [監控指標](#監控指標)
  - [相關文檔](#相關文檔)

---

## 概述

本文檔說明專案中 JWT Token 的配置策略、安全實踐和 Session 管理機制。系統採用雙 Token 架構（Access Token + Refresh Token），在安全性和用戶體驗之間取得最佳平衡。

**核心特點：**

- ✅ Access Token 短時效（15-30 分鐘）
- ✅ Refresh Token 可撤銷（7 天）
- ✅ 完整的 Session 追蹤與管理
- ✅ 符合 OAuth 2.0 和 OWASP 最佳實踐

---

## 配置總覽

### 當前 Token 時效設定

| 環境            | Access Token | Refresh Token | 說明                           |
| --------------- | ------------ | ------------- | ------------------------------ |
| **Development** | `30m`        | `14d`         | 方便開發測試，可以測試過期機制 |
| **UAT**         | `15m`        | `7d`          | 與生產環境一致                 |
| **Production**  | `15m`        | `7d`          | 符合安全最佳實踐               |
| **Local**       | `15m`        | `7d`          | 本地開發預設值                 |

---

## 設計原則

### Access Token 短時效 (15-30分鐘)

**優點：**

- ✅ 即使被竊取，影響時間有限
- ✅ Session 撤銷後最多只能用 15-30 分鐘
- ✅ 符合 OAuth 2.0 和 OWASP 最佳實踐

**設定建議：**

```env
# 生產環境
JWT_EXPIRES_IN=15m

# 開發環境（可稍長方便測試）
JWT_EXPIRES_IN=30m
```

### Refresh Token 中等時效 (7天)

**優點：**

- ✅ 用戶體驗好，不用頻繁重新登入
- ✅ 可以隨時撤銷（儲存在資料庫）
- ✅ 透過 Session 管理提供即時控制

**設定建議：**

```env
# 生產環境
JWT_REFRESH_EXPIRES_IN=7d

# 開發環境（可稍長方便測試）
JWT_REFRESH_EXPIRES_IN=14d
```

---

## Session 撤銷機制

### 撤銷策略

當管理員撤銷 Session 時：

```typescript
// 1️⃣ 標記 Session 為已撤銷
session.revokedAt = new Date();

// 2️⃣ 立即清除 Refresh Token（核心機制）
user.refreshToken = null;
```

### 為什麼只撤銷 Refresh Token？

| 方案                                     | 優點                                                 | 缺點                                                        | 推薦度     |
| ---------------------------------------- | ---------------------------------------------------- | ----------------------------------------------------------- | ---------- |
| **只撤銷 Refresh Token<br>（當前實現）** | • 無性能開銷<br>• JWT 保持無狀態<br>• 實務上足夠安全 | Access Token 短暫有效<br>（最多 30 分鐘）                   | ⭐⭐⭐⭐⭐ |
| **同時撤銷 Access Token<br>（黑名單）**  | 即時生效                                             | • 每次請求查資料庫<br>• 失去 JWT 無狀態優勢<br>• 性能開銷大 | ⭐⭐       |

### 風險分析

```text
情境：攻擊者竊取 Access Token

┌─────────────────────────────────────────────┐
│ 當前實現（只撤銷 Refresh Token）              │
├─────────────────────────────────────────────┤
│ 風險窗口: 最多 30 分鐘                        │
│ 性能影響: 無                                  │
│ 複雜度: 低                                    │
│                                             │
│ 結論: 實務上已足夠安全                        │
└─────────────────────────────────────────────┘
```

---

## 實作細節

### 程式碼實現

**從環境變量讀取配置：**

```typescript
// apps/backend/src/auth/auth.service.ts
constructor(
  private configService: ConfigService,
  // ...
) {
  // 從環境變量讀取，提供安全的默認值
  this.ACCESS_TOKEN_EXPIRES_IN =
    this.configService.get<string>('JWT_EXPIRES_IN') || '15m';
  this.REFRESH_TOKEN_EXPIRES_IN =
    this.configService.get<string>('JWT_REFRESH_EXPIRES_IN') || '7d';

  logger.info('[AuthService] Token expiration configured', {
    accessToken: this.ACCESS_TOKEN_EXPIRES_IN,
    refreshToken: this.REFRESH_TOKEN_EXPIRES_IN,
  });
}
```

### 環境變量配置

**Development (.env.dev.example):**

```env
# Access Token 過期時間（開發環境建議 30 分鐘以便測試過期機制）
JWT_EXPIRES_IN=30m
# Refresh Token 過期時間（開發環境可設長一點方便測試）
JWT_REFRESH_EXPIRES_IN=14d
```

**UAT (.env.uat.example):**

```env
# Access Token 過期時間（UAT 建議 15-30 分鐘）
JWT_EXPIRES_IN=15m
# Refresh Token 過期時間（UAT 建議 7-14 天）
JWT_REFRESH_EXPIRES_IN=7d
```

**Production (.env.prod.example):**

```env
# Access Token 過期時間（生產環境建議 15 分鐘）
JWT_EXPIRES_IN=15m
# Refresh Token 過期時間（生產環境建議 7 天）
JWT_REFRESH_EXPIRES_IN=7d
```

---

## 使用流程

### 正常使用流程

```text
時間線：
09:00 - 用戶登入
        ✅ 獲得 Access Token (15m 過期)
        ✅ 獲得 Refresh Token (7d 過期)

09:15 - Access Token 過期
        ✅ 前端自動用 Refresh Token 換新 Access Token
        ✅ 用戶無感知，繼續使用

09:16 - 繼續正常使用
        ✅ 每 15 分鐘自動重新整理 Access Token
        ✅ 持續 7 天無需重新登入
```

### Session 撤銷流程

```text
時間線：
10:00 - 用戶持有有效 token
        Access Token: abc123 (10:15 過期)
        Refresh Token: xyz789 (7天過期)

10:30 - 管理員撤銷 Session
        ✅ session.revokedAt = 2026-02-04 10:30
        ✅ user.refreshToken = null

10:31 - Access Token 仍在有效期內
        前端: 用 abc123 調用 API
        後端: ✅ JWT 驗證通過
        結果: ✅ 請求成功（但最多只能再用到 10:15）

10:15 - Access Token 過期，前端嘗試重新整理
        前端: 用 xyz789 調用 refreshToken mutation
        後端: ❌ user.refreshToken 是 null
        返回: "Invalid refresh token"
        結果: 🚫 無法獲得新 token，被強制登出
```

---

## 安全性考量

### 多層防護

**1. 短時效 Access Token (15m)**

- 最小化竊取風險窗口
- Session 撤銷後最多影響 15 分鐘

**2. 可撤銷 Refresh Token (7d)**

- 即時撤銷能力
- 資料庫級別控制

**3. Session 追蹤**

- 記錄設備、IP、位置
- 可查詢所有活躍 Session

**4. 審計日誌**

- 記錄所有撤銷操作
- 可追溯誰、何時、為何撤銷

### 業界參考

| 服務       | Access Token | Refresh Token   |
| ---------- | ------------ | --------------- |
| **GitHub** | 15m          | 6個月           |
| **Google** | 60m          | 無過期 (可撤銷) |
| **AWS**    | 15m-60m      | 30-90天         |
| **本專案** | 15m          | 7天             |

---

## 監控與日誌

### 啟動日誌

系統啟動時會記錄配置：

```log
info: [AuthService] Token expiration configured {
  accessToken: "15m",
  refreshToken: "7d"
}
```

### 撤銷日誌

Session 撤銷時會記錄：

```log
info: [SessionManagement] Session revoked {
  userId: "user-123",
  sessionId: "session-456",
  revokedBy: "hq-789",
  reason: "Suspicious activity"
}
```

---

## 部署檢查清單

### 部署前檢查

- [ ] 確認環境變量已設定

  ```bash
  echo $JWT_EXPIRES_IN
  echo $JWT_REFRESH_EXPIRES_IN
  ```

- [ ] 確認生產環境使用安全值
  - Access Token ≤ 30m
  - Refresh Token ≤ 14d

- [ ] 測試 Token 過期機制
  - Access Token 過期後自動重新整理
  - Refresh Token 過期後強制重新登入

- [ ] 測試 Session 撤銷
  - 撤銷後無法重新整理 token
  - 收到撤銷通知郵件

### 監控指標

- [ ] 追蹤 Token 重新整理頻率
- [ ] 監控 Session 撤銷數量
- [ ] 檢查異常登入嘗試

---

## 相關文檔

- **Session 管理**: 參見 `apps/backend/src/auth/hq-session.service.ts`
- [Two Factor Auth](./TWO_FACTOR_AUTH.md) - 雙因素認證系統
- [Registration](./REGISTRATION.md) - 用戶註冊與權限分配
- [RBAC Architecture](./RBAC_ARCHITECTURE.md) - 角色權限系統架構
- [Row-Level Security](./ROW_LEVEL_SECURITY.md) - 資料行級別安全控制
