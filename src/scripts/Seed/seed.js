import pkg from "@prisma/client";
import { seed as main } from './seedFunction.js'
const { PrismaClient } = pkg;

const prisma = new PrismaClient();

main(prisma)
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
