# 自架部署與免費 HTTPS 憑證（Caddy + Docker）

本文件規劃將入口網部署到**業主自有主機**，並以 **Caddy + Let's Encrypt 免費憑證**
處理 HTTPS。Caddy 會自動申請憑證並在到期前自動續簽，無需 cron。

## 架構

```text
網際網路
   │  80 / 443
   ▼
┌──────────────────────────────┐
│  Caddy（TLS 終止 + 自動 ACME）  │  ← Let's Encrypt 憑證存於 caddy-data volume
└──────────────────────────────┘
   │  http（compose 內網）
   ├──> frontend  (Next.js)  :3000
   └──> backend   (NestJS)   :4000   /graphql*
                                └──> timescaledb / rabbitmq / dragonfly / seaweedfs
```

- TLS 只在 Caddy 這層；app 之間走 compose 內網 http，前後端不對外開埠。
- 路由：`/graphql*` → backend，其餘 → frontend（見 `deploy/Caddyfile`）。

## 相關檔案

| 檔案                          | 作用                                                                                                                  |
| ----------------------------- | --------------------------------------------------------------------------------------------------------------------- |
| `deploy/Caddyfile`            | 反向代理 + 自動 HTTPS 設定（網域、email 由 env 注入）                                                                 |
| `apps/frontend/Dockerfile`    | 前端映像（Next.js standalone，多階段、非 root）                                                                       |
| `apps/backend/Dockerfile`     | 後端映像（NestJS + Prisma generate）                                                                                  |
| `docker-compose.selfhost.yml` | caddy 反向代理 overlay；frontend / backend 本體在 base（profile app），疊加 `-f docker-compose.yml ... --profile app` |
| `.dockerignore`               | 縮小 build context                                                                                                    |
| `next.config.ts`              | 已加 `output: 'standalone'` + `outputFileTracingRoot`                                                                 |

## 前置條件（缺一不可）

1. **網域**：一個指向業主主機公網 IP 的 DNS A/AAAA record（Let's Encrypt 不簽 IP）。
2. **連接埠**：主機 `80` 與 `443` 對外開放（HTTP-01 challenge 走 80；443 服務 + HTTP/3）。
3. **對外連線**：主機防火牆／資安政策允許對外連到 Let's Encrypt。
4. **Docker**：主機已裝 Docker（≥ 24）與 Docker Compose v2。

## 部署步驟

### 1. 建立環境檔

根目錄 `.env`（供 docker-compose.selfhost.yml 注入 Caddy）：

```dotenv
SITE_DOMAIN=portal.業主網域.gov.tw
ACME_EMAIL=ops@業主網域.gov.tw
```

各 app 的正式環境變數（由範例複製後填值）：

```bash
cp apps/frontend/.env.prod.example apps/frontend/.env.prod
cp apps/backend/.env.prod.example  apps/backend/.env.prod
```

- 前端：Apollo / API endpoint 等若指向後端，請設為**同網域相對路徑**（如 `/graphql`），
  讓瀏覽器經由 Caddy 轉發，避免混合內容（mixed content）。
- 後端：DB / RabbitMQ / Dragonfly / SeaweedFS 連線主機名請用 **compose 服務名**
  （`timescaledb`、`rabbitmq`、`dragonfly`、`seaweedfs-s3`），非 `localhost`。

### 2. 上線前先用 staging 測試（強烈建議）

Let's Encrypt 正式環境有 rate limit；先用 staging 驗證整套流程：
編輯 `deploy/Caddyfile`，取消註解 `acme_ca https://acme-staging-v02...` 那行。
（staging 憑證瀏覽器會顯示不受信任屬正常，只為驗證流程。）

### 3. 啟動

```bash
# 先起基礎設施（DB 等）
docker compose up -d
# 套用資料庫 migration（後端首次部署）
docker compose -f docker-compose.yml -f docker-compose.selfhost.yml --profile app run --rm backend \
  pnpm --filter @mead/backend exec prisma migrate deploy
# 起 app + Caddy（會自動申請憑證）
docker compose -f docker-compose.yml -f docker-compose.selfhost.yml --profile app up -d --build
```

### 4. 驗證

```bash
docker compose -f docker-compose.yml -f docker-compose.selfhost.yml logs -f caddy   # 看憑證申請是否成功
curl -I https://portal.業主網域.gov.tw                                          # 應為 200 + HTTPS
```

確認 staging 流程無誤後，把 `Caddyfile` 的 `acme_ca` 那行重新註解（改回正式 CA），
並 `docker compose ... up -d` 重啟 caddy 重新申請正式憑證。

## 自動續簽

Caddy **內建自動續簽**（到期前約 1/3 效期自動更新），不需任何 cron。
唯一要求：`caddy-data` volume 要持久保留（憑證與 ACME 帳號都在裡面）。

## ⚠️ HSTS preload 注意

`next.config.ts` 目前帶 `Strict-Transport-Security: ...; preload`。
`preload` 一旦被瀏覽器收錄**幾乎不可逆**，若 HTTPS 尚未穩定就上線，測試期可能把網域鎖死。
**建議初期先移除 `preload` 字樣**，待全站 HTTPS 穩定運行一段時間後再加回。

## 日後換正式／付費憑證

只需改 Caddy 這層、**完全不動 app**：

- 改用指定憑證檔：`deploy/Caddyfile` 站台區塊內加 `tls /path/cert.pem /path/key.pem`
  並把該檔掛進 caddy 容器。
- 或改用其他 ACME CA：調整 `acme_ca`。

## 與後端 TlsModule 的關係

後端 `apps/backend/src/tls/`（Let's Encrypt / Cloudflare / AWS ACM 自動化）**維持休眠**。
Caddy 處理 TLS 更單純、與 app 解耦。未來若需多網域集中管理、憑證存 Vault，
再評估啟用後端模組並補上觸發點與排程（目前 overkill）。

## 疑難排解

| 症狀                    | 可能原因                                                |
| ----------------------- | ------------------------------------------------------- |
| Caddy 拿不到憑證        | DNS 未指向本機 / 80 埠未開 / 對外被防火牆擋             |
| `too many certificates` | 觸及 LE 正式 rate limit — 先用 staging                  |
| 前端 build 失敗         | 首次需 `docker build` 驗證 monorepo standalone 產出路徑 |
| 後端連不到 DB           | env 連線主機名要用 compose 服務名，非 localhost         |

> **尚待驗證**：`apps/frontend/Dockerfile`、`apps/backend/Dockerfile` 為依標準
> monorepo pattern 撰寫，首次部署前請於主機跑一次 `docker build` 驗證映像可成功建置。
