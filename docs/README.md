# Starter 專案文檔

歡迎來到 Starter Monorepo 專案文檔！本文檔已依主題分類，方便快速查找。

---

## 🎯 快速導航

### 我是新手，從哪裡開始？

1. **專案概覽** → 返回 [根目錄 README](../README.md)
2. **開發工具** → [Starter CLI 完整指南](getting-started/CLI_GUIDE.md)
3. **環境設置** → [Docker 設置指南](getting-started/DOCKER_SETUP.md)
4. **專案結構** → [Monorepo 結構說明](getting-started/MONOREPO_STRUCTURE.md)

---

## 📚 文檔分類目錄

### 🚀 [入門指南](getting-started/) (4 docs)

新手必讀！從環境設置到專案結構的完整指引。

| 文檔                                                         | 說明                                                   | 閱讀時間 |
| ------------------------------------------------------------ | ------------------------------------------------------ | -------- |
| [Starter CLI 完整指南](getting-started/CLI_GUIDE.md)         | 開發者 CLI 工具（快速上手+命令參考+架構）              | 15 分鐘  |
| [Docker 設置指南](getting-started/DOCKER_SETUP.md)           | Docker 服務設置與安全最佳實踐                          | 10 分鐘  |
| [Monorepo 結構說明](getting-started/MONOREPO_STRUCTURE.md)   | pnpm workspace + Turborepo 架構                        | 8 分鐘   |
| [前後端 i18n 協調機制](getting-started/I18N_COORDINATION.md) | 前端（next-intl）與後端（nestjs-i18n）如何協調語言設定 | 8 分鐘   |

---

### 🎨 [前端開發](frontend/) (5 docs)

Next.js + React + Apollo Client 前端開發指南。

| 文檔                                             | 說明                                            | 閱讀時間 |
| ------------------------------------------------ | ----------------------------------------------- | -------- |
| [組件設計指南](frontend/DESIGN_GUIDE.md)         | **給 UI/UX 設計師** - 設計規範和視覺標準        | 20 分鐘  |
| [組件庫開發指南](frontend/COMPONENT_LIBRARY.md)  | **給開發者** - Atomic Design 組件庫與 Storybook | 15 分鐘  |
| [前端認證整合](frontend/FRONTEND_INTEGRATION.md) | Next.js + Apollo Client 認證系統                | 20 分鐘  |
| [i18n 設置指南](frontend/I18N_SETUP.md)          | next-intl 多語系配置與使用                      | 12 分鐘  |
| [MSW 設置](frontend/MSW_SETUP.md)                | Mock Service Worker API 模擬                    | 10 分鐘  |

---

### 🔧 [後端開發](backend/) (8 docs)

NestJS + GraphQL + Prisma 後端開發指南。

| 文檔                                                   | 說明                            | 閱讀時間 |
| ------------------------------------------------------ | ------------------------------- | -------- |
| [API 回應格式規範](backend/API_RESPONSE_FORMAT.md)     | BaseResponse 統一格式與錯誤處理 | 10 分鐘  |
| [分頁實現指南](backend/PAGINATION_GUIDE.md)            | Offset-based 分頁完整實現       | 12 分鐘  |
| [GraphQL 最佳實踐](backend/GRAPHQL_BEST_PRACTICES.md)  | Schema 設計、Query 優化、安全性 | 15 分鐘  |
| [Email 服務配置](backend/EMAIL_CONFIGURATION.md)       | SMTP 配置與多語系 Email 模板    | 10 分鐘  |
| [i18n 設置指南](backend/I18N_SETUP.md)                 | nestjs-i18n 多語系配置與使用    | 10 分鐘  |
| [快取策略指南](backend/CACHING_STRATEGY.md)            | Dragonfly 快取系統使用          | 12 分鐘  |
| [Request ID 追蹤系統](backend/REQUEST_ID_SYSTEM.md)    | UUID v7 請求追蹤與日誌整合      | 10 分鐘  |
| [稽核日誌系統](backend/AUDIT_LOG_SYSTEM.md)            | 自動化審計追蹤與效能監控        | 15 分鐘  |
| [GraphQL Subscriptions](backend/SUBSCRIPTION_GUIDE.md) | ⚠️ 未實現 - 規劃文檔            | 10 分鐘  |

---

### 🔐 [認證與授權](authentication/) (7 docs)

