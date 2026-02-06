# Email 設定指南

本專案使用 Mailpit 作為本地開發環境的 SMTP 測試服務器。

---

## 📋 目錄

- [Email 設定指南](#email-設定指南)
  - [📋 目錄](#-目錄)
  - [📧 概述](#-概述)
  - [🚀 快速開始](#-快速開始)
    - [1️⃣ 啟動 Mailpit](#1️⃣-啟動-mailpit)
    - [2️⃣ 驗證服務運行](#2️⃣-驗證服務運行)
    - [3️⃣ 訪問 Web UI](#3️⃣-訪問-web-ui)
    - [4️⃣ 測試 2FA 功能](#4️⃣-測試-2fa-功能)
  - [🔧 配置說明](#-配置說明)
    - [開發環境 (.env)](#開發環境-env)
    - [Docker Compose (.env.docker)](#docker-compose-envdocker)
  - [✨ Mailpit 功能特性](#-mailpit-功能特性)
    - [Web UI 功能](#web-ui-功能)
    - [API 支援](#api-支援)
  - [❓ 常見問題](#-常見問題)
    - [Q: 為什麼收不到郵件？](#q-為什麼收不到郵件)
    - [Q: 如何清空 Mailpit 中的郵件？](#q-如何清空-mailpit-中的郵件)
    - [Q: 如何在 CI/CD 環境使用？](#q-如何在-cicd-環境使用)
    - [Q: 生產環境應該使用什麼？](#q-生產環境應該使用什麼)
  - [🔄 其他開發環境選項](#-其他開發環境選項)
    - [選項 1：Ethereal Email（在線測試）](#選項-1ethereal-email在線測試)
    - [選項 2：Mock Service（測試環境）](#選項-2mock-service測試環境)
  - [🚨 故障排除](#-故障排除)
    - [錯誤：SMTP Authentication failed (535)](#錯誤smtp-authentication-failed-535)
    - [錯誤：Cannot connect to SMTP server](#錯誤cannot-connect-to-smtp-server)
  - [📚 相關資源](#-相關資源)

---

## 📧 概述

Mailpit 是一個輕量級的 SMTP 測試工具，專為開發環境設計。它能捕獲所有發送的郵件並在 Web UI 中顯示，避免在開發時誤發真實郵件。

**核心優勢**：

- 🚫 **零配置認證**：無需設定帳號密碼
- 🌐 **Web UI**：直觀的郵件查看介面
- 🔒 **安全隔離**：郵件不會真的發出去
- 📦 **Docker 整合**：一鍵啟動
- 🔌 **API 支援**：可程式化操作
- 💾 **記憶體存儲**：重啟後郵件清空

---

## 🚀 快速開始

### 1️⃣ 啟動 Mailpit

```bash
# 啟動所有服務（包含 Mailpit）
docker-compose up -d

# 或單獨啟動 Mailpit
docker-compose up -d mailpit
```

### 2️⃣ 驗證服務運行

```bash
# 檢查容器狀態
docker ps | grep mailpit

# 應該看到類似輸出：
# wind-mailpit   axllent/mailpit:latest   Up 2 minutes   0.0.0.0:1025->1025/tcp, 0.0.0.0:8025->8025/tcp
```

### 3️⃣ 訪問 Web UI

開啟瀏覽器訪問：**http://localhost:8025**

所有從後端發送的郵件都會被 Mailpit 捕獲並顯示在這個介面中。

### 4️⃣ 測試 2FA 功能

1. 前往 http://localhost:3000/en/settings/security
2. 點擊 "Enable 2FA"
3. 到 Mailpit UI (http://localhost:8025) 查看驗證碼郵件
4. 複製驗證碼並完成 2FA 啟用

---

## 🔧 配置說明

### 開發環境 (.env)

```env
MAIL_HOST=localhost
MAIL_PORT=1025          # SMTP 端口
MAIL_USER=              # 留空（Mailpit 不需要認證）
MAIL_PASSWORD=          # 留空
MAIL_FROM=noreply@localhost
MAIL_FROM_NAME="Wind Development"
MAIL_SECURE=false       # 不使用 TLS
```

### Docker Compose (.env.docker)

```env
MAIL_SMTP_PORT=1025     # Mailpit SMTP 端口
MAIL_WEB_PORT=8025      # Mailpit Web UI 端口
```

---

## ✨ Mailpit 功能特性

### Web UI 功能

- 📧 **查看所有郵件**：列出所有被捕獲的郵件
- 🔍 **搜尋功能**：按主旨、收件人、內容搜尋
- 📱 **響應式設計**：支援桌面和行動裝置
- 🖼️ **HTML 預覽**：查看 HTML 格式的郵件
- 📎 **附件下載**：下載郵件附件
- 🗑️ **刪除郵件**：清理測試郵件

### API 支援

Mailpit 提供 REST API：

```bash
# 獲取所有郵件
curl http://localhost:8025/api/v1/messages

# 獲取特定郵件
curl http://localhost:8025/api/v1/message/{id}

# 刪除所有郵件
curl -X DELETE http://localhost:8025/api/v1/messages
```

---

## ❓ 常見問題

### Q: 為什麼收不到郵件？

**檢查清單：**

1. ✅ Mailpit 容器是否正在運行？

   ```bash
   docker ps | grep mailpit
   ```

2. ✅ 後端 .env 配置是否正確？

   ```bash
   grep MAIL_ apps/backend/.env
   ```

3. ✅ 後端是否成功連接到 Mailpit？
   - 查看後端日誌，不應該有 "535 Authentication failed" 錯誤

4. ✅ Mailpit Web UI 是否可訪問？
   - 訪問 http://localhost:8025

### Q: 如何清空 Mailpit 中的郵件？

在 Mailpit Web UI 中點擊右上角的 "Delete all" 按鈕，或使用 API：

```bash
curl -X DELETE http://localhost:8025/api/v1/messages
```

### Q: 如何在 CI/CD 環境使用？

在 CI/CD 環境中，可以使用 Mock Mail Service（見下方）。

### Q: 生產環境應該使用什麼？

生產環境**絕對不能**使用 Mailpit！請使用真實的 SMTP 服務商：

- **AWS SES**：適合大量郵件發送
- **SendGrid**：功能豐富的郵件服務
- **Mailgun**：開發者友好的 API
- **Postmark**：高送達率
- **Gmail SMTP**：小規模應用

---

## 🔄 其他開發環境選項

### 選項 1：Ethereal Email（在線測試）

如果不想使用 Docker，可以使用 Ethereal Email：

1. 訪問 https://ethereal.email/
2. 點擊 "Create Ethereal Account"
3. 複製生成的認證資訊
4. 更新 `apps/backend/.env`：

   ```env
   MAIL_HOST=smtp.ethereal.email
   MAIL_PORT=587
   MAIL_USER=生成的username
   MAIL_PASSWORD=生成的password
   ```

**優點**：

- 不需要本地服務
- 可以分享郵件連結

**缺點**：

- 需要網路連接
- 帳號會過期

### 選項 2：Mock Service（測試環境）

對於單元測試，使用 Mock Mail Service（已在代碼中實現）。

---

## 🚨 故障排除

### 錯誤：SMTP Authentication failed (535)

這表示後端沒有正確連接到 Mailpit。

**解決方法：**

1. 確認 Mailpit 正在運行
2. 檢查 `.env` 配置：

   ```env
   MAIL_HOST=localhost
   MAIL_PORT=1025
   MAIL_USER=
   MAIL_PASSWORD=
   ```

3. 重啟後端服務

### 錯誤：Cannot connect to SMTP server

**解決方法：**

1. 確認 Mailpit 容器正在運行：

   ```bash
   docker-compose ps mailpit
   ```

2. 如果沒有運行，啟動它：

   ```bash
   docker-compose up -d mailpit
   ```

3. 檢查端口是否被佔用：

   ```bash
   lsof -i :1025
   lsof -i :8025
   ```

---

## 📚 相關資源

- [Mailpit GitHub](https://github.com/axllent/mailpit)
- [Mailpit 文檔](https://mailpit.axllent.org/)
- [Docker Hub - Mailpit](https://hub.docker.com/r/axllent/mailpit)
