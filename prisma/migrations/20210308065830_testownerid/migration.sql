/*
  Warnings:

  - The migration will add a unique constraint covering the columns `[ownerId]` on the table `Item`. If there are existing duplicate values, the migration will fail.

*/
-- DropForeignKey
ALTER TABLE "Item" DROP CONSTRAINT "Item_id_fkey";

-- CreateIndex
CREATE UNIQUE INDEX "Item_ownerId_unique" ON "Item"("ownerId");

-- AddForeignKey
ALTER TABLE "Item" ADD FOREIGN KEY ("ownerId") REFERENCES "Owner"("id") ON DELETE CASCADE ON UPDATE CASCADE;
