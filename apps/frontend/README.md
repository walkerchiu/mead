# MEAD Web - Next.js 前端

Next.js 16 應用程式，使用 MUI 7、Apollo Client 和 Atomic Design 架構。

## 技術堆疊

- **Next.js**: 16.1.5 (App Router)
- **React**: 19.2.3
- **MUI**: 7.3.7 (Material-UI)
- **Apollo Client**: 4.1.2 (GraphQL)
- **Emotion**: 11.14.0 (CSS-in-JS)
- **React Hook Form**: 7.71.1 + **Zod**: 4.3.6（表單驗證）
- **Storybook**: 10.2.1（組件開發）
- **Vitest**: 4.0.18 + **MSW**: 2.12.7（測試與 API 模擬）
- **next-intl**: i18n 多語系（en、zh-TW）
- **TypeScript**: 5.x

## 開發

```bash
pnpm dev              # 開發模式
pnpm build            # 建置
pnpm start            # 正式環境模式
pnpm storybook        # 啟動 Storybook（port 6006）
pnpm build-storybook  # 建置 Storybook 靜態檔
pnpm lint             # 程式碼檢查
pnpm type-check       # 型別檢查
```

## 專案結構

```text
apps/frontend/
├── messages/                      # i18n 翻譯檔案
│   ├── en.json                    # 英文
│   └── zh-TW.json                 # 繁體中文
├── public/                        # 靜態資源
│   └── mockServiceWorker.js       # MSW Service Worker
└── src/
    ├── __mocks__/                 # Jest/Vitest mocks
    │   └── next/                  # Next.js mocks
    ├── i18n/                      # i18n 配置
    │   ├── routing.ts             # 路由配置（locales、defaultLocale）
    │   └── request.ts             # Server-side 訊息載入
    ├── app/                       # Next.js App Router 頁面
    │   ├── layout.tsx             # 根 layout（<html><body>）
    │   └── [locale]/              # Locale 動態路由
    │       ├── layout.tsx         # Locale layout（NextIntlClientProvider）
    │       ├── providers.tsx      # Client Providers
    │       ├── login/             # 登入頁
    │       ├── dashboard/         # 儀表板（需認證）
    │       ├── hq/             # 管理後台
    │       │   ├── audit-logs/    # 審計日誌管理
    │       │   └── sessions/      # Session 管理
    │       ├── settings/          # 設定頁面
    │       │   └── security/      # 安全性設定（2FA）
    │       ├── forgot-password/   # 忘記密碼
    │       └── reset-password/    # 重設密碼
    ├── components/                # Atomic Design 組件
    │   ├── atoms/                 # 基礎組件
    │   │   ├── Button/            # 按鈕組件
    │   │   ├── TextField/         # 文字輸入
    │   │   ├── CodeInput/         # 驗證碼輸入
    │   │   ├── Icon/              # 圖示組件
    │   │   ├── Avatar/            # 頭像組件
    │   │   └── ...                # 其他基礎組件
    │   ├── molecules/             # 組合組件
    │   │   ├── AlertMessage/      # 警告訊息
    │   │   ├── EmailField/        # Email 輸入欄位
    │   │   ├── PasswordField/     # 密碼輸入欄位
    │   │   ├── DataTable/         # 資料表格
    │   │   └── ...                # 其他組合組件
    │   ├── organisms/             # 複雜組件（表單、卡片等）
    │   ├── templates/             # 頁面模板
    │   ├── pages/                 # 完整頁面組件
    │   ├── auth/                  # 認證組件
    │   │   ├── LoginForm/         # 登入表單
    │   │   ├── TwoFactorForm/     # 2FA 驗證表單
    │   │   └── ...                # 其他認證組件
    │   ├── hq/                 # 管理組件
    │   │   ├── AuditLogFilters/   # 審計日誌過濾器
    │   │   └── SessionFilters/    # Session 過濾器
    │   ├── settings/              # 設定組件
    │   │   └── TwoFactorSettings/ # 2FA 設定
    │   ├── layout/                # 佈局組件
    │   │   ├── LanguageSwitcher/  # 語言切換器
    │   │   └── SettingsMenu/      # 設定選單
    │   └── design-system/         # 設計系統展示
    ├── contexts/                  # React Contexts
    │   └── AuthContext.tsx        # 認證 Context
    ├── hooks/                     # 自訂 React Hooks
    │   ├── useAuthInit.ts         # 認證初始化
    │   ├── useSessions.ts         # Session 管理
    │   ├── useAuditLogs.ts        # 審計日誌查詢
    │   └── ...                    # 其他 hooks
    ├── lib/                       # 工具與客戶端
    │   ├── apollo-client.ts       # Apollo Client 設定
    │   ├── apollo-provider.tsx    # Apollo Provider
    │   ├── auth.ts                # 認證工具
    │   ├── graphql.ts             # GraphQL 查詢/變更定義
    │   ├── session-management-queries.ts  # Session 查詢
    │   └── audit-logs-queries.ts  # 審計日誌查詢
    ├── theme/                     # MUI 主題設定
    │   ├── theme.ts               # 主題定義
    │   └── ThemeRegistry.tsx      # 主題 Provider
    ├── types/                     # TypeScript 型別定義
    │   ├── auth.ts                # 認證型別
    │   └── i18n.generated.ts      # i18n 型別（自動生成）
    ├── mocks/                     # MSW API 模擬
    │   ├── handlers/              # 請求處理器
    │   ├── apollo/                # Apollo Client 模擬
    │   └── fixtures/              # 測試資料
    ├── stories/                   # Storybook stories
    │   └── assets/                # Story 資源
    └── test/                      # 測試設定
        └── setup.ts               # Vitest 設定
```

## 主要功能

- **App Router** - Next.js 16 檔案系統路由
- **MUI 7** - Material Design 組件庫，自訂主題
- **Apollo Client** - GraphQL 查詢與狀態管理
- **認證流程** - 登入、註冊、忘記密碼、重設密碼
- **2FA** - 雙因素認證設定與驗證
- **表單驗證** - React Hook Form + Zod schema 驗證
- **Atomic Design** - 分層組件架構（atoms → molecules → organisms → templates → pages）
- **Storybook** - 互動式組件文件與開發環境
- **MSW** - Mock Service Worker，用於測試與 Storybook API 模擬
- **i18n** - next-intl 多語系支援（en、zh-TW），URL 前綴式路由

## 存取

| 服務      | 端點                               |
| --------- | ---------------------------------- |
| 前端應用  | http://localhost:3000/en 或 /zh-TW |
| Storybook | http://localhost:6006              |

## 相關文件

- [組件設計指南](../../docs/frontend/DESIGN_GUIDE.md)
- [組件庫開發指南](../../docs/frontend/COMPONENT_LIBRARY.md)
- [前端認證整合](../../docs/frontend/FRONTEND_INTEGRATION.md)
- [i18n 設置指南](../../docs/frontend/I18N_SETUP.md)
- [MSW 設置](../../docs/frontend/MSW_SETUP.md)
