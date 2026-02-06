/*
  Warnings:

  - A unique constraint covering the columns `[name,scope]` on the table `permissions` will be added. If there are existing duplicate values, this will fail.

*/
-- DropIndex
DROP INDEX "permissions_name_key";

-- CreateIndex
CREATE UNIQUE INDEX "permissions_name_scope_key" ON "permissions"("name", "scope");
