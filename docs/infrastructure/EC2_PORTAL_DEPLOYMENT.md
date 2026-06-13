# 入口網部署到 EC2 / 自架主機（實測步驟）

本文件是**前端入口網（Public Scope，純展示）**部署到 Linux 主機的逐步流程，
含 **網域、Let's Encrypt 免費 HTTPS 憑證、自動續簽**。已於測試主機
`mead.webhop.me`（EC2，43.212.90.250）實測通過，可直接套用到業主生產環境。

> 本文以「在本機建置映像 → 傳到主機執行」的方式，因為小型主機（~1GB RAM）
> 直接 build Next.js 會 OOM。生產環境若主機夠大，也可改在主機上 build（見附錄 B）。

---

## 0. 架構與設計決策

```text
網際網路 ──80/443──> Caddy（TLS 終止 + 自動 ACME）──內網 http──> Next.js :3000
```

- **只部署前端**：入口網純展示、讀靜態 `plans.json`，不需後端與資料庫。
- **Caddy**：自動向 Let's Encrypt 申請＋**自動續簽**憑證；HTTP→HTTPS 自動轉址。
- 前端容器埠 3000 **不對外開**，只給 Caddy 內網存取。

相關檔案（都在 repo 內）：

| 檔案                            | 作用                                                  |
| ------------------------------- | ----------------------------------------------------- |
| `apps/frontend/Dockerfile`      | 前端映像（Next.js standalone）                        |
| `apps/frontend/next.config.ts`  | 已設 `output: 'standalone'` + `outputFileTracingRoot` |
| `deploy/ec2/docker-compose.yml` | caddy + frontend（用預建映像，不在主機 build）        |
| `deploy/ec2/Caddyfile`          | 反向代理 + 自動 HTTPS（網域/email 由 env 注入）       |

---

## 1. 前置條件（缺一不可）

1. **網域**：一個 DNS A record 指向主機公網 IP（Let's Encrypt **不簽裸 IP**）。
   - 本次範例：`mead.webhop.me → 43.212.90.250`（No-IP 動態 DNS）。
   - 生產環境：用業主提供的正式網域。
2. **連接埠對外開放**：主機防火牆 + **雲端 Security Group** 都要放行 **inbound 80 與 443**
   （TCP；443 另可開 UDP 給 HTTP/3）。LE 驗證需要 80（HTTP-01）或 443（TLS-ALPN-01）至少一個可達。
   - ⚠️ AWS EC2：到 **EC2 Console → Security Groups → Inbound rules** 新增 80、443。
3. **SSH 存取**：金鑰 + 主機 IP。本次：

   ```bash
   ssh -i <金鑰>.pem ubuntu@<主機IP>
   chmod 400 <金鑰>.pem   # 金鑰權限需為 400/600，否則 ssh 會拒絕
   ```

4. **本機**：已安裝 Docker（含 buildx）。

---

## 2. 在本機建置前端映像（linux/amd64）

EC2/伺服器多為 x86_64；若你的電腦是 Apple Silicon（arm64），務必指定 `--platform linux/amd64`
（會走 QEMU 模擬、較慢，約數分鐘屬正常）。

於 **repo 根目錄**執行：

```bash
docker buildx build --platform linux/amd64 \
  -f apps/frontend/Dockerfile \
  -t mead-frontend:latest --load .
```

完成後確認：`docker images mead-frontend`（本次約 85MB）。

---

## 3. 把映像傳到主機

```bash
# 匯出 + 壓縮
docker save mead-frontend:latest | gzip > /tmp/mead-frontend.tar.gz

# 傳到主機
scp -i <金鑰>.pem /tmp/mead-frontend.tar.gz ubuntu@<主機IP>:/tmp/

# 主機上載入
ssh -i <金鑰>.pem ubuntu@<主機IP> \
  'gunzip -f /tmp/mead-frontend.tar.gz && sudo docker load -i /tmp/mead-frontend.tar && rm -f /tmp/mead-frontend.tar'
```

> 替代方案：推到 registry（Docker Hub / ECR）再於主機 `docker pull`（見附錄 A）。

---

## 4. 主機準備：安裝 Docker

（Ubuntu 範例；主機已有 Docker 可跳過）