完整的認證、授權與安全機制。

| 文檔                                                  | 說明                     | 閱讀時間 |
| ----------------------------------------------------- | ------------------------ | -------- |
| [RBAC 架構](authentication/RBAC_ARCHITECTURE.md)      | 角色權限控制系統         | 20 分鐘  |
| [列級別安全](authentication/ROW_LEVEL_SECURITY.md)    | AccessScope 資料行過濾   | 15 分鐘  |
| [欄位級別授權](authentication/FIELD_AUTHORIZATION.md) | GraphQL 欄位權限控制     | 18 分鐘  |
| [速率限制](authentication/RATE_LIMITING.md)           | API 速率限制與防濫用     | 12 分鐘  |
| [雙因素認證](authentication/TWO_FACTOR_AUTH.md)       | Email-based 2FA 完整實現 | 25 分鐘  |
| [使用者註冊](authentication/REGISTRATION.md)          | 註冊流程與密碼重設       | 8 分鐘   |

---

### 🗄️ [資料庫](database/) (5 docs)

Prisma + PostgreSQL 資料庫設計、備份還原與最佳實踐。

| 文檔                                                         | 說明                    | 閱讀時間 |
| ------------------------------------------------------------ | ----------------------- | -------- |
| [資料庫層架構](database/DATABASE_LAYER.md)                   | Prisma 完整使用指南     | 20 分鐘  |
| [Prisma Schema 組織](database/PRISMA_SCHEMA_ORGANIZATION.md) | 資料庫 Schema 設計規範  | 15 分鐘  |
| [備份與還原](database/BACKUP_RESTORE.md)                     | 資料庫備份還原完整指南  | 15 分鐘  |
| [軟刪除實現](database/SOFT_DELETE.md)                        | 軟刪除機制與查詢處理    | 12 分鐘  |
| [UUID v7 遷移](database/UUID_V7_MIGRATION.md)                | UUID v7 ID 策略遷移指南 | 10 分鐘  |

---

### 🐳 [基礎設施](infrastructure/) (5 docs)

Docker、RabbitMQ、Dragonfly、Mailpit、GeoIP 等基礎設施配置。

| 文檔                                                         | 說明                     | 閱讀時間 |
| ------------------------------------------------------------ | ------------------------ | -------- |
| [環境變數管理](infrastructure/ENVIRONMENT_VARIABLES.md)      | .env 檔案配置與最佳實踐  | 10 分鐘  |
| [RabbitMQ + Dragonfly](infrastructure/RABBITMQ_DRAGONFLY.md) | 訊息佇列與快取服務設置   | 15 分鐘  |
| [Email 設置指南](infrastructure/EMAIL-SETUP.md)              | Mailpit 本地郵件測試配置 | 5 分鐘   |
| [GeoIP 配置指南](infrastructure/GEOIP_LOCATION_SETUP.md)     | 地理位置查詢服務配置     | 12 分鐘  |
| [審計日誌系統](infrastructure/AUDIT_LOG_SYSTEM.md)           | 完整的 API 操作審計系統  | 25 分鐘  |

---

## 🎓 推薦學習路徑

### 路徑 1：新手入門（預計 1 小時）

```text
1. 專案概覽 (../README.md)
   ↓
2. Starter CLI 完整指南 (getting-started/CLI_GUIDE.md)
   ↓
3. Docker 設置指南 (getting-started/DOCKER_SETUP.md)
   ↓
4. Monorepo 結構說明 (getting-started/MONOREPO_STRUCTURE.md)
   ↓
5. 前後端 i18n 協調機制 (getting-started/I18N_COORDINATION.md)
   ↓
6. 開始開發！
```

### 路徑 2：前端開發者（預計 1 小時）

```text
1. 前端認證整合 (frontend/FRONTEND_INTEGRATION.md)
   ↓
2. i18n 設置指南 (frontend/I18N_SETUP.md)
   ↓
3. 組件庫指南 (frontend/COMPONENT_LIBRARY.md)
   ↓
4. MSW 設置 (frontend/MSW_SETUP.md)
   ↓
5. 雙因素認證 - 前端部分 (authentication/TWO_FACTOR_AUTH.md)
   ↓
6. 開始開發！
```

### 路徑 3：後端開發者（預計 2 小時）

