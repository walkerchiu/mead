# 組件庫 — Pages（頁面）

> [組件庫指南](../COMPONENT_LIBRARY.md) 的一部分，涵蓋 Atomic Design 的頂層 — Pages（整頁組件）。

入口網為純展示專案，**無 Templates 與 App 級 Layout 組件**；頁面由下列 Pages 直接組裝 organisms 而成。佈局／provider 在 `app/layout.tsx`、`app/[locale]/layout.tsx`、`app/[locale]/providers.tsx`。

## Pages

入口網頁面，路徑 `components/public/pages`，從 `@/components/public` 引用。資料由路由層以 props 注入（來源 `public/data/plans.json`）。

| 組件                | 對應路由                 | 用途                                                              | 主要 props       | Storybook                              |
| ------------------- | ------------------------ | ----------------------------------------------------------------- | ---------------- | -------------------------------------- |
| `PortalLandingPage` | `/[locale]`              | 入口網首頁：第一屏文字雲 + 三計畫展開／收合輪播 + 敘事段落 + 頁尾 | `plans`          | `Public Scope/Pages/PortalLandingPage` |
| `PlanDetailPage`    | `/[locale]/plans/[slug]` | 單一計畫詳細頁                                                    | `plan`、`onBack` | `Public Scope/Pages/PlanDetailPage`    |
