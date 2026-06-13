# 前端錯誤處理與 Apollo 配置完整指南

MEAD Frontend 錯誤處理系統與 Apollo Client 配置的完整使用指南。

---

## 目錄

- [前端錯誤處理與 Apollo 配置完整指南](#前端錯誤處理與-apollo-配置完整指南)
  - [目錄](#目錄)
  - [系統概覽](#系統概覽)
    - [錯誤處理架構](#錯誤處理架構)
    - [Apollo Client 配置系統](#apollo-client-配置系統)
    - [核心特性](#核心特性)
  - [環境變數配置](#環境變數配置)
    - [完整環境變數清單](#完整環境變數清單)
    - [不同環境的推薦配置](#不同環境的推薦配置)
      - [開發環境 (Development)](#開發環境-development)
      - [UAT 環境](#uat-環境)
      - [生產環境 (Production)](#生產環境-production)
    - [配置說明](#配置說明)
  - [Apollo Client 配置](#apollo-client-配置)
    - [全局配置](#全局配置)
    - [Per-Operation 配置](#per-operation-配置)
    - [配置驗證機制](#配置驗證機制)
      - [Timeout 驗證](#timeout-驗證)
      - [Max Retries 驗證](#max-retries-驗證)
      - [驗證日誌範例](#驗證日誌範例)
    - [智能重試邏輯](#智能重試邏輯)
      - [會重試的操作](#會重試的操作)
      - [不會重試的操作](#不會重試的操作)
      - [指數退避](#指數退避)
    - [實作細節](#實作細節)
      - [配置邊界](#配置邊界)
      - [核心配置檔案](#核心配置檔案)
      - [修改的檔案](#修改的檔案)
    - [技術決策](#技術決策)
      - [為什麼選擇環境變數？](#為什麼選擇環境變數)
      - [為什麼支援 Per-Operation 覆蓋？](#為什麼支援-per-operation-覆蓋)
      - [為什麼需要配置驗證？](#為什麼需要配置驗證)
  - [錯誤處理功能](#錯誤處理功能)
    - [P0: 基礎錯誤處理](#p0-基礎錯誤處理)
      - [GlobalErrorBoundary](#globalerrorboundary)
      - [錯誤分類系統](#錯誤分類系統)
    - [P1: 監控與追蹤](#p1-監控與追蹤)
      - [Sentry 整合](#sentry-整合)
      - [用戶追蹤](#用戶追蹤)
    - [P2: 增強功能](#p2-增強功能)
      - [FeatureErrorBoundary](#featureerrorboundary)
      - [Apollo Retry Link](#apollo-retry-link)
      - [Apollo Timeout Link](#apollo-timeout-link)
      - [useErrorRecovery Hook](#useerrorrecovery-hook)
      - [useFormErrorHandler Hook](#useformerrorhandler-hook)
  - [使用範例](#使用範例)
    - [基本使用](#基本使用)
      - [1. 使用預設配置](#1-使用預設配置)
    - [進階使用](#進階使用)
      - [2. 文件上傳 - 長超時，不重試](#2-文件上傳---長超時不重試)
      - [3. 報表生成 - 超長超時，少重試](#3-報表生成---超長超時少重試)
      - [4. 即時數據輪詢 - 短超時，不重試](#4-即時數據輪詢---短超時不重試)
      - [5. 關鍵支付操作 - 更多重試](#5-關鍵支付操作---更多重試)
      - [6. 背景同步 - 極長超時](#6-背景同步---極長超時)
      - [7. 批量操作 - 自訂配置](#7-批量操作---自訂配置)
      - [8. 功能隔離](#8-功能隔離)
      - [9. 表單驗證錯誤處理](#9-表單驗證錯誤處理)
    - [動態配置](#動態配置)
      - [10. 根據條件調整配置](#10-根據條件調整配置)
      - [11. 根據網路狀態調整](#11-根據網路狀態調整)
    - [錯誤處理整合](#錯誤處理整合)
      - [12. 與錯誤處理系統整合](#12-與錯誤處理系統整合)
    - [測試範例](#測試範例)
      - [13. 配置驗證測試](#13-配置驗證測試)
      - [14. 超時處理測試](#14-超時處理測試)
      - [15. 重試行為測試](#15-重試行為測試)
    - [監控與日誌](#監控與日誌)
      - [16. 添加自訂日誌](#16-添加自訂日誌)
  - [最佳實踐](#最佳實踐)
    - [應該做的事](#應該做的事)
    - [不要做的事](#不要做的事)
  - [疑難排解](#疑難排解)
    - [問題 1: 操作經常超時](#問題-1-操作經常超時)
    - [問題 2: 重試次數太多導致性能問題](#問題-2-重試次數太多導致性能問題)
    - [問題 3: Sentry 未收到錯誤報告](#問題-3-sentry-未收到錯誤報告)
    - [問題 4: 配置警告頻繁出現](#問題-4-配置警告頻繁出現)
    - [問題 5: 文件上傳被重試](#問題-5-文件上傳被重試)
    - [問題 6: 環境變數未生效](#問題-6-環境變數未生效)
    - [問題 7: GraphQL 錯誤不重試](#問題-7-graphql-錯誤不重試)
  - [配置快速參考](#配置快速參考)
    - [環境變數](#環境變數)
    - [Per-Operation 參數](#per-operation-參數)
    - [錯誤分類](#錯誤分類)
    - [常見場景配置](#常見場景配置)
  - [遷移指南](#遷移指南)
    - [現有代碼無需修改](#現有代碼無需修改)
    - [選擇性升級](#選擇性升級)
  - [相關文檔](#相關文檔)

---

## 系統概覽

### 錯誤處理架構

錯誤處理系統分為三個層級（P0/P1/P2），提供完整的錯誤捕獲、追蹤和恢復機制。

```text
┌─────────────────────────────────────────────────────────┐
│ P0: 基礎錯誤處理                                          │
│ - GlobalErrorBoundary (全局錯誤捕獲)                     │
│ - 錯誤分類系統 (9 種類別)                                 │
│ - 全局錯誤處理器 (window.onerror, unhandledrejection)  │
│ - Apollo 錯誤轉換                                         │
└─────────────────────────────────────────────────────────┘
┌─────────────────────────────────────────────────────────┐
│ P1: 監控與追蹤                                            │
│ - Sentry 整合 (錯誤追蹤)                                 │
│ - 環境上下文管理                                          │
│ - 用戶追蹤                                                │
└─────────────────────────────────────────────────────────┘
┌─────────────────────────────────────────────────────────┐
│ P2: 增強功能                                              │
│ - FeatureErrorBoundary (功能級錯誤隔離)                  │
│ - Apollo Retry Link (自動重試)                           │
│ - Apollo Timeout Link (超時保護)                         │
│ - useErrorRecovery (智能錯誤恢復)                        │
│ - useFormErrorHandler (表單錯誤處理)                     │
└─────────────────────────────────────────────────────────┘
```

### Apollo Client 配置系統

Apollo Client 配置支援兩個層級的自訂：

**配置層級**：

- **全局配置** - 通過環境變數設定預設值
- **Per-Operation 配置** - 為特定操作覆蓋預設值

### 核心特性

- ✅ **全局錯誤捕獲** - 捕獲所有未處理的錯誤
- ✅ **功能隔離** - 局部錯誤不影響整個應用
- ✅ **自動重試** - 網路錯誤指數退避重試
- ✅ **超時保護** - 防止請求無限等待
- ✅ **錯誤追蹤** - Sentry 整合追蹤線上錯誤
- ✅ **智能恢復** - 自動分類並提供恢復策略
- ✅ **環境變數配置** - 不同環境靈活配置
- ✅ **Per-Operation 覆蓋** - 特定操作自訂行為
- ✅ **配置驗證** - 自動驗證配置值的安全性

---

## 環境變數配置

### 完整環境變數清單

在 `.env` 檔案中配置以下變數：

```bash
# ==============================================
# GraphQL API Endpoint
# ==============================================
NEXT_PUBLIC_GRAPHQL_ENDPOINT=http://localhost:4000/graphql
NEXT_PUBLIC_GRAPHQL_WS_ENDPOINT=ws://localhost:4000/graphql

# ==============================================
# Apollo Client Configuration
# ==============================================
# 請求超時時間（毫秒）
# 預設: 30000, 範圍: 5000 (5s) ~ 300000 (5min)
NEXT_PUBLIC_APOLLO_TIMEOUT=30000

# 最大重試次數
# 預設: 3, 範圍: 0 ~ 10
NEXT_PUBLIC_APOLLO_MAX_RETRIES=3

# 首次重試延遲（毫秒）
# 預設: 300, 範圍: 100ms ~ 60000ms
NEXT_PUBLIC_APOLLO_RETRY_INITIAL_DELAY=300

# 最大重試延遲（毫秒）
# 預設: 10000, 範圍: 100ms ~ 60000ms
NEXT_PUBLIC_APOLLO_RETRY_MAX_DELAY=10000

# ==============================================
# 錯誤追蹤 (Sentry)
# ==============================================
# Sentry DSN - 留空則不啟用 Sentry
NEXT_PUBLIC_SENTRY_DSN=

# 應用程式版本資訊（用於錯誤追蹤）
NEXT_PUBLIC_APP_VERSION=0.1.0
NEXT_PUBLIC_BUILD_ID=
NEXT_PUBLIC_COMMIT_SHA=
```

### 不同環境的推薦配置

#### 開發環境 (Development)

```bash
# .env (開發環境)
NEXT_PUBLIC_APOLLO_TIMEOUT=30000        # 30s - 快速失敗
NEXT_PUBLIC_APOLLO_MAX_RETRIES=3        # 3 次重試
NEXT_PUBLIC_SENTRY_DSN=                 # 開發環境可不啟用
```

**目的**：快速發現問題，便於調試

#### UAT 環境

```bash
# .env.uat.example (UAT 環境)
NEXT_PUBLIC_APOLLO_TIMEOUT=45000        # 45s - 模擬生產
NEXT_PUBLIC_APOLLO_MAX_RETRIES=4        # 4 次重試
NEXT_PUBLIC_SENTRY_DSN=your-uat-dsn     # 使用獨立的 UAT Sentry 專案
```

**目的**：測試網路不穩定情況，收集 UAT 錯誤

#### 生產環境 (Production)

```bash
# .env.prod.example (生產環境)
NEXT_PUBLIC_APOLLO_TIMEOUT=60000        # 60s - 提升用戶體驗
NEXT_PUBLIC_APOLLO_MAX_RETRIES=5        # 5 次重試
NEXT_PUBLIC_APOLLO_RETRY_MAX_DELAY=15000 # 15s - 更長的最大延遲
NEXT_PUBLIC_SENTRY_DSN=your-prod-dsn    # 啟用 Sentry 追蹤線上錯誤
```

**目的**：最佳用戶體驗，完整錯誤追蹤

### 配置說明

| 變數                                     | 說明                         | 預設值 | 範圍           |
| ---------------------------------------- | ---------------------------- | ------ | -------------- |
| `NEXT_PUBLIC_APOLLO_TIMEOUT`             | GraphQL 請求超時時間（毫秒） | 30000  | 5000-300000    |
| `NEXT_PUBLIC_APOLLO_MAX_RETRIES`         | 最大自動重試次數             | 3      | 0-10           |
| `NEXT_PUBLIC_APOLLO_RETRY_INITIAL_DELAY` | 首次重試延遲（毫秒）         | 300    | 100-60000      |
| `NEXT_PUBLIC_APOLLO_RETRY_MAX_DELAY`     | 最大重試延遲（毫秒）         | 10000  | 100-60000      |
| `NEXT_PUBLIC_SENTRY_DSN`                 | Sentry 錯誤追蹤 DSN          | （空） | Sentry DSN URL |

---

## Apollo Client 配置

### 全局配置

通過環境變數設定全局預設值，適用於所有 GraphQL 操作。

**優勢**：

- 符合 12-Factor App 原則
- 不同環境使用不同配置
- 無需修改代碼即可調整
- 運維友善

**範例**：

```bash
# 不同環境的建議值
| 環境           | Timeout | Max Retries | 原因                      |
| -------------- | ------- | ----------- | ------------------------- |
| **開發環境**   | 30s     | 3           | 快速失敗，便於除錯        |
| **UAT/測試**   | 45s     | 4           | 模擬生產環境網路狀況      |
| **生產環境**   | 60s     | 5           | 提升用戶體驗，處理網路不穩 |
```

### Per-Operation 配置

為特定的 GraphQL 操作覆蓋全局配置。

**基本語法**：

```typescript
import { useQuery, useMutation } from '@apollo/client';

// Query with custom timeout
const { data } = useQuery(MY_QUERY, {
  context: {
    timeout: 60000, // 覆蓋全局 timeout
    maxRetries: 5, // 覆蓋全局 maxRetries
  },
});

// Mutation with custom config
const [myMutation] = useMutation(MY_MUTATION, {
  context: {
    timeout: 45000,
    maxRetries: 0, // 不重試
  },
});
```

**可覆蓋的參數**：

| 參數         | 類型     | 說明                 | 範例              |
| ------------ | -------- | -------------------- | ----------------- |
| `timeout`    | `number` | 請求超時時間（毫秒） | `120000` (2 分鐘) |
| `maxRetries` | `number` | 最大重試次數         | `0` (不重試)      |

### 配置驗證機制

系統會自動驗證所有配置值，確保在安全範圍內。

#### Timeout 驗證

```typescript
// 自動調整超出範圍的值
context: {
  timeout: 100,      // → 調整為 5000ms (最小值)
  timeout: 9999999,  // → 調整為 300000ms (最大值)
  timeout: 30000,    // → 保持 30000ms (正常值)
}
```

**驗證規則**：

- **最小值**: 5,000ms (5 秒)
- **最大值**: 300,000ms (5 分鐘)
- **警告日誌**: Console 會顯示調整警告

#### Max Retries 驗證

```typescript
// 自動調整超出範圍的值
context: {
  maxRetries: -1,    // → 調整為 0 (最小值)
  maxRetries: 100,   // → 調整為 10 (最大值)
  maxRetries: 3,     // → 保持 3 (正常值)
}
```

**驗證規則**：

- **最小值**: 0 (不重試)
- **最大值**: 10 次
- **警告日誌**: Console 會顯示調整警告

#### 驗證日誌範例

開發環境會自動輸出驗證警告：

```text
[Apollo Config] Timeout 100ms is too low, using minimum: 5000ms
[Apollo Config] Retry count 100 is too high, using maximum: 10
[Apollo Config] Initialized with: {
  timeout: '30000ms',
  maxRetries: 3,
  initialDelay: '300ms',
  maxDelay: '10000ms'
}
```

### 智能重試邏輯

Apollo Client 自動處理重試邏輯。

#### 會重試的操作

- ✅ 網路錯誤（連線中斷、超時）
- ✅ 5xx 伺服器錯誤（臨時伺服器問題）
- ✅ 通用 GraphQL 錯誤

#### 不會重試的操作

- ❌ `UNAUTHENTICATED` (401) - 用戶需要登入
- ❌ `FORBIDDEN` (403) - 用戶缺乏權限
- ❌ `BAD_USER_INPUT` (400) - 驗證錯誤
- ❌ `maxRetries: 0` 的操作

#### 指數退避

重試使用指數退避以避免壓垮伺服器：

```text
嘗試 1: 300ms 延遲
嘗試 2: 600ms 延遲
嘗試 3: 1200ms 延遲
嘗試 4: 2400ms 延遲
...最多到 maxDelay (預設 10000ms)
```

### 實作細節

#### 配置邊界

所有配置值都在安全邊界內驗證：

| 參數              | 最小值       | 最大值           | 預設值         | 用途         |
| ----------------- | ------------ | ---------------- | -------------- | ------------ |
| **Timeout**       | 5,000ms (5s) | 300,000ms (5min) | 30,000ms (30s) | 請求超時     |
| **Max Retries**   | 0            | 10               | 3              | 最大重試次數 |
| **Initial Delay** | 100ms        | 60,000ms (1min)  | 300ms          | 首次重試延遲 |
| **Max Delay**     | 100ms        | 60,000ms (1min)  | 10,000ms (10s) | 最大指數退避 |

#### 核心配置檔案

**`src/lib/apollo.config.ts`**

- 集中管理 Apollo Client 配置
- 從環境變數讀取配置
- 自動配置驗證
- 提供驗證函數

#### 修改的檔案

**`src/lib/apollo-retry-link.ts`**

- 支援 per-operation `maxRetries` 覆蓋
- 向下兼容現有代碼

**`src/lib/apollo-timeout-link.ts`**

- 自動 timeout 值驗證
- 防止極端值（如 1ms 或 999999ms）

**`src/lib/apollo-client.ts`**

- 使用 `apollo.config.ts` 的配置
- 可通過環境變數調整
- 無需修改代碼即可調整

### 技術決策

#### 為什麼選擇環境變數？

1. **符合 12-Factor App** - 配置與代碼分離
2. **環境差異化** - Dev/UAT/Prod 可使用不同配置
3. **運維友善** - 無需重新編譯即可調整
4. **安全性** - 敏感配置不會進入代碼庫

#### 為什麼支援 Per-Operation 覆蓋？

1. **靈活性** - 不同操作有不同需求
2. **代碼可讀性** - 特殊配置在使用處明確標示
3. **向下兼容** - 不影響現有代碼

#### 為什麼需要配置驗證？

1. **防止人為錯誤** - 自動修正不合理的值
2. **系統穩定性** - 避免極端值導致的問題
3. **開發體驗** - 警告訊息幫助快速發現問題

---

## 錯誤處理功能

### P0: 基礎錯誤處理

#### GlobalErrorBoundary

自動捕獲所有 React 渲染錯誤：

```typescript
// 自動啟用，無需配置
// 顯示友善的錯誤頁面並記錄錯誤
```

#### 錯誤分類系統

自動將錯誤分類為 9 種類別：

```typescript
enum ErrorCategory {
  AUTHENTICATION = 'AUTHENTICATION', // 認證錯誤
  AUTHORIZATION = 'AUTHORIZATION', // 授權錯誤
  NETWORK = 'NETWORK', // 網路錯誤
  GRAPHQL = 'GRAPHQL', // GraphQL 錯誤
  VALIDATION = 'VALIDATION', // 驗證錯誤
  BUSINESS_LOGIC = 'BUSINESS_LOGIC', // 業務邏輯錯誤
  COMPONENT = 'COMPONENT', // 組件錯誤
  RUNTIME = 'RUNTIME', // 運行時錯誤
  UNKNOWN = 'UNKNOWN', // 未知錯誤
}
```

### P1: 監控與追蹤

#### Sentry 整合

配置 Sentry DSN 後自動啟用：

```bash
# .env
NEXT_PUBLIC_SENTRY_DSN=https://your-sentry-dsn@sentry.io/project-id
NEXT_PUBLIC_APP_VERSION=1.0.0
```

**自動功能**：

- ✅ 錯誤自動上報到 Sentry
- ✅ 包含完整的錯誤堆棧
- ✅ 記錄用戶資訊（如已登入）
- ✅ 記錄環境上下文（瀏覽器、OS 等）
- ✅ Session Replay（錯誤重現）

#### 用戶追蹤

登入後自動追蹤用戶：

```typescript
// 自動執行，無需手動呼叫
// 登入時: setErrorTrackingUser(user)
// 登出時: clearErrorTrackingUser()
```

### P2: 增強功能

#### FeatureErrorBoundary

功能級錯誤隔離：

```typescript
import { FeatureErrorBoundary } from '@/components/errors';

<FeatureErrorBoundary
  featureName="購物車"
  showRetry={true}
>
  <ShoppingCart />
</FeatureErrorBoundary>
```

**效果**：購物車出錯時，只顯示購物車區域的錯誤訊息，不影響其他功能

#### Apollo Retry Link

自動重試失敗的網路請求：

```typescript
// 自動啟用，使用指數退避策略
// 重試間隔: 300ms → 600ms → 1200ms → ...
```

#### Apollo Timeout Link

自動取消超時的請求：

```typescript
// 自動啟用
// 預設 30 秒超時（可通過環境變數調整）
```

#### useErrorRecovery Hook

智能錯誤恢復：

```typescript
import { useErrorRecovery } from '@/hooks/useErrorRecovery';

function MyComponent() {
  const { error, handleError, retry, clearError } = useErrorRecovery();

  const handleAction = async () => {
    try {
      await someAsyncOperation();
    } catch (err) {
      handleError(err, '操作失敗，請重試');
    }
  };

  return (
    <div>
      {error && (
        <AlertMessage
          severity="error"
          showRetry={error.retryable}
          onRetry={retry}
        >
          {error.message}
        </AlertMessage>
      )}
      <button onClick={handleAction}>執行操作</button>
    </div>
  );
}
```

#### useFormErrorHandler Hook

表單錯誤處理：

```typescript
import { useFormErrorHandler } from '@/hooks/useFormErrorHandler';
import { useForm } from 'react-hook-form';

function MyForm() {
  const { setError } = useForm();
  const { handleFormError, handleFieldErrors } = useFormErrorHandler({
    setError,
    fieldMapping: {
      emailAddress: 'email',  // 映射服務端欄位名
    },
  });

  const onSubmit = async (data) => {
    try {
      await submitForm(data);
    } catch (error) {
      handleFormError(error);  // 自動處理驗證錯誤
    }
  };

  return <form onSubmit={handleSubmit(onSubmit)}>...</form>;
}
```

---

## 使用範例

### 基本使用

#### 1. 使用預設配置

大多數操作使用環境變數定義的預設值：

```typescript
import { useQuery } from '@apollo/client/react';
import { ME_QUERY } from '@/lib/graphql';

function UserProfile() {
  // 使用預設配置:
  // - Timeout: 30s (開發環境) / 60s (生產環境)
  // - Max Retries: 3 (開發環境) / 5 (生產環境)
  const { data, loading, error } = useQuery(ME_QUERY);

  if (loading) return <div>載入中...</div>;
  if (error) return <div>錯誤: {error.message}</div>;

  return <div>{data.me.name}</div>;
}
```

---

### 進階使用

#### 2. 文件上傳 - 長超時，不重試

```typescript
import { useMutation } from '@apollo/client';
import { UPLOAD_FILE } from '@/graphql/mutations';
import { useErrorRecovery } from '@/hooks/useErrorRecovery';

function FileUploader() {
  const { handleError } = useErrorRecovery();

  const [uploadFile, { loading }] = useMutation(UPLOAD_FILE, {
    // 文件上傳專用配置
    context: {
      timeout: 300000,  // 5 分鐘 - 大文件需要更長時間
      maxRetries: 0,    // 不重試 - 避免重複上傳
    },
    onError: (error) => {
      handleError(error, '文件上傳失敗');
    },
  });

  const handleUpload = async (file: File) => {
    try {
      const result = await uploadFile({
        variables: { file },
      });
      console.log('上傳成功:', result);
    } catch (err) {
      console.error('上傳失敗:', err);
    }
  };

  return (
    <input
      type="file"
      onChange={(e) => e.target.files?.[0] && handleUpload(e.target.files[0])}
      disabled={loading}
    />
  );
}
```

#### 3. 報表生成 - 超長超時，少重試

```typescript
import { useLazyQuery } from '@apollo/client';
import { GENERATE_REPORT } from '@/graphql/queries';

function ReportGenerator() {
  const [generateReport, { data, loading, error }] = useLazyQuery(
    GENERATE_REPORT,
    {
      // 報表生成專用配置
      context: {
        timeout: 120000,  // 2 分鐘 - 報表生成需要較長時間
        maxRetries: 1,    // 只重試一次 - 避免重複生成
      },
    }
  );

  const handleGenerate = async () => {
    try {
      await generateReport({
        variables: {
          startDate: '2024-01-01',
          endDate: '2024-12-31',
        },
      });
    } catch (err) {
      console.error('報表生成失敗:', err);
    }
  };

  return (
    <div>
      <button onClick={handleGenerate} disabled={loading}>
        {loading ? '生成中...' : '生成報表'}
      </button>
      {data && <ReportView data={data.report} />}
      {error && <div>錯誤: {error.message}</div>}
    </div>
  );
}
```

#### 4. 即時數據輪詢 - 短超時，不重試

```typescript
import { useQuery } from '@apollo/client';
import { GET_LIVE_STATS } from '@/graphql/queries';

function LiveDashboard() {
  const { data, loading } = useQuery(GET_LIVE_STATS, {
    // 每 5 秒輪詢一次
    pollInterval: 5000,
    // 輪詢專用配置
    context: {
      timeout: 10000,   // 10 秒 - 輪詢應快速失敗
      maxRetries: 0,    // 不重試 - 下次輪詢會自動重新請求
    },
  });

  return (
    <div>
      <h2>即時統計</h2>
      {loading && <span>更新中...</span>}
      {data && (
        <div>
          <p>線上用戶: {data.stats.onlineUsers}</p>
          <p>今日訪問: {data.stats.todayVisits}</p>
        </div>
      )}
    </div>
  );
}
```

#### 5. 關鍵支付操作 - 更多重試

```typescript
import { useMutation } from '@apollo/client';
import { PROCESS_PAYMENT } from '@/graphql/mutations';
import { useErrorRecovery } from '@/hooks/useErrorRecovery';

function PaymentForm() {
  const { handleError } = useErrorRecovery();

  const [processPayment, { loading }] = useMutation(PROCESS_PAYMENT, {
    // 支付操作專用配置
    context: {
      timeout: 45000,   // 45 秒 - 支付需要較長時間
      maxRetries: 5,    // 5 次重試 - 確保成功率
    },
  });

  const handleSubmit = async (paymentData: PaymentData) => {
    try {
      const result = await processPayment({
        variables: paymentData,
      });

      if (result.data?.processPayment.success) {
        console.log('支付成功');
      }
    } catch (err) {
      handleError(err, '支付失敗，請稍後再試');
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      {/* 表單欄位 */}
      <button type="submit" disabled={loading}>
        {loading ? '處理中...' : '確認支付'}
      </button>
    </form>
  );
}
```

#### 6. 背景同步 - 極長超時

```typescript
import { useMutation } from '@apollo/client';
import { SYNC_ALL_DATA } from '@/graphql/mutations';
import { useSnackbar } from 'notistack';

function DataSyncButton() {
  const { enqueueSnackbar } = useSnackbar();

  const [syncData, { loading }] = useMutation(SYNC_ALL_DATA, {
    // 背景同步專用配置
    context: {
      timeout: 180000,  // 3 分鐘 - 大量數據同步
      maxRetries: 10,   // 最多 10 次重試 - 確保同步完成
    },
  });

  const handleSync = async () => {
    try {
      enqueueSnackbar('開始同步數據...', { variant: 'info' });
      await syncData();
      enqueueSnackbar('數據同步完成', { variant: 'success' });
    } catch (err) {
      enqueueSnackbar('同步失敗，請檢查網路連線', { variant: 'error' });
    }
  };

  return (
    <button onClick={handleSync} disabled={loading}>
      {loading ? '同步中...' : '同步數據'}
    </button>
  );
}
```

#### 7. 批量操作 - 自訂配置

```typescript
import { useMutation } from '@apollo/client';
import { BATCH_UPDATE_USERS } from '@/graphql/mutations';

function BatchUserUpdate() {
  const [batchUpdate, { loading }] = useMutation(BATCH_UPDATE_USERS, {
    // 批量操作專用配置
    context: {
      timeout: 90000,   // 1.5 分鐘 - 批量更新需要時間
      maxRetries: 2,    // 2 次重試 - 平衡成功率和效能
    },
  });

  const handleBatchUpdate = async (userIds: string[], updates: UserUpdate) => {
    try {
      const result = await batchUpdate({
        variables: { userIds, updates },
      });
      console.log(`成功更新 ${result.data.batchUpdate.count} 位用戶`);
    } catch (err) {
      console.error('批量更新失敗:', err);
    }
  };

  return (
    <button onClick={() => handleBatchUpdate(selectedIds, updates)}>
      {loading ? '更新中...' : '批量更新'}
    </button>
  );
}
```

#### 8. 功能隔離

```typescript
import { FeatureErrorBoundary } from '@/components/errors';

function Dashboard() {
  return (
    <div>
      <h1>儀表板</h1>

      <FeatureErrorBoundary featureName="統計圖表">
        <StatisticsChart />
      </FeatureErrorBoundary>

      <FeatureErrorBoundary featureName="最新通知">
        <NotificationList />
      </FeatureErrorBoundary>

      <FeatureErrorBoundary featureName="任務列表">
        <TaskList />
      </FeatureErrorBoundary>
    </div>
  );
}
```

**效果**：任一區塊出錯不會影響其他區塊

#### 9. 表單驗證錯誤處理

```typescript
import { useForm } from 'react-hook-form';
import { useMutation } from '@apollo/client';
import { useFormErrorHandler } from '@/hooks/useFormErrorHandler';
import { FormField } from '@/components/molecules/FormField';

function RegistrationForm() {
  const { register, handleSubmit, setError, formState: { errors } } = useForm();
  const { handleFormError } = useFormErrorHandler({ setError });

  const [registerUser] = useMutation(REGISTER_USER, {
    onError: handleFormError,  // 自動處理服務端驗證錯誤
  });

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <FormField
        {...register('email')}
        label="Email"
        error={errors.email}
      />
      <FormField
        {...register('username')}
        label="Username"
        error={errors.username}
      />
      <button type="submit">註冊</button>
    </form>
  );
}
```

---

### 動態配置

#### 10. 根據條件調整配置

```typescript
import { useQuery } from '@apollo/client';
import { GET_DATA } from '@/graphql/queries';

function DynamicConfigQuery({ isLargeDataset }: { isLargeDataset: boolean }) {
  const { data, loading } = useQuery(GET_DATA, {
    context: {
      // 根據數據量調整超時時間
      timeout: isLargeDataset ? 120000 : 30000,
      // 大數據集減少重試次數
      maxRetries: isLargeDataset ? 1 : 3,
    },
  });

  return <div>{loading ? '載入中...' : JSON.stringify(data)}</div>;
}
```

#### 11. 根據網路狀態調整

```typescript
import { useQuery } from '@apollo/client';
import { GET_CONTENT } from '@/graphql/queries';
import { useOnlineStatus } from '@/hooks/useOnlineStatus';

function AdaptiveQuery() {
  const isOnline = useOnlineStatus();
  const isFastConnection = navigator.connection?.effectiveType === '4g';

  const { data, loading } = useQuery(GET_CONTENT, {
    context: {
      // 慢速網路使用更長的超時時間
      timeout: isFastConnection ? 30000 : 60000,
      // 離線時不重試
      maxRetries: isOnline ? 3 : 0,
    },
    // 離線時不執行查詢
    skip: !isOnline,
  });

  if (!isOnline) return <div>離線模式</div>;
  if (loading) return <div>載入中...</div>;

  return <div>{data?.content}</div>;
}
```

---

### 錯誤處理整合

#### 12. 與錯誤處理系統整合

```typescript
import { useMutation } from '@apollo/client';
import { CREATE_ORDER } from '@/graphql/mutations';
import { useErrorRecovery } from '@/hooks/useErrorRecovery';
import { useFormErrorHandler } from '@/hooks/useFormErrorHandler';

function OrderForm() {
  const { handleError, retry } = useErrorRecovery();
  const { handleFormError } = useFormErrorHandler({ setError });

  const [createOrder, { loading }] = useMutation(CREATE_ORDER, {
    context: {
      timeout: 45000,
      maxRetries: 3,
    },
    // 錯誤時的回調
    onError: (error) => {
      // 檢查是否為表單驗證錯誤
      if (error.graphQLErrors?.some(
        (e) => e.extensions?.code === 'BAD_USER_INPUT'
      )) {
        handleFormError(error);
      } else {
        // 其他錯誤使用通用錯誤處理
        handleError(error, '訂單創建失敗');
      }
    },
  });

  return (
    <form onSubmit={handleSubmit}>
      {/* 表單欄位 */}
    </form>
  );
}
```

---

### 測試範例

#### 13. 配置驗證測試

```typescript
import { validateTimeout, validateMaxRetries } from '@/lib/apollo.config';

describe('Apollo Config Validation', () => {
  it('validates timeout correctly', () => {
    expect(validateTimeout(100)).toBe(5000); // 最小值
    expect(validateTimeout(9999999)).toBe(300000); // 最大值
    expect(validateTimeout(30000)).toBe(30000); // 正常值
  });

  it('validates max retries correctly', () => {
    expect(validateMaxRetries(-1)).toBe(0); // 最小值
    expect(validateMaxRetries(100)).toBe(10); // 最大值
    expect(validateMaxRetries(3)).toBe(3); // 正常值
  });
});
```

#### 14. 超時處理測試

```typescript
import { MockedProvider } from '@apollo/client/testing/react';
import { render, waitFor } from '@testing-library/react';
import { GET_DATA } from '@/graphql/queries';

describe('Timeout Handling', () => {
  it('handles timeout correctly', async () => {
    const mocks = [
      {
        request: { query: GET_DATA },
        result: { data: { value: 'test' } },
        // 模擬 35 秒延遲 (超過預設 30s timeout)
        delay: 35000,
      },
    ];

    const { getByText } = render(
      <MockedProvider mocks={mocks}>
        <MyComponent />
      </MockedProvider>
    );

    // 驗證顯示超時錯誤
    await waitFor(() => {
      expect(getByText(/timeout/i)).toBeInTheDocument();
    }, { timeout: 40000 });
  });
});
```

#### 15. 重試行為測試

```typescript
import { MockedProvider } from '@apollo/client/testing/react';
import { render, waitFor } from '@testing-library/react';

describe('Retry Behavior', () => {
  it('retries on network error', async () => {
    const mocks = [
      {
        request: { query: GET_DATA },
        error: new Error('Network error'),
      },
      {
        request: { query: GET_DATA },
        error: new Error('Network error'),
      },
      {
        request: { query: GET_DATA },
        result: { data: { value: 'success' } },
      },
    ];

    const { getByText } = render(
      <MockedProvider mocks={mocks}>
        <MyComponent />
      </MockedProvider>
    );

    // 驗證最終成功
    await waitFor(() => {
      expect(getByText('success')).toBeInTheDocument();
    });
  });

  it('does not retry on authentication error', async () => {
    const mocks = [
      {
        request: { query: GET_DATA },
        result: {
          errors: [
            {
              message: 'Unauthenticated',
              extensions: { code: 'UNAUTHENTICATED' },
            },
          ],
        },
      },
    ];

    const { getByText } = render(
      <MockedProvider mocks={mocks}>
        <MyComponent />
      </MockedProvider>
    );

    // 驗證立即顯示錯誤，不重試
    await waitFor(() => {
      expect(getByText(/unauthenticated/i)).toBeInTheDocument();
    });
  });
});
```

---

### 監控與日誌

#### 16. 添加自訂日誌

```typescript
import { useQuery } from '@apollo/client';
import { GET_DATA } from '@/graphql/queries';

function MonitoredQuery() {
  const startTime = Date.now();

  const { data, loading, error } = useQuery(GET_DATA, {
    context: {
      timeout: 30000,
      maxRetries: 3,
    },
    onCompleted: () => {
      const duration = Date.now() - startTime;
      console.log(`[Query] GET_DATA completed in ${duration}ms`);

      // 記錄慢查詢
      if (duration > 10000) {
        console.warn(`[Query] Slow query detected: ${duration}ms`);
      }
    },
    onError: (error) => {
      console.error(`[Query] GET_DATA failed:`, error);
    },
  });

  return <div>{/* 渲染邏輯 */}</div>;
}
```

---

## 最佳實踐

### 應該做的事

#### 1. 使用環境變數管理全局配置

```bash
# .env.prod
NEXT_PUBLIC_APOLLO_TIMEOUT=60000
NEXT_PUBLIC_APOLLO_MAX_RETRIES=5
NEXT_PUBLIC_SENTRY_DSN=your-prod-dsn
```

#### 2. Per-Operation 覆蓋特殊場景

```typescript
// 文件上傳
context: { timeout: 300000, maxRetries: 0 }

// 快速輪詢
context: { timeout: 5000, maxRetries: 0 }
```

#### 3. 考慮操作特性

- **冪等操作**：可以安全重試
- **非冪等操作**（上傳、支付）：停用重試
- **長時間任務**：增加超時

#### 4. 使用 FeatureErrorBoundary 隔離功能

```typescript
<FeatureErrorBoundary featureName="功能名稱">
  <MyFeature />
</FeatureErrorBoundary>
```

#### 5. 整合錯誤處理 Hooks

```typescript
const { handleError, retry } = useErrorRecovery();
const { handleFormError } = useFormErrorHandler({ setError });
```

#### 6. 啟用 Sentry 追蹤線上錯誤

```bash
# Production 環境必須啟用
NEXT_PUBLIC_SENTRY_DSN=your-sentry-dsn
```

#### 7. 測試不同網路條件

```bash
# 在 UAT 環境模擬慢速網路
NEXT_PUBLIC_APOLLO_TIMEOUT=45000
NEXT_PUBLIC_APOLLO_MAX_RETRIES=4
```

### 不要做的事

#### 1. 不要使用極端值

```typescript
// ❌ 錯誤: 太短，會經常失敗
context: {
  timeout: 1000;
}

// ❌ 錯誤: 太長，用戶體驗差
context: {
  timeout: 600000;
}

// ✅ 正確: 使用合理值
context: {
  timeout: 45000;
}
```

#### 2. 不要重試非冪等操作

```typescript
// ❌ 錯誤: 可能創建重複訂單
const [createOrder] = useMutation(CREATE_ORDER);

// ✅ 正確: 停用 mutations 的重試
const [createOrder] = useMutation(CREATE_ORDER, {
  context: { maxRetries: 0 },
});
```

#### 3. 不要忽略網路錯誤

```typescript
// ❌ 錯誤: 靜默失敗
const { data } = useQuery(GET_DATA, { errorPolicy: 'ignore' });

// ✅ 正確: 正確處理錯誤
const { data, error } = useQuery(GET_DATA);
if (error) handleError(error);
```

#### 4. 不要在生產環境關閉 Sentry

```bash
# ❌ 錯誤: 生產環境沒有錯誤追蹤
NEXT_PUBLIC_SENTRY_DSN=

# ✅ 正確: 啟用 Sentry
NEXT_PUBLIC_SENTRY_DSN=your-prod-dsn
```

---

## 疑難排解

### 問題 1: 操作經常超時

**症狀**：GraphQL 操作經常顯示超時錯誤

**解決方案**：

```typescript
// 方案 A: 增加全局超時時間
// .env
NEXT_PUBLIC_APOLLO_TIMEOUT = 45000;

// 方案 B: 為特定操作增加超時
context: {
  timeout: 60000;
}
```

### 問題 2: 重試次數太多導致性能問題

**症狀**：網路錯誤時應用變慢

**解決方案**：

```bash
# 減少全局重試次數
NEXT_PUBLIC_APOLLO_MAX_RETRIES=2

# 或為特定操作禁用重試
context: { maxRetries: 0 }
```

### 問題 3: Sentry 未收到錯誤報告

**檢查清單**：

1. ✅ 確認 `NEXT_PUBLIC_SENTRY_DSN` 已設定
2. ✅ 確認 DSN 格式正確
3. ✅ 檢查 Console 是否有 Sentry 初始化日誌
4. ✅ 測試環境確認錯誤是否觸發

```typescript
// 手動測試 Sentry
throw new Error('Test Sentry Integration');
```

### 問題 4: 配置警告頻繁出現

**症狀**：Console 顯示配置調整警告

```text
[Apollo Config] Timeout 100ms is too low, using minimum: 5000ms
```

**解決方案**：檢查並修正環境變數或 context 配置

```bash
# 修正環境變數
NEXT_PUBLIC_APOLLO_TIMEOUT=30000  # 使用合理值

# 或修正 per-operation 配置
context: { timeout: 30000 }  # 而非 100
```

### 問題 5: 文件上傳被重試

**症狀**：文件重複上傳

**解決方案**：

```typescript
const [uploadFile] = useMutation(UPLOAD_FILE, {
  context: {
    maxRetries: 0, // 禁用重試
  },
});
```

### 問題 6: 環境變數未生效

**症狀**：修改 .env 檔案沒有效果

**解決方案**：

```bash
# 1. 確認變數有 NEXT_PUBLIC_ 前綴
NEXT_PUBLIC_APOLLO_TIMEOUT=30000  # ✅ 正確

# 2. 重啟開發服務器
pnpm dev

# 3. 清除 Next.js 快取
rm -rf .next
pnpm dev
```

### 問題 7: GraphQL 錯誤不重試

**症狀**：某些錯誤從不重試

**說明**：以下錯誤設計上不會重試：

- `UNAUTHENTICATED` (401) - 用戶需要登入
- `FORBIDDEN` (403) - 用戶缺乏權限
- `BAD_USER_INPUT` (400) - 驗證錯誤

**解決方案**：在代碼中明確處理這些錯誤

```typescript
const { data, error } = useQuery(GET_DATA);

if (
  error?.graphQLErrors?.some((e) => e.extensions?.code === 'UNAUTHENTICATED')
) {
  // 重定向到登入頁面
  router.push('/login');
}
```

---

## 配置快速參考

### 環境變數

| 變數                                     | 預設值 | 範圍        | 說明             |
| ---------------------------------------- | ------ | ----------- | ---------------- |
| `NEXT_PUBLIC_APOLLO_TIMEOUT`             | 30000  | 5000-300000 | 請求超時（毫秒） |
| `NEXT_PUBLIC_APOLLO_MAX_RETRIES`         | 3      | 0-10        | 最大重試次數     |
| `NEXT_PUBLIC_APOLLO_RETRY_INITIAL_DELAY` | 300    | 100-60000   | 初始延遲（毫秒） |
| `NEXT_PUBLIC_APOLLO_RETRY_MAX_DELAY`     | 10000  | 100-60000   | 最大延遲（毫秒） |
| `NEXT_PUBLIC_SENTRY_DSN`                 | （空） | -           | Sentry DSN       |

### Per-Operation 參數

| 參數         | 類型     | 說明             | 範例     |
| ------------ | -------- | ---------------- | -------- |
| `timeout`    | `number` | 覆蓋請求超時     | `120000` |
| `maxRetries` | `number` | 覆蓋最大重試次數 | `0`      |

### 錯誤分類

| 類別             | 說明           | 自動重試        |
| ---------------- | -------------- | --------------- |
| `AUTHENTICATION` | 認證錯誤 (401) | ❌ 否           |
| `AUTHORIZATION`  | 授權錯誤 (403) | ❌ 否           |
| `VALIDATION`     | 驗證錯誤 (400) | ❌ 否           |
| `NETWORK`        | 網路錯誤       | ✅ 是           |
| `GRAPHQL`        | GraphQL 錯誤   | ✅ 是（視情況） |
| `COMPONENT`      | 組件錯誤       | ❌ 否           |
| `BUSINESS_LOGIC` | 業務邏輯錯誤   | ❌ 否           |
| `RUNTIME`        | 運行時錯誤     | ❌ 否           |
| `UNKNOWN`        | 未知錯誤       | ❌ 否           |

### 常見場景配置

| 場景         | Timeout | Max Retries | 原因                     |
| ------------ | ------- | ----------- | ------------------------ |
| **一般查詢** | 30s     | 3           | 預設值，適合大多數情況   |
| **文件上傳** | 300s    | 0           | 長時間操作，避免重複     |
| **報表生成** | 120s    | 1           | 長時間操作，少量重試     |
| **即時輪詢** | 10s     | 0           | 快速失敗，下次輪詢會重試 |
| **支付操作** | 45s     | 5           | 關鍵操作，提高成功率     |
| **背景同步** | 180s    | 10          | 非即時操作，確保完成     |
| **批量操作** | 90s     | 2           | 平衡時間和成功率         |

---

## 遷移指南

### 現有代碼無需修改

此系統**完全向下兼容**。現有代碼會自動使用環境變數配置：

```typescript
// 現有代碼繼續正常運作
const { data } = useQuery(GET_USER);
// 現在會使用環境變數中的配置，而非硬編碼的 30s/3 retries
```

### 選擇性升級

如果需要自訂特定操作的行為：

```typescript
// 之前: 使用預設值
const [uploadFile] = useMutation(UPLOAD_FILE);

// 之後: 針對文件上傳優化
const [uploadFile] = useMutation(UPLOAD_FILE, {
  context: {
    timeout: 300000, // 5 分鐘
    maxRetries: 0, // 不重試
  },
});
```

---

## 相關文檔

- [Environment Variables](../infrastructure/ENVIRONMENT_VARIABLES.md) - 環境變數完整說明
- [Frontend Integration](./FRONTEND_INTEGRATION.md) - 前端整合指南
- [Apollo Client 官方文檔](https://www.apollographql.com/docs/react/)
- [Sentry 官方文檔](https://docs.sentry.io/)
- [12-Factor App: Config](https://12factor.net/config)
