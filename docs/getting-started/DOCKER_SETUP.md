# Docker 設置與安全指南

完整的 Docker 服務配置、安全最佳實踐與故障排除指南。

---

## 目錄

- [Docker 設置與安全指南](#docker-設置與安全指南)
  - [目錄](#目錄)
  - [概述](#概述)
    - [服務列表](#服務列表)
  - [快速開始](#快速開始)
    - [使用 NPT CLI（推薦）](#使用-npt-cli推薦)
    - [手動啟動](#手動啟動)
  - [服務說明](#服務說明)
    - [1. TimescaleDB (PostgreSQL)](#1-timescaledb-postgresql)
    - [2. RabbitMQ](#2-rabbitmq)
    - [3. Dragonfly (Redis)](#3-dragonfly-redis)
    - [4. Mailpit](#4-mailpit)
    - [5. SeaweedFS（選用）](#5-seaweedfs選用)
  - [環境變數配置](#環境變數配置)
    - [.env.docker 檔案結構](#envdocker-檔案結構)
    - [重要事項](#重要事項)
  - [安全最佳實踐](#安全最佳實踐)
    - [1. 使用強密碼](#1-使用強密碼)
    - [2. 密碼同步](#2-密碼同步)
    - [3. 環境隔離](#3-環境隔離)
    - [4. 容器安全](#4-容器安全)
  - [常用操作](#常用操作)
    - [啟動與停止](#啟動與停止)
    - [查看狀態](#查看狀態)
    - [查看日誌](#查看日誌)
    - [重啟服務](#重啟服務)
    - [進入容器](#進入容器)
  - [故障排除](#故障排除)
    - [問題 1：容器無法啟動](#問題-1容器無法啟動)
    - [問題 2：資料庫連線失敗](#問題-2資料庫連線失敗)
    - [問題 3：RabbitMQ 管理介面無法訪問](#問題-3rabbitmq-管理介面無法訪問)
    - [問題 4：Dragonfly 記憶體不足](#問題-4dragonfly-記憶體不足)
  - [相關資源](#相關資源)

---

## 概述

本專案使用 Docker Compose 管理開發環境所需的服務，包括資料庫、訊息佇列、快取和郵件測試服務。所有服務都經過優化配置，提供穩定的開發體驗。

### 服務列表

**核心服務**（預設啟動）：

- **TimescaleDB (PostgreSQL)** - 主資料庫，支援時序資料優化
- **RabbitMQ** - 訊息佇列，用於異步任務處理
- **Dragonfly (Redis)** - 快取和 Session 儲存
- **Mailpit** - 郵件測試服務，捕獲開發環境郵件

**選用服務**（需手動啟動）：

- **SeaweedFS** - 分散式檔案系統，提供本地 S3 儲存（包含 Master、Volume、Filer、S3 API 四個組件）

---

## 快速開始

### 使用 NPT CLI（推薦）

```bash
# 一鍵啟動所有服務
./scripts/cli.sh init

# 或單獨啟動 Docker
./scripts/cli.sh init --skip-install --skip-db
```

### 手動啟動

```bash
# 1. 設定環境變數
cp .env.docker.example .env.docker

# 2. 啟動服務
docker-compose --env-file .env.docker up -d

# 3. 檢查狀態
docker-compose ps
```

---

## 服務說明

### 1. TimescaleDB (PostgreSQL)

**用途**: 主資料庫
**Port**: 5432
**Image**: `timescale/timescaledb:latest-pg16`

**特色**:

- PostgreSQL 16 完全相容
- 時序資料優化
- 支援 Hypertables

### 2. RabbitMQ

**用途**: 訊息佇列
**Ports**:

- 5672 (AMQP)
- 15672 (Management UI)

**Image**: `rabbitmq:3.13-management`

**管理介面**: http://localhost:15672
**預設帳號**: 見 .env.docker

### 3. Dragonfly (Redis)

**用途**: 快取和 Session
**Port**: 6379
**Image**: `docker.dragonflydb.io/dragonflydb/dragonfly`

**特色**:

- Redis 完全相容
- 更高效能
- 更低記憶體使用

### 4. Mailpit

**用途**: 郵件測試服務
**Ports**:

- 1025 (SMTP)
- 8025 (Web UI)

**Image**: `axllent/mailpit`

**特色**:

- 捕獲所有開發環境郵件
- Web UI 查看郵件內容
- 支援 API 訪問

### 5. SeaweedFS（選用）

**用途**: 分散式檔案系統，本地 S3 儲存
**Ports**:

- 9333 (Master Server)
- 8080 (Volume Server)
- 8888 (Filer)
- 8333 (S3 API)

**Image**: `chrislusf/seaweedfs`

**啟動方式**:

```bash
# 使用 CLI（推薦）
./scripts/cli.sh storage start

# 或手動啟動
docker-compose --env-file .env.docker --profile storage up -d
```

**特色**:

- S3 API 完全相容
- 無需依賴 AWS 雲端服務
- 高效能分散式儲存
- 支援檔案系統語義

**管理介面**:

- Master UI: http://localhost:9333
- Volume UI: http://localhost:8080
- Filer UI: http://localhost:8888

**詳細文檔**: 參考 [SeaweedFS Storage Guide](../infrastructure/SEAWEEDFS_STORAGE.md)

---

## 環境變數配置

### .env.docker 檔案結構

```bash
# PostgreSQL (TimescaleDB)
POSTGRES_USER=postgres
POSTGRES_PASSWORD=your-strong-password-here  # ⚠️ 請修改
POSTGRES_DB=npt_db

# RabbitMQ
RABBITMQ_DEFAULT_USER=hq
RABBITMQ_DEFAULT_PASS=your-strong-password-here  # ⚠️ 請修改

# Dragonfly (Redis 相容)
DRAGONFLY_PASSWORD=your-strong-password-here  # ⚠️ 請修改

# SeaweedFS（選用服務）
SEAWEEDFS_S3_USER=admin
SEAWEEDFS_S3_PASSWORD=your-strong-password-here  # ⚠️ 請修改
```

### 重要事項

⚠️ **絕對不要**將 `.env.docker` 提交到 Git

```bash
# .gitignore 應包含
.env.docker
```

✅ 提供範本檔案供其他開發者參考：

```bash
# .env.docker.example（可提交）
POSTGRES_USER=postgres
POSTGRES_PASSWORD=CHANGE_THIS_IN_PRODUCTION
POSTGRES_DB=npt_db
```

---

## 安全最佳實踐

### 1. 使用強密碼

```bash
# 生成安全密碼（128 字元）
node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"

# 或使用 OpenSSL
openssl rand -hex 64
```

### 2. 密碼同步

**關鍵**：確保以下檔案中的密碼同步

| 檔案                     | 欄位                | 用途        |
| ------------------------ | ------------------- | ----------- |
| `.env.docker`            | `POSTGRES_PASSWORD` | Docker 容器 |
| `apps/backend/.env`      | `DATABASE_URL`      | NestJS 連線 |
| `packages/database/.env` | `DATABASE_URL`      | Prisma 連線 |

**DATABASE_URL 格式**：

```text
postgresql://postgres:YOUR_PASSWORD@localhost:5432/npt_db
```

### 3. 環境隔離

不同環境使用不同密碼：

```text
.env.docker           # 開發環境
.env.docker.uat   # 測試環境
.env.docker.production# 生產環境
```

### 4. 容器安全

**限制資源使用**

```yaml
services:
  timescaledb:
    deploy:
      resources:
        limits:
          cpus: '2.0'
          memory: 2G
        reservations:
          memory: 512M
```

**使用非 root 用戶**

```yaml
services:
  dragonfly:
    user: '999:999' # 非 root
```

**啟用健康檢查**

```yaml
services:
  rabbitmq:
    healthcheck:
      test: rabbitmq-diagnostics -q ping
      interval: 30s
      timeout: 10s
      retries: 3
```

---

## 常用操作

### 啟動與停止

```bash
# 啟動所有服務
docker-compose --env-file .env.docker up -d

# 停止所有服務
docker-compose down

# 停止並刪除 volumes（⚠️ 會刪除資料）
docker-compose down -v
```

### 查看狀態

```bash
# 使用 NPT CLI（推薦）
./scripts/cli.sh status

# 或直接使用 Docker
docker-compose ps
docker-compose logs -f
```

### 查看日誌

```bash
# 使用 NPT CLI（推薦）
./scripts/cli.sh logs postgres -f
./scripts/cli.sh logs rabbitmq -f
./scripts/cli.sh logs redis -f

# 或直接使用 Docker
docker-compose logs -f timescaledb
docker-compose logs -f rabbitmq
docker-compose logs -f dragonfly
```

### 重啟服務

```bash
# 使用 NPT CLI（推薦）
./scripts/cli.sh restart docker

# 或重啟特定服務
docker-compose restart timescaledb
docker-compose restart rabbitmq
docker-compose restart dragonfly
```

### 進入容器

```bash
# PostgreSQL
docker-compose exec timescaledb psql -U postgres -d npt_db

# RabbitMQ
docker-compose exec rabbitmq rabbitmqctl status

# Dragonfly
docker-compose exec dragonfly redis-cli
```

---

## 故障排除

### 問題 1：容器無法啟動

**檢查清單**：

```bash
# 1. 檢查 port 是否被占用
lsof -i :5432
lsof -i :5672
lsof -i :6379

# 2. 查看錯誤日誌
docker-compose logs timescaledb
docker-compose logs rabbitmq
docker-compose logs dragonfly

# 3. 檢查 .env.docker 是否存在
ls -la .env.docker
```

### 問題 2：資料庫連線失敗

**可能原因**：

- 密碼不同步
- 容器尚未完全啟動

**解決方案**：

```bash
# 1. 等待容器啟動
./scripts/cli.sh status --watch

# 2. 檢查密碼同步
grep DATABASE_URL apps/backend/.env
grep POSTGRES_PASSWORD .env.docker

# 3. 測試連線
docker-compose exec timescaledb psql -U postgres -d npt_db -c "SELECT 1"
```

### 問題 3：RabbitMQ 管理介面無法訪問

**解決方案**：

```bash
# 1. 檢查容器狀態
docker-compose ps rabbitmq

# 2. 檢查 port mapping
docker-compose port rabbitmq 15672

# 3. 檢查防火牆
# 確保 port 15672 開放
```

### 問題 4：Dragonfly 記憶體不足

**解決方案**：

```yaml
# 調整 docker-compose.yml
services:
  dragonfly:
    command:
      - --maxmemory=2gb
      - --proactor_threads=4
```

---

## 相關資源

- [CLI Guide](./CLI_GUIDE.md) - CLI 工具使用指南
- [Monorepo Structure](./MONOREPO_STRUCTURE.md) - 專案結構說明
- [Environment Variables](../infrastructure/ENVIRONMENT_VARIABLES.md) - 完整環境變數指南
- [RabbitMQ & Dragonfly](../infrastructure/RABBITMQ_DRAGONFLY.md) - 詳細配置
