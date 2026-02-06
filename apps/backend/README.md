# Wind API - NestJS 後端

NestJS 11 GraphQL API，具備完整認證授權、RBAC、2FA、審計日誌、訊息佇列與快取。

## 技術堆疊

- **NestJS**: 11.1.12
- **GraphQL**: 16.12.0 (Apollo Server 5.3.0)
- **Prisma**: 6.1.0（透過 `@wind/database`）
- **TypeScript**: 5.9.3
- **nestjs-i18n**: 多語系（en、zh-TW）
- **測試**: Jest 30

## 開發

```bash
pnpm dev          # 開發模式（watch）
pnpm build        # 建置
pnpm start        # 正式環境模式
pnpm test         # 執行測試
pnpm test:cov     # 測試覆蓋率
pnpm lint         # 程式碼檢查
pnpm type-check   # 型別檢查
```

## 專案結構

```text
apps/backend/
├── database/                  # 資料庫相關
│   ├── prisma/                # Prisma 設定與 migrations
│   │   ├── migrations/        # 資料庫遷移檔案
│   │   ├── schema.prisma      # 主 schema 檔案
│   │   ├── schemas/           # 分散式 schema 檔案
│   │   ├── seed.ts            # 資料庫種子檔案
│   │   └── seeds/             # 種子資料模組
│   └── scripts/               # 資料庫工具腳本
├── src/
│   ├── main.ts                # 應用程式進入點
│   ├── app.module.ts          # 根模組（GraphQL、Throttler 設定）
│   ├── app.controller.ts      # 健康檢查 controller
│   ├── app.service.ts         # 根服務
│   ├── auth/                  # 認證模組
│   │   ├── auth.service.ts    # 認證服務（JWT、登入、註冊）
│   │   ├── auth.resolver.ts   # 認證 GraphQL resolver
│   │   ├── jwt.strategy.ts    # JWT 策略
│   │   ├── password-reset.service.ts  # 密碼重設服務
│   │   ├── admin-session.service.ts   # Session 管理服務
│   │   └── account-lockout.service.ts # 帳號鎖定服務
│   ├── two-factor-auth/       # 雙因素認證（Email-based 2FA）
│   ├── rbac/                  # RBAC 角色權限控制
│   ├── audit-log/             # 審計日誌
│   │   ├── audit-log.consumer.ts      # RabbitMQ consumer
│   │   ├── audit-log.interceptor.ts   # 日誌攔截器
│   │   └── audit-log.resolver.ts      # 日誌 resolver
│   ├── i18n/                  # i18n 翻譯檔案
│   │   ├── en/                # 英文翻譯
│   │   └── zh-TW/             # 繁體中文翻譯
│   ├── mail/                  # Email 服務
│   │   ├── mail.service.ts    # Email 服務
│   │   └── templates/         # Handlebars 多語系模板
│   ├── queue/                 # RabbitMQ 訊息佇列
│   ├── cache/                 # Dragonfly/Redis 快取層
│   ├── prisma/                # Prisma 資料庫整合
│   ├── modules/
│   │   └── user/              # 使用者管理模組
│   ├── generated/             # 自動生成的檔案
│   │   └── i18n.generated.ts  # i18n 型別定義
│   └── common/
│       ├── decorators/        # 自訂裝飾器（RequestId、FieldAuth、RequiresPermission、I18nLang）
│       ├── dto/               # 資料傳輸物件（分頁等）
│       ├── enums/             # 列舉（AccessScope 等）
│       ├── filters/           # 例外過濾器（全域錯誤處理）
│       ├── guards/            # 守衛（Throttler、Permission）
│       ├── interceptors/      # 攔截器（Request ID）
│       ├── plugins/           # GraphQL 插件（FieldAuth、QuerySecurity、RequestId）
│       ├── services/          # 共用服務（Logger、FieldMetadataCache）
│       ├── types/             # 型別定義（ErrorCode、Pagination、Response、GraphQLContext）
│       └── utils/             # 工具函式（加密、驗證、分頁）
└── test/                      # E2E 測試
```

## 主要功能

- **GraphQL API** - Apollo Server 5.3，Code First 模式
- **JWT 認證** - Passport + JWT，支援 refresh token
- **RBAC** - 角色權限控制，支援欄位級別授權
- **2FA** - Email-based 雙因素認證
- **審計日誌** - 完整 API 操作記錄
- **訊息佇列** - RabbitMQ（amqplib）
- **快取** - Dragonfly/Redis（cache-manager + ioredis）
- **i18n** - nestjs-i18n 多語系，支援 `x-lang` / `Accept-Language` header
- **Email 服務** - Nodemailer + Handlebars 多語系模板
- **Request ID** - UUID v7 全鏈路追蹤
- **速率限制** - NestJS Throttler
- **查詢安全** - 深度限制（10 層）、複雜度限制（200）

## 環境變數

設定檔：`.env`

```env
PORT=4000
NODE_ENV=development
DATABASE_URL="postgresql://postgres:password@localhost:5432/wind_db?schema=public"
```

## 存取

| 服務            | 端點                          |
| --------------- | ----------------------------- |
| API             | http://localhost:4000         |
| GraphQL Sandbox | http://localhost:4000/graphql |

## 相關文件

- [GraphQL 最佳實踐](../../docs/backend/GRAPHQL_BEST_PRACTICES.md)
- [API 回應格式規範](../../docs/backend/API_RESPONSE_FORMAT.md)
- [RBAC 架構](../../docs/authentication/RBAC_ARCHITECTURE.md)
- [雙因素認證](../../docs/authentication/TWO_FACTOR_AUTH.md)
- [Request ID 追蹤系統](../../docs/backend/REQUEST_ID_SYSTEM.md)
- [i18n 設置指南](../../docs/backend/I18N_SETUP.md)
- [Email 服務配置](../../docs/backend/EMAIL_CONFIGURATION.md)
- [快取策略指南](../../docs/backend/CACHING_STRATEGY.md)
- [速率限制](../../docs/authentication/RATE_LIMITING.md)