```text
1. API 回應格式規範 (backend/API_RESPONSE_FORMAT.md)
   ↓
2. RBAC 架構 (authentication/RBAC_ARCHITECTURE.md)
   ↓
3. 列級別安全 (authentication/ROW_LEVEL_SECURITY.md)
   ↓
4. 欄位級別授權 (authentication/FIELD_AUTHORIZATION.md)
   ↓
5. Prisma Schema 組織 (database/PRISMA_SCHEMA_ORGANIZATION.md)
   ↓
6. 分頁實現指南 (backend/PAGINATION_GUIDE.md)
   ↓
7. GraphQL 最佳實踐 (backend/GRAPHQL_BEST_PRACTICES.md)
   ↓
8. GraphQL Subscriptions (backend/SUBSCRIPTION_GUIDE.md)
   ↓
9. 開始開發！
```

### 路徑 4：DevOps / 資料庫管理員（預計 1.5 小時）

```text
1. Docker 設置指南 (getting-started/DOCKER_SETUP.md)
   ↓
2. 環境變數管理 (infrastructure/ENVIRONMENT_VARIABLES.md)
   ↓
3. RabbitMQ + Dragonfly (infrastructure/RABBITMQ_DRAGONFLY.md)
   ↓
4. Starter CLI 完整指南 (getting-started/CLI_GUIDE.md)
   ↓
5. 資料庫備份與還原 (database/BACKUP_RESTORE.md) ⭐ 重要
   ↓
6. Docker 容器命名 (DOCKER_CONTAINER_NAMING.md)
   ↓
7. 開始部署！
```

---

## 🔍 依功能快速查找

### 認證相關

- 使用者登入 → [前端認證整合](frontend/FRONTEND_INTEGRATION.md)
- 密碼重設 → [使用者註冊](authentication/REGISTRATION.md)
- 雙因素認證 → [雙因素認證](authentication/TWO_FACTOR_AUTH.md)
- JWT Token → [前端認證整合](frontend/FRONTEND_INTEGRATION.md)

### 權限相關

- 角色權限 → [RBAC 架構](authentication/RBAC_ARCHITECTURE.md)
- 資料行過濾 → [列級別安全](authentication/ROW_LEVEL_SECURITY.md)
- 欄位權限 → [欄位級別授權](authentication/FIELD_AUTHORIZATION.md)
- API 保護 → [速率限制](authentication/RATE_LIMITING.md)

### API 開發

- API 格式 → [API 回應格式規範](backend/API_RESPONSE_FORMAT.md)
- 分頁 → [分頁實現指南](backend/PAGINATION_GUIDE.md)
- GraphQL → [GraphQL 最佳實踐](backend/GRAPHQL_BEST_PRACTICES.md)

### 資料庫

- 開始使用 → [資料庫層架構](database/DATABASE_LAYER.md)
- Schema 設計 → [Prisma Schema 組織](database/PRISMA_SCHEMA_ORGANIZATION.md)
- 備份與還原 → [備份還原指南](database/BACKUP_RESTORE.md) ⭐
- 軟刪除 → [軟刪除實現](database/SOFT_DELETE.md)
- UUID 策略 → [UUID v7 遷移](database/UUID_V7_MIGRATION.md)

### 多語系（i18n）

- 前端 i18n → [前端 i18n 設置](frontend/I18N_SETUP.md)
- 後端 i18n → [後端 i18n 設置](backend/I18N_SETUP.md)
- 多語系 Email → [Email 服務配置](backend/EMAIL_CONFIGURATION.md)

### 前端開發

- React 組件 → [組件庫指南](frontend/COMPONENT_LIBRARY.md)
- API 模擬 → [MSW 設置](frontend/MSW_SETUP.md)
- Next.js 整合 → [前端認證整合](frontend/FRONTEND_INTEGRATION.md)

### 開發工具

- CLI 工具 → [Starter CLI 完整指南](getting-started/CLI_GUIDE.md)
- Docker → [Docker 設置指南](getting-started/DOCKER_SETUP.md)
- 環境變數 → [環境變數管理](infrastructure/ENVIRONMENT_VARIABLES.md)
- 備份還原 → [資料庫備份還原](database/BACKUP_RESTORE.md)

### 監控與除錯

- 審計日誌 → [稽核日誌系統](backend/AUDIT_LOG_SYSTEM.md)
- Request ID → [Request ID 追蹤系統](backend/REQUEST_ID_SYSTEM.md)
