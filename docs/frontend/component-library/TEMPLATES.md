# 組件庫 — Layout、Templates 與 Pages

> 本文件是 [組件庫總覽](../COMPONENT_LIBRARY.md) 的一部分，涵蓋 Atomic Design 的頂層 — Layout（佈局組件）、Templates（模板）和 Pages（Storybook 頁面範例）。

## 本文件涵蓋

- **Layout 組件**：跨頁面共用的佈局元件（如 AppBar、Sidebar）
- **Templates**：頁面結構骨架（如 AuthLayout、DashboardLayout）
- **Pages**：完整頁面範例（主要用於 Storybook 文件化與視覺回歸測試）

---

## 目錄

- [本文件涵蓋](#本文件涵蓋)
  - [Layout / Templates 組件](#layout--templates-組件)
  - [Pages（Storybook 頁面）](#pagesstorybook-頁面)

### Layout / Templates 組件

跨頁面共用的佈局元件與頁面結構骨架。

#### AuthLayout

**路徑**: `components/templates/AuthLayout/`

**功能**:

- 認證頁面統一佈局
- 居中卡片設計
- 響應式佈局

**使用範例**:

```tsx
<AuthLayout title="登入">
  <LoginForm />
</AuthLayout>
```

**Storybook**: ✅ `AuthLayout.stories.tsx`

---

#### DashboardLayout

**路徑**: `components/templates/DashboardLayout/`

**功能**:

- 完整的儀表板佈局模板
- 組合 MainAppBar + Sidebar + Content Area
- 響應式設計（手機版自動隱藏 Sidebar）
- Sidebar 支援三種狀態切換（Open/Mini/Closed）
- 固定 AppBar 和 Sidebar
- 主要內容區域自動填充剩餘空間
- MainAppBar 寬度根據 Sidebar 狀態自動調整

**Props**:

```typescript
interface DashboardLayoutProps {
  children: ReactNode; // 主要內容區域
  title?: string; // 頁面標題
  logo?: ReactNode; // AppBar Logo
  titleLink?: string; // AppBar 標題連結
  user?: UserInfo; // 用戶資訊
  sidebarItems: SidebarMenuItem[]; // Sidebar 選單項目
  activeSidebarItemId?: string; // 當前活動的 Sidebar 項目
  sidebarHeader?: ReactNode; // Sidebar Header
  sidebarFooter?: ReactNode; // Sidebar Footer
  sidebarInitialState?: DrawerState; // Sidebar 初始狀態（預設 'open'）
  sidebarWidth?: number; // Sidebar 寬度（預設 240）
  notifications?: Notification[]; // 通知列表
  unreadNotificationCount?: number; // 未讀通知數量
  showUserName?: boolean; // 顯示用戶名稱（預設 false）
  showUserStatus?: boolean; // 顯示用戶狀態（預設 false）
  userIconMode?: boolean; // 使用圖示模式（預設 true）
  currentTheme?: 'light' | 'dark' | 'system'; // 當前主題（預設 'light'）
  onThemeChange?: (theme: 'light' | 'dark' | 'system') => void;
  onAccountClick?: () => void;
  onProfileClick?: () => void;
  onSecurityClick?: () => void;
  onLogout?: () => void;
  onHelpClick?: () => void;
  onAboutClick?: () => void;
  onNotificationClick?: (notification: Notification) => void;
  onMarkAllNotificationsRead?: () => void;
  onViewAllNotifications?: () => void;
  onClearAllNotifications?: () => void;
  sidebarBgColor?: string; // Sidebar 背景顏色
  sidebarColor?: string; // Sidebar 文字顏色
  sidebarActiveBackgroundColor?: string; // Sidebar Active 背景顏色
  sidebarHoverBackgroundColor?: string; // Sidebar Hover 背景顏色
  centerContent?: ReactNode; // MainAppBar 中間自訂內容
  extraActions?: ReactNode; // MainAppBar 額外操作按鈕
  sidebarToggleButtonContent?: ReactNode; // Sidebar 切換按鈕自訂內容
  sidebarToggleButtonSx?: SxProps<Theme>; // Sidebar 切換按鈕樣式
}
```

**使用範例**:

```tsx
// 基本用法
<DashboardLayout
  title="MEAD Dashboard"
  logo={<Logo />}
  user={user}
  sidebarItems={menuItems}
  activeSidebarItemId="dashboard"
  notifications={notifications}
  unreadNotificationCount={2}
>
  <YourPageContent />
</DashboardLayout>

// 完整功能
<DashboardLayout
  title="MEAD Dashboard"
  logo={<Logo />}
  user={user}
  sidebarItems={menuItems}
  activeSidebarItemId="dashboard"
  sidebarHeader={<Header />}
  sidebarFooter={<Footer />}
  notifications={notifications}
  unreadNotificationCount={3}
  showUserName={true}
  showUserStatus={true}
  userIconMode={true}
  currentTheme="light"
  sidebarInitialState="open"
  onThemeChange={(theme) => setTheme(theme)}
  onAccountClick={() => router.push('/settings/account')}
  onLogout={handleLogout}
>
  <YourPageContent />
</DashboardLayout>

// 自訂 Sidebar 樣式
<DashboardLayout
  title="Custom Dashboard"
  user={user}
  sidebarItems={menuItems}
  sidebarBgColor="#1e293b"
  sidebarColor="#fff"
  sidebarActiveBackgroundColor="rgba(59, 130, 246, 0.2)"
  sidebarHoverBackgroundColor="rgba(255, 255, 255, 0.05)"
>
  <YourPageContent />
</DashboardLayout>
```

**特性**:

- ✅ 響應式設計（<md 自動切換為 temporary Sidebar）
- ✅ Sidebar 三種狀態無縫切換
- ✅ MainAppBar 動態寬度調整（避免與 Sidebar 重疊）
- ✅ 固定定位確保捲動時 AppBar 和 Sidebar 保持可見
- ✅ 完整的主題支援（light/dark/system）
- ✅ 自訂樣式支援

**Storybook**: ✅ `DashboardLayout.stories.tsx`

---

#### MainAppBar

**路徑**: `components/layout/MainAppBar.tsx`

**功能**:

- 主應用程式導航列
- 全域導航元件（Logo、標題、通知、用戶選單、設定選單）
- 響應式設計

**設計原則**:

- ✅ **全域導航**: AppBar 為全域導航，始終顯示網站標題/Logo
- ✅ **一致性**: 所有頁面共用同一個 AppBar 配置
- ❌ **不包含頁面層級操作**: 返回按鈕等頁面操作應放在頁面內容區域

**Props**:

```typescript
interface MainAppBarProps {
  logo?: React.ReactNode; // 自訂 Logo
  title?: string; // 標題
  titleLink?: string; // 標題連結
  user?: UserInfo; // 用戶資訊
  showUserName?: boolean; // 顯示用戶名稱
  showUserStatus?: boolean; // 顯示用戶狀態
  userIconMode?: boolean; // 使用圖示模式（統一圖示風格）
  notifications?: Notification[]; // 通知列表
  unreadNotificationCount?: number; // 未讀通知數
  showNotifications?: boolean; // 顯示通知鈴鐺
  showUserMenu?: boolean; // 顯示用戶選單
  showSettings?: boolean; // 顯示設定選單
  currentTheme?: 'light' | 'dark' | 'system'; // 當前主題
  onThemeChange?: (theme: 'light' | 'dark' | 'system') => void;
  centerContent?: ReactNode; // 標題右側的自訂內容
  extraActions?: ReactNode; // 通知按鈕左側的額外操作按鈕
  onAccountClick?: () => void;
  onProfileClick?: () => void;
  onSecurityClick?: () => void;
  onLogout?: () => void;
  onHelpClick?: () => void;
  onAboutClick?: () => void;
}
```

**使用範例**:

```tsx
// Dashboard 範例（基於 Storybook 設計）
<MainAppBar
  logo={<Box sx={{ fontSize: '1.75rem', fontWeight: 'bold', color: 'white' }}>📊</Box>}
  title="MEAD Dashboard"
  titleLink="/dashboard"
  user={user}
  unreadNotificationCount={3}
  notifications={notifications}
  showUserName={true}
  showUserStatus={true}
  userIconMode={true}
  onAccountClick={handleAccountClick}
  onProfileClick={handleProfileClick}
  onSecurityClick={handleSecurityClick}
  onLogout={handleLogout}
  onHelpClick={handleHelpClick}
  onAboutClick={handleAboutClick}
/>

// 頁面內容區域的返回按鈕（正確模式）
<Container maxWidth="md" sx={{ mt: 4, mb: 4 }}>
  <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
    <IconButton onClick={() => router.push('/dashboard')} sx={{ mr: 1 }}>
      <ArrowBack />
    </IconButton>
    <Typography variant="h4">帳號設定</Typography>
  </Box>
  {/* 頁面內容 */}
</Container>
```

**Storybook**: ✅ `MainAppBar.stories.tsx`

---

### Pages（Storybook 頁面）

完整的頁面故事，用於展示實際使用場景。

| 頁面            | 檔案                             | 說明              |
| --------------- | -------------------------------- | ----------------- |
| 登入頁面        | `LoginPage.stories.tsx`          | 完整登入流程      |
| 登入頁面（MSW） | `LoginPageWithMSW.stories.tsx`   | 使用 MSW 模擬 API |
| 忘記密碼        | `ForgotPasswordPage.stories.tsx` | 密碼重設請求      |
| 重設密碼        | `ResetPasswordPage.stories.tsx`  | 密碼重設表單      |

---

**相關文件**：[組件庫總覽](../COMPONENT_LIBRARY.md) | [Atoms](./ATOMS.md) | [Molecules](./MOLECULES.md) | [Organisms](./ORGANISMS.md)
