-- CreateTable
CREATE TABLE "password_histories" (
    "id" UUID NOT NULL DEFAULT uuid_generate_v7(),
    "user_id" UUID NOT NULL,
    "password_hash" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "password_histories_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "password_histories_user_id_idx" ON "password_histories"("user_id");

-- CreateIndex
CREATE INDEX "password_histories_created_at_idx" ON "password_histories"("created_at");

-- AddForeignKey
ALTER TABLE "password_histories" ADD CONSTRAINT "password_histories_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
