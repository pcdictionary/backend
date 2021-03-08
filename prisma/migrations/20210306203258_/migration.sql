/*
  Warnings:

  - The migration will change the primary key for the `Lessee` table. If it partially fails, the table could be left without primary key constraint.
  - You are about to drop the column `lesseeId` on the `Lessee` table. All the data in the column will be lost.
  - You are about to drop the column `reply` on the `Reply` table. All the data in the column will be lost.
  - Added the required column `Reply` to the `Reply` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "Cart" DROP CONSTRAINT "Cart_lesseeId_fkey";

-- DropForeignKey
ALTER TABLE "ItemReview" DROP CONSTRAINT "ItemReview_lesseeId_fkey";

-- DropForeignKey
ALTER TABLE "Lessee" DROP CONSTRAINT "Lessee_lesseeId_fkey";

-- DropForeignKey
ALTER TABLE "LesseeReview" DROP CONSTRAINT "LesseeReview_lesseeId_fkey";

-- DropForeignKey
ALTER TABLE "PaypalLessee" DROP CONSTRAINT "PaypalLessee_lesseeId_fkey";

-- DropForeignKey
ALTER TABLE "ProductOwnerReview" DROP CONSTRAINT "ProductOwnerReview_lesseeId_fkey";

-- DropForeignKey
ALTER TABLE "StripeLessee" DROP CONSTRAINT "StripeLessee_lesseeId_fkey";

-- AlterTable
ALTER TABLE "Lessee" DROP CONSTRAINT "Lessee_pkey",
DROP COLUMN "lesseeId",
ADD COLUMN     "id" SERIAL NOT NULL,
ADD PRIMARY KEY ("id");

-- AlterTable
ALTER TABLE "Reply" DROP COLUMN "reply",
ADD COLUMN     "Reply" TEXT NOT NULL;

-- AddForeignKey
ALTER TABLE "Cart" ADD FOREIGN KEY ("lesseeId") REFERENCES "Lessee"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ItemReview" ADD FOREIGN KEY ("lesseeId") REFERENCES "Lessee"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Lessee" ADD FOREIGN KEY ("id") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "LesseeReview" ADD FOREIGN KEY ("lesseeId") REFERENCES "Lessee"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PaypalLessee" ADD FOREIGN KEY ("lesseeId") REFERENCES "Lessee"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProductOwnerReview" ADD FOREIGN KEY ("lesseeId") REFERENCES "Lessee"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "StripeLessee" ADD FOREIGN KEY ("lesseeId") REFERENCES "Lessee"("id") ON DELETE CASCADE ON UPDATE CASCADE;
