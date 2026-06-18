# CLAUDE.md — mead

教育部藝術與設計三大計畫（SPOSAD / IDC / TISDC）的**公開入口網**。純展示、無認證、無後端：所有內容讀同源靜態 `public/data/plans.json`。

## Stack 與結構

- **前端**：Next.js（App Router）+ MUI + next-intl（i18n）+ Storybook。
- **結構**：pnpm workspace + Turborepo 外殼。`apps/frontend`（網站本體）、`packages/{eslint-config,typescript-config}`（共用設定）。
- **Scope**：只有 PUBLIC（公開入口網，`/`、`/plans/[slug]`）。無 HQ、無 CUSTOMER、無登入。
- **Port**：`3000`。
- **雙語字型**：`@fontsource/noto-sans-tc` + `@fontsource/inter`。

## 內容與資料

- 三計畫內容、數據、社群連結等資料集中在 `apps/frontend/public/data/plans.json`，型別見 `apps/frontend/src/types/plan.ts`，載入邏輯在 `src/lib/portal/`、`src/hooks/usePlans.ts`。
- 入口網元件在 `apps/frontend/src/components/public/`（atoms/molecules/organisms/pages 分層）。
- 入口網說明文件：`docs/frontend/SPOSAD_PORTAL.md`。
- 裝飾星形的預模糊圖由 `apps/frontend/scripts/generate-plan-blur.mjs` 生成（`pnpm --filter @mead/frontend assets:plan-blur`），調整霧化外觀改該腳本並重跑，勿手改二進位檔。

## 部署

- 自架 EC2 + Caddy 自動 TLS（純前端 + Caddy 反向代理）：`deploy/ec2/`、`docs/infrastructure/EC2_PORTAL_DEPLOYMENT.md`。
- 本地容器化驗證：根 `docker-compose.yml`（只含 frontend）。本地開發直接 `pnpm dev` 即可。

## 慣例

- **Commit**：`Type(Scope): Subject`（Sentence case、≤72 字元），body 用 `1. xxx.` 編號條列、句號結尾；footer 用 `Reference:` / `NOTE:` / `BREAKING CHANGE:`。設定見 `commitlint.config.mjs`。
- 回應與文件用**正體中文**；技術名詞與識別字保留原文。
- **註解不留修改痕跡**：程式與註解要像一開始就做對，禁「依設計師回饋／原本／先前／修正」之類字眼。
- 每個前端元件都要有 Storybook story。
- 文件保鮮、與程式同步；機密不入庫；未經要求不 push，用 `/opt/homebrew/bin/git`，不碰使用者 WIP。

## 本地起步

- 安裝：`pnpm install`
- 開發：`pnpm dev`（或 `pnpm --filter @mead/frontend dev`）→ <http://localhost:3000>
- Storybook：`pnpm storybook`

## 驗證指令（能跑的都跑）

- 型別：`pnpm type-check`
- Lint / 格式：`pnpm lint`、`pnpm format:check`
- 建置：`pnpm build`、`pnpm build-storybook`
- 測試：`pnpm test`、`pnpm test:i18n`、`pnpm test:e2e`（Playwright）
- 相依稽核：`pnpm audit`
