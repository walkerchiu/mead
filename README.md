# mead — 教育部藝術與設計三大計畫入口網

教育部藝術與設計三大計畫（**SPOSAD**：藝術與設計菁英海外培訓計畫、**IDC**：設計戰國策、**TISDC**：臺灣國際學生創意設計大賽）的**公開入口網**。純展示、無認證、無後端：所有內容讀同源靜態 `apps/frontend/public/data/plans.json`。

![Node.js](https://img.shields.io/badge/Node.js-%3E%3D20.0.0-339933?logo=node.js&logoColor=white)
![pnpm](https://img.shields.io/badge/pnpm-%3E%3D9.0.0-F69220?logo=pnpm&logoColor=white)
![TypeScript](https://img.shields.io/badge/TypeScript-3178C6?logo=typescript&logoColor=white)
![Next.js](https://img.shields.io/badge/Next.js-000000?logo=next.js&logoColor=white)
![MUI](https://img.shields.io/badge/MUI-007FFF?logo=mui&logoColor=white)
![Storybook](https://img.shields.io/badge/Storybook-FF4785?logo=storybook&logoColor=white)

## 架構

- **前端**：Next.js（App Router）+ MUI + next-intl（中／英雙語）+ Storybook。
- **結構**：pnpm workspace + Turborepo 外殼。
  - `apps/frontend/` — 網站本體
  - `packages/typescript-config/`、`packages/eslint-config/` — 共用設定
- **Scope**：只有公開入口網（`/`、`/plans/[slug]`），無登入、無後端。
- **資料**：`apps/frontend/public/data/plans.json`（型別 `src/types/plan.ts`）。
- **入口網元件**：`apps/frontend/src/components/public/`。

## 系統需求

- Node.js ≥ 20
- pnpm ≥ 9

## 快速開始

```bash
pnpm install
pnpm dev            # http://localhost:3000
pnpm storybook      # 元件文件
```

## 常用指令

| 指令                                            | 說明                       |
| ----------------------------------------------- | -------------------------- |
| `pnpm dev`                                      | 啟動開發伺服器（:3000）    |
| `pnpm build`                                    | production 建置            |
| `pnpm type-check`                               | 型別檢查                   |
| `pnpm lint` / `pnpm format:check`               | Lint / 格式                |
| `pnpm test` / `pnpm test:i18n`                  | 單元 / i18n 完整性測試     |
| `pnpm test:e2e`                                 | Playwright e2e             |
| `pnpm build-storybook`                          | 建置 Storybook             |
| `pnpm --filter @mead/frontend assets:plan-blur` | 重新生成裝飾星形的預模糊圖 |

## 部署

自架 EC2 + Caddy 自動 TLS（純前端 + Caddy 反向代理）：設定見 `deploy/ec2/`，逐步流程見 [`docs/infrastructure/EC2_PORTAL_DEPLOYMENT.md`](docs/infrastructure/EC2_PORTAL_DEPLOYMENT.md)。

## 文檔

- 入口網設計：[`docs/frontend/SPOSAD_PORTAL.md`](docs/frontend/SPOSAD_PORTAL.md)
- 設計指引 / 主題 / 元件庫 / i18n：見 [`docs/`](docs/)
- 開發協作慣例：[`docs/getting-started/CONTRIBUTING.md`](docs/getting-started/CONTRIBUTING.md)

## 授權

UNLICENSED — 內部專案。
