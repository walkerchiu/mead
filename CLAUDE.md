# CLAUDE.md — mead

本 repo 屬「家族」。跨 repo 慣例與一致性規範見 **foundry harness** 的 skills（`family__skills__overview` 為入口，另有 `conventions` / `architecture` / `stack-adapters` / `port-feature` / `verify` / `docs`）。**功能邏輯與編排須對齊本 stack 的 reference repo。**

## 這個 repo

- **Stack**：NestJS + Prisma（後端）/ Next.js + MUI + Apollo（前端）
- **租戶模型**：單租戶
- **Scope**：HQ（`/hq/login`）+ CUSTOMER / PUBLIC（`/login`）
- **本 stack 的 reference repo**：**npt**（NestJS 單租戶標準；本 repo 對齊它）
- **Port**：backend `4000`、frontend `3000`

## 鐵則（詳見 `family__skills__overview` 與 rules）

- 所有 scope（HQ / CUSTOMER / PUBLIC）都要處理。
- 每 repo 分開 commit、未經要求不 push、用 `/opt/homebrew/bin/git`。
- 不碰使用者 WIP；scope 變更先問；機密不入庫；文件保鮮、不留修改痕跡；前端元件都要 Storybook story。

## 本地起步（詳見 `docs/getting-started/`）

- infra：`docker compose --env-file .env.docker up -d`
- 後端 `apps/backend`：`pnpm db:push && pnpm db:seed && pnpm dev`
- 前端 `apps/frontend`：`pnpm dev`

## 驗證指令（包含但不限於，愈多愈好；對應 `family-verify` 工具箱）

- 型別：`pnpm type-check`
- Lint / 格式：`pnpm lint`、`pnpm format:check`
- 建置：`pnpm build`、`pnpm build-storybook`
- 測試：`pnpm test`、`pnpm test:i18n`、`pnpm test:e2e`（Playwright）
- 相依稽核：`pnpm audit`（授權見 `dependency-policy`）
- DB：`pnpm db:push`、`pnpm db:seed`（migration 用 `pnpm db:migrate`）
- e2e 起服務：`docker compose --env-file .env.docker up -d` → 後端 `apps/backend` `pnpm dev` → 前端 `apps/frontend` `pnpm dev` → curl / Playwright

> 以上為常用清單，**不限於此**——根 `package.json` 還有更多 scripts，能跑的都跑。
