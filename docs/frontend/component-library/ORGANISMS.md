# 組件庫 — Organisms（有機體組件）

> 本文件是 [組件庫總覽](../COMPONENT_LIBRARY.md) 的一部分，專注於 Atomic Design 的第三層 — Organisms（有機體組件）。

## 本文件涵蓋

由 Atoms 和 Molecules 組合而成的複雜 UI 區塊，具有獨立功能，例如完整表單、彈窗對話框、資料表格、側邊選單等。

---

### Organisms（有機體組件）

完整的功能單元，由多個 molecules 和 atoms 組合而成。

#### ChangePasswordForm

**路徑**: `components/organisms/ChangePasswordForm/`

**功能**:

- 變更密碼表單
- 當前密碼驗證
- 新密碼 + 確認密碼
- 密碼強度即時檢查
- 密碼規則提示

**使用場景**: 帳號設定頁面

**Props**:

```typescript
interface ChangePasswordFormProps {
  onSubmit: (values: ChangePasswordInput) => Promise<void>;
  loading?: boolean;
}

interface ChangePasswordInput {
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
}
```

**Storybook**: ✅ `ChangePasswordForm.stories.tsx`

---

#### Drawer

**路徑**: `components/organisms/Drawer/`

**功能**:

- 完整的抽屜式側邊欄系統
- 複雜的狀態管理與變體支援

**組成**:

- MUI Drawer 容器
- 狀態管理系統 (closed/mini/open)
- 響應式行為邏輯
- 可自訂切換按鈕
- Header/Footer 區域

**支援三種狀態**:

- **Closed**: 完全關閉
- **Mini**: 圖示模式 (semi-expanded)
- **Open**: 完全展開

**支援三種變體**:

- **Temporary**: 覆蓋在內容上方，可關閉 (適用於移動版)
- **Persistent**: 推移內容，可切換 (適用於桌面版)
- **Permanent**: 永久顯示 (適用於桌面版)

**Props**:

```typescript
interface DrawerComponentProps {
  state?: DrawerState; // 'closed' | 'mini' | 'open'
  variant?: DrawerVariant; // 'temporary' | 'persistent' | 'permanent'
  anchor?: 'left' | 'right';
  width?: number; // 完全展開寬度 (px)
  miniWidth?: number; // Mini 模式寬度 (px)
  children?: ReactNode; // 抽屜內容
  onStateChange?: (newState: DrawerState) => void;
  showToggleButton?: boolean;
  toggleButtonContent?: ReactNode;
  toggleButtonSx?: SxProps<Theme>;
  header?: ReactNode; // 頂部內容
  footer?: ReactNode; // 底部內容
  sx?: SxProps<Theme>;
}
```

**使用場景**:

- 應用程式主導航
- 側邊欄選單
- 多層級導航系統 (與 Sidebar organism 結合)

**Storybook**: ✅ `Drawer.stories.tsx`

---

#### ForgotPasswordForm

**路徑**: `components/organisms/ForgotPasswordForm/`

**功能**:

- 忘記密碼表單
- Email 輸入
- 發送重設連結

**Storybook**: ✅ `ForgotPasswordForm.stories.tsx`

---

#### 管理後台組件 (HQ)

**位置**: `components/organisms/hq/`

管理員專用的複雜組件，用於後台管理功能。這些組件通常需要特定權限才能訪問（HQ_SCOPE 或特定角色權限）。

---

##### AuditLogDetailsModal

**路徑**: `components/organisms/hq/AuditLogDetailsModal/`

**功能**:

- 顯示審計日誌的詳細資訊
- Tab 切換查看 Request/Response 數據

**三個 Tab 頁籤**:

1. **基本資訊**: 時間、用戶、操作、實體、狀態、技術資訊
2. **Request 數據**: 請求參數、Headers、Body
3. **Response 數據**: 回應數據或錯誤資訊

**特性**:

- 使用 DetailRow 展示基本資訊
- JSON 數據格式化展示
- 複製功能（User ID、Request ID、IP 等）
- 導出功能（JSON、CSV）
- 響應式設計（移動端全螢幕）

**組成**:

- Modal organism（對話框容器）
- MUI Tabs（頁籤切換）
- DetailRow molecules（基本資訊）
- JSON 展示區（含複製按鈕）

**Storybook**: 待補充

---

##### AuditLogTable

**路徑**: `components/organisms/hq/AuditLogTable/`

**功能**:

- 管理員查看系統審計日誌
- 追蹤所有用戶操作記錄
- 支援多維度篩選和搜尋

**特性**:

- 整合 AuditLogFilters 篩選器
- 顯示時間、用戶、操作、實體、狀態
- 支援時間範圍、用戶、操作類型、狀態篩選
- 詳情查看（含 Request/Response 數據）
- 導出功能（JSON、CSV）

**組成**:

- DataTable molecule（表格展示）
- AuditLogFilters（篩選控制）
- AuditLogDetailsModal（詳情查看）

**Storybook**: ✅ `AuditLogTable.stories.tsx`

---

##### BatchRevokeModal / RevokeSessionModal / RevokeOtherDevicesModal

**路徑**: `components/organisms/hq/BatchRevokeModal/` 等

**功能**:

- 會話撤銷相關的操作模態框
- 確認撤銷操作並顯示影響範圍

**BatchRevokeModal**:

- 批量撤銷多個會話
- 顯示選中的會話數量
- 確認操作和理由輸入

**RevokeSessionModal**:

- 撤銷單個會話
- 顯示會話詳細資訊
- 確認操作

**RevokeOtherDevicesModal**:

- 撤銷用戶的其他所有會話（保留當前會話）
- 顯示將被撤銷的會話列表
- 安全確認

**組成**:

- Modal organism（對話框容器）
- FormField（理由輸入）
- Button（確認/取消）

---

##### SessionDetailsModal

**路徑**: `components/organisms/hq/SessionDetailsModal/`

**功能**:

- 顯示會話的詳細資訊
- 管理員查看設備、位置、活動記錄

**顯示資訊**:

- 基本資訊（用戶、狀態、創建時間）
- 設備資訊（瀏覽器、作業系統、設備類型）
- 位置資訊（IP、地理位置、ISP）
- 活動記錄（最後使用時間、到期時間）
- 撤銷資訊（撤銷方式、撤銷者、撤銷時間）

**特性**:

- 使用 DetailRow 展示資訊
- 支援複製功能（Session ID、IP 等）
- 狀態顏色編碼（活躍、過期、已撤銷）
- 撤銷會話操作

**組成**:

- Modal organism（對話框容器）
- DetailRow molecules（資訊行）
- RevokeSessionModal（撤銷確認）

---

##### SessionFilters / AuditLogFilters

**路徑**: `components/organisms/hq/SessionFilters/` 和 `AuditLogFilters/`

**功能**:

- 表格篩選控制組件
- 提供多維度篩選條件

**SessionFilters 篩選項**:

- 用戶搜尋（ID、名稱、Email）
- 狀態選擇（活躍、過期、已撤銷）
- 時間範圍（開始日期、結束日期）
- 清除所有篩選

**AuditLogFilters 篩選項**:

- 用戶搜尋（ID、名稱、Email）
- 操作類型（CREATE、UPDATE、DELETE 等）
- 實體類型（User、Session、Notification 等）
- 狀態（SUCCESS、FAILURE）
- 時間範圍

**特性**:

- 整合 DatePicker（時間範圍選擇）
- 整合 SelectField（下拉選擇）
- 搜尋去抖動（debounce）
- 清除所有篩選按鈕

---

##### SessionStats / AuditLogStats

**路徑**: `components/organisms/hq/SessionStats/` 和 `AuditLogStats/`

**功能**:

- 統計資訊卡片組件
- 顯示關鍵指標概覽

**SessionStats 統計**:

- 總會話數
- 活躍會話數
- 今日登入數
- 最活躍用戶

**AuditLogStats 統計**:

- 總日誌數
- 今日操作數
- 失敗操作數
- 最近操作時間

**特性**:

- 使用 Card molecule 展示
- 圖示和顏色編碼
- 數字格式化顯示
- 自動重新整理

**Storybook**: ✅ `SessionStats.stories.tsx`

---

##### SessionTable

**路徑**: `components/organisms/hq/SessionTable/`

**功能**:

- 管理員查看和管理所有用戶會話
- 支援篩選、排序、分頁功能
- 批量撤銷會話操作
- 會話詳情查看

**特性**:

- 整合 SessionFilters 篩選器
- 顯示用戶資訊、設備、位置、活動時間
- 支援按用戶、狀態、時間範圍篩選
- 單個和批量撤銷操作
- 即時狀態更新

**組成**:

- DataTable molecule（表格展示）
- SessionFilters（篩選控制）
- BatchRevokeModal（批量撤銷確認）
- SessionDetailsModal（詳情查看）

**Storybook**: ✅ `SessionTable.stories.tsx`

---

#### LoginForm

**路徑**: `components/organisms/LoginForm/`

**功能**:

- 完整的登入表單
- Email + 密碼輸入
- 表單驗證
- 錯誤處理
- 記住我功能

**Storybook**: ✅ `LoginForm.stories.tsx`

---

#### Modal

**路徑**: `components/organisms/Modal/`

**功能**:

- 完整的模態對話框系統
- 支援多種變體和操作模式

**組成**:

- MUI Dialog 容器
- DialogTitle 標題區
- DialogContent 內容區
- DialogActions 操作區
- 變體圖示系統
- 響應式設計邏輯

**支援七種變體**:

- **default**: 預設對話框
- **confirm**: 確認對話框
- **alert**: 警告對話框 ⚠️ - **warning**: 警告對話框 ⚠️ - **error**: 錯誤對話框 ❌ - **info**: 資訊對話框 ℹ️
- **success**: 成功對話框
  **特性**:

- 多種尺寸支援 (xs/sm/md/lg/xl)
- 全螢幕模式
- 可自訂動作按鈕 (含 loading 狀態)
- 關閉按鈕控制
- 背景點擊和 ESC 鍵控制
- 捲動模式 (paper/body)
- 內容分隔線
- 自訂圖示

**Props**:

```typescript
interface ModalProps {
  open: boolean;
  onClose?: () => void;
  title?: ReactNode;
  children?: ReactNode;
  description?: string;
  actions?: ModalAction[];
  maxWidth?: 'xs' | 'sm' | 'md' | 'lg' | 'xl' | false;
  fullScreen?: boolean;
  scroll?: 'paper' | 'body';
  variant?: ModalVariant;
  showCloseButton?: boolean;
  disableBackdropClick?: boolean;
  disableEscapeKeyDown?: boolean;
  fullWidth?: boolean;
  loading?: boolean;
  dividers?: boolean;
  icon?: ReactNode;
  sx?: SxProps<Theme>;
}

interface ModalAction {
  label: string;
  onClick: () => void;
  variant?: 'text' | 'outlined' | 'contained';
  color?:
    | 'inherit'
    | 'primary'
    | 'secondary'
    | 'success'
    | 'error'
    | 'info'
    | 'warning';
  disabled?: boolean;
  loading?: boolean;
  autoFocus?: boolean;
}
```

**使用場景**:

- 確認操作
- 表單對話框
- 警告/錯誤提示
- 資訊展示
- 複雜的互動流程

**Storybook**: ✅ `Modal.stories.tsx`

---

#### NotificationCenter

**路徑**: `components/organisms/NotificationCenter/`

**功能**:

- 整合 GraphQL 數據的通知中心
- 使用 useNotifications hook 獲取數據
- 轉換 GraphQL 數據為 UnifiedNotification
- 提供即時訂閱功能
- 委託 UI 渲染給 NotificationMenu

**用戶**: MainAppBar (via useAppBarConfig)

**Storybook**: ✅ `NotificationCenter.stories.tsx`

---

#### NotificationMenu

**路徑**: `components/organisms/NotificationMenu/`

**功能**:

- 完整的通知下拉選單 UI
- 純 UI 組件,接受數據作為 props
- 組成: NotificationBadge (Atom) + NotificationMenuList (Molecule) + Header + Footer

**用戶**: NotificationCenter, MainAppBar

**Storybook**: ✅ `NotificationMenu.stories.tsx`

---

#### ResetPasswordForm

**路徑**: `components/organisms/ResetPasswordForm/`

**功能**:

- 重設密碼表單
- 新密碼 + 確認密碼
- 密碼強度檢查

**Storybook**: ✅ `ResetPasswordForm.stories.tsx`

---

#### SessionsTable

**路徑**: `components/organisms/SessionsTable/`

**功能**:

- 會話管理表格組件
- 顯示用戶會話列表
- 支援撤銷會話操作
- 顯示設備資訊、IP 地址、地理位置
- 顯示會話狀態和撤銷方式

**使用場景**: 管理員查看和管理用戶會話

**特性**:

- 整合 GraphQL mutations
- 撤銷確認對話框
- 顯示當前會話
- 格式化時間顯示

---

#### SettingsMenu

**路徑**: `components/organisms/SettingsMenu/`

**功能**:

- 設定選單組件
- 支援動態選單項目（menuItems）
- 主題切換、說明、關於

**Props**:

```typescript
interface SettingsMenuItem {
  id: string;
  label: string;
  icon?: ReactNode;
  onClick?: () => void;
  href?: string;
  disabled?: boolean;
  dividerAfter?: boolean;
}

interface SettingsMenuProps {
  menuItems?: SettingsMenuItem[]; // 動態選單項目
  currentTheme?: 'light' | 'dark';
  onThemeChange?: (theme: 'light' | 'dark') => void;
  color?: string;
}
```

**Helper 函數**:

```typescript
// 建立標準選單項目
createSettingsMenuItems(options: {
  onHelpClick?: () => void;
  onAboutClick?: () => void;
  helpUrl?: string;
  aboutUrl?: string;
  helpLabel?: string;
  aboutLabel?: string;
}): SettingsMenuItem[]
```

**使用範例**:

```tsx
import { createSettingsMenuItems } from '@/components/atoms/SettingsMenu';

const menuItems = createSettingsMenuItems({
  onHelpClick: () => console.log('Help clicked'),
  onAboutClick: () => console.log('About clicked'),
  helpLabel: '說明',
  aboutLabel: '關於',
});

<SettingsMenu
  menuItems={menuItems}
  currentTheme="light"
  onThemeChange={(theme) => setTheme(theme)}
/>;
```

**Storybook**: ✅ `SettingsMenu.stories.tsx`

---

#### Sidebar

**路徑**: `components/organisms/Sidebar/`

**功能**:

- 完整的側邊欄導航系統
- 遞迴選單結構
- 複雜的狀態管理

**組成**:

- Drawer (Organism) - 抽屜容器
- 遞迴選單項目結構
- Popper 彈出選單 (Mini 模式)
- 展開/收合邏輯
- 圖示與文字切換

**支援三種狀態**:

- **Open**: 完全展開,顯示圖示和文字
- **Mini**: 圖示模式,僅顯示圖示
- **Closed**: 完全關閉

**支援三種 Mini 模式行為**:

- **Hide**: 隱藏子選單
- **Popover**: 彈出顯示子選單
- **Expand**: 展開顯示子選單

**選單項目類型**:

- 單層選單項目 (icon + label + optional badge)
- 可展開選單組 (expandable)
- 遞迴巢狀結構 (支援無限層級)

**Props**:

```typescript
interface SidebarProps {
  state?: DrawerState; // 'closed' | 'mini' | 'open'
  variant?: DrawerVariant; // 'temporary' | 'persistent' | 'permanent'
  anchor?: 'left' | 'right';
  menuItems: MenuItem[];
  miniMode?: 'hide' | 'popover' | 'expand';
  onStateChange?: (newState: DrawerState) => void;
  showToggleButton?: boolean;
  header?: ReactNode;
  footer?: ReactNode;
  sx?: SxProps<Theme>;
}

interface MenuItem {
  id: string;
  label: string;
  icon?: ReactNode;
  badge?: number | string;
  badgeColor?:
    | 'primary'
    | 'secondary'
    | 'error'
    | 'warning'
    | 'info'
    | 'success';
  onClick?: () => void;
  children?: MenuItem[]; // 遞迴結構
  dividerAfter?: boolean;
}
```

