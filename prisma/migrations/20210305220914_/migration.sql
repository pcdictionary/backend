/*
  Warnings:

  - You are about to drop the column `lesseeId` on the `Transaction` table. All the data in the column will be lost.
  - Added the required column `cartId` to the `Transaction` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "Transaction" DROP CONSTRAINT "Transaction_lesseeId_fkey";

-- AlterTable
ALTER TABLE "Transaction" DROP COLUMN "lesseeId",
ADD COLUMN     "cartId" INTEGER NOT NULL;

-- CreateTable
CREATE TABLE "Question" (
    "id" SERIAL NOT NULL,
    "itemId" INTEGER NOT NULL,
    "userId" INTEGER NOT NULL,
    "question" INTEGER NOT NULL,
    "likes" INTEGER NOT NULL,
    "dislikes" INTEGER NOT NULL,

    PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Reply" (
    "id" SERIAL NOT NULL,
    "questionId" INTEGER NOT NULL,
    "likes" INTEGER NOT NULL,
    "dislikes" INTEGER NOT NULL,

    PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "QuestionVotes" (
    "id" SERIAL NOT NULL,
    "userId" INTEGER NOT NULL,
    "questionId" INTEGER NOT NULL,
    "vote" INTEGER NOT NULL,

    PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ReplyVotes" (
    "id" SERIAL NOT NULL,
    "userId" INTEGER NOT NULL,
    "replyId" INTEGER NOT NULL,
    "vote" INTEGER NOT NULL,

    PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Cart" (
    "id" SERIAL NOT NULL,
    "lesseeId" INTEGER NOT NULL,
    "paymentMethod" TEXT NOT NULL,
    "totalPrice" DOUBLE PRECISION NOT NULL,

    PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "Question" ADD FOREIGN KEY ("itemId") REFERENCES "Item"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Question" ADD FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Reply" ADD FOREIGN KEY ("questionId") REFERENCES "Question"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "QuestionVotes" ADD FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "QuestionVotes" ADD FOREIGN KEY ("questionId") REFERENCES "Question"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ReplyVotes" ADD FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ReplyVotes" ADD FOREIGN KEY ("replyId") REFERENCES "Reply"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Cart" ADD FOREIGN KEY ("lesseeId") REFERENCES "Lessee"("lesseeId") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Transaction" ADD FOREIGN KEY ("cartId") REFERENCES "Cart"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AlterIndex
ALTER INDEX "Chat_user1Id_unique" RENAME TO "Chat.user1Id_unique";

-- AlterIndex
ALTER INDEX "Chat_user2Id_unique" RENAME TO "Chat.user2Id_unique";

-- AlterIndex
ALTER INDEX "Transaction_itemId_unique" RENAME TO "Transaction.itemId_unique";
