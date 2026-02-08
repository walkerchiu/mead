-- CreateTable
CREATE TABLE "personal_access_tokens" (
    "id" UUID NOT NULL DEFAULT uuid_generate_v7(),
    "user_id" UUID NOT NULL,
    "name" VARCHAR(100) NOT NULL,
    "token_hash" TEXT NOT NULL,
    "token_prefix" VARCHAR(12) NOT NULL,
    "scopes" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "last_used_at" TIMESTAMPTZ(6),
    "last_used_ip" TEXT,
    "expires_at" TIMESTAMPTZ(6) NOT NULL,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "revoked_at" TIMESTAMPTZ(6),

    CONSTRAINT "personal_access_tokens_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "personal_access_tokens_token_hash_key" ON "personal_access_tokens"("token_hash");

-- CreateIndex
CREATE INDEX "personal_access_tokens_user_id_revoked_at_idx" ON "personal_access_tokens"("user_id", "revoked_at");

-- CreateIndex
CREATE INDEX "personal_access_tokens_token_hash_idx" ON "personal_access_tokens"("token_hash");

-- CreateIndex
CREATE INDEX "personal_access_tokens_expires_at_idx" ON "personal_access_tokens"("expires_at");

-- AddForeignKey
ALTER TABLE "personal_access_tokens" ADD CONSTRAINT "personal_access_tokens_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
