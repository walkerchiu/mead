# 組件庫指南

入口網前端的組件庫規範與 Atomic Design 實踐。組件分兩大類：**共用基礎**（Shared，跨頁通用）與**入口網**（Public Scope，SPOSAD 三計畫展示專用）。

## 概述

- **UI 框架**：Material-UI（MUI）+ Emotion
- **設計模式**：Atomic Design（atoms → molecules → organisms → pages）
- **組件文檔**：Storybook（每個組件都要有 story）
- **i18n**：next-intl

入口網為純展示、無認證、無後端，因此組件不含表單送出、API 呼叫等業務邏輯；資料一律由上層以 props 注入（來源為靜態 `public/data/plans.json`）。

## 目錄結構

```text
apps/frontend/src/components/
├── atoms/                 # 共用原子
│   ├── Buttons/           # Button / ActionButton / IconButton
│   └── Icon/
├── molecules/             # 共用分子
│   ├── AlertMessage/
│   ├── ErrorDisplay/
│   └── SnackbarWithProgress/
├── errors/                # Error Boundaries（Client / Feature / Global）
├── design-system/         # Colors / Typography（Storybook 設計系統展示）
├── utils/                 # 樣式工具（layoutStyles）
└── public/                # 入口網（Public Scope）
    ├── atoms/             # AnimatedSlogan / CarouselDots / LearnMoreButton / SocialIconButton
    ├── molecules/         # PlanLogo / PlanPeekNavButton / PlanStatsBar / PlanTimeline / SocialLinkBar / StatsMarquee
    ├── organisms/         # DecorativeTextCloud / PlanCard / PlanCarousel / PortalFooter / PortalIntroSection / PortalNarrativeSection
    └── pages/             # PortalLandingPage / PlanDetailPage
```

> 共用組件從 `@/components/{atoms,molecules,errors}` 引用；入口網組件從 `@/components/public` 引用。

## 組件清單

| 層級                             | 文件                                             |
| -------------------------------- | ------------------------------------------------ |
| Atoms                            | [ATOMS.md](./component-library/ATOMS.md)         |
| Molecules                        | [MOLECULES.md](./component-library/MOLECULES.md) |
| Organisms（含 Error Boundaries） | [ORGANISMS.md](./component-library/ORGANISMS.md) |
| Pages                            | [TEMPLATES.md](./component-library/TEMPLATES.md) |

## Design System

- **Colors** — `components/design-system/Colors.stories.tsx`：主題色、語意色、文字／背景／邊框色。
- **Typography** — `components/design-system/Typography.stories.tsx`：標題、正文、字重與對齊。

雙語字型：`@fontsource/noto-sans-tc` + `@fontsource/inter`。主題系統見 [THEME_SYSTEM.md](./THEME_SYSTEM.md)。

## Storybook

```bash
pnpm storybook     # http://localhost:6006
```

側欄頂層分兩大群組，群組內各層級依英文字母自動排序（`.storybook/preview` 的 `storySort`，`method: 'alphabetical'`）：

```text
Introduction        # Welcome / Best Practices
Shared              # Design System / Atoms / Molecules（跨頁共用）
Public Scope        # Atoms / Molecules / Organisms / Pages（入口網）
```

story 的 `title` 即決定其位置，例如 `Shared/Atoms/Button`、`Public Scope/Organisms/PlanCarousel`。新增組件只要設對 `title`，不需手動維護排序清單。

## 新增組件

```bash
mkdir -p src/components/public/atoms/Example
touch src/components/public/atoms/Example/{Example.tsx,Example.stories.tsx,index.ts}
```

1. **確定層級**：單一元素 → atoms；數個原子組合 → molecules；完整區塊 → organisms；整頁 → pages。
2. **判斷歸屬**：SPOSAD 展示專用 → `public/`；跨頁通用 → 共用 `atoms`/`molecules`。
3. **明確型別**：export `XxxProps` interface，避免 `any`。
4. **撰寫 story**：`title` 用對應群組與層級（`Shared/...` 或 `Public Scope/...`），加 `tags: ['autodocs']`。
5. **桶狀導出**：於該層 `index.ts` re-export。
6. **不跨層級反向引用**、**不在組件內寫資料抓取**（以 props 注入）。

## 相關文檔

- [DESIGN_GUIDE.md](./DESIGN_GUIDE.md) — 設計規範與視覺標準
- [SPOSAD_PORTAL.md](./SPOSAD_PORTAL.md) — 入口網整體架構
- [THEME_SYSTEM.md](./THEME_SYSTEM.md) — 主題系統
- [SCROLL_CONTROL_COMPONENT_DESIGN.md](./SCROLL_CONTROL_COMPONENT_DESIGN.md) — 捲動控制設計
