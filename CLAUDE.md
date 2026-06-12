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
