# 資料庫供應商對照指南

NPT 的資料層只用標準 PostgreSQL 13+ 語法，**沒有綁定 TimescaleDB extension**。本機 Docker 用 `timescale/timescaledb:latest-pg16` 只是取其「含 pg16 + extension ready」方便未來擴充，目前所有 migration 都能直接跑在任何託管 Postgres。

本指南說明各 provider 的連線字串、SSL、必備 grants 與已知限制。

> **Prisma 規範**：NPT 使用 Prisma ORM，所有連線參數（`sslmode`、`sslrootcert`、`application_name` 等）必須出現在 `DATABASE_URL` 的 query string，不能像 node-postgres 那樣傳 driver option。為簡化操作，後端啟動時會由 [`apps/backend/src/prisma/database-url.ts`](../../apps/backend/src/prisma/database-url.ts) 把以下 env 自動 splice 進 URL：
>
> - `DATABASE_SSL_MODE` → `?sslmode=...`
> - `DATABASE_SSL_CA` / `DATABASE_SSL_CA_PATH` → `?sslrootcert=...`（inline CA 會寫入 OS tempdir）
> - `DATABASE_APPLICATION_NAME` → `?application_name=...`
>
> 所以您可以在 `DATABASE_URL` 直接寫完整 query，也可拆給上述 env，兩種寫法等價（env 覆寫 URL）。

---

## 目錄

