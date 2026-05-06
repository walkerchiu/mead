# 組件庫 — Atoms（原子組件）

> 本文件是 [組件庫總覽](../COMPONENT_LIBRARY.md) 的一部分，專注於 Atomic Design 的最底層 — Atoms（原子組件）。

## 本文件涵蓋

最小不可分割的 UI 元素，如按鈕、輸入框、圖示、徽章等。這些是所有更高層級組件的基礎。

---

### Atoms（原子組件）

基礎組件，不可再分割，通常是對 MUI 組件的輕量封裝。

#### ActionButton

**路徑**: `components/atoms/Buttons/ActionButton/`

**功能**:

- 操作按鈕組件
- 用於特定操作的按鈕
- 支援圖示和標籤

**Storybook**: ✅ `ActionButton.stories.tsx`

---

#### Avatar

**路徑**: `components/atoms/Avatar/`

**功能**:

- 用戶頭像組件
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

#### Chip

**路徑**: `components/atoms/Chips/Chip/`

**功能**:

- 標籤/徽章組件
- 顯示狀態、類別或標籤
- 支援多種變體和尺寸
- 可選的圖示和點狀指示器

**Props**:

```typescript
interface ChipProps {
  label: string;
  variant?: 'success' | 'warning' | 'error' | 'info' | 'text' | 'another';
  size?: 'small' | 'medium' | 'large';
  icon?: React.ReactNode;
  dot?: boolean; // 顯示點狀指示器
  disabled?: boolean;
  onDelete?: () => void; // 可刪除的 Chip
}
```

**使用範例**:

```tsx
// 基本用法
<Chip label="Active" variant="success" />

// 帶圖示
<Chip label="Scheduled" icon={<ScheduleIcon />} variant="info" />

// 可刪除
<Chip label="Tag" onDelete={() => console.log('Deleted')} />

// 帶點狀指示器
<Chip label="Online" dot variant="success" />
```

**Storybook**: ✅ `Chip.stories.tsx`

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

#### DatePicker

**路徑**: `components/atoms/Fields/DatePicker/`

**功能**:

- 日期選擇器組件
- MUI DatePicker 封裝
- 支援日期格式化

**Storybook**: ✅ `DatePicker.stories.tsx`

---

#### Divider

**路徑**: `components/atoms/Divider/`

**功能**:

- 分隔線組件
- 視覺分隔元素

**Storybook**: ✅ `Divider.stories.tsx`

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

#### IconButton

**路徑**: `components/atoms/Buttons/IconButton/`

**功能**:

- 圖示按鈕組件
- 純圖示無文字
- MUI IconButton 封裝

**Storybook**: ✅ `IconButton.stories.tsx`

---

#### NotificationBadge

**路徑**: `components/atoms/NotificationBadge/`

**功能**:

- 通知徽章按鈕
- 顯示未讀通知數量
- 鈴鐺圖示 + Badge

**用戶**: NotificationMenu

**Storybook**: ✅ `NotificationBadge.stories.tsx`

---

#### NotificationItem

**路徑**: `components/atoms/NotificationItem/`

**功能**:

- 單一通知項目顯示
- 支援不同通知類型
- 顯示標題、訊息、時間戳

**用戶**: NotificationList

**Storybook**: ✅ `NotificationItem.stories.tsx`

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

#### Radio

**路徑**: `components/atoms/Fields/Radio/`

**功能**:

- 單選按鈕組件
- MUI Radio 封裝
- 基礎單選功能

**Storybook**: ✅ `Radio.stories.tsx`

---

#### Search

**路徑**: `components/atoms/Fields/Search/`

**功能**:

- 搜尋輸入框組件
- 帶搜尋圖示
- 支援清除功能

**Storybook**: ✅ `Search.stories.tsx`

---

#### SettingsButton

**路徑**: `components/atoms/SettingsButton/`

**功能**:

- 設定按鈕組件
- 齒輪圖示按鈕
- 支援標籤顯示

**用戶**: SettingsMenu

**Storybook**: ✅ `SettingsButton.stories.tsx`

---

#### SettingsMenuItem

**路徑**: `components/atoms/SettingsMenuItem/`

**功能**:

- 設定選單項目
- 單一選單項顯示
- 支援圖示和標籤

**用戶**: SettingsMenuList

**Storybook**: ✅ `SettingsMenuItem.stories.tsx`

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

#### Slider

**路徑**: `components/atoms/Slider/`

**功能**:

- 滑桿組件
- 數值範圍選擇

**Storybook**: ✅ `Slider.stories.tsx`

---

#### Switch

**路徑**: `components/atoms/Switch/`

