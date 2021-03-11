-- DropForeignKey
ALTER TABLE "Item" DROP CONSTRAINT "Item_ownerId_fkey";

-- AddForeignKey
ALTER TABLE "Item" ADD FOREIGN KEY ("id") REFERENCES "Owner"("id") ON DELETE CASCADE ON UPDATE CASCADE;
