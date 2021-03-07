import pkg from "@prisma/client";
import {seedData} from './seedData.js'
const { PrismaClient } = pkg;

const prisma = new PrismaClient();

async function main() {
    await prisma.item.deleteMany();
    await prisma.owner.deleteMany();
    await prisma.user.deleteMany();
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });