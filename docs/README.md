# MEAD 模板文檔

歡迎來到 MEAD (New Project Template) 文檔！本模板僅含「身份／系統管理」核心模組，業務模組由各專案自行擴充。文檔依主題分類，方便快速查找。

## 快速導航

### 我是第一次使用本模板？

1. **專案概覽與用途** → 返回 [根目錄 README](../README.md)
2. **貢獻指南** → [Contributing Guide](getting-started/CONTRIBUTING.md)（開發流程、Commit、PR）
3. **開發工具** → [MEAD CLI 完整指南](getting-started/CLI_GUIDE.md)
4. **環境設置** → [Docker 設置指南](getting-started/DOCKER_SETUP.md)
5. **專案結構** → [Monorepo 結構說明](getting-started/MONOREPO_STRUCTURE.md)
6. **遇到問題** → [疑難排解](getting-started/TROUBLESHOOTING.md)

---

## 文檔分類目錄

### [入門指南](getting-started/)

新手必讀！從環境設置到專案結構、貢獻流程的完整指引。

| 文檔                                                         | 說明                                                   | 閱讀時間 |
| ------------------------------------------------------------ | ------------------------------------------------------ | -------- |
| [貢獻指南](getting-started/CONTRIBUTING.md)                  | **新手必讀** - 開發流程、Commit 規範、PR 流程          | 12 分鐘  |
| [MEAD CLI 完整指南](getting-started/CLI_GUIDE.md)            | 開發者 CLI 工具（快速上手+命令參考+架構）              | 15 分鐘  |
| [Docker 設置指南](getting-started/DOCKER_SETUP.md)           | Docker 服務設置與安全最佳實踐                          | 10 分鐘  |
| [Monorepo 結構說明](getting-started/MONOREPO_STRUCTURE.md)   | pnpm workspace + Turborepo 架構                        | 8 分鐘   |
| [前後端 i18n 協調機制](getting-started/I18N_COORDINATION.md) | 前端（next-intl）與後端（nestjs-i18n）如何協調語言設定 | 8 分鐘   |
| [部署指南](getting-started/DEPLOYMENT.md)                    | 環境分層、部署架構、發布流程（規劃中 + 目前作法）      | 15 分鐘  |
| [服務偵測機制](getting-started/SERVICE_DETECTION.md)         | CLI 如何辨識本地服務狀態與 port 衝突                   | 8 分鐘   |
| [Markdown 風格指南](getting-started/MARKDOWN_STYLE_GUIDE.md) | 文件編寫規範（標題、emoji、編排、code block 等）       | 5 分鐘   |
| [疑難排解](getting-started/TROUBLESHOOTING.md)               | 常見問題排查：環境、Docker、認證、效能等               | 參考用   |

---

### [前端開發](frontend/)

Next.js + React + Apollo Client 前端開發指南。

| 文檔                                                                         | 說明                                                   | 閱讀時間 |
| ---------------------------------------------------------------------------- | ------------------------------------------------------ | -------- |
| [組件設計指南](frontend/DESIGN_GUIDE.md)                                     | **給 UI/UX 設計師** - 設計規範和視覺標準 (含暗色模式)  | 20 分鐘  |
| [組件庫開發指南](frontend/COMPONENT_LIBRARY.md)                              | **給開發者** - Atomic Design 架構總覽與 Storybook      | 15 分鐘  |
| [組件 — Atoms](frontend/component-library/ATOMS.md)                          | 原子組件清單（Button、TextField、Icon…）               | 10 分鐘  |
| [組件 — Molecules](frontend/component-library/MOLECULES.md)                  | 分子組件清單（FormField、Card、Toast…）                | 12 分鐘  |
| [組件 — Organisms](frontend/component-library/ORGANISMS.md)                  | 有機體組件清單（Modal、Sidebar、Form…）                | 12 分鐘  |
| [組件 — Layout / Templates / Pages](frontend/component-library/TEMPLATES.md) | 佈局、模板與頁面範例                                   | 8 分鐘   |
| [主題系統](frontend/THEME_SYSTEM.md)                                         | Light/Dark/System 主題系統完整實作與使用               | 25 分鐘  |
| [通知同步系統](frontend/NOTIFICATION_SYNC_SYSTEM.md)                         | ✅ 同頁面/跨頁面即時同步、BroadcastChannel 整合        | 20 分鐘  |
| [捲動控制組件設計](frontend/SCROLL_CONTROL_COMPONENT_DESIGN.md)              | ScrollControl 設計思路與 API                           | 10 分鐘  |
| [前端認證整合](frontend/FRONTEND_INTEGRATION.md)                             | Next.js + Apollo Client 認證系統                       | 20 分鐘  |
| [前端錯誤處理指南](frontend/FRONTEND_ERROR_HANDLING_GUIDE.md)                | Error Boundaries 與錯誤追蹤                            | 18 分鐘  |
| [CSP 實作指南](frontend/CSP_IMPLEMENTATION.md)                               | Content Security Policy 與 Edge Runtime 相容           | 15 分鐘  |
| [i18n 設置指南](frontend/I18N_SETUP.md)                                      | next-intl 多語系配置與使用                             | 12 分鐘  |
| [MSW 設置](frontend/MSW_SETUP.md)                                            | Mock Service Worker API 模擬                           | 10 分鐘  |
| [SPOSAD 入口網](frontend/SPOSAD_PORTAL.md)                                   | 教育部藝術設計三大計畫入口網（Public Scope）架構與元件 | 12 分鐘  |

