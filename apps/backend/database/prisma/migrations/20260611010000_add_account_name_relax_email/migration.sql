-- 帳號登入：新增 account_name（唯一），並放寬 email 唯一性（改為非唯一、僅通知用）

-- DropIndex（email 不再唯一）
DROP INDEX "users_email_key";

-- AlterTable
ALTER TABLE "users" ADD COLUMN     "account_name" VARCHAR(20);

-- CreateIndex
CREATE UNIQUE INDEX "users_account_name_key" ON "users"("account_name");
