/*
  Warnings:

  - The migration will add a unique constraint covering the columns `[itemId]` on the table `Transaction`. If there are existing duplicate values, the migration will fail.
  - Added the required column `ownerId` to the `Transaction` table without a default value. This is not possible if the table is not empty.
  - Added the required column `lesseeId` to the `Transaction` table without a default value. This is not possible if the table is not empty.
  - Added the required column `itemId` to the `Transaction` table without a default value. This is not possible if the table is not empty.
  - Changed the type of `salePrice` on the `Transaction` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.

*/
-- AlterTable
ALTER TABLE "Transaction" ADD COLUMN     "ownerId" INTEGER NOT NULL,
ADD COLUMN     "lesseeId" INTEGER NOT NULL,
ADD COLUMN     "itemId" INTEGER NOT NULL,
DROP COLUMN "salePrice",
ADD COLUMN     "salePrice" DOUBLE PRECISION NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "Transaction_itemId_unique" ON "Transaction"("itemId");

-- AddForeignKey
ALTER TABLE "Transaction" ADD FOREIGN KEY ("ownerId") REFERENCES "Owner"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Transaction" ADD FOREIGN KEY ("lesseeId") REFERENCES "Lessee"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Transaction" ADD FOREIGN KEY ("itemId") REFERENCES "Item"("id") ON DELETE CASCADE ON UPDATE CASCADE;
