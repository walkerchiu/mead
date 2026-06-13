# Notifications Page

完整的通知管理頁面，提供通知的查看、管理和設定功能。

## 頁面結構

```text
/notifications
├── page.tsx          # 通知列表頁面
└── README.md         # 說明文件

/settings/notifications
└── page.tsx          # 通知設定頁面
```

## 功能特點

### 通知列表頁面 (`/notifications`)

#### 核心功能

1. **通知顯示**
   - 顯示所有用戶通知
   - 支援未讀/已讀狀態顯示
   - 即時更新（GraphQL Subscriptions）
   - 相對時間顯示（例如：5 分鐘前）

2. **篩選功能**
   - 全部通知
   - 僅未讀通知
   - 即時切換，無需重新載入

3. **通知操作**
   - 點擊通知：自動標記為已讀
   - 刪除單一通知：點擊 X 按鈕
   - 標記全部已讀：批次操作
   - 清除已讀通知：批次刪除

4. **頁面操作**
   - 返回按鈕：回到上一頁
   - 重新整理按鈕：手動重新整理通知列表
   - 設定按鈕：跳轉到通知設定頁面

5. **統計資訊**
   - 總通知數量
   - 未讀通知數量
   - 顯示/總數比例

#### 技術實作

- **GraphQL 整合**
  - 使用 `useNotifications` hook
  - 自動訂閱即時通知
  - Apollo Client 快取管理

- **狀態管理**
  - 本地篩選狀態（all/unread）
  - GraphQL 查詢參數動態調整

- **UI 組件**
  - NotificationItem atom 組件
  - Material-UI Card、Tabs、Button 等

### 通知設定頁面 (`/settings/notifications`)

#### 核心功能

1. **通知類型設定**
   - 資訊通知（INFO）
   - 成功通知（SUCCESS）
   - 警告通知（WARNING）
   - 錯誤通知（ERROR）

2. **通知渠道設定**
   - 瀏覽器通知（應用程式內）
   - 電子郵件通知
   - 推送通知（即將推出）

3. **進階設定**
   - 通知音效開關
   - 桌面通知開關
   - 行動裝置通知開關

4. **操作功能**
   - 即時切換開關
   - 儲存設定到後端
   - 取消變更

#### 技術實作

- **狀態管理**
  - 本地狀態管理（useState）
  - 使用 GraphQL mutations 與後端 API 整合

- **表單處理**
  - Switch 組件控制
  - 批次儲存設定

## 使用範例

### 導航到通知頁面

```tsx
import { useRouter } from 'next/navigation';

function MyComponent() {
  const router = useRouter();

  // 查看所有通知
  const viewNotifications = () => {
    router.push('/notifications');
  };

  // 查看未讀通知
  const viewUnreadNotifications = () => {
    router.push('/notifications?filter=unread');
  };

  // 通知設定
  const openSettings = () => {
    router.push('/settings/notifications');
  };
}
```

### 在 MainAppBar 中整合

```tsx
<MainAppBar
  user={currentUser}
  onViewAllNotifications={() => router.push('/notifications')}
  onNotificationSettingsClick={() => router.push('/settings/notifications')}
/>
```

### 在 NotificationCenter 中整合

```tsx
<NotificationCenter
  onViewAll={() => router.push('/notifications')}
  onSettingsClick={() => router.push('/settings/notifications')}
/>
```

## 頁面流程

```text
MainAppBar (通知鈴鐺)
    ↓ 點擊
NotificationCenter (下拉選單)
    ↓ 點擊「查看全部」
/notifications (通知列表頁面)
    ↓ 點擊「設定」
/settings/notifications (通知設定頁面)
```

## URL 參數

### 通知列表頁面

目前不支援 URL 參數，但可以擴展：

```tsx
// 可選的未來擴展
/notifications?filter=unread    // 僅顯示未讀
/notifications?type=ERROR        // 僅顯示錯誤通知
/notifications?page=2            // 分頁
```

## 權限控制

兩個頁面都使用 `ProtectedRoute` 包裝：

- 需要用戶登入
- 未登入會重定向到登入頁面
- 使用 JWT token 認證

## 響應式設計

### 桌面版

- 最大寬度：lg (1280px)
- 完整的操作按鈕
- 寬鬆的間距

### 平板版

- 自動調整容器寬度
- 保留所有功能

### 手機版

- 堆疊式佈局
- 簡化的操作按鈕
- 觸控友善的間距

## 效能優化

### 通知列表頁面

1. **查詢優化**
   - 限制每次載入 50 條通知
   - 使用 Apollo Client 快取
   - 增量載入（可擴展）

