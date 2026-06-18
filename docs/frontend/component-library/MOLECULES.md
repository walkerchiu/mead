# 組件庫 — Molecules（分子組件）

> [組件庫指南](../COMPONENT_LIBRARY.md) 的一部分。Molecules 由數個 Atoms 組成的功能單元。

分 **Shared**（`@/components/molecules`）與 **Public Scope**（`@/components/public`）兩類。

## Shared Molecules

| 組件                   | 用途                                                               | 主要 props                                             | Storybook                               |
| ---------------------- | ------------------------------------------------------------------ | ------------------------------------------------------ | --------------------------------------- |
| `AlertMessage`         | 行內提示訊息（success / error / warning / info，可關閉、可帶動作） | 繼承 MUI Alert，擴充 severity / title / 可關閉 / retry | `Shared/Molecules/AlertMessage`         |
| `ErrorDisplay`         | 整頁／整區錯誤呈現（404、權限不足、伺服器錯誤、網路錯誤等）        | severity、標題、說明、動作按鈕、圖示尺寸、高度         | `Shared/Molecules/ErrorDisplay`         |
| `SnackbarWithProgress` | 帶倒數進度條的 notistack snackbar 自訂呈現（`forwardRef`）         | notistack `CustomContentProps`                         | `Shared/Molecules/SnackbarWithProgress` |

> `SnackbarWithProgress` 由 `app/[locale]/providers.tsx` 的 `SnackbarProvider` 套用到所有 variant。`AlertMessage`、`ErrorDisplay` 為 `components/errors` 的 Error Boundary 所用。

## Public Scope Molecules

入口網專用，路徑 `components/public/molecules`。

| 組件                | 用途                                               | 主要 props                                                                           | Storybook                                  |
| ------------------- | -------------------------------------------------- | ------------------------------------------------------------------------------------ | ------------------------------------------ |
| `PlanLogo`          | 計畫識別標誌（logo 圖 + 名牌文字）                 | `name`、`planId?`、`logoSrc?`、`nameplate?`、`size?`                                 | `Public Scope/Molecules/PlanLogo`          |
| `PlanPeekNavButton` | 輪播兩側／手機版「探頭」導覽鈕，指向上一／下一計畫 | `direction`、`planName`、`markSrc`、`top?`、`onClick`                                | `Public Scope/Molecules/PlanPeekNavButton` |
| `PlanStatsBar`      | 計畫數據成果橫列                                   | `stats`                                                                              | `Public Scope/Molecules/PlanStatsBar`      |
| `PlanTimeline`      | 計畫時程軸（可橫向捲動變體）                       | `year?`、`activeMonth?`、`calloutText?`、`variant?`                                  | `Public Scope/Molecules/PlanTimeline`      |
| `SocialLinkBar`     | 社群連結列（可附「了解更多」）                     | `socialLinks`、`showLearnMore?`、`learnMoreLabel?`、`learnMoreHref?`、`onLearnMore?` | `Public Scope/Molecules/SocialLinkBar`     |
| `StatsMarquee`      | 數據成果跑馬燈（垂直／水平）                       | `stats`、`direction?`                                                                | （隨 PlanCard 呈現）                       |