---

### [後端開發](backend/)

NestJS + GraphQL + Prisma 後端開發指南。

| 文檔                                                                      | 說明                                                   | 閱讀時間 |
| ------------------------------------------------------------------------- | ------------------------------------------------------ | -------- |
| [Backend 慣例與 drift 防治](backend/CONVENTIONS.md)                       | RBAC 命名、Mutation arg、共用型別、跨 repo drift check | 12 分鐘  |
| [API 回應格式規範](backend/API_RESPONSE_FORMAT.md)                        | BaseResponse 統一格式與錯誤處理                        | 10 分鐘  |
| [分頁實現指南](backend/PAGINATION_GUIDE.md)                               | Offset-based 分頁完整實現                              | 12 分鐘  |
| [GraphQL 最佳實踐](backend/GRAPHQL_BEST_PRACTICES.md)                     | Schema 設計、Query 優化、安全性                        | 15 分鐘  |
| [Email 服務配置](backend/EMAIL_CONFIGURATION.md)                          | SMTP 配置、Ethereal/Mailpit 測試、多語系模板           | 15 分鐘  |
| [i18n 設置指南](backend/I18N_SETUP.md)                                    | nestjs-i18n 多語系配置與使用                           | 10 分鐘  |
| [快取策略指南](backend/CACHING_STRATEGY.md)                               | Dragonfly 快取系統使用                                 | 12 分鐘  |
| [Request ID 追蹤系統](backend/REQUEST_ID_SYSTEM.md)                       | UUID v7 請求追蹤與日誌整合                             | 10 分鐘  |
| [稽核日誌系統](backend/AUDIT_LOG_SYSTEM.md)                               | RabbitMQ 批次處理、TimescaleDB 優化、效能監控          | 20 分鐘  |
| [Cron Jobs 指南](backend/CRON_JOBS.md)                                    | 排程任務系統、分散式鎖、前端監控頁面                   | 25 分鐘  |
| [角色管理](backend/ROLE_MANAGEMENT.md)                                    | 角色分配/撤銷 API、權限矩陣與用戶管理路由              | 10 分鐘  |
| [會話用詞規範](backend/SESSION_TERMINOLOGY.md)                            | 會話狀態與撤銷方式的術語統一規範                       | 10 分鐘  |
| [GraphQL Subscriptions 實作](backend/SUBSCRIPTION_IMPLEMENTATION_PLAN.md) | ✅ 已完成 - 通知訂閱與系統廣播實作紀錄                 | 15 分鐘  |
| [GraphQL Subscriptions 指南](backend/SUBSCRIPTION_GUIDE.md)               | WebSocket 即時訂閱完整使用指南                         | 12 分鐘  |
| [效能優化](backend/PERFORMANCE_OPTIMIZATION.md)                           | 後端效能優化策略與實踐                                 | 15 分鐘  |

---

### [認證與授權](authentication/)

完整的認證、授權與安全機制。

