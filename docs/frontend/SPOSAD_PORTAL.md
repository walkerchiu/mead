# 教育部藝術設計三大計畫入口網（SPOSAD Portal）

入口網是 `mead` 前端「Public Scope」下的內容型網站，依 Figma 設計稿實作，
單純展示三大計畫資訊，不需後台與登入。

- **Figma 檔案 key**：`fkSTF2tGVXOnPdGjdHqgkq`
- **三大計畫**：
  - `sposad` — 教育部 藝術與設計菁英海外培訓計畫（菁培計畫）
  - `idc` — 教育部鼓勵學生參加藝術與設計類國際競賽計畫（設計戰國策）
  - `tisdc` — 臺灣國際學生創意設計大賽

## 路由

| 路由                     | 頁面元件            | 說明                                                               |
| ------------------------ | ------------------- | ------------------------------------------------------------------ |
| `/[locale]`              | `PortalLandingPage` | 首頁：hero 文字雲 → 主標 → 計畫輪播 → 敘事段落 → 輪播指示點 → 頁尾 |
| `/[locale]/plans/[slug]` | `PlanDetailPage`    | 單一計畫詳細頁；`slug` 為 `sposad` / `idc` / `tisdc`               |

`locale` 為 `en` / `zh-TW`（next-intl）。

## 資料來源

- **`public/data/plans.json`** — 三大計畫資料（由 `教育部藝術設計三大計劃/SPOSAD設計入口網建置資料`
  正規化而來，鍵名改為英文）。目前版本 `2026-05-15`。含 `officialUrl` 欄位
  （計畫官網，供「了解更多」按鈕連結）。
- **型別**：`src/types/plan.ts`（`Plan`、`PlansData` 等）。
- **存取**：`src/lib/portal/plans.ts`（讀取 plans.json、取本機照片等）。
- **素材**：`public/images/plans/{01_sposad,02_tisdc,03_idc}/`（banner、photos）、
  `public/images/moe-emblem.png`（頁尾教育部識別）。
- **i18n**：`messages/{en,zh-TW}.json` 的 `portal` 命名空間
  （eyebrow / heading / narrative._ / footer._ / detail.\* 等）。

## 元件結構（Atomic Design）

位於 `src/components/public/`，Storybook 歸於「Public Scope」。

| 層級      | 元件                     | 用途                                                       |
| --------- | ------------------------ | ---------------------------------------------------------- |
| atoms     | `AnimatedSlogan`         | 逐字浮現的標語動畫                                         |
| atoms     | `CarouselDots`           | 輪播指示點（三種計畫形狀，與 hero／敘事共用 `planShapes`） |
| atoms     | `LearnMoreButton`        | 「了解更多 ↗」白色圓角按鈕，可帶傾斜角                     |
| atoms     | `SocialIconButton`       | 社群圖示按鈕                                               |
| molecules | `PlanLogo`               | 計畫識別（圖標 + 中英名稱）                                |
| molecules | `PlanStatsBar`           | 數據成果格線（響應式欄數、末項橫跨整列）                   |
| molecules | `PlanTimeline`           | 計畫時程軸（年份 / 月份 / 軌道 / 說明氣泡）                |
| molecules | `SocialLinkBar`          | 社群圖示半透明膠囊 + 了解更多按鈕                          |
| molecules | `StatsMarquee`           | 數據成果跑馬燈（內容多於可視範圍時無縫循環滾動）           |
| organisms | `DecorativeTextCloud`    | hero 文字雲（三圖形 metaball、hover 照片、橫向／直向佈局） |
| organisms | `PlanCard`               | 計畫卡片（兩張毛玻璃卡片：識別/時程 + 數據/banner/社群）   |
| organisms | `PlanCarousel`           | 三計畫輪播（中央卡片 + 兩側相鄰卡片預覽 + 裝飾星形照片）   |
| organisms | `PortalIntroSection`     | 第二屏小標 + 主標                                          |
| organisms | `PortalNarrativeSection` | 敘事段落（錯落排版；計畫名可點擊切換輪播、附下一計畫標記） |
| organisms | `PortalFooter`           | 頁尾（品牌識別 + 三欄連結 + 版權）                         |
| pages     | `PortalLandingPage`      | 首頁組裝                                                   |
| pages     | `PlanDetailPage`         | 詳細頁組裝                                                 |

設計 token 集中於 `src/components/public/tokens.ts`（`portalTokens`）；三計畫的標記形狀集中於 `src/components/public/planShapes.ts`，供 hero 文字雲、`CarouselDots`、敘事段落圓點共用，維持全站視覺一致。

