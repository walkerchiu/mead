# 資料庫備份與還原指南

完整的資料庫備份與還原操作指南，包含多環境安全機制與最佳實踐。

---

## 📋 目錄

- [資料庫備份與還原指南](#資料庫備份與還原指南)
  - [📋 目錄](#-目錄)
  - [📖 概述](#-概述)
  - [🚀 快速開始](#-快速開始)
    - [備份資料庫](#備份資料庫)
    - [還原資料庫](#還原資料庫)
    - [列出備份](#列出備份)
    - [清理舊備份](#清理舊備份)
  - [📂 備份檔案結構](#-備份檔案結構)
    - [目錄組織](#目錄組織)
    - [檔案命名規則](#檔案命名規則)
  - [🔧 環境差異](#-環境差異)
    - [開發環境 (Development)](#開發環境-development)
      - [備份方式](#備份方式)
      - [還原方式](#還原方式)
    - [UAT/生產環境 (UAT/Production)](#uat生產環境-uatproduction)
      - [備份方式](#備份方式-1)
      - [還原方式](#還原方式-1)
  - [🔒 生產環境安全措施](#-生產環境安全措施)
    - [多層確認機制](#多層確認機制)
      - [第一層：環境警告](#第一層環境警告)
      - [第二層：備份資訊展示](#第二層備份資訊展示)
      - [第三層：特殊確認](#第三層特殊確認)
      - [第四層：二次確認](#第四層二次確認)
      - [第五層：最終確認](#第五層最終確認)
  - [📊 備份策略](#-備份策略)
    - [自動壓縮](#自動壓縮)
    - [保留策略](#保留策略)
    - [清理示例](#清理示例)
  - [🚨 緊急還原流程](#-緊急還原流程)
    - [情境：生產環境資料遺失](#情境生產環境資料遺失)
      - [1. 停止應用服務](#1-停止應用服務)
      - [2. 執行還原](#2-執行還原)
      - [3. 驗證資料](#3-驗證資料)
      - [4. 測試應用](#4-測試應用)
      - [5. 啟動服務](#5-啟動服務)
      - [6. 監控日誌](#6-監控日誌)
  - [📝 資料驗證](#-資料驗證)
    - [自動驗證](#自動驗證)
    - [手動驗證](#手動驗證)
    - [完整性檢查](#完整性檢查)
  - [⚡ 效能優化](#-效能優化)
    - [大型資料庫備份](#大型資料庫備份)
    - [還原效能](#還原效能)
  - [🚨 故障排除](#-故障排除)
    - [問題 1：備份檔案損壞](#問題-1備份檔案損壞)
    - [問題 2：容器名稱不匹配](#問題-2容器名稱不匹配)
    - [問題 3：權限不足](#問題-3權限不足)
    - [問題 4：磁碟空間不足](#問題-4磁碟空間不足)
  - [🔒 安全性](#-安全性)
    - [備份檔案安全](#備份檔案安全)
    - [審計追蹤](#審計追蹤)
  - [⏱️ 定期維護](#️-定期維護)
    - [每日任務](#每日任務)
    - [每週任務](#每週任務)
    - [每月任務](#每月任務)
  - [📚 相關資源](#-相關資源)

---

## 📖 概述

本文檔介紹如何使用 Starter CLI 進行資料庫備份與還原操作，包含開發、UAT、生產環境的最佳實踐。

---

## 🚀 快速開始

### 備份資料庫

```bash
./scripts/cli.sh
# 選擇 10 → 1
```

**輸出**：

```text
✓ 備份完成（已壓縮）
  環境: development
  檔案: starter_db_development_20260201_233215.sql.gz
  路徑: /path/to/backups/development/starter_db_development_20260201_233215.sql.gz
  大小: 8.0K
```

### 還原資料庫

```bash
./scripts/cli.sh
# 選擇 10 → 2 → 選擇備份檔案
```

### 列出備份

```bash
./scripts/cli.sh
# 選擇 10 → 3
```

### 清理舊備份

```bash
./scripts/cli.sh
# 選擇 10 → 4
```

---

## 📂 備份檔案結構

### 目錄組織

```text
backups/                    # ⚠️ 不納入版控（已加入 .gitignore）
├── development/
│   ├── starter_db_development_20260201_150530.sql.gz
│   ├── starter_db_development_20260201_140215.sql.gz
│   └── emergency_backup_development_20260201_120000.sql.gz
├── uat/
│   ├── starter_db_uat_20260201_120000.sql.gz
│   └── starter_db_uat_20260131_230000.sql.gz
└── production/
    ├── starter_db_production_20260201_000000.sql.gz
    └── emergency_backup_production_20260201_153000.sql.gz
```

**重要提示**：

- ⚠️ `backups/` 目錄已加入 `.gitignore`，不會被 git 追踪
- 💾 備份檔案僅存於本地，請自行規劃異地備份策略
- 🔒 生產環境備份含敏感資料，務必妥善保管

### 檔案命名規則

**一般備份**：

```text
starter_db_{environment}_{timestamp}.sql.gz
```

**緊急備份**：

```text
emergency_backup_{environment}_{timestamp}.sql.gz
```

**時間戳記格式**：`YYYYMMDD_HHMMSS`

---

## 🔧 環境差異

### 開發環境 (Development)

#### 備份方式

```bash
# 簡單直接的備份
docker exec starter-timescaledb pg_dump -U postgres -d starter_db > backup.sql
gzip backup.sql
```

#### 還原方式

```bash
# 完全重建資料庫
DROP DATABASE starter_db;
CREATE DATABASE starter_db;
# 還原資料
gunzip -c backup.sql.gz | psql -d starter_db -q
```

**特點**：

- ✅ 快速簡單
- ✅ 不需確認
- ✅ 完全重建
- ✅ 無風險

---

### UAT/生產環境 (UAT/Production)

#### 備份方式

```bash
# 使用 --clean 選項的安全備份
pg_dump \
  --clean \           # 包含 DROP 語句
  --if-exists \       # 使用 IF EXISTS
  --no-owner \        # 不還原擁有者
  --no-privileges \   # 不還原權限
  -d starter_db \
  > backup.sql
gzip backup.sql
```

#### 還原方式

```bash
# 安全還原流程
1. 建立緊急備份
2. 中斷所有連線
3. 清理 Schema（保留資料庫）
4. 還原資料
5. 驗證完整性
```

**特點**：

- ✅ 保留資料庫設定
- ✅ 多層確認
- ✅ 自動緊急備份
- ✅ 資料驗證

---

## 🔒 生產環境安全措施

### 多層確認機制

#### 第一層：環境警告

```text
⚠️  生產環境還原 - 這是一個高風險操作！
```

#### 第二層：備份資訊展示

```text
備份資訊：
  檔案: starter_db_production_20260201_233215.sql.gz
  大小: 8.0K
  修改時間: 2026-02-01 23:32:15

這將會：
  1. 建立緊急備份
  2. 中斷所有資料庫連線
  3. 清理現有資料結構
  4. 還原備份資料
```

#### 第三層：特殊確認

```text
請輸入 'RESTORE PRODUCTION' 確認：
> RESTORE PRODUCTION
```

#### 第四層：二次確認

```text
確定要繼續嗎？這可能影響線上服務。 [y/N]:
> y
```

#### 第五層：最終確認

```text
請輸入 'PRODUCTION' 以確認：
> PRODUCTION
```

---

## 📊 備份策略

### 自動壓縮

所有備份自動使用 gzip 壓縮：

**壓縮率**：通常可減少 80-90% 空間

```bash
# 原始備份
starter_db_development_20260201.sql      # 40 MB

# 壓縮後
starter_db_development_20260201.sql.gz   # 8 MB (80% 減少)
```

### 保留策略

**開發環境**：

- 保留最近 10 個備份
- 建議每日清理

**UAT 環境**：

- 保留最近 30 個備份
- 建議每週清理

**生產環境**：

- 保留最近 90 個備份
- 建議每月清理
- 額外保留月度備份

### 清理示例

```bash
# 保留最近 5 個備份
./scripts/cli.sh
# 10 → 4 → 選擇環境 → 輸入 5

# 輸出
環境 development: 發現 10 個備份
  刪除: starter_db_development_20260125_120000.sql.gz
  刪除: starter_db_development_20260126_120000.sql.gz
  刪除: starter_db_development_20260127_120000.sql.gz
  刪除: starter_db_development_20260128_120000.sql.gz
  刪除: starter_db_development_20260129_120000.sql.gz
✓ 環境 development: 刪除了 5 個備份
✓ 清理完成：共刪除 5 個備份，釋放 40MB 空間
```

---

## 🚨 緊急還原流程

### 情境：生產環境資料遺失

#### 1. 停止應用服務

```bash
# 避免新資料寫入
systemctl stop backend-service
systemctl stop frontend-service
```

#### 2. 執行還原

```bash
./scripts/cli.sh
# 10 → 2 → 選擇最近備份
```

#### 3. 驗證資料

```bash
# 檢查關鍵資料表
psql -d starter_db -c "SELECT COUNT(*) FROM users;"
psql -d starter_db -c "SELECT COUNT(*) FROM roles;"
```

#### 4. 測試應用

```bash
# 測試登入
curl -X POST http://localhost:4000/graphql \
  -H "Content-Type: application/json" \
  -d '{"query":"mutation { login(email:\"test@example.com\", password:\"password\") { token } }"}'
```

#### 5. 啟動服務

```bash
systemctl start backend-service
systemctl start frontend-service
```

#### 6. 監控日誌

```bash
./scripts/cli.sh logs backend
```

---

## 📝 資料驗證

### 自動驗證

還原後自動執行：

```bash
✓ Users 表: 1 筆記錄
✓ Roles 表: 3 筆記錄
```

### 手動驗證

```bash
# 進入資料庫
docker exec -it starter-timescaledb psql -U postgres -d starter_db

# 檢查資料表
\dt

# 檢查記錄數
SELECT
  'users' as table_name, COUNT(*) FROM users
UNION ALL
SELECT
  'roles' as table_name, COUNT(*) FROM roles
UNION ALL
SELECT
  'permissions' as table_name, COUNT(*) FROM permissions;
```

### 完整性檢查

```bash
# 檢查外鍵約束
SELECT
  conname AS constraint_name,
  conrelid::regclass AS table_name
FROM pg_constraint
WHERE contype = 'f';

# 檢查索引
\di

# 檢查序列
\ds
```

---

## ⚡ 效能優化

### 大型資料庫備份

**使用並行備份**（生產環境）：

```bash
pg_dump \
  --jobs=4 \           # 使用 4 個並行工作
  --format=directory \ # 目錄格式
  --file=backup_dir \
  -d starter_db
```

### 還原效能

**調整 PostgreSQL 設定**（暫時）：

```sql
-- 還原前
ALTER SYSTEM SET maintenance_work_mem = '1GB';
ALTER SYSTEM SET max_wal_size = '4GB';
SELECT pg_reload_conf();

-- 還原後恢復
ALTER SYSTEM RESET maintenance_work_mem;
ALTER SYSTEM RESET max_wal_size;
SELECT pg_reload_conf();
```

---

## 🚨 故障排除

### 問題 1：備份檔案損壞

**症狀**：

```text
ERROR: invalid compressed data
```

**解決方案**：

```bash
# 測試壓縮檔完整性
gzip -t backup.sql.gz

# 如果損壞，使用緊急備份
ls -lt backups/production/emergency_*.gz
```

---

### 問題 2：容器名稱不匹配

**症狀**：

```text
Error: No such container: postgres
```

**解決方案**：

```bash
# 檢查容器名稱
docker ps --format "{{.Names}}"

# 設定正確名稱
# 編輯 .env.docker
POSTGRES_CONTAINER_NAME=starter-timescaledb
```

**詳細說明**：參考 [Docker 容器命名指南](../DOCKER_CONTAINER_NAMING.md)

---

### 問題 3：權限不足

**症狀**：

```text
ERROR: permission denied for database starter_db
```

**解決方案**：

```bash
# 檢查使用者權限
psql -d postgres -c "\du"

# 授予權限
psql -d postgres -c "GRANT ALL PRIVILEGES ON DATABASE starter_db TO postgres;"
```

---

### 問題 4：磁碟空間不足

**症狀**：

```text
ERROR: could not write to file: No space left on device
```

**解決方案**：

```bash
# 檢查磁碟空間
df -h

# 清理舊備份
./scripts/cli.sh
# 10 → 4 → 選擇環境 → 保留數量 3

# 清理 Docker volumes
docker volume prune
```

---

## 🔒 安全性

### 備份檔案安全

1. **加密備份**（生產環境）：

```bash
# 備份時加密
pg_dump -d starter_db | gzip | gpg --encrypt > backup.sql.gz.gpg

# 還原時解密
gpg --decrypt backup.sql.gz.gpg | gunzip | psql -d starter_db
```

2. **安全儲存**：
   - 不要在版本控制中保存備份
   - 使用獨立儲存服務（S3、GCS）
   - 異地備份（不同資料中心）

3. **存取控制**：

```bash
# 設定備份檔案權限
chmod 600 backups/**/*.sql.gz
chown postgres:postgres backups/**/*.sql.gz
```

### 審計追蹤

所有還原操作應記錄：

- 執行時間
- 執行者
- 備份檔案
- 還原結果

---

## ⏱️ 定期維護

### 每日任務

- [ ] 備份開發環境資料庫
- [ ] 清理超過 10 天的開發環境備份

### 每週任務

- [ ] 備份 UAT 環境資料庫
- [ ] 測試最近的備份是否可還原
- [ ] 清理 UAT 環境舊備份

### 每月任務

- [ ] 備份生產環境資料庫
- [ ] 完整還原測試（UAT 環境）
- [ ] 備份檔案完整性檢查
- [ ] 異地備份同步

---

## 📚 相關資源

- [Database Layer](./DATABASE_LAYER.md)
- [Docker 容器命名指南](../infrastructure/DOCKER_CONTAINER_NAMING.md)
- [環境設定](../infrastructure/ENVIRONMENT_SETUP.md)