```bash
ssh -i <金鑰>.pem ubuntu@<主機IP>
curl -fsSL https://get.docker.com -o /tmp/get-docker.sh
sudo sh /tmp/get-docker.sh
sudo usermod -aG docker ubuntu          # 之後重新登入即可免 sudo
sudo systemctl enable --now docker
docker --version && docker compose version
```

---

## 5. 部署設定檔 + 啟動

把 repo 的 `deploy/ec2/` 兩個檔傳到主機，並建立 `.env`：

```bash
# 本機 → 主機
ssh -i <金鑰>.pem ubuntu@<主機IP> 'mkdir -p ~/mead-deploy'
scp -i <金鑰>.pem deploy/ec2/Caddyfile deploy/ec2/docker-compose.yml \
  ubuntu@<主機IP>:~/mead-deploy/

# 主機上建立 .env（填入網域與通知信箱）
ssh -i <金鑰>.pem ubuntu@<主機IP> 'cat > ~/mead-deploy/.env <<EOF
SITE_DOMAIN=<你的網域，例 portal.example.gov.tw>
ACME_EMAIL=<憑證通知信箱，例 ops@example.gov.tw>
EOF'

# 啟動（Caddy 啟動時會自動向 Let'\''s Encrypt 申請憑證）
ssh -i <金鑰>.pem ubuntu@<主機IP> 'cd ~/mead-deploy && sudo docker compose up -d'
```

### `deploy/ec2/Caddyfile` 內容（重點）

```caddyfile
{
 email {$ACME_EMAIL}
 # 排錯期可先用 staging（避免觸及 LE 正式 rate limit）：
 # acme_ca https://acme-staging-v02.api.letsencrypt.org/directory
}

{$SITE_DOMAIN} {
 encode zstd gzip
 reverse_proxy frontend:3000 {
  header_up Host {host}
  header_up X-Forwarded-Host {host}
  header_up X-Forwarded-Proto {scheme}
  # ⚠️ 重要：Next.js standalone 在反向代理後會把內部埠 3000 寫進
  # 轉址 Location（例 https://網域:3000/en），導致使用者打根路徑時壞掉。
  # 在此移除回應 Location 標頭的 :3000。
  header_down Location ":3000" ""
 }
 header -Server
}
```

> **為什麼有 `header_down Location ":3000" ""`**：實測時打 `https://網域/` 會被
> 轉到 `https://網域:3000/en`（Next standalone 用自己的監聽埠組轉址，與 Host 無關）。
> 3000 不對外開 → 使用者會連不上。此行把 Location 的 `:3000` 去掉即修正。

---

## 6. 驗證

```bash
# 憑證 + HTTPS
curl -sI https://<網域>/ | grep -i location           # 應為 https://<網域>/en（無 :3000）
echo | openssl s_client -servername <網域> -connect <網域>:443 2>/dev/null \
  | openssl x509 -noout -issuer -enddate                # issuer 應為 Let's Encrypt

# 內容
curl -s https://<網域>/zh-TW | grep "為台灣藝術設計開啟更多可能"
curl -sI https://<網域>/data/plans.json | head -1       # 200
curl -sI http://<網域>/ | grep -i "HTTP/\|location"     # HTTP→HTTPS 轉址
```

Caddy 申請憑證的紀錄：

```bash
ssh -i <金鑰>.pem ubuntu@<主機IP> \
  'cd ~/mead-deploy && sudo docker compose logs caddy | grep -i "certificate obtained"'
```

---

## 7. 自動續簽

Caddy **內建自動續簽**（到期前自動更新），不需 cron。
唯一要求：`caddy-data` volume 要持久保留（憑證與 ACME 帳號都在裡面，**勿刪**）。

---

## 8. 更新版本（重新部署新映像）

```bash
# 本機重建 + 傳輸（同 步驟 2、3）
docker buildx build --platform linux/amd64 -f apps/frontend/Dockerfile -t mead-frontend:latest --load .
docker save mead-frontend:latest | gzip > /tmp/mead-frontend.tar.gz
scp -i <金鑰>.pem /tmp/mead-frontend.tar.gz ubuntu@<主機IP>:/tmp/

# 主機載入新映像 + 重啟前端（憑證不受影響）
ssh -i <金鑰>.pem ubuntu@<主機IP> '
  gunzip -f /tmp/mead-frontend.tar.gz && sudo docker load -i /tmp/mead-frontend.tar && rm -f /tmp/mead-frontend.tar
  cd ~/mead-deploy && sudo docker compose up -d --force-recreate frontend'
```

