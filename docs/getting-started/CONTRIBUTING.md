# 貢獻指南

mead 是教育部藝術與設計三大計畫（SPOSAD / IDC / TISDC）的公開入口網——純前端、純展示、無認證、無後端。本文件說明開發流程、提交規範與審查標準。

## 環境需求

- Node.js ≥ 20
- pnpm ≥ 9

## 起步

```bash
pnpm install
pnpm dev            # http://localhost:3000
pnpm storybook      # http://localhost:6006
```

內容資料讀同源靜態 `apps/frontend/public/data/plans.json`，本地開發不需任何外部服務。

## 開發指令

| 指令                                | 說明                    |
| ----------------------------------- | ----------------------- |
| `pnpm dev`                          | 啟動開發伺服器（:3000） |
| `pnpm build`                        | production 建置         |
| `pnpm type-check`                   | 型別檢查                |
| `pnpm lint` / `pnpm lint:fix`       | ESLint 檢查／自動修正   |
| `pnpm format:check` / `pnpm format` | Prettier 檢查／格式化   |
| `pnpm test`                         | 單元測試（Vitest）      |
| `pnpm test:i18n`                    | i18n 完整性測試         |
| `pnpm test:e2e`                     | Playwright e2e          |
| `pnpm build-storybook`              | 建置 Storybook          |
| `pnpm audit`                        | 相依安全稽核            |

## 開發流程

1. 從目前主分支開出功能分支。
2. 實作變更；前端元件一律附上 Storybook story（見 [組件庫指南](../frontend/COMPONENT_LIBRARY.md)）。
3. 文字以 i18n key 呈現，`messages/en.json` 與 `messages/zh-TW.json` 同步增修（見 [i18n 設置指南](../frontend/I18N_SETUP.md)）。
4. 提交前自我驗證：`pnpm type-check`、`pnpm lint`、`pnpm test`、`pnpm test:i18n`、`pnpm build`、`pnpm build-storybook` 全綠。
5. 開 PR，通過審查後合併。

> 提交時 husky + lint-staged 會自動對暫存檔跑 ESLint 與 Prettier，commit message 由 commitlint 驗證。

## Commit 規範

格式 `Type(Scope): Subject`，由 `commitlint.config.mjs` 驗證：

```text
Feat(Views): Add plan timeline horizontal scroll variant

1. Implement horizontal scrollable timeline for narrow viewports.
2. Keep the desktop vertical layout unchanged.

Reference:
1. Aligns the mobile portal with the redesign spec.
```

- **Type**：`Feat` / `Fix` / `Docs` / `Style` / `Refactor` / `Test` / `Perf` / `Build` / `CI` / `Chore` 等，首字大寫。
- **Subject**：Sentence case、清楚描述變更，Header ≤ 72 字元，禁止 `WIP`、`Update code` 等籠統字眼。
- **Body**（選填）：每行 `1. xxx.` 編號條列、句號結尾。
- **Footer**（選填）：`Reference:` / `NOTE:` / `BREAKING CHANGE:` 開頭，條列格式同 Body。

詳見 [Commit Message 規範](../../git-commit-message.md)。

## Pull Request

- 標題沿用 commit 規範（`Type(Scope): Subject`）。
- 內文說明變更動機、做法與驗證方式（附上跑過的指令）。
- 變更涉及視覺時附上前後對照截圖。
- 文件與程式同步更新，不留過時敘述。

## 相關文檔

- [組件庫指南](../frontend/COMPONENT_LIBRARY.md)
- [SPOSAD 入口網](../frontend/SPOSAD_PORTAL.md)
- [i18n 設置指南](../frontend/I18N_SETUP.md)
- [Markdown 風格指南](./MARKDOWN_STYLE_GUIDE.md)
- [入口網部署到 EC2](../infrastructure/EC2_PORTAL_DEPLOYMENT.md)
