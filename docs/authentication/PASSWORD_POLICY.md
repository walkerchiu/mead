# 密碼政策與安全規範

基於 NIST SP 800-63B 和 OWASP 最佳實踐的密碼安全政策。

---

## 目錄

- [密碼政策與安全規範](#密碼政策與安全規範)
  - [目錄](#目錄)
  - [概述](#概述)
  - [密碼強度要求](#密碼強度要求)
    - [基本要求](#基本要求)
    - [常見密碼黑名單](#常見密碼黑名單)
  - [相似度檢查（Token-based）](#相似度檢查token-based)
    - [檢查機制](#檢查機制)
    - [Email 地址檢查](#email-地址檢查)
    - [姓名檢查](#姓名檢查)
    - [技術優勢](#技術優勢)
  - [密碼歷史記錄](#密碼歷史記錄)
    - [功能說明](#功能說明)
    - [適用場景](#適用場景)
  - [安全與合規考量](#安全與合規考量)
    - [資料安全](#資料安全)
    - [GDPR / 隱私合規](#gdpr--隱私合規)
    - [稽核與監控](#稽核與監控)
  - [實作細節](#實作細節)
    - [資料庫架構](#資料庫架構)
    - [驗證流程](#驗證流程)
    - [密碼變更流程](#密碼變更流程)
  - [用戶體驗](#用戶體驗)
    - [錯誤訊息](#錯誤訊息)
    - [多語言支援](#多語言支援)
  - [最佳實踐建議](#最佳實踐建議)
    - [對用戶的建議](#對用戶的建議)
    - [對開發者的建議](#對開發者的建議)
  - [參考資料](#參考資料)

---

## 概述

本系統採用基於 **NIST SP 800-63B** 和 **OWASP** 的現代密碼安全標準，結合 Token-based 相似度檢查和密碼歷史記錄，提供多層次的密碼保護機制。

**核心特性**：

- ✅ 符合 NIST 最低標準（8 字元）
- ✅ Token-based 相似度檢查（檢測 Email、姓名）
- ✅ 智能偵測數字替換（Leet speak）
- ✅ 反轉字串偵測
- ✅ 密碼歷史記錄（禁止重複使用最近 3 組密碼）
- ✅ bcrypt 安全儲存（12 rounds）
- ✅ GDPR 合規

---

## 密碼強度要求

### 基本要求

系統實施以下密碼強度規則（符合 NIST 標準）：

| 要求     | 說明                                            |
| -------- | ----------------------------------------------- | ----------- |
| 最小長度 | 8 個字元（建議使用更長的密碼）                  |
| 大寫字母 | 至少 1 個（A-Z）                                |
| 小寫字母 | 至少 1 個（a-z）                                |
| 數字     | 至少 1 個（0-9）                                |
| 特殊符號 | 至少 1 個（`!@#$%^&\*()\_+-=[]{}                | ;:,.<>?/`） |
| 黑名單   | 不在常見密碼黑名單中                            |
| 相似度   | 不得包含 Email、姓名的有意義部分（Token-based） |

### 常見密碼黑名單

系統維護一份常見密碼黑名單，包含但不限於：

```text
password, 123456, 12345678, qwerty, abc123
monkey, letmein, trustno1, dragon, baseball
111111, iloveyou, master, sunshine, passw0rd
hq, root, user, test, guest, default
```

---

## 相似度檢查（Token-based）

為防止社交工程攻擊，系統採用 **Token-based 相似度檢查**，基於業界最佳實踐（NIST SP 800-63B, OWASP）。

### 檢查機制

1. **Token 提取**
   - 將用戶資訊拆分成有意義的 tokens（單字）
   - 使用常見分隔符號：空格、點、下劃線、連字符、單引號
   - 只檢查長度 ≥ 3 的 tokens（避免誤判）

2. **檢測範圍**
   - ✅ **直接包含**：`MyJohn123` ← 來自 "John"
   - ✅ **數字替換**：`J0hn@2024` ← 來自 "John"（0→o）
   - ✅ **反轉字串**：`nhoJ!99` ← 來自 "John"
   - ✅ **組合變體**：`Nh0j@2024` ← 來自 "John"（反轉+替換）

3. **常見替換對照表**

   ```text
   0 → o,  1 → i,  3 → e,  4 → a
   5 → s,  7 → t,  8 → b,  @ → a,  $ → s
   ```

### Email 地址檢查

**預設行為**（不檢查網域）：Email 是 `john.smith@example.com`

| 密碼範例           | 結果 | 原因                      |
| ------------------ | ---- | ------------------------- |
| `MyJohn123!`       | ❌   | 包含 "john"               |
| `Smith@2024`       | ❌   | 包含 "smith"              |
| `J0hn@2024!`       | ❌   | 數字替換：0→o             |
| `$m1th!99`         | ❌   | 替換：$→s, 1→i            |
| `MyNhoj@99`        | ❌   | 反轉：「john」→「nhoj」   |
| `htimS!2024`       | ❌   | 反轉：「smith」→「htims」 |
| `Example@2024!`    | ✅   | 不檢查網域部分            |
| `ComplexPwd@2024!` | ✅   | 不包含任何 token          |

**啟用網域檢查**（適用於企業內部系統）：Email 是 `user@techcorp.com`

當 `checkEmailDomain=true` 時：

| 密碼範例           | 結果 | 原因                            |
| ------------------ | ---- | ------------------------------- |
| `MyTechcorp123!`   | ❌   | 包含 "techcorp"                 |
| `T3chc0rp@2024`    | ❌   | 替換：3→e, 0→o                  |
| `prochceT!99`      | ❌   | 反轉：「techcorp」→「prochcet」 |
| `ComplexPwd@2024!` | ✅   | 不包含任何 token                |

> **注意**：網域檢查預設為關閉，因為大多數公開 email 服務（gmail.com, outlook.com）的網域很通用且不具個人識別性。僅在企業內部系統且使用統一公司網域時建議啟用。

### 姓名檢查

**示例**：姓名是 `Alice Wonderland`

| 密碼範例           | 結果 | 原因                                |
| ------------------ | ---- | ----------------------------------- |
| `MyAlice123!`      | ❌   | 包含 "alice"                        |
| `Wonderland@24`    | ❌   | 包含 "wonderland"                   |
| `4l1c3@2024`       | ❌   | 替換：4→a, 1→i, 3→e                 |
| `W0nd3rl4nd!`      | ❌   | 多重替換                            |
| `ecilA@99`         | ❌   | 反轉：「alice」→「ecila」           |
| `dnalrednow!24`    | ❌   | 反轉：「wonderland」→「dnalrednow」 |
| `ComplexPwd@2024!` | ✅   | 不包含任何 token                    |

### 技術優勢

相較於傳統的完整字串匹配，Token-based 方法：

| 優勢     | 說明                                  |
| -------- | ------------------------------------- |
| 更全面   | 能檢測到 Email/姓名的各個部分         |
| 更智能   | 識別常見的數字替換和反轉變體          |
| 更合理   | 不會過度嚴格（只檢查有意義的 tokens） |
| 符合標準 | 遵循 OWASP 和 NIST 最佳實踐           |

---

## 密碼歷史記錄

### 功能說明

為防止密碼循環重複使用，系統實施密碼歷史記錄功能：

| 特性      | 說明                                  |
| --------- | ------------------------------------- |
| 記錄數量  | 保留最近 3 組已使用的密碼             |
| 自動清理  | 超過 3 組的舊記錄自動刪除             |
| 驗證機制  | 變更密碼時檢查是否與最近 3 組密碼相同 |
| 安全比對  | 使用 bcrypt 安全比對，不儲存明文密碼  |
| GDPR 合規 | CASCADE delete，符合「被遺忘權」要求  |

### 適用場景

| 場景                         | 是否檢查 | 說明             |
| ---------------------------- | -------- | ---------------- |
| 用戶主動變更密碼（Settings） | ✅       | 完整檢查密碼歷史 |
| 密碼重設（Forgot Password）  | ✅       | 完整檢查密碼歷史 |
| 首次註冊                     | ❌       | 無歷史記錄可檢查 |

---

## 安全與合規考量

### 資料安全

**加密儲存**：

- 所有密碼使用 bcrypt（12 rounds）加密儲存
- 密碼歷史記錄同樣使用 bcrypt hash 儲存
- 永不儲存或傳輸明文密碼

**傳輸安全**：

- 僅通過 HTTPS 傳輸密碼
- 使用 TLS 1.2+ 加密通道

**存取控制**：

- 密碼 hash 永不暴露給 API
- 密碼歷史記錄僅用於內部驗證
- 任何 GraphQL 查詢都無法取得密碼資訊

### GDPR / 隱私合規

**資料保留**：

- 只保留最近 3 組密碼歷史記錄
- 自動刪除超過限制的舊記錄
- 降低資料保留風險

**資料刪除**：

- 用戶刪除時自動刪除所有密碼歷史（CASCADE）
- 符合「被遺忘權」要求

**透明度**：

- 用戶變更密碼時會收到 Email 通知
- 系統會記錄密碼變更的稽核日誌

### 稽核與監控

**稽核日誌**：

- 記錄所有密碼變更操作
- 包含時間戳記、IP 位址、User Agent
- 保留完整的操作軌跡

**異常偵測**：

- 監控密碼變更頻率
- 偵測可疑的大量變更行為
- 觸發安全警報機制

---

## 實作細節

### 資料庫架構

```prisma
model PasswordHistory {
  id           String   @id @default(dbgenerated("uuid_generate_v7()"))
  userId       String   @map("user_id")
  passwordHash String   @map("password_hash")
  createdAt    DateTime @default(now()) @map("created_at")

  user User @relation(fields: [userId], references: [id], onDelete: Cascade)

  @@index([userId])
  @@index([createdAt])
  @@map("password_histories")
}
```

### 驗證流程

**同步驗證**（基本規則）：

```typescript
validatePasswordStrength(password, lang, i18n, {
  email: user.email,
  name: user.name,
});
```

**異步驗證**（包含歷史檢查）：

```typescript
await validatePasswordStrengthAsync(
  password,
  lang,
  i18n,
  { email, name },
  { passwordHashes: [...] }
);
```

### 密碼變更流程

```typescript
// 1. 查詢密碼歷史
const histories = await prisma.passwordHistory.findMany({
  where: { userId },
  orderBy: { createdAt: 'desc' },
  take: 3,
});

// 2. 驗證新密碼
await assertPasswordStrengthAsync(
  newPassword,
  lang,
  i18n,
  { email, name },
  { passwordHashes: histories.map((h) => h.passwordHash) },
);

// 3. 使用交易確保原子性
await prisma.$transaction(async (tx) => {
  // 3.1 儲存當前密碼到歷史記錄
  await tx.passwordHistory.create({
    data: { userId, passwordHash: currentPasswordHash },
  });

  // 3.2 更新為新密碼
  await tx.user.update({
    where: { id: userId },
    data: { password: newPasswordHash },
  });

  // 3.3 清理超過 3 組的舊記錄
  const allHistories = await tx.passwordHistory.findMany({
    where: { userId },
    orderBy: { createdAt: 'desc' },
  });

  if (allHistories.length > 3) {
    const idsToKeep = allHistories.slice(0, 3).map((h) => h.id);
    await tx.passwordHistory.deleteMany({
      where: { userId, id: { notIn: idsToKeep } },
    });
  }
});
```

---

## 用戶體驗

### 錯誤訊息

系統提供清晰的錯誤訊息，幫助用戶了解密碼要求：

```json
{
  "message": "密碼強度不符合要求",
  "errors": [
    "密碼長度至少需要 8 個字元",
    "密碼必須包含至少一個大寫英文字母",
    "密碼必須包含至少一個特殊符號",
    "此密碼與最近使用過的密碼相同，請選擇不同的密碼"
  ]
}
```

### 多語言支援

| 語言          | 狀態 | 說明     |
| ------------- | ---- | -------- |
| 中文（zh-TW） | ✅   | 完整支援 |
| 英文（en）    | ✅   | 完整支援 |
| 其他語言      |      | 可擴展   |

---

## 最佳實踐建議

### 對用戶的建議

1. **使用密碼管理器**
   - 建議使用密碼管理器生成和儲存強密碼
   - 避免重複使用密碼

2. **定期更換密碼**
   - 建議每 90 天更換一次密碼
   - 發現異常活動時立即更換

3. **啟用雙因素認證**
   - 強烈建議啟用 2FA
   - 提供額外的安全保護層

### 對開發者的建議

1. **永不記錄密碼**
   - 日誌中永不記錄密碼明文
   - 錯誤訊息中不洩露密碼資訊

2. **安全的密碼處理**
   - 使用 bcrypt 的適當 rounds（12+）
   - 在記憶體中盡快清除密碼明文

3. **定期審查**
   - 定期審查密碼政策的有效性
   - 根據最新的安全標準更新規則

---

## 參考資料

- [NIST Special Publication 800-63B](https://pages.nist.gov/800-63-3/sp800-63b.html)
- [OWASP Authentication Cheat Sheet](https://cheatsheetseries.owasp.org/cheatsheets/Authentication_Cheat_Sheet.html)
- [OWASP Password Storage Cheat Sheet](https://cheatsheetseries.owasp.org/cheatsheets/Password_Storage_Cheat_Sheet.html)
