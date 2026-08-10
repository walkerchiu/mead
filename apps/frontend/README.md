# MEAD Frontend - Next.js 公開入口網

教育部藝術與設計三大計畫公開入口網。這個 app 是純前端展示站，沒有登入、後台、GraphQL 或後端 API；三大計畫內容集中在 `public/data/plans.json`，圖片素材放在 `public/images/`。

## 技術堆疊

- **Next.js**：16.2.4（App Router）
- **React**：19.2.5
- **MUI**：7.3.10
- **Emotion**：11.14.x
- **next-intl**：4.11.x（`en`、`zh-TW`）
- **Storybook**：10.3.x
- **Vitest**：4.1.x
- **Playwright**：1.59.x
- **TypeScript**：5.9.x

## 開發

```bash
pnpm --filter @mead/frontend dev              # 開發模式
pnpm --filter @mead/frontend build            # 建置
pnpm --filter @mead/frontend start            # 正式環境模式
pnpm --filter @mead/frontend storybook        # 啟動 Storybook（port 6006）
pnpm --filter @mead/frontend build-storybook  # 建置 Storybook 靜態檔
pnpm --filter @mead/frontend lint             # 程式碼檢查
pnpm --filter @mead/frontend type-check       # 型別檢查
pnpm --filter @mead/frontend test             # Vitest
pnpm --filter @mead/frontend test:i18n        # i18n 完整性測試
```

## 專案結構

```text
apps/frontend/
├── messages/                      # i18n 翻譯檔案
│   ├── en.json                    # 英文
│   └── zh-TW.json                 # 繁體中文
├── public/
│   ├── data/plans.json            # 三大計畫資料
│   └── images/                    # Logo、mark、banner、照片素材
└── src/
    ├── __mocks__/                 # Vitest mocks
    │   └── next/                  # Next.js mocks
    ├── i18n/                      # i18n 配置
    │   ├── routing.ts             # 路由配置（locales、defaultLocale）
    │   └── request.ts             # Server-side 訊息載入
    ├── app/                       # Next.js App Router 頁面
    │   ├── layout.tsx             # 根 layout
    │   └── [locale]/              # /en、/zh-TW
    │       ├── layout.tsx         # Locale layout
    │       ├── providers.tsx      # Client Providers
    │       ├── page.tsx           # 首頁
    │       └── plans/[slug]/      # 計畫詳細頁
    ├── components/
    │   ├── atoms/                 # 基礎組件
    │   │   ├── Icon/              # 圖示組件
    │   │   └── Buttons/           # Button / ActionButton / IconButton
    │   ├── molecules/             # 共用組合組件
    │   ├── public/                # 公開入口網元件
    │   │   ├── atoms/             # CarouselDots / LearnMoreButton / SocialIconButton
    │   │   ├── molecules/         # PlanLogo / PlanTimeline / SocialLinkBar
    │   │   ├── organisms/         # PlanCarousel / PortalFooter / Narrative sections
    │   │   └── pages/             # PortalLandingPage / PlanDetailPage
    │   └── design-system/         # 設計系統展示
    ├── hooks/                     # 自訂 React Hooks
    │   └── usePlans.ts            # 載入 plans.json
    ├── lib/portal/                # 計畫資料載入工具
    ├── theme/                     # MUI 主題設定
    ├── types/                     # Plan / i18n / error 型別
    ├── mocks/fixtures/            # Storybook / test fixture
    ├── stories/                   # Storybook stories
    └── test/                      # 測試設定
        └── setup.ts               # Vitest 設定
```

## 主要功能

- **公開入口網**：三大計畫首頁、輪播互動、計畫詳細頁。
- **靜態資料來源**：同源 `public/data/plans.json`，沒有後端 API。
- **i18n**：next-intl 多語系支援（`en`、`zh-TW`），URL 前綴式路由。
- **設計系統**：MUI theme tokens、共用 atoms/molecules、公開入口網元件。
- **Storybook**：元件文件與互動式開發環境。
- **安全標頭**：middleware 產生 CSP nonce，`next.config.ts` 輸出基礎安全 headers。

## 存取

| 服務      | 端點                                   |
| --------- | -------------------------------------- |
| 前端應用  | <http://localhost:3000/en> 或 `/zh-TW` |
| Storybook | <http://localhost:6006>                |

## 部署

Production 使用 Vercel 專案 `mead-frontend-a3az`，Root Directory 為 `apps/frontend`，正式網址為 <https://mead-frontend-a3az.vercel.app>。

本地部署指令：

```bash
pnpm dlx vercel@latest deploy --prod --yes --project mead-frontend-a3az
```

部署前先確認本地 `.vercel` link 指向 `mead-frontend-a3az`。`apps/frontend/.vercelignore` 會排除 `.next/`、`storybook-static/`、`tsconfig.tsbuildinfo` 等本地產物，避免 Vercel CLI 上傳不必要的大檔。

## 相關文件

- [入口網設計與資料流](../../docs/frontend/SPOSAD_PORTAL.md)
- [組件設計指南](../../docs/frontend/DESIGN_GUIDE.md)
- [組件庫開發指南](../../docs/frontend/COMPONENT_LIBRARY.md)
- [i18n 設置指南](../../docs/frontend/I18N_SETUP.md)
- [Vercel 部署](../../docs/infrastructure/VERCEL_DEPLOYMENT.md)
