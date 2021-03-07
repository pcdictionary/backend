import pkg from "@prisma/client";
import {seedData} from './seedData.js'
const { PrismaClient } = pkg;

const prisma = new PrismaClient();

function getRndInteger(min, max) {
  return Math.floor(Math.random() * (max - min) ) + min;
}

async function main() {
  await prisma.item.deleteMany();
  await prisma.owner.deleteMany();
  await prisma.user.deleteMany();
 //console.log(seedData.userList[0])
 const validUserIds = []
 const validItemIds = []
 for(let i = 0; i<seedData.userList.length; i++){
  try {
    let user = await prisma.user.create({data:seedData.userList[i]})  
    validUserIds.push(user.id)
   } catch (error) {
     console.log("Seed User Error on user:\n")
     console.log(seedData.userList[i])
     console.log(error)
     process.exit(1);
   } 
 }
 for(let i = 0; i<seedData.itemList.length; i++){
   try {
     let ownerId = validUserIds[getRndInteger(0, validUserIds.length-1)]
     let item = await prisma.item.create({data:{ownerId: ownerId, ...seedData.itemList[i]}})
     validItemIds.push(item.id)
   } catch (error) {
    console.log("Seed Item Error on item:\n")
    console.log(seedData.itemList[i])
    console.log(error)
    process.exit(1);
   }
 }
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