| 文檔                                                    | 說明                                                            | 閱讀時間 |
| ------------------------------------------------------- | --------------------------------------------------------------- | -------- |
| [權限系統](authentication/PERMISSION_SYSTEM.md)         | **主要參考** - 權限動作類型、完整權限清單、角色對照表與檢查機制 | 15 分鐘  |
| [RBAC 架構](authentication/RBAC_ARCHITECTURE.md)        | 多層式架構概念（AccessScope / RLS / RBAC / Field-Level）        | 20 分鐘  |
| [列級別安全](authentication/ROW_LEVEL_SECURITY.md)      | AccessScope 資料行過濾                                          | 15 分鐘  |
| [欄位級別授權](authentication/FIELD_AUTHORIZATION.md)   | GraphQL 欄位權限控制                                            | 18 分鐘  |
| [速率限制](authentication/RATE_LIMITING.md)             | API 速率限制與防濫用                                            | 12 分鐘  |
| [雙因素認證](authentication/TWO_FACTOR_AUTH.md)         | Email-based 2FA 完整實現                                        | 25 分鐘  |
| [用戶註冊](authentication/REGISTRATION.md)              | 註冊流程與密碼重設                                              | 8 分鐘   |
| [Token 配置](authentication/TOKEN-CONFIGURATION.md)     | JWT Token 配置與更新機制                                        | 10 分鐘  |
| [個人存取權杖](authentication/PERSONAL_ACCESS_TOKEN.md) | PAT 管理、CLI/腳本認證、通知機制                                | 12 分鐘  |
| [密碼政策](authentication/PASSWORD_POLICY.md)           | 密碼強度要求與驗證規則                                          | 8 分鐘   |
| [Scope 路由分軌](authentication/SCOPE_ROUTING.md)       | Customer vs HQ 路由分流、帳號登入、首登強制改密、Form 共用 prop | 15 分鐘  |

---

### [架構](architecture/)

跨前後端的契約與設計規範。

| 文檔                                                           | 說明                                                               | 閱讀時間 |
| -------------------------------------------------------------- | ------------------------------------------------------------------ | -------- |
| [GraphQL Schema 合約](architecture/GRAPHQL_SCHEMA_CONTRACT.md) | 命名規則、ID 型別、login union、PaginatedXxx shape、JWT claim 形狀 | 15 分鐘  |

---

### [資料庫](database/)

Prisma + PostgreSQL 資料庫設計、備份還原與最佳實踐。

| 文檔                                                         | 說明                    | 閱讀時間 |
| ------------------------------------------------------------ | ----------------------- | -------- |
| [資料庫層架構](database/DATABASE_LAYER.md)                   | Prisma 完整使用指南     | 20 分鐘  |
| [Prisma Schema 組織](database/PRISMA_SCHEMA_ORGANIZATION.md) | 資料庫 Schema 設計規範  | 15 分鐘  |
| [備份與還原](database/BACKUP_RESTORE.md)                     | 資料庫備份還原完整指南  | 15 分鐘  |
| [軟刪除實現](database/SOFT_DELETE.md)                        | 軟刪除機制與查詢處理    | 12 分鐘  |
| [UUID v7 遷移](database/UUID_V7_MIGRATION.md)                | UUID v7 ID 策略遷移指南 | 10 分鐘  |

---

### [基礎設施](infrastructure/)

Docker、RabbitMQ、Dragonfly、SeaweedFS、GeoIP 等基礎設施配置。

| 文檔                                                                 | 說明                                                      | 閱讀時間 |
| -------------------------------------------------------------------- | --------------------------------------------------------- | -------- |
| [環境變數管理](infrastructure/ENVIRONMENT_VARIABLES.md)              | .env 檔案配置與最佳實踐                                   | 10 分鐘  |
| [資料庫提供者](infrastructure/DATABASE_PROVIDERS.md)                 | TimescaleDB / managed 選項                                | 10 分鐘  |
| [RabbitMQ + Dragonfly](infrastructure/RABBITMQ_DRAGONFLY.md)         | 訊息佇列與快取服務設置                                    | 15 分鐘  |
| [SeaweedFS 儲存](infrastructure/SEAWEEDFS_STORAGE.md)                | 分散式檔案儲存服務配置                                    | 12 分鐘  |
| [GeoIP 配置指南](infrastructure/GEOIP_LOCATION_SETUP.md)             | 地理位置查詢服務配置                                      | 12 分鐘  |
| [自架部署與免費 HTTPS](infrastructure/SELF_HOSTED_TLS_DEPLOYMENT.md) | Caddy + Docker + Let's Encrypt 自架部署與憑證（全棧規劃） | 15 分鐘  |
| [入口網部署到 EC2（實測）](infrastructure/EC2_PORTAL_DEPLOYMENT.md)  | 前端入口網 + 網域 + HTTPS 憑證逐步部署（已實測）          | 18 分鐘  |

