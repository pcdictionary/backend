import pkg from "@prisma/client";
import {seedData} from './seedData.js'
import {dumpDB as main} from './dumpDBFunction'
const { PrismaClient } = pkg;


const prisma = new PrismaClient();

main(prism)
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

