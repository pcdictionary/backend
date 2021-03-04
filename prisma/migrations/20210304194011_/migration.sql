/*
  Warnings:

  - You are about to drop the column `subcategoryId` on the `Category` table. All the data in the column will be lost.
  - The migration will change the primary key for the `Lessee` table. If it partially fails, the table could be left without primary key constraint.
  - You are about to drop the column `id` on the `Lessee` table. All the data in the column will be lost.
  - You are about to drop the column `userId` on the `Lessee` table. All the data in the column will be lost.
  - The migration will change the primary key for the `Owner` table. If it partially fails, the table could be left without primary key constraint.
  - You are about to drop the column `id` on the `Owner` table. All the data in the column will be lost.
  - You are about to drop the column `userId` on the `Owner` table. All the data in the column will be lost.

*/
-- DropForeignKey
ALTER TABLE "Category" DROP CONSTRAINT "Category_subcategoryId_fkey";

-- DropForeignKey
ALTER TABLE "Item" DROP CONSTRAINT "Item_ownerId_fkey";

-- DropForeignKey
ALTER TABLE "ItemReview" DROP CONSTRAINT "ItemReview_lesseeId_fkey";

-- DropForeignKey
ALTER TABLE "Lessee" DROP CONSTRAINT "Lessee_userId_fkey";

-- DropForeignKey
ALTER TABLE "LesseeReview" DROP CONSTRAINT "LesseeReview_lesseeId_fkey";

-- DropForeignKey
ALTER TABLE "LesseeReview" DROP CONSTRAINT "LesseeReview_productOwnerId_fkey";

-- DropForeignKey
ALTER TABLE "Owner" DROP CONSTRAINT "Owner_userId_fkey";

-- DropForeignKey
ALTER TABLE "PaypalLessee" DROP CONSTRAINT "PaypalLessee_lesseeId_fkey";

-- DropForeignKey
ALTER TABLE "PaypalOwner" DROP CONSTRAINT "PaypalOwner_ownerId_fkey";

-- DropForeignKey
ALTER TABLE "ProductOwnerReview" DROP CONSTRAINT "ProductOwnerReview_lesseeId_fkey";

-- DropForeignKey
ALTER TABLE "ProductOwnerReview" DROP CONSTRAINT "ProductOwnerReview_productOwnerId_fkey";

-- DropForeignKey
ALTER TABLE "StripeLessee" DROP CONSTRAINT "StripeLessee_lesseeId_fkey";

-- DropForeignKey
ALTER TABLE "StripeOwner" DROP CONSTRAINT "StripeOwner_ownerId_fkey";

-- DropForeignKey
ALTER TABLE "Transaction" DROP CONSTRAINT "Transaction_lesseeId_fkey";

-- DropForeignKey
ALTER TABLE "Transaction" DROP CONSTRAINT "Transaction_ownerId_fkey";

-- DropIndex
DROP INDEX "Lessee_userId_unique";

-- DropIndex
DROP INDEX "Owner_userId_unique";

-- AlterTable
ALTER TABLE "Category" DROP COLUMN "subcategoryId";

-- AlterTable
ALTER TABLE "Lessee" DROP CONSTRAINT "Lessee_pkey",
DROP COLUMN "id",
DROP COLUMN "userId",
ADD COLUMN     "lesseeId" SERIAL NOT NULL,
ADD PRIMARY KEY ("lesseeId");

-- AlterTable
ALTER TABLE "Owner" DROP CONSTRAINT "Owner_pkey",
DROP COLUMN "id",
DROP COLUMN "userId",
ADD COLUMN     "ownerId" SERIAL NOT NULL,
ADD PRIMARY KEY ("ownerId");

-- CreateTable
CREATE TABLE "SubCategory" (
    "id" SERIAL NOT NULL,
    "parentCategoryId" INTEGER NOT NULL,
    "subCategorytId" INTEGER NOT NULL,

    PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Message" (
    "id" SERIAL NOT NULL,
    "message" TEXT NOT NULL,
    "chatId" INTEGER NOT NULL,
    "userId" INTEGER NOT NULL,

    PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Chat" (
    "id" SERIAL NOT NULL,
    "user1Id" INTEGER NOT NULL,
    "user2Id" INTEGER NOT NULL,
    "messageCount" INTEGER NOT NULL,

    PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Chat_user1Id_unique" ON "Chat"("user1Id");

-- CreateIndex
CREATE UNIQUE INDEX "Chat_user2Id_unique" ON "Chat"("user2Id");

-- AddForeignKey
ALTER TABLE "SubCategory" ADD FOREIGN KEY ("parentCategoryId") REFERENCES "Category"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SubCategory" ADD FOREIGN KEY ("subCategorytId") REFERENCES "Category"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Message" ADD FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Message" ADD FOREIGN KEY ("chatId") REFERENCES "Chat"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Chat" ADD FOREIGN KEY ("user1Id") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Chat" ADD FOREIGN KEY ("user2Id") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Item" ADD FOREIGN KEY ("ownerId") REFERENCES "Owner"("ownerId") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ItemReview" ADD FOREIGN KEY ("lesseeId") REFERENCES "Lessee"("lesseeId") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Lessee" ADD FOREIGN KEY ("lesseeId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "LesseeReview" ADD FOREIGN KEY ("lesseeId") REFERENCES "Lessee"("lesseeId") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "LesseeReview" ADD FOREIGN KEY ("productOwnerId") REFERENCES "Owner"("ownerId") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Owner" ADD FOREIGN KEY ("ownerId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PaypalLessee" ADD FOREIGN KEY ("lesseeId") REFERENCES "Lessee"("lesseeId") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PaypalOwner" ADD FOREIGN KEY ("ownerId") REFERENCES "Owner"("ownerId") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProductOwnerReview" ADD FOREIGN KEY ("lesseeId") REFERENCES "Lessee"("lesseeId") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProductOwnerReview" ADD FOREIGN KEY ("productOwnerId") REFERENCES "Owner"("ownerId") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "StripeLessee" ADD FOREIGN KEY ("lesseeId") REFERENCES "Lessee"("lesseeId") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "StripeOwner" ADD FOREIGN KEY ("ownerId") REFERENCES "Owner"("ownerId") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Transaction" ADD FOREIGN KEY ("ownerId") REFERENCES "Owner"("ownerId") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Transaction" ADD FOREIGN KEY ("lesseeId") REFERENCES "Lessee"("lesseeId") ON DELETE CASCADE ON UPDATE CASCADE;