- [選擇矩陣](#選擇矩陣)
- [本機 TimescaleDB（dev）](#本機-timescaledbdev)
- [AWS RDS PostgreSQL](#aws-rds-postgresql)
- [AWS Aurora PostgreSQL](#aws-aurora-postgresql)
- [Google Cloud SQL for PostgreSQL](#google-cloud-sql-for-postgresql)
- [Azure Database for PostgreSQL](#azure-database-for-postgresql)
- [Supabase / Neon（serverless）](#supabase--neonserverless)
- [SSL 與 CA bundle](#ssl-與-ca-bundle)
- [連線池與 RDS Proxy / PgBouncer](#連線池與-rds-proxy--pgbouncer)

---

## 選擇矩陣

| Provider                | Postgres 版本 | SSL 強制              | 適合階段   | 備註                                                                        |
| ----------------------- | ------------- | --------------------- | ---------- | --------------------------------------------------------------------------- |
| 本機 TimescaleDB        | 16            | ❌ （local）          | dev        | `docker-compose` 自帶；`timescaledb` 擴充未啟用也不影響                     |
| AWS RDS PostgreSQL      | 13–16         | ✅ `verify-full` 推薦 | UAT / prod | CA bundle 全球共用；`rds.force_ssl=1` 可由 parameter group 設定             |
| AWS Aurora PostgreSQL   | 13–16         | ✅ 同上               | UAT / prod | Cluster endpoint（writer）+ reader endpoint（讀擴展）                       |
| Google Cloud SQL for PG | 13–16         | ✅ `verify-ca` 起跳   | UAT / prod | 預設 SSL 較嚴；亦可走 Cloud SQL Auth Proxy 免 CA                            |
| Azure Database for PG   | 13–16 (Flex)  | ✅ `verify-full`      | UAT / prod | Flexible Server（建議）；憑證為 DigiCert Global Root                        |
| Supabase                | 15            | ✅ `require` 即可     | prod / POC | 走 direct endpoint（不要走 PgBouncer transaction mode）                     |
| Neon                    | 15 / 16       | ✅ `require`          | prod / POC | Serverless，connection_limit 低；建議配 pooled endpoint + Prisma Data Proxy |

---

## 本機 TimescaleDB（dev）

```bash
# .env
DATABASE_URL="postgresql://postgres:CHANGEME_postgres_dev123@localhost:5432/npt_db?schema=public&connection_limit=10&pool_timeout=10"
# 本機 Docker 無 SSL
# DATABASE_SSL_MODE=disable
```

- 來源：`docker-compose --env-file .env.docker up -d`
- `POSTGRES_USER`（預設 `postgres`）擁有 superuser 權限

---

## AWS RDS PostgreSQL

### 建立（基本 AWS CLI）

```bash
aws rds create-db-instance \
  --db-instance-identifier npt-prod \
  --engine postgres \
  --engine-version 16 \
  --db-instance-class db.t4g.medium \
  --allocated-storage 100 \
  --master-username npt_prod \
  --master-user-password '<strong>' \
  --db-name npt_db_production \
  --vpc-security-group-ids sg-xxx \
  --backup-retention-period 14 \
  --storage-encrypted
```

### 連線字串（推薦：拆給 env）

```bash
DATABASE_URL="postgresql://npt_prod:PASS@npt-prod.xxxxx.ap-northeast-1.rds.amazonaws.com:5432/npt_db_production?schema=public&connection_limit=20&pool_timeout=10"

DATABASE_APPLICATION_NAME=npt-backend-prod
DATABASE_SSL_MODE=verify-full
DATABASE_SSL_CA_PATH=/etc/ssl/rds-combined-ca-bundle.pem
```

或全部寫進 URL（同效果）：

```bash
DATABASE_URL="postgresql://npt_prod:PASS@npt-prod.xxxxx.ap-northeast-1.rds.amazonaws.com:5432/npt_db_production?schema=public&sslmode=verify-full&sslrootcert=/etc/ssl/rds-combined-ca-bundle.pem&application_name=npt-backend-prod&connection_limit=20&pool_timeout=10"
```

### CA bundle

```bash
# 全球共用 bundle（涵蓋 RDS / Aurora 所有 region）
curl -o /etc/ssl/rds-combined-ca-bundle.pem \
  https://truststore.pki.rds.amazonaws.com/global/global-bundle.pem
```

### 已知注意事項

- **Parameter group**：若改 `rds.force_ssl=1` 等設定，要在自訂 parameter group 改（不能改 default.postgres16）
- **PubliclyAccessible**：production 一律關閉；走 VPC peering / VPN 或從 ECS/EKS 同 VPC 連
- **自動備份**：預設 7 天，建議延到 14–30 天

---

## AWS Aurora PostgreSQL

設定與 RDS 幾乎相同，差異：

- **Endpoint 分兩個**：
  - Writer: `my-cluster.cluster-xxxxx.ap-northeast-1.rds.amazonaws.com` → 給 `DATABASE_URL`
  - Reader: `my-cluster.cluster-ro-xxxxx...` → 未來若加讀寫分離時使用
- **CA bundle 共用** RDS 的 `rds-combined-ca-bundle.pem`
- **Aurora Serverless v2**：`max_connections` 隨 ACU 彈性；建議 `connection_limit` 降到 10、搭配 RDS Proxy

### 連線字串

```bash
DATABASE_URL="postgresql://npt_prod:PASS@npt-cluster.cluster-xxxxx.ap-northeast-1.rds.amazonaws.com:5432/npt_db_production?schema=public&connection_limit=20&pool_timeout=10"
DATABASE_SSL_MODE=verify-full
DATABASE_SSL_CA_PATH=/etc/ssl/rds-combined-ca-bundle.pem
```

---

## Google Cloud SQL for PostgreSQL

### 連線字串（直連 + CA）

```bash
DATABASE_URL="postgresql://npt_prod:PASS@34.xxx.xxx.xxx:5432/npt_db_production?schema=public&connection_limit=20&pool_timeout=10"
DATABASE_SSL_MODE=verify-ca
DATABASE_SSL_CA_PATH=/etc/ssl/cloudsql-server-ca.pem
```

CA 下載：Cloud SQL 實例 → Connections → Security → `Download server CA`

### Cloud SQL Auth Proxy（推薦，免 CA）

```bash
# sidecar 或同 Pod 跑
./cloud-sql-proxy PROJECT:REGION:INSTANCE --port 5432

# .env
DATABASE_URL="postgresql://npt_prod:PASS@127.0.0.1:5432/npt_db_production?schema=public&connection_limit=20&pool_timeout=10"
DATABASE_SSL_MODE=disable
```

---

## Azure Database for PostgreSQL

推薦用 **Flexible Server**（新架構，替代 Single Server）。

### 連線字串

```bash
DATABASE_URL="postgresql://npt_prod:PASS@my-pg-flex.postgres.database.azure.com:5432/npt_db_production?schema=public&connection_limit=20&pool_timeout=10"
DATABASE_SSL_MODE=verify-full
DATABASE_SSL_CA_PATH=/etc/ssl/digicert-global-root-ca.pem
```

CA 下載：Azure 使用 DigiCert Global Root CA。

```bash
curl -o /etc/ssl/digicert-global-root-ca.pem \
  https://cacerts.digicert.com/DigiCertGlobalRootCA.crt.pem
```

---

## Supabase / Neon（serverless）

兩者都是 managed serverless Postgres，常用於 POC / early-stage production。

### Supabase

```bash
# Supabase 提供 pooled endpoint 與 direct endpoint
# pooled（PgBouncer，transaction mode）：適合高並發 stateless
# direct：適合長連線、prepared statements（Prisma 強烈建議走 direct）

DATABASE_URL="postgresql://postgres:PASS@db.xxxxx.supabase.co:5432/postgres?schema=public&connection_limit=15&pool_timeout=10"
DATABASE_SSL_MODE=require
```

### Neon

```bash
# Neon endpoint 已含 project id；支援 branch（每個分支是獨立 database）
DATABASE_URL="postgresql://npt_prod:PASS@ep-cool-bird-xxxxx.ap-southeast-1.aws.neon.tech/npt_db_production?schema=public&connection_limit=10&pool_timeout=10&sslmode=require"
# 或拆成 env
DATABASE_SSL_MODE=require
```

### 限制

- **connection_limit 要低**：Neon 免費層上限 ~10，付費層 ~100；Supabase direct ~60，pooled ~200
- **冷啟動**：Neon compute auto-suspend 後首次查詢 1–3 秒延遲；production 建議 `Autoscaling` + `min suspend` 設長
- **PgBouncer transaction mode 限制**：不支援 prepared statements，**Prisma 建議走 direct endpoint**

---

## SSL 與 CA bundle

### 優先序

1. `DATABASE_SSL_MODE` 有設 → 把 `sslmode=...` 寫進 URL（會覆寫 URL 內既有的 `sslmode`）
2. `DATABASE_SSL_MODE` 未設 → 沿用 `DATABASE_URL` 內的 `sslmode=`（若有）
3. `verify-ca` / `verify-full` 必須提供 `DATABASE_SSL_CA` 或 `DATABASE_SSL_CA_PATH`，否則啟動時 throw

### 兩種 CA 注入方式

| 情境                             | 建議選項                                       |
| -------------------------------- | ---------------------------------------------- |
| 傳統 VM / bare metal，檔案可預放 | `DATABASE_SSL_CA_PATH`                         |
| K8s Secret / Vault 動態注入      | `DATABASE_SSL_CA`（PEM 字串塞進 env）          |
| Serverless（Lambda / Cloud Run） | `DATABASE_SSL_CA`（layer / build-time inject） |

### 同時設的行為

二者同時存在時，**優先用 `DATABASE_SSL_CA`**（inline 字串會被寫入 OS tempdir，再以 `sslrootcert=<tempfile>` 傳給 Prisma）。

---

## 連線池與 RDS Proxy / PgBouncer

### 連線池（Prisma 內建）

`DATABASE_URL` 的 `?connection_limit=20` 對 RDS `db.t4g.medium`（~200 max_connections）合適。若多 replica 部署：

```
replicas × connection_limit ≤ DB max_connections × 0.8
例: 4 replica × 20 = 80 ≤ 200 × 0.8 = 160 ✓
```

### RDS Proxy（AWS）

有助於 Lambda / 多小實例場景。連線字串改成 proxy endpoint：

```bash
DATABASE_URL="postgresql://npt_prod:PASS@npt-proxy.proxy-xxxxx.ap-northeast-1.rds.amazonaws.com:5432/npt_db_production?schema=public&sslmode=verify-full"
```

### PgBouncer（自管）

推薦 **session pooling** 模式（`pool_mode = session`）。Prisma 與 transaction mode 不相容（依賴 prepared statements）。

---

## 相關文檔

- [環境變數配置指南](./ENVIRONMENT_VARIABLES.md) — 所有 env key
- [Docker Setup](../getting-started/DOCKER_SETUP.md) — 本機開發環境
