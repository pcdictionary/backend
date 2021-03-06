/*
  Warnings:

  - The migration will change the primary key for the `Owner` table. If it partially fails, the table could be left without primary key constraint.
  - You are about to drop the column `ownerId` on the `Owner` table. All the data in the column will be lost.
  - Added the required column `status` to the `Cart` table without a default value. This is not possible if the table is not empty.
  - Added the required column `reply` to the `Reply` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "CartStatus" AS ENUM ('ACTIVE', 'COMPLETED');

-- DropForeignKey
ALTER TABLE "Item" DROP CONSTRAINT "Item_ownerId_fkey";

-- DropForeignKey
ALTER TABLE "LesseeReview" DROP CONSTRAINT "LesseeReview_productOwnerId_fkey";

-- DropForeignKey
ALTER TABLE "Owner" DROP CONSTRAINT "Owner_ownerId_fkey";

-- DropForeignKey
ALTER TABLE "PaypalOwner" DROP CONSTRAINT "PaypalOwner_ownerId_fkey";

-- DropForeignKey
ALTER TABLE "ProductOwnerReview" DROP CONSTRAINT "ProductOwnerReview_productOwnerId_fkey";

-- DropForeignKey
ALTER TABLE "StripeOwner" DROP CONSTRAINT "StripeOwner_ownerId_fkey";

-- DropForeignKey
ALTER TABLE "Transaction" DROP CONSTRAINT "Transaction_ownerId_fkey";

-- AlterTable
ALTER TABLE "Cart" ADD COLUMN     "status" "CartStatus" NOT NULL;

-- AlterTable
ALTER TABLE "Item" ALTER COLUMN "updatedAt" DROP NOT NULL,
ALTER COLUMN "createdAt" DROP NOT NULL;

-- AlterTable
ALTER TABLE "Owner" DROP CONSTRAINT "Owner_pkey",
DROP COLUMN "ownerId",
ADD COLUMN     "id" SERIAL NOT NULL,
ADD PRIMARY KEY ("id");

-- AlterTable
ALTER TABLE "Question" ALTER COLUMN "question" SET DATA TYPE TEXT;

-- AlterTable
ALTER TABLE "Reply" ADD COLUMN     "reply" TEXT NOT NULL;

-- AddForeignKey
ALTER TABLE "Item" ADD FOREIGN KEY ("ownerId") REFERENCES "Owner"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "LesseeReview" ADD FOREIGN KEY ("productOwnerId") REFERENCES "Owner"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Owner" ADD FOREIGN KEY ("id") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PaypalOwner" ADD FOREIGN KEY ("ownerId") REFERENCES "Owner"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProductOwnerReview" ADD FOREIGN KEY ("productOwnerId") REFERENCES "Owner"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "StripeOwner" ADD FOREIGN KEY ("ownerId") REFERENCES "Owner"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Transaction" ADD FOREIGN KEY ("ownerId") REFERENCES "Owner"("id") ON DELETE CASCADE ON UPDATE CASCADE;
