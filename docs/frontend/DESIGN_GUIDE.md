# 組件設計指南

面向設計師的完整組件設計規範與協作指南。

---

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
      - [Accent（輔助強調）](#accent輔助強調)
      - [Semantic Colors（語意色）](#semantic-colors語意色)
      - [Neutral Colors（中性色）](#neutral-colors中性色)
      - [Light Theme Guidance](#light-theme-guidance)
      - [Icon / Surface / Text / Outline](#icon--surface--text--outline)
    - [暗色模式設計系統 (Dark Mode)](#暗色模式設計系統-dark-mode)
      - [暗色模式設計原則](#暗色模式設計原則)
      - [暗色模式中性色 (Grey Scale Dark)](#暗色模式中性色-grey-scale-dark)
      - [暗色模式主題色](#暗色模式主題色)
      - [暗色模式語意色 (Semantic Colors)](#暗色模式語意色-semantic-colors)
      - [暗色模式文字系統](#暗色模式文字系統)
      - [暗色模式互動狀態](#暗色模式互動狀態)
      - [暗色模式按鈕系統](#暗色模式按鈕系統)
      - [暗色模式表格與列表](#暗色模式表格與列表)
      - [暗色模式實作建議](#暗色模式實作建議)
    - [字體系統](#字體系統)
    - [響應式斷點](#響應式斷點)
    - [Guide（版型尺寸）](#guide版型尺寸)
    - [間距系統](#間距系統)
    - [圓角系統](#圓角系統)
    - [陰影系統](#陰影系統)
  - [📐 組件規範](#-組件規範)
    - [🔹 Atoms（原子組件）](#-atoms原子組件)
      - [Button（按鈕）](#button按鈕)
      - [CodeInput（驗證碼輸入）](#codeinput驗證碼輸入)
      - [Radio（單選）](#radio單選)
      - [Switch（開關）](#switch開關)
      - [TextField（輸入框）](#textfield輸入框)
    - [🟢 Molecules（分子組件）](#-molecules分子組件)
      - [AlertMessage（提示訊息）](#alertmessage提示訊息)
      - [DataList（數據列表）](#datalist數據列表)
      - [DataTable（數據表格）](#datatable數據表格)
      - [FormField（表單欄位）](#formfield表單欄位)
      - [PasswordField（密碼欄位）](#passwordfield密碼欄位)
      - [SelectField（下拉選單）](#selectfield下拉選單)
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

這份文件是 **NPT 專案的組件設計規範**，幫助你：

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
色階：
├── 0: #FFFFFF
├── 50: #F0F4F9
├── 100: #D9E2EF
├── 200: #B2C5DF
├── 300: #8CA8CF
├── 400: #658BBF
├── 500: #3E6FAF
├── 600: #0c3467
├── 700: #0a2a54
├── 800: #00194e
├── 900: #001239
└── 950: #000820
```

#### Secondary（次要色）

```text
用途：次要操作、輔助元素
色階：
├── 0: #FFFFFF
├── 50: #FCF6F0
├── 100: #F8EADC
├── 200: #F2D7C1
├── 300: #E6B28B
├── 400: #DB8A5C
├── 500: #D36D3C
├── 600: #C55731
├── 700: #A4432A
├── 800: #833729
├── 900: #6A3024
└── 950: #391711
```

#### Accent（輔助強調）

```text
用途：標記強調、輔助視覺焦點
色階：
├── 0: #FFFFFF
├── 50: #FCF5FE
├── 100: #F8EAFD
├── 200: #F1D3FB
├── 300: #E8B1F6
├── 400: #DB82F0
├── 500: #C547E1
├── 600: #AE32C7
├── 700: #9327A4
├── 800: #7A2286
├── 900: #66216E
└── 950: #420949
```

#### Semantic Colors（語意色）

**Error（錯誤）**

```text
├── 0: #FFFFFF
├── 50: #FFF1F2
├── 100: #FFE0E3
├── 200: #FFC7CC
├── 300: #FF9FA7
├── 400: #FF6874
├── 500: #FA3949
├── 600: #E61728
├── 700: #C31221
├── 800: #A1131F
├── 900: #86161F
└── 950: #49060C
```

**Warning（警告）**

```text
├── 0: #FFFFFF
├── 50: #FFF8ED
├── 100: #FFEFD4
├── 200: #FFDCA8
├── 300: #FFC270
├── 400: #FF9D37
├── 500: #FF7B07
├── 600: #F06406
├── 700: #C74A07
├── 800: #9E3A0E
├── 900: #7F330F
└── 950: #451705
```

**Info（資訊）**

```text
├── 0: #FFFFFF
├── 50: #ECFAFF
├── 100: #D4F2FF
├── 200: #B2E9FF
├── 300: #7DDEFF
├── 400: #40CBFF
├── 500: #14A8FF
├── 600: #0087FF
├── 700: #006FFF
├── 800: #005ED9
├── 900: #084DA0
└── 950: #0A2F61
```

**Success（成功）**

```text
├── 0: #FFFFFF
├── 50: #E9FFE5
├── 100: #CDFFC7
├── 200: #9FFF96
├── 300: #64FD59
├── 400: #33F328
├── 500: #10DA08
├── 600: #05AE02
├── 700: #078A07
├── 800: #0C680C
├── 900: #0F5812
└── 950: #023105
```

#### Neutral Colors（中性色）

```text
Grey Scale:
├── 0: #FFFFFF
├── 50: #F6F7F9
├── 100: #ECEFF2
├── 200: #D4DAE3
├── 300: #AFBACA
├── 400: #8396AD
├── 500: #637994
├── 600: #4F617A
├── 700: #414F63
├── 800: #384354
├── 900: #2A313C
└── 950: #212630

Text / Background 建議：
├── Text Primary: Grey 900
├── Text Secondary: Grey 600
├── Text Disabled: Grey 400
├── Background Default: Grey 50
├── Background Paper: Grey 0
└── Divider: Grey 200
```

#### Light Theme Guidance

```text
Primary: 0c3467
On Primary: FFFFFF
Primary Container: D9E2EF
On Primary Container: 0a2a54

Secondary: C55731
On Secondary: FFFFFF
Secondary Container: F8EADC
On Secondary Container: A4432A

Accent: AE32C7
On Accent: FFFFFF
Accent Container: F8EAFD
On Accent Container: 9327A4

Semantic
Error: E61728
On Error: E61728
Error Container: FFE0E3
On Error Container: C31221

Warning: F06406
On Warning: F06406
Warning Container: FFEFD4
On Warning Container: C74A07

Info: 0087FF
On Info: 0087FF
Info Container: D4F2FF
On Info Container: 006FFF

Success: 05AE02
On Success: 05AE02
Success Container: CDFFC7
On Success Container: 078A07
```

#### Icon / Surface / Text / Outline

```text
Icon
├── Default: N-950 (#212630)
├── Secondary: N-900 (#2A313C)
└── Invert: N-0 (#FFFFFF)

Surface
├── Default: P-50 (#F0F4F9)
├── Dark: N-100 (#ECEFF2)
└── White: N-0 (#FFFFFF)

Surface Container
├── P-50 (#F0F4F9)
├── N-100 (#ECEFF2)
└── N-0 (#FFFFFF)

Text
├── Primary: N-900 (#2A313C)
├── Secondary: N-800 (#384354)
└── Invert: N-0 (#FFFFFF)

Outline
├── Default: N-200 (#D4DAE3)
└── Variant: #ECECEC
```

---

### 暗色模式設計系統 (Dark Mode)

> 💡 **給設計師的提示**：暗色模式已完全實作,並支援 Light/Dark/System 三種模式自動切換。

#### 暗色模式設計原則

```text
設計理念：
✅ 保留品牌識別 - Primary 使用品牌深藍的提亮版本（非換色相）
✅ 降低對比度 - 減少長時間使用的眼睛疲勞
✅ 中性深灰背景 - 營造專業、沉穩的氛圍
✅ 統一的色彩系統 - 確保跨組件一致性

注意事項：
- 避免純黑 (#000000) 背景,使用純深灰黑 (#0D0D0D)
- 避免純白 (#ffffff) 文字,使用柔和白色 (rgba(255,255,255,0.92))
- 避免高對比度強烈色彩,使用降低飽和度的版本
- 確保對比度仍符合 WCAG AA 標準 (4.5:1)
```

#### 暗色模式中性色 (Grey Scale Dark)

```text
Grey Dark Scale:
├── 50: #0D0D0D   - 最深（主背景）
├── 100: #1A1A1A  - 非常深（卡片/Paper）
├── 200: #262626  - 深色（Hover 狀態）
├── 300: #2E2E2E  - 中深（邊框）
├── 400: #404040  - 中等（禁用元素）
├── 500: #595757  - 中淺（PANTONE Cool Gray 11C）
├── 600: #797878  - 淺色（Placeholder 文字）
├── 700: #999999  - 較淺（次要文字）
├── 800: #b5b5b6  - 很淺（PANTONE 429C）
├── 900: #dcdddd  - 接近白（PANTONE 428C，主要文字）
└── 950: #F5F5F5  - 幾乎白（強調文字）

用途對應：
├── Background Default: Grey Dark 50  (#0D0D0D)
├── Background Paper: Grey Dark 100   (#1A1A1A)
├── Border Default: Grey Dark 300     (#2E2E2E)
├── Border Hover: Grey Dark 500       (#595757)
├── Text Primary: rgba(255,255,255,0.92)
├── Text Secondary: rgba(255,255,255,0.65)
├── Text Disabled: rgba(255,255,255,0.38)
└── Divider: rgba(255,255,255,0.12)
```

#### 暗色模式主題色

**Primary（主色 - 品牌深藍提亮版）**

```text
用途：主要按鈕、連結、強調元素
色階：
├── Light: #8CA8CF   - 淺藍（Hover 文字）
├── Main: #658BBF    - 提亮深藍（主色）
├── Dark: #0c3467    - 品牌深藍（Pressed 狀態，PANTONE 294C）
└── Contrast Text: #FFFFFF

設計原則：
- 保留 Light mode 的品牌識別
- 提亮至 400 階，在深色背景下仍具可讀性
- 與深色背景形成舒適對比
```

**Secondary（次要色 - 品牌亮藍提亮版）**

```text
用途：次要操作、輔助元素
色階：
├── Light: #8EC7DE   - 淺亮藍
├── Main: #5FB0CF    - 提亮亮藍
├── Dark: #008ec3    - 品牌亮藍（PANTONE 2184C）
└── Contrast Text: #FFFFFF
```

**Accent（輔助強調 - 琥珀）**

```text
用途：標記強調、輔助視覺焦點
色階：
├── Light: #FDE68A   - 淺琥珀
├── Main: #FBBF24    - 琥珀
├── Dark: #D97706    - 深琥珀
└── Contrast Text: #FFFFFF
```

#### 暗色模式語意色 (Semantic Colors)

**Error（錯誤 - 柔和紅）**

```text
├── Light: #FCA5A5   - 淺紅
├── Main: #F87171    - 柔和紅
├── Dark: #DC2626    - 深紅
└── Contrast Text: #FFFFFF

使用場景：
- 錯誤訊息背景：rgba(220, 38, 38, 0.22)
- 錯誤訊息邊框：rgba(220, 38, 38, 0.5)
- 錯誤訊息文字：#FCA5A5
```

**Warning（警告 - 溫暖琥珀）**

```text
├── Light: #FCD34D   - 淺琥珀
├── Main: #FBBF24    - 溫暖琥珀
├── Dark: #D97706    - 深琥珀
└── Contrast Text: #FFFFFF

使用場景：
- 警告訊息背景：rgba(251, 191, 36, 0.22)
- 警告訊息邊框：rgba(251, 191, 36, 0.5)
- 警告訊息文字：#FCD34D
```

**Info（資訊 - 品牌亮藍提亮版）**

```text
├── Light: #8EC7DE   - 淺亮藍
├── Main: #5FB0CF    - 提亮亮藍
├── Dark: #008ec3    - 品牌亮藍
└── Contrast Text: #FFFFFF

使用場景：
- 資訊訊息背景：rgba(0, 142, 195, 0.22)
- 資訊訊息邊框：rgba(0, 142, 195, 0.5)
- 資訊訊息文字：#8EC7DE
```

**Success（成功 - 祖母綠）**

```text
├── Light: #6EE7B7   - 淺綠
├── Main: #34D399    - 提亮綠
├── Dark: #059669    - 祖母綠
└── Contrast Text: #FFFFFF

使用場景：
- 成功訊息背景：rgba(5, 150, 105, 0.22)
- 成功訊息邊框：rgba(5, 150, 105, 0.5)
- 成功訊息文字：#6EE7B7
```

#### 暗色模式文字系統

```text
Text Colors:
├── Primary: rgba(255, 255, 255, 0.92)   - 主要文字（高對比）
├── Secondary: rgba(255, 255, 255, 0.65) - 次要文字（中對比）
└── Disabled: rgba(255, 255, 255, 0.38)  - 禁用文字（低對比）

對應關係：
- 主標題、重要內容 → Text Primary
- 輔助說明、標籤 → Text Secondary
- 禁用狀態 → Text Disabled
```

#### 暗色模式互動狀態

```text
Action States:
├── Active: rgba(255, 255, 255, 0.92)    - 啟用狀態
├── Hover: rgba(255, 255, 255, 0.04)     - 懸停背景
├── Selected: rgba(255, 255, 255, 0.08)  - 選中背景
├── Focus: rgba(255, 255, 255, 0.12)     - 聚焦背景
├── Disabled: rgba(255, 255, 255, 0.26)  - 禁用前景
└── Disabled BG: rgba(255, 255, 255, 0.08) - 禁用背景

設計建議：
- Hover 效果要細微,避免過於明顯
- 聚焦狀態必須清晰可見（無障礙要求）
- 禁用狀態要明顯區分,但不刺眼
```

#### 暗色模式按鈕系統

**Contained Button（填充按鈕）**

```text
尺寸規格：
├── Small: paddingX 10px, paddingY 4px
├── Medium: paddingX 16px, paddingY 6px
└── Large: paddingX 22px, paddingY 8px

顏色系統：
├── Background: #658BBF (Primary Main，提亮深藍)
├── Hover BG: #0c3467 (Primary Dark，品牌深藍)
├── Pressed BG: #00194e (品牌深色)
├── Text: #FFFFFF
├── Disabled BG: #2E2E2E (Grey Dark 300)
└── Disabled Text: #797878 (Grey Dark 600)

圓角：20px
圖示間距：8px
```

**Outlined Button（邊框按鈕）**

```text
顏色系統：
├── Border: #595757 (Grey Dark 500)
├── Background: transparent
├── Hover BG: rgba(101, 139, 191, 0.08) (Primary with opacity)
├── Pressed BG: rgba(101, 139, 191, 0.16)
├── Text: rgba(255,255,255,0.92)
├── Disabled Border: #404040 (Grey Dark 400)
└── Disabled Text: #797878 (Grey Dark 600)

圓角：20px
邊框寬度：1px
```

**Text Button（文字按鈕）**

```text
顏色系統：
├── Text: #8CA8CF (Primary Light)
├── Hover BG: rgba(101, 139, 191, 0.08)
├── Pressed BG: rgba(101, 139, 191, 0.16)
└── Disabled Text: #797878 (Grey Dark 600)

無邊框、無背景（預設）
圓角：20px
```

#### 暗色模式表格與列表

**DataTable 暗色模式配色**

```text
表格結構：
├── Container BG: #1A1A1A (Grey Dark 100, Paper)
├── Header BG: #262626 (Grey Dark 200)
├── Header Text: rgba(255,255,255,0.92)
├── Row BG: transparent
├── Row Hover BG: rgba(255, 255, 255, 0.04)
├── Row Selected BG: rgba(101, 139, 191, 0.08)
└── Divider: rgba(255, 255, 255, 0.12)

狀態標籤配色（Chip）：
├── ACTIVE（啟用）
│   ├── Background: rgba(5, 150, 105, 0.25)
│   ├── Border: rgba(5, 150, 105, 0.5)
│   └── Text: #6EE7B7
│
├── REVOKED（撤銷）
│   ├── Background: rgba(220, 38, 38, 0.25)
│   ├── Border: rgba(220, 38, 38, 0.5)
│   └── Text: #FCA5A5
│
├── EXPIRED（過期）
│   ├── Background: rgba(251, 191, 36, 0.25)
│   ├── Border: rgba(251, 191, 36, 0.5)
│   └── Text: #FCD34D
│
└── 設計原則：
    - 使用半透明背景創造層次感
    - 邊框顏色比背景更飽和
    - 文字顏色比邊框更亮,確保可讀性
```

**Audit Log Action Colors（審計日誌動作顏色）**

```text
Create（創建）：
├── Background: rgba(5, 150, 105, 0.25)
├── Border: rgba(5, 150, 105, 0.5)
└── Text: #6EE7B7

Update/Modify（更新）：
├── Background: rgba(0, 142, 195, 0.25)
├── Border: rgba(0, 142, 195, 0.5)
└── Text: #8EC7DE

Delete/Remove（刪除）：
├── Background: rgba(220, 38, 38, 0.25)
├── Border: rgba(220, 38, 38, 0.5)
└── Text: #FCA5A5

Login/Auth（登入/認證）：
├── Background: rgba(101, 139, 191, 0.25)
├── Border: rgba(101, 139, 191, 0.5)
└── Text: #8CA8CF

Default（預設）：
├── Background: rgba(255, 255, 255, 0.08)
├── Border: rgba(255, 255, 255, 0.15)
└── Text: #b5b5b6
```

#### 暗色模式實作建議

**給設計師的檢查清單**：

- [ ] 確認所有背景使用 Grey Dark 50/100,避免純黑
- [ ] 確認所有文字使用 rgba(255,255,255,0.87/0.60),避免純白
- [ ] 確認語意色使用柔和版本 (降低飽和度)
- [ ] 確認對比度符合 WCAG AA 標準 (4.5:1)
- [ ] 測試長時間閱讀的舒適度
- [ ] 確認與淺色模式的視覺一致性
- [ ] 提供主題切換預覽（Figma Variants）

**Figma 設定建議**：

```text
使用 Variables 管理暗色模式：

創建 Mode:
├── Light Mode (預設)
└── Dark Mode

Variable Collections:
├── color/background/default
│   ├── Light: #F5F7FA
│   └── Dark: #0D0D0D
│
├── color/background/paper
│   ├── Light: #FFFFFF
│   └── Dark: #1A1A1A
│
├── color/text/primary
│   ├── Light: #001239
│   └── Dark: rgba(255,255,255,0.92)
│
└── color/primary/main
    ├── Light: #0c3467 (品牌深藍 PANTONE 294C)
    └── Dark: #658BBF (提亮深藍)

這樣可以一鍵切換模式查看效果！
```

**無障礙考量**：

```text
暗色模式特殊注意：
✅ 對比度檢查更重要 - 深色背景下對比度容易不足
✅ 聚焦狀態必須明顯 - 使用亮色邊框或背景高亮
✅ 避免純紅/純綠 - 對色盲用戶不友善,使用柔和版本
✅ 測試不同亮度環境 - 暗處和亮處觀看效果不同
✅ 提供切換選項 - 讓用戶自由選擇 Light/Dark/System
```

---

### 字體系統

字體家族：

- 主要字體：Roboto, "Noto Sans TC", sans-serif（中文 fallback）
- 等寬字體：`Roboto Mono`, monospace（用於代碼）

**Typography 規格（English）**

| Style     | 用途     | Font Family | Weight        | Size (px) | Line-height (px) | Letter-spacing |
| --------- | -------- | ----------- | ------------- | --------- | ---------------- | -------------- |
| H1        | 展示標題 | Roboto      | Medium (500)  | 40        | 48               | 2%             |
| H2        | 主標題   | Roboto      | Regular (400) | 34        | 40               | 1%             |
| H3        | 副標題   | Roboto      | Medium (500)  | 32        | 36               | 0%             |
| H4        | 副標題   | Roboto      | Medium (500)  | 24        | 32               | 0%             |
| H5        | 副標題   | Roboto      | Medium (500)  | 20        | 26               | 0%             |
| H6        | 副標題   | Roboto      | Medium (500)  | 18        | 26               | 0%             |
| subtitle1 | 內文     | Roboto      | Regular (400) | 16        | 24               | 0%             |
| subtitle2 | 內文粗體 | Roboto      | Medium (500)  | 16        | 24               | 0%             |
| body1     | 內文     | Roboto      | Regular (400) | 14        | 22               | 0%             |
| body2     | 內文粗體 | Roboto      | Medium (500)  | 14        | 22               | 0%             |
| caption   | 標籤     | Roboto      | Regular (400) | 12        | 22               | 0%             |
| button    | 按鈕     | Roboto      | Medium (500)  | 14        | 22               | 0%             |
| overline  | Overline | Roboto      | Regular (400) | 12        | 22               | 0%             |

> 備註：字距百分比可轉成 `em`（例如 2% → `0.02em`）。

### 響應式斷點

**裝置對應與區間**

```text
Large / TV：1920px+
XL / Desktop：1440px–1919px
L / Laptop：1024px–1439px
M / Tablet：768px–1023px
S / Mobile：360px–767px
```

**對應 MUI Breakpoints（min-width）**

```text
xs: 360
sm: 768
md: 1024
lg: 1440
xl: 1920
```

### Guide（版型尺寸）

**設計 Frame 區間**

```text
XL / Desktop: 1920–1440
L / Laptop: 1439–1024
M / Tablet: 1023–768
S / Mobile L: 767–480
XS / Mobile S: 479–360
```

**建議 Frame 寬度（Figma）**

```text
1440 / 1024 / 768 / 480 / 360
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
├── 7: 56px  (3.5rem)
└── 8: 64px  (4rem)

使用場景：
- 組件內邊距（Padding）
- 組件外邊距（Margin）
- 元素之間間距（Gap）
```

**Horizontal / Vertical**

```text
Spacing:1 = 8
Spacing:2 = 16
Spacing:3 = 24
Spacing:4 = 32
Spacing:5 = 40
Spacing:6 = 48
Spacing:7 = 56
Spacing:8 = 64
```

**元件間距範例**

```text
Dropdown / Input spacing:
 - 元件與元件之間：8px（Spacing:1）

Chart label:
 - 主/次標籤之間：8px（Spacing:1）
 - 群組標籤之間：24px（Spacing:3）
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

#### Radio（單選）

**Design Tokens**：

```text
Sizes
- Large: size 24, dot 14, border 1
- Medium: size 20, dot 12, border 1
- Small: size 16, dot 10, border 1

Colors (Unchecked)
- Border: #D4DAE3
- Background: #FFFFFF
- Hover Border: #AFBACA
- Hover Background: #F6F7F9
- Pressed Border: #8396AD
- Pressed Background: #ECEFF2
- Disabled Border: #ECEFF2
- Disabled Background: #FFFFFF

Colors (Checked)
- Border/Dot: #3E6FAF
- Background: #F0F4F9
- Hover Border/Dot: #0c3467
- Hover Background: #D9E2EF
- Pressed Border/Dot: #0a2a54
- Pressed Background: #B2C5DF
- Disabled Border: #dcdddd
- Disabled Background: #FFFFFF
- Disabled Dot: #AFBACA
```

**狀態**：

```text
- Default（未選）
- Checked（已選）
- Disabled（禁用）
```

---

#### Switch（開關）

**Design Tokens**：

```text
Sizes
- Medium: width 44, height 24, padding 2, thumb 20, track radius 12
- Small: width 36, height 20, padding 2, thumb 16, track radius 10

Colors
- Track Off: #D4DAE3
- Track On: #3E6FAF
- Track Disabled: #ECEFF2
- Thumb: #FFFFFF
- Thumb Disabled: #D4DAE3
```

**狀態**：

```text
- Default（未啟用）
- Checked（啟用）
- Disabled（禁用）
```

---

#### TextField（輸入框）

**Design Tokens**：

```text
Sizes
- Large: height 48, paddingX 16, radius 20, font 14, label 12
- Medium: height 40, paddingX 14, radius 20, font 14, label 12
- Small: height 32, paddingX 12, radius 16, font 13, label 12

Colors
- Border: #D4DAE3
- Hover Border: #4F617A
- Focus Border: #3E6FAF
- Disabled Border: #D4DAE3
- Background: #FFFFFF
- Disabled Background: #F6F7F9
- Text: #2A313C
- Placeholder: #AFBACA
- Label: #4F617A
- Focus Label: #3E6FAF
- Error Border: #FA3949
- Error Background: #FFF1F2
- Error Text/Label: #E61728
```

**狀態**：

```text
- Enable
- Hover
- Focus
- Disabled
- Error
```

**設計檢查清單**：

- [ ] 提供所有狀態的設計
- [ ] 標註 Label、Input、Helper Text 的間距
- [ ] 提供圖示位置和尺寸
- [ ] 提供錯誤狀態的視覺
- [ ] 考慮長文字溢出處理

---

### 🟢 Molecules（分子組件）

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
│   ├── 邊框：#ff9800（琥珀）
│   ├── 圖示：⚠（琥珀）
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
│   ├── warning（琥珀色）
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
├── Tablet and up (>= 768px)：卡片居中，固定寬度
└── Mobile (< 768px)：卡片全寬，減少內邊距
```

---

## ✅ 設計交付清單

### Figma 檔案結構

#### 推薦的 Page 結構（含說明）

```text
📁 NPT Design System
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
│   │   ├── IconButton（圖示按鈕）
│   │   │   說明：純圖示的可點擊按鈕
│   │   │
│   │   ├── Switch（開關）
│   │   │   說明：基本狀態切換元件，支援大小與狀態
│   │   │   包含：Small/Medium、Default/Checked/Disabled
│   │   │
│   │   ├── TextField（輸入框）
│   │   │   說明：基礎文字輸入組件，用於表單中收集用戶輸入
│   │   │   包含：不同類型（Text/Email/Password）、所有狀態、圖示變體
│   │   │
│   │   ├── TextArea（多行輸入框）
│   │   │   說明：多行文字輸入組件
│   │   │
│   │   ├── Radio（單選按鈕）
│   │   │   說明：基礎單選按鈕，支援各種尺寸與狀態
│   │   │
│   │   ├── DatePicker（日期選擇器）
│   │   │   說明：日期輸入與選擇組件
│   │   │
│   │   ├── TimePicker（時間選擇器）
│   │   │   說明：時間輸入與選擇組件
│   │   │
│   │   ├── Search（搜尋輸入框）
│   │   │   說明：帶搜尋圖示的輸入框
│   │   │
│   │   ├── CodeInput（驗證碼輸入）
│   │   │   說明：6 位數字驗證碼專用輸入，用於 2FA 驗證
│   │   │   包含：單格設計、間距定義、各種狀態
│   │   │
│   │   ├── Slider（滑桿）
│   │   │   說明：數值範圍選擇滑桿
│   │   │
│   │   ├── Avatar（頭像）
│   │   │   說明：用戶頭像，支援圖片、文字、圖示
│   │   │
│   │   ├── Badge（徽章）
│   │   │   說明：狀態或數量徽章
│   │   │
│   │   ├── Chip（標籤片）
│   │   │   說明：可選取或可刪除的標籤元件
│   │   │
│   │   ├── Icon（圖示）
│   │   │   說明：圖示組件，支援 MUI Icons 和 Emoji
│   │   │
│   │   ├── Link（連結）
│   │   │   說明：文字連結組件
│   │   │
│   │   ├── Progress（進度）
│   │   │   說明：載入進度指示器（圓形/線性）
│   │   │
│   │   ├── Divider（分隔線）
│   │   │   說明：視覺分隔元素
│   │   │
│   │   ├── Skeleton（骨架屏）
│   │   │   說明：載入佔位符（Form/Dashboard/NotificationList/Filters）
│   │   │
│   │   ├── NotificationBadge（通知徽章）
│   │   │   說明：帶數字的通知圖示徽章
│   │   │
│   │   ├── NotificationItem（通知項目）
│   │   │   說明：單一通知列表項目
│   │   │
│   │   ├── PasswordStrengthIndicator（密碼強度指示）
│   │   │   說明：顯示密碼強度的視覺指示器
│   │   │
│   │   ├── ScrollButton（捲動按鈕）
│   │   │   說明：觸發頁面捲動的按鈕
│   │   │
│   │   ├── SettingsButton（設定按鈕）
│   │   │   說明：開啟設定選單的觸發按鈕
│   │   │
│   │   ├── SettingsMenuItem（設定選單項目）
│   │   │   說明：設定選單的單一選項行
│   │   │
│   │   ├── ThemeToggleButton（主題切換按鈕）
│   │   │   說明：深色/淺色模式切換按鈕
│   │   │
│   │   ├── Typography（文字排版）
│   │   │   說明：統一的文字樣式組件
│   │   │
│   │   ├── UserButton（用戶按鈕）
│   │   │   說明：顯示用戶頭像與名稱的觸發按鈕
│   │   │
│   │   └── UserMenuItem（用戶選單項目）
│   │       說明：用戶選單的單一選項行
│   │
│   ├── 🟢 Molecules（分子組件）
│   │   說明：由 2-3 個原子組合而成，具有簡單功能
│   │   │
│   │   ├── FormField（表單欄位）
│   │   │   說明：完整的表單輸入單元（Label + Input + Error）
│   │   │   包含：標籤、輸入框、錯誤訊息的組合
│   │   │
│   │   ├── EmailField（Email 欄位）
│   │   │   說明：帶格式驗證的 Email 輸入欄位
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
│   │   ├── FileUploader（檔案上傳）
│   │   │   說明：拖放或點擊上傳檔案的組件
│   │   │
│   │   ├── ErrorDisplay（錯誤展示）
│   │   │   說明：錯誤訊息展示組件
│   │   │
│   │   ├── AlertMessage（提示訊息）
│   │   │   說明：用於顯示成功、錯誤、警告等反饋訊息
│   │   │   包含：圖示 + 文字 + 關閉按鈕（可選）、4 種類型
│   │   │
│   │   ├── Toast（快閃通知）
│   │   │   說明：短暫顯示的操作反饋通知
│   │   │
│   │   ├── SnackbarWithProgress（帶進度條的通知）
│   │   │   說明：帶倒數進度條的通知提示
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
│   │   ├── DetailRow（詳情列）
│   │   │   說明：標籤與內容並排的詳情展示行
│   │   │
│   │   ├── Accordion（手風琴）
│   │   │   說明：可折疊面板組件
│   │   │
│   │   ├── PageHeader（頁面標題）
│   │   │   說明：頁面頂部的標題與副標題區塊
│   │   │
│   │   ├── LanguageSwitcher（語言切換器）
│   │   │   說明：多語系切換組件
│   │   │
│   │   ├── ThemeSelector（主題選擇器）
│   │   │   說明：提供主題樣式選項的選單組件
│   │   │
│   │   ├── ScrollControl（捲動控制器）
│   │   │   說明：控制列表捲動位置的操作組件
│   │   │
│   │   ├── NotificationFilters（通知篩選器）
│   │   │   說明：通知列表的篩選條件組件
│   │   │
│   │   ├── NotificationList（通知列表）
│   │   │   說明：通知項目的靜態列表
│   │   │
│   │   ├── NotificationMenuList（通知選單列表）
│   │   │   說明：下拉選單中的通知列表
│   │   │
│   │   ├── InfiniteNotificationList（無限捲動通知列表）
│   │   │   說明：支援無限捲動載入的通知列表
│   │   │
│   │   ├── SettingsMenuList（設定選單列表）
│   │   │   說明：設定選單的選項列表
│   │   │
│   │   ├── UserMenuHeader（用戶選單標頭）
│   │   │   說明：用戶下拉選單頂部的用戶資訊區塊
│   │   │
│   │   ├── UserMenuList（用戶選單列表）
│   │   │   說明：用戶下拉選單的操作選項列表
│   │   │
│   │   ├── AboutContent（關於頁內容）
│   │   │   說明：關於頁面的靜態說明內容
│   │   │
│   │   └── HelpContent（說明頁內容）
│   │       說明：說明頁面的靜態說明內容
│   │
│   ├── 🟠 Organisms（有機體組件）
│   │   說明：完整功能單元，可獨立完成一個任務
│   │   │
│   │   ├── 🔐 認證相關
│   │   │   ├── LoginForm（登入表單）
│   │   │   │   說明：完整的用戶登入功能區塊
│   │   │   │   包含：Email、Password、Remember Me、Submit、Forgot Link
│   │   │   │
│   │   │   ├── TwoFactorForm（雙因素驗證表單）
│   │   │   │   說明：2FA 驗證碼輸入和驗證功能
│   │   │   │   包含：CodeInput、倒數計時、重新發送、Submit
│   │   │   │
│   │   │   ├── TwoFactorSettings（雙因素驗證設定）
│   │   │   │   說明：啟用/停用 2FA 的設定區塊
│   │   │   │
│   │   │   ├── ForgotPasswordForm（忘記密碼表單）
│   │   │   │   說明：請求密碼重設連結的表單
│   │   │   │   包含：Email 輸入、Submit、返回登入連結
│   │   │   │
│   │   │   ├── ResetPasswordForm（重設密碼表單）
│   │   │   │   說明：設定新密碼的表單
│   │   │   │   包含：新密碼、確認密碼、密碼強度指示、Submit
│   │   │   │
│   │   │   └── ChangePasswordForm（修改密碼表單）
│   │   │       說明：已登入用戶修改密碼的表單
│   │   │       包含：舊密碼、新密碼、確認密碼、Submit
│   │   │
│   │   ├── 🧭 導航相關
│   │   │   ├── Sidebar（側邊欄）
│   │   │   │   說明：主要導航側邊欄，包含選單項目與折疊功能
│   │   │   │
│   │   │   ├── Drawer（抽屜面板）
│   │   │   │   說明：從側邊滑入的抽屜式面板
│   │   │   │
│   │   │   ├── NotificationCenter（通知中心）
│   │   │   │   說明：完整的通知管理介面（含篩選、無限捲動）
│   │   │   │
│   │   │   ├── NotificationMenu（通知選單）
│   │   │   │   說明：頂部導航列的通知下拉選單
│   │   │   │
│   │   │   ├── UserMenu（用戶選單）
│   │   │   │   說明：頂部導航列的用戶帳號下拉選單
│   │   │   │
│   │   │   └── SettingsMenu（設定選單）
│   │   │       說明：用戶設定下拉選單（主題/語言等）
│   │   │
│   │   ├── 💬 對話框 / Modal
│   │   │   └── Modal（通用 Modal）
│   │   │       說明：通用的模態對話框基礎組件
│   │   │
│   │   └── 🛡️ HQ 後台管理
│   │       ├── AuditLogFilters（稽核日誌篩選器）
│   │       ├── AuditLogTable（稽核日誌表格）
│   │       ├── AuditLogStats（稽核日誌統計）
│   │       ├── AuditLogDetailsModal（稽核日誌詳情 Modal）
│   │       ├── SessionFilters（Session 篩選器）
│   │       ├── SessionTable（Session 表格）
│   │       ├── SessionStats（Session 統計）
│   │       ├── SessionDetailsModal（Session 詳情 Modal）
│   │       ├── BatchRevokeModal（批次撤銷 Modal）
│   │       ├── RevokeSessionModal（撤銷 Session Modal）
│   │       ├── RevokeOtherDevicesModal（撤銷其他裝置 Modal）
│   │       ├── UserFilters（用戶篩選器）
│   │       ├── UserTable（用戶表格）
│   │       ├── CreateUserDialog（新增用戶對話框）
│   │       ├── EditUserDialog（編輯用戶對話框）
│   │       ├── DeleteUserModal（刪除用戶 Modal）
│   │       ├── ResetPasswordDialog（重設密碼對話框）
│   │       ├── CronJobFilters（排程任務篩選器）
│   │       ├── CronJobListFilters（排程任務列表篩選器）
│   │       ├── CronJobTable（排程任務表格）
│   │       ├── CronJobStats（排程任務統計）
│   │       ├── CronJobExecutionHistory（排程任務執行歷史）
│   │       ├── CronJobConfigDetailsModal（排程設定詳情 Modal）
│   │       ├── CronJobExecutionDetailsModal（排程執行詳情 Modal）
│   │       └── CronJobTriggerDialog（觸發排程任務對話框）
│   │
│   └── 🔵 Templates（模板）
│       說明：頁面級別的佈局結構，定義內容擺放位置
│       │
│       ├── AuthLayout（認證頁面佈局）
│       │   說明：所有認證相關頁面的統一外框
│       │   包含：背景、卡片容器、Logo 位置、響應式規則
│       │
│       └── DashboardLayout（儀表板佈局）
│           說明：主應用程式頁面的佈局框架
│           包含：頂部導航列、側邊欄、主內容區域、響應式規則
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

- **用途**：展示用戶操作時的視覺反饋
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
範例：NPT - Design System - v1.0
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
- [ ] Storybook 有對應展示（字體/Token/斷點一致）

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
