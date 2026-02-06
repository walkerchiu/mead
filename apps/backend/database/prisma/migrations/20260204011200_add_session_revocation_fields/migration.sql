-- AlterTable: Add session revocation fields
ALTER TABLE "sessions" 
  ADD COLUMN "revoked_by" UUID,
  ADD COLUMN "revoked_reason" TEXT,
  ADD COLUMN "revoked_method" TEXT;

-- CreateIndex: Add index for revokedBy
CREATE INDEX "sessions_revoked_by_idx" ON "sessions"("revoked_by");

-- CreateIndex: Add index for lastUsedAt
CREATE INDEX "sessions_last_used_at_idx" ON "sessions"("last_used_at");

-- AddForeignKey: Add foreign key constraint for revokedBy
ALTER TABLE "sessions" 
  ADD CONSTRAINT "sessions_revoked_by_fkey" 
  FOREIGN KEY ("revoked_by") 
  REFERENCES "users"("id") 
  ON DELETE SET NULL 
  ON UPDATE CASCADE;
