import pkg from "@prisma/client";
import {seedData} from './seedData.js'
import {dumpDB as main} from './dumpDBFunction.js'
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

