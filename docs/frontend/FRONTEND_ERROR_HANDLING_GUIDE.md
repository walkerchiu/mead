# 前端錯誤處理指南

入口網的錯誤處理：以 React Error Boundary 攔截渲染錯誤、全域 handler 攔截未處理的例外，統一分類後呈現友善畫面，並可選擇上報 Sentry。

## 組成

| 層               | 檔案                                                                                 | 作用                                              |
| ---------------- | ------------------------------------------------------------------------------------ | ------------------------------------------------- |
| Error Boundaries | `src/components/errors/`                                                             | 攔截 React 渲染錯誤                               |
| 全域 handler     | `src/lib/global-error-handler.ts`                                                    | 攔截 `window.onerror`、未處理的 promise rejection |
| 錯誤模型         | `src/types/errors.ts`、`src/lib/error-handler.ts`                                    | `AppError` 型別、分類與復原動作                   |
| 追蹤             | `src/lib/error-tracking.ts`、`src/lib/sentry-service.ts`、`src/lib/error-context.ts` | 統一上報介面、Sentry 服務、環境／瀏覽器情境       |
| 呈現             | `src/components/molecules/ErrorDisplay`、`AlertMessage`                              | 整頁／行內錯誤 UI                                 |

## Error Boundaries

從 `@/components/errors` 引用。

### ClientErrorBoundary

應用最外層客戶端邊界，已套在 `app/layout.tsx`。掛載時初始化全域錯誤處理、Sentry 服務（有 DSN 才啟用）與錯誤情境，內部再包一層 `GlobalErrorBoundary`。

```tsx
import { ClientErrorBoundary } from '@/components/errors';

<ClientErrorBoundary>{children}</ClientErrorBoundary>;
```

### GlobalErrorBoundary

攔截整棵樹的渲染錯誤，預設以 `ErrorDisplay` 顯示「Something went wrong」並提供重新整理；錯誤經 `createAppError` 包裝後以 `logError` 上報。可傳 `fallback` 自訂後備 UI、`onError` 接收回呼。

### FeatureErrorBoundary

隔離單一功能區塊的錯誤，避免整頁崩潰；以 `AlertMessage` 行內呈現，可選 retry。

```tsx
import { FeatureErrorBoundary } from '@/components/errors';

<FeatureErrorBoundary featureName="Plan carousel" showRetry>
  <PlanCarousel … />
</FeatureErrorBoundary>;
```

## 錯誤模型

`src/types/errors.ts` 定義 `AppError`，以 `ErrorCategory`、`ErrorSeverity` 分類。`src/lib/error-handler.ts` 提供：

- `createAppError(options)` — 由原始錯誤建立標準化 `AppError`。
- `classifyError(error)` — 推斷錯誤分類。
- `shouldDisplayError(error)` — 是否該對使用者呈現。
- `getRecoveryAction(error)` — 推得建議的復原動作。

## 全域錯誤攔截

`initGlobalErrorHandlers()`（由 `ClientErrorBoundary` 呼叫）掛上 `window` 的 `error` 與 `unhandledrejection` 監聽，把跑出 React 樹外的例外也納入統一上報；`resetGlobalErrorHandlers()` 用於還原。

## 追蹤與 Sentry

- `errorTracker`（`error-tracking.ts`）是統一上報入口，可掛多個實作 `ErrorTrackingService` 的服務；`logError` / `logMessage` / `setUser` / `setContext` 為便捷函式。
- `createSentryService()`（`sentry-service.ts`）僅在設定 Sentry DSN 時回傳服務實例，否則為 `null`。DSN 由環境變數 `NEXT_PUBLIC_SENTRY_DSN` 提供（見 `apps/frontend/.env.example`）。
- `error-context.ts` 蒐集環境與瀏覽器情境（`initErrorContext` / `updateBrowserContext`），附在上報內容中。

## 呈現元件

- `ErrorDisplay` — 整頁／整區錯誤（404、伺服器錯誤、網路錯誤等）。
- `AlertMessage` — 行內提示（success / error / warning / info，可關閉、可帶動作）。

兩者見 [組件庫 — Molecules](./component-library/MOLECULES.md)。

## 相關文檔

- [組件庫指南](./COMPONENT_LIBRARY.md)
- [CSP 實作指南](./CSP_IMPLEMENTATION.md)
