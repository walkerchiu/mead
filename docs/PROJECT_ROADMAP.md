# NPT 模板路線圖

本文檔記錄 NPT 模板提供的功能、已知不足，以及使用模板開新專案時的建議步驟。

---

## 📊 模板內建狀態

模板僅含「身份／系統管理」核心模組，未包含任何業務模組。各功能成熟度如下：

| 區塊       | 狀態    | 備註                                                      |
| ---------- | ------- | --------------------------------------------------------- |
| 認證與授權 | ✅ 完成 | JWT、RBAC、2FA、列級／欄位級授權、PAT、帳號鎖定           |
| 用戶管理   | ✅ 完成 | CRUD、軟刪除、還原、HQ 後台、Profile / Account 設定       |
| 資料層     | ✅ 完成 | Prisma、TimescaleDB、軟刪除、稽核日誌、分頁、UUID v7      |
| 多語系     | ✅ 完成 | next-intl + nestjs-i18n、Email 模板雙語                   |
| 通知系統   | ✅ 完成 | 系統通知 + Email、GraphQL Subscriptions、跨頁同步         |
| 排程任務   | ✅ 完成 | Cron Jobs、分散式鎖、HQ 監控介面                          |
| 會話管理   | ✅ 完成 | Session 列表、批次撤銷、HQ 強制下線                       |
| TLS 自動化 | ✅ 完成 | LetsEncrypt / Cloudflare / AWS ACM                        |
| 前端基礎   | ✅ 完成 | Next.js、MUI、Storybook、Atomic Design、Light/Dark        |
| 錯誤處理   | ✅ 完成 | Error Boundaries、Apollo Client、Sentry 整合              |
| 開發工具   | ✅ 完成 | NPT CLI、Docker Compose、Git hooks、drift check           |
| 業務模組   | ❌ 無   | 模板不含；由各專案自行擴充                                |
| CI/CD      | ❌ 未含 | 需各專案依部署目標自行配置                                |
| APM 監控   | 🟡 基礎 | 健康檢查 + Kubernetes 探針已內建；Prometheus/Grafana 待補 |

---

## 🚀 使用本模板的建議步驟

### 1. 起步（新專案）

```bash
# 複製模板並改名
cp -R /path/to/npt /path/to/your-project
cd /path/to/your-project
rm -rf .git
git init && git add . && git commit -m "init from NPT template"

# 全域取代 npt → your-project
# （使用 IDE 的全域 rename，或 sed 批次處理）

# 安裝與啟動
pnpm install
./scripts/cli.sh init
./scripts/cli.sh dev
```

### 2. 預設帳號（首次登入用）

development / uat 環境共用同一組測試帳號：

| Email                | 密碼           | 用途                                   |
| -------------------- | -------------- | -------------------------------------- |
| `hq@example.com`     | `Password123!` | `SUPER_HQ` + `MANAGER`，可存取所有功能 |
| `public@example.com` | `Password123!` | 無角色，用於測試「未授權」情境         |

> Production 環境**不**建立任何測試帳號。請於部署前準備正式帳號建立流程。

### 3. 客製化權限

修改 `apps/backend/database/prisma/seeds/base.ts` — 加入您專案的：

- 業務模組權限（如 `reports:create / read / manage`）
- 對應的角色設定（OWNER / MANAGER / MEMBER 各自擁有哪些 perm）

對應修改 `apps/frontend/src/hooks/usePermissions.ts` 的 `ROLE_PERMISSIONS` 表。

### 4. 設定 PAT scope（若用到）

修改 `apps/backend/src/modules/personal-access-token/personal-access-token.service.ts`：

```typescript
const ALLOWED_SCOPES: readonly string[] = [
  'reports:read',
  'reports:write',
] as const;
```

對應修改 `apps/frontend/src/app/[locale]/settings/tokens/page.tsx` 的 `scopeOptions`。

### 5. 新增業務模組

依以下順序：

