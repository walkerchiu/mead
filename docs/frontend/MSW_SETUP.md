# MSW (Mock Service Worker) 設置指南

Storybook 與開發環境的 API Mock 完整設置指南。

---

## 目錄

- [MSW (Mock Service Worker) 設置指南](#msw-mock-service-worker-設置指南)
  - [目錄](#目錄)
  - [概述](#概述)
  - [必要步驟](#必要步驟)
    - [1. 初始化 MSW Service Worker](#1-初始化-msw-service-worker)
    - [2. 驗證檔案已創建](#2-驗證檔案已創建)
    - [3. 確認 Storybook 配置](#3-確認-storybook-配置)
    - [4. 重啟 Storybook](#4-重啟-storybook)
  - [驗證 MSW 是否正常工作](#驗證-msw-是否正常工作)
    - [方法 1: 檢查瀏覽器 Console](#方法-1-檢查瀏覽器-console)
    - [方法 2: 測試 Apollo + MSW Story](#方法-2-測試-apollo--msw-story)
    - [方法 3: 檢查 Network 標籤](#方法-3-檢查-network-標籤)
  - [MSW 在 Storybook 中的作用](#msw-在-storybook-中的作用)
    - [工作流程](#工作流程)
    - [好處](#好處)
  - [相關檔案](#相關檔案)
    - [Mock Handlers](#mock-handlers)
    - [Storybook 配置](#storybook-配置)
  - [故障排除](#故障排除)
    - [Q: Service Worker 註冊失敗](#q-service-worker-註冊失敗)
    - [Q: MSW 沒有攔截請求](#q-msw-沒有攔截請求)
    - [Q: 看到 CORS 錯誤](#q-看到-cors-錯誤)
    - [Q: Handler 沒有被調用](#q-handler-沒有被調用)
  - [進階配置](#進階配置)
    - [Story 級別的 Handler 覆蓋](#story-級別的-handler-覆蓋)
    - [延遲響應（模擬慢網路）](#延遲響應模擬慢網路)
  - [最佳實踐](#最佳實踐)
    - [驗收清單](#驗收清單)
  - [相關文檔](#相關文檔)

---

## 概述

MSW (Mock Service Worker) 是一個 API mocking 工具，可在開發和測試環境中攔截網路請求並返回模擬數據。本指南涵蓋在 Storybook 中設置和使用 MSW 的完整流程。

---

## 必要步驟

### 1. 初始化 MSW Service Worker

```bash
cd apps/frontend
npx msw init public/ --save
```

**這會做什麼？**

- 在 `public/` 目錄創建 `mockServiceWorker.js` (~9KB)
- 更新 `package.json` 加入 `msw.workerDirectory` 配置
- Service Worker 用於在瀏覽器中攔截網路請求

### 2. 驗證檔案已創建

```bash
ls -lh apps/frontend/public/mockServiceWorker.js
# 應該顯示: -rw-r--r-- ... 8.9K ... mockServiceWorker.js
```

### 3. 確認 Storybook 配置

檢查 `.storybook/main.ts`:

```typescript
const config: StorybookConfig = {
  staticDirs: [
    '../public', // ✅ 確保這行存在
  ],
};
```

### 4. 重啟 Storybook

```bash
# 如果 Storybook 正在運行，先停止
# 然後重新啟動
pnpm storybook
```

---

## 驗證 MSW 是否正常工作

### 方法 1: 檢查瀏覽器 Console

開啟 `http://localhost:6006`，打開瀏覽器開發者工具的 Console：

**成功的訊息**:

```text
[MSW] Mocking enabled.
```

或者 MSW 2.x 版本可能顯示：

```text
[MSW] Request interception enabled
```

**失敗的訊息**:

```text
[MSW] Failed to register a Service Worker
```

→ 需要執行 `npx msw init public/`

### 方法 2: 測試 Apollo + MSW Story

1. 導航到：`Example > Apollo + MSW Test`
2. 輸入：
   - Email 欄位（值為帳號 accountName）: `public_user`
   - Password: `Password123!`
3. 點擊「登入」
4. 應該看到：「✅ 登入成功！用戶: <public@example.com>」

**如果看到錯誤**:

- 檢查 Network 標籤，GraphQL 請求應該被 MSW 攔截（status 可能顯示為 `(from ServiceWorker)`）
- 如果請求到真實 API（顯示 CORS 錯誤），表示 MSW 沒有正常工作

### 方法 3: 檢查 Network 標籤

在開發者工具的 Network 標籤：

1. 執行登入測試
2. 找到 GraphQL 請求
3. **成功的標誌**:
   - Size: `(from ServiceWorker)` 或類似標記
   - Time: 非常快（幾毫秒）
   - Status: 200

---

## MSW 在 Storybook 中的作用

### 工作流程

```text
Story Component
    ↓
Apollo Client (useMutation)
    ↓
GraphQL Request
    ↓
MSW Service Worker (攔截)
    ↓
Mock Handler (返回假數據)
    ↓
Component 收到響應
```

### 好處

1. **不需要真實 API**: 前端開發不依賴後端
2. **可控制的測試場景**: 可以模擬成功、失敗、2FA 等各種情況
3. **快速迭代**: 不需要等待真實 API 響應
4. **離線開發**: 沒有網路也能開發

---

## 相關檔案

### Mock Handlers

```text
src/mocks/
├── handlers/
│   ├── auth.handlers.ts    # 認證相關的 GraphQL handlers
│   └── index.ts             # 匯出所有 handlers
├── fixtures/
│   └── users.ts             # 測試用戶數據
└── browser.ts (未使用)      # 瀏覽器環境的 MSW 設置
```

### Storybook 配置

```text
.storybook/
├── main.ts                  # staticDirs: ["../public"]
└── preview.tsx              # initialize MSW, mswLoader
```

---

## 故障排除

### Q: Service Worker 註冊失敗

**A**: 執行 `npx msw init public/ --save`

### Q: MSW 沒有攔截請求

**A**:

1. 確認 `mockServiceWorker.js` 存在
2. 確認 `.storybook/main.ts` 有 `staticDirs`
3. 重啟 Storybook
4. 清除瀏覽器快取（Cmd+Shift+R / Ctrl+Shift+R）

### Q: 看到 CORS 錯誤

**A**: 這表示請求沒有被 MSW 攔截，而是發送到真實 API。檢查：

- Handler 的 mutation/query 名稱是否正確
- MSW 是否正確初始化（檢查 Console）

### Q: Handler 沒有被調用

**A**: 檢查：

1. Handler 的 operation 名稱與 GraphQL 請求一致
2. Handler 已經在 `handlers/index.ts` 中匯出
3. Story 的 `parameters.msw.handlers` 配置正確（如果有自定義）

---

## 進階配置

### Story 級別的 Handler 覆蓋

在特定 story 中覆蓋全局 handler：

```typescript
export const LoginWithError: Story = {
  parameters: {
    msw: {
      handlers: [
        graphql.mutation('Login', () => {
          return HttpResponse.json({
            errors: [
              {
                message: 'Custom error for this story',
                extensions: { code: 'CUSTOM_ERROR' },
              },
            ],
          });
        }),
      ],
    },
  },
};
```

### 延遲響應（模擬慢網路）

```typescript
graphql.mutation('Login', async () => {
  await delay(2000); // 延遲 2 秒
  return HttpResponse.json({ data: { ... } });
}),
```

---

## 最佳實踐

### 驗收清單

完成設置後，確認：

- [ ] `public/mockServiceWorker.js` 檔案存在
- [ ] `.storybook/main.ts` 有 `staticDirs: ["../public"]`
- [ ] Storybook 啟動無錯誤
- [ ] 瀏覽器 Console 顯示 MSW 啟用訊息
- [ ] Apollo + MSW Test story 登入功能正常
- [ ] Network 標籤顯示請求來自 ServiceWorker

---

## 相關文檔

- [FRONTEND_INTEGRATION.md](./FRONTEND_INTEGRATION.md) - 前端整合指南
- [COMPONENT_LIBRARY.md](./COMPONENT_LIBRARY.md) - 組件庫開發
- [MSW 官方文檔](https://mswjs.io/) - Mock Service Worker 官方文檔
