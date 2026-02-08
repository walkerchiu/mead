# NotificationCenter Organism

完整的通知中心組件，整合 GraphQL 即時通知訂閱功能。

## 功能特點

- ✅ **即時通知訂閱**：使用 GraphQL Subscriptions 即時接收新通知
- ✅ **完整操作**：標記已讀、刪除通知、批次操作
- ✅ **篩選功能**：全部/未讀通知篩選
- ✅ **未讀徽章**：顯示未讀通知數量
- ✅ **響應式設計**：適配不同螢幕尺寸
- ✅ **自訂樣式**：支援多種配置選項
- ✅ **TypeScript**：完整的類型定義

## 組件架構

```
NotificationCenter (Organism)
├── Badge (Atom) - 未讀數量徽章
├── IconButton (MUI) - 觸發按鈕
├── Popover (MUI) - 下拉選單
└── NotificationList (Molecule) - 通知列表
    └── NotificationItem (Atom) - 單一通知項目
```

## 資料流

```
NotificationCenter
    ↓
useNotifications Hook
    ↓
Apollo Client
    ├── Query: GET_NOTIFICATIONS
    ├── Query: GET_UNREAD_COUNT
    ├── Mutation: MARK_AS_READ
    ├── Mutation: DELETE_NOTIFICATION
    └── Subscription: ON_NOTIFICATION_CREATED
    ↓
GraphQL Server (Backend)
    ↓
Database
```

## 使用範例

### 基本用法

```tsx
import { NotificationCenter } from '@/components/organisms';

export function AppBar() {
  return (
    <AppBar position="fixed">
      <Toolbar>
        <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
          My App
        </Typography>

        {/* 通知中心 */}
        <NotificationCenter />
      </Toolbar>
    </AppBar>
  );
}
```

### 完整配置

```tsx
import { NotificationCenter } from '@/components/organisms';
import { useRouter } from 'next/navigation';

export function Header() {
  const router = useRouter();

  return (
    <NotificationCenter
      // 樣式配置
      color="inherit"
      size="medium"
      // 功能配置
      autoSubscribe={true}
      showSettings={true}
      showViewAll={true}
      maxHeight={500}
      // 回調函數
      onViewAll={() => router.push('/notifications')}
      onSettingsClick={() => router.push('/settings/notifications')}
      onNotificationClick={(id) => {
        console.log('Notification clicked:', id);
        // 可以導航到相關頁面
      }}
    />
  );
}
```

### 整合到現有的 AppBar

```tsx
import { AppBar, Toolbar, Typography, Box } from '@mui/material';
import { NotificationCenter } from '@/components/organisms';
import { UserMenu, SettingsMenu } from '@/components/atoms';

export function MainAppBar() {
  return (
    <AppBar position="fixed">
      <Toolbar>
        <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
          Dashboard
        </Typography>

        <Box sx={{ display: 'flex', gap: 1 }}>
          {/* 通知中心 */}
          <NotificationCenter
            color="inherit"
            onViewAll={() => router.push('/notifications')}
            onSettingsClick={() => router.push('/settings/notifications')}
          />

          {/* 其他選單 */}
          <SettingsMenu />
          <UserMenu />
        </Box>
      </Toolbar>
    </AppBar>
  );
}
```

### 禁用即時訂閱（僅顯示現有通知）

```tsx
<NotificationCenter
  autoSubscribe={false}
  onViewAll={() => router.push('/notifications')}
/>
```

### 最簡配置（無額外按鈕）

```tsx
<NotificationCenter
  showSettings={false}
  showViewAll={false}
  onNotificationClick={(id) => {
    // 處理通知點擊
    markNotificationAsRead(id);
  }}
/>
```

### 自訂高度

```tsx
<NotificationCenter
  maxHeight={400}
  onViewAll={() => router.push('/notifications')}
/>
```

## Props

### NotificationCenterProps

| 屬性                  | 類型                                                 | 預設值      | 說明                 |
| --------------------- | ---------------------------------------------------- | ----------- | -------------------- |
| `color`               | `'inherit' \| 'primary' \| 'secondary' \| 'default'` | `'inherit'` | 按鈕顏色             |
| `size`                | `'small' \| 'medium' \| 'large'`                     | `'medium'`  | 圖示按鈕大小         |
| `autoSubscribe`       | `boolean`                                            | `true`      | 是否自動訂閱即時通知 |
| `showSettings`        | `boolean`                                            | `true`      | 顯示設定按鈕         |
| `showViewAll`         | `boolean`                                            | `true`      | 顯示查看全部按鈕     |
| `maxHeight`           | `number \| string`                                   | `500`       | 通知列表最大高度     |
| `onViewAll`           | `() => void`                                         | -           | 查看全部通知回調     |
| `onSettingsClick`     | `() => void`                                         | -           | 設定按鈕點擊回調     |
| `onNotificationClick` | `(id: string) => void`                               | -           | 通知點擊回調         |
| `sx`                  | `SxProps<Theme>`                                     | -           | 自訂樣式             |

## 內部操作

### 自動處理的操作

以下操作由組件自動處理，無需手動實作：

1. **標記已讀**：點擊通知時自動標記為已讀
2. **即時更新**：收到新通知時自動更新列表和未讀數量
3. **樂觀更新**：操作時立即更新 UI，無需等待伺服器回應
4. **錯誤處理**：操作失敗時顯示錯誤訊息（透過 Snackbar）

### 手動操作

可透過回調函數實作的操作：

