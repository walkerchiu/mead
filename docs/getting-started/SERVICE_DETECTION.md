# 服務偵測邏輯（Service Detection）

`./scripts/cli.sh status` 與相關命令（`logs`、`stop`、`restart`、`port free` 等）都仰賴一套「這個 port 是不是自己的服務在用」的判斷邏輯。本文件說明這套邏輯怎麼運作、為什麼這樣設計、以及它的局限。

---

## 目錄

- [為什麼需要這套邏輯](#為什麼需要這套邏輯)
- [三層過濾](#三層過濾)
  - [1. `-sTCP:LISTEN` — 只認真正 listen 的伺服器](#1--stcplisten-—-只認真正-listen-的伺服器)
  - [2. Docker forward sentinel — 過濾 docker container 透過 host port forward](#2-docker-forward-sentinel-—-過濾-docker-container-透過-host-port-forward)
  - [3. `PROJECT_ROOT` cwd 比對 — 確認 process 屬於當前 repo](#3-projectroot-cwd-比對-—-確認-process-屬於當前-repo)
- [顯示效果（真實範例）](#顯示效果真實範例)
- [對 stop / restart / port free 的影響](#對-stop-restart-port-free-的影響)
- [局限與不適用的情況](#局限與不適用的情況)
- [觸碰到此邏輯的檔案](#觸碰到此邏輯的檔案)
- [驗證方式](#驗證方式)
- [相關文件](#相關文件)

## 為什麼需要這套邏輯

開發機通常同時放好幾個專案。它們不一定同時跑，但 port 配置可能重疊（3000/4000/5432/5555/5672/6006/6379/8025/15672 是常見區段）。如果 `status` 只用「這個 port 有沒有人佔住」當判斷，會出現三類誤報：

1. **Client connection 誤報**：瀏覽器（Chrome、Safari）對某 port 留下 `CLOSE_WAIT` / `ESTABLISHED` 連線，`lsof -ti:port` 列出的是 client process 不是 server。
2. **Docker port forward 誤報**：別的 repo 啟動 docker container 把 `127.0.0.1:5555` forward 給容器內部，這時佔住 5555 的是 `com.docker.backend`（macOS）或 `docker-proxy`（Linux），不是真正的服務。
3. **跨 repo 同 port 誤報**：`/icp/nptc` 的 next dev 在 3000 LISTEN，當前 repo（`/icp/npt`）的 status 仍會把它認成「自己的 Frontend 在跑」。

這三類誤報會讓 `status` 失去診斷價值，於是 `cli.sh` 用三層過濾來排除。

---

## 三層過濾

### 1. `-sTCP:LISTEN` — 只認真正 listen 的伺服器

```bash
lsof -ti:"$port" -sTCP:LISTEN
```

預設的 `lsof -ti:port` 會列出所有持有此 port 連線的 process（含 client 端 `CLOSE_WAIT` / `ESTABLISHED`）。加上 `-sTCP:LISTEN` 之後只會列 `LISTEN` 狀態的 server process。

**典型擋下的誤報**：Chrome Helper（PID 7786）對 localhost:3000 留下 zombie 連線，`status` 之前會把它當 Frontend 。

涵蓋檔案：`status.sh` / `logs.sh` / `port.sh` / `restart.sh` / `stop.sh` / `clean.sh` / `storage.sh` / `doctor.sh` 中所有 `lsof -ti:port` 的位置都加上了 `-sTCP:LISTEN`。

### 2. Docker forward sentinel — 過濾 docker container 透過 host port forward

```bash
PROC=$(ps -p "$PID" -o comm= 2>/dev/null || echo "")
if [[ "$PROC" == *"com.docker"* ]] || [[ "$PROC" == *"docker-proxy"* ]]; then
  # 視為「別的 docker container 在用此 port」，回 ✗
fi
```

當 docker container 透過 `127.0.0.1:5555->8080/tcp` 之類的 publish 設定 forward port 時，作業系統上 listen 該 port 的 process 是 Docker Desktop 的後端進程（macOS 上叫 `com.docker.backend`，Linux 上叫 `docker-proxy`），不是容器內部的服務。

**典型擋下的誤報**：另一個 repo 啟動了它的 Adminer 容器，把 5555 forward 出來。當前 repo 的 Prisma Studio（host process，不是 docker）並沒有跑，但 5555 上看到一個 LISTEN 的 process，會誤觸。加上 sentinel 過濾後直接顯示為「被其他 docker container forward 佔用」。

### 3. `PROJECT_ROOT` cwd 比對 — 確認 process 屬於當前 repo

```bash
PROC_CWD=$(lsof -p "$PID" 2>/dev/null | awk '$4 == "cwd" {print $NF}' | head -1)
if [[ -n "$PROC_CWD" \
   && "$PROC_CWD" != "$PROJECT_ROOT" \
   && "$PROC_CWD" != "$PROJECT_ROOT"/* ]]; then
  # 這個 PID 不是從當前 repo 啟動的，回 ✗
fi
```

`lsof -p PID` 可以拿到 process 的 working directory。Next.js / NestJS / Storybook 等 dev server 都是從 `apps/<workspace>` 目錄啟動，cwd 會落在 `$PROJECT_ROOT/apps/...`。比對 cwd 是否在當前 `$PROJECT_ROOT` 之下就能精準判斷服務歸屬。

**為什麼要 `"$PROJECT_ROOT"/*` 而不是 `"$PROJECT_ROOT"*`**：bash glob 中 `"$PROJECT_ROOT"*` 是純字串前綴匹配，`/icp/nptc/...` 字面上以 `/icp/npt` 開頭會被誤認為「在 `npt` PROJECT_ROOT 下」。加上 `/` 邊界確保只認真正的子目錄。額外的 `"$PROC_CWD" != "$PROJECT_ROOT"` 比對處理 cwd 剛好就是 PROJECT_ROOT 本身（極少見）的邊界情況。

**典型擋下的誤報**：`/icp/nptc/apps/frontend` 的 next dev 在 3000 LISTEN，當前 repo `/icp/npt` 的 status 之前會誤報 Frontend 。加上 cwd 比對後顯示「被其他專案佔用」+ 佔用者路徑。

---

## 顯示效果（真實範例）

當 `/icp/nptc` 的服務都在跑、且 `/icp/npt` 的服務都沒跑時：

```text
📦 應用服務
  ✗ Frontend  (Port 3000，被其他專案佔用) 未運行
      佔用者: /Users/walkerchiu/Documents/icp/nptc/apps/frontend
      啟動: ./scripts/cli.sh dev
  ✗ Backend   (Port 4000，被其他專案佔用) 未運行
      佔用者: /Users/walkerchiu/Documents/icp/nptc/apps/backend/src/Nptc.Api
      啟動: ./scripts/cli.sh dev
  ✗ Storybook (Port 6006，被其他專案佔用) 未運行
      佔用者: /Users/walkerchiu/Documents/icp/nptc/apps/frontend
      啟動: ./scripts/cli.sh dev
  ✗ Prisma Studio (Port 5555，被其他 docker container forward 佔用) 未運行
      啟動: ./scripts/cli.sh dev
```

`status --json` 對應：

```json
{
  "status": "degraded",
  "total": 12,
  "running": 0,
  "app": [],
  "docker": []
}
```

---

## 對 stop / restart / port free 的影響

不只 `status`，所有 `cli.sh` 內會 `kill` server 的命令（`stop`、`restart`、`port free`、`port free-all`、`clean` 的 port cleanup）也都改用 `lsof -ti:port -sTCP:LISTEN`。理由：

- 過去 `port free 3000` 會把所有持有 3000 連線的 process 都 kill —— 包含 Chrome 的 client 連線。雖然 Chrome 自己會回收 zombie process，語意上不正確。
- 改成 LISTEN-only 之後，只會 kill 真正的 server，client connection 在 server 死後會自然關閉。

`stop` / `restart` 沒有再加 cwd 比對 —— 因為使用者明確下了 `stop frontend` 的意圖時，他知道自己在哪個 repo；如果該 port 被別 repo 佔用，原本的「未運行」訊息也已經足夠。

---

## 局限與不適用的情況

1. **`lsof -p PID` 拿不到 cwd** —— 例如 process 啟動後 chdir 到 / 或被 `unshare` 隔離的情況。此時 cwd 比對會 silent skip（保守地視為「自己的服務」）。實務上 Next.js / NestJS / Storybook 從不會這樣做，但若用客製化 launcher 啟動服務需留意。
2. **多個 git worktree 用同一個 PROJECT_ROOT 名稱** —— 例如 `/icp/npt` 跟 `/icp/npt-worktree-feature-x` 兩個 worktree 同時跑 dev server。cwd 比對會把 `npt-worktree-feature-x` 認成「不是 `/icp/npt`」，正確顯示為 ``。但反過來在 worktree 內跑 status，會把 `/icp/npt`（main）的服務也認成「別的專案」。這是預期行為。
3. **Linux 上 `ps` / `lsof` 行為差異** —— `comm=` 在 Linux 是 short name（最多 15 字元），`com.docker.backend` 比對在某些 Linux Desktop 環境可能 miss。`docker-proxy` 是 Linux 上正確的 sentinel pattern，已在 case 中處理。

---

## 觸碰到此邏輯的檔案

```
scripts/commands/status.sh    # check_service: 三層全套
scripts/commands/logs.sh      # check_service_running / view_app_logs
scripts/commands/port.sh      # port_free / port_free_all
scripts/commands/restart.sh   # kill_process
scripts/commands/stop.sh      # kill_process
scripts/commands/clean.sh     # port cleanup × 2
scripts/commands/storage.sh   # SeaweedFS port health + diagnose 加 self container check（避免 nptc forward 誤判 ✓）
scripts/commands/doctor.sh    # S3 endpoint check
```

---

## 驗證方式

```bash
# 1. 看 LISTEN 過濾是否生效（Chrome zombie connection 不該被當服務）
lsof -ti:3000 | head -3                    # 可能列出 Chrome、Storybook、實際 server
lsof -ti:3000 -sTCP:LISTEN | head -1       # 只應列出真正 listen 的 PID

# 2. 看 cwd 比對是否正確
PID=$(lsof -ti:3000 -sTCP:LISTEN | head -1)
lsof -p "$PID" | awk '$4 == "cwd" {print $NF}'    # 應該是 .../apps/frontend

# 3. 跑 status 看綜合判斷
./scripts/cli.sh status
./scripts/cli.sh status --json | jq '{running, app}'
```

---

## 相關文件

- [CLI_GUIDE.md](./CLI_GUIDE.md) - CLI 完整指南
- [TROUBLESHOOTING.md](./TROUBLESHOOTING.md) - 故障排除
- [DOCKER_SETUP.md](./DOCKER_SETUP.md) - Docker 服務設定