---

## 推薦學習路徑

### 路徑 1：新手入門（預計 1 小時）

```text
1. 專案概覽 (../README.md)
   ↓
2. 貢獻指南 (getting-started/CONTRIBUTING.md) ⭐ 必讀
   ↓
3. MEAD CLI 完整指南 (getting-started/CLI_GUIDE.md)
   ↓
4. Docker 設置指南 (getting-started/DOCKER_SETUP.md)
   ↓
5. Monorepo 結構說明 (getting-started/MONOREPO_STRUCTURE.md)
   ↓
6. 前後端 i18n 協調機制 (getting-started/I18N_COORDINATION.md)
   ↓
7. 遇到問題時 → 疑難排解 (getting-started/TROUBLESHOOTING.md)
   ↓
8. 開始開發！
```

### 路徑 2：前端開發者（預計 1.5 小時）

```text
1. 前端認證整合 (frontend/FRONTEND_INTEGRATION.md)
   ↓
2. i18n 設置指南 (frontend/I18N_SETUP.md)
   ↓
3. 組件庫指南 (frontend/COMPONENT_LIBRARY.md)
   ↓
4. 通知同步系統 (frontend/NOTIFICATION_SYNC_SYSTEM.md) ⭐ 新增
   ↓
5. MSW 設置 (frontend/MSW_SETUP.md)
   ↓
6. 雙因素認證 - 前端部分 (authentication/TWO_FACTOR_AUTH.md)
   ↓
7. 開始開發！
```

### 路徑 3：後端開發者（預計 2 小時）

```text
1. API 回應格式規範 (backend/API_RESPONSE_FORMAT.md)
   ↓
2. RBAC 架構 (authentication/RBAC_ARCHITECTURE.md)
   ↓
3. 權限系統 (authentication/PERMISSION_SYSTEM.md)
   ↓
4. 列級別安全 (authentication/ROW_LEVEL_SECURITY.md)
   ↓
5. 欄位級別授權 (authentication/FIELD_AUTHORIZATION.md)
   ↓
6. Prisma Schema 組織 (database/PRISMA_SCHEMA_ORGANIZATION.md)
   ↓
7. 分頁實現指南 (backend/PAGINATION_GUIDE.md)
   ↓
8. GraphQL 最佳實踐 (backend/GRAPHQL_BEST_PRACTICES.md)
   ↓
9. GraphQL Subscriptions (backend/SUBSCRIPTION_GUIDE.md)
   ↓
10. 開始開發！
```

### 路徑 4：DevOps / 資料庫管理員（預計 2.5 小時）

```text
1. Docker 設置指南 (getting-started/DOCKER_SETUP.md)
   ↓
2. 環境變數管理 (infrastructure/ENVIRONMENT_VARIABLES.md)
   ↓
3. RabbitMQ + Dragonfly (infrastructure/RABBITMQ_DRAGONFLY.md)
   ↓
4. SeaweedFS 儲存 (infrastructure/SEAWEEDFS_STORAGE.md)
   ↓
5. MEAD CLI 完整指南 (getting-started/CLI_GUIDE.md)
   ↓
6. 部署指南 (getting-started/DEPLOYMENT.md) ⭐ 重要
   ↓
7. 資料庫備份與還原 (database/BACKUP_RESTORE.md) ⭐ 重要
   ↓
8. Cron Jobs 指南 (backend/CRON_JOBS.md)
   ↓
9. 開始部署！
```

---

## 依功能快速查找

### 認證與會話

