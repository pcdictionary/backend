/*
  Warnings:

  - The migration will add a unique constraint covering the columns `[userId]` on the table `Owner`. If there are existing duplicate values, the migration will fail.
  - Added the required column `userId` to the `Owner` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "Owner" DROP CONSTRAINT "Owner_id_fkey";

-- AlterTable
ALTER TABLE "Owner" ADD COLUMN     "userId" INTEGER NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "Owner_userId_unique" ON "Owner"("userId");

-- AddForeignKey
ALTER TABLE "Owner" ADD FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