## 響應式斷點

依設計稿三斷點，媒體查詢取自 `portalTokens.mq`：

| 斷點        | 查詢          | 重點差異                                                       |
| ----------- | ------------- | -------------------------------------------------------------- |
| `<420px`    | 基準          | 統計列 2 欄；頁尾內容約 306px 置中                             |
| `420–834px` | `mq.mobileUp` | 統計列 3 欄                                                    |
| `≥834px`    | `mq.tabletUp` | 桌機版：文字雲橫向、卡片兩欄、輪播兩側預覽、頁尾品牌與三欄並排 |

- 文字雲：`<834px` 三圖形直向堆疊、`≥834px` 橫向並排。
- 統計列：末項自動橫跨該列剩餘欄數。
- 頁尾：`<834px` 連結欄在品牌之上、版權併入品牌區塊；`≥834px` 並排。
- 數據成果（`StatsMarquee`）：桌機卡片窄欄內垂直上滾、手機卡片寬橫條內水平左滾（兩端淡出遮罩）。
- 計畫時程軸（`PlanTimeline`）：寬版用 `fit` 版型；手機卡片內用 `scroll` 版型，月份列橫向滑動閱讀。

## 互動與動畫

- **hero 文字雲**：三圖形 goo metaball 漂移接合；hover 圖形時內部顯示計畫照片、
  圖形旋轉；裝飾文字閃爍變換。
- **計畫卡片**：hover 卡片時主標切換為該計畫 slogan；裝飾星形照片靜止時微傾、
  略縮並淡化（散落紙堆感），hover 時以底邊為軸向觀者翻起、沿 Z 軸前移上抬放大，
  帶尾段過衝，呈「從後方翻出／被抽出」的立體效果。
- **「了解更多」按鈕**：連向該計畫官網（`plan.officialUrl`），於新分頁開啟。
- **輪播**：自動輪播（hover 暫停）；指示點、兩側預覽卡片、敘事段落內計畫名與「下一計畫」標記皆可切換計畫（站內導覽，非外部連結）。
- 動畫均尊重 `prefers-reduced-motion`。

> 頁尾「計畫連結」與卡片「了解更多」皆導向各計畫官方網站（外部，新分頁開啟）。
> 站內計畫詳細頁（`/plans/[slug]`）路由仍存在，但目前無頁面入口連向它。

## 無障礙（WCAG 2.1 AA / 政府網站規範）

- **語系**：RootLayout 依當前 locale 設定 `<html lang>`（`zh-TW` / `en`）。
- **跳至主要內容**：`<body>` 開頭的 skip-link（zh-TW：「跳至主要內容」／en：
  "Skip to main content"，依當前語系切換），預設視覺隱藏、Tab 取得焦點時顯示
  於頁面左上、Enter 跳至 `#main-content`（globals.css 的 `.skip-link` class）。
- **Landmark**：頁面以 `<main id="main-content">` 包覆主要內容；`PortalFooter`
  使用 `<footer>`；`CarouselDots` 以 `<nav>` + `<button aria-current>` 表示目前位置（WAI 推薦的非 tablist 切換器寫法）。
- **標題層級**：
  - 首頁：`h1`（`PortalIntroSection` 主標）→ `h2`（卡片計畫 slogan）→ 區塊 `h2`。
  - 詳細頁：`h1`（計畫 slogan）→ `h2`（各區段標題）。每頁僅一個 h1。
- **外部連結提示**：「了解更多」按鈕文字與「（在新分頁開啟）」提示皆依語系
  切換（`a11y.learnMore` / `a11y.externalLinkAriaLabel`，含中英標點差異），
  並帶 `target="_blank" rel="noopener noreferrer"`。
- **裝飾元素隱藏**：hero 文字雲 SVG、裝飾文字、星形照片皆 `aria-hidden`。
- **圖示按鈕**：所有圖示按鈕（社群、輪播指示點、兩側預覽）皆帶 `aria-label`。
- **動畫降級**：所有 hover／淡入動畫尊重 `prefers-reduced-motion: reduce`。

## 驗證

```bash
pnpm --filter @mead/frontend type-check   # TypeScript
pnpm --filter @mead/frontend lint          # ESLint
pnpm --filter @mead/frontend test          # Vitest（含 i18n 完整性）
pnpm --filter @mead/frontend build         # 正式建置
```
