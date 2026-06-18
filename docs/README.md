# mead 文檔

教育部藝術與設計三大計畫公開入口網的技術文檔。專案概覽見[根目錄 README](../README.md)。

## 入門

| 文檔                                                         | 說明                           |
| ------------------------------------------------------------ | ------------------------------ |
| [貢獻指南](getting-started/CONTRIBUTING.md)                  | 開發流程、Commit 規範、PR 流程 |
| [Markdown 風格指南](getting-started/MARKDOWN_STYLE_GUIDE.md) | 文件編寫規範                   |

## 前端

| 文檔                                                            | 說明                                             |
| --------------------------------------------------------------- | ------------------------------------------------ |
| [SPOSAD 入口網](frontend/SPOSAD_PORTAL.md)                      | 入口網架構與元件總覽                             |
| [設計指南](frontend/DESIGN_GUIDE.md)                            | 設計規範與視覺標準（含暗色模式）                 |
| [組件庫指南](frontend/COMPONENT_LIBRARY.md)                     | Atomic Design 架構與 Storybook                   |
| [組件 — Atoms](frontend/component-library/ATOMS.md)             | 原子組件清單                                     |
| [組件 — Molecules](frontend/component-library/MOLECULES.md)     | 分子組件清單                                     |
| [組件 — Organisms](frontend/component-library/ORGANISMS.md)     | 有機體組件清單                                   |
| [組件 — Pages](frontend/component-library/TEMPLATES.md)         | 入口網頁面（PortalLandingPage / PlanDetailPage） |
| [主題系統](frontend/THEME_SYSTEM.md)                            | Light/Dark/System 主題系統                       |
| [捲動控制組件設計](frontend/SCROLL_CONTROL_COMPONENT_DESIGN.md) | ScrollControl 設計與 API                         |
| [前端錯誤處理指南](frontend/FRONTEND_ERROR_HANDLING_GUIDE.md)   | Error Boundaries 與錯誤追蹤                      |
| [CSP 實作指南](frontend/CSP_IMPLEMENTATION.md)                  | Content Security Policy                          |
| [i18n 設置指南](frontend/I18N_SETUP.md)                         | next-intl 多語系配置                             |

## 部署

| 文檔                                                                | 說明                             |
| ------------------------------------------------------------------- | -------------------------------- |
| [入口網部署到 EC2（實測）](infrastructure/EC2_PORTAL_DEPLOYMENT.md) | 前端 + 網域 + HTTPS 憑證逐步部署 |
