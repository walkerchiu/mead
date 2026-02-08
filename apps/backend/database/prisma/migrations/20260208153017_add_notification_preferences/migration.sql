-- CreateTable
CREATE TABLE "notification_preferences" (
    "id" UUID NOT NULL DEFAULT uuid_generate_v7(),
    "user_id" UUID NOT NULL,
    "enable_info" BOOLEAN NOT NULL DEFAULT true,
    "enable_success" BOOLEAN NOT NULL DEFAULT true,
    "enable_warning" BOOLEAN NOT NULL DEFAULT true,
    "enable_error" BOOLEAN NOT NULL DEFAULT true,
    "enable_browser" BOOLEAN NOT NULL DEFAULT true,
    "enable_email" BOOLEAN NOT NULL DEFAULT true,
    "enable_push" BOOLEAN NOT NULL DEFAULT false,
    "enable_sound" BOOLEAN NOT NULL DEFAULT true,
    "enable_desktop" BOOLEAN NOT NULL DEFAULT true,
    "enable_mobile" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "notification_preferences_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "notification_preferences_user_id_key" ON "notification_preferences"("user_id");

-- CreateIndex
CREATE INDEX "notification_preferences_user_id_idx" ON "notification_preferences"("user_id");

-- AddForeignKey
ALTER TABLE "notification_preferences" ADD CONSTRAINT "notification_preferences_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