- 用戶登入 → [前端認證整合](frontend/FRONTEND_INTEGRATION.md)
- 帳號登入 / HQ vs Customer 路由分軌 → [Scope 路由分軌](authentication/SCOPE_ROUTING.md)
- 首登強制改密 → [Scope 路由分軌](authentication/SCOPE_ROUTING.md#首次登入強制變更密碼mustchangepassword)
- 密碼重設 → [用戶註冊](authentication/REGISTRATION.md)
- 雙因素認證 → [雙因素認證](authentication/TWO_FACTOR_AUTH.md)
- JWT Token / claim 形狀 → [前端認證整合](frontend/FRONTEND_INTEGRATION.md)、[GraphQL Schema 合約](architecture/GRAPHQL_SCHEMA_CONTRACT.md#jwt-claim-形狀)
- 會話管理 → [會話用詞規範](backend/SESSION_TERMINOLOGY.md)

### 權限相關

- 權限清單與角色對照 → [權限系統](authentication/PERMISSION_SYSTEM.md)（主要參考）
- 多層式架構概念 → [RBAC 架構](authentication/RBAC_ARCHITECTURE.md)
- 角色分配與用戶管理 → [角色管理](backend/ROLE_MANAGEMENT.md)
- 資料行過濾 → [列級別安全](authentication/ROW_LEVEL_SECURITY.md)
- 欄位權限 → [欄位級別授權](authentication/FIELD_AUTHORIZATION.md)
- API 保護 → [速率限制](authentication/RATE_LIMITING.md)

### API 開發

- API 格式 → [API 回應格式規範](backend/API_RESPONSE_FORMAT.md)
- 分頁 → [分頁實現指南](backend/PAGINATION_GUIDE.md)
- Schema 契約（命名、ID 型別、union、JWT claim）→ [GraphQL Schema 合約](architecture/GRAPHQL_SCHEMA_CONTRACT.md)
- GraphQL → [GraphQL 最佳實踐](backend/GRAPHQL_BEST_PRACTICES.md)
- 即時訂閱 → [GraphQL Subscriptions 指南](backend/SUBSCRIPTION_GUIDE.md)
- 訂閱實作 → [GraphQL Subscriptions 實作](backend/SUBSCRIPTION_IMPLEMENTATION_PLAN.md)

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

- CLI 工具 → [MEAD CLI 完整指南](getting-started/CLI_GUIDE.md)
- Docker → [Docker 設置指南](getting-started/DOCKER_SETUP.md)
- 環境變數 → [環境變數管理](infrastructure/ENVIRONMENT_VARIABLES.md)
- 備份還原 → [資料庫備份還原](database/BACKUP_RESTORE.md)

### 監控與除錯

- 審計日誌 → [稽核日誌系統](backend/AUDIT_LOG_SYSTEM.md)
- Request ID → [Request ID 追蹤系統](backend/REQUEST_ID_SYSTEM.md)

### 系統維護

- 定期任務 → [Cron Jobs 指南](backend/CRON_JOBS.md)
- 會話清理 → [Cron Jobs 指南](backend/CRON_JOBS.md)
- 備份還原 → [資料庫備份還原](database/BACKUP_RESTORE.md)

### 貢獻與發布

- 貢獻流程 → [Contributing Guide](getting-started/CONTRIBUTING.md)
- Commit 規範 → [Contributing Guide — Commit 規範](getting-started/CONTRIBUTING.md#commit-規範)
- PR 流程 → [Contributing Guide — Pull Request 流程](getting-started/CONTRIBUTING.md#pull-request-流程)
- 部署 → [部署指南](getting-started/DEPLOYMENT.md)
- 排錯 → [疑難排解](getting-started/TROUBLESHOOTING.md)

### 多語系與通知

- 前端 i18n → [前端 i18n 設置](frontend/I18N_SETUP.md)
- 後端 i18n → [後端 i18n 設置](backend/I18N_SETUP.md)
- i18n 協作 → [前後端 i18n 協調機制](getting-started/I18N_COORDINATION.md)
- Email 通知 → [Email 服務配置](backend/EMAIL_CONFIGURATION.md)
- 鈴鐺通知 → [通知同步系統](frontend/NOTIFICATION_SYNC_SYSTEM.md)
