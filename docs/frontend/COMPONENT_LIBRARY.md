# 組件庫開發指南

統一的組件庫開發規範與 Atomic Design 實踐指南。

---

## 目錄

- [組件庫開發指南](#組件庫開發指南)
  - [目錄](#目錄)
  - [概述](#概述)
    - [技術棧](#技術棧)
    - [為什麼使用 Atomic Design？](#為什麼使用-atomic-design)
  - [Atomic Design 架構](#atomic-design-架構)
    - [組件層級](#組件層級)
    - [組件分類說明（重要）](#組件分類說明重要)
      - [為何某些組件不在「理論上正確」的位置？](#為何某些組件不在理論上正確的位置)
      - [實際分類決策](#實際分類決策)
      - [對開發者的建議](#對開發者的建議)
      - [何時考慮重新分類？](#何時考慮重新分類)
    - [目錄結構](#目錄結構)
  - [Design System（設計系統）](#design-system設計系統)
    - [Colors（顏色系統）](#colors顏色系統)
    - [Typography（字體排版系統）](#typography字體排版系統)
  - [組件清單](#組件清單)
    - [Atoms — 原子組件](./component-library/ATOMS.md)
    - [Molecules — 分子組件](./component-library/MOLECULES.md)
    - [Organisms — 有機體組件](./component-library/ORGANISMS.md)
    - [Layout / Templates / Pages](./component-library/TEMPLATES.md)
  - [開發指南](#開發指南)
    - [建立新組件](#建立新組件)
      - [1. 確定組件層級](#1-確定組件層級)
      - [2. 建立組件檔案](#2-建立組件檔案)
      - [3. 組件結構](#3-組件結構)
      - [4. Storybook 故事](#4-storybook-故事)
      - [5. 導出組件](#5-導出組件)
  - [Storybook 使用](#storybook-使用)
    - [啟動 Storybook](#啟動-storybook)
    - [Storybook 組織結構](#storybook-組織結構)
    - [組件文檔](#組件文檔)
    - [MSW 整合](#msw-整合)
  - [最佳實踐](#最佳實踐)
    - [DO - 應該這樣做](#do---應該這樣做)
      - [1. 遵循 Atomic Design](#1-遵循-atomic-design)
      - [2. 使用 TypeScript](#2-使用-typescript)
      - [3. 提供 Storybook 故事](#3-提供-storybook-故事)
      - [4. 組件文檔](#4-組件文檔)
    - [DON'T - 不要這樣做](#dont---不要這樣做)
      - [1. 不要跨層級引用](#1-不要跨層級引用)
      - [2. 不要在組件中寫業務邏輯](#2-不要在組件中寫業務邏輯)
  - [與設計師協作](#與設計師協作)
    - [設計與開發流程](#設計與開發流程)
    - [從設計稿到程式碼](#從設計稿到程式碼)
    - [溝通檢查清單](#溝通檢查清單)
  - [相關文檔](#相關文檔)
    - [給設計師](#給設計師)
    - [給開發者](#給開發者)

---

## 概述

NPT 前端採用 **Atomic Design** 設計系統，使用 **Material-UI 7** 作為基礎 UI 框架，並透過 **Storybook** 進行組件開發和文檔管理。

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

## Atomic Design 架構

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

### 組件分類說明（重要）

本專案採用**務實的 Atomic Design** 實踐方式。某些組件的實際位置基於開發效率和團隊協作考量，而非嚴格的理論分類。

#### 為何某些組件不在「理論上正確」的位置？

**設計原則**：我們優先考慮**可維護性**和**避免循環依賴**，而非教科書式的分類。

#### 實際分類決策

| 組件                     | 實際位置     | 理論位置 | 保持現狀的原因                                        |
| ------------------------ | ------------ | -------- | ----------------------------------------------------- |
| **Drawer**               | `atoms/`     | Organism | 作為基礎佈局組件，被多個 Organisms 引用；避免循環依賴 |
| **Modal**                | `molecules/` | Organism | 作為對話框容器，不包含業務邏輯；降低依賴複雜度        |
| **Sidebar**              | `molecules/` | Organism | 基於 Drawer 構建；與 Layout 組件搭配使用              |
| **LanguageSwitcher**     | `atoms/`     | Molecule | 視為單一功能按鈕；在多個 Layout 中被引用              |
| **SnackbarWithProgress** | `atoms/`     | Molecule | 通知提示的基礎組件；單一職責原則                      |

#### 對開發者的建議

- ✅ **尋找組件**：使用 IDE 全域搜尋 (Cmd/Ctrl + P)
- ✅ **引用組件**：從 `@/components` 索引檔統一引用
- ✅ **新增組件**：參考現有類似組件的放置位置
- ✅ **不確定時**：詢問團隊或參考本文檔組件清單

> **記住**：分類的目的是幫助開發，而非限制開發。務實的分類比理論上的完美更重要。

#### 何時考慮重新分類？

只有在以下情況才考慮重構組件位置：

1. **循環依賴問題**：組件引用關係出現循環
2. **團隊混淆**：新成員經常找錯位置
3. **大規模重構**：計劃性的組件庫升級

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
│   │   ├── TextArea/
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
│   ├── Drawer/         # 佈局抽屜組件（基於務實考量放置於此）
│   ├── LanguageSwitcher/  # 語言切換器（功能按鈕）
│   ├── SnackbarWithProgress/  # 帶進度的通知提示
│   ├── NotificationBadge/
│   ├── NotificationItem/
│   ├── UserButton/
│   ├── UserMenuItem/
│   ├── SettingsButton/
│   ├── SettingsMenuItem/
│   └── ThemeToggleButton/
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
│   ├── NotificationList/
│   ├── NotificationMenuList/
│   ├── UserMenuHeader/
│   ├── UserMenuList/
│   ├── SettingsMenuList/
│   ├── ThemeSelector/
│   ├── Sidebar/       # 側邊欄導航組件（基於 Drawer 構建）
│   └── Modal/         # 對話框容器組件
│
├── organisms/          # 有機體組件（完整功能單元）
│   ├── LoginForm/
│   ├── TwoFactorForm/
│   ├── ForgotPasswordForm/
│   ├── ResetPasswordForm/
│   ├── NotificationMenu/
│   ├── NotificationCenter/
│   ├── UserMenu/
│   ├── SettingsMenu/
│   ├── SessionsTable/
│   └── SystemStatusMonitor/
│
├── layout/             # 佈局組件
│   └── MainAppBar/
│
├── templates/          # 頁面模板（佈局）
│   ├── AuthLayout/
│   └── DashboardLayout/
│
└── pages/              # Storybook 頁面故事
    ├── LoginPage.stories.tsx
    ├── LoginPageWithMSW.stories.tsx
    ├── ForgotPasswordPage.stories.tsx
    └── ResetPasswordPage.stories.tsx
```

---

## Design System（設計系統）

設計系統定義了應用程式的視覺語言基礎，包括顏色、字體排版等核心元素。

### Colors（顏色系統）

**路徑**: `components/design-system/Colors.stories.tsx`

**功能**:

- 展示應用程式的完整顏色系統
- 包含主題色、語意色、文字色等
- 提供顏色使用指南和範例

**顏色類別**:

- **Primary Colors** - 主要品牌色
- **Secondary Colors** - 次要品牌色
- **Semantic Colors** - 語意色 (Success, Warning, Error, Info)
- **Text Colors** - 文字顏色 (Primary, Secondary, Disabled)
- **Background Colors** - 背景顏色
- **Border Colors** - 邊框顏色

**使用場景**: Storybook 設計系統文檔

**Storybook**: ✅ `Colors.stories.tsx`

---

### Typography（字體排版系統）

**路徑**: `components/design-system/Typography.stories.tsx`

**功能**:

- 展示應用程式的完整字體排版系統
- 包含標題、正文、標籤等所有文字樣式
- 提供字體使用指南和範例

**字體變體**:

- **Headings** - h1, h2, h3, h4, h5, h6
- **Body Text** - body1, body2
- **Subtitles and Captions** - subtitle1, subtitle2, caption, overline
- **Button Text** - button
- **Font Weights** - Light (300), Regular (400), Medium (500), Semi Bold (600), Bold (700)
- **Text Alignment** - Left, Center, Right, Justify
- **Text Colors** - Primary, Secondary, Disabled, Theme Colors

**使用範例**:

```tsx
import { Typography } from '@mui/material';

// 標題
<Typography variant="h1">Main Title</Typography>
<Typography variant="h4">Section Title</Typography>

// 正文
<Typography variant="body1">Primary body text</Typography>
<Typography variant="body2">Secondary body text</Typography>

// 標籤
<Typography variant="caption" color="text.secondary">
  Caption text
</Typography>

// 字體粗細
<Typography sx={{ fontWeight: 700 }}>Bold text</Typography>

// 顏色
<Typography color="primary">Primary color</Typography>
<Typography color="error">Error color</Typography>
```

**使用場景**: Storybook 設計系統文檔

**Storybook**: ✅ `Typography.stories.tsx`

---

## 組件清單

為了便於維護，組件清單依 Atomic Design 層級拆分為四份獨立文件：

| 層級                           | 文件                                                     | 說明                                                          |
| ------------------------------ | -------------------------------------------------------- | ------------------------------------------------------------- |
| **Atoms**                      | [組件清單 - Atoms](./component-library/ATOMS.md)         | 原子組件 — 最小不可分割的 UI 元素（Button、TextField、Icon…） |
| **Molecules**                  | [組件清單 - Molecules](./component-library/MOLECULES.md) | 分子組件 — 由 Atoms 組成的功能單元（FormField、Card、Toast…） |
| **Organisms**                  | [組件清單 - Organisms](./component-library/ORGANISMS.md) | 有機體組件 — 複雜獨立的 UI 區塊（Modal、Sidebar、Form…）      |
| **Layout / Templates / Pages** | [組件清單 - Templates](./component-library/TEMPLATES.md) | 佈局、模板與 Storybook 頁面範例                               |

> 拆分原因：原本單一文件超過 3600 行，不利查閱與維護。依職責分拆後，前端工程師可快速定位所需組件層級。

---

## 開發指南

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

## Storybook 使用

Storybook 是設計規範的展示來源，所有規範與組件都必須有對應的 Story，並與專案 Token / 字體 / 斷點保持一致。

### 啟動 Storybook

```bash
cd apps/frontend
pnpm storybook

# 開啟 http://localhost:6006
```

### Storybook 組織結構

根據 `.storybook/preview.tsx`，頂層分類為指定順序，**各層級內部自動按英文字母排序**（`method: 'alphabetical'`）。新增組件會自動放入正確字母位置，不需手動維護排序清單。

```text
1. Introduction（介紹與文檔）    — 指定順序
   Welcome → Best Practices → Getting Started

2. Design System（設計系統基礎）  — 指定順序
   Colors → Typography

3. Atoms（原子組件）              — 字母排序
   ActionButton, Avatar, Badge, Button, Chip, CodeInput,
   DatePicker, Divider, Icon, IconButton, NotificationBadge,
   NotificationItem, Progress, Radio, Search, SettingsButton,
   SettingsMenuItem, Skeleton, Slider, Switch, TextArea, TextField,
   ThemeToggleButton, TimePicker, UserButton, UserMenuItem

4. Molecules（分子組件）          — 字母排序
   Accordion, AlertMessage, Card, CheckboxGroup, DataList, DataTable,
   DetailRow, ErrorDisplay, FormField, InfiniteNotificationList,
   KPICard, LanguageSwitcher, NotificationFilters, NotificationList,
   NotificationMenuList, PageHeader, Pagination, PasswordField,
   RadioGroup, SelectField, SettingsMenuList, SnackbarWithProgress,
   Stepper, Tabs, ThemeSelector, UserMenuHeader, UserMenuList

5. Organisms（有機體組件）        — 字母排序
   ChangePasswordForm, Drawer, ForgotPasswordForm, HQ(子群組),
   LoginForm, Modal, NotificationCenter, NotificationMenu,
   ResetPasswordForm, SessionsTable, SettingsMenu, Sidebar,
   SystemStatusMonitor, TwoFactorForm, TwoFactorSettings, UserMenu

   HQ 子群組（管理後台組件）:
   AuditLogDetailsModal, AuditLogTable, BatchRevokeModal,
   CronJobConfigDetailsModal, CronJobExecutionDetailsModal,
   CronJobExecutionHistory, CronJobFilters, CronJobListFilters,
   CronJobStats, CronJobTable, CronJobTriggerDialog,
   RevokeOtherDevicesModal, RevokeSessionModal,
   SessionDetailsModal, SessionFilters, SessionStats, SessionTable

6. Layout                          — 字母排序
   MainAppBar

7. Templates                       — 字母排序
   AuthLayout, DashboardLayout

8. Pages                           — 字母排序
   ForgotPasswordPage, LoginPage, LoginPageWithMSW, ResetPasswordPage
```

> 排序規則在 `.storybook/preview.tsx` 的 `storySort` 設定。新增組件時只需確保 Story 的 `title` 正確（如 `Molecules/KPICard`），Storybook 會自動依字母排序放入對應位置。

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

## 最佳實踐

### DO - 應該這樣做

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

### DON'T - 不要這樣做

#### 1. 不要跨層級引用

```tsx
// ❌ 錯誤：Atom 引用 Molecule
import { FormField } from '../../molecules/FormField';

// ✅ 正確：Molecule 引用 Atom（使用統一導出）
import { TextField } from '../../atoms/Fields';
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

## 與設計師協作

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

## 相關文檔

### 給設計師

- [DESIGN_GUIDE.md](./DESIGN_GUIDE.md) - 組件設計指南

### 給開發者

- [FRONTEND_INTEGRATION.md](./FRONTEND_INTEGRATION.md) - 前端整合指南
- [MSW_SETUP.md](./MSW_SETUP.md) - MSW 設置
- [MONOREPO_STRUCTURE.md](../getting-started/MONOREPO_STRUCTURE.md) - 專案結構
