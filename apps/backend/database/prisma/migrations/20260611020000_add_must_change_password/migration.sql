-- 首次登入強制改密：新增 must_change_password 旗標（預設 false）

-- AlterTable
ALTER TABLE "users" ADD COLUMN     "must_change_password" BOOLEAN NOT NULL DEFAULT false;
