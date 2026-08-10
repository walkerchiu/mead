# 組件庫 — Organisms（有機體組件）

> [組件庫指南](../COMPONENT_LIBRARY.md) 的一部分。Organisms 為複雜、獨立的 UI 區塊。

## Error Boundaries（共用）

路徑 `components/errors`，從 `@/components/errors` 引用。捕捉 React 渲染錯誤並呈現後備 UI（搭配 `ErrorDisplay`／`AlertMessage`）。

| 組件                   | 用途                                                                    |
| ---------------------- | ----------------------------------------------------------------------- |
| `ClientErrorBoundary`  | 應用最外層客戶端錯誤邊界（`app/layout.tsx` 使用），含全域錯誤處理初始化 |
| `FeatureErrorBoundary` | 局部功能區塊錯誤邊界，單一區塊壞掉不波及整頁                            |
| `GlobalErrorBoundary`  | 全域錯誤邊界基底                                                        |

## Public Scope Organisms

入口網專用，路徑 `components/public/organisms`。所有資料由上層以 props 注入。

| 組件                     | 用途                                                                         | 主要 props                                                                                                                 | Storybook                                       |
| ------------------------ | ---------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------- |
| `DecorativeTextCloud`    | 第一屏裝飾文字雲；色塊 hover 切換計畫文字並透出照片                          | `shapeContents`、`defaultIndex?`、`language?`                                                                              | `Public Scope/Organisms/DecorativeTextCloud`    |
| `PlanCard`               | 單一計畫詳細卡（桌機三欄／手機單欄；識別、簡介、執行單位、時程、數據、社群） | `plan`、`active?`、`frostBacking?`                                                                                         | `Public Scope/Organisms/PlanCard`               |
| `PlanCarousel`           | 三計畫展開／收合互動輪播（桌機環狀軌道、手機 peek 輪播、裝飾星形照片）       | `plans`、`expandedIndex`、`onExpandedIndexChange`、`onHoverPlanChange?`、`onSelectStart?`、`onPeekNavigate?`、`cardScale?` | `Public Scope/Organisms/PlanCarousel`           |
| `PortalFooter`           | 頁尾（站名、標語、連結欄、版權）                                             | `siteName?`、`tagline?`、`columns?`、`copyright?`                                                                          | `Public Scope/Organisms/PortalFooter`           |
| `PortalIntroSection`     | 主標／副標進場區（含 slogan 過場節奏常數 `SLOGAN_EXIT_MS`）                  | `eyebrow?`、`heading?`、`headingKey?`、`exiting?`                                                                          | `Public Scope/Organisms/PortalIntroSection`     |
| `PortalNarrativeSection` | 計畫敘事段落（標題、段落、計畫標記、星形裁形過場）                           | `heading`、`intro?`、`paragraphs?`、`planMarker?`、`currentShapeClip`、`nextShapeClip`                                     | `Public Scope/Organisms/PortalNarrativeSection` |

> `PlanCarousel` 另匯出 helper `PlanCardWithStars`（展開大卡 + 周圍裝飾星形照片的組合單元），供轉場期間退場／入場卡共用星形渲染。
