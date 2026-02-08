# 環境變數配置指南

本指南說明如何正確配置 Wind 專案的環境變數。

---

## 📋 目錄

- [環境變數配置指南](#環境變數配置指南)
  - [📋 目錄](#-目錄)
  - [📖 概述](#-概述)
  - [📋 專案結構](#-專案結構)
  - [🚀 快速設置](#-快速設置)
    - [1️⃣ Docker 服務](#1️⃣-docker-服務)
    - [2️⃣ Backend](#2️⃣-backend)
    - [3️⃣ Frontend](#3️⃣-frontend)
  - [🔐 環境變數詳解](#-環境變數詳解)
    - [Docker (.env.docker)](#docker-envdocker)
    - [Backend (.env)](#backend-env)
      - [核心配置](#核心配置)
      - [快取與訊息佇列](#快取與訊息佇列)
      - [Email 配置](#email-配置)
      - [其他配置](#其他配置)
    - [Frontend (.env)](#frontend-env)
      - [GraphQL API 配置](#graphql-api-配置)
      - [Apollo Client 配置](#apollo-client-配置)
      - [應用程式配置](#應用程式配置)
      - [功能開關](#功能開關)
      - [錯誤追蹤配置 (Sentry)](#錯誤追蹤配置-sentry)
      - [配置驗證](#配置驗證)
  - [🔒 密碼同步](#-密碼同步)
    - [PostgreSQL 密碼](#postgresql-密碼)
    - [RabbitMQ 密碼](#rabbitmq-密碼)
  - [🎯 不同環境配置](#-不同環境配置)
    - [開發環境 (Development)](#開發環境-development)
    - [生產環境 (Production)](#生產環境-production)
  - [🛡️ 安全最佳實踐](#️-安全最佳實踐)
    - [1. JWT Secret 生成](#1-jwt-secret-生成)
    - [2. 系統服務密碼強度要求](#2-系統服務密碼強度要求)
    - [3. 不要做的事 ❌](#3-不要做的事-)
    - [4. 應該做的事 ✅](#4-應該做的事-)
  - [🔍 驗證配置](#-驗證配置)
    - [檢查 Docker 服務](#檢查-docker-服務)
    - [檢查 Backend](#檢查-backend)
    - [檢查 Frontend](#檢查-frontend)
  - [🆘 疑難排解](#-疑難排解)
    - [問題 1: Backend 無法連接資料庫](#問題-1-backend-無法連接資料庫)
    - [問題 2: JWT 認證失敗](#問題-2-jwt-認證失敗)
    - [問題 3: CORS 錯誤](#問題-3-cors-錯誤)
    - [問題 4: 環境變數未載入](#問題-4-環境變數未載入)
    - [問題 5: Apollo Client 配置警告](#問題-5-apollo-client-配置警告)
    - [問題 6: Sentry 未收到錯誤](#問題-6-sentry-未收到錯誤)
    - [問題 7: GraphQL 端點連線失敗](#問題-7-graphql-端點連線失敗)
  - [📚 環境變數載入順序](#-環境變數載入順序)
    - [Next.js (Frontend)](#nextjs-frontend)
    - [NestJS (Backend)](#nestjs-backend)
  - [📖 相關文檔](#-相關文檔)
  - [✅ 設置檢查清單](#-設置檢查清單)
    - [初始設置](#初始設置)
    - [生產部署前](#生產部署前)

---

## 📖 概述

Wind 專案使用三層環境變數架構，分別管理 Docker 服務、Backend 應用和 Frontend 應用的配置。本指南將協助你正確設置和管理這些環境變數，確保開發和生產環境的安全性與一致性。

**核心概念**：

- 🐳 **Docker 層** - 管理容器服務（PostgreSQL、RabbitMQ、Dragonfly、Mailpit）
- 🔧 **Backend 層** - NestJS 應用配置（API、資料庫連接、JWT、Email）
- 🎨 **Frontend 層** - Next.js 應用配置（API 端點、公開變數）
- 🔐 **安全機制** - 密碼同步、JWT Secret 生成、敏感資料保護

---

## 📋 專案結構

Wind 專案有三個層級的環境變數：

```text
wind/
├── .env.docker              # Docker 服務（PostgreSQL, RabbitMQ, Redis）
├── .env.docker.example      # Docker 範本 ✅
├── apps/
│   ├── backend/
│   │   ├── .env             # Backend 開發環境變數 ❌ 不提交
│   │   ├── .env.example     # Backend 範本 ✅
│   │   └── .env.production.example  # Backend 生產範本 ✅
│   └── frontend/
│       ├── .env             # Frontend 開發環境變數 ❌ 不提交
│       ├── .env.example     # Frontend 範本 ✅
│       └── .env.production.example  # Frontend 生產範本 ✅
```

**圖例**：

- ❌ = 不提交到 Git（包含實際密碼）
- ✅ = 可提交到 Git（範本，無實際密碼）

---

## 🚀 快速設置

### 1️⃣ Docker 服務

```bash
# 複製範本
cp .env.docker.example .env.docker

# 編輯密碼（建議使用強密碼）
vim .env.docker

# 啟動 Docker 服務
docker-compose --env-file .env.docker up -d
```

### 2️⃣ Backend

```bash
cd apps/backend

# 複製範本
cp .env.example .env

# 編輯配置
vim .env

# 重要：確保密碼與 .env.docker 一致
# - DATABASE_URL 中的密碼 = .env.docker 的 POSTGRES_PASSWORD
# - RABBITMQ_URL 中的密碼 = .env.docker 的 RABBITMQ_DEFAULT_PASS

# 啟動開發服務器
pnpm dev
```

### 3️⃣ Frontend

```bash
cd apps/frontend

# 複製範本
cp .env.example .env

# 編輯配置（通常預設值就可以）
vim .env

# 啟動開發服務器
pnpm dev
```

---

## 🔐 環境變數詳解

### Docker (.env.docker)

| 變數                    | 說明              | 範例                | 必填 |
| ----------------------- | ----------------- | ------------------- | ---- |
| `POSTGRES_PASSWORD`     | PostgreSQL 密碼   | `dev_postgres_2024` | ✅   |
| `RABBITMQ_DEFAULT_PASS` | RabbitMQ 密碼     | `dev_rabbitmq_2024` | ✅   |
| `POSTGRES_USER`         | PostgreSQL 使用者 | `postgres`          | ❌   |
| `POSTGRES_DB`           | 資料庫名稱        | `wind_db`           | ❌   |

### Backend (.env)

#### 核心配置

| 變數                     | 說明                                    | 範例                        | 必填 |
| ------------------------ | --------------------------------------- | --------------------------- | ---- |
| `PORT`                   | 後端服務端口                            | `4000`                      | ✅   |
| `NODE_ENV`               | 運行環境                                | `development/production`    | ✅   |
| `DATABASE_URL`           | PostgreSQL 連線字串                     | `postgresql://...`          | ✅   |
| `JWT_SECRET`             | JWT 密鑰（至少 64 字元）                | 使用 `openssl rand -hex 64` | ✅   |
| `JWT_REFRESH_SECRET`     | Refresh Token 密鑰（不同於 JWT_SECRET） | 使用 `openssl rand -hex 64` | ✅   |
| `JWT_EXPIRES_IN`         | Access Token 過期時間                   | `15m`                       | ✅   |
| `JWT_REFRESH_EXPIRES_IN` | Refresh Token 過期時間                  | `7d` (生產) / `30d` (開發)  | ✅   |
| `ENCRYPTION_KEY`         | 資料加密密鑰（64 字元 hex）             | 使用 `openssl rand -hex 32` | ✅   |
| `CORS_ORIGIN`            | CORS 允許的來源                         | `http://localhost:3000`     | ✅   |

> **⚠️ 注意**：`ACCESS_TOKEN_EXPIRES_IN` 已從環境變數改為硬編碼（固定 30 分鐘），無需配置。

#### 快取與訊息佇列

| 變數           | 說明                 | 範例                                   | 必填 |
| -------------- | -------------------- | -------------------------------------- | ---- |
| `REDIS_HOST`   | Redis/Dragonfly 主機 | `localhost`                            | ✅   |
| `REDIS_PORT`   | Redis/Dragonfly 端口 | `6379`                                 | ✅   |
| `RABBITMQ_URL` | RabbitMQ 連線字串    | `amqp://admin:password@localhost:5672` | ✅   |

> **📌 說明**：專案使用 Dragonfly（Redis 協議相容）作為快取和 PubSub。開發環境使用 Memory PubSub，生產環境自動切換為 Distributed PubSub。

#### Email 配置

| 變數             | 說明            | 範例                           | 必填 |
| ---------------- | --------------- | ------------------------------ | ---- |
| `MAIL_HOST`      | SMTP 主機       | `smtp.ethereal.email`          | ✅   |
| `MAIL_PORT`      | SMTP 端口       | `587`                          | ✅   |
| `MAIL_USER`      | SMTP 使用者名稱 | `your-email@ethereal.email`    | ✅   |
| `MAIL_PASSWORD`  | SMTP 密碼       | `your-password`                | ✅   |
| `MAIL_FROM`      | 寄件者郵箱      | `noreply@localhost`            | ✅   |
| `MAIL_FROM_NAME` | 寄件者名稱      | `Wind (Local)`                 | ❌   |
| `MAIL_SECURE`    | 啟用 TLS/SSL    | `false` (開發) / `true` (生產) | ❌   |

#### 其他配置

| 變數                               | 說明                   | 預設值                                 | 必填 |
| ---------------------------------- | ---------------------- | -------------------------------------- | ---- |
| `PASSWORD_RESET_EXPIRE_MINUTES`    | 密碼重設連結有效時間   | `60`                                   | ❌   |
| `PASSWORD_RESET_URL`               | 密碼重設頁面 URL       | `http://localhost:3000/reset-password` | ❌   |
| `GRAPHQL_MAX_COMPLEXITY`           | GraphQL 查詢複雜度上限 | `1000`                                 | ❌   |
| `GRAPHQL_COMPLEXITY_LOG_THRESHOLD` | 記錄高複雜度查詢閾值   | `500`                                  | ❌   |
| `ENABLE_FILE_LOGGING`              | 啟用檔案日誌           | `false` (開發) / `true` (生產)         | ❌   |
| `LOG_DIR`                          | 日誌目錄               | `./logs`                               | ❌   |
| `LOG_MAX_SIZE`                     | 單個日誌檔案最大大小   | `20m`                                  | ❌   |
| `LOG_MAX_FILES`                    | 日誌保留天數           | `14d`                                  | ❌   |

### Frontend (.env)

Frontend 使用 Next.js 框架,所有環境變數都使用 `NEXT_PUBLIC_` 前綴以便在客戶端可用。共有 **14 個環境變數**,涵蓋 API 配置、Apollo Client、功能開關和錯誤追蹤。

#### GraphQL API 配置

| 變數                              | 說明                                   | 範例                            | 必填 |
| --------------------------------- | -------------------------------------- | ------------------------------- | ---- |
| `NEXT_PUBLIC_GRAPHQL_ENDPOINT`    | GraphQL HTTP 端點 URL                  | `http://localhost:4000/graphql` | ✅   |
| `NEXT_PUBLIC_GRAPHQL_WS_ENDPOINT` | GraphQL WebSocket 端點 (Subscriptions) | `ws://localhost:4000/graphql`   | ❌   |

#### Apollo Client 配置

| 變數                                     | 說明                | 預設值  | 範圍        | 必填 |
| ---------------------------------------- | ------------------- | ------- | ----------- | ---- |
| `NEXT_PUBLIC_APOLLO_TIMEOUT`             | 請求超時時間 (毫秒) | `30000` | 5000-300000 | ❌   |
| `NEXT_PUBLIC_APOLLO_MAX_RETRIES`         | 最大重試次數        | `3`     | 0-10        | ❌   |
| `NEXT_PUBLIC_APOLLO_RETRY_INITIAL_DELAY` | 首次重試延遲 (毫秒) | `300`   | 100-60000   | ❌   |
| `NEXT_PUBLIC_APOLLO_RETRY_MAX_DELAY`     | 最大重試延遲 (毫秒) | `10000` | 100-60000   | ❌   |

**說明**：

- 使用指數退避策略重試
- 不會重試認證錯誤 (UNAUTHENTICATED)、授權錯誤 (FORBIDDEN)、驗證錯誤 (BAD_USER_INPUT)
- 超出範圍的值會自動調整並記錄警告

**重試間隔範例**：`300ms` → `600ms` → `1200ms` → ...

#### 應用程式配置

| 變數                   | 說明             | 範例                    | 必填 |
| ---------------------- | ---------------- | ----------------------- | ---- |
| `NEXT_PUBLIC_APP_NAME` | 應用程式顯示名稱 | `Wind` / `Wind (Dev)`   | ❌   |
| `NEXT_PUBLIC_APP_URL`  | 應用程式基礎 URL | `http://localhost:3000` | ❌   |

#### 功能開關

| 變數                           | 說明                    | 預設值  | 必填 |
| ------------------------------ | ----------------------- | ------- | ---- |
| `NEXT_PUBLIC_ENABLE_2FA`       | 啟用/停用雙因素認證功能 | `true`  | ❌   |
| `NEXT_PUBLIC_ENABLE_ANALYTICS` | 啟用/停用分析追蹤功能   | `false` | ❌   |

#### 錯誤追蹤配置 (Sentry)

| 變數                      | 說明                                 | 範例                                    | 必填 |
| ------------------------- | ------------------------------------ | --------------------------------------- | ---- |
| `NEXT_PUBLIC_SENTRY_DSN`  | Sentry 錯誤追蹤服務 DSN              | `https://xxx@o123.ingest.sentry.io/456` | ❌   |
| `NEXT_PUBLIC_APP_VERSION` | 應用程式版本號 (Semantic Versioning) | `1.2.3`                                 | ❌   |
| `NEXT_PUBLIC_BUILD_ID`    | 建構 ID (通常由 CI/CD 生成)          | `build-2024-01-15-001`                  | ❌   |
| `NEXT_PUBLIC_COMMIT_SHA`  | Git Commit SHA (CI/CD 生成)          | `a1b2c3d4e5f6`                          | ❌   |

**說明**：

- 留空 `NEXT_PUBLIC_SENTRY_DSN` 則不啟用 Sentry
- 建議 UAT 和 Production 使用不同的 Sentry 專案
- 從 https://sentry.io 取得 DSN

#### 配置驗證

所有配置值會在應用啟動時自動驗證:

```bash
# Timeout 驗證
NEXT_PUBLIC_APOLLO_TIMEOUT=100  # 太低,自動調整為 5000ms

# Max Retries 驗證
NEXT_PUBLIC_APOLLO_MAX_RETRIES=100  # 太高,自動調整為 10
```

開發環境啟動時會顯示配置資訊:

```text
[Apollo Config] Initialized with: {
  timeout: '30000ms',
  maxRetries: 3,
  initialDelay: '300ms',
  maxDelay: '10000ms'
}
```

---

## 🔒 密碼同步

**重要**：以下密碼必須保持一致！

### PostgreSQL 密碼

```bash
# .env.docker
POSTGRES_PASSWORD=dev_postgres_2024

# apps/backend/.env
DATABASE_URL="postgresql://postgres:dev_postgres_2024@localhost:5432/wind_db"
                                    ^^^^^^^^^^^^^^^^^^
```

### RabbitMQ 密碼

```bash
# .env.docker
RABBITMQ_DEFAULT_PASS=dev_rabbitmq_2024

# apps/backend/.env
RABBITMQ_URL=amqp://admin:dev_rabbitmq_2024@localhost:5672
                          ^^^^^^^^^^^^^^^^^^^
```

---

## 🎯 不同環境配置

### 開發環境 (Development)

**Docker**: 使用 `.env.docker`

```bash
docker-compose --env-file .env.docker up -d
```

**Backend**: 使用 `.env`

```bash
NODE_ENV=development pnpm dev
```

**Frontend**: 使用 `.env`

```bash
# .env (開發環境完整配置)
NEXT_PUBLIC_GRAPHQL_ENDPOINT=http://localhost:4000/graphql
NEXT_PUBLIC_GRAPHQL_WS_ENDPOINT=ws://localhost:4000/graphql
NEXT_PUBLIC_APOLLO_TIMEOUT=30000
NEXT_PUBLIC_APOLLO_MAX_RETRIES=3
NEXT_PUBLIC_APOLLO_RETRY_INITIAL_DELAY=300
NEXT_PUBLIC_APOLLO_RETRY_MAX_DELAY=10000
NEXT_PUBLIC_APP_NAME=Wind (Local)
NEXT_PUBLIC_APP_URL=http://localhost:3000
NEXT_PUBLIC_ENABLE_2FA=true
NEXT_PUBLIC_ENABLE_ANALYTICS=false
NEXT_PUBLIC_SENTRY_DSN=
NEXT_PUBLIC_APP_VERSION=0.1.0
NEXT_PUBLIC_BUILD_ID=
NEXT_PUBLIC_COMMIT_SHA=

pnpm dev
```

### 生產環境 (Production)

**Docker**: 使用 `.env.docker.production`（需自行創建）

```bash
cp .env.docker.example .env.docker.production
vim .env.docker.production  # 填入強密碼
docker-compose --env-file .env.docker.production up -d
```

**Backend**: 使用 `.env.production`

```bash
cp .env.production.example .env.production
vim .env.production  # 填入強密碼和生產配置
NODE_ENV=production pnpm start
```

**Frontend**: 使用 `.env.production`

```bash
cp .env.production.example .env.production
vim .env.production  # 填入生產配置

# .env.production (生產環境完整配置)
NEXT_PUBLIC_GRAPHQL_ENDPOINT=https://api.yourapp.com/graphql
NEXT_PUBLIC_GRAPHQL_WS_ENDPOINT=wss://api.yourapp.com/graphql
NEXT_PUBLIC_APOLLO_TIMEOUT=60000           # 生產環境使用較長超時
NEXT_PUBLIC_APOLLO_MAX_RETRIES=5           # 更多重試次數
NEXT_PUBLIC_APOLLO_RETRY_INITIAL_DELAY=300
NEXT_PUBLIC_APOLLO_RETRY_MAX_DELAY=15000   # 允許更長延遲
NEXT_PUBLIC_APP_NAME=Wind
NEXT_PUBLIC_APP_URL=https://yourapp.com
NEXT_PUBLIC_ENABLE_2FA=true
NEXT_PUBLIC_ENABLE_ANALYTICS=true          # 生產必須啟用
NEXT_PUBLIC_SENTRY_DSN=your-prod-dsn       # 生產必須啟用
NEXT_PUBLIC_APP_VERSION=1.2.3
NEXT_PUBLIC_BUILD_ID=$(date +%Y%m%d%H%M%S)
NEXT_PUBLIC_COMMIT_SHA=$(git rev-parse --short HEAD)

pnpm build
pnpm start
```

---

## 🛡️ 安全最佳實踐

### 1. JWT Secret 生成

Backend 的 JWT_SECRET **必須**使用強隨機字串：

```bash
# 生成 128 字元隨機 hex 字串
node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"

# 或使用 OpenSSL
openssl rand -hex 64
```

範例輸出：

```text
e5df40356b0d79d63104836480a465b411207d95e966a429558c9f28d807b74e
```

### 2. 系統服務密碼強度要求

**適用於**：基礎設施服務密碼（PostgreSQL, RabbitMQ, JWT Secret 等）

| 環境     | 最低長度 | 要求                 |
| -------- | -------- | -------------------- |
| **開發** | 12 字元  | 大小寫 + 數字        |
| **測試** | 16 字元  | 大小寫 + 數字 + 符號 |
| **生產** | 32 字元  | 大小寫 + 數字 + 符號 |

> **注意**：這些是系統配置密碼，由 DevOps 設定，用於服務之間的連線。
>
> **用戶帳號密碼規則**不同，請參考 [註冊文檔](../authentication/REGISTRATION.md#-密碼要求)（8+ 字元，大小寫 + 數字 + 符號）。

### 3. 不要做的事 ❌

- ❌ 將包含實際密碼的 `.env` 檔案提交到 Git
- ❌ 在 Slack/Email/文件中分享密碼
- ❌ 所有環境使用相同的密碼
- ❌ 使用 "password", "admin" 等弱密碼
- ❌ 在 `NEXT_PUBLIC_` 變數中放敏感資訊

### 4. 應該做的事 ✅

- ✅ 使用密碼生成器
- ✅ 開發和生產環境使用不同密碼
- ✅ 定期更換密碼（建議每 90 天）
- ✅ 使用密碼管理工具（1Password, Bitwarden）
- ✅ 生產環境使用 Secret Manager（AWS Secrets Manager, Vault）

---

## 🔍 驗證配置

### 檢查 Docker 服務

```bash
# 驗證環境變數載入
docker-compose --env-file .env.docker config

# 檢查服務狀態
docker-compose ps

# 應該看到所有服務都是 Up (healthy)
```

### 檢查 Backend

```bash
cd apps/backend

# 檢查環境變數
cat .env | grep -E "(DATABASE_URL|JWT_SECRET|RABBITMQ_URL)"

# 測試連線
pnpm dev
# 應該成功連接到資料庫和其他服務
```

### 檢查 Frontend

```bash
cd apps/frontend

# 檢查環境變數
cat .env

# 測試連線
pnpm dev
# 開啟 http://localhost:3000 應該能看到頁面
```

---

## 🆘 疑難排解

### 問題 1: Backend 無法連接資料庫

**症狀**：

```text
Error: connect ECONNREFUSED 127.0.0.1:5432
```

**檢查**：

1. Docker 服務是否運行？

   ```bash
   docker-compose ps
   ```

2. 密碼是否一致？

   ```bash
   # 檢查 .env.docker
   grep POSTGRES_PASSWORD .env.docker

   # 檢查 apps/backend/.env
   grep DATABASE_URL apps/backend/.env
   ```

3. 端口是否被佔用？

   ```bash
   lsof -i :5432
   ```

### 問題 2: JWT 認證失敗

**症狀**：

```text
Error: Invalid token
```

**解決**：

1. 確認 JWT_SECRET 已設置且夠長（至少 64 字元）
2. 重新生成 JWT_SECRET
3. 清除舊的 token（需要使用者重新登入）

### 問題 3: CORS 錯誤

**症狀**：

```text
Access-Control-Allow-Origin error
```

**解決**：
檢查 Backend `.env` 中的 `CORS_ORIGIN` 是否包含 Frontend URL：

```bash
# apps/backend/.env
CORS_ORIGIN=http://localhost:3000
```

### 問題 4: 環境變數未載入

**Next.js 特別注意**：

- 修改 `.env` 後需要**重新啟動**開發伺服器
- `NEXT_PUBLIC_` 前綴的變數會暴露給瀏覽器
- 伺服器端變數不需要 `NEXT_PUBLIC_` 前綴

**解決步驟**：

```bash
# 1. 確認變數名稱有 NEXT_PUBLIC_ 前綴
NEXT_PUBLIC_APOLLO_TIMEOUT=30000  # ✅ 正確

# 2. 重啟開發服務器
pnpm dev

# 3. 清除 Next.js 快取
rm -rf .next
pnpm dev
```

### 問題 5: Apollo Client 配置警告

**症狀**：Console 顯示配置調整警告

```text
[Apollo Config] Timeout 100ms is too low, using minimum: 5000ms
```

**解決**：檢查並修正 `.env` 中的值,使用合理範圍

```bash
NEXT_PUBLIC_APOLLO_TIMEOUT=30000     # 5000-300000
NEXT_PUBLIC_APOLLO_MAX_RETRIES=3     # 0-10
```

### 問題 6: Sentry 未收到錯誤

**症狀**：生產環境錯誤未上報到 Sentry

**檢查清單**：

1. ✅ 確認 `NEXT_PUBLIC_SENTRY_DSN` 已設定且格式正確
2. ✅ 檢查 Sentry 專案設定
3. ✅ 測試環境手動觸發錯誤

```typescript
// 測試 Sentry
throw new Error('Test Sentry Integration');
```

### 問題 7: GraphQL 端點連線失敗

**症狀**：所有 GraphQL 請求都失敗

**檢查清單**：

1. ✅ 確認 `NEXT_PUBLIC_GRAPHQL_ENDPOINT` 正確
2. ✅ 確認後端服務運行中
3. ✅ 檢查網路連線和 CORS 設定

```bash
# 測試端點是否可訪問
curl http://localhost:4000/graphql
```

---

## 📚 環境變數載入順序

### Next.js (Frontend)

優先級從高到低：

1. `.env.production` (生產)
2. `.env.development` (環境專用)
3. `.env` (基礎配置，Git 忽略)

### NestJS (Backend)

使用 `@nestjs/config` 載入：

1. `.env.production` (NODE_ENV=production)
2. `.env.development` (NODE_ENV=development)
3. `.env` (預設)

---

## 📖 相關文檔

**專案文檔**：

- [Docker Setup](../getting-started/DOCKER_SETUP.md) - Docker 配置與安全指南
- [CLI Guide](../getting-started/CLI_GUIDE.md) - CLI 使用完整說明
- [Error Handling Guide](../frontend/ERROR_HANDLING_GUIDE.md) - 完整錯誤處理指南
- [Apollo Configuration](../frontend/APOLLO_CONFIGURATION.md) - Apollo Client 配置
- [Apollo Configuration Examples](../frontend/APOLLO_CONFIGURATION_EXAMPLES.md) - 代碼範例

**外部文檔**：

- [Next.js 環境變數](https://nextjs.org/docs/app/building-your-application/configuring/environment-variables)
- [NestJS Configuration](https://docs.nestjs.com/techniques/configuration)
- [12-Factor App: Config](https://12factor.net/config)
- [Sentry Documentation](https://docs.sentry.io/)

---

## ✅ 設置檢查清單

### 初始設置

- [ ] 已複製 `.env.docker.example` 為 `.env.docker`
- [ ] 已複製 `apps/backend/.env.example` 為 `apps/backend/.env`
- [ ] 已複製 `apps/frontend/.env.example` 為 `apps/frontend/.env`
- [ ] 已生成新的 JWT_SECRET
- [ ] 所有密碼都已修改（不使用預設密碼）
- [ ] Docker 服務啟動成功
- [ ] Backend 服務啟動成功
- [ ] Frontend 服務啟動成功

### 生產部署前

- [ ] 已創建生產環境的 `.env` 檔案
- [ ] 所有密碼都是強密碼（32+ 字元）
- [ ] JWT_SECRET 已重新生成
- [ ] DATABASE_URL 使用 SSL 連線
- [ ] RabbitMQ 使用 TLS (amqps://)
- [ ] Email 使用生產級服務
- [ ] CORS_ORIGIN 限制為實際域名
- [ ] 已設定監控和日誌服務
- [ ] 所有 `.env` 檔案已加入 `.gitignore`
