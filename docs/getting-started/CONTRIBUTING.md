# 貢獻指南

歡迎為 MEAD（New Project Template）貢獻！本文件說明開發流程、提交規範與程式碼審查標準。

---

## 目錄

- [開發流程](#開發流程)
- [分支策略](#分支策略)
- [Commit 規範](#commit-規範)
- [Pull Request 流程](#pull-request-流程)
- [程式碼品質](#程式碼品質)
- [測試要求](#測試要求)
- [文件更新](#文件更新)
- [程式碼審查](#程式碼審查)

---

## 開發流程

### 1. 初始化環境

新加入專案者，一次性完成開發環境建置：

```bash
./scripts/cli.sh init
```

該命令會自動完成：

- 檢查系統需求（Node.js ≥ 20、pnpm ≥ 9、Docker）
- 複製 `.env.example` → `.env`
- 安裝 pnpm 依賴
- 啟動 Docker 服務（TimescaleDB、RabbitMQ、Dragonfly、Mailpit、SeaweedFS）
- 執行資料庫 migration + seed
- 驗證所有服務健康狀態

若遇環境異常：

```bash
./scripts/cli.sh doctor           # 診斷
./scripts/cli.sh doctor --fix     # 診斷並嘗試修復
```

### 2. 日常開發

```bash
./scripts/cli.sh dev              # 啟動前後端（turbo run dev）
./scripts/cli.sh status           # 檢視服務狀態
./scripts/cli.sh logs             # 查看日誌
```

前端：`http://localhost:3000` / 後端：`http://localhost:4000/graphql`

---

## 分支策略

| 分支           | 用途        | 合併來源         |
| -------------- | ----------- | ---------------- |
| `master`       | 穩定主幹    | 僅透過 PR 合併   |
| `feat/xxx`     | 新功能開發  | 從 `master` 分出 |
| `fix/xxx`      | Bug 修復    | 從 `master` 分出 |
| `refactor/xxx` | 重構        | 從 `master` 分出 |
| `docs/xxx`     | 文件專門 PR | 從 `master` 分出 |

### 建立分支

```bash
git checkout master
git pull --rebase
git checkout -b feat/your-feature-name    # 或 fix/login-race-condition
```

**分支命名**：全小寫 + 短橫線，動詞開頭或名詞描述。避免 `my-branch`、`temp`、`test`。

---

## Commit 規範

本專案使用 [Conventional Commits](https://www.conventionalcommits.org/) + 自訂規則，由 `commitlint.config.mjs` 強制執行。

### 格式

```
<Type>(<Scope>): <Subject>

<Body>

<Footer>
```

### Type（必填，Sentence-case）

| Type        | 用途                       |
| ----------- | -------------------------- |
| `Feat`      | 新功能                     |
| `Fix`       | Bug 修復                   |
| `Refactor`  | 重構（非功能性變更）       |
| `Perf`      | 效能優化                   |
| `Style`     | 格式、空白、分號（非邏輯） |
| `Test`      | 新增或修改測試             |
| `Docs`      | 文件修改                   |
| `Build`     | 建置系統、依賴管理         |
| `CI`        | CI/CD 配置                 |
| `Chore`     | 雜項（不屬於以上）         |
| `Deprecate` | 標記棄用                   |
| `Release`   | 版本發布                   |
| `Revert`    | 還原先前 commit            |

### Scope（必填，Sentence-case）

| Scope       | 涵蓋範圍                          |
| ----------- | --------------------------------- |
| `API`       | GraphQL / REST API                |
| `Config`    | 設定檔、環境變數                  |
| `Framework` | 框架層（Next.js、NestJS 核心）    |
| `Function`  | 一般功能邏輯                      |
| `Git`       | Git 相關設定（hooks、.gitignore） |
| `Infra`     | 基礎設施（Docker、CI）            |
| `Lang`      | 多語系 i18n                       |
| `Module`    | 業務模組（依專案實際定義）        |
| `Project`   | 專案結構、Monorepo                |
| `Theme`     | 主題、設計系統                    |
| `Vendor`    | 第三方依賴                        |
| `Views`     | 前端頁面、元件                    |

### Subject（必填）

- Sentence-case（句首大寫）
- 祈使語氣動詞開頭（Add、Fix、Update、Remove、Refactor…）
- **句末不加句點**
- ≤ 100 字元

### 範例

```
Feat(Module): Add personal access token system
```

```
Fix(Views): Resolve sidebar state not persisting on navigation
```

```
Refactor(Framework): Migrate dashboard layout to AppShell component
```

```
Docs(Project): Split COMPONENT_LIBRARY into atomic layers
```

### Body（可選）

- 以空行與 Subject 分隔
- 每行 ≤ 100 字元
- 句首大寫，句末加句點
- 說明「為什麼」而非「做了什麼」

### Footer（可選）

```
BREAKING CHANGE: 說明破壞性變更

Closes #123
Refs #456
```

---

## Pull Request 流程

### 1. 開發前

- 確認 issue 已被指派或與專案維護者討論過方向
- 從最新 `master` 建立分支

### 2. 開發中

- 保持 commit 小而明確（遵循 Conventional Commits）
- 定期 rebase `master` 避免大衝突
- 本地通過 lint、type-check、test 再 push

```bash
pnpm type-check && pnpm lint && pnpm test
```

### 3. 開 PR

**PR 標題**：同 commit 格式（`Feat(Module): Add XYZ`）

**PR Body 必含**：

- **摘要**：3 條以內的 bullet point 說明變更
- **動機**：為什麼做這個變更（連結 issue）
- **測試計畫**：如何驗證（單元測試、手動操作、截圖）
- **影響範圍**：哪些模組、是否有 breaking change

**建議模板**：

```markdown
## Summary

- 新增 XYZ 功能
- 修正 ABC 邊界情況
- 更新相關文件

## Motivation

Closes #123

## Test plan

- [ ] `pnpm test` 全數通過
- [ ] 手動驗證登入流程：a → b → c
- [ ] Storybook 視覺確認

## Screenshots

（若涉及 UI 變更）
```

### 4. CI 驗證

PR 自動觸發：

- ESLint + Prettier 檢查
- TypeScript 類型檢查
- 單元測試 + E2E 測試
- i18n 完整性測試

所有檢查通過才能合併。

### 5. 合併策略

- **預設**：Squash and merge（保持 `master` 乾淨線性）
- **例外**：多個邏輯獨立的 commits 可用 Rebase and merge

---

## 程式碼品質

### Linter + Formatter

專案使用 **ESLint 9 + Prettier**，由 `husky` 的 `pre-commit` hook 自動執行（via `lint-staged`）。

手動執行：

```bash
pnpm lint              # 檢查
pnpm lint:fix          # 自動修復
pnpm format            # 格式化
pnpm format:check      # 僅檢查格式
```

### TypeScript

- 整個 monorepo 使用 strict mode
- **禁止**使用 `any`（必要時以 `unknown` 取代並收斂類型）
- 匯出型別優先於類別

```bash
pnpm type-check        # 全專案類型檢查
```

### 風格規範

詳見：

- [前端組件庫規範](../frontend/COMPONENT_LIBRARY.md)
- [設計系統指南](../frontend/DESIGN_GUIDE.md)
- [後端 GraphQL 最佳實踐](../backend/GRAPHQL_BEST_PRACTICES.md)

---

## 測試要求

### 測試層級

| 層級          | 工具                     | 要求                   |
| ------------- | ------------------------ | ---------------------- |
| **單元測試**  | Vitest                   | 業務邏輯、工具函式必寫 |
| **元件測試**  | Vitest + Testing Library | atoms/molecules 建議寫 |
| **E2E 測試**  | Playwright               | 關鍵使用者流程必寫     |
| **i18n 測試** | 自訂腳本                 | 翻譯檔異動時必跑       |

### 執行測試

```bash
pnpm test              # 全部
pnpm test:backend      # 僅後端
pnpm test:frontend     # 僅前端
pnpm test:e2e          # E2E（Playwright）
pnpm test:i18n         # i18n 完整性
```

或透過 CLI：

```bash
./scripts/cli.sh test
```

### Coverage 要求

- **新增功能**：該模組 coverage 不得低於 80%
- **Bug 修復**：必須加入能重現該 bug 的測試
- **重構**：不得降低原有 coverage

---

## 文件更新

**以下情況 PR 必須同步更新文件**：

| 變更類型                  | 需更新的文件                                                   |
| ------------------------- | -------------------------------------------------------------- |
| 新增 API endpoint         | `docs/backend/API_RESPONSE_FORMAT.md` 或相關模組文件           |
| 新增環境變數              | `.env.example`、`docs/infrastructure/ENVIRONMENT_VARIABLES.md` |
| 新增 GraphQL subscription | `docs/backend/SUBSCRIPTION_GUIDE.md`                           |
| 新增 Cron Job             | `docs/backend/CRON_JOBS.md`                                    |
| 新增通知事件              | `docs/backend/EMAIL_CONFIGURATION.md`                          |
| 新增前端組件              | `docs/frontend/component-library/<層級>.md` + Storybook story  |
| 更新權限                  | `docs/authentication/PERMISSION_SYSTEM.md`                     |
| 資料庫 schema 變更        | `docs/database/PRISMA_SCHEMA_ORGANIZATION.md`                  |

**原則**：**文件與程式碼同步**。若 PR 改了程式碼但沒更新對應文件，reviewer 會要求補上。

---

## 程式碼審查

### Reviewer 檢查清單

- [ ] PR 描述清楚（動機、測試計畫、影響範圍）
- [ ] Commit message 符合規範
- [ ] CI 全部綠燈
- [ ] TypeScript 無 `any`、無 `@ts-ignore`
- [ ] 有對應的測試
- [ ] 文件已同步更新
- [ ] 無硬編碼的色碼、URL、密鑰
- [ ] 無留存的 `console.log`、除錯程式碼、未完成的 TODO
- [ ] 向後相容（或明確標示 breaking change）
- [ ] 變更符合 Atomic Design / 模組化原則

### 回應審查

- **建設性意見**：感謝 + 修正
- **技術歧異**：充分討論再決定，以專案長期可維護性為優先
- **盲點**：Reviewer 不是你的對手，是你的安全網

### 作為 Author

- 主動解釋非直覺的決策
- 不要害怕說「這是暫時方案，後續 issue 會修」— 明確標示比藏起來好
- Review 被駁回不等於被否定，而是更好的機會

---

## 常用命令速查

```bash
# 環境
./scripts/cli.sh init            # 首次初始化
./scripts/cli.sh doctor          # 診斷環境
./scripts/cli.sh status          # 服務狀態

# 開發
./scripts/cli.sh dev             # 啟動前後端
./scripts/cli.sh logs            # 查看日誌

# 資料庫
./scripts/cli.sh db              # 互動式資料庫管理
pnpm db:migrate                  # 執行 migration
pnpm db:seed                     # 填入 seed 資料
pnpm db:studio                   # 啟動 Prisma Studio

# 測試
pnpm test                        # 全部測試
pnpm test:e2e                    # E2E
pnpm test:i18n                   # i18n 完整性

# 品質
pnpm type-check
pnpm lint:fix
pnpm format
```

---

## 相關文件

- [Monorepo 結構](./MONOREPO_STRUCTURE.md)
- [CLI 工具指南](./CLI_GUIDE.md)
- [Docker 環境設置](./DOCKER_SETUP.md)
- [前後端 i18n 協調](./I18N_COORDINATION.md)