1. **後端 Prisma schema** — 在 `apps/backend/database/prisma/schemas/` 建立新檔
2. **執行** `pnpm db:merge-schemas && pnpm db:migrate`
3. **後端模組** — 在 `apps/backend/src/modules/{your-module}/` 依 NestJS 慣例建立 module / service / resolver / types / input
4. **註冊到 `app.module.ts`**
5. **前端 GraphQL** — 在 `apps/frontend/src/graphql/{your-module}.ts` 建立 query/mutation
6. **前端 hooks** — 在 `apps/frontend/src/hooks/use{YourModule}.ts`
7. **前端頁面** — 在 `apps/frontend/src/app/[locale]/{your-module}/`
8. **i18n 翻譯** — 更新 `apps/frontend/messages/{en,zh-TW}.json` 與 `apps/backend/src/i18n/`
9. **權限守衛** — `@RequiresScope` + `@RequiresPermission`
10. **加 Sidebar 入口** — 修改 `apps/frontend/src/hooks/useSidebarItems.tsx`

詳見 [docs/backend/CONVENTIONS.md](backend/CONVENTIONS.md) 命名規則。

### 6. 部署準備

- 設定 CI/CD（GitHub Actions / GitLab CI 等，模板未提供）
- 設定生產環境 `.env`（基於 `.env.production.example`）
- 設定 TLS（見 [docs/operations/TLS_AUTOMATION.md](operations/TLS_AUTOMATION.md)）
- 部署參考 [docs/getting-started/DEPLOYMENT.md](getting-started/DEPLOYMENT.md)

---

## 📝 開發規範

詳見：

- **後端慣例**：[docs/backend/CONVENTIONS.md](backend/CONVENTIONS.md)
- **貢獻流程**：[docs/getting-started/CONTRIBUTING.md](getting-started/CONTRIBUTING.md)
- **Commit 規範**：見 CONTRIBUTING.md 中的 Conventional Commits 章節

提交前建議跑：

```bash
pnpm lint
pnpm type-check
pnpm test
./scripts/cli.sh drift     # 後端 convention 檢查
```

---

## 📊 程式碼品質目標

| 指標                | 模板現況                         | 建議目標     |
| ------------------- | -------------------------------- | ------------ |
| TypeScript 嚴格模式 | ✅                               | ✅           |
| 後端 tsc            | 0 errors                         | 0 errors     |
| 前端 tsc            | 0 errors                         | 0 errors     |
| 後端 jest tests     | 14/14 ✓                          | 持續維持綠色 |
| 前端 vitest tests   | 22/22 ✓                          | 持續維持綠色 |
| ESLint 警告         | 既有 1.3k 條 `any`-type 既有警告 | 新模組不增加 |

### 效能目標（部署後參考）

| 指標             | 目標    |
| ---------------- | ------- |
| API 平均回應時間 | < 200ms |
| API P95 回應時間 | < 500ms |
| 前端 FCP         | < 1.5s  |
| 前端 LCP         | < 2.5s  |

---

## 🎓 學習資源

### 團隊建議閱讀順序

1. [貢獻指南](getting-started/CONTRIBUTING.md)
2. [NPT CLI 完整指南](getting-started/CLI_GUIDE.md)
3. [RBAC 架構](authentication/RBAC_ARCHITECTURE.md)
4. [Backend Conventions](backend/CONVENTIONS.md)
5. [GraphQL 最佳實踐](backend/GRAPHQL_BEST_PRACTICES.md)
6. [前端錯誤處理指南](frontend/FRONTEND_ERROR_HANDLING_GUIDE.md)
7. [資料庫層架構](database/DATABASE_LAYER.md)

### 外部資源

- [NestJS 官方文檔](https://docs.nestjs.com)
- [Next.js 官方文檔](https://nextjs.org/docs)
- [GraphQL 最佳實踐](https://graphql.org/learn/best-practices/)
- [Atomic Design 方法論](https://atomicdesign.bradfrost.com/)
- [Prisma 文檔](https://www.prisma.io/docs)