---

## 9. 疑難排解（實測遇到的）

| 症狀                    | 原因 / 解法                                                                                    |
| ----------------------- | ---------------------------------------------------------------------------------------------- |
| Caddy 拿不到憑證        | DNS 未指向本機／**Security Group 未開 80、443**／對外被擋。先 `curl -I http://<網域>` 確認可達 |
| `too many certificates` | 觸及 LE 正式 rate limit → Caddyfile 先開 `acme_ca` staging 那行排錯，OK 後再註解回正式         |
| 根路徑轉址跑出 `:3000`  | Next standalone 反向代理問題 → Caddyfile 的 `header_down Location ":3000" ""`（已內建）        |
| 本機 build 在主機 OOM   | 小主機別在主機 build；用本文「本機建好再傳」                                                   |
| 主機是 arm？            | 對應改 `--platform linux/arm64`（多數雲主機是 amd64）                                          |

---

## 10. 套用到業主生產環境的調整清單

1. **網域 / 信箱**：`.env` 的 `SITE_DOMAIN`、`ACME_EMAIL` 換成業主正式值；DNS A record 指向生產主機。
2. **Security Group / 防火牆**：開 inbound 80、443。
3. **HSTS preload**：`next.config.ts` 目前為 `Strict-Transport-Security: max-age=63072000; includeSubDomains`（**不含 `preload`**）。
   `preload` 幾乎不可逆，故初期刻意不帶；待 HTTPS 穩定一段時間後再視需要加上。
4. **CSP connect-src**：目前 CSP 含 `http://localhost:4000`（範本後端，入口網用不到，瀏覽器
   主控台會有無害的 auth 連線錯誤）。若生產純前端，可移除該來源讓主控台乾淨；若有接後端則改成正式 endpoint。
5. **若生產要連後端**：本入口網為純展示不需後端；如需後端，請改用全棧方案
   （見 [SELF_HOSTED_TLS_DEPLOYMENT.md](./SELF_HOSTED_TLS_DEPLOYMENT.md)），並評估主機規格
   （後端 + TimescaleDB/RabbitMQ/Dragonfly/SeaweedFS 需數 GB RAM）。
6. **映像來源**：生產建議改用私有 registry（ECR）而非 scp（見附錄 A），便於版本管理與多機部署。

---

## 附錄 A：用 Registry 取代 scp（生產建議）

```bash
# 本機（以 ECR 為例）
aws ecr get-login-password | docker login --username AWS --password-stdin <acct>.dkr.ecr.<region>.amazonaws.com
docker buildx build --platform linux/amd64 -t <acct>.dkr.ecr.<region>.amazonaws.com/mead-frontend:latest --push .
# 主機 docker-compose.yml 的 image 改為該 ECR 位址，主機 docker compose pull && up -d
```

## 附錄 B：在主機直接 build（主機 RAM 足夠時）

主機規格夠（建議 ≥ 2GB，配 swap 更保險）可省去傳輸：clone repo 後用
`apps/frontend/Dockerfile` + `deploy/ec2/docker-compose.yml`（把 `image:` 改成 `build:` 區塊）
直接 `docker compose up -d --build`。

---

## 本次測試部署實況（參考值）

- 主機：EC2 Ubuntu 24.04，2 vCPU / ~1GB RAM / 6.8GB disk
- 網域：`mead.webhop.me` → 43.212.90.250
- 憑證：Let's Encrypt 正式（E8），效期至 2026-08-21，TLS-ALPN-01 驗證通過
- 映像：`mead-frontend:latest`（linux/amd64，~85MB）
- 部署目錄：主機 `~/mead-deploy/`（Caddyfile、docker-compose.yml、.env）
- 結果：`https://mead.webhop.me` 正常（HTTPS、HTTP 轉址、i18n、無障礙、計畫詳細頁皆 OK）
