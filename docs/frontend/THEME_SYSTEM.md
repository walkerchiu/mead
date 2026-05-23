# 主題系統技術文檔

完整的 Light/Dark/System 主題系統實作與使用指南。

---

## 目錄

- [主題系統技術文檔](#主題系統技術文檔)
  - [目錄](#目錄)
  - [概述](#概述)
    - [技術棧](#技術棧)
    - [功能特性](#功能特性)
  - [架構設計](#架構設計)
    - [主題模式](#主題模式)
    - [系統架構圖](#系統架構圖)
    - [核心組件](#核心組件)
  - [檔案結構](#檔案結構)
  - [核心實作](#核心實作)
    - [1. ThemeRegistry (`theme/ThemeRegistry.tsx`)](#1-themeregistry-themethemeregistrytsx)
    - [2. Theme 配置 (`theme/theme.ts`)](#2-theme-配置-themethemets)
    - [3. 暗色模式調色盤 (`theme/tokens/paletteDark.ts`)](#3-暗色模式調色盤-themetokenspalettedarkts)
    - [4. 暗色模式按鈕 Tokens (`theme/tokens/buttonTokensDark.ts`)](#4-暗色模式按鈕-tokens-themetokensbuttontokensdarkts)
    - [5. 主題感知色彩工具 (`utils/theme-colors.ts`)](#5-主題感知色彩工具-utilstheme-colorsts)
  - [設計 Tokens](#設計-tokens)
    - [淺色模式色彩](#淺色模式色彩)
    - [暗色模式色彩](#暗色模式色彩)
    - [色彩對比](#色彩對比)
  - [使用指南](#使用指南)
    - [1. 基本使用](#1-基本使用)
    - [2. 組件中使用主題](#2-組件中使用主題)
    - [3. 主題感知色彩](#3-主題感知色彩)
    - [4. 主題切換組件](#4-主題切換組件)
  - [進階功能](#進階功能)
    - [跨頁面主題同步](#跨頁面主題同步)
    - [系統主題偵測](#系統主題偵測)
    - [localStorage 持久化](#localstorage-持久化)
    - [SSR 考量](#ssr-考量)
  - [組件適配指南](#組件適配指南)
    - [按鈕組件](#按鈕組件)
    - [表格組件](#表格組件)
    - [表單組件](#表單組件)
  - [最佳實踐](#最佳實踐)
    - [DO - 應該這樣做](#do---應該這樣做)
      - [1. 使用 Theme 的語意色彩](#1-使用-theme-的語意色彩)
      - [2. 使用主題感知工具函數](#2-使用主題感知工具函數)
      - [3. 提供主題切換選項](#3-提供主題切換選項)
      - [4. 測試所有主題模式](#4-測試所有主題模式)
    - [DON'T - 不要這樣做](#dont---不要這樣做)
      - [1. 不要使用硬編碼顏色](#1-不要使用硬編碼顏色)
      - [2. 不要在組件中管理主題狀態](#2-不要在組件中管理主題狀態)
      - [3. 不要忘記 SSR 檢查](#3-不要忘記-ssr-檢查)
      - [4. 不要使用純黑/純白](#4-不要使用純黑純白)
  - [故障排除](#故障排除)
    - [問題 1：主題切換後沒有反應](#問題-1主題切換後沒有反應)
    - [問題 2：頁面重新整理後主題恢復預設](#問題-2頁面重新整理後主題恢復預設)
    - [問題 3：SSR Hydration 錯誤](#問題-3ssr-hydration-錯誤)
    - [問題 4：登出後登入頁面主題不一致](#問題-4登出後登入頁面主題不一致)
    - [問題 5：暗色模式對比度不足](#問題-5暗色模式對比度不足)
    - [問題 6：MUI Chip Icon 在暗色模式下不可見](#問題-6mui-chip-icon-在暗色模式下不可見)
  - [參考資源](#參考資源)
    - [設計文檔](#設計文檔)
    - [技術文檔](#技術文檔)
  - [總結](#總結)

---

## 概述

MEAD 前端專案實作了完整的主題系統,支援 **Light/Dark/System** 三種模式,並提供無縫的跨頁面主題同步與持久化功能。

### 技術棧

- **UI 框架**: Material-UI 7.3.7
- **樣式系統**: Emotion
- **主題管理**: MUI Theme + Custom ThemeRegistry
- **狀態持久化**: localStorage
- **系統主題偵測**: window.matchMedia

### 功能特性

- ✅ Light/Dark/System 三種主題模式
- ✅ 系統主題自動跟隨 (matchMedia API)
- ✅ localStorage 持久化
- ✅ 跨頁面/跨 Tab 即時同步
- ✅ SSR 友好 (避免 Hydration 錯誤)
- ✅ 完整的暗色模式設計 Tokens
- ✅ 主題感知色彩工具函數
- ✅ 自訂事件系統 (theme-change)
- ✅ 無障礙設計 (WCAG AA 對比度)

---

## 架構設計

### 主題模式

```text
主題模式層級:
├── Light (淺色模式)
│   ├── 主色: 品牌深藍 (#0c3467, PANTONE 294C)
│   ├── 背景: 淺冷灰白 (#F5F7FA, #FFFFFF)
│   └── 文字: 近黑深藍 (#001239)
│
├── Dark (暗色模式)
│   ├── 主色: 提亮深藍 (#658BBF)
│   ├── 背景: 深黑 (#0D0D0D, #1A1A1A)
│   └── 文字: 柔和白 (rgba(255,255,255,0.92))
│
└── System (跟隨系統)
    └── 自動切換 Light/Dark
```

### 系統架構圖

```text
┌─────────────────────────────────────────────┐
│         ThemeRegistry (Root)                │
│  - 管理主題狀態                              │
│  - 監聽 localStorage                         │
│  - 監聽系統主題變化                          │
│  - 提供 MUI ThemeProvider                    │
└───────────────┬─────────────────────────────┘
                │
                ├─► localStorage ('theme')
                │   - 'light' / 'dark' / 'system'
                │
                ├─► window.matchMedia
                │   - prefers-color-scheme: dark
                │
                ├─► Custom Event ('theme-change')
                │   - 同頁面即時更新
                │
                └─► Storage Event
                    - 跨頁面/Tab 同步
```

### 核心組件

```text
1. ThemeRegistry
   └─ 主題狀態管理與切換邏輯

2. createAppTheme(mode)
   └─ 根據模式生成 MUI Theme

3. ThemeSelector (UI)
   └─ 主題選擇器組件 (3 選項)

4. ThemeToggleButton (UI)
   └─ 快速切換按鈕 (圖示)

5. getStatusColors / getActionColor / getEntityColor
   └─ 主題感知色彩工具函數
```

---

## 檔案結構

```text
apps/frontend/src/
├── theme/
│   ├── ThemeRegistry.tsx              # 主題註冊中心（含 MUI 官方 AppRouterCacheProvider）
│   ├── theme.ts                       # MUI Theme 配置
│   └── tokens/
│       ├── paletteDark.ts             # 暗色模式調色盤
│       ├── paletteLight.ts            # 淺色模式調色盤
│       ├── buttonTokensDark.ts        # 暗色模式按鈕 Tokens
│       ├── buttonTokensLight.ts       # 淺色模式按鈕 Tokens
│       ├── componentOverrides.ts      # MUI 組件覆寫
│       └── tones.ts                   # 基礎色調定義
│
├── utils/
│   └── theme-colors.ts                # 主題感知色彩工具
│
├── components/
│   ├── atoms/
│   │   └── ThemeToggleButton/         # 主題切換按鈕
│   └── molecules/
│       └── ThemeSelector/             # 主題選擇器
│
└── app/
    └── [locale]/
        ├── layout.tsx                 # 包含 ThemeRegistry
        └── providers.tsx              # Client Providers
```

---

## 核心實作

### 1. ThemeRegistry (`theme/ThemeRegistry.tsx`)

**功能**：主題狀態管理、監聽器設定、Theme Provider 包裝

```typescript
'use client';

import { useMemo, useEffect, useState } from 'react';
import { AppRouterCacheProvider } from '@mui/material-nextjs/v15-appRouter';
import { ThemeProvider } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import { createAppTheme } from './theme';

export function ThemeRegistry({
  children,
  nonce,
}: {
  children: React.ReactNode;
  nonce?: string;
}) {
  const [themeMode, setThemeMode] = useState<'light' | 'dark'>('light');
  const [isClient, setIsClient] = useState(false);

  // 客戶端初始化
  useEffect(() => {
    setIsClient(true);
  }, []);

  // 監聽主題變化（storage / matchMedia / theme-change）
  useEffect(() => {
    if (!isClient) return;
    // ...（略）
  }, [isClient]);

  const muiTheme = useMemo(() => createAppTheme(themeMode), [themeMode]);

  return (
    <AppRouterCacheProvider options={{ key: 'mui', nonce, prepend: true }}>
      <ThemeProvider theme={muiTheme}>
        <CssBaseline />
        {children}
      </ThemeProvider>
    </AppRouterCacheProvider>
  );
}
```

**關鍵設計**：

1. **MUI 官方 SSR adapter**: 使用 `@mui/material-nextjs/v15-appRouter` 的 `AppRouterCacheProvider` 處理 emotion cache，避免 Next.js 16 streaming SSR 與自寫 emotion cache 的順序衝突
2. **CSP nonce**: 透過 `options.nonce` 將 nonce 應用到所有 emotion 動態樣式
3. **三重監聽器**:
   - `storage` 事件 → 跨頁面同步
   - `matchMedia` 事件 → 系統主題變化
   - `theme-change` 事件 → 同頁面即時更新
4. **System 模式處理**: 動態計算 effectiveMode

---

### 2. Theme 配置 (`theme/theme.ts`)

**功能**：根據模式生成 MUI Theme

```typescript
import { createTheme } from '@mui/material/styles';
import { paletteDark } from './tokens/paletteDark';
import { paletteLight } from './tokens/paletteLight';
import { componentOverrides } from './tokens/componentOverrides';

export function createAppTheme(mode: 'light' | 'dark') {
  const palette = mode === 'dark' ? paletteDark : paletteLight;

  return createTheme({
    palette: {
      mode,
      ...palette,
    },
    typography: {
      fontFamily: 'Roboto, "Noto Sans TC", sans-serif',
      // ... 其他 typography 設定
    },
    components: componentOverrides(mode),
  });
}
```

---

### 3. 暗色模式調色盤 (`theme/tokens/paletteDark.ts`)

**設計原則**：

```typescript
/**
 * Dark mode color palette - Professional & Comfortable
 *
 * Design principles:
 * - Softer, muted colors instead of vibrant ones
 * - Reduced contrast to minimize eye strain
 * - Blue-gray tones for professionalism
 * - Subtle accents that don't overwhelm
 */

export const greyDark = {
  50: '#0D0D0D', // Darkest - main background
  100: '#1A1A1A', // Very dark - paper/card
  200: '#262626', // Dark - hover states
  300: '#2E2E2E', // Medium dark - borders
  400: '#404040', // Medium - disabled elements
  500: '#595757', // PANTONE Cool Gray 11C
  600: '#797878', // Light - placeholder text
  700: '#999999', // Lighter - secondary text
  800: '#b5b5b6', // PANTONE 429C
  900: '#dcdddd', // PANTONE 428C - primary text
  950: '#F5F5F5', // Almost white - emphasized text
} as const;

export const colorsDark = {
  primary: {
    light: tones.primary[300], // #8CA8CF
    main: tones.primary[400], // #658BBF - 品牌深藍提亮版
    dark: tones.primary[600], // #0c3467 - 品牌深藍 PANTONE 294C
    contrastText: '#ffffff',
  },
  // ... 其他語意色使用對應的 tones 階調
};

export const paletteDark = {
  ...colorsDark,
  grey: greyDark,
  background: {
    default: '#0D0D0D', // 避免純黑
    paper: '#1A1A1A',
  },
  text: {
    primary: 'rgba(255, 255, 255, 0.92)', // 避免純白
    secondary: 'rgba(255, 255, 255, 0.65)',
    disabled: 'rgba(255, 255, 255, 0.38)',
  },
};
```

**設計考量**：

- **避免純黑/純白**: 使用 #0D0D0D 和 rgba(255,255,255,0.92)
- **保留品牌識別**: Primary 使用品牌深藍 `#0c3467` 的提亮版本 `#658BBF`（400 階），非改換色相
- **降低對比**: 減少長時間使用的眼睛疲勞

---

### 4. 暗色模式按鈕 Tokens (`theme/tokens/buttonTokensDark.ts`)

```typescript
export const buttonTokensDark = {
  contained: {
    bg: colorsDark.primary.main, // #658BBF
    hoverBg: colorsDark.primary.dark, // #0c3467
    pressedBg: '#00194e', // PANTONE 648C
    text: white,
    disabledBg: greyDark[300],
    disabledText: greyDark[600],
  },
  outlined: {
    border: greyDark[500],
    bg: 'transparent',
    hoverBg: 'rgba(90, 155, 245, 0.08)',
    pressedBg: 'rgba(90, 155, 245, 0.16)',
    text: greyDark[900],
  },
  // ... 其他按鈕變體
};
```

---

### 5. 主題感知色彩工具 (`utils/theme-colors.ts`)

**功能**：提供主題感知的色彩計算函數

```typescript
/**
 * Get status colors based on theme mode
 */
export function getStatusColors(mode: 'light' | 'dark') {
  if (mode === 'dark') {
    return {
      ACTIVE: {
        bg: 'rgba(76, 175, 80, 0.25)',
        border: 'rgba(76, 175, 80, 0.5)',
        text: '#81c784',
      },
      REVOKED: {
        bg: 'rgba(244, 67, 54, 0.25)',
        border: 'rgba(244, 67, 54, 0.5)',
        text: '#e57373',
      },
      // ...
    };
  }

  // Light mode colors
  return {
    ACTIVE: {
      bg: 'rgba(46, 125, 50, 0.08)',
      border: 'rgba(46, 125, 50, 0.3)',
      text: '#2e7d32',
    },
    // ...
  };
}
```

**功能函數**：

1. **`getStatusColors(mode)`** - 狀態顏色（綠/紅/橙）
   - `ACTIVE` / `SUCCESS` - 綠色系
   - `REVOKED` / `FAILURE` - 紅色系
   - `EXPIRED` - 橙色系

2. **`getActionColor(action, mode)`** - 審計日誌動作顏色

3. **`getEntityColor(entity, mode)`** - 審計日誌實體顏色

**使用場景**：

- 表格狀態標籤 (SessionTable, AuditLogTable)
- 審計日誌動作顏色 (Create/Update/Delete)
- Entity 類型顏色 (User/Session/Role)

**動作與實體顏色設計（Blue-Grey 單色系統）**：

審計日誌的動作（Action）和實體（Entity）標籤使用**統一的 Blue-Grey 單色系統**，通過**深度差異**來表示重要性和風險等級：

```typescript
/**
 * Action Colors - Blue-Grey Monochrome System
 *
 * 設計原則：
 * - 使用單一色系（Blue-Grey）保持視覺統一
 * - 深度表示風險/重要性（淺 = 低風險，深 = 高風險）
 * - 低飽和度，不喧賓奪主（讓 Status 的綠/紅更突出）
 *
 * 語意分組（由淺到深）：
 * 1. QUERY（查詢）- 最淺 - 唯讀操作，最頻繁
 * 2. AUTH（認證）- 淺色 - 認證相關操作
 * 3. UPDATE（修改）- 中度 - 資料修改
 * 4. CREATE（創建）- 深色 - 新資料創建
 * 5. DELETE（刪除）- 最深 - 最高風險操作
 */
export function getActionColor(
  action: string,
  mode: 'light' | 'dark',
): ColorSet {
  const actionLower = action.toLowerCase();

  if (mode === 'dark') {
    // QUERY - Lightest Blue-Grey (#b0bec5)
    if (actionLower.startsWith('query')) {
      return {
        bg: 'rgba(144, 164, 174, 0.2)',
        border: 'rgba(144, 164, 174, 0.4)',
        text: '#b0bec5',
      };
    }

    // DELETE - Deepest Blue-Grey (#546e7a)
    if (actionLower.includes('delete')) {
      return {
        bg: 'rgba(69, 90, 100, 0.32)',
        border: 'rgba(69, 90, 100, 0.6)',
        text: '#546e7a',
      };
    }
    // ... 其他動作
  }
  // Light mode 同樣邏輯
}
```

**Entity Colors** 使用相同的 Blue-Grey 系統，但透明度略低，以區分欄位：

```typescript
/**
 * Entity Colors - 與 Action 相同的 Blue-Grey 系統
 *
 * 語意分組：
 * 1. User/me（用戶）- 基礎層級
 * 2. Session（會話）- 安全層級
 * 3. Auth（認證）- 安全層級
 * 4. Role/Permission（權限）- 控制層級
 * 5. System（系統）- 基礎設施層級
 */
```

**設計優勢**：

- ✅ **視覺統一**：單色系統避免過多顏色干擾
- ✅ **層次分明**：深度表示重要性，一目瞭然
- ✅ **協調性**：低飽和度讓 Status 的語意色（綠/紅）更突出
- ✅ **可擴展**：新增動作/實體類型容易分配顏色
- ✅ **無障礙**：所有組合符合 WCAG AA 對比度標準

**與 Status 顏色的關係**：

| 欄位   | 顏色系統  | 用途           | 設計理念           |
| ------ | --------- | -------------- | ------------------ |
| Status | 語意色    | 成功/失敗/警告 | 高飽和度，醒目     |
| Action | Blue-Grey | 操作類型       | 低飽和度，輔助資訊 |
| Entity | Blue-Grey | 實體類型       | 低飽和度，輔助資訊 |
| IP     | Outlined  | 技術資訊       | 無色，最低視覺權重 |

**視覺層次（由重要到次要）**：

1. **Status（綠/紅/橙）** - 最重要，高對比
2. **Action（Blue-Grey 深淺）** - 次要，提供上下文
3. **Entity（Blue-Grey 淡化）** - 次要，提供上下文
4. **IP/Device（Outlined）** - 技術細節，最低權重

---

## 設計 Tokens

### 淺色模式色彩

```text
主色: #0c3467 (品牌深藍 PANTONE 294C)
背景: #F5F7FA (淺冷灰白), #FFFFFF (白)
文字: #001239 (近黑深藍)
```

### 暗色模式色彩

```text
主色: #658BBF (提亮深藍)
背景: #0D0D0D (純黑), #1A1A1A (略淺)
文字: rgba(255,255,255,0.92) (柔和白)
```

### 色彩對比

| 元素        | 淺色模式   | 暗色模式               |
| ----------- | ---------- | ---------------------- |
| 主色        | 品牌深藍   | 提亮深藍               |
| 背景        | 淺冷灰     | 深黑                   |
| 文字主色    | 近黑深藍   | 柔和白                 |
| 文字次色    | 品牌深灰   | rgba(255,255,255,0.65) |
| 對比度 (AA) | 4.5:1 以上 | 4.5:1 以上             |
| 設計理念    | 專業、沉穩 | 專業、舒適             |

---

## 使用指南

### 1. 基本使用

**在 Layout 中引入 ThemeRegistry**：

```typescript
// app/[locale]/layout.tsx
import { ThemeRegistry } from '@/theme/ThemeRegistry';

export default function LocaleLayout({ children }) {
  return (
    <html>
      <body>
        <ThemeRegistry>
          {children}
        </ThemeRegistry>
      </body>
    </html>
  );
}
```

---

### 2. 組件中使用主題

**方法 1: 使用 `useTheme` Hook**

```typescript
'use client';

import { useTheme } from '@mui/material/styles';

export function MyComponent() {
  const theme = useTheme();

  return (
    <Box
      sx={{
        bgcolor: theme.palette.background.paper,
        color: theme.palette.text.primary,
      }}
    >
      當前模式: {theme.palette.mode}
    </Box>
  );
}
```

**方法 2: 使用 `sx` Prop**

```typescript
<Box
  sx={{
    bgcolor: 'background.paper',
    color: 'text.primary',
    borderColor: 'divider',
  }}
>
  內容
</Box>
```

---

### 3. 主題感知色彩

**在表格組件中使用**：

```typescript
'use client';

import { useTheme } from '@mui/material/styles';
import { getStatusColors } from '@/utils/theme-colors';

export function SessionTable() {
  const theme = useTheme();
  const statusColors = getStatusColors(theme.palette.mode);

  return (
    <Chip
      label="ACTIVE"
      sx={{
        bgcolor: statusColors.ACTIVE.bg,
        border: `1px solid ${statusColors.ACTIVE.border}`,
        color: statusColors.ACTIVE.text,
      }}
    />
  );
}
```

---

### 4. 主題切換組件

**ThemeSelector (完整選擇器)**：

```typescript
import { ThemeSelector } from '@/components/molecules';

export function SettingsPage() {
  return (
    <ThemeSelector
      // 完全自動,無需手動管理狀態
    />
  );
}
```

**ThemeToggleButton (快速切換)**：

```typescript
import { ThemeToggleButton } from '@/components/atoms';

export function AppBar() {
  return (
    <ThemeToggleButton
      // 在 Light/Dark 之間快速切換
    />
  );
}
```

**內部實作**：

```typescript
// ThemeSelector 內部
const handleThemeChange = (newTheme: 'light' | 'dark' | 'system') => {
  localStorage.setItem('theme', newTheme);
  window.dispatchEvent(new Event('theme-change'));
};
```

---

## 進階功能

### 跨頁面主題同步

**Storage Event**：

```typescript
// ThemeRegistry 中
window.addEventListener('storage', (e: StorageEvent) => {
  if (e.key === 'theme') {
    updateTheme();
  }
});
```

- 在 Tab A 切換主題 → Tab B 自動同步
- localStorage 變化 → 所有頁面即時更新

---

### 系統主題偵測

**matchMedia API**：

```typescript
const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');

mediaQuery.addEventListener('change', (e) => {
  const savedTheme = localStorage.getItem('theme');
  if (savedTheme === 'system') {
    const newMode = e.matches ? 'dark' : 'light';
    setThemeMode(newMode);
  }
});
```

- 用戶在系統設定中切換主題 → 自動更新
- 僅在 `theme === 'system'` 時觸發

---

### localStorage 持久化

**儲存格式**：

```typescript
localStorage.setItem('theme', 'light'); // 'light' | 'dark' | 'system'
```

**讀取優先級**：

1. localStorage 有值 → 使用該值
2. localStorage 無值 → 預設 'system'
3. 'system' → 根據 matchMedia 判斷

---

### SSR 考量

**問題**：伺服器端不知道用戶的主題偏好

**解決方案**：

1. **延遲客戶端渲染**：

```typescript
const [isClient, setIsClient] = useState(false);

useEffect(() => {
  setIsClient(true);
}, []);

if (!isClient) return null; // 或顯示 Loading
```

2. **預設主題**：

```typescript
const [themeMode, setThemeMode] = useState<'light' | 'dark'>('light');
```

- SSR 時使用 'light' 預設
- 客戶端 Hydration 後立即切換

3. **使用 CSS 變數避免 Hydration Mismatch**：

**問題場景**：登入頁面（AuthLayout）背景色使用 JavaScript 動態計算，導致 SSR 與客戶端不一致

**解決方案**：使用 CSS 自訂屬性配合 blocking script 的 `dark-mode` class

```typescript
// ❌ 問題寫法 - AuthLayout.tsx
const getBackgroundStyle = () => {
  const isDark = theme.palette.mode === 'dark';
  return isDark
    ? { background: 'linear-gradient(...)' } // SSR 無法取得正確值
    : { background: 'linear-gradient(...)' };
};

// ✅ 解決方案 - 改用 CSS 變數
const getBackgroundStyle = () => {
  return {
    background: 'var(--auth-gradient-bg)', // CSS 變數
  };
};
```

**在 globals.css 定義 CSS 變數**：

```css
/* 亮色模式 */
:root {
  --auth-gradient-bg: linear-gradient(135deg, #ff6f00 0%, #e65100 100%);
  --auth-solid-bg: #f5f5f5;
}

/* 暗色模式 - 由 blocking script 添加的 class */
html.dark-mode {
  --auth-gradient-bg: linear-gradient(135deg, #1a1a1a 0%, #0d0d0d 100%);
  --auth-solid-bg: #0d0d0d;
}
```

**優勢**：

- ✅ 無需等待 React hydration，blocking script 添加 `dark-mode` class 後立即生效
- ✅ 避免 hydration mismatch error
- ✅ 視覺上無閃爍
- ✅ 與 body 背景色處理方式一致

**適用場景**：

- 認證頁面（登入、註冊、忘記密碼）
- 不依賴 React 狀態的純視覺樣式
- 需要在 SSR 時立即顯示正確主題的元素

---

## 組件適配指南

### 按鈕組件

**✅ 推薦寫法**：

```typescript
<Button
  variant="contained"
  sx={{
    bgcolor: 'primary.main',
    color: 'primary.contrastText',
    '&:hover': {
      bgcolor: 'primary.dark',
    },
  }}
>
  按鈕
</Button>
```

**說明**：使用 MUI Theme 的語意色彩,自動適配 Light/Dark

---

### 表格組件

**✅ 推薦寫法**：

```typescript
const theme = useTheme();
const statusColors = getStatusColors(theme.palette.mode);

<Chip
  sx={{
    bgcolor: statusColors.ACTIVE.bg,
    borderColor: statusColors.ACTIVE.border,
    color: statusColors.ACTIVE.text,
  }}
/>
```

**說明**：使用主題感知工具函數,確保暗色模式對比度

---

### 表單組件

**✅ 推薦寫法**：

```typescript
<TextField
  sx={{
    '& .MuiOutlinedInput-root': {
      bgcolor: 'background.paper',
      '& fieldset': {
        borderColor: 'divider',
      },
      '&:hover fieldset': {
        borderColor: 'text.secondary',
      },
      '&.Mui-focused fieldset': {
        borderColor: 'primary.main',
      },
    },
  }}
/>
```

**說明**：所有顏色使用 Theme 的語意命名

---

## 最佳實踐

### DO - 應該這樣做

#### 1. 使用 Theme 的語意色彩

```typescript
✅ bgcolor: 'background.paper'
✅ color: 'text.primary'
✅ borderColor: 'divider'
```

#### 2. 使用主題感知工具函數

```typescript
✅ const statusColors = getStatusColors(theme.palette.mode);
✅ const actionColor = getActionColor('create', theme.palette.mode);
```

#### 3. 提供主題切換選項

```typescript
✅ <ThemeSelector />  // 完整選項
✅ <ThemeToggleButton />  // 快速切換
```

#### 4. 測試所有主題模式

```bash
✅ 測試 Light 模式
✅ 測試 Dark 模式
✅ 測試 System 模式 (切換系統主題)
✅ 測試跨頁面同步
```

---

### DON'T - 不要這樣做

#### 1. 不要使用硬編碼顏色

```typescript
❌ bgcolor: '#ffffff'
❌ color: '#000000'
❌ borderColor: '#ccc'
```

**問題**：暗色模式下對比度不足或不協調

#### 2. 不要在組件中管理主題狀態

```typescript
❌ const [theme, setTheme] = useState('light');
```

**問題**：應該由 ThemeRegistry 統一管理

#### 3. 不要忘記 SSR 檢查

```typescript
❌ localStorage.getItem('theme')  // SSR 會報錯
```

**正確**：

```typescript
✅ if (typeof window !== 'undefined') {
    localStorage.getItem('theme');
  }
```

#### 4. 不要使用純黑/純白

```typescript
❌ background.default: '#000000'  // 暗色模式
❌ text.primary: '#ffffff'        // 暗色模式
```

**正確**：

```typescript
✅ background.default: '#0D0D0D'
✅ text.primary: 'rgba(255, 255, 255, 0.92)'
```

---

## 故障排除

### 問題 1：主題切換後沒有反應

**症狀**：點擊主題切換按鈕,頁面沒有變化

**可能原因**：

1. 自訂事件未正確觸發
2. ThemeRegistry 未包裹在正確位置

**解決方案**：

```typescript
// 確認事件觸發
localStorage.setItem('theme', newTheme);
window.dispatchEvent(new Event('theme-change'));

// 確認 ThemeRegistry 位置
<ThemeRegistry>
  <YourApp />
</ThemeRegistry>
```

---

### 問題 2：頁面重新整理後主題恢復預設

**症狀**：切換主題後重新整理頁面,主題恢復 Light

**可能原因**：localStorage 未正確設定

**解決方案**：

```typescript
// 檢查 localStorage
console.log(localStorage.getItem('theme'));

// 確認儲存邏輯
if (typeof window !== 'undefined') {
  localStorage.setItem('theme', newTheme);
}
```

---

### 問題 3：SSR Hydration 錯誤

**症狀**：Console 出現 Hydration 警告

**可能原因**：伺服器端與客戶端渲染不一致

**解決方案**：

```typescript
// 使用 isClient 檢查
const [isClient, setIsClient] = useState(false);

useEffect(() => {
  setIsClient(true);
}, []);

// 延遲依賴主題的渲染
if (!isClient) {
  return <div>Loading...</div>;
}
```

---

### 問題 4：登出後登入頁面主題不一致

**症狀**：用戶在暗色主題下登出，登入頁面顯示亮色主題背景

**可能原因**：

1. AuthLayout 使用 `theme.palette.mode` 動態計算背景色
2. SSR 時無法讀取 localStorage，預設使用亮色主題
3. React hydration 前背景已渲染，產生視覺閃爍

**診斷步驟**：

```typescript
// 1. 檢查 localStorage
console.log(localStorage.getItem('theme')); // 應該是 'dark'

// 2. 檢查 HTML class
console.log(document.documentElement.classList.contains('dark-mode')); // 應該是 true

// 3. 檢查 body 背景色
console.log(window.getComputedStyle(document.body).backgroundColor);
// 應該是 'rgb(15, 20, 25)' (暗色)

// 4. 但截圖顯示亮色主題 → 說明有其他元素覆蓋了背景
```

**解決方案**：

將 AuthLayout 的背景色從 JavaScript 動態計算改為 **CSS 變數**：

```typescript
// apps/frontend/src/components/templates/AuthLayout/AuthLayout.tsx

// ❌ 修改前
const getBackgroundStyle = () => {
  const isDark = theme.palette.mode === 'dark';

  switch (background) {
    case 'gradient':
      return isDark
        ? { background: `linear-gradient(135deg, #1A1A1A 0%, #0D0D0D 100%)` }
        : {
            background: `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ...)`,
          };
    // ...
  }
};

// ✅ 修改後
const getBackgroundStyle = () => {
  switch (background) {
    case 'gradient':
      return {
        background: 'var(--auth-gradient-bg)',
      };
    case 'solid':
      return {
        backgroundColor: 'var(--auth-solid-bg)',
      };
    // ...
  }
};
```

**在 globals.css 中定義變數**：

```css
/* apps/frontend/src/app/globals.css */

/* CSS custom properties for AuthLayout backgrounds */
:root {
  /* Light mode: Orange gradient */
  --auth-gradient-bg: linear-gradient(135deg, #ff6f00 0%, #e65100 100%);
  --auth-solid-bg: #f5f5f5;
}

html.dark-mode {
  /* Dark mode: Dark blue-grey gradient */
  --auth-gradient-bg: linear-gradient(135deg, #1a1a1a 0%, #0d0d0d 100%);
  --auth-solid-bg: #0d0d0d;
}
```

**效果**：

- ✅ Blocking script 添加 `dark-mode` class 後，CSS 變數立即更新
- ✅ 無需等待 React hydration
- ✅ 視覺上無閃爍
- ✅ 登出後登入頁面正確顯示暗色主題

**相關文件**：

- `apps/frontend/src/components/templates/AuthLayout/AuthLayout.tsx`
- `apps/frontend/src/app/globals.css`
- `apps/frontend/src/app/layout.tsx` (blocking script)

---

### 問題 5：暗色模式對比度不足

**症狀**：暗色模式下文字難以閱讀

**可能原因**：使用了淺色模式的顏色值

**解決方案**：

```typescript
// 使用主題感知工具
const theme = useTheme();
const colors = getStatusColors(theme.palette.mode);

// 確認對比度
// 使用 WebAIM Contrast Checker
// https://webaim.org/resources/contrastchecker/
```

---

### 問題 6：MUI Chip Icon 在暗色模式下不可見

**症狀**：表格中的 Chip 組件（IP 位址、設備等）的 icon 在暗色模式下看不見

**影響組件**：

- `SessionTable` - IP 位址欄位（Language icon）
- `SessionTable` - 設備欄位（Computer/Phone/Tablet icons）
- `AuditLogTable` - IP 位址欄位（Language icon）

**可能原因**：

MUI Chip 的 icon 預設繼承當前文字顏色，但在暗色模式下，某些背景與 icon 顏色對比度不足。

**解決方案**：

為 Chip 的 icon 明確設定主題感知顏色：

```typescript
// ❌ 問題寫法 - Icon 顏色未指定
<Chip
  icon={<Language fontSize="small" />}
  label={row.ipAddress}
  size="small"
  variant="outlined"
  sx={{
    fontFamily: 'monospace',
    fontSize: '0.75rem',
    maxWidth: '100%',
  }}
/>

// ✅ 解決方案 - 添加主題感知 icon 顏色
<Chip
  icon={<Language fontSize="small" />}
  label={row.ipAddress}
  size="small"
  variant="outlined"
  sx={{
    fontFamily: 'monospace',
    fontSize: '0.75rem',
    maxWidth: '100%',
    '& .MuiChip-icon': {
      color:
        theme.palette.mode === 'dark'
          ? theme.palette.text.primary
          : theme.palette.text.secondary,
    },
  }}
/>
```

**設計原則**：

- **暗色模式**：使用 `text.primary`（接近白色）確保高對比度
- **亮色模式**：使用 `text.secondary`（中灰色）保持視覺層次
- **一致性**：所有 Chip icon 使用相同的顏色邏輯

**修復範圍**：

1. **SessionTable** (`apps/frontend/src/components/organisms/hq/SessionTable/SessionTable.tsx`)
   - 設備欄位（lines 369-391）
   - IP 位址欄位（lines 400-417）

2. **AuditLogTable** (`apps/frontend/src/components/organisms/hq/AuditLogTable/AuditLogTable.tsx`)
   - IP 位址欄位（lines 289-306）

**測試方法**：

```bash
# 1. 切換到暗色主題
# 2. 訪問審計日誌頁面 /hq/audit-logs
# 3. 訪問會話管理頁面 /hq/sessions
# 4. 檢查 IP 位址和設備欄位的 icon 是否清晰可見
```

---

## 參考資源

### 設計文檔

- [DESIGN_GUIDE.md](./DESIGN_GUIDE.md) - 完整的設計系統規範
- [COMPONENT_LIBRARY.md](./COMPONENT_LIBRARY.md) - 組件庫開發指南

### 技術文檔

- [Material-UI Theming](https://mui.com/material-ui/customization/theming/)
- [Emotion CSS-in-JS](https://emotion.sh/docs/introduction)
- [matchMedia API](https://developer.mozilla.org/en-US/docs/Web/API/Window/matchMedia)

---

## 總結

MEAD 專案的主題系統提供:

1. **完整的三模式支援** - Light/Dark/System
2. **無縫的跨頁面同步** - Storage Event + Custom Event
3. **系統主題自動跟隨** - matchMedia API
4. **SSR 友好設計** - 避免 Hydration 錯誤
5. **完整的設計 Tokens** - 淺色/暗色兩套配色
6. **主題感知工具** - 自動計算適配色彩
7. **無障礙設計** - WCAG AA 對比度標準

**開發建議**：

- ✅ 使用 Theme 的語意色彩
- ✅ 使用主題感知工具函數
- ✅ 測試所有主題模式
- ✅ 確保對比度符合標準
- ✅ 提供主題切換選項

**設計建議**：

- 參考 [DESIGN_GUIDE.md](./DESIGN_GUIDE.md) 的暗色模式規範
- 使用 Figma Variables 管理 Light/Dark 兩套配色
- 確保所有組件在兩種模式下都有良好的視覺效果
