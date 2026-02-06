# Starter CLI 工具

專案管理 CLI 工具，提供互動式命令列介面，管理整個開發環境。

---

## 目錄結構

```text
scripts/
├── cli.sh                    # 主程式（唯一需要執行的腳本）
├── commands/                 # 各功能指令實作
│   ├── init.sh               # 環境初始化
│   ├── dev.sh                # 開發模式啟動
│   ├── status.sh             # 服務狀態查詢
│   ├── restart.sh            # 服務重啟
│   ├── stop.sh               # 停止服務
│   ├── logs.sh               # 日誌查看
│   ├── test.sh               # 測試執行
│   ├── clean.sh              # 清理快取
│   ├── db.sh                 # 資料庫管理
│   ├── doctor.sh             # 環境診斷
│   ├── deps.sh               # 依賴管理
│   ├── port.sh               # 端口管理
│   ├── env.sh                # 環境變數管理
│   └── test-services-safe.sh # Docker 服務健康檢查（內部輔助腳本）
└── utils/                    # 共用工具函數
    └── common.sh             # 公用函數庫
```

---

## 🚀 快速上手

### 使用方式 1：互動式選單（推薦）

```bash
# 執行主程式
./scripts/cli.sh

# 會顯示選單，輸入數字選擇功能
```

### 使用方式 2：直接執行命令

```bash
# 語法
./scripts/cli.sh <command> [options]

# 範例
./scripts/cli.sh init        # 初始化環境
./scripts/cli.sh dev         # 啟動開發模式
./scripts/cli.sh status      # 查看服務狀態
```

---

## 📋 主要命令

### 1️⃣ cli.sh（主程式）

**類型**：主程式 + 選單系統  
**用途**：所有功能的統一入口

**使用方式**：

```bash
# 互動式選單
./scripts/cli.sh

# 直接執行命令
./scripts/cli.sh <command>
```

**互動式選單**：

```text
╔════════════════════════════════════════╗
║  🌪️  Starter CLI v1.0.0
║  開發工作流程管理工具 - 互動式選單
╚════════════════════════════════════════╝

  ── 🚀 啟動與開發 ──
   1) 初始化環境 (init)
   2) 啟動開發模式 (dev)
   3) 查看服務狀態 (status)

  ── 🔧 服務管理 ──
   4) 停止服務 (stop)
   5) 重啟服務 (restart)
   6) 查看日誌 (logs)

  ── 🧪 品質與測試 ──
   7) 執行測試 (test)
   8) 環境診斷 (doctor)

  ── 💾 資料與環境 ──
   9) 資料庫管理 (db)
  10) 環境變數管理 (env)

  ── 🛠️ 維護工具 ──
  11) 清理快取 (clean)
  12) 依賴管理 (deps)
  13) 端口管理 (port)

  ── 📖 說明 ──
  14) 查看完整說明 (help)
  15) 查看版本資訊 (version)

  16) ❌ 離開

請選擇 [1-16]:
```

---

## 🔧 Commands 資料夾

每個命令都是獨立的腳本，負責特定功能：

### init.sh - 環境初始化

- 檢查系統需求
- 安裝依賴
- 啟動 Docker 服務
- 初始化資料庫

### dev.sh - 開發模式

- 啟動所有開發服務（前端、後端、Storybook）
- 前端熱重載
- 後端監聽變更
- 支援單獨啟動前端、後端、Storybook 或組合模式

### status.sh - 狀態查詢

- 查看所有服務狀態（含 Storybook）
- 健康檢查
- 持續監控模式

### stop.sh - 停止服務

- 停止指定服務
- 支援前端/後端/Storybook/Docker/全部

### restart.sh - 服務重啟

- 重啟指定服務
- 支援前端/後端/Storybook/Docker/全部

### logs.sh - 日誌查看

- 查看各服務日誌（含 Storybook）
- 即時追蹤模式
- 日誌過濾

### test.sh - 測試執行

- 執行單元測試
- 整合測試
- Watch 模式

### clean.sh - 清理快取

- 清理 node_modules
- 清理建置快取
- 清理 Docker volumes

### db.sh - 資料庫管理

- Migration 管理
- 備份與還原
- Seed 資料（支援環境感知）

### doctor.sh - 環境診斷

- 檢測環境問題
- 自動修復
- 提供建議

### deps.sh - 依賴管理

- 安裝/更新依賴
- 檢查過期套件
- 清理並重新安裝

### port.sh - 端口管理

- 查看端口使用狀況
- 檢查端口衝突
- 釋放被佔用的端口

### env.sh - 環境變數管理

- 切換環境（local/dev/uat/prod）
- 查看當前環境設定
- 驗證環境變數完整性

### test-services-safe.sh - Docker 服務健康檢查

- 檢查 Docker 基礎設施服務狀態
- 驗證 PostgreSQL、RabbitMQ、Dragonfly、Mailpit
- **內部輔助腳本**：由 `init.sh` 自動調用，用戶無需直接執行
- 不會啟動任何開發服務器（Frontend/Backend/Storybook）

---

## 🛠️ Utils 資料夾

### common.sh - 共用函數庫

提供所有腳本共用的函數：

**日誌函數**：

- `log_info()` - 一般訊息
- `log_success()` - 成功訊息
- `log_warning()` - 警告訊息
- `log_error()` - 錯誤訊息
- `log_step()` - 步驟標題

**工具函數**：

- `confirm()` - 確認提示
- `check_command()` - 檢查命令是否存在
- `print_header()` - 印出標題框

**使用範例**：

```bash
# 載入共用函數
source "$(dirname "$0")/utils/common.sh"

# 使用
log_info "開始初始化..."
log_success "完成！"
```

---

## 📖 完整文檔

詳細使用說明請參考：

- [CLI 完整指南](../docs/getting-started/CLI_GUIDE.md)

---

## 💡 提示

- ✅ 只需要執行 `./scripts/cli.sh`
- ✅ 使用互動式選單最簡單
- ✅ 所有命令都有詳細說明
- ✅ 支援直接命令執行和選單兩種方式
