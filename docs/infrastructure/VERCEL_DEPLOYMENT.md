# 入口網部署到 Vercel

本文件描述入口網的 Vercel production 部署方式。入口網是純前端 Next.js app，部署目標是 Vercel 專案 `mead-frontend-a3az`。

## Production 環境

| 項目             | 值                                                  |
| ---------------- | --------------------------------------------------- |
| Vercel team      | `walkerchius-projects`                              |
| Project          | `mead-frontend-a3az`                                |
| Production URL   | <https://mead-frontend-a3az.vercel.app>             |
| Root Directory   | `apps/frontend`                                     |
| Framework Preset | `Other`                                             |
| Install Command  | `corepack enable && pnpm install --frozen-lockfile` |
| Build Command    | `pnpm build`                                        |
| Output Directory | `.next`                                             |
| Node.js Version  | `24.x`                                              |

`vercel.json` 保留在 repo 根目錄，供 root workspace 情境參考；Vercel 專案設定的 Root Directory 是 `apps/frontend`，實際部署以 Vercel project settings 為準。

## 本地前置檢查

先確認可在本機完成 production build：

```bash
pnpm build
```

確認 Vercel CLI 已登入，且本地 `.vercel/project.json` 指向 `mead-frontend-a3az`：

```bash
pnpm dlx vercel@latest project inspect mead-frontend-a3az
pnpm dlx vercel@latest link --yes --project mead-frontend-a3az
```

`.vercel/` 與 `.env.local` 是本地 Vercel 狀態，不進版控。

## 部署

從 repo 根目錄部署到 production：

```bash
pnpm dlx vercel@latest deploy --prod --yes --project mead-frontend-a3az
```

成功時 CLI 會輸出 deployment URL，並將 production alias 指到：

```text
https://mead-frontend-a3az.vercel.app
```

## 部署輸入控制

Vercel CLI 會從本地 workspace 打包 deployment context。為避免上傳本地 build/cache 產物，`apps/frontend/.vercelignore` 會排除：

- `.next/`
- `node_modules/`
- `storybook-static/`
- `tsconfig.tsbuildinfo`
- `test-results/`
- `playwright-report/`
- `coverage/`

若本地 Turbo build 產生 root `.turbo/` cache，部署前確認它沒有進入 Vercel dry run：

```bash
pnpm dlx vercel@latest deploy --dry --json --project mead-frontend-a3az > /tmp/vercel-dry.json
```

dry run 的 `totalSize` 應維持在合理範圍，且不應包含 `.turbo/cache/*.tar.zst` 這類大型本地 cache。

## 部署後驗證

部署完成後，至少檢查首頁、資料檔與主要圖示素材：

```bash
curl -sI https://mead-frontend-a3az.vercel.app/zh-TW | head -1
curl -sI https://mead-frontend-a3az.vercel.app/data/plans.json | head -1
curl -sI https://mead-frontend-a3az.vercel.app/images/plans/03_idc/logo/mark.png | head -1
curl -sI https://mead-frontend-a3az.vercel.app/images/plans/02_tisdc/logo/mark.png | head -1
```

預期皆回 `HTTP/2 200`。若瀏覽器仍顯示舊圖片，先 hard refresh；Vercel 靜態圖片回應會帶 `etag`，瀏覽器可能保留舊快取。

## 常見問題

| 症狀                                          | 原因 / 解法                                                                                                                |
| --------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------- |
| `File size limit exceeded (100 MB)`           | deployment context 包含本地 `.next/`、`.turbo/` 或其他大型產物。檢查 `.vercelignore` 與 dry run。                          |
| `No Next.js version detected`                 | Vercel 專案 Root Directory 指錯。`mead-frontend-a3az` 必須是 `apps/frontend`。                                             |
| CLI 部署到錯的 project                        | 重新執行 `pnpm dlx vercel@latest link --yes --project mead-frontend-a3az`，或部署時明確加 `--project mead-frontend-a3az`。 |
| CLI 提示 `vercel.json` 應在 root directory 內 | Project settings 直接設定 build/install/output；此提示不影響 `mead-frontend-a3az` 的 production deploy。                   |
