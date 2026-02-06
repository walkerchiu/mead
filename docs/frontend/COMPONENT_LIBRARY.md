# 組件庫開發指南

統一的組件庫開發規範與 Atomic Design 實踐指南

## 📋 目錄

- [組件庫開發指南](#組件庫開發指南)
  - [📋 目錄](#-目錄)
  - [📖 概述](#-概述)
    - [技術棧](#技術棧)
    - [為什麼使用 Atomic Design？](#為什麼使用-atomic-design)
  - [🏗️ Atomic Design 架構](#️-atomic-design-架構)
    - [組件層級](#組件層級)
    - [目錄結構](#目錄結構)
  - [📝 組件清單](#-組件清單)
    - [🔹 Atoms（原子組件）](#-atoms原子組件)
      - [Button](#button)
      - [TextField](#textfield)
      - [CodeInput](#codeinput)
      - [Switch](#switch)
      - [Slider](#slider)
      - [Avatar](#avatar)
      - [Badge](#badge)
      - [Icon](#icon)
      - [Progress](#progress)
      - [Divider](#divider)
      - [Skeleton](#skeleton)
    - [🟢 Molecules（分子組件）](#-molecules分子組件)
      - [FormField](#formfield)
      - [PasswordField](#passwordfield)
      - [SelectField](#selectfield)
      - [CheckboxGroup](#checkboxgroup)
      - [RadioGroup](#radiogroup)
      - [ErrorDisplay](#errordisplay)
      - [AlertMessage](#alertmessage)
      - [SnackbarWithProgress](#snackbarwithprogress)
      - [Tabs](#tabs)
      - [Stepper](#stepper)
      - [Pagination](#pagination)
      - [LanguageSwitcher](#languageswitcher)
      - [NotificationMenu](#notificationmenu)
      - [UserMenu](#usermenu)
      - [SettingsMenu](#settingsmenu)
      - [Card](#card)
      - [DataTable](#datatable)
      - [DataList](#datalist)
      - [Accordion](#accordion)
    - [🟠 Organisms（有機體組件）](#-organisms有機體組件)
      - [Drawer](#drawer)
      - [Modal](#modal)
      - [Sidebar](#sidebar)
      - [LoginForm](#loginform)
      - [TwoFactorForm](#twofactorform)
      - [ForgotPasswordForm](#forgotpasswordform)
      - [ResetPasswordForm](#resetpasswordform)
    - [🟣 Layout（佈局組件）](#-layout佈局組件)
      - [MainAppBar](#mainappbar)
    - [🔵 Templates（模板）](#-templates模板)
      - [AuthLayout](#authlayout)
    - [📄 Pages（Storybook 頁面）](#-pagesstorybook-頁面)
  - [🚀 開發指南](#-開發指南)
    - [建立新組件](#建立新組件)
      - [1. 確定組件層級](#1-確定組件層級)
      - [2. 建立組件檔案](#2-建立組件檔案)
      - [3. 組件結構](#3-組件結構)
      - [4. Storybook 故事](#4-storybook-故事)
      - [5. 導出組件](#5-導出組件)
  - [📚 Storybook 使用](#-storybook-使用)
    - [啟動 Storybook](#啟動-storybook)
    - [Storybook 組織結構](#storybook-組織結構)
    - [組件文檔](#組件文檔)
    - [MSW 整合](#msw-整合)
  - [🎯 最佳實踐](#-最佳實踐)
    - [✅ DO - 應該這樣做](#-do---應該這樣做)
      - [1. 遵循 Atomic Design](#1-遵循-atomic-design)
      - [2. 使用 TypeScript](#2-使用-typescript)
      - [3. 提供 Storybook 故事](#3-提供-storybook-故事)
      - [4. 組件文檔](#4-組件文檔)
    - [❌ DON'T - 不要這樣做](#-dont---不要這樣做)
      - [1. 不要跨層級引用](#1-不要跨層級引用)
      - [2. 不要在組件中寫業務邏輯](#2-不要在組件中寫業務邏輯)
  - [🤝 與設計師協作](#-與設計師協作)
    - [設計與開發流程](#設計與開發流程)
    - [從設計稿到程式碼](#從設計稿到程式碼)
    - [溝通檢查清單](#溝通檢查清單)
  - [📚 相關文檔](#-相關文檔)
    - [給設計師](#給設計師)
    - [給開發者](#給開發者)

---

## 📖 概述

Wind 前端採用 **Atomic Design** 設計系統，使用 **Material-UI 7** 作為基礎 UI 框架，並透過 **Storybook** 進行組件開發和文檔管理。

### 技術棧

- **UI 框架**: Material-UI 7.3.7
- **樣式系統**: Emotion
- **設計模式**: Atomic Design
- **組件文檔**: Storybook 10.2.1
- **表單處理**: React Hook Form 7.71.1
- **驗證**: Zod 4.3.6

### 為什麼使用 Atomic Design？

| 優勢         | 說明                 |
| ------------ | -------------------- |
| **可重用性** | 小組件可組合成大組件 |
| **一致性**   | 統一的設計語言       |
| **可維護性** | 清晰的組件層級       |
| **可測試性** | 每層組件獨立測試     |
| **可擴展性** | 易於新增功能         |

---

## 🏗️ Atomic Design 架構

### 組件層級

```text
Atoms (原子)
  ↓ 組合
Molecules (分子)
  ↓ 組合
Organisms (有機體)
  ↓ 組合
Templates (模板)
  ↓ 填充
Pages (頁面)
```

### 目錄結構

```text
apps/frontend/src/components/
├── atoms/              # 基礎原子組件（不可再分割）
│   ├── Buttons/        # 按鈕類
│   │   ├── Button/
│   │   ├── ActionButton/
│   │   └── IconButton/
│   ├── Fields/         # 表單欄位類
│   │   ├── TextField/
│   │   ├── Search/
│   │   ├── DatePicker/
│   │   ├── TimePicker/
│   │   ├── Radio/
│   │   └── Switch/
│   ├── Chips/          # 標籤類
│   │   └── Chip/
│   ├── CodeInput/
│   ├── Slider/
│   ├── Avatar/
│   ├── Badge/
│   ├── Icon/
│   ├── Progress/
│   ├── Divider/
│   ├── Skeleton/
│   ├── LanguageSwitcher/
│   ├── NotificationMenu/
│   ├── UserMenu/
│   ├── SettingsMenu/
│   ├── SnackbarWithProgress/
│   └── Drawer/
│
├── molecules/          # 組合分子組件（2-3 個原子）
│   ├── FormField/
│   ├── PasswordField/
│   ├── SelectField/
│   ├── CheckboxGroup/
│   ├── RadioGroup/
│   ├── ErrorDisplay/
│   ├── AlertMessage/
│   ├── Tabs/
│   ├── Stepper/
│   ├── Pagination/
│   ├── Card/
│   ├── DataTable/
│   ├── DataList/
│   ├── Accordion/
│   ├── Sidebar/
│   └── Modal/
│
├── organisms/          # 有機體組件（完整功能單元）
│   ├── LoginForm/
│   ├── TwoFactorForm/
│   ├── ForgotPasswordForm/
│   └── ResetPasswordForm/
│
├── layout/             # 佈局組件
│   └── MainAppBar/
│
├── templates/          # 頁面模板（佈局）
│   └── AuthLayout/
│
└── pages/              # Storybook 頁面故事
    ├── LoginPage.stories.tsx
    ├── LoginPageWithMSW.stories.tsx
    ├── ForgotPasswordPage.stories.tsx
    └── ResetPasswordPage.stories.tsx
```

---

## 📝 組件清單

### 🔹 Atoms（原子組件）

基礎組件，不可再分割，通常是對 MUI 組件的輕量封裝。

#### Button

**路徑**: `components/atoms/Button/`

**功能**:

- MUI Button 封裝
- 支援載入狀態
- 支援圖示（startIcon、endIcon、iconOnly）
- 自動計算載入圖示大小
- 統一的樣式和行為

**Props**:

```typescript
interface ButtonProps {
  variant?: 'text' | 'outlined' | 'contained';
  color?: 'primary' | 'secondary' | 'error';
  size?: 'small' | 'medium' | 'large';
  loading?: boolean;
  disabled?: boolean;
  fullWidth?: boolean;
  startIcon?: React.ReactNode; // 開始圖示（loading 時會被替換）
  endIcon?: React.ReactNode; // 結束圖示
  iconOnly?: boolean; // 純圖示按鈕（無文字）
  onClick?: () => void;
  children: React.ReactNode;
}
```

**使用範例**:

```tsx
// 基本按鈕
<Button variant="contained" color="primary" loading={isSubmitting}>
  登入
</Button>

// 帶圖示的按鈕
<Button startIcon={<Icon>➕</Icon>}>新增</Button>

// 純圖示按鈕
<Button iconOnly>
  <Icon>🔍</Icon>
</Button>

// 載入狀態
<Button variant="outlined" loading>
  載入中...
</Button>
```

**Storybook**: ✅ `Button.stories.tsx`

---

#### TextField

**路徑**: `components/atoms/TextField/`

**功能**:

- 基礎文本輸入框
- MUI TextField 封裝

**Props**:

```typescript
interface TextFieldProps {
  label?: string;
  placeholder?: string;
  type?: 'text' | 'email' | 'password';
  error?: boolean;
  helperText?: string;
  value?: string;
  onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
}
```

**Storybook**: ✅ `TextField.stories.tsx`

---

#### CodeInput

**路徑**: `components/atoms/CodeInput/`

**功能**:

- 驗證碼輸入組件
- 6 位數字輸入
- 自動聚焦和跳轉

**使用場景**:

- 2FA 驗證碼
- Email 驗證碼

**Storybook**: ✅ `CodeInput.stories.tsx`

---

#### Switch

**路徑**: `components/atoms/Switch/`

**功能**:

- 開關切換組件
- MUI Switch 封裝

**Storybook**: ✅ `Switch.stories.tsx`

---

#### Slider

**路徑**: `components/atoms/Slider/`

**功能**:

- 滑桿組件
- 數值範圍選擇

**Storybook**: ✅ `Slider.stories.tsx`

---

#### Avatar

**路徑**: `components/atoms/Avatar/`

**功能**:

- 使用者頭像組件
- 支援圖片、文字、圖示

**Storybook**: ✅ `Avatar.stories.tsx`

---

#### Badge

**路徑**: `components/atoms/Badge/`

**功能**:

- 徽章組件
- 用於顯示狀態或數量

**Storybook**: ✅ `Badge.stories.tsx`

---

#### Icon

**路徑**: `components/atoms/Icon/`

**功能**:

- 圖示組件
- 支援 MUI Icons 和自訂 Emoji

**使用範例**:

```tsx
// 使用 MUI Icons
<Icon>home</Icon>

// 使用 Emoji
<Icon>🏠</Icon>
```

**Storybook**: ✅ `Icon.stories.tsx`

---

#### Progress

**路徑**: `components/atoms/Progress/`

**功能**:

- 載入進度指示器
- 支援圓形和線性兩種樣式

**Props**:

```typescript
interface ProgressProps {
  type?: 'circular' | 'linear';
  value?: number; // 進度值（0-100）
}
```

**Storybook**: ✅ `Progress.stories.tsx`

---

#### Divider

**路徑**: `components/atoms/Divider/`

**功能**:

- 分隔線組件
- 視覺分隔元素

**Storybook**: ✅ `Divider.stories.tsx`

---

#### Skeleton

**路徑**: `components/atoms/Skeleton/`

**功能**:

- 骨架屏組件
- 載入佔位符

**變體**:

- FormSkeleton - 表單骨架屏
- DashboardSkeleton - 儀表板骨架屏

**Storybook**: ✅ `FormSkeleton.stories.tsx`, `DashboardSkeleton.stories.tsx`

---

### 🟢 Molecules（分子組件）

由 2-3 個原子組件組合而成，具有簡單的業務邏輯。

#### FormField

**路徑**: `components/molecules/FormField/`

**功能**:

- TextField + React Hook Form 整合
- 自動錯誤顯示
- 表單驗證

**Props**:

```typescript
interface FormFieldProps {
  name: string;
  label: string;
  control: Control<any>;
  type?: 'text' | 'email' | 'password';
  rules?: RegisterOptions;
}
```

**使用範例**:

```tsx
<FormField
  name="email"
  label="Email"
  control={control}
  type="email"
  rules={{ required: 'Email 為必填欄位' }}
/>
```

**Storybook**: ✅ `FormField.stories.tsx`

---

#### PasswordField

**路徑**: `components/molecules/PasswordField/`

**功能**:

- 密碼輸入欄位
- 可見性切換按鈕
- React Hook Form 整合

**特性**:

- 👁️ 顯示/隱藏密碼
- ✅ 表單驗證支援
- 🔒 自動完成處理

**Storybook**: ✅ `PasswordField.stories.tsx`

---

#### SelectField

**路徑**: `components/molecules/SelectField/`

**功能**:

- 下拉選單組件
- 支援單選和多選
- 支援選項分組
- 支援選項圖示
- 支援搜尋模式（切換為 Autocomplete）
- React Hook Form 整合

**Props**:

```typescript
interface SelectOption {
  value: string | number;
  label: string;
  disabled?: boolean;
  group?: string; // 選項分組
  icon?: React.ReactNode; // 選項圖示
}

interface SelectFieldProps {
  options: SelectOption[];
  error?: FieldError | string;
  helperText?: string;
  multiple?: boolean; // 多選
  renderChips?: boolean; // 多選時顯示為 Chips
  showCheckbox?: boolean; // 多選時顯示 checkbox
  placeholder?: string;
  searchable?: boolean; // 啟用搜尋功能
  noOptionsText?: string;
}
```

**使用範例**:

```tsx
// 基本單選
<SelectField
  label="國家"
  options={[
    { value: 'tw', label: '台灣' },
    { value: 'us', label: '美國' },
  ]}
  {...register('country')}
  error={errors.country}
/>

// 多選
<SelectField
  label="興趣"
  multiple
  options={interestOptions}
  {...register('interests')}
/>

// 分組選項
<SelectField
  label="城市"
  options={[
    { group: '北部', value: 'taipei', label: '台北' },
    { group: '北部', value: 'taoyuan', label: '桃園' },
    { group: '南部', value: 'kaohsiung', label: '高雄' },
  ]}
/>

// 帶圖示的選項
<SelectField
  label="天氣"
  options={[
    { value: 'sunny', label: '晴天', icon: <Icon>☀️</Icon> },
    { value: 'rainy', label: '下雨', icon: <Icon>🌧️</Icon> },
  ]}
/>

// 可搜尋選單
<SelectField
  label="國家"
  searchable
  options={countryOptions}
  placeholder="搜尋國家"
/>

// 完整功能（搜尋 + 分組 + 圖示 + 多選）
<SelectField
  label="活動"
  searchable
  multiple
  options={[
    { group: '戶外', value: 'hiking', label: '登山', icon: <Icon>🥾</Icon> },
    { group: '室內', value: 'reading', label: '閱讀', icon: <Icon>📖</Icon> },
  ]}
/>
```

**Storybook**: ✅ `SelectField.stories.tsx`

---

#### CheckboxGroup

**路徑**: `components/molecules/CheckboxGroup/`

**功能**:

- 複選框群組
- React Hook Form 整合

**Storybook**: ✅ `CheckboxGroup.stories.tsx`

---

#### RadioGroup

**路徑**: `components/molecules/RadioGroup/`

**功能**:

- 單選按鈕群組
- React Hook Form 整合

**Storybook**: ✅ `RadioGroup.stories.tsx`

---

#### ErrorDisplay

**路徑**: `components/molecules/ErrorDisplay/`

**功能**:

- 錯誤訊息展示組件
- 統一的錯誤處理顯示

**Storybook**: ✅ `ErrorDisplay.stories.tsx`

---

#### AlertMessage

**路徑**: `components/molecules/AlertMessage/`

**功能**:

- 警告/提示訊息
- 成功/錯誤狀態

**Props**:

```typescript
interface AlertMessageProps {
  severity: 'success' | 'error' | 'warning' | 'info';
  message: string;
  onClose?: () => void;
}
```

**Storybook**: ✅ `AlertMessage.stories.tsx`

---

#### SnackbarWithProgress

**路徑**: `components/atoms/SnackbarWithProgress/`

**功能**:

- 帶進度條的通知提示
- 自動消失倒數

**Storybook**: ✅ `SnackbarWithProgress.stories.tsx`

---

#### Tabs

**路徑**: `components/molecules/Tabs/`

**功能**:

- 頁籤切換組件
- 內容區域管理

**Storybook**: ✅ `Tabs.stories.tsx`

---

#### Stepper

**路徑**: `components/molecules/Stepper/`

**功能**:

- 步驟指示器
- 多步驟流程導航

**Storybook**: ✅ `Stepper.stories.tsx`

---

#### Pagination

**路徑**: `components/molecules/Pagination/`

**功能**:

- 分頁組件
- 頁面導航控制

**Storybook**: ✅ `Pagination.stories.tsx`

---

#### LanguageSwitcher

**路徑**: `components/molecules/LanguageSwitcher/`

**功能**:

- 語言切換器
- i18n 整合

**Storybook**: ✅ `LanguageSwitcher.stories.tsx`

---

#### NotificationMenu

**路徑**: `components/atoms/NotificationMenu/`

**功能**:

- 通知選單組件
- 顯示通知列表
- 未讀通知數量提示（Badge）

**Props**:

```typescript
interface Notification {
  id: string;
  type: 'info' | 'success' | 'warning' | 'error';
  title: string;
  message: string;
  timestamp: Date;
  read: boolean;
}

interface NotificationMenuProps {
  notifications?: Notification[];
  unreadCount?: number;
  onNotificationClick?: (notification: Notification) => void;
  onMarkAllRead?: () => void;
  onViewAll?: () => void;
  onClearAll?: () => void;
  color?: string;
}
```

**Storybook**: ✅ `NotificationMenu.stories.tsx`

---

#### UserMenu

**路徑**: `components/atoms/UserMenu/`

**功能**:

- 使用者選單組件
- 支援動態選單項目（menuItems）
- 支援圖示模式（iconMode）
- 顯示使用者頭像、名稱、狀態

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
  showName?: boolean; // 顯示使用者名稱
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

#### SettingsMenu

**路徑**: `components/atoms/SettingsMenu/`

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

#### Card

**路徑**: `components/molecules/Card/`

**功能**:

- 卡片容器組件
- 內容分組和展示

**Storybook**: ✅ `Card.stories.tsx`

---

#### DataTable

**路徑**: `components/molecules/DataTable/`

**功能**:

- 功能完整的數據表格組件
- 支援排序、篩選、高亮、展開/收合
- 支援多選、分頁

**Props**:

```typescript
interface DataTableColumn<T> {
  id: string;
  label: string;
  sortable?: boolean; // 可排序
  filterable?: boolean; // 可篩選
  width?: number | string;
  align?: 'left' | 'center' | 'right';
  render?: (value: any, row: T) => React.ReactNode;
  sortFn?: (a: T, b: T) => number; // 自訂排序函數
  filterFn?: (row: T, filterValue: string) => boolean; // 自訂篩選函數
}

interface DataTableProps<T> {
  columns: DataTableColumn<T>[];
  data: T[];
  loading?: boolean;
  emptyText?: string;
  selectable?: boolean; // 可選擇
  selectedRows?: string[];
  onSelectionChange?: (selectedIds: string[]) => void;
  expandable?: boolean; // 可展開
  renderExpandedRow?: (row: T) => React.ReactNode;
  highlightRow?: (row: T) => boolean; // 高亮行條件
  highlightColor?: string; // 高亮顏色
  onRowClick?: (row: T) => void;
  pagination?: boolean; // 分頁
  pageSize?: number;
  page?: number;
  totalPages?: number;
  onPageChange?: (page: number) => void;
  maxHeight?: number | string;
  expandIconPosition?: 'right' | 'down'; // 展開圖示方向（預設 'right'）
}
```

**使用範例**:

```tsx
// 基本用法
<DataTable
  columns={[
    { id: 'name', label: '姓名', sortable: true },
    { id: 'age', label: '年齡', sortable: true },
  ]}
  data={[
    { id: '1', name: '王小明', age: 25 },
    { id: '2', name: '李小華', age: 30 },
  ]}
/>

// 可展開的表格
<DataTable
  columns={columns}
  data={data}
  expandable
  expandIconPosition="down" // 向下箭頭
  renderExpandedRow={(row) => <div>展開內容：{row.detail}</div>}
/>

// 可選擇的表格
<DataTable
  columns={columns}
  data={data}
  selectable
  onSelectionChange={(selected) => console.log(selected)}
/>

// 高亮特定行
<DataTable
  columns={columns}
  data={data}
  highlightRow={(row) => row.isImportant}
  highlightColor="rgba(255, 0, 0, 0.1)"
/>
```

**Storybook**: ✅ `DataTable.stories.tsx`

---

#### DataList

**路徑**: `components/molecules/DataList/`

**功能**:

- 功能完整的數據列表組件
- 列表樣式呈現
- 支援排序、篩選、高亮、展開/收合
- 支援多選、分頁、Badge 顯示

**Props**:

```typescript
interface DataListItem {
  id: string | number;
  title: string;
  subtitle?: string;
  icon?: React.ReactNode;
  actions?: React.ReactNode;
  badge?: {
    label: string;
    color?:
      | 'default'
      | 'primary'
      | 'secondary'
      | 'error'
      | 'warning'
      | 'info'
      | 'success';
  };
  [key: string]: any;
}

interface DataListProps {
  items: DataListItem[];
  loading?: boolean;
  emptyText?: string;
  selectable?: boolean;
  selectedItems?: string[];
  onSelectionChange?: (selectedIds: string[]) => void;
  expandable?: boolean;
  renderExpandedContent?: (item: DataListItem) => React.ReactNode;
  highlightItem?: (item: DataListItem) => boolean;
  highlightColor?: string;
  onItemClick?: (item: DataListItem) => void;
  pagination?: boolean;
  pageSize?: number;
  page?: number;
  totalPages?: number;
  onPageChange?: (page: number) => void;
  sortOptions?: Array<{ value: string; label: string }>;
  sortBy?: string;
  onSortChange?: (sortBy: string) => void;
  filterPlaceholder?: string;
  filterValue?: string;
  onFilterChange?: (value: string) => void;
  divider?: boolean;
  expandIconPosition?: 'right' | 'down'; // 展開圖示方向（預設 'right'）
}
```

**使用範例**:

```tsx
// 基本用法
<DataList
  items={[
    { id: '1', title: '項目 1', subtitle: '描述' },
    { id: '2', title: '項目 2', subtitle: '描述' },
  ]}
/>

// 帶 Badge 的列表
<DataList
  items={[
    {
      id: '1',
      title: '重要項目',
      badge: { label: '新', color: 'error' },
    },
  ]}
/>

// 可展開的列表
<DataList
  items={items}
  expandable
  expandIconPosition="down"
  renderExpandedContent={(item) => <div>詳細內容</div>}
/>

// 可選擇和篩選的列表
<DataList
  items={items}
  selectable
  filterPlaceholder="搜尋項目"
  onFilterChange={(value) => setFilter(value)}
  onSelectionChange={(selected) => console.log(selected)}
/>
```

**Storybook**: ✅ `DataList.stories.tsx`

---

#### Accordion

**路徑**: `components/molecules/Accordion/`

**功能**:

- 可折疊面板組件
- 內容展開/收合

**Storybook**: ✅ `Accordion.stories.tsx`

---

### 🟠 Organisms（有機體組件）

完整的功能單元，由多個 molecules 和 atoms 組合而成。

#### Drawer

**路徑**: `components/atoms/Drawer/`

**功能**:

- 抽屜式側邊欄
- 可從左/右側滑出

**Storybook**: ✅ `Drawer.stories.tsx`

---

#### Modal

**路徑**: `components/molecules/Modal/`

**功能**:

- 模態對話框
- 彈出式內容容器

**Storybook**: ✅ `Modal.stories.tsx`

---

#### Sidebar

**路徑**: `components/molecules/Sidebar/`

**功能**:

- 側邊欄導航
- 選單項目管理

**Storybook**: ✅ `Sidebar.stories.tsx`

---

#### LoginForm

**路徑**: `components/organisms/LoginForm/`

**功能**:

- 完整的登入表單
- Email + 密碼輸入
- 表單驗證
- 錯誤處理
- 記住我功能

**使用範例**:

```tsx
<LoginForm onSubmit={handleLogin} loading={isSubmitting} error={loginError} />
```

**Storybook**: ✅ `LoginForm.stories.tsx`

---

#### TwoFactorForm

**路徑**: `components/organisms/TwoFactorForm/`

**功能**:

- 2FA 驗證碼輸入
- 6 位數驗證碼
- 備用驗證碼選項
- 倒數計時（重新發送）

**使用範例**:

```tsx
<TwoFactorForm
  onSubmit={handleVerify}
  onResend={handleResend}
  temporaryToken={token}
/>
```

**Storybook**: ✅ `TwoFactorForm.stories.tsx`

---

#### ForgotPasswordForm

**路徑**: `components/organisms/ForgotPasswordForm/`

**功能**:

- 忘記密碼表單
- Email 輸入
- 發送重設連結

**Storybook**: ✅ `ForgotPasswordForm.stories.tsx`

---

#### ResetPasswordForm

**路徑**: `components/organisms/ResetPasswordForm/`

**功能**:

- 重設密碼表單
- 新密碼 + 確認密碼
- 密碼強度檢查

**Storybook**: ✅ `ResetPasswordForm.stories.tsx`

---

### 🟣 Layout（佈局組件）

全域佈局組件，用於整個應用程式的導航和結構。

#### MainAppBar

**路徑**: `components/layout/MainAppBar/`

**功能**:

- 主應用程式導航列
- 全域導航元件（Logo、標題、通知、使用者選單、設定選單）
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
  user?: UserInfo; // 使用者資訊
  showUserName?: boolean; // 顯示使用者名稱
  showUserStatus?: boolean; // 顯示使用者狀態
  userIconMode?: boolean; // 使用圖示模式（統一圖示風格）
  notifications?: Notification[]; // 通知列表
  unreadNotificationCount?: number; // 未讀通知數
  showNotifications?: boolean; // 顯示通知鈴鐺
  showUserMenu?: boolean; // 顯示使用者選單
  showSettings?: boolean; // 顯示設定選單
  currentTheme?: 'light' | 'dark'; // 當前主題
  onThemeChange?: (theme: 'light' | 'dark') => void;
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
  title="Wind Dashboard"
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

### 🔵 Templates（模板）

頁面級別的佈局模板，定義頁面結構。

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

---

### 📄 Pages（Storybook 頁面）

完整的頁面故事，用於展示實際使用場景。

| 頁面            | 檔案                             | 說明              |
| --------------- | -------------------------------- | ----------------- |
| 登入頁面        | `LoginPage.stories.tsx`          | 完整登入流程      |
| 登入頁面（MSW） | `LoginPageWithMSW.stories.tsx`   | 使用 MSW 模擬 API |
| 忘記密碼        | `ForgotPasswordPage.stories.tsx` | 密碼重設請求      |
| 重設密碼        | `ResetPasswordPage.stories.tsx`  | 密碼重設表單      |

---

## 🚀 開發指南

### 建立新組件

#### 1. 確定組件層級

```text
問題：這個組件應該放在哪一層？

是單一功能元素（按鈕、輸入框）？
  → Atoms

是 2-3 個原子的組合？
  → Molecules

是完整的功能單元（表單、卡片）？
  → Organisms

是頁面佈局？
  → Templates
```

#### 2. 建立組件檔案

```bash
# 範例：建立 Avatar 組件
mkdir -p components/atoms/Avatar
touch components/atoms/Avatar/Avatar.tsx
touch components/atoms/Avatar/Avatar.stories.tsx
touch components/atoms/Avatar/index.ts
```

#### 3. 組件結構

```tsx
// Avatar.tsx
import React from 'react';

export interface AvatarProps {
  src?: string;
  alt?: string;
  size?: 'small' | 'medium' | 'large';
}

export const Avatar: React.FC<AvatarProps> = ({
  src,
  alt = 'Avatar',
  size = 'medium',
}) => {
  return <img src={src} alt={alt} className={`avatar avatar-${size}`} />;
};
```

#### 4. Storybook 故事

```tsx
// Avatar.stories.tsx
import type { Meta, StoryObj } from '@storybook/react';
import { Avatar } from './Avatar';

const meta: Meta<typeof Avatar> = {
  title: 'Atoms/Avatar',
  component: Avatar,
  tags: ['autodocs'],
  argTypes: {
    size: {
      control: { type: 'radio' },
      options: ['small', 'medium', 'large'],
    },
  },
};

export default meta;
type Story = StoryObj<typeof Avatar>;

export const Default: Story = {
  args: {
    src: 'https://via.placeholder.com/150',
    alt: 'User Avatar',
  },
};

export const Small: Story = {
  args: {
    ...Default.args,
    size: 'small',
  },
};
```

#### 5. 導出組件

```typescript
// index.ts
export { Avatar } from './Avatar';
export type { AvatarProps } from './Avatar';
```

---

## 📚 Storybook 使用

Storybook 是設計規範的展示來源，所有規範與組件都必須有對應的 Story，並與專案 Token / 字體 / 斷點保持一致。

### 啟動 Storybook

```bash
cd apps/frontend
pnpm storybook

# 開啟 http://localhost:6006
```

### Storybook 組織結構

根據 `.storybook/preview.tsx`，當前的分類結構為：

```text
1. Introduction（介紹與文檔）
   - Welcome
   - Best Practices
   - Getting Started

2. Design System（設計系統基礎）
   - Colors
   - Typography

3. Atoms（原子組件 - 按功能分組）
   - 按鈕類
     - Button（支援 startIcon, endIcon, iconOnly, loading）
     - ActionButton
     - IconButton
   - 表單欄位類
     - TextField
     - Search
     - DatePicker
     - TimePicker
     - Radio
     - Switch
   - 輸入組件
     - CodeInput
     - Slider
   - 標籤與標記
     - Chip
     - Badge
   - 資料顯示
     - Avatar
     - Icon
     - Progress
     - Skeleton
   - 佈局與分隔
     - Divider
   - 選單類
     - NotificationMenu
     - UserMenu（支援 dynamic menuItems, iconMode）
     - SettingsMenu（支援 dynamic menuItems）

4. Molecules（分子組件 - 按功能分組）
   - 表單組件
     - FormField
     - PasswordField
     - SelectField（支援分組、圖示、篩選）
     - CheckboxGroup
     - RadioGroup
   - 反饋組件
     - AlertMessage
     - ErrorDisplay
     - SnackbarWithProgress
   - 導航組件
     - Tabs
     - Stepper
     - Pagination
   - 語言與設定
     - LanguageSwitcher
   - 資料展示組件
     - Card
     - DataTable（支援排序、篩選、高亮、展開、選擇）
     - DataList（支援排序、篩選、高亮、展開、選擇）
     - Accordion

5. Organisms（有機體組件）
   - 佈局組件
     - Drawer
     - Modal
     - Sidebar
   - 認證表單
     - LoginForm
     - ForgotPasswordForm
     - ResetPasswordForm
     - TwoFactorForm

6. Layout（佈局組件）
   - MainAppBar（全域導航，不包含頁面層級操作）

7. Templates（模板）
   - AuthLayout

8. Pages（完整頁面）
   - LoginPage
   - LoginPage (MSW)
   - ForgotPasswordPage
   - ResetPasswordPage

9. Example（範例與測試）
   - Apollo + MSW Test
```

### 組件文檔

Storybook 自動生成文檔（使用 `tags: ['autodocs']`）：

```tsx
const meta: Meta<typeof Button> = {
  title: 'Atoms/Button',
  component: Button,
  tags: ['autodocs'], // 自動生成文檔
  argTypes: {
    variant: {
      description: '按鈕樣式',
      control: { type: 'select' },
      options: ['text', 'outlined', 'contained'],
    },
  },
};
```

### MSW 整合

Storybook 整合 Mock Service Worker，可模擬 API：

```tsx
// LoginPage.stories.tsx
import { http, HttpResponse } from 'msw';

export const Success: Story = {
  parameters: {
    msw: {
      handlers: [
        http.post('/api/graphql', () => {
          return HttpResponse.json({
            data: {
              login: {
                accessToken: 'fake-token',
                user: { id: '1', name: 'John' },
              },
            },
          });
        }),
      ],
    },
  },
};
```

---

## 🎯 最佳實踐

### ✅ DO - 應該這樣做

#### 1. 遵循 Atomic Design

```tsx
// ✅ 好：Atom 只包含基礎功能
const Button = ({ children, onClick }) => (
  <button onClick={onClick}>{children}</button>
);

// ❌ 差：Atom 包含複雜邏輯
const Button = ({ children, onClick, analyticsEvent, userId }) => {
  // 複雜的分析邏輯...
};
```

#### 2. 使用 TypeScript

```tsx
// ✅ 好：明確的型別定義
interface ButtonProps {
  variant: 'primary' | 'secondary';
  onClick: () => void;
  children: React.ReactNode;
}

// ❌ 差：使用 any
const Button = (props: any) => { ... };
```

#### 3. 提供 Storybook 故事

```tsx
// ✅ 好：多個使用場景
export const Default: Story = { ... };
export const Loading: Story = { ... };
export const Disabled: Story = { ... };
export const WithError: Story = { ... };
```

#### 4. 組件文檔

```tsx
/**
 * Button 組件 - Atomic Design: Atom
 *
 * 基礎按鈕組件，支援多種樣式和狀態。
 *
 * @example
 * <Button variant="primary" onClick={handleClick}>
 *   點擊我
 * </Button>
 */
export const Button: React.FC<ButtonProps> = ({ ... }) => { ... };
```

### ❌ DON'T - 不要這樣做

#### 1. 不要跨層級引用

```tsx
// ❌ 錯誤：Atom 引用 Molecule
import { FormField } from '../../molecules/FormField';

// ✅ 正確：Molecule 引用 Atom
import { TextField } from '../../atoms/TextField';
```

#### 2. 不要在組件中寫業務邏輯

```tsx
// ❌ 錯誤：組件包含 API 呼叫
const LoginForm = () => {
  const handleSubmit = async () => {
    const response = await fetch('/api/login', ...);
    // ...
  };
};

// ✅ 正確：組件接收回調
const LoginForm = ({ onSubmit }) => {
  // 只處理 UI 邏輯
};
```

---

## 🤝 與設計師協作

### 設計與開發流程

```markdown
1. 設計師提供設計稿（Figma）
   ↓
2. 開發者檢查設計稿並確認技術可行性
   ↓
3. 開發者實作組件
   ↓
4. 在 Storybook 中展示組件
   ↓
5. 設計師檢查實作是否符合設計
   ↓
6. 調整並完成
```

### 從設計稿到程式碼

**設計師提供**：

- Figma 設計檔案
- Design Token（顏色、字體、間距）
- 組件狀態設計
- 互動說明

**開發者實作**：

- 轉換為 React 組件
- 整合 Material-UI
- 實作互動邏輯
- 建立 Storybook 故事

### 溝通檢查清單

**設計交付時**：

- [ ] 檢查是否有標註尺寸和間距
- [ ] 確認所有狀態都有設計（Hover, Focus, Error...）
- [ ] 確認響應式設計
- [ ] 討論動畫效果的可行性

**開發實作時**：

- [ ] 與設計稿對照 Design Token
- [ ] 使用 Storybook 展示實作結果
- [ ] 邀請設計師檢查實作
- [ ] 記錄技術限制或差異

---

## 📚 相關文檔

### 給設計師

- 🎨 [DESIGN_GUIDE.md](./DESIGN_GUIDE.md) - 組件設計指南

### 給開發者

- 🔧 [FRONTEND_INTEGRATION.md](./FRONTEND_INTEGRATION.md) - 前端整合指南
- 🧪 [MSW_SETUP.md](./MSW_SETUP.md) - MSW 設置
- 📐 [MONOREPO_STRUCTURE.md](../getting-started/MONOREPO_STRUCTURE.md) - 專案結構
