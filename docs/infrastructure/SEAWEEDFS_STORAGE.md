# SeaweedFS 儲存系統指南

完整的 SeaweedFS 分散式檔案系統設置、管理與故障排除指南。

---

## 目錄

- [SeaweedFS 儲存系統指南](#seaweedfs-儲存系統指南)
  - [目錄](#目錄)
  - [概述](#概述)
    - [什麼是 SeaweedFS？](#什麼是-seaweedfs)
    - [為什麼選擇 SeaweedFS？](#為什麼選擇-seaweedfs)
    - [系統架構](#系統架構)
  - [快速開始](#快速開始)
    - [使用 CLI（推薦）](#使用-cli推薦)
    - [手動啟動](#手動啟動)
  - [服務組件](#服務組件)
    - [1. Master Server (Port 9333)](#1-master-server-port-9333)
    - [2. Volume Server (Port 8080)](#2-volume-server-port-8080)
    - [3. Filer (Port 8888)](#3-filer-port-8888)
    - [4. S3 API (Port 8333)](#4-s3-api-port-8333)
  - [常用操作](#常用操作)
    - [啟動與停止](#啟動與停止)
    - [查看狀態](#查看狀態)
    - [健康診斷](#健康診斷)
    - [連接資訊](#連接資訊)
    - [重置資料](#重置資料)
  - [S3 API 使用](#s3-api-使用)
    - [環境變數配置](#環境變數配置)
    - [AWS CLI 配置](#aws-cli-配置)
    - [基本操作](#基本操作)
  - [備份與還原整合](#備份與還原整合)
    - [備份資料](#備份資料)
    - [還原資料](#還原資料)
    - [重置資料時清理檔案](#重置資料時清理檔案)
  - [故障排除](#故障排除)
    - [問題 1：S3 API 連接失敗](#問題-1s3-api-連接失敗)
    - [問題 2：Master 無法訪問](#問題-2master-無法訪問)
    - [問題 3：Volume 磁碟空間不足](#問題-3volume-磁碟空間不足)
    - [問題 4：Filer 元數據錯誤](#問題-4filer-元數據錯誤)
  - [效能優化](#效能優化)
    - [Volume 配置](#volume-配置)
    - [Replication 策略](#replication-策略)
  - [安全性](#安全性)
    - [S3 認證](#s3-認證)
    - [網路隔離](#網路隔離)
  - [相關資源](#相關資源)

---

## 概述

### 什麼是 SeaweedFS？

SeaweedFS 是一個簡單且高度可擴展的分散式檔案系統，為數十億個檔案設計。它支援完整的 POSIX 檔案系統語義和 S3 API。

### 為什麼選擇 SeaweedFS？

- ✅ **S3 相容** - 可作為本地 S3 儲存使用
- ✅ **高效能** - 比傳統檔案系統快數倍
- ✅ **簡單部署** - 單一可執行檔，輕量級
- ✅ **完整功能** - 支援檔案系統和 Object Storage
- ✅ **開發友善** - 無需依賴 AWS/雲端服務

### 系統架構

```text
┌─────────────────────────────────────────────────────┐
│                   應用層                             │
│  Backend (NestJS) ←→ S3 API (Port 8333)             │
└─────────────────────────────────────────────────────┘
                       ↓
┌─────────────────────────────────────────────────────┐
│                SeaweedFS 核心                        │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐          │
│  │  Master  │  │  Volume  │  │  Filer   │          │
│  │  :9333   │  │  :8080   │  │  :8888   │          │
│  └──────────┘  └──────────┘  └──────────┘          │
└─────────────────────────────────────────────────────┘
                       ↓
┌─────────────────────────────────────────────────────┐
│                Docker Volumes                        │
│  • seaweedfs_master_data                             │
│  • seaweedfs_volume_data                             │
│  • seaweedfs_filer_data                              │
└─────────────────────────────────────────────────────┘
```

---

## 快速開始

### 使用 CLI（推薦）

```bash
# 啟動 SeaweedFS
./scripts/cli.sh storage start

# 查看狀態
./scripts/cli.sh storage info

# 健康檢查
./scripts/cli.sh storage diagnose
```

### 手動啟動

```bash
# 啟動服務（使用 storage profile）
docker-compose --env-file .env.docker --profile storage up -d

# 檢查狀態
docker-compose ps
```

---

## 服務組件

### 1. Master Server (Port 9333)

**用途**: 中央協調器，管理 Volume 分配

**Web UI**: http://localhost:9333

**功能**:

- Volume 分配和管理
- 叢集拓撲維護
- 健康監控

**健康檢查**:

```bash
curl http://localhost:9333/cluster/status
```

### 2. Volume Server (Port 8080)

**用途**: 實際儲存檔案資料

**Web UI**: http://localhost:8080/ui/index.html

**功能**:

- 檔案儲存和檢索
- 資料複製
- 磁碟管理

**健康檢查**:

```bash
curl http://localhost:8080/status
```

### 3. Filer (Port 8888)

**用途**: 提供檔案系統語義和元數據管理

**Web UI**: http://localhost:8888

**功能**:

- POSIX 檔案系統介面
- 目錄結構管理
- 元數據儲存

**元數據儲存**: PostgreSQL (TimescaleDB)

### 4. S3 API (Port 8333)

**用途**: S3 相容 API

**端點**: http://localhost:8333

**功能**:

- 標準 S3 操作（GET, PUT, DELETE, LIST）
- Bucket 管理
- Multipart Upload

**認證**: 需要 Access Key 和 Secret Key

---

## 常用操作

### 啟動與停止

```bash
# 啟動
./scripts/cli.sh storage start

# 停止
./scripts/cli.sh storage stop

# 重啟
./scripts/cli.sh storage restart
```

### 查看狀態

```bash
# 在 status 命令中會顯示 SeaweedFS 服務
./scripts/cli.sh status

# 或使用選單
./scripts/cli.sh
# 選擇「3) 查看服務狀態」
```

### 健康診斷

```bash
# 完整健康檢查
./scripts/cli.sh storage diagnose

# 輸出內容：
# ✓ Master Server 可存取
# ✓ Volume Server 可存取
# ✓ Filer 可存取
# ✓ S3 API 端口可連接
# ✓ PostgreSQL 連線正常
```

### 連接資訊

```bash
# 顯示所有連接資訊
./scripts/cli.sh storage info

# 輸出：
# S3 端點:      http://localhost:8333
# Access Key:   admin
# Secret Key:   admin123
# Master UI:    http://localhost:9333
# Volume UI:    http://localhost:8080
# Filer UI:     http://localhost:8888
```

### 重置資料

```bash
# 清空所有資料（包含 Docker volumes）
./scripts/cli.sh storage reset

# ⚠️ 警告：這會刪除所有儲存的檔案！
```

---

## S3 API 使用

### 環境變數配置

在 `.env.docker` 中設置：

```bash
# SeaweedFS S3 配置
SEAWEEDFS_S3_USER=admin
SEAWEEDFS_S3_PASSWORD=admin123
```

在 `apps/backend/.env` 中設置：

```bash
# 儲存類型（local 或 seaweedfs）
FILE_STORAGE_TYPE=seaweedfs

# S3 配置
S3_ENDPOINT=http://localhost:8333
S3_BUCKET=uploads
S3_ACCESS_KEY=admin
S3_SECRET_KEY=admin123
S3_REGION=us-east-1
```

### AWS CLI 配置

```bash
# 安裝 AWS CLI
brew install awscli  # macOS
# 或
pip install awscli

# 配置憑證
aws configure set aws_access_key_id admin
aws configure set aws_secret_access_key admin123
aws configure set region us-east-1
```

### 基本操作

```bash
# 建立 Bucket
aws --endpoint-url=http://localhost:8333 s3 mb s3://uploads

# 列出 Buckets
aws --endpoint-url=http://localhost:8333 s3 ls

# 上傳檔案
aws --endpoint-url=http://localhost:8333 s3 cp file.txt s3://uploads/

# 下載檔案
aws --endpoint-url=http://localhost:8333 s3 cp s3://uploads/file.txt ./

# 列出檔案
aws --endpoint-url=http://localhost:8333 s3 ls s3://uploads/

# 刪除檔案
aws --endpoint-url=http://localhost:8333 s3 rm s3://uploads/file.txt
```

---

## 備份與還原整合

SeaweedFS 已整合到資料管理流程中。

### 備份資料

使用「資料備份」功能會同時備份：

- PostgreSQL 資料庫
- 檔案儲存（根據 `FILE_STORAGE_TYPE` 設定）

```bash
./scripts/cli.sh
# 選擇「10) 資料管理」→「資料備份/還原」→「1) 備份資料」

# 或使用命令列
./scripts/cli.sh db backup
```

**備份流程**:

1. 備份 PostgreSQL 資料庫 → `.sql.gz` 檔案
2. 備份檔案儲存：
   - 如果 `FILE_STORAGE_TYPE=local`: 打包 `apps/backend/uploads/` → `.tar.gz`
   - 如果 `FILE_STORAGE_TYPE=seaweedfs`: 從 S3 下載所有檔案 → `.tar.gz`

### 還原資料

```bash
./scripts/cli.sh
# 選擇「10) 資料管理」→「資料備份/還原」→「2) 還原資料」

# 會提示選擇備份檔案，然後：
# 1. 還原 PostgreSQL 資料庫
# 2. 還原檔案儲存（解壓到對應位置）
```

### 重置資料時清理檔案

```bash
./scripts/cli.sh
# 選擇「9) 重置資料」

# 會詢問：
# ⚠ 重置資料庫時，是否也要清理上傳的檔案？
#
# 檔案儲存狀態
# ────────────────────────────────────────
#   儲存類型: seaweedfs
#   Bucket: uploads
#   檔案數量: 15 個
# ────────────────────────────────────────
#
# ? 是否清理所有上傳的檔案？ [y/N]:
```

---

## 故障排除

### 問題 1：S3 API 連接失敗

**症狀**:

```text
ERROR: Unable to connect to S3 endpoint
```

**診斷**:

```bash
# 檢查服務狀態
./scripts/cli.sh storage diagnose

# 檢查端口
lsof -i :8333
```

**解決方案**:

```bash
# 重啟 S3 服務
./scripts/cli.sh storage restart
```

### 問題 2：Master 無法訪問

**症狀**:

```bash
curl http://localhost:9333/cluster/status
# 連接被拒絕
```

**解決方案**:

```bash
# 檢查容器狀態
docker ps | grep seaweedfs-master

# 查看日誌
./scripts/cli.sh logs seaweedfs-master -f

# 重啟 Master
docker restart npt-seaweedfs-master
```

### 問題 3：Volume 磁碟空間不足

**症狀**:

```text
ERROR: no free volumes
```

**診斷**:

```bash
# 檢查磁碟使用量
docker exec npt-seaweedfs-volume df -h
```

**解決方案**:

```bash
# 清理舊資料
./scripts/cli.sh storage reset

# 或擴展 Volume 限制（編輯 docker-compose.yml）
seaweedfs-volume:
  command: "-max=1000"  # 增加 Volume 數量
```

### 問題 4：Filer 元數據錯誤

**症狀**:

```text
ERROR: filer metadata store error
```

**診斷**:

```bash
# 檢查 PostgreSQL 連線
./scripts/cli.sh doctor

# 查看 Filer 日誌
./scripts/cli.sh logs seaweedfs-filer -f
```

**解決方案**:

```bash
# 重置 Filer 元數據
./scripts/cli.sh storage reset

# 或手動清理 PostgreSQL 表（謹慎使用）
docker exec npt-timescaledb psql -U postgres -d npt_db -c "DROP SCHEMA IF EXISTS seaweedfs CASCADE;"
```

---

## 效能優化

### Volume 配置

在 `docker-compose.yml` 中調整：

```yaml
seaweedfs-volume:
  command: >-
    volume
    -mserver=seaweedfs-master:9333
    -port=8080
    -max=100              # 最大 Volume 數量
    -dataCenter=dc1        # 資料中心
    -rack=rack1            # Rack 位置
```

### Replication 策略

```bash
# 設定副本策略（3 副本）
curl "http://localhost:9333/vol/grow?replication=001&count=3"

# 副本策略說明：
# 000 - 無副本
# 001 - 1 個副本（不同 rack）
# 010 - 1 個副本（不同資料中心）
# 200 - 2 個副本（同一個 rack）
```

---

## 安全性

### S3 認證

SeaweedFS S3 API 使用 AWS 簽名認證：

```bash
# 在 .env.docker 中設定
SEAWEEDFS_S3_USER=your-access-key
SEAWEEDFS_S3_PASSWORD=your-secret-key
```

**注意**: 所有 S3 API 端點都需要認證，無法使用簡單的 HTTP 請求測試。

### 網路隔離

生產環境建議配置：

```yaml
services:
  seaweedfs-master:
    networks:
      - internal
    # 不暴露到外部網路
```

---

## 相關資源

- [SeaweedFS 官方文件](https://github.com/seaweedfs/seaweedfs/wiki)
- [S3 API 相容性](https://github.com/seaweedfs/seaweedfs/wiki/Amazon-S3-API)
- [CLI Guide](../getting-started/CLI_GUIDE.md)
- [Backup & Restore](../database/BACKUP_RESTORE.md)
- [Docker Setup](../getting-started/DOCKER_SETUP.md)
