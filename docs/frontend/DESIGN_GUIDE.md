# 入口網設計指引

本文件描述教育部藝術與設計三大計畫入口網的視覺系統與元件使用原則。入口網是公開、免登入的內容型網站，設計重點是清楚呈現三大計畫資訊、維持中英雙語一致，並在桌機與手機上保有穩定的視覺節奏。

## 設計原則

- **計畫識別優先**：三大計畫的名稱、圖形標記、代表圖片與官方連結是主要辨識元素。
- **內容可讀性優先**：文字雲、輪播、卡片與敘事段落都以資訊可讀性為基準，動畫只服務導覽與節奏。
- **雙語一致**：中文與英文內容共用版面邏輯，按鈕、外部連結提示與無障礙文字皆由 i18n 控制。
- **政府網站可用性**：頁面包含 skip link、landmark、單一 h1、可鍵盤操作的輪播控制與 `prefers-reduced-motion` 降級。

## 視覺 Token

設計 token 集中於 `apps/frontend/src/components/public/tokens.ts`。

| Token 類型 | 用途                                           |
| ---------- | ---------------------------------------------- |
| 色彩       | 頁面背景、文字、卡片毛玻璃、品牌色與輔助色     |
| 斷點       | `<420px`、`420–834px`、`≥834px` 三段響應式行為 |
| 動畫       | hover、輪播切換、主標退場與 reduced-motion     |
| 版面       | 卡片寬度、區塊留白、頁尾欄距與輪播軌道         |

三計畫的形狀定義於 `apps/frontend/src/components/public/planShapes.ts`，供 hero 文字雲、輪播指示點與敘事段落共用。

## 圖像與資料

- 計畫資料：`apps/frontend/public/data/plans.json`
- 計畫素材：`apps/frontend/public/images/plans/{01_sposad,02_tisdc,03_idc}/`
- 教育部頁尾識別：`apps/frontend/public/images/moe-emblem.png`
- 裝飾星形預模糊圖：由 `apps/frontend/scripts/generate-plan-blur.mjs` 產生

計畫標記採「透明 PNG 標記圖 + 向量文字」組合，文字維持可讀與雙語一致，圖像則使用可直接展示的品牌素材。

## 頁面結構

| 路由                     | 頁面                | 說明                                                 |
| ------------------------ | ------------------- | ---------------------------------------------------- |
| `/[locale]`              | `PortalLandingPage` | 首頁：文字雲、主標、計畫輪播、敘事段落與頁尾         |
| `/[locale]/plans/[slug]` | `PlanDetailPage`    | 單一計畫詳細頁，`slug` 為 `sposad` / `idc` / `tisdc` |

`locale` 支援 `zh-TW` 與 `en`。

## 元件分層

| 層級      | 元件                     | 用途                    |
| --------- | ------------------------ | ----------------------- |
| atoms     | `AnimatedSlogan`         | 主標文字動畫            |
| atoms     | `CarouselDots`           | 三計畫輪播指示點        |
| atoms     | `LearnMoreButton`        | 外部官網連結按鈕        |
| atoms     | `SocialIconButton`       | 社群圖示按鈕            |
| molecules | `PlanLogo`               | 計畫標記與中英名稱      |
| molecules | `PlanStatsBar`           | 計畫成果數據            |
| molecules | `PlanTimeline`           | 年月時程軸              |
| molecules | `SocialLinkBar`          | 社群連結與了解更多      |
| molecules | `StatsMarquee`           | 成果數據跑馬燈          |
| organisms | `DecorativeTextCloud`    | 首屏文字雲與 hover 圖像 |
| organisms | `PlanCard`               | 計畫資訊卡片            |
| organisms | `PlanCarousel`           | 三計畫輪播與星形裝飾    |
| organisms | `PortalIntroSection`     | 主標區塊                |
| organisms | `PortalNarrativeSection` | 敘事段落                |
| organisms | `PortalFooter`           | 頁尾與計畫連結          |
| pages     | `PortalLandingPage`      | 首頁組裝                |
| pages     | `PlanDetailPage`         | 詳細頁組裝              |

## 響應式規則

- `<420px`：手機基準版型，統計列 2 欄，頁尾內容置中。
- `420–834px`：手機寬版與平板前段，統計列 3 欄。
- `≥834px`：桌機版型，文字雲橫向並排，輪播顯示主卡與兩側預覽，頁尾品牌與三欄連結並排。

手機版計畫卡以單欄呈現，時程與數據採橫向閱讀；桌機版計畫卡採左右資訊密度更高的組合。

## 動畫與互動

- 文字雲圖形可 hover 顯示計畫照片。
- 輪播可自動播放，hover 暫停。
- 指示點、兩側預覽卡片與敘事段落內計畫名可切換 active 計畫。
- 「了解更多」按鈕連向各計畫官方網站，並以新分頁開啟。
- 所有主要動畫尊重 `prefers-reduced-motion: reduce`。

## 無障礙

- `<html lang>` 依語系輸出 `zh-TW` 或 `en`。
- `<main id="main-content">` 搭配 skip link。
- 頁面維持單一 h1，區塊標題使用 h2。
- 裝飾 SVG、裝飾文字與星形照片以 `aria-hidden` 隱藏。
- 圖示按鈕與外部連結皆提供 i18n aria label。
- 輪播指示點使用 `aria-current` 表示目前位置。

## Storybook

Public Scope 元件位於 `apps/frontend/src/components/public/`，Storybook 以元件層級呈現主要狀態、語系與響應式檢查。

```bash
pnpm storybook
pnpm build-storybook
```