1. **導航**：通知點擊後導航到相關頁面
2. **自訂邏輯**：執行其他業務邏輯（如追蹤、日誌記錄等）

## 即時通知訂閱

### 如何運作

1. 組件掛載時，`useNotifications` hook 自動建立 WebSocket 連線
2. 訂閱 `ON_NOTIFICATION_CREATED` GraphQL Subscription
3. 當後端發送新通知時，前端即時收到推送
4. 自動更新通知列表和未讀數量
5. 顯示 Snackbar 通知用戶

### 訂閱管理

```tsx
// 預設：自動訂閱
<NotificationCenter autoSubscribe={true} />

// 手動控制：禁用自動訂閱
<NotificationCenter autoSubscribe={false} />
```

### 權限控制

- 訂閱時自動從 JWT token 中提取用戶 ID
- 只會收到屬於當前用戶的通知
- 後端使用 filter 函數驗證用戶權限

## GraphQL 操作

### 查詢

```graphql
# 取得通知列表
query GetNotifications($filter: NotificationFilterInput) {
  notifications(filter: $filter) {
    notifications {
      id
      type
      title
      message
      isRead
      createdAt
    }
    total
    unreadCount
  }
}

# 取得未讀數量
query GetUnreadNotificationCount {
  unreadNotificationCount
}
```

### 變更

```graphql
# 標記單一通知為已讀
mutation MarkNotificationAsRead($id: ID!) {
  markNotificationAsRead(id: $id) {
    id
    isRead
    readAt
  }
}

# 標記全部為已讀
mutation MarkAllNotificationsAsRead {
  markAllNotificationsAsRead
}

# 刪除通知
mutation DeleteNotification($id: ID!) {
  deleteNotification(id: $id)
}

# 刪除所有已讀通知
mutation DeleteReadNotifications {
  deleteReadNotifications
}
```

### 訂閱

```graphql
# 訂閱新通知
subscription OnNotificationCreated {
  notificationCreated {
    id
    type
    title
    message
    isRead
    createdAt
  }
}
```

## 效能優化

### 快取策略

- 使用 Apollo Client 快取機制
- `fetchPolicy: 'cache-and-network'` 優先顯示快取，同時更新
- 變更操作後自動更新快取

### 訂閱優化

- 使用 `skip` 選項控制訂閱啟動時機
- 組件卸載時自動清理訂閱
- 避免重複訂閱

### 渲染優化

- 使用 `useCallback` 避免不必要的重新渲染
- 使用 `forwardRef` 支援 ref 轉發
- 列表項目使用唯一 `key` 優化渲染

## 無障礙支援

- ✅ ARIA 標籤：`aria-label`, `aria-controls`, `aria-haspopup`, `aria-expanded`
- ✅ 鍵盤導航：完整支援鍵盤操作
- ✅ 螢幕閱讀器：適當的語義化標記
- ✅ 焦點管理：選單開啟/關閉時的焦點控制

## 國際化

目前硬編碼為正體中文，可根據需求擴展為多語言：

```tsx
// 可以整合 next-intl 或其他 i18n 方案
const t = useTranslations('components.notificationCenter');

<Typography variant="h6">{t('title')}</Typography>;
```

## 測試

### 單元測試

```tsx
import { render, screen, fireEvent } from '@testing-library/react';
import { NotificationCenter } from './NotificationCenter';

// Mock useNotifications hook
jest.mock('@/hooks/useNotifications');

test('renders notification center button', () => {
  render(<NotificationCenter />);
  const button = screen.getByLabelText('通知中心');
  expect(button).toBeInTheDocument();
});

test('opens popover on button click', () => {
  render(<NotificationCenter />);
  const button = screen.getByLabelText('通知中心');
  fireEvent.click(button);
  expect(screen.getByText('通知中心')).toBeInTheDocument();
});
```

### E2E 測試

```tsx
test('user can view and interact with notifications', async () => {
  // 1. 開啟通知中心
  await page.click('[aria-label="通知中心"]');

  // 2. 驗證通知列表顯示
  await page.waitForSelector('text=通知中心');

  // 3. 點擊通知
  await page.click('text=Payment Failed');

  // 4. 驗證通知被標記為已讀
  // ...
});
```

## 相關組件

- **NotificationList** (Molecule): 通知列表組件
- **NotificationItem** (Atom): 單一通知項目組件
- **Badge** (Atom): 徽章組件
- **useNotifications** (Hook): 通知管理 Hook

## 常見問題

### 如何整合到現有專案？

1. 確保已安裝相關依賴（Apollo Client, date-fns 等）
2. 配置 Apollo Client 支援 WebSocket subscriptions
3. 在 AppBar 或 Header 中引入組件
4. 提供必要的回調函數

### 如何自訂通知樣式？

可透過 `sx` prop 傳遞自訂樣式，或直接修改 NotificationItem 組件的樣式。

### 如何處理通知點擊後的導航？

```tsx
<NotificationCenter
  onNotificationClick={(id) => {
    // 根據通知 ID 或類型導航到相關頁面
    router.push(`/notifications/${id}`);
  }}
/>
```

### 如何在離線時處理通知？

Apollo Client 會自動處理離線狀態。當網路恢復時，會自動重新訂閱並同步資料。

## 未來改進

- [ ] 支援通知分組
- [ ] 支援通知優先級
- [ ] 支援富文本通知內容
- [ ] 支援通知音效
- [ ] 支援桌面通知（Web Notifications API）
- [ ] 支援通知搜尋
- [ ] 支援通知匯出