2. **即時更新**
   - WebSocket 連線復用
   - 自動重連機制
   - 訂閱生命週期管理

3. **渲染優化**
   - useCallback 避免重新渲染
   - 條件渲染減少 DOM 操作

### 通知設定頁面

1. **本地狀態**
   - 即時切換開關（無延遲）
   - 批次儲存（減少 API 呼叫）

2. **表單優化**
   - 防抖儲存（可擴展）
   - 樂觀更新（可擴展）

## 國際化 (i18n)

目前硬編碼為正體中文，可擴展為多語言：

```tsx
// pages/notifications/page.tsx
const t = useTranslations('pages.notifications');

<Typography variant="h4">{t('title')}</Typography>;
```

需要在 `messages/zh-TW.json` 中新增：

```json
{
  "pages": {
    "notifications": {
      "title": "通知中心",
      "filter": {
        "all": "全部",
        "unread": "未讀"
      },
      "actions": {
        "markAllRead": "全部標記為已讀",
        "clearRead": "清除已讀通知"
      }
    }
  }
}
```

## 後續改進

### 短期改進

- [ ] 新增分頁功能（無限滾動或傳統分頁）
- [ ] 新增通知搜尋功能
- [ ] 新增通知類型篩選
- [ ] 實作通知設定後端 API
- [ ] 新增桌面通知權限請求

### 中期改進

- [ ] 新增通知分組（依日期、類型）
- [ ] 新增通知匯出功能
- [ ] 新增通知統計圖表
- [ ] 支援通知標籤/分類
- [ ] 新增通知優先級

### 長期改進

- [ ] 新增通知規則引擎
- [ ] 支援自訂通知範本
- [ ] 新增通知排程功能
- [ ] 支援通知轉發
- [ ] 新增通知分析報告

## 測試建議

### 單元測試

```tsx
// notifications/page.test.tsx
import { render, screen, fireEvent } from '@testing-library/react';
import NotificationsPage from './page';

test('renders notification list', () => {
  render(<NotificationsPage />);
  expect(screen.getByText('通知中心')).toBeInTheDocument();
});

test('filters unread notifications', () => {
  render(<NotificationsPage />);
  const unreadTab = screen.getByText('未讀');
  fireEvent.click(unreadTab);
  // Assert filtered results
});
```

### E2E 測試

```tsx
// e2e/notifications.spec.ts
test('user can view and manage notifications', async ({ page }) => {
  // 1. 登入
  await page.goto('/login');
  await page.fill('[name="email"]', 'user@example.com');
  await page.fill('[name="password"]', 'password');
  await page.click('button[type="submit"]');

  // 2. 開啟通知頁面
  await page.goto('/notifications');
  await page.waitForSelector('text=通知中心');

  // 3. 篩選未讀通知
  await page.click('text=未讀');

  // 4. 標記全部已讀
  await page.click('text=全部標記為已讀');

  // 5. 驗證未讀數量變為 0
  await expect(page.locator('text=未讀 (0)')).toBeVisible();
});
```

## 常見問題

### Q: 通知沒有即時更新？

**A**: 確認以下幾點：

1. WebSocket 連線是否正常（檢查瀏覽器 Network 標籤）
2. Apollo Client 是否正確配置
3. 後端 GraphQL Subscriptions 是否啟用
4. `autoSubscribe` prop 是否設為 `true`

### Q: 通知列表載入很慢？

**A**: 可能的優化：

1. 減少 `limit` 參數（預設 50）
2. 實作虛擬滾動（react-window）
3. 新增分頁而非一次載入所有通知
4. 檢查 GraphQL 查詢效能

### Q: 如何自訂通知樣式？

**A**: 修改 NotificationItem 組件：

```tsx
// components/atoms/NotificationItem/NotificationItem.tsx
// 調整 sx prop 或使用自訂主題
```

### Q: 通知設定無法儲存？

**A**:

1. 確認網路連線正常
2. 檢查瀏覽器控制台錯誤訊息
3. 確認用戶已登入且有效的 session token

## 相關組件

- **NotificationCenter** (Organism): 通知下拉選單
- **NotificationList** (Molecule): 通知列表
- **NotificationItem** (Atom): 單一通知項目
- **useNotifications** (Hook): 通知管理 Hook
- **MainAppBar** (Layout): 應用程式導航欄

## 參考文件

- [NotificationCenter README](../../../components/organisms/NotificationCenter/README.md)
- [useNotifications Hook](../../../hooks/useNotifications.ts)
- [GraphQL Notification Schema](../../../graphql/notification.ts)
- [Backend Notification Module](../../../../../../backend/src/notification/README.md)
