# 疑難排解指南

本文件彙整 NPT 開發與使用上常見的問題與排查步驟。

---

## 目錄

- [優先工具：doctor 診斷](#優先工具doctor-診斷)
- [環境初始化問題](#環境初始化問題)
- [Docker 服務問題](#docker-服務問題)
- [資料庫問題](#資料庫問題)
- [認證與登入問題](#認證與登入問題)
- [前端開發問題](#前端開發問題)
- [後端開發問題](#後端開發問題)
- [通知系統問題](#通知系統問題)
- [i18n 問題](#i18n-問題)
- [測試問題](#測試問題)
- [效能問題](#效能問題)

---

## 優先工具：doctor 診斷

遇到問題時，**第一步永遠是跑 doctor**：

```bash
./scripts/cli.sh doctor           # 全面診斷
./scripts/cli.sh doctor --fix     # 診斷並嘗試自動修復
```

`doctor` 會檢查：

- Node.js、pnpm、Docker 版本
- 環境變數完整性
- Docker 服務狀態（PostgreSQL、RabbitMQ、Dragonfly、Mailpit、SeaweedFS）
- Port 占用
- 依賴安裝狀態

若 `doctor` 也無法解決，再依下列章節排查。

---

## 環境初始化問題

### `pnpm install` 失敗

**症狀**：`ERR_PNPM_PEER_DEP_ISSUES` 或特定套件安裝失敗

**排查**：

```bash
# 1. 檢查 Node 版本
node -v              # 必須 >= 20

# 2. 檢查 pnpm 版本
pnpm -v              # 必須 >= 9

# 3. 清乾淨重裝
./scripts/cli.sh clean
pnpm install
```

若仍失敗，嘗試：

```bash
rm -rf node_modules pnpm-lock.yaml
pnpm store prune
pnpm install
```

### `./scripts/cli.sh init` 中斷

**排查**：

```bash
./scripts/cli.sh doctor           # 找出中斷原因
tail -100 /tmp/npt-init-*.log    # 查看 init log（若有）
```

常見原因：

- Docker Desktop 未啟動 → 開啟 Docker Desktop 後重試
- Port 被佔用 → `./scripts/cli.sh port` 查看、釋放
- `.env.docker` 缺少必要變數（`POSTGRES_PASSWORD`）→ 複製 `.env.docker.example`

---

## Docker 服務問題

### 服務狀態顯示 unhealthy

```bash
./scripts/cli.sh status           # 快速檢視
./scripts/cli.sh logs <service>   # 查看特定服務日誌
```

服務名稱：`timescaledb`、`rabbitmq`、`dragonfly`、`mailpit`、`seaweedfs`

### TimescaleDB 連不上

**症狀**：`ECONNREFUSED 127.0.0.1:5432` 或 `password authentication failed`

**排查**：

```bash
# 1. 確認 container 運行
docker ps | grep npt-timescaledb

# 2. 檢查密碼一致性
grep POSTGRES_PASSWORD .env.docker apps/backend/.env

# 3. 測試連線
docker exec -it npt-timescaledb psql -U postgres -d npt_db -c "SELECT 1;"

# 4. 重啟
./scripts/cli.sh restart timescaledb
```

### Port 衝突（3000、4000、5432 等被占用）

```bash
./scripts/cli.sh port             # 列出本專案占用的 port
lsof -i :3000                     # 查看誰占用 3000
kill -9 <PID>                     # 強制結束

# 或透過 CLI 停止整個專案
./scripts/cli.sh stop
```

### Docker 磁碟空間不足

```bash
docker system df                  # 查看用量
docker system prune -a --volumes  # ⚠️ 會刪除所有未使用的 image/volume
```

---

## 資料庫問題

### `Prisma schema out of sync`

**症狀**：`PrismaClientKnownRequestError` 或 migration 錯誤

```bash
pnpm db:generate                  # 重新生成 Prisma Client
pnpm db:migrate                   # 執行 pending migrations
```

若仍有問題：

```bash
pnpm --filter @npt/backend db:migrate:reset   # ⚠️ 會清空資料
pnpm db:seed
```

### Migration 衝突

**症狀**：拉取別人的 branch 後，migration 時報 `P3006` 或 shadow database 錯誤

```bash
# 1. Drop shadow database
docker exec npt-timescaledb psql -U postgres -c "DROP DATABASE IF EXISTS npt_shadow;"

# 2. 重新執行
pnpm db:migrate
```

### Seed 資料對不上

若 seed 執行後帳號登入失敗，先確認 seed 有實際跑過：

```bash
pnpm db:seed
```

seed 後的預設帳號密碼：所有帳號統一 `Password123!`

### 想重置開發資料庫

```bash
./scripts/cli.sh db reset        # 互動式重置（會確認）
# 或：
pnpm --filter @npt/backend db:migrate:reset
pnpm db:seed
```

---

## 認證與登入問題

### 登入成功但立即又被登出

**可能原因**：

1. Refresh token cookie 未正確設定（`SameSite`、`Secure`）
2. 前後端 port 不一致導致 cookie 無法共享
3. 瀏覽器第三方 cookie 被封鎖

**排查**：

```bash
# 檢查後端 JWT 設定
grep -E "JWT_|REFRESH_" apps/backend/.env

# 瀏覽器開發者工具 → Application → Cookies → 檢查 refresh_token 是否存在
```

### 「Email 或密碼錯誤」但確定密碼正確

1. 確認 seed 有跑過（`pnpm db:seed`）
2. 確認沒有多個 .env 互相覆蓋
3. 帳號可能被鎖定（連續 5 次失敗）：

```bash
# 查看是否鎖定
docker exec npt-timescaledb psql -U postgres -d npt_db -c \
  "SELECT email, locked_until FROM users WHERE email='...';"

# 解鎖（開發環境）
docker exec npt-timescaledb psql -U postgres -d npt_db -c \
  "UPDATE users SET locked_until=NULL, failed_login_count=0 WHERE email='...';"
```

### Session 立即過期

檢查系統時間是否準確（Docker 容器時間與主機時間不一致會導致 JWT 驗證失敗）：

```bash
docker exec npt-timescaledb date
date
```

### PAT（Personal Access Token）401

1. 確認 token 格式是 `npt_` 開頭、共 37 字元
2. 確認未過期、未撤銷（到 `/settings/tokens` 查看）
3. 確認 scope 涵蓋所需 API（scope 由各專案於 `personal-access-token.service.ts` 中的 `ALLOWED_SCOPES` 定義）

---

## 前端開發問題

### 修改後 hot reload 沒反應

```bash
# 1. 清 Next.js 快取
rm -rf apps/frontend/.next

# 2. 重啟
./scripts/cli.sh dev
```

### TypeScript 錯誤但程式碼看起來正確

```bash
# 重啟 TS server（VS Code: Cmd+Shift+P → Restart TS Server）
pnpm type-check

# Prisma Client 過期
pnpm db:generate
```

### Apollo Client「Network error」

**排查清單**：

1. 後端是否啟動？ → `curl http://localhost:4000/graphql -X POST -H "Content-Type: application/json" -d '{"query":"{__typename}"}'`
2. CORS 問題？ → 檢查後端 `CORS_ORIGIN` 環境變數
3. CSP blocked？ → 瀏覽器開發者工具 Console 看有無 CSP 錯誤

### Sidebar 狀態沒持久化

已知行為：用 `localStorage` 儲存於 `npt.sidebarState`，清除瀏覽器資料會重置為預設（桌面展開、行動關閉）。

### Dark mode 切換後部分元件沒跟上

檢查元件是否硬編碼色值而非使用 theme token：

```tsx
// ❌ 不好
<Box sx={{ color: '#0c3467' }} />

// ✅ 正確
<Box sx={{ color: 'primary.main' }} />
```

---

## 後端開發問題

### NestJS 啟動失敗

```bash
# 查看完整錯誤
pnpm --filter @npt/backend dev 2>&1 | head -50
```

常見原因：

- `.env` 缺少必要變數 → `./scripts/cli.sh doctor`
- 資料庫連不上 → 見上方「TimescaleDB 連不上」
- Prisma Client 未生成 → `pnpm db:generate`

### GraphQL Playground 打不開

預設 production 模式會關閉 Playground。開發環境確認：

```bash
grep "GRAPHQL_PLAYGROUND\|NODE_ENV" apps/backend/.env
# 應為：NODE_ENV=development
```

### Cron Job 沒觸發

```bash
# 查看 Cron 監控
# 前端：/hq/cron-jobs
# 或 log：
docker logs npt-backend | grep -i cron
```

詳見 [Cron Jobs 系統](../backend/CRON_JOBS.md)。

---

## 通知系統問題

### 鈴鐺 badge 沒更新

1. 確認 GraphQL Subscription 已連線（DevTools Network → WS）
2. 確認 `PUSH_NOTIFY_*` 環境變數未設為 `false`
3. 確認事件真的有觸發（後端 log 應看到 `Creating notification`）

### 收不到 Email

開發環境使用 **Mailpit**（本機 SMTP 模擬器）：

```bash
# 開啟 Mailpit 介面
open http://localhost:8025        # 預設 port
```

若用 production 模式（`MAIL_PROVIDER=graph`）：

1. 確認 `GRAPH_TENANT_ID`、`GRAPH_CLIENT_ID`、`GRAPH_CLIENT_SECRET`、`GRAPH_MAIL_FROM` 正確
2. 確認 Azure AD app 有 `Mail.Send` 權限

詳見 [Email 配置](../backend/EMAIL_CONFIGURATION.md)。

### 通知重複出現

可能是 React StrictMode 在開發模式下導致 Effect 執行兩次，生產環境不會。確認 `apps/frontend/next.config.js` 的 `reactStrictMode` 設定。

---

## i18n 問題

### 翻譯文字顯示 key 而非內容

**症狀**：畫面顯示 `sidebar.administration` 而非「系統管理」

**排查**：

```bash
# 1. 檢查翻譯檔是否存在該 key
grep "administration" apps/frontend/messages/zh-TW.json

# 2. 重新生成類型
pnpm --filter @npt/frontend generate-i18n-types

# 3. 前端重啟
./scripts/cli.sh restart frontend
```

### 後端錯誤訊息語言不對

**排查**：後端透過 `Accept-Language` header 判斷語言。確認前端 Apollo Client 有傳：

```typescript
// apollo-provider.tsx
headers: {
  'Accept-Language': locale,
}
```

詳見 [i18n 協調機制](./I18N_COORDINATION.md)。

### 新增語言後沒生效

完整流程見 [前端 i18n 新增語言](../frontend/I18N_SETUP.md#新增語言)。

---

## 測試問題

### Playwright E2E 測試啟動失敗

```bash
# 安裝 Playwright 瀏覽器
pnpm exec playwright install

# 執行單一測試
pnpm test:e2e --headed   # 有頭模式，看到瀏覽器
pnpm test:e2e:debug      # 逐步除錯
```

### i18n 完整性測試失敗

**症狀**：`Missing translation key: xxx`

```bash
pnpm --filter @npt/backend test src/i18n/i18n-completeness.spec.ts
```

修復：比對 `en/` 和 `zh-TW/` 目錄下的所有 JSON，補齊缺失的 key。

---

## 效能問題

### 前端頁面初次載入超過 10 秒

```bash
# 1. 檢查 bundle size
pnpm --filter frontend build
# 查看 .next/analyze

# 2. 檢查網路
# Chrome DevTools → Network → 看是否有大量阻塞請求
```

### GraphQL 查詢很慢

1. 檢查是否有 N+1 問題（後端 log 會看到大量重複查詢）
2. 使用 DataLoader（見 [效能優化](../backend/PERFORMANCE_OPTIMIZATION.md)）
3. 檢查資料庫索引

### Docker 跑很卡

```bash
# Docker Desktop → Settings → Resources
# 建議：至少 4 CPU + 8GB RAM
```

---

## 其他

### 遇到完全查不出原因的問題

1. **最後手段**：全清重建

```bash
./scripts/cli.sh stop
./scripts/cli.sh clean --full      # ⚠️ 會清除 node_modules、Docker volumes
./scripts/cli.sh init
```

2. **回報 issue**：附上

- `./scripts/cli.sh doctor` 輸出
- `./scripts/cli.sh status` 輸出
- 相關 log（前端 Console、後端 terminal、`./scripts/cli.sh logs`）
- 重現步驟

---

## 相關文件

- [CLI 工具指南](./CLI_GUIDE.md) — 所有 CLI 命令詳解
- [Docker 環境設置](./DOCKER_SETUP.md)
- [環境變數配置](../infrastructure/ENVIRONMENT_VARIABLES.md)
- [部署指南](./DEPLOYMENT.md)
- [貢獻指南](./CONTRIBUTING.md)
