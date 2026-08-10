# 主題系統

入口網使用 MUI Theme、`ThemeRegistry` 與全域 CSS 變數管理 Light / Dark / System 主題。主題系統服務公開入口網與 Storybook 元件展示，不包含登入、後台或伺服器端使用者偏好同步。

## 架構

| 層級           | 檔案                                           | 職責                                                              |
| -------------- | ---------------------------------------------- | ----------------------------------------------------------------- |
| App Provider   | `apps/frontend/src/app/[locale]/providers.tsx` | 包裝 `ThemeRegistry`、`SnackbarProvider`、`ProgressProvider`      |
| Theme Registry | `apps/frontend/src/theme/ThemeRegistry.tsx`    | 建立 MUI Theme、同步 `dark-mode` class、配置 MUI App Router cache |
| Theme Factory  | `apps/frontend/src/theme/theme.ts`             | 依 `light` / `dark` 產生 MUI theme                                |
| Tokens         | `apps/frontend/src/theme/tokens/`              | 色彩、斷點、字體、按鈕、欄位、chip 等 token                       |
| CSS Variables  | `apps/frontend/src/app/globals.css`            | HTML/body 背景、字體變數、頁面背景變數、skip link                 |
| Utilities      | `apps/frontend/src/utils/theme-colors.ts`      | 通用狀態色工具                                                    |

## 主題模式

`localStorage.theme` 支援三種值：

| 值       | 行為                                   |
| -------- | -------------------------------------- |
| `light`  | 固定淺色主題                           |
| `dark`   | 固定暗色主題                           |
| `system` | 依 `prefers-color-scheme` 決定有效主題 |

`apps/frontend/src/app/layout.tsx` 內的 blocking script 會在 React hydration 前讀取 `localStorage.theme` 與系統偏好，並同步 `<html>` 的 `dark-mode` class。`ThemeRegistry` 在 client 端沿用同一個 class 取得初始主題，避免第一幀閃爍。

## ThemeRegistry

`ThemeRegistry` 是 client component，負責：

- 從 `<html class="dark-mode">` 初始化有效主題。
- 監聽 `storage`，讓不同分頁同步主題。
- 監聽 `prefers-color-scheme`，支援 system 模式。
- 監聽 `theme-change` 自訂事件，支援同頁即時切換。
- 使用 `@mui/material-nextjs/v15-appRouter` 的 `AppRouterCacheProvider`，並把 CSP nonce 傳給 MUI emotion style。

```tsx
<AppRouterCacheProvider options={{ key: 'mui', nonce, prepend: true }}>
  <ThemeProvider theme={muiTheme}>
    <CssBaseline />
    {children}
  </ThemeProvider>
</AppRouterCacheProvider>
```

## Theme Factory

`createAppTheme(mode)` 依 `light` / `dark` 組合 token：

- `paletteBase` / `paletteDark`
- `buttonTokens` / `buttonTokensDark`
- `textFieldTokens` / `textFieldTokensDark`
- `actionButtonTokens`
- `iconButtonTokens`
- `switchTokens`
- `radioTokens`
- `searchTokens`
- `chipTokens`
- `tones`
- `typography`
- `getComponentOverrides(mode)`

預設匯出的 `theme` 是 light theme，供需要靜態 theme 物件的場景使用。

## 全域 CSS

`globals.css` 定義字體、頁面背景、暗色 class 與 page background variables：

```css
:root {
  --font-inter: 'Inter';
  --font-roboto: 'Roboto';
  --font-noto-sans-tc: 'Noto Sans TC';
  --font-roboto-mono: 'Roboto Mono';
  --page-gradient-bg: linear-gradient(135deg, #0c3467 0%, #00194e 100%);
  --page-solid-bg: #f5f7fa;
}

html.dark-mode {
  --page-gradient-bg: linear-gradient(135deg, #1a1a1a 0%, #0d0d0d 100%);
  --page-solid-bg: #0d0d0d;
}
```

`body` 使用 Roboto + Noto Sans TC；公共入口網內的特殊排版與斷點由 `public/tokens.ts` 控制。

## 通用狀態色

`getStatusColors(theme)` 回傳 `success`、`error`、`warning`、`info`、`default` 的背景與文字色。此工具只處理通用 UI 狀態，不承載後台 audit、session 或權限語意。

```typescript
const colors = getStatusColors(theme);

<Chip
  label="Loaded"
  sx={{
    bgcolor: colors.success.bgColor,
    color: colors.success.textColor,
  }}
/>
```

## Storybook

Storybook 使用 `apps/frontend/src/theme/StorybookThemeRegistry.tsx`，避免依賴 Next.js App Router runtime。元件文件可在 Storybook 內檢查 light / dark 外觀與響應式狀態。

```bash
pnpm storybook
pnpm build-storybook
```

## 驗證

主題相關變更至少執行：

```bash
pnpm type-check
pnpm test
pnpm build-storybook
pnpm build
```

若改到 Markdown 文件，同步執行 markdownlint 與 `pnpm format:check`。
