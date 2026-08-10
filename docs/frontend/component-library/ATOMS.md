# 組件庫 — Atoms（原子組件）

> [組件庫指南](../COMPONENT_LIBRARY.md) 的一部分。Atoms 為最小不可分割的 UI 元素。

分兩類：**Shared**（跨頁共用，`@/components/atoms`）與 **Public Scope**（入口網專用，`@/components/public`）。

## Shared Atoms

### Buttons

路徑：`components/atoms/Buttons`。匯出三個按鈕（皆以 MUI Button/IconButton 為基礎，套用專案樣式）。

| 組件           | 用途                                                              | 主要 props                                           | Storybook                   |
| -------------- | ----------------------------------------------------------------- | ---------------------------------------------------- | --------------------------- |
| `Button`       | 一般按鈕（text / outlined / contained、尺寸、loading、fullWidth） | 繼承 MUI `ButtonProps`（去除 `color`）+ `loading` 等 | `Shared/Atoms/Button`       |
| `ActionButton` | 帶語意色／圖示的動作按鈕                                          | 繼承 `ButtonProps` 並擴充                            | `Shared/Atoms/ActionButton` |
| `IconButton`   | 純圖示按鈕                                                        | 繼承 MUI `IconButtonProps`（去除 `color`）           | `Shared/Atoms/IconButton`   |

### Icon

路徑：`components/atoms/Icon`。統一的圖示元件（`forwardRef`），封裝圖示來源、尺寸與色彩。

| props       | 說明                   |
| ----------- | ---------------------- |
| `IconProps` | 圖示名稱、尺寸、色彩等 |

Storybook：`Shared/Atoms/Icon`。

## Public Scope Atoms

入口網專用，路徑 `components/public/atoms`，從 `@/components/public` 引用。

| 組件               | 用途                                                       | 主要 props                                                            | Storybook                             |
| ------------------ | ---------------------------------------------------------- | --------------------------------------------------------------------- | ------------------------------------- |
| `AnimatedSlogan`   | slogan 逐字「展延」進場動畫；以 React `key` 重新掛載可重播 | `text`、`staggerMs?`、`durationMs?`、`sx?`                            | `Public Scope/Atoms/AnimatedSlogan`   |
| `CarouselDots`     | 輪播指示點，可點選切換                                     | `count`、`activeIndex`、`onSelect?`、`size?`、`labels?`、`ariaLabel?` | `Public Scope/Atoms/CarouselDots`     |
| `LearnMoreButton`  | 「了解更多」傾斜小按鈕，連向計畫官網                       | `label?`、`href?`、`onClick?`、`size?`、`tilt?`                       | `Public Scope/Atoms/LearnMoreButton`  |
| `SocialIconButton` | 社群平台圖示連結（自動辨識平台）                           | `platform`、`url`、`size?`                                            | `Public Scope/Atoms/SocialIconButton` |

> `SocialIconButton` 另匯出 `resolveSocialPlatform(raw)` 工具，從原始字串推斷社群平台。