**使用場景**:

- 應用程式主導航
- 多層級選單結構
- Dashboard 側邊欄
- 管理後台導航

**整合**:

- 使用 Drawer (Organism) 作為容器
- 支援響應式設計 (mobile: temporary, desktop: persistent/permanent)

**Storybook**: ✅ `Sidebar.stories.tsx`

---

#### SystemStatusMonitor

**路徑**: `components/organisms/SystemStatusMonitor/`

**功能**:

- 系統狀態監控面板組件
- 即時顯示各服務健康狀態
- 支援自動訂閱狀態變更
- 顯示回應時間和詳細資訊

**監控服務**:

- PostgreSQL 資料庫
- Redis 快取
- RabbitMQ 訊息佇列
- GraphQL 服務

**特性**:

- 整合 useSystemStatus hook
- 狀態圖示和顏色編碼
- 運行時間顯示
- 自動重新整理功能

---

#### TwoFactorForm

**路徑**: `components/organisms/TwoFactorForm/`

**功能**:

- 2FA 驗證碼輸入
- 6 位數驗證碼
- 備用驗證碼選項
- 倒數計時（重新發送）

**Storybook**: ✅ `TwoFactorForm.stories.tsx`

---

#### TwoFactorSettings

**路徑**: `components/organisms/TwoFactorSettings/`

**功能**:

- 雙因素認證設定管理
- 啟用/停用 2FA
- QR Code 顯示（綁定驗證器）
- 備用驗證碼生成與顯示
- 驗證碼輸入確認

**使用場景**: 安全設定頁面

**Storybook**: ✅ `TwoFactorSettings.stories.tsx`

---

#### UserMenu

**路徑**: `components/organisms/UserMenu/`

**功能**:

- 用戶選單組件
- 支援動態選單項目（menuItems）
- 支援圖示模式（iconMode）
- 顯示用戶頭像、名稱、狀態

**Props**:

```typescript
interface UserMenuItem {
  id: string;
  label: string;
  icon?: ReactNode;
  onClick?: () => void;
  href?: string;
  disabled?: boolean;
  dividerAfter?: boolean;
  variant?: 'default' | 'danger';
}

interface UserMenuProps {
  user: {
    name: string;
    email: string;
    avatar?: string;
    status?: 'online' | 'offline' | 'busy';
  };
  menuItems?: UserMenuItem[]; // 動態選單項目
  iconMode?: boolean; // 圖示模式（統一圖示風格）
  showName?: boolean; // 顯示用戶名稱
  showStatus?: boolean; // 顯示線上狀態
  size?: 'small' | 'medium' | 'large';
}
```

**Helper 函數**:

```typescript
// 建立標準選單項目
createUserMenuItems(options: {
  onAccountClick?: () => void;
  onProfileClick?: () => void;
  onSecurityClick?: () => void;
  onLogout?: () => void;
  accountUrl?: string;
  profileUrl?: string;
  securityUrl?: string;
  accountLabel?: string;
  profileLabel?: string;
  securityLabel?: string;
  logoutLabel?: string;
}): UserMenuItem[]
```

**使用範例**:

```tsx
import { createUserMenuItems } from '@/components/atoms/UserMenu';

// 使用 helper 函數建立選單項目
const menuItems = createUserMenuItems({
  onAccountClick: () => router.push('/settings/account'),
  onProfileClick: () => router.push('/settings/profile'),
  onSecurityClick: () => router.push('/settings/security'),
  onLogout: handleLogout,
  accountLabel: '帳號設定',
  profileLabel: '個人資料',
  securityLabel: '安全設定',
  logoutLabel: '登出',
});

<UserMenu
  user={user}
  menuItems={menuItems}
  iconMode={true}
  showName={true}
  showStatus={true}
/>;
```

**Storybook**: ✅ `UserMenu.stories.tsx`

---

**相關文件**：[組件庫總覽](../COMPONENT_LIBRARY.md) | [Atoms](./ATOMS.md) | [Molecules](./MOLECULES.md) | [Templates](./TEMPLATES.md)
