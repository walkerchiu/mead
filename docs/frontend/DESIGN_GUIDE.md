# 組件設計指南

面向設計師的完整組件設計規範與協作指南

## 📋 目錄

- [組件設計指南](#組件設計指南)
  - [📋 目錄](#-目錄)
  - [📖 概述](#-概述)
  - [🎯 給設計師](#-給設計師)
    - [這份文件的用途](#這份文件的用途)
    - [你需要的工具](#你需要的工具)
  - [🏗️ 設計系統概覽](#️-設計系統概覽)
    - [Atomic Design 架構](#atomic-design-架構)
    - [為什麼這樣設計？](#為什麼這樣設計)
  - [🎨 設計 Token](#-設計-token)
    - [什麼是 Design Token？](#什麼是-design-token)
    - [色彩系統](#色彩系統)
      - [Primary（主色）](#primary主色)
      - [Secondary（次要色）](#secondary次要色)
      - [Semantic Colors（語意色）](#semantic-colors語意色)
      - [Neutral Colors（中性色）](#neutral-colors中性色)
    - [字體系統](#字體系統)
    - [間距系統](#間距系統)
    - [圓角系統](#圓角系統)
    - [陰影系統](#陰影系統)
  - [📐 組件規範](#-組件規範)
    - [🔹 Atoms（原子組件）](#-atoms原子組件)
      - [Button（按鈕）](#button按鈕)
      - [TextField（輸入框）](#textfield輸入框)
      - [CodeInput（驗證碼輸入）](#codeinput驗證碼輸入)
    - [🟢 Molecules（分子組件）](#-molecules分子組件)
      - [FormField（表單欄位）](#formfield表單欄位)
      - [PasswordField（密碼欄位）](#passwordfield密碼欄位)
      - [AlertMessage（提示訊息）](#alertmessage提示訊息)
      - [SelectField（下拉選單）](#selectfield下拉選單)
      - [DataTable（數據表格）](#datatable數據表格)
      - [DataList（數據列表）](#datalist數據列表)
    - [🟠 Organisms（有機體組件）](#-organisms有機體組件)
      - [LoginForm（登入表單）](#loginform登入表單)
      - [TwoFactorForm（2FA 表單）](#twofactorform2fa-表單)
    - [🔵 Templates（模板）](#-templates模板)
      - [AuthLayout（認證頁面佈局）](#authlayout認證頁面佈局)
  - [✅ 設計交付清單](#-設計交付清單)
    - [Figma 檔案結構](#figma-檔案結構)
      - [推薦的 Page 結構（含說明）](#推薦的-page-結構含說明)
      - [各 Page 的詳細說明](#各-page-的詳細說明)
      - [使用 Figma Variables（重要！）](#使用-figma-variables重要)
      - [建立 Components 的最佳實踐](#建立-components-的最佳實踐)
      - [圖層組織規範](#圖層組織規範)
      - [實用 Figma 插件](#實用-figma-插件)
      - [命名規範總結](#命名規範總結)
      - [交付檢查清單](#交付檢查清單)
  - [🤝 設計與開發協作](#-設計與開發協作)
    - [溝通檢查清單](#溝通檢查清單)
    - [常見問題](#常見問題)
  - [📚 相關文檔](#-相關文檔)

---

## 📖 概述

本指南專為設計師編寫，提供完整的組件設計規範、Design Token 定義和 Figma 最佳實踐。

---

## 🎯 給設計師

### 這份文件的用途

這份文件是 **Wind 專案的組件設計規範**，幫助你：

- ✅ 了解專案已有哪些組件
- ✅ 知道設計新組件時需要提供什麼
- ✅ 理解設計系統的架構（Atomic Design）
- ✅ 與開發團隊順暢協作

### 你需要的工具

- **Figma**（推薦）或 Sketch、Adobe XD
- Material Design 指南（參考）：https://m3.material.io/
- 與開發團隊的溝通管道

---

## 🏗️ 設計系統概覽

### Atomic Design 架構

我們使用 **Atomic Design** 將組件分為 5 個層級：

```text
🔹 Atoms（原子）
   最小單位，如按鈕、輸入框
   ↓ 組合

🟢 Molecules（分子）
   2-3 個原子的組合，如表單欄位（標籤+輸入框）
   ↓ 組合

🟠 Organisms（有機體）
   完整功能單元，如登入表單
   ↓ 組合

🔵 Templates（模板）
   頁面佈局結構
   ↓ 填充內容

📄 Pages（頁面）
   實際的頁面
```

### 為什麼這樣設計？

| 優勢         | 對設計師的意義     |
| ------------ | ------------------ |
| **可重用性** | 設計一次，到處使用 |
| **一致性**   | 自動保持設計統一   |
| **效率**     | 減少重複設計工作   |
| **可維護性** | 修改一處，全部更新 |

---

## 🎨 設計 Token

### 什麼是 Design Token？

Design Token 是設計系統的**基礎變數**，定義了顏色、字體、間距等。

> 💡 **給設計師的建議**：在 Figma 中使用 **Variables** 功能來管理這些 Token

### 色彩系統

#### Primary（主色）

```text
用途：主要按鈕、連結、強調元素
預設值：#1976d2（藍色）

變體：
├── Main: #1976d2
├── Light: #42a5f5
├── Dark: #1565c0
└── Contrast Text: #ffffff
```

#### Secondary（次要色）

```text
用途：次要操作、輔助元素
預設值：Material UI 預設

設計時考慮：
- 與主色搭配協調
- 對比度足夠
```

#### Semantic Colors（語意色）

```text
✅ Success（成功）：#4caf50（綠色）
   用途：成功訊息、完成狀態

❌ Error（錯誤）：#f44336（紅色）
   用途：錯誤訊息、驗證失敗

⚠️ Warning（警告）：#ff9800（橙色）
   用途：警告訊息

ℹ️ Info（資訊）：#2196f3（藍色）
   用途：提示訊息
```

#### Neutral Colors（中性色）

```text
Text Colors:
├── Primary: rgba(0, 0, 0, 0.87) - 主要文字
├── Secondary: rgba(0, 0, 0, 0.6) - 次要文字
└── Disabled: rgba(0, 0, 0, 0.38) - 禁用文字

Background Colors:
├── Default: #fafafa - 頁面背景
├── Paper: #ffffff - 卡片背景
└── Divider: rgba(0, 0, 0, 0.12) - 分隔線
```

### 字體系統

```text
字體家族：
├── 主要字體：Roboto, "Noto Sans TC", sans-serif
└── 等寬字體：'Roboto Mono', monospace（用於代碼）

字體大小（基準：16px = 1rem）：
├── h1: 96px / 6rem
├── h2: 60px / 3.75rem
├── h3: 48px / 3rem
├── h4: 34px / 2.125rem
├── h5: 24px / 1.5rem
├── h6: 20px / 1.25rem
├── subtitle1: 16px / 1rem
├── subtitle2: 14px / 0.875rem
├── body1: 16px / 1rem（主要內文）
├── body2: 14px / 0.875rem（次要內文）
├── button: 14px / 0.875rem（全大寫）
├── caption: 12px / 0.75rem
└── overline: 12px / 0.75rem（全大寫）

字重：
├── Light: 300
├── Regular: 400
├── Medium: 500
└── Bold: 700

行高：
├── Tight: 1.2（標題）
├── Normal: 1.5（內文）
└── Loose: 1.8（長文）
```

### 間距系統

**基於 8px 網格系統**

```text
間距比例：
├── 0: 0px
├── 1: 8px   (0.5rem)
├── 2: 16px  (1rem)   ← 最常用
├── 3: 24px  (1.5rem)
├── 4: 32px  (2rem)
├── 5: 40px  (2.5rem)
├── 6: 48px  (3rem)
└── ...以此類推

使用場景：
- 組件內邊距（Padding）
- 組件外邊距（Margin）
- 元素之間間距（Gap）
```

> 💡 **設計原則**：盡量使用 8 的倍數，保持視覺節奏一致

### 圓角系統

```text
Border Radius:
├── None: 0px        - 完全方形
├── Small: 4px       - 輕微圓角（按鈕、輸入框）
├── Medium: 8px      - 一般圓角（卡片）
├── Large: 16px      - 明顯圓角（Modal）
└── Full: 9999px     - 全圓（頭像、標籤）
```

### 陰影系統

```text
Elevation（高度）:
├── 0: 無陰影
├── 1: box-shadow: 0px 2px 1px -1px...   - 卡片
├── 2: box-shadow: 0px 3px 1px -2px...   - 懸浮按鈕
├── 3: box-shadow: 0px 3px 3px -2px...   - App Bar
├── 8: box-shadow: 0px 5px 5px -3px...   - Modal
└── 24: box-shadow: 0px 11px 15px -7px... - Drawer

使用建議：
- 層級越高，陰影越深
- 不要過度使用
```

---

## 📐 組件規範

### 🔹 Atoms（原子組件）

#### Button（按鈕）

**設計規範**：

```text
尺寸：
├── Small: 高度 30px, 內邊距 8px 16px
├── Medium: 高度 36px, 內邊距 12px 24px
└── Large: 高度 42px, 內邊距 16px 32px

變體：
├── Contained（填充）
│   ├── 背景色：主色/次要色/錯誤色
│   ├── 文字色：白色
│   └── 陰影：Elevation 2
│
├── Outlined（邊框）
│   ├── 背景色：透明
│   ├── 邊框：1px solid 主色
│   └── 文字色：主色
│
└── Text（文字）
    ├── 背景色：透明
    ├── 無邊框
    └── 文字色：主色

狀態：
├── Default（預設）
├── Hover（懸停）：增加 Elevation，背景色變深 8%
├── Active（點擊）：背景色變深 12%
├── Focus（聚焦）：外圍顯示 2px 聚焦框
├── Disabled（禁用）：透明度 38%，不可點擊
└── Loading（載入）：顯示 Spinner，禁用點擊

圖示支援：
├── startIcon（開始圖示）
│   ├── 位置：文字左側
│   ├── 間距：與文字間隔 8px
│   └── 大小：自動依據按鈕尺寸調整
│
├── endIcon（結束圖示）
│   ├── 位置：文字右側
│   ├── 間距：與文字間隔 8px
│   └── 大小：自動依據按鈕尺寸調整
│
└── iconOnly（純圖示按鈕）
    ├── 尺寸：
    │   ├── Small: 30x30px, padding 6px
    │   ├── Medium: 36x36px, padding 8px
    │   └── Large: 42x42px, padding 12px
    ├── 圖示居中
    └── Loading 狀態：圖示替換為 Spinner

圖示類型：
├── MUI Icons（Material Icons）
└── 自訂 Icon 組件（支援 Emoji）

Loading 狀態特性：
├── 自動計算 Spinner 大小
│   ├── Small: 14px
│   ├── Medium: 16px
│   └── Large: 18px
├── startIcon 按鈕：Spinner 替換 startIcon
├── iconOnly 按鈕：Spinner 替換圖示
└── 按鈕自動禁用
```

**設計檢查清單**：

- [ ] 提供 3 種尺寸的設計
- [ ] 提供 3 種變體的設計
- [ ] 提供所有 6 種狀態的視覺
- [ ] 提供圖示按鈕的設計（startIcon、endIcon、iconOnly）
- [ ] 提供 Loading 狀態下圖示的替換設計
- [ ] 標註所有間距、圓角、陰影
- [ ] 標註圖示與文字的間距
- [ ] 提供深色模式版本（如需要）

---

#### TextField（輸入框）

**設計規範**：

```text
結構：
├── Label（標籤）
│   ├── 字體：Body2 (14px)
│   ├── 顏色：Text Secondary
│   └── 必填標記：* (紅色)
│
├── Input Container（輸入容器）
│   ├── 高度：56px
│   ├── 內邊距：16px
│   ├── 邊框：1px solid rgba(0,0,0,0.23)
│   └── 圓角：4px
│
├── Helper Text（輔助文字）
│   ├── 字體：Caption (12px)
│   ├── 顏色：Text Secondary
│   └── 位置：輸入框下方 4px
│
└── Error Message（錯誤訊息）
    ├── 字體：Caption (12px)
    ├── 顏色：Error
    └── 圖示：⚠️（可選）

狀態：
├── Default：邊框 #ccc
├── Hover：邊框變深
├── Focus：邊框 2px，主色
├── Error：邊框紅色，顯示錯誤訊息
├── Disabled：背景色 #f5f5f5，禁用
└── Filled：標籤上移，縮小
```

**特殊類型**：

```text
Email：
- 前綴圖示：@ 或信封
- 自動驗證格式

Password：
- 後綴按鈕：眼睛圖示（顯示/隱藏）
- 遮罩字元：●

Number：
- 後綴按鈕：+ / - 按鈕（可選）
```

**設計檢查清單**：

- [ ] 提供所有狀態的設計
- [ ] 標註 Label、Input、Helper Text 的間距
- [ ] 提供圖示位置和尺寸
- [ ] 提供錯誤狀態的視覺
- [ ] 考慮長文字溢出處理

---

#### CodeInput（驗證碼輸入）

**設計規範**：

```text
結構：
- 6 個獨立輸入格
- 每格只能輸入 1 個數字

單格尺寸：
├── 寬度：48px
├── 高度：56px
├── 圓角：8px
└── 邊框：1px solid #ccc

格子間距：
├── 間距：8px（用 Gap）

狀態：
├── Empty（空）：邊框 #ccc
├── Focus（聚焦）：邊框主色，加粗 2px
├── Filled（已填）：背景色淺灰 #f5f5f5
└── Error（錯誤）：全部變紅色邊框

動畫：
- 自動跳轉到下一格（無需動畫）
- 錯誤時可加入輕微抖動
```

**設計檢查清單**：

- [ ] 單格尺寸和間距清晰標註
- [ ] 提供 4 種狀態的視覺
- [ ] 考慮無障礙（聚焦框清晰）

---

### 🟢 Molecules（分子組件）

#### FormField（表單欄位）

**設計規範**：

```text
組成：
├── Label（上方，8px 間距）
├── TextField
└── Error Message（下方，4px 間距）

整體高度：約 80-90px（含錯誤訊息）

必填標記：
- 位置：Label 右側
- 符號：*
- 顏色：Error 紅色
```

---

#### PasswordField（密碼欄位）

**設計規範**：

```text
特殊元素：
- 眼睛圖示按鈕（右側）
  ├── 尺寸：24x24px
  ├── 顏色：Text Secondary
  ├── Hover：變深
  └── 圖示：visibility / visibility_off

行為：
- 點擊切換顯示/隱藏
- 預設隱藏
```

---

#### AlertMessage（提示訊息）

**設計規範**：

```text
結構：
├── Icon（左側，24x24px）
├── Message（中間，填充）
└── Close Button（右側，可選）

尺寸：
├── 最小高度：48px
├── 內邊距：12px 16px
└── 圓角：4px

類型與顏色：
├── Success
│   ├── 背景：#e8f5e9（淺綠）
│   ├── 邊框：#4caf50（綠色，1px）
│   ├── 圖示：✓（綠色）
│   └── 文字：#1b5e20（深綠）
│
├── Error
│   ├── 背景：#ffebee（淺紅）
│   ├── 邊框：#f44336（紅色）
│   ├── 圖示：✕（紅色）
│   └── 文字：#b71c1c（深紅）
│
├── Warning
│   ├── 背景：#fff3e0（淺橙）
│   ├── 邊框：#ff9800（橙色）
│   ├── 圖示：⚠（橙色）
│   └── 文字：#e65100（深橙）
│
└── Info
    ├── 背景：#e3f2fd（淺藍）
    ├── 邊框：#2196f3（藍色）
    ├── 圖示：ℹ（藍色）
    └── 文字：#0d47a1（深藍）
```

**設計檢查清單**：

- [ ] 4 種類型的完整設計
- [ ] 圖示和顏色對應
- [ ] 關閉按鈕樣式（如需要）
- [ ] 考慮多行文字的處理

---

#### SelectField（下拉選單）

**設計規範**：

```text
基本結構：
├── Label（標籤，上方）
├── Select Container（選單容器）
│   ├── 高度：56px
│   ├── 內邊距：16px
│   ├── 邊框：1px solid rgba(0,0,0,0.23)
│   └── 圓角：4px
├── Helper Text（輔助文字，下方）
└── Error Message（錯誤訊息）

選項顯示：
├── 單選
│   └── 顯示選中項目的文字
│
└── 多選
    ├── renderChips=true：顯示為 Chips
    │   ├── Chip 高度：24px
    │   ├── Chip 間距：4px
    │   └── Chip 可刪除
    └── renderChips=false：顯示為文字列表

選項分組：
├── 分組標題
│   ├── 字重：Bold
│   ├── 不可選擇
│   └── 透明度：60%
│
└── 分組項目
    └── 左邊距：32px（縮排）

選項圖示：
├── 位置：選項文字左側
├── 尺寸：24x24px
├── 間距：與文字間隔 8-12px
└── 支援類型：
    ├── MUI Icons
    ├── Emoji（Icon 組件）
    └── 自訂 ReactNode

多選模式：
├── Checkbox（可選）
│   ├── 位置：選項最左側
│   ├── 尺寸：18x18px
│   └── showCheckbox 控制顯示
│
└── 選中狀態
    ├── 背景高亮
    └── Checkbox 勾選

搜尋模式（searchable=true）：
├── 切換為 Autocomplete 組件
├── 輸入框：可輸入篩選
├── noOptionsText：無結果提示
├── 支援所有功能：
│   ├── 分組
│   ├── 圖示
│   ├── 多選
│   └── Checkbox
└── 篩選行為：即時搜尋

下拉選單面板：
├── 最大高度：300px（可滾動）
├── 陰影：Elevation 8
├── 圓角：4px
└── 項目高度：48px

狀態：
├── Default：邊框 #ccc
├── Hover：邊框變深
├── Focus：邊框 2px，主色
├── Error：邊框紅色，顯示錯誤訊息
├── Disabled：背景色 #f5f5f5，禁用
└── Open：面板展開
```

**設計檢查清單**：

- [ ] 單選和多選的視覺設計
- [ ] 分組選項的層級表現
- [ ] 圖示與文字的對齊和間距
- [ ] Chip 顯示樣式（多選）
- [ ] Checkbox 樣式（多選）
- [ ] 搜尋模式的輸入框設計
- [ ] 下拉面板的樣式和陰影
- [ ] 空狀態提示（無選項）
- [ ] 所有互動狀態
- [ ] 長選項文字的處理（截斷、換行）

---

#### DataTable（數據表格）

**設計規範**：

```text
表格結構：
├── Table Container（容器）
│   ├── Paper 容器
│   ├── 陰影：Elevation 1
│   └── 圓角：4px
│
├── Table Header（表頭）
│   ├── Sticky Header：固定表頭（可選）
│   ├── 背景色：#fafafa
│   ├── 字重：Medium (500)
│   └── 高度：56px
│
├── Filter Row（篩選行，可選）
│   ├── 位置：表頭下方
│   ├── TextField 輸入框
│   └── 每列一個篩選框
│
├── Table Body（表身）
│   ├── 行高：52px
│   ├── 斑馬紋：可選
│   └── Hover 效果：背景色變淺
│
└── Pagination（分頁，可選）
    ├── 位置：表格底部
    ├── 對齊：右對齊
    └── 邊框：頂部分隔線

排序功能：
├── 排序圖示
│   ├── 位置：欄位標題右側
│   ├── 圖示：▲ ▼
│   └── 狀態：
│       ├── 未排序：灰色
│       ├── 升序：藍色 ▲
│       └── 降序：藍色 ▼
│
└── 可排序提示
    └── Hover 時顯示 Tooltip

篩選功能：
├── 篩選輸入框
│   ├── 尺寸：Small
│   ├── 佔位符：「篩選 [欄位名]」
│   └── 即時篩選
│
└── 篩選狀態
    └── 有值時：輸入框高亮

高亮行：
├── 條件高亮
│   ├── highlightRow 函數判斷
│   └── 自訂背景色（預設淺藍）
│
└── 高亮優先級
    └── 高於 Hover 和 Selected

展開/收合：
├── 展開圖示
│   ├── 位置：行首（可選列前）
│   ├── expandIconPosition='right'：
│   │   ├── 收合：▶（向右箭頭）
│   │   └── 展開：▼（向下箭頭）
│   └── expandIconPosition='down'（預設）：
│       ├── 收合：▼（向下箭頭）
│       └── 展開：▲（向上箭頭）
│
└── 展開內容
    ├── 位置：行下方
    ├── 全寬度跨欄
    ├── 背景色：#fafafa
    ├── 內邊距：16px
    └── 動畫：Collapse 展開/收合

多選功能：
├── 全選 Checkbox
│   ├── 位置：表頭第一欄
│   └── 狀態：
│       ├── 未選：空
│       ├── 全選：勾選
│       └── 部分選：減號
│
└── 行 Checkbox
    ├── 位置：每行第一欄
    └── 選中狀態：背景高亮

載入狀態：
├── 顯示：Circular Progress（居中）
└── 位置：表格中央

空狀態：
├── 顯示：「沒有數據」文字
├── 顏色：Text Secondary
└── 位置：居中顯示

固定表頭：
├── maxHeight 設定
└── 表頭 Sticky 定位

欄位樣式：
├── 對齊：left / center / right
├── 寬度：可自訂
└── 渲染：自訂 render 函數
```

**設計檢查清單**：

- [ ] 表頭和表身的樣式
- [ ] 排序圖示的三種狀態
- [ ] 篩選輸入框的樣式
- [ ] 高亮行的背景色
- [ ] 兩種展開圖示方向的設計
- [ ] 展開內容的樣式
- [ ] Checkbox 的樣式和對齊
- [ ] 載入和空狀態的設計
- [ ] Hover 和 Selected 狀態
- [ ] 分頁組件的樣式
- [ ] 固定表頭的視覺效果
- [ ] 響應式設計（手機版）

---

#### DataList（數據列表）

**設計規範**：

```text
列表結構：
├── Paper 容器
│   ├── 陰影：Elevation 1
│   └── 圓角：4px
│
├── Toolbar（工具列，可選）
│   ├── 位置：列表頂部
│   ├── 內邊距：16px
│   ├── 背景色：白色
│   ├── 邊框：底部分隔線
│   └── 包含：
│       ├── 全選 Checkbox（可選）
│       ├── 篩選輸入框（可選）
│       └── 排序下拉選單（可選）
│
├── List Items（列表項目）
│   ├── 項目高度：最小 64px
│   ├── 內邊距：16px
│   └── Hover 效果：背景色變淺
│
└── Pagination（分頁，可選）
    ├── 位置：列表底部
    ├── 對齊：右對齊
    └── 邊框：頂部分隔線

列表項目結構：
├── Checkbox（可選，左側）
│   ├── 尺寸：18x18px
│   └── 間距：margin-left 8px
│
├── Icon（可選，左側）
│   ├── 尺寸：24x24px
│   ├── 圓形容器：40x40px
│   └── 背景色：淺灰色
│
├── Content（內容區，填充）
│   ├── Primary Text（主標題）
│   │   ├── 字體：Body1 (16px)
│   │   └── 字重：Regular / 高亮時 SemiBold (600)
│   └── Secondary Text（副標題）
│       ├── 字體：Body2 (14px)
│       └── 顏色：Text Secondary
│
└── Actions（右側操作區）
    ├── Badge（徽章，可選）
    │   ├── 尺寸：Small
    │   ├── 圓角：12px
    │   └── 顏色：可自訂
    ├── 自訂操作按鈕
    └── 展開圖示（可選）

篩選和排序：
├── 篩選輸入框
│   ├── 位置：Toolbar
│   ├── 尺寸：Small
│   ├── 佔位符：可自訂
│   └── flexGrow: 1（填充寬度）
│
└── 排序選單
    ├── 位置：Toolbar 右側
    ├── FormControl + Select
    ├── 最小寬度：150px
    └── 選項：自訂排序選項

高亮項目：
├── 條件高亮
│   ├── highlightItem 函數判斷
│   └── 自訂背景色（預設淺藍）
│
└── 文字字重
    └── 高亮時：SemiBold (600)

展開/收合：
├── 展開圖示
│   ├── 位置：Actions 區域最右側
│   ├── expandIconPosition='right'：
│   │   ├── 收合：▶（向右箭頭）
│   │   └── 展開：▼（向下箭頭）
│   └── expandIconPosition='down'（預設）：
│       ├── 收合：▼（向下箭頭）
│       └── 展開：▲（向上箭頭）
│
└── 展開內容
    ├── 位置：項目下方
    ├── 背景色：#f5f5f5
    ├── 內邊距：16px 24px
    └── 動畫：Collapse 展開/收合

Badge（徽章）顯示：
├── 位置：Actions 區域
├── 樣式：MUI Badge 組件
├── 顏色選項：
│   ├── default（灰色）
│   ├── primary（主色）
│   ├── secondary（次要色）
│   ├── error（紅色）
│   ├── warning（橙色）
│   ├── info（藍色）
│   └── success（綠色）
└── 尺寸：Small

多選功能：
├── 全選 Checkbox
│   ├── 位置：Toolbar 最左側
│   └── 狀態：未選 / 全選 / 部分選
│
└── 項目 Checkbox
    ├── 位置：每項最左側
    └── 選中狀態：項目無特殊高亮

分隔線：
├── divider 控制顯示
├── 位置：項目之間
└── 最後一項無分隔線

載入狀態：
├── 顯示：Circular Progress（居中）
└── 位置：列表中央

空狀態：
├── 顯示：自訂文字
├── 顏色：Text Secondary
└── 位置：居中顯示
```

**設計檢查清單**：

- [ ] 列表項目的結構和間距
- [ ] Icon 和 Badge 的樣式
- [ ] 兩種展開圖示方向的設計
- [ ] 展開內容的樣式和背景色
- [ ] Toolbar 的佈局和功能
- [ ] 篩選和排序控制的樣式
- [ ] Checkbox 的樣式和位置
- [ ] 高亮項目的視覺效果
- [ ] Hover 和 Selected 狀態
- [ ] 分隔線的顯示
- [ ] 載入和空狀態的設計
- [ ] 分頁組件的樣式
- [ ] 響應式設計（手機版）

---

### 🟠 Organisms（有機體組件）

#### LoginForm（登入表單）

**設計規範**：

```text
結構：
├── 標題（h5, 24px）
├── Email Field（間距 24px）
├── Password Field（間距 16px）
├── Remember Me Checkbox（間距 16px）
├── Submit Button（間距 24px，全寬）
└── Forgot Password Link（間距 16px，置中）

整體寬度：
├── 最大寬度：400px
├── 內邊距：32px
└── 響應式：手機上 24px

卡片樣式：
├── 背景：白色
├── 圓角：12px
├── 陰影：Elevation 3
```

**設計檢查清單**：

- [ ] 所有元素間距清晰標註
- [ ] 提供成功/錯誤狀態
- [ ] 提供 Loading 狀態
- [ ] 響應式設計（手機/桌面）

---

#### TwoFactorForm（2FA 表單）

**設計規範**：

```text
結構：
├── 標題：「輸入驗證碼」
├── 說明文字：「請輸入發送到你 Email 的 6 位數驗證碼」
├── CodeInput（6 格）
├── 倒數計時：「59 秒後可重新發送」
├── Resend Button（文字按鈕）
└── Submit Button（全寬）

元素間距：
├── 標題到說明：12px
├── 說明到輸入：24px
├── 輸入到計時：16px
├── 計時到按鈕：24px
```

---

### 🔵 Templates（模板）

#### AuthLayout（認證頁面佈局）

**設計規範**：

```text
佈局：
├── 背景：漸層或純色
├── 卡片容器（居中）
│   ├── 最大寬度：450px
│   ├── 內邊距：40px
│   ├── 圓角：16px
│   ├── 陰影：Elevation 8
│   └── 響應式：手機上全寬，16px 外邊距
│
└── Logo（可選，頂部）

響應式斷點：
├── Desktop (>= 900px)：卡片居中，固定寬度
└── Mobile (< 900px)：卡片全寬，減少內邊距
```

---

## ✅ 設計交付清單

### Figma 檔案結構

#### 推薦的 Page 結構（含說明）

```text
📁 Wind Design System
│
├── 📄 🏠 Cover（封面頁）
│   說明：專案介紹、團隊成員、版本資訊、導航索引
│   內容：專案名稱、設計師名單、更新日期、快速連結
│
├── 📄 🎨 Design Tokens（設計基礎變數）
│   說明：定義所有基礎設計元素，是設計系統的根基
│   │
│   ├── 🎨 Colors（色彩系統）
│   │   說明：定義所有顏色，包含主色、輔助色、語意色
│   │   包含：Primary、Secondary、Success、Error、Warning、Info、Neutral
│   │
│   ├── 🔤 Typography（字體系統）
│   │   說明：定義字體家族、大小、粗細、行高等文字樣式
│   │   包含：Font Families、Sizes、Weights、Line Heights、實際應用範例
│   │
│   ├── 📏 Spacing（間距系統）
│   │   說明：8px 網格系統，定義所有內外邊距和間隙
│   │   包含：0-10+ 的間距比例、Padding/Margin/Gap 使用範例
│   │
│   ├── 🌓 Shadows（陰影系統）
│   │   說明：定義組件高度感（Elevation），用於表達層級
│   │   包含：0-24 級陰影、卡片/按鈕/Modal 應用範例
│   │
│   └── ⚪ Border Radius（圓角系統）
│       說明：定義組件的圓角大小，影響視覺柔和度
│       包含：None/Small/Medium/Large/Full、使用場景說明
│
├── 📄 🧩 Components（組件庫）
│   說明：所有可重用的 UI 組件，依 Atomic Design 分層
│   │
│   ├── ⚪ Atoms（原子組件）
│   │   說明：最小單位的基礎組件，不可再分割
│   │   │
│   │   ├── Button（按鈕）
│   │   │   說明：所有可點擊的按鈕，包含各種樣式、狀態和圖示支援
│   │   │   包含：
│   │   │   - 3 種變體 × 3 種尺寸 × 6 種狀態
│   │   │   - 圖示按鈕（startIcon、endIcon、iconOnly）
│   │   │   - Loading 狀態下的 Spinner 替換
│   │   │
│   │   ├── TextField（輸入框）
│   │   │   說明：基礎文字輸入組件，用於表單中收集使用者輸入
│   │   │   包含：不同類型（Text/Email/Password）、所有狀態、圖示變體
│   │   │
│   │   ├── CodeInput（驗證碼輸入）
│   │   │   說明：6 位數字驗證碼專用輸入，用於 2FA 驗證
│   │   │   包含：單格設計、間距定義、各種狀態
│   │   │
│   │   ├── Switch（開關）
│   │   │   說明：開關切換組件
│   │   │
│   │   ├── Slider（滑桿）
│   │   │   說明：數值範圍選擇滑桿
│   │   │
│   │   ├── Avatar（頭像）
│   │   │   說明：使用者頭像，支援圖片、文字、圖示
│   │   │
│   │   ├── Badge（徽章）
│   │   │   說明：狀態或數量徽章
│   │   │
│   │   ├── Icon（圖示）
│   │   │   說明：圖示組件，支援 MUI Icons 和 Emoji
│   │   │
│   │   ├── Progress（進度）
│   │   │   說明：載入進度指示器（圓形/線性）
│   │   │
│   │   ├── Divider（分隔線）
│   │   │   說明：視覺分隔元素
│   │   │
│   │   ├── Skeleton（骨架屏）
│   │   │   說明：載入佔位符（Form/Dashboard）
│   │   │
│   │   ├── LanguageSwitcher（語言切換器）
│   │   │   說明：多語系切換組件
│   │   │
│   │   ├── SettingsMenu（設定選單）
│   │   │   說明：使用者設定下拉選單
│   │   │
│   │   ├── SnackbarWithProgress（通知提示）
│   │   │   說明：帶進度條的通知提示
│   │   │
│   │   └── Drawer（抽屜）
│   │       說明：抽屜式側邊欄
│   │
│   ├── 🟢 Molecules（分子組件）
│   │   說明：由 2-3 個原子組合而成，具有簡單功能
│   │   │
│   │   ├── FormField（表單欄位）
│   │   │   說明：完整的表單輸入單元（Label + Input + Error）
│   │   │   包含：標籤、輸入框、錯誤訊息的組合
│   │   │
│   │   ├── PasswordField（密碼欄位）
│   │   │   說明：帶顯示/隱藏切換的密碼輸入欄位
│   │   │   包含：TextField + 眼睛圖示按鈕
│   │   │
│   │   ├── SelectField（下拉選單）
│   │   │   說明：功能完整的下拉選單組件
│   │   │   包含：
│   │   │   - 單選/多選模式
│   │   │   - 選項分組設計
│   │   │   - 選項圖示支援
│   │   │   - 搜尋模式（Autocomplete）
│   │   │   - Chip 顯示（多選）
│   │   │
│   │   ├── CheckboxGroup（複選框群組）
│   │   │   說明：複選框群組組件
│   │   │
│   │   ├── RadioGroup（單選按鈕群組）
│   │   │   說明：單選按鈕群組組件
│   │   │
│   │   ├── ErrorDisplay（錯誤展示）
│   │   │   說明：錯誤訊息展示組件
│   │   │
│   │   ├── AlertMessage（提示訊息）
│   │   │   說明：用於顯示成功、錯誤、警告等反饋訊息
│   │   │   包含：圖示 + 文字 + 關閉按鈕（可選）、4 種類型
│   │   │
│   │   ├── Tabs（頁籤）
│   │   │   說明：頁籤切換組件
│   │   │
│   │   ├── Stepper（步驟器）
│   │   │   說明：多步驟流程指示器
│   │   │
│   │   ├── Pagination（分頁）
│   │   │   說明：頁面導航分頁組件
│   │   │
│   │   ├── Card（卡片）
│   │   │   說明：內容卡片容器
│   │   │
│   │   ├── DataTable（數據表格）
│   │   │   說明：功能完整的數據表格
│   │   │   包含：
│   │   │   - 排序功能（可自訂排序函數）
│   │   │   - 篩選功能（可自訂篩選函數）
│   │   │   - 高亮行（條件高亮）
│   │   │   - 展開/收合（兩種圖示方向）
│   │   │   - 多選功能（Checkbox）
│   │   │   - 分頁支援
│   │   │   - 固定表頭
│   │   │
│   │   ├── DataList（數據列表）
│   │   │   說明：功能完整的數據列表
│   │   │   包含：
│   │   │   - 排序和篩選
│   │   │   - 高亮項目
│   │   │   - 展開/收合（兩種圖示方向）
│   │   │   - 多選功能
│   │   │   - Badge 顯示
│   │   │   - 自訂操作
│   │   │
│   │   ├── Accordion（手風琴）
│   │   │   說明：可折疊面板組件
│   │   │
│   │   ├── Sidebar（側邊欄）
│   │   │   說明：側邊欄導航組件
│   │   │
│   │   └── Modal（模態框）
│   │       說明：模態對話框組件
│   │
│   ├── 🟠 Organisms（有機體組件）
│   │   說明：完整功能單元，可獨立完成一個任務
│   │   │
│   │   ├── MainAppBar（主應用程式列）
│   │   │   說明：頂部導航列
│   │   │   包含：Logo、導航、使用者選單
│   │   │
│   │   ├── LoginForm（登入表單）
│   │   │   說明：完整的使用者登入功能區塊
│   │   │   包含：Email、Password、Remember Me、Submit、Forgot Link
│   │   │
│   │   ├── TwoFactorForm（雙因素驗證表單）
│   │   │   說明：2FA 驗證碼輸入和驗證功能
│   │   │   包含：CodeInput、倒數計時、重新發送、Submit
│   │   │
│   │   ├── ForgotPasswordForm（忘記密碼表單）
│   │   │   說明：請求密碼重設連結的表單
│   │   │   包含：Email 輸入、Submit、返回登入連結
│   │   │
│   │   └── ResetPasswordForm（重設密碼表單）
│   │       說明：設定新密碼的表單
│   │       包含：新密碼、確認密碼、密碼強度指示、Submit
│   │
│   └── 🔵 Templates（模板）
│       說明：頁面級別的佈局結構，定義內容擺放位置
│       │
│       └── AuthLayout（認證頁面佈局）
│           說明：所有認證相關頁面的統一外框
│           包含：背景、卡片容器、Logo 位置、響應式規則
│
├── 📄 📱 Responsive Examples（響應式範例）
│   說明：展示組件在不同螢幕尺寸下的呈現效果
│   │
│   ├── Desktop (1440px)
│   │   說明：桌面電腦的完整版面呈現
│   │
│   ├── Tablet (768px)
│   │   說明：平板裝置的中等版面呈現
│   │
│   └── Mobile (375px)
│       說明：手機裝置的精簡版面呈現
│
├── 📄 🎭 States & Interactions（狀態與互動）
│   說明：展示所有組件的互動狀態變化
│   內容：Default、Hover、Active、Focus、Disabled、Loading、Error
│
├── 📄 🎨 Color Accessibility（色彩無障礙）
│   說明：確保色彩符合 WCAG 無障礙標準
│   內容：對比度檢查、色盲模擬、WCAG 合規性測試
│
├── 📄 📖 Guidelines（使用指南）
│   說明：組件使用規則和最佳實踐說明
│   內容：何時使用哪個組件、間距規則、Do & Don't 範例
│
└── 📄 🚀 Handoff（交付給開發）
    說明：開發者需要的資源和說明集合
    內容：匯出的資源、開發者註解、實作狀態追蹤
```

---

#### 各 Page 的詳細說明

**🏠 Cover（封面頁）**

- **用途**：讓任何人打開檔案時能快速了解這是什麼專案
- **必須包含**：專案名稱、版本號、最後更新日期、設計團隊
- **可選包含**：快速導航連結、變更紀錄、專案目標說明

**🎨 Design Tokens（設計基礎變數）**

- **用途**：集中管理所有設計決策，確保一致性
- **為什麼重要**：修改一次，所有使用該 Token 的地方都會更新
- **開發對應**：這些 Token 會直接轉換為程式碼中的變數

**🧩 Components（組件庫）**

- **用途**：所有可重用的 UI 元件
- **組織原則**：從小到大（Atoms → Molecules → Organisms → Templates）
- **為什麼分層**：避免循環依賴，小組件可組合成大組件

**📱 Responsive Examples（響應式範例）**

- **用途**：展示同一個頁面在不同裝置上的呈現
- **為什麼需要**：提前發現在小螢幕上的問題
- **注意事項**：不只是縮小，而是調整佈局和優先級

**🎭 States & Interactions（狀態與互動）**

- **用途**：展示使用者操作時的視覺反饋
- **為什麼重要**：開發者需要知道每個狀態該長什麼樣
- **必須包含**：所有可互動組件的所有可能狀態

**🎨 Color Accessibility（色彩無障礙）**

- **用途**：確保色盲或視力障礙者也能正常使用
- **標準**：WCAG AA 要求對比度至少 4.5:1
- **工具推薦**：使用 Stark 插件檢查

**📖 Guidelines（使用指南）**

- **用途**：教導他人如何正確使用這些組件
- **內容建議**：何時用 Contained Button vs Outlined Button
- **Do & Don't**：用實際範例說明正確和錯誤用法

**🚀 Handoff（交付給開發）**

- **用途**：把設計轉交給開發團隊時需要的所有內容
- **包含內容**：匯出的圖示、Logo、開發註解、實作檢查表

#### 使用 Figma Variables（重要！）

**為什麼要用 Variables？**

- ✅ 集中管理 Design Tokens
- ✅ 一次修改，全部更新
- ✅ 與開發團隊的 Token 對應
- ✅ 支援模式切換（淺色/深色）

**建立 Variable Collections**：

```text
📦 Primitives（原始值）
├── color/primary/50   → #e3f2fd
├── color/primary/100  → #bbdefb
├── color/primary/500  → #2196f3 (Main)
├── color/primary/700  → #1976d2 (Dark)
└── ...

📦 Semantic（語意值）
├── color/button/primary/background   → {color.primary.500}
├── color/button/primary/hover        → {color.primary.700}
├── color/text/primary                → rgba(0,0,0,0.87)
└── ...

📦 Spacing（間距）
├── spacing/1  → 8px
├── spacing/2  → 16px
├── spacing/3  → 24px
└── ...

📦 Typography（字體）
├── font/size/sm   → 14px
├── font/size/base → 16px
├── font/size/lg   → 18px
└── ...
```

**在組件中使用**：

1. 選擇元素
2. 在右側面板選擇 Variable
3. 選對應的 Token（如 `color/button/primary/background`）

---

#### 建立 Components 的最佳實踐

**1. 命名規範**

```text
格式：Layer / Component / Variant

✅ 好的命名：
- Button / Contained / Primary / Default
- Button / Contained / Primary / Hover
- TextField / Default / Normal
- TextField / Error / With Helper

❌ 不好的命名：
- 按鈕1
- Button copy 2
- TextField final
- input_new
```

**2. 使用 Variants（變體）**

將不同狀態整理為一個 Component 的 Variants：

```text
Button Component Properties:
├── Type: Contained / Outlined / Text
├── Color: Primary / Secondary / Error
├── Size: Small / Medium / Large
└── State: Default / Hover / Active / Focus / Disabled / Loading

範例組合：
- Button / Contained / Primary / Medium / Hover
- Button / Outlined / Secondary / Small / Disabled
```

**在 Figma 中設定**：

1. 建立主組件（Main Component）
2. 右鍵 → Add Variants
3. 設定 Properties（Type, Color, Size, State）
4. 為每個組合設計樣式

**3. 使用 Auto Layout**

**為什麼要用 Auto Layout？**

- ✅ 自動調整大小
- ✅ 響應式設計
- ✅ 開發實作時更容易對應（Flexbox）

**Button 範例**：

```text
Auto Layout 設定：
├── Direction: Horizontal
├── Padding:
│   ├── Top/Bottom: 12px (Medium size)
│   └── Left/Right: 24px
├── Gap: 8px（如果有圖示）
├── Alignment: Center
└── Resizing: Hug contents
```

**Form 範例**：

```text
Auto Layout 設定：
├── Direction: Vertical
├── Gap: 24px（欄位之間）
├── Padding: 32px（容器內邊距）
└── Alignment: Stretch (填滿寬度)
```

**4. 標註規範**

在每個組件的 Specs Frame 中：

```text
標註內容：
✅ 尺寸（Width x Height）
✅ 內邊距（Padding）
✅ 外邊距（Margin）
✅ 圓角（Border Radius）
✅ 邊框（Border Width & Color）
✅ 陰影（Shadow）
✅ 字體大小和行高
✅ 顏色值（Hex/RGBA）

使用 Figma 插件：
- Redlines - 自動標註
- Measure - 測量工具
- Annotate - 加入註解
```

**5. 狀態展示**

為每個互動組件建立狀態展示：

```text
Button States Frame:
┌──────────────────────────────────────┐
│ Default  │ Hover  │ Active  │ Focus │
├──────────────────────────────────────┤
│ Disabled │ Loading│         │       │
└──────────────────────────────────────┘

每個狀態清楚標示：
- 視覺變化（顏色、陰影）
- 互動說明（點擊、滑鼠懸停）
- 動畫時長（如 300ms ease-in-out）
```

---

#### 圖層組織規範

**圖層命名**：

```text
✅ 好的命名：
- Button/Container
- Button/Icon/Left
- Button/Label
- TextField/Input
- TextField/Label
- TextField/Helper Text

❌ 不好的命名：
- Rectangle 123
- Group 45
- Frame 789
- Copy of Button
```

**圖層結構**：

```text
📁 LoginForm
├── 📁 Container
│   ├── 📁 Header
│   │   ├── 📝 Title
│   │   └── 📝 Subtitle
│   ├── 📁 Email Field
│   │   ├── 📝 Label
│   │   ├── 📁 Input
│   │   └── 📝 Error Message
│   ├── 📁 Password Field
│   │   └── (同上)
│   ├── 📁 Actions
│   │   ├── 🔲 Remember Me Checkbox
│   │   └── 🔘 Submit Button
│   └── 📁 Footer
│       └── 🔗 Forgot Password Link
```

---

#### 實用 Figma 插件

**Design System 管理**：

- **Tokens Studio** - Design Token 管理
- **Figma Tokens** - 同步 Token 到程式碼

**標註與交接**：

- **Redlines** - 自動標註尺寸
- **Measure** - 測量距離
- **Annotate** - 加入註解

**無障礙檢查**：

- **Stark** - 對比度檢查、色盲模擬
- **A11y - Color Contrast Checker** - WCAG 檢查

**匯出資源**：

- **Iconify** - 圖示庫
- **SVGO Compressor** - SVG 優化
- **Image Palette** - 色彩提取

**協作工具**：

- **Brandfetch** - Logo 和品牌資源
- **FigJam** - 腦力激盪
- **Comments** - Figma 內建註解功能

---

#### 命名規範總結

**檔案命名**：

```text
格式：[專案名稱] - [類型] - [版本]
範例：Wind - Design System - v1.0
```

**Page 命名**：

```text
格式：[Emoji] [名稱]
範例：
- 🏠 Cover
- 🎨 Design Tokens
- 🧩 Components
- 📱 Responsive
```

**Component 命名**：

```text
格式：[Layer] / [Component] / [Variant] / [State]
範例：
- Button / Contained / Primary / Hover
- TextField / Default / Error
```

**Frame 命名**：

```text
格式：[描述] - [尺寸]（如需要）
範例：
- LoginForm - Desktop (1440px)
- Button States Showcase
- Color Palette - Primary
```

---

#### 交付檢查清單

**設計完成時**，確保：

- [ ] 所有 Components 都使用 Variables
- [ ] 所有組件都有 Auto Layout
- [ ] 所有組件都有 Variants（變體）
- [ ] 所有組件都標註清楚
- [ ] 所有狀態都有設計
- [ ] 所有響應式斷點都有設計
- [ ] 命名規範一致
- [ ] 圖層結構清晰
- [ ] 顏色對比度符合 WCAG AA
- [ ] 提供 Developer Handoff 說明

**匯出資源**：

- [ ] SVG 圖示（24x24px，currentColor）
- [ ] Logo（多種尺寸）
- [ ] 背景圖片（優化後）
- [ ] Design Tokens JSON（使用 Tokens Studio）

**文檔**：

- [ ] 更新 Cover Page
- [ ] 加入使用說明
- [ ] 記錄設計決策
- [ ] 提供範例和反例

---

## 🤝 設計與開發協作

### 溝通檢查清單

**設計開始前**：

- [ ] 確認設計需求和目標
- [ ] 了解技術限制
- [ ] 對齊 Design Token

**設計進行中**：

- [ ] 定期同步設計進度
- [ ] 討論互動細節
- [ ] 確認動畫效果可行性

**設計交付時**：

- [ ] 提供完整的 Figma 檔案
- [ ] 標註所有尺寸和間距
- [ ] 匯出必要的資源檔案
- [ ] 提供設計說明文件

**開發實作中**：

- [ ] 回答開發團隊的疑問
- [ ] 檢查實作與設計的一致性
- [ ] 必要時調整設計

### 常見問題

**Q: 設計稿和實作有差異怎麼辦？**  
A: 與開發團隊討論，了解是技術限制還是理解偏差，共同找出最佳解決方案。

**Q: 需要設計深色模式嗎？**  
A: 目前專案尚未實作深色模式，但可以預先規劃 Token 以便未來擴展。

**Q: 動畫效果如何設計？**  
A: 使用 Figma 的 Prototype 功能展示動畫，或提供動畫說明（時長、緩動函數）。

**Q: 如何確保無障礙設計？**  
A:

- 對比度至少 4.5:1（WCAG AA）
- 按鈕最小點擊區域 44x44px
- 聚焦狀態清晰可見
- 不只依賴顏色傳達資訊

---

## 📚 相關文檔

- 💻 [COMPONENT_LIBRARY.md](./COMPONENT_LIBRARY.md) - 組件開發指南
- 🔧 [FRONTEND_INTEGRATION.md](./FRONTEND_INTEGRATION.md) - 前端整合文檔
