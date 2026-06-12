# 部署指南

本文件說明 MEAD 的部署架構、環境分層、發布流程與營運實務。

> ⚠️ **狀態**：本專案目前處於**開發階段**，生產部署流程（CI/CD、Dockerfile for production、自動化發布）尚在規劃中。本文件同時涵蓋「目前可行作法」與「建議的正式部署規劃」，請依章節標示區分。

---

## 目錄

- [環境分層](#環境分層)
- [目前的部署架構（Dev）](#目前的部署架構dev)
- [建議的正式部署架構](#建議的正式部署架構)
- [環境變數管理](#環境變數管理)
- [資料庫 Migration 策略](#資料庫-migration-策略)
- [健康檢查](#健康檢查)
- [監控與日誌](#監控與日誌)
- [回滾策略](#回滾策略)
- [發布檢查清單](#發布檢查清單)

---

## 環境分層

MEAD 採六層環境（`scripts/commands/env.sh` 的 `ENVS`：local / dev / sit / uat / staging / prod）：

| 環境        | 用途                            | 資料庫                     | 域名                     |
| ----------- | ------------------------------- | -------------------------- | ------------------------ |
| **local**   | 本機開發（不依賴 Docker DB）    | 本機 / 既有 DB             | `localhost`              |
| **dev**     | 本機開發                        | 本機 TimescaleDB（Docker） | `localhost`              |
| **sit**     | 系統整合測試                    | 雲端 DB（測試資料）        | `sit.mead.<company>`     |
| **uat**     | 內部測試、使用者驗證            | 雲端 DB（測試資料）        | `uat.mead.<company>`     |
| **staging** | 發布前驗證，環境等同 production | 雲端 DB（清洗資料）        | `staging.mead.<company>` |
| **prod**    | 正式營運                        | 雲端 DB（生產資料）        | `mead.<company>`         |

對應的環境變數範本：

- `.env.example` — local/dev 參考
- `.env.dev.example` / `.env.sit.example` / `.env.uat.example` / `.env.staging.example` / `.env.prod.example` — 各環境

---

## 目前的部署架構（Dev）

### 服務拓撲

```text
┌──────────────────────────────────────────────────────┐
│  Host（macOS / Linux）                                │
│                                                      │
│  ┌──────────────────┐      ┌──────────────────┐      │
│  │  Frontend (Next) │      │  Backend (Nest)  │      │
│  │  :3000           │◄────►│  :4000 /graphql  │      │
│  │  pnpm dev        │      │  pnpm dev        │      │
│  └──────────────────┘      └────────┬─────────┘      │
│                                     │                │
│  ┌──────────────────────────────────┴──────────────┐ │
│  │  Docker Compose（docker-compose.yml）           │ │
│  │                                                 │ │
│  │  ┌──────────────┐  ┌──────────┐  ┌──────────┐   │ │
│  │  │ TimescaleDB  │  │ RabbitMQ │  │ Dragonfly│   │ │
│  │  │ :5432        │  │ :5672    │  │ :6379    │   │ │
│  │  └──────────────┘  └──────────┘  └──────────┘   │ │
│  │                                                 │ │
│  │  ┌──────────────┐  ┌──────────────────────┐     │ │
│  │  │ Mailpit      │  │ SeaweedFS            │     │ │
│  │  │ :1025/:8025  │  │ :9333 / :8333        │     │ │
│  │  └──────────────┘  └──────────────────────┘     │ │
│  └─────────────────────────────────────────────────┘ │
└──────────────────────────────────────────────────────┘
```

### 啟動流程

**首次**：

```bash
./scripts/cli.sh init
```

**日常**：

```bash
./scripts/cli.sh dev
```

### 核心服務

| 服務            | 映像                                          | 用途                              | Port         |
| --------------- | --------------------------------------------- | --------------------------------- | ------------ |
| **TimescaleDB** | `timescale/timescaledb:latest-pg16`           | 主資料庫（PostgreSQL + 時序擴展） | 5432         |
| **RabbitMQ**    | `rabbitmq:3.13-management-alpine`             | 訊息佇列                          | 5672 / 15672 |
| **Dragonfly**   | `docker.dragonflydb.io/dragonflydb/dragonfly` | Redis 相容快取                    | 6379         |
| **Mailpit**     | `axllent/mailpit`                             | 本機 SMTP 模擬（開發用）          | 1025 / 8025  |
| **SeaweedFS**   | `chrislusf/seaweedfs`                         | 分散式檔案儲存                    | 9333 / 8333  |

詳細服務說明見：

- [Docker 環境設置](./DOCKER_SETUP.md)
- [RabbitMQ + Dragonfly](../infrastructure/RABBITMQ_DRAGONFLY.md)
- [SeaweedFS](../infrastructure/SEAWEEDFS_STORAGE.md)

---

## 建議的正式部署架構

> **規劃中**：本節為尚未實作的建議架構。

### 方案 A：單機 Docker Compose（小規模 / 內部使用）

適合：使用者 < 200 人、對高可用性要求不高。

```text
┌────────────────────────────────────────────────┐
│  Reverse Proxy (Nginx / Caddy) :443            │
│  ├─ mead.example.com        → frontend:3000    │
│  └─ api.mead.example.com    → backend:4000     │
└──────────┬─────────────────────────────────────┘
           │
  ┌────────┴─────────────────────────────────────┐
  │  Docker Compose (production)                 │
  │  ├─ frontend (Next.js standalone)            │
  │  ├─ backend (NestJS)                         │
  │  ├─ postgres（managed DB 更佳）              │
  │  ├─ rabbitmq                                 │
  │  ├─ dragonfly                                │
  │  └─ seaweedfs                                │
  └──────────────────────────────────────────────┘
```

**容器化產出**（已實作，見下方「容器化部署與 per-env override」）：

- `apps/frontend/Dockerfile`、`apps/backend/Dockerfile`（multi-stage，前端 output: standalone）
- base `docker-compose.yml` 的 `app` profile + per-env `docker-compose.<env>.override.yml`（不另建 `docker-compose.production.yml`，改以 base + override 疊加）

### 方案 B：容器編排（中大規模）

適合：使用者 > 200 人、需高可用。

- **Kubernetes**（GKE / EKS / 自建）
- Managed PostgreSQL（Cloud SQL / RDS）
- Managed Redis（Memorystore / ElastiCache）或自部署 Dragonfly
- Object Storage（GCS / S3）取代 SeaweedFS

### 方案 C：混合（推薦起點）

- Frontend：部署到 Vercel / Cloudflare Pages（zero-ops）
- Backend：單機 VM 或 Container Service（Cloud Run / Fargate）
- DB：Managed PostgreSQL（TimescaleDB 擴展需確認雲端支援）

---

## 環境變數管理

### 分層檔案

```text
.env.example              # local/dev 參考範本（commit）
.env.dev.example          # dev 範本（commit）
.env.sit.example          # sit 範本（commit）
.env.uat.example          # uat 範本（commit）
.env.staging.example      # staging 範本（commit）
.env.prod.example         # prod 範本（commit）

.env                      # Dev 本機（.gitignore）
.env.docker               # Dev Docker（.gitignore）
```

**原則**：

- `.env.*.example` 提交到 repo 作為範本
- 實際值（`.env`、`.env.docker`）**絕不** commit
- 生產環境透過 Secret Manager（GCP Secret Manager / AWS Secrets Manager / Vault）注入

### 關鍵環境變數分類

| 類別       | 變數                                                   | 備註                                               |
| ---------- | ------------------------------------------------------ | -------------------------------------------------- |
| **核心**   | `NODE_ENV`、`PORT`                                     | production 必設 `NODE_ENV=production`              |
| **資料庫** | `DATABASE_URL`                                         | Managed DB 請用 SSL 連線字串                       |
| **JWT**    | `JWT_SECRET`、`REFRESH_TOKEN_SECRET`、`JWT_EXPIRES_IN` | 生產環境**必須**重新產生                           |
| **Email**  | `MAIL_PROVIDER`、`GRAPH_*`                             | 生產用 Graph API，不用 SMTP                        |
| **通知**   | `MAIL_NOTIFY_*`、`PUSH_NOTIFY_*`                       | 見 [Email 配置](../backend/EMAIL_CONFIGURATION.md) |
| **CORS**   | `CORS_ORIGIN`                                          | 設定為實際前端域名                                 |
| **支援**   | `SUPPORT_EMAIL`                                        | 顯示在通知信件中                                   |

完整清單見 [環境變數配置](../infrastructure/ENVIRONMENT_VARIABLES.md)。

### Secret 輪換

- JWT secrets：每季輪換（需搭配 refresh token 寬限期）
- DB 密碼：每季輪換
- 第三方 API key（Graph、Sentry 等）：依服務建議

---

## 資料庫 Migration 策略

### 本機開發

```bash
# 修改 schema
vim apps/backend/database/prisma/schemas/*.prisma

# 建立 migration（互動式輸入名稱）
pnpm --filter @mead/backend db:migrate

# 生成 Prisma Client
pnpm db:generate
```

### UAT / Staging / Production

**原則：Zero-Downtime Migration**

1. **相容階段**：新 schema 必須與舊程式碼相容（例：新欄位可為 NULL、新資料表無外鍵）
2. **部署新程式碼**：開始寫入新欄位
3. **資料回填**（若需要）：背景 Job 填補歷史資料
4. **清理階段**：下次發布時移除相容性程式碼

**部署時執行**：

```bash
pnpm --filter @mead/backend prisma migrate deploy
```

**避免**：

- ❌ Rename column / table（用 add new + copy + drop old 代替）
- ❌ 改變欄位類型（用 add new + cast + drop old）
- ❌ NOT NULL without default（新增欄位請給預設值或先允許 NULL）

詳見 [資料庫層](../database/DATABASE_LAYER.md) 與 [備份還原](../database/BACKUP_RESTORE.md)。

---

## 健康檢查

### Backend Health Check

建議在 production 配置以下端點（部分可能尚未實作，需於 NestJS 啟用 `@nestjs/terminus`）：

| 端點            | 用途                 | 檢查項目                 |
| --------------- | -------------------- | ------------------------ |
| `/health`       | Load balancer        | 基本存活                 |
| `/health/ready` | Kubernetes readiness | DB、Redis、RabbitMQ 連線 |
| `/health/live`  | Kubernetes liveness  | 程序存活                 |

### Docker Compose Healthcheck

已於 `docker-compose.yml` 配置：

```yaml
timescaledb:
  healthcheck:
    test: ['CMD-SHELL', 'pg_isready -U ${POSTGRES_USER:-postgres}']
    interval: 10s
    timeout: 5s
    retries: 5
```

### CLI 快速檢查

```bash
./scripts/cli.sh status           # 服務狀態
./scripts/cli.sh doctor           # 完整診斷
```

---

## 監控與日誌

### 目前現況

- **後端**：使用 `logger.service.ts`（見 `apps/backend/src/common/services/`）
- **前端**：Apollo Client 錯誤 → Snackbar + Console

### 生產環境建議（規劃中）

| 需求                | 建議工具                             |
| ------------------- | ------------------------------------ |
| **APM（效能監控）** | Sentry / Datadog / New Relic         |
| **日誌集中**        | Loki + Grafana / ELK / Cloud Logging |
| **Metrics**         | Prometheus + Grafana                 |
| **告警**            | PagerDuty / Opsgenie / Slack Webhook |
| **使用者行為**      | PostHog / Mixpanel                   |

### 關鍵指標（建議追蹤）

- HTTP 錯誤率（5xx）
- GraphQL 查詢 P95 延遲
- DB 連線池使用率
- Cron Job 成功率
- Email 發送成功率
- 活躍 session 數

---

## 回滾策略

### 快速回滾

**容器部署**：

```bash
# 重新部署上一版 image tag
docker compose -f docker-compose.production.yml up -d backend:v1.2.3
```

**Kubernetes**：

```bash
kubectl rollout undo deployment/mead-backend
```

### 資料庫回滾

**風險極高**，原則是**正向修復**而非回滾 migration：

1. 新版 migration 若有問題，應立即發布**新的反向 migration** 而非 `migrate:reset`
2. 重大變更前先 `./scripts/cli.sh db backup`
3. 永遠先在 Staging 驗證

### 緊急熔斷

若系統完全不可用：

1. 將負載均衡器切換到維護頁
2. 回滾應用程式版本
3. 檢查資料庫狀態
4. 恢復服務

---

## 發布檢查清單

### PR 合併前

- [ ] CI 全部通過（lint、type-check、test、e2e）
- [ ] Migration 在 UAT 驗證過（若有）
- [ ] 相關文件已更新
- [ ] 無硬編碼的 secret / URL
- [ ] Breaking change 有明確標示

### 發布前

- [ ] Release notes 已編寫（用途：告知使用者）
- [ ] DB 備份完成
- [ ] 環境變數差異已檢查（新增 / 刪除）
- [ ] Feature flag 已規劃（需要灰度的功能）
- [ ] 監控告警門檻已確認

### 發布後

- [ ] 核心流程人工驗證（登入、用戶管理、後台功能）
- [ ] Email 通知測試（建立 / 撤銷 PAT 等觸發事件）
- [ ] 監控儀表板無異常
- [ ] 錯誤率無突升
- [ ] 已通知關鍵使用者

---

## 容量規劃（參考）

| 使用者數 | Backend                    | DB                           | Redis   | 備註                     |
| -------- | -------------------------- | ---------------------------- | ------- | ------------------------ |
| < 50     | 1 instance / 1 vCPU / 2GB  | 2 vCPU / 4GB                 | 512MB   | 單機 Compose 足夠        |
| 50–200   | 2 instances / 2 vCPU / 4GB | 4 vCPU / 8GB                 | 1GB     | 需 LB + Managed DB       |
| 200–1000 | 3+ instances               | 8 vCPU / 16GB + Read Replica | 2GB     | K8s 或 Container Service |
| > 1000   | Auto-scale                 | HA cluster                   | Cluster | 需完整 Observability     |

---

## 下一步

本文件會隨著生產部署的實作而更新。目前優先實作項目：

1. **Dockerfile for production**（frontend + backend）
2. **CI/CD pipeline**（GitHub Actions）
3. **基礎監控**（至少 Sentry + 基本日誌集中）
4. **`/health` endpoint**（使用 `@nestjs/terminus`）

---

## 相關文件

- [CLI 工具指南](./CLI_GUIDE.md)
- [Docker 環境設置](./DOCKER_SETUP.md)
- [環境變數配置](../infrastructure/ENVIRONMENT_VARIABLES.md)
- [資料庫層](../database/DATABASE_LAYER.md)
- [備份還原](../database/BACKUP_RESTORE.md)
- [疑難排解](./TROUBLESHOOTING.md)
- [貢獻指南](./CONTRIBUTING.md)

## 容器化部署與 per-env override

backend / frontend 可容器化部署（compose profile `app`）；各環境的資源限額走 per-host override，與本機 dev 流程互不影響。

### Per-env compose override

範本 `docker-compose.<env>.override.yml.example`（已入庫）含各服務 cpus / mem 限額（dev 另含容器內連線改用 compose service name 的覆寫）。套用：

```bash
cp docker-compose.<env>.override.yml.example docker-compose.<env>.override.yml
```

實際檔 `docker-compose.<env>.override.yml` 為 gitignored（每機器值不同）。`cli.sh` 的 up 路徑會依 `.current-env` 自動 `-f` 疊上對應 override（見 `scripts/utils/common.sh` 的 `get_compose_override`）；未 cp 出實際檔時不加 `-f`、行為與未導入 override 時完全相同。

### 容器化 app 部署

```bash
docker compose --env-file .env.docker -f docker-compose.yml \
  -f docker-compose.<env>.override.yml --profile app up -d --build
```

`--profile app` 起 backend / frontend（不帶 `--profile tools`，mailpit / adminer 不啟）。前端 `NEXT_PUBLIC_*` 於 build 時由 compose `build.args`（值取自 `.env.docker`）烘進 client bundle。另有自架 HTTPS 部署見 `docs/infrastructure/SELF_HOSTED_TLS_DEPLOYMENT.md`（`docker-compose.selfhost.yml`）。

### 環境設定檔

- `./scripts/cli.sh env switch <env>` 把選定範本複製到固定執行期檔（`.env.docker` / `apps/backend/.env` / `apps/frontend/.env`）。
- 對特定環境跑資料庫 migration 時，後端連線取自 `apps/backend/.env.prod`（production）、`.env.uat`（uat）等。
