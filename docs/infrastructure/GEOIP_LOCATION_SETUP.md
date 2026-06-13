# GeoIP 地理位置功能配置指南

會話管理中的地理位置查詢配置，支援本地開發與生產環境的不同策略。

---

## 目錄

- [GeoIP 地理位置功能配置指南](#geoip-地理位置功能配置指南)
  - [目錄](#目錄)
  - [概述](#概述)
    - [核心特色](#核心特色)
  - [問題說明](#問題說明)
    - [症狀](#症狀)
    - [原因分析](#原因分析)
  - [解決方案](#解決方案)
    - [方案 1：簡化本地 IP 處理（開發環境推薦）](#方案-1簡化本地-ip-處理開發環境推薦)
    - [方案 2：完整 GeoIP 配置（生產環境必須）](#方案-2完整-geoip-配置生產環境必須)
    - [方案 3：Docker 環境配置](#方案-3docker-環境配置)
  - [快速開始](#快速開始)
    - [開發環境設置](#開發環境設置)
    - [生產環境設置](#生產環境設置)
  - [詳細配置步驟](#詳細配置步驟)
    - [1️⃣ 註冊 MaxMind 帳號](#1️⃣-註冊-maxmind-帳號)
    - [2️⃣ 下載 GeoLite2 數據庫](#2️⃣-下載-geolite2-數據庫)
    - [3️⃣ 配置環境變數](#3️⃣-配置環境變數)
    - [4️⃣ 重啟並驗證](#4️⃣-重啟並驗證)
  - [測試驗證](#測試驗證)
    - [測試 1：本地 IP 處理](#測試-1本地-ip-處理)
    - [測試 2：真實 IP 處理](#測試-2真實-ip-處理)
  - [數據庫更新策略](#數據庫更新策略)
    - [手動更新](#手動更新)
    - [自動更新（推薦）](#自動更新推薦)
    - [Docker 環境自動更新](#docker-環境自動更新)
  - [環境建議](#環境建議)
    - [開發環境 (Local)](#開發環境-local)
    - [測試環境 (UAT)](#測試環境-uat)
    - [生產環境 (Production)](#生產環境-production)
  - [故障排除](#故障排除)
    - [問題 1：Location 仍然為 null](#問題-1location-仍然為-null)
    - [問題 2：GeoIP 服務未啟用](#問題-2geoip-服務未啟用)
    - [問題 3：數據庫文件未找到](#問題-3數據庫文件未找到)
  - [安全與合規](#安全與合規)
    - [隱私保護](#隱私保護)
    - [數據保護](#數據保護)
    - [License 合規](#license-合規)
  - [最佳實踐](#最佳實踐)
    - [推薦做法](#推薦做法)
    - [避免做法](#避免做法)
  - [相關文檔](#相關文檔)

---

## 概述

GeoIP 服務為會話管理提供地理位置查詢功能，可以根據 IP 地址自動識別用戶的地理位置。系統設計支援開發環境簡化處理和生產環境完整功能的靈活配置。

### 核心特色

- ✅ **智能本地 IP 識別** - 自動檢測並標記本地訪問
- ✅ **生產環境完整支援** - 使用 MaxMind GeoLite2 數據庫
- ✅ **靈活配置** - 根據環境選擇合適的方案
- ✅ **降級處理** - 查詢失敗不影響核心功能
- ✅ **Docker 整合** - 支援容器化部署
- ✅ **自動更新** - 可配置定期更新地理數據庫

---

## 問題說明

### 症狀

會話管理中的 Location 字段顯示為空或 null。

### 原因分析

**開發環境：**

- 測試和本地訪問的 IP 地址是 `::1` (IPv6 localhost) 或 `127.0.0.1` (IPv4 localhost)
- GeoIP 數據庫未配置（`GEOIP_DB_PATH` 環境變數未設置）
- 即使配置了 GeoIP，本地 IP 也無法查詢到真實地理位置

**生產環境：**

- 用戶訪問來自真實的公網 IP
- 需要 GeoIP 數據庫來查詢地理位置
- MaxMind GeoLite2 數據庫需要註冊並下載

---

## 解決方案

### 方案 1：簡化本地 IP 處理（開發環境推薦）

**優點：**

- ✅ 無需下載 GeoIP 數據庫
- ✅ 開發環境即時可用
- ✅ 減少依賴和配置復雜度

**實現方式：**

已在 `session-management.service.ts` 中添加本地 IP 檢測：

```typescript
// 檢查是否為本地 IP
const isLocalIP =
  ipAddress === '127.0.0.1' ||
  ipAddress === '::1' ||
  ipAddress === 'localhost' ||
  ipAddress.startsWith('192.168.') ||
  ipAddress.startsWith('10.') ||
  ipAddress.startsWith('172.');

if (isLocalIP) {
  location = 'Local'; // 本地訪問直接標記為 "Local"
} else {
  location = await this.geoipService.getLocationString(ipAddress);
}
```

**效果：**

- 本地訪問顯示：`"Local"`
- 真實 IP 顯示：通過 GeoIP 查詢結果（如果已配置）

### 方案 2：完整 GeoIP 配置（生產環境必須）

**適用場景：**

- 生產環境部署
- ⚠️ 需要精確地理位置數據
- ⚠️ 用戶來自真實公網 IP

**配置要求：**

1. 註冊 MaxMind 免費帳號
2. 下載 GeoLite2-City 數據庫
3. 配置環境變數指向數據庫文件
4. 定期更新數據庫

### 方案 3：Docker 環境配置

**docker-compose.yml 範例：**

```yaml
services:
  backend:
    volumes:
      - ./apps/backend/data/geoip:/app/data/geoip:ro
    environment:
      - GEOIP_DB_PATH=/app/data/geoip/GeoLite2-City.mmdb
```

---

## 快速開始

### 開發環境設置

開發環境無需額外配置，本地 IP 會自動標記為 "Local"。

```bash
# 1. 啟動服務
./scripts/cli.sh dev

# 2. 測試登入
pnpm tsx scripts/test-customer-login-flow.ts

# 3. 檢查會話 location
pnpm tsx scripts/check-session-location.ts
```

**預期結果：**

```text
IP 地址: ::1
Location: "Local"
```

### 生產環境設置

生產環境需要完整配置 GeoIP 數據庫。

```bash
# 1. 創建目錄
mkdir -p apps/backend/data/geoip

# 2. 下載數據庫（見下方詳細步驟）

# 3. 配置環境變數
echo "GEOIP_DB_PATH=./data/geoip/GeoLite2-City.mmdb" >> apps/backend/.env

# 4. 重啟服務
./scripts/cli.sh restart backend
```

---

## 詳細配置步驟

### 1️⃣ 註冊 MaxMind 帳號

1. 訪問 <https://www.maxmind.com/en/geolite2/signup>
2. 創建免費帳號
3. 登入後訪問 <https://www.maxmind.com/en/accounts/current/license-key>
4. 創建 License Key（記錄 Account ID 和 License Key）

### 2️⃣ 下載 GeoLite2 數據庫

#### 方法 1：使用 geoipupdate（推薦）

```bash
# macOS
brew install geoipupdate

# Ubuntu/Debian
apt-get install geoipupdate

# 配置 geoipupdate
cat > /usr/local/etc/GeoIP.conf << EOF
AccountID YOUR_ACCOUNT_ID
LicenseKey YOUR_LICENSE_KEY
EditionIDs GeoLite2-City
DatabaseDirectory apps/backend/data/geoip
EOF

# 下載數據庫
geoipupdate
```

#### 方法 2：手動下載

1. 登入 MaxMind 網站
2. 訪問 <https://www.maxmind.com/en/accounts/current/geoip/downloads>
3. 下載 "GeoLite2 City" (GZIP 格式)
4. 解壓並移動到 `apps/backend/data/geoip/GeoLite2-City.mmdb`

### 3️⃣ 配置環境變數

```bash
# apps/backend/.env
GEOIP_DB_PATH=./data/geoip/GeoLite2-City.mmdb
```

### 4️⃣ 重啟並驗證

```bash
# 重啟後端服務
./scripts/cli.sh restart backend

# 查看日誌，應該看到成功訊息
./scripts/cli.sh logs backend
```

**成功訊息：**

```text
[GeoIP] Service initialized successfully
```

**失敗訊息：**

```text
[GeoIP] GEOIP_DB_PATH not configured. Location lookup will be disabled.
```

---

## 測試驗證

### 測試 1：本地 IP 處理

```bash
# 執行登入測試
pnpm tsx scripts/test-customer-login-flow.ts

# 檢查會話 location
pnpm tsx scripts/check-session-location.ts
```

**預期結果：**

```text
IP 地址: ::1
Location: "Local"
```

### 測試 2：真實 IP 處理

需要配置 GeoIP 數據庫後，從遠端訪問應用進行測試。

**預期結果：**

```text
IP 地址: 203.0.113.1
Location: "Taipei, Taiwan"
```

---

## 數據庫更新策略

### 手動更新

```bash
# 使用 geoipupdate 重新下載
geoipupdate

# 或手動下載新版本並替換舊文件
```

### 自動更新（推薦）

**使用 cron job（每週三凌晨 3 點更新）：**

```bash
0 3 * * 3 /usr/local/bin/geoipupdate
```

**使用 systemd timer：**

```bash
# /etc/systemd/system/geoipupdate.timer
[Unit]
Description=Update GeoIP database weekly

[Timer]
OnCalendar=Wed *-*-* 03:00:00
Persistent=true

[Install]
WantedBy=timers.target
```

### Docker 環境自動更新

```yaml
# docker-compose.yml
services:
  geoipupdate:
    image: ghcr.io/maxmind/geoipupdate
    environment:
      - GEOIPUPDATE_ACCOUNT_ID=${MAXMIND_ACCOUNT_ID}
      - GEOIPUPDATE_LICENSE_KEY=${MAXMIND_LICENSE_KEY}
      - GEOIPUPDATE_EDITION_IDS=GeoLite2-City
      - GEOIPUPDATE_FREQUENCY=168 # 每週更新（小時數）
    volumes:
      - ./apps/backend/data/geoip:/usr/share/GeoIP
```

---

## 環境建議

### 開發環境 (Local)

- ✅ 使用方案 1：簡化處理
- ✅ 無需配置 GeoIP 數據庫
- ✅ Location 顯示 "Local"
- ✅ 降低開發環境配置複雜度

### 測試環境 (UAT)

- ⚠️ 可選配置 GeoIP
- 如果需要測試地理位置功能，配置 GeoIP
- 如果只是功能測試，可以使用方案 1

### 生產環境 (Production)

- **必須**配置 GeoIP
- 下載並定期更新 GeoLite2 數據庫
- 配置自動更新腳本（每週或每月）
- 監控數據庫更新狀態
- 監控服務初始化日誌

---

## 故障排除

### 問題 1：Location 仍然為 null

**檢查清單：**

1. ✅ 確認已修改 `session-management.service.ts`
2. ✅ 重啟後端服務
3. ✅ 清除舊的會話，創建新的會話測試

**解決步驟：**

```bash
# 重啟後端
./scripts/cli.sh restart backend

# 測試新登入
pnpm tsx scripts/test-customer-login-flow.ts

# 檢查 location
pnpm tsx scripts/check-session-location.ts
```

### 問題 2：GeoIP 服務未啟用

**日誌顯示：**

```text
[GeoIP] GEOIP_DB_PATH not configured. Location lookup will be disabled.
```

**解決方法：**

1. ✅ 檢查 `.env` 文件是否有 `GEOIP_DB_PATH`

   ```bash
   grep GEOIP_DB_PATH apps/backend/.env
   ```

2. ✅ 檢查數據庫文件是否存在

   ```bash
   ls -lh apps/backend/data/geoip/GeoLite2-City.mmdb
   ```

3. ✅ 檢查文件路徑是否正確（相對路徑 vs 絕對路徑）

### 問題 3：數據庫文件未找到

**日誌顯示：**

```text
[GeoIP] Database file not found at /path/to/GeoLite2-City.mmdb
```

**解決方法：**

1. ✅ 確認文件已下載

   ```bash
   ls -lh apps/backend/data/geoip/
   ```

2. ✅ 檢查文件權限

   ```bash
   chmod 644 apps/backend/data/geoip/GeoLite2-City.mmdb
   ```

3. ✅ 確認路徑配置正確

   ```bash
   # 如果使用相對路徑，確保從 apps/backend 目錄執行
   GEOIP_DB_PATH=./data/geoip/GeoLite2-City.mmdb

   # 或使用絕對路徑
   GEOIP_DB_PATH=/absolute/path/to/apps/backend/data/geoip/GeoLite2-City.mmdb
   ```

---

## 安全與合規

### 隱私保護

- ✅ GeoIP 只提供大致位置（城市級別）
- ✅ 不會暴露精確地址
- ✅ 符合 GDPR 隱私保護要求
- ✅ 不收集或存儲超出必要的位置信息

### 數據保護

- ✅ GeoLite2 數據庫包含敏感信息，不要提交到版本控制
- ✅ 添加到 `.gitignore`：

```bash
# .gitignore
apps/backend/data/geoip/*.mmdb
```

- ✅ 限制數據庫文件的訪問權限（Docker 使用 `:ro` 只讀掛載）

### License 合規

- ✅ GeoLite2 是免費但有使用條款
- ✅ 閱讀並遵守 [MaxMind 使用協議](https://www.maxmind.com/en/geolite2/eula)
- ❌ 不要重新分發數據庫文件
- ❌ 不要用於商業數據販售

---

## 最佳實踐

### 推薦做法

1. **開發環境**：使用簡化的本地 IP 處理
2. **生產環境**：配置完整的 GeoIP 功能
3. **定期更新**：設置自動更新 GeoIP 數據庫（每週或每月）
4. **監控日誌**：監控 GeoIP 服務初始化狀態
5. **降級處理**：Location 查詢失敗時不影響主功能
6. **安全存儲**：將數據庫文件添加到 `.gitignore`
7. **權限控制**：限制數據庫文件的訪問權限

### 避免做法

1. **不要**：將 GeoIP 數據庫提交到 Git
2. **不要**：在所有環境強制要求 GeoIP
3. **不要**：使用過時的 GeoIP 數據庫（定期更新）
4. **不要**：忽略 GeoIP 服務的錯誤日誌
5. **不要**：依賴 Location 作為關鍵業務邏輯
6. **不要**：在開發環境浪費時間配置 GeoIP

---

## 相關文檔

- **GeoIP Service**: `apps/backend/src/common/services/geoip.service.ts`
- **Session Management**: `apps/backend/src/auth/session-management.service.ts`
- **環境變數範例**: `apps/backend/.env.example`
- [MaxMind GeoLite2](https://dev.maxmind.com/geoip/geolite2-free-geolocation-data) - 官方文檔
- [GeoIP2 Node.js API](https://github.com/maxmind/GeoIP2-node) - Node.js SDK
- [geoipupdate](https://github.com/maxmind/geoipupdate) - 自動更新工具