**功能**:

- 開關切換組件
- MUI Switch 封裝

**Storybook**: ✅ `Switch.stories.tsx`

---

#### TextArea

**路徑**: `components/atoms/Fields/TextArea/`

**功能**:

- 多行文字輸入框（Multiline text input）
- 專為 textarea 使用場景優化
- 支援固定行數或自動擴展
- 獨立的樣式配置（8px 圓角）

**Props**:

```typescript
interface TextAreaProps {
  label?: string;
  placeholder?: string;
  size?: 'small' | 'medium' | 'large';
  rows?: number; // 固定行數，預設 4
  minRows?: number; // 最小行數（自動擴展模式）
  maxRows?: number; // 最大行數（自動擴展模式）
  error?: boolean;
  helperText?: string;
  required?: boolean;
  disabled?: boolean;
  fullWidth?: boolean;
  value?: string;
  onChange?: (e: React.ChangeEvent<HTMLTextAreaElement>) => void;
  inputProps?: {
    maxLength?: number;
  };
}
```

**使用範例**:

```tsx
// 基本 textarea（4 行）
<TextArea label="Description" placeholder="Enter description..." />

// 自訂行數
<TextArea label="Comments" rows={6} />

// 自動擴展（2-8 行）
<TextArea label="Notes" minRows={2} maxRows={8} />

// 字數限制
<TextArea
  label="Bio"
  rows={5}
  helperText="Maximum 500 characters"
  inputProps={{ maxLength: 500 }}
/>

// 錯誤狀態
<TextArea
  label="Message"
  error
  helperText="Message is too short"
  defaultValue="Hi"
/>
```

**適用場景**:

- 留言和評論輸入
- 描述和備註欄位
- 訊息內容編輯
- 表單的多行文字欄位

**Storybook**: ✅ `TextArea.stories.tsx`

---

#### TextField

**路徑**: `components/atoms/Fields/TextField/`

**功能**:

- 單行文本輸入框（Single-line text input）
- MUI TextField 封裝
- 支援多種輸入類型（text, email, password, number, tel, url）
- 自訂 number 輸入的 stepper 樣式

**Props**:

```typescript
interface TextFieldProps {
  label?: string;
  placeholder?: string;
  type?: 'text' | 'email' | 'password' | 'number' | 'tel' | 'url';
  size?: 'small' | 'medium' | 'large';
  error?: boolean;
  helperText?: string;
  required?: boolean;
  disabled?: boolean;
  fullWidth?: boolean;
  value?: string;
  onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
  hideNumberSpinner?: boolean;
  useCustomStepper?: boolean;
}
```

**使用範例**:

```tsx
// 基本文字輸入
<TextField label="Name" placeholder="Enter your name" />

// Email 輸入
<TextField type="email" label="Email" placeholder="user@example.com" />

// 數字輸入（帶自訂 stepper）
<TextField type="number" label="Age" useCustomStepper />

// 錯誤狀態
<TextField
  label="Password"
  type="password"
  error
  helperText="Password is required"
/>
```

**注意事項**:

- ⚠️ TextField 僅支援**單行輸入**
- 若需要多行文字輸入，請使用 [TextArea](#textarea) 組件

**Storybook**: ✅ `TextField.stories.tsx`

---

#### ThemeToggleButton

**路徑**: `components/atoms/ThemeToggleButton/`

**功能**:

- 主題切換按鈕
- 支援 light/dark/system 三種模式
- 顯示當前主題圖示

**用戶**: ThemeSelector

**Storybook**: ✅ `ThemeToggleButton.stories.tsx`

---

#### TimePicker

**路徑**: `components/atoms/Fields/TimePicker/`

**功能**:

- 時間選擇器組件
- MUI TimePicker 封裝
- 支援時間格式化

**Storybook**: ✅ `TimePicker.stories.tsx`

---

#### UserButton

**路徑**: `components/atoms/UserButton/`

**功能**:

- 用戶按鈕組件
- 顯示用戶頭像或圖示
- 支援名稱顯示和狀態指示器

**用戶**: UserMenu

**Storybook**: ✅ `UserButton.stories.tsx`

---

#### UserMenuItem

**路徑**: `components/atoms/UserMenuItem/`

**功能**:

- 用戶選單項目
- 單一選單項顯示
- 支援圖示和標籤

**用戶**: UserMenuList

**Storybook**: ✅ `UserMenuItem.stories.tsx`

---

**相關文件**：[組件庫總覽](../COMPONENT_LIBRARY.md) | [Molecules](./MOLECULES.md) | [Organisms](./ORGANISMS.md) | [Templates](./TEMPLATES.md)
